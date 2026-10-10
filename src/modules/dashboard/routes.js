import { Router } from 'express';
import { requireDatabase } from '../../middleware/require-database.js';
import { createDashboardRepository } from './repository.js';

export function createDashboardRouter(database) {
  const router = Router();
  router.use(requireDatabase(database));
  const repository = createDashboardRepository(database);
  router.get('/', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ data: await repository.summarize() });
  });
  return router;
}
