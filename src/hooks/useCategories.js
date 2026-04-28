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
} from 'firebase/firestore';
import { db } from '../firebase';

export function useCategories(userId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'users', userId, 'categories'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  const addCategory = (name, emoji) =>
    addDoc(collection(db, 'users', userId, 'categories'), {
      name,
      emoji,
      createdAt: serverTimestamp(),
    });

  const updateCategory = (catId, data) =>
    updateDoc(doc(db, 'users', userId, 'categories', catId), data);

  const deleteCategory = (catId) =>
    deleteDoc(doc(db, 'users', userId, 'categories', catId));

  return { categories, loading, addCategory, updateCategory, deleteCategory };
}
