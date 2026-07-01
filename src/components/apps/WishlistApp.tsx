import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check } from 'lucide-react';
import monkeys from '../../assets/pic3.jpeg';

interface WishItem {
  id: number;
  text?: string;
  note?: string;
  image?: string;
  checked: boolean;
}

const initialWishes: WishItem[] = [
  { id: 1,  text: 'Paris in Rain',  note: 'Well we tried to bring it you so I think you can check this off honestly', checked: false },
  { id: 2,  text: 'Pink Sauce Pasta',  note: '', checked: false },
  { id: 3,  text: 'Mercedes',  note: 'Dont listen to vanwee get it', checked: false },
  { id: 4,  text: 'A punjabi munda',  note: '',                                         checked: false },
  { id: 5,  text: 'A one direction reunion',  note: 'pls god', checked: false },
  { id: 6,  text: 'Iced Americano Latte',  note: '',                                         checked: false },
  { id: 7,  text: '[Wish #7]',  note: '[A short note or detail about this one]', checked: false },
  { id: 8,  image: monkeys,  note: '',checked: false },
];

export default function WishlistApp() {
  const [items, setItems] = useState<WishItem[]>(initialWishes);

  const toggle = (id: number) =>
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );

  const unchecked = items.filter((i) => !i.checked);
  const checked   = items.filter((i) => i.checked);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--sky-surface)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-black/5 shrink-0">
        <Gift className="w-4 h-4" style={{ color: '#FF5F57' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--sky-text)' }}>Wishlist</span>
        <span className="text-xs ml-2" style={{ color: '#6E6E73' }}>
          {unchecked.length} remaining
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <AnimatePresence initial={false}>
          {unchecked.map((item) => (
            <WishRow key={item.id} item={item} onToggle={toggle} />
          ))}
        </AnimatePresence>

        {/* Completed section */}
        {checked.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1" style={{ color: '#6E6E73' }}>
              Done
            </p>
            <AnimatePresence initial={false}>
              {checked.map((item) => (
                <WishRow key={item.id} item={item} onToggle={toggle} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function WishRow({ item, onToggle }: { item: WishItem; onToggle: (id: number) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 px-3 py-2.5 rounded-xl group cursor-pointer select-none"
      style={{ background: 'transparent' }}
      onClick={() => onToggle(item.id)}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      role="checkbox"
      aria-checked={item.checked}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(item.id); } }}
    >
      {/* Checkbox */}
      <div
        className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
        style={{
          borderColor: item.checked ? '#FF5F57' : 'rgba(0,0,0,0.22)',
          background: item.checked ? '#FF5F57' : 'transparent',
        }}
      >
        <AnimatePresence>
          {item.checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className="text-[14px] font-medium leading-snug transition-colors"
          style={{
            color: item.checked ? 'var(--sky-text-secondary)' : 'var(--sky-text)',
            textDecoration: item.checked ? 'line-through' : 'none',
          }}
        >
          {item.text}
        </p>
        {item.note && !item.checked && (
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--sky-text-secondary)' }}>
            {item.note}
          </p>
        )}
      </div>
    </motion.div>
  );
}
