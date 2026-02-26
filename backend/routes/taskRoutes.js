const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Routes for Tasks
router.post('/', taskController.createTask);
router.get('/', (req, res) => res.json({ message: 'GET all tasks' }));
router.put('/:id', (req, res) => res.json({ message: 'PUT update task' }));
router.delete('/:id', (req, res) => res.json({ message: 'DELETE task' }));

module.exports = router;
