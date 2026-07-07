const catalog = {
  triggers: [
    { type: 'manual', label: 'Manual Trigger', description: 'Trigger execution on demand manually' },
    { type: 'schedule', label: 'Schedule Trigger', description: 'Trigger execution at set times or intervals (cron)' },
    { type: 'webhook', label: 'Webhook Trigger', description: 'Trigger execution on incoming HTTP webhook request' },
  ],
  actions: [
    { type: 'sendEmail', label: 'Send Email', description: 'Send an email notification' },
    { type: 'postSlack', label: 'Post to Slack', description: 'Post a message to a Slack channel' },
    { type: 'postDiscord', label: 'Post to Discord', description: 'Post a message to a Discord channel' },
    { type: 'appendSheet', label: 'Append to Sheet', description: 'Append a row of data to a Google Sheet' },
    { type: 'httpRequest', label: 'HTTP Request', description: 'Send an outgoing HTTP request (GET/POST/etc.)' },
  ],
  ai: [
    { type: 'aiProcess', label: 'AI Process', description: 'Execute generic prompt processing' },
    { type: 'aiClassify', label: 'AI Classify', description: 'Categorize inputs into dynamic labels' },
    { type: 'aiSummarize', label: 'AI Summarize', description: 'Summarize long text input' },
    { type: 'aiGenerate', label: 'AI Generate', description: 'Generate fresh content from a prompt' },
  ],
  logic: [
    { type: 'condition', label: 'Condition Gate', description: 'Branch execution path based on a condition matching' },
    { type: 'loop', label: 'Loop Gate', description: 'Iterate over list elements or repeat multiple times' },
    { type: 'delay', label: 'Delay Gate', description: 'Pause execution path for a set duration in seconds' },
    { type: 'transform', label: 'Transform Data', description: 'Transform inputs with custom javascript code' },
  ],
};

module.exports = catalog;
