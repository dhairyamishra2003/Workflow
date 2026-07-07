import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './CustomNodes';

const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  isEditable = true,
  onAddNode,
}) => {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!isEditable) return;

      const typeData = event.dataTransfer.getData('application/reactflow');
      if (!typeData) return;

      const { type, nodeType, label } = JSON.parse(typeData);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${nodeType}-${Date.now()}`,
        type,
        position,
        data: {
          label,
          nodeType,
          config: {},
        },
      };

      if (onAddNode) {
        onAddNode(newNode);
      }
    },
    [screenToFlowPosition, isEditable, onAddNode]
  );

  return (
    <div className="w-full h-full flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={isEditable ? onNodesChange : undefined}
        onEdgesChange={isEditable ? onEdgesChange : undefined}
        onConnect={isEditable ? onConnect : undefined}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="react-flow-dark-console"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Controls className="!bg-dark-800 !border-white/10 !text-gray-200 fill-gray-200" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger':
                return '#fbbf24';
              case 'action':
                return '#6366f1';
              case 'ai':
                return '#a855f7';
              case 'logic':
                return '#10b981';
              default:
                return '#9ca3af';
            }
          }}
          className="!bg-dark-800 !border-white/10"
          maskColor="rgba(10, 11, 15, 0.7)"
        />
        <Background color="#2d2e3a" gap={16} size={1} variant="dots" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
