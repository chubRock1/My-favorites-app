import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Search } from 'lucide-react';

// Each entry: [emoji, 'space separated search keywords']
const EMOJI_GROUPS = [
  {
    label: 'Fruit & Veg',
    items: [
      ['🍎', 'apple fruit red'], ['🍌', 'banana fruit'], ['🍓', 'strawberry berry fruit'],
      ['🍇', 'grapes fruit'], ['🍊', 'orange citrus fruit'], ['🍑', 'peach fruit'],
      ['🍉', 'watermelon melon fruit'], ['🍒', 'cherry cherries fruit'], ['🥭', 'mango fruit'],
      ['🍍', 'pineapple fruit'], ['🥥', 'coconut fruit'], ['🥝', 'kiwi fruit'],
      ['🥑', 'avocado'], ['🍅', 'tomato'], ['🥕', 'carrot veg vegetable'],
      ['🌽', 'corn veg vegetable'], ['🥦', 'broccoli veg vegetable'], ['🥬', 'lettuce greens veg salad'],
      ['🥔', 'potato veg vegetable'], ['🧅', 'onion veg vegetable'], ['🧄', 'garlic'],
      ['🍄', 'mushroom'], ['🌶️', 'chili pepper spicy hot'], ['🥒', 'cucumber pickle veg'],
    ],
  },
  {
    label: 'Meals',
    items: [
      ['🍕', 'pizza'], ['🍝', 'pasta spaghetti'], ['🌮', 'taco mexican'],
      ['🌯', 'burrito wrap mexican'], ['🥙', 'kebab wrap pita'], ['🍔', 'burger hamburger'],
      ['🌭', 'hot dog'], ['🥪', 'sandwich'], ['🍟', 'fries chips'],
      ['🥓', 'bacon'], ['🍗', 'chicken poultry meat'], ['🥩', 'steak meat'],
      ['🍣', 'sushi'], ['🍤', 'shrimp prawn seafood'], ['🦞', 'lobster seafood'],
      ['🦀', 'crab seafood'], ['🐟', 'fish seafood'], ['🍚', 'rice'],
      ['🍜', 'ramen noodles soup'], ['🍛', 'curry'], ['🥟', 'dumpling'],
      ['🍲', 'stew soup pot'], ['🥘', 'paella pan dish'], ['🫕', 'fondue'],
    ],
  },
  {
    label: 'Bakery & Dairy',
    items: [
      ['🧀', 'cheese dairy'], ['🥛', 'milk dairy glass'], ['🧈', 'butter dairy'],
      ['🥚', 'egg'], ['🍞', 'bread loaf'], ['🥖', 'baguette bread'],
      ['🥐', 'croissant pastry'], ['🥯', 'bagel'], ['🥜', 'peanut nut nuts'],
      ['🌰', 'chestnut nut nuts'], ['🫘', 'beans legume'], ['🍯', 'honey'],
    ],
  },
  {
    label: 'Sweets & Drinks',
    items: [
      ['🍫', 'chocolate candy sweet'], ['🍪', 'cookie biscuit'], ['🧁', 'cupcake sweet'],
      ['🍰', 'cake slice dessert'], ['🎂', 'cake birthday'], ['🍩', 'donut doughnut'],
      ['🍬', 'candy sweet'], ['🍭', 'lollipop candy'], ['🍮', 'pudding custard flan'],
      ['🍦', 'ice cream soft serve'], ['🥧', 'pie'], ['🍨', 'ice cream sundae'],
      ['☕', 'coffee'], ['🍵', 'tea matcha'], ['🧃', 'juice box'],
      ['🥤', 'soda drink cup'], ['🧋', 'bubble tea boba'], ['🍺', 'beer'],
      ['🍷', 'wine'], ['🍸', 'cocktail martini'], ['🍹', 'cocktail tropical'],
      ['🥂', 'champagne cheers'], ['🍶', 'sake'], ['🥃', 'whiskey whisky spirits'],
    ],
  },
  {
    label: 'Hobbies',
    items: [
      ['🎵', 'music song note'], ['📚', 'books reading'], ['🎬', 'movie film cinema'],
      ['🎮', 'games gaming video game'], ['🎨', 'art painting'], ['📷', 'photo camera photography'],
      ['🎧', 'headphones music audio'], ['🎸', 'guitar music'], ['🎯', 'darts target'],
      ['♟️', 'chess'], ['🧩', 'puzzle'], ['🎲', 'dice board game'],
    ],
  },
  {
    label: 'Travel & Nature',
    items: [
      ['✈️', 'plane travel flight'], ['🏔️', 'mountain'], ['🏖️', 'beach'],
      ['🗺️', 'map travel'], ['🚗', 'car'], ['🚲', 'bike bicycle cycling'],
      ['⛺', 'tent camping'], ['🏕️', 'camping campsite'], ['🌍', 'earth globe world'],
      ['🎡', 'ferris wheel fair'], ['🎢', 'roller coaster'], ['🏛️', 'museum building'],
      ['🌿', 'plant leaf nature'], ['🌸', 'flower blossom'], ['🌻', 'sunflower flower'],
      ['🌵', 'cactus'], ['🌳', 'tree'], ['🐶', 'dog puppy pet'],
      ['🐱', 'cat kitten pet'], ['🐾', 'paw pet animal'], ['🐴', 'horse'],
      ['🦋', 'butterfly'], ['🐢', 'turtle'], ['🦜', 'parrot bird'],
    ],
  },
  {
    label: 'Style & Home',
    items: [
      ['👟', 'shoe sneaker trainers'], ['👗', 'dress clothes fashion'], ['💄', 'lipstick makeup beauty'],
      ['👜', 'bag handbag purse'], ['🕶️', 'sunglasses'], ['⌚', 'watch'],
      ['💍', 'ring jewelry'], ['💎', 'diamond gem jewelry'], ['🛋️', 'sofa couch furniture'],
      ['🛏️', 'bed'], ['🏠', 'house home'], ['🔧', 'tools diy wrench'],
    ],
  },
  {
    label: 'Sports',
    items: [
      ['⚽', 'soccer football'], ['🏀', 'basketball'], ['🏈', 'american football'],
      ['🎾', 'tennis'], ['⛳', 'golf'], ['🏊', 'swimming'],
      ['🚴', 'cycling bike'], ['🏋️', 'gym weights lifting'], ['🥊', 'boxing'],
      ['🎿', 'ski skiing'], ['🏓', 'ping pong table tennis'], ['🏅', 'medal award'],
    ],
  },
  {
    label: 'Symbols',
    items: [
      ['❤️', 'heart love'], ['🔥', 'fire hot flame'], ['⭐', 'star'],
      ['✨', 'sparkles'], ['💫', 'dizzy star'], ['🌟', 'glowing star'],
      ['🏆', 'trophy award winner'], ['🎁', 'gift present'], ['💡', 'idea lightbulb'],
      ['📱', 'phone mobile tech'], ['💻', 'laptop computer tech'], ['🎉', 'party celebrate'],
    ],
  },
];

