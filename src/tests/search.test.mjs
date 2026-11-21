import test from 'node:test';
import assert from 'node:assert/strict';

import { HybridSearchService } from '../search/hybrid-search.ts';
import { generateEmbedding, cosineSimilarity } from '../lib/vector.ts';
import { db } from '../lib/db.ts';

test('HybridSearchService: parseNaturalQuery extracts inclusions, exclusions, and concepts', () => {
  const service = new HybridSearchService();
  const query = service.parseNaturalQuery('wholesome fantasy romance without yandere');

  assert.equal(query.query_text, 'wholesome fantasy romance without yandere');
  assert.ok(query.exclude_tags.includes('t-yandere'), 'Should identify t-yandere as excluded tag');
  assert.ok(query.include_tags.includes('t-wholesome'), 'Should identify t-wholesome as include tag');
  assert.ok(query.include_tags.includes('t-fantasy'), 'Should identify t-fantasy as include tag');
  assert.ok(query.include_tags.includes('t-romance'), 'Should identify t-romance as include tag');
});

test('HybridSearchService: handles minus syntax for tag exclusion', () => {
  const service = new HybridSearchService();
  const query = service.parseNaturalQuery('elf romance -yandere');

  assert.ok(query.exclude_tags.includes('t-yandere'), 'Should exclude yandere with minus prefix');
  assert.ok(query.include_tags.includes('t-elf'), 'Should include elf');
});

test('HybridSearchService: strict exclusion filter guarantees no excluded tag in results', () => {
  const service = new HybridSearchService();
  const query = service.parseNaturalQuery('gothic without yandere');
  const response = service.search(query);

  assert.ok(response.items.length > 0, 'Should return matching gothic items');
  for (const item of response.items) {
    const hasYandere = item.tags.some(t => t.id === 't-yandere' || t.normalizedName === 'yandere');
    assert.equal(hasYandere, false, `Item ${item.id} should NOT have yandere tag`);
  }
});

test('Vector: generateEmbedding and cosineSimilarity return valid normalized scores', () => {
  const vec1 = generateEmbedding('wholesome gentle romance');
  const vec2 = generateEmbedding('warm gentle affection love');
  const vec3 = generateEmbedding('cyberpunk android laser warfare');

  const simHigh = cosineSimilarity(vec1, vec2);
  const simLow = cosineSimilarity(vec1, vec3);

  assert.ok(simHigh > simLow, `Expected similarity between romance concepts (${simHigh}) to exceed sci-fi combat (${simLow})`);
  assert.ok(simHigh >= 0 && simHigh <= 1, 'Cosine similarity should be between 0 and 1');
});

test('Database: rights and eligibility gates block quarantined or prohibited items from public search', () => {
  const service = new HybridSearchService();
  // Quarantine item nym-105 temporarily
  db.updateItemStatus('nym-105', 'quarantined', 'test-suite');

  const query = service.parseNaturalQuery('Countess of Thorns');
  const response = service.search(query);

  const foundQuarantined = response.items.some(i => i.id === 'nym-105');
  assert.equal(foundQuarantined, false, 'Quarantined item must not appear in public search results');

  // Restore item
  db.updateItemStatus('nym-105', 'published', 'test-suite');
  const restoredResponse = service.search(query);
  const foundRestored = restoredResponse.items.some(i => i.id === 'nym-105');
  assert.equal(foundRestored, true, 'Restored published item should be discoverable');
});
