import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Check, LogOut, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { downloadBackup } from '../utils/backup';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [backupState, setBackupState] = useState('idle'); // idle | working | done | error

  const showPhoto = user?.photoURL && !imgError;

  const handleBackup = async () => {
    if (backupState === 'working') return;
    setBackupState('working');
    try {
      const backup = await downloadBackup(user.uid);
      if (backup.categoryCount === 0) {
        setBackupState('idle');
        alert('Nothing to back up yet — add some categories first.');
        return;
      }
      setBackupState('done');
      setTimeout(() => setBackupState('idle'), 2500);
    } catch (err) {
      console.error('Backup failed', err);
      setBackupState('error');
      alert('Sorry, the backup could not be created. Please try again.');
      setTimeout(() => setBackupState('idle'), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-brand-600">
          <span className="text-xl flex-shrink-0">🏅</span>
          <span className="font-display font-bold text-xl tracking-tight">Like it or Not</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackup}
            disabled={backupState === 'working'}
            className={`transition ${backupState === 'done' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
            title="Download a backup of your data"
          >
            {backupState === 'working' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : backupState === 'done' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
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
