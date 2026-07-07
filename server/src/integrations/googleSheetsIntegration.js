const BaseIntegration = require('./baseIntegration');
const { google } = require('googleapis');
const env = require('../config/env');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor(credentials = {}) {
    super('google-sheets', credentials);
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
      const err = new Error('Google OAuth token missing');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }
    const isExpired = this.credentials.tokenExpiry && new Date() >= new Date(this.credentials.tokenExpiry);
    if (isExpired && this.credentials.refreshToken) {
      try {
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(credentials);
        return {
          accessToken: credentials.access_token,
          tokenExpiry: new Date(credentials.expiry_date),
          refreshed: true,
        };
      } catch (err) {
        console.error('Sheets refresh failed:', err);
        const expired = new Error('OAuth token expired');
        expired.code = 'AUTH_EXPIRED';
        throw expired;
      }
    }
    return { refreshed: false };
  }

  async execute(action, params = {}) {
    await this.connect();
    const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });

    if (action === 'appendSheet') {
      const { spreadsheetId, range, values } = params;
      if (!spreadsheetId) throw new Error('spreadsheetId is required');

      let rowValues = [];
      if (typeof values === 'string') {
        rowValues = values.split(',').map((v) => v.trim());
      } else if (Array.isArray(values)) {
        rowValues = values;
      } else {
        rowValues = [JSON.stringify(values)];
      }

      const res = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: range || 'Sheet1!A:Z',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [rowValues] },
      });
      return { success: true, updatedRange: res.data.updates?.updatedRange, rowsAdded: 1 };
    }

    if (action === 'readRange') {
      const { spreadsheetId, range } = params;
      if (!spreadsheetId) throw new Error('spreadsheetId is required');
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range || 'Sheet1!A:Z',
      });
      return res.data;
    }

    throw new Error(`Unsupported action "${action}" for Google Sheets integration.`);
  }

  async testConnection() {
    try {
      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
      // Lightweight request to see if we can talk to sheets API
      await sheets.spreadsheets.get({
        spreadsheetId: 'dummy-id',
      }).catch((e) => {
        // We expect a 404/403 for a dummy ID, but not a 401
        if (e.status === 401) throw e;
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = GoogleSheetsIntegration;
