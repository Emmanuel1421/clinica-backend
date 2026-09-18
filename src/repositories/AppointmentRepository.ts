import { db } from '../../config/db';
import type { Appointment } from '../models/Appointment';
import crypto from 'crypto';

export class AppointmentRepository {
  findById(id: string): Appointment | null {
    const row = db.prepare(`
      SELECT a.*, p.name as patient_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE a.id = ?
    `).get(id) as any;
    return row ? this.mapToModel(row) : null;
  }

  findByDateAndTime(date: string, time: string, excludeId?: string): Appointment | null {
    let sql = 'SELECT * FROM appointments WHERE date = ? AND time = ?';
    const params: any[] = [date, time];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const row = db.prepare(sql).get(...params) as any;
    return row ? this.mapToModel(row) : null;
  }

  create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'patientName'>): Appointment {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO appointments (id, patient_id, title, date, time, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.patientId, data.title, data.date, data.time, data.status, data.notes ?? null, now, now);
    return this.findById(id) as Appointment;
  }

  update(id: string, data: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'patientName'>>): Appointment {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.patientId !== undefined) { fields.push('patient_id = ?'); values.push(data.patientId); }
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
    if (data.time !== undefined) { fields.push('time = ?'); values.push(data.time); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

    if (fields.length === 0) {
      const existing = this.findById(id);
      if (!existing) throw new Error('Agendamento não encontrado.');
      return existing;
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    db.prepare(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    const updated = this.findById(id);
    if (!updated) throw new Error('Agendamento não encontrado.');
    return updated;
  }

  delete(id: string): void {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
  }

  findAll(limit: number, offset: number, filters: { date?: string; status?: string; patientId?: string } = {}): Appointment[] {
    let sql = `
      SELECT a.*, p.name as patient_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.date) { sql += ' AND a.date = ?'; params.push(filters.date); }
    if (filters.status) { sql += ' AND a.status = ?'; params.push(filters.status); }
    if (filters.patientId) { sql += ' AND a.patient_id = ?'; params.push(filters.patientId); }

    sql += ' ORDER BY a.date ASC, a.time ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map(r => this.mapToModel(r));
  }

  count(filters: { date?: string; status?: string; patientId?: string } = {}): number {
    let sql = 'SELECT COUNT(*) as total FROM appointments WHERE 1=1';
    const params: any[] = [];

    if (filters.date) { sql += ' AND date = ?'; params.push(filters.date); }
    if (filters.status) { sql += ' AND status = ?'; params.push(filters.status); }
    if (filters.patientId) { sql += ' AND patient_id = ?'; params.push(filters.patientId); }

    const row = db.prepare(sql).get(...params) as any;
    return row.total;
  }

  private mapToModel(row: any): Appointment {
    return {
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name ?? undefined,
      title: row.title,
      date: row.date,
      time: row.time,
      status: row.status,
      notes: row.notes ?? undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
