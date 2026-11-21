import type { StructuredSearchQuery, SearchResponse, SearchResultItem, CatalogueItem } from '../types/index.ts';
import { db } from '../lib/db.ts';
import { generateEmbedding, cosineSimilarity } from '../lib/vector.ts';

export class HybridSearchService {
  /**
   * Normalizes and parses raw natural-language search query into structured search object
   */
  public parseNaturalQuery(rawText: string, existingQuery?: Partial<StructuredSearchQuery>): StructuredSearchQuery {
    const text = (rawText || '').trim();
    const query: StructuredSearchQuery = {
      query_text: text,
      concepts: [],
      include_tags: [...(existingQuery?.include_tags || [])],
      exclude_tags: [...(existingQuery?.exclude_tags || [])],
      creator_terms: [...(existingQuery?.creator_terms || [])],
      title_terms: [...(existingQuery?.title_terms || [])],
      language: existingQuery?.language || null,
      sort: existingQuery?.sort || 'relevance',
      availability_mode: existingQuery?.availability_mode || null,
      page: existingQuery?.page || 1,
      pageSize: existingQuery?.pageSize || 12
    };

    if (!text) return query;

    // Detect negation patterns: "not X", "without X", "avoid X", "-X", "no X"
    const negationRegex = /\b(?:not|without|avoid|no)\s+([a-zA-Z0-9_-]+)/gi;
    let match: RegExpExecArray | null;
    while ((match = negationRegex.exec(text)) !== null) {
      const excludedWord = match[1].toLowerCase();
      const matchedTag = db.getTagByName(excludedWord);
      if (matchedTag) {
        if (!query.exclude_tags.includes(matchedTag.id)) {
          query.exclude_tags.push(matchedTag.id);
        }
      } else {
        query.exclude_tags.push(`custom:${excludedWord}`);
      }
    }

    // Direct minus syntax: -tag
    const minusRegex = /(?:^|\s)-([a-zA-Z0-9_-]+)/g;
    while ((match = minusRegex.exec(text)) !== null) {
      const excludedWord = match[1].toLowerCase();
      const matchedTag = db.getTagByName(excludedWord);
      if (matchedTag && !query.exclude_tags.includes(matchedTag.id)) {
        query.exclude_tags.push(matchedTag.id);
      }
    }

    // Tokenize remaining words for inclusion & tags
    const cleanedText = text
      .replace(/\b(?:not|without|avoid|no)\s+([a-zA-Z0-9_-]+)/gi, ' ')
      .replace(/(?:^|\s)-([a-zA-Z0-9_-]+)/g, ' ')
      .replace(/[^\w\s-]/g, ' ')
      .trim();

    const tokens = cleanedText.split(/\s+/).filter(t => t.length > 1);

    for (const token of tokens) {
      const lowerToken = token.toLowerCase();
      // Check creator matching
      const allCreators = db.getCreators();
      const matchedCreator = allCreators.find(c =>
        c.displayName.toLowerCase().includes(lowerToken) ||
        (c.canonicalIdentifier && c.canonicalIdentifier.toLowerCase().includes(lowerToken))
      );
      if (matchedCreator && !query.creator_terms.includes(matchedCreator.displayName)) {
        query.creator_terms.push(matchedCreator.displayName);
      }

      // Check tag matching
      const matchedTag = db.getTagByName(lowerToken);
      if (matchedTag && !query.include_tags.includes(matchedTag.id) && !query.exclude_tags.includes(matchedTag.id)) {
        query.include_tags.push(matchedTag.id);
      }

      // Check language terms
      if (['japanese', 'english', 'chinese'].includes(lowerToken)) {
        query.language = lowerToken;
      }
    }

    // Remaining concepts
    query.concepts = tokens.filter(t => t.length > 2);

    return query;
  }

