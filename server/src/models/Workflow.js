const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
    trigger: {
      type: {
        type: String,
        default: 'manual',
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    nodes: [
      {
        id: String,
        type: { type: String }, // e.g., trigger, action, ai, logic
        position: {
          x: Number,
          y: Number,
        },
        data: mongoose.Schema.Types.Mixed,
      },
    ],
    edges: [
      {
        id: String,
        source: String,
        target: String,
        sourceHandle: String,
        targetHandle: String,
        animated: {
          type: Boolean,
          default: true,
        },
      },
    ],
    version: {
      type: Number,
      default: 1,
    },
    tags: [String],
    lastExecutedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

workflowSchema.index({ owner: 1 });
workflowSchema.index({ status: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
