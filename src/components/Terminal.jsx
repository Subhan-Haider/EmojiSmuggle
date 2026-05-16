import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { extractMessage, getRandomEmojis, smuggleMessage } from '../utils/stego';
import { useApp } from '../context/AppContext';

const bootLines = [
  'EmojiSmuggle console ready.',
  'Type "help" to list commands.',
  'Examples: encode hello / decode <emoji text> / history',
];

const Terminal = () => {
  const { history, addToHistory, clearHistory } = useApp();
  const [lines, setLines] = useState(bootLines);
  const [input, setInput] = useState('');
  const [lastOutput, setLastOutput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const print = (items) => {
    setLines((current) => [...current, ...items]);
  };

  const runCommand = async () => {
    const raw = input.trim();
    if (!raw) return;

    const [command, ...rest] = raw.split(' ');
    const args = rest.join(' ').trim();
    const cmd = command.toLowerCase();
    setInput('');

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    if (cmd === 'help') {
      print([
        `> ${raw}`,
        'Commands:',
        '  encode <message>       Hide text inside random emojis',
        '  decode <emoji text>    Extract a hidden message',
        '  history                Show saved transmissions',
        '  copy                   Copy last terminal output',
        '  wipe                   Clear local transmission history',
        '  status                 Show local node status',
        '  clear                  Clear terminal output',
      ]);
      return;
    }

    if (cmd === 'status') {
      print([
        `> ${raw}`,
        `History entries: ${history.length}`,
        'Processing: local browser',
        'Network upload: none',
        'Protocol: zero-width carrier encoding',
      ]);
      return;
    }

    if (cmd === 'history') {
      if (!history.length) {
        print([`> ${raw}`, 'No saved transmissions yet.']);
        return;
      }

      print([
        `> ${raw}`,
        ...history.slice(0, 8).map((item, index) => {
          const label = item.type === 'encode' ? 'ENCODE' : 'DECODE';
          const preview = String(item.payload || '').slice(0, 42);
          return `${index + 1}. ${label} / ${new Date(item.timestamp).toLocaleString()} / ${preview}`;
        }),
      ]);
      return;
    }

    if (cmd === 'wipe') {
      clearHistory();
      print([`> ${raw}`, 'Local transmission history cleared.']);
      return;
    }

    if (cmd === 'copy') {
      if (!lastOutput) {
        print([`> ${raw}`, 'Nothing to copy yet.']);
        return;
      }
      await navigator.clipboard.writeText(lastOutput);
      print([`> ${raw}`, 'Copied last output to clipboard.']);
      return;
    }

    if (cmd === 'encode') {
      if (!args) {
        print([`> ${raw}`, 'Usage: encode <message>']);
        return;
      }
      const carrier = getRandomEmojis('cyberpunk', 5);
      const encoded = smuggleMessage(args, '', carrier);
      setLastOutput(encoded);
      addToHistory({
        type: 'encode',
        payload: args,
        carrier,
        isEncrypted: false,
      });
      print([`> ${raw}`, encoded, 'Saved to local history. Type "copy" to copy this output.']);
      return;
    }

    if (cmd === 'decode') {
      if (!args) {
        print([`> ${raw}`, 'Usage: decode <emoji text>']);
        return;
      }
      const decoded = extractMessage(args, '');
      if (!decoded.success) {
        print([`> ${raw}`, `Decode failed: ${decoded.error}`]);
        return;
      }
      setLastOutput(decoded.data);
      addToHistory({
        type: 'decode',
        payload: decoded.data,
        isEncrypted: decoded.encrypted,
      });
      print([`> ${raw}`, decoded.data, 'Saved to local history. Type "copy" to copy this output.']);
      return;
    }

    print([`> ${raw}`, `Unknown command: ${cmd}. Type "help".`]);
  };

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-cyber-green/25 bg-black/85 p-5 font-mono text-sm shadow-[0_0_24px_rgba(0,255,65,0.08)]">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyber-green">Terminal</p>
          <p className="mt-1 text-xs text-slate-600">Local command console</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyber-green" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto pr-2">
        <div className="space-y-2">
          {lines.map((line, index) => (
            <motion.div
              key={`${line}-${index}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={line.startsWith('>') ? 'text-cyber-purple' : 'whitespace-pre-wrap break-words text-cyber-green'}
            >
              {line}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
        <span className="text-cyber-green">$</span>
        <input
          type="text"
          className="w-full border-none bg-transparent p-0 text-white outline-none placeholder:text-slate-700 focus:ring-0"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') runCommand();
          }}
          placeholder="Type help..."
          autoFocus
        />
      </div>
    </div>
  );
};

export default Terminal;
