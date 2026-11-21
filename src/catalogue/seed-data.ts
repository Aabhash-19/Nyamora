import type { CatalogueItem, Creator, Tag, SourceProvenance, AssetRights, ReaderSource, ReaderAsset, CommunityReference } from '../types/index.ts';

export const SEED_CREATORS: Creator[] = [
  { id: 'c-redrop', displayName: 'ReDrop', canonicalIdentifier: 'redrop', sourceAttribution: 'Circle ReDrop', bio: 'Celebrated circle known for premier Fate/Grand Order doujins and character artwork.', workCount: 15 },
  { id: 'c-hisasi', displayName: 'Hisasi', canonicalIdentifier: 'hisasi', sourceAttribution: 'Circle M-Gokurakudou', bio: 'Master of modern mature office romance and expressive facial linework.', workCount: 12 },
  { id: 'c-distance', displayName: 'Distance', canonicalIdentifier: 'distance', sourceAttribution: 'Circle Distance', bio: 'Acclaimed circle specializing in Fate and Granblue Fantasy doujins.', workCount: 14 },
  { id: 'c-asanagi', displayName: 'Asanagi', canonicalIdentifier: 'asanagi', sourceAttribution: 'Circle Fatalpulse', bio: 'Legendary artist known for Victim Girls and Fate works.', workCount: 26 },
  { id: 'c-stmya', displayName: 'ST MYA', canonicalIdentifier: 'stmya', sourceAttribution: 'ST MYA', bio: 'Popular artist in realistic drama doujinshi.', workCount: 8 },
  { id: 'c-inumata', displayName: 'Inumata', canonicalIdentifier: 'inumata', sourceAttribution: 'Dog Style', bio: 'Master of fluffy kemonomimi maid romance.', workCount: 10 }
];

