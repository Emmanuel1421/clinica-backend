import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { isValidCnpj } from '../utils/validators';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: errors.array() });
      return;
    }

    const { cnpj, password, termsAccepted } = req.body as Record<string, unknown>;

    // Back-end validations
    if (typeof cnpj !== 'string' || !isValidCnpj(cnpj)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { cnpj: 'CNPJ inválido.' } });
      return;
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { password: 'Senha inválida.' } });
      return;
    }
    if (termsAccepted !== true) {
      res.status(400).json({ success: false, message: 'É necessário aceitar o Termo de Compromisso para continuar.' });
      return;
    }

    const cleanCnpj = cnpj.replace(/\D/g, '');
    const result = await authService.login({ cnpj: cleanCnpj, passwordRaw: password, termsAccepted: true });
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && (err.message === 'Credenciais inválidas.' || err.message.includes('Termo'))) {
      res.status(401).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: errors.array() });
      return;
    }

    const { cnpj, email, password, termsAccepted } = req.body as Record<string, unknown>;

    if (typeof cnpj !== 'string' || !isValidCnpj(cnpj)) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { cnpj: 'CNPJ inválido.' } });
      return;
    }
    if (typeof email !== 'string' || !email.endsWith('@gmail.com')) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { email: 'E-mail inválido. Apenas domínios @gmail.com são permitidos.' } });
      return;
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400).json({ success: false, message: 'Dados inválidos.', errors: { password: 'Senha deve ter entre 8 e 128 caracteres.' } });
      return;
    }
    if (termsAccepted !== true) {
      res.status(400).json({ success: false, message: 'É necessário aceitar o Termo de Compromisso para continuar.' });
      return;
    }

    const cleanCnpj = cnpj.replace(/\D/g, '');
    const result = await authService.register({ cnpj: cleanCnpj, email, passwordRaw: password, termsAccepted: true });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && (err.message.includes('já cadastrado') || err.message.includes('Termo'))) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
