# Shadcn Help

A VS Code extension for discovering, installing, and managing [shadcn/ui](https://ui.shadcn.com) components directly from your editor.

## Features

- **Component Browser** — Browse all available shadcn/ui components in a sidebar panel
- **Quick Install** — Install components with a single click
- **Project Detection** — Automatically detects your project setup (React, Next.js, package manager)
- **Dependency Check** — Verifies required dependencies before installation
- **Search & Filter** — Find components by name or description, filter by installation status
- **Command Palette** — Full command palette integration for keyboard-first workflows
- **Multiple Package Managers** — Supports npm, pnpm, yarn, and bun

## Requirements

- VS Code 1.90.0 or higher
- A React project (shadcn/ui components are React-based)

## Installation

1. Install from the VS Code Marketplace (search "Shadcn Help")
2. Open a React project in VS Code
3. Click the Shadcn Help icon in the activity bar (sidebar)
4. Browse and install components

## Usage

### Sidebar Panel
Click the Shadcn Help icon in the activity bar to open the component browser.

### Commands
- `Shadcn Help: Open` — Open the Shadcn Help sidebar
- `Shadcn Help: Install Component` — Install a component via quick pick
- `Shadcn Help: Search Components` — Search and jump to components
- `Shadcn Help: Check Project` — Display project detection results
- `Shadcn Help: Refresh Components` — Refresh the component list

### Settings
- `shadcnHelp.packageManager` — Choose package manager (auto/npm/pnpm/yarn/bun)
- `shadcnHelp.registry` — Custom registry URL (default: https://ui.shadcn.com)
- `shadcnHelp.autoDetectProject` — Auto-detect project on startup (default: true)

## Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `shadcnHelp.packageManager` | `auto` | Package manager to use |
| `shadcnHelp.registry` | `https://ui.shadcn.com` | Registry URL |
| `shadcnHelp.autoDetectProject` | `true` | Auto-detect project settings |

## Known Issues

- Requires an active React/Next.js project with package.json
- shadcn/ui CLI must be available (installs via npx/pnpm/yarn/bun)

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT
