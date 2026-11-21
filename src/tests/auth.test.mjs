import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../lib/auth.ts';
import { createUser, findUserByUsernameOrEmail, toggleUserBookmark, getUserBookmarks, saveUserReadingProgress, getUserReadingProgress } from '../lib/user-store.ts';

test('Auth: password hashing and verification', () => {
  const password = 'SecretPassword123!';
  const { hash, salt } = hashPassword(password);

  assert.ok(hash && salt, 'Hash and salt should be generated');
  assert.equal(verifyPassword(password, hash, salt), true, 'Valid password should verify');
  assert.equal(verifyPassword('WrongPassword', hash, salt), false, 'Incorrect password should fail');
});

test('Auth: session token creation and verification', () => {
  const session = {
    userId: 'usr-test-123',
    username: 'nyan_fan',
    email: 'fan@nyamora.moe',
    is18Plus: true
  };

  const token = createSessionToken(session);
  assert.ok(typeof token === 'string' && token.includes('.'), 'Token should be a JWT formatted string');

  const decoded = verifySessionToken(token);
  assert.ok(decoded, 'Token should verify successfully');
  assert.equal(decoded.userId, session.userId);
  assert.equal(decoded.username, session.username);
  assert.equal(decoded.is18Plus, true);

  const tamperedToken = token.slice(0, -4) + 'abcd';
  assert.equal(verifySessionToken(tamperedToken), null, 'Tampered token must be rejected');
});

test('UserStore: create and retrieve user with cross-device bookmarks', async () => {
  const username = `testuser_${Date.now()}`;
  const email = `${username}@example.com`;

  const created = await createUser({
    username,
    email,
    password: 'securePassword99',
    birthday: '2000-01-01',
    age: 26
  });

  assert.equal(created.username, username);
  assert.equal(created.age, 26);

  const found = await findUserByUsernameOrEmail(username);
  assert.ok(found, 'Should find user by username');
  assert.equal(found.id, created.id);

  // Test bookmark syncing
  const b1 = await toggleUserBookmark(created.id, 'nh-699075');
  assert.equal(b1, true, 'First toggle should bookmark');

  const bookmarks = await getUserBookmarks(created.id);
  assert.ok(bookmarks.includes('nh-699075'), 'User bookmarks should contain item');

  // Test reading progress syncing
  const progress = await saveUserReadingProgress(created.id, 'nh-699075', 5, 24);
  assert.equal(progress.pageIndex, 5);

  const fetchedProgress = await getUserReadingProgress(created.id, 'nh-699075');
  assert.equal(fetchedProgress?.pageIndex, 5);
  assert.equal(fetchedProgress?.totalPages, 24);
});
