const fs = require('fs');
const path = require('path');
const { processText } = require('./controllers/documentController');
const store = require('./store');

// Helper function to print test results
function printResults(title, matches) {
  console.log(`\n=== ${title} ===`);
  console.log(`Patterns detected: ${matches.length}`);
  
  if (matches.length > 0) {
    console.log('Pattern names:', matches.map(m => m.patternName).join(', '));
    
    matches.forEach(pattern => {
      console.log(`\nPattern: ${pattern.patternName}`);
      console.log(`  isCustom: ${pattern.isCustom}`);
      console.log(`  requiresValidation: ${pattern.requiresValidation}`);
      
      let totalMatches = 0;
      pattern.matches.forEach(match => {
        console.log(`  Line ${match.line}: ${match.matches.join(', ')}`);
        totalMatches += match.matches.length;
      });
      console.log(`  Total matches: ${totalMatches}`);
    });
  } else {
    console.log('No matches found');
  }
}

console.log('=== CUSTOM PATTERN TEST ===');

// 1. First, check the initial state of patterns
console.log('Initial default patterns:', store.getDefaultPatterns().length);
console.log('Initial custom patterns:', store.getCustomPatterns().length);

// 2. Add a custom pattern that doesn't require validation
const customPattern = {
  name: "CustomID",
  pattern: "ID-\\d{6}",
  requiresValidation: false,
  isCustom: true
};

store.addPattern(customPattern);
console.log('\nAdded custom pattern:');
console.log(JSON.stringify(customPattern, null, 2));

// 3. Add a second custom pattern that requires validation
const validatedPattern = {
  name: "CustomPhoneNumber",
  pattern: "TEL-\\d{10}",
  requiresValidation: true,
  isCustom: true
};

store.addPattern(validatedPattern);
console.log('\nAdded validated custom pattern:');
console.log(JSON.stringify(validatedPattern, null, 2));

console.log('\nTotal custom patterns:', store.getCustomPatterns().length);

// 4. Test custom pattern without validation
const idText = "This is a test with a custom ID-123456 pattern.";
console.log('\nTest text for CustomID:', idText);
const idMatches = processText(idText, store.getCustomPatterns(), false);
printResults('CUSTOM ID PATTERN TEST', idMatches);

// 5. Test custom pattern with validation
const phoneText = "Contact us at TEL-9876543210 for more information.";
console.log('\nTest text for CustomPhoneNumber:', phoneText);
const phoneMatches = processText(phoneText, store.getCustomPatterns(), false);
printResults('CUSTOM PHONE PATTERN TEST', phoneMatches);

// 6. Test with an invalid phone number
const invalidText = "Invalid number: TEL-123 doesn't match the pattern.";
console.log('\nTest text with invalid phone format:', invalidText);
const invalidMatches = processText(invalidText, store.getCustomPatterns(), false);
printResults('INVALID PHONE PATTERN TEST', invalidMatches);

// 7. Test combined patterns
const combinedText = "Combined test with ID-123456 and TEL-9876543210 together.";
console.log('\nTest text with multiple custom patterns:', combinedText);
const combinedMatches = processText(combinedText, store.getCustomPatterns(), false);
printResults('COMBINED CUSTOM PATTERNS TEST', combinedMatches);

// 8. Test with both custom and default patterns
const withDefaultText = "ID-123456 with credit card 4111111111111111";
console.log('\nTest text with both custom and default patterns:', withDefaultText);
const withDefaultMatches = processText(withDefaultText, store.getCustomPatterns(), true);
printResults('CUSTOM + DEFAULT PATTERNS TEST', withDefaultMatches);

// 9. Clean up - remove added test patterns
store.customPatterns = [];
console.log('\nClean up - custom patterns count:', store.getCustomPatterns().length); 