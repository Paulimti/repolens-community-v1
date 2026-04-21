# Next.js Analysis Output

This file contains example output captured from the current `examples/nextjs-basic` fixture. It is included as documentation and may change if the fixture or analyzer behavior changes.

## Terminal Summary

```text
Repository: nextjs-basic
Scanned files: 7
Stack: JavaScript, TypeScript, Node.js, Next.js, React
Modules: 3
Dependencies: 0
API endpoints: 1
```

## JSON Snippet

```json
{
  "documentationMetadata": {
    "repositoryFullName": "nextjs-basic",
    "scannedFileCount": 7,
    "moduleCount": 3,
    "moduleDependencyCount": 0,
    "apiEndpointCount": 1
  },
  "apiEndpoints": [
    {
      "framework": "NEXTJS",
      "method": "GET",
      "path": "/api/health",
      "sourcePath": "app/api/health/route.ts",
      "handlerName": "GET"
    }
  ]
}
```
