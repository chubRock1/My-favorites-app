import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase';

export default function SharedList() {
  const { shareId, categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const shareSnap = await getDoc(doc(db, 'shares', shareId));
        if (!shareSnap.exists()) { setError('This link is invalid or has expired.'); setLoading(false); return; }
        const { userId } = shareSnap.data();

        const [catSnap, itemsSnap] = await Promise.all([
          getDoc(doc(db, 'users', userId, 'categories', categoryId)),
          getDocs(query(
            collection(db, 'users', userId, 'categories', categoryId, 'items'),
            orderBy('rank', 'asc')
          )),
        ]);

        if (!catSnap.exists()) { setError('Category not found.'); setLoading(false); return; }
        setCategory({ id: catSnap.id, ...catSnap.data() });
        setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {
        setError('Something went wrong loading this list.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareId, categoryId]);

  const medalColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 to-violet-600 pt-12 pb-8 px-4 text-center text-white">
        <p className="text-5xl mb-3">{category.emoji}</p>
        <h1 className="text-2xl font-extrabold">{category.name}</h1>
        <p className="text-white/60 text-sm mt-1">Shared favorites list</p>
      </div>

      <main className="max-w-md mx-auto px-4 pt-6 pb-12 space-y-2">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm"
          >
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${item.rank <= 3 ? medalColors[item.rank - 1] : 'bg-gray-200 !text-gray-500'}`}>
              {item.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              {item.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{item.notes}</p>}
            </div>
          </motion.div>
        ))}
      </main>

      <div className="text-center py-6">
        <a href="/" className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:underline">
          <Star className="w-4 h-4 fill-brand-600" />
          Make your own My Favorites
        </a>
      </div>
    </div>
  );
}
