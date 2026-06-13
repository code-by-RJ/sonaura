const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// ─── Start server ────────────────────────────────────────────────────────────
const startServer = async () => {
  // Connect to MongoDB before accepting requests
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('┌─────────────────────────────────────────────┐');
    console.log('│           SONAURA API Server                 │');
    console.log('└─────────────────────────────────────────────┘');
    console.log(`  Mode   : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Port   : ${PORT}`);
    console.log(`  Health : http://localhost:${PORT}/api/health`);
    console.log('');
  });

  // ─── Graceful shutdown ──────────────────────────────────────────────────
  // Closes server before disconnecting DB — no in-flight requests dropped
  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('✅ Process terminated cleanly.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Render sends SIGTERM
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C in terminal

  // ─── Unhandled promise rejections ───────────────────────────────────────
  // Catch async errors not wrapped in catchAsync
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 Unhandled Promise Rejection:', reason);
    server.close(() => process.exit(1));
  });

  // ─── Uncaught exceptions ─────────────────────────────────────────────────
  // Synchronous errors that escaped try/catch — crash immediately (safe state unknown)
  process.on('uncaughtException', (error) => {
    console.error('🔥 Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
