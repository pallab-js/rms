# Restaurant OS

A desktop restaurant management system built with Tauri, Next.js, and SQLite.

## Features

- **Dashboard** - Real-time sales overview, order tracking, low-stock alerts
- **Tables** - Table layout editor, reservation Management, timeline view
- **Orders** - Order creation, multi-item cart, payment processing
- **Menu** - Categories, items, modifiers, pricing with margin calculation
- **Inventory** - Stock tracking, transactions, low-stock alerts
- **Staff** - Employee management, roles, attendance tracking
- **Billing** - Split payments, multiple payment methods
- **Reports** - Sales analytics, expense tracking
- **Settings** - Restaurant configuration, tax settings

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Desktop**: Tauri 2.x
- **Database**: SQLite (via @tauri-apps/plugin-sql)
- **State**: Zustand
- **Forms**: React Hook Form + Zod validation
- **UI**: shadcn/ui components

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Desktop Build

```bash
# Build Tauri app
npm run tauri build
```

## Project Structure

```
app/              # Next.js pages/routes
components/       # React components (organized by feature)
lib/             # Utilities, database, validation
stores/           # Zustand stores
types/           # TypeScript definitions
src-tauri/       # Tauri backend (Rust)
```