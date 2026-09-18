import type { Request, Response, NextFunction } from 'express';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DISPONIBILIDADE — Request Timeout Middleware
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Define um tempo máximo de resposta para cada requisição. Se o servidor não
 * responder dentro do prazo, a conexão é encerrada automaticamente com status
 * 503 (Service Unavailable).
 *
 * Isso evita que requisições "travadas" (queries lentas, deadlocks) consumam
 * recursos do servidor indefinidamente, protegendo a disponibilidade geral.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function requestTimeout(limitMs: number = 15_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: 'O servidor demorou demais para responder. Tente novamente.',
        });
      }
    }, limitMs);

    // Limpa o timer quando a resposta for enviada normalmente
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}
