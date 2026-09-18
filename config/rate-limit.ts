// Configurações de Rate Limiting
export const rateLimitConfig = {
    limit: process.env.RATE_LIMIT || 100,
    windowMs: 30 * 1000 // 30 segundos
};
