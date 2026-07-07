const integrationService = require('../services/integrationService');

async function listIntegrations(req, res, next) {
  try {
    const list = await integrationService.listIntegrations(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
}

async function getStatus(req, res, next) {
  try {
    const status = await integrationService.getIntegrationStatus(req.user.id);
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
}

async function connectDirect(req, res, next) {
  try {
    const { provider, token, refreshToken, expiry } = req.body;
    const result = await integrationService.connectDirectly(
      provider,
      { token, refreshToken, expiry },
      req.user.id
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function startOAuth(req, res, next) {
  try {
    const { provider } = req.params;
    const redirectUrl = integrationService.getOAuthStartUrl(provider);
    res.status(200).json({ success: true, data: { redirectUrl } });
  } catch (error) {
    next(error);
  }
}

async function handleOAuthCallback(req, res, next) {
  try {
    const { provider } = req.params;
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/integrations?error=missing_code`);
    }

    await integrationService.handleOAuthCallback(provider, code, req.user.id);
    res.redirect(`${process.env.CLIENT_URL}/integrations?success=true`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listIntegrations,
  getStatus,
  connectDirect,
  startOAuth,
  handleOAuthCallback,
};
