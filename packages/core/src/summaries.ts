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
