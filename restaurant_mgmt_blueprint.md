# 🍽️ RESTAURANTOS — Desktop Restaurant Management System
## Complete Vibecoding Blueprint for Gemini-CLI

---

## 0. PREAMBLE — HOW TO USE THIS DOCUMENT

This is a **complete, self-contained engineering blueprint** for building a professional offline desktop restaurant management application. Feed this document to Gemini-CLI phase by phase. Each phase is atomic and independently executable. Always complete one phase fully before moving to the next. This is a solo-developer project; code must be clean, well-commented, and maintainable by one person.

---

## 1. PROJECT IDENTITY

| Field              | Value                                                     |
|--------------------|-----------------------------------------------------------|
| **App Name**       | RestaurantOS                                              |
| **Type**           | Offline-first desktop app (macOS Apple Silicon only)      |
| **Target Machine** | MacBook Air M1 8GB — macOS Sequoia or later               |
| **Users**          | Single admin/manager role — no multi-user login needed    |
| **Data Storage**   | Local SQLite database via Tauri's `tauri-plugin-sql`      |
| **Connectivity**   | Fully offline, no network calls, no cloud, no telemetry   |
| **AI/ML**          | Strictly excluded                                         |
| **Monetization**   | Strictly excluded                                         |
| **Docker**         | Strictly excluded                                         |

---

## 2. CORE TECH STACK

| Layer         | Technology                          | Version / Notes                              |
|---------------|-------------------------------------|----------------------------------------------|
| Shell         | Tauri 2.x                           | Rust backend, macOS target only              |
| Frontend      | Next.js 15 (App Router)             | Static export mode (`output: 'export'`)      |
| Language      | TypeScript 5.x (strict mode)        | No `any` types allowed                       |
| Styling       | Tailwind CSS v4                     | With custom design tokens                    |
| UI Components | shadcn/ui (Radix UI primitives)     | Customized to match design system            |
| Database      | SQLite via `tauri-plugin-sql`       | Single `.db` file in app data directory      |
| State         | Zustand 5.x                         | Per-module stores, no Redux                  |
| Forms         | React Hook Form + Zod               | All forms validated at schema level          |
| Charts        | Recharts 2.x                        | For analytics dashboards                     |
| Tables        | TanStack Table v8                   | Virtualized, sortable, filterable            |
| Date/Time     | date-fns 4.x                        | No moment.js                                 |
| Icons         | Lucide React                        | Consistent icon set throughout               |
| Print         | `@tauri-apps/plugin-shell` + CSS    | Thermal receipt printing via CSS @print      |
| Packaging     | `tauri build` → `.dmg` / `.app`    | Signed for local use, no notarization needed |

---

## 3. DESIGN SYSTEM

> **Reference:** This design system is directly adapted from the `DESIGN.md` Supabase-inspired guide. All color tokens, typography rules, spacing scales, border hierarchies, and component patterns defined below must be followed exactly and consistently across every module and component in the application.

---

### 3.1 Visual Language & Atmosphere

- **Theme:** Dark-mode-native. The app feels like a premium developer tool — born in a terminal, matured into a professional control surface. Near-black backgrounds (`#0f0f0f`, `#171717`) with **emerald green** as the sole brand accent (`#3ecf8e`, `#00c573`). Green is an identity marker — used sparingly for links, logo marks, active states, and accent borders. It is never used as a background fill.
- **Depth system:** NO box-shadows. Depth is communicated exclusively through a border color hierarchy — from barely-visible `#242424` (section dividers) → standard `#2e2e2e` (cards) → prominent `#363636` (interactive/hover) → brand accent `rgba(62, 207, 142, 0.3)` (highlighted/focused elements). This is the core visual grammar of the system.
- **Typography:** `Circular` (geometric sans-serif with rounded terminals) for all UI text. `Source Code Pro` (monospace) used sparingly and exclusively for uppercase technical labels — order numbers, SKU codes, timestamps in dense tables, status codes. The humanizing roundness of Circular against the dark canvas is what prevents the interface from feeling cold.
- **Weight discipline:** Font weight `400` is the universal default. Weight `500` is reserved only for navigation links and button labels. Bold (`700`) is never used. Hierarchy is created through size and color, not weight.
- **Hero line-height: 1.00** — The defining typographic gesture. Page-level titles and large KPI numbers must be set at `line-height: 1.00` (zero leading). This creates the compressed, terminal-like density that defines the aesthetic. No wasted vertical space.
- **Layout:** Persistent left sidebar (collapsible) + topbar + main content panel. All modules render in the main panel — no full-page navigations. Medium-high information density: show more data, not more whitespace.
- **Motion:** Minimal and functional. Subtle fade-ins (100–150ms) for panel transitions. Count-up animations on KPI numbers (via `requestAnimationFrame`). Scale micro-transitions (`scale(0.97)` → `scale(1.00)`) on button press. No decorative or gratuitous animation.
- **Translucency:** Use HSL colors with alpha channels for layering. Modal overlays, dropdowns, and glass surfaces use `rgba(41, 41, 41, 0.84)` with `backdrop-filter: blur(12px)` — never flat opaque dark fills for floating surfaces.

---

### 3.2 Color System (CSS Variables)

```css
/* globals.css — complete token system */
:root {
  /* ── Page & Surface ──────────────────────────────── */
  --bg-page:         #171717;   /* Primary page canvas */
  --bg-button:       #0f0f0f;   /* Primary button background */
  --bg-surface:      #171717;   /* Cards, panels (same as page, border defines edge) */
  --bg-elevated:     rgba(41, 41, 41, 0.84); /* Modals, dropdowns — translucent */
  --bg-hover:        rgba(255, 255, 255, 0.04); /* Row/item hover state */
  --bg-subtle:       hsla(210, 87.8%, 16.1%, 0.031); /* Ultra-subtle blue wash */

  /* ── Border Hierarchy (NO shadows — this IS depth) ─ */
  --border-subtlest: #242424;   /* Section dividers, horizontal rules */
  --border-default:  #2e2e2e;   /* Card borders, standard separators */
  --border-strong:   #363636;   /* Button borders, hover state borders */
  --border-stronger: #393939;   /* Secondary interactive borders */
  --border-accent:   rgba(62, 207, 142, 0.3); /* Brand-highlighted / focused element */

  /* ── Brand Green (use sparingly — identity marker) ─ */
  --green-brand:     #3ecf8e;   /* Logo, brand icon, accent marks */
  --green-link:      #00c573;   /* Interactive links, active nav indicators */
  --green-border:    rgba(62, 207, 142, 0.3); /* Accent borders — focused/active */
  --green-dim:       rgba(62, 207, 142, 0.08); /* Subtle green tint on hover/active bg */

  /* ── Text Scale ──────────────────────────────────── */
  --text-primary:    #fafafa;   /* All primary text, headings, button labels */
  --text-secondary:  #b4b4b4;   /* Subtext, descriptions, metadata */
  --text-muted:      #898989;   /* Placeholders, disabled, tertiary labels */
  --text-subtle:     #4d4d4d;   /* Barely-visible labels, inactive states */

  /* ── Semantic / Status Colors ────────────────────── */
  /* Use Radix primitives. Apply at alpha channel for backgrounds. */
  --success:         #3ecf8e;                /* Same as brand green */
  --success-bg:      rgba(62, 207, 142, 0.08);
  --warning:         hsl(48, 96%, 53%);      /* --colors-yellowA7 equivalent */
  --warning-bg:      hsla(48, 96%, 53%, 0.1);
  --danger:          hsl(3, 100%, 61%);      /* --colors-tomatoA4 equivalent */
  --danger-bg:       hsla(3, 100%, 61%, 0.08);
  --info:            hsl(251, 63.2%, 63.2%); /* --colors-violet10 */
  --info-bg:         hsla(251, 63.2%, 63.2%, 0.08);
  --purple:          hsl(272, 51%, 54%);     /* --colors-purple5 equivalent */
  --crimson:         hsl(336, 76%, 47%);     /* --colors-crimsonA9 equivalent */

  /* ── Border Radius Scale ─────────────────────────── */
  --radius-sm:       6px;       /* Ghost buttons, small chips */
  --radius-md:       8px;       /* Cards, containers, inputs */
  --radius-lg:       12px;      /* Feature cards, panels */
  --radius-xl:       16px;      /* Major containers, modals */
  --radius-pill:     9999px;    /* Primary CTAs, tab indicators, badges */

  /* ── Spacing Base ────────────────────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  /* Section-level gaps: 48px → 64px (dense) */
}
```

---

### 3.3 Typography Rules

**Font Families:**
- **Primary UI font:** `Circular` with fallbacks: `"Helvetica Neue", Helvetica, Arial, sans-serif`
- **Technical/mono font:** `"Source Code Pro"` with fallbacks: `"Office Code Pro", Menlo, monospace`

