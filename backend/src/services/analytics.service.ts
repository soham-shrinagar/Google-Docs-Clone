import { prisma } from '../lib/prisma.js';

export class AnalyticsService {
  private metrics = {
    operationsPerSecond: 0,
    mergeCount: 0,
    totalOperations: 0,
    wsLatencySum: 0,
    wsLatencyCount: 0,
    syncTimeSum: 0,
    syncTimeCount: 0,
    startTime: Date.now(),
  };

  private opCounter = { count: 0, lastReset: Date.now() };

  recordOperation() {
    this.metrics.totalOperations++;
    this.opCounter.count++;
    const now = Date.now();
    if (now - this.opCounter.lastReset >= 1000) {
      this.metrics.operationsPerSecond = this.opCounter.count;
      this.opCounter.count = 0;
      this.opCounter.lastReset = now;
    }
  }

  recordMerge() {
    this.metrics.mergeCount++;
  }

  recordWsLatency(ms: number) {
    this.metrics.wsLatencySum += ms;
    this.metrics.wsLatencyCount++;
  }

  recordSyncTime(ms: number) {
    this.metrics.syncTimeSum += ms;
    this.metrics.syncTimeCount++;
  }

  async getMetrics() {
    const [connectedUsers, documentsOpen, activeSessions] = await Promise.all([
      prisma.activeSession.count(),
      prisma.activeSession.count({ where: { documentId: { not: null } } }),
      prisma.activeSession.count({ where: { lastActive: { gte: new Date(Date.now() - 5 * 60 * 1000) } } }),
    ]);

    const uptime = Date.now() - this.metrics.startTime;
    const avgWsLatency =
      this.metrics.wsLatencyCount > 0
        ? this.metrics.wsLatencySum / this.metrics.wsLatencyCount
        : 0;
    const avgSyncTime =
      this.metrics.syncTimeCount > 0
        ? this.metrics.syncTimeSum / this.metrics.syncTimeCount
        : 0;

    const memUsage = process.memoryUsage();

    return {
      connectedUsers,
      documentsOpen,
      operationsPerSecond: this.metrics.operationsPerSecond,
      crdtMergeCount: this.metrics.mergeCount,
      totalOperations: this.metrics.totalOperations,
      wsLatency: Math.round(avgWsLatency),
      syncTime: Math.round(avgSyncTime),
      avgMergeTime: Math.round(avgSyncTime),
      activeSessions,
      memoryUsage: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
      serverUptime: Math.round(uptime / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}

export const analyticsService = new AnalyticsService();
