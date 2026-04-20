# Contributing to RestaurantOS

## Development Setup

### Prerequisites

- Node.js 20+
- Rust (stable)
- Tauri CLI (`cargo install tauri-cli`)
- npm or pnpm

### First Run

```bash
git clone https://github.com/pallab-js/rms.git
cd rms
npm ci
npm run tauri dev
```

## Testing

```bash
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Pull Request Guidelines

1. Fork and create a feature branch
2. Make focused commits with clear messages
3. Add/update tests for new functionality
4. Ensure lint and typecheck pass
5. Open a PR with description and testing steps