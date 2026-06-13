const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// ─── Connection Event Listeners ──────────────────────────────
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

// ─── Clean shutdown ──────────────────────────────────────────
const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed.');
};

module.exports = { connectDB, disconnectDB };