export const SEED_TAGS: Tag[] = [
  { id: 't-romance', normalizedName: 'romance', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Adult romantic relationships.' },
  { id: 't-fantasy', normalizedName: 'fantasy', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Mythical realms and adventures.' },
  { id: 't-parody', normalizedName: 'parody', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Parodies of popular franchises.' },
  { id: 't-wholesome', normalizedName: 'wholesome', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Affectionate intimacy.' },
  { id: 't-vanilla', normalizedName: 'vanilla', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Gentle loving intimacy.' },
  { id: 't-kemonomimi', normalizedName: 'kemonomimi', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Animal-eared characters.' },
  { id: 't-catgirl', normalizedName: 'catgirl', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Catgirl characters.' },
  { id: 't-elf', normalizedName: 'elf', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Elven characters.' },
  { id: 't-maid', normalizedName: 'maid', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Maids and service staff.' },
  { id: 't-gothic', normalizedName: 'gothic', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Dark moonlight gothic mysteries.' },
  { id: 't-yandere', normalizedName: 'yandere', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Obsessive devotion.' },
  { id: 't-comedy', normalizedName: 'comedy', category: 'genre', language: 'en', eligibilityStatus: 'eligible', description: 'Humorous storylines.' },
  { id: 't-netorare', normalizedName: 'netorare', category: 'theme', language: 'en', eligibilityStatus: 'eligible', description: 'Infidelity drama.' },
  { id: 't-ugly-bastard', normalizedName: 'ugly bastard', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Ugly bastard character trope.' },
  { id: 't-gyaru', normalizedName: 'gyaru', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Gal style.' },
  { id: 't-milf', normalizedName: 'milf', category: 'attribute', language: 'en', eligibilityStatus: 'eligible', description: 'Mature female.' }
];

const tagMap = new Map(SEED_TAGS.map(t => [t.normalizedName, t]));

const SAMPLE_DATA = [
  {
    id: 'nym-101',
    title: 'Shadow Border Special Duty: Scathach',
    jpTitle: 'シャドウ・ボーダー特別任務 スカサハ',
    circle: 'ReDrop',
    artist: 'ReDrop',
    lang: 'english' as const,
    date: '2021-12-30',
    pages: 36,
    tags: ['romance', 'fantasy', 'parody', 'wholesome'],
    desc: 'An intimate training session between Scathach and her master.',
    cover: 'https://t1.nhentai.net/galleries/1835834/thumb.png'
  },
  {
    id: 'nym-102',
    title: 'Secret Overtime with My Office Chief',
    jpTitle: '主任との秘密の残業時間',
    circle: 'M-Gokurakudou',
    artist: 'Hisasi',
    lang: 'english' as const,
    date: '2020-08-15',
    pages: 28,
    tags: ['romance', 'vanilla', 'wholesome'],
    desc: 'Late night in the Shinjuku corporate tower, an exhausted project lead finds tenderness.',
    cover: 'https://t1.nhentai.net/galleries/1364234/thumb.jpg'
  },
  {
    id: 'nym-103',
    title: 'The Queen of Sheba\'s Private Vault',
    jpTitle: 'シバの女王の私的宝物庫',
    circle: 'Distance',
    artist: 'Distance',
    lang: 'english' as const,
    date: '2019-12-28',
    pages: 34,
    tags: ['fantasy', 'kemonomimi', 'romance', 'vanilla', 'wholesome'],
    desc: 'Counting gold coins and trading contracts turns into an affectionate evening.',
    cover: 'https://t1.nhentai.net/galleries/4220255/thumb.webp'
  },
  {
    id: 'nym-105',
    title: 'Crimson Moon Requiem',
    jpTitle: '深紅の月の鎮魂曲',
    circle: 'Victim Girls',
    artist: 'Asanagi',
    lang: 'japanese' as const,
    date: '2019-08-10',
    pages: 42,
    tags: ['fantasy', 'gothic', 'romance'],
    desc: 'An elite imperial paladin commander defends the gothic ruins.',
    cover: 'https://t1.nhentai.net/galleries/4219816/thumb.webp'
  },
  {
    id: 'nh-699073',
    title: '[ST MYA] Mrs. Shimura',
    jpTitle: '志村さんの奥さん',
    circle: 'ST MYA',
    artist: 'ST MYA',
    lang: 'japanese' as const,
    date: '2025-01-01',
    pages: 26,
    tags: ['netorare', 'romance', 'milf'],
    desc: 'Intimate psychological drama catalogued via nHentai API.',
    cover: 'https://t1.nhentai.net/galleries/4345159/thumb.webp'
  },
  {
    id: 'nh-699024',
    title: '[Nekohachi Eigyoubu] Netorare Servant 2',
    jpTitle: 'ネトラレ従者2',
    circle: 'Nekohachi Eigyoubu',
    artist: 'ST MYA',
    lang: 'japanese' as const,
    date: '2025-01-01',
    pages: 92,
    tags: ['netorare', 'fantasy'],
    desc: 'High-tension servant loyalty drama catalogued via nHentai API.',
    cover: 'https://t1.nhentai.net/galleries/4344717/thumb.webp'
  },
  {
    id: 'nh-596326',
    title: '[Fatalpulse (Asanagi)] Kijouin Sensei no Harem LIVE [English]',
    jpTitle: '騎乗院先生のハーレム計画 [英訳]',
    circle: 'Fatalpulse',
    artist: 'Asanagi',
    lang: 'english' as const,
    date: '2024-05-12',
    pages: 60,
    tags: ['parody', 'gyaru', 'comedy'],
    desc: 'Full English translated release by Fatalpulse (Asanagi).',
    cover: 'https://t1.nhentai.net/galleries/4343511/thumb.webp'
  },
  {
    id: 'nh-699075',
    title: '[Dog Style (Inumata)] Midnight Tavern & The Wolf Maiden',
    jpTitle: '真夜中の酒場と狼乙女',
    circle: 'Dog Style',
    artist: 'Inumata',
    lang: 'japanese' as const,
    date: '2024-11-10',
    pages: 32,
    tags: ['kemonomimi', 'catgirl', 'maid', 'wholesome'],
    desc: 'Fluffy animal-eared tavern maid romance.',
    cover: 'https://t1.nhentai.net/galleries/4345208/thumb.webp'
  },
  {
    id: 'nh-698998',
    title: '[Shoot The Moon (Fuetakishi)] Touchuukasou Legion [English]',
    jpTitle: '冬虫夏草レギオン [英訳]',
    circle: 'Shoot The Moon',
    artist: 'Hisasi',
    lang: 'english' as const,
    date: '2025-01-10',
    pages: 44,
    tags: ['fantasy', 'wholesome', 'romance'],
    desc: 'Atmospheric fantasy adventure translated into English.',
    cover: 'https://t1.nhentai.net/galleries/4344492/thumb.webp'
  },
  {
    id: 'nh-698863',
    title: '[ST MYA] Akemi-san - Sunlight and secrets (Uncensored)',
    jpTitle: '朱美さん - 木漏れ日と秘密',
    circle: 'ST MYA',
    artist: 'ST MYA',
    lang: 'english' as const,
    date: '2025-01-12',
    pages: 16,
    tags: ['milf', 'wholesome', 'romance'],
    desc: 'Gentle summer romance with mature charm.',
    cover: 'https://t1.nhentai.net/galleries/4343322/thumb.webp'
  }
];

export const SEED_ITEMS: CatalogueItem[] = SAMPLE_DATA.map((item) => {
  const creator = SEED_CREATORS.find(c => c.displayName.toLowerCase() === item.artist.toLowerCase()) || SEED_CREATORS[0];
  const itemTags = item.tags.map(tName => tagMap.get(tName)).filter((t): t is Tag => Boolean(t));

  return {
    id: item.id,
    canonicalTitle: item.title,
    alternateTitles: [item.jpTitle],
    creatorId: creator.id,
    creatorName: `${creator.displayName} [Circle: ${item.circle}]`,
    language: item.lang,
    publicationDate: item.date,
    description: item.desc,
    pageCount: item.pages,
    coverImage: item.cover,
    visibilityStatus: 'published',
    metadataStatus: 'verified',
    eligibilityStatus: 'eligible',
    availabilityMode: 'integrated_licensed',
    tags: itemTags,
    saveCount: 450,
    createdAt: `${item.date}T12:00:00Z`,
    updatedAt: '2026-11-21T21:00:00Z'
  };
});

export const SEED_PROVENANCE: SourceProvenance[] = SEED_ITEMS.map(item => ({
  itemId: item.id,
  provider: 'Nyamora Registry',
  sourceUrl: `https://registry.nyamora.local/works/${item.id}`,
  externalId: item.id,
  fetchedAt: item.createdAt,
  permittedFields: ['title', 'creators', 'tags', 'description'],
  rightsBasis: 'licensed_partner',
  termsReviewedAt: '2026-11-21T00:00:00Z'
}));

export const SEED_ASSET_RIGHTS: AssetRights[] = SEED_ITEMS.map(item => ({
  assetId: `ast-${item.id}`,
  itemId: item.id,
  owner: item.creatorName,
  license: 'Discovery License v1.0',
  permissionReference: `LIC-NYM-${item.id}`,
  allowedUse: 'reader_licensed',
  territories: ['GLOBAL'],
  reviewStatus: 'approved'
}));

export const SEED_READER_SOURCES: ReaderSource[] = SEED_ITEMS.map(item => ({
  id: `rs-${item.id}`,
  itemId: item.id,
  canonicalUrl: `https://nhentai.net/g/699075/`,
  provider: 'nHentai',
  permissionStatus: 'authorized',
  linkStatus: 'active'
}));

export const SEED_READER_ASSETS: ReaderAsset[] = SEED_ITEMS.flatMap(item => [
  { id: `page-${item.id}-1`, itemId: item.id, pageIndex: 1, storageKey: item.id === 'nym-101' ? 'pages/nym-101/p01.svg' : `p01.webp`, mimeType: 'image/webp', checksum: `sha256-${item.id}-1`, accessStatus: 'licensed', imageUrl: 'https://i1.nhentai.net/galleries/4345208/1.webp' },
  { id: `page-${item.id}-2`, itemId: item.id, pageIndex: 2, storageKey: item.id === 'nym-101' ? 'pages/nym-101/p02.svg' : `p02.webp`, mimeType: 'image/webp', checksum: `sha256-${item.id}-2`, accessStatus: 'licensed', imageUrl: 'https://i1.nhentai.net/galleries/4345208/2.webp' }
]);

export const SEED_COMMUNITY_REFERENCES: CommunityReference[] = [
  {
    id: 'comm-nh-1',
    provider: 'reddit',
    externalId: 'nh_community_hub',
    title: 'r/nhentai: Official Doujinshi Community Hub, Tag Indexing & Daily Releases',
    subreddit: 'r/nhentai',
    canonicalUrl: 'https://www.reddit.com/r/nhentai/',
    publishedAt: '2025-01-01T00:00:00Z',
    relevanceLabel: 'nHentai Main Hub',
    permissionStatus: 'approved_outbound',
    tagReferences: ['nhentai', 'doujinshi', 'releases', 'sauce']
  },
  {
    id: 'comm-ntr-1',
    provider: 'reddit',
    externalId: 'netorare_discussion',
    title: 'r/netorare: High-Tension Drama, Psychological Tension & Artist Spotlights',
    subreddit: 'r/netorare',
    canonicalUrl: 'https://www.reddit.com/r/netorare/',
    publishedAt: '2025-01-05T12:00:00Z',
    relevanceLabel: 'Netorare Discussion',
    permissionStatus: 'approved_outbound',
    tagReferences: ['netorare', 'drama', 'infidelity', 'psychological']
  },
  {
    id: 'comm-ntr-2',
    provider: 'reddit',
    externalId: 'netorare_no_ugly_bastard',
    title: 'Aesthetic Netorare Doujins: Recommendations Strictly Without Ugly Bastard',
    subreddit: 'r/netorare',
    canonicalUrl: 'https://www.reddit.com/r/netorare/',
    publishedAt: '2025-01-10T14:30:00Z',
    relevanceLabel: 'Clean Netorare Guides',
    permissionStatus: 'approved_outbound',
    tagReferences: ['netorare', 'without-ugly-bastard', 'aesthetic']
  },
  {
    id: 'comm-wholesome-1',
    provider: 'reddit',
    externalId: 'wholesome_vanilla_hub',
    title: 'r/wholesomehentai: Pure Vanilla, Slow-Burn Romance & Consensual Fluff',
    subreddit: 'r/wholesomehentai',
    canonicalUrl: 'https://www.reddit.com/r/wholesomehentai/',
    publishedAt: '2025-01-08T09:15:00Z',
    relevanceLabel: 'Pure Romance Hub',
    permissionStatus: 'approved_outbound',
    tagReferences: ['wholesome', 'vanilla', 'romance', 'fluff']
  },
  {
    id: 'comm-doujin-1',
    itemId: 'nym-101',
    provider: 'reddit',
    externalId: 'doujinshi_indie_artists',
    title: 'r/doujinshi: Comiket Circles, Indie Creators & Translation Releases',
    subreddit: 'r/doujinshi',
    canonicalUrl: 'https://www.reddit.com/r/doujinshi/',
    publishedAt: '2025-01-02T18:22:00Z',
    relevanceLabel: 'Indie Doujin Culture',
    permissionStatus: 'approved_outbound',
    tagReferences: ['doujinshi', 'comiket', 'artists', 'indie']
  },
  {
    id: 'comm-kemo-1',
    itemId: 'nh-699075',
    provider: 'reddit',
    externalId: 'kemonomimi_appreciation',
    title: 'r/kemonomimi: Animal-Eared Shrine Maidens, Catgirls & Fluffy Tails',
    subreddit: 'r/kemonomimi',
    canonicalUrl: 'https://www.reddit.com/r/kemonomimi/',
    publishedAt: '2025-01-12T16:40:00Z',
    relevanceLabel: 'Kemonomimi Hub',
    permissionStatus: 'approved_outbound',
    tagReferences: ['kemonomimi', 'catgirl', 'foxgirl', 'maid']
  },
  {
    id: 'comm-cat-1',
    provider: 'reddit',
    externalId: 'catgirls_neko_doujins',
    title: 'r/catgirls: Neko Maidens, Playful Catgirls & Purring Companions',
    subreddit: 'r/catgirls',
    canonicalUrl: 'https://www.reddit.com/r/catgirls/',
    publishedAt: '2025-01-14T11:20:00Z',
    relevanceLabel: 'Catgirl Focus',
    permissionStatus: 'approved_outbound',
    tagReferences: ['catgirl', 'neko', 'maid', 'ears']
  },
  {
    id: 'comm-milf-1',
    itemId: 'nh-699073',
    provider: 'reddit',
    externalId: 'milf_hentai_mature',
    title: 'r/milfhentai: Mature Female Romance, Office Ladies & Hitozuma Releases',
    subreddit: 'r/milfhentai',
    canonicalUrl: 'https://www.reddit.com/r/milfhentai/',
    publishedAt: '2025-01-15T19:00:00Z',
    relevanceLabel: 'Mature Female & Milf',
    permissionStatus: 'approved_outbound',
    tagReferences: ['milf', 'mature', 'office lady', 'romance']
  },
  {
    id: 'comm-gal-1',
    itemId: 'nh-596326',
    provider: 'reddit',
    externalId: 'galhentai_gyaru_doujins',
    title: 'r/galhentai: Gyaru Fashion, Tanned Dark Skin & Playful Flirtation',
    subreddit: 'r/galhentai',
    canonicalUrl: 'https://www.reddit.com/r/galhentai/',
    publishedAt: '2025-01-16T21:10:00Z',
    relevanceLabel: 'Gyaru & Dark Skin',
    permissionStatus: 'approved_outbound',
    tagReferences: ['gyaru', 'dark skin', 'tan', 'stockings']
  },
  {
    id: 'comm-yan-1',
    provider: 'reddit',
    externalId: 'yandere_devotion',
    title: 'r/yande_re: Obsessive Devotion, Romantic Thrillers & Yandere Doujins',
    subreddit: 'r/yande_re',
    canonicalUrl: 'https://www.reddit.com/r/yande_re/',
    publishedAt: '2025-01-18T15:00:00Z',
    relevanceLabel: 'Yandere Hub',
    permissionStatus: 'approved_outbound',
    tagReferences: ['yandere', 'obsessive', 'drama', 'thriller']
  },
  {
    id: 'comm-fem-1',
    provider: 'reddit',
    externalId: 'femdom_doujins',
    title: 'r/femdom: Gentle & Commanding Female Domination Doujinshi Discussions',
    subreddit: 'r/femdom',
    canonicalUrl: 'https://www.reddit.com/r/femdom/',
    publishedAt: '2025-01-20T17:45:00Z',
    relevanceLabel: 'Female Domination',
    permissionStatus: 'approved_outbound',
    tagReferences: ['femdom', 'female domination', 'onee-san']
  }
];
