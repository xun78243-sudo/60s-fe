# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (hot reload)
npm run dev

# Type-check + production build
npm run build

# Preview production build locally
npm run preview
```

No test runner or linter is configured. `tsc -b` is run as part of `build` for type checking.

## Project Overview

**60s API Explorer** — a single-page React app that acts as a frontend dashboard for the [60s API](https://docs.60s-api.viki.moe) (`http://60s.lxxn.me/api`). It aggregates ~60+ data feeds (news, entertainment, tech, tools, fun content) into an organized card-based UI with dark mode, search, category filtering, and custom endpoint management persisted to localStorage.

## Tech Stack

- **React 18** + **TypeScript** (strict mode, `react-jsx` transform)
- **Vite 6** with `@vitejs/plugin-react`
- **Tailwind CSS 3.4** with `tailwindcss-animate` and CSS-variable-based theming
- **lucide-react** for icons
- **clsx** + **tailwind-merge** (`cn()` utility for conditional classNames)
- Path alias `@` → `./src` (configured in both vite.config.ts and tsconfig)

## Architecture

### Entry point
- `src/main.tsx` — mounts `<App />` into `#root`
- `index.html` — HTML shell, sets `lang="zh-CN"`, title "60s API Explorer"

### Core files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Single main component: header, sidebar, card grid, fun panel, all state (useState/useRef), API calling logic |
| `src/lib/api-config.ts` | Data-driven config: `endpoints[]` array, `categories`, `autoLoadEndpoints`, `funPanelEndpoints`, `hiddenEndpoints`, `hiddenCategories`, `categoryDefaultCards`, and `EndpointConfig`/`ParamConfig` types |
| `src/lib/types.ts` | `ResultState` interface (shape of every loaded API card's state) |
| `src/lib/utils.ts` | `cn()` — combines `clsx` + `tailwind-merge` |
| `src/components/DataRenderer.tsx` | All data rendering: `NewsList`, `HotList`, `CardList`, `SingleItem`, `WeatherCard`, `MoyuCard`, `TableRenderer`, `ImageRenderer`, `RawJson` — dispatched by `renderType` from endpoint config |
| `src/index.css` | Tailwind directives, CSS custom properties (light + dark theme), scrollbar styles, JSON syntax highlighting |

### Data flow

1. `api-config.ts` declares all endpoints as `EndpointConfig[]` with path, name, category, render type, params, display fields.
2. `App.tsx` calls `fetch()` against `http://60s.lxxn.me/api` + endpoint path (no auth).
3. Each response is stored in a `results: Record<string, ResultState>` map, keyed by endpoint path.
4. `DataRenderer` receives the `ResultState` + `EndpointConfig` and picks the right renderer based on `endpoint.renderType`.
5. User-added endpoints and custom param values are persisted to `localStorage`.

### Key patterns

- **No routing** — single page, category filtering via `activeCategory` state.
- **No state management library** — pure `useState`/`useCallback`/`useEffect` in `App.tsx`.
- **Optimistic data retention** — on refresh, old data is kept in state while the new fetch is in-flight, avoiding blank cards.
- **Expand/collapse per category** — each category shows a default card count (configurable in `categoryDefaultCards`) with a "show more" button.
- **Hidden items** — `hiddenCategories`, `hiddenEndpoints` arrays suppress specific items entirely.
- **Fun panel** — `funPanelEndpoints` are rendered in a right-side vertical stack instead of the main grid.
- **Auto-load** — `autoLoadEndpoints` are fetched immediately on mount; user-added endpoints are also re-fetched on mount.

### Render types

Defined in `EndpointConfig.renderType` and handled in `DataRenderer.tsx`:

- `news-list` — numbered list (60s-style)
- `hot-list` — ranked list with hot score (weibo/zhihu style), optional external links
- `card-list` — grid of cards with cover image, title, rating, price, free tag
- `single` — single-item display with special-cased sub-renderers (hitokoto, kfc, duanzi, weather, moyu calendar, generic key-value)
- `table` — `<table>` for tabular data (exchange rates, fuel prices)
- `image` — `<img>` for QR codes
- `raw` — fallback JSON `<pre>` display; auto-detects arrays and renders as HotList

## Development guidelines

- All new endpoints go into the `endpoints` array in `src/lib/api-config.ts` with appropriate `category`, `renderType`, and `displayFields`.
- For new render formats, add a new renderer component in `DataRenderer.tsx` and wire it into the `renderType` switch.
- The `@` path alias maps to `./src` — use `import { cn } from '@/lib/utils'`.
- CSS theming uses CSS custom properties in `:root` / `.dark` — add new theme variables there, not Tailwind config.
- Avoid adding routing or a state management library unless the app grows significantly beyond single-page-with-sidebar.
