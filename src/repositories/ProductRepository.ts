import { db } from '../../config/db';
import type { Product } from '../models/Product';
import type { IProductRepository } from '../interfaces/repositories/IProductRepository';
import crypto from 'crypto';

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    return row ? this.mapToModel(row) : null;
  }

  async findByCodigo(codigo: string): Promise<Product | null> {
    const row = db.prepare('SELECT * FROM products WHERE codigo = ?').get(codigo) as any;
    return row ? this.mapToModel(row) : null;
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO products (id, codigo, name, description, preco, estoque, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, product.codigo, product.name, product.description, product.preco, product.estoque, now, now);
    
    return this.findById(id) as Promise<Product>;
  }

  async update(id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const fields = [];
    const values: any[] = [];

    if (product.codigo !== undefined) {
      fields.push(`codigo = ?`);
      values.push(product.codigo);
    }
    if (product.name !== undefined) {
      fields.push(`name = ?`);
      values.push(product.name);
    }
    if (product.description !== undefined) {
      fields.push(`description = ?`);
      values.push(product.description);
    }
    if (product.preco !== undefined) {
      fields.push(`preco = ?`);
      values.push(product.preco);
    }
    if (product.estoque !== undefined) {
      fields.push(`estoque = ?`);
      values.push(product.estoque);
    }

    if (fields.length === 0) {
      const existing = await this.findById(id);
      if (!existing) throw new Error('Product not found');
      return existing;
    }

    fields.push(`updated_at = ?`);
    values.push(new Date().toISOString());

    values.push(id);

    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    
    const updated = await this.findById(id);
    if (!updated) throw new Error('Product not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
  }

  async findAll(limit: number, offset: number): Promise<Product[]> {
    const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as any[];
    return rows.map(this.mapToModel);
  }

  async count(): Promise<number> {
    const row = db.prepare('SELECT COUNT(*) as total FROM products').get() as any;
    return row.total;
  }

  private mapToModel(row: any): Product {
    return {
      id: row.id,
      codigo: row.codigo,
      name: row.name,
      description: row.description,
      preco: Number(row.preco),
      estoque: Number(row.estoque),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
