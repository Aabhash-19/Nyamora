// Canonical domain types for Nyamora (AI-Powered Doujin Discovery Platform)

export type VisibilityStatus = 'published' | 'quarantined' | 'draft' | 'taken_down';
export type MetadataStatus = 'verified' | 'unreviewed' | 'disputed';
export type EligibilityStatus = 'eligible' | 'prohibited' | 'needs_review';
export type AvailabilityMode = 'metadata_only' | 'external_authorized' | 'integrated_licensed';
export type RightsBasis = 'operator_owned' | 'licensed_partner' | 'public_domain' | 'pending_review';

export interface Creator {
  id: string;
  displayName: string;
  canonicalIdentifier?: string;
  sourceAttribution: string;
  bio?: string;
  workCount?: number;
}

export interface Tag {
  id: string;
  normalizedName: string;
  category: 'genre' | 'character' | 'parody' | 'theme' | 'attribute' | 'language';
  language: string;
  eligibilityStatus: EligibilityStatus;
  description?: string;
  count?: number;
}

export interface CatalogueItem {
  id: string;
  canonicalTitle: string;
  alternateTitles: string[];
  creatorId: string;
  creatorName: string;
  language: 'japanese' | 'english' | 'chinese' | 'korean' | 'other';
  publicationDate: string; // ISO format or YYYY-MM
  description: string;
  pageCount: number;
  coverImage: string; // Path or rights-cleared asset
  visibilityStatus: VisibilityStatus;
  metadataStatus: MetadataStatus;
  eligibilityStatus: EligibilityStatus;
  availabilityMode: AvailabilityMode;
  tags: Tag[];
  saveCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SourceProvenance {
  itemId: string;
  provider: string;
  sourceUrl: string;
  externalId: string;
  fetchedAt: string;
  permittedFields: string[];
  rightsBasis: RightsBasis;
  termsReviewedAt: string;
}

export interface AssetRights {
  assetId: string;
  itemId: string;
  owner: string;
  license: string;
  permissionReference: string;
  allowedUse: 'display_thumbnail' | 'reader_licensed' | 'editorial_only';
  territories: string[];
  expiryDate?: string;
  reviewStatus: 'approved' | 'pending' | 'revoked';
}

export interface ReaderAsset {
  id: string;
  itemId: string;
  pageIndex: number;
  storageKey: string;
  mimeType: string;
  checksum: string;
  accessStatus: 'licensed' | 'restricted' | 'expired';
  imageUrl?: string;
}

export interface ReaderSource {
  id: string;
  itemId: string;
  canonicalUrl: string;
  provider: string;
  permissionStatus: 'authorized' | 'unverified';
  linkStatus: 'active' | 'broken';
}

export interface CommunityReference {
  id: string;
  itemId?: string;
  provider: 'reddit';
  externalId: string;
  title: string;
  subreddit: string;
  canonicalUrl: string;
  publishedAt: string;
  relevanceLabel: string;
  permissionStatus: 'approved_outbound';
  tagReferences: string[];
}

export interface StructuredSearchQuery {
  query_text: string;
  concepts: string[];
  include_tags: string[];
  exclude_tags: string[];
  creator_terms: string[];
  title_terms: string[];
  language?: string | null;
  sort: 'relevance' | 'newest' | 'publication_date' | 'title_asc' | 'title_desc' | 'popular';
  availability_mode?: AvailabilityMode | null;
  page: number;
  pageSize: number;
}

export interface SearchResultItem extends CatalogueItem {
  lexicalScore?: number;
  vectorScore?: number;
  finalScore: number;
  matchReasons: string[];
  isExactMatch?: boolean;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: StructuredSearchQuery;
  activeFilterCount: number;
}

export interface UserBookmark {
  itemId: string;
  createdAt: string;
  listName?: string;
  notes?: string;
}

export interface ReadingProgress {
  itemId: string;
  pageIndex: number;
  totalPages: number;
  updatedAt: string;
  completed: boolean;
}

export interface NyanChanMessage {
  id: string;
  sender: 'nyan_chan' | 'user';
  text: string;
  timestamp: string;
  structuredQuery?: Partial<StructuredSearchQuery>;
  recommendedItems?: SearchResultItem[];
  clarificationQuestion?: string;
  suggestedTags?: string[];
  expression?: 'normal' | 'happy' | 'thinking' | 'wink' | 'ahegao' | 'smug';
}
