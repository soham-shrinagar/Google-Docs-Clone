import { createServer } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { parse } from 'url';
import app from './app.js';
import { config } from './config/index.js';
import { crdtSyncService } from './services/crdt-sync.service.js';
import { initPrisma, prisma, verifyDatabaseConnection } from './lib/prisma.js';
import { isTransientDbError, getDbErrorMessage } from './lib/dbErrors.js';

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname, query } = parse(request.url || '', true);
  const wsMatch = pathname?.match(/^\/ws\/([^/]+)$/);

  if (wsMatch) {
    const documentId = wsMatch[1];
    const token = query.token as string;

    if (!documentId || !token) {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      crdtSyncService.handleConnection(ws as WebSocket & { isAlive?: boolean }, documentId, token);
      crdtSyncService.setupAwarenessForwarding(documentId);
    });
  } else {
    socket.destroy();
  }
});

const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    const client = ws as WebSocket & { isAlive?: boolean };
    if (client.isAlive === false) {
      client.terminate();
      return;
    }
    client.isAlive = false;
    client.ping();
  });
}, 30000);

wss.on('connection', (ws) => {
  const client = ws as WebSocket & { isAlive?: boolean };
  client.isAlive = true;
  client.on('pong', () => { client.isAlive = true; });
});

wss.on('close', () => clearInterval(heartbeat));

async function main() {
  try {
    await initPrisma();
  } catch (err) {
    console.error('Database init failed:', getDbErrorMessage(err));
    console.error('Fix WSL DNS: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf');
    console.error('Or set DATABASE_HOST=<neon-ipv4> in .env');
    process.exit(1);
  }

  server.listen(config.port, '0.0.0.0', async () => {
    console.log(`CollabDocs server running on port ${config.port}`);
    console.log(`WebSocket endpoint: ws://localhost:${config.port}/ws`);
    try {
      await verifyDatabaseConnection();
      console.log('Database connected');
    } catch (err) {
      console.error('Database connection failed:', getDbErrorMessage(err));
      if (isTransientDbError(err)) {
        console.error('Try DATABASE_HOST=<neon-ipv4> in .env or run from PowerShell instead of WSL.');
      }
    }
  });
}

main().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  if (isTransientDbError(reason)) {
    if (config.nodeEnv === 'development') {
      console.warn('Transient DB error (will retry):', getDbErrorMessage(reason));
    }
    return;
  }
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});
