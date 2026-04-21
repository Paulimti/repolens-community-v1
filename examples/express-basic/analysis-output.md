# Express Analysis Output

This file contains example output captured from the current `examples/express-basic` fixture. It is included as documentation and may change if the fixture or analyzer behavior changes.

## Terminal Summary

```text
Repository: express-basic
Scanned files: 5
Stack: JavaScript, TypeScript, Node.js, Express
Modules: 1
Dependencies: 0
API endpoints: 2
```

## JSON Snippet

```json
{
  "documentationMetadata": {
    "repositoryFullName": "express-basic",
    "scannedFileCount": 5,
    "moduleCount": 1,
    "moduleDependencyCount": 0,
    "apiEndpointCount": 2
  },
  "apiEndpoints": [
    {
      "framework": "EXPRESS",
      "method": "GET",
      "path": "/users",
      "sourcePath": "src/routes/users.ts",
      "handlerName": "listUsers"
    },
    {
      "framework": "EXPRESS",
      "method": "POST",
      "path": "/users",
      "sourcePath": "src/routes/users.ts",
      "handlerName": "createUser"
    }
  ]
}
```
