# CLI

RepoLens Community Edition provides a single local-first CLI entrypoint for repository analysis.

## Command

```bash
node apps/cli/dist/index.js analyze <repository-path>
```

## Flags

- `--json`: print the full normalized analysis result as JSON instead of the terminal summary

## Examples

Analyze the current repository:

```bash
node apps/cli/dist/index.js analyze .
```

Analyze another local repository:

```bash
node apps/cli/dist/index.js analyze "E:\path\to\other-repo"
```

Return JSON output:

```bash
node apps/cli/dist/index.js analyze "E:\path\to\other-repo" --json
```

## Behavior Notes

- If no command is provided, the CLI prints the RepoLens Community Edition banner and basic usage text.
- If the repository path does not exist or is not a directory, the CLI exits with an error.
- The CLI currently analyzes local filesystem paths only.

## Terminal Summary Fields

The default summary output currently reports:

- repository name
- scanned file count
- detected stack entries
- detected module count
- dependency edge count
- API endpoint count

## Related Docs

- [docs/examples.md](examples.md)
- [docs/feature-boundary.md](feature-boundary.md)
- [README.md](../README.md)
