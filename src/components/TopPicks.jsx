import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-brand-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-sky-600',
];

export default function TopPicks({ userId, categories }) {
  const [topItems, setTopItems] = useState({});

  useEffect(() => {
    const fetchTops = async () => {
      const results = {};
      await Promise.all(
        categories.map(async (cat) => {
          const q = query(
            collection(db, 'users', userId, 'categories', cat.id, 'items'),
            orderBy('rank', 'asc'),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) results[cat.id] = snap.docs[0].data().name;
        })
      );
      setTopItems(results);
    };
    if (categories.length) fetchTops();
  }, [categories, userId]);

  const catsWithTop = categories.filter((c) => topItems[c.id]);
  if (!catsWithTop.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {catsWithTop.map((cat, idx) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Link
            to={`/category/${cat.id}`}
            className={`flex-shrink-0 w-40 h-28 rounded-2xl bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} p-4 flex flex-col justify-between text-white shadow-md active:scale-95 transition-transform`}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">{cat.name}</p>
              <p className="font-bold text-sm leading-snug mt-0.5 truncate">{topItems[cat.id]}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
