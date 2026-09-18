import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Initialise DB and tables before importing routes
import '../main/init-db';

import authRoutes from '../routes/auth.routes';
import patientRoutes from '../routes/patient.routes';
import productRoutes from '../routes/product.routes';
import appointmentRoutes from '../routes/appointment.routes';
import { errorHandler } from '../middlewares/errorHandler.middleware';
import { rateLimiter } from '../middlewares/rateLimiter.middleware';
import { requestTimeout } from '../middlewares/requestTimeout.middleware';

const app = express();

// ═══════════════════════════════════════════════════════════════════════════════
// TRÍADE CID — CONFIDENCIALIDADE
// ═══════════════════════════════════════════════════════════════════════════════
// • Helmet: define headers HTTP seguros (X-Content-Type-Options, X-Frame-Options,
//   Strict-Transport-Security, etc.) para impedir vazamento de informações do
//   servidor e ataques de clickjacking.
// • CORS: restringe quais origens podem consumir a API, impedindo que sites
//   maliciosos façam requisições em nome do usuário.
// • O errorHandler global (ao final) NUNCA expõe stack traces ou mensagens
//   internas em respostas com status >= 500.
// ═══════════════════════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false, // Disabled so frontend scripts load correctly
}));
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ═══════════════════════════════════════════════════════════════════════════════
// TRÍADE CID — DISPONIBILIDADE
// ═══════════════════════════════════════════════════════════════════════════════
// • Rate Limiter: limita cada IP a 100 requisições por janela de 15 minutos nas
//   rotas gerais, e 20 requisições por janela de 15 minutos nas rotas de autenticação
//   (prevenção de força bruta em login/registro).
// • Request Timeout: encerra qualquer requisição que demore mais de 15 segundos,
//   liberando recursos do servidor e evitando que conexões travadas acumulem.
// • Limite de payload (100kb): impede ataques de exaustão de memória via bodies
//   gigantes (ex: enviar 1GB de JSON para derrubar o processo).
// • Graceful Shutdown (server.ts): o servidor encerra conexões ativas corretamente
//   ao receber SIGTERM/SIGINT, evitando perda de dados em deploy/restart.
// ═══════════════════════════════════════════════════════════════════════════════

// Rate limiter global — 100 req / 15 min por IP
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }));

// Timeout global — 15 segundos por requisição
app.use(requestTimeout(15_000));

// ─── Body parsing (limit payload to prevent DoS) ──────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// ─── Static Frontend ────────────────────────────────────────────────────────────
app.use(express.static(path.join(process.cwd(), 'assets/frontend')));

// ═══════════════════════════════════════════════════════════════════════════════
// TRÍADE CID — INTEGRIDADE
// ═══════════════════════════════════════════════════════════════════════════════
// • Validação server-side em TODOS os controllers: nunca confiamos em dados do
//   Front-End. Preços, estoque, CPF, CNPJ e e-mail são revalidados no Back-End.
// • Sanitização de strings (utils/sanitizer.ts): remove tags HTML e caracteres
//   de controle para prevenir XSS armazenado e corrupção de dados.
// • CHECK constraints no banco (init-db.ts): o SQLite impõe que estoque > 0
//   e preço >= 0 direto no schema, mesmo que a validação do controller falhe.
// • Bcrypt: senhas são hasheadas com salt antes de salvar (irreversíveis).
// • JWT com assinatura: tokens são verificados a cada requisição autenticada.
//   Qualquer adulteração invalida a assinatura e a requisição é rejeitada.
// • Foreign Keys: agendamentos só são criados se o patient_id existir de fato.
// • UNIQUE constraints: CPF, CNPJ, código de produto e e-mail não duplicam.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Routes ───────────────────────────────────────────────────────────────────
// Rate limiter mais restritivo para rotas de autenticação (anti brute-force)
app.use('/api/auth', rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: 'Muitas tentativas de login. Aguarde 15 minutos.' }), authRoutes);
app.use('/api/pacientes', patientRoutes);
app.use('/api/produtos', productRoutes);
app.use('/api/agendamentos', appointmentRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// ─── SPA Fallback & 404 ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, message: 'Rota não encontrada.' });
  } else {
    res.sendFile(path.join(process.cwd(), 'assets/frontend/index.html'));
  }
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

