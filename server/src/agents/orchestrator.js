const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const Execution = require('../models/Execution');

// Check LangGraph availability as per specification requirements
let langGraphStatus = 'not-installed';
try {
  require('@langchain/langgraph');
  langGraphStatus = 'available';
} catch (err) {
  // Let it fallback to 'not-installed'
}

async function executeWorkflowRun(executionId) {
  const startTime = Date.now();
  
  // Find execution
  const execution = await Execution.findById(executionId);
  if (!execution) {
    console.error(`Execution instance ${executionId} not found in database.`);
    return;
  }

  // Update to RUNNING
  execution.status = 'RUNNING';
  execution.startedAt = new Date();
  await execution.save();

  const snapshot = execution.workflowSnapshot;
  const workflowId = execution.workflow;

  let finalOutput = {};
  let currentOutput = execution.input || {};

  try {
    // 1. Planner Agent decides order
    const planResult = await plannerAgent.plan(execution, snapshot);
    const nodeOrder = planResult.nodeOrder;

    const nodeMap = new Map((snapshot.nodes || []).map((n) => [n.id, n]));

    // 2. Loop through execution list
    for (const nodeId of nodeOrder) {
      // Handle Pause/Cancel state checks between steps
      const currentExecState = await Execution.findById(executionId).select('status');
      if (currentExecState.status === 'CANCELLED') {
        await plannerAgent.logAndBroadcast(executionId, workflowId, nodeId, 'monitoring', 'warning', 'EXECUTION_CANCELLED', 'Workflow execution was manually cancelled by operator.');
        return;
      }
      if (currentExecState.status === 'PAUSED') {
        await plannerAgent.logAndBroadcast(executionId, workflowId, nodeId, 'monitoring', 'warning', 'EXECUTION_PAUSED', 'Workflow execution was paused.');
        return;
      }

      const node = nodeMap.get(nodeId);
      if (!node) continue;

      // Update current running node in DB
      execution.currentNode = nodeId;
      await execution.save();

      let nodeSuccess = false;
      let retriesLeft = 3;

      while (!nodeSuccess && retriesLeft >= 0) {
        try {
          // Execution Agent
          currentOutput = await executionAgent.executeNode(execution, nodeId, node, currentOutput);
          
          // Validation Agent
          await validationAgent.validateNodeOutput(execution, nodeId, node, currentOutput);
          
          nodeSuccess = true;
        } catch (error) {
          retriesLeft -= 1;
          
          // Recovery Agent
          const recovery = await recoveryAgent.handleFailure(execution, nodeId, node, error);
          
          if (recovery.decision === 'retry_with_backoff' && retriesLeft >= 0) {
            execution.retryCount += 1;
            execution.status = 'RETRYING';
            await execution.save();
            
            // Simple exponential backoff sleep
            const backoffMs = Math.pow(2, 3 - retriesLeft) * 1000;
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          } else {
            // Escalate - throw error to fail the workflow
            throw error;
          }
        }
      }

      finalOutput[nodeId] = currentOutput;
    }

    // 3. Mark successful run
    const duration = Date.now() - startTime;
    execution.status = 'COMPLETED';
    execution.currentNode = null;
    execution.completedAt = new Date();
    execution.duration = duration;
    execution.output = finalOutput;
    await execution.save();

    // Monitoring Agent complete log
    await monitoringAgent.monitorComplete(execution, 'COMPLETED', duration, finalOutput);

  } catch (error) {
    // 4. Mark failed run
    const duration = Date.now() - startTime;
    execution.status = 'FAILED';
    execution.currentNode = null;
    execution.completedAt = new Date();
    execution.duration = duration;
    execution.error = { message: error.message, stack: error.stack };
    await execution.save();

    // Monitoring Agent failure log
    await monitoringAgent.monitorComplete(execution, 'FAILED', duration, {}, error);
  }
}

module.exports = {
  executeWorkflowRun,
  langGraphStatus,
};
