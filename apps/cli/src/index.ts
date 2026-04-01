#!/usr/bin/env node

import { stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { analyzeLocalRepository } from "@repolens/core";

function printTerminalSummary(result: Awaited<ReturnType<typeof analyzeLocalRepository>>): void {
  console.log(`Repository: ${result.repositoryRoot}`);
  console.log(`Frameworks: ${result.stack.frameworks.join(", ") || "none"}`);
  console.log(`Modules: ${result.modules.length}`);
  console.log(`Endpoints: ${result.endpoints.length}`);
}

export async function runCli(argv: string[]): Promise<number> {
  const [command, repositoryPath, ...flags] = argv;

  if (!command) {
    console.log("RepoLens Community Edition");
    console.log("Usage: repolens analyze <repository-path>");
    return 0;
  }

  if (command === "analyze" && repositoryPath) {
    const repositoryStats = await stat(repositoryPath).catch(() => null);

    if (!repositoryStats?.isDirectory()) {
      console.error(`Invalid repository path: ${repositoryPath}`);
      return 1;
    }

    const result = await analyzeLocalRepository(repositoryPath);

    if (flags.includes("--json")) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    printTerminalSummary(result);
    return 0;
  }

  console.error(`Unknown command: ${command}`);
  return 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
