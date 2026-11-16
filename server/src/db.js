// Дані зберігаються в пам'яті та записуються у data/db.json
const fs = require('fs');
const path = require('path');
const { createSeedData } = require('./seed');

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'db.json');

// У тестах база працює лише в пам'яті
const IN_MEMORY = process.env.NODE_ENV === 'test';

let db = null;

function save() {
  if (IN_MEMORY) return;
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function load() {
  if (!IN_MEMORY && fs.existsSync(DATA_FILE)) {
    db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } else {
    db = createSeedData();
    save();
  }
}

function getDb() {
  if (!db) load();
  return db;
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function resetDb() {
  db = createSeedData();
  save();
}

module.exports = { getDb, save, nextId, resetDb };
