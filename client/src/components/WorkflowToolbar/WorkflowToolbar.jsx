import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Edit, RefreshCw } from 'lucide-react';

const WorkflowToolbar = ({
  title,
  onTitleChange,
  onSave,
  onEdit,
  isSaving,
  hasGraph,
}) => {
  return (
    <header className="h-16 border-b border-white/10 bg-dark-800/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-gray-100 font-bold text-sm focus:outline-none border-b border-transparent focus:border-white/20 px-1 py-0.5 rounded transition-all"
            placeholder="Workflow Name"
          />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {hasGraph && (
          <>
            <button
              onClick={onEdit}
              className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 font-semibold"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Graph
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="btn-primary text-xs flex items-center gap-1.5 py-2.5 px-4 font-semibold"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Workflow
                </>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default WorkflowToolbar;
