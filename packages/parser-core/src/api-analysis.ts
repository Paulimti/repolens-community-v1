import type { EndpointMetadata } from "@repolens/shared-types";
import { SyntaxKind, type SourceFile } from "ts-morph";

const EXPRESS_METHODS = new Set(["get", "post", "put", "patch", "delete"]);
const NEXTJS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export function extractExpressRoutes(
  sourceFile: SourceFile,
  filePath: string
): EndpointMetadata[] {
  return sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).flatMap((call) => {
    const expression = call.getExpression();

    if (!expression || !expression.getText().includes(".")) {
      return [];
    }

    const expressionText = expression.getText();
    const method = expressionText.split(".").at(-1)?.toLowerCase();

    if (!method || !EXPRESS_METHODS.has(method)) {
      return [];
    }

    const [firstArgument, secondArgument] = call.getArguments();
    const routePath = firstArgument?.asKind(SyntaxKind.StringLiteral)?.getLiteralText();

    if (!routePath) {
      return [];
    }

    const handlerName = secondArgument?.getText().split(".").at(-1);

    return [
      {
        id: `express:${filePath}:${method}:${routePath}`,
        framework: "express",
        filePath,
        method: method.toUpperCase(),
        routePath,
        ...(handlerName ? { handlerName } : {})
      }
    ];
  });
}

function toNextJsRoutePath(filePath: string): string {
  return (
    "/" +
    filePath
      .replace(/^app\//, "")
      .replace(/\/route\.(ts|tsx|js|jsx)$/, "")
      .replace(/\/page\.(ts|tsx|js|jsx)$/, "")
  );
}

export function extractNextJsRouteHandlers(
  sourceFile: SourceFile,
  filePath: string
): EndpointMetadata[] {
  if (!/^app\/.+\/route\.(ts|tsx|js|jsx)$/.test(filePath)) {
    return [];
  }

  const routePath = toNextJsRoutePath(filePath);

  return sourceFile
    .getFunctions()
    .filter((fn) => {
      const name = fn.getName();

      return Boolean(name && NEXTJS_METHODS.includes(name));
    })
    .map((fn) => {
      const handlerName = fn.getName() ?? "GET";

      return {
        id: `nextjs:${filePath}:${handlerName}:${routePath}`,
        framework: "nextjs",
        filePath,
        method: handlerName,
        routePath,
        handlerName
      };
    });
}

export function normalizeEndpointMetadata(
  endpoints: EndpointMetadata[]
): EndpointMetadata[] {
  const normalizedMap = new Map<string, EndpointMetadata>();

  for (const endpoint of endpoints) {
    const normalizedPath = endpoint.routePath.startsWith("/")
      ? endpoint.routePath
      : `/${endpoint.routePath}`;
    const normalizedMethod = endpoint.method.toUpperCase();
    const normalizedEndpoint: EndpointMetadata = {
      ...endpoint,
      routePath: normalizedPath,
      method: normalizedMethod,
      id: `${endpoint.framework}:${endpoint.filePath}:${normalizedMethod}:${normalizedPath}`
    };

    normalizedMap.set(normalizedEndpoint.id, normalizedEndpoint);
  }

  return Array.from(normalizedMap.values()).sort((left, right) =>
    left.id.localeCompare(right.id)
  );
}
