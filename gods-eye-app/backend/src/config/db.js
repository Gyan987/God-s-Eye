const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('MongoDB connection failed. Starting in-memory MongoDB fallback.');
    const memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();
    await mongoose.connect(memUri);
    console.log('In-memory MongoDB connected');
  }
};

module.exports = connectDB;
