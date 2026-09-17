import Database from 'better-sqlite3';
import type { Database as SqliteDatabase } from 'better-sqlite3';
import path from 'path';

// Define o caminho do banco de dados (pode vir de variável de ambiente, ou padrão para database.sqlite)
const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, '../../database.sqlite');

export const db: SqliteDatabase = new Database(dbPath, { verbose: console.log });


// Habilita chaves estrangeiras no SQLite
db.pragma('foreign_keys = ON');
