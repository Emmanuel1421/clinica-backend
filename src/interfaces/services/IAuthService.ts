import type { User } from '../../models/User';

export interface RegisterDTO {
  cnpj: string;
  email: string;
  passwordRaw: string;
  termsAccepted: boolean;
}

export interface LoginDTO {
  email: string;
  passwordRaw: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface IAuthService {
  register(data: RegisterDTO): Promise<AuthResponse>;
  login(data: LoginDTO): Promise<AuthResponse>;
}
