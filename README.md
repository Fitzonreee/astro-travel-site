# Astro Travel Site

A travel editorial site built with Astro 5, using Astro Content Collections for articles and a custom SCSS design system (no Tailwind).

## Commands

All commands are run from the root of the project:

| Command             | Action                                      |
| :------------------ | :------------------------------------------ |
| `npm install`       | Install dependencies                        |
| `npm run dev`       | Start dev server at `localhost:4321`        |
| `npm run build`     | Build production site to `./dist/`          |
| `npm run preview`   | Preview the production build locally        |

## SCSS Design System

Styles live in `src/styles/` and are structured in four layers, pulled together by `main.scss`. Each folder has an `_index.scss` that `@forward`s its partials, so any layer can be imported as a single unit: `@use "../styles/abstracts" as *`.

---

### Layer 1: Abstracts

Never outputs CSS — purely definitions consumed by other layers.

**`_colors.scss`** works in three sub-layers:

1. **Raw values** as private variables: `$-clr-blue-400: rgba(0, 61, 122, 1)`
2. **Theme maps** — raw values assembled into a `$light` Sass map (a `$dark` map is commented out but ready to use), grouped by role (`primary`, `accent`, `secondary`, `neutral`)
3. **Contextual SCSS variables** that point to CSS custom properties: `$color-primary-400: var(--primary-400)`

This indirection is the key to theming: you always reference `$color-primary-400` in your SCSS, which resolves to a CSS var at runtime. Swapping themes only requires remapping what those CSS vars point to.

**`_sizes.scss`** — a spacing scale from `$size-1` (0.25rem) to `$size-15` (10rem), available both as a `$sizes` map (for loops) and as individual `$size-N` variables (for direct use).

**`_typography.scss`** — two font families (`Bricolage Grotesque` for headings, `Assistant` for body) and a `$font-sizes` map on a 300–900 scale. Like colors, individual `$font-size-N` variables point to CSS custom properties.

**`_breakpoints.scss`** — a map with three named breakpoints: `small: 30em`, `medium: 45em`, `large: 65em`.

**`_functions.scss`** — three typed lookup helpers that throw a Sass error if a key doesn't exist:
- `clr($color, $shade)` — looks up from the color maps
- `fs($font-size)` — looks up from `$font-sizes`
- `size($size)` — looks up from `$sizes`

**`_mixins.scss`** — two mixins:
- `mq($size)` — media query helper; accepts a keyword from `$breakpoints` or a raw number with a unit (unitless numbers throw an error):
  ```scss
  @include mq(medium) { ... }   // uses the $breakpoints map
  @include mq(960px) { ... }    // custom value
  ```
- `heading($fs, $color)` — applies the full heading treatment (family, transform, letter-spacing, weight, line-height) in one call.

**`_tokens.scss`** — the semantic config file for the whole system. This is where raw values get named meanings: body font settings, link styles, heading sizes per level, layout spacing, button styles, tag styles, sticky nav config, newsletter CTA layout, and more. **If you want to restyle anything globally, start here.**

---

### Layer 2: Base

Outputs global CSS that applies without any class.

**`_root.scss`** is the bridge between SCSS and the browser. It loops over `$active-theme` (currently `$light`) to generate all color CSS custom properties on `:root`:

```css
:root {
  --primary-400: rgba(0, 61, 122, 1);
  --accent-400: rgba(251, 133, 0, 1);
  /* ...all shades of all color groups */
}
```

It also generates font-size custom properties (`--fs-300` through `--fs-900`). This is why SCSS variables like `$color-primary-400: var(--primary-400)` resolve correctly — the CSS var is guaranteed to exist from this loop.

The rest of the base layer is a CSS reset (`_reset.scss`), base element styles (`_general.scss`), and font loading (`_font-face.scss`).

---

### Layer 3: Layout

Four layout primitives, each a single class solving one spatial problem:

