import type { FileMetadata } from "./analysis.js";

export interface SourceImport {
  kind: "import" | "require";
  specifier: string;
  isTypeOnly: boolean;
}

export interface SourceExport {
  kind: "named" | "default" | "reexport";
  name: string;
}

export interface SourceSymbol {
  name: string;
  kind: string;
  isDefault: boolean;
  isExported: boolean;
}

export interface ParsedSourceFile {
  file: FileMetadata;
  imports: SourceImport[];
  exports: SourceExport[];
  symbols: SourceSymbol[];
}

export interface ParserContext {
  rootPath: string;
}

export interface SourceAnalyzer {
  supports(file: FileMetadata): boolean;
  analyze(file: FileMetadata, context: ParserContext): Promise<ParsedSourceFile | null>;
}
