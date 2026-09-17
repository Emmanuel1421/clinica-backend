import { db } from '../../config/db';
import type { Patient } from '../models/Patient';
import type { IPatientRepository } from '../interfaces/repositories/IPatientRepository';
import crypto from 'crypto';

export class PatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as any;
    return row ? this.mapToModel(row) : null;
  }

  async findByCpf(cpf: string): Promise<Patient | null> {
    const row = db.prepare('SELECT * FROM patients WHERE cpf = ?').get(cpf) as any;
    return row ? this.mapToModel(row) : null;
  }

  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    // For SQLite, Dates are stored as ISO strings
    const birthDateIso = new Date(patient.birthDate).toISOString();
    
    db.prepare(`
      INSERT INTO patients (id, name, cpf, birth_date, phone, email, address, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, patient.name, patient.cpf, birthDateIso, patient.phone, patient.email, patient.address, now, now);
    
    return this.findById(id) as Promise<Patient>;
  }

  async update(id: string, patient: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Patient> {
    const fields = [];
    const values: any[] = [];

    if (patient.name !== undefined) {
      fields.push(`name = ?`);
      values.push(patient.name);
    }
    if (patient.cpf !== undefined) {
      fields.push(`cpf = ?`);
      values.push(patient.cpf);
    }
    if (patient.birthDate !== undefined) {
      fields.push(`birth_date = ?`);
      values.push(new Date(patient.birthDate).toISOString());
    }
    if (patient.phone !== undefined) {
      fields.push(`phone = ?`);
      values.push(patient.phone);
    }
    if (patient.email !== undefined) {
      fields.push(`email = ?`);
      values.push(patient.email);
    }
    if (patient.address !== undefined) {
      fields.push(`address = ?`);
      values.push(patient.address);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Patient not found');
      return existing;
    }

    fields.push(`updated_at = ?`);
    values.push(new Date().toISOString());

    values.push(id);

    const query = `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    
    const updated = await this.findById(id);
    if (!updated) throw new Error('Patient not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    db.prepare('DELETE FROM patients WHERE id = ?').run(id);
  }

  async findAll(limit: number, offset: number): Promise<Patient[]> {
    const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as any[];
    return rows.map(this.mapToModel);
  }

  async count(): Promise<number> {
    const row = db.prepare('SELECT COUNT(*) as total FROM patients').get() as any;
    return row.total;
  }

  private mapToModel(row: any): Patient {
    return {
      id: row.id,
      name: row.name,
      cpf: row.cpf,
      birthDate: new Date(row.birth_date),
      phone: row.phone,
      email: row.email,
      address: row.address,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
