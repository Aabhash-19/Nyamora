// Unified Multi-Source Architecture (Enma-style provider interface)

import { CatalogueItem, StructuredSearchQuery, SearchResponse, ReaderAsset } from '@/types';

export interface SourceCapabilities {
  supportsSearch: boolean;
  supportsRandom: boolean;
  supportsAuthorBrowse: boolean;
  supportsTagBrowse: boolean;
  supportsPagination: boolean;
  supportsContentFilter: boolean;
  supportsReader?: boolean;
}

export interface UnifiedMangaSource {
  id: string;
  name: string;
  description: string;
  isExternal: boolean;
  capabilities: SourceCapabilities;

  search(query: StructuredSearchQuery): Promise<SearchResponse>;
  getById(id: string): Promise<CatalogueItem | null>;
  getRandom(): Promise<CatalogueItem | null>;
  healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; message: string }>;
  getPages?(id: string): Promise<ReaderAsset[]>;
}
