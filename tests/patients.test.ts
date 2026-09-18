import request from 'supertest';
import app from '../src/main/app';

process.env['DATABASE_URL'] = ':memory:';
process.env['JWT_SECRET'] = 'test_secret';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';

let token: string;

beforeAll(() => {
  db.exec('DELETE FROM patients');
  db.exec('DELETE FROM users');

  const userId = crypto.randomUUID();
  db.prepare('INSERT INTO users (id, cnpj, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId, '11222333000181', 'clinica@teste.com', 'hashed', new Date().toISOString(), new Date().toISOString());

  token = jwt.sign({ id: userId, cnpj: '11222333000181' }, process.env['JWT_SECRET'] || 'test_secret', { expiresIn: '1h' });
});

afterAll(() => {
  db.exec('DELETE FROM patients');
  db.exec('DELETE FROM users');
});

describe('Pacientes', () => {
  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/api/pacientes');
    expect(res.status).toBe(401);
  });

  it('deve cadastrar paciente válido com celular (11 dígitos)', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'João da Silva',
        cpf: '529.982.247-25',
        birthDate: '1990-05-15',
        email: 'joao@teste.com',
        phone: '(11) 99999-0000',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('deve cadastrar paciente válido com telefone fixo (10 dígitos)', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Maria Fixo',
        cpf: '853.513.468-93',
        birthDate: '1985-03-22',
        phone: '(11) 3456-7890',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('deve retornar 400 sem telefone ou com telefone inválido', async () => {
    const resNoPhone = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Carlos Sem Tel',
        cpf: '068.794.757-04',
        birthDate: '1992-04-10',
      });
    expect(resNoPhone.status).toBe(400);

    const resInvalidPhone = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Carlos Tel Curto',
        cpf: '068.794.757-04',
        birthDate: '1992-04-10',
        phone: '12345',
      });
    expect(resInvalidPhone.status).toBe(400);
  });

  it('deve retornar 400 com CPF inválido', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Teste', cpf: '000.000.000-00', birthDate: '1990-01-01', phone: '(11) 99999-0000' });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 com nome vazio', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ', cpf: '529.982.247-25', birthDate: '1990-01-01', phone: '(11) 99999-0000' });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 com CPF duplicado', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Paciente Dup', cpf: '529.982.247-25', birthDate: '1990-01-01', phone: '(11) 99999-0000' });
    expect(res.status).toBe(400);
  });

  it('deve listar pacientes com paginação', async () => {
    const res = await request(app)
      .get('/api/pacientes?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('deve retornar 404 para paciente inexistente', async () => {
    const res = await request(app)
      .get('/api/pacientes/id-inexistente')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
