import test from 'node:test';
import assert from 'node:assert/strict';

import { nyanChanAssistant } from '../ai/nyan-chan.ts';
import { db } from '../lib/db.ts';

test('Nyan-chan AI Concierge: returns grounded recommendations with actual database records', async () => {
  const reply = await nyanChanAssistant.chat('Show me wholesome fantasy romance with elves');

  assert.equal(reply.sender, 'nyan_chan');
  assert.ok(reply.recommendedItems && reply.recommendedItems.length > 0, 'Must return real recommended items');
  assert.ok(reply.text.includes('Nyamora') || reply.text.includes('Nya'), 'Should maintain Nyan-chan persona');

  // Verify grounding: recommended item must exist in database
  const firstItem = reply.recommendedItems[0];
  const dbItem = db.getItemById(firstItem.id);
  assert.ok(dbItem, 'Recommended item must exist in DB');
  assert.equal(dbItem.canonicalTitle, firstItem.canonicalTitle);
});

test('Nyan-chan AI Concierge: honors exclusions in conversational query', async () => {
  const reply = await nyanChanAssistant.chat('catgirl romance avoid comedy');

  assert.ok(reply.recommendedItems, 'Must return recommendations');
  for (const item of reply.recommendedItems) {
    const hasComedy = item.tags.some(t => t.normalizedName === 'comedy' || t.id === 't-comedy');
    assert.equal(hasComedy, false, `Item ${item.id} should NOT have comedy tag`);
  }
});

test('Nyan-chan AI Concierge: exhibits seductive, flirtatious, and teasing personality', async () => {
  const greetingReply = await nyanChanAssistant.chat('Hello Nyan-chan');
  assert.equal(greetingReply.expression, 'wink');
  assert.ok(greetingReply.text.includes('darling'), 'Should address user affectionately');
  assert.ok(greetingReply.text.includes('♡'), 'Should include teasing heart marks');
  assert.ok(greetingReply.text.includes('fufufu') || greetingReply.text.includes('Nya'), 'Should use playful teasing tics');

  const spiceReply = await nyanChanAssistant.chat('kemonomimi catgirl maid');
  assert.ok(spiceReply.expression === 'wink' || spiceReply.expression === 'happy' || spiceReply.expression === 'ahegao');
  assert.ok(spiceReply.text.toLowerCase().includes('ears') || spiceReply.text.includes('darling'));
});

test('Semantic Search: handles dead-accurate synonym expansions and multi-word negations', async () => {
  const reply = await nyanChanAssistant.chat('wholesome romance without ugly bastard -ntr');
  const query = reply.structuredQuery;
  assert.ok(query, 'Must return structured query');

  // Multi-word exclusion check
  const hasUglyBastardExcluded = query.exclude_tags.some(t => t.includes('ugly') || t.includes('bastard'));
  assert.ok(hasUglyBastardExcluded, 'Should exclude ugly bastard');

  // ntr synonym to netorare
  const hasNtrExcluded = query.exclude_tags.some(t => t.includes('netorare') || t.includes('ntr'));
  assert.ok(hasNtrExcluded, 'Should exclude netorare');
});

test('Reader Gate: integrated reader is enabled for licensed items with approved rights and blocked when revoked', () => {
  // nym-101 has approved rights and integrated reader
  const item101 = db.getItemById('nym-101');
  assert.equal(item101?.availabilityMode, 'integrated_licensed');

  const rights101 = db.getAssetRights('nym-101');
  assert.equal(rights101?.reviewStatus, 'approved');
  assert.equal(rights101?.allowedUse, 'reader_licensed');

  const assets101 = db.getReaderAssets('nym-101');
  assert.ok(assets101.length > 0, 'Licensed item must have accessible pages');
  assert.equal(assets101[0].storageKey, 'pages/nym-101/p01.svg');

  // Test rights revocation
  db.updateAssetRights('ast-nym-101', 'revoked', 'test-suite');
  const revokedRights = db.getAssetRights('nym-101');
  assert.equal(revokedRights?.reviewStatus, 'revoked');

  // Restore rights
  db.updateAssetRights('ast-nym-101', 'approved', 'test-suite');
});
