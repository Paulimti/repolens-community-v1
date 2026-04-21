# RepoLens Community Edition

[![License](https://img.shields.io/github/license/mohosin2126/repolens-community?label=license)](LICENSE)

Workspace version: `0.1.0`  
Distribution: source repository and local CLI workspace, not a published npm package

Open-source repository analysis for understanding a local codebase fast.

RepoLens Community Edition helps you inspect a repository from the command line and turn source code into a clear structural snapshot. It scans files, detects the stack, parses source code, extracts modules and API routes, builds dependency relationships, and generates architecture-oriented summaries.

## Feature Highlights

- Analyze any local repository path from the CLI
- Detect common stack signals from project metadata and structure
- Parse JavaScript and TypeScript source with AST-based analysis
- Extract logical modules and source-level metadata
- Build normalized dependency graph relationships
- Discover API endpoints from supported framework patterns
- Generate architecture and onboarding-oriented summary data
- Keep analysis local-first with no hosted dependency required

## Installation

Requirements:

- Node.js 20 or later
- npm 10 or later

Install dependencies and build the workspace:

```bash
npm install
npm run build
```

Useful workspace scripts:

- `npm run build` compiles the workspace once
- `npm run dev` watches TypeScript builds during development
- `npm run lint` runs ESLint across the repository
- `npm test` runs the Vitest suite
- `npm run analyze -- <path>` runs the local CLI after the workspace has been built

Additional setup notes are available in [docs/installation.md](docs/installation.md).

## Quick Start

Analyze the current repository:

```bash
npm run analyze -- .
```

Analyze another local repository:

```bash
npm run analyze -- "E:\path\to\other-repo"
```

Return the full analysis result as JSON:

```bash
npm run analyze -- . --json
```

## CLI Usage Examples

Recommended workspace command:

```bash
npm run analyze -- <repository-path>
npm run analyze -- <repository-path> --json
```

Underlying CLI command:

```bash
node apps/cli/dist/index.js analyze <repository-path>
```

Analyze the included examples:

```bash
npm run analyze -- ./examples/express-basic
npm run analyze -- ./examples/nextjs-basic
npm run analyze -- ./examples/nextjs-basic --json
```

Browse the [examples directory](examples/) or start with [docs/examples.md](docs/examples.md) for fixture-specific usage notes and sample output.

If the path is invalid, the CLI returns an error:

```bash
npm run analyze -- ./does-not-exist
```

## Sample Output

Example summary output for `./examples/express-basic`:

```text
Repository: express-basic
Scanned files: 3
Stack: JavaScript, TypeScript, Node.js, Express
Modules: 1
Dependencies: 0
API endpoints: 2
```

Example summary output for `./examples/nextjs-basic`:

```text
Repository: nextjs-basic
Scanned files: 5
Stack: JavaScript, TypeScript, Node.js, Next.js, React
Modules: 3
Dependencies: 0
API endpoints: 1
```

Use `--json` when you want the full structured analysis result for tooling, debugging, or downstream processing.

## Screenshots

CLI output:

<!-- Add screenshot at docs/images/cli-output.png -->

Dependency graph:

<!-- Add screenshot at docs/images/dependency-graph.png -->

Architecture summary:

<!-- Add screenshot at docs/images/architecture-summary.png -->

## Supported Frameworks And Languages

Current analysis support in this public repository focuses on:

- JavaScript
- TypeScript
- Node.js package metadata
- Express router definitions
- Next.js app router route handlers

The community edition is intentionally conservative. This README only lists support that is implemented in the current codebase.

## Community Edition Vs Cloud Edition

This repository contains only the Community Edition engine and local developer tooling.

| Area | Community Edition | Cloud Edition |
| --- | --- | --- |
| Repository analysis | Local CLI analysis of local paths | Private product surface, not included here |
| Source parsing and graphing | Included | Included privately, not documented here |
| API extraction | Included for supported local patterns | Private product surface, not included here |
| Hosted access to private repositories | Not included | Cloud-only |
| Authentication and OAuth | Not included | Cloud-only |
| Collaboration and team workflows | Not included | Cloud-only |
| Billing and subscriptions | Not included | Cloud-only |

If a feature depends on hosted services, private repository access, account management, or team collaboration, it does not belong in this public repository.

## Repository Structure

```text
packages/shared-types  Reusable analysis contracts and public result types
packages/parser-core   Scanning, stack detection, AST parsing, extraction helpers
packages/graph-core    Dependency graph and architecture relationship utilities
packages/core          End-to-end local analysis pipeline and summaries
apps/cli               Local command-line interface
examples               Small sample repositories for trying the analyzer
docs                   Installation, architecture, CLI, examples, and roadmap documentation
```

For a package-level overview, see [docs/architecture.md](docs/architecture.md).

## Local Development

Useful workspace commands:

```bash
npm run build
npm run dev
npm run lint
npm test
npm run analyze -- .
```

Common workflow:

1. Install dependencies with `npm install`.
2. Build the workspace with `npm run build`.
3. Use `npm run dev` if you want TypeScript builds to keep watching while you work.
4. Run `npm run analyze -- <path>` against a local repository.
5. Run `npm run lint` and `npm test` before sending changes.

## Roadmap

RepoLens Community Edition is focused on improving the local analysis engine and its public developer experience.

Current roadmap themes:

- better local repository scanning and ignore handling
- stronger stack and framework detection
- broader parser coverage for supported JavaScript and TypeScript patterns
- richer module, graph, and architecture summaries
- better examples, tests, and contributor docs

See [ROADMAP.md](ROADMAP.md) for the maintained roadmap and explicit non-goals.

## Contributing

Contributions are welcome if they keep the project local-first, analysis-focused, and community-safe.

Before opening a pull request:

- keep changes small and review-friendly
- avoid introducing SaaS-only abstractions or features
- run `npm run build`, `npm run lint`, and `npm test`
- update docs or examples when behavior changes

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and scope guardrails.
