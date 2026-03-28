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

const normalizeLocation = (location) => (location || '').toLowerCase().trim();

const withinDays = (a, b, maxDays = 14) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return diff / oneDay <= maxDays;
};

const scoreMatch = (lost, found) => {
  let score = 0;

  const nameScore = jaccardSimilarity(lost.item_name, found.item_name);
  if (nameScore > 0.2) score += 40 * nameScore;

  if (lost.category === found.category) score += 25;

  const lostLocation = normalizeLocation(lost.location_lost);
  const foundLocation = normalizeLocation(found.location_found);
  if (lostLocation && foundLocation && (lostLocation.includes(foundLocation) || foundLocation.includes(lostLocation))) {
    score += 20;
  }

  if (withinDays(lost.date_lost, found.date_found)) score += 15;

  return Math.round(score);
};

const getPossibleMatches = (lostItem, foundItems, threshold = 45) => {
  const scored = foundItems
    .map((found) => ({ found, score: scoreMatch(lostItem, found) }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored;
};

module.exports = { scoreMatch, getPossibleMatches };
