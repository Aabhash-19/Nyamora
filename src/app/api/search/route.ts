import { NextRequest, NextResponse } from 'next/server';
import { hybridSearchService } from '@/search/hybrid-search';
import { StructuredSearchQuery } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.query_text || body.query || '';

    // Parse natural language or accept structured query
    const structuredQuery: StructuredSearchQuery = hybridSearchService.parseNaturalQuery(rawText, {
      include_tags: body.include_tags || [],
      exclude_tags: body.exclude_tags || [],
      creator_terms: body.creator_terms || [],
      title_terms: body.title_terms || [],
      language: body.language || null,
      sort: body.sort || 'relevance',
      availability_mode: body.availability_mode || null,
      page: body.page || 1,
      pageSize: body.pageSize || 12
    });

    const results = hybridSearchService.search(structuredQuery);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
