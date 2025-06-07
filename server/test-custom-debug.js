/**
 * Debug test for custom pattern detection
 * This script tests the integration between pattern storage and detection
 */

const fs = require('fs');
const path = require('path');
const { processText } = require('./controllers/documentController');
const store = require('./store');

console.log('=== CUSTOM PATTERN DEBUG TEST ===');
console.log('This test specifically focuses on troubleshooting custom pattern detection\n');

// 1. First, verify the initial state
console.log('=== INITIAL STATE ===');
console.log('Default patterns:', store.getDefaultPatterns().length);
console.log('Custom patterns:', store.getCustomPatterns().length);

// 2. Test with empty custom patterns array
console.log('\n=== TEST WITH EMPTY CUSTOM PATTERNS ===');
const testText1 = "This is a test with email test@example.com and ID-123456";
console.log('Test text:', testText1);

// Create an empty array explicitly
const emptyPatterns = [];
console.log('Empty patterns array created. Length:', emptyPatterns.length);

// Only use default patterns
const defaultMatches = processText(testText1, emptyPatterns, true);
console.log('\nProcessing with default patterns only:');
console.log('Detected patterns:', defaultMatches.length);
console.log('Pattern names:', defaultMatches.map(m => m.patternName).join(', '));

// 3. Add a custom pattern
console.log('\n=== ADDING CUSTOM PATTERN ===');
const customID = {
  name: "CustomID",
  pattern: "ID-\\d{6}",
  requiresValidation: false,
  isCustom: true
};
console.log('Custom pattern to add:', JSON.stringify(customID, null, 2));

// Add the pattern to the store
store.addPattern(customID);
console.log('Pattern added to store');
console.log('Current custom patterns count:', store.getCustomPatterns().length);

// Verify pattern is in the store
console.log('\nVerifying pattern is in store:');
const storedPatterns = store.getCustomPatterns();
console.log('Custom patterns from store:', storedPatterns.length);
console.log('First custom pattern:', JSON.stringify(storedPatterns[0], null, 2));

// 4. Test detection with custom pattern only
console.log('\n=== TEST WITH CUSTOM PATTERN ONLY ===');
console.log('Test text:', testText1);

// Use custom patterns only (no default patterns)
const customMatches = processText(testText1, store.getCustomPatterns(), false);
console.log('\nProcessing with custom patterns only:');
console.log('Detected patterns:', customMatches.length);
console.log('Pattern names:', customMatches.map(m => m.patternName).join(', '));

// 5. Test with both default and custom patterns
console.log('\n=== TEST WITH BOTH DEFAULT AND CUSTOM PATTERNS ===');
const combinedMatches = processText(testText1, store.getCustomPatterns(), true);
console.log('\nProcessing with both default and custom patterns:');
console.log('Detected patterns:', combinedMatches.length);
console.log('Pattern names:', combinedMatches.map(m => m.patternName).join(', '));

// 6. Debug custom pattern array handling
console.log('\n=== DEBUG CUSTOM PATTERN ARRAY HANDLING ===');
// Create a direct reference to the custom patterns
const directCustomPatterns = store.customPatterns;
console.log('Direct access to store.customPatterns length:', directCustomPatterns.length);
console.log('Custom patterns from store.getCustomPatterns() length:', store.getCustomPatterns().length);

// Ensure custom patterns are being passed correctly
console.log('\nVerify custom patterns are passed correctly to processText:');
const myCustomPatterns = [...store.getCustomPatterns()];
console.log('My custom patterns array length:', myCustomPatterns.length);
console.log('My custom patterns:', JSON.stringify(myCustomPatterns, null, 2));

// 7. Test with custom array that is a copy
console.log('\n=== TEST WITH CUSTOM ARRAY COPY ===');
const customOnlyMatches = processText(testText1, myCustomPatterns, false);
console.log('\nProcessing with copied custom patterns array:');
console.log('Detected patterns:', customOnlyMatches.length);
console.log('Pattern names:', customOnlyMatches.map(m => m.patternName).join(', '));

// 8. Clean up
console.log('\n=== CLEAN UP ===');
store.customPatterns = [];
console.log('Custom patterns cleared. Count:', store.getCustomPatterns().length); 