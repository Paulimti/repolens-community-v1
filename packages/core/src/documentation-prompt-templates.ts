export type DocumentationPromptTemplate = {
  key: "project_overview" | "onboarding_guide" | "architecture_summary";
  systemPrompt: string;
  userPrompt: string;
};

import type {
  RepositoryArchitectureMetadata,
  RepositoryDocumentationMetadata
} from "@repolens/shared-types";

const MAX_ARCHITECTURE_MODULES_IN_PROMPT = 200;
const MAX_ARCHITECTURE_ENDPOINTS_IN_PROMPT = 200;

function formatPromptInput(value: object) {
  return JSON.stringify(value, null, 2);
}

function buildBoundedArchitectureMetadata(metadata: RepositoryArchitectureMetadata) {
  const boundedModules = metadata.modules.slice(0, MAX_ARCHITECTURE_MODULES_IN_PROMPT);
  const boundedApiEndpoints = metadata.apiEndpoints.slice(
    0,
    MAX_ARCHITECTURE_ENDPOINTS_IN_PROMPT
  );

  return {
    ...metadata,
    modules: boundedModules,
    apiEndpoints: boundedApiEndpoints,
    omittedModuleCount: Math.max(0, metadata.modules.length - boundedModules.length),
    omittedApiEndpointCount: Math.max(
      0,
      metadata.apiEndpoints.length - boundedApiEndpoints.length
    )
  };
}

export function createProjectOverviewPromptTemplate(
  metadata: RepositoryDocumentationMetadata
): DocumentationPromptTemplate {
  return {
    key: "project_overview",
    systemPrompt:
      "You are a senior software engineer writing concise repository documentation based on structured analysis metadata.",
    userPrompt: [
      "Generate a project overview with these sections:",
      "1) Repository Snapshot",
      "2) Detected Technology Stack",
      "3) Analysis Signals and Scope",
      "Focus on factual statements that are directly supported by metadata.",
      "",
      "Structured metadata:",
      formatPromptInput(metadata)
    ].join("\n")
  };
}

export function createOnboardingGuidePromptTemplate(
  metadata: RepositoryDocumentationMetadata
): DocumentationPromptTemplate {
  return {
    key: "onboarding_guide",
    systemPrompt:
      "You are a staff engineer creating a first-day onboarding guide from structured repository analysis metadata.",
    userPrompt: [
      "Generate a practical onboarding guide with these sections:",
      "1) What this repository appears to do",
      "2) First things to inspect",
      "3) Suggested first contributions",
      "4) Common pitfalls inferred from the stack",
      "Avoid guessing setup commands that are not directly represented in metadata.",
      "",
      "Structured metadata:",
      formatPromptInput(metadata)
    ].join("\n")
  };
}

export function createArchitectureSummaryPromptTemplate(
  metadata: RepositoryDocumentationMetadata,
  architecture: RepositoryArchitectureMetadata
): DocumentationPromptTemplate {
  const boundedArchitecture = buildBoundedArchitectureMetadata(architecture);

  return {
    key: "architecture_summary",
    systemPrompt:
      "You are a software architect summarizing module structure and API surface from static analysis results.",
    userPrompt: [
      "Generate an architecture summary with these sections:",
      "1) Module Landscape",
      "2) API Surface",
      "3) Dependency Shape and Coupling Notes",
      "Prefer concrete file/module references from the input.",
      "",
      "Repository metadata:",
      formatPromptInput(metadata),
      "",
      "Architecture metadata:",
      formatPromptInput(boundedArchitecture)
    ].join("\n")
  };
}
