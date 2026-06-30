import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Calendar } from 'lucide-react';
import office from '../../assets/pic1.jpeg';
import turt from '../../assets/pic2.jpeg';

interface Bubble {
  id: number;
  from: 'me' | 'vanwee' |'anu'|'her';
  text?: string;
  image?: string;
  time?: string;
}
const PEOPLE = {
  me: {
    name: 'me',
    bubble: '#0B84FF',
    text: '#FFFFFF',
  },
  anu: {
    name: 'anu',
    bubble: '#E9E9EB',
    text: '#1D1D1F',
  },
  vanwee: {
    name: 'vanwee',
    bubble: '#E8D9F5', // soft lavender
    text: '#1D1D1F',
  },
  her: {
    name: 'her',
    bubble: '#E9E9EB',
    text: '#1D1D1F',
  },
};
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
  title: 'Turt pt 1',
  date: 'December 2025',
  caption: 'Who is ananya?',
  bubbles: [
    {id:1,
    from: 'vanwee',
    text: 'Shreya Roommate 1 Contact',
    time: '10:12 PM'
  },
    {
      id: 2,
      from: 'me',
      text: 'Aw anu you’re roommate 2',
      time: '10:12 PM'
    },
    {
      id: 3,
      from: 'anu',
      text: "i dont think she considers me as a roomie",
      time: '10:12 PM'
    },
    {
      id: 4,
      from: 'vanwee',
      text: "it's like when there's a scruffy rat in the room and you just let it be or it'll die outside",
      time: '10:13 PM'
    },
    {
      id: 5,
      from: 'me',
      text: 'Oh',
      time: '10:13 PM'
    },
    
  ],
  
},
{
  id: 4,
  title: 'Turt pt 2',
  date: 'January 2026',
  caption: 'bye bye bye',
  bubbles: [
    {
      id: 1,
      from: 'me',
      text: 'ITS DARK IM GOING BACK TO MY ROOM',
      time: '11:39 PM'
    },
    {
      id: 2,
      from: 'anu',
      text: 'ok',
      time: '11:39 PM'
    },
    {
      id: 3,
      from: 'anu',
      text: 'bye',
      time: '11:39 PM'
    },
    {
      id: 4,
      from: 'me',
      text: 'bye',
      time: '11:39 PM'
    },
    {
      id: 5,
      from: 'vanwee',
      text: 'why dhruvika why',
      time: '11:40 PM'
    },
    {
      id: 6,
      from: 'vanwee',
      text: 'bye',
      time: '11:40 PM'
    },
    {
      id: 7,
      from: 'anu',
      text: 'ok',
      time: '11:40 PM'
    },
    {
      id: 8,
      from: 'anu',
      text: 'ok',
      time: '11:40 PM'
    },
    {
      id: 9,
      from: 'anu',
      text: 'bye',
      time: '11:40 PM'
    },
    {
      id: 10,
      from: 'me',
      text: 'Byebye',
      time: '11:40 PM'
    },
    {
      id: 11,
      from: 'vanwee',
      text: 'bye bye',
      time: '11:40 PM'
    },
    {
      id: 12,
      from: 'vanwee',
      text: 'bye bye bye',
      time: '11:40 PM'
    },
    {
      id: 13,
      from: 'anu',
      text: 'bye ye',
      time: '11:40 PM'
    },
    {
      id: 14,
      from: 'anu',
      text: 'babye',
      time: '11:40 PM'
    },
    {
      id: 15,
      from: 'vanwee',
      text: 'bye bye bye bye',
      time: '11:40 PM'
    },
    {
      id: 16,
      from: 'anu',
      text: 'babababyeee',
      time: '11:40 PM'
    },
    {
      id: 17,
      from: 'me',
      text: 'Bro',
      time: '11:40 PM'
    },
    {
      id: 18,
      from: 'anu',
      text: 'baabbbyeeee',
      time: '11:40 PM'
    },
    {
      id: 19,
      from: 'vanwee',
      text: 'bye bye bye bye bye',
      time: '11:40 PM'
    },
    {
      id: 20,
      from: 'anu',
      text: 'bbaaabayee',
      time: '11:40 PM'
    },
    {
      id: 21,
      from: 'anu',
      text: 'byeeeeyeyeyeyeeeee',
      time: '11:40 PM'
    },
    {
      id: 22,
      from: 'vanwee',
      text: 'bye bye bye bye bye bye',
      time: '11:40 PM'
    },
    {
      id: 23,
      from: 'anu',
      text: 'byeaye',
      time: '11:40 PM'
    },
    {
      id: 24,
      from: 'anu',
      text: 'bayeyeyeyeyee',
      time: '11:40 PM'
    },
    {
      id: 25,
      from: 'vanwee',
      text: 'bye bye bye bye bye bye bye bye bye bye',
      time: '11:40 PM'
    },
    {
      id: 26,
      from: 'anu',
      text: 'lmao its giving loop 😂',
      time: '11:40 PM'
    },
    {
      id: 27,
      from: 'vanwee',
      text: 'i think wo gayi',
      time: '11:41 PM'
    },
    {
      id: 28,
      from: 'vanwee',
      text: 'bye',
      time: '11:41 PM'
    },
    {
      id: 29,
      from: 'vanwee',
      text: 'bye bye',
      time: '11:41 PM'
    },
    {
      id: 30,
      from: 'vanwee',
      text: 'bye bye bye',
      time: '11:41 PM'
    },
    {
      id: 31,
      from: 'vanwee',
      text: 'bye bye bye bye',
      time: '11:41 PM'
    },
    {
      id: 32,
      from: 'vanwee',
      text: 'bye bye bye bye bye',
      time: '11:41 PM'
    },
    {
      id: 33,
      from: 'vanwee',
      text: 'bye bye bye bye bye bye',
      time: '11:41 PM'
    },
  ],
},
{
  id: 5,
  title: 'Vanwee Birthday Gift??',
  date: '7 June 2026',
  caption: 'The one where vanwee is just too smart hehe',
  bubbles: [
    {
      id: 1,
      from: 'vanwee',
      text: 'Deal: Craftland Handmade Wooden Nose Shaped Spectacle Specs Eyeglass Holder Stand\nhttps://amzn.in/d/01uLT7lc',
      time: '3:26 PM'
    },
    {
      id: 2,
      from: 'me',
      text: 'AAAHHH THIS WAS SUPPOSED TO BE OUR FUNNY GIFT VANWEEEEEE NKOOOOOOOOOOO',
      time: '3:27 PM'
    },
    {
      id: 3,
      from: 'me',
      text: 'AAAA NOOO FUCK OFF VANWEE',
      time: '3:28 PM'
    },
    {
      id: 4,
      from: 'vanwee',
      text: 'LOLLLL I DID IT',
      time: '3:28 PM'
    },
    {
      id: 5,
      from: 'me',
      text: 'BHAAD ME JA',
      time: '3:28 PM'
    },
    {
      id: 6,
      from: 'me',
      text: 'AAAAAAGGHH',
      time: '3:28 PM'
    },
    {
      id: 7,
      from: 'vanwee',
      text: 'OH EM GEE',
      time: '3:28 PM'
    },
    {
      id: 8,
      from: 'me',
      text: 'GO AWAY HO AWAY GO AWAY',
      time: '3:28 PM'
    },
    {
      id: 9,
      from: 'vanwee',
      text: 'HAHAHA',
      time: '3:28 PM'
    },
    {
      id: 10,
      from: 'vanwee',
      text: 'THIS IS SO FUNNY',
      time: '3:28 PM'
    },
    {
      id: 11,
      from: 'me',
      text: 'Bhaag me jaa bro',
      time: '3:28 PM'
    },
    {
      id: 12,
      from: 'me',
      text: 'We still getting dis for you idc',
      time: '3:28 PM'
    },
    {
      id: 13,
      from: 'vanwee',
      text: "I'll pretend i didnt see i swear",
      time: '3:28 PM'
    }
  ]
},
{
  id: 6,
  title: 'She Did it Again :/',
  date: '20 June 2026',
  caption: 'Stop hijacking your gifts vanweee',
  bubbles: [
    {
      id: 1,
      from: 'vanwee',
      text: 'what had we decided for ananya',
      image: turt,
      time: '10:21 PM'
    },
    {
      id: 2,
      from: 'me',
      text: 'Fuck off',
      time: '11:04 PM'
    },
    {
      id: 3,
      from: 'me',
      text: '😢',
      time: '11:04 PM'
    },
    {
      id: 4,
      from: 'me',
      text: 'Stop scrolling unnecessarily',
      time: '11:05 PM'
    },
    {
      id: 5,
      from: 'vanwee',
      text: 'reels mein aaya tha 😔',
      time: '11:05 PM'
    },
    {
      id: 6,
      from: 'me',
      text: 'Had thought of this for you',
      time: '11:05 PM'
    },
    {
      id: 7,
      from: 'me',
      text: '😢',
      time: '11:05 PM'
    },
    {
      id: 8,
      from: 'vanwee',
      text: 'HAHAHAHAAHHHHAA',
      time: '11:05 PM'
    },
    {
      id: 9,
      from: 'vanwee',
      text: 'STOPPPP',
      time: '11:05 PM'
    },
    {
      id: 10,
      from: 'vanwee',
      text: 'I CANT BELIEVE IT',
      time: '11:06 PM'
    },
    {
      id: 11,
      from: 'me',
      text: 'Bhaad me ja yaaaaar',
      time: '11:06 PM'
    },
    {
      id: 12,
      from: 'me',
      text: "Like I'm genuinely sad",
      time: '11:06 PM'
    },
    {
      id: 13,
      from: 'vanwee',
      text: 'how did this happen firse im so sorry 😭',
      time: '11:06 PM'
    },
    {
      id: 14,
      from: 'me',
      text: "No you're not pls go",
      time: '11:06 PM'
    },
    {
      id: 15,
      from: 'vanwee',
      text: 'i am i am i didnt know i thought it would be cute for ananya 😭😭',
      time: '11:07 PM'
    },
    {
      id: 16,
      from: 'me',
      text: 'No wait I said no for this later',
      time: '11:07 PM'
    },
    {
      id: 17,
      from: 'me',
      text: 'I have another thing',
      time: '11:07 PM'
    },
    {
      id: 18,
      from: 'me',
      text: 'Pls delete Amazon',
      time: '11:07 PM'
    },
    {
      id: 19,
      from: 'vanwee',
      text: "oooooh see it's still there",
      time: '11:07 PM'
    },
    {
      id: 20,
      from: 'me',
      text: 'And like stop okay?',
      time: '11:07 PM'
    },
    {
      id: 21,
      from: 'vanwee',
      text: 'i didnt know we have connected minds',
      time: '11:07 PM'
    },
    {
      id: 22,
      from: 'me',
      text: 'pehla wala bhi you sent 🤣', 
      time: '11:08 PM'
    },
    {
      id: 23,
      from: 'me',
      text: 'Ok this is funny',
      time: '11:08 PM'
    }
  ]
},
{
  id: 7,
  title: 'Turt Bag',
  date: 'March 2026',
  caption: 'Puns.',
  bubbles: [
    {
      id: 1,
      from: 'me',
      text: 'Turt bag lu ya sling',
      time: '8:37 AM'
    },
    {
      id: 2,
      from: 'anu',
      text: 'mai turt le rhi',
      time: '8:40 AM'
    },
    {
      id: 3,
      from: 'anu',
      text: 'i feel like stuff hai to carry',
      time: '8:40 AM'
    },
    {
      id: 4,
      from: 'me',
      text: 'Mai bhi leleti hu',
      time: '8:41 AM'
    },
    {
      id: 5,
      from: 'anu',
      text: 'yaar',
      time: '8:44 AM'
    },
    {
      id: 6,
      from: 'anu',
      text: 'i think ill take sling',
      time: '8:44 AM'
    },
    {
      id: 7,
      from: 'anu',
      text: 'bhai meri cap nahi mil rhi 😭😭😭😭',
      time: '8:49 AM'
    },
    {
      id: 8,
      from: 'anu',
      text: '📞 Voice call (No answer)',
      time: '8:54 AM'
    }
  ]
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
  const sender = PEOPLE[b.from];
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
                  {!prevSameSender && b.from !== 'me' && (
  <span
    className="text-[10px] font-semibold mb-1 ml-2"
    style={{ color: '#6E6E73' }}
  >
    {sender.name}
  </span>
)}
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
    className=" px-3.5 py-2 mt-1 text-[13.5px] leading-snug"
    style={{
      background: sender.bubble,
color: sender.text,
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