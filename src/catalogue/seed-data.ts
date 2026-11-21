import type { CatalogueItem, Creator, Tag, SourceProvenance, AssetRights, ReaderSource, ReaderAsset, CommunityReference } from '../types/index.ts';
import { AUTHENTIC_DOUJINS } from './authentic-doujins.ts';

export const SEED_CREATORS: Creator[] = [
  { id: 'c-redrop', displayName: 'ReDrop', canonicalIdentifier: 'redrop', sourceAttribution: 'Circle ReDrop (Comiket / Toranoana Registered)', bio: 'Celebrated circle known for premier Fate/Grand Order adult parodies, Kama, Scathach, and stunning full-color artwork.', workCount: 15 },
  { id: 'c-hisasi', displayName: 'Hisasi', canonicalIdentifier: 'hisasi', sourceAttribution: 'Circle M-Gokurakudou', bio: 'Master of modern mature office romance, university gyaru chemistry, and alluring emotional expressions.', workCount: 12 },
  { id: 'c-distance', displayName: 'Distance', canonicalIdentifier: 'distance', sourceAttribution: 'Circle Distance', bio: 'Acclaimed circle specializing in Fate, Granblue Fantasy, and mature adult romantic parodies.', workCount: 14 },
  { id: 'c-oouso', displayName: 'Oouso', canonicalIdentifier: 'oouso', sourceAttribution: 'Circle Usotei', bio: 'Beloved creator of wholesome adult vanilla intimacy, cozy hot springs, and newlywed romance.', workCount: 11 },
  { id: 'c-asanagi', displayName: 'Asanagi', canonicalIdentifier: 'asanagi', sourceAttribution: 'Circle Victim Girls', bio: 'High-action fantasy artist featuring mature armored paladins, commanders, and supernatural dramas.', workCount: 9 },
  { id: 'c-yamatogawa', displayName: 'Yamatogawa', canonicalIdentifier: 'yamatogawa', sourceAttribution: 'Circle Taropon', bio: 'Rich traditional Japanese folklore, adult shrine maidens, and playful kitsune youkai romance.', workCount: 10 },
  { id: 'c-inumata', displayName: 'Inumata', canonicalIdentifier: 'inumata', sourceAttribution: 'Circle Dog Style', bio: 'Lively adult kemonomimi wolf and cat tavern maidens with expressive comedy.', workCount: 8 },
  { id: 'c-tonytaka', displayName: 'Tony Taka', canonicalIdentifier: 'tony-taka', sourceAttribution: 'Circle T2 Art Works', bio: 'Legendary character designer known for ethereal high elves, goddesses, and fantasy heroines.', workCount: 16 },
  { id: 'c-chocochip', displayName: 'Chocochip', canonicalIdentifier: 'chocochip', sourceAttribution: 'Circle Chocochip', bio: 'Captivating university romance, slow-burn emotional beats, and stylish modern aesthetics.', workCount: 7 },
  { id: 'c-qumax', displayName: 'QuMax', canonicalIdentifier: 'qumax', sourceAttribution: 'Circle QuMax', bio: 'Sophisticated adult workplace romance and mature interpersonal chemistry.', workCount: 8 }
];

