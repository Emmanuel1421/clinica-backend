import type { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/PatientService';
import { PatientRepository } from '../repositories/PatientRepository';
import { isValidCpf } from '../utils/validators';

const patientRepo = new PatientRepository();
const patientService = new PatientService(patientRepo);

export async function createPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, cpf, birthDate, phone, email, address } = req.body as Record<string, unknown>;

    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 150) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { name: 'Nome obrigatório (máx 150 chars).' } });
      return;
    }
    if (typeof cpf !== 'string' || !isValidCpf(cpf)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { cpf: 'CPF inválido.' } });
      return;
    }
    if (!birthDate || isNaN(Date.parse(String(birthDate)))) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { birthDate: 'Data de nascimento inválida.' } });
      return;
    }
    if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { email: 'E-mail inválido.' } });
      return;
    }
    if (phone !== undefined && typeof phone === 'string' && phone.length > 20) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { phone: 'Telefone inválido.' } });
      return;
    }
    if (address !== undefined && typeof address === 'string' && address.length > 255) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { address: 'Endereço muito longo (máx 255 chars).' } });
      return;
    }

    const patient = await patientService.createPatient({
      name: name.trim(),
      cpf: String(cpf),
      birthDate: String(birthDate),
      ...(typeof phone === 'string' && { phone }),
      ...(typeof email === 'string' && { email }),
      ...(typeof address === 'string' && { address }),
    });
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof Error && err.message.includes('CPF')) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function listPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query['limit'] ?? '20'), 10)));
    const result = await patientService.getAllPatients(page, limit);
    res.json({ success: true, data: result.data, meta: { total: result.total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json({ success: false, message: 'ID inválido.' }); return; }
    const patient = await patientService.getPatientById(id);
    res.json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof Error && err.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updatePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json({ success: false, message: 'ID inválido.' }); return; }
    const { name, cpf, birthDate, phone, email, address } = req.body as Record<string, unknown>;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 150)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { name: 'Nome obrigatório (máx 150 chars).' } });
      return;
    }
    if (cpf !== undefined && (typeof cpf !== 'string' || !isValidCpf(cpf))) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { cpf: 'CPF inválido.' } });
      return;
    }
    if (birthDate !== undefined && isNaN(Date.parse(String(birthDate)))) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { birthDate: 'Data de nascimento inválida.' } });
      return;
    }
    if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { email: 'E-mail inválido.' } });
      return;
    }

    const patient = await patientService.updatePatient(id, {
      ...(typeof name === 'string' && { name: name.trim() }),
      ...(typeof cpf === 'string' && { cpf }),
      ...(typeof birthDate === 'string' && { birthDate }),
      ...(typeof phone === 'string' && { phone }),
      ...(typeof email === 'string' && { email }),
      ...(typeof address === 'string' && { address }),
    });
    res.json({ success: true, data: patient });
  } catch (err) {
    if (err instanceof Error && err.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    if (err instanceof Error && err.message.includes('CPF')) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deletePatient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json({ success: false, message: 'ID inválido.' }); return; }
    await patientService.deletePatient(id);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof Error && err.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
