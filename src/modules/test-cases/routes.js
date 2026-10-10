import { Router } from 'express';
import { requireDatabase } from '../../middleware/require-database.js';
import { createTestCaseRepository } from './repository.js';
import { createTestCaseService } from './service.js';
import { createTestCaseController } from './controller.js';

export function createTestCaseRouter(database) {
  const router = Router();
  router.use(requireDatabase(database));
  const controller = createTestCaseController(createTestCaseService(createTestCaseRepository(database)));
  router.route('/').get(controller.list).post(controller.create);
  router.route('/:id').get(controller.detail).patch(controller.update).delete(controller.remove);
  return router;
}
