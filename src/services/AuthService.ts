import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAuthService, RegisterDTO, LoginDTO, AuthResponse } from '../interfaces/services/IAuthService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { authConfig } from '../../config/auth';

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  private generateToken(userId: string): string {
    const secret = authConfig.jwtSecret;
    if (!secret) {
      throw new Error('JWT Secret not configured');
    }
    const expiresIn = parseInt(authConfig.sessionTimeout, 10);
    return jwt.sign({ id: userId }, secret, {
      expiresIn
    });
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    if (!data.termsAccepted) {
      throw new Error('É necessário aceitar o Termo de Compromisso para continuar.');
    }

    const existingCnpj = await this.userRepository.findByCnpj(data.cnpj);
    if (existingCnpj) {
      throw new Error('CNPJ já cadastrado.');
    }

    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('E-mail já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(data.passwordRaw, 12);

    const user = await this.userRepository.create({
      cnpj: data.cnpj,
      email: data.email,
      passwordHash: passwordHash
    });

    const token = this.generateToken(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    if (!data.termsAccepted) {
      throw new Error('É necessário aceitar o Termo de Compromisso para continuar.');
    }

    const user = await this.userRepository.findByCnpj(data.cnpj);
    if (!user) {
      throw new Error('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(data.passwordRaw, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas.');
    }

    const token = this.generateToken(user.id);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}
