# Public Package Architecture

## Packages

- `packages/shared-types`: reusable public analysis contracts
- `packages/parser-core`: repository scanning, stack detection, AST parsing, module and API extraction
- `packages/graph-core`: dependency edge generation and graph normalization
- `packages/core`: orchestration and human-readable summaries
- `apps/cli`: local repository analysis commands

These are workspace package boundaries for the open-source repository. The library packages define the public code organization of the community edition, while `apps/cli` remains a local CLI application boundary rather than a hosted product surface.

## Flow

1. `parser-core/scan-repository-files` walks the local repository and applies ignore rules.
2. `parser-core/detect-stack` infers stack signals from manifests and project structure.
3. `parser-core/source-parser` and `extract-source-module-metadata` parse supported source files with `ts-morph`.
4. `graph-core/detect-logical-modules` classifies source modules, then `build-module-dependencies` resolves internal edges.
5. `graph-core/extract-express-routes` and `extract-nextjs-route-handlers` extract API endpoints.
6. `core/analyze-repository` assembles the community analysis snapshot and generated documentation drafts.
7. `apps/cli` exposes local path analysis in terminal and JSON forms.
