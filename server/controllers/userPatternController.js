const UserModel = require('../models/userModel');

// Get patterns for a user (only user's custom patterns)
exports.getPatterns = async (req, res) => {
  try {
    // Get user's custom patterns
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select('customPatterns');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return only custom patterns
    res.status(200).json({
      customPatterns: user.customPatterns || []
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a new pattern for a user
exports.addPattern = async (req, res) => {
  try {
    const { name, pattern, requiresValidation } = req.body;
    
    if (!name || !pattern) {
      return res.status(400).json({ error: 'Name and pattern are required' });
    }
    
    // Validate regex pattern
    try {
      new RegExp(pattern);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid regex pattern' });
    }
    
    const userId = req.user._id;
    
    // Check if pattern name already exists for this user
    const existingPattern = await UserModel.findOne({
      _id: userId,
      'customPatterns.name': name
    });
    
    if (existingPattern) {
      return res.status(400).json({ error: 'Pattern name already exists' });
    }
    
    // Add new pattern to user's customPatterns array
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          customPatterns: {
            name,
            pattern,
            requiresValidation: !!requiresValidation
          }
        }
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(201).json({
      message: 'Pattern added successfully',
      pattern: updatedUser.customPatterns[updatedUser.customPatterns.length - 1]
    });
  } catch (error) {
    console.error('Error adding pattern:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user's pattern
exports.updatePattern = async (req, res) => {
  try {
    const { patternId } = req.params;
    const { name, pattern, requiresValidation } = req.body;
    
    if (!name || !pattern) {
      return res.status(400).json({ error: 'Name and pattern are required' });
    }
    
    // Validate regex pattern
    try {
      new RegExp(pattern);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid regex pattern' });
    }
    
    const userId = req.user._id;
    
    // Update pattern in user's customPatterns array
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        'customPatterns._id': patternId
      },
      {
        $set: {
          'customPatterns.$.name': name,
          'customPatterns.$.pattern': pattern,
          'customPatterns.$.requiresValidation': !!requiresValidation
        }
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'Pattern or user not found' });
    }
    
    const updatedPattern = updatedUser.customPatterns.find(
      p => p._id.toString() === patternId
    );
    
    res.status(200).json({
      message: 'Pattern updated successfully',
      pattern: updatedPattern
    });
  } catch (error) {
    console.error('Error updating pattern:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user's pattern
exports.deletePattern = async (req, res) => {
  try {
    const { patternId } = req.params;
    const userId = req.user._id;
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          customPatterns: { _id: patternId }
        }
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Pattern deleted successfully',
      patternId
    });
  } catch (error) {
    console.error('Error deleting pattern:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 