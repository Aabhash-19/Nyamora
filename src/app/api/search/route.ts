import { NextRequest, NextResponse } from 'next/server';
import { hybridSearchService } from '@/search/hybrid-search';
import { sourceManager } from '@/lib/sources/source-manager';
import { db } from '@/lib/db';
import { StructuredSearchQuery } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.query_text || body.query || '';

    // If caller provided pre-structured filters, retain them strictly
    const hasPreStructured = (body.include_tags?.length || 0) > 0 || (body.exclude_tags?.length || 0) > 0;

    let structuredQuery: StructuredSearchQuery;
    if (hasPreStructured && !rawText) {
      structuredQuery = {
        query_text: rawText,
        concepts: body.concepts || [],
        include_tags: body.include_tags || [],
        exclude_tags: body.exclude_tags || [],
        creator_terms: body.creator_terms || [],
        title_terms: body.title_terms || [],
        language: body.language || null,
        sort: body.sort || 'relevance',
        availability_mode: body.availability_mode || null,
        page: body.page || 1,
        pageSize: body.pageSize || 12
      };
    } else {
      structuredQuery = hybridSearchService.parseNaturalQuery(rawText, {
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
    }

    let results = await sourceManager.search(structuredQuery);
    if (!results || results.items.length === 0) {
      results = hybridSearchService.search(structuredQuery);
    }

    if (results && results.items && results.items.length > 0) {
      db.upsertItems(results.items);
    }

    return NextResponse.json(results || {
      items: [],
      total: 0,
      page: structuredQuery.page,
      pageSize: structuredQuery.pageSize,
      totalPages: 1,
      query: structuredQuery,
      activeFilterCount: 0
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
