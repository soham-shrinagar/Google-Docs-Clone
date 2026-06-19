import { prisma } from '../lib/prisma.js';
import { crdtSyncService } from './crdt-sync.service.js';

const SESSION_TTL_MS = 2 * 60 * 1000;

export class AnalyticsService {
  private metrics = {
    operationsPerSecond: 0,
    mergeCount: 0,
    totalOperations: 0,
    wsLatencySum: 0,
    wsLatencyCount: 0,
    syncTimeSum: 0,
    syncTimeCount: 0,
    mergeTimeSum: 0,
    mergeTimeCount: 0,
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

  recordMerge(durationMs?: number) {
    this.metrics.mergeCount++;
    if (durationMs != null) {
      this.metrics.mergeTimeSum += durationMs;
      this.metrics.mergeTimeCount++;
    }
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
    const cutoff = new Date(Date.now() - SESSION_TTL_MS);
    await prisma.activeSession.deleteMany({ where: { lastActive: { lt: cutoff } } });

    const recentWhere = { lastActive: { gte: cutoff } };
    const [dbSessions, distinctUsers, distinctDocs] = await Promise.all([
      prisma.activeSession.count({ where: recentWhere }),
      prisma.activeSession.findMany({
        where: recentWhere,
        distinct: ['userId'],
        select: { userId: true },
      }),
      prisma.activeSession.findMany({
        where: { ...recentWhere, documentId: { not: null } },
        distinct: ['documentId'],
        select: { documentId: true },
      }),
    ]);

    const roomStats = crdtSyncService.getRoomStats();
    const liveConnections = Object.values(roomStats).reduce((sum, n) => sum + n, 0);
    const liveDocuments = Object.values(roomStats).filter((n) => n > 0).length;

    const uptime = Date.now() - this.metrics.startTime;
    const avgWsLatency =
      this.metrics.wsLatencyCount > 0
        ? this.metrics.wsLatencySum / this.metrics.wsLatencyCount
        : 0;
    const avgSyncTime =
      this.metrics.syncTimeCount > 0
        ? this.metrics.syncTimeSum / this.metrics.syncTimeCount
        : 0;
    const avgMergeTime =
      this.metrics.mergeTimeCount > 0
        ? this.metrics.mergeTimeSum / this.metrics.mergeTimeCount
        : 0;

    const memUsage = process.memoryUsage();

    return {
      connectedUsers: liveConnections || distinctUsers.length,
      documentsOpen: liveDocuments || distinctDocs.length,
      operationsPerSecond: this.metrics.operationsPerSecond,
      crdtMergeCount: this.metrics.mergeCount,
      totalOperations: this.metrics.totalOperations,
      wsLatency: Math.round(avgWsLatency),
      syncTime: Math.round(avgSyncTime),
      avgMergeTime: Math.round(avgMergeTime),
      activeSessions: liveConnections || dbSessions,
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
