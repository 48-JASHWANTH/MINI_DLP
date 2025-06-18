const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  organization: {
    type: String,
    default: ""
  },
  dateOfBirth: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "user"
  },
  customPatterns: [{
    name: {
      type: String,
      required: true
    },
    pattern: {
      type: String,
      required: true
    },
    requiresValidation: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  folders: [{
    name: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  processedFiles: [{
    originalName: String,
    highlightedVersion: String,
    maskedVersion: String,
    processedAt: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    fileType: String,
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    }
  }]
}, { timestamps: true });

const UserModel = mongoose.model("social-logins", UserSchema);
module.exports = UserModel;
