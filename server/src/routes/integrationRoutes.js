const express = require('express');
const integrationController = require('../controllers/integrationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes for OAuth callbacks (redirect returns from providers)
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);

// Auth required for configuration management
router.use(auth);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.post('/', integrationController.connectDirect);
router.get('/oauth/:provider/start', integrationController.startOAuth);

module.exports = router;
