import test from 'node:test';
import assert from 'node:assert/strict';

import { sourceManager } from '../lib/sources/source-manager.ts';

test('SourceManager: registers nHentai as the primary source with capabilities', () => {
  const sources = sourceManager.getAllSources();
  assert.ok(sources.length >= 1, 'Should have nHentai source registered');

  const nhSource = sources.find(s => s.id === 'nhentai-api');
  assert.ok(nhSource, 'nHentai source must be registered');
  assert.equal(nhSource.isExternal, true);
  assert.equal(nhSource.capabilities.supportsSearch, true);
  assert.equal(nhSource.capabilities.supportsRandom, true);
  assert.equal(nhSource.capabilities.supportsReader, true);
});

test('SourceManager: retrieves items via active nHentai source', async () => {
  const active = sourceManager.getActiveSource();
  assert.equal(active.id, 'nhentai-api');

  const item = await sourceManager.getById('nh-699075');
  assert.ok(item, 'Must retrieve item nh-699075');
  assert.ok(item.canonicalTitle);

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

  assert.ok(response.items !== undefined, 'Search response must return items array');
});
