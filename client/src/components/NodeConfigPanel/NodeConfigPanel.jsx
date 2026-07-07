import React, { useState, useEffect } from 'react';
import { X, Settings, AlertTriangle } from 'lucide-react';

const NodeConfigPanel = ({ selectedNode, onUpdateNode, onClose }) => {
  const [name, setName] = useState('');
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.data?.label || '');
      setConfig(selectedNode.data?.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const nodeType = selectedNode.data?.nodeType;
  const type = selectedNode.type;

  const handleFieldChange = (field, value) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onUpdateNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        config: updatedConfig,
      },
    });
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    onUpdateNode({
      ...selectedNode,
      data: {
        ...selectedNode.data,
        label: val,
      },
    });
  };

  const renderFields = () => {
    switch (nodeType) {
      // ─── Actions ───────────────────────────────────────────────────
      case 'sendEmail':
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Recipient Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="recipient@example.com"
                value={config.to || ''}
                onChange={(e) => handleFieldChange('to', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Subject</label>
              <input
                type="text"
                className="input-field"
                placeholder="Email Subject"
                value={config.subject || ''}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Body</label>
              <textarea
                rows={4}
                className="input-field resize-none"
                placeholder="Email content supports dynamic variables like {{input}}..."
                value={config.body || ''}
                onChange={(e) => handleFieldChange('body', e.target.value)}
              />
            </div>
          </>
        );

      case 'postSlack':
      case 'postDiscord':
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Channel / Hook Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="#general"
                value={config.channel || ''}
                onChange={(e) => handleFieldChange('channel', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Message</label>
              <textarea
                rows={4}
                className="input-field resize-none"
                placeholder="Write your message..."
                value={config.message || ''}
                onChange={(e) => handleFieldChange('message', e.target.value)}
              />
            </div>
          </>
        );

      case 'appendSheet':
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Spreadsheet ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="spreadsheet-id-from-url"
                value={config.spreadsheetId || ''}
                onChange={(e) => handleFieldChange('spreadsheetId', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Range</label>
              <input
                type="text"
                className="input-field"
                placeholder="Sheet1!A:Z"
                value={config.range || ''}
                onChange={(e) => handleFieldChange('range', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Values (Comma-separated)</label>
              <input
                type="text"
                className="input-field"
                placeholder="value1, value2, {{input}}"
                value={config.values || ''}
                onChange={(e) => handleFieldChange('values', e.target.value)}
              />
            </div>
          </>
        );

      case 'httpRequest':
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">URL</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://api.example.com/data"
                value={config.url || ''}
                onChange={(e) => handleFieldChange('url', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Method</label>
              <select
                className="input-field cursor-pointer"
                value={config.method || 'GET'}
                onChange={(e) => handleFieldChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Headers (JSON)</label>
              <textarea
                rows={3}
                className="input-field font-mono text-[10px] resize-none"
                placeholder='{ "Content-Type": "application/json" }'
                value={config.headers || ''}
                onChange={(e) => handleFieldChange('headers', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Body</label>
              <textarea
                rows={4}
                className="input-field font-mono text-[10px] resize-none"
                placeholder='{ "key": "{{input}}" }'
                value={config.body || ''}
                onChange={(e) => handleFieldChange('body', e.target.value)}
              />
            </div>
          </>
        );

      // ─── AI Nodes ──────────────────────────────────────────────────
      case 'aiProcess':
      case 'aiClassify':
      case 'aiSummarize':
      case 'aiGenerate':
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Prompt / Agent Directive</label>
              <textarea
                rows={5}
                className="input-field resize-none"
                placeholder="Give execution instructions to the AI..."
                value={config.prompt || ''}
                onChange={(e) => handleFieldChange('prompt', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Model Preference</label>
              <select
                className="input-field cursor-pointer"
                value={config.model || 'auto'}
                onChange={(e) => handleFieldChange('model', e.target.value)}
              >
                <option value="auto">Auto-select Agent Model</option>
                <option value="gemini-pro">Gemini 1.5 Pro</option>
                <option value="gemini-flash">Gemini 1.5 Flash</option>
                <option value="gpt-4">GPT-4 (OpenRouter)</option>
                <option value="claude-3">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </>
        );

      // ─── Logic ─────────────────────────────────────────────────────
      case 'condition':
        return (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Evaluate Field</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. data.subject"
                value={config.field || ''}
                onChange={(e) => handleFieldChange('field', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Operator</label>
              <select
                className="input-field cursor-pointer"
                value={config.operator || 'equals'}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="exists">Exists</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Value to Match</label>
              <input
                type="text"
                className="input-field"
                placeholder="Match Value"
                value={config.value || ''}
                onChange={(e) => handleFieldChange('value', e.target.value)}
              />
            </div>
          </>
        );

      case 'loop':
        return (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Loop Iterations / List Field</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 5 or data.items"
              value={config.iterations || ''}
              onChange={(e) => handleFieldChange('iterations', e.target.value)}
            />
          </div>
        );

      case 'delay':
        return (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Delay Duration (Seconds)</label>
            <input
              type="number"
              className="input-field"
              placeholder="60"
              value={config.seconds || ''}
              onChange={(e) => handleFieldChange('seconds', parseInt(e.target.value, 10) || 0)}
            />
          </div>
        );

      case 'transform':
        return (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Javascript Transformation Code</label>
            <textarea
              rows={6}
              className="input-field font-mono text-[10px] resize-none"
              placeholder="return { result: data.value * 2 };"
              value={config.expression || ''}
              onChange={(e) => handleFieldChange('expression', e.target.value)}
            />
          </div>
        );

      // ─── Triggers ──────────────────────────────────────────────────
      case 'schedule':
        return (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Cron Expression / Interval</label>
            <input
              type="text"
              className="input-field"
              placeholder="*/15 * * * * (every 15 min)"
              value={config.schedule || ''}
              onChange={(e) => handleFieldChange('schedule', e.target.value)}
            />
          </div>
        );

      default:
        return (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded-xl">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>This node type doesn't require any additional configuration parameters.</span>
          </div>
        );
    }
  };

  return (
    <aside className="w-80 border-l border-white/10 bg-dark-800/80 backdrop-blur-xl flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary-400" />
          <h3 className="font-semibold text-sm text-gray-200">Configure Node</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Node Name</label>
          <input type="text" className="input-field font-semibold" value={name} onChange={handleNameChange} />
        </div>

        <div className="h-[1px] bg-white/5 my-1" />

        {renderFields()}
      </div>
    </aside>
  );
};

export default NodeConfigPanel;
