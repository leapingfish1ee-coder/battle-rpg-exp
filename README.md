# battle-rpg-exp

2D browser RPG experimental project based on PixiJS v8 and a fixed-step simulation architecture.

## Requirements

- Node.js 22.12+
- npm

## Development

```bash
npm install
npm run dev
```

Movement in the foundation scene uses WASD or arrow keys.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

`npm run check` runs the non-browser validation pipeline locally.

## Architecture

Project documentation is maintained under [`docs/`](docs/README.md).

- Architecture baseline: [`docs/architecture/pixijs-2d-architecture.md`](docs/architecture/pixijs-2d-architecture.md)
- Foundation implementation status: [`docs/architecture/foundation-status.md`](docs/architecture/foundation-status.md)
- ADR process: [`docs/adr/README.md`](docs/adr/README.md)
