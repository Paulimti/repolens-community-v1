import type { RepositoryAnalysisResult } from "@repolens/shared-types";

import { type AnalysisPipelineOutput, analyzeLocalRepositoryPipeline } from "./pipeline.js";
import {
  generateArchitectureSummary,
  generateOnboardingGuide,
  generateRepositoryOverviewSummary,
  generateRequestFlowSummary
} from "./summaries.js";

export function assembleRepositoryAnalysisResult(
  pipelineOutput: AnalysisPipelineOutput
): RepositoryAnalysisResult {
  return {
    repositoryRoot: pipelineOutput.repositoryRoot,
    scannedAt: new Date().toISOString(),
    scan: pipelineOutput.scan,
    ...(pipelineOutput.packageMetadata
      ? { packageMetadata: pipelineOutput.packageMetadata }
      : {}),
    stack: pipelineOutput.stack,
    graph: pipelineOutput.graph,
    modules: pipelineOutput.modules,
    endpoints: pipelineOutput.endpoints,
    summaries: {
      architecture: generateArchitectureSummary({
        stack: pipelineOutput.stack,
        modules: pipelineOutput.modules,
        endpoints: pipelineOutput.endpoints
      }),
      requestFlow: generateRequestFlowSummary(
        pipelineOutput.modules,
        pipelineOutput.endpoints
      ),
      overview: generateRepositoryOverviewSummary(
        pipelineOutput.repositoryRoot,
        pipelineOutput.modules,
        pipelineOutput.stack
      ),
      onboarding: generateOnboardingGuide(
        pipelineOutput.modules,
        pipelineOutput.endpoints
      )
    }
  };
}

export async function analyzeLocalRepository(
  repositoryRoot: string
): Promise<RepositoryAnalysisResult> {
  const pipelineOutput = await analyzeLocalRepositoryPipeline(repositoryRoot);

  return assembleRepositoryAnalysisResult(pipelineOutput);
}