> **Loading fonts in Tauri/Next.js:** Use `next/font/local` to bundle both font files in the app. Never load from CDN — the app is offline-only.

**Type Scale:**

| Role | Font | Size | Weight | Line-Height | Letter-Spacing | Usage in App |
|---|---|---|---|---|---|---|
| **Page Title / KPI Number** | Circular | 36–48px | 400 | **1.00** | normal | Module page headings, large revenue numbers |
| **Section Heading** | Circular | 24px | 400 | 1.25 | normal | Card titles, panel headings |
| **Sub-heading** | Circular | 18px | 400 | 1.33 | -0.16px | Table headers (large), sidebar section labels |
| **Body** | Circular | 16px | 400 | 1.50 | normal | Descriptions, form labels, card body text |
| **Nav / Button Label** | Circular | 14px | **500** | 1.14 | normal | Sidebar links, all button text |
| **Caption / Tag** | Circular | 14px | 400 | 1.43 | normal | Table cell text, badge labels, metadata |
| **Small** | Circular | 12px | 400 | 1.33 | normal | Footer text, helper text, timestamps |
| **Code Label** | Source Code Pro | 12px | 400 | 1.33 | **1.2px** | Order numbers, SKUs, reference codes — always `text-transform: uppercase` |

**Weight rules (strictly enforced):**
- `font-weight: 400` — everything by default
- `font-weight: 500` — nav links and button labels only
- `font-weight: 700` — **never used**

---

### 3.4 Component Standards

**Buttons:**

```css
/* PRIMARY — Pill shape, dark fill, white border */
.btn-primary {
  background: #0f0f0f;
  color: #fafafa;
  border: 1px solid #fafafa;
  border-radius: 9999px;
  padding: 8px 32px;
  font-size: 14px;
  font-weight: 500;
  font-family: Circular;
  transition: opacity 150ms ease, transform 100ms ease;
}
.btn-primary:hover  { opacity: 0.85; }
.btn-primary:active { transform: scale(0.97); }

/* SECONDARY — Pill shape, dark border (muted) */
.btn-secondary {
  background: #0f0f0f;
  color: #fafafa;
  border: 1px solid #2e2e2e;
  border-radius: 9999px;
  padding: 8px 32px;
  opacity: 0.8;
}
.btn-secondary:hover { border-color: #363636; opacity: 1; }

/* GHOST — For icon buttons and tertiary actions */
.btn-ghost {
  background: transparent;
  color: #fafafa;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px;
}
.btn-ghost:hover { background: rgba(255,255,255,0.04); border-color: #2e2e2e; }

/* DANGER — Pill, crimson accent */
.btn-danger {
  background: #0f0f0f;
  color: hsl(3, 100%, 61%);
  border: 1px solid hsla(3, 100%, 61%, 0.3);
  border-radius: 9999px;
  padding: 8px 32px;
}
```

**Cards & Containers:**
```css
.card {
  background: #171717;           /* Same as page — border defines edge */
  border: 1px solid #2e2e2e;    /* --border-default */
  border-radius: 12px;           /* --radius-lg */
  padding: 20px 24px;
  /* NO box-shadow — depth from border contrast only */
}
.card:hover {
  border-color: #363636;         /* --border-strong — subtle lift on hover */
}
.card--accent {
  border-color: rgba(62, 207, 142, 0.3); /* Green accent border for featured cards */
}
```

**Inputs & Form Fields:**
```css
.input {
  background: #0f0f0f;
  border: 1px solid #2e2e2e;
  border-radius: 6px;
  padding: 8px 12px;
  color: #fafafa;
  font-family: Circular;
  font-size: 14px;
}
.input:focus {
  outline: none;
  border-color: rgba(62, 207, 142, 0.5); /* Green focus ring — brand identity */
  box-shadow: 0 0 0 3px rgba(62, 207, 142, 0.1);
}
.input::placeholder { color: #4d4d4d; }
```

**Tables:**
```css
/* Table rows — no zebra stripes (too noisy on dark). Hover only. */
.table-row { border-bottom: 1px solid #242424; } /* --border-subtlest */
.table-row:hover { background: rgba(255,255,255,0.03); }
.table-header { color: #898989; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #2e2e2e; }
```

**Status Badges (pill shape):**
```css
/* All badges: pill (9999px), tight padding, Circular 12px weight 400 */
.badge-success  { background: rgba(62,207,142,0.1); color: #3ecf8e; border: 1px solid rgba(62,207,142,0.2); border-radius: 9999px; padding: 2px 10px; }
.badge-warning  { background: hsla(48,96%,53%,0.1); color: hsl(48,96%,53%); border: 1px solid hsla(48,96%,53%,0.2); border-radius: 9999px; padding: 2px 10px; }
.badge-danger   { background: hsla(3,100%,61%,0.1); color: hsl(3,100%,61%); border: 1px solid hsla(3,100%,61%,0.2); border-radius: 9999px; padding: 2px 10px; }
.badge-info     { background: hsla(251,63%,63%,0.1); color: hsl(251,63%,63%); border: 1px solid hsla(251,63%,63%,0.2); border-radius: 9999px; padding: 2px 10px; }
.badge-neutral  { background: rgba(255,255,255,0.05); color: #b4b4b4; border: 1px solid #2e2e2e; border-radius: 9999px; padding: 2px 10px; }
```

**Modals & Drawers:**
```css
.modal-overlay  { background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
.modal-panel    { background: rgba(41,41,41,0.96); border: 1px solid #2e2e2e; border-radius: 16px; backdrop-filter: blur(12px); }
/* Slide-over drawer: right panel, slides in from right, 400–560px wide */
.drawer         { background: #171717; border-left: 1px solid #2e2e2e; }
```

**Sidebar:**
```css
.sidebar        { background: #0f0f0f; border-right: 1px solid #242424; width: 220px; }
.sidebar--collapsed { width: 56px; }
.sidebar-link   { font-size: 14px; font-weight: 500; color: #898989; border-radius: 6px; padding: 7px 10px; }
.sidebar-link:hover  { color: #fafafa; background: rgba(255,255,255,0.04); }
.sidebar-link--active { color: #fafafa; background: rgba(255,255,255,0.06); border-left: 2px solid #3ecf8e; }
/* Active indicator: green left border — the brand identity marker in navigation */
```

**KPI / Stat Cards:**
```css
.kpi-card {
  background: #171717;
  border: 1px solid #2e2e2e;
  border-radius: 12px;
  padding: 20px 24px;
}
.kpi-card__value {
  font-size: 36px;
  font-weight: 400;
  line-height: 1.00;   /* THE signature line-height — compressed, terminal-like */
  color: #fafafa;
  font-family: Circular;
}
.kpi-card__label  { font-size: 12px; color: #898989; text-transform: uppercase; letter-spacing: 0.8px; font-family: "Source Code Pro"; }
.kpi-card__delta  { font-size: 12px; color: #3ecf8e; } /* green for positive delta */
```

**Tabs:**
```css
.tab-list { border: 1px solid #2e2e2e; border-radius: 9999px; padding: 3px; display: inline-flex; }
.tab-item { border-radius: 9999px; padding: 5px 16px; font-size: 14px; font-weight: 500; color: #898989; }
.tab-item--active { background: #2e2e2e; color: #fafafa; }
```

**Dividers / Separators:**
```css
hr { border: none; border-top: 1px solid #242424; } /* --border-subtlest */
```

---

### 3.5 Technical Label Convention

Anywhere an identifier, code, or reference number appears in the UI — order numbers, SKUs, table codes, transaction IDs, timestamps in data tables — render it with the Code Label style:

```tsx
// Component: <CodeLabel value="ORD-20240101-0042" />
<span style={{
  fontFamily: '"Source Code Pro", monospace',
  fontSize: '12px',
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  color: '#898989'
}}>
  {value}
</span>
```

---

### 3.6 Spacing & Layout Rules

- **Section gaps** (between major page sections): 48px
- **Card internal padding**: 20px 24px
- **Form row gaps**: 16px
- **Sidebar section label gaps**: 24px between nav groups
- **Table row height**: 44px (comfortable click target without excess padding)
- **Topbar height**: 52px, `border-bottom: 1px solid #242424`
- **Sidebar width**: 220px expanded, 56px collapsed

**Whitespace philosophy:** Within sections — tight (16–24px spacing). Between sections — generous (48px). Borders define separation; don't use whitespace alone as a separator. This creates the "concentrated information clusters" feel of the design.

---

### 3.7 Elevation / Depth Reference (no shadows)

