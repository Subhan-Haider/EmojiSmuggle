import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Copy,
  EyeOff,
  Image as ImageIcon,
  KeyRound,
  Lock,
  MessageSquare,
  Play,
  Shield,
  Sparkles,
  Terminal,
  Unlock,
  Download,
  Zap,
} from 'lucide-react';
import { smuggleMessage, getRandomEmojis } from '../utils/stego';

const previewCarriers = '🕵️📦💾🔒⚡';

const workflow = [
  {
    icon: <MessageSquare size={18} />,
    title: 'Write',
    text: 'Type the message you want to protect.',
  },
  {
    icon: <EyeOff size={18} />,
    title: 'Hide',
    text: 'The app converts it into invisible Unicode.',
  },
  {
    icon: <Unlock size={18} />,
    title: 'Reveal',
    text: 'Paste the emojis into the decoder to recover it.',
  },
];

const features = [
  {
    icon: <Shield size={20} />,
    title: 'Local by default',
    text: 'Encoding and decoding happen in your browser.',
  },
  {
    icon: <Lock size={20} />,
    title: 'Optional password',
    text: 'Add encryption before the message is hidden.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Emoji carriers',
    text: 'Choose camouflage that looks normal in chat.',
  },
  {
    icon: <Terminal size={20} />,
    title: 'Operator console',
    text: 'History and terminal tools stay one click away.',
  },
];

const heroFacts = [
  { label: 'No account', value: 'Start instantly' },
  { label: 'Local encode', value: 'Browser only' },
  { label: 'Password mode', value: 'Optional' },
];

