import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

const EMOJIS = ['🍎','🍕','🧀','🍝','🍫','☕','🍺','🎵','📚','🎬','✈️','🏔️','🌿','🐶','👟','🎮','💄','🛋️','🌸','⚽','🍷','🌮','🍣','🧁','🏅','💎','🎯','❤️','🔥','⭐'];

export default function AddCategoryModal({ open, onClose, onAdd, onEdit, existing }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⭐');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji || '⭐');
    } else {
      setName('');
      setEmoji('⭐');
    }
  }, [existing, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (existing) {
      await onEdit(existing.id, { name: name.trim(), emoji });
    } else {
      await onAdd(name.trim(), emoji);
    }
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 translate-y-8" enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-8"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-lg font-bold">{existing ? 'Edit category' : 'New category'}</Dialog.Title>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Pick an emoji</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e} type="button"
                        onClick={() => setEmoji(e)}
                        className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center transition ${emoji === e ? 'bg-brand-100 ring-2 ring-brand-500' : 'hover:bg-gray-100'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Category name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apples, Pasta Sauce…"
                    spellCheck={true}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
                >
                  {existing ? 'Save changes' : 'Create category'}
                </button>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
