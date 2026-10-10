import { Router } from 'express';
import { requireDatabase } from '../../middleware/require-database.js';
import { createBugRepository } from './repository.js';
import { createBugService } from './service.js';
import { createBugController } from './controller.js';

export function createBugRouter(database) {
  const router = Router();
  router.use(requireDatabase(database));
  const controller = createBugController(createBugService(createBugRepository(database)));
  router.route('/').get(controller.list).post(controller.create);
  router.route('/:id').get(controller.detail).patch(controller.update);
  return router;
}
