import { db } from '../../config/db';
import type { User } from '../models/User';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import crypto from 'crypto';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    return row ? this.mapToModel(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    return row ? this.mapToModel(row) : null;
  }

  async findByCnpj(cnpj: string): Promise<User | null> {
    const row = db.prepare('SELECT * FROM users WHERE cnpj = ?').get(cnpj) as any;
    return row ? this.mapToModel(row) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO users (id, cnpj, email, password_hash, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, user.cnpj, user.email, user.passwordHash, now, now);
    
    return this.findById(id) as Promise<User>;
  }

  async update(id: string, user: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const fields = [];
    const values: any[] = [];

    if (user.cnpj !== undefined) {
      fields.push(`cnpj = ?`);
      values.push(user.cnpj);
    }
    if (user.email !== undefined) {
      fields.push(`email = ?`);
      values.push(user.email);
    }
    if (user.passwordHash !== undefined) {
      fields.push(`password_hash = ?`);
      values.push(user.passwordHash);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('User not found');
      return existing;
    }

    fields.push(`updated_at = ?`);
    values.push(new Date().toISOString());

    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    
    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }

  async findAll(limit: number, offset: number): Promise<User[]> {
    const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as any[];
    return rows.map(this.mapToModel);
  }

  async count(): Promise<number> {
    const row = db.prepare('SELECT COUNT(*) as total FROM users').get() as any;
    return row.total;
  }

  private mapToModel(row: any): User {
    return {
      id: row.id,
      cnpj: row.cnpj,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
