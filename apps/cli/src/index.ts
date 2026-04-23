#!/usr/bin/env node

import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  analyzeRepository,
  type RepositoryAnalysisResult
} from "@repolens/core";
import {
  formatGeneratedDocumentForTerminal,
  formatRepositoryOverviewForJson,
  formatRepositoryOverviewForTerminal
} from "./format-repository-overview-output.js";

function printSummary(result: RepositoryAnalysisResult) {
  console.log(`Repository: ${result.documentationMetadata.repositoryFullName}`);
  console.log(`Scanned files: ${result.scannedFiles.length}`);
  console.log(`Stack: ${result.detectedStack.map((entry) => entry.name).join(", ") || "none"}`);
  console.log(`Modules: ${result.detectedModules.length}`);
  console.log(`Dependencies: ${result.moduleDependencies.length}`);
  console.log(`API endpoints: ${result.apiEndpoints.length}`);
}

function printExplanation(result: RepositoryAnalysisResult) {
  const explanation = result.generatedDocs
    .map((draft) =>
      draft.docType === "PROJECT_OVERVIEW"
        ? formatRepositoryOverviewForTerminal(result)
        : formatGeneratedDocumentForTerminal(draft.content)
    )
    .join("\n\n");
  console.log(explanation);
}

function printExplanationJson(result: RepositoryAnalysisResult) {
  const onboardingGuide = result.generatedDocs.find(
    (draft) => draft.docType === "ONBOARDING_GUIDE"
  );
  const architectureSummary = result.generatedDocs.find(
    (draft) => draft.docType === "ARCHITECTURE_SUMMARY"
  );

  console.log(
    JSON.stringify(
      {
        repositoryOverview: formatRepositoryOverviewForJson(result),
        summaries: {
          onboardingGuide: onboardingGuide?.content ?? "",
          architectureSummary: architectureSummary?.content ?? ""
        }
      },
      null,
      2
    )
  );
}

function printUsage() {
  console.log("RepoLens Community Edition");
  console.log("Usage:");
  console.log("  repolens analyze <repository-path> [--json]");
  console.log("  repolens explain <repository-path> [--json]");
}

async function analyzeRepositoryPath(
  repositoryPath: string
): Promise<RepositoryAnalysisResult | null> {
  const repositoryStats = await stat(repositoryPath).catch(() => null);

  if (!repositoryStats?.isDirectory()) {
    console.error(`Invalid repository path: ${repositoryPath}`);
    return null;
  }

  const absoluteRepositoryPath = path.resolve(repositoryPath);

  return analyzeRepository({
    rootPath: absoluteRepositoryPath,
    repositoryFullName: path.basename(absoluteRepositoryPath),
    repositoryUrl: "",
    defaultBranch: null
  });
}

export async function runCli(argv: string[]): Promise<number> {
  const [command, repositoryPath, ...flags] = argv;

  if (!command) {
    printUsage();
    return 0;
  }

  if (command === "analyze" && repositoryPath) {
    const result = await analyzeRepositoryPath(repositoryPath);
    if (!result) {
      return 1;
    }

    if (flags.includes("--json")) {
      console.log(JSON.stringify(result, null, 2));
      return 0;
    }

    printSummary(result);
    return 0;
  }

  if (command === "explain" && repositoryPath) {
    const result = await analyzeRepositoryPath(repositoryPath);
    if (!result) {
      return 1;
    }

    if (flags.includes("--json")) {
      printExplanationJson(result);
      return 0;
    }

    printExplanation(result);
    return 0;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  return 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exitCode = exitCode;
}
