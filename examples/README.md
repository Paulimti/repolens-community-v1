# Example Repositories

These example projects are small local fixtures for trying the community edition CLI and for understanding the supported analysis surface.

## Run the Express example

```bash
npm run build
node apps/cli/dist/index.js analyze ./examples/express-basic
```

Expected signals:

- Express detected in the stack
- route modules extracted from `src/routes/users.ts`
- two Express endpoints discovered for `/users`

## Run the Next.js example

```bash
npm run build
node apps/cli/dist/index.js analyze ./examples/nextjs-basic --json
```

Expected signals:

- Next.js and React detected in the stack
- route modules extracted from the `app/` directory
- one app-router endpoint discovered for `/api/health`

## Scope note

The examples are intentionally local and minimal. They are meant to demonstrate repository scanning, stack detection, API extraction, and graph-friendly source analysis without any hosted services.
