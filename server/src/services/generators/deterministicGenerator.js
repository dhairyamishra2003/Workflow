/**
 * Deterministic generator to build visual workflow graphs without LLM API keys
 */
async function generate(prompt) {
  const p = prompt.toLowerCase();

  // 1. Email automation prompt
  if (p.includes('mail') || p.includes('email') || p.includes('gmail')) {
    return {
      nodes: [
        {
          id: 'trigger-manual-1',
          type: 'trigger',
          position: { x: 250, y: 100 },
          data: { label: 'Manual Trigger', nodeType: 'manual', config: {} },
        },
        {
          id: 'ai-summarize-1',
          type: 'ai',
          position: { x: 250, y: 350 },
          data: { label: 'AI Summarize Content', nodeType: 'aiSummarize', config: { prompt: 'Summarize incoming data context.' } },
        },
        {
          id: 'action-email-1',
          type: 'action',
          position: { x: 250, y: 600 },
          data: {
            label: 'Send Email Summary',
            nodeType: 'sendEmail',
            config: {
              to: 'operator@example.com',
              subject: 'AI Orchestrated Alert Summary',
              body: 'Here is the summary of content: {{input}}',
            },
          },
        },
      ],
      edges: [
        { id: 'e-1-2', source: 'trigger-manual-1', target: 'ai-summarize-1', animated: true },
        { id: 'e-2-3', source: 'ai-summarize-1', target: 'action-email-1', animated: true },
      ],
    };
  }

  // 2. Slack / Discord prompt
  if (p.includes('slack') || p.includes('discord') || p.includes('post') || p.includes('notify')) {
    const isDiscord = p.includes('discord');
    const label = isDiscord ? 'Post to Discord' : 'Post to Slack';
    const nodeType = isDiscord ? 'postDiscord' : 'postSlack';
    return {
      nodes: [
        {
          id: 'trigger-manual-1',
          type: 'trigger',
          position: { x: 250, y: 100 },
          data: { label: 'Manual Trigger', nodeType: 'manual', config: {} },
        },
        {
          id: 'ai-classify-1',
          type: 'ai',
          position: { x: 250, y: 350 },
          data: {
            label: 'AI Categorize Alert',
            nodeType: 'aiClassify',
            config: { prompt: 'Categorize input as URGENT, INFO, or SPAM' },
          },
        },
        {
          id: 'action-notify-1',
          type: 'action',
          position: { x: 250, y: 600 },
          data: {
            label,
            nodeType,
            config: { channel: '#operations', message: 'AI classified event: {{input}}' },
          },
        },
      ],
      edges: [
        { id: 'e-1-2', source: 'trigger-manual-1', target: 'ai-classify-1', animated: true },
        { id: 'e-2-3', source: 'ai-classify-1', target: 'action-notify-1', animated: true },
      ],
    };
  }

  // 3. Google Sheets prompt
  if (p.includes('sheet') || p.includes('google sheets') || p.includes('excel') || p.includes('spreadsheet')) {
    return {
      nodes: [
        {
          id: 'trigger-webhook-1',
          type: 'trigger',
          position: { x: 250, y: 100 },
          data: { label: 'Webhook Catch', nodeType: 'webhook', config: {} },
        },
        {
          id: 'logic-transform-1',
          type: 'logic',
          position: { x: 250, y: 350 },
          data: {
            label: 'Format Row JSON',
            nodeType: 'transform',
            config: { expression: 'return { row: [new Date().toISOString(), data.payload] };' },
          },
        },
        {
          id: 'action-sheets-1',
          type: 'action',
          position: { x: 250, y: 600 },
          data: {
            label: 'Append to Sheet',
            nodeType: 'appendSheet',
            config: { spreadsheetId: 'spreadsheet-id', range: 'Sheet1!A:C', values: '{{input}}' },
          },
        },
      ],
      edges: [
        { id: 'e-1-2', source: 'trigger-webhook-1', target: 'logic-transform-1', animated: true },
        { id: 'e-2-3', source: 'logic-transform-1', target: 'action-sheets-1', animated: true },
      ],
    };
  }

  // 4. Default workflow (Invoice / General routing)
  return {
    nodes: [
      {
        id: 'trigger-manual-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: { label: 'Manual Trigger', nodeType: 'manual', config: {} },
      },
      {
        id: 'ai-process-1',
        type: 'ai',
        position: { x: 250, y: 350 },
        data: {
          label: 'AI General Processor',
          nodeType: 'aiProcess',
          config: { prompt: 'Process the following operator task instruction: ' + prompt },
        },
      },
      {
        id: 'action-email-1',
        type: 'action',
        position: { x: 250, y: 600 },
        data: {
          label: 'Send Completion Notification',
          nodeType: 'sendEmail',
          config: {
            to: 'operator@example.com',
            subject: 'AI Agent Chain Completed',
            body: 'Workflow execution reports: {{input}}',
          },
        },
      },
    ],
    edges: [
      { id: 'e-1-2', source: 'trigger-manual-1', target: 'ai-process-1', animated: true },
      { id: 'e-2-3', source: 'ai-process-1', target: 'action-email-1', animated: true },
    ],
  };
}

module.exports = {
  generate,
};
