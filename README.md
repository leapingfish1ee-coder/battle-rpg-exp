# battle-rpg-exp

2D browser JRPG experimental project based on PixiJS v8 with a single-canvas application architecture.

## Requirements

- Node.js 22.12+
- npm

## Development

```bash
npm install
npm run dev
```

The game opens directly in the town scene and town menu; all user-facing application UI is rendered through PixiJS.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:browser
npm run test:all
```

`npm run check` runs the non-browser validation pipeline locally, while `npm run test:all` runs the complete current test suite including Playwright browser coverage.

## Testing standard

Project test layering, Pixi component contracts, visual regression baselines, deterministic fixtures, viewport coverage, and CI requirements are defined in [`docs/contributing/testing.md`](docs/contributing/testing.md).

## Architecture

Project documentation is maintained under [`docs/`](docs/README.md).

- Architecture baseline: [`docs/architecture/pixijs-2d-architecture.md`](docs/architecture/pixijs-2d-architecture.md)
- Foundation implementation status: [`docs/architecture/foundation-status.md`](docs/architecture/foundation-status.md)
- Testing standard: [`docs/contributing/testing.md`](docs/contributing/testing.md)
- ADR process: [`docs/adr/README.md`](docs/adr/README.md)