| Level | Treatment | App Usage |
|---|---|---|
| **Base** | `border: 1px solid #242424` | Page section dividers, `<hr>` |
| **Default** | `border: 1px solid #2e2e2e` | All cards, inputs, table borders |
| **Interactive** | `border: 1px solid #363636` | Hover states on cards/rows |
| **Focused** | `border: 1px solid rgba(62,207,142,0.5)` + `box-shadow: 0 0 0 3px rgba(62,207,142,0.1)` | Input focus, selected items |
| **Accent** | `border: 1px solid rgba(62,207,142,0.3)` | Featured cards, active table selections, alert panels |

> ⚠️ **Strict rule:** Never use `box-shadow` for elevation on dark surfaces. The one exception is the focus ring on inputs (functional accessibility requirement). Depth = border color progression only.

---

### 3.8 Design Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use `#171717` as the universal page + card background | Use pure `#000000` or lift cards above `#1f1f1f` |
| Apply green (`#3ecf8e`) only to: active nav indicator, links, focus rings, accent borders | Fill any button, card, or badge background with solid green |
| Set page headings and KPI numbers to `line-height: 1.00` | Set any heading above `line-height: 1.25` |
| Use `font-weight: 400` for all body, headings, and card text | Use `font-weight: 700` (bold) anywhere |
| Create depth via border progression: `#242424` → `#2e2e2e` → `#363636` | Add `box-shadow` for elevation (except input focus ring) |
| Use pill (9999px) for primary buttons, status badges, and tab indicators | Use mid-range radius (10–14px) on buttons |
| Use `Source Code Pro` uppercase for order#, SKU, ref codes | Use Source Code Pro for regular body text or headings |
| Use `rgba` alpha colors for status badge backgrounds | Use saturated solid colors for badge fills |
| Use `rgba(41,41,41,0.84)` + `backdrop-filter: blur` for modals | Use a fully opaque dark color for modal panels |

---

## 4. APPLICATION ARCHITECTURE

### 4.1 Folder Structure

```
restaurantOS/
├── src-tauri/                    # Rust / Tauri backend
│   ├── src/
│   │   ├── main.rs               # App entry point
│   │   ├── lib.rs                # Plugin registration
│   │   ├── commands/             # Tauri commands (Rust fns exposed to frontend)
│   │   │   ├── mod.rs
│   │   │   ├── menu.rs
│   │   │   ├── orders.rs
│   │   │   ├── inventory.rs
│   │   │   ├── staff.rs
│   │   │   ├── tables.rs
│   │   │   ├── reports.rs
│   │   │   └── settings.rs
│   │   └── db/
│   │       ├── mod.rs
│   │       └── migrations.rs     # All SQL migrations inline
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — sidebar + topbar
│   ├── page.tsx                  # Redirects to /dashboard
│   ├── dashboard/page.tsx
│   ├── orders/page.tsx
│   ├── menu/page.tsx
│   ├── tables/page.tsx
│   ├── inventory/page.tsx
│   ├── staff/page.tsx
│   ├── reports/page.tsx
│   ├── billing/page.tsx
│   └── settings/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   ├── ui/                       # shadcn/ui components (customized)
│   ├── shared/
│   │   ├── KpiCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── SearchInput.tsx
│   │   └── EmptyState.tsx
│   ├── dashboard/
│   ├── orders/
│   ├── menu/
│   ├── tables/
│   ├── inventory/
│   ├── staff/
│   ├── reports/
│   ├── billing/
│   └── settings/
│
├── lib/
│   ├── db.ts                     # Tauri SQL plugin wrapper + query helpers
│   ├── tauri-commands.ts         # Typed wrappers for all Tauri invoke() calls
│   ├── utils.ts                  # Formatters, helpers
│   └── constants.ts
│
├── stores/                       # Zustand stores
│   ├── useOrderStore.ts
│   ├── useMenuStore.ts
│   ├── useTableStore.ts
│   ├── useInventoryStore.ts
│   ├── useStaffStore.ts
│   └── useSettingsStore.ts
│
├── types/
│   └── index.ts                  # All shared TypeScript types/interfaces
│
├── hooks/
│   ├── useDatabase.ts            # Generic DB query hook
│   ├── useOrders.ts
│   ├── useMenu.ts
│   └── ...
│
├── styles/
│   └── globals.css               # Tailwind base + CSS variables
│
├── next.config.ts                # output: 'export', no SSR
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 Data Flow

```
UI Component
    ↓  (user action)
Zustand Store action
    ↓  (calls)
tauri-commands.ts (invoke wrapper)
    ↓  (IPC bridge)
Tauri Rust Command
    ↓  (SQL query)
SQLite Database (.db file)
    ↑  (returns data)
Rust Command → Frontend → Store → UI re-render
```

### 4.3 Database Location

SQLite file stored at: `~/Library/Application Support/com.restaurantos.app/restaurantOS.db`

Managed automatically by `tauri-plugin-sql`. The path is configured in `tauri.conf.json`.

---

## 5. DATABASE SCHEMA (SQLite)

```sql
-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Seeds: restaurant_name, currency_symbol, tax_rate, address,
--        phone, receipt_footer, theme, timezone

-- ============================================================
-- MENU CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  description TEXT,
  color       TEXT    DEFAULT '#f59e0b',
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id   INTEGER NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  name          TEXT    NOT NULL,
  description   TEXT,
  price         REAL    NOT NULL CHECK(price >= 0),
  cost_price    REAL    DEFAULT 0,
  sku           TEXT    UNIQUE,
  image_path    TEXT,
  is_active     INTEGER DEFAULT 1,
  is_available  INTEGER DEFAULT 1,
  prep_time_min INTEGER DEFAULT 0,
  sort_order    INTEGER DEFAULT 0,
  created_at    TEXT    DEFAULT (datetime('now')),
  updated_at    TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- MENU ITEM MODIFIERS (e.g., Size, Spice Level)
-- ============================================================
CREATE TABLE IF NOT EXISTS modifiers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id  INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,   -- e.g., "Size"
  options       TEXT    NOT NULL,   -- JSON: [{"label":"Small","price_delta":0}, ...]
  is_required   INTEGER DEFAULT 0
);

-- ============================================================
-- TABLES / SEATING
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  table_number TEXT   NOT NULL UNIQUE,
  capacity    INTEGER NOT NULL DEFAULT 4,
  section     TEXT    DEFAULT 'Main',
  status      TEXT    DEFAULT 'available', -- available | occupied | reserved | cleaning
  shape       TEXT    DEFAULT 'rectangle', -- rectangle | circle | square
  pos_x       INTEGER DEFAULT 0,           -- For visual table map
  pos_y       INTEGER DEFAULT 0,
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id      INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  guest_name    TEXT    NOT NULL,
  guest_phone   TEXT,
  party_size    INTEGER NOT NULL,
  reserved_date TEXT    NOT NULL,   -- YYYY-MM-DD
  reserved_time TEXT    NOT NULL,   -- HH:MM
  duration_min  INTEGER DEFAULT 90,
  status        TEXT    DEFAULT 'confirmed', -- confirmed | seated | cancelled | no-show
  notes         TEXT,
  created_at    TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number  TEXT    NOT NULL UNIQUE,  -- e.g., ORD-20240101-0001
  table_id      INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  order_type    TEXT    NOT NULL DEFAULT 'dine_in', -- dine_in | takeaway | delivery
  status        TEXT    NOT NULL DEFAULT 'pending',
  -- pending | confirmed | preparing | ready | served | completed | cancelled
  customer_name TEXT,
  customer_phone TEXT,
  notes         TEXT,
  subtotal      REAL    DEFAULT 0,
  discount_type TEXT    DEFAULT 'none',   -- none | percent | flat
  discount_val  REAL    DEFAULT 0,
  tax_amount    REAL    DEFAULT 0,
  total         REAL    DEFAULT 0,
  created_at    TEXT    DEFAULT (datetime('now')),
  updated_at    TEXT    DEFAULT (datetime('now')),
  completed_at  TEXT
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id         INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id     INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  unit_price       REAL    NOT NULL,
  modifiers_chosen TEXT,              -- JSON snapshot of chosen modifiers
  item_notes       TEXT,
  status           TEXT    DEFAULT 'pending', -- pending | preparing | ready | served
  created_at       TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- PAYMENTS / BILLING
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  amount_paid    REAL    NOT NULL,
  payment_method TEXT    NOT NULL DEFAULT 'cash', -- cash | card | upi | other
  change_given   REAL    DEFAULT 0,
  reference_no   TEXT,               -- card/UPI reference
  paid_at        TEXT    DEFAULT (datetime('now')),
  notes          TEXT
);

-- ============================================================
-- INVENTORY CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  created_at TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id     INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
  name            TEXT    NOT NULL,
  unit            TEXT    NOT NULL DEFAULT 'kg', -- kg | g | L | ml | pcs | box
  current_stock   REAL    DEFAULT 0,
  min_stock_alert REAL    DEFAULT 0,    -- Alert threshold
  cost_per_unit   REAL    DEFAULT 0,
  supplier_name   TEXT,
  supplier_phone  TEXT,
  last_restocked  TEXT,
  notes           TEXT,
  created_at      TEXT    DEFAULT (datetime('now')),
  updated_at      TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- INVENTORY TRANSACTIONS (Stock In / Stock Out)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id       INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type          TEXT    NOT NULL, -- restock | usage | waste | adjustment
  quantity      REAL    NOT NULL,
  notes         TEXT,
  created_at    TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- STAFF
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'waiter',
  -- waiter | chef | cashier | manager | cleaner | delivery
  phone         TEXT,
  email         TEXT,
  salary        REAL    DEFAULT 0,
  salary_type   TEXT    DEFAULT 'monthly', -- monthly | daily | hourly
  join_date     TEXT,
  is_active     INTEGER DEFAULT 1,
  notes         TEXT,
  created_at    TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- STAFF ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id    INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date        TEXT    NOT NULL,           -- YYYY-MM-DD
  check_in    TEXT,                       -- HH:MM
  check_out   TEXT,
  status      TEXT    DEFAULT 'present',  -- present | absent | half-day | leave
  notes       TEXT,
  UNIQUE(staff_id, date)
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT    NOT NULL, -- utilities | supplies | maintenance | rent | salary | other
  description TEXT    NOT NULL,
  amount      REAL    NOT NULL,
  date        TEXT    NOT NULL,
  paid_by     TEXT,
  receipt_ref TEXT,
  notes       TEXT,
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- ============================================================
-- DAILY SUMMARIES (cached for fast reporting)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_summaries (
  date              TEXT PRIMARY KEY,  -- YYYY-MM-DD
  total_orders      INTEGER DEFAULT 0,
  total_revenue     REAL    DEFAULT 0,
  total_tax         REAL    DEFAULT 0,
  total_discount    REAL    DEFAULT 0,
  cash_sales        REAL    DEFAULT 0,
  card_sales        REAL    DEFAULT 0,
  upi_sales         REAL    DEFAULT 0,
  total_covers      INTEGER DEFAULT 0,  -- Guests served
  avg_order_value   REAL    DEFAULT 0,
  updated_at        TEXT    DEFAULT (datetime('now'))
);
```

---

## 6. FEATURE MODULES (Detailed)

### 6.1 MODULE: DASHBOARD (Home)

**Route:** `/dashboard`

**Purpose:** Real-time operational overview — the first thing the manager sees every day.

**Layout:** 2-column KPI strip at top + 3-column grid below

**Components & Features:**

```
TOP STRIP — Live KPI Cards (4 cards, animated count-up on load):
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Today's Revenue  │ │  Active Orders   │ │  Tables Occupied │ │  Covers Served   │
│  ₹ 24,850        │ │      12          │ │    8 / 14        │ │      67          │
│  +12% vs yest.   │ │  3 pending       │ │  57% occupancy   │ │  avg ₹371/cover  │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘

