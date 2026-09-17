import { IUserService } from '../interfaces/services/IUserService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type { User } from '../models/User';

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
    return user;
  }

  async getAllUsers(page: number, limit: number): Promise<{ data: User[]; total: number }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userRepository.findAll(limit, offset),
      this.userRepository.count()
    ]);
    return { data, total };
  }
}
