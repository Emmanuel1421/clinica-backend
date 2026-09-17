# Clínica Backend

API REST para sistema de gestão de clínica — cadastro de usuários, pacientes e produtos.

## Tecnologias
- Node.js + TypeScript
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken) + bcrypt
- Jest + Supertest

## Instalação

```bash
git clone <repo>
cd clinica-backend
npm install
```

## Configuração do `.env`

```bash
cp .env.example .env
# Edite o .env com seus valores, especialmente JWT_SECRET
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

## Testes

```bash
npm test
```

## Estrutura

```
src/
├── controllers/   # Recebem req, validam dados
├── services/      # Regras de negócio
├── repositories/  # Acesso ao banco
├── models/        # Interfaces de entidades
├── interfaces/    # Contratos de repositórios e serviços
├── middlewares/   # Auth JWT, error handler
├── routes/        # Endpoints
├── utils/         # Validators (CPF, CNPJ, e-mail)
└── main/          # app.ts, server.ts, init-db.ts
tests/             # Testes automatizados
docs/              # Documentação técnica
```

## Endpoints

| Método | Rota              | Auth | Descrição                  |
|--------|-------------------|------|----------------------------|
| POST   | /auth/register    | Não  | Registrar clínica          |
| POST   | /auth/login       | Não  | Autenticar clínica         |
| POST   | /pacientes        | Sim  | Cadastrar paciente         |
| GET    | /pacientes        | Sim  | Listar pacientes           |
| GET    | /pacientes/:id    | Sim  | Buscar paciente            |
| PUT    | /pacientes/:id    | Sim  | Atualizar paciente         |
| DELETE | /pacientes/:id    | Sim  | Remover paciente           |
| POST   | /produtos         | Sim  | Cadastrar produto          |
| GET    | /produtos         | Sim  | Listar produtos            |
| GET    | /produtos/:id     | Sim  | Buscar produto             |
| PUT    | /produtos/:id     | Sim  | Atualizar produto          |
| DELETE | /produtos/:id     | Sim  | Remover produto            |

## Segurança
- Senhas com hash bcrypt (12 rounds)
- JWT para autenticação
- Prepared statements (prevenção SQL Injection)
- Payload limitado a 100KB
- Headers HTTP seguros via Helmet
- Validação de CPF e CNPJ no Back-End

Veja [docs/seguranca.md](docs/seguranca.md) para detalhes completos.
