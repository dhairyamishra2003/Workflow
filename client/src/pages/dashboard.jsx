import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GitBranch, Activity, Play, CheckCircle, Wand2, Plus, ArrowRight } from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import useWorkflowStore from '../store/workflowStore';
import useAuthStore from '../store/authStore';

const DashboardContent = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { metrics, isLoading, fetchDashboard, createWorkflow } = useWorkflowStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateNewManual = async () => {
    try {
      const w = await createWorkflow({
        name: 'Untitled Workflow',
        description: 'New workflow created manually',
        nodes: [
          {
            id: 'trigger-manual-1',
            type: 'trigger',
            position: { x: 250, y: 100 },
            data: { label: 'Manual Trigger', nodeType: 'manual', config: {} },
          },
        ],
        edges: [],
      });
      router.push(`/workflows/${w._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const gridMetrics = [
    { label: 'Total Workflows', value: metrics.totalWorkflows, icon: GitBranch, color: '#6366f1' },
    { label: 'Active Workflows', value: metrics.activeWorkflows, icon: Activity, color: '#10b981' },
    { label: 'Executions Run', value: metrics.totalExecutions, icon: Play, color: '#fbbf24' },
    { label: 'Success Rate', value: metrics.successRate, icon: CheckCircle, color: '#10b981', suffix: '%' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* ─── Header Section ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-100 flex items-center gap-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here is your automated environment console overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/workflows/builder">
            <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm font-medium">
              <Wand2 className="w-4 h-4 text-primary-400" />
              AI Generator
            </button>
          </Link>
          <button
            onClick={handleCreateNewManual}
            className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* ─── Metrics Grid ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-24 w-full animate-pulse bg-white/[0.01]" />
          ))}
        </div>
      ) : (
        <MetricGrid metrics={gridMetrics} />
      )}

      {/* ─── Bottom Panels ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Workflows */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-200">Recent Workflows</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-xl h-16 w-full animate-pulse bg-white/[0.01]" />
              ))}
            </div>
          ) : metrics.recentWorkflows?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {metrics.recentWorkflows.map((workflow) => (
                <div
                  key={workflow._id}
                  onClick={() => router.push(`/workflows/${workflow._id}`)}
                  className="glass p-4 flex items-center justify-between hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm text-gray-200">{workflow.name}</span>
                    <span className="text-[10px] text-gray-500">
                      Modified {new Date(workflow.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        workflow.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}
                    >
                      {workflow.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-white/5">
              <GitBranch className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="font-semibold text-gray-300">No workflows found</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Construct your very first visual orchestration graph manually or generate one with AI!
              </p>
              <button
                onClick={handleCreateNewManual}
                className="btn-primary mt-4 py-2 px-4 text-xs font-semibold"
              >
                Create Manually
              </button>
            </div>
          )}
        </div>

        {/* AI Agent Feed */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-200">AI Agent Activity</h2>
          <div className="glass-card flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed border-2 border-white/5">
            <Activity className="w-10 h-10 text-gray-600 mb-3 animate-pulse-glow" />
            <h3 className="font-semibold text-gray-300">Quiet Console</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
              No active agent chain executions. Run a workflow to stream AI actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
