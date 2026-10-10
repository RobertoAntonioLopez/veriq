export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'El cuerpo JSON no es válido.' } });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'La solicitud supera el tamaño permitido.' } });
  }
  req.app.locals.logger.error(error);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' } });
}
