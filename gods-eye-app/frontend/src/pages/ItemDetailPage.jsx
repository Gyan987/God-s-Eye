import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import client from '../api/client';

const ItemDetailPage = () => {
  const { id } = useParams();
  const [query] = useSearchParams();
  const type = query.get('type') || 'lost';

  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await client.get(`/items/${id}`);
      setItem(data);
    };
    load();
  }, [id]);

  const claim = async () => {
    try {
      await client.put('/mark-returned', { id, type });
      setMsg('Item marked as returned.');
      setItem((s) => ({ ...s, status: 'returned' }));
    } catch (error) {
      setMsg(error.response?.data?.message || 'Login required to claim this item.');
    }
  };

  const reportFake = async () => {
    try {
      await client.post('/report-fake', { id, type });
      setMsg('Thanks. Listing was reported for admin review.');
    } catch (error) {
      setMsg(error.response?.data?.message || 'Could not report item.');
    }
  };

  if (!item) return <div>Loading item...</div>;

  const location = item.location_lost || item.location_found;
  const date = item.date_lost || item.date_found;
  const email = item.contact_email || item.finder_contact_email || 'Not provided';
  const phone = item.contact_phone || item.finder_phone || 'Not provided';

  return (
    <div className="glass grid gap-6 rounded-3xl p-5 md:grid-cols-2 md:p-8">
      <img
        src={item.image || 'https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&w=1200&q=80'}
        alt={item.item_name}
        className="h-full min-h-72 w-full rounded-2xl object-cover"
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold">{item.item_name}</h1>
        <p className="opacity-85">{item.description}</p>
        <p>
          <strong>Location:</strong> {location}
        </p>
        <p>
          <strong>Date:</strong> {new Date(date).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> {item.status}
        </p>
        <p>
          <strong>Contact Email:</strong> {email}
        </p>
        <p>
          <strong>Contact Phone:</strong> {phone}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`mailto:${email}`} className="rounded-xl bg-ocean px-4 py-3 font-bold text-white">
            Contact Finder
          </a>
          <button type="button" onClick={claim} className="rounded-xl bg-amber-400 px-4 py-3 font-bold text-slate-900">
            Claim This Item
          </button>
          <button type="button" onClick={reportFake} className="rounded-xl border border-red-500 px-4 py-3 font-semibold text-red-600">
            Report Fake Listing
          </button>
        </div>

        {msg && <p className="pt-2 text-sm font-semibold">{msg}</p>}

        <div className="rounded-xl border border-slate-300/40 bg-white/40 p-4 text-sm dark:bg-slate-800/40">
          Map Placeholder: integrate Google Maps with saved coordinates for advanced location verification.
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
