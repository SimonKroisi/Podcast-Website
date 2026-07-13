# Design Guidelines — Hoch gwimmas nimma

Diese Datei definiert das visuelle System der Podcast-Website. Sie ist die
Referenz für Farben, Typografie, Abstände, Komponenten und Icons. Bei
Erweiterungen der Seite gelten diese Regeln, damit das Design konsistent
bleibt.

## 1. Markenidentität

- **Ton**: Direkt, leidenschaftlich, unverblümt — wie ein Fan-Gespräch nach
  dem Schlusspfiff, nicht wie ein Sportsender.
- **Stil**: Boulevard-Zeitungs-Ästhetik trifft modernes Dark-UI — kräftige
  Rot-Töne, gerissenes Papier ("Cover-Tear"), grobe Anton-Headlines,
  ruhiger dunkler Hintergrund für den Rest.
- **Sprache**: Alle Inhalte auf Deutsch (Österreich), Sie-/Du-Ansprache
  informell ("Schnapp dir deine Kopfhörer").

## 2. Farbpalette

Alle Farben sind als CSS-Custom-Properties in `css/style.css` (`:root`)
definiert. Neue Komponenten verwenden ausschließlich diese Variablen,
keine neuen Hex-Werte im Fließtext des CSS.

| Token | Wert | Verwendung |
|---|---|---|
| `--red-dark` | `#3d0000` | Verläufe, Schatten-Basis, dunkle Flächen |
| `--red` | `#8f0f13` | Sekundäre Flächen (Scoreboard, Verläufe) |
| `--red-bright` | `#c8102e` | Primäre Akzentfarbe, Cover-Risse, Icons |
| `--red-glow` | `#ff2e3a` | Hover-Zustände, Eyebrows, Highlights |
| `--cream` | `#f3efe6` | Fließtext auf dunklem Grund |
| `--cream-dim` | `#e4ddcd` | Gedämpfte Fläche (Streifen-Divider) |
| `--black` | `#141110` | Haupt-Hintergrund |
| `--ink` | `#1a1414` | Alternierender Section-Hintergrund |
| `--white` | `#ffffff` | Überschriften, Cover-Text |
| Spotify-Grün | `#1ed760` | Ausschließlich für Spotify-CTA/-Branding |

**Regeln**

- Der dunkle Hintergrund (`--black` / `--ink`) ist die Grundfläche. Rot ist
  Akzent, kein Flächenfüller — Hero und Final-CTA sind bewusste Ausnahmen.
  Vertrauensfarbe (Grün) bleibt reserviert für Spotify-Elemente.
- Textkontrast: Fließtext auf dunklem Grund nutzt `--cream` mit reduzierter
  Deckkraft (`rgba(243,239,230,0.7–0.9)`) für Hierarchie, nie reines Grau.
- Mindestkontrast WCAG AA für Fließtext einhalten (`--cream` auf `--black`
  erfüllt dies deutlich).

## 3. Typografie

| Rolle | Font | Variable |
|---|---|---|
| Headlines (h1–h3, Eyebrows, Cover, Ticker) | Anton | `--font-display` |
| Fließtext, UI, Buttons | Inter (400/500/600/700/800) | `--font-body` |

- `--font-display` ist immer Großbuchstaben-lastig, eng gesetzt
  (`letter-spacing: 0.5px`), keine Fettvarianten nötig — Anton liefert die
  Wirkung bereits über die Schriftform.
- Größenskala über `clamp()` für Headlines (z. B. `h1`:
  `clamp(2.8rem, 6vw, 4.6rem)`), damit Responsive-Verhalten ohne feste
  Breakpoints funktioniert.
- Eyebrows (`.eyebrow`, `.section-eyebrow`): 0.8rem, uppercase,
  `letter-spacing: 2px`, `font-weight: 700` — immer als kurzer Kontext-Tag
  vor einer Headline.

## 4. Layout & Abstände

- Container-Breite: `--max-w: 1160px`, seitliches Padding `24px`.
- Section-Rhythmus: `.section { padding: 96px 0; }`, alternierend
  `--black` / `--ink` für visuelle Trennung ohne harte Linien.
- Radius: einheitlich `--radius: 20px` für Cards, Embeds, große Flächen;
  Buttons nutzen volle Pillenform (`border-radius: 999px`).
- Schatten: `--shadow-lg` für alle schwebenden/erhabenen Elemente (Cover,
  Embed, Scoreboard) — kein zweites Schatten-Token einführen.
- Grid-Systeme: `feature-grid` (4 Spalten → 2 → 1), `host-grid` (2 → 1),
  über einfache CSS-Grid-`repeat()`, Breakpoints bei `980px` und `760px`.

## 5. Komponenten

- **Buttons** (`.btn`): Pillenform, `font-weight: 700`, Hover = leichtes
  `translateY(-2px)`. Primär = Spotify-Grün (`.btn-primary.btn-spotify`),
  sekundär = `.btn-ghost` (transparent, Cream-Border).
- **Cards** (`.feature-card`, `.host-card`): dezenter Rot-Verlauf oder
  10 % Cream-Border, Hover hebt die Karte an (`translateY(-6px)`) und
  färbt den Rand in `--red-glow`.
- **Sticky Header**: `backdrop-filter: blur(10px)`, 85 % opake dunkle
  Fläche, feine 8 %-Cream-Trennlinie.
- **Ticker**: Endlos-Scroll auf Rot-Grund, ausschließlich Anton,
  Icon+Label-Paare in Großbuchstaben.

