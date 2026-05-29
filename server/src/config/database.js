/**
 * Database Connection Configuration
 * 
 * Enterprise-grade MongoDB connection with:
 * - Connection retry logic with exponential backoff
 * - Graceful shutdown hooks
 * - Connection event listeners for monitoring
 * - Optimized connection pool settings
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college-management';
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

/**
 * MongoDB connection options optimized for production
 */
const connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  retryReads: true,
};

/**
 * Register global Mongoose plugins and settings
 */
const configureMongoose = () => {
  // Enable debug mode in development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', false); // Set to true for query logging
  }

  // Ensure indexes are built
  mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');
};

/**
 * Connect to MongoDB with retry logic
 * @param {number} retryCount - Current retry attempt
 */
const connectDB = async (retryCount = 0) => {
  try {
    configureMongoose();

    const conn = await mongoose.connect(MONGODB_URI, connectionOptions);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Pool Size: ${connectionOptions.maxPoolSize}`);

    // ─── Connection Event Listeners ──────────────────────
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully.');
    });

    // ─── Graceful Shutdown ───────────────────────────────
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Closing MongoDB connection...`);
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection attempt ${retryCount + 1} failed:`, error.message);

    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_INTERVAL_MS * Math.pow(2, retryCount); // Exponential backoff
      console.log(`⏳ Retrying in ${delay / 1000}s... (${MAX_RETRIES - retryCount - 1} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    }

    console.error('💀 Max retries reached. Could not connect to MongoDB.');
    process.exit(1);
  }
};

/**
 * Get the current database connection status
 * @returns {Object} Connection status info
 */
export const getConnectionStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection.readyState;

  return {
    status: states[state] || 'unknown',
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || null,
    port: mongoose.connection.port || null,
  };
};

export default connectDB;
