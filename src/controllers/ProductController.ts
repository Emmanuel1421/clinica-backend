import type { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { ProductRepository } from '../repositories/ProductRepository';

const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { codigo, name, description, preco, estoque } = req.body as Record<string, unknown>;

    if (typeof codigo !== 'string' || codigo.trim().length === 0 || codigo.length > 50) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { codigo: 'Código obrigatório (máx 50 chars).' } });
      return;
    }
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 150) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { name: 'Nome obrigatório (máx 150 chars).' } });
      return;
    }
    if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { description: 'Descrição muito longa (máx 500 chars).' } });
      return;
    }
    const precoNum = Number(preco);
    if (preco === undefined || preco === null || isNaN(precoNum) || precoNum < 0) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { preco: 'Preço obrigatório e não pode ser negativo.' } });
      return;
    }
    const estoqueNum = Number(estoque);
    if (estoque === undefined || estoque === null || isNaN(estoqueNum) || estoqueNum < 0 || !Number.isInteger(estoqueNum)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { estoque: 'Estoque obrigatório, inteiro e não pode ser negativo.' } });
      return;
    }

    const product = await productService.createProduct({
      codigo: codigo.trim(),
      name: name.trim(),
      ...(typeof description === 'string' && { description }),
      preco: precoNum,
      estoque: estoqueNum,
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof Error && err.message.includes('já cadastrado')) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query['page'] ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query['limit'] ?? '20'), 10)));
    const result = await productService.getAllProducts(page, limit);
    res.json({ success: true, data: result.data, meta: { total: result.total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json({ success: false, message: 'ID inválido.' }); return; }
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof Error && err.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json({ success: false, message: 'ID inválido.' }); return; }
    const { codigo, name, description, preco, estoque } = req.body as Record<string, unknown>;

    if (codigo !== undefined && (typeof codigo !== 'string' || codigo.trim().length === 0 || codigo.length > 50)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { codigo: 'Código inválido.' } });
      return;
    }
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 150)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { name: 'Nome inválido.' } });
      return;
    }
    if (preco !== undefined) {
      const precoNum = Number(preco);
      if (isNaN(precoNum) || precoNum < 0) {
        res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { preco: 'Preço inválido.' } });
        return;
      }
    }
    if (estoque !== undefined) {
      const estoqueNum = Number(estoque);
      if (isNaN(estoqueNum) || estoqueNum < 0 || !Number.isInteger(estoqueNum)) {
        res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { estoque: 'Estoque inválido.' } });
        return;
      }
    }

    const product = await productService.updateProduct(id, {
      ...(typeof codigo === 'string' && { codigo: codigo.trim() }),
      ...(typeof name === 'string' && { name: name.trim() }),
      ...(typeof description === 'string' && { description }),
      ...(preco !== undefined && { preco: Number(preco) }),
      ...(estoque !== undefined && { estoque: Number(estoque) }),
    });
    res.json({ success: true, data: product });
  } catch (err) {
    if (err instanceof Error && err.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    if (err instanceof Error && (err.message.includes('já cadastrado') || err.message.includes('negativo'))) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params['id'] ?? '');
    if (!id) { res.status(400).json({ success: false, message: 'ID inválido.' }); return; }
    await productService.deleteProduct(id);
    res.json({ success: true, data: null });
  } catch (err) {
    if (err instanceof Error && err.message.includes('não encontrado')) {
      res.status(404).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
