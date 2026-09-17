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

describe('Produtos', () => {
  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).get('/produtos');
    expect(res.status).toBe(401);
  });

  it('deve cadastrar produto válido', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'PROD-001', name: 'Paracetamol 500mg', preco: 12.5, estoque: 100 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('deve retornar 400 com código duplicado', async () => {
    await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'DUP-001', name: 'Produto A', preco: 5.0, estoque: 10 });
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'DUP-001', name: 'Produto B', preco: 7.0, estoque: 5 });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 com preço negativo', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'PROD-NEG', name: 'Produto Negativo', preco: -1, estoque: 10 });
    expect(res.status).toBe(400);
  });

  it('deve retornar 400 com estoque negativo', async () => {
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'PROD-EST', name: 'Produto Estoque', preco: 5.0, estoque: -5 });
    expect(res.status).toBe(400);
  });

  it('deve listar produtos com paginação', async () => {
    const res = await request(app)
      .get('/produtos?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
  });

  it('deve retornar 404 para produto inexistente', async () => {
    const res = await request(app)
      .get('/produtos/id-inexistente')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('deve bloquear payload muito grande', async () => {
    const bigString = 'x'.repeat(200 * 1024); // 200KB
    const res = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'BIG', name: bigString, preco: 1, estoque: 1 });
    expect(res.status).toBe(413);
  });
});
