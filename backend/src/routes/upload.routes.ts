import { Router, type Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(backendDir, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf',
  '.docx', '.txt', '.md',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'application/octet-stream': '',
};

function resolveExtension(mimetype: string, originalname: string): string | null {
  const fromMime = MIME_TO_EXT[mimetype];
  if (fromMime) return fromMime || path.extname(originalname).toLowerCase();

  const ext = path.extname(originalname).toLowerCase();
  if (ALLOWED_EXT.has(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  return null;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = resolveExtension(file.mimetype, file.originalname) || '.bin';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (resolveExtension(file.mimetype, file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDF, Word (.docx), and text files are allowed'));
    }
  },
});

const router = Router();

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      res.status(400).json({ error: message });
      return;
    }

    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const ext = path.extname(req.file.filename).toLowerCase();
      const isPdf = req.file.mimetype === 'application/pdf' || ext === '.pdf';
      const isDoc =
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        ext === '.docx';
      const isText = ext === '.txt' || ext === '.md' || req.file.mimetype.startsWith('text/');
      const url = `/uploads/${req.file.filename}`;

      res.status(201).json({
        url,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        type: isPdf ? 'pdf' : isDoc ? 'docx' : isText ? 'text' : 'image',
      });
    } catch (uploadErr) {
      res.status(400).json({ error: uploadErr instanceof Error ? uploadErr.message : 'Upload failed' });
    }
  });
});

export default router;
