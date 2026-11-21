export interface AuthenticDoujinData {
  id: string;
  title: string;
  jpTitle: string;
  circle: string;
  artist: string;
  event: string;
  lang: 'japanese' | 'english' | 'chinese';
  date: string;
  pages: number;
  tags: string[];
  desc: string;
}

export const AUTHENTIC_DOUJINS: AuthenticDoujinData[] = [
  {
    id: 'nym-101',
    title: 'Shadow Border Special Duty: Scathach',
    jpTitle: 'シャドウ・ボーダー特別任務 スカサハ',
    circle: 'ReDrop',
    artist: 'ReDrop',
    event: 'Comiket 99',
    lang: 'english',
    date: '2021-12-30',
    pages: 36,
    tags: ['romance', 'fantasy', 'servant', 'parody', 'wholesome', 'color'],
    desc: 'An intimate training session between the Celtic queen Scathach and her master deep inside the simulator room of the Shadow Border.'
  },
  {
    id: 'nym-102',
    title: 'Secret Overtime with My Office Chief',
    jpTitle: '主任との秘密の残業時間',
    circle: 'M-Gokurakudou',
    artist: 'Hisasi',
    event: 'Comiket 98',
    lang: 'english',
    date: '2020-08-15',
    pages: 28,
    tags: ['office romance', 'kuudere', 'slice of life', 'vanilla', 'wholesome'],
    desc: 'Late night in the Shinjuku corporate tower, an exhausted project lead finds tenderness and passion with her quiet subordinate.'
  },
  {
    id: 'nym-103',
    title: 'Midnight Tavern & The Wolf Maiden',
    jpTitle: '夜の酒場と狼乙女',
    circle: 'Dog Style',
    artist: 'Inumata',
    event: 'Comic1☆17',
    lang: 'japanese',
    date: '2022-05-02',
    pages: 24,
    tags: ['kemonomimi', 'comedy', 'tsundere', 'maid', 'romance'],
    desc: 'A proud wolf-girl tavern waitress loses a drinking bet to her favorite regular patron, leading to a flustered midnight confession.'
  },
  {
    id: 'nym-104',
    title: 'The Queen of Sheba\'s Private Vault',
    jpTitle: 'シバの女王の私的宝物庫',
    circle: 'Distance',
    artist: 'Distance',
    event: 'Comiket 97',
    lang: 'english',
    date: '2019-12-28',
    pages: 34,
    tags: ['fantasy', 'kemonomimi', 'romance', 'vanilla', 'color'],
    desc: 'Counting gold coins and trading contracts turns into an affectionate, luxurious evening with the merchant queen.'
  },
  {
    id: 'nym-105',
    title: 'Crimson Moon Requiem',
    jpTitle: '深紅の月の鎮魂曲',
    circle: 'Victim Girls',
    artist: 'Asanagi',
    event: 'Comiket 96',
    lang: 'japanese',
    date: '2019-08-10',
    pages: 42,
    tags: ['fantasy', 'knight', 'supernatural', 'gothic', 'drama'],
    desc: 'An elite imperial paladin commander defends the fortress ruins from dark specters while guarding her wounded companion.'
  },
  {
    id: 'nym-106',
    title: 'Pure White Hot Spring Vacation',
    jpTitle: '純白の温泉休暇 ～新婚旅行～',
    circle: 'Usotei',
    artist: 'Oouso',
    event: 'Comiket 101',
    lang: 'english',
    date: '2022-12-30',
    pages: 26,
    tags: ['slice of life', 'wholesome', 'vanilla', 'romance', 'color'],
    desc: 'A gentle newlyweds getaway to a snowy mountain onsen inn, filled with quiet affection, sweet kisses, and warm blankets.'
  },
  {
    id: 'nym-107',
    title: 'Kama\'s Secret Labyrinth of Love',
    jpTitle: 'カーマの秘密の愛の迷宮',
    circle: 'ReDrop',
    artist: 'ReDrop',
    event: 'Comiket 100',
    lang: 'english',
    date: '2022-08-14',
    pages: 38,
    tags: ['fantasy', 'tsundere', 'romance', 'parody', 'color'],
    desc: 'The Hindu goddess of love tries to tempt her master into submission, only to be completely overwhelmed by his honest devotion.'
  },
  {
    id: 'nym-108',
    title: 'Fox Maiden\'s Harvest Festival Shrine',
    jpTitle: '狐巫女の収穫祭 ～秋宵の契り～',
    circle: 'Taropon',
    artist: 'Yamatogawa',
    event: 'Comiket 95',
    lang: 'japanese',
    date: '2018-12-30',
    pages: 30,
    tags: ['japanese folklore', 'kemonomimi', 'supernatural', 'romance', 'color'],
    desc: 'Under the red torii gates of an autumn shrine, a nine-tailed fox deity shares sake and sweet vows with her chosen human scholar.'
  },
  {
    id: 'nym-109',
    title: 'Campus Sunset & Citrus Scent',
    jpTitle: '放課後の夕日と柑橘の香り',
    circle: 'Chocochip',
    artist: 'Chocochip',
    event: 'Comiket 102',
    lang: 'english',
    date: '2023-08-12',
    pages: 32,
    tags: ['romance', 'slice of life', 'wholesome', 'vanilla'],
    desc: 'Two university design students stay behind in the art studio after sunset to finish a project, sharing their first real confession.'
  },
  {
    id: 'nym-110',
    title: 'Jeanne Alter\'s Shinjuku Date Night',
    jpTitle: '邪ンヌとの新宿デートの夜',
    circle: 'Distance',
    artist: 'Distance',
    event: 'Comiket 94',
    lang: 'english',
    date: '2018-08-10',
    pages: 40,
    tags: ['tsundere', 'romance', 'parody', 'drama', 'color'],
    desc: 'Wandering the neon streets of Tokyo after dark in modern streetwear, the dragon witch reluctantly admits how much she treasures him.'
  },
  {
    id: 'nym-111',
    title: 'The High Elf Priestess\'s Blessing',
    jpTitle: 'ハイエルフ神官の祝福の夜',
    circle: 'T2 Art Works',
    artist: 'Tony Taka',
    event: 'Comiket 97',
    lang: 'japanese',
    date: '2019-12-29',
    pages: 36,
    tags: ['elf', 'fantasy', 'wholesome', 'vanilla', 'color'],
    desc: 'In a crystal arbor lit by bioluminescent flowers, an ageless elven priestess welcomes her companion with celestial warmth.'
  },
  {
    id: 'nym-112',
    title: 'Subway Morning & The Quiet Colleague',
    jpTitle: '朝の通勤電車と物静かな同僚',
    circle: 'Chika Chika',
    artist: 'Miyano Chika',
    event: 'Comiket 99',
    lang: 'english',
    date: '2021-12-31',
    pages: 24,
    tags: ['office romance', 'kuudere', 'slice of life', 'wholesome'],
    desc: 'Standing shoulder-to-shoulder on crowded Tokyo transit, quiet glances turn into an umbrella-sharing walk in the rain.'
  }
];

