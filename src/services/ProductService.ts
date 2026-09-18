import { IProductService, CreateProductDTO, UpdateProductDTO } from '../interfaces/services/IProductService';
import { IProductRepository } from '../interfaces/repositories/IProductRepository';
import type { Product } from '../models/Product';

export class ProductService implements IProductService {
  constructor(private productRepository: IProductRepository) {}

  async createProduct(data: CreateProductDTO): Promise<Product> {
    if (data.preco < 0) throw new Error('O preço não pode ser negativo.');
    if (data.estoque <= 0) throw new Error('O estoque deve ser maior que zero.');

    const existingCode = await this.productRepository.findByCodigo(data.codigo);
    if (existingCode) {
      throw new Error('Código do produto já cadastrado.');
    }

    return this.productRepository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product> {
    if (data.preco !== undefined && data.preco < 0) throw new Error('O preço não pode ser negativo.');
    if (data.estoque !== undefined && data.estoque <= 0) throw new Error('O estoque deve ser maior que zero.');

    if (data.codigo) {
      const existingCode = await this.productRepository.findByCodigo(data.codigo);
      if (existingCode && existingCode.id !== id) {
        throw new Error('Código do produto já cadastrado.');
      }
    }

    return this.productRepository.update(id, data);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado.');
    }
    return product;
  }

  async getAllProducts(page: number, limit: number): Promise<{ data: Product[]; total: number }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productRepository.findAll(limit, offset),
      this.productRepository.count()
    ]);
    return { data, total };
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado.');
    }
    await this.productRepository.delete(id);
  }
}
