import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import AddCategoryModal from '../components/AddCategoryModal';
import TopPicks from '../components/TopPicks';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const SUGGESTIONS = [
  { emoji: '🍎', name: 'Apples' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🧀', name: 'Cheese' },
  { emoji: '☕', name: 'Coffee' },
  { emoji: '🍫', name: 'Chocolate' },
  { emoji: '🍷', name: 'Wine' },
  { emoji: '📚', name: 'Books' },
  { emoji: '🎬', name: 'Movies' },
  { emoji: '🎵', name: 'Albums' },
  { emoji: '✈️', name: 'Travel Spots' },
  { emoji: '🏔️', name: 'Hikes' },
  { emoji: '🍝', name: 'Pasta' },
  { emoji: '🍺', name: 'Beers' },
  { emoji: '🌮', name: 'Tacos' },
  { emoji: '🎮', name: 'Games' },
  { emoji: '🍣', name: 'Sushi' },
  { emoji: '🧁', name: 'Bakeries' },
  { emoji: '🐶', name: 'Dog Breeds' },
  { emoji: '👟', name: 'Sneakers' },
  { emoji: '🌿', name: 'Houseplants' },
];

export default function Home() {
  const { user } = useAuth();
  const { categories, loading, addCategory } = useCategories(user.uid);
  const [showModal, setShowModal] = useState(false);

  const existingNames = new Set(categories.map((c) => c.name.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((s) => !existingNames.has(s.name.toLowerCase()));

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pb-32">

        {/* Hero banner */}
        <div className="mt-4 mb-5 rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-purple-700 px-5 py-3.5 text-white shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Welcome back</p>
            <h2 className="text-lg font-extrabold leading-tight">
              {user.displayName ? user.displayName.split(' ')[0] : 'Hey'}! 👋
            </h2>
          </div>
          <p className="text-xs text-white/60 text-right">
            {categories.length === 0
              ? 'No categories yet'
              : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>

        {/* Top picks strip */}
        {!loading && categories.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Your top picks</h3>
            <TopPicks userId={user.uid} categories={categories} />
          </>
        )}

        {/* Categories */}
        {!loading && categories.length > 0 && (
          <>
            <div className="flex items-center justify-between mt-8 mb-4">
              <h3 className="text-lg font-bold text-gray-900">All categories</h3>
              <span className="text-sm text-gray-400">{categories.length} total</span>
            </div>
            <motion.ul variants={container} initial="hidden" animate="show" className="space-y-3">
              {categories.map((cat) => (
                <motion.li key={cat.id} variants={item}>
                  <Link
                    to={`/category/${cat.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <span className="text-3xl">{cat.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{cat.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </>
        )}

        {loading && (
          <div className="space-y-3 mt-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Suggestions */}
        {!loading && suggestions.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <h3 className="text-lg font-bold text-gray-900">
                {categories.length === 0 ? 'Get inspired' : 'Ideas for you'}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {suggestions.slice(0, 8).map((s, idx) => (
                <motion.button
                  key={s.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => addCategory(s.name, s.emoji)}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:bg-brand-50 transition group text-left"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-700 group-hover:text-brand-600 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">Tap to add</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNav />

      <AddCategoryModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addCategory}
      />
    </>
  );
}
