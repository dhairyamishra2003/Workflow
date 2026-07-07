const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');

async function generateWorkflow(req, res, next) {
  try {
    const { prompt } = req.body;
    const generatedGraph = await aiService.generateWorkflowFromPrompt(prompt);
    res.status(200).json({ success: true, data: generatedGraph });
  } catch (error) {
    next(error);
  }
}

async function getDashboard(req, res, next) {
  try {
    const metrics = await workflowService.getDashboardMetrics(req.user.id);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
}

async function listWorkflows(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { search, status, sortBy, sortOrder } = req.query;

    const result = await workflowService.listWorkflows(req.user.id, {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getWorkflow(req, res, next) {
  try {
    const workflow = await workflowService.getWorkflow(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
}

async function createWorkflow(req, res, next) {
  try {
    const workflow = await workflowService.createWorkflow(req.body, req.user.id);
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
}

async function updateWorkflow(req, res, next) {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
}

async function duplicateWorkflow(req, res, next) {
  try {
    const newWorkflow = await workflowService.duplicateWorkflow(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: newWorkflow });
  } catch (error) {
    next(error);
  }
}

async function deleteWorkflow(req, res, next) {
  try {
    const response = await workflowService.deleteWorkflow(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateWorkflow,
  getDashboard,
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
};
