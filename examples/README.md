# Examples

This folder contains small local repositories for trying RepoLens Community Edition without needing another project on disk.

The examples are intentionally minimal. They exist to demonstrate the public analysis engine only:

- repository scanning
- stack detection
- AST-driven source analysis
- module extraction
- dependency graph generation
- API endpoint extraction

## Before You Run Them

Build the CLI from the workspace root:

```bash
npm install
npm run build
```

All commands below should be run from the repository root.

## Included Example Repositories

- [Express example](express-basic/README.md)
- [Next.js example](nextjs-basic/README.md)

## Express Example

Analyze the Express fixture:

```bash
node apps/cli/dist/index.js analyze ./examples/express-basic
```

What you should see:

- Express detected in the repository stack
- route-oriented source modules discovered under `src/routes`
- Express endpoints extracted for `/users`
- dependency relationships based on local imports

Example output:

- [Express output](express-basic/analysis-output.md)

## Next.js Example

Analyze the Next.js fixture:

```bash
node apps/cli/dist/index.js analyze ./examples/nextjs-basic
```

Use JSON output if you want the full structured result:

```bash
node apps/cli/dist/index.js analyze ./examples/nextjs-basic --json
```

What you should see:

- Next.js and React detected in the repository stack
- app-router style files recognized from the `app/` directory
- API route handler metadata extracted for `/api/health`
- source modules and dependency edges derived from parsed files

Example output:

- [Next.js output](nextjs-basic/analysis-output.md)

## Using Your Own Repository

Once the examples work, point the CLI at any local repository path:

```bash
node apps/cli/dist/index.js analyze "E:\path\to\your-repository"
```

## Scope Reminder

These examples are only for the community edition's local analysis flow. They do not demonstrate any cloud, team, auth, billing, or other SaaS-only features because those are intentionally excluded from this public repository.