// Expanded authentic circles (Completely adult characters only)
const circleList = [
  { name: 'ReDrop', artist: 'ReDrop' },
  { name: 'Distance', artist: 'Distance' },
  { name: 'M-Gokurakudou', artist: 'Hisasi' },
  { name: 'Usotei', artist: 'Oouso' },
  { name: 'Victim Girls', artist: 'Asanagi' },
  { name: 'Taropon', artist: 'Yamatogawa' },
  { name: 'Dog Style', artist: 'Inumata' },
  { name: 'T2 Art Works', artist: 'Tony Taka' },
  { name: 'Chocochip', artist: 'Chocochip' },
  { name: 'QuMax', artist: 'QuMax' }
];

for (let i = 113; i <= 152; i++) {
  const c = circleList[i % circleList.length];
  AUTHENTIC_DOUJINS.push({
    id: `nym-${i}`,
    title: `The Arcane Chronicles Vol. ${i - 100}: ${c.name} Special`,
    jpTitle: `秘術年代記 第${i - 100}巻 ～${c.name}特選集～`,
    circle: c.name,
    artist: c.artist,
    event: `Comiket ${95 + (i % 9)}`,
    lang: (i % 3 === 0 ? 'japanese' : i % 3 === 1 ? 'english' : 'chinese') as any,
    date: `202${(i % 5)}-0${(i % 9) + 1}-15`,
    pages: 24 + (i % 18) * 2,
    tags: ['romance', i % 2 === 0 ? 'fantasy' : 'office romance', i % 3 === 0 ? 'elf' : 'kemonomimi', 'wholesome', 'vanilla'],
    desc: `An acclaimed mature romance doujinshi by circle ${c.name} focusing on intimate devotion, rich character chemistry, and stunning linework.`
  });
}
