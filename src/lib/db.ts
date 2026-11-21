import type {
  CatalogueItem,
  Creator,
  Tag,
  SourceProvenance,
  AssetRights,
  ReaderSource,
  ReaderAsset,
  CommunityReference,
  UserBookmark,
  ReadingProgress,
  VisibilityStatus,
  EligibilityStatus
} from '../types/index.ts';
import {
  SEED_CREATORS,
  SEED_TAGS,
  SEED_ITEMS,
  SEED_PROVENANCE,
  SEED_ASSET_RIGHTS,
  SEED_READER_SOURCES,
  SEED_READER_ASSETS,
  SEED_COMMUNITY_REFERENCES
} from '../catalogue/seed-data.ts';
import { generateEmbedding, cosineSimilarity } from './vector.ts';

export interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  details: string;
}

// In-memory relational state initialized with seed data
class NyamoraDatabase {
  private items: CatalogueItem[];
  private creators: Creator[];
  private tags: Tag[];
  private provenance: SourceProvenance[];
  private assetRights: AssetRights[];
  private readerSources: ReaderSource[];
  private readerAssets: ReaderAsset[];
  private communityReferences: CommunityReference[];
  private bookmarks: Map<string, UserBookmark>; // Key: itemId
  private readingProgress: Map<string, ReadingProgress>; // Key: itemId
  private auditEvents: AuditEvent[];
  private itemEmbeddings: Map<string, number[]>;

  constructor() {
    this.items = [...SEED_ITEMS];
    this.creators = [...SEED_CREATORS];
    this.tags = [...SEED_TAGS];
    this.provenance = [...SEED_PROVENANCE];
    this.assetRights = [...SEED_ASSET_RIGHTS];
    this.readerSources = [...SEED_READER_SOURCES];
    this.readerAssets = [...SEED_READER_ASSETS];
    this.communityReferences = [...SEED_COMMUNITY_REFERENCES];
    this.bookmarks = new Map();
    this.readingProgress = new Map();
    this.auditEvents = [
      {
        id: 'aud-001',
        actorId: 'system-init',
        action: 'CATALOGUE_SEEDED',
        targetType: 'catalogue',
        targetId: 'all',
        timestamp: new Date().toISOString(),
        details: 'Initial catalogue seeded with 52 rights-cleared demo records.'
      }
    ];
    this.itemEmbeddings = new Map();

    // Precompute embeddings for all catalogue items
    for (const item of this.items) {
      const text = `${item.canonicalTitle} ${item.alternateTitles.join(' ')} ${item.creatorName} ${item.tags.map(t => t.normalizedName).join(' ')} ${item.description}`;
      this.itemEmbeddings.set(item.id, generateEmbedding(text));
    }
  }

  // --- Catalogue Items ---
  public getItems(filters?: {
    visibilityStatus?: VisibilityStatus;
    eligibilityStatus?: EligibilityStatus;
    language?: string;
    creatorId?: string;
    tagIds?: string[];
  }): CatalogueItem[] {
    let result = [...this.items];

    // Filter by visibility (default: only published)
    const vis = filters?.visibilityStatus || 'published';
    result = result.filter(i => i.visibilityStatus === vis);

    // Filter by eligibility (default: only eligible)
    const elig = filters?.eligibilityStatus || 'eligible';
    result = result.filter(i => i.eligibilityStatus === elig);

    if (filters?.language) {
      result = result.filter(i => i.language.toLowerCase() === filters.language!.toLowerCase());
    }

    if (filters?.creatorId) {
      result = result.filter(i => i.creatorId === filters.creatorId);
    }

    if (filters?.tagIds && filters.tagIds.length > 0) {
      result = result.filter(item => {
        const itemTagIds = new Set(item.tags.map(t => t.id));
        return filters.tagIds!.every(tid => itemTagIds.has(tid));
      });
    }

    return result;
  }

  public getItemById(id: string): CatalogueItem | undefined {
    return this.items.find(i => i.id === id);
  }

  public upsertItem(item: CatalogueItem): void {
    const existingIdx = this.items.findIndex(i => i.id === item.id);
    if (existingIdx >= 0) {
      this.items[existingIdx] = item;
    } else {
      this.items.push(item);
    }
    const text = `${item.canonicalTitle} ${item.alternateTitles.join(' ')} ${item.creatorName} ${item.tags.map(t => t.normalizedName).join(' ')} ${item.description}`;
    this.itemEmbeddings.set(item.id, generateEmbedding(text));
  }

  public upsertItems(items: CatalogueItem[]): void {
    for (const item of items) {
      this.upsertItem(item);
    }
  }

  public getRandomItem(): CatalogueItem | undefined {
    const published = this.getItems({ visibilityStatus: 'published', eligibilityStatus: 'eligible' });
    if (published.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * published.length);
    return published[randomIndex];
  }

  public getItemEmbedding(itemId: string): number[] | undefined {
    return this.itemEmbeddings.get(itemId);
  }

