const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect the system to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected!'))
    .catch((err) => console.error('MongoDB Error: ', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Run Checking
app.get('/', (req, res) => res.json({message: 'QCU-Coop API is Running!'}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running on http://localhost:${PORT}`));