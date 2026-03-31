import { describe, expect, it } from "vitest";
import { Project } from "ts-morph";

import {
  extractExpressRoutes,
  extractNextJsRouteHandlers,
  normalizeEndpointMetadata
} from "./api-analysis.js";

describe("api analysis", () => {
  it("extracts express and nextjs endpoints into a normalized shape", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const expressFile = project.createSourceFile(
      "users.ts",
      ['router.get("/users", listUsers);', 'router.post("/users", createUser);'].join("\n")
    );
    const nextFile = project.createSourceFile(
      "route.ts",
      "export async function GET() { return Response.json({ ok: true }); }"
    );

    const endpoints = normalizeEndpointMetadata([
      ...extractExpressRoutes(expressFile, "src/routes/users.ts"),
      ...extractNextJsRouteHandlers(nextFile, "app/api/health/route.ts")
    ]);

    expect(endpoints).toEqual([
      {
        id: "express:src/routes/users.ts:GET:/users",
        framework: "express",
        filePath: "src/routes/users.ts",
        method: "GET",
        routePath: "/users",
        handlerName: "listUsers"
      },
      {
        id: "express:src/routes/users.ts:POST:/users",
        framework: "express",
        filePath: "src/routes/users.ts",
        method: "POST",
        routePath: "/users",
        handlerName: "createUser"
      },
      {
        id: "nextjs:app/api/health/route.ts:GET:/api/health",
        framework: "nextjs",
        filePath: "app/api/health/route.ts",
        method: "GET",
        routePath: "/api/health",
        handlerName: "GET"
      }
    ]);
  });
});
