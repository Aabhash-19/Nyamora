import type { UnifiedMangaSource } from './types.ts';
import { NHentaiSource } from './nhentai-source.ts';
import type { StructuredSearchQuery, SearchResponse, CatalogueItem, ReaderAsset } from '../../types/index.ts';

export class SourceManager {
  private sources: Map<string, UnifiedMangaSource> = new Map();
  private activeSourceId: string = 'nhentai-api';

  constructor() {
    this.registerSource(new NHentaiSource());
  }

  public registerSource(source: UnifiedMangaSource): void {
    this.sources.set(source.id, source);
  }

  public getSource(id: string): UnifiedMangaSource | undefined {
    return this.sources.get(id) || this.sources.get('nhentai-api');
  }

  public getAllSources(): Array<{
    id: string;
    name: string;
    description: string;
    isExternal: boolean;
    capabilities: UnifiedMangaSource['capabilities'];
    isActive: boolean;
  }> {
    return Array.from(this.sources.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      isExternal: s.isExternal,
      capabilities: s.capabilities,
      isActive: true
    }));
  }

  public getActiveSource(): UnifiedMangaSource {
    return this.sources.get('nhentai-api') || this.sources.values().next().value!;
  }

  public setActiveSource(id: string): boolean {
    if (this.sources.has(id)) {
      this.activeSourceId = id;
      return true;
    }
    return false;
  }

  public async search(query: StructuredSearchQuery, _specificSourceId?: string): Promise<SearchResponse> {
    return this.getActiveSource().search(query);
  }

  public async getById(id: string): Promise<CatalogueItem | null> {
    return this.getActiveSource().getById(id);
  }

  public async getPages(id: string): Promise<ReaderAsset[]> {
    const nhSource = this.getActiveSource() as NHentaiSource;
    if (nhSource && typeof nhSource.getPages === 'function') {
      return nhSource.getPages(id);
    }
    return [];
  }

  public async getRandom(): Promise<CatalogueItem | null> {
    return this.getActiveSource().getRandom();
  }
}

// Global Singleton
const globalForSources = globalThis as unknown as { sourceManager?: SourceManager };
export const sourceManager = globalForSources.sourceManager ?? new SourceManager();
if (process.env.NODE_ENV !== 'production') globalForSources.sourceManager = sourceManager;
