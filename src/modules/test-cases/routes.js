import { Router } from 'express';
import { HttpError } from '../../utils/http-error.js';
import { createTestCaseRepository } from './repository.js';
import { createTestCaseService } from './service.js';
import { createTestCaseController } from './controller.js';

export function createTestCaseRouter(database) {
  const router = Router();
  router.use((req, res, next) => {
    if (!database) throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'La base de datos no está disponible.');
    next();
  });
  const controller = createTestCaseController(createTestCaseService(createTestCaseRepository(database)));
  router.route('/').get(controller.list).post(controller.create);
  router.route('/:id').get(controller.detail).patch(controller.update).delete(controller.remove);
  return router;
}
