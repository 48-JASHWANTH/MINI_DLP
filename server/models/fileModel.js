const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'social-logins',
    default: null
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  isMasked: {
    type: Boolean,
    default: false
  },
  originalFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  processedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const FileModel = mongoose.model('File', FileSchema);
module.exports = FileModel; 