import { db } from '../../config/db';

const initDb = () => {
  // ─── INTEGRIDADE: Ativa foreign keys no SQLite ────────────────────────────
  // Por padrão o SQLite NÃO valida foreign keys. Precisamos ativar manualmente
  // para garantir que patient_id em appointments realmente aponte para um
  // paciente existente na tabela patients.
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      cnpj TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      codigo TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      preco REAL NOT NULL CHECK (preco >= 0),
      estoque INTEGER NOT NULL CHECK (estoque > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      birth_date TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluído')),
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
  `);
  console.log('Database tables created successfully (with CHECK constraints & FK enforcement).');
};

initDb();

