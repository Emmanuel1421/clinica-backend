import app from './app';

const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;
const HOST = '0.0.0.0';
const NODE_ENV = process.env['NODE_ENV'] || 'development';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 CLINICA BACKEND — SERVIDOR PRONTO PARA PRODUÇÃO`);
  console.log(`==================================================`);
  console.log(`🌐 Ambiente:   ${NODE_ENV}`);
  console.log(`🔌 Porta:      ${PORT}`);
  console.log(`📡 URL Local:  http://localhost:${PORT}`);
  console.log(`🏥 Health:     http://localhost:${PORT}/api/health`);
  console.log(`==================================================\n`);
});

// Graceful shutdown handling for Docker / Cloud platforms
const handleShutdown = (signal: string) => {
  console.log(`\n⚠️  Sinal ${signal} recebido. Encerrando servidor graciosamente...`);
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

