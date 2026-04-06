const { getPossibleMatches, calculateMatchQuality } = require('../matcher');

describe('matcher utility', () => {
  test('finds a clear match among found items', () => {
    const lost = {
      item_name: 'Black iPhone 11',
      category: 'electronics',
      location_lost: 'Main Library, 2nd floor',
      date_lost: '2026-04-01',
      description: 'Black iPhone with cracked top corner and red case'
    };

    const foundItems = [
      {
        item_name: 'iPhone 11 black',
        category: 'electronics',
        location_found: 'Main Library',
        date_found: '2026-04-02',
        description: 'Found black iphone with red case near stairs'
      },
      {
        item_name: 'Wallet',
        category: 'accessories',
        location_found: 'Cafeteria',
        date_found: '2026-03-20',
        description: 'Brown leather wallet'
      }
    ];

    const matches = getPossibleMatches(lost, foundItems, 30);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    const top = matches[0];
    expect(top.found.category).toBe('electronics');
    expect(top.score).toBeGreaterThanOrEqual(30);
    const quality = calculateMatchQuality(top.score);
    expect(['excellent','very-good','good','moderate','low']).toContain(quality);
  });
});
