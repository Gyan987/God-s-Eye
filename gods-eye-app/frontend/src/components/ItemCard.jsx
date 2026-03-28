import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ItemCard = ({ item, type = 'lost' }) => {
  const location = item.location_lost || item.location_found;
  const date = item.date_lost || item.date_found;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-4 shadow-glass"
    >
      <img
        src={item.image || 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80'}
        alt={item.item_name}
        className="h-44 w-full rounded-xl object-cover"
      />
      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-bold">{item.item_name}</h3>
        <p className="text-sm opacity-80">{location}</p>
        <p className="text-sm opacity-70">{new Date(date).toLocaleDateString()}</p>
        <span className="inline-block rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-slate-900">
          {item.status}
        </span>
      </div>
      <Link to={`/items/${item._id}?type=${type}`} className="mt-4 inline-block text-sm font-bold text-ocean dark:text-amber-300">
        View Details
      </Link>
    </motion.article>
  );
};

export default ItemCard;
