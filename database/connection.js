const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// 1. Configuração de Caminho (Dev vs Produção)
const isDev = !app.isPackaged;
const dbFolder = isDev ? __dirname : app.getPath('userData');
const caminhoBanco = path.join(dbFolder, 'db-bella-paes-controle.db');

const db = new Database(caminhoBanco);

// 2. Otimizações de Performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- INICIALIZAÇÃO DO SCHEMA (BOOTSTRAP) ---

db.transaction(() => {
  // Tabela: usuarios
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "usuarios" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "login" VARCHAR(50) NOT NULL UNIQUE,
      "senha_hash" VARCHAR(255) NOT NULL,
      "ativo" INTEGER DEFAULT 1,
      "admin" INTEGER DEFAULT 0
    )
  `).run();

  // Tabela: categorias
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "categorias" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "nome" VARCHAR(50) NOT NULL UNIQUE
    )
  `).run();

  // Tabela: gastos
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "gastos" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "id_categoria" NUMERIC,
      "descricao" TEXT NOT NULL,
      "valor" DECIMAL(10, 2) NOT NULL,
      "data" DATE NOT NULL,
      "nome_user" VARCHAR(50),
      "fixo_variavel" VARCHAR(10) NOT NULL,
      "data_criacao" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "tipo" VARCHAR(8) NOT NULL DEFAULT 'gasto',
      FOREIGN KEY("id_categoria") REFERENCES "categorias"("id")
    )
  `).run();

  // Tabela: vendas
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "vendas" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "valor" NUMERIC(10, 2) NOT NULL,
      "data" DATE NOT NULL,
      "nome_user" VARCHAR(50),
      "data_criacao" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "tipo" VARCHAR(8) NOT NULL DEFAULT 'venda'
    )
  `).run();

  // Tabela: logs
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "logs" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "tabela" TEXT NOT NULL,
      "id_registro" NUMERIC NOT NULL,
      "nome_user" TEXT NOT NULL,
      "dados_antes" TEXT NOT NULL,
      "dados_depois" TEXT NOT NULL,
      "data_hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Tabela: recorrentes
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "recorrentes" (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "nome_gasto" VARCHAR(50) NOT NULL,
      "valor" NUMERIC(10,2),
      "inicio" DATE,
      "fim" DATE
    )
  `).run();
})();

// --- INSERÇÃO DE DADOS PADRÃO (SE O BANCO ESTIVER VAZIO) ---

// 1. Categoria Padrão: Geral
const totalCategorias = db.prepare('SELECT count(*) as total FROM categorias').get();
if (totalCategorias.total === 0) {
  db.prepare('INSERT INTO categorias (nome) VALUES (?)').run('Geral');
  console.log('Categoria "Geral" criada com sucesso.');
}

// 2. Usuário Padrão: Admin
const totalUsuarios = db.prepare('SELECT count(*) as total FROM usuarios').get();
if (totalUsuarios.total === 0) {
  const stmt = db.prepare(`
    INSERT INTO usuarios (login, senha_hash, admin, ativo) 
    VALUES (?, ?, ?, ?)
  `);
  // Lembre-se: se usar bcrypt, coloque o hash aqui. Se for texto puro, 'admin123' funciona.
  stmt.run('admin', '$2b$10$tC6aEo.AHq4yVK7jsHEkrOSyxqAYR06GtfX2ODrRuxPsV.g7mCg6O', 1, 1);
  console.log('Usuário admin criado com sucesso.');
}

console.log('Banco de dados verificado em:', caminhoBanco);

module.exports = db;