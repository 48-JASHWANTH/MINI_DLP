/**
 * Verification script for user-specific patterns fix
 * 
 * This script demonstrates the flow of checking a document with user-specific patterns
 */

// Simulating the request environment
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// Import document controller and User model
const { processText } = require('./controllers/documentController');
const UserModel = require('./models/userModel');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Simulate the document checking process
const verifyPatternDetection = async () => {
  console.log('\n=== VERIFYING USER PATTERN DETECTION ===');
  
  try {
    // Find a user with custom patterns
    const user = await UserModel.findOne({ 'customPatterns.0': { $exists: true } });
    
    if (!user) {
      console.log('No users with custom patterns found. Creating a test user...');
      
      // Create a test user with patterns
      const testUser = new UserModel({
        name: 'Pattern Test User',
        email: 'pattern_test@example.com',
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
          }
        ]
      });
      
      await testUser.save();
      console.log('Test user created with custom patterns');
      
      // Use this user for verification
      return verifyWithUser(testUser);
    }
    
    return verifyWithUser(user);
    
  } catch (error) {
    console.error('Verification error:', error);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Verify pattern detection with a specific user
const verifyWithUser = async (user) => {
  console.log('\n=== USER INFORMATION ===');
  console.log('User ID:', user._id);
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Custom patterns:', user.customPatterns.length);
  
  // Display patterns
  console.log('\n=== USER CUSTOM PATTERNS ===');
  user.customPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern.name}: ${pattern.pattern} (validation: ${pattern.requiresValidation})`);
  });
  
  // Create a test document with these patterns
  console.log('\n=== CREATING TEST DOCUMENT ===');
  let testDocument = "This is a test document with some standard information:\n";
  testDocument += "Email: test@example.com\n";
  testDocument += "Phone: 9876543210\n\n";
  
  // Add examples using the user's patterns
  console.log('Adding examples for user patterns:');
  user.customPatterns.forEach(pattern => {
    try {
      // Create an example that would match the pattern
      let example = pattern.name + ': ';
      
      switch (pattern.name) {
        case 'EmployeeID':
          example += 'EMP-12345';
          break;
        case 'ProjectCode':
          example += 'PROJ-AB123';
          break;
        default:
          // For other patterns, try to generate an example
          example += pattern.pattern
            .replace(/\\d\{(\d+)\}/g, match => '1'.repeat(parseInt(match.match(/\d+/)[0])))
            .replace(/\\w\{(\d+)\}/g, match => 'a'.repeat(parseInt(match.match(/\d+/)[0])))
            .replace(/[\\[\](){}+*?^$|]/g, '');
      }
      
      console.log(`- Added example for ${pattern.name}: ${example}`);
      testDocument += example + '\n';
    } catch (error) {
      console.log(`- Could not create example for ${pattern.name}`);
    }
  });
  
  console.log('\nTest document:');
  console.log(testDocument);
  
  // Format user patterns for processText
  const userPatterns = user.customPatterns.map(p => ({
    name: p.name,
    pattern: p.pattern,
    requiresValidation: p.requiresValidation,
    isCustom: true
  }));
  
  // Test detection using user patterns
  console.log('\n=== TESTING PATTERN DETECTION ===');
  console.log('User patterns count:', userPatterns.length);
  
  // Detect with user patterns only
  console.log('\nTesting with user patterns only:');
  const userOnlyMatches = processText(testDocument, userPatterns, false);
  console.log('Detected patterns:', userOnlyMatches.length);
  console.log('Pattern names:', userOnlyMatches.map(m => m.patternName).join(', '));
  
  // Detect with all patterns
  console.log('\nTesting with user patterns AND default patterns:');
  const allMatches = processText(testDocument, userPatterns, true);
  console.log('Detected patterns:', allMatches.length);
  console.log('Pattern names:', allMatches.map(m => m.patternName).join(', '));
  
  // Show detection details
  console.log('\n=== DETECTION DETAILS ===');
  allMatches.forEach(pattern => {
    console.log(`\nPattern: ${pattern.patternName} (isCustom: ${pattern.isCustom})`);
    
    pattern.matches.forEach(match => {
      console.log(`  Line ${match.line}: ${match.matches.join(', ')}`);
    });
  });
  
  return true;
};

// Run the verification
console.log('Starting user pattern verification');
connectDB().then(connected => {
  if (connected) {
    verifyPatternDetection();
  } else {
    console.log('Failed to connect to database. Verification aborted.');
  }
}); 