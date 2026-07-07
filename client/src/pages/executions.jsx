import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import ExecutionTimeline from '../components/ExecutionTimeline/ExecutionTimeline';
import useExecutionStore from '../store/executionStore';
import { Play, Pause, XCircle, Clock, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const ExecutionsContent = () => {
  const {
    executions,
    currentExecution,
    timeline,
    isLoading,
    fetchExecutions,
    fetchExecution,
    fetchTimeline,
    pauseExecution,
    resumeExecution,
    cancelExecution,
    subscribeToExecution,
    unsubscribeFromExecution,
  } = useExecutionStore();

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchExecutions();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchExecution(selectedId);
      fetchTimeline(selectedId);

      // Subscribe to real time updates via Socket.IO
      subscribeToExecution(selectedId);
      
      return () => {
        unsubscribeFromExecution(selectedId);
      };
    }
  }, [selectedId]);

  // Set first execution as selected by default
  useEffect(() => {
    if (executions.length > 0 && !selectedId) {
      setSelectedId(executions[0]._id);
    }
  }, [executions]);

  const getStatusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ';
    switch (status) {
      case 'COMPLETED':
        return <span className={base + 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}>Completed</span>;
      case 'FAILED':
        return <span className={base + 'bg-red-500/10 text-red-400 border-red-500/20'}>Failed</span>;
      case 'CANCELLED':
        return <span className={base + 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>Cancelled</span>;
      case 'RUNNING':
        return <span className={base + 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse'}>Running</span>;
      case 'PAUSED':
        return <span className={base + 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}>Paused</span>;
      case 'RETRYING':
        return <span className={base + 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'}>Retrying</span>;
      default:
        return <span className={base + 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>{status}</span>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-8rem)] overflow-hidden animate-fade-in">
      {/* Left panel: List of executions */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-hidden h-full">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-xl font-extrabold text-gray-200">Execution Runs</h2>
          <button
            onClick={() => fetchExecutions()}
            className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            title="Refresh Runs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {isLoading && executions.length === 0 ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-xl h-24 w-full animate-pulse bg-white/[0.01]" />
            ))
          ) : executions.length > 0 ? (
            executions.map((exec) => (
              <div
                key={exec._id}
                onClick={() => setSelectedId(exec._id)}
                className={`glass p-4 flex flex-col gap-3 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer ${
                  selectedId === exec._id ? 'border-primary-500/50 bg-white/[0.03]' : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-sm text-gray-200 truncate">{exec.workflow?.name || 'Workflow'}</span>
                  {getStatusBadge(exec.status)}
                </div>

                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exec.duration > 0 ? `${(exec.duration / 1000).toFixed(2)}s` : '--'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(exec.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-white/5 flex-1">
              <AlertCircle className="w-10 h-10 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-300">No Executions</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                You haven't run any workflow automations yet. Open a workflow and trigger a run!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Timeline & details */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        {currentExecution ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
            {/* Run Actions Header */}
            <div className="glass p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 rounded-2xl shrink-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Run Instance</span>
                <h3 className="text-base font-bold text-gray-200">{currentExecution.workflow?.name}</h3>
              </div>

              {/* Pause, Resume, Cancel Actions */}
              <div className="flex items-center gap-2">
                {currentExecution.status === 'RUNNING' && (
                  <button
                    onClick={() => pauseExecution(currentExecution._id)}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 font-semibold"
                  >
                    <Pause className="w-3.5 h-3.5 text-yellow-400" />
                    Pause
                  </button>
                )}
                {currentExecution.status === 'PAUSED' && (
                  <button
                    onClick={() => resumeExecution(currentExecution._id)}
                    className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 text-white" />
                    Resume
                  </button>
                )}
                {(currentExecution.status === 'RUNNING' || currentExecution.status === 'PAUSED' || currentExecution.status === 'RETRYING') && (
                  <button
                    onClick={() => cancelExecution(currentExecution._id)}
                    className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 font-semibold hover:!border-danger-500/30 hover:!text-danger-400"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden h-full">
              <ExecutionTimeline timeline={timeline} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 text-gray-600 mb-4 animate-pulse-glow" />
            <h3 className="font-semibold text-gray-300">Detailed Observability Console</h3>
            <p className="text-xs text-gray-500 max-w-xs mt-1 leading-normal">
              Select any execution run from the left panel to examine structured logs, node-level inputs/outputs, and recovery metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Executions() {
  return (
    <ProtectedRoute>
      <ExecutionsContent />
    </ProtectedRoute>
  );
}
