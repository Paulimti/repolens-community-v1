import type { RepositoryAnalysisResult } from "@repolens/core";
import type { StackCategory } from "@repolens/shared-types";

const stackCategoryOrder: StackCategory[] = [
  "language",
  "runtime",
  "framework",
  "database",
  "tooling"
];

function formatStackByCategory(result: RepositoryAnalysisResult): string[] {
  if (result.detectedStack.length === 0) {
    return ["- No stack signals were detected from package metadata or project structure."];
  }

  const entriesByCategory = new Map<StackCategory, string[]>();

  for (const entry of result.detectedStack) {
    const formattedEntry = `${entry.name} [evidence: ${entry.evidence}]`;
    const entries = entriesByCategory.get(entry.category) ?? [];
    entries.push(formattedEntry);
    entriesByCategory.set(entry.category, entries);
  }

  return stackCategoryOrder
    .filter((category) => (entriesByCategory.get(category)?.length ?? 0) > 0)
    .map((category) => {
      const entries = entriesByCategory.get(category) ?? [];
      return `- ${category}: ${entries.join(", ")}`;
    });
}

export function formatRepositoryOverviewForTerminal(
  result: RepositoryAnalysisResult
): string {
  return [
    "Repository Overview",
    "",
    "Repository",
    `- Name: ${result.documentationMetadata.repositoryFullName}`,
    `- URL: ${result.documentationMetadata.repositoryUrl || "Not specified"}`,
    `- Default branch: ${result.documentationMetadata.defaultBranch ?? "Not specified"}`,
    "",
    "Detected Stack",
    ...formatStackByCategory(result),
    "",
    "Analysis Signals",
    `- Scanned files: ${result.scannedFiles.length}`,
    `- Parsed modules: ${result.detectedModules.length}`,
    `- Module dependencies: ${result.moduleDependencies.length}`,
    `- API endpoints: ${result.apiEndpoints.length}`
  ].join("\n");
}

export function formatGeneratedDocumentForTerminal(content: string): string {
  return content.replace(/^#{1,6}\s+/gm, "").trim();
}
