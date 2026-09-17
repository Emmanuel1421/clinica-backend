import type { Product } from '../../models/Product';

export interface CreateProductDTO {
  name: string;
  description: string;
  gtin: string;
}

export interface IProductService {
  createProduct(data: CreateProductDTO): Promise<Product>;
  getProductById(id: string): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
}
