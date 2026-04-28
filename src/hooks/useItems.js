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
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userId, categoryId]);

  const addItem = (name, notes = '', photoUrl = null) => {
    const rank = items.length + 1;
    return addDoc(
      collection(db, 'users', userId, 'categories', categoryId, 'items'),
      { name, notes, photoUrl, rank, createdAt: serverTimestamp() }
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
