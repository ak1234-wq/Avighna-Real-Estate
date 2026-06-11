// SQLite database setup using better-sqlite3 (synchronous, fast, no setup needed).
// Articles are stored persistently — survives server restarts unlike the old in-memory cache.

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_PATH || "./data/news.db";

// Ensure data/ directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// WAL mode = faster writes, safe concurrent reads
db.pragma("journal_mode = WAL");

// Create articles table
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tab         TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    tldr        TEXT,
    url         TEXT    UNIQUE NOT NULL,
    source      TEXT,
    published_at TEXT,
    relevance   INTEGER DEFAULT 5,
    fetched_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_articles_tab ON articles(tab);
  CREATE INDEX IF NOT EXISTS idx_articles_tab_date ON articles(tab, published_at DESC);
`);

// ─── Queries ───────────────────────────────────────────────────────────────

// Get latest N articles for a tab
export function getArticlesByTab(tab, limit = 10) {
  return db
    .prepare(
      `SELECT * FROM articles
       WHERE tab = ?
       ORDER BY fetched_at DESC
       LIMIT ?`
    )
    .all(tab, limit);
}

// Upsert an article (skip if URL already exists)
export function upsertArticle(article) {
  return db
    .prepare(
      `INSERT OR IGNORE INTO articles (tab, title, tldr, url, source, published_at, relevance)
       VALUES (@tab, @title, @tldr, @url, @source, @published_at, @relevance)`
    )
    .run(article);
}

// Bulk insert (used by scheduler)
export function upsertMany(articles) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO articles (tab, title, tldr, url, source, published_at, relevance)
     VALUES (@tab, @title, @tldr, @url, @source, @published_at, @relevance)`
  );
  const insertAll = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertAll(articles);
}

// Delete articles older than N days (cleanup)
export function deleteOldArticles(daysOld = 7) {
  return db
    .prepare(
      `DELETE FROM articles
       WHERE fetched_at < datetime('now', ? || ' days')`
    )
    .run(`-${daysOld}`);
}

// Count articles per tab (for health check)
export function getTabCounts() {
  return db
    .prepare(`SELECT tab, COUNT(*) as count FROM articles GROUP BY tab`)
    .all();
}

export default db;
