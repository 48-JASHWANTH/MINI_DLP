const UserModel = require('../models/userModel');
const FileModel = require('../models/fileModel');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Create a new folder
exports.createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Folder name is required" });
    }
    
    const user = await UserModel.findById(req.user._id);
    
    // Check if folder with same name already exists
    const folderExists = user.folders.some(folder => 
      folder.name.toLowerCase() === name.toLowerCase()
    );
    
    if (folderExists) {
      return res.status(400).json({ error: "A folder with this name already exists" });
    }
    
    // Create a new folder
    const newFolder = {
      _id: new mongoose.Types.ObjectId(),
      name,
      createdAt: new Date()
    };
    
    await UserModel.findByIdAndUpdate(
      req.user._id,
      { $push: { folders: newFolder } }
    );
    
    res.status(201).json({ 
      success: true, 
      folder: newFolder
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Error creating folder" });
  }
};

// Get all folders for a user
exports.getFolders = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    res.json({ folders: user.folders || [] });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Error fetching folders" });
  }
};

// Delete a folder
exports.deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }
    
    // Remove folder and update files that were in this folder
    await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { folders: { _id: folderId } },
        $set: { "processedFiles.$[elem].folderId": null }
      },
      { 
        arrayFilters: [{ "elem.folderId": folderId }],
        multi: true
      }
    );
    
    // Update files in the database to remove folder association
    await FileModel.updateMany(
      { userId: req.user._id, folderId: folderId },
      { $set: { folderId: null } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ error: "Error deleting folder" });
  }
};

// Move a file to a folder
exports.moveFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { folderId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID" });
    }
    
    // If folderId is provided, make sure it's valid
    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }
    
    const user = await UserModel.findById(req.user._id);
    
    // Find the file to update
    const fileIndex = user.processedFiles.findIndex(file => 
      file._id.toString() === fileId
    );
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // If folderId is provided, verify that the folder exists
    if (folderId) {
      const folderExists = user.folders.some(folder => 
        folder._id.toString() === folderId
      );
      
      if (!folderExists) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }
    
    // Update the file's folderId in user model
    await UserModel.updateOne(
      { 
        _id: req.user._id,
        "processedFiles._id": fileId
      },
      {
        $set: { "processedFiles.$.folderId": folderId || null }
      }
    );
    
    // Update the file's folderId in file model
    const fileInfo = user.processedFiles[fileIndex];
    if (fileInfo.highlightedVersion) {
      await FileModel.findByIdAndUpdate(
        fileInfo.highlightedVersion,
        { folderId: folderId || null }
      );
    }
    
    if (fileInfo.maskedVersion) {
      await FileModel.findByIdAndUpdate(
        fileInfo.maskedVersion,
        { folderId: folderId || null }
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({ error: "Error moving file" });
  }
};

