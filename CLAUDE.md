# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview built site locally
```

No lint or test scripts are configured.

## Architecture

**Framework**: Astro 5 (static site generation), TypeScript strict mode, SCSS (no Tailwind).

### Content Collections

All content lives in `src/content/` and is consumed via `getCollection()`:

- `articles/` — Markdown travel articles with frontmatter: `title`, `subtitle`, `author`, `imageSrc`, `imageAlt`, `date`, `tags[]`, `featured`
- `authors/authors.json` — Author profile data, matched to articles by name
- `navigation/links.json` — Site nav links
- `pages/` — Markdown content for About and Home pages

### Routing

File-based routing in `src/pages/`:
- `/articles/[slug].astro` — Single article template using `getStaticPaths()`
- `/tags/[tag].astro` — Tag filter pages
- `/open-graph/[...route].ts` — OG image generation endpoint (via `astro-og-canvas`)

### SCSS Architecture

Styles live in `src/styles/` and are imported via `main.scss`:

- `abstracts/` — Design tokens: colors, typography, spacing, breakpoints (SCSS variables + CSS custom properties)
- `base/` — Resets, typography, CSS variable declarations
- `layout/` — Layout primitives as utility classes: `cluster`, `even-columns`, `grid-auto-fit`, `pile`
- `utilities/` — Single-purpose classes: `flow`, `flex-group`, `container`, heading sizes, font weights/families, visually-hidden
- `pages/` — Page-specific styles

Components use `<style lang="scss">` with `@use` imports for tokens/mixins. Container queries (`@container style()`) are used in `ArticlePreview` for responsive layouts.

### Component Patterns

- Astro components accept `El` prop for semantic element choice and `TitleLevel` for heading level
- `BaseLayout.astro` wraps all pages in a 3-row CSS grid (header / main / footer)
- `BaseHead.astro` handles meta tags via `astro-meta-tags` and `astro-seo-metadata`
- View Transitions are used (`transition:name`, `transition:persist`)
- `src/utils/create-excerpt.js` generates article excerpts from raw content
