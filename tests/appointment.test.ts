import request from 'supertest';
import app from '../src/main/app';
import { db } from '../config/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

describe('Appointments Module', () => {
  let token: string;
  let patientId: string;
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  beforeAll(() => {
    db.exec('DELETE FROM appointments');
    db.exec('DELETE FROM patients');
    db.exec('DELETE FROM users');

    // Create a mock user & token
    const userId = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, cnpj, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, '12345678000199', 'admin@admin.com', 'hashed', new Date().toISOString(), new Date().toISOString());

    token = jwt.sign({ id: userId, cnpj: '12345678000199' }, process.env['JWT_SECRET'] || 'secret', { expiresIn: '1h' });

    // Create a mock patient
    patientId = crypto.randomUUID();
    db.prepare('INSERT INTO patients (id, name, cpf, birth_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(patientId, 'João Silva', '12345678909', '1990-01-01T00:00:00.000Z', new Date().toISOString(), new Date().toISOString());
  });

  afterAll(() => {
    db.exec('DELETE FROM appointments');
    db.exec('DELETE FROM patients');
    db.exec('DELETE FROM users');
  });

  it('deve retornar 401 ao acessar sem autenticação', async () => {
    const res = await request(app).get('/api/agendamentos');
    expect(res.status).toBe(401);
  });

  it('deve falhar se o patient_id for inválido', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId: crypto.randomUUID(),
        title: 'Consulta de Rotina',
        date: tomorrowStr,
        time: '10:00',
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Paciente não encontrado.');
  });

  it('deve falhar se a data for no passado', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId,
        title: 'Consulta de Rotina',
        date: '2020-01-01',
        time: '10:00',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Não é possível agendar em uma data no passado.');
  });

  it('deve criar um agendamento válido', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId,
        title: 'Consulta de Rotina',
        date: tomorrowStr,
        time: '14:30',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Consulta de Rotina');
  });

  it('deve falhar ao tentar criar agendamento no mesmo dia e horário', async () => {
    const res = await request(app)
      .post('/api/agendamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId,
        title: 'Outra Consulta',
        date: tomorrowStr,
        time: '14:30',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Já existe um agendamento neste horário.');
  });
});
