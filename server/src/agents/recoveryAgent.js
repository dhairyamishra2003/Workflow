const { logAndBroadcast } = require('./plannerAgent');

async function handleFailure(execution, nodeId, node, error) {
  const executionId = execution._id;
  const workflowId = execution.workflow;

  await logAndBroadcast(
    executionId,
    workflowId,
    nodeId,
    'recovery',
    'warning',
    'RECOVERY_START',
    `Recovery Agent analysis triggered for failure on node "${node.data?.label || nodeId}"`
  );

  const errorMsg = error.message || '';
  let classification = 'TRANSIENT';
  let decision = 'escalate'; // default

  // Simple classification based on error messages
  if (errorMsg.includes('missing') || errorMsg.includes('required')) {
    classification = 'MISSING_FIELDS';
    decision = 'escalate'; // Can't recover from code/field configuration errors automatically
  } else if (errorMsg.includes('unauthorized') || errorMsg.includes('auth') || errorMsg.includes('jwt')) {
    classification = 'AUTH_EXPIRED';
    decision = 'escalate'; // Requires user action to sign in again
  } else if (errorMsg.includes('rate') || errorMsg.includes('429')) {
    classification = 'RATE_LIMIT';
    decision = 'retry_with_backoff';
  } else if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('fetch')) {
    classification = 'API_FAILURE';
    decision = 'retry_with_backoff';
  }

  await logAndBroadcast(
    executionId,
    workflowId,
    nodeId,
    'recovery',
    decision === 'retry_with_backoff' ? 'info' : 'error',
    'RECOVERY_DECISION',
    `Failure classified as ${classification}. Decided action: ${decision}`,
    { classification, decision, retryCount: execution.retryCount }
  );

  return {
    classification,
    decision,
  };
}

module.exports = {
  handleFailure,
};
