// Configurações de Rate Limiting
export const rateLimitConfig = {
    limit: process.env.RATE_LIMIT || 100,
    windowMs: 15 * 60 * 1000 // 15 minutos
};
