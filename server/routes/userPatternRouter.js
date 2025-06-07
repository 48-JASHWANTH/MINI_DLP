const express = require('express');
const router = express.Router();
const userPatternController = require('../controllers/userPatternController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Pattern routes
router.get('/', userPatternController.getPatterns);
router.post('/', userPatternController.addPattern);
router.put('/:patternId', userPatternController.updatePattern);
router.delete('/:patternId', userPatternController.deletePattern);

module.exports = router; 