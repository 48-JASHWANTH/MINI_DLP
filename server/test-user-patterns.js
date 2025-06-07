/**
 * Test script for user-specific patterns
 * This script simulates the behavior of using user-specific patterns
 */

const mongoose = require('mongoose');
const UserModel = require('./models/userModel');
const { processText } = require('./controllers/documentController');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test user patterns
const testUserPatterns = async () => {
  try {
    console.log('\n=== USER PATTERN TEST ===');
    
    // Find a user with custom patterns
    const usersWithPatterns = await UserModel.find({ 
      'customPatterns.0': { $exists: true } 
    }).limit(5);
    
    console.log(`Found ${usersWithPatterns.length} users with custom patterns`);
    
    if (usersWithPatterns.length === 0) {
      console.log('No users with custom patterns found. Creating test user...');
      
      // Create a test user with patterns
      const testUser = new UserModel({
        name: 'Test User',
        email: 'test_patterns@example.com',
        customPatterns: [
          {
            name: 'TestCustomID',
            pattern: 'ID-\\d{6}',
            requiresValidation: false
          },
          {
            name: 'TestPhoneNumber',
            pattern: 'TEST-\\d{10}',
            requiresValidation: true
          }
        ]
      });
      
      await testUser.save();
      console.log('Test user created with ID:', testUser._id);
      
      // Use the new test user
      testUserPatterns(testUser);
      return;
    }
    
    // Use the first user with patterns
    const testUser = usersWithPatterns[0];
    
    console.log('\n=== USER DETAILS ===');
    console.log('User ID:', testUser._id);
    console.log('Name:', testUser.name);
    console.log('Email:', testUser.email);
    console.log('Custom patterns count:', testUser.customPatterns.length);
    
    // Display user's custom patterns
    console.log('\n=== USER CUSTOM PATTERNS ===');
    testUser.customPatterns.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.name} (${pattern.pattern}, validation: ${pattern.requiresValidation})`);
    });
    
    // Create test text with the user's patterns
    console.log('\n=== CREATING TEST TEXT ===');
    let testText = "This is a test document with standard email test@example.com and phone 9876543210.\n";
    
    // Add examples using the user's patterns
    testUser.customPatterns.forEach(pattern => {
      // Extract a simple example from the pattern
      let example = '';
      try {
        // Replace basic regex components with example values
        example = pattern.pattern
          .replace(/\\d\{(\d+)\}/g, (match, num) => '1'.repeat(parseInt(num)))
          .replace(/\\w\{(\d+)\}/g, (match, num) => 'a'.repeat(parseInt(num)))
          .replace(/\\\\/g, '\\')
          .replace(/\\b/g, '')
          .replace(/\(/g, '')
          .replace(/\)/g, '')
          .replace(/\[/g, '')
          .replace(/\]/g, '')
          .replace(/\|/g, '');
          
        testText += `Example for ${pattern.name}: ${example}\n`;
      } catch (error) {
        console.log(`Could not create example for pattern ${pattern.name}`);
      }
    });
    
    console.log('Test text created:');
    console.log(testText);
    
    // Map the MongoDB document to the format expected by the processText function
    const formattedPatterns = testUser.customPatterns.map(p => ({
      name: p.name,
      pattern: p.pattern,
      requiresValidation: p.requiresValidation,
      isCustom: true
    }));
    
    console.log('\n=== TESTING PATTERN DETECTION ===');
    console.log('Using user patterns count:', formattedPatterns.length);
    
    // Process text with only user patterns
    const customMatches = processText(testText, formattedPatterns, false);
    console.log('\nCustom pattern detection results:');
    console.log('Detected patterns:', customMatches.length);
    console.log('Pattern names:', customMatches.map(m => m.patternName).join(', '));
    
    // Process text with both default and user patterns
    const allMatches = processText(testText, formattedPatterns, true);
    console.log('\nAll pattern detection results:');
    console.log('Detected patterns:', allMatches.length);
    console.log('Pattern names:', allMatches.map(m => m.patternName).join(', '));
    
    // Display detailed results
    console.log('\n=== DETAILED RESULTS ===');
    allMatches.forEach(pattern => {
      console.log(`\nPattern: ${pattern.patternName} (isCustom: ${pattern.isCustom})`);
      let totalMatches = 0;
      
      pattern.matches.forEach(match => {
        console.log(`  Line ${match.line}: ${match.matches.join(', ')}`);
        totalMatches += match.matches.length;
      });
      
      console.log(`  Total matches: ${totalMatches}`);
    });
    
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the test
connectDB().then(testUserPatterns); 