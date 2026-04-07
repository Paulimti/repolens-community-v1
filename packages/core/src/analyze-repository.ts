import type {
  DetectedStackEntry,
  GeneratedDocumentationDraft,
  RepositoryDocumentationMetadata,
  ScannedRepositoryFile
} from "@repolens/shared-types";
import { detectStack, scanRepositoryFiles } from "@repolens/parser-core";
import {
  buildModuleDependencies,
  detectLogicalModules,
  extractExpressRoutes,
  extractNextjsRouteHandlers
} from "@repolens/graph-core";

import { generateArchitectureSummary } from "./generate-architecture-summary.js";
import { generateOnboardingGuide } from "./generate-onboarding-guide.js";
import { generateProjectOverview } from "./generate-project-overview.js";

type AnalyzeRepositoryInput = {
  rootPath: string;
  repositoryFullName: string;
  repositoryUrl: string;
  defaultBranch: string | null;
};

export type RepositoryAnalysisSnapshot = {
  detectedModules: ReturnType<typeof detectLogicalModules>;
  apiEndpoints: ReturnType<typeof extractExpressRoutes>;
  moduleDependencies: ReturnType<typeof buildModuleDependencies>;
  documentationMetadata: RepositoryDocumentationMetadata;
  generatedDocs: GeneratedDocumentationDraft[];
};

type AnalyzeRepositorySnapshotInput = AnalyzeRepositoryInput & {
  scannedFiles: ScannedRepositoryFile[];
  detectedStack: DetectedStackEntry[];
};

export type RepositoryAnalysisResult = RepositoryAnalysisSnapshot & {
  scannedFiles: ScannedRepositoryFile[];
  detectedStack: DetectedStackEntry[];
};

export function analyzeRepositorySnapshot({
  rootPath,
  repositoryFullName,
  repositoryUrl,
  defaultBranch,
  scannedFiles,
  detectedStack
}: AnalyzeRepositorySnapshotInput): RepositoryAnalysisSnapshot {
  const detectedModules = detectLogicalModules(rootPath, scannedFiles);
  const expressRoutes = extractExpressRoutes(rootPath, scannedFiles);
  const nextjsRouteHandlers = extractNextjsRouteHandlers(rootPath, scannedFiles);
  const apiEndpoints = [...expressRoutes, ...nextjsRouteHandlers];
  const moduleDependencies = buildModuleDependencies(detectedModules);

  const documentationMetadata: RepositoryDocumentationMetadata = {
    repositoryFullName,
    repositoryUrl,
    defaultBranch,
    stack: detectedStack,
    scannedFileCount: scannedFiles.length,
    moduleCount: detectedModules.length,
    moduleDependencyCount: moduleDependencies.length,
    apiEndpointCount: apiEndpoints.length
  };

  const generatedDocs = [
    generateProjectOverview(documentationMetadata),
    generateOnboardingGuide(documentationMetadata),
    generateArchitectureSummary(
      documentationMetadata,
      detectedModules,
      apiEndpoints,
      moduleDependencies
    )
  ];

  return {
    detectedModules,
    apiEndpoints,
    moduleDependencies,
    documentationMetadata,
    generatedDocs
  };
}

export async function analyzeRepository(
  input: AnalyzeRepositoryInput
): Promise<RepositoryAnalysisResult> {
  const scannedFiles = await scanRepositoryFiles(input.rootPath);
  const detectedStack = await detectStack(input.rootPath, scannedFiles);
  const snapshot = analyzeRepositorySnapshot({
    ...input,
    scannedFiles,
    detectedStack
  });

  return {
    scannedFiles,
    detectedStack,
    ...snapshot
  };
}
