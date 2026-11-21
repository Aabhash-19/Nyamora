import { Pool } from 'pg';

let pool: Pool | null = null;
let tablesInitialized = false;

export function getPostgresPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  }

  return pool;
}

/**
 * Ensure database tables exist automatically on first query
 */
export async function ensureTables(): Promise<boolean> {
  if (tablesInitialized) return true;
  const p = getPostgresPool();
  if (!p) return false;

  const client = await p.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        birthday VARCHAR(32) NOT NULL,
        age INT NOT NULL,
        avatar_url TEXT DEFAULT '/avatars/nyan-chan.png',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        item_id VARCHAR(128) NOT NULL,
        list_name VARCHAR(64) DEFAULT 'Favorites',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      );

      CREATE TABLE IF NOT EXISTS reading_progress (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        item_id VARCHAR(128) NOT NULL,
        page_index INT NOT NULL,
        total_pages INT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_id)
      );

      CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_progress_user ON reading_progress(user_id);
    `);
    tablesInitialized = true;
    return true;
  } catch (err) {
    console.error('Postgres ensureTables error:', err);
    return false;
  } finally {
    client.release();
  }
}
