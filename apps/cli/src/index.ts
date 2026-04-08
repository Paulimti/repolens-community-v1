#!/usr/bin/env node

import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { analyzeRepository } from "@repolens/core";

function printSummary(result: Awaited<ReturnType<typeof analyzeRepository>>) {
  console.log(`Repository: ${result.documentationMetadata.repositoryFullName}`);
  console.log(`Scanned files: ${result.scannedFiles.length}`);
  console.log(`Stack: ${result.detectedStack.map((entry) => entry.name).join(", ") || "none"}`);
  console.log(`Modules: ${result.detectedModules.length}`);
  console.log(`Dependencies: ${result.moduleDependencies.length}`);
  console.log(`API endpoints: ${result.apiEndpoints.length}`);
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

    const absoluteRepositoryPath = path.resolve(repositoryPath);
    const result = await analyzeRepository({
      rootPath: absoluteRepositoryPath,
      repositoryFullName: path.basename(absoluteRepositoryPath),
      repositoryUrl: "",
      defaultBranch: null
    });

    if (flags.includes("--json")) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    printSummary(result);
    return 0;
  }

  console.error(`Unknown command: ${command}`);
  return 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
