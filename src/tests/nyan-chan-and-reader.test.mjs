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

test('Reader Gate: integrated reader is prohibited for items without licensed rights', () => {
  // nym-102 is 'external_authorized', not 'integrated_licensed'
  const item102 = db.getItemById('nym-102');
  assert.equal(item102?.availabilityMode, 'external_authorized');

  const rights102 = db.getAssetRights('nym-102');
  assert.equal(rights102?.allowedUse, 'display_thumbnail');

  // nym-101 is 'integrated_licensed' with approved rights
  const item101 = db.getItemById('nym-101');
  assert.equal(item101?.availabilityMode, 'integrated_licensed');

  const rights101 = db.getAssetRights('nym-101');
  assert.equal(rights101?.reviewStatus, 'approved');
  assert.equal(rights101?.allowedUse, 'reader_licensed');

  const assets101 = db.getReaderAssets('nym-101');
  assert.ok(assets101.length > 0, 'Licensed item must have accessible pages');
});
