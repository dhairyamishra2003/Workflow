import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Play, Cpu, GitBranch } from 'lucide-react';

const BaseNode = ({ icon: Icon, title, children, statusColor, selected }) => {
  return (
    <div
      className={`relative min-w-[200px] max-w-[280px] glass rounded-xl border transition-all duration-300 ${
        selected ? 'border-primary-500 shadow-lg shadow-primary-500/10 scale-105' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-xl" style={{ backgroundColor: statusColor }} />
      <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5 bg-white/[0.02] rounded-t-xl">
        <div className="p-1 rounded bg-white/5 text-gray-200">
          <Icon className="w-4 h-4" style={{ color: statusColor }} />
        </div>
        <span className="font-semibold text-sm text-gray-200 truncate">{title}</span>
      </div>
      <div className="p-3 text-xs text-gray-400 font-medium select-none">{children}</div>
    </div>
  );
};

const TriggerNode = ({ data, selected }) => {
  const label = data.label || 'Trigger';
  const type = data.nodeType || 'manual';
  return (
    <div className="relative">
      <BaseNode icon={Zap} title={label} statusColor="#fbbf24" selected={selected}>
        <div className="flex flex-col gap-1">
          <span className="text-gray-300 font-semibold uppercase text-[10px] tracking-wider">Trigger Type</span>
          <span className="text-gray-400 capitalize">{type}</span>
          {data.config?.description && (
            <span className="text-gray-500 truncate mt-1 italic">"{data.config.description}"</span>
          )}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-yellow-400 !border-2 !border-dark-900" />
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  const label = data.label || 'Action';
  const type = data.nodeType || 'sendEmail';
  const displayDetails = () => {
    switch (type) {
      case 'sendEmail':
        return `To: ${data.config?.to || '(not set)'}`;
      case 'postSlack':
        return `Chan: ${data.config?.channel || '(not set)'}`;
      case 'postDiscord':
        return `Chan: ${data.config?.channel || '(not set)'}`;
      case 'appendSheet':
        return `Sheet: ${data.config?.spreadsheetId ? 'Set' : '(not set)'}`;
      default:
        return 'Ready to execute';
    }
  };
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-indigo-400 !border-2 !border-dark-900" />
      <BaseNode icon={Play} title={label} statusColor="#6366f1" selected={selected}>
        <div className="flex flex-col gap-1">
          <span className="text-gray-300 font-semibold uppercase text-[10px] tracking-wider">Action</span>
          <span className="text-gray-400 truncate">{type}</span>
          <span className="text-gray-500 text-[10px] truncate mt-1">{displayDetails()}</span>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-indigo-400 !border-2 !border-dark-900" />
    </div>
  );
};

const AINode = ({ data, selected }) => {
  const label = data.label || 'AI Node';
  const type = data.nodeType || 'aiProcess';
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-400 !border-2 !border-dark-900" />
      <BaseNode icon={Cpu} title={label} statusColor="#a855f7" selected={selected}>
        <div className="flex flex-col gap-1">
          <span className="text-gray-300 font-semibold uppercase text-[10px] tracking-wider">AI Model Agent</span>
          <span className="text-gray-400 capitalize">{type.replace('ai', '')}</span>
          {data.config?.prompt && (
            <span className="text-gray-500 truncate mt-1 italic">"{data.config.prompt}"</span>
          )}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-400 !border-2 !border-dark-900" />
    </div>
  );
};

const LogicNode = ({ data, selected }) => {
  const label = data.label || 'Logic';
  const type = data.nodeType || 'condition';
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-emerald-400 !border-2 !border-dark-900" />
      <BaseNode icon={GitBranch} title={label} statusColor="#10b981" selected={selected}>
        <div className="flex flex-col gap-1">
          <span className="text-gray-300 font-semibold uppercase text-[10px] tracking-wider">Logic Gate</span>
          <span className="text-gray-400 capitalize">{type}</span>
          {type === 'condition' && (
            <span className="text-gray-500 text-[10px] truncate mt-1">
              {data.config?.field || 'field'} {data.config?.operator || '=='} {data.config?.value || 'val'}
            </span>
          )}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-emerald-400 !border-2 !border-dark-900" />
    </div>
  );
};

export const nodeTypes = {
  trigger: memo(TriggerNode),
  action: memo(ActionNode),
  ai: memo(AINode),
  logic: memo(LogicNode),
};
