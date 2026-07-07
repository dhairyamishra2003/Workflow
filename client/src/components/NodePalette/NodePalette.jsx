import React, { useState } from 'react';
import { Zap, Play, Cpu, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';

const PaletteCategory = ({ title, icon: Icon, color, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-all"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {isOpen && <div className="p-3 flex flex-col gap-2 bg-dark-900/40">{children}</div>}
    </div>
  );
};

const NodePaletteItem = ({ label, type, nodeType, icon: Icon, color }) => {
  const onDragStart = (event) => {
    const data = { type, nodeType, label };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/10 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing transition-all duration-200"
    >
      <div className="p-1 rounded bg-white/5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-xs text-gray-300 font-medium select-none">{label}</span>
    </div>
  );
};

const NodePalette = () => {
  return (
    <aside className="w-64 border-r border-white/10 bg-dark-800/80 backdrop-blur-xl flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-white/10 bg-white/[0.01]">
        <h3 className="font-semibold text-sm text-gray-200">Nodes Palette</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Drag nodes onto the canvas to construct your workflow</p>
      </div>

      <PaletteCategory title="Triggers" icon={Zap} color="#fbbf24">
        <NodePaletteItem label="Manual Trigger" type="trigger" nodeType="manual" icon={Zap} color="#fbbf24" />
        <NodePaletteItem label="Schedule Trigger" type="trigger" nodeType="schedule" icon={Zap} color="#fbbf24" />
        <NodePaletteItem label="Webhook Trigger" type="trigger" nodeType="webhook" icon={Zap} color="#fbbf24" />
      </PaletteCategory>

      <PaletteCategory title="Actions" icon={Play} color="#6366f1">
        <NodePaletteItem label="Send Email" type="action" nodeType="sendEmail" icon={Play} color="#6366f1" />
        <NodePaletteItem label="Post to Slack" type="action" nodeType="postSlack" icon={Play} color="#6366f1" />
        <NodePaletteItem label="Post to Discord" type="action" nodeType="postDiscord" icon={Play} color="#6366f1" />
        <NodePaletteItem label="Append to Sheet" type="action" nodeType="appendSheet" icon={Play} color="#6366f1" />
        <NodePaletteItem label="HTTP Request" type="action" nodeType="httpRequest" icon={Play} color="#6366f1" />
      </PaletteCategory>

      <PaletteCategory title="AI Agents" icon={Cpu} color="#a855f7">
        <NodePaletteItem label="AI Process" type="ai" nodeType="aiProcess" icon={Cpu} color="#a855f7" />
        <NodePaletteItem label="AI Classify" type="ai" nodeType="aiClassify" icon={Cpu} color="#a855f7" />
        <NodePaletteItem label="AI Summarize" type="ai" nodeType="aiSummarize" icon={Cpu} color="#a855f7" />
        <NodePaletteItem label="AI Generate" type="ai" nodeType="aiGenerate" icon={Cpu} color="#a855f7" />
      </PaletteCategory>

      <PaletteCategory title="Logic Gates" icon={GitBranch} color="#10b981">
        <NodePaletteItem label="Condition Gate" type="logic" nodeType="condition" icon={GitBranch} color="#10b981" />
        <NodePaletteItem label="Loop Gate" type="logic" nodeType="loop" icon={GitBranch} color="#10b981" />
        <NodePaletteItem label="Delay Gate" type="logic" nodeType="delay" icon={GitBranch} color="#10b981" />
        <NodePaletteItem label="Transform Data" type="logic" nodeType="transform" icon={GitBranch} color="#10b981" />
      </PaletteCategory>
    </aside>
  );
};

export default NodePalette;
