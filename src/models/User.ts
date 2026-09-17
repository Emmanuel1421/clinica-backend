export interface User {
  id: string;
  cnpj: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
