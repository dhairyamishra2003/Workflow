const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is empty, falling back to in-memory server');
    }

    await mongoose.connect(MONGODB_URI);
    // Ping to verify the replica set is fully reachable (handles Atlas whitelisting checks immediately)
    await mongoose.connection.db.admin().ping();
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`⚠️  MongoDB connection failed: ${err.message}`);
    
    // Fallback 1: Try local MongoDB service if it is running
    const localUri = 'mongodb://127.0.0.1:27017/agentflow_ai';
    console.log(`🔄 Attempting fallback to local MongoDB instance at ${localUri}...`);
    try {
      // Disconnect any active connections
      await mongoose.disconnect();
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
      await mongoose.connection.db.admin().ping();
      console.log('✅ Local MongoDB instance connected successfully!');
      return;
    } catch (localErr) {
      console.warn(`⚠️  Local MongoDB connection failed: ${localErr.message}`);
    }

    // Fallback 2: Try in-memory MongoDB server
    console.log('🔄 Fallback to starting in-memory MongoDB server...');
    try {
      await mongoose.disconnect();
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();

      await mongoose.connect(memoryUri);
      console.log(`✅ In-memory MongoDB connected: ${memoryUri}`);
      console.log('⚠️  Data will NOT persist between restarts');
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      console.warn('⚠️  Please check if local MongoDB is running, or verify your MongoDB Atlas IP whitelist / credentials.');
    }
  }
};

module.exports = connectDB;
