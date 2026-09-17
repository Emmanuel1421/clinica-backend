import type { Patient } from '../../models/Patient';

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByCpf(cpf: string): Promise<Patient | null>;
  create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient>;
  update(id: string, patient: Partial<Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Patient>;
  delete(id: string): Promise<void>;
  findAll(limit: number, offset: number): Promise<Patient[]>;
  count(): Promise<number>;
}
