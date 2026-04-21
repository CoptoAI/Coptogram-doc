# Project Architecture: Coptogram Docs

## Overview
Coptogram Docs is a high-performance, responsive documentation platform built with **Next.js 15 (App Router)**. It provides a structured, searchable, and localized (English and Arabic) guide for the Coptogram Platform. The project follows a "Documentation as Code" philosophy, where all content is managed via a centralized data file and rendered dynamically.

---

## Technical Stack
- **Framework**: Next.js 15.4+ (React 19)
- **Styling**: Tailwind CSS 4 (Utility-first)
- **Animations**: Framer Motion (Sophisticated UI transitions)
- **Icons**: Lucide React
- **Themes**: Next Themes (Light/Dark support + Brand color customization)
- **Localization**: Internal state-based i18n (EN/AR support)
- **Search Engine**: Fuse.js (Fast, fuzzy client-side search)
- **Markdown Rendering**: 
  - `react-markdown` for parsing.
  - `remark-gfm` for tables and lists.
  - `rehype-raw` / `rehype-sanitize` for safe HTML rendering.
  - `react-syntax-highlighter` for code block styling.

---

## Directory Structure

### `/app`
- **`layout.tsx`**: The root layout. Contains global providers (Theme, CSS), font configurations (Inter & JetBrains Mono), and defensive scripts to mitigate browser extension errors (e.g., fetch overwriting).
- **`page.tsx`**: The main entry point. It initializes the `DocsManager` component which handles the application state.
- **`globals.css`**: Tailwind CSS imports and base theme variable configurations.

### `/components`
- **`DocsManager.tsx`**: The "Brain" of the application. Manages state for:
  - Active documentation section.
  - Search queries and results.
  - Language selection (EN/AR).
  - Sidebar and UI state.
- **`Sidebar.tsx`**: Hierarchical navigation. Features:
  - Mobile-responsive drawer mode with dimming overlay.
  - Recursive section expansion/collapse.
  - Smooth scroll integration.
- **`Navbar.tsx`**: Global header. Contains:
  - Branding and versioning.
  - Search input (Global CMD+K shortcut).
  - Theme toggler and color picker.
  - Language switcher.
- **`DocContent.tsx`**: Content renderer. Transforms markdown into polished UI elements using custom React components for headers, links, and code blocks.
- **`LandingView.tsx`**: A dashboard-style homepage displayed when no specific document is selected.
- **`DocTOC.tsx` / `TableOfContents.tsx`**: Extracts headings from content to provide on-page navigation (Deep linking).

### `/lib`
- **`docs-data.ts`**: The **Source of Truth**. Contains the entire documentation tree, including titles, IDs, icons, and markdown content.
- **`markdown-config.ts`**: Shared configuration for markdown parsing and syntax highlighting.
- **`utils.ts`**: Global utility functions (e.g., `cn` for Tailwind class merging).

---

## Data Flow & State Management

1. **Initialization**: The `DocsManager` reads the `docs` array from `docs-data.ts`.
2. **Navigation**: When a user clicks a sidebar link, the `DocsManager` updates the `activeSection` state.
3. **Rendering**: The `DocContent` component receives the ID, finds the corresponding markdown in the data file, and parses it for display.
4. **Search**: `Fuse.js` creates an index of all document titles and snippets from `docs-data.ts`. When a user types, it returns weighted results that highlight relevant sections.
5. **Theming**: `next-themes` manages the `dark`/`light` class. Additionally, a custom `data-theme` attribute on the `<html>` tag allows users to swap brand color palettes (Emerald, Amber, Rose).

---

## Architectural Principles

### 1. Performance First
- **Zero Database Hits**: Documentation is bundled in the build, resulting in near-instant page transitions.
- **Client-Side Search**: Search happens locally without server round-trips.
- **Asset Optimization**: Next.js `<Image>` component used throughout for responsive, optimized imagery.

### 2. Accessibility (a11y)
- **ARIA Labels**: All interactive elements (Sidebar toggles, Search, Buttons) include descriptive labels.
- **Keyboard Navigation**: Supported CMD+K for search and full Tab/Enter support for navigation.
- **RTL Support**: Arabic localization uses CSS `dir="rtl"` and layout-shifting logic to ensure a natural reading experience.

### 3. Maintainability
- **Component Decoupling**: UI components are stateless where possible, with logic centralized in the `DocsManager`.
- **Type Safety**: Full TypeScript implementation ensures props and data structures are consistent.
- **GitHub Integration**: Developers can update documentation by simply editing `lib/docs-data.ts` and pushing to the repository.

---

## Configuration & Environment
- **`.env.example`**: Documents required keys like `NEXT_PUBLIC_GEMINI_API_KEY` (if AI features are enabled).
- **`metadata.json`**: Sets application title, description, and frame capabilities.
- **`tsconfig.json`**: Configured with strict typing and path aliases (`@/*`).
