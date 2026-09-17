import type { Patient } from '../../models/Patient';

export interface CreatePatientDTO {
  name: string;
  cpf: string;
  birthDate: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdatePatientDTO {
  name?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface IPatientService {
  createPatient(data: CreatePatientDTO): Promise<Patient>;
  updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient>;
  getPatientById(id: string): Promise<Patient>;
  getAllPatients(page: number, limit: number): Promise<{ data: Patient[]; total: number }>;
  deletePatient(id: string): Promise<void>;
}
