# RestaurantOS — Build & Package Guide

This document outlines the steps to build and package RestaurantOS for macOS Apple Silicon (M1/M2/M3).

## Prerequisites

- **Node.js:** v20 or later
- **Rust:** Latest stable version
- **Xcode Command Line Tools:** Installed (`xcode-select --install`)
- **macOS:** Sequoia (15.0) or later (recommended for Sequoia-specific features)

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Frontend Build (Static Export)

The application uses Next.js 15 with static export.

```bash
npm run build
```
This generates the `out/` directory containing the static HTML/JS/CSS assets.

### 3. Tauri Desktop Build

Run the Tauri build command to compile the Rust backend and package the application.

```bash
npx tauri build
```

This command will:
1. Run the `beforeBuildCommand` (`npm run build`).
2. Compile the Rust source code in `src-tauri/`.
3. Bundle the application into a standalone `.app` and a `.dmg` installer.

## Build Artifacts

The final build artifacts are located in:

- **Standalone App:** `src-tauri/target/release/bundle/macos/RestaurantOS.app`
- **DMG Installer:** `src-tauri/target/release/bundle/dmg/RestaurantOS_1.0.0_aarch64.dmg`

## Installation

1. Open the `.dmg` file.
2. Drag **RestaurantOS** to the **Applications** folder.
3. Launch the app from your Applications or via Spotlight.

## Troubleshooting

- **Database Errors:** The SQLite database (`restaurantOS.db`) is initialized automatically on first launch. It is stored in `~/Library/Application Support/com.restaurantos.app/`.
- **Permissions:** Ensure the app has permission to write to its Application Support directory.
- **Mismatched Architectures:** This build is specifically optimized for Apple Silicon (`aarch64`). It will not run on Intel-based Macs.

---
*Blueprint version 1.0 — RestaurantOS — Build Date: April 2026*
