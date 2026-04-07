import type {
  GeneratedDocumentationDraft,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";
import { createOnboardingGuidePromptTemplate } from "./documentation-prompt-templates.js";

export function generateOnboardingGuide(
  metadata: RepositoryDocumentationMetadata
): GeneratedDocumentationDraft {
  const inferFirstTargets = () => {
    const priorities: string[] = [];

    if (metadata.apiEndpointCount > 0) {
      priorities.push("Inspect API endpoint modules to understand request flow.");
    }

    if (metadata.moduleCount > 0) {
      priorities.push("Read core modules with high dependency fan-in/fan-out first.");
    }

    if (metadata.stack.some((entry) => entry.name === "Next.js")) {
      priorities.push("Start from `app/` and route handlers to trace UI and API boundaries.");
    }

    if (metadata.stack.some((entry) => entry.name === "Express")) {
      priorities.push("Start from router definitions and middleware registration order.");
    }

    if (priorities.length === 0) {
      priorities.push(
        "Start from entry points and configuration files to map the execution flow."
      );
    }

    return priorities;
  };

  const inferContributionIdeas = () => {
    const ideas = [
      "Document major modules and their responsibilities.",
      "Add or improve tests for frequently imported modules."
    ];

    if (metadata.apiEndpointCount > 0) {
      ideas.push("Validate endpoint coverage and add missing request/response examples.");
    }

    if (metadata.stack.some((entry) => entry.name === "Prisma")) {
      ideas.push("Review schema relations and ensure migrations match runtime usage.");
    }

    return ideas;
  };

  const inferPitfalls = () => {
    const pitfalls: string[] = [];

    if (
      metadata.stack.some((entry) => entry.name === "TypeScript") &&
      metadata.moduleDependencyCount > metadata.moduleCount * 2
    ) {
      pitfalls.push(
        "Cross-module coupling is high; refactors should start with shared contracts."
      );
    }

    if (metadata.stack.some((entry) => entry.name === "pnpm Workspaces")) {
      pitfalls.push("Workspace dependency boundaries can hide implicit cross-package assumptions.");
    }

    if (metadata.stack.some((entry) => entry.name === "Turborepo")) {
      pitfalls.push("Task pipelines may cache stale outputs if project graph assumptions are wrong.");
    }

    if (pitfalls.length === 0) {
      pitfalls.push("Runtime behavior may depend on files that were excluded from the current scan.");
    }

    return pitfalls;
  };

  const promptTemplate = createOnboardingGuidePromptTemplate(metadata);
  const firstTargets = inferFirstTargets();
  const contributionIdeas = inferContributionIdeas();
  const pitfalls = inferPitfalls();

  return {
    docType: "ONBOARDING_GUIDE",
    title: "Onboarding Guide",
    content: [
      "# Onboarding Guide",
      "",
      "## What this repository appears to do",
      `- The repository includes ${metadata.scannedFileCount} scanned files and ${metadata.moduleCount} parsed modules.`,
      `- Static analysis found ${metadata.apiEndpointCount} API endpoints and ${metadata.moduleDependencyCount} module dependency edges.`,
      "",
      "## First things to inspect",
      ...firstTargets.map((item) => `- ${item}`),
      "",
      "## Suggested first contributions",
      ...contributionIdeas.map((item) => `- ${item}`),
      "",
      "## Common pitfalls inferred from the stack",
      ...pitfalls.map((item) => `- ${item}`)
    ].join("\n"),
    systemPrompt: promptTemplate.systemPrompt,
    userPrompt: promptTemplate.userPrompt
  };
}
