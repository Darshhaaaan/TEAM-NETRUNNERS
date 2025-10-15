require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const login = require('./users/login');
const verify = require('./users/verify')
const farmer = require('./users/farmersAuth')
const farmersDashboard = require('./routes/farmersDashboard');
const message = require('./message/chat')

const app = express();
const pool = require('./db');

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users', login);
app.use('/auth', verify); 
app.use('/farmers', farmer)
app.use('/farmer', farmersDashboard);
app.use('/chat',message);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Farm2Customer API running');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
