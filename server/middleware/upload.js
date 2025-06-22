const multer = require('multer');

// Configure multer to store files in memory instead of disk
const storage = multer.memoryStorage();

// Export the multer instance with memory storage
module.exports = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});