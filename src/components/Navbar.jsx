import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);

  const showPhoto = user?.photoURL && !imgError;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-brand-600">
          <span className="text-xl flex-shrink-0">🏅</span>
          <span className="font-display font-bold text-xl tracking-tight">My Favorite Things</span>
        </Link>
        <div className="flex items-center gap-3">
          {showPhoto ? (
            <img
              src={user.photoURL}
              alt=""
              onError={() => setImgError(true)}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-600" />
            </div>
          )}
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
