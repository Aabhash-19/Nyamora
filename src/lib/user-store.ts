import { getPostgresPool, ensureTables } from './postgres.ts';
import { hashPassword, verifyPassword } from './auth.ts';
import type { UserSession } from './auth.ts';

export interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  birthday: string;
  age: number;
  avatarUrl: string;
  createdAt: string;
}

export interface UserPublicProfile {
  id: string;
  username: string;
  email: string;
  birthday: string;
  age: number;
  avatarUrl: string;
  createdAt: string;
}

// In-memory fallback if DATABASE_URL is not configured
const inMemoryUsers = new Map<string, DbUser>();
const inMemoryBookmarks = new Map<string, Set<string>>(); // userId -> Set<itemId>
const inMemoryProgress = new Map<string, Map<string, { pageIndex: number; totalPages: number; updatedAt: string }>>();

export async function findUserByUsernameOrEmail(identifier: string): Promise<DbUser | null> {
  const pool = getPostgresPool();
  if (pool) {
    try {
      await ensureTables();
      const res = await pool.query(
        'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1',
        [identifier.trim()]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          passwordHash: row.password_hash,
          salt: row.salt,
          birthday: row.birthday,
          age: row.age,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at.toISOString()
        };
      }
      return null;
    } catch (err) {
      console.error('findUserByUsernameOrEmail Postgres error:', err);
    }
  }

  // In-memory fallback
  const idLower = identifier.trim().toLowerCase();
  for (const u of inMemoryUsers.values()) {
    if (u.username.toLowerCase() === idLower || u.email.toLowerCase() === idLower) {
      return u;
    }
  }
  return null;
}

export async function findUserById(id: string): Promise<UserPublicProfile | null> {
  const pool = getPostgresPool();
  if (pool) {
    try {
      await ensureTables();
      const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          birthday: row.birthday,
          age: row.age,
          avatarUrl: row.avatar_url,
          createdAt: row.created_at.toISOString()
        };
      }
      return null;
    } catch (err) {
      console.error('findUserById Postgres error:', err);
    }
  }

  const u = inMemoryUsers.get(id);
  if (u) {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      birthday: u.birthday,
      age: u.age,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt
    };
  }
  return null;
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  birthday: string;
  age: number;
}): Promise<UserPublicProfile> {
  const { hash, salt } = hashPassword(data.password);
  const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const avatarUrl = '/avatars/nyan-chan.png';

  const pool = getPostgresPool();
  if (pool) {
    await ensureTables();
    await pool.query(
      `INSERT INTO users (id, username, email, password_hash, salt, birthday, age, avatar_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, data.username.trim(), data.email.trim(), hash, salt, data.birthday, data.age, avatarUrl, now]
    );
  } else {
    inMemoryUsers.set(id, {
      id,
      username: data.username.trim(),
      email: data.email.trim(),
      passwordHash: hash,
      salt,
      birthday: data.birthday,
      age: data.age,
      avatarUrl,
      createdAt: now
    });
  }

  return {
    id,
    username: data.username.trim(),
    email: data.email.trim(),
    birthday: data.birthday,
    age: data.age,
    avatarUrl,
    createdAt: now
  };
}

// --- Multi-Device Bookmarks Store ---

export async function getUserBookmarks(userId: string): Promise<string[]> {
  const pool = getPostgresPool();
  if (pool) {
    try {
      await ensureTables();
      const res = await pool.query('SELECT item_id FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return res.rows.map(r => r.item_id);
    } catch (err) {
      console.error('getUserBookmarks Postgres error:', err);
    }
  }

  const set = inMemoryBookmarks.get(userId);
  return set ? Array.from(set) : [];
}

export async function toggleUserBookmark(userId: string, itemId: string): Promise<boolean> {
  const pool = getPostgresPool();
  if (pool) {
    try {
      await ensureTables();
      const existing = await pool.query('SELECT id FROM bookmarks WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
      if (existing.rows.length > 0) {
        await pool.query('DELETE FROM bookmarks WHERE user_id = $1 AND item_id = $2', [userId, itemId]);
        return false;
      } else {
        const id = `bmk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await pool.query('INSERT INTO bookmarks (id, user_id, item_id) VALUES ($1, $2, $3)', [id, userId, itemId]);
        return true;
      }
    } catch (err) {
      console.error('toggleUserBookmark Postgres error:', err);
    }
  }

  let set = inMemoryBookmarks.get(userId);
  if (!set) {
    set = new Set();
    inMemoryBookmarks.set(userId, set);
  }

  if (set.has(itemId)) {
    set.delete(itemId);
    return false;
  } else {
    set.add(itemId);
    return true;
  }
}

// --- Multi-Device Reading Progress Store ---

export async function getUserReadingProgress(userId: string, itemId: string) {
  const pool = getPostgresPool();
  if (pool) {
    try {
      await ensureTables();
      const res = await pool.query(
        'SELECT page_index, total_pages, updated_at FROM reading_progress WHERE user_id = $1 AND item_id = $2',
        [userId, itemId]
      );
      if (res.rows.length > 0) {
        return {
          pageIndex: res.rows[0].page_index,
          totalPages: res.rows[0].total_pages,
          updatedAt: res.rows[0].updated_at.toISOString()
        };
      }
      return null;
    } catch (err) {
      console.error('getUserReadingProgress Postgres error:', err);
    }
  }

  const userMap = inMemoryProgress.get(userId);
  return userMap?.get(itemId) || null;
}

export async function saveUserReadingProgress(userId: string, itemId: string, pageIndex: number, totalPages: number) {
  const now = new Date().toISOString();
  const pool = getPostgresPool();
  if (pool) {
    try {
      await ensureTables();
      const id = `prog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await pool.query(
        `INSERT INTO reading_progress (id, user_id, item_id, page_index, total_pages, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, item_id)
         DO UPDATE SET page_index = EXCLUDED.page_index, total_pages = EXCLUDED.total_pages, updated_at = EXCLUDED.updated_at`,
        [id, userId, itemId, pageIndex, totalPages, now]
      );
      return { pageIndex, totalPages, updatedAt: now };
    } catch (err) {
      console.error('saveUserReadingProgress Postgres error:', err);
    }
  }

  let userMap = inMemoryProgress.get(userId);
  if (!userMap) {
    userMap = new Map();
    inMemoryProgress.set(userId, userMap);
  }
  const data = { pageIndex, totalPages, updatedAt: now };
  userMap.set(itemId, data);
  return data;
}
