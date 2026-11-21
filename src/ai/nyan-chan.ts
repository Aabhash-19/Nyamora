import type { NyanChanMessage, StructuredSearchQuery, SearchResponse } from '../types/index.ts';
import { hybridSearchService } from '../search/hybrid-search.ts';
import { db } from '../lib/db.ts';

export class NyanChanAssistantService {
  /**
   * Processes a user chat message or conversational query, executes real hybrid search,
   * grounds the explanation in returned records, and returns Nyan-chan's response.
   */
  public async chat(userMessage: string, previousContext?: Partial<StructuredSearchQuery>): Promise<NyanChanMessage> {
    const raw = (userMessage || '').trim();

    // 1. Parse natural language into structured search constraints
    const structuredQuery = hybridSearchService.parseNaturalQuery(raw, previousContext);

    // 2. Execute actual grounded search across the catalogue
    const searchResponse: SearchResponse = hybridSearchService.search(structuredQuery);

    // 3. Generate grounded non-explicit conversational response in Nyan-chan's voice
    const response = this.composeGroundedResponse(raw, structuredQuery, searchResponse);

    return response;
  }

  private composeGroundedResponse(
    userText: string,
    query: StructuredSearchQuery,
    results: SearchResponse
  ): NyanChanMessage {
    const totalFound = results.total;
    const topPicks = results.items.slice(0, 3);
    const suggestedTags: string[] = [];

    // Derive intelligent tag suggestions based on findings
    const allTags = db.getTags();
    if (results.items.length > 0) {
      const currentTagIds = new Set(query.include_tags);
      for (const item of results.items) {
        for (const t of item.tags) {
          if (!currentTagIds.has(t.id) && !suggestedTags.includes(t.normalizedName)) {
            suggestedTags.push(t.normalizedName);
            if (suggestedTags.length >= 4) break;
          }
        }
        if (suggestedTags.length >= 4) break;
      }
    } else {
      // Suggest popular fallback tags
      suggestedTags.push('wholesome', 'fantasy', 'kemonomimi', 'romance');
    }

    let replyText = '';
    let expression: NyanChanMessage['expression'] = 'happy';

    // Conversational handling
    const lower = userText.toLowerCase();

    // Greetings
    if (lower.match(/^(hi|hello|hey|greetings|nya|konnichiwa)\b/i)) {
      replyText = `Nya-hello! I'm **Nyan-chan**, your official host and concierge here at **Nyamora**! (⸝⸝ᵕᴗᵕ⸝⸝)✨\n\nTell me what mood, genre, creator, or trope you're looking for! You can also tell me what to avoid (e.g. *"wholesome fantasy romance without yandere"*), and I'll find the best rights-cleared works in our archive for you!`;
      expression = 'wink';
      return {
        id: `nyan-${Date.now()}`,
        sender: 'nyan_chan',
        text: replyText,
        timestamp: new Date().toISOString(),
        structuredQuery: query,
        recommendedItems: topPicks,
        suggestedTags: suggestedTags.slice(0, 4),
        expression
      };
    }

    // Zero results case
    if (totalFound === 0) {
      expression = 'thinking';
      let excludeNote = '';
      if (query.exclude_tags.length > 0) {
        excludeNote = ` with your strict exclusion filters`;
      }
      replyText = `Hmm... I searched the entire Nyamora archive, but couldn't find any verified records matching "${userText}"${excludeNote}. Nya~ (｡•́︿•̀｡)\n\nCould we try broadening the keywords, or would you like to explore related genres like **#${suggestedTags[0]}** or **#${suggestedTags[1]}**?`;

      return {
        id: `nyan-${Date.now()}`,
        sender: 'nyan_chan',
        text: replyText,
        timestamp: new Date().toISOString(),
        structuredQuery: query,
        recommendedItems: [],
        suggestedTags: suggestedTags.slice(0, 4),
        clarificationQuestion: 'Would you like me to remove the filters or suggest top curated entries?',
        expression
      };
    }

    // Results found: generate grounded explanation
    expression = 'happy';
    const firstItem = topPicks[0];
    const topReason = firstItem.matchReasons[0] || 'High thematic relevance';

    let intro = `Nya! I pulled up **${totalFound} verified ${totalFound === 1 ? 'entry' : 'entries'}** for you from our archive! ✨`;

    if (query.exclude_tags.length > 0) {
      intro += ` *(Strictly filtered to exclude prohibited tags as requested)*.`;
    }

    let highlights = `\n\nMy top recommendation is **"${firstItem.canonicalTitle}"** by **${firstItem.creatorName}** (${topReason}).`;
    if (firstItem.availabilityMode === 'integrated_licensed') {
      highlights += ` You can read this licensed release directly here on Nyamora!`;
    } else if (firstItem.availabilityMode === 'external_authorized') {
      highlights += ` It links directly to its authorized partner reading page.`;
    }

    if (topPicks.length > 1) {
      highlights += ` I've also highlighted **"${topPicks[1].canonicalTitle}"** and **"${topPicks[2]?.canonicalTitle || ''}"** below.`;
    }

    replyText = `${intro}${highlights}\n\nWant to refine this further? You can tap any of the suggested tag filters below or ask me to narrow by language, creator, or availability! (ฅ^•ﻌ•^ฅ)`;

    return {
      id: `nyan-${Date.now()}`,
      sender: 'nyan_chan',
      text: replyText,
      timestamp: new Date().toISOString(),
      structuredQuery: query,
      recommendedItems: topPicks,
      suggestedTags: suggestedTags.slice(0, 4),
      expression
    };
  }
}

export const nyanChanAssistant = new NyanChanAssistantService();