  /**
   * Executes the full hybrid search pipeline
   */
  public search(query: StructuredSearchQuery): SearchResponse {
    // 1. Eligibility & Rights Gate: Retrieve only published and eligible records
    const allPublished = db.getItems({
      visibilityStatus: 'published',
      eligibilityStatus: 'eligible'
    });

    // 2. Strict Exclusions Gate: Any record carrying an excluded tag must be removed immediately
    const excludeTagIds = new Set(query.exclude_tags.filter(t => !t.startsWith('custom:')));
    const customExcludes = query.exclude_tags
      .filter(t => t.startsWith('custom:'))
      .map(t => t.replace('custom:', '').toLowerCase());

    const eligibleItems = allPublished.filter(item => {
      // Check tag ID exclusions
      const hasExcludedTag = item.tags.some(t => excludeTagIds.has(t.id));
      if (hasExcludedTag) return false;

      // Check custom word exclusions against title, tags, description
      if (customExcludes.length > 0) {
        const itemText = `${item.canonicalTitle} ${item.tags.map(t => t.normalizedName).join(' ')} ${item.description}`.toLowerCase();
        const matchesCustom = customExcludes.some(word => itemText.includes(word));
        if (matchesCustom) return false;
      }

      // Check language filter
      if (query.language && item.language.toLowerCase() !== query.language.toLowerCase()) {
        return false;
      }

      // Check availability mode filter
      if (query.availability_mode && item.availabilityMode !== query.availability_mode) {
        return false;
      }

      // Check mandatory include_tags if any
      if (query.include_tags.length > 0) {
        const itemTagIds = new Set(item.tags.map(t => t.id));
        const hasAllIncludes = query.include_tags.every(tid => itemTagIds.has(tid));
        if (!hasAllIncludes) return false;
      }

      return true;
    });

    // If query text is empty and no specific terms, return sorted eligible items
    if (!query.query_text.trim() && query.include_tags.length === 0 && query.creator_terms.length === 0) {
      const sorted = this.applySorting(eligibleItems.map(i => ({
        ...i,
        finalScore: 1.0,
        matchReasons: ['Catalogue browsing']
      })), query.sort);

      return this.paginateResults(sorted, query);
    }

    // 3. Lexical Retrieval & Scoring
    const lexicalScored = this.scoreLexical(eligibleItems, query);

    // 4. Vector Semantic Retrieval & Scoring
    const vectorScored = this.scoreVector(eligibleItems, query);

    // 5. Reciprocal Rank Fusion (RRF) & Grounded Match Explanations
    const fusedResults = this.fuseResults(eligibleItems, lexicalScored, vectorScored, query);

    // 6. Apply Final Sorting
    const sortedResults = this.applySorting(fusedResults, query.sort);

    return this.paginateResults(sortedResults, query);
  }

  private scoreLexical(items: CatalogueItem[], query: StructuredSearchQuery): Map<string, { score: number; rank: number; reasons: string[]; isExact: boolean }> {
    const rawScores: { id: string; score: number; reasons: string[]; isExact: boolean }[] = [];
    const searchTerms = (query.query_text || '').toLowerCase().split(/\s+/).filter(Boolean);

    for (const item of items) {
      let score = 0;
      const reasons: string[] = [];
      let isExact = false;

      const titleLower = item.canonicalTitle.toLowerCase();
      const altTitlesLower = item.alternateTitles.map(t => t.toLowerCase());
      const creatorLower = item.creatorName.toLowerCase();
      const tagNamesLower = item.tags.map(t => t.normalizedName.toLowerCase());
      const descLower = item.description.toLowerCase();

      // Exact title match
      if (query.query_text && (titleLower === query.query_text.toLowerCase() || altTitlesLower.includes(query.query_text.toLowerCase()))) {
        score += 50;
        reasons.push(`Exact title match: "${item.canonicalTitle}"`);
        isExact = true;
      } else if (query.query_text && titleLower.includes(query.query_text.toLowerCase())) {
        score += 25;
        reasons.push(`Title matches: "${item.canonicalTitle}"`);
      }

      // Creator matches
      for (const cTerm of query.creator_terms) {
        if (creatorLower.includes(cTerm.toLowerCase())) {
          score += 20;
          reasons.push(`Creator: ${item.creatorName}`);
        }
      }

      // Term-by-term lexical hits
      for (const term of searchTerms) {
        if (titleLower.includes(term)) {
          score += 10;
        }
        if (creatorLower.includes(term)) {
          score += 12;
          if (!reasons.includes(`Creator: ${item.creatorName}`)) {
            reasons.push(`Creator: ${item.creatorName}`);
          }
        }
        for (const tag of item.tags) {
          if (tag.normalizedName.toLowerCase() === term) {
            score += 15;
            reasons.push(`Tag: #${tag.normalizedName}`);
          } else if (tag.normalizedName.toLowerCase().includes(term)) {
            score += 6;
          }
        }
        if (descLower.includes(term)) {
          score += 3;
        }
      }

      // Boost for include_tags matches
      for (const incId of query.include_tags) {
        const matched = item.tags.find(t => t.id === incId);
        if (matched) {
          score += 10;
          const r = `Filter tag: #${matched.normalizedName}`;
          if (!reasons.includes(r)) reasons.push(r);
        }
      }

      if (score > 0) {
        rawScores.push({ id: item.id, score, reasons, isExact });
      }
    }

    rawScores.sort((a, b) => b.score - a.score);
    const result = new Map<string, { score: number; rank: number; reasons: string[]; isExact: boolean }>();
    rawScores.forEach((entry, idx) => {
      result.set(entry.id, {
        score: entry.score,
        rank: idx + 1,
        reasons: entry.reasons,
        isExact: entry.isExact
      });
    });

    return result;
  }

