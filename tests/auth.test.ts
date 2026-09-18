import request from 'supertest';
import app from '../src/main/app';

// Use a fresh in-memory DB for tests
process.env['DATABASE_URL'] = ':memory:';
process.env['JWT_SECRET'] = 'test_secret';

import { db } from '../config/db';

describe('Auth', () => {
  const validCnpj = '11.222.333/0001-81'; // CNPJ válido de teste
  const validPassword = 'SenhaForte123';

  beforeEach(() => {
    db.exec('DELETE FROM users');
  });

  it('deve retornar 400 se CNPJ inválido', async () => {
    const res = await request(app).post('/api/auth/login').send({
      cnpj: '00.000.000/0000-00',
      password: validPassword,
      termsAccepted: true,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 se senha vazia', async () => {
    const res = await request(app).post('/api/auth/login').send({
      cnpj: validCnpj,
      password: '',
      termsAccepted: true,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('deve retornar 400 se Termo não aceito', async () => {
    const res = await request(app).post('/api/auth/login').send({
      cnpj: validCnpj,
      password: validPassword,
      termsAccepted: false,
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Termo de Compromisso/);
  });

  it('deve retornar 401 para usuário inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      cnpj: validCnpj,
      password: validPassword,
      termsAccepted: true,
    });
    expect(res.status).toBe(401);
  });

  it('deve registrar e fazer login com sucesso', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      cnpj: validCnpj,
      email: 'clinica@teste.com',
      password: validPassword,
      termsAccepted: true,
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.data.token).toBeDefined();

    const loginRes = await request(app).post('/api/auth/login').send({
      cnpj: validCnpj,
      password: validPassword,
      termsAccepted: true,
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.token).toBeDefined();
  });

  it('deve retornar 401 com senha incorreta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      cnpj: validCnpj,
      password: 'SenhaErrada999',
      termsAccepted: true,
    });
    expect(res.status).toBe(401);
  });
});
