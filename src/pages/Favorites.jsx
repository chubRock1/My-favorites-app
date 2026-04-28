import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Favorites() {
  const { user } = useAuth();
  const { categories, loading, updateCategory } = useCategories(user.uid);
  const favorites = categories.filter((c) => c.favorite);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-32">
        <div className="pt-6 pb-4">
          <h2 className="text-2xl font-extrabold text-gray-900">Favorites</h2>
          <p className="text-gray-500 mt-1 text-sm">Your starred categories</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No favorites yet</p>
            <p className="text-gray-400 text-sm mt-1">Tap the ★ next to any category to pin it here</p>
          </motion.div>
        ) : (
          <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
            {favorites.map((cat) => (
              <motion.li key={cat.id} variants={item}>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/category/${cat.id}`}
                    className="flex-1 flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </Link>
                  <button
                    onClick={() => updateCategory(cat.id, { favorite: false })}
                    className="p-2 flex-shrink-0"
                  >
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 transition-colors hover:text-yellow-300" />
                  </button>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </main>
      <BottomNav />
    </>
  );
}
