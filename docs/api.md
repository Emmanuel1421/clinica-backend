# API — Clínica Backend

Base URL: `http://localhost:3000`

---

## Autenticação

### `POST /auth/register`
Cadastra uma nova clínica (usuário).

**Body:**
```json
{
  "cnpj": "11.222.333/0001-81",
  "email": "clinica@email.com",
  "password": "SenhaForte123",
  "termsAccepted": true
}
```

**Resposta 201:**
```json
{ "success": true, "data": { "user": { ... }, "token": "..." } }
```

---

### `POST /auth/login`
Autentica a clínica.

**Body:**
```json
{
  "cnpj": "11.222.333/0001-81",
  "password": "SenhaForte123",
  "termsAccepted": true
}
```

**Resposta 200:**
```json
{ "success": true, "data": { "user": { ... }, "token": "..." } }
```

**Erros:** 400 (dados inválidos), 401 (credenciais inválidas)

---

## Pacientes

> Todas as rotas exigem `Authorization: Bearer <token>`

### `POST /pacientes`
Cadastra um paciente.

**Body:**
```json
{
  "name": "João da Silva",
  "cpf": "529.982.247-25",
  "birthDate": "1990-05-15",
  "phone": "(11) 99999-0000",
  "email": "joao@email.com",
  "address": "Rua das Flores, 123"
}
```

### `GET /pacientes?page=1&limit=20`
Lista pacientes paginados.

### `GET /pacientes/:id`
Retorna um paciente pelo ID.

### `PUT /pacientes/:id`
Atualiza um paciente.

### `DELETE /pacientes/:id`
Remove um paciente.

---

## Produtos

> Todas as rotas exigem `Authorization: Bearer <token>`

### `POST /produtos`
```json
{
  "codigo": "PROD-001",
  "name": "Paracetamol 500mg",
  "description": "Analgésico",
  "preco": 12.50,
  "estoque": 100
}
```

### `GET /produtos?page=1&limit=20`
### `GET /produtos/:id`
### `PUT /produtos/:id`
### `DELETE /produtos/:id`

---

## Padrão de Resposta

**Sucesso:**
```json
{ "success": true, "data": {} }
```

**Erro de validação (400):**
```json
{ "success": false, "message": "Dados inválidos.", "errors": {} }
```

**Não autenticado (401):**
```json
{ "success": false, "message": "Não autenticado." }
```

**Não encontrado (404):**
```json
{ "success": false, "message": "Paciente não encontrado." }
```

**Erro interno (500):**
```json
{ "success": false, "message": "Erro interno do servidor." }
```
