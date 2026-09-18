import type { Request, Response } from 'express';
import { AppointmentService } from '../services/AppointmentService';
import { AppointmentRepository } from '../repositories/AppointmentRepository';
import { PatientRepository } from '../repositories/PatientRepository';

const appointmentRepo = new AppointmentRepository();
const patientRepo = new PatientRepository();
const appointmentService = new AppointmentService(appointmentRepo, patientRepo);

export class AppointmentController {
  // POST /api/agendamentos
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, title, date, time, status, notes } = req.body as Record<string, string>;

      if (!patientId || !title || !date || !time) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos.',
          errors: {
            patientId: !patientId ? 'Paciente é obrigatório.' : undefined,
            title: !title ? 'Título é obrigatório.' : undefined,
            date: !date ? 'Data é obrigatória.' : undefined,
            time: !time ? 'Hora é obrigatória.' : undefined,
          },
        });
        return;
      }

      const appt = await appointmentService.create({ patientId, title, date, time, status: status as any, notes });
      res.status(201).json({ success: true, data: appt });
    } catch (err: any) {
      if (err.message === 'Paciente não encontrado.') {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes('horário') || err.message.includes('inválid') || err.message.includes('obrigatório') || err.message.includes('passado')) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
      }
    }
  }

  // GET /api/agendamentos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query['limit'] as string) || 20));
      const filters = {
        date: req.query['date'] as string | undefined,
        status: req.query['status'] as string | undefined,
        patientId: req.query['patientId'] as string | undefined,
      };
      const { data, total } = appointmentService.getAll(page, limit, filters);
      res.json({
        success: true,
        data,
        meta: { page, limit, total },
      });
    } catch {
      res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
  }

  // GET /api/agendamentos/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] ?? '');
      const appt = appointmentService.getById(id);
      res.json({ success: true, data: appt });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  // PUT /api/agendamentos/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] ?? '');
      const appt = await appointmentService.update(id, req.body);
      res.json({ success: true, data: appt });
    } catch (err: any) {
      if (err.message === 'Agendamento não encontrado.') {
        res.status(404).json({ success: false, message: err.message });
      } else if (err.message.includes('horário') || err.message.includes('inválid') || err.message.includes('obrigatório')) {
        res.status(400).json({ success: false, message: err.message });
      } else {
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
      }
    }
  }

  // DELETE /api/agendamentos/:id
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] ?? '');
      appointmentService.delete(id);
      res.json({ success: true, data: null });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
}
