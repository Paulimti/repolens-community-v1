#!/usr/bin/env node

import { pathToFileURL } from "node:url";

export async function runCli(argv: string[]): Promise<number> {
  const [command] = argv;

  if (!command) {
    console.log("RepoLens Community Edition");
    console.log("Usage: repolens analyze <repository-path>");
    return 0;
  }

  console.error(`Unknown command: ${command}`);
  return 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
