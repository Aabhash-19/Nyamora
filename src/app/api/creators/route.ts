import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Creator } from '@/types';

const NHENTAI_TOP_CREATORS: Creator[] = [
  { id: 'c-ankoman', displayName: 'Ankoman', canonicalIdentifier: 'ankoman', sourceAttribution: 'Circle Ankoman', workCount: 1101, bio: 'Prolific doujin artist renowned for expressive facial art and popular game franchises.' },
  { id: 'c-crimson', displayName: 'Crimson', canonicalIdentifier: 'crimson', sourceAttribution: 'Circle Crimson', workCount: 1020, bio: 'Legendary doujinshi circle celebrated for high-energy narratives and distinctive styles.' },
  { id: 'c-saigado', displayName: 'Saigado', canonicalIdentifier: 'saigado', sourceAttribution: 'Circle Saigado', workCount: 781, bio: 'Master illustrator specializing in classic fighting game parodies and fantasy adventures.' },
  { id: 'c-osuwani', displayName: 'Osuwaani', canonicalIdentifier: 'osuwaani', sourceAttribution: 'Circle Osuwaani', workCount: 694, bio: 'Acclaimed circle known for cheerful character designs and popular manga parodies.' },
  { id: 'c-itaba-hiroshi', displayName: 'Itaba Hiroshi', canonicalIdentifier: 'itaba-hiroshi', sourceAttribution: 'Circle Itaba', workCount: 679, bio: 'Renowned for intense emotional expressions and long-running story arcs.' },
  { id: 'c-redrop', displayName: 'ReDrop', canonicalIdentifier: 'redrop', sourceAttribution: 'Circle ReDrop', workCount: 245, bio: 'Celebrated circle known for premier Fate/Grand Order doujins and character artwork.' },
  { id: 'c-hisasi', displayName: 'Hisasi', canonicalIdentifier: 'hisasi', sourceAttribution: 'Circle M-Gokurakudou', workCount: 310, bio: 'Master of modern mature office romance and expressive facial linework.' },
  { id: 'c-distance', displayName: 'Distance', canonicalIdentifier: 'distance', sourceAttribution: 'Circle Distance', workCount: 198, bio: 'Acclaimed circle specializing in Fate and Granblue Fantasy doujins.' },
  { id: 'c-asakura', displayName: 'Asakura', canonicalIdentifier: 'asakura', sourceAttribution: 'Circle Asakura', workCount: 420, bio: 'Popular circle creating tender romances and humorous doujin stories.' }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const creator = NHENTAI_TOP_CREATORS.find(c => c.id === id || c.canonicalIdentifier === id) || db.getCreatorById(id);
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    return NextResponse.json({ creator });
  }

  return NextResponse.json({ creators: NHENTAI_TOP_CREATORS });
}
