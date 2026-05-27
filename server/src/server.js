import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();


// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
