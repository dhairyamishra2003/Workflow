const Integration = require('../models/Integration');
const { encrypt, decrypt } = require('../utils/encryption');
const axios = require('axios');
const env = require('../config/env');

const PROVIDERS = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];

async function listIntegrations(userId) {
  try {
    const connectedList = await Integration.find({ owner: userId });
    const connectedMap = new Map(connectedList.map((i) => [i.provider, i]));

    return PROVIDERS.map((provider) => {
      const conn = connectedMap.get(provider);
      return {
        provider,
        connected: conn ? conn.status === 'connected' : false,
        scopes: conn ? conn.scopes : [],
        updatedAt: conn ? conn.updatedAt : null,
      };
    });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

async function getIntegrationStatus(userId) {
  return await listIntegrations(userId);
}

/**
 * Handle custom direct connection settings (e.g. entering API keys directly)
 */
async function connectDirectly(provider, configData, userId) {
  try {
    if (!PROVIDERS.includes(provider)) {
      const err = new Error('Invalid provider');
      err.statusCode = 400;
      throw err;
    }

    const { token, refreshToken, expiry } = configData;
    if (!token) {
      const err = new Error('Access token or API key is required');
      err.statusCode = 400;
      throw err;
    }

    const encryptedToken = encrypt(token);
    const encryptedRefresh = refreshToken ? encrypt(refreshToken) : null;

    const connection = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        status: 'connected',
        accessToken: encryptedToken,
        refreshToken: encryptedRefresh,
        tokenExpiry: expiry ? new Date(expiry) : null,
        error: null,
      },
      { upsert: true, new: true }
    );

    return {
      provider,
      connected: true,
      updatedAt: connection.updatedAt,
    };
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

/**
 * Initiate OAuth redirect urls
 */
function getOAuthStartUrl(provider) {
  if (provider === 'gmail' || provider === 'google-sheets') {
    const scopes = provider === 'gmail'
      ? ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.profile']
      : ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.readonly'];
      
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(env.GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `access_type=offline&` +
      `prompt=consent`;
    return url;
  }
  
  if (provider === 'slack') {
    return `https://slack.com/oauth/v2/authorize?` +
      `client_id=${env.SLACK_CLIENT_ID}&` +
      `scope=chat:write,channels:read,chat:write.public&` +
      `redirect_uri=${encodeURIComponent(env.SLACK_REDIRECT_URI)}`;
  }

  if (provider === 'discord') {
    return `https://discord.com/api/oauth2/authorize?` +
      `client_id=${env.DISCORD_CLIENT_ID}&` +
      `permissions=2048&` +
      `scope=bot&` +
      `redirect_uri=${encodeURIComponent(env.DISCORD_REDIRECT_URI)}`;
  }

  throw new Error(`OAuth not supported for provider: ${provider}`);
}

/**
 * OAuth code callback callback logic
 */
async function handleOAuthCallback(provider, code, userId) {
  try {
    let accessToken = '';
    let refreshToken = '';
    let tokenExpiry = null;
    let scopes = [];

    if (provider === 'gmail' || provider === 'google-sheets') {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      });

      accessToken = response.data.access_token;
      refreshToken = response.data.refresh_token;
      tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      scopes = response.data.scope ? response.data.scope.split(' ') : [];
    } else if (provider === 'slack') {
      const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
        params: {
          code,
          client_id: env.SLACK_CLIENT_ID,
          client_secret: env.SLACK_CLIENT_SECRET,
          redirect_uri: env.SLACK_REDIRECT_URI,
        },
      });

      if (!response.data.ok) throw new Error(response.data.error || 'Slack OAuth callback failed');
      accessToken = response.data.access_token;
      scopes = response.data.scope ? response.data.scope.split(',') : [];
    }

    const encryptedToken = encrypt(accessToken);
    const encryptedRefresh = refreshToken ? encrypt(refreshToken) : null;

    const connection = await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        status: 'connected',
        accessToken: encryptedToken,
        refreshToken: encryptedRefresh,
        tokenExpiry,
        scopes,
        error: null,
      },
      { upsert: true, new: true }
    );

    return connection;
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    throw error;
  }
}

module.exports = {
  listIntegrations,
  getIntegrationStatus,
  connectDirectly,
  getOAuthStartUrl,
  handleOAuthCallback,
};
