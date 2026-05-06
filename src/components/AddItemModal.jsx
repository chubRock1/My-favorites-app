import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Camera, ThumbsDown, ThumbsUp, X } from 'lucide-react';

const compressImage = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      let { width, height } = img;
      if (width > height) {
        if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      } else {
        if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = url;
  });

export default function AddItemModal({ open, onClose, onSave, existing, categoryName, categoryEmoji }) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [disliked, setDisliked] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setNotes(existing.notes || '');
      setPhoto(existing.photoUrl || null);
      setDisliked(existing.disliked || false);
    } else {
      setName('');
      setNotes('');
      setPhoto(null);
      setDisliked(false);
    }
  }, [existing, open]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const compressed = await compressImage(file);
    setPhoto(compressed);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name.trim(), notes.trim(), photo, disliked);
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
                <Dialog.Title className="text-lg font-bold">
                  {existing ? 'Edit item' : (
                    <span>{categoryEmoji && <span className="mr-1.5">{categoryEmoji}</span>}Add to {categoryName || 'category'}</span>
                  )}
                </Dialog.Title>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Liked / Disliked toggle */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setDisliked(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${!disliked ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <ThumbsUp className="w-4 h-4" /> Liked it
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisliked(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition ${disliked ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    <ThumbsDown className="w-4 h-4" /> Didn't like
                  </button>
                </div>

                {/* Photo picker */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Photo <span className="text-gray-300 font-normal normal-case">(optional)</span>
                  </label>
                  {photo ? (
                    <div className="relative w-24 h-24">
                      <img src={photo} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center shadow"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-400 hover:text-brand-500 transition disabled:opacity-50"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-xs font-medium">{uploading ? 'Loading…' : 'Add photo'}</span>
                    </button>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Honeycrisp"
                    spellCheck={true}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    Notes <span className="text-gray-300 font-normal normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Why do you love it? Or why didn't you?"
                    rows={2}
                    spellCheck={true}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!name.trim() || uploading}
                  className={`w-full text-white font-semibold rounded-xl py-3 transition disabled:opacity-40 ${disliked ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-600 hover:bg-brand-700'}`}
                >
                  {existing ? 'Save changes' : 'Add item'}
                </button>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
