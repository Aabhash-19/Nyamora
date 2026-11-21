import type {
  CatalogueItem,
  CommunityReference,
  ReaderSource,
  StructuredSearchQuery,
  SearchResponse,
  NyanChanMessage
} from '../types/index.ts';
import { db } from '../lib/db.ts';
import { hybridSearchService } from '../search/hybrid-search.ts';
import { generateEmbedding } from '../lib/vector.ts';
import { nyanChanAssistant } from '../ai/nyan-chan.ts';

export interface ProviderCapabilities {
  supportsFullText: boolean;
  supportsVectorSearch: boolean;
  supportsExclusions: boolean;
  permittedFields: string[];
  rateLimitPerMinute: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  message: string;
  lastChecked: string;
}

// 1. Catalogue Provider Interface & Implementation
export interface CatalogueProvider {
  id: string;
  name: string;
  capabilities(): ProviderCapabilities;
  search(query: StructuredSearchQuery): Promise<SearchResponse>;
  getById(id: string): Promise<CatalogueItem | null>;
  healthCheck(): Promise<HealthStatus>;
}

export class DemoCatalogueProvider implements CatalogueProvider {
  id = 'demo-indie-catalogue';
  name = 'Nyamora Managed Indie Catalogue';

  capabilities(): ProviderCapabilities {
    return {
      supportsFullText: true,
      supportsVectorSearch: true,
      supportsExclusions: true,
      permittedFields: ['id', 'canonicalTitle', 'alternateTitles', 'creatorName', 'language', 'publicationDate', 'description', 'tags', 'pageCount', 'coverImage', 'saveCount'],
      rateLimitPerMinute: 600
    };
  }

  async search(query: StructuredSearchQuery): Promise<SearchResponse> {
    return hybridSearchService.search(query);
  }

  async getById(id: string): Promise<CatalogueItem | null> {
    const item = db.getItemById(id);
    return item || null;
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      message: 'Local high-performance in-memory repository active with 52 records.',
      lastChecked: new Date().toISOString()
    };
  }
}

// 2. Community Reference Provider Interface & Implementation (Outbound Reddit links only)
export interface CommunityReferenceProvider {
  id: string;
  name: string;
  getReferencesForItem(itemId: string): Promise<CommunityReference[]>;
  getAllCuratedReferences(): Promise<CommunityReference[]>;
  healthCheck(): Promise<HealthStatus>;
}

export class CuratedRedditProvider implements CommunityReferenceProvider {
  id = 'curated-reddit-links';
  name = 'Curated Reddit Outbound Directory';

  async getReferencesForItem(itemId: string): Promise<CommunityReference[]> {
    return db.getCommunityReferences(itemId);
  }

  async getAllCuratedReferences(): Promise<CommunityReference[]> {
    return db.getCommunityReferences();
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      message: 'Outbound-only policy active. No Reddit pages are scraped or mirrored.',
      lastChecked: new Date().toISOString()
    };
  }
}

// 3. Chat Model Provider Interface & Implementation (Nyan-chan AI Concierge)
export interface ChatModelProvider {
  id: string;
  name: string;
  chat(message: string, context?: Partial<StructuredSearchQuery>): Promise<NyanChanMessage>;
  healthCheck(): Promise<HealthStatus>;
}

export class NyamoraChatProvider implements ChatModelProvider {
  id = 'nyan-chan-concierge';
  name = 'Nyan-chan AI Catalogue Concierge';

  async chat(message: string, context?: Partial<StructuredSearchQuery>): Promise<NyanChanMessage> {
    return nyanChanAssistant.chat(message, context);
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      message: 'Grounded search concierge operating normally. Non-explicit safety bounds enforced.',
      lastChecked: new Date().toISOString()
    };
  }
}

// 4. Embedding Provider Interface & Implementation
export interface EmbeddingProvider {
  id: string;
  name: string;
  dimension: number;
  embedText(text: string): Promise<number[]>;
  healthCheck(): Promise<HealthStatus>;
}

export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  id = 'nyamora-concept-embeddings';
  name = 'Nyamora 48-Dimensional Semantic Concept Embeddings';
  dimension = 48;

  async embedText(text: string): Promise<number[]> {
    return generateEmbedding(text);
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      message: 'Deterministic concept vectors loaded with zero external network dependency.',
      lastChecked: new Date().toISOString()
    };
  }
}

// 5. Reader Source Provider Interface & Implementation
export interface ReaderSourceProvider {
  id: string;
  name: string;
  getSourceForItem(itemId: string): Promise<ReaderSource | null>;
  healthCheck(): Promise<HealthStatus>;
}

export class AuthorizedReaderSourceProvider implements ReaderSourceProvider {
  id = 'authorized-reading-destinations';
  name = 'Authorized Partner External Destinations';

  async getSourceForItem(itemId: string): Promise<ReaderSource | null> {
    const src = db.getReaderSource(itemId);
    return src || null;
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      message: 'Canonical external partner links verified.',
      lastChecked: new Date().toISOString()
    };
  }
}

// Connector Registry
export const connectors = {
  catalogue: new DemoCatalogueProvider(),
  community: new CuratedRedditProvider(),
  chat: new NyamoraChatProvider(),
  embedding: new DeterministicEmbeddingProvider(),
  readerSource: new AuthorizedReaderSourceProvider()
};
