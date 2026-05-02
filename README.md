# Restaurant OS

A desktop restaurant management system built with Tauri, Next.js, and SQLite.

## Features

- **Advanced Security** - Industry-standard security architecture:
  - **SQLCipher (AES-256)**: Full database encryption at rest.
  - **Secure Key Derivation**: PINs are expanded via **PBKDF2-HMAC-SHA256** (100k iterations) before being used as encryption keys.
  - **Gated IPC Bridge**: Prevents SQL injection by moving query construction to Rust; frontend only sends structured data.
  - **Native Logout**: Explicitly drops DB connections and purges keys from memory upon session termination.
- **Reporting & Export** - Professional PDF receipts for customers and one-click Excel/CSV export for inventory, staff, and financial records.
- **Audit Logging** - Full traceability for every database modification (`INSERT`, `UPDATE`, `DELETE`) with before/after state capture.
- **Dashboard** - Real-time sales overview, order tracking, low-stock alerts with loading skeletons.
- **Tables** - Table layout editor, reservation management, and timeline view.
- **Reliability** - Versioned migrations, automated timestamped backups, and modular internal architecture.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Desktop**: Tauri 2.x
- **Database**: SQLite with **SQLCipher** (AES-256 Encryption)
- **Security**: PBKDF2-HMAC-SHA256 Key Derivation (Rust)
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