MAIN GRID (3 columns):
Col 1 (wide):
  - Hourly Revenue Chart (bar chart, today's hours)
  - Recent Orders Feed (last 10 orders, live auto-refresh every 30s)

Col 2 (medium):
  - Table Status Mini-Map (color-coded grid: green=available, amber=occupied, blue=reserved)
  - Order Status Funnel (pending → preparing → ready → served counts)

Col 3 (narrow):
  - Low Stock Alerts (red badges, click to go to inventory)
  - Upcoming Reservations (next 3 today)
  - Quick Actions Panel:
      [+ New Order] [+ Reservation] [Mark Attendance] [Add Expense]
```

**Data Sources:** Aggregate queries on `orders`, `restaurant_tables`, `reservations`, `inventory_items`

**Auto-refresh:** Every 30 seconds via `setInterval` calling Tauri commands

---

### 6.2 MODULE: ORDER MANAGEMENT (POS)

**Route:** `/orders`

**Purpose:** Core point-of-sale — take, manage, and track orders.

**Layout:** Split-panel POS interface

```
LEFT PANEL (60%): Active Orders Board
  - Tab bar: [All] [Pending] [Preparing] [Ready] [Served] [Completed]
  - Order cards in a responsive grid
  - Each card shows: Order# | Table/Type | Items count | Total | Time elapsed | Status badge
  - Click card → expand inline or open drawer with full order details
  - Bulk actions: Mark selected as preparing / ready / served

RIGHT PANEL (40%): New Order Builder
  TOP:
    - Order type toggle: [Dine-In] [Takeaway] [Delivery]
    - Table selector (dropdown, shows only available tables for Dine-In)
    - Customer name + phone (optional for dine-in, required for delivery)

  MIDDLE — Menu Quick-Add:
    - Category tabs (horizontal scroll)
    - Menu item cards (name, price, +/- quantity buttons)
    - Smart search bar with instant filtering

  BOTTOM — Order Summary:
    - Line items list with remove/qty controls
    - Discount input (% or flat)
    - Tax calculation (auto, from settings)
    - Subtotal / Tax / Discount / TOTAL
    - [Add Special Note] field
    - [Place Order] button → creates order record
    - [Place & Print KOT] → creates order + prints kitchen order ticket
```

**Order Status Flow:**
```
pending → confirmed → preparing → ready → served → completed
                                                      ↘ (trigger billing)
                                 ↘ cancelled (any stage before served)
```

**KOT (Kitchen Order Ticket) Print:**
- CSS `@media print` stylesheet
- Triggered via `window.print()` on a hidden print-only component
- Shows: Order#, Table, Items, Quantities, Special notes, Time

---

### 6.3 MODULE: MENU MANAGEMENT

**Route:** `/menu`

**Purpose:** Full CRUD for menu categories and items.

**Layout:** Master-detail with tabbed sub-sections

```
TABS: [Menu Items] [Categories] [Modifiers]

MENU ITEMS TAB:
  - Toolbar: [+ Add Item] [Search] [Filter by Category] [Filter: Active/All]
  - Data table: Name | Category | Price | Cost | Margin% | Available | Actions
  - Row actions: Edit | Toggle Available | Delete
  - "Add/Edit Item" Slide-over Panel (right drawer):
      Fields: Name, Category (dropdown), Description, Price, Cost Price,
              SKU (auto-generate button), Prep time, Image (file picker → save to app data),
              Active toggle, Available toggle, Sort order
      Modifiers section: Add modifier groups (e.g., "Spice Level": Mild/Medium/Hot)

CATEGORIES TAB:
  - Drag-and-drop reorder (affects menu display order)
  - Color picker per category
  - Icon picker (Lucide icon names)

MODIFIERS TAB:
  - List view of all modifier groups
  - Show which items each modifier is linked to
```

**Margin Calculation:** Auto-computed: `((price - cost_price) / price) * 100`

**Menu Insights Strip (above table):**
- Total items | Active items | Average selling price | Highest margin item | Lowest margin item

---

### 6.4 MODULE: TABLE MANAGEMENT

**Route:** `/tables`

**Purpose:** Visual table layout management + reservation overview.

**Layout:** Two-tab view

```
TAB 1: TABLE MAP (Visual Floor Plan)
  - Interactive grid canvas of tables
  - Each table rendered as a card:
      - Number label
      - Capacity indicator
      - Color: green (available) | amber (occupied) | blue (reserved) | grey (cleaning)
      - Current order number if occupied
  - Click table → context menu:
      [View/Open Order] | [Reserve Table] | [Mark Cleaning] | [Mark Available]
  - Section filter buttons (Main | Outdoor | VIP | Bar | etc.)
  - Drag-to-reposition (pos_x, pos_y saved to DB)
  - [+ Add Table] modal | Edit table (number, capacity, section, shape)

TAB 2: RESERVATIONS
  - Date picker (default: today)
  - Timeline view: rows = tables, columns = time slots (11am → 11pm, 30-min slots)
  - Reservation blocks color-coded by status
  - List below timeline: all reservations for selected date
  - [+ New Reservation] button → modal with all reservation fields
  - Quick actions per reservation: Seat Now | Cancel | Edit | Mark No-Show
```

---

### 6.5 MODULE: INVENTORY MANAGEMENT

**Route:** `/inventory`

**Purpose:** Track ingredient and supply stock levels, receive alerts, log transactions.

**Layout:** Dashboard strip + table

```
ALERTS STRIP (top, red if critical):
  - Cards for items below minimum stock threshold
  - Quick [Restock] button per alert card

MAIN TABLE:
  - Columns: Name | Category | Unit | Current Stock | Min Level | Status | Cost/Unit | Last Restocked | Actions
  - Status badge: Sufficient (green) | Low (amber) | Critical (red) | Out of Stock (red dark)
  - Row actions: [Restock] [Adjust] [View History] [Edit] [Delete]

SIDE PANEL (right, collapsible):
  - Stock Transaction Log
  - Filter by item or date range
  - Shows: date, type (restock/usage/waste), quantity change, notes

[+ Add Item] modal | [+ Record Usage] quick form | [+ Record Waste] quick form

SUMMARY CARDS (below table):
  - Total inventory value | Items below threshold | Recent restock spending
```

---

### 6.6 MODULE: STAFF MANAGEMENT

**Route:** `/staff`

**Purpose:** Staff directory, roles, attendance tracking, salary overview.

**Layout:** Tab-based

```
TAB 1: STAFF DIRECTORY
  - Cards grid (not table) — each card shows photo initial avatar, name, role badge, phone, status
  - [+ Add Staff] | Click card → full detail drawer
  - Edit staff: name, role, phone, email, salary, salary_type, join_date, active toggle

TAB 2: ATTENDANCE
  - Date selector (default: today)
  - Attendance table: Staff Name | Role | Check-In | Check-Out | Status | Duration | Actions
  - Status: Present | Absent | Half-Day | Leave
  - Inline edit check-in/check-out times
  - [Mark All Present] bulk action
  - Monthly attendance grid (calendar view per staff member, drill-down)

TAB 3: SALARY OVERVIEW
  - Month/Year picker
  - Table: Name | Role | Salary Type | Base Salary | Days Present | Calculated Pay | Actions
  - [Export Month Summary] → generates a printable salary sheet
```

---

### 6.7 MODULE: BILLING & PAYMENTS

**Route:** `/billing`

**Purpose:** Process payments for completed orders, view payment history.

**Layout:** Two-panel

```
LEFT: PENDING BILLING QUEUE
  - List of orders with status = 'served' (awaiting payment)
  - Each entry: Order# | Table | Items | Total | Time since served
  - Click → open bill in right panel

RIGHT: BILL PROCESSOR
  - Bill summary (read-only order details)
  - Payment section:
      [Cash] [Card] [UPI] [Split] tabs
      Cash: Enter amount → auto-calculate change
      Card: Enter last 4 digits + reference no
      UPI: Enter UPI ref/transaction ID
      Split: Distribute total across 2+ payment methods
  - Discount override (if not already applied on order)
  - [Process Payment] → marks order 'completed', records payment
  - [Print Receipt] → triggers CSS print of formatted receipt

RECEIPT TEMPLATE (print-only, hidden in DOM):
  - Restaurant name + address + phone (from settings)
  - Order# | Table | Date & Time
  - Itemized list with quantities and prices
  - Subtotal | Discount | Tax | TOTAL
  - Payment method | Amount paid | Change
  - Footer message (from settings, e.g., "Thank you! Visit again!")
  - Thermal-printer-friendly: 58mm width, monospace fallback

BILLING HISTORY TAB:
  - Date range filter + payment method filter
  - Table: Receipt# | Order# | Table | Amount | Method | Time
  - [Print] action per row
```

---

### 6.8 MODULE: REPORTS & ANALYTICS

**Route:** `/reports`

**Purpose:** Business intelligence — sales, revenue, staff, menu performance.

**Layout:** Tab-based report sections

```
TAB 1: SALES REPORTS
  - Date range picker (presets: Today | Yesterday | This Week | This Month | Custom)
  - KPI Strip: Total Revenue | Orders | Average Order Value | Total Covers | Total Tax Collected
  - Charts:
      - Daily Revenue Bar Chart (for range)
      - Hourly Sales Heatmap (peak hours visualization)
      - Revenue by Order Type (Dine-In / Takeaway / Delivery) — Donut chart
      - Payment Method Breakdown — Donut chart
  - Detailed orders table (filterable/sortable)

TAB 2: MENU PERFORMANCE
  - Date range picker
  - Top 10 Best Sellers (horizontal bar chart)
  - Bottom 10 Least Ordered (flag for menu optimization)
  - Revenue by Category (stacked bar chart)
  - Table: Item | Orders Count | Quantity Sold | Revenue | % of Total Revenue

TAB 3: EXPENSE TRACKER
  - [+ Add Expense] button → modal (category, description, amount, date)
  - Expense list table with filters
  - Expense by Category donut chart
  - P&L Summary: Revenue - Expenses = Net Profit (for selected period)
  - Month-over-month expense trend line chart

TAB 4: STAFF REPORTS
  - Attendance summary by month
  - Late arrival tracking (if check-in > standard time)
  - Hours worked per staff

EXPORT ACTIONS (all reports):
  - [Print Report] → CSS @media print
```

---

### 6.9 MODULE: SETTINGS

**Route:** `/settings`

**Purpose:** All configurable parameters for the restaurant.

**Layout:** Left nav (settings sections) + right content area

```
SECTIONS:

1. Restaurant Profile
   - Name, Address (multiline), Phone, Email
   - Logo (image file picker, stored locally)
   - Timezone selector

2. Billing & Tax
   - Currency symbol (₹ / $ / € / etc.)
   - Tax rate (%) — applied globally to all orders
   - Tax label (e.g., "GST", "VAT", "Service Tax")
   - Tax inclusive or exclusive toggle
   - Default discount type

3. Receipt & KOT
   - Receipt header text
   - Receipt footer text (thank you message)
   - Show/hide tax breakdown on receipt
   - KOT format (compact / detailed)
   - Auto-print KOT on new order toggle

4. Operations
   - Restaurant opening time / closing time
   - Default order type (Dine-In / Takeaway)
   - Table sections (add/remove/rename sections)
   - Order number prefix (e.g., "ORD")
   - Auto-refresh interval for dashboard (15s / 30s / 60s)

5. Menu Display
   - Default menu sort order (manual / alphabetical / price)
   - Show cost price to manager: Yes/No

6. Data Management
   - [Export Database] → copies .db file to Desktop
   - [Import Database] → replace current .db with backup
   - [Clear Old Orders] → archive/delete orders older than N months
   - Last backup timestamp
   - Database file size indicator

7. About
   - App version
   - Build date
   - SQLite file path (clickable, opens in Finder)
```

---

## 7. NAVIGATION STRUCTURE

### Sidebar Menu Items (in order)

```
LOGO / APP NAME (collapsible button)
─────────────────────────────────
📊  Dashboard
─────────────────────────────────
OPERATIONS
🧾  Orders          (badge: pending count)
🪑  Tables
📅  Reservations    (sub-item of Tables, or standalone)
─────────────────────────────────
MANAGEMENT  
🍽️  Menu
📦  Inventory       (badge: low-stock count)
👥  Staff
─────────────────────────────────
FINANCE
💳  Billing         (badge: unpaid orders count)
📈  Reports
─────────────────────────────────
SYSTEM
⚙️  Settings
─────────────────────────────────
BOTTOM:
  [Collapse Sidebar ◀]
  Current Date & Time (live clock)
  Restaurant Name (from settings)
```

### Topbar (persistent)

```
[Hamburger / breadcrumb path]    [Page Title]    [🔔 Alerts] [🖨️ Quick Print] [Date/Shift Indicator]
```

---

## 8. TAURI COMMANDS (Rust Backend API)

Define all these `#[tauri::command]` functions in Rust. The frontend invokes them via `invoke()`.

```rust
// ── SETTINGS ──────────────────────────────────────────────
get_all_settings()        → Vec<(String, String)>
update_setting(key, val)  → ()

// ── MENU ──────────────────────────────────────────────────
get_menu_categories()     → Vec<MenuCategory>
create_menu_category(data) → MenuCategory
update_menu_category(id, data) → MenuCategory
delete_menu_category(id)  → ()

get_menu_items(category_id: Option<i64>) → Vec<MenuItem>
get_menu_item(id)         → MenuItem
create_menu_item(data)    → MenuItem
update_menu_item(id, data) → MenuItem
delete_menu_item(id)      → ()
toggle_item_availability(id) → ()

// ── TABLES ────────────────────────────────────────────────
get_all_tables()          → Vec<RestaurantTable>
create_table(data)        → RestaurantTable
update_table(id, data)    → RestaurantTable
update_table_status(id, status) → ()
delete_table(id)          → ()

// ── RESERVATIONS ──────────────────────────────────────────
get_reservations(date: Option<String>) → Vec<Reservation>
create_reservation(data)  → Reservation
update_reservation(id, data) → Reservation
update_reservation_status(id, status) → ()
delete_reservation(id)    → ()

// ── ORDERS ────────────────────────────────────────────────
get_orders(filters: OrderFilters) → Vec<OrderSummary>
get_order_detail(id)      → OrderDetail
create_order(data)        → Order
add_order_item(order_id, item_data) → OrderItem
remove_order_item(item_id) → ()
update_order_item_qty(item_id, qty) → ()
update_order_status(id, status) → ()
update_order_discount(id, type, val) → ()
cancel_order(id, reason)  → ()
get_order_kot(id)         → KOTData
generate_order_number()   → String  // ORD-YYYYMMDD-NNNN

// ── BILLING ───────────────────────────────────────────────
get_pending_billing()     → Vec<OrderSummary>
process_payment(data: PaymentData) → Payment
get_payment_history(filters) → Vec<Payment>
get_receipt_data(order_id) → ReceiptData

// ── INVENTORY ─────────────────────────────────────────────
get_inventory_items(category_id: Option<i64>) → Vec<InventoryItem>
create_inventory_item(data)  → InventoryItem
update_inventory_item(id, data) → InventoryItem
delete_inventory_item(id)    → ()
restock_item(id, qty, notes) → ()
record_usage(id, qty, notes) → ()
get_low_stock_items()        → Vec<InventoryItem>
get_inventory_transactions(item_id, limit) → Vec<InventoryTransaction>

// ── STAFF ─────────────────────────────────────────────────
get_all_staff(active_only: bool) → Vec<Staff>
create_staff(data)        → Staff
update_staff(id, data)    → Staff
toggle_staff_active(id)   → ()
get_attendance(date: String) → Vec<AttendanceRecord>
mark_attendance(staff_id, date, status, check_in, check_out) → AttendanceRecord
update_attendance(id, data) → AttendanceRecord
get_monthly_attendance(staff_id, year_month: String) → Vec<AttendanceRecord>

// ── EXPENSES ──────────────────────────────────────────────
get_expenses(filters: ExpenseFilters) → Vec<Expense>
create_expense(data)      → Expense
update_expense(id, data)  → Expense
delete_expense(id)        → ()

// ── REPORTS ───────────────────────────────────────────────
get_dashboard_stats()     → DashboardStats
get_sales_report(start_date, end_date) → SalesReport
get_menu_performance(start_date, end_date) → Vec<MenuItemPerformance>
get_hourly_sales(date: String) → Vec<HourlySales>
rebuild_daily_summary(date: String) → ()

// ── SYSTEM ────────────────────────────────────────────────
get_db_info()             → DbInfo  // path, size
export_database(dest_path: String) → ()
get_app_version()         → String
```

---

## 9. KEY TYPESCRIPT TYPES

```typescript
// types/index.ts

export interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  cost_price: number;
  sku?: string;
  image_path?: string;
  is_active: boolean;
  is_available: boolean;
  prep_time_min: number;
  sort_order: number;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'other';
export type StaffRole = 'waiter' | 'chef' | 'cashier' | 'manager' | 'cleaner' | 'delivery';
export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';

export interface Order {
  id: number;
  order_number: string;
  table_id?: number;
  table_number?: string;
  order_type: OrderType;
  status: OrderStatus;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  subtotal: number;
  discount_type: 'none' | 'percent' | 'flat';
  discount_val: number;
  tax_amount: number;
  total: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item_name?: string;
  quantity: number;
  unit_price: number;
  modifiers_chosen?: ModifierChoice[];
  item_notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface DashboardStats {
  today_revenue: number;
  yesterday_revenue: number;
  active_orders: number;
  pending_orders: number;
  tables_occupied: number;
  total_tables: number;
  covers_today: number;
  avg_order_value: number;
  hourly_sales: { hour: number; revenue: number }[];
  recent_orders: Order[];
  low_stock_count: number;
  upcoming_reservations: Reservation[];
}
```

---

## 10. ZUSTAND STORE PATTERNS

```typescript
// stores/useOrderStore.ts
import { create } from 'zustand';
import { Order, OrderItem, OrderType } from '@/types';
import { invoke } from '@tauri-apps/api/core';

interface NewOrderState {
  order_type: OrderType;
  table_id?: number;
  customer_name: string;
  customer_phone: string;
  items: (OrderItem & { temp_id: string })[];
  notes: string;
  discount_type: 'none' | 'percent' | 'flat';
  discount_val: number;
}

interface OrderStore {
  orders: Order[];
  activeOrderFilter: string;
  newOrder: NewOrderState;
  isLoading: boolean;

  fetchOrders: (filter?: string) => Promise<void>;
  placeOrder: () => Promise<Order>;
  addItemToNewOrder: (item: MenuItem, qty: number) => void;
  removeItemFromNewOrder: (temp_id: string) => void;
  updateItemQty: (temp_id: string, qty: number) => void;
  resetNewOrder: () => void;
  updateOrderStatus: (id: number, status: string) => Promise<void>;
  // ... computed: subtotal, tax, total
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  // ... implementation
}));
```

---

## 11. DATABASE WRAPPER (lib/db.ts)

```typescript
// lib/db.ts
import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:restaurantOS.db');
  }
  return db;
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getDb();
  return database.select<T>(sql, params);
}

export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  const database = await getDb();
  await database.execute(sql, params);
}

export async function runMigrations(): Promise<void> {
  // Run all CREATE TABLE IF NOT EXISTS statements on startup
}
```

---

## 12. TAURI CONFIGURATION (tauri.conf.json key sections)

```json
{
  "productName": "RestaurantOS",
  "version": "1.0.0",
  "identifier": "com.restaurantos.app",
  "build": {
    "frontendDist": "../out",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [{
      "title": "RestaurantOS",
      "width": 1440,
      "height": 900,
      "minWidth": 1200,
      "minHeight": 750,
      "resizable": true,
      "fullscreen": false,
      "decorations": true,
      "titleBarStyle": "Visible"
    }],
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["dmg", "app"],
    "icon": ["icons/icon.icns"],
    "macOS": {
      "minimumSystemVersion": "13.0"
    }
  },
  "plugins": {
    "sql": {
      "preloadConnections": ["sqlite:restaurantOS.db"]
    }
  }
}
```

---

## 13. NEXT.JS CONFIGURATION

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',       // Static export for Tauri
  distDir: 'out',
  images: { unoptimized: true },
  trailingSlash: true,
  // No API routes, no server components that need Node.js runtime
};
export default nextConfig;
```

---

## 14. CARGO.TOML DEPENDENCIES

```toml
[dependencies]
tauri = { version = "2", features = ["devtools"] }
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
tauri-plugin-shell = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.31", features = ["bundled"] }
chrono = { version = "0.4", features = ["serde"] }
tokio = { version = "1", features = ["full"] }

