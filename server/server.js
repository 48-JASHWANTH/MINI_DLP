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
});