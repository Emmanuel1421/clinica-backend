import type { User } from '../../models/User';

export interface IUserService {
  getUserById(id: string): Promise<User>;
  getAllUsers(page: number, limit: number): Promise<{ data: User[]; total: number }>;
}
