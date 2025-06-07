const fs = require('fs');
const path = require('path');
const { processText } = require('./controllers/documentController');
const store = require('./store');

// This makes the processText function available for testing
if (typeof processText !== 'function') {
  console.error('Error: processText function is not exported from documentController.js');
  process.exit(1);
}

// Read the test file
const testFilePath = path.join(__dirname, 'test-files', 'test-sensitive-data.txt');
try {
  const text = fs.readFileSync(testFilePath, 'utf8');
  console.log('Test file loaded successfully.\n');
  
  // Process the text
  const matches = processText(text, [], true);
  
  console.log('=== DETECTION RESULTS ===');
  console.log(`Total pattern types detected: ${matches.length}`);
  
  // Count total matches
  const totalMatches = matches.reduce((acc, pattern) => {
    const patternMatchCount = pattern.matches.reduce((patternAcc, match) => {
      return patternAcc + match.matches.length;
    }, 0);
    return acc + patternMatchCount;
  }, 0);
  
  console.log(`Total matches found: ${totalMatches}\n`);
  
  // Check which patterns were found
  const expectedPatterns = [
    "PAN", "Aadhaar", "IndianPassport", "Email", "PhoneNumber", 
    "CreditCard", "IPv4", "IPv6", "MACAddress", "SSN", "URL", "Date"
  ];
  
  console.log('Pattern detection status:');
  expectedPatterns.forEach(patternName => {
    const found = matches.some(m => m.patternName === patternName);
    console.log(`- ${patternName}: ${found ? 'DETECTED ✓' : 'NOT DETECTED ✗'}`);
  });
  
  console.log('\nDetailed results:');
  matches.forEach(pattern => {
    console.log(`Pattern: ${pattern.patternName}`);
    pattern.matches.forEach(match => {
      console.log(`  Line ${match.line}: ${match.matches.join(', ')}`);
    });
    console.log('');
  });
  
} catch (error) {
  console.error('Error running test:', error.message);
} 