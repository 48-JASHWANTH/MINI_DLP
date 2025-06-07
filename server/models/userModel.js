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
    fileType: String
  }]
}, { timestamps: true });

const UserModel = mongoose.model("social-logins", UserSchema);
module.exports = UserModel;
