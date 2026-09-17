// Configurações de segurança
export const securityConfig = {
    encryptionKey: process.env.ENCRYPTION_KEY,
    corsOrigin: process.env.CORS_ORIGIN || '*'
};
