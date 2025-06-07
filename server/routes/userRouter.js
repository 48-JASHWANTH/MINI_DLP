const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// User profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// User files routes
router.get('/files', userController.getUserFiles);
router.delete('/files/:fileId', userController.deleteUserFile);

module.exports = router; 