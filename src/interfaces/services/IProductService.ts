import type { Product } from '../../models/Product';

export interface CreateProductDTO {
  codigo: string;
  name: string;
  description?: string;
  preco: number;
  estoque: number;
}

export interface UpdateProductDTO {
  codigo?: string;
  name?: string;
  description?: string;
  preco?: number;
  estoque?: number;
}

export interface IProductService {
  createProduct(data: CreateProductDTO): Promise<Product>;
  updateProduct(id: string, data: UpdateProductDTO): Promise<Product>;
  getProductById(id: string): Promise<Product>;
  getAllProducts(page: number, limit: number): Promise<{ data: Product[]; total: number }>;
  deleteProduct(id: string): Promise<void>;
}
