import { createServer } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { parse } from 'url';
import app from './app.js';
import { config } from './config/index.js';
import { crdtSyncService } from './services/crdt-sync.service.js';
import { prisma } from './lib/prisma.js';

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

server.listen(config.port, () => {
  console.log(`CollabDocs server running on port ${config.port}`);
  console.log(`WebSocket endpoint: ws://localhost:${config.port}/ws`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});
