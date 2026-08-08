const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// Statuses that mean the customer no longer has paid access.
// past_due/incomplete are kept active so Stripe's payment retries have a
// chance to succeed before we lock the member area.
const REVOKE_STATUSES = new Set(["canceled", "unpaid", "incomplete_expired"]);

exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret], region: "europe-west1" },
  async (req, res) => {
    const stripe = new Stripe(stripeSecretKey.value());
    const signature = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value());
    } catch (err) {
      logger.error("Stripe webhook signature verification failed", err);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const uid = session.client_reference_id;

          if (!uid) {
            logger.warn(`checkout.session.completed ${session.id} has no client_reference_id`);
            break;
          }

          await db.collection("users").doc(uid).set(
            {
              subscribed: true,
              stripeCustomerId: session.customer || null,
              stripeSubscriptionId: session.subscription || null,
            },
            { merge: true }
          );
          logger.info(`User ${uid} subscribed=true via checkout session ${session.id}`);
          break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const subscribed = !REVOKE_STATUSES.has(subscription.status);

          const snapshot = await db
            .collection("users")
            .where("stripeCustomerId", "==", customerId)
            .limit(1)
            .get();

          if (snapshot.empty) {
            logger.warn(`No Firestore user found for Stripe customer ${customerId}`);
            break;
          }

          await snapshot.docs[0].ref.set({ subscribed }, { merge: true });
          logger.info(
            `User ${snapshot.docs[0].id} subscribed=${subscribed} via subscription ${subscription.id} (status=${subscription.status})`
          );
          break;
        }

        default:
          // Ignore everything else (invoices, payment intents, etc.).
          break;
      }

      res.status(200).send("ok");
    } catch (err) {
      logger.error("Error handling Stripe webhook event", err);
      res.status(500).send("Internal error");
    }
  }
);
