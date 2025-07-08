const express = require('express');
const router = express.Router();
const patternController = require('../controllers/patternController');
const documentController = require('../controllers/documentController');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');


// Document processing routes (with optional auth)
// The middleware will attach the user to req if authenticated, but allow guests to proceed
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[optionalAuth] No auth token, proceeding as guest');
    return next();
  }
  
  // If there is an auth header, try to authenticate
  authMiddleware(req, res, (err) => {
    if (err) {
      // If authentication fails, still proceed as guest
      console.log('[optionalAuth] Auth failed, proceeding as guest');
      return next();
    }
    console.log('[optionalAuth] User authenticated:', req.user._id);
    next();
  });
};

// Test route to debug API issues
router.get('/test-route', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Test route working!' });
});

// Pattern routes (with optional auth)
router.get('/patterns', optionalAuth, patternController.getPatterns);
router.post('/patterns', optionalAuth, patternController.addPattern);
router.delete('/patterns/:index', optionalAuth, patternController.deletePattern);

// Apply optional auth to document routes
router.post('/check-text', optionalAuth, documentController.checkText);
router.post('/upload-file', optionalAuth, upload.single('file'), documentController.processFile);
router.post('/save-processed-files', authMiddleware, documentController.saveProcessedFiles);
router.post('/talk-to-pdf', authMiddleware, documentController.talkToPdf);
router.get('/view/:fileId', documentController.viewFile);
router.get('/download/:fileId', documentController.downloadFile);
router.get('/analytics', authMiddleware, documentController.getAnalytics); // Analytics requires authentication

module.exports = router;