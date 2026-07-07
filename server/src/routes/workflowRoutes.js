const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const executionController = require('../controllers/executionController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes here require authentication
router.use(auth);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.listWorkflows);
router.post(
  '/generate',
  [
    body('prompt').notEmpty().withMessage('Prompt string is required').trim(),
  ],
  validate,
  workflowController.generateWorkflow
);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Workflow name is required').trim(),
  ],
  validate,
  workflowController.createWorkflow
);

router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', executionController.startExecution);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
