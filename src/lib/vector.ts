// Deterministic high-dimensional concept vector engine for semantic similarity

export interface VectorEmbedding {
  values: number[];
  dimensions: number;
}

// 48 semantic anchor concepts spanning genres, tropes, tones, and character attributes
export const SEMANTIC_ANCHORS = [
  'romance', 'love', 'affection', 'wholesome', 'vanilla', 'sweet', 'gentle',
  'fantasy', 'magic', 'elf', 'sorcery', 'academy', 'shrine', 'folklore', 'youkai',
  'scifi', 'cyberpunk', 'android', 'cyborg', 'space', 'futuristic', 'technology',
  'comedy', 'humor', 'playful', 'flustered', 'misunderstanding', 'cheerful',
  'drama', 'emotional', 'melancholic', 'longing', 'gothic', 'vampire', 'dark',
  'office', 'workplace', 'cubicle', 'corporate', 'adult', 'professional',
  'kemonomimi', 'catgirl', 'fox', 'maid', 'knight', 'steampunk', 'summer', 'winter'
];

/**
 * Computes a normalized vector embedding for any text based on semantic anchors and token overlap.
 * Provides deterministic semantic embeddings without external API keys in demo mode,
 * with vector space compatibility for cosine similarity.
 */
export function generateEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = new Set(normalized.split(/\s+/).filter(w => w.length > 2));
  
  const rawVector = SEMANTIC_ANCHORS.map(anchor => {
    let score = 0;
    if (words.has(anchor)) score += 3.0;
    
    // Substring / root matching
    for (const w of words) {
      if (w.includes(anchor) || anchor.includes(w)) {
        score += 1.5;
      }
    }
    
    // Semantic clustering affinities
    if (anchor === 'romance' && (words.has('confession') || words.has('intimate') || words.has('devotion'))) score += 2.0;
    if (anchor === 'wholesome' && (words.has('cozy') || words.has('warmth') || words.has('gentle') || words.has('tender'))) score += 2.0;
    if (anchor === 'fantasy' && (words.has('citadel') || words.has('priestess') || words.has('spell') || words.has('ancient'))) score += 2.0;
    if (anchor === 'scifi' && (words.has('cyber') || words.has('orbit') || words.has('telemetry') || words.has('satellite'))) score += 2.0;
    if (anchor === 'kemonomimi' && (words.has('ears') || words.has('tail') || words.has('paws') || words.has('neko'))) score += 2.5;
    if (anchor === 'gothic' && (words.has('mansion') || words.has('crimson') || words.has('curse') || words.has('shadow'))) score += 2.0;
    
    return score;
  });

  // Calculate L2 norm for unit vector
  const norm = Math.sqrt(rawVector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) {
    // Return balanced uniform vector if empty
    const uniform = 1 / Math.sqrt(SEMANTIC_ANCHORS.length);
    return SEMANTIC_ANCHORS.map(() => uniform);
  }

  return rawVector.map(val => val / norm);
}

/**
 * Calculates cosine similarity between two unit vectors: dot product
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}
