const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema(
  {
    execution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    nodeId: {
      type: String,
      default: null,
    },
    agent: {
      type: String,
      enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
      required: true,
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    eventType: {
      type: String,
      required: true, // e.g. "NODE_START", "NODE_SUCCESS", "PLAN_CREATE"
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

executionLogSchema.index({ execution: 1 });
executionLogSchema.index({ agent: 1 });

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
