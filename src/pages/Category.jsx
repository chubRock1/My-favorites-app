import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, GripVertical, Pencil, Plus, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { useItems } from '../hooks/useItems';
import AddItemModal from '../components/AddItemModal';
import BottomNav from '../components/BottomNav';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function SortableItem({ item, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const medalColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600'];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className={`flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm ${isDragging ? 'shadow-xl z-10' : ''}`}
    >
      {/* Rank badge */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${item.rank <= 3 ? medalColors[item.rank - 1] : 'bg-gray-200 !text-gray-500'}`}>
        {item.rank}
      </div>

      {/* Photo thumbnail */}
      {item.photoUrl && (
        <img src={item.photoUrl} alt="" className="flex-shrink-0 w-12 h-12 rounded-xl object-cover shadow-sm" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
        {item.notes && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{item.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(item)} className="p-1.5 text-gray-300 hover:text-brand-500 transition rounded-lg hover:bg-brand-50">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition rounded-lg hover:bg-red-50">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button {...attributes} {...listeners} className="p-1.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Category() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, deleteCategory } = useCategories(user.uid);
  const { items, addItem, updateItem, deleteItem, reorderItems } = useItems(user.uid, id);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [shareMsg, setShareMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const cat = categories.find((c) => c.id === id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    reorderItems(arrayMove(items, oldIdx, newIdx));
  };

  const handleSave = async (name, notes, photoUrl, disliked) => {
    if (editing) await updateItem(editing.id, { name, notes, photoUrl, disliked });
    else await addItem(name, notes, photoUrl, disliked);
    setEditing(null);
  };

  const handleShare = async () => {
    try {
      const ref = await addDoc(collection(db, 'shares'), {
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      const url = `${window.location.origin}/shared/${ref.id}/${id}`;
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2500);
    } catch {
      setShareMsg('Could not copy link');
      setTimeout(() => setShareMsg(''), 2500);
    }
  };

  const handleDeleteCategory = async () => {
    await deleteCategory(id);
    navigate('/');
  };

  if (!cat) return null;

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl">{cat.emoji}</span>
          <h1 className="font-bold text-gray-900 flex-1 truncate">{cat.name}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-brand-600 font-semibold hover:underline">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <AnimatePresence>
                {shareMsg && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute right-0 top-8 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap"
                  >
                    {shareMsg}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-gray-300 hover:text-red-400 transition rounded-lg hover:bg-red-50"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation banner */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-red-50 border-b border-red-100"
          >
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-red-700 font-medium">Delete <span className="font-bold">{cat.name}</span> and all its items?</p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm text-gray-500 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="text-sm text-white font-semibold px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-5xl mb-4">{cat.emoji}</p>
            <p className="text-gray-500 font-medium">No items yet — add your first!</p>
          </motion.div>
        ) : (
          <>
            {/* Liked items */}
            {items.filter((i) => !i.disliked).length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.filter((i) => !i.disliked).map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence>
                    <div className="space-y-2">
                      {items.filter((i) => !i.disliked).map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onEdit={(i) => { setEditing(i); setShowModal(true); }}
                          onDelete={deleteItem}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                </SortableContext>
              </DndContext>
            )}

            {/* Disliked items */}
            {items.filter((i) => i.disliked).length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">👎</span>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Didn't like</h3>
                </div>
                <div className="space-y-2">
                  {items.filter((i) => i.disliked).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm opacity-60"
                    >
                      {item.photoUrl && (
                        <img src={item.photoUrl} alt="" className="flex-shrink-0 w-12 h-12 rounded-xl object-cover grayscale" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-400 truncate">{item.name}</p>
                        {item.notes && <p className="text-xs text-gray-400 truncate mt-0.5">{item.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1.5 text-gray-300 hover:text-brand-500 transition rounded-lg hover:bg-brand-50">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-400 transition rounded-lg hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => { setEditing(null); setShowModal(true); }}
        className="fixed bottom-20 right-6 w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNav />

      <AddItemModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={handleSave}
        existing={editing}
      />
    </>
  );
}
