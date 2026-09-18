import Database from 'better-sqlite3';
import type { Database as SqliteDatabase } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define o caminho do banco de dados (variável de ambiente ou padrão database.sqlite na raiz)
const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, '../../database.sqlite');

// Garante que o diretório pai existe (ex: /app/data ou ./data)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const isProd = process.env.NODE_ENV === 'production';
export const db: SqliteDatabase = new Database(dbPath, {
  verbose: isProd ? undefined : console.log,
});

// Habilita chaves estrangeiras no SQLite
db.pragma('foreign_keys = ON');
