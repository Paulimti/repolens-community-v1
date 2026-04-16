# Express Example

This fixture is a small Express repository for trying RepoLens Community Edition against a simple router-based API.

## Analyze This Repository

From the workspace root, run:

```bash
node apps/cli/dist/index.js analyze ./examples/express-basic
```

For the full structured result:

```bash
node apps/cli/dist/index.js analyze ./examples/express-basic --json
```

## What RepoLens Detects Here

- stack signals for JavaScript, TypeScript, Node.js, and Express
- one parsed source module at `src/routes/users.ts`
- two Express endpoints for `/users`
- no internal dependency edges in this minimal fixture

## Example Output

See [analysis-output.md](analysis-output.md) for captured example summary and JSON snippets from this fixture.
