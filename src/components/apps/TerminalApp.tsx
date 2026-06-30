import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import { useCelestial } from '../../lib/CelestialContext';

// ── Moon phase calculation ────────────────────────────────────────────────
function getMoonPhase(): string {
  const known = new Date(2000, 0, 6, 18, 14, 0); // known new moon
  const now = new Date();
  const diff = (now.getTime() - known.getTime()) / (1000 * 60 * 60 * 24);
  const cycle = 29.53058867;
  const pos = ((diff % cycle) + cycle) % cycle;

  if (pos < 1.85)  return '🌑 New Moon';
  if (pos < 7.38)  return '🌒 Waxing Crescent';
  if (pos < 9.22)  return '🌓 First Quarter';
  if (pos < 14.77) return '🌔 Waxing Gibbous';
  if (pos < 16.61) return '🌕 Full Moon';
  if (pos < 22.15) return '🌖 Waning Gibbous';
  if (pos < 23.99) return '🌗 Last Quarter';
  if (pos < 29.53) return '🌘 Waning Crescent';
  return '🌑 New Moon';
}

// ── Fortune pool ─────────────────────────────────────────────────────────
const FORTUNES = [
  'Cool cool cool cool cool. No doubt no doubt no doubt.',
  'Bingpot.',
  'Title of your sex tape.',
  'BONEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
  'Every time someone steps up and says who they are, the world becomes a better, more interesting place.',
  'The only thing I’m not good at is modesty. Because I’m great at it.',
  'Life is unpredictable. Not everything is in our control. But as long as you’re with the right people, you can handle anything.',
  'If I die, turn my tweets into a book.',
  'You’re not Cheddar. You’re just some common bitch.',
  'No one will ever believe you.',
  'The doctor said all my bleeding was internal. That’s where the blood is supposed to be.',
  'Amazing. Human. Genius.',
  'I’d like your eightiest dollar-est bottle of wine.',
  'The full bullpen.',
  'Vindicationnnnnn!',
  'Everything is garbage. Never love anything.',
  'The English language cannot fully capture the depth and complexity of my thoughts, so I’m incorporating emojis into my speech.',
  'Cowabunga, mother.',
  'If anything, I see you as a "bother" figure cause youre always bothering me.',
  'SHH! Not a doctor',
];

// ── Help text ─────────────────────────────────────────────────────────────
const HELP_TEXT = `Available commands:

  help        Show this help message
  whoami      Display user information
  date        Current date and time
  moonphase   Tonight's moon phase
  fortune     Summon a random detective thought
  clear       Clear the terminal
  
  
  Up/Down arrows navigate command history.`;

// ── Output line types ─────────────────────────────────────────────────────
interface OutputLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'welcome';
  text: string;
}

let lineId = 0;

function makeLine(type: OutputLine['type'], text: string): OutputLine {
  return { id: ++lineId, type, text };
}

const WELCOME_LINES: OutputLine[] = [
  makeLine('welcome', 'BirthdayOS Terminal v1.0.0'),
  makeLine('welcome', 'Type  help  to see available commands.'),
  makeLine('welcome', '─────────────────────────────────────'),
];

