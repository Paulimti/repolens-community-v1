#!/usr/bin/env node

import { analyzeLocalRepository } from "@repolens/core";

export async function runCli(argv: string[]): Promise<number> {
  const [command, repositoryPath] = argv;

  if (!command) {
    console.log("RepoLens Community Edition");
    console.log("Usage: repolens analyze <repository-path>");
    return 0;
  }

  if (command === "analyze" && repositoryPath) {
    const result = await analyzeLocalRepository(repositoryPath);

    console.log(`Analyzed ${result.repositoryRoot}`);
    return 0;
  }

  console.error(`Unknown command: ${command}`);
  return 1;
}

const exitCode = await runCli(process.argv.slice(2));
process.exitCode = exitCode;
