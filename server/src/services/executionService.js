const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const orchestrator = require('../agents/orchestrator');
const { addExecutionJob } = require('../config/queue');

async function listExecutions(userId, { page = 1, limit = 10, status, workflowId }) {
  try {
    // Find all workflows owned by this operator
    const workflows = await Workflow.find({ owner: userId }).select('_id');
    const workflowIds = workflows.map((w) => w._id);

    const query = { workflow: { $in: workflowIds } };
    if (status) query.status = status;
    if (workflowId) query.workflow = workflowId;

    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      Execution.find(query)
        .populate('workflow', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Execution.countDocuments(query),
    ]);

    return {
      executions,
      total,
      page,
      pages: Math.ceil(total / limit),
      langGraph: orchestrator.langGraphStatus,
    };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function getExecution(executionId, userId) {
  try {
    const execution = await Execution.findById(executionId).populate('workflow', 'name owner');
    if (!execution || String(execution.workflow.owner) !== String(userId)) {
      const err = new Error('Execution instance not found');
      err.statusCode = 404;
      throw err;
    }
    return {
      execution,
      langGraph: orchestrator.langGraphStatus,
    };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function getTimeline(executionId, userId) {
  try {
    const execResult = await getExecution(executionId, userId);
    const logs = await ExecutionLog.find({ execution: executionId }).sort({ createdAt: 1 });
    return logs;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function startExecution(workflowId, input = {}, userId) {
  try {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found to execute');
      err.statusCode = 404;
      throw err;
    }

    const execution = new Execution({
      workflow: workflowId,
      workflowSnapshot: workflow.toObject(),
      status: 'PENDING',
      input,
    });
    await execution.save();

    // Trigger asynchronously via BullMQ background runner queue
    await addExecutionJob(execution._id);

    workflow.lastExecutedAt = new Date();
    await workflow.save();

    return execution;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function pauseExecution(executionId, userId) {
  try {
    const { execution } = await getExecution(executionId, userId);
    if (execution.status !== 'RUNNING' && execution.status !== 'RETRYING') {
      const err = new Error('Only running or retrying execution runs can be paused');
      err.statusCode = 400;
      throw err;
    }
    execution.status = 'PAUSED';
    return await execution.save();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function resumeExecution(executionId, userId) {
  try {
    const { execution } = await getExecution(executionId, userId);
    if (execution.status !== 'PAUSED') {
      const err = new Error('Only paused execution runs can be resumed');
      err.statusCode = 400;
      throw err;
    }
    execution.status = 'RUNNING';
    await execution.save();

    // Re-trigger asynchronously via BullMQ background runner queue
    await addExecutionJob(execution._id);

    return execution;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function cancelExecution(executionId, userId) {
  try {
    const { execution } = await getExecution(executionId, userId);
    if (execution.status === 'COMPLETED' || execution.status === 'FAILED' || execution.status === 'CANCELLED') {
      const err = new Error('Completed, failed or already cancelled executions cannot be cancelled');
      err.statusCode = 400;
      throw err;
    }
    execution.status = 'CANCELLED';
    return await execution.save();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

module.exports = {
  listExecutions,
  getExecution,
  getTimeline,
  startExecution,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
