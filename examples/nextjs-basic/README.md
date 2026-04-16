# Next.js Example

This fixture is a small Next.js repository for trying RepoLens Community Edition against an app-router style project.

## Analyze This Repository

From the workspace root, run:

```bash
node apps/cli/dist/index.js analyze ./examples/nextjs-basic
```

For the full structured result:

```bash
node apps/cli/dist/index.js analyze ./examples/nextjs-basic --json
```

## What RepoLens Detects Here

- stack signals for JavaScript, TypeScript, Node.js, Next.js, and React
- parsed modules for the route handler, app layout, and Next.js config
- one Next.js API endpoint at `/api/health`
- no internal dependency edges in this minimal fixture

## Example Output

See [analysis-output.md](analysis-output.md) for captured example summary and JSON snippets from this fixture.
