import type { StructuredSearchQuery, SearchResponse, SearchResultItem, CatalogueItem } from '../types/index.ts';
import { db } from '../lib/db.ts';
import { generateEmbedding, cosineSimilarity } from '../lib/vector.ts';

export class HybridSearchService {
  /**
   * Normalizes and parses raw natural-language search query into structured search object
   */
  public parseNaturalQuery(rawText: string, existingQuery?: Partial<StructuredSearchQuery>): StructuredSearchQuery {
    const text = (rawText || '').trim();

    // Check if the input is explicitly a refinement or addition to the previous search
    const isRefinement = !text || /^\s*(?:\+|also|now|add|and|include|with|without|no|-|only|in\s+(?:english|japanese|chinese))\b/i.test(text);

    const query: StructuredSearchQuery = {
      query_text: text,
      concepts: [],
      include_tags: isRefinement ? [...(existingQuery?.include_tags || [])] : [],
      exclude_tags: isRefinement ? [...(existingQuery?.exclude_tags || [])] : [],
      creator_terms: isRefinement ? [...(existingQuery?.creator_terms || [])] : [],
      title_terms: [...(existingQuery?.title_terms || [])],
      language: existingQuery?.language || null,
      sort: existingQuery?.sort || 'relevance',
      availability_mode: existingQuery?.availability_mode || null,
      page: existingQuery?.page || 1,
      pageSize: existingQuery?.pageSize || 12
    };

    if (!text) return query;

    // Common synonyms and normalization dictionary
    const SYNONYM_MAP: Record<string, string> = {
      'ntr': 'netorare',
      'netotare': 'netorare',
      'netorase': 'netorare',
      'cheating': 'netorare',
      'infidelity': 'netorare',
      'ub': 'ugly bastard',
      'ugly bastard': 'ugly bastard',
      'fat bastard': 'ugly bastard',
      'mind break': 'mind break',
      'mindbreak': 'mind break',
      'fgo': 'fate grand order',
      'fate': 'fate grand order',
      'ba': 'blue archive',
      'genshin': 'genshin impact',
      'hsr': 'honkai star rail',
      'star rail': 'honkai star rail',
      'imas': 'the idolmaster',
      'idolmaster': 'the idolmaster',
      'kancolle': 'kantai collection',
      'touhou': 'touhou project',
      'neko': 'catgirl',
      'cat girl': 'catgirl',
      'kitsune': 'foxgirl',
      'fox girl': 'foxgirl',
      'wolf girl': 'wolfgirl',
      'bunny girl': 'bunny girl',
      'cowgirl': 'cowgirl',
      'monster girl': 'monster girl',
      'vanilla': 'wholesome',
      'femdom': 'female domination',
      'oppai': 'big breasts',
      'huge breasts': 'big breasts',
      'pettanko': 'flat chest',
      'small breasts': 'flat chest',
      'megane': 'glasses',
      'maid cafe': 'maid',
      'maids': 'maid',
      'elves': 'elf',
      'ol': 'office lady',
      'gal': 'gyaru',
      'shota': 'shotacon',
      'onee-san': 'onee-san',
      'oneesan': 'onee-san',
      'goth': 'gothic',
      'swimsuit': 'swimsuit',
      'bikini': 'swimsuit',
      'pantyhose': 'stockings',
      'color': 'full color',
      'colored': 'full color',
      'translated': 'english',
      'raw': 'japanese',
      'yuri': 'yuri',
      'yaoi': 'yaoi',
      'bl': 'yaoi',
      'futanari': 'futanari',
      'dickgirl': 'futanari',
      'tentacles': 'tentacles',
      'bondage': 'bondage',
      'bdsm': 'bondage',
      'shibari': 'bondage',
      'dark skin': 'dark skin',
      'tan': 'dark skin',
      'tanned': 'dark skin',
      'milf': 'milf',
      'dilf': 'mature male',
      'mature': 'mature female',
      'incest': 'incest',
      'sister': 'sister',
      'imouto': 'sister',
      'mother': 'mother',
      'nakadashi': 'nakadashi',
      'creampie': 'nakadashi',
      'paizuri': 'paizuri',
      'ahegao': 'ahegao',
      'sole male': 'sole male',
      'sole female': 'sole female',
      'group': 'group',
      'threesome': 'group',
      'gangbang': 'group',
      'full color': 'full color',
      'uncensored': 'uncensored',
      'decensored': 'uncensored'
    };

    // Parody list
    const KNOWN_PARODIES = new Set([
      'fate grand order', 'genshin impact', 'blue archive', 'honkai star rail',
      'touhou project', 'the idolmaster', 'kantai collection', 'hololive',
      'pokemon', 'azur lane', 'granblue fantasy', 'naruto', 'one piece'
    ]);

    // Comprehensive Doujinshi & Manga Tag Taxonomy
    const KNOWN_TAGS = new Set([
      'netorare', 'ugly bastard', 'cheating', 'infidelity', 'wholesome', 'vanilla',
      'romance', 'fantasy', 'parody', 'kemonomimi', 'catgirl', 'foxgirl', 'wolfgirl',
      'bunny girl', 'cowgirl', 'monster girl', 'elf', 'maid', 'gothic', 'yandere',
      'tsundere', 'kuudere', 'comedy', 'gyaru', 'milf', 'mature female', 'dilf',
      'mature male', 'shota', 'shotacon', 'onee-san', 'sister', 'femdom',
      'female domination', 'big breasts', 'small breasts', 'flat chest', 'stockings',
      'swimsuit', 'bikini', 'glasses', 'schoolgirl', 'schoolgirl uniform', 'office lady',
      'teacher', 'nurse', 'succubus', 'demon girl', 'dark skin', 'bondage', 'futanari',
      'yuri', 'yaoi', 'tentacles', 'mind break', 'incest', 'nakadashi', 'ahegao',
      'paizuri', 'sole male', 'sole female', 'group', 'full color', 'uncensored',
      'doujinshi', 'manga', 'tomboy', 'crossdressing', 'exhibitionism', 'cosplay'
    ]);

    // Popular Creators
    const KNOWN_CREATORS = [
      'Asanagi', 'Victim Girls', 'Distance', 'Hisasi', 'M-Gokurakudou',
      'ReDrop', 'Inumata', 'Dog Style', 'Oouso', 'Usotei', 'Mochizuki Aoi',
      'Shindo L', 'Homunculus', 'Cuvie', 'Crimson', 'Hirame', 'Nanashi',
      'MEME50', 'Mizone', 'Takeda Hiromitsu', 'Alphonse', 'Urashiman', 'Chiba Toshirou'
    ];

    const resolveTagId = (term: string, isParodyHint = false): string => {
      const clean = term.toLowerCase().trim();
      const mapped = SYNONYM_MAP[clean] || clean;
      const matched = db.getTagByName(mapped);
      if (matched) return matched.id;
      if (isParodyHint || KNOWN_PARODIES.has(mapped)) {
        return `parody-${mapped.replace(/\s+/g, '-')}`;
      }
      return `tag-${mapped.replace(/\s+/g, '-')}`;
    };

    let workingText = text;

    // Detect multi-word & single-word negation patterns: "without X", "no X", "not X", "avoid X", "except X", "skip X"
    const negationRegex = /\b(?:not|without|avoid|no|except|skip|hate|minus)\s+([a-zA-Z0-9_\s-]+?)(?=\s+(?:not|without|avoid|no|except|skip|with|and|in|\+|-)|$)/gi;
    let match: RegExpExecArray | null;
    while ((match = negationRegex.exec(text)) !== null) {
      const rawExcluded = match[1].trim();
      if (!rawExcluded) continue;
      // Handle comma or "or" separated multi-negations
      const subParts = rawExcluded.split(/\s+(?:or|and|,)\s+/i);
      for (const part of subParts) {
        const cleanPart = part.toLowerCase().trim();
        if (cleanPart.length < 2) continue;
        const tagId = resolveTagId(cleanPart);
        if (!query.exclude_tags.includes(tagId)) {
          query.exclude_tags.push(tagId);
        }
      }
    }

    // Direct minus syntax: -tag or -"multi word"
    const minusQuotedRegex = /(?:^|\s)-"([^"]+)"/g;
    while ((match = minusQuotedRegex.exec(text)) !== null) {
      const tagId = resolveTagId(match[1]);
      if (!query.exclude_tags.includes(tagId)) {
        query.exclude_tags.push(tagId);
      }
    }

    const minusSimpleRegex = /(?:^|\s)-([a-zA-Z0-9_-]+)/g;
    while ((match = minusSimpleRegex.exec(text)) !== null) {
      const tagId = resolveTagId(match[1]);
      if (!query.exclude_tags.includes(tagId)) {
        query.exclude_tags.push(tagId);
      }
    }

    // Check for explicit sort signals in text
    if (/\b(?:popular|top(?:\s+rated)?|best|hottest|most\s+saved|favorites)\b/i.test(text)) {
      query.sort = 'popular';
    } else if (/\b(?:newest|latest|recent|fresh|new\s+uploads)\b/i.test(text)) {
      query.sort = 'newest';
    }

    // Check for creator matches
    const allDbCreators = db.getCreators();
    const combinedCreators = [...KNOWN_CREATORS, ...allDbCreators.map(c => c.displayName)];
    for (const cName of combinedCreators) {
      const escaped = cName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const cRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (cRegex.test(workingText)) {
        if (!query.creator_terms.includes(cName)) {
          query.creator_terms.push(cName);
        }
        workingText = workingText.replace(cRegex, ' ');
      }
    }

    // Check for language signals
    if (/\b(?:english|translated|eng)\b/i.test(workingText)) {
      query.language = 'english';
    } else if (/\b(?:japanese|raw|jp|nihongo)\b/i.test(workingText)) {
      query.language = 'japanese';
    } else if (/\b(?:chinese|traditional\s+chinese|simplified\s+chinese|cn)\b/i.test(workingText)) {
      query.language = 'chinese';
    }

    // Strip negation phrases out of workingText so they don't pollute inclusion tags
    const cleanedText = workingText
      .replace(/\b(?:not|without|avoid|no|except|skip|hate|minus)\s+([a-zA-Z0-9_\s-]+?)(?=\s+(?:not|without|avoid|no|except|skip|with|and|in|\+|-)|$)/gi, ' ')
      .replace(/(?:^|\s)-"[^"]+"/g, ' ')
      .replace(/(?:^|\s)-([a-zA-Z0-9_-]+)/g, ' ')
      .replace(/[^\w\s-]/g, ' ')
      .trim();

    // Check multi-word phrase tags first (e.g. 'fate grand order', 'blue archive', 'office lady', 'big breasts', 'flat chest')
    for (const [synKey, synVal] of Object.entries(SYNONYM_MAP)) {
      if (synKey.includes(' ')) {
        const synRegex = new RegExp(`\\b${synKey}\\b`, 'i');
        if (synRegex.test(cleanedText)) {
          const tagId = resolveTagId(synVal);
          if (!query.include_tags.includes(tagId) && !query.exclude_tags.includes(tagId)) {
            query.include_tags.push(tagId);
          }
        }
      }
    }

    const tokens = cleanedText.split(/\s+/).filter(t => t.length > 1);

    const STOPWORDS = new Set([
      'show', 'me', 'find', 'give', 'want', 'looking', 'for', 'works', 'doujin', 'doujins',
      'manga', 'please', 'can', 'you', 'something', 'with', 'and', 'the', 'in', 'of', 'a', 'an'
    ]);

    for (const token of tokens) {
      const lowerToken = token.toLowerCase();
      if (STOPWORDS.has(lowerToken)) continue;

      // Check tag matching
      const mapped = SYNONYM_MAP[lowerToken] || lowerToken;
      const tagId = resolveTagId(mapped);
      const isExcluded = query.exclude_tags.some(ex => ex === tagId || ex.endsWith(mapped));

      if (!isExcluded && !query.include_tags.includes(tagId)) {
        const isKnown = KNOWN_TAGS.has(mapped) || Boolean(db.getTagByName(mapped)) || KNOWN_PARODIES.has(mapped) || Boolean(SYNONYM_MAP[lowerToken]);
        if (isKnown) {
          query.include_tags.push(tagId);
        }
      }
    }

    // Remaining concepts (excluding stopwords)
    query.concepts = tokens.filter(t => t.length > 2 && !STOPWORDS.has(t.toLowerCase()));

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

    let eligibleItems = allPublished.filter(item => {
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
      if (query.language && query.language !== 'any' && item.language.toLowerCase() !== query.language.toLowerCase()) {
        return false;
      }

      // Check availability mode filter
      if (query.availability_mode && item.availabilityMode !== query.availability_mode) {
        return false;
      }

      return true;
    });

    // Check include_tags: prefer items matching ALL, fallback to items matching ANY
    if (query.include_tags.length > 0) {
      const allMatching = eligibleItems.filter(item => {
        const itemTagIds = new Set(item.tags.map(t => t.id));
        return query.include_tags.every(tid => itemTagIds.has(tid));
      });

      if (allMatching.length > 0) {
        eligibleItems = allMatching;
      } else {
        const anyMatching = eligibleItems.filter(item => {
          const itemTagIds = new Set(item.tags.map(t => t.id));
          return query.include_tags.some(tid => itemTagIds.has(tid));
        });
        if (anyMatching.length > 0) {
          eligibleItems = anyMatching;
        }
      }
    }

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
