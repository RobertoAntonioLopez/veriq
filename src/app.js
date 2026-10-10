import express from 'express';
import { createBugRouter } from './modules/bugs/routes.js';
import { createTestRunRouter } from './modules/test-runs/routes.js';
import { createTestCaseRouter } from './modules/test-cases/routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp({ database = null, logger = console } = {}) {
  const app = express();
  app.locals.logger = logger;
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ data: { status: 'ok', name: 'VeriQ' } });
  });

  app.get('/api/ready', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      if (!database) throw new Error('DATABASE_URL is not configured');
      await database.query('SELECT 1');
      res.json({ data: { status: 'ready' } });
    } catch (error) {
      logger.error(error);
      res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'La base de datos no está disponible.' } });
    }
  });

  app.use('/api/bugs', createBugRouter(database));
  app.use('/api/test-runs', createTestRunRouter(database));
  app.use('/api/test-cases', createTestCaseRouter(database));

  app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada.' } });
  });
  app.use(errorHandler);
  return app;
}
