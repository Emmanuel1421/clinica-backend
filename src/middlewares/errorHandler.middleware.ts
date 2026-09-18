import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'Erro interno do servidor.';
  if (status >= 500) {
    console.error(err.stack);
  }
  res.status(status).json({
    success: false,
    message,
  });
}
