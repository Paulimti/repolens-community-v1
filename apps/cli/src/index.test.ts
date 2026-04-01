import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCli } from "./index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runCli", () => {
  it("analyzes a local repository and prints json output", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const repositoryPath = path.resolve("examples/express-basic");

    const exitCode = await runCli(["analyze", repositoryPath, "--json"]);
    const output = logSpy.mock.calls.at(-1)?.[0];

    expect(exitCode).toBe(0);
    expect(typeof output).toBe("string");

    const result = JSON.parse(String(output)) as {
      stack: { frameworks: string[] };
      modules: Array<{ type: string }>;
      endpoints: Array<{ method: string; routePath: string }>;
    };

    expect(result.stack.frameworks).toContain("express");
    expect(result.modules.length).toBeGreaterThan(0);
    expect(
      result.endpoints.some(
        (endpoint) => endpoint.method === "GET" && endpoint.routePath === "/users"
      )
    ).toBe(true);
  });
});
