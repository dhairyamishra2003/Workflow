const { logAndBroadcast } = require('./plannerAgent');
const AgentMemory = require('../models/AgentMemory');
const Integration = require('../models/Integration');
const { decrypt } = require('../utils/encryption');
const GmailIntegration = require('../integrations/gmailIntegration');
const GoogleSheetsIntegration = require('../integrations/googleSheetsIntegration');
const SlackIntegration = require('../integrations/slackIntegration');
const DiscordIntegration = require('../integrations/discordIntegration');
const Workflow = require('../models/Workflow');

async function executeNode(execution, nodeId, node, prevNodeOutput) {
  const executionId = execution._id;
  const workflowId = execution.workflow;

  await logAndBroadcast(
    executionId,
    workflowId,
    nodeId,
    'execution',
    'info',
    'NODE_START',
    `Executing node "${node.data?.label || nodeId}" (${node.type}:${node.data?.nodeType || ''})`
  );

  const nodeType = node.data?.nodeType;
  const config = node.data?.config || {};
  let result = {};

  try {
    // Get workflow owner to lookup connected integrations
    const workflowObj = await Workflow.findById(workflowId);
    const userId = workflowObj ? workflowObj.owner : null;

    // 1. Process template strings in configuration (e.g. replacing {{input}} with prev node output)
    const replaceTemplates = (text) => {
      if (typeof text !== 'string') return text;
      let outputVal = prevNodeOutput;
      if (prevNodeOutput && typeof prevNodeOutput === 'object') {
        outputVal = prevNodeOutput.result || prevNodeOutput.output || prevNodeOutput.text || JSON.stringify(prevNodeOutput);
      }
      return text.replace(/\{\{input\}\}/g, outputVal || '');
    };

    const resolvedConfig = {};
    Object.keys(config).forEach((key) => {
      resolvedConfig[key] = replaceTemplates(config[key]);
    });

    // 2. Perform node operation logic
    switch (node.type) {
      case 'trigger':
        result = { triggered: true, type: nodeType, timestamp: new Date() };
        break;

      case 'action':
        // Determine which provider connection is needed
        let provider = null;
        if (nodeType === 'sendEmail') provider = 'gmail';
        else if (nodeType === 'appendSheet') provider = 'google-sheets';
        else if (nodeType === 'postSlack') provider = 'slack';
        else if (nodeType === 'postDiscord') provider = 'discord';

        if (provider) {
          // Look up connection
          const connection = await Integration.findOne({ owner: userId, provider });
          if (!connection || connection.status !== 'connected') {
            const err = new Error(`Integration for "${provider}" is not connected. Please connect it in the Integrations page.`);
            err.code = 'INTEGRATION_NOT_CONNECTED';
            throw err;
          }

          // Decrypt tokens
          const accessToken = connection.accessToken ? decrypt(connection.accessToken) : null;
          const refreshToken = connection.refreshToken ? decrypt(connection.refreshToken) : null;

          const creds = {
            accessToken,
            refreshToken,
            tokenExpiry: connection.tokenExpiry,
          };

          let instance = null;
          if (provider === 'gmail') instance = new GmailIntegration(creds);
          else if (provider === 'google-sheets') instance = new GoogleSheetsIntegration(creds);
          else if (provider === 'slack') instance = new SlackIntegration(creds);
          else if (provider === 'discord') instance = new DiscordIntegration(creds);

          if (instance) {
            // Run OAuth connection check & execute action
            const refreshDetails = await instance.connect();
            if (refreshDetails && refreshDetails.refreshed) {
              // Save refreshed token details back to Integration document
              connection.accessToken = encrypt(refreshDetails.accessToken);
              connection.tokenExpiry = refreshDetails.tokenExpiry;
              await connection.save();
            }

            result = await instance.execute(nodeType, resolvedConfig);
          } else {
            throw new Error(`Failed to instantiate connection client for ${provider}`);
          }
        } else if (nodeType === 'httpRequest') {
          // Handle HTTP Request action directly
          const axios = require('axios');
          const method = resolvedConfig.method || 'GET';
          const headers = resolvedConfig.headers ? JSON.parse(resolvedConfig.headers) : {};
          const body = resolvedConfig.body ? JSON.parse(resolvedConfig.body) : null;
          
          const reqRes = await axios({
            method,
            url: resolvedConfig.url,
            headers,
            data: body,
          });
          result = { status: reqRes.status, statusText: reqRes.statusText, data: reqRes.data };
        } else {
          result = { executed: true };
        }
        break;

      case 'ai':
        // If Gemini is available, run actual AI task, else return mock
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
          try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(geminiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            
            const promptText = resolvedConfig.prompt || 'Process input';
            const inputContext = prevNodeOutput ? JSON.stringify(prevNodeOutput) : '';
            const finalPrompt = `${promptText}\n\nInput Context:\n${inputContext}`;
            
            const res = await model.generateContent(finalPrompt);
            result = { text: res.response.text() };
          } catch (aiErr) {
            console.error('AI node execution failed:', aiErr);
            result = { text: `[Simulated AI output for prompt: ${resolvedConfig.prompt}]` };
          }
        } else {
          result = { text: `[Simulated AI output for prompt: ${resolvedConfig.prompt}]` };
        }
        break;

      case 'logic':
        if (nodeType === 'delay') {
          const secs = resolvedConfig.seconds || 1;
          await new Promise((resolve) => setTimeout(resolve, secs * 1000));
          result = { waited: secs };
        } else if (nodeType === 'transform') {
          // Javascript code runner
          const code = resolvedConfig.expression || 'return data;';
          const runner = new Function('data', code);
          result = runner(prevNodeOutput);
        } else if (nodeType === 'condition') {
          const val = resolvedConfig.value;
          const op = resolvedConfig.operator || 'equals';
          const fieldVal = prevNodeOutput?.[resolvedConfig.field] || prevNodeOutput || '';
          
          let pass = false;
          if (op === 'equals') pass = String(fieldVal) === String(val);
          else if (op === 'contains') pass = String(fieldVal).includes(String(val));
          else if (op === 'exists') pass = fieldVal !== undefined && fieldVal !== null;
          
          result = { conditionPassed: pass };
        } else {
          result = { processed: true };
        }
        break;

      default:
        result = { success: true };
    }

    // 3. Save Node execution state in shared memory
    try {
      await AgentMemory.findOneAndUpdate(
        { execution: executionId, key: `node:${nodeId}` },
        { workflow: workflowId, agentId: 'execution', value: result, confidence: 1.0 },
        { upsert: true, new: true }
      );
    } catch (memErr) {
      console.error('Failed to store node state in AgentMemory:', memErr);
    }

    await logAndBroadcast(
      executionId,
      workflowId,
      nodeId,
      'execution',
      'success',
      'NODE_SUCCESS',
      `Node executed successfully: output captured`,
      { output: result }
    );

    return result;
  } catch (error) {
    await logAndBroadcast(
      executionId,
      workflowId,
      nodeId,
      'execution',
      'error',
      'NODE_FAILURE',
      `Execution failed: ${error.message}`,
      { error: error.stack }
    );
    throw error;
  }
}

module.exports = {
  executeNode,
};
