var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');

mkdirp.sync('./var/db');

var db = new sqlite3.Database('./var/db/todos.db');

db.serialize(function() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    hashed_password BLOB,
    salt BLOB,
    name TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS federated_credentials (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    subject TEXT NOT NULL,
    UNIQUE (provider, subject)
  )`);
  
   db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    score INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create trigger to update 'updated_at' on row update
  db.run(`CREATE TRIGGER IF NOT EXISTS scores_updated_at_trigger
    AFTER UPDATE ON scores
    FOR EACH ROW
    BEGIN
      UPDATE scores SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;`);

  db.run(`CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pokemon_usage (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    pokemon_id INTEGER NOT NULL,
    UNIQUE(user_id, pokemon_id)
  )`);
});

module.exports = db;