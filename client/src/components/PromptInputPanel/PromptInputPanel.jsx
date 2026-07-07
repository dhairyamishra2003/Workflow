import React, { useState } from 'react';
import { Wand2, Loader2, Info } from 'lucide-react';

const SUGGESTIONS = [
  'Summarize recent emails using AI and post to Slack channel #ops',
  'Post webhook payload to Discord channel and log it to Google Sheet',
  'Append row to Sheets, delay for 60 seconds, and send an email report',
  'Categorize user complaints with AI into URGENT, INFO, or SPAM and email support',
];

const PromptInputPanel = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt);
  };

  return (
    <div className="w-80 border-r border-white/10 bg-dark-800/80 backdrop-blur-xl flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-white/10 bg-white/[0.01]">
        <h3 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary-400" />
          AI Graph Generator
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Describe your desired workflow in plain English</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Describe Automation</label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="input-field resize-none text-xs"
            placeholder="e.g. When I receive a webhook, parse it with AI and send an email alert to operator@example.com..."
            disabled={isGenerating}
          />
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generating Graph...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              Generate Workflow
            </>
          )}
        </button>

        <div className="h-[1px] bg-white/5 my-2" />

        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3 text-gray-500" />
            Quick Templates
          </span>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="text-left text-[11px] text-gray-400 hover:text-gray-200 p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200 leading-normal"
                disabled={isGenerating}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PromptInputPanel;
