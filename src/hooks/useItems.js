import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useItems(userId, categoryId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !categoryId) return;
    const q = query(
      collection(db, 'users', userId, 'categories', categoryId, 'items'),
      orderBy('rank', 'asc')
    );
    const unsub = onSnapshot(q, async (snap) => {
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(loaded);
      setLoading(false);

      // Auto-fix ranks if liked items aren't sequential from 1
      const liked = loaded.filter((i) => !i.disliked);
      const needsFix = liked.some((item, idx) => item.rank !== idx + 1);
      if (needsFix && liked.length > 0) {
        const batch = writeBatch(db);
        liked.forEach((item, idx) => {
          batch.update(
            doc(db, 'users', userId, 'categories', categoryId, 'items', item.id),
            { rank: idx + 1 }
          );
        });
        await batch.commit();
      }
    });
    return unsub;
  }, [userId, categoryId]);

  const addItem = (name, notes = '', photoUrl = null, disliked = false) => {
    const likedCount = items.filter((i) => !i.disliked).length;
    const rank = disliked ? 0 : likedCount + 1;
    return addDoc(
      collection(db, 'users', userId, 'categories', categoryId, 'items'),
      { name, notes, photoUrl, disliked, rank, createdAt: serverTimestamp() }
    );
  };

  const updateItem = (itemId, data) =>
    updateDoc(
      doc(db, 'users', userId, 'categories', categoryId, 'items', itemId),
      data
    );

  const deleteItem = (itemId) =>
    deleteDoc(
      doc(db, 'users', userId, 'categories', categoryId, 'items', itemId)
    );

  const reorderItems = async (reordered) => {
    const batch = writeBatch(db);
    reordered.forEach((item, idx) => {
      batch.update(
        doc(db, 'users', userId, 'categories', categoryId, 'items', item.id),
        { rank: idx + 1 }
      );
    });
    await batch.commit();
  };

  return { items, loading, addItem, updateItem, deleteItem, reorderItems };
}