const HeroPreview = ({ previewText, setPreviewText, encodedPreview }) => (
  <div className="relative">
    <div className="absolute inset-x-8 -top-6 h-px bg-gradient-to-r from-transparent via-cyber-green/60 to-transparent" />
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080a0c]/90 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyber-green">Live carrier</p>
          <p className="mt-1 text-xs text-slate-500">Invisible payload preview</p>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyber-green/80" />
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="rounded-xl border border-white/10 bg-black/40 p-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Output</p>
          <div className="min-h-24 break-all text-4xl leading-relaxed sm:text-5xl">
            {encodedPreview}
          </div>
        </div>

        <label className="mt-5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Hidden message
        </label>
        <input
          value={previewText}
          onChange={(event) => setPreviewText(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyber-green/60"
        />

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4">
            <p className="text-lg font-black text-white">{previewText.length}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">chars</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4">
            <p className="text-lg font-black text-white">{previewText.length * 8}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">bits</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4">
            <p className="text-lg font-black text-white">0</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">servers</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DemoSection = () => {
  const [message, setMessage] = useState('Meet at midnight');
  const [encoded, setEncoded] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    setEncoded(smuggleMessage(message, '', getRandomEmojis('cyberpunk', 5)));
    setCopied(false);
  };

  const copyEncoded = async () => {
    if (!encoded) return;
    await navigator.clipboard.writeText(encoded);
    setCopied(true);
  };

  return (
    <section id="demo" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyber-green">Try it</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Encode a message in seconds</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            This is the core product, right on the landing page. Type a message, generate the carrier, copy it, and decode it later.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Secret message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-3 min-h-40 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyber-green/60"
              placeholder="Type something private..."
            />
            <button
              onClick={handleEncode}
              disabled={!message.trim()}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyber-green px-5 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play size={16} />
              Encode
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#07080a]/90 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Carrier output</p>
                <p className="mt-1 text-xs text-slate-500">{encoded ? 'Ready to share' : 'Waiting for input'}</p>
              </div>
              <button
                onClick={copyEncoded}
                disabled={!encoded}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition hover:border-cyber-green/40 hover:text-white disabled:opacity-30"
                title="Copy encoded message"
              >
                {copied ? <Check size={18} className="text-cyber-green" /> : <Copy size={18} />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={encoded || 'empty'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex min-h-56 items-center justify-center rounded-xl border border-white/10 bg-black/30 p-5 text-center"
              >
                {encoded ? (
                  <p className="break-all text-4xl leading-relaxed sm:text-5xl">{encoded}</p>
                ) : (
                  <p className="text-sm font-mono uppercase tracking-[0.2em] text-slate-600">No carrier generated</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const Landing = () => {
  const [previewText, setPreviewText] = useState('Hello World');
  const encodedPreview = useMemo(
    () => smuggleMessage(previewText, '', previewCarriers),
    [previewText],
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <section className="grid min-h-[calc(100vh-12rem)] items-center gap-10 px-4 pb-12 pt-6 sm:px-6 lg:grid-cols-[0.95fr_0.9fr] lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyber-green">
            <span className="h-2 w-2 rounded-full bg-cyber-green shadow-[0_0_14px_rgba(0,255,65,0.8)]" />
            Private emoji encoder
          </div>

          <h1 className="max-w-4xl text-4xl font-black normal-case leading-[1.02] tracking-normal text-white sm:text-5xl lg:text-6xl">
            Hide private text inside ordinary emojis
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
            EmojiSmuggle turns a message into invisible characters and tucks it into a normal-looking emoji string. No account. No upload. Just encode, copy, and send.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/encode"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyber-green px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-white"
            >
              Open encoder
              <ArrowRight size={17} />
            </Link>
            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:border-white/25 hover:bg-white/[0.06]"
            >
              Try demo
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="https://chromewebstore.google.com/detail/ckpmnmlhinfjjlgahbcfobmbcdjlomia?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#4285F4] flex-shrink-0">
                <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5ZM12.72 4C16.59 4 19.78 6.55 20.69 10H14.8C16.7 4.9 18 6.7 18 8.87C18 9.92 17.7 10.96 17.27 11.96L12.69 4H12.72ZM4.67 15.6C5.56 15.54 7.46 17 9.7 17C11 17 12.18 16.33 12.76 15.3H7.4C7.03 15.3 6.67 15.27 6.35 15.2C5.92 13.68 6 12 6.64 10.5C7.11 9.25 8.04 8.2 9.26 7.66L4.67 15.6ZM11.16 20V22.25C10.7 22.25 10.22 22.2 9.74 22.2L14.33 14.24C13.84 14.47 13.29 14.6 12.72 14.6H4.19C5.06 17.72 7.81 20 11.16 20Z"/>
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase tracking-widest text-slate-500">Available on</span>
                <span className="text-xs font-black uppercase tracking-wider">Chrome Extension</span>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=tech.subhan.emojismuggle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white hover:-translate-y-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.18 23.76a2 2 0 0 1-1-.27 2 2 0 0 1-1-1.76V2.27a2 2 0 0 1 1-1.76 2 2 0 0 1 2 0l17.42 10a2 2 0 0 1 0 3.46l-17.42 10a2 2 0 0 1-1 .29z" fill="url(#play-gradient)"/>
                <defs>
                  <linearGradient id="play-gradient" x1="3" y1="0" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00D4FF"/>
                    <stop offset="33%" stopColor="#00E676"/>
                    <stop offset="66%" stopColor="#FFEB3B"/>
                    <stop offset="100%" stopColor="#FF5252"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase tracking-widest text-slate-500">Get it on</span>
                <span className="text-xs font-black uppercase tracking-wider">Google Play</span>
              </div>
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {heroFacts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{fact.label}</p>
                <p className="mt-2 text-sm font-bold normal-case tracking-normal text-slate-200">{fact.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <HeroPreview previewText={previewText} setPreviewText={setPreviewText} encodedPreview={encodedPreview} />
        </motion.div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-4 py-12 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyber-green/10 text-cyber-green">
                {feature.icon}
              </div>
              <h3 className="text-base font-black uppercase tracking-wide text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <DemoSection />

      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyber-green">Workflow</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Simple enough for chat, strong enough for private notes.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Keep private notes, puzzle clues, or one-off messages in plain sight. The visible text stays friendly while the payload travels quietly inside it.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-6 flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-cyber-green">
                    {item.icon}
                  </span>
                  <span className="font-mono text-xs text-slate-600">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-black uppercase text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Smuggling Feature Banner */}
      <section className="px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-cyber-purple/30 bg-gradient-to-br from-cyber-purple/10 to-cyber-green/10 p-8 sm:p-12 relative overflow-hidden bg-white/5"
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-purple/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyber-green/10 blur-[80px] rounded-full" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              {/* Left text */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-purple/40 bg-cyber-purple/10 text-cyber-purple text-[10px] font-bold uppercase tracking-widest mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-purple animate-pulse" />
                  New Feature
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                  Hide Images<br />
                  <span className="bg-gradient-to-r from-cyber-purple to-cyber-green bg-clip-text text-transparent">Inside Emojis</span>
                </h2>
                <p className="text-gray-400 text-sm leading-7 mb-8 max-w-lg">
                  Not just text — smuggle entire images inside innocent-looking emoji strings.
                  Compress, encrypt, and hide JPEG data using invisible Unicode characters.
                  The output looks like a normal message: <span className="text-2xl">😂🔥🎉😎⚡</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/image-encode"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyber-purple px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-cyber-purple/80 hover:-translate-y-0.5"
                  >
                    <ImageIcon size={16} /> Image Smuggler
                  </Link>
                  <Link
                    to="/image-decode"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
                  >
                    <Download size={16} /> Extract Images
                  </Link>
                </div>
              </div>

              {/* Right: feature pills */}
              <div className="flex-shrink-0 grid grid-cols-2 gap-3 w-full lg:w-64">
                {[
                  { icon: <Zap size={14} />, label: 'Auto Compress', color: 'text-cyber-green' },
                  { icon: <Lock size={14} />, label: 'AES Encrypt', color: 'text-cyber-purple' },
                  { icon: <EyeOff size={14} />, label: 'Zero-Width Hide', color: 'text-cyber-blue' },
                  { icon: <Shield size={14} />, label: 'Local Only', color: 'text-white' },
                  { icon: <Download size={14} />, label: 'Download Image', color: 'text-cyber-green' },
                  { icon: <Sparkles size={14} />, label: 'Emoji Packs', color: 'text-cyber-purple' },
                ].map(({ icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3">
                    <span className={color}>{icon}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      <section className="px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-cyber-green/15 via-white/[0.04] to-cyber-purple/15 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyber-green">
                <KeyRound size={16} />
                Ready when you are
              </div>
              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">Start with the encoder, then decode anything you receive.</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                to="/encode"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:bg-cyber-green"
              >
                Encode
                <Lock size={16} />
              </Link>
              <Link
                to="/decode"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                Decode
                <Unlock size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