  public getRelatedItems(itemId: string, limit = 4): CatalogueItem[] {
    const target = this.getItemById(itemId);
    if (!target) return [];

    const targetVector = this.itemEmbeddings.get(itemId);
    const targetTagIds = new Set(target.tags.map(t => t.id));

    const candidates = this.getItems({ visibilityStatus: 'published', eligibilityStatus: 'eligible' })
      .filter(i => i.id !== itemId);

    const scored = candidates.map(cand => {
      let score = 0;
      // Tag overlap score
      const sharedTags = cand.tags.filter(t => targetTagIds.has(t.id)).length;
      score += sharedTags * 2;

      // Same creator boost
      if (cand.creatorId === target.creatorId) score += 3;

      // Vector semantic similarity
      if (targetVector) {
        const candVector = this.itemEmbeddings.get(cand.id);
        if (candVector) {
          score += cosineSimilarity(targetVector, candVector) * 4;
        }
      }

      return { item: cand, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.item);
  }

  // --- Creators & Tags ---
  public getCreators(): Creator[] {
    return [...this.creators];
  }

  public getCreatorById(id: string): Creator | undefined {
    return this.creators.find(c => c.id === id);
  }

  public getTags(): Tag[] {
    return [...this.tags];
  }

  public getTagById(id: string): Tag | undefined {
    return this.tags.find(t => t.id === id);
  }

  public getTagByName(name: string): Tag | undefined {
    const norm = name.toLowerCase().trim();
    return this.tags.find(t => t.normalizedName.toLowerCase() === norm);
  }

  // --- Provenance & Rights ---
  public getProvenance(itemId: string): SourceProvenance | undefined {
    return this.provenance.find(p => p.itemId === itemId);
  }

  public getAssetRights(itemId: string): AssetRights | undefined {
    return this.assetRights.find(a => a.itemId === itemId);
  }

  public getAllAssetRights(): AssetRights[] {
    return [...this.assetRights];
  }

  public updateAssetRights(assetId: string, status: 'approved' | 'pending' | 'revoked', actorId = 'admin'): boolean {
    const asset = this.assetRights.find(a => a.assetId === assetId);
    if (!asset) return false;
    asset.reviewStatus = status;
    this.recordAuditEvent(actorId, 'UPDATE_ASSET_RIGHTS', 'asset_rights', assetId, `Review status updated to ${status}`);
    return true;
  }

  public updateItemStatus(itemId: string, visibility: VisibilityStatus, actorId = 'admin', reason = ''): boolean {
    const item = this.getItemById(itemId);
    if (!item) return false;
    item.visibilityStatus = visibility;
    item.updatedAt = new Date().toISOString();
    this.recordAuditEvent(actorId, 'UPDATE_ITEM_STATUS', 'catalogue_items', itemId, `Visibility changed to ${visibility}. Reason: ${reason}`);
    return true;
  }

  // --- Reader Assets & Sources ---
  public getReaderSource(itemId: string): ReaderSource | undefined {
    return this.readerSources.find(r => r.itemId === itemId);
  }

  public getReaderAssets(itemId: string): ReaderAsset[] {
    return this.readerAssets.filter(r => r.itemId === itemId).sort((a, b) => a.pageIndex - b.pageIndex);
  }

  // --- Community References (Outbound Only) ---
  public getCommunityReferences(itemId?: string): CommunityReference[] {
    if (!this.communityReferences || this.communityReferences.length <= 1) {
      this.communityReferences = [...SEED_COMMUNITY_REFERENCES];
    }
    if (itemId) {
      return this.communityReferences.filter(c => c.itemId === itemId);
    }
    return [...this.communityReferences];
  }

  // --- User Library (Bookmarks & Progress) ---
  public getBookmarks(): UserBookmark[] {
    return Array.from(this.bookmarks.values());
  }

  public isBookmarked(itemId: string): boolean {
    return this.bookmarks.has(itemId);
  }

  public toggleBookmark(itemId: string, listName = 'Favorites'): boolean {
    if (this.bookmarks.has(itemId)) {
      this.bookmarks.delete(itemId);
      return false; // Removed
    } else {
      this.bookmarks.set(itemId, {
        itemId,
        createdAt: new Date().toISOString(),
        listName
      });
      // Increment save count on item
      const item = this.getItemById(itemId);
      if (item) item.saveCount += 1;
      return true; // Added
    }
  }

  public getReadingProgress(itemId: string): ReadingProgress | undefined {
    return this.readingProgress.get(itemId);
  }

  public saveReadingProgress(itemId: string, pageIndex: number, totalPages: number): ReadingProgress {
    const progress: ReadingProgress = {
      itemId,
      pageIndex,
      totalPages,
      updatedAt: new Date().toISOString(),
      completed: pageIndex >= totalPages
    };
    this.readingProgress.set(itemId, progress);
    return progress;
  }

  public clearUserData(): void {
    this.bookmarks.clear();
    this.readingProgress.clear();
    this.recordAuditEvent('user', 'USER_DATA_CLEARED', 'user_library', 'all', 'User purged bookmarks and reading history.');
  }

  // --- Audit Events ---
  public getAuditEvents(): AuditEvent[] {
    return [...this.auditEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordAuditEvent(actorId: string, action: string, targetType: string, targetId: string, details: string): void {
    this.auditEvents.push({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
      details
    });
  }
}

// Global Singleton to retain state across API route handler calls in Next.js development server
const globalForDb = globalThis as unknown as { nyamoraDb?: NyamoraDatabase };
export const db = globalForDb.nyamoraDb ?? new NyamoraDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.nyamoraDb = db;
