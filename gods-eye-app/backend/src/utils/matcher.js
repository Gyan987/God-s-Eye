/**
 * Split text into normalized words (lowercased, alphanum only)
 * @param {string} text
 * @returns {string[]}
 */
const toWords = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const jaccardSimilarity = (a, b) => {
  const setA = new Set(toWords(a));
  const setB = new Set(toWords(b));
  if (!setA.size || !setB.size) return 0;
  const intersection = [...setA].filter((word) => setB.has(word)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
};

/**
 * Levenshtein similarity normalized to [0,1]. Optimized to O(min(m,n)) memory.
 * Returns 1 for identical strings and 0 for completely different.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
const levenshteinSimilarity = (a, b) => {
  const s = (a || '').toLowerCase();
  const t = (b || '').toLowerCase();
  const m = s.length;
  const n = t.length;
  if (m === 0 && n === 0) return 1;
  if (m === 0 || n === 0) return 0;

  // ensure n <= m to use less memory
  if (n > m) return levenshteinSimilarity(b, a);

  let prev = Array(n + 1).fill(0).map((_, i) => i);
  let cur = Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    const si = s[i - 1];
    for (let j = 1; j <= n; j++) {
      const cost = si === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }

  const distance = prev[n];
  const maxLen = Math.max(m, n);
  return Math.max(0, 1 - distance / maxLen);
};

const normalizeLocation = (location) => (location || '').toLowerCase().trim();

const withinDays = (a, b, maxDays = 14) => {
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(da.getTime() - db.getTime());
  return diff / oneDay <= maxDays;
};

const daysApart = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return Infinity;
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(da.getTime() - db.getTime());
  return Math.floor(diff / oneDay);
};

// Calculate geographic proximity score (basic implementation)
/**
 * Compute a simple location proximity score in [0,1].
 * Works on free-form strings like "Building A, Library".
 */
const locationProximityScore = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  const norm1 = normalizeLocation(loc1);
  const norm2 = normalizeLocation(loc2);

  if (!norm1 || !norm2) return 0;
  // Exact match
  if (norm1 === norm2) return 1;
  // Partial inclusive match (e.g. "library" in "main library")
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.75;
  // Word overlap
  const words1 = new Set(norm1.split(/[\s,]+/).filter(Boolean));
  const words2 = new Set(norm2.split(/[\s,]+/).filter(Boolean));
  const intersection = [...words1].filter((w) => words2.has(w)).length;
  if (intersection > 0) return Math.min(0.5, intersection / Math.max(words1.size, words2.size));

  return 0;
};

const scoreMatch = (lost, found) => {
  let score = 0;
  const details = {};

  // Item name matching (use best of token overlap and edit-distance)
  const nameJaccardScore = jaccardSimilarity(lost.item_name, found.item_name);
  const nameLevenScore = levenshteinSimilarity(lost.item_name, found.item_name);
  const nameScore = Math.max(nameJaccardScore, nameLevenScore);
  details.nameScore = Math.round(nameScore * 100);
  if (nameScore > 0.15) {
    score += Math.round(40 * Math.min(nameScore, 1));
  }

  // Category match (weighted)
  if (lost.category && found.category && lost.category === found.category) {
    score += 25;
    details.categoryMatch = true;
  } else {
    details.categoryMatch = false;
  }

  // Location proximity
  const locProximity = locationProximityScore(lost.location_lost, found.location_found);
  details.locationScore = Math.round(locProximity * 100);
  if (locProximity > 0) score += Math.round(20 * locProximity);

  // Date proximity
  const daysDiff = daysApart(lost.date_lost, found.date_found);
  details.daysDifference = Number.isFinite(daysDiff) ? daysDiff : null;
  if (withinDays(lost.date_lost, found.date_found, 14)) {
    const dateScore = Math.max(0, 1 - daysDiff / 14);
    score += Math.round(10 * dateScore);
    details.dateMatch = true;
  } else {
    details.dateMatch = false;
  }

  // Description similarity bonus (smaller weight)
  const descScore = jaccardSimilarity(lost.description, found.description);
  details.descriptionScore = Math.round(descScore * 100);
  if (descScore > 0.25) score += Math.round(5 * Math.min(descScore, 0.8));

  // Final clamp and rounding
  const final = Math.min(100, Math.max(0, Math.round(score)));
  return { score: final, details };
};

const getPossibleMatches = (lostItem, foundItems, threshold = 40) => {
  const scored = foundItems
    .map((found) => {
      const result = scoreMatch(lostItem, found);
      return { 
        found, 
        score: result.score,
        matchDetails: result.details
      };
    })
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return scored;
};

const calculateMatchQuality = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'very-good';
  if (score >= 45) return 'good';
  if (score >= 30) return 'moderate';
  return 'low';
};

module.exports = { 
  scoreMatch, 
  getPossibleMatches,
  calculateMatchQuality,
  levenshteinSimilarity,
  jaccardSimilarity,
  locationProximityScore
};
