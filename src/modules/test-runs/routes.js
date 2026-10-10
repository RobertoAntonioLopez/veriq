import { Router } from 'express';
import { requireDatabase } from '../../middleware/require-database.js';
import { createTestRunRepository } from './repository.js';
import { createTestRunService } from './service.js';
import { createTestRunController } from './controller.js';

export function createTestRunRouter(database) {
  const router = Router();
  router.use(requireDatabase(database));
  const controller = createTestRunController(createTestRunService(createTestRunRepository(database)));
  router.route('/').get(controller.list).post(controller.create);
  router.get('/:id', controller.detail);
  return router;
}
