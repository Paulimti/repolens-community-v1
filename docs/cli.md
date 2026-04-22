# CLI

RepoLens Community Edition provides a single local-first CLI entrypoint for repository analysis.

## Recommended Workspace Command

```bash
npm run analyze -- <repository-path>
npm run analyze -- <repository-path> --json
npm run explain -- <repository-path>
```

## Underlying Command

```bash
node apps/cli/dist/index.js analyze <repository-path>
node apps/cli/dist/index.js explain <repository-path>
```

## Flags

- `--json`: print the full normalized analysis result as JSON instead of the terminal summary

## Examples

Analyze the current repository:

```bash
npm run analyze -- .
```

Print a human-readable repository summary:

```bash
npm run explain -- .
```

The `explain` command prints a terminal-friendly repository overview first, followed by onboarding and architecture summaries derived from the local analysis result.

Analyze another local repository:

```bash
npm run analyze -- "E:\path\to\other-repo"
```

Return JSON output:

```bash
npm run analyze -- "E:\path\to\other-repo" --json
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

- [Installation](installation.md)
- [Examples](examples.md)
- [Feature Boundary](feature-boundary.md)
- [README](../README.md)
