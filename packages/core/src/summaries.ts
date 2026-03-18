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
