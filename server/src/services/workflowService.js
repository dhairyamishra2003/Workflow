const Workflow = require('../models/Workflow');

/**
 * Get dashboard aggregated metrics for the user
 */
async function getDashboardMetrics(userId) {
  try {
    const totalWorkflows = await Workflow.countDocuments({ owner: userId });
    const activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });
    
    // Total executions & success rate are placeholders until executions (Phase 4) are implemented
    const totalExecutions = 0;
    const successRate = 0;

    const recentWorkflows = await Workflow.find({ owner: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name status updatedAt');

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successRate,
      recentWorkflows,
      recentExecutions: [], // Placeholder for execution history
    };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

/**
 * List workflows for a user with pagination, search, and filter
 */
async function listWorkflows(userId, { page = 1, limit = 10, search, status, sortBy = 'updatedAt', sortOrder = 'desc' }) {
  try {
    const query = { owner: userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [workflows, total] = await Promise.all([
      Workflow.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Workflow.countDocuments(query),
    ]);

    return {
      workflows,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

/**
 * Get single workflow
 */
async function getWorkflow(workflowId, userId) {
  try {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return workflow;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

/**
 * Create new workflow
 */
async function createWorkflow(data, userId) {
  try {
    const workflow = new Workflow({
      ...data,
      owner: userId,
    });
    return await workflow.save();
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    throw error;
  }
}

/**
 * Update workflow
 */
async function updateWorkflow(workflowId, data, userId) {
  try {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }

    const allowedUpdates = ['name', 'description', 'status', 'nodes', 'edges', 'trigger', 'tags'];
    allowedUpdates.forEach((field) => {
      if (data[field] !== undefined) {
        workflow[field] = data[field];
      }
    });

    workflow.version += 1;
    return await workflow.save();
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    throw error;
  }
}

/**
 * Duplicate a workflow
 */
async function duplicateWorkflow(workflowId, userId) {
  try {
    const original = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!original) {
      const err = new Error('Workflow not found to duplicate');
      err.statusCode = 404;
      throw err;
    }

    const copy = new Workflow({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      trigger: original.trigger,
      nodes: original.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      })),
      edges: original.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        animated: edge.animated,
      })),
      tags: original.tags,
      version: 1,
    });

    return await copy.save();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

/**
 * Delete a workflow
 */
async function deleteWorkflow(workflowId, userId) {
  try {
    const result = await Workflow.deleteOne({ _id: workflowId, owner: userId });
    if (result.deletedCount === 0) {
      const err = new Error('Workflow not found');
      err.statusCode = 404;
      throw err;
    }
    return { message: 'Workflow deleted successfully' };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

module.exports = {
  getDashboardMetrics,
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
};
