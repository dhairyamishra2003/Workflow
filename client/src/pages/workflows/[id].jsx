import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ReactFlowProvider } from '@xyflow/react';
import { ArrowLeft, Save, Copy, Trash2, Play } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import NodePalette from '../../components/NodePalette/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import useWorkflowStore from '../../store/workflowStore';
import useExecutionStore from '../../store/executionStore';

const WorkflowEditorContent = () => {
  const router = useRouter();
  const { id } = router.query;
  const { executeWorkflow } = useExecutionStore();

  const {
    currentWorkflow,
    nodes,
    edges,
    isLoading,
    error,
    fetchWorkflow,
    updateWorkflow,
    duplicateWorkflow,
    deleteWorkflow,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useWorkflowStore();

  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState('draft');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkflow(id)
        .then((data) => {
          setWorkflowName(data.name);
          setWorkflowStatus(data.status);
        })
        .catch(() => {});
    }
  }, [id]);

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleUpdateNode = useCallback(
    (updatedNode) => {
      const updatedNodes = nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
      setNodes(updatedNodes);
      setSelectedNode(updatedNode);
    },
    [nodes, setNodes]
  );

  const handleAddNode = useCallback(
    (newNode) => {
      setNodes([...nodes, newNode]);
    },
    [nodes, setNodes]
  );

  const handleSave = async () => {
    try {
      await updateWorkflow(id, {
        name: workflowName,
        status: workflowStatus,
        nodes,
        edges,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await duplicateWorkflow(id);
      router.push(`/workflows/${dup._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecute = async () => {
    try {
      // Auto save first before executing to ensure recent snapshot is run
      await updateWorkflow(id, {
        name: workflowName,
        status: workflowStatus,
        nodes,
        edges,
      });
      await executeWorkflow(id);
      router.push('/executions');
    } catch (err) {
      console.error('Execution trigger failed:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await deleteWorkflow(id);
        router.push('/dashboard');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading && !currentWorkflow) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-dark-900">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-dark-900 gap-4">
        <p className="text-danger-400 font-medium">Failed to load workflow: {error}</p>
        <Link href="/dashboard" className="btn-primary py-2 px-4 text-xs font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-dark-900">
      {/* ─── Top Toolbar ──────────────────────────────────────────────── */}
      <header className="h-16 border-b border-white/10 bg-dark-800/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent text-gray-100 font-bold text-sm focus:outline-none border-b border-transparent focus:border-white/20 px-1 py-0.5 rounded transition-all"
              placeholder="Untitled Workflow"
            />
            <select
              value={workflowStatus}
              onChange={(e) => setWorkflowStatus(e.target.value)}
              className="bg-dark-700 text-xs font-semibold border border-white/10 rounded px-2 py-0.5 text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSave}
            className={`btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 font-semibold ${
              saveSuccess ? '!border-emerald-500/50 !text-emerald-400' : ''
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saveSuccess ? 'Saved!' : 'Save'}
          </button>
          <button onClick={handleDuplicate} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 font-semibold">
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            onClick={handleExecute}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 font-semibold hover:!border-yellow-500/30 hover:!text-yellow-400"
          >
            <Play className="w-3.5 h-3.5 text-yellow-500" />
            Execute
          </button>
          <button onClick={handleDelete} className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 font-semibold hover:!border-danger-500/30 hover:!text-danger-400">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </header>

      {/* ─── Main Editor Layout ───────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        <NodePalette />

        <div className="flex-1 h-full relative bg-dark-900/60">
          <ReactFlowProvider>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onAddNode={handleAddNode}
              isEditable={true}
            />
          </ReactFlowProvider>
        </div>

        {selectedNode && (
          <NodeConfigPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default function WorkflowEditor() {
  return (
    <ProtectedRoute>
      <WorkflowEditorContent />
    </ProtectedRoute>
  );
}
// Disable layout shell for this fullscreen page
WorkflowEditor.getLayout = function getLayout(page) {
  return page;
};
