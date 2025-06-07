/**
 * Test script for user pattern detection
 * This script simulates user pattern detection without database access
 */

const { processText } = require('./controllers/documentController');
const store = require('./store');

console.log('=== USER PATTERN DETECTION TEST ===');

// 1. Create simulated user with patterns
const simulatedUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  customPatterns: [
    {
      name: 'EmployeeID',
      pattern: 'EMP-\\d{5}',
      requiresValidation: false
    },
    {
      name: 'ProjectCode',
      pattern: 'PROJ-[A-Z]{2}\\d{3}',
      requiresValidation: false
    },
    {
      name: 'CustomPhone',
      pattern: 'TEL-\\d{10}',
      requiresValidation: true
    }
  ]
};

console.log('Simulated user created with custom patterns:', simulatedUser.customPatterns.length);
console.log('Custom patterns:');
simulatedUser.customPatterns.forEach((pattern, index) => {
  console.log(`${index + 1}. ${pattern.name}: ${pattern.pattern}`);
});

// 2. Create a test document with examples of these patterns
const testDocument = `
This is a test document with custom patterns:

Employee: EMP-12345
Project: PROJ-AB123
Custom phone: TEL-9876543210

Also includes standard patterns:
Email: test@example.com
Phone: 9876543210
PAN: ABCDE1234F
Aadhaar: 1234 5678 9012
`;

console.log('\nTest document created with examples of custom and standard patterns');

// 3. Convert user patterns to the format expected by processText
const userPatterns = simulatedUser.customPatterns.map(p => ({
  name: p.name,
  pattern: p.pattern,
  requiresValidation: p.requiresValidation,
  isCustom: true
}));

// 4. Test with user patterns only
console.log('\n=== TESTING WITH USER PATTERNS ONLY ===');
const userOnlyMatches = processText(testDocument, userPatterns, false);
console.log('Detected patterns:', userOnlyMatches.length);
console.log('Pattern names:', userOnlyMatches.map(m => m.patternName).join(', '));

// 5. Test with both user and default patterns
console.log('\n=== TESTING WITH USER AND DEFAULT PATTERNS ===');
const allMatches = processText(testDocument, userPatterns, true);
console.log('Detected patterns:', allMatches.length);
console.log('Pattern names:', allMatches.map(m => m.patternName).join(', '));

// 6. Display detailed results
console.log('\n=== DETAILED RESULTS ===');
allMatches.forEach(pattern => {
  console.log(`\nPattern: ${pattern.patternName} (custom: ${pattern.isCustom})`);
  
  let totalMatches = 0;
  pattern.matches.forEach(match => {
    console.log(`  Line ${match.line}: ${match.matches.join(', ')}`);
    totalMatches += match.matches.length;
  });
  
  console.log(`  Total matches: ${totalMatches}`);
});

// 7. Verify that the global store is not affected
console.log('\n=== VERIFY GLOBAL STORE ===');
console.log('Global store custom patterns count:', store.getCustomPatterns().length); 