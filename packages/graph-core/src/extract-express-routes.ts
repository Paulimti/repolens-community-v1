import type {
  ExtractedApiEndpoint,
  ScannedRepositoryFile
} from "@repolens/shared-types";
import { Node, SyntaxKind, type CallExpression, type SourceFile } from "ts-morph";

import { createRepositorySourceParser } from "@repolens/parser-core";

const EXPRESS_METHOD_NAMES = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "all",
  "use"
]);

function normalizePath(value: string) {
  if (value.startsWith("/") || value.startsWith("*")) {
    return value;
  }

  return `/${value}`;
}

type CallArgument = ReturnType<CallExpression["getArguments"]>[number];

function getRoutePath(argument: CallArgument | undefined) {
  if (!argument) {
    return null;
  }

  if (Node.isStringLiteral(argument)) {
    return normalizePath(argument.getLiteralValue());
  }

  if (Node.isNoSubstitutionTemplateLiteral(argument)) {
    return normalizePath(argument.getLiteralText());
  }

  return null;
}

function getHandlerName(argument: CallArgument | undefined) {
  if (!argument) {
    return null;
  }

  if (Node.isIdentifier(argument)) {
    return argument.getText();
  }

  if (Node.isPropertyAccessExpression(argument)) {
    return argument.getText();
  }

  return null;
}

function collectExpressSymbols(sourceFile: SourceFile) {
  const expressObjectNames = new Set<string>();
  const routerFactoryNames = new Set<string>();

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    if (importDeclaration.getModuleSpecifierValue() !== "express") {
      continue;
    }

    const defaultImport = importDeclaration.getDefaultImport();
    const namespaceImport = importDeclaration.getNamespaceImport();

    if (defaultImport) {
      expressObjectNames.add(defaultImport.getText());
    }

    if (namespaceImport) {
      expressObjectNames.add(namespaceImport.getText());
    }

    for (const namedImport of importDeclaration.getNamedImports()) {
      if (namedImport.getName() !== "Router") {
        continue;
      }

      routerFactoryNames.add(namedImport.getAliasNode()?.getText() ?? "Router");
    }
  }

  return {
    expressObjectNames,
    routerFactoryNames
  };
}

function collectExpressInstanceNames(
  sourceFile: SourceFile,
  expressObjectNames: Set<string>,
  routerFactoryNames: Set<string>
) {
  const appInstanceNames = new Set<string>();
  const routerInstanceNames = new Set<string>();

  for (const variableDeclaration of sourceFile.getVariableDeclarations()) {
    const initializer = variableDeclaration.getInitializer();

    if (!initializer || !Node.isCallExpression(initializer)) {
      continue;
    }

    const expression = initializer.getExpression();
    const variableName = variableDeclaration.getName();

    if (
      Node.isIdentifier(expression) &&
      expressObjectNames.has(expression.getText())
    ) {
      appInstanceNames.add(variableName);
      continue;
    }

    if (
      Node.isIdentifier(expression) &&
      routerFactoryNames.has(expression.getText())
    ) {
      routerInstanceNames.add(variableName);
      continue;
    }

    if (
      Node.isPropertyAccessExpression(expression) &&
      expression.getName() === "Router" &&
      Node.isIdentifier(expression.getExpression()) &&
      expressObjectNames.has(expression.getExpression().getText())
    ) {
      routerInstanceNames.add(variableName);
    }
  }

  return {
    appInstanceNames,
    routerInstanceNames
  };
}

function readRouteCall(
  sourceFilePath: string,
  callExpression: CallExpression,
  appInstanceNames: Set<string>,
  routerInstanceNames: Set<string>
) {
  const expression = callExpression.getExpression();

  if (!Node.isPropertyAccessExpression(expression)) {
    return null;
  }

  const methodName = expression.getName();
  const methodKey = methodName.toLowerCase();

  if (!EXPRESS_METHOD_NAMES.has(methodKey)) {
    return null;
  }

  const receiver = expression.getExpression();
  let routePath: string | null = null;

  if (Node.isIdentifier(receiver)) {
    const receiverName = receiver.getText();

    if (
      !appInstanceNames.has(receiverName) &&
      !routerInstanceNames.has(receiverName)
    ) {
      return null;
    }

    routePath = getRoutePath(callExpression.getArguments()[0]);
  } else if (Node.isCallExpression(receiver)) {
    const receiverExpression = receiver.getExpression();

    if (
      !Node.isPropertyAccessExpression(receiverExpression) ||
      receiverExpression.getName() !== "route"
    ) {
      return null;
    }

    const routeOwner = receiverExpression.getExpression();

    if (!Node.isIdentifier(routeOwner)) {
      return null;
    }

    const routeOwnerName = routeOwner.getText();

    if (
      !appInstanceNames.has(routeOwnerName) &&
      !routerInstanceNames.has(routeOwnerName)
    ) {
      return null;
    }

    routePath = getRoutePath(receiver.getArguments()[0]);
  } else {
    return null;
  }

  if (!routePath) {
    return null;
  }

  const handlerArgument =
    callExpression.getArguments()[methodKey === "use" ? 1 : 1] ??
    callExpression.getArguments().at(-1);

  return {
    framework: "EXPRESS" as const,
    method: methodName.toUpperCase(),
    path: routePath,
    sourcePath: sourceFilePath,
    handlerName: getHandlerName(handlerArgument)
  };
}

export function extractExpressRoutes(
  rootPath: string,
  files: ScannedRepositoryFile[]
): ExtractedApiEndpoint[] {
  const parser = createRepositorySourceParser(rootPath, files);
  const routes = new Map<string, ExtractedApiEndpoint>();

  for (const source of parser.sourceFiles) {
    const sourceFile = parser.project.getSourceFileOrThrow(source.absolutePath);
    const { expressObjectNames, routerFactoryNames } =
      collectExpressSymbols(sourceFile);

    if (expressObjectNames.size === 0 && routerFactoryNames.size === 0) {
      continue;
    }

    const { appInstanceNames, routerInstanceNames } = collectExpressInstanceNames(
      sourceFile,
      expressObjectNames,
      routerFactoryNames
    );

    for (const callExpression of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression
    )) {
      const route = readRouteCall(
        source.path,
        callExpression,
        appInstanceNames,
        routerInstanceNames
      );

      if (!route) {
        continue;
      }

      const key = [route.method, route.path, route.sourcePath].join(":");

      if (!routes.has(key)) {
        routes.set(key, route);
      }
    }
  }

  return Array.from(routes.values()).sort((left, right) => {
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
