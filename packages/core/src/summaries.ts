import type {
  EndpointMetadata,
  ModuleMetadata,
  StackDetectionResult,
  SummarySection
} from "@repolens/shared-types";

interface ArchitectureSummaryInput {
  stack: StackDetectionResult;
  modules: ModuleMetadata[];
  endpoints: EndpointMetadata[];
}

export function generateArchitectureSummary(
  input: ArchitectureSummaryInput
): SummarySection {
  return {
    title: "Architecture Summary",
    bullets: [
      `Detected frameworks: ${input.stack.frameworks.join(", ") || "none"}.`,
      `Detected runtimes: ${input.stack.runtimes.join(", ") || "none"}.`,
      `Logical modules discovered: ${input.modules.length}.`,
      `API endpoints discovered: ${input.endpoints.length}.`
    ]
  };
}

export function generateRequestFlowSummary(
  modules: ModuleMetadata[],
  endpoints: EndpointMetadata[]
): SummarySection {
  const routeModules = modules.filter((module) => module.type === "route").length;
  const serviceModules = modules.filter((module) => module.type === "service").length;

  return {
    title: "Request Flow Summary",
    bullets: [
      `Route-oriented modules detected: ${routeModules}.`,
      `Service-oriented modules detected: ${serviceModules}.`,
      `Normalized endpoints available for flow mapping: ${endpoints.length}.`
    ]
  };
}

export function generateRepositoryOverviewSummary(
  repositoryRoot: string,
  modules: ModuleMetadata[],
  stack: StackDetectionResult
): SummarySection {
  return {
    title: "Repository Overview",
    bullets: [
      `Repository root analyzed locally: ${repositoryRoot}.`,
      `Detected languages: ${stack.languages.join(", ") || "none"}.`,
      `Detected frameworks: ${stack.frameworks.join(", ") || "none"}.`,
      `Modules available for inspection: ${modules.length}.`
    ]
  };
}
