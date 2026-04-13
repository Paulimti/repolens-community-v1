import { describe, expect, it } from "vitest";

import type { LogicalModule } from "@repolens/shared-types";

import { buildModuleDependencies } from "./build-module-dependencies.js";

describe("buildModuleDependencies", () => {
  it("resolves module relationships from relative imports", () => {
    const modules: LogicalModule[] = [
      {
        path: "src/routes/users.ts",
        logicalName: "routes.users",
        moduleType: "route",
        imports: [
          {
            moduleSpecifier: "../services/users",
            kind: "static",
            isTypeOnly: false,
            defaultImport: null,
            namespaceImport: null,
            namedImports: ["listUsers"]
          }
        ],
        exports: []
      },
      {
        path: "src/services/users.ts",
        logicalName: "services.users",
        moduleType: "service",
        imports: [],
        exports: []
      }
    ];

    expect(buildModuleDependencies(modules)).toEqual([
      {
        sourcePath: "src/routes/users.ts",
        targetPath: "src/services/users.ts",
        dependencyType: "STATIC",
        specifier: "../services/users",
        isTypeOnly: false
      }
    ]);
  });
});
