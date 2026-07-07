const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'],
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'disconnected',
    },
    scopes: [String],
    accessToken: {
      type: String, // Encrypted at rest
    },
    refreshToken: {
      type: String, // Encrypted at rest
    },
    tokenExpiry: {
      type: Date,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ owner: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', integrationSchema);
