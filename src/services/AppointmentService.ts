import type { Appointment } from '../models/Appointment';
import type { AppointmentRepository } from '../repositories/AppointmentRepository';
import type { PatientRepository } from '../repositories/PatientRepository';

export type CreateAppointmentDTO = {
  patientId: string;
  title: string;
  date: string;
  time: string;
  status?: Appointment['status'];
  notes?: string;
};

export type UpdateAppointmentDTO = Partial<CreateAppointmentDTO>;

const VALID_STATUSES: Appointment['status'][] = ['agendado', 'confirmado', 'cancelado', 'concluido'];

export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private patientRepository: PatientRepository,
  ) {}

  async create(data: CreateAppointmentDTO): Promise<Appointment> {
    // Validate required fields
    if (!data.patientId?.trim()) throw new Error('Paciente é obrigatório.');
    if (!data.title?.trim() || data.title.trim().length > 150) throw new Error('Título obrigatório (máx 150 caracteres).');
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('Data inválida. Use o formato YYYY-MM-DD.');
    
    const todayStr = new Date().toISOString().substring(0, 10);
    if (data.date < todayStr) throw new Error('Não é possível agendar em uma data no passado.');
    if (!data.time || !/^\d{2}:\d{2}$/.test(data.time)) throw new Error('Hora inválida. Use o formato HH:MM.');
    if (data.notes && data.notes.length > 500) throw new Error('Observações muito longas (máx 500 caracteres).');

    const status = data.status ?? 'agendado';
    if (!VALID_STATUSES.includes(status)) throw new Error('Status inválido.');
    if (status === 'cancelado') throw new Error('Não é possível criar um agendamento direto como Cancelado.');

    // Ensure patient exists
    const patient = await this.patientRepository.findById(data.patientId);
    if (!patient) throw new Error('Paciente não encontrado.');

    // Prevent duplicate slot
    const conflict = this.appointmentRepository.findByDateAndTime(data.date, data.time);
    if (conflict) throw new Error('Já existe um agendamento neste horário.');

    return this.appointmentRepository.create({
      patientId: data.patientId,
      title: data.title.trim(),
      date: data.date,
      time: data.time,
      status,
      notes: data.notes?.trim(),
    });
  }

  async update(id: string, data: UpdateAppointmentDTO): Promise<Appointment> {
    const existing = this.appointmentRepository.findById(id);
    if (!existing) throw new Error('Agendamento não encontrado.');

    if (data.title !== undefined && (!data.title.trim() || data.title.trim().length > 150)) {
      throw new Error('Título obrigatório (máx 150 caracteres).');
    }
    if (data.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('Data inválida.');
    }
    if (data.time !== undefined && !/^\d{2}:\d{2}$/.test(data.time)) {
      throw new Error('Hora inválida.');
    }
    if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
      throw new Error('Status inválido.');
    }
    if (data.notes !== undefined && data.notes.length > 500) {
      throw new Error('Observações muito longas (máx 500 caracteres).');
    }
    if (data.patientId !== undefined) {
      const patient = await this.patientRepository.findById(data.patientId);
      if (!patient) throw new Error('Paciente não encontrado.');
    }

    // Check slot conflict only if date or time changed
    const newDate = data.date ?? existing.date;
    const newTime = data.time ?? existing.time;
    if (newDate !== existing.date || newTime !== existing.time) {
      const conflict = this.appointmentRepository.findByDateAndTime(newDate, newTime, id);
      if (conflict) throw new Error('Já existe um agendamento neste horário.');
    }

    const updateData: any = { ...data };
    if (data.title) updateData.title = data.title.trim();
    if (data.notes) updateData.notes = data.notes.trim();

    return this.appointmentRepository.update(id, updateData);
  }

  getById(id: string): Appointment {
    const appt = this.appointmentRepository.findById(id);
    if (!appt) throw new Error('Agendamento não encontrado.');
    return appt;
  }

  getAll(page: number, limit: number, filters: { date?: string; status?: string; patientId?: string }) {
    const offset = (page - 1) * limit;
    const data = this.appointmentRepository.findAll(limit, offset, filters);
    const total = this.appointmentRepository.count(filters);
    return { data, total };
  }

  delete(id: string): void {
    const existing = this.appointmentRepository.findById(id);
    if (!existing) throw new Error('Agendamento não encontrado.');
    this.appointmentRepository.delete(id);
  }
}
