const { logAndBroadcast } = require('./plannerAgent');

async function validateNodeOutput(execution, nodeId, node, nodeOutput) {
  const executionId = execution._id;
  const workflowId = execution.workflow;

  await logAndBroadcast(
    executionId,
    workflowId,
    nodeId,
    'validation',
    'info',
    'VALIDATION_START',
    `Validating output for node "${node.data?.label || nodeId}"`
  );

  const nodeType = node.data?.nodeType;

  // Perform validation checks based on type
  if (node.type === 'trigger') {
    if (!nodeOutput) {
      const err = new Error('Trigger output is null or undefined');
      await logAndBroadcast(executionId, workflowId, nodeId, 'validation', 'error', 'VALIDATION_FAILED', err.message);
      throw err;
    }
  } else if (node.type === 'ai') {
    if (!nodeOutput || (!nodeOutput.text && !nodeOutput.output)) {
      const err = new Error('AI execution did not return any content/text output');
      await logAndBroadcast(executionId, workflowId, nodeId, 'validation', 'error', 'VALIDATION_FAILED', err.message);
      throw err;
    }
  } else if (node.type === 'action' && nodeType === 'httpRequest') {
    if (!nodeOutput || !nodeOutput.status) {
      const err = new Error('HTTP Request did not return status code');
      await logAndBroadcast(executionId, workflowId, nodeId, 'validation', 'error', 'VALIDATION_FAILED', err.message);
      throw err;
    }
  }

  await logAndBroadcast(
    executionId,
    workflowId,
    nodeId,
    'validation',
    'success',
    'VALIDATION_SUCCESS',
    `Node output structure validation passed`
  );

  return true;
}

module.exports = {
  validateNodeOutput,
};
