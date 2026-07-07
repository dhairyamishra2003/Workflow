const express = require('express');
const executionController = require('../controllers/executionController');
const auth = require('../middleware/auth');

const router = express.Router();

// Auth required for execution interaction
router.use(auth);

router.get('/', executionController.listExecutions);
router.get('/:id', executionController.getExecution);
router.get('/:id/timeline', executionController.getTimeline);

router.post('/:id/pause', executionController.pauseExecution);
router.post('/:id/resume', executionController.resumeExecution);
router.post('/:id/cancel', executionController.cancelExecution);

module.exports = router;
