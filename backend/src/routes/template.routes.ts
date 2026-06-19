import { Router, type Response } from 'express';
import { DOCUMENT_TEMPLATES } from '../data/templates.js';

const router = Router();

router.get('/', (_req, res: Response) => {
  res.json({
    templates: DOCUMENT_TEMPLATES.map(({ id, name, description, category, thumbnail, title }) => ({
      id,
      name,
      description,
      category,
      thumbnail,
      title,
    })),
  });
});

export default router;
