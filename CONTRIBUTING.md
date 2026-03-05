# Contributing

## Principles

- Keep changes local-first, reusable, and analysis-focused.
- Do not add SaaS-only capabilities to this repository.
- Prefer deterministic analysis logic over hidden magic.
- Keep package boundaries clear between shared types, parser logic, graph logic, core orchestration, and the CLI.

## Development flow

1. Install dependencies with `npm install`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Run `npm test`.

## Commit style

- Use small, review-friendly commits with semantic prefixes such as `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, and `chore:`.
- Avoid mixing unrelated docs, CLI, and core analysis changes in the same commit unless they are tightly coupled.

## Scope guardrails

Please do not introduce any of the following into the community edition:

- embeddings or vector search
- private repository access
- hosted authentication
- team workspace features
- branch comparison
- billing or subscription logic
