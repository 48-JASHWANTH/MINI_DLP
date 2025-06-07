// controllers/patternController.js
const store = require('../store');

exports.getPatterns = (req, res) => {
    try {
        // Check if user is authenticated - if so, redirect to user-specific patterns
        if (req.user) {
            console.log('[patternController] User is authenticated, redirecting to user-specific patterns');
            return res.status(307).json({
                message: 'User is authenticated, please use /user-patterns endpoint instead',
                redirect: '/user-patterns'
            });
        }
        
        // For anonymous users, return global patterns
        const patterns = store.getCustomPatterns();
        console.log('[patternController] getPatterns - Retrieved global custom patterns:', patterns.length);
        console.log('[patternController] Current patterns:', JSON.stringify(patterns, null, 2));
        res.json(patterns);
    } catch (error) {
        console.error('[patternController] Error fetching patterns:', error);
        res.status(500).json({ error: 'Error fetching patterns' });
    }
};

exports.addPattern = (req, res) => {
    const { name, pattern, requiresValidation = false } = req.body;
    console.log('[patternController] addPattern - Request received:', { name, pattern, requiresValidation });
    
    // Check if user is authenticated - if so, redirect to user-specific patterns
    if (req.user) {
        console.log('[patternController] User is authenticated, redirecting to user-specific patterns');
        return res.status(307).json({
            message: 'User is authenticated, please use /user-patterns endpoint instead',
            redirect: '/user-patterns'
        });
    }
    
    if (!name || !pattern) {
        console.error('[patternController] addPattern - Missing required fields');
        return res.status(400).json({ error: 'Name and pattern are required' });
    }
    try {
        // Validate that the pattern is a valid regex
        console.log('[patternController] addPattern - Validating regex pattern:', pattern);
        new RegExp(pattern);
        
        // Add the pattern with requiresValidation field
        const newPattern = { 
            name, 
            pattern, 
            requiresValidation: Boolean(requiresValidation),
            isCustom: true
        };
        
        store.addPattern(newPattern);
        console.log('[patternController] addPattern - Pattern added successfully:', JSON.stringify(newPattern, null, 2));
        console.log('[patternController] Current custom patterns count:', store.getCustomPatterns().length);
        
        res.json({ message: 'Pattern added successfully' });
    } catch (error) {
        console.error('[patternController] Error adding pattern:', error);
        res.status(400).json({ error: 'Invalid regex pattern' });
    }
};

exports.deletePattern = (req, res) => {
    // Check if user is authenticated - if so, redirect to user-specific patterns
    if (req.user) {
        console.log('[patternController] User is authenticated, redirecting to user-specific patterns');
        return res.status(307).json({
            message: 'User is authenticated, please use /user-patterns endpoint instead',
            redirect: '/user-patterns'
        });
    }

    const index = parseInt(req.params.index);
    console.log('[patternController] deletePattern - Deleting pattern at index:', index);
    
    try {
        store.deletePattern(index);
        console.log('[patternController] deletePattern - Pattern deleted successfully');
        console.log('[patternController] Remaining custom patterns:', store.getCustomPatterns().length);
        
        res.json({ message: 'Pattern deleted successfully' });
    } catch (error) {
        console.error('[patternController] Error deleting pattern:', error);
        res.status(500).json({ error: 'Error deleting pattern' });
    }
};