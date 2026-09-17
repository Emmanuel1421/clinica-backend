# Arquitetura do Projeto

## Stack
- **Runtime:** Node.js v22+
- **Linguagem:** TypeScript
- **Framework:** Express.js
- **Banco:** SQLite (better-sqlite3)
- **Autenticação:** JWT (jsonwebtoken)
- **Hash de senhas:** bcrypt
- **Testes:** Jest + Supertest

## Estrutura de Pastas

```
clinica-backend/
├── config/           # Configurações (db, auth)
├── src/
│   ├── controllers/  # Recebem req, validam dados e chamam services
│   ├── services/     # Regras de negócio
│   ├── repositories/ # Acesso ao banco de dados
│   ├── models/       # Interfaces de entidades
│   ├── interfaces/   # Contratos (repositories e services)
│   ├── middlewares/  # Auth JWT, error handler
│   ├── routes/       # Definição dos endpoints
│   ├── utils/        # Funções auxiliares (validators)
│   └── main/         # app.ts e server.ts
├── tests/            # Testes automatizados
├── docs/             # Documentação técnica
├── .env              # Variáveis de ambiente (nunca commitar)
└── .env.example      # Exemplo de variáveis sem segredos
```

## Fluxo de uma requisição

```
HTTP Request
  → Express Router
    → Middleware (auth JWT)
      → Controller (valida payload)
        → Service (regra de negócio)
          → Repository (acesso ao banco)
        ← Service
      ← Controller
    ← Middleware
  ← HTTP Response
```
