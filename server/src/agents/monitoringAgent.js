const { logAndBroadcast } = require('./plannerAgent');

async function monitorComplete(execution, status, duration, finalOutput = {}, error = null) {
  const executionId = execution._id;
  const workflowId = execution.workflow;

  if (status === 'COMPLETED') {
    await logAndBroadcast(
      executionId,
      workflowId,
      null,
      'monitoring',
      'success',
      'EXECUTION_COMPLETE',
      `Orchestrator completed entire agent chain successfully in ${duration}ms!`,
      { duration, finalOutput }
    );
  } else {
    await logAndBroadcast(
      executionId,
      workflowId,
      null,
      'monitoring',
      'error',
      'EXECUTION_FAILED',
      `Orchestrator finished with status: ${status}. Error details: ${error ? error.message : 'Unknown error'}`,
      { duration, error: error ? error.stack : null }
    );
  }
}

module.exports = {
  monitorComplete,
};
