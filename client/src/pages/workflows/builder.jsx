import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import PromptInputPanel from '../../components/PromptInputPanel/PromptInputPanel';
import GraphPreviewPanel from '../../components/GraphPreviewPanel/GraphPreviewPanel';
import WorkflowToolbar from '../../components/WorkflowToolbar/WorkflowToolbar';
import useWorkflowStore from '../../store/workflowStore';
import api from '../../lib/axios';

const WorkflowBuilderContent = () => {
  const router = useRouter();
  const { createWorkflow } = useWorkflowStore();

  const [title, setTitle] = useState('My AI Generated Workflow');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (promptText) => {
    setIsGenerating(true);
    setError(null);
    try {
      const { data } = await api.post('/workflows/generate', { prompt: promptText });
      const graph = data.data;

      // Ensure nodes have correct React Flow coordinates and configs
      const formattedNodes = (graph.nodes || []).map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position || { x: 250, y: 100 },
        data: {
          label: node.data?.label || node.id,
          nodeType: node.data?.nodeType || 'manual',
          config: node.data?.config || {},
        },
      }));

      setNodes(formattedNodes);
      setEdges(graph.edges || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Generation failed. Check your API keys.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (nodes.length === 0) return;
    setIsSaving(true);
    try {
      const flow = await createWorkflow({
        name: title,
        description: 'Generated from AI Prompt',
        status: 'draft',
        nodes,
        edges,
      });
      router.push(`/workflows/${flow._id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDirectly = async () => {
    if (nodes.length === 0) return;
    handleSave(); // Saves first and redirects directly to editor
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-dark-900">
      <WorkflowToolbar
        title={title}
        onTitleChange={setTitle}
        onSave={handleSave}
        onEdit={handleEditDirectly}
        isSaving={isSaving}
        hasGraph={nodes.length > 0}
      />

      <div className="flex-1 flex overflow-hidden">
        <PromptInputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />

        <div className="flex-1 h-full relative">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-50 p-3.5 bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-[10px] uppercase font-bold tracking-wider hover:underline">
                Dismiss
              </button>
            </div>
          )}
          <GraphPreviewPanel nodes={nodes} edges={edges} />
        </div>
      </div>
    </div>
  );
};

export default function WorkflowBuilder() {
  return (
    <ProtectedRoute>
      <WorkflowBuilderContent />
    </ProtectedRoute>
  );
}

WorkflowBuilder.getLayout = function getLayout(page) {
  return page;
};
