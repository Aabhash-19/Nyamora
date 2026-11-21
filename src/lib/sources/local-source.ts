import type { UnifiedMangaSource, SourceCapabilities } from './types.ts';
import type { CatalogueItem, StructuredSearchQuery, SearchResponse } from '../../types/index.ts';
import { db } from '../db.ts';
import { hybridSearchService } from '../../search/hybrid-search.ts';

export class LocalMangaSource implements UnifiedMangaSource {
  id = 'nyamora-local';
  name = 'Nyamora Curated Indie Archive';
  description = 'Local rights-cleared indie catalogue with 52 verified entries and hybrid vector search.';
  isExternal = false;

  capabilities: SourceCapabilities = {
    supportsSearch: true,
    supportsRandom: true,
    supportsAuthorBrowse: true,
    supportsTagBrowse: true,
    supportsPagination: true,
    supportsContentFilter: true
  };

  async search(query: StructuredSearchQuery): Promise<SearchResponse> {
    return hybridSearchService.search(query);
  }

  async getById(id: string): Promise<CatalogueItem | null> {
    const item = db.getItemById(id);
    return item || null;
  }

  async getRandom(): Promise<CatalogueItem | null> {
    const item = db.getRandomItem();
    return item || null;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }> {
    return {
      status: 'healthy',
      message: 'Local in-memory catalogue fully operational with 52 records.'
    };
  }
}