  private scoreVector(items: CatalogueItem[], query: StructuredSearchQuery): Map<string, { similarity: number; rank: number }> {
    const textToEmbed = `${query.query_text} ${query.concepts.join(' ')}`;
    const queryVector = generateEmbedding(textToEmbed);

    const scores: { id: string; similarity: number }[] = [];

    for (const item of items) {
      const itemVector = db.getItemEmbedding(item.id);
      if (itemVector) {
        const similarity = cosineSimilarity(queryVector, itemVector);
        scores.push({ id: item.id, similarity });
      } else {
        scores.push({ id: item.id, similarity: 0 });
      }
    }

    scores.sort((a, b) => b.similarity - a.similarity);
    const result = new Map<string, { similarity: number; rank: number }>();
    scores.forEach((entry, idx) => {
      result.set(entry.id, {
        similarity: entry.similarity,
        rank: idx + 1
      });
    });

    return result;
  }

  private fuseResults(
    items: CatalogueItem[],
    lexicalMap: Map<string, { score: number; rank: number; reasons: string[]; isExact: boolean }>,
    vectorMap: Map<string, { similarity: number; rank: number }>,
    query: StructuredSearchQuery
  ): SearchResultItem[] {
    const k = 60; // Standard reciprocal rank fusion parameter
    const fused: SearchResultItem[] = [];

    for (const item of items) {
      const lex = lexicalMap.get(item.id);
      const vec = vectorMap.get(item.id);

      const lexRank = lex ? lex.rank : 999;
      const vecRank = vec ? vec.rank : 999;
      const lexScore = lex ? lex.score : 0;
      const vecSim = vec ? vec.similarity : 0;

      // Reciprocal Rank Fusion formula
      const rrfScore = (1.0 / (k + lexRank)) + (0.7 / (k + vecRank));

      const reasons: string[] = [];
      if (lex && lex.reasons.length > 0) {
        reasons.push(...lex.reasons);
      }
      if (vecSim > 0.45 && reasons.length < 3) {
        reasons.push(`Semantic concept similarity (${Math.round(vecSim * 100)}%)`);
      }

      // Filter out pure noise if neither lexical hit nor substantial vector similarity
      if (lexScore === 0 && vecSim < 0.35 && query.query_text.trim().length > 0) {
        continue;
      }

      fused.push({
        ...item,
        lexicalScore: lexScore,
        vectorScore: vecSim,
        finalScore: lex?.isExact ? 100 : rrfScore,
        matchReasons: reasons.length > 0 ? Array.from(new Set(reasons)) : ['Broad match'],
        isExactMatch: lex?.isExact || false
      });
    }

    return fused;
  }

  private applySorting(items: SearchResultItem[], sort: StructuredSearchQuery['sort']): SearchResultItem[] {
    const list = [...items];
    switch (sort) {
      case 'relevance':
        return list.sort((a, b) => b.finalScore - a.finalScore);
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'publication_date':
        return list.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
      case 'title_asc':
        return list.sort((a, b) => a.canonicalTitle.localeCompare(b.canonicalTitle));
      case 'title_desc':
        return list.sort((a, b) => b.canonicalTitle.localeCompare(a.canonicalTitle));
      case 'popular':
        return list.sort((a, b) => b.saveCount - a.saveCount);
      default:
        return list.sort((a, b) => b.finalScore - a.finalScore);
    }
  }

  private paginateResults(items: SearchResultItem[], query: StructuredSearchQuery): SearchResponse {
    const total = items.length;
    const page = Math.max(1, query.page);
    const pageSize = Math.max(1, query.pageSize);
    const totalPages = Math.ceil(total / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    const activeFilterCount =
      query.include_tags.length +
      query.exclude_tags.length +
      query.creator_terms.length +
      (query.language ? 1 : 0) +
      (query.availability_mode ? 1 : 0);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
      query,
      activeFilterCount
    };
  }
}

export const hybridSearchService = new HybridSearchService();
