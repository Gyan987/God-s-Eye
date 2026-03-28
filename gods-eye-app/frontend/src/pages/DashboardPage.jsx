import { useEffect, useState } from 'react';
import client from '../api/client';
import ItemCard from '../components/ItemCard';

const DashboardPage = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [postsRes, notiRes] = await Promise.all([client.get('/my-posts'), client.get('/notifications')]);
    setLostItems(postsRes.data.lostItems);
    setFoundItems(postsRes.data.foundItems);
    setNotifications(notiRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id, type) => {
    await client.delete('/delete-item', { data: { id, type } });
    setMessage('Item deleted');
    load();
  };

  const markReturned = async (id, type) => {
    await client.put('/mark-returned', { id, type });
    setMessage('Item marked as returned');
    load();
  };

  return (
    <div className="space-y-8">
      <section className="glass rounded-2xl p-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <div className="mt-3 space-y-2">
          {notifications.length === 0 && <p className="text-sm opacity-80">No notifications yet.</p>}
          {notifications.map((n) => (
            <div key={n._id} className="rounded-xl border border-slate-300/30 p-3">
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm opacity-80">{n.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">My Lost Posts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lostItems.map((item) => (
            <div key={item._id} className="space-y-2">
              <ItemCard item={item} type="lost" />
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900" onClick={() => markReturned(item._id, 'lost')} type="button">
                  Mark Returned
                </button>
                <button className="flex-1 rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600" onClick={() => remove(item._id, 'lost')} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">My Found Posts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foundItems.map((item) => (
            <div key={item._id} className="space-y-2">
              <ItemCard item={item} type="found" />
              <div className="flex gap-2">
                <button className="flex-1 rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900" onClick={() => markReturned(item._id, 'found')} type="button">
                  Mark Returned
                </button>
                <button className="flex-1 rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600" onClick={() => remove(item._id, 'found')} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {message && <p className="text-sm font-semibold">{message}</p>}
    </div>
  );
};

export default DashboardPage;
