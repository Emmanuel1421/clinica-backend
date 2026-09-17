import type { Product } from '../../models/Product';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCodigo(codigo: string): Promise<Product | null>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product>;
  delete(id: string): Promise<void>;
  findAll(limit: number, offset: number): Promise<Product[]>;
  count(): Promise<number>;
}
