import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
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

// Turns an ISO string (as written by the export) back into a Firestore
// Timestamp so restored data keeps its original dates. Falls back to the
// server clock if the value is missing or unparseable.
function toTimestamp(iso) {
  if (typeof iso === 'string') {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
  }
  return serverTimestamp();
}

// Validates the shape of a parsed backup file. Throws a friendly error if it
// doesn't look like one of ours.
export function validateBackup(parsed) {
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.categories)) {
    throw new Error("This doesn't look like a Like it or Not backup file.");
  }
  return parsed;
}

// Restores a parsed backup into the user's account. Non-destructive: it never
// deletes existing data, and skips any category whose name already exists
// (case-insensitive) so re-importing the same file won't create duplicates.
export async function restoreBackup(userId, parsed) {
  validateBackup(parsed);

  // Existing category names, to skip duplicates.
  const existingSnap = await getDocs(collection(db, 'users', userId, 'categories'));
  const existingNames = new Set(
    existingSnap.docs.map((d) => (d.data().name || '').trim().toLowerCase())
  );

  let categoriesAdded = 0;
  let categoriesSkipped = 0;
  let itemsAdded = 0;

  for (const cat of parsed.categories) {
    const name = (cat?.name || '').trim();
    if (!name) continue;
    if (existingNames.has(name.toLowerCase())) {
      categoriesSkipped += 1;
      continue;
    }

    const catRef = await addDoc(collection(db, 'users', userId, 'categories'), {
      name,
      emoji: cat.emoji || '⭐',
      favorite: !!cat.favorite,
      createdAt: toTimestamp(cat.createdAt),
    });
    existingNames.add(name.toLowerCase());
    categoriesAdded += 1;

    const items = Array.isArray(cat.items) ? cat.items : [];
    if (items.length === 0) continue;

    // Firestore batches cap at 500 writes — chunk to stay under the limit.
    for (let i = 0; i < items.length; i += 400) {
      const batch = writeBatch(db);
      for (const it of items.slice(i, i + 400)) {
        if (!it || !it.name) continue;
        const itemRef = doc(
          collection(db, 'users', userId, 'categories', catRef.id, 'items')
        );
        batch.set(itemRef, {
          name: it.name,
          notes: it.notes || '',
          photoUrl: it.photoUrl ?? null,
          disliked: !!it.disliked,
          rank: typeof it.rank === 'number' ? it.rank : 0,
          createdAt: toTimestamp(it.createdAt),
        });
        itemsAdded += 1;
      }
      await batch.commit();
    }
  }

  return { categoriesAdded, categoriesSkipped, itemsAdded };
}

// Reads a File (from an <input type="file">), parses it as JSON, and restores
// it. Returns the restore summary.
export async function restoreFromFile(userId, file) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON — pick a backup file you downloaded from this app.");
  }
  return restoreBackup(userId, parsed);
}