## 6. Icons

**Keine Emojis im Code oder Content.** Emojis rendern je nach
Betriebssystem/Browser unterschiedlich, sind nicht stylebar (Farbe,
Strichstärke, Größe) und wirken inkonsistent neben der bewussten
Anton/Inter-Typografie. Alle bisherigen Emoji-Platzhalter (`⚽ 🎽 🔥 🎙 🏆
📊 ▶`) werden durch ein einheitliches SVG-Icon-Pack ersetzt.

### Gewähltes Icon-Pack: Phosphor Icons

- Deckt Sport-/Podcast-Motive ab (u. a. `soccer-ball`, `microphone-stage`,
  `trophy`), die generische Sets wie Feather nicht bieten.
- Sechs konsistente Strichstärken (`thin` bis `fill`) — für diese Seite
  wird ausschließlich **`bold`** für UI-Icons und **`duotone`** für große
  Illustrations-Icons (Feature-Grid, Brand) verwendet, um Konsistenz zu
  sichern.
- MIT-lizenziert, als einzelne SVGs oder Web-Font/Sprite einbindbar — kein
  Build-Step nötig.
- Für reine Spotify-Markenzeichen (Play-Glyphe im Button) wird stattdessen
  das offizielle Logo aus **Simple Icons** genutzt, nie ein generisches
  Play-Dreieck aus Phosphor, um Markenkonformität zu wahren.

### Einbindung

Icons werden als **inline `<svg>`** eingebettet (kopiert aus
phosphoricons.com oder per lokalem Sprite `assets/icons/sprite.svg` +
`<use href="#icon-name">`), nicht per Icon-Font. Das erlaubt:

- Farbe über `currentColor` / CSS (`fill: currentColor;`)
- Größe über `width`/`height` oder `font-size`-Vererbung
- Keinen zusätzlichen Netzwerk-Request pro Icon bei Nutzung eines Sprites

```html
<!-- Dekoratives Icon -->
<span class="icon" aria-hidden="true">
  <svg width="20" height="20" viewBox="0 0 256 256"><!-- Phosphor-Pfad --></svg>
</span>

<!-- Funktionales Icon (z.B. ohne begleitenden Text) -->
<button aria-label="Menü öffnen">
  <svg width="24" height="24" viewBox="0 0 256 256"><!-- ... --></svg>
</button>
```

### Größen-Token

| Kontext | Größe |
|---|---|
| Inline im Fließtext / Listen (`.check-icon`) | 16–18px |
| Feature-/Brand-Icons | 28–32px |
| Illustrative Icons (Scoreboard, große Flächen) | 40px+ |

### Emoji → Icon-Mapping

| Bisheriges Emoji | Kontext | Phosphor-Icon |
|---|---|---|
| ⚽ | Brand-Logo, Bundesliga-Feature, Check-List | `soccer-ball` |
| 🎽 | Nationalteam-Feature | `t-shirt` |
| 🔥 | Transfers & Gerüchte | `fire` |
| 🎙 | Meinungen/Interviews, Cover-Divider | `microphone-stage` |
| 🏆 | ÖFB Cup (Ticker) | `trophy` |
| 📊 | Tabellen-Check (Ticker) | `chart-bar` |
| ▶ (Spotify-Button) | Spotify-CTA | Simple-Icons **Spotify**-Logo |
| ↓ / ↗ (Pfeile in Links) | "Alle Folgen ansehen", Footer-Link | `arrow-down`, `arrow-up-right` |

### Regeln für Icon-Nutzung

- Icons sind immer **Begleiter von Text**, nie alleiniger Bedeutungsträger
  — Ausnahme: Buttons mit `aria-label` (z. B. Menü-Toggle).
- Dekorative Icons erhalten `aria-hidden="true"`; funktionale Icons ohne
  sichtbaren Text-Label erhalten ein `aria-label` am umschließenden
  Element.
- Icon-Farbe folgt dem Text/Kontext (`currentColor`), außer bei bewusst
  markigen Akzenten (z. B. `--red-bright` im Check-List-Icon-Kreis).
- Strichstärke bleibt einheitlich `bold` innerhalb einer Sektion — kein
  Mischen von `thin` und `fill` im selben Bereich.

## 7. Bewegung & Animation

- Hover-Transitions: `0.15–0.2s ease`, ausschließlich `transform`,
  `box-shadow`, `background`, `border-color` — keine Layout-Shifts.
- Endlos-Loops (Ticker, Scoreboard-Puls) laufen dezent und ohne
  Nutzerinteraktion abschaltbar zu sein nur, wenn sie rein dekorativ sind
  (`aria-hidden="true"`), wie aktuell umgesetzt.

## 8. Barrierefreiheit

- Fokus-sichtbare Zustände für alle interaktiven Elemente (Buttons,
  Links, Nav-Toggle) dürfen durch Icon-Umstellung nicht verloren gehen.
- Kontrastwerte aus Abschnitt 2 einhalten, auch für Icon-auf-Hintergrund-
  Kombinationen (z. B. weißes Icon auf `--red-bright` erfüllt AA).
- Sprache des Dokuments bleibt `lang="de"`.

## 9. Responsive Breakpoints

| Breakpoint | Änderung |
|---|---|
| `≤ 980px` | Hero wird einspaltig, Cover rückt nach oben, Feature-Grid 2 Spalten |
| `≤ 760px` | Hauptnavigation wird Off-Canvas-Menü, Feature-/Host-Grid einspaltig |
