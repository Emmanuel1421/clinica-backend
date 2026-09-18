export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // joined field
  title: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
