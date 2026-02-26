const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Routes for Users
router.post('/login', (req, res) => res.json({ message: 'POST login' }));
router.get('/employees', userController.getEmployees);
router.post('/employees', userController.createUser);

module.exports = router;