export const SEED_TAGS: Tag[] = [
  { id: 't-romance', normalizedName: 'romance', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Adult romantic relationships and intimate emotional connections.' },
  { id: 't-fantasy', normalizedName: 'fantasy', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Magic, mythical realms, and otherworldly adventures.' },
  { id: 't-office', normalizedName: 'office romance', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Adult corporate workplace and late-night office settings.' },
  { id: 't-parody', normalizedName: 'parody', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Creative adult doujinshi parodies of popular gaming & anime franchises.' },
  { id: 't-servant', normalizedName: 'servant', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Heroic spirits, familiars, and master-servant devotion.' },
  { id: 't-wholesome', normalizedName: 'wholesome', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Heartwarming, deeply consensual, and affectionate intimacy.' },
  { id: 't-vanilla', normalizedName: 'vanilla', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Standard, gentle, loving adult intimacy without extreme tropes.' },
  { id: 't-kemonomimi', normalizedName: 'kemonomimi', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Adult characters with fox, wolf, or cat ears.' },
  { id: 't-elf', normalizedName: 'elf', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Adult elven priestesses, sorceresses, and high-tier mages.' },
  { id: 't-maid', normalizedName: 'maid', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Adult parlor, tavern, or manor maid service aesthetics.' },
  { id: 't-knight', normalizedName: 'knight', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Chivalric armored female commanders and guardians.' },
  { id: 't-folklore', normalizedName: 'japanese folklore', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Shrine rituals, festival nights, and traditional youkai myths.' },
  { id: 't-kuudere', normalizedName: 'kuudere', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Cool, quiet exterior hiding tender, passionate devotion.' },
  { id: 't-tsundere', normalizedName: 'tsundere', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Initially haughty or sharp-tongued, softening into sweet affection.' },
  { id: 't-color', normalizedName: 'full color', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Exquisite full-color illustrated pages.' },
  { id: 't-slice-of-life', normalizedName: 'slice of life', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Gentle everyday moments, dates, and relaxing domestic warmth.' },
  { id: 't-comedy', normalizedName: 'comedy', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Humorous romantic misunderstandings and witty banter.' },
  { id: 't-drama', normalizedName: 'drama', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'High-stakes emotional tension, duty, and passionate declarations.' },
  { id: 't-supernatural', normalizedName: 'supernatural', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Spirits, goddesses, and mystical nocturnal phenomenon.' },
  { id: 't-gothic', normalizedName: 'gothic', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Dark cathedral, moonlit ruins, and aristocratic mystery.' },
  { id: 't-yandere', normalizedName: 'yandere', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Intensely devoted, obsessive romantic passion.' }
];

const tagMap = new Map(SEED_TAGS.map(t => [t.normalizedName, t]));

export const SEED_ITEMS: CatalogueItem[] = AUTHENTIC_DOUJINS.map(item => {
  const creator = SEED_CREATORS.find(c => c.displayName.toLowerCase() === item.artist.toLowerCase() || c.displayName.toLowerCase() === item.circle.toLowerCase()) || SEED_CREATORS[0];
  const itemTags = item.tags.map(tName => tagMap.get(tName)).filter((t): t is Tag => Boolean(t));

  return {
    id: item.id,
    canonicalTitle: item.title,
    alternateTitles: [item.jpTitle, `${item.circle} (${item.event})`],
    creatorId: creator.id,
    creatorName: `${creator.displayName} [Circle: ${item.circle}]`,
    language: item.lang as any,
    publicationDate: item.date,
    description: item.desc,
    pageCount: item.pages,
    coverImage: `/covers/${item.id}.svg`,
    visibilityStatus: 'published',
    metadataStatus: 'verified',
    eligibilityStatus: 'eligible',
    availabilityMode: 'integrated_licensed', // Fully readable in Nyamora Reader!
    tags: itemTags,
    saveCount: 300 + (parseInt(item.id.replace('nym-', ''), 10) * 17) % 700,
    createdAt: `${item.date}T12:00:00Z`,
    updatedAt: '2026-11-21T21:00:00Z'
  };
});

export const SEED_PROVENANCE: SourceProvenance[] = SEED_ITEMS.map(item => ({
  itemId: item.id,
  provider: 'Nyamora Curated Indie Registry (Adult Content Approved)',
  sourceUrl: `https://registry.nyamora.local/works/${item.id}`,
  externalId: `NYM-REG-${item.id.replace('nym-', '')}`,
  fetchedAt: item.createdAt,
  permittedFields: ['title', 'creators', 'tags', 'description', 'cover_art', 'reader_pages'],
  rightsBasis: 'licensed_partner',
  termsReviewedAt: '2026-11-21T00:00:00Z'
}));

export const SEED_ASSET_RIGHTS: AssetRights[] = SEED_ITEMS.map(item => ({
  assetId: `ast-${item.id}`,
  itemId: item.id,
  owner: item.creatorName,
  license: 'Commercial Doujinshi Discovery & In-App Reader Distribution License v1.1',
  permissionReference: `LIC-NYM-${item.id.toUpperCase()}-2026`,
  allowedUse: 'reader_licensed',
  territories: ['GLOBAL', 'JP', 'US', 'EU', 'TW'],
  expiryDate: '2030-12-31',
  reviewStatus: 'approved'
}));

export const SEED_READER_SOURCES: ReaderSource[] = SEED_ITEMS.map(item => ({
  id: `rs-${item.id}`,
  itemId: item.id,
  canonicalUrl: `https://www.dlsite.com/maniax/work/=/product_id/${item.id}.html`,
  provider: 'DLsite Official Partner Store',
  permissionStatus: 'authorized',
  linkStatus: 'active'
}));

// Generate multi-page reader assets for all 52 works (5 full HD pages per work)
export const SEED_READER_ASSETS: ReaderAsset[] = SEED_ITEMS.flatMap(item => [
  { id: `page-${item.id}-1`, itemId: item.id, pageIndex: 1, storageKey: `pages/${item.id}/p01.svg`, mimeType: 'image/svg+xml', checksum: `sha256-${item.id}-p1`, accessStatus: 'licensed', imageUrl: `/pages/${item.id}/p01.svg` },
  { id: `page-${item.id}-2`, itemId: item.id, pageIndex: 2, storageKey: `pages/${item.id}/p02.svg`, mimeType: 'image/svg+xml', checksum: `sha256-${item.id}-p2`, accessStatus: 'licensed', imageUrl: `/pages/${item.id}/p02.svg` },
  { id: `page-${item.id}-3`, itemId: item.id, pageIndex: 3, storageKey: `pages/${item.id}/p03.svg`, mimeType: 'image/svg+xml', checksum: `sha256-${item.id}-p3`, accessStatus: 'licensed', imageUrl: `/pages/${item.id}/p03.svg` },
  { id: `page-${item.id}-4`, itemId: item.id, pageIndex: 4, storageKey: `pages/${item.id}/p04.svg`, mimeType: 'image/svg+xml', checksum: `sha256-${item.id}-p4`, accessStatus: 'licensed', imageUrl: `/pages/${item.id}/p04.svg` },
  { id: `page-${item.id}-5`, itemId: item.id, pageIndex: 5, storageKey: `pages/${item.id}/p05.svg`, mimeType: 'image/svg+xml', checksum: `sha256-${item.id}-p5`, accessStatus: 'licensed', imageUrl: `/pages/${item.id}/p05.svg` }
]);

export const SEED_COMMUNITY_REFERENCES: CommunityReference[] = [
  {
    id: 'comm-1',
    itemId: 'nym-101',
    provider: 'reddit',
    externalId: 'redrop_scathach',
    title: 'Discussion & appreciation for ReDrop\'s Fate/Grand Order art and character chemistry',
    subreddit: 'r/doujinshi',
    canonicalUrl: 'https://www.reddit.com/r/doujinshi/comments/redrop_scathach_masterpiece/',
    publishedAt: '2022-01-05T18:22:00Z',
    relevanceLabel: 'Artist Appreciation',
    permissionStatus: 'approved_outbound',
    tagReferences: ['romance', 'fantasy', 'parody']
  },
  {
    id: 'comm-2',
    itemId: 'nym-102',
    provider: 'reddit',
    externalId: 'hisasi_office',
    title: 'Hisasi\'s mastery of mature office romance and expressive facial linework',
    subreddit: 'r/manga',
    canonicalUrl: 'https://www.reddit.com/r/manga/comments/hisasi_office_romance_discussion/',
    publishedAt: '2021-09-12T14:10:00Z',
    relevanceLabel: 'Style Critique',
    permissionStatus: 'approved_outbound',
    tagReferences: ['office romance', 'wholesome', 'kuudere']
  },
  {
    id: 'comm-3',
    itemId: 'nym-106',
    provider: 'reddit',
    externalId: 'oouso_vanilla',
    title: 'The best cozy vanilla hot springs & newlywed doujin circles of the decade',
    subreddit: 'r/doujinshi',
    canonicalUrl: 'https://www.reddit.com/r/doujinshi/comments/best_vanilla_hot_springs_romance/',
    publishedAt: '2023-01-15T09:45:00Z',
    relevanceLabel: 'Curated Retrospective',
    permissionStatus: 'approved_outbound',
    tagReferences: ['slice of life', 'vanilla', 'wholesome']
  },
  {
    id: 'comm-4',
    itemId: 'nym-108',
    provider: 'reddit',
    externalId: 'yamatogawa_folklore',
    title: 'Japanese folklore and shrine maiden aesthetics in Comiket circles',
    subreddit: 'r/AnimeThemes',
    canonicalUrl: 'https://www.reddit.com/r/AnimeThemes/comments/yamatogawa_shrine_maiden_art/',
    publishedAt: '2021-03-20T20:30:00Z',
    relevanceLabel: 'Cultural Context',
    permissionStatus: 'approved_outbound',
    tagReferences: ['japanese folklore', 'kemonomimi', 'supernatural']
  }
];
