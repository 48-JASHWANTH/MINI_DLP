const UserModel = require('../models/userModel');
const fs = require('fs');
const path = require('path');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phoneNumber, organization, dateOfBirth, address } = req.body;
    
    // Find user and update profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name || undefined,
          phoneNumber: phoneNumber || undefined,
          organization: organization || undefined,
          dateOfBirth: dateOfBirth || undefined,
          address: address || undefined,
        }
      },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's processed files
exports.getUserFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select('processedFiles');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Sort files by processedAt in descending order (newest first)
    const sortedFiles = user.processedFiles.sort((a, b) => 
      new Date(b.processedAt) - new Date(a.processedAt)
    );
    
    res.status(200).json({ files: sortedFiles });
  } catch (error) {
    console.error('Error fetching user files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a processed file
exports.deleteUserFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const fileId = req.params.fileId;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the file in user's processedFiles
    const fileIndex = user.processedFiles.findIndex(
      file => file._id.toString() === fileId
    );
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file paths to delete from filesystem
    const fileToDelete = user.processedFiles[fileIndex];
    const processedDir = path.join(__dirname, '../processed');
    
    // Try to delete the physical files
    try {
      if (fileToDelete.highlightedVersion) {
        const highlightedPath = path.join(processedDir, fileToDelete.highlightedVersion);
        if (fs.existsSync(highlightedPath)) {
          fs.unlinkSync(highlightedPath);
        }
      }
      
      if (fileToDelete.maskedVersion) {
        const maskedPath = path.join(processedDir, fileToDelete.maskedVersion);
        if (fs.existsSync(maskedPath)) {
          fs.unlinkSync(maskedPath);
        }
      }
    } catch (fsError) {
      console.error('Error deleting physical files:', fsError);
      // Continue even if file deletion fails
    }
    
    // Remove file from user's processedFiles array
    user.processedFiles.splice(fileIndex, 1);
    await user.save();
    
    res.status(200).json({ 
      message: 'File deleted successfully',
      deletedFileId: fileId
    });
  } catch (error) {
    console.error('Error deleting user file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 