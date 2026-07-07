const executionService = require('../services/executionService');

async function listExecutions(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, workflowId } = req.query;

    const result = await executionService.listExecutions(req.user.id, {
      page,
      limit,
      status,
      workflowId,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getExecution(req, res, next) {
  try {
    const result = await executionService.getExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getTimeline(req, res, next) {
  try {
    const logs = await executionService.getTimeline(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

async function startExecution(req, res, next) {
  try {
    const execution = await executionService.startExecution(req.params.id, req.body.input, req.user.id);
    res.status(202).json({ success: true, data: execution });
  } catch (error) {
    next(error);
  }
}

async function pauseExecution(req, res, next) {
  try {
    const execution = await executionService.pauseExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: execution });
  } catch (error) {
    next(error);
  }
}

async function resumeExecution(req, res, next) {
  try {
    const execution = await executionService.resumeExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: execution });
  } catch (error) {
    next(error);
  }
}

async function cancelExecution(req, res, next) {
  try {
    const execution = await executionService.cancelExecution(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: execution });
  } catch (error) {
    next(error);
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
