const mongoose = require('mongoose')
require('dotenv').config();
const DB_URL = process.env.DB_URL

mongoose.connect(DB_URL)
.then(()=>{
    console.log('MongoDB is Connected')
}).catch((err)=>{
    console.log('Error while mongoDB connection:',err)
})