[profile.release]
opt-level = "s"    # Optimize for binary size on M1
lto = true
codegen-units = 1
```

---

## 15. DEVELOPMENT PHASES (For Gemini-CLI Prompting)

Execute each phase as a **separate, complete Gemini-CLI session**. Do not mix phases.

---

### PHASE 1 — Project Scaffolding & Foundation

**Prompt Gemini-CLI:**
> "Set up a Tauri 2.x + Next.js 15 (App Router, static export) + TypeScript + Tailwind CSS v4 project called RestaurantOS. Configure it for macOS Apple Silicon only. Install and configure: tauri-plugin-sql (sqlite), shadcn/ui, Zustand 5, React Hook Form, Zod, Recharts, TanStack Table, date-fns, Lucide React. Set up the full folder structure as defined in the blueprint. Implement the complete design system from Section 3 of the blueprint exactly: all CSS custom properties (color tokens, border hierarchy, radius scale, spacing scale), Supabase-inspired dark-mode-native visual language (near-black backgrounds #171717 / #0f0f0f, emerald green #3ecf8e used only as an identity marker for active nav indicators, links, and focus rings — never as a fill), NO box-shadows (depth via border color progression #242424 → #2e2e2e → #363636 only), and all component CSS classes (btn-primary as pill 9999px, btn-secondary, btn-ghost, card with border #2e2e2e, input with green focus ring, table row styles, all five badge variants, pill tab list, kpi-card with line-height 1.00 value, sidebar, modal overlay with backdrop-filter blur). Bundle Circular and Source Code Pro fonts locally via next/font/local — never load from CDN (offline app). Create the root layout with a collapsible sidebar (220px expanded, 56px collapsed, #0f0f0f bg, right border #242424) with all nav items, Lucide icons, green left-border active state indicator, live clock and restaurant name in sidebar footer. Implement the topbar (52px height, #171717 bg, border-bottom #242424). Create placeholder pages for all 8 modules with proper empty states (centered Lucide icon in muted color + #b4b4b4 description text + primary pill CTA button). Make all sidebar navigation fully functional. Apply font-weight: 400 everywhere except nav links and buttons (font-weight: 500). Apply line-height: 1.00 to all page-level headings and KPI number displays."

**Deliverable:** Running app with full navigation, dark theme, empty pages.

---

### PHASE 2 — Database Layer & Settings Module

**Prompt Gemini-CLI:**
> "Implement the complete SQLite database layer for RestaurantOS. Create lib/db.ts with the Database singleton. Write all SQL migration statements (as defined in the schema section) and run them on app startup via a runMigrations() function called in the Tauri app setup. Implement all Tauri Rust commands for the Settings module. Implement the Settings page UI with all 7 sections (Restaurant Profile, Billing & Tax, Receipt & KOT, Operations, Menu Display, Data Management, About). Use React Hook Form + Zod for all form validation. Settings must persist to the settings table and load on app boot into a Zustand settings store."

**Deliverable:** Working settings module, database initializing correctly with all tables.

---

### PHASE 3 — Menu Management Module

**Prompt Gemini-CLI:**
> "Build the complete Menu Management module for RestaurantOS. Implement all Rust Tauri commands for menu_categories and menu_items CRUD. Build the Menu page with three tabs: Menu Items, Categories, Modifiers. Menu Items tab: full data table with TanStack Table (sortable, filterable, paginated), add/edit slide-over drawer, image upload (save to app data directory), auto-SKU generation, margin calculation display. Categories tab: drag-and-drop reorder (use @dnd-kit/core), color picker, icon picker. Implement the useMenuStore Zustand store. All forms use React Hook Form + Zod validation."

**Deliverable:** Fully functional menu CRUD with categories, items, and modifiers.

---

### PHASE 4 — Table Management & Reservations Module

**Prompt Gemini-CLI:**
> "Build the Tables & Reservations module for RestaurantOS. Implement all Rust Tauri commands for restaurant_tables and reservations. Build the Tables page with two tabs. Tab 1 (Table Map): Interactive visual floor plan — render each table as a draggable card positioned by pos_x/pos_y, color-coded by status, context menu on click. Include section filter buttons. Add/Edit table modal. Tab 2 (Reservations): Date picker, timeline view showing reservations as blocks per table per time slot, plus a list below. New reservation modal. All status actions (Seat Now, Cancel, No-Show). Implement useTableStore Zustand store."

**Deliverable:** Interactive table map + reservation system fully functional.

---

### PHASE 5 — Order Management (POS) Module

**Prompt Gemini-CLI:**
> "Build the Order Management (POS) module — the core of RestaurantOS. Implement all Rust Tauri commands for orders and order_items including generate_order_number(). Build the Orders page with a split-panel layout: left panel (order board with tab filters and order cards, auto-refreshing every 30s), right panel (new order builder with order type toggle, table selector, menu item quick-add with category tabs and search, order summary with discount and tax calculation). Implement the full order status flow with action buttons. Add KOT print functionality using CSS @media print with a hidden KOT template component. Implement useOrderStore Zustand store with computed subtotal/tax/total."

**Deliverable:** Fully functional POS system with order creation, status management, and KOT printing.

---

### PHASE 6 — Inventory Management Module

**Prompt Gemini-CLI:**
> "Build the Inventory Management module for RestaurantOS. Implement all Rust Tauri commands for inventory_items, inventory_categories, and inventory_transactions. Build the Inventory page with: a low-stock alerts strip at top (red/amber cards), main data table with TanStack Table (columns: Name, Category, Unit, Current Stock, Min Level, Status badge, Cost/Unit, Last Restocked, Actions), a collapsible right panel showing the transaction log for selected item. Modals: Add Item, Restock, Record Usage, Record Waste, Edit Item. Status computation logic: compare current_stock to min_stock_alert. Implement inventory summary cards below the table."

**Deliverable:** Complete inventory management with stock tracking and alert system.

---

### PHASE 7 — Staff Management Module

**Prompt Gemini-CLI:**
> "Build the Staff Management module for RestaurantOS. Implement all Rust Tauri commands for staff, attendance, and salary overview queries. Build the Staff page with three tabs. Tab 1 (Directory): Card grid of staff members with avatar initials, role badges, active status. Add/Edit staff drawer. Tab 2 (Attendance): Date picker → attendance table with inline edit for check-in/check-out times, status dropdown, Mark All Present bulk action. Monthly calendar grid view per staff member. Tab 3 (Salary Overview): Month/year picker, calculated pay table based on days present and salary type. Print salary sheet action."

**Deliverable:** Staff directory, attendance tracking, and salary overview fully functional.

---

### PHASE 8 — Billing & Payments Module

**Prompt Gemini-CLI:**
> "Build the Billing & Payments module for RestaurantOS. Implement all Rust Tauri commands for payments and receipt data. Build the Billing page with two panels: left panel (pending billing queue — list of 'served' orders awaiting payment, click to load in right panel), right panel (bill processor with payment method tabs: Cash/Card/UPI/Split, change calculation for cash, reference fields for card/UPI, Process Payment button). After payment: mark order 'completed', update table status to 'available', record payment. Implement CSS @media print receipt template (58mm thermal-printer friendly) with full restaurant details, itemized bill, payment info, and footer. Billing History tab with filters."

**Deliverable:** Complete billing and payment processing with receipt printing.

---

### PHASE 9 — Reports & Analytics Module

**Prompt Gemini-CLI:**
> "Build the Reports & Analytics module for RestaurantOS. Implement all Rust Tauri commands for aggregation queries: get_sales_report, get_menu_performance, get_hourly_sales, get_expenses. Build the Reports page with four tabs. Tab 1 (Sales): Date range presets, KPI strip, daily revenue bar chart (Recharts), hourly sales heatmap, order type donut chart, payment method donut chart, detailed orders table. Tab 2 (Menu Performance): Top/bottom sellers horizontal bar charts, revenue by category stacked bar, full item performance table. Tab 3 (Expenses): Add expense modal, expense list, category donut chart, P&L summary card. Tab 4 (Staff Reports): Attendance summary, hours worked. All tabs have Print Report action."

**Deliverable:** Full analytics and reporting with charts, P&L, and print support.

---

### PHASE 10 — Dashboard & Polish

**Prompt Gemini-CLI:**
> "Build the Dashboard module and complete app polish for RestaurantOS. Dashboard: implement get_dashboard_stats() Tauri command with all aggregations. Build the dashboard with: 4 KPI cards with animated count-up numbers (use requestAnimationFrame), hourly revenue bar chart, recent orders feed (live list, auto-refresh 30s), table status mini-map (color grid), order status funnel, low-stock alerts strip, upcoming reservations strip, quick actions panel (+ New Order, + Reservation, Mark Attendance, Add Expense buttons). Polish pass: ensure consistent spacing, font sizes, border colors, and interactive states across ALL pages. Add loading skeletons to all data tables. Add proper empty states with icons and CTA buttons. Add a global search shortcut (Cmd+K) that searches orders and menu items. Fix any navigation edge cases."

**Deliverable:** Polished, complete, production-quality application.

---

### PHASE 11 — Build & Package

**Prompt Gemini-CLI:**
> "Prepare RestaurantOS for final build on macOS Apple Silicon (M1). Run `tauri build` and fix any compilation or bundling errors. Ensure Next.js static export (`output: 'export'`) produces valid output. Verify the SQLite database initializes correctly on first launch in the built app. Verify all Tauri commands work in release mode (no devtools). Create an app icon set (generate from a restaurant icon: fork+knife in amber on dark background) in all required macOS sizes and place in src-tauri/icons/. Produce a working .dmg installer. Document the build steps in a BUILD.md file."

**Deliverable:** Distributable `.dmg` file ready for installation on the target MacBook Air M1.

---

## 16. PRINTING STRATEGY

All printing (Receipts, KOT, Reports, Salary Sheets) uses **CSS `@media print`** — no third-party print libraries needed.

```css
/* globals.css */
@media print {
  body { background: white !important; color: black !important; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }

  /* Receipt: 58mm thermal width */
  .receipt-container {
    width: 58mm;
    font-family: 'Courier New', monospace;
    font-size: 10px;
    line-height: 1.4;
  }

  /* Report: A4 */
  .report-container {
    width: 100%;
    font-size: 12px;
  }
}

