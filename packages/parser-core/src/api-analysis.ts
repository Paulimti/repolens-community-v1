import type { EndpointMetadata } from "@repolens/shared-types";
import { SyntaxKind, type SourceFile } from "ts-morph";

const EXPRESS_METHODS = new Set(["get", "post", "put", "patch", "delete"]);

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