| Class | Mechanism | Purpose |
|---|---|---|
| `.even-columns` | `grid-auto-flow: column; grid-auto-columns: 1fr` at medium breakpoint | Equal-width columns that stack on mobile |
| `.grid-auto-fit` | `repeat(auto-fit, minmax(min(250px, 100%), 1fr))` | Self-healing grid with no media queries |
| `.cluster` | `display: flex; flex-wrap: wrap; gap: 1rem` | Group of items that wrap naturally (tags, links) |
| `.pile` | `grid-template-areas: "pile"` on all children | Stacks elements directly on top of each other |

Both `.even-columns` and `.grid-auto-fit` support a `--grid-gap` CSS custom property override, falling back to the `$grid-gap` token.

---

### Layer 4: Utilities

Most utility classes are generated programmatically by looping over the abstracts maps.

**Color utilities** — loops over `$active-theme` to produce every combination:
```scss
.clr-primary-400 { color: var(--primary-400); }
.bg-primary-400  { background-color: var(--primary-400); }
```

**Font-size utilities** — loops over `$font-sizes` to produce `.fs-300` through `.fs-900`.

**Spacing utilities** — loops over `$sizes` (1–15) and generates the full logical-property matrix for both margin and padding:
```scss
.margin-block-start-4  { margin-block-start: 1rem; }
.padding-inline-8      { padding-inline: 2rem; }
```

**Heading utilities** (`.heading-1` through `.heading-4`) — decouple visual style from HTML semantics. You can apply `.heading-2` to an `<h3>` to match the visual hierarchy without changing the DOM.

**`.container`** — configured via CSS custom properties so you can override at the usage site with a `data-type` attribute:
```html
<div class="container" data-type="narrow">...</div>    <!-- 840px max -->
<div class="container" data-type="full-bleed">...</div> <!-- 100% width -->
```

**`.flow`** — the lobotomized owl pattern (`> *:where(:not(:first-child))`). Adds `margin-top` to every child except the first. Override the spacing with the `--flow-spacer` CSS custom property.

---

### Using abstracts in components

Astro components import the abstracts layer directly in their `<style>` blocks:

```scss
<style lang="scss">
  @use "../styles/abstracts" as *;
  // $color-primary-400, @include mq(), @include heading(), $size-8, etc. all available
</style>
```

The `as *` removes the namespace prefix, so tokens and mixins are usable without qualification.

---

### Dark mode

The architecture supports theming but dark mode is disabled. To enable it:

1. Uncomment the `$dark` map in `_colors.scss`
2. Set `$enable-media-query-dark-mode: true` in `_tokens.scss`

The `_root.scss` loop handles the rest automatically — no other files need changing.

---

### Custom themes

Because the entire color system is driven by CSS custom properties, you can create any theme — not just dark mode — by defining a new Sass map and writing a scoped selector that re-declares the same CSS vars.

**1. Define a new theme map in `_colors.scss`**, following the same shape as `$light` (same group names, same shade keys):

```scss
$high-contrast: (
  "neutral": ("000": #fff, "100": #ccc, "200": #888, "300": #555, "1000": #000),
  "primary": ("100": #99cfff, "200": #66b3ff, "300": #3399ff, "400": #0066cc, "500": #003d7a),
  "accent":  ("100": #fff0cc, "200": #ffe066, "300": #ffd700, "400": #ccaa00, "500": #997d00),
  "secondary": ("100": #e6ffe6, "200": #99ff99, "300": #33cc33, "400": #009900, "500": #006600),
);
```

**2. Add a scoped loop in `_root.scss`** that generates the same CSS vars under a selector of your choice (a class on `<html>`, a `data-theme` attribute, anything):

```scss
[data-theme="high-contrast"] {
  @each $color, $shade-map in $high-contrast {
    @each $shade, $value in $shade-map {
      --#{$color}-#{$shade}: #{$value};
    }
  }
}
```

**3. Apply the theme** by setting that attribute anywhere in the DOM — typically on `<html>` to affect the whole page, or on a wrapper element to scope it:

```html
<html data-theme="high-contrast">
```

Because every component references CSS vars (e.g. `var(--primary-400)`) rather than hard-coded values, the entire site re-themes with no changes to any component. The Sass variables like `$color-primary-400` are just aliases for those vars — they inherit the new values automatically.