.print-only { display: none; } /* Hidden in normal view */
```

Trigger with `window.print()` from a button handler.

---

## 17. ERROR HANDLING STRATEGY

```typescript
// All Tauri command calls follow this pattern:
async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T | null> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`Command ${command} failed:`, error);
    toast.error(`Operation failed: ${String(error)}`);
    return null;
  }
}
```

- All database errors bubble up as user-friendly toast notifications
- Form validation errors shown inline below each field
- Empty states shown when queries return zero results
- Loading skeletons shown during async data fetches

---

## 18. PERFORMANCE GUIDELINES

- **Virtualize** all large tables (TanStack Virtual) — inventory, staff, order history
- **Paginate** heavy queries (orders history, billing history) — 50 rows per page
- **Debounce** search inputs — 300ms delay before query execution
- **Cache** dashboard stats in Zustand — refresh every 30s, not on every render
- **Lazy load** report charts — only compute when tab is active
- **Index** frequently queried DB columns:
  ```sql
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_orders_created ON orders(created_at);
  CREATE INDEX idx_order_items_order ON order_items(order_id);
  CREATE INDEX idx_inventory_stock ON inventory_items(current_stock);
  CREATE INDEX idx_attendance_date ON attendance(date);
  CREATE INDEX idx_payments_date ON payments(paid_at);
  ```

---

## 19. IMPORTANT IMPLEMENTATION RULES

1. **No SSR / No API Routes** — Tauri apps use static export. All `useEffect` for data fetching, never `getServerSideProps`.
2. **Tauri invoke() only on client** — Wrap all `invoke()` calls in `useEffect` or event handlers, never at module top-level.
3. **SQLite is single-threaded** — All DB operations go through the Tauri command layer sequentially.
4. **No `any` in TypeScript** — All types explicitly defined in `types/index.ts`.
5. **Currency formatting** — Always use the currency symbol from settings store, format numbers with `Intl.NumberFormat`.
6. **Date handling** — Store all dates as ISO strings in SQLite, display with `date-fns` using local timezone from settings.
7. **Image storage** — Menu item images saved to `~/Library/Application Support/com.restaurantos.app/images/` via `tauri-plugin-fs`. Display via Tauri asset protocol (`tauri://localhost/...`).
8. **No hardcoded strings** — Restaurant name, currency, tax label always come from settings store.
9. **Responsive within the window** — The app targets 1440×900 minimum. Use CSS Grid for flexible layouts. Do not break below 1200px.
10. **Consistent loading states** — Every async operation shows a Skeleton or Spinner. Never show stale data while refreshing.
11. **Design system — no shadows** — Never add `box-shadow` for elevation on any card, panel, or container. The only permitted shadow is the input focus ring: `box-shadow: 0 0 0 3px rgba(62,207,142,0.1)`. Depth is created exclusively through border color (`#242424` → `#2e2e2e` → `#363636`).
12. **Design system — green discipline** — The emerald green (`#3ecf8e`, `#00c573`) must never be used as a button background, card background, or large surface fill. It is restricted to: active sidebar nav indicator (left border), link text color, input focus rings, accent borders on featured/active cards, and status badge text/border for success states.
13. **Design system — font weights** — `font-weight: 400` is the only weight for all headings, body, card titles, table cells, and labels. `font-weight: 500` is used only on sidebar nav links and button labels. Bold (700) is never used.
14. **Design system — line-height 1.00** — All page-level module titles, all KPI number values, and all large stat displays must be rendered with `line-height: 1.00`. This is the defining typographic gesture of the design system.
15. **Design system — pill vs standard radius** — Primary buttons, status badges, tab indicators, and search pill inputs use `border-radius: 9999px`. Cards use `border-radius: 12px`. Inputs and secondary buttons use `border-radius: 6px`. Mid-range values (10px, 14px) are not used on buttons.
16. **Design system — Code Labels** — All order numbers, SKUs, table codes, payment reference numbers, and technical identifiers must render in `Source Code Pro`, `font-size: 12px`, `letter-spacing: 1.2px`, `text-transform: uppercase`, `color: #898989`. Never render these in Circular.
17. **Design system — modal translucency** — All modals, drawers, and dropdown panels must use `background: rgba(41,41,41,0.96)` with `backdrop-filter: blur(12px)`. Never use a flat opaque dark color for floating surfaces.
18. **Design system — fonts offline** — Circular and Source Code Pro must be loaded via `next/font/local` from bundled font files. Never reference Google Fonts, Bunny Fonts, or any CDN for fonts — the app is fully offline.

