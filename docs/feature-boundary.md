# Feature Boundary

RepoLens Community Edition is the public open-source analysis engine and local CLI. It is intentionally limited to community-safe, local-first capabilities.

## Included In Community Edition

- local repository scanning
- stack detection
- AST parsing for supported JavaScript and TypeScript files
- module extraction
- dependency graph generation
- API extraction for supported Express and Next.js patterns
- architecture and onboarding-oriented summaries
- local CLI analysis

## Not Included In Community Edition

- repo chat
- embeddings or vector search
- private repository access
- GitHub OAuth or hosted authentication
- team workspace or collaboration features
- branch comparison
- premium export or hosted report workflows
- billing, subscriptions, or account management logic

## Community Edition Vs Cloud Edition

| Area | Community Edition | Cloud Edition |
| --- | --- | --- |
| Repository access | Local filesystem paths only | Private product surface |
| Analysis engine | Included in this public repo | Included privately |
| CLI usage | Included | Cloud product workflows live outside this repository |
| Private repository integrations | Not included | Cloud-only |
| Auth and account flows | Not included | Cloud-only |
| Collaboration workflows | Not included | Cloud-only |
| Billing and subscriptions | Not included | Cloud-only |

## Decision Rule

If a feature depends on hosted services, account state, private-repository access, or multi-user collaboration, it should stay out of this public repository.

## Related Docs

- [Architecture](architecture.md)
- [CLI](cli.md)
- [README](../README.md)