// ── TerminalApp ───────────────────────────────────────────────────────────
export default function TerminalApp() {
  const { theme } = useTheme();
  const { recordTerminalAlign } = useCelestial();
  const [lines, setLines]     = useState<OutputLine[]>(WELCOME_LINES);
  const [input, setInput]     = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);

  const accent = theme === 'moon' ? '#C1913F' : '#7AA0C8';
  const prompt = '> ';

  const pushLines = useCallback((...newLines: OutputLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();

    // Echo the input line
    const inputLine = makeLine('input', raw);

    if (!cmd) { pushLines(inputLine); return; }

    // Save to history
    setHistory((h) => [raw, ...h.slice(0, 49)]);
    setHistIdx(-1);

    let response: OutputLine[];

    switch (cmd) {
      case 'help':
        response = HELP_TEXT.split('\n').map((l) => makeLine('output', l));
        break;

      case 'whoami':
        response = [
          makeLine('output', 'User:     dhruvika'),
          makeLine('output', 'Role:     Birthday Girl 🎂'),
          makeLine('output', 'Uptime:   another wonderful year'),
          makeLine('output', 'Status:   loved unconditionally'),
        ];
        break;

      case 'date': {
        const now = new Date();
        response = [
          makeLine('output', now.toDateString() + '  ' + now.toLocaleTimeString()),
        ];
        break;
      }

      case 'moonphase':
        response = [
          makeLine('output', 'Tonight\'s moon phase:'),
          makeLine('output', '  ' + getMoonPhase()),
        ];
        break;

      case 'fortune': {
        const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        response = [
          makeLine('output', ''),
          makeLine('output', '  ✦  ' + f),
          makeLine('output', ''),
        ];
        break;
      }

      case 'clear':
        setLines(WELCOME_LINES);
        setInput('');
        return;

      case 'align':
        recordTerminalAlign();
        response = [
          makeLine('output', ''),
          makeLine('output', '  scanning celestial coordinates...'),
          makeLine('output', '  alignment sequence initiated.'),
          makeLine('output', '  observatory is watching.'),
          makeLine('output', ''),
        ];
        break;

      default:
        response = [
          makeLine('error', `command not found: ${cmd} — try 'help'`),
        ];
    }

    pushLines(inputLine, ...response);
  }, [pushLines]);

  // Auto-scroll to bottom whenever lines change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Focus input when clicking anywhere in terminal
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      setInput('');
      setHistIdx(-1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistIdx((idx) => {
        const next = Math.min(idx + 1, history.length - 1);
        setInput(history[next] ?? '');
        return next;
      });
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistIdx((idx) => {
        const next = idx - 1;
        if (next < 0) { setInput(''); return -1; }
        setInput(history[next] ?? '');
        return next;
      });
    }
  }, [input, history, runCommand]);

  return (
    <div
      className="h-full flex flex-col overflow-hidden rounded-b-xl"
      style={{ background: '#0D1117', fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace' }}
      onClick={handleContainerClick}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1.5 px-4 py-1.5 shrink-0"
        style={{ background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-[11px] font-medium" style={{ color: accent }}>bash</span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>BirthdayOS</span>
      </div>

      {/* Output area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {lines.map((line) => (
          <div key={line.id} className="flex gap-0 leading-relaxed">
            {line.type === 'input' && (
              <span style={{ color: accent, userSelect: 'none' }}>{prompt}</span>
            )}
            <span
              className="whitespace-pre-wrap break-all text-[13px]"
              style={{
                color:
                  line.type === 'welcome' ? 'rgba(255,255,255,0.35)' :
                  line.type === 'error'   ? '#FF6B6B' :
                  line.type === 'input'   ? 'rgba(255,255,255,0.9)' :
                  'rgba(255,255,255,0.72)',
              }}
            >
              {line.text}
            </span>
          </div>
        ))}

        {/* Live input row */}
        <div className="flex items-center gap-0 mt-1">
          <span className="text-[13px] leading-relaxed" style={{ color: accent, userSelect: 'none' }}>
            {prompt}
          </span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
              className="w-full bg-transparent outline-none text-[13px] leading-relaxed caret-transparent"
              style={{ color: 'rgba(255,255,255,0.9)' }}
              aria-label="Terminal input"
            />
            {/* Blinking cursor */}
            <BlinkingCursor color={accent} input={input} />
          </div>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Blinking cursor ───────────────────────────────────────────────────────
function BlinkingCursor({ color, input }: { color: string; input: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Measure text width using a canvas
  const spanRef = useRef<HTMLSpanElement>(null);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (spanRef.current) {
      setLeft(spanRef.current.offsetWidth);
    }
  });

  return (
    <>
      {/* Hidden span to measure text width */}
      <span
        ref={spanRef}
        className="invisible absolute top-0 left-0 text-[13px] whitespace-pre pointer-events-none"
        style={{ fontFamily: 'inherit' }}
        aria-hidden
      >
        {input}
      </span>
      {/* Cursor block */}
      <span
        className="absolute top-0 text-[13px] leading-relaxed pointer-events-none"
        style={{
          left,
          width: 8,
          height: '1.2em',
          background: visible ? color : 'transparent',
          opacity: 0.85,
          display: 'inline-block',
          borderRadius: 1,
          transition: 'background 0.05s',
        }}
        aria-hidden
      />
    </>
  );
}
