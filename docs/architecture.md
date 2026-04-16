# Architecture

RepoLens Community Edition is organized as a small workspace of focused packages. The public repository keeps the analysis engine local-first and separates parsing, graph construction, orchestration, and CLI concerns.

## Package Boundaries

- `packages/shared-types`: reusable analysis contracts, result types, and normalized metadata shared across packages
- `packages/parser-core`: repository scanning, ignore handling, stack detection, AST parsing, import and export extraction, and source module metadata extraction
- `packages/graph-core`: logical module detection, dependency edge generation, and API endpoint extraction for supported frameworks
- `packages/core`: end-to-end repository analysis orchestration plus summary-oriented generated documentation data
- `apps/cli`: command-line entrypoint for analyzing a local repository path and printing either a terminal summary or JSON output

## Analysis Pipeline

1. The CLI receives a local repository path and resolves it to an absolute path.
2. `parser-core` scans files from that root while applying ignore rules and supported-file filtering.
3. `parser-core` detects stack signals from manifests, config files, and project structure.
4. `parser-core` parses supported JavaScript and TypeScript files and extracts import, export, and symbol metadata.
5. `graph-core` classifies logical modules and builds dependency edges from internal import relationships.
6. `graph-core` extracts API endpoints from supported Express router patterns and Next.js app-router route handlers.
7. `core` assembles the normalized repository analysis result and generates summary-style documentation artifacts.
8. The CLI prints a concise summary or emits the full JSON result.

## Current Outputs

The current community edition analysis result includes:

- scanned files
- detected stack entries
- detected modules
- module dependency edges
- extracted API endpoints
- generated project overview, onboarding guide, and architecture summary content

## Scope Notes

This architecture is intentionally limited to public community-edition capabilities. It does not include hosted access, private-repository integrations, authentication flows, collaboration features, billing, or other cloud-only concerns.
