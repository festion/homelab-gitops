/**
 * Pipeline Type Definitions
 */

export interface PipelineNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  config: any;
  dependencies: string[];
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface PipelineConfig {
  name: string;
  description?: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  config?: {
    autoLayout?: boolean;
    showGrid?: boolean;
    showMiniMap?: boolean;
  };
}

export interface ValidationIssue {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  nodeId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  issues?: ValidationIssue[];
}