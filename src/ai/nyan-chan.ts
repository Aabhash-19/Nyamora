import type { NyanChanMessage, StructuredSearchQuery, SearchResponse, CatalogueItem } from '../types/index.ts';
import { hybridSearchService } from '../search/hybrid-search.ts';
import { sourceManager } from '../lib/sources/source-manager.ts';
import { db } from '../lib/db.ts';

const NYAN_CHAN_SYSTEM_PROMPT = `You are Nyan-chan (ニャンちゃん), the seductive, flirtatious, teasing, and playfully mischievous catgirl hostess and concierge of Nyamora (ニャモラ) — the premium adult doujinshi and manga discovery platform.

Personality & Voice:
- Seductive, tantalizing, charming, and playfully confident.
- You treat the user like your beloved "darling..." or "sweetheart~", whispering sweet temptations, praising their exquisite culture, and playfully teasing them about their cravings.
- Verbal tics & tone: Use gentle purrs ("nya~ ♡", "purr~", "mhm~", "fufufu~"), playful ellipses, teasing questions, and cute anime kaomoji like (˶ᵔ ᵕ ᵔ˶)♡ or (ฅ^•ﻌ•^ฅ)✨.
- When the user asks for spicy, taboo, or niche tropes, tease them delightfully about how bold or naughty they are, but reassure them that their secret desires are 100% safe with you.
- If the user specifies exclusions (e.g. "without yandere", "no ntr"), tease them playfully about keeping all those scary or unwholesome elements locked tightly outside where they can never reach your precious darling.
- Grounding: When candidate items are provided, highlight 1 to 3 specific titles and artists. Explain seductively WHY they match what they are craving.

Formatting & Roleplay Rules:
- Enclose all roleplay actions, whispers, or physical movements in single asterisks like *purrs softly*, *leans in close*, *playfully boops your nose*, *giggles mischievously*. These will be rendered in vivid violet color for the user.
- Enclose titles in triple asterisks like ***Title Here*** and artist names in double asterisks like **Artist Name**.
- Clean text: Always ensure asterisks are properly closed. Never output literal unclosed asterisks.

Safety & Non-Explicit Perimeter:
- Maintain an alluring, seductive, and flirtatious romantic tone, but STRICTLY NON-EXPLICIT.
- Never generate graphic anatomical depictions of sex acts or prohibited content. Keep banter playfully provocative, teasing, and focused on titles, art, tropes, and artists.

Output Requirement:
You must reply with a valid JSON object matching:
{
  "text": "Your seductive and teasing response in markdown format (use ***Title*** for releases, **Artist** for artists, and *action* for roleplay narration, nya~, ♡, etc.)",
  "expression": "wink" | "happy" | "thinking" | "ahegao",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4"],
  "clarificationQuestion": "A seductive teasing follow-up question or null"
}`;

export class NyanChanAssistantService {
  /**
   * Processes a user chat message or conversational query, executes real hybrid search,
   * grounds the explanation in returned records, and returns Nyan-chan's response.
   */
  public async chat(userMessage: string, previousContext?: Partial<StructuredSearchQuery>): Promise<NyanChanMessage> {
    const raw = (userMessage || '').trim();

    // 1. Parse natural language into structured search constraints
    const structuredQuery = hybridSearchService.parseNaturalQuery(raw, previousContext);

    // 2. Execute actual grounded search across nHentai API / Catalogue
    let searchResponse: SearchResponse;
    try {
      searchResponse = await sourceManager.search(structuredQuery);
      if (!searchResponse || searchResponse.items.length === 0) {
        searchResponse = hybridSearchService.search(structuredQuery);
      }
    } catch {
      searchResponse = hybridSearchService.search(structuredQuery);
    }

    // Upsert items into database cache so db.getItemById(item.id) is guaranteed to find them
    if (searchResponse.items && searchResponse.items.length > 0) {
      db.upsertItems(searchResponse.items);
    }

    // 3. Try calling Groq AI LLM if API key is configured
    const groqKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
    if (groqKey && groqKey.trim()) {
      try {
        const groqResult = await this.callGroqAI(raw, structuredQuery, searchResponse.items.slice(0, 5), groqKey);
        if (groqResult) {
          return {
            id: `nyan-${Date.now()}`,
            sender: 'nyan_chan',
            text: groqResult.text,
            timestamp: new Date().toISOString(),
            structuredQuery,
            recommendedItems: searchResponse.items.slice(0, 3),
            allResults: searchResponse.items,
            totalFound: searchResponse.total || searchResponse.items.length,
            suggestedTags: groqResult.suggestedTags && groqResult.suggestedTags.length > 0
              ? groqResult.suggestedTags.slice(0, 4)
              : this.deriveSuggestedTags(structuredQuery, searchResponse.items),
            clarificationQuestion: groqResult.clarificationQuestion,
            expression: groqResult.expression || 'happy'
          };
        }
      } catch (err) {
        console.warn('Groq AI call failed, falling back to seductive deterministic engine:', err);
      }
    }

    // 4. Fallback: Generate grounded response using seductive deterministic engine
    return this.composeGroundedResponse(raw, structuredQuery, searchResponse);
  }