const ALL_ITEMS = EMOJI_GROUPS.flatMap((g) => g.items);

export default function AddCategoryModal({ open, onClose, onAdd, onEdit, existing }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji || '⭐');
    } else {
      setName('');
      setEmoji('⭐');
    }
    setTab(0);
    setQuery('');
  }, [existing, open]);

  const q = query.trim().toLowerCase();
  const shownItems = useMemo(() => {
    if (q) return ALL_ITEMS.filter(([, kw]) => kw.includes(q));
    return EMOJI_GROUPS[tab].items;
  }, [q, tab]);

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
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search emojis…"
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  {!q && (
                    <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                      {EMOJI_GROUPS.map((g, i) => (
                        <button
                          key={g.label} type="button"
                          onClick={() => setTab(i)}
                          className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full transition ${tab === i ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >{g.label}</button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-6 gap-2 max-h-44 overflow-y-auto mt-1">
                    {shownItems.map(([e]) => (
                      <button
                        key={e} type="button"
                        onClick={() => setEmoji(e)}
                        className={`text-xl w-10 h-10 rounded-xl flex items-center justify-center transition ${emoji === e ? 'bg-brand-100 ring-2 ring-brand-500' : 'hover:bg-gray-100'}`}
                      >{e}</button>
                    ))}
                    {shownItems.length === 0 && (
                      <p className="col-span-6 text-sm text-gray-400 py-4 text-center">No emojis match “{query}”.</p>
                    )}
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
