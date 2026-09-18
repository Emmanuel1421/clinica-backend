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

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disabled so frontend scripts load correctly
}));
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ─── Body parsing (limit payload to prevent DoS) ──────────────────────────────
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// ─── Static Frontend ────────────────────────────────────────────────────────────
app.use(express.static(path.join(process.cwd(), 'assets/frontend')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
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
