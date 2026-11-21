import test from 'node:test';
import assert from 'node:assert/strict';

import { sourceManager } from '../lib/sources/source-manager.ts';

test('SourceManager: registers default sources and declares capability matrices', () => {
  const sources = sourceManager.getAllSources();
  assert.ok(sources.length >= 2, 'Should have at least 2 sources registered');

  const local = sources.find(s => s.id === 'nyamora-local');
  assert.ok(local, 'Local source must be registered');
  assert.equal(local.isExternal, false);
  assert.equal(local.capabilities.supportsSearch, true);
  assert.equal(local.capabilities.supportsRandom, true);

  const mangadex = sources.find(s => s.id === 'mangadex-api');
  assert.ok(mangadex, 'MangaDex source must be registered');
  assert.equal(mangadex.isExternal, true);
});

test('SourceManager: retrieves items via active source and supports switching', async () => {
  const active = sourceManager.getActiveSource();
  assert.equal(active.id, 'nyamora-local');

  const item = await sourceManager.getById('nym-101');
  assert.ok(item, 'Must retrieve item nym-101');
  assert.equal(item.canonicalTitle, "Shadow Border Special Duty: Scathach");

  const randomItem = await sourceManager.getRandom();
  assert.ok(randomItem, 'Random item must not be null');
});

test('SourceManager: executes search query through unified interface', async () => {
  const response = await sourceManager.search({
    query_text: 'elf',
    concepts: [],
    include_tags: [],
    exclude_tags: [],
    creator_terms: [],
    title_terms: [],
    sort: 'relevance',
    page: 1,
    pageSize: 10
  });

  assert.ok(response.items.length > 0, 'Search for elf should return matching records');
});
