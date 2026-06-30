import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Calendar } from 'lucide-react';
import office from '../../assets/pic1.jpeg';

interface Bubble {
  id: number;
  from: 'me' | 'her';
  text?: string;
  image?: string;
  time?: string;
}

interface Exhibit {
  id: number;
  title: string;       // e.g. "The 3am Plan" — a curator-style label, not literal date
  date: string;         // e.g. "March 2024"
  caption: string;      // one line of context, like a museum placard
  bubbles: Bubble[];
}

const exhibits: Exhibit[] = [
  {
    id: 1,
    title: 'The First Few Conversations w. Vanvi',
    date: 'July 2025',
    caption: 'Our Daily Bonding Sessions',
    bubbles: [
  {
    id: 1,
    from: 'her',
    text: 'Breakfast ke liye kab chalna hai?',
    time: '8:56 AM'
  },
  {
    id: 2,
    from: 'me',
    text: '5 min',
    time: '9:01 AM'
  },
  {
    id: 3,
    from: 'her',
    text: 'Lunch ke liye chale 5-10 min mein?',
    time: '1:52 PM'
  },
  {
    id: 4,
    from: 'me',
    text: 'Yesyes',
    time: '1:52 PM'
  },
  {
    id: 5,
    from: 'her',
    text: 'Okay',
    time: '2:00 PM'
  }
],
  },
  {
    id: 2,
    title: 'The Office',
    date: 'March 2026',
    caption: 'JimPam Kiss Moment',
    bubbles: [
  {
    id: 1,
    from: 'me',
    image: office,
    time: '11:01 PM'
  },
  {
    id: 2,
    from: 'me',
    text: 'SCREAMING????????????????????????!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    time: '11:01 PM'
  },
  {
    id: 3,
    from: 'her',
    text: 'OMGGG',
    time: '11:02 PM'
  },
  {
    id: 4,
    from: 'her',
    text: 'YOU REACHED CASINO NIGHTTT',
    time: '11:02 PM'
  },
  {
    id: 5,
    from: 'her',
    text: 'im so so happy',
    time: '11:02 PM'
  },
  {
    id: 6,
    from: 'me',
    text: 'AAAAAAAAAAAAAAA',
    time: '11:02 PM'
  },
  {
    id: 7,
    from: 'me',
    text: 'THEY KISSED',
    time: '11:02 PM'
  },
  {
    id: 8,
    from: 'her',
    text: 'BEST KISS EVER',
    time: '11:02 PM'
  },
  {
    id: 9,
    from: 'me',
    text: 'I LOVE JIMPAM',
    time: '11:02 PM'

  }
],
  },
  {
    id: 3,
    title: '[Exhibit title — e.g. "The Day We Planned This"]',
    date: '[Month Year]',
    caption: '[One line of context]',
    bubbles: [
      {id:1, from: 'me',  text: '[Message text]', time: '9:03 AM' },
      {id:2, from: 'her', text: '[Reply text]',     time: '9:05 AM' },
    ],
  },
];

export default function MessagesApp() {
  const [selected, setSelected] = useState<Exhibit>(exhibits[0]);

  return (
    <div className="h-full flex bg-[#F5F5F7] rounded-b-xl overflow-hidden">
      {/* Sidebar — exhibit list */}
      <div className="w-44 sm:w-56 border-r border-black/5 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-black/5">
          <MessageCircle className="w-4 h-4 text-[#234A7A]" />
          <span className="text-xs font-semibold text-[#1D1D1F]">Messages</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {exhibits.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelected(ex)}
              className={`w-full text-left px-3 py-2.5 transition-colors cursor-pointer ${
                selected.id === ex.id ? 'bg-[#234A7A]/10' : 'hover:bg-black/5'
              }`}
            >
              <p className={`text-[13px] font-medium leading-snug ${selected.id === ex.id ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]/80'}`}>
                {ex.title}
              </p>
              <p className="text-[11px] text-[#6E6E73] mt-0.5 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {ex.date}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Exhibit viewer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.22 }}
        >
          {/* Placard */}
          <div className="px-5 pt-4 pb-3 border-b border-black/5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6E6E73]">
              {selected.date}
            </p>
            <h2 className="text-base font-semibold text-[#1D1D1F] mt-0.5">{selected.title}</h2>
            <p className="text-[12px] text-[#6E6E73] mt-1 italic">{selected.caption}</p>
          </div>

          {/* Bubbles — read-only, no input bar, this is an exhibit not a chat */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
            {selected.bubbles.map((b, i) => {
              const isMe = b.from === 'me';
              const prevSameSender = i > 0 && selected.bubbles[i - 1].from === b.from;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${prevSameSender ? 'mt-0.5' : 'mt-2'}`}
                >
                  <div
  className="max-w-[72%] overflow-hidden"
  style={{
    background: b.image
      ? 'transparent'
      : isMe
      ? '#0B84FF'
      : '#E9E9EB',

    borderRadius: 18,
  }}
>
  {b.image && (
    <img
      src={b.image}
      alt=""
      className="rounded-2xl max-w-full block"
    />
  )}

  {b.text && (
  <div
    className="max-w-[72%] px-3.5 py-2 mt-1 text-[13.5px] leading-snug"
    style={{
      background: isMe ? '#0B84FF' : '#E9E9EB',
      color: isMe ? '#FFFFFF' : '#1D1D1F',
      borderRadius: 18,
      borderBottomRightRadius: isMe && !prevSameSender ? 4 : 18,
      borderBottomLeftRadius: !isMe && !prevSameSender ? 4 : 18,
    }}
  >
    {b.text}
  </div>
)} 
</div>
                  {b.time && (
                    <span className="text-[10px] text-[#6E6E73] mt-0.5 px-1">{b.time}</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Footer note instead of an input bar — makes clear this is read-only */}
          <div className="px-5 py-2.5 border-t border-black/5 text-center">
            <p className="text-[10px] text-[#6E6E73]/70 tracking-wide">
              — preserved, not editable —
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}