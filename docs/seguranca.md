# Segurança

## Confidencialidade
- Senhas nunca armazenadas em texto puro (bcrypt, salt rounds 12)
- Hash de senha nunca retornado nas respostas da API
- Segredos (JWT_SECRET, DATABASE_URL) somente em `.env` (no .gitignore)
- Respostas de erro nunca expõem stack trace, SQL ou detalhes internos

## Integridade
- Todo dado recebido é validado no Back-End (não apenas no Front-End)
- CPF e CNPJ validados com algoritmo dos dígitos verificadores
- Prepared statements em todas as queries (prevenção de SQL Injection)
- Valores numéricos (preço, estoque) validados e recalculados no servidor
- Campos UNIQUE no banco: `users.cnpj`, `patients.cpf`, `products.codigo`
- Autenticação via JWT assinado com segredo seguro

## Disponibilidade
- Payload HTTP limitado a 100KB (prevenção de DoS)
- Paginação obrigatória nas listagens (máx 100 registros por página)
- Erros tratados globalmente sem derrubar o servidor
- SQLite com foreign keys habilitadas
- better-sqlite3 usa connection pooling via arquivo único

## Headers de Segurança
- Helmet.js configurado para inserir headers HTTP seguros automaticamente
- CORS configurado explicitamente (origem controlada via `CORS_ORIGIN`)

## Checklist
- [x] Senhas com hash
- [x] .env no .gitignore
- [x] SQL Injection prevenido
- [x] Rotas protegidas por JWT
- [x] Payload limitado
- [x] Erros não vazam informações internas
- [x] CNPJ único
- [x] CPF único
- [x] Código do produto único
