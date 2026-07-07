const BaseIntegration = require('./baseIntegration');
const { google } = require('googleapis');
const env = require('../config/env');

class GmailIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('gmail', credentials);
    this.oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    if (credentials.accessToken) {
      this.oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        expiry_date: credentials.tokenExpiry ? new Date(credentials.tokenExpiry).getTime() : null,
      });
    }
  }

  async connect() {
    if (!this.credentials.accessToken) {
      const err = new Error('OAuth access token missing');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }
    // Check if token expired
    const isExpired = this.credentials.tokenExpiry && new Date() >= new Date(this.credentials.tokenExpiry);
    if (isExpired && this.credentials.refreshToken) {
      try {
        console.log('🔄 Refreshing Google OAuth credentials...');
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(credentials);
        return {
          accessToken: credentials.access_token,
          tokenExpiry: new Date(credentials.expiry_date),
          refreshed: true,
        };
      } catch (err) {
        console.error('Google OAuth refresh failed:', err);
        const refreshErr = new Error('Google OAuth connection expired');
        refreshErr.code = 'AUTH_EXPIRED';
        throw refreshErr;
      }
    }
    return { refreshed: false };
  }

  async execute(action, params = {}) {
    await this.connect();
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    if (action === 'sendEmail') {
      const { to, subject, body } = params;
      if (!to) throw new Error('Recipient email "to" is required');

      // Construct MIME email string
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject || '').toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body || '',
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });
      return { success: true, messageId: res.data.id, threadId: res.data.threadId };
    }

    if (action === 'readEmails') {
      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: params.maxResults || 5,
        q: params.query || '',
      });
      return res.data;
    }

    throw new Error(`Unsupported action "${action}" for Gmail integration.`);
  }

  async testConnection() {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      await gmail.users.getProfile({ userId: 'me' });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = GmailIntegration;