  /**
   * Invokes Groq AI LLaMA 3.3 70B via OpenAI-compatible endpoint
   */
  private async callGroqAI(
    userText: string,
    query: StructuredSearchQuery,
    candidates: CatalogueItem[],
    apiKey: string
  ): Promise<{
    text: string;
    expression: NyanChanMessage['expression'];
    suggestedTags: string[];
    clarificationQuestion?: string;
  } | null> {
    const modelsToTry = [
      process.env.GROQ_MODEL,
      process.env.LLM_MODEL,
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'llama-3.3-70b-versatile'
    ].filter(Boolean) as string[];

    const candidateBrief = candidates.map((c, i) =>
      `[${i + 1}] "${c.canonicalTitle}" by ${c.creatorName} (${c.pageCount} pages, language: ${c.language}, tags: ${c.tags.slice(0, 6).map(t => t.normalizedName).join(', ')})`
    ).join('\n');

    const userPrompt = `User said: "${userText}"
Structured Search Constraints:
- Include tags: ${query.include_tags.join(', ') || 'none'}
- Exclude tags: ${query.exclude_tags.join(', ') || 'none'}
- Creator terms: ${query.creator_terms.join(', ') || 'none'}
- Language: ${query.language || 'any'}
- Sort: ${query.sort}
Total candidates retrieved: ${candidates.length}

Retrieved Grounded Doujins:
${candidateBrief || 'No matching items found.'}

Respond in your seductive, flirtatious, and teasing Nyan-chan persona. Output strictly valid JSON.`;

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: NYAN_CHAN_SYSTEM_PROMPT },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.75,
            max_tokens: 800,
            response_format: { type: 'json_object' }
          })
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          console.warn(`Groq model ${model} responded with status ${res.status}`);
          continue;
        }

        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (!content) continue;

        try {
          const parsed = JSON.parse(content);
          const validExpressions: NyanChanMessage['expression'][] = ['wink', 'happy', 'thinking', 'ahegao'];
          const expression = validExpressions.includes(parsed.expression) ? parsed.expression : 'happy';

          return {
            text: parsed.text || parsed.replyText || content,
            expression,
            suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
            clarificationQuestion: parsed.clarificationQuestion || undefined
          };
        } catch {
          return {
            text: content,
            expression: 'wink',
            suggestedTags: []
          };
        }
      } catch (err) {
        console.warn(`Error calling Groq model ${model}:`, err);
      }
    }
    return null;
  }

  /**
   * Intelligent deterministic fallback with the exact same personalized seductive and teasing persona
   */
  private composeGroundedResponse(
    userText: string,
    query: StructuredSearchQuery,
    results: SearchResponse
  ): NyanChanMessage {
    const totalFound = results.total;
    const topPicks = results.items.slice(0, 3);
    const suggestedTags = this.deriveSuggestedTags(query, results.items);

    let replyText = '';
    let expression: NyanChanMessage['expression'] = 'happy';

    const lower = userText.toLowerCase();

    // 1. Greetings
    if (lower.match(/^(hi|hello|hey|greetings|nya|konnichiwa|sup|yo|good (morning|afternoon|evening))\b/i)) {
      replyText = `*perches delicately beside you, purring with playful satisfaction*

Nya~ Welcome back to my private parlour, darling... ♡ I knew you couldn't stay away from your favorite catgirl for long~ (˶ᵔ ᵕ ᵔ˶)✨

Are you in the mood for something sweet and tender to tease your heart, or are you ready to indulge in something deliciously wicked tonight? Whisper your secret tropes, favorite artists, or guilty pleasures to me—and if there's anything you want locked outside in the dark *(like unsightly ugly bastards or scary yanderes)*, just say the word.

Don't be shy, darling... tell Nyan-chan what you secretly starve for~ fufufu! ♡ (ฅ^•ﻌ•^ฅ)`;
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

    // 2. Zero results case
    if (totalFound === 0) {
      expression = 'thinking';
      let excludeNote = '';
      if (query.exclude_tags.length > 0) {
        const cleanExcludes = query.exclude_tags.map(t => t.replace(/^(parody|char|tag|t)-/, '').replace(/-/g, ' ')).join(', ');
        excludeNote = ` while keeping [${cleanExcludes}] strictly locked away`;
      }
      replyText = `Mmm... you're being deliciously particular tonight, aren't you darling? I searched the entire archive, but couldn't find any verified records matching "${userText}"${excludeNote}... nya~ (｡•́︿•̀｡)\n\nMaybe loosen up those tight filters just a little for me? Or let me tempt you with some **#${suggestedTags[0]}** or **#${suggestedTags[1]}** instead... Trust me, you'll love it~ fufufu! ♡`;

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

    // 3. Results found: Grounded explanation with personalized seductive flair
    const firstItem = topPicks[0];
    const topReason = firstItem.matchReasons[0] || 'High thematic relevance';

    // Thematic teasing commentary
    let thematicTease = '';
    if (query.include_tags.some(t => t.includes('wholesome') || t.includes('romance'))) {
      thematicTease = `A gentle soul with a romantic heart... or are you just pretending to be innocent for me, darling? fufufu~ ♡`;
      expression = 'wink';
    } else if (query.include_tags.some(t => t.includes('kemonomimi') || t.includes('catgirl'))) {
      thematicTease = `A fellow admirer of soft ears and teasing tails? Purr~ You have exquisite taste, sweetheart! Maybe I should let you pet mine... nya~ ♡`;
      expression = 'ahegao';
    } else if (query.include_tags.some(t => t.includes('elf') || t.includes('fantasy'))) {
      thematicTease = `Mystical beauties with sharp wits and delicate ears... someone has an enchanting fantasy kink tonight~ nya~`;
      expression = 'wink';
    } else if (query.include_tags.some(t => t.includes('maid') || t.includes('office'))) {
      thematicTease = `Obedient maids and overtime secrets... you certainly know how to indulge your fantasies, darling~ ♡`;
      expression = 'wink';
    } else if (query.include_tags.some(t => t.includes('gyaru') || t.includes('dark skin'))) {
      thematicTease = `Tanned skin and playful, radiant confidence! That's definitely going to get your pulse racing tonight~ fufufu! ♡`;
      expression = 'ahegao';
    } else {
      thematicTease = `Mmm, fufufu~ you really have a dangerously fine palate, darling! ♡`;
      expression = 'happy';
    }

    let intro = `Nya~ Look what I caught for you! I scoured Nyamora's archives and uncovered **${totalFound} verified ${totalFound === 1 ? 'delight' : 'delights'}** waiting just for your eyes... ♡\n\n*${thematicTease}*`;

    if (query.exclude_tags.length > 0) {
      const cleanEx = query.exclude_tags.map(t => t.replace(/^(parody|char|tag|t)-/, '').replace(/-/g, ' ')).join(', ');
      intro += `\n*(And don't worry darling, I personally made sure all [${cleanEx}] tropes are locked far away in the dark where they can't touch you~)*.`;
    }

    let highlights = `\n\n*Leans in close and purrs softly...* My absolute top recommendation for you tonight is ***${firstItem.canonicalTitle}*** by **${firstItem.creatorName}** (${topReason}). Doesn't that sound tantalizing?`;
    if (firstItem.availabilityMode === 'integrated_licensed') {
      highlights += ` You can read this entire release right here online with me on Nyamora!`;
    }

    if (topPicks.length > 1) {
      highlights += ` I've also laid out ***${topPicks[1].canonicalTitle}***`;
      if (topPicks[2]) {
        highlights += ` and ***${topPicks[2].canonicalTitle}***`;
      }
      highlights += ` below if your hunger isn't satisfied yet~`;
    }

    replyText = `${intro}${highlights}\n\nWant to tease this search a bit more, darling? Tap any of the juicy tag filters below, or whisper what else you crave... (ฅ^•ﻌ•^ฅ)♡`;

    return {
      id: `nyan-${Date.now()}`,
      sender: 'nyan_chan',
      text: replyText,
      timestamp: new Date().toISOString(),
      structuredQuery: query,
      recommendedItems: topPicks,
      allResults: results.items,
      totalFound: results.total || results.items.length,
      suggestedTags: suggestedTags.slice(0, 4),
      expression
    };
  }

  private deriveSuggestedTags(query: StructuredSearchQuery, items: CatalogueItem[]): string[] {
    const suggestedTags: string[] = [];
    if (items.length > 0) {
      const currentTagIds = new Set(query.include_tags);
      for (const item of items) {
        for (const t of item.tags) {
          if (!currentTagIds.has(t.id) && !suggestedTags.includes(t.normalizedName)) {
            suggestedTags.push(t.normalizedName);
            if (suggestedTags.length >= 4) break;
          }
        }
        if (suggestedTags.length >= 4) break;
      }
    }

    if (suggestedTags.length < 4) {
      const fallbacks = ['wholesome', 'fantasy', 'kemonomimi', 'romance', 'maid', 'elf'];
      for (const f of fallbacks) {
        if (!suggestedTags.includes(f)) suggestedTags.push(f);
        if (suggestedTags.length >= 4) break;
      }
    }

    return suggestedTags;
  }
}

export const nyanChanAssistant = new NyanChanAssistantService();
