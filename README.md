# RepoLens Community Edition

Public open-source repository analysis engine and local CLI tooling.

## What It Does

RepoLens Community Edition analyzes a local repository path and produces deterministic structural output for source files, stacks, modules, dependency relationships, API endpoints, and architecture summaries.

This repository is the public community edition only. It focuses on local analysis workflows and does not include the hosted SaaS features from the private `repolens` repository.

## Community Edition Features

- local repository scanning
- stack detection
- AST parsing
- module extraction
- dependency graph generation
- API extraction
- architecture summary
- CLI analysis

## Install And Run

```bash
npm install
npm run build
node apps/cli/dist/index.js analyze .
```

The packages in `packages/*` are workspace packages used inside this repository. They are documented as public code boundaries, but this repo is currently set up for local development and local CLI usage rather than npm package publishing.

## Supported Languages

- JavaScript
- TypeScript

## CLI Examples

```bash
node apps/cli/dist/index.js analyze .
node apps/cli/dist/index.js analyze ./examples/express-basic
node apps/cli/dist/index.js analyze ./examples/nextjs-basic --json
```

If you want a quick smoke test, run one of the example repositories above after `npm run build`.

## Open Core Boundaries

This repository does not include any hosted or SaaS-only features.

Not included in the community edition:

- repo chat
- embeddings or vector search
- private repository access
- GitHub OAuth
- team workspace features
- branch comparison
- premium report export workflows
- billing, subscriptions, or usage-limit logic

## Package Architecture

See `docs/architecture.md` for the package-level architecture overview.

## Examples

- `examples/express-basic`: small Express router example
- `examples/nextjs-basic`: small Next.js app router example

See `examples/README.md` for example-specific usage notes.
