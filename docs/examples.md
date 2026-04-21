# Examples

RepoLens Community Edition analyzes local repositories, so the best way to learn the tool is to run it against small fixture projects and then try it on your own codebase.

## Included Fixtures

This repository includes two small fixture repositories under [`examples/`](../examples/):

- `examples/express-basic`: a minimal Express router example
- `examples/nextjs-basic`: a minimal Next.js app-router example

## Local Repository Example

Analyze any local repository path:

```bash
npm run analyze -- "E:\path\to\your-repository"
```

Return JSON for scripting or inspection:

```bash
npm run analyze -- "E:\path\to\your-repository" --json
```

## Framework-Specific Examples

- [Express example](../examples/express-basic/README.md)
- [Next.js example](../examples/nextjs-basic/README.md)
- [Examples folder guide](../examples/README.md)

## What To Look For

When you run the analyzer, the current community edition can surface:

- detected stack signals from local metadata
- parsed source modules from supported JavaScript and TypeScript files
- internal dependency relationships
- extracted API endpoints from supported framework patterns
- generated summary-oriented documentation fields in JSON output

## Related Docs

- [Installation](installation.md)
- [CLI](cli.md)
- [README](../README.md)
