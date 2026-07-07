const BaseIntegration = require('./baseIntegration');
const axios = require('axios');

class SlackIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('slack', credentials);
  }

  async connect() {
    if (!this.credentials.accessToken) {
      const err = new Error('Slack OAuth connection token missing');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }
    return { refreshed: false };
  }

  async execute(action, params = {}) {
    await this.connect();

    if (action === 'postSlack') {
      const { channel, message } = params;
      if (!channel) throw new Error('Slack channel name/ID is required');
      if (!message) throw new Error('Slack message text is required');

      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        { channel, text: message },
        { headers: { Authorization: `Bearer ${this.credentials.accessToken}`, 'Content-Type': 'application/json' } }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Failed to post message to Slack');
      }

      return { success: true, ts: response.data.ts, channel: response.data.channel };
    }

    throw new Error(`Unsupported action "${action}" for Slack integration.`);
  }

  async testConnection() {
    try {
      const res = await axios.post(
        'https://slack.com/api/auth.test',
        {},
        { headers: { Authorization: `Bearer ${this.credentials.accessToken}` } }
      );
      return { success: res.data.ok, error: res.data.error || null };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = SlackIntegration;
