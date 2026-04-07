import type {
  GeneratedDocumentationDraft,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";
import { createProjectOverviewPromptTemplate } from "./documentation-prompt-templates.js";

export function generateProjectOverview(
  metadata: RepositoryDocumentationMetadata
): GeneratedDocumentationDraft {
  const promptTemplate = createProjectOverviewPromptTemplate(metadata);
  const formatStackSection = () => {
    if (metadata.stack.length === 0) {
      return "- No stack signals were detected from package metadata or project structure.";
    }

    return metadata.stack
      .map(
        (entry) => `- ${entry.name} (${entry.category}) [evidence: ${entry.evidence}]`
      )
      .join("\n");
  };

  return {
    docType: "PROJECT_OVERVIEW",
    title: "Project Overview",
    content: [
      "# Project Overview",
      "",
      "## Repository Snapshot",
      `- Repository: ${metadata.repositoryFullName}`,
      `- URL: ${metadata.repositoryUrl}`,
      `- Default branch: ${metadata.defaultBranch ?? "Not specified"}`,
      "",
      "## Detected Technology Stack",
      formatStackSection(),
      "",
      "## Analysis Signals and Scope",
      `- Scanned files: ${metadata.scannedFileCount}`,
      `- Parsed modules: ${metadata.moduleCount}`,
      `- Module dependencies: ${metadata.moduleDependencyCount}`,
      `- API endpoints: ${metadata.apiEndpointCount}`
    ].join("\n"),
    systemPrompt: promptTemplate.systemPrompt,
    userPrompt: promptTemplate.userPrompt
  };
}
