// Configurações de autenticação
export const authConfig = {
    jwtSecret: process.env.JWT_SECRET,
    sessionTimeout: process.env.SESSION_TIMEOUT || '3600'
};
