export type GraphNodeType =
  | "file"
  | "module"
  | "package"
  | "service"
  | "component"
  | "route";

export type GraphEdgeType =
  | "imports"
  | "exports"
  | "depends_on"
  | "calls"
  | "serves";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  filePath?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