---

## 20. SAMPLE SEED DATA (For Development Testing)

```sql
-- Run after migrations for development testing

INSERT INTO settings VALUES
  ('restaurant_name', 'The Golden Fork'),
  ('currency_symbol', '₹'),
  ('tax_rate', '5'),
  ('tax_label', 'GST'),
  ('tax_inclusive', '0'),
  ('address', '123 Food Street, Guwahati, Assam 781001'),
  ('phone', '+91 98765 43210'),
  ('receipt_footer', 'Thank you for dining with us!'),
  ('timezone', 'Asia/Kolkata'),
  ('order_prefix', 'ORD'),
  ('default_order_type', 'dine_in'),
  ('auto_refresh_interval', '30');

INSERT INTO menu_categories (name, color, icon, sort_order) VALUES
  ('Starters', '#f59e0b', 'Salad', 1),
  ('Main Course', '#10b981', 'UtensilsCrossed', 2),
  ('Beverages', '#3b82f6', 'Coffee', 3),
  ('Desserts', '#ec4899', 'IceCream', 4),
  ('Breads', '#f97316', 'Sandwich', 5);

INSERT INTO menu_items (category_id, name, price, cost_price, prep_time_min) VALUES
  (1, 'Veg Spring Rolls', 180, 60, 10),
  (1, 'Chicken Tikka', 320, 120, 15),
  (2, 'Dal Makhani', 220, 70, 20),
  (2, 'Paneer Butter Masala', 280, 90, 20),
  (2, 'Chicken Biryani', 380, 140, 30),
  (3, 'Fresh Lime Soda', 80, 20, 3),
  (3, 'Masala Chai', 60, 15, 5),
  (4, 'Gulab Jamun', 120, 40, 5),
  (5, 'Butter Naan', 60, 15, 8),
  (5, 'Tandoori Roti', 40, 10, 8);

INSERT INTO restaurant_tables (table_number, capacity, section, pos_x, pos_y) VALUES
  ('T1', 2, 'Main', 50, 50), ('T2', 4, 'Main', 200, 50),
  ('T3', 4, 'Main', 350, 50), ('T4', 6, 'Main', 50, 200),
  ('T5', 4, 'Main', 200, 200), ('T6', 2, 'Main', 350, 200),
  ('T7', 8, 'Private', 50, 350), ('T8', 4, 'Outdoor', 200, 350);

INSERT INTO staff (name, role, phone, salary, salary_type, join_date) VALUES
  ('Rahul Sharma', 'manager', '9876543210', 35000, 'monthly', '2023-01-01'),
  ('Priya Das', 'waiter', '9876543211', 15000, 'monthly', '2023-03-15'),
  ('Amit Koch', 'chef', '9876543212', 25000, 'monthly', '2023-02-01'),
  ('Sneha Bora', 'cashier', '9876543213', 18000, 'monthly', '2023-06-01');
```

---

## 21. FINAL CHECKLIST BEFORE SHIPPING

- [ ] All 8 modules fully functional with real data
- [ ] Settings load correctly on app startup
- [ ] Database migrations run cleanly on first launch
- [ ] Order number generation is unique and sequential
- [ ] KOT prints correctly on thermal printer (test with PDF printer)
- [ ] Receipt prints correctly with all restaurant details
- [ ] Low-stock alerts appear on dashboard and inventory
- [ ] Billing correctly marks orders complete and frees tables
- [ ] Reports generate correct aggregated totals
- [ ] Attendance can be marked and edited for any date
- [ ] Settings changes reflect immediately throughout the app
- [ ] Database export/import works correctly
- [ ] App builds to `.dmg` without errors
- [ ] App launches from `.dmg` install on M1 Mac
- [ ] No hardcoded dummy data remains in production build
- [ ] All error states handled gracefully with toast messages
- [ ] All loading states show skeletons/spinners
- [ ] Sidebar collapse/expand works and persists across navigation
- [ ] All forms validate before submission
- [ ] Print dialogs work for receipts, KOT, and reports
- [ ] **[Design]** No `box-shadow` used on any card, panel, or container (input focus ring excepted)
- [ ] **[Design]** Green (`#3ecf8e`) appears only on: active nav indicator, link text, input focus ring, accent card borders, success badge — never as a fill
- [ ] **[Design]** `font-weight: 700` (bold) is absent from the entire codebase
- [ ] **[Design]** All KPI values and page-level headings have `line-height: 1.00`
- [ ] **[Design]** All order numbers, SKUs, and reference codes render in Source Code Pro uppercase with 1.2px letter-spacing
- [ ] **[Design]** All primary buttons and status badges use `border-radius: 9999px` (pill)
- [ ] **[Design]** All modals use translucent `rgba(41,41,41,0.96)` + `backdrop-filter: blur(12px)` — not flat opaque fills
- [ ] **[Design]** Circular and Source Code Pro fonts load from local bundle files — zero CDN requests at runtime
- [ ] **[Design]** No amber, purple, or other accent colors used as primary interactive signals (green only for brand identity; semantic colors only in badges/alerts)

---

*Blueprint version 1.0 — RestaurantOS — Designed for macOS Apple Silicon (M1) — Offline-first, standalone, admin-only.*
