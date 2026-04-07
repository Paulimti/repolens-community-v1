import type {
  ExtractedApiEndpoint,
  ScannedRepositoryFile
} from "@repolens/shared-types";
import { posix } from "node:path";

import { createRepositorySourceParser } from "@repolens/parser-core";

const NEXT_ROUTE_METHODS = new Set([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS"
]);

function isNextAppRouteFile(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  const extension = posix.extname(normalized);

  if (!extension) {
    return false;
  }

  const withoutExtension = normalized.slice(0, -extension.length);

  return withoutExtension.endsWith("/route");
}

function normalizeDynamicSegment(segment: string) {
  if (/^\[\[\.\.\.[^/\]]+\]\]$/.test(segment)) {
    const name = segment.slice(5, -2);
    return `:${name}*`;
  }

  if (/^\[\.\.\.[^/\]]+\]$/.test(segment)) {
    const name = segment.slice(4, -1);
    return `:${name}*`;
  }

  if (/^\[[^/\]]+\]$/.test(segment)) {
    const name = segment.slice(1, -1);
    return `:${name}`;
  }

  return segment;
}

function toNextRoutePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const appIndex = parts.lastIndexOf("app");

  if (appIndex === -1) {
    return null;
  }

  const appPathParts = parts.slice(appIndex + 1, -1);
  const normalizedParts = appPathParts
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .map(normalizeDynamicSegment);

  if (normalizedParts.length === 0) {
    return "/";
  }

  return `/${normalizedParts.join("/")}`;
}

export function extractNextjsRouteHandlers(
  rootPath: string,
  files: ScannedRepositoryFile[]
): ExtractedApiEndpoint[] {
  const parser = createRepositorySourceParser(rootPath, files);
  const endpoints = new Map<string, ExtractedApiEndpoint>();

  for (const source of parser.sourceFiles) {
    if (!isNextAppRouteFile(source.path)) {
      continue;
    }

    const routePath = toNextRoutePath(source.path);

    if (!routePath) {
      continue;
    }

    const sourceFile = parser.project.getSourceFileOrThrow(source.absolutePath);

    for (const [exportName] of sourceFile.getExportedDeclarations()) {
      const method = exportName.toUpperCase();

      if (!NEXT_ROUTE_METHODS.has(method)) {
        continue;
      }

      const endpoint: ExtractedApiEndpoint = {
        framework: "NEXTJS",
        method,
        path: routePath,
        sourcePath: source.path,
        handlerName: exportName
      };
      const key = [endpoint.framework, method, routePath, source.path].join(":");

      if (!endpoints.has(key)) {
        endpoints.set(key, endpoint);
      }
    }
  }

  return Array.from(endpoints.values()).sort((left, right) => {
    const pathSort = left.path.localeCompare(right.path);

    if (pathSort !== 0) {
      return pathSort;
    }

    const methodSort = left.method.localeCompare(right.method);

    if (methodSort !== 0) {
      return methodSort;
    }

    return left.sourcePath.localeCompare(right.sourcePath);
  });
}
