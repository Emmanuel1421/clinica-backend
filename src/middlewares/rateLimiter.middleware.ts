import type { Request, Response, NextFunction } from 'express';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DISPONIBILIDADE — Rate Limiter (Limitador de Taxa de Requisições)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Protege o servidor contra ataques de força bruta e DDoS limitando a quantidade
 * de requisições que um mesmo IP pode fazer dentro de uma janela de tempo.
 *
 * Implementação in-memory (sem Redis) — adequada para instância única.
 * Em ambientes com múltiplas instâncias, substituir por Redis ou similar.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas a cada 60 segundos para evitar vazamento de memória (Disponibilidade)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 60_000);

interface RateLimiterOptions {
  /** Janela de tempo em milissegundos (padrão: 15 min) */
  windowMs?: number;
  /** Máximo de requisições por janela (padrão: 100) */
  max?: number;
  /** Mensagem de erro retornada ao cliente */
  message?: string;
}

/**
 * Cria um middleware de rate limiting configurável.
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 15 * 60 * 1000; // 15 minutos
  const max = options.max ?? 100;
  const message = options.message ?? 'Muitas requisições. Tente novamente mais tarde.';

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = store.get(ip);

    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs };
      store.set(ip, entry);
    } else {
      entry.count++;
    }

    // Headers informativos para o cliente
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > max) {
      res.status(429).json({ success: false, message });
      return;
    }

    next();
  };
}
