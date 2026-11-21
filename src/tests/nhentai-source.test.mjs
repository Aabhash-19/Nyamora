import test from 'node:test';
import assert from 'node:assert/strict';

import { sourceManager } from '../lib/sources/source-manager.ts';
import { NHentaiSource } from '../lib/sources/nhentai-source.ts';

test('NHentaiSource: registers properly in SourceManager with capabilities', () => {
  const sources = sourceManager.getAllSources();
  const nhSource = sources.find(s => s.id === 'nhentai-api');

  assert.ok(nhSource, 'nHentai source must be registered');
  assert.equal(nhSource.isExternal, true);
  assert.equal(nhSource.capabilities.supportsSearch, true);
  assert.equal(nhSource.capabilities.supportsRandom, true);
  assert.equal(nhSource.capabilities.supportsReader, true);
  assert.equal(nhSource.capabilities.supportsPagination, true);
});

test('NHentaiSource: normalizes raw API v2 gallery record into canonical CatalogueItem', () => {
  const source = new NHentaiSource();

  const mockGallery = {
    id: 699075,
    media_id: '4345188',
    title: {
      english: 'Onee-Shota Haunted Spot (Part 1)',
      japanese: 'おね◯ョタ心霊スポット（前編',
      pretty: 'Onee-Shota Haunted Spot'
    },
    cover: {
      path: 'galleries/4345188/cover.webp',
      width: 350,
      height: 494
    },
    thumbnail: {
      path: 'galleries/4345188/thumb.webp',
      width: 250,
      height: 353
    },
    upload_date: 1795278829,
    num_pages: 10,
    num_favorites: 142,
    tags: [
      { id: 33172, type: 'category', name: 'doujinshi' },
      { id: 17249, type: 'language', name: 'japanese' },
      { id: 2937, type: 'tag', name: 'big breasts' },
      { id: 8901, type: 'artist', name: 'Mochizuki Aoi' },
      { id: 1204, type: 'parody', name: 'fate grand order' }
    ]
  };

  const item = source.normalizeNHentaiRecord(mockGallery);

  assert.equal(item.id, 'nh-699075');
  assert.equal(item.canonicalTitle, 'Onee-Shota Haunted Spot (Part 1)');
  assert.equal(item.creatorName, 'Mochizuki Aoi', 'Artist should be extracted from artist tag');
  assert.equal(item.language, 'japanese');
  assert.equal(item.pageCount, 10);
  assert.equal(item.saveCount, 142);
  assert.equal(item.availabilityMode, 'integrated_licensed');
  assert.equal(item.coverImage, 'https://t1.nhentai.net/galleries/4345188/cover.webp');

  // Verify tag categories
  const parodyTag = item.tags.find(t => t.normalizedName === 'fate grand order');
  assert.ok(parodyTag);
  assert.equal(parodyTag.category, 'character');

  const genreTag = item.tags.find(t => t.normalizedName === 'doujinshi');
  assert.ok(genreTag);
  assert.equal(genreTag.category, 'genre');
});

test('NHentaiSource: generates valid reader pages for integrated reading', async () => {
  const source = new NHentaiSource();
  const pages = await source.getPages('nh-699075');

  assert.ok(Array.isArray(pages), 'Pages must be an array');
  assert.ok(pages.length > 0, 'Must have pages');
  assert.equal(pages[0].pageIndex, 1);
  assert.equal(pages[0].itemId, 'nh-699075');
  assert.ok(pages[0].imageUrl.includes('http'));
});

test('SourceManager: routes nh-* IDs through NHentaiSource smoothly', async () => {
  const item = await sourceManager.getById('nh-699075');
  assert.ok(item, 'Should retrieve or fallback for nh-699075');
  assert.equal(item.id, 'nh-699075');

  const pages = await sourceManager.getPages('nh-699075');
  assert.ok(pages.length > 0, 'Should retrieve reader pages via sourceManager');
});
