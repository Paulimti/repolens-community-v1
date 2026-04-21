# Contributing

Thanks for contributing to RepoLens Community Edition.

This repository is the public open-source analysis engine from RepoLens. Contributions should keep the project local-first, analysis-focused, and safe to maintain as a clear community edition.

## Before You Start

Please keep these guardrails in mind:

- prefer small, review-friendly pull requests
- keep package boundaries clear between `shared-types`, `parser-core`, `graph-core`, `core`, and `apps/cli`
- favor deterministic static analysis over hidden heuristics
- do not introduce SaaS-only capabilities into the public repository

## Local Setup

Requirements:

- Node.js 20 or later
- npm 10 or later

Install dependencies:

```bash
npm install
```

Build the workspace:

```bash
npm run build
```

Run validation:

```bash
npm run lint
npm test
```

Useful development scripts:

- `npm run build` compiles the workspace once
- `npm run dev` watches TypeScript builds while you work
- `npm run lint` checks the repository with ESLint
- `npm test` runs the Vitest suite
- `npm run analyze -- <path>` runs the local CLI after the workspace has been built

Try the CLI locally:

```bash
npm run analyze -- .
```

## Coding Expectations

When making changes:

- keep analysis logic readable and explicit
- avoid mixing parser, graph, CLI, and docs changes unless they are tightly related
- update docs and examples when user-facing behavior changes
- add or update tests when changing analysis behavior
- preserve the community-edition feature boundary

## Commit Guidance

Good commits are:

- small and semantic
- easy to review in isolation
- scoped to one concern when possible

Preferred prefixes:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `test:`
- `chore:`

Examples:

- `feat: add stack detection from package metadata`
- `docs: add cli usage examples`
- `fix: handle malformed package json files`

## Pull Request Checklist

Before opening a pull request:

1. run `npm run build`
2. run `npm run lint`
3. run `npm test`
4. verify the change stays within Community Edition scope
5. update docs or examples if the behavior changed

## Community Edition Scope

Please do not add any of the following here:

- repo chat
- embeddings or vector search
- private repository access
- hosted authentication or OAuth flows
- team workspace features
- branch comparison
- billing, subscriptions, or cloud account logic

If you are unsure whether something belongs in the public repository, default to local analysis and ask for clarification in the issue or pull request.
