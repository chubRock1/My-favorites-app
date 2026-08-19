import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

// Firestore Timestamps aren't JSON-serializable — turn them into ISO strings
// (and leave anything else untouched) so the backup is portable and readable.
function serialize(value) {
  if (value && typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch {
      return null;
    }
  }
  return value === undefined ? null : value;
}

function serializeDoc(data) {
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    out[key] = serialize(val);
  }
  return out;
}

// Reads every category and its items for the user and returns a plain,
// JSON-serializable snapshot of their data.
export async function buildBackup(userId) {
  const catSnap = await getDocs(
    query(collection(db, 'users', userId, 'categories'), orderBy('createdAt', 'asc'))
  );

  const categories = [];
  let itemCount = 0;

  for (const catDoc of catSnap.docs) {
    const itemSnap = await getDocs(
      query(
        collection(db, 'users', userId, 'categories', catDoc.id, 'items'),
        orderBy('rank', 'asc')
      )
    );
    const items = itemSnap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    itemCount += items.length;
    categories.push({ id: catDoc.id, ...serializeDoc(catDoc.data()), items });
  }

  return {
    app: 'Like it or Not',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    categoryCount: categories.length,
    itemCount,
    categories,
  };
}

// Builds the backup and triggers a file download in the browser. Works on
// mobile browsers, which save the file to the device's Downloads.
export async function downloadBackup(userId) {
  const backup = await buildBackup(userId);
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const a = document.createElement('a');
  a.href = url;
  a.download = `like-it-or-not-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return backup;
}
