# Banco de Dados

Driver: **better-sqlite3** (SQLite)

## Tabelas

### users
| Coluna        | Tipo | Restrição           |
|---------------|------|---------------------|
| id            | TEXT | PRIMARY KEY         |
| cnpj          | TEXT | UNIQUE NOT NULL     |
| email         | TEXT | UNIQUE NOT NULL     |
| password_hash | TEXT | NOT NULL            |
| created_at    | TEXT | NOT NULL            |
| updated_at    | TEXT | NOT NULL            |

### patients
| Coluna      | Tipo | Restrição       |
|-------------|------|-----------------|
| id          | TEXT | PRIMARY KEY     |
| name        | TEXT | NOT NULL        |
| cpf         | TEXT | UNIQUE NOT NULL |
| birth_date  | TEXT | NOT NULL        |
| phone       | TEXT |                 |
| email       | TEXT |                 |
| address     | TEXT |                 |
| created_at  | TEXT | NOT NULL        |
| updated_at  | TEXT | NOT NULL        |

### products
| Coluna      | Tipo    | Restrição       |
|-------------|---------|-----------------|
| id          | TEXT    | PRIMARY KEY     |
| codigo      | TEXT    | UNIQUE NOT NULL |
| name        | TEXT    | NOT NULL        |
| description | TEXT    |                 |
| preco       | REAL    | NOT NULL        |
| estoque     | INTEGER | NOT NULL        |
| created_at  | TEXT    | NOT NULL        |
| updated_at  | TEXT    | NOT NULL        |

## Inicialização
As tabelas são criadas automaticamente ao iniciar o servidor (`src/main/init-db.ts`).

O arquivo do banco é definido pela variável `DATABASE_URL` ou criado em `database.sqlite` na raiz do projeto.
