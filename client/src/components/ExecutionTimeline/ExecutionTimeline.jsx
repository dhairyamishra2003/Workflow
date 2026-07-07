import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Layers, CheckCircle, AlertOctagon, ChevronDown, ChevronRight } from 'lucide-react';

const AGENT_CONFIGS = {
  planner: { label: 'Planner', color: '#fbbf24', icon: Layers, bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  execution: { label: 'Execution', color: '#6366f1', icon: Terminal, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  validation: { label: 'Validation', color: '#a855f7', icon: Shield, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  recovery: { label: 'Recovery', color: '#fbbf24', icon: RefreshCw, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  monitoring: { label: 'Monitoring', color: '#10b981', icon: Cpu, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const LogRow = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  const agent = AGENT_CONFIGS[log.agent] || { label: log.agent, color: '#9ca3af', icon: Terminal, bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  const Icon = agent.icon;

  const hasMeta = log.metadata && Object.keys(log.metadata).length > 0;

  return (
    <div className="flex flex-col border-b border-white/5 py-3 hover:bg-white/[0.01] transition-all">
      <div className="flex items-start justify-between gap-4 px-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold tracking-wider ${agent.bg} mt-0.5 shrink-0`}>
            <Icon className="w-3 h-3" />
            <span>{agent.label}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-xs text-gray-200 font-medium leading-normal break-words">{log.message}</p>
            <span className="text-[10px] text-gray-500 mt-0.5">{new Date(log.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasMeta && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all"
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
          {log.level === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {log.level === 'error' && <AlertOctagon className="w-4 h-4 text-red-400" />}
        </div>
      </div>

      {expanded && hasMeta && (
        <div className="mt-2.5 mx-4 p-3 rounded-xl bg-dark-900 border border-white/5 font-mono text-[10px] text-gray-400 overflow-x-auto">
          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const ExecutionTimeline = ({ timeline }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [timeline]);

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-800/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary-400" />
          Execution Timeline Log
        </h3>
        <span className="text-[10px] bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Live Events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {timeline.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <Terminal className="w-10 h-10 text-gray-600 mb-3 animate-pulse" />
            <p className="text-xs">Waiting for execution to start...</p>
          </div>
        ) : (
          <div>
            {timeline.map((log) => (
              <LogRow key={log._id} log={log} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionTimeline;
