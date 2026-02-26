const express = require('express');
const router = express.Router();

// Placeholder routes for Projects
router.get('/', (req, res) => res.json({ message: 'GET all projects' }));
router.post('/', (req, res) => res.json({ message: 'POST create project' }));
router.get('/:id', (req, res) => res.json({ message: 'GET project by ID' }));
router.delete('/:id', (req, res) => res.json({ message: 'DELETE project' }));

module.exports = router;
