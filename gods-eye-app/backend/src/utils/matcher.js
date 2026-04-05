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

// Levenshtein distance for string similarity (handles typos)
const levenshteinSimilarity = (a, b) => {
  const str1 = (a || '').toLowerCase();
  const str2 = (b || '').toLowerCase();
  const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  
  const distance = track[str2.length][str1.length];
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
};

const normalizeLocation = (location) => (location || '').toLowerCase().trim();

const withinDays = (a, b, maxDays = 14) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff / oneDay <= maxDays;
};

const daysApart = (a, b) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return Math.floor(diff / oneDay);
};

// Calculate geographic proximity score (basic implementation)
const locationProximityScore = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  const norm1 = normalizeLocation(loc1);
  const norm2 = normalizeLocation(loc2);
  
  // Exact match
  if (norm1 === norm2) return 1;
  // Partial match
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.7;
  // Word overlap
  const words1 = new Set(norm1.split(/[\s,]+/));
  const words2 = new Set(norm2.split(/[\s,]+/));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  if (intersection > 0) return Math.min(0.5, intersection / Math.max(words1.size, words2.size));
  
  return 0;
};

const scoreMatch = (lost, found) => {
  let score = 0;
  let details = {};

  // Item name matching (improved with Levenshtein)
  const nameJaccardScore = jaccardSimilarity(lost.item_name, found.item_name);
  const nameLevenScore = levenshteinSimilarity(lost.item_name, found.item_name);
  const nameScore = Math.max(nameJaccardScore, nameLevenScore);
  details.nameScore = Math.round(nameScore * 100);
  
  if (nameScore > 0.2) {
    score += Math.round(40 * Math.min(nameScore, 1));
  }

  // Category match (priority score)
  if (lost.category === found.category) {
    score += 30;
    details.categoryMatch = true;
  } else {
    details.categoryMatch = false;
  }

  // Location proximity
  const locProximity = locationProximityScore(lost.location_lost, found.location_found);
  details.locationScore = Math.round(locProximity * 100);
  if (locProximity > 0) {
    score += Math.round(25 * locProximity);
  }

  // Date proximity
  const daysDiff = daysApart(lost.date_lost, found.date_found);
  details.daysDifference = daysDiff;
  
  if (withinDays(lost.date_lost, found.date_found, 14)) {
    const dateScore = Math.max(0, 1 - daysDiff / 14);
    score += Math.round(15 * dateScore);
    details.dateMatch = true;
  } else {
    details.dateMatch = false;
  }

  // Description similarity bonus for strong matches
  const descScore = jaccardSimilarity(lost.description, found.description);
  details.descriptionScore = Math.round(descScore * 100);
  if (descScore > 0.3) {
    score += Math.round(10 * Math.min(descScore, 0.5));
  }

  return { score: Math.min(100, Math.round(score)), details };
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
