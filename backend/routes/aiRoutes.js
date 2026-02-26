const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/task-intent', aiController.processTaskIntent);
router.post('/generate-doc', aiController.generateDocument);
router.post('/export-word', aiController.exportWord);
router.post('/chat', aiController.chatWithAssistant);

module.exports = router;
