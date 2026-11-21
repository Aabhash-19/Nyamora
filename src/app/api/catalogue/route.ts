import { NextRequest, NextResponse } from 'next/server';
import { hybridSearchService } from '@/search/hybrid-search';
import { StructuredSearchQuery } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query_text = searchParams.get('q') || '';
    const sort = (searchParams.get('sort') || 'relevance') as StructuredSearchQuery['sort'];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const language = searchParams.get('language') || undefined;
    const availability_mode = (searchParams.get('availability') || undefined) as any;

    const includeTagsParam = searchParams.get('include_tags');
    const excludeTagsParam = searchParams.get('exclude_tags');

    const include_tags = includeTagsParam ? includeTagsParam.split(',').filter(Boolean) : [];
    const exclude_tags = excludeTagsParam ? excludeTagsParam.split(',').filter(Boolean) : [];

    const structuredQuery: StructuredSearchQuery = {
      query_text,
      concepts: [],
      include_tags,
      exclude_tags,
      creator_terms: [],
      title_terms: [],
      language: language || null,
      sort,
      availability_mode,
      page,
      pageSize
    };

    const response = hybridSearchService.search(structuredQuery);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Catalogue API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve catalogue entries' }, { status: 500 });
  }
}
