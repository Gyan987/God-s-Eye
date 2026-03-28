import { useEffect, useState } from 'react';
import client from '../api/client';

const AdminPage = () => {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [sumRes, usersRes] = await Promise.all([client.get('/admin/dashboard'), client.get('/admin/users')]);
    setSummary(sumRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const banUser = async (userId) => {
    await client.put(`/admin/ban-user/${userId}`);
    setMessage('User banned');
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass rounded-2xl p-4"><p className="text-sm opacity-70">Users</p><p className="text-2xl font-bold">{summary.users}</p></div>
          <div className="glass rounded-2xl p-4"><p className="text-sm opacity-70">Lost Posts</p><p className="text-2xl font-bold">{summary.lostItems}</p></div>
          <div className="glass rounded-2xl p-4"><p className="text-sm opacity-70">Found Posts</p><p className="text-2xl font-bold">{summary.foundItems}</p></div>
          <div className="glass rounded-2xl p-4"><p className="text-sm opacity-70">Flagged</p><p className="text-2xl font-bold">{summary.flagged}</p></div>
        </div>
      )}

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 text-xl font-bold">Users</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between rounded-xl border border-slate-300/30 p-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm opacity-70">{user.email} {user.banned ? '(banned)' : ''}</p>
              </div>
              {!user.banned && (
                <button className="rounded-lg border border-red-500 px-3 py-2 text-sm font-semibold text-red-600" type="button" onClick={() => banUser(user._id)}>
                  Ban User
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {message && <p className="text-sm font-semibold">{message}</p>}
    </div>
  );
};

export default AdminPage;
