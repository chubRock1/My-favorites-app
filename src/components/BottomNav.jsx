import { Link, useLocation } from 'react-router-dom';
import { Home, Star } from 'lucide-react';

export default function BottomNav() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur border-t border-gray-100 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${isHome ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home className={`w-5 h-5 ${isHome ? 'fill-brand-100' : ''}`} />
          Home
        </Link>
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Star className="w-5 h-5" />
          Favorites
        </Link>
      </div>
    </nav>
  );
}
