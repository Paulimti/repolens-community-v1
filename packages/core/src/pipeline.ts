import { createDependencyGraph } from "@repolens/graph-core";
import {
  createSourceProject,
  detectFrameworksFromProjectStructure,
  detectLogicalModules,
  detectStackFromPackageMetadata,
  extractExports,
  extractExpressRoutes,
  extractImports,
  extractNextJsRouteHandlers,
  extractSymbols,
  isSupportedSourceFile,
  loadSourceFile,
  normalizeEndpointMetadata,
  normalizeStackDetectionResult,
  parsePackageJson,
  scanRepository
} from "@repolens/parser-core";
import type {
  EndpointMetadata,
  PackageDependencyMetadata,
  ParsedSourceFile,
  RepositoryScanResult,
  StackDetectionResult
} from "@repolens/shared-types";

export interface AnalysisPipelineOutput {
  repositoryRoot: string;
  scan: RepositoryScanResult;
  packageMetadata: PackageDependencyMetadata | null;
  stack: StackDetectionResult;
  parsedFiles: ParsedSourceFile[];
  modules: ReturnType<typeof detectLogicalModules>;
  endpoints: EndpointMetadata[];
  graph: ReturnType<typeof createDependencyGraph>;
}

export async function analyzeLocalRepositoryPipeline(
  repositoryRoot: string
): Promise<AnalysisPipelineOutput> {
  const scan = await scanRepository(repositoryRoot);
  let packageMetadata: PackageDependencyMetadata | null = null;

  try {
    packageMetadata = await parsePackageJson(repositoryRoot);
  } catch {
    packageMetadata = null;
  }

  const packageStack = detectStackFromPackageMetadata(packageMetadata);
  const structureStack = detectFrameworksFromProjectStructure(scan.files);
  const stack = normalizeStackDetectionResult(packageStack, structureStack);
  const modules = detectLogicalModules(scan.files);
  const project = createSourceProject(repositoryRoot);
  const parsedFiles: ParsedSourceFile[] = [];
  const endpoints: EndpointMetadata[] = [];

  for (const file of scan.files) {
    if (!isSupportedSourceFile(file.path)) {
      continue;
    }

    const sourceFile = loadSourceFile(project, repositoryRoot, file.path);

    if (!sourceFile) {
      continue;
    }

    const imports = extractImports(sourceFile);
    const exports = extractExports(sourceFile);
    const symbols = extractSymbols(sourceFile);

    parsedFiles.push({
      file,
      imports,
      exports,
      symbols
    });

    endpoints.push(...extractExpressRoutes(sourceFile, file.path));
    endpoints.push(...extractNextJsRouteHandlers(sourceFile, file.path));
  }

  return {
    repositoryRoot: scan.rootPath,
    scan,
    packageMetadata,
    stack,
    parsedFiles,
    modules,
    endpoints: normalizeEndpointMetadata(endpoints),
    graph: createDependencyGraph(
      parsedFiles.map((parsedFile) => ({
        filePath: parsedFile.file.path,
        imports: parsedFile.imports
      }))
    )
  };
}
