/**
 * Custom Edge Component for Pipeline Designer
 * Provides styled connections between nodes
 */

import React from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  Edge,
  MarkerType
} from 'reactflow';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const edgeStyle = {
    stroke: selected ? '#3b82f6' : data?.color || '#6b7280',
    strokeWidth: selected ? 3 : 2,
    opacity: data?.disabled ? 0.5 : 1,
    ...style,
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        interactionWidth={20}
      />
      
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              fontWeight: 600,
              backgroundColor: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              color: '#374151',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};