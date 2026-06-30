import { useState } from 'react';
import { motion } from 'framer-motion';
import { StickyNote, FileText } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  body: string;
  date: string;
}

const notes: Note[] = [
  {
    id: 1,
    title: 'Vanwee',
    body: 'Happy Birthday Dhruvikaaa, Im so my leg was sprained that day and i was so late to class because i got to meet you. I dont think I would trade that for anything you honestly saved my college life. Sorry if i made you an introvert along the way though <3 ',
    date: 'Jun 18',
  },
  {
    id: 2,
    title: 'Anu',
    body: '[Write the personal message here. Another heartfelt note, maybe about a specific shared moment, inside joke, or something only the two of you would understand.]',
    date: 'Jun 17',
  },
 
];

export default function NotesApp() {
  const [selectedNote, setSelectedNote] = useState<Note>(notes[0]);

  return (
    <div className="h-full flex bg-[#F5F5F7] rounded-b-xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-44 sm:w-52 border-r border-black/5 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-black/5">
          <StickyNote className="w-4 h-4 text-[#FFBD2E]" />
          <span className="text-xs font-semibold text-[#1D1D1F]">Notes</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`w-full text-left px-3 py-2.5 transition-colors cursor-pointer ${
                selectedNote.id === note.id
                  ? 'bg-[#FFBD2E]/15'
                  : 'hover:bg-black/5'
              }`}
            >
              <div className="flex items-start gap-2">
                <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selectedNote.id === note.id ? 'text-[#FFBD2E]' : 'text-[#6E6E73]'}`} />
                <div className="min-w-0">
                  <p className={`text-[13px] font-medium truncate ${selectedNote.id === note.id ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]/80'}`}>
                    {note.title}
                  </p>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5 truncate">
                    {note.body.slice(0, 50)}...
                  </p>
                  <p className="text-[10px] text-[#6E6E73]/60 mt-1">{note.date}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        key={selectedNote.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">{selectedNote.title}</h2>
          <p className="text-[11px] text-[#6E6E73] mt-1">{selectedNote.date}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="max-w-lg">
            <p className="text-[14px] leading-[1.7] text-[#1D1D1F] whitespace-pre-wrap">
              {selectedNote.body}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
