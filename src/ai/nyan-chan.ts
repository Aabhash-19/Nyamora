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
    if (lower.match(/^(hi|hello|hey|greetings|nya|konnichiwa|sup)\b/i)) {
      replyText = `Nya~ Welcome back, darling... ♡ I'm **Nyan-chan**, your seductive host and catalogue concierge here at **Nyamora**~ (˶ᵔ ᵕ ᵔ˶)✨\n\nAre you looking for something sweet and tender to tease your heart, or something a little more deliciously wicked tonight? Tell me your secret cravings, preferred creators, or tropes—and if there's anything you want me to avoid (e.g. *"wholesome elf romance without yandere"*), just whisper it to me. Don't be shy, I won't bite... unless you ask nicely~ fufufu! ♡`;
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
        excludeNote = ` with your strict exclusions`;
      }
      replyText = `Mmm... you're being quite particular, aren't you? I searched our entire archive, but couldn't find any verified records matching "${userText}"${excludeNote}... nya~ (｡•́︿•̀｡)\n\nMaybe loosen up those tight filters just a little for me? Or let me tempt you with some **#${suggestedTags[0]}** or **#${suggestedTags[1]}** instead... Trust me, you'll love it~ ♡`;

      return {
        id: `nyan-${Date.now()}`,
        sender: 'nyan_chan',
        text: replyText,
        timestamp: new Date().toISOString(),
        structuredQuery: query,
        recommendedItems: [],
        suggestedTags: suggestedTags.slice(0, 4),
        clarificationQuestion: 'Should we broaden the search, darling, or would you like to see my personal top picks?',
        expression
      };
    }

    // Results found: generate grounded explanation
    expression = 'happy';
    const firstItem = topPicks[0];
    const topReason = firstItem.matchReasons[0] || 'High thematic relevance';

    let intro = `Mmm, fufufu~ look what I caught for you! I found **${totalFound} verified ${totalFound === 1 ? 'delight' : 'delights'}** waiting in the archive just for your eyes... nya~ ♡`;

    if (query.exclude_tags.length > 0) {
      intro += ` *(And don't worry darling, I kept your excluded tags strictly locked away outside)*.`;
    }

    let highlights = `\n\nMy personal recommendation for you tonight is **"${firstItem.canonicalTitle}"** by **${firstItem.creatorName}** (${topReason}). Doesn't that sound tantalizing?`;
    if (firstItem.availabilityMode === 'integrated_licensed') {
      highlights += ` You can read this licensed treat right here online with me on Nyamora!`;
    } else if (firstItem.availabilityMode === 'external_authorized') {
      highlights += ` It links directly to its authorized partner page for reading.`;
    }

    if (topPicks.length > 1) {
      highlights += ` I've also uncovered **"${topPicks[1].canonicalTitle}"** and **"${topPicks[2]?.canonicalTitle || ''}"** below if you want more.`;
    }

    replyText = `${intro}${highlights}\n\nWant to tease this search a bit more? Tap any of the juicy tag filters below, or tell me what else you're craving... (ฅ^•ﻌ•^ฅ)♡`;

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
