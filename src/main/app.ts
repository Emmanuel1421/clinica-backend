import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Initialise DB and tables before importing routes
import '../main/init-db';

import authRoutes from '../routes/auth.routes';
import patientRoutes from '../routes/patient.routes';
import productRoutes from '../routes/product.routes';
import { errorHandler } from '../middlewares/errorHandler.middleware';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ─── Body parsing (limit payload to prevent DoS) ──────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/pacientes', patientRoutes);
app.use('/produtos', productRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
