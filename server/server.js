const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();
const store = require('./store');

// Configure CORS
const corsOptions = {
    origin: ["http://localhost:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}

// Load environment variables
require('dotenv').config();
require('./models/dbConnection')

// Load routers
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const userPatternRouter = require('./routes/userPatternRouter')

const PORT = process.env.PORT || 5000;

// Verify pattern system at startup
function verifyPatternSystem() {
  console.log('\n========== PATTERN SYSTEM VERIFICATION ==========');
  console.log('Default patterns loaded:', store.getDefaultPatterns().length);
  console.log('Custom patterns at startup:', store.getCustomPatterns().length);
  
  // Add a test pattern
  const testPattern = {
    name: "StartupTestPattern",
    pattern: "TEST-\\d{4}",
    requiresValidation: false,
    isCustom: true
  };
  
  console.log('\nAdding test pattern...');
  store.addPattern(testPattern);
  
  // Verify pattern was added
  const patternsAfterAdd = store.getCustomPatterns();
  console.log('Custom patterns after adding test pattern:', patternsAfterAdd.length);
  
  if (patternsAfterAdd.length > 0) {
    console.log('First pattern:', patternsAfterAdd[0].name);
  }
  
  // Test pattern detection
  const testText = "This is a test with pattern TEST-1234";
  console.log('\nTesting pattern detection with text:', testText);
  
  const matches = require('./controllers/documentController').processText(testText, patternsAfterAdd, false);
  console.log('Test detection results - patterns found:', matches.length);
  
  if (matches.length > 0) {
    console.log('Detected patterns:', matches.map(m => m.patternName).join(', '));
  } else {
    console.log('WARNING: No patterns detected in test!');
  }
  
  // Clean up test pattern
  store.customPatterns = [];
  console.log('\nTest pattern removed. Custom patterns count:', store.getCustomPatterns().length);
  console.log('========== PATTERN SYSTEM VERIFICATION COMPLETE ==========\n');
}

// Apply middleware
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/',(req,res)=>{
  res.send("hello from auth server")
})
app.use('/api', routes);
app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/user-patterns', userPatternRouter)

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  verifyPatternSystem();
  console.log(`
  ===========================================
  =  MINI-DLP Server with Custom Patterns  =
  ===========================================
  Default patterns: ${store.getDefaultPatterns().length}
  Custom patterns: ${store.getCustomPatterns().length}
  Server ready to process documents
  `);
});