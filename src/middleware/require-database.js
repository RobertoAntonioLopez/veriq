import { HttpError } from '../utils/http-error.js';

export function requireDatabase(database) {
  return (req, res, next) => {
    if (!database) throw new HttpError(503, 'DATABASE_UNAVAILABLE', 'La base de datos no está disponible.');
    next();
  };
}