// Bulk move files to a folder
exports.bulkMoveFiles = async (req, res) => {
  try {
    const { fileIds, folderId } = req.body;
    
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: "No files selected" });
    }
    
    // If folderId is provided, make sure it's valid
    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }
    
    // If folderId is provided, verify that the folder exists
    if (folderId) {
      const user = await UserModel.findById(req.user._id);
      const folderExists = user.folders.some(folder => 
        folder._id.toString() === folderId
      );
      
      if (!folderExists) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }
    
    // Get user to get file information
    const user = await UserModel.findById(req.user._id);
    
    // Update all files in the user model
    await UserModel.updateOne(
      { _id: req.user._id },
      {
        $set: { 
          "processedFiles.$[elem].folderId": folderId || null 
        }
      },
      { 
        arrayFilters: [{ "elem._id": { $in: fileIds } }],
        multi: true
      }
    );
    
    // Update files in the file model
    for (const fileId of fileIds) {
      const fileInfo = user.processedFiles.find(f => f._id.toString() === fileId);
      if (fileInfo) {
        if (fileInfo.highlightedVersion) {
          await FileModel.findByIdAndUpdate(
            fileInfo.highlightedVersion,
            { folderId: folderId || null }
          );
        }
        
        if (fileInfo.maskedVersion) {
          await FileModel.findByIdAndUpdate(
            fileInfo.maskedVersion,
            { folderId: folderId || null }
          );
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error moving files:", error);
    res.status(500).json({ error: "Error moving files" });
  }
};

// Get all files
exports.getUserFiles = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    res.json({ files: user.processedFiles || [] });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const user = await UserModel.findById(req.user._id);
    
    // Find the file to delete
    const file = user.processedFiles.find(f => f._id.toString() === fileId);
    
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Delete the files from the database
    if (file.highlightedVersion) {
      await FileModel.findByIdAndDelete(file.highlightedVersion);
    }
    
    if (file.maskedVersion) {
      await FileModel.findByIdAndDelete(file.maskedVersion);
    }
    
    // Remove the file from the user's processedFiles array
    await UserModel.findByIdAndUpdate(
      req.user._id,
      { $pull: { processedFiles: { _id: fileId } } }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
};

// Save processed files with folder information
exports.saveProcessedFiles = async (req, res) => {
  try {
    const { highlightedFileId, maskedFileId, folderId } = req.body;
    
    if (!highlightedFileId || !maskedFileId) {
      return res.status(400).json({ error: "Missing file information" });
    }
    
    // If folderId is provided, make sure it's valid
    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }
    
    // If folderId is provided, verify that the folder exists
    if (folderId) {
      const user = await UserModel.findById(req.user._id);
      const folderExists = user.folders.some(folder => 
        folder._id.toString() === folderId
      );
      
      if (!folderExists) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }
    
    // Get file information from database
    const highlightedFile = await FileModel.findById(highlightedFileId);
    const maskedFile = await FileModel.findById(maskedFileId);
    
    // Check if files exist
    if (!highlightedFile || !maskedFile) {
      return res.status(404).json({ error: "Processed files not found" });
    }
    
    // Update file folder IDs in database
    await FileModel.findByIdAndUpdate(highlightedFileId, { folderId: folderId || null });
    await FileModel.findByIdAndUpdate(maskedFileId, { folderId: folderId || null });
    
    // If there's an original file, update it too
    if (highlightedFile.originalFileId) {
      await FileModel.findByIdAndUpdate(
        highlightedFile.originalFileId,
        { folderId: folderId || null }
      );
    }
    
    // Check if this file is already in the user's processedFiles array
    const user = await UserModel.findById(req.user._id);
    const existingFile = user.processedFiles.find(file => 
      file.highlightedVersion && 
      file.highlightedVersion.toString() === highlightedFileId
    );
    
    if (existingFile) {
      // If file already exists in user's processedFiles, update its folder ID
      await UserModel.updateOne(
        { 
          _id: req.user._id, 
          "processedFiles.highlightedVersion": highlightedFileId 
        },
        { $set: { "processedFiles.$.folderId": folderId || null } }
      );
      
      res.status(200).json({ 
        success: true, 
        file: {
          ...existingFile,
          folderId: folderId || null
        },
        message: 'File updated with new folder' 
      });
    } else {
      // Create a new processed file entry
      const newFile = {
        _id: new mongoose.Types.ObjectId(),
        originalName: highlightedFile.originalName,
        highlightedVersion: highlightedFileId,
        maskedVersion: maskedFileId,
        processedAt: new Date(),
        fileSize: highlightedFile.fileSize + maskedFile.fileSize,
        fileType: highlightedFile.fileType,
        folderId: folderId || null
      };
      
      // Add the file to the user's processedFiles array
      await UserModel.findByIdAndUpdate(
        req.user._id,
        { $push: { processedFiles: newFile } }
      );
      
      res.status(201).json({ 
        success: true, 
        file: newFile,
        message: 'File added to user collection'
      });
    }
  } catch (error) {
    console.error("Error saving processed files:", error);
    res.status(500).json({ error: "Error saving processed files" });
  }
};