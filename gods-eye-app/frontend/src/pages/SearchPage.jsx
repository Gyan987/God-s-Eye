import { useEffect, useState } from 'react';
import client from '../api/client';
import ItemCard from '../components/ItemCard';

const SearchPage = () => {
  const [filters, setFilters] = useState({ item_name: '', category: '', location: '', date: '' });
  const [results, setResults] = useState({ lostItems: [], foundItems: [] });

  const runSearch = async () => {
    const { data } = await client.get('/search', { params: filters });
    setResults(data);
  };

  useEffect(() => {
    runSearch();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="glass h-fit rounded-2xl p-4">
        <h2 className="mb-4 text-lg font-bold">Filters</h2>
        <div className="space-y-3">
          <input
            placeholder="Item name"
            value={filters.item_name}
            onChange={(e) => setFilters((s) => ({ ...s, item_name: e.target.value }))}
          />
          <select value={filters.category} onChange={(e) => setFilters((s) => ({ ...s, category: e.target.value }))}>
            <option value="">All categories</option>
            <option value="phone">Phone</option>
            <option value="wallet">Wallet</option>
            <option value="bag">Bag</option>
            <option value="documents">Documents</option>
            <option value="keys">Keys</option>
            <option value="pets">Pets</option>
            <option value="other">Other</option>
          </select>
          <input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters((s) => ({ ...s, location: e.target.value }))}
          />
          <input type="date" value={filters.date} onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))} />
          <button type="button" onClick={runSearch} className="w-full rounded-xl bg-ocean px-4 py-3 font-bold text-white">
            Search
          </button>
        </div>
      </aside>

      <section className="space-y-8">
        <div>
          <h3 className="mb-3 text-xl font-bold">Lost Items</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.lostItems.map((item) => (
              <ItemCard key={item._id} item={item} type="lost" />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xl font-bold">Found Items</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.foundItems.map((item) => (
              <ItemCard key={item._id} item={item} type="found" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchPage;
