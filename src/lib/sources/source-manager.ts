import type { UnifiedMangaSource } from './types.ts';
import { LocalMangaSource } from './local-source.ts';
import { MangaDexSource } from './mangadex-source.ts';
import type { StructuredSearchQuery, SearchResponse, CatalogueItem } from '../../types/index.ts';

export class SourceManager {
  private sources: Map<string, UnifiedMangaSource> = new Map();
  private activeSourceId: string = 'nyamora-local';

  constructor() {
    this.registerSource(new LocalMangaSource());
    this.registerSource(new MangaDexSource());
  }

  public registerSource(source: UnifiedMangaSource): void {
    this.sources.set(source.id, source);
  }

  public getSource(id: string): UnifiedMangaSource | undefined {
    return this.sources.get(id);
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
      isActive: s.id === this.activeSourceId
    }));
  }

  public getActiveSource(): UnifiedMangaSource {
    const src = this.sources.get(this.activeSourceId);
    if (!src) {
      return this.sources.get('nyamora-local')!;
    }
    return src;
  }

  public setActiveSource(id: string): boolean {
    if (this.sources.has(id)) {
      this.activeSourceId = id;
      return true;
    }
    return false;
  }

  public async search(query: StructuredSearchQuery, specificSourceId?: string): Promise<SearchResponse> {
    const source = specificSourceId ? this.getSource(specificSourceId) : this.getActiveSource();
    if (!source) {
      return this.getActiveSource().search(query);
    }

    const results = await source.search(query);
    // If external source failed or returned 0 results, fall back to local archive smoothly
    if (results.items.length === 0 && source.isExternal) {
      const local = this.sources.get('nyamora-local')!;
      return local.search(query);
    }
    return results;
  }

  public async getById(id: string): Promise<CatalogueItem | null> {
    // Check if ID specifies source prefix (e.g. md-xxx)
    if (id.startsWith('md-')) {
      const mdSource = this.sources.get('mangadex-api');
      if (mdSource) {
        const item = await mdSource.getById(id);
        if (item) return item;
      }
    }

    // Default to active source or local
    const item = await this.getActiveSource().getById(id);
    if (item) return item;

    const local = this.sources.get('nyamora-local')!;
    return local.getById(id);
  }

  public async getRandom(): Promise<CatalogueItem | null> {
    const item = await this.getActiveSource().getRandom();
    if (item) return item;

    const local = this.sources.get('nyamora-local')!;
    return local.getRandom();
  }
}

// Global Singleton
const globalForSources = globalThis as unknown as { sourceManager?: SourceManager };
export const sourceManager = globalForSources.sourceManager ?? new SourceManager();
if (process.env.NODE_ENV !== 'production') globalForSources.sourceManager = sourceManager;
