export interface Product {
  id: string;
  codigo: string;
  name: string;
  description?: string;
  preco: number;
  estoque: number;
  createdAt: Date;
  updatedAt: Date;
}
