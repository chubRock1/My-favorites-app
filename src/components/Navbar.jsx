import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Upload, Check, LogOut, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { downloadBackup, restoreFromFile, validateBackup } from '../utils/backup';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [backupState, setBackupState] = useState('idle'); // idle | working | done | error
  const [restoreState, setRestoreState] = useState('idle');
  const fileInputRef = useRef(null);

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

  const handleRestoreClick = () => {
    if (restoreState === 'working') return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setRestoreState('working');
    try {
      // Peek at the file first so we can show a meaningful confirmation.
      const parsed = JSON.parse(await file.text());
      validateBackup(parsed);
      const catCount = parsed.categoryCount ?? parsed.categories.length;
      const itemCount = parsed.itemCount ?? '';
      const when = parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString() : 'unknown date';

      const ok = window.confirm(
        `Restore from backup (${when})?\n\n` +
        `${catCount} categories${itemCount !== '' ? ` and ${itemCount} items` : ''} will be added to your account.\n\n` +
        `Categories you already have (matched by name) are skipped, and nothing existing is deleted.`
      );
      if (!ok) {
        setRestoreState('idle');
        return;
      }

      const { categoriesAdded, itemsAdded, categoriesSkipped } = await restoreFromFile(user.uid, file);
      setRestoreState('done');
      setTimeout(() => setRestoreState('idle'), 2500);
      alert(
        `Restore complete.\n\n` +
        `Added ${categoriesAdded} categor${categoriesAdded === 1 ? 'y' : 'ies'} and ${itemsAdded} item${itemsAdded === 1 ? '' : 's'}.` +
        (categoriesSkipped > 0 ? `\nSkipped ${categoriesSkipped} category(ies) you already had.` : '')
      );
    } catch (err) {
      console.error('Restore failed', err);
      setRestoreState('error');
      alert(err?.message || 'Sorry, that backup could not be restored.');
      setTimeout(() => setRestoreState('idle'), 2500);
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
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleRestoreClick}
            disabled={restoreState === 'working'}
            className={`transition ${restoreState === 'done' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
            title="Restore from a backup file"
          >
            {restoreState === 'working' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : restoreState === 'done' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>
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
