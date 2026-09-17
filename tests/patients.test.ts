import request from 'supertest';
import app from '../src/main/app';

process.env['DATABASE_URL'] = ':memory:';
process.env['JWT_SECRET'] = 'test_secret';

let token: string;

beforeAll(async () => {
  await request(app).post('/auth/register').send({
    cnpj: '11.222.333/0001-81',
    email: 'clinica@teste.com',
    password: 'SenhaForte123',
    termsAccepted: true,
  });
  const res = await request(app).post('/auth/login').send({
    cnpj: '11.222.333/0001-81',
    password: 'SenhaForte123',
    termsAccepted: true,
  });
  token = res.body.data.token as string;
});

describe('Pacientes', () => {
  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/pacientes');
    expect(res.status).toBe(401);
  });

  it('deve cadastrar paciente válido', async () => {
    const res = await request(app)
      .post('/pacientes')
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

  it('deve retornar 400 com CPF inválido', async () => {
    const res = await request(app)
      .post('/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Teste', cpf: '000.000.000-00', birthDate: '1990-01-01' });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 com nome vazio', async () => {
    const res = await request(app)
      .post('/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ', cpf: '529.982.247-25', birthDate: '1990-01-01' });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 com CPF duplicado', async () => {
    await request(app)
      .post('/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Paciente 1', cpf: '853.513.468-93', birthDate: '1985-03-22' });
    const res = await request(app)
      .post('/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Paciente 2', cpf: '853.513.468-93', birthDate: '1990-01-01' });
    expect(res.status).toBe(400);
  });

  it('deve listar pacientes com paginação', async () => {
    const res = await request(app)
      .get('/pacientes?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  it('deve retornar 404 para paciente inexistente', async () => {
    const res = await request(app)
      .get('/pacientes/id-inexistente')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
