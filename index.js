const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db.js');
const authRoutes = require('./routes/authRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes');
    
dotenv.config();            // Load .env variables

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test Route
app.get('/', (req, res) => {
  res.send('API is working 🎉');
});

// Routes
app.use('/api/auth/', authRoutes);
app.use('/api/upload', uploadRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
