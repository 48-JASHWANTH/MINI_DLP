/**
 * Comprehensive test for MINI-DLP
 * Tests both default and custom patterns
 */

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

console.log('=== COMPREHENSIVE MINI-DLP TEST ===');
console.log('Testing all default and custom patterns\n');

// 1. First, check the initial state of patterns
console.log('Default patterns:', store.getDefaultPatterns().length);
console.log('Custom patterns:', store.getCustomPatterns().length);

// 2. Add custom patterns
const customPatterns = [
  {
    name: "CustomID",
    pattern: "ID-\\d{6}",
    requiresValidation: false,
    isCustom: true
  },
  {
    name: "CustomPhoneNumber",
    pattern: "TEL-\\d{10}",
    requiresValidation: true,
    isCustom: true
  },
  {
    name: "ProjectCode",
    pattern: "PROJ-[A-Z]{2}\\d{4}",
    requiresValidation: false,
    isCustom: true
  },
  {
    name: "EmployeeID",
    pattern: "EMP-\\d{5}",
    requiresValidation: true,
    isCustom: true
  }
];

// Add all custom patterns
customPatterns.forEach(pattern => {
  store.addPattern(pattern);
});

console.log(`Added ${customPatterns.length} custom patterns`);
console.log('Total custom patterns:', store.getCustomPatterns().length);

// 3. Create a test text with various patterns
const testText = `
This is a comprehensive test of the MINI-DLP system.

DEFAULT PATTERNS:
- PAN: ABCDE1234F
- Aadhaar: 234567890123
- Email: test@example.com
- Phone: +91 9876543210
- Credit Card: 4111111111111111
- SSN: 123-45-6789
- URL: https://example.com/test
- Date: 01/02/2023

CUSTOM PATTERNS:
- CustomID: ID-123456
- CustomPhone: TEL-9876543210
- ProjectCode: PROJ-AB1234
- EmployeeID: EMP-12345
`;

// 4. Test with only default patterns
console.log('\nTesting with default patterns only...');
const defaultMatches = processText(testText, [], true);
printResults('DEFAULT PATTERNS TEST', defaultMatches);

// 5. Test with only custom patterns
console.log('\nTesting with custom patterns only...');
const customMatches = processText(testText, store.getCustomPatterns(), false);
printResults('CUSTOM PATTERNS TEST', customMatches);

// 6. Test with both default and custom patterns
console.log('\nTesting with both default and custom patterns...');
const allMatches = processText(testText, store.getCustomPatterns(), true);
printResults('ALL PATTERNS TEST', allMatches);

// 7. Summary
console.log('\n=== TEST SUMMARY ===');
console.log(`Default patterns detected: ${defaultMatches.length}`);
console.log(`Custom patterns detected: ${customMatches.length}`);
console.log(`Total patterns detected: ${allMatches.length}`);

if (allMatches.length === defaultMatches.length + customMatches.length) {
  console.log('\n✅ TEST PASSED: All patterns detected correctly');
} else {
  console.log('\n❌ TEST FAILED: Unexpected pattern detection count');
}

// 8. Clean up - remove added test patterns
store.customPatterns = [];
console.log('\nClean up - custom patterns count:', store.getCustomPatterns().length); 