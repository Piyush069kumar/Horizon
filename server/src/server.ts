import http from 'http';
import { app } from './app';
import { env } from './config/env';
import { initSocketServer } from './sockets/socketServer';
import { initOverdueTaskJob } from './jobs/overdueJob';

import { prisma } from './repositories/prisma';
import { seedDatabase } from './services/autoSeedService';

const server = http.createServer(app);

// Initialize WebSockets
const io = initSocketServer(server);

// Initialize Background Cron Jobs
const overdueJob = initOverdueTaskJob();

const PORT = parseInt(env.PORT, 10) || 3000;

server.listen(PORT, async () => {
  console.log(`⚡ Horizon Backend Server running on port ${PORT} [${env.NODE_ENV}]`);

  // Auto-seed database on boot if database has zero users
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('🌱 Empty database detected! Running automatic seed...');
      await seedDatabase();
      console.log('✅ Automatic seed complete!');
    }
  } catch (err) {
    console.log('🌱 Database boot check:', err instanceof Error ? err.message : err);
  }
});

// --- Graceful Shutdown Lifecycle ---
let isShuttingDown = false;

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 [${signal}] Signal received. Starting graceful shutdown...`);

  // 1. Stop background cron jobs
  try {
    overdueJob.stop();
    console.log('⏰ Overdue background cron job stopped.');
  } catch (err) {
    console.error('Error stopping cron job:', err);
  }

  // 2. Disconnect Socket.IO clients cleanly
  try {
    io.close();
    console.log('🔌 Socket.IO connections closed cleanly.');
  } catch (err) {
    console.error('Error closing Socket.IO:', err);
  }

  // 3. Stop accepting new HTTP requests and finish in-flight requests
  server.close(async () => {
    console.log('🔒 HTTP server closed (no new incoming connections).');

    // 4. Disconnect Prisma database pool cleanly
    try {
      await prisma.$disconnect();
      console.log('📦 PostgreSQL connection pool closed cleanly.');
      console.log('✅ Graceful shutdown completed. Exiting process.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error disconnecting database:', err);
      process.exit(1);
    }
  });

  // Failsafe timeout: force exit after 10s if in-flight connections hang
  setTimeout(() => {
    console.error('⚠️ Shutdown timeout exceeded (10s). Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
