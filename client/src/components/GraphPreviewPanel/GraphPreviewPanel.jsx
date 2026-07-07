import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import WorkflowCanvas from '../WorkflowCanvas/WorkflowCanvas';
import { Eye } from 'lucide-react';

const GraphPreviewPanel = ({ nodes, edges }) => {
  const hasGraph = nodes.length > 0;

  return (
    <div className="flex-1 h-full relative flex flex-col bg-dark-900/60">
      {!hasGraph ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-dark-900/40">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 mb-4 animate-pulse">
            <Eye className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-gray-300">Graph Preview</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1 leading-normal">
            Use the left prompt builder to generate a runnable execution graph, then verify it here before saving!
          </p>
        </div>
      ) : (
        <div className="flex-1 h-full relative">
          <ReactFlowProvider>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={() => {}}
              onEdgesChange={() => {}}
              onConnect={() => {}}
              isEditable={false}
            />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
};

export default GraphPreviewPanel;
