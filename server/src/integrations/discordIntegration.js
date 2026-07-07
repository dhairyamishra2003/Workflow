const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class DiscordIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('discord', credentials);
  }

  async connect() {
    if (!this.credentials.accessToken) {
      const err = new Error('Discord bot authorization credentials missing');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }
    return { refreshed: false };
  }

  async execute(action, params = {}) {
    await this.connect();

    if (action === 'postDiscord') {
      const { channel, message } = params;
      if (!channel) throw new Error('Discord channel ID is required');
      if (!message) throw new Error('Discord message content is required');

      // Post using the Discord REST API
      const response = await axios.post(
        `https://discord.com/api/v10/channels/${channel}/messages`,
        { content: message },
        { headers: { Authorization: `Bot ${this.credentials.accessToken}`, 'Content-Type': 'application/json' } }
      );

      return { success: true, id: response.data.id, channel_id: response.data.channel_id };
    }

    throw new Error(`Unsupported action "${action}" for Discord integration.`);
  }

  async testConnection() {
    try {
      // Check bot profile metadata
      const res = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${this.credentials.accessToken}` },
      });
      return { success: !!res.data.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = DiscordIntegration;
