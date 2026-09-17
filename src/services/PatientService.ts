import { IPatientService, CreatePatientDTO, UpdatePatientDTO } from '../interfaces/services/IPatientService';
import { IPatientRepository } from '../interfaces/repositories/IPatientRepository';
import type { Patient } from '../models/Patient';

export class PatientService implements IPatientService {
  constructor(private patientRepository: IPatientRepository) {}

  async createPatient(data: CreatePatientDTO): Promise<Patient> {
    if (!data.name.trim()) throw new Error('O nome não pode estar vazio.');
    
    // Additional validation for CPF format/algorithm should be called here (e.g., validateCpf(data.cpf))
    // Here we clean it for storage:
    const cleanCpf = data.cpf.replace(/\D/g, '');

    const existingCpf = await this.patientRepository.findByCpf(cleanCpf);
    if (existingCpf) {
      throw new Error('CPF já cadastrado.');
    }

    const patientData = {
      ...data,
      cpf: cleanCpf,
      birthDate: new Date(data.birthDate), // Convert to Date
    };

    return this.patientRepository.create(patientData);
  }

  async updatePatient(id: string, data: UpdatePatientDTO): Promise<Patient> {
    if (data.name !== undefined && !data.name.trim()) throw new Error('O nome não pode estar vazio.');

    let cleanCpf: string | undefined = undefined;
    
    if (data.cpf) {
      cleanCpf = data.cpf.replace(/\D/g, '');
      const existingCpf = await this.patientRepository.findByCpf(cleanCpf);
      if (existingCpf && existingCpf.id !== id) {
        throw new Error('CPF já cadastrado.');
      }
    }

    const patientData: any = { ...data };
    if (cleanCpf) patientData.cpf = cleanCpf;
    if (data.birthDate) patientData.birthDate = new Date(data.birthDate);

    return this.patientRepository.update(id, patientData);
  }

  async getPatientById(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }
    return patient;
  }

  async getAllPatients(page: number, limit: number): Promise<{ data: Patient[]; total: number }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.patientRepository.findAll(limit, offset),
      this.patientRepository.count()
    ]);
    return { data, total };
  }

  async deletePatient(id: string): Promise<void> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) {
      throw new Error('Paciente não encontrado.');
    }
    await this.patientRepository.delete(id);
  }
}
