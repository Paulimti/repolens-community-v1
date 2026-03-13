import type { DependencyGraph } from "./graph.js";

export interface FileMetadata {
  path: string;
  directory: string;
  extension: string;
  size: number;
  lastModifiedMs: number;
}

export interface RepositoryScanResult {
  rootPath: string;
  files: FileMetadata[];
  ignoredPaths: string[];
}

export interface PackageDependencyMetadata {
  name?: string;
  version?: string;
  packageManager?: string;
  scripts: Record<string, string>;
  dependencies: string[];
  devDependencies: string[];
}

export interface StackDetectionResult {
  languages: string[];
  runtimes: string[];
  frameworks: string[];
  testing: string[];
  packageManagers: string[];
  metadataSources: string[];
}

export interface EndpointMetadata {
  id: string;
  framework: string;
  filePath: string;
  method: string;
  routePath: string;
  handlerName?: string;
}

export interface ModuleMetadata {
  id: string;
  name: string;
  filePath: string;
  directory: string;
  type: "unknown" | "component" | "service" | "route";
}

export interface SummarySection {
  title: string;
  bullets: string[];
}

export interface RepositoryAnalysisResult {
  repositoryRoot: string;
  scannedAt: string;
  scan: RepositoryScanResult;
  packageMetadata?: PackageDependencyMetadata;
  stack: StackDetectionResult;
  graph: DependencyGraph;
  modules: ModuleMetadata[];
  endpoints: EndpointMetadata[];
  summaries: {
    architecture?: SummarySection;
    requestFlow?: SummarySection;
    overview?: SummarySection;
    onboarding?: SummarySection;
  };
}
