import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import ItemCard from '../components/ItemCard';

const HomePage = () => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [lostRes, foundRes] = await Promise.all([client.get('/lost-items'), client.get('/found-items')]);
      setLostItems(lostRes.data.slice(0, 6));
      setFoundItems(foundRes.data.slice(0, 6));
    };
    load();
  }, []);

  return (
    <div className="space-y-12">
      <section className="glass relative overflow-hidden rounded-3xl px-6 py-12 md:px-10">
        <div className="absolute -right-10 -top-10 h-44 w-44 animate-float rounded-full bg-amber-300/40 blur-2xl" />
        <div className="absolute -bottom-12 left-8 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl">
          <h1 className="brand text-4xl font-extrabold leading-tight md:text-6xl">GOD'S EYE - Lost & Found Network</h1>
          <p className="mt-3 text-lg opacity-85">Watching over what you've lost.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-ocean px-5 py-3 font-bold text-white" to="/report-lost">
              Report Lost Item
            </Link>
            <Link className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-900" to="/report-found">
              Report Found Item
            </Link>
            <Link className="rounded-xl border border-slate-300/40 px-5 py-3 font-bold" to="/search">
              Search Items
            </Link>
          </div>
        </motion.div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Recent Lost Items</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lostItems.map((item) => (
            <ItemCard key={item._id} item={item} type="lost" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Recent Found Items</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {foundItems.map((item) => (
            <ItemCard key={item._id} item={item} type="found" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
