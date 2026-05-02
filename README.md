# Restaurant OS

A desktop restaurant management system built with Tauri, Next.js, and SQLite.

## Features

- **Advanced Security** - Full database encryption via **SQLCipher** (AES-256) and secure PIN-based POS lock screen.
- **Reporting & Export** - Professional PDF receipts for customers and one-click Excel/CSV export for inventory, staff, and financial records.
- **Dashboard** - Real-time sales overview, order tracking, low-stock alerts with loading skeletons.
- **Tables** - Table layout editor, reservation Management, timeline view.
- **Orders** - Order creation, multi-item cart, payment processing with audit logging.
- **Inventory** - Stock tracking, transactions, low-stock alerts, and value reporting.
- **Staff** - Employee management, roles, attendance tracking, and salary overview.
- **Reliability** - Versioned database migrations, automated timestamped backups, and modular architecture.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Desktop**: Tauri 2.x
- **Database**: SQLite with **SQLCipher** (AES-256 Encryption)
- **State**: Zustand
- **Reporting**: jsPDF (PDF) & SheetJS (Excel/CSV)
- **Forms**: React Hook Form + Zod validation
- **UI**: shadcn/ui components with Error Boundaries

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