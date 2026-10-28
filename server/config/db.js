const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}).`);
    console.log('[Database] Initializing fallback in-memory MongoDB server (mongodb-memory-server)...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'imovies'
        }
      });
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB connected successfully at ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] ${err.message}`);
  });
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
