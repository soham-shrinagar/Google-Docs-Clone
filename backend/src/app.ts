import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import versionRoutes from './routes/version.routes.js';
import presenceRoutes from './routes/presence.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import templateRoutes from './routes/template.routes.js';
import commentRoutes from './routes/comment.routes.js';
import aiRoutes from './routes/ai.routes.js';
import aiUserRoutes from './routes/ai-user.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(backendDir, '../uploads');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api', apiLimiter);

app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/documents/:documentId/comments', commentRoutes);
app.use('/api/documents/:documentId/ai', aiRoutes);
app.use('/api/ai', aiUserRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents/:documentId/versions', versionRoutes);
app.use('/api/documents/:documentId/presence', presenceRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
