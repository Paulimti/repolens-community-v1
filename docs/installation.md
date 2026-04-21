# Community Edition Installation

## Requirements

- Node.js 20 or later
- npm 10 or later

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Common Scripts

- `npm run build` compiles the workspace once
- `npm run dev` watches TypeScript builds during development
- `npm run lint` runs ESLint across the repository
- `npm test` runs the Vitest suite
- `npm run analyze -- <path>` runs the local CLI after the workspace has been built

## Verify

```bash
npm run lint
npm test
```

## First Local Analysis Run

```bash
npm run analyze -- .
```

## Related Docs

- [CLI](cli.md)
- [Examples](examples.md)
- [README](../README.md)
