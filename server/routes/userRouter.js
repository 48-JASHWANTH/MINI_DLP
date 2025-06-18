const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// User profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// User files routes
router.get('/files', folderController.getUserFiles);
router.delete('/files/:fileId', folderController.deleteFile);
router.put('/files/:fileId/move', folderController.moveFile);
router.post('/files/bulk-move', folderController.bulkMoveFiles);
router.post('/files/save', folderController.saveProcessedFiles);

// Folder management routes
router.get('/folders', folderController.getFolders);
router.post('/folders', folderController.createFolder);
router.delete('/folders/:folderId', folderController.deleteFolder);

module.exports = router;