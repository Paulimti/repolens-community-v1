# Public Package Architecture

## Packages

- `packages/shared-types`: reusable public analysis contracts
- `packages/parser-core`: repository scanning, stack detection, AST parsing, module and API extraction
- `packages/graph-core`: dependency edge generation and graph normalization
- `packages/core`: orchestration and human-readable summaries
- `apps/cli`: local repository analysis commands

These are workspace package boundaries for the open-source repository. The library packages define the public code organization of the community edition, while `apps/cli` remains a local CLI application boundary rather than a hosted product surface.

## Flow

1. `parser-core` scans a local repository and collects file metadata.
2. `parser-core` parses package metadata and supported source files.
3. `parser-core` extracts modules, imports, exports, symbols, and endpoints.
4. `graph-core` builds a normalized dependency graph from import relationships.
5. `core` assembles summaries and the final analysis result.
6. `apps/cli` renders terminal or JSON output for a local repository path.
