import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Zap, Copy, Download, Share2,
  RefreshCw, Key, Lock, CheckCircle, QrCode, Save, AlertTriangle,
  Eye, EyeOff, ChevronDown, Cpu
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  compressImage, encodeImageToEmoji, generateEmojiSequence,
  IMAGE_EMOJI_PACKS, countHiddenChars, fmtBytes
} from '../utils/imageStego';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

// ── Drag-and-drop upload zone ─────────────────────────────────────────────────
const DropZone = ({ onFile, preview }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) onFile(f);
  }, [onFile]);

  const handleChange = e => {
    const f = e.target.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden min-h-[200px] flex items-center justify-center
        ${dragging ? 'border-cyber-green bg-cyber-green/10 scale-[1.01]' : 'border-white/10 hover:border-cyber-green/50 hover:bg-white/[0.02]'}`}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center gap-4 p-4"
          >
            <img src={preview.dataUrl} alt="preview" className="max-h-48 rounded-xl object-contain shadow-lg shadow-cyber-green/10" />
            <div className="flex gap-6 text-xs font-mono text-gray-500">
              <span>📐 {preview.w}×{preview.h}px</span>
              <span>💾 {fmtBytes(preview.compressedSize)}</span>
              <span className="text-cyber-green">📉 {Math.round((1 - preview.compressedSize / preview.originalSize) * 100)}% saved</span>
            </div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Click to replace image</p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 p-8 text-center pointer-events-none"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-cyber-green/20' : 'bg-white/5'}`}>
              <Upload size={28} className={dragging ? 'text-cyber-green' : 'text-gray-600'} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Drop Image Here</p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP, GIF • Click to browse</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Step indicator ─────────────────────────────────────────────────────────────
const StepBadge = ({ step, label, active, done }) => (
  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${done ? 'text-cyber-green' : active ? 'text-white' : 'text-gray-600'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
      ${done ? 'bg-cyber-green text-black' : active ? 'bg-white text-black' : 'bg-white/10 text-gray-500'}`}>
      {done ? '✓' : step}
    </div>
    {label}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const ImageEncoder = () => {
  const { addToHistory } = useApp();

  const [imageData, setImageData]       = useState(null); // { compressed, dataUrl, w, h, originalSize, compressedSize }
  const [processing, setProcessing]     = useState(false);
  const [emojiPack, setEmojiPack]       = useState('cyberpunk');
  const [emojiCount, setEmojiCount]     = useState(20);
  const [emojiSeq, setEmojiSeq]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [encoded, setEncoded]           = useState('');
  const [encoding, setEncoding]         = useState(false);
  const [copied, setCopied]             = useState(false);
  const [showQR, setShowQR]             = useState(false);
  const [showBinary, setShowBinary]     = useState(false);
  const [error, setError]               = useState('');

  // Current step for progress indicator
  const step = !imageData ? 0 : !encoded ? 1 : 2;

  const handleFile = async file => {
    setError('');
    setEncoded('');
    setProcessing(true);
    try {
      const result = await compressImage(file, 120, 0.45);
      setImageData(result);
      // Auto-generate emoji sequence
      const seq = generateEmojiSequence(emojiPack, emojiCount);
      setEmojiSeq(seq);
    } catch (e) {
      setError('IMAGE_LOAD_FAILED: ' + e.message);
    }
    setProcessing(false);
  };

  const handleEncode = async () => {
    if (!imageData) return;
    setEncoding(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // simulate processing
    try {
      const seq = emojiSeq || generateEmojiSequence(emojiPack, emojiCount);
      const result = encodeImageToEmoji(imageData.compressed, seq, password);
      setEncoded(result);
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 }, colors: ['#00ff41', '#bc13fe'] });
      addToHistory({ type: 'image-encode', carrier: seq.slice(0, 10), isEncrypted: !!password });
    } catch (e) {
      setError('ENCODING_FAILED: ' + e.message);
    }
    setEncoding(false);
  };

  const handleCopy = () => {
    if (!encoded) return;
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!encoded) return;
    const blob = new Blob([encoded], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `smuggled_image_${Date.now()}.txt`;
    a.click();
  };

  const handleRandomizeEmoji = () => {
    const seq = generateEmojiSequence(emojiPack, emojiCount);
    setEmojiSeq(seq);
    setEncoded('');
  };

  const hiddenCount = encoded ? countHiddenChars(encoded) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-cyber-green/10 border border-cyber-green/20 rounded-2xl">
            <ImageIcon className="text-cyber-green" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest neon-text-green">Image Smuggler</h1>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Hide images inside emoji streams</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-6 mt-6 flex-wrap">
          <StepBadge step={1} label="Upload" active={step === 0} done={step > 0} />
          <div className="h-px w-8 bg-white/10" />
          <StepBadge step={2} label="Configure" active={step === 1} done={step > 1} />
          <div className="h-px w-8 bg-white/10" />
          <StepBadge step={3} label="Encode" active={step === 2} done={false} />
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 font-mono text-xs">
          <AlertTriangle size={16} />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Drop Zone */}
          <div className="glass p-6 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 block">
              01 — Image Payload
            </label>
            {processing ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center gap-4">
                <Cpu className="text-cyber-green animate-spin" size={32} />
                <p className="text-xs font-mono text-gray-500 uppercase">Compressing image...</p>
              </div>
            ) : (
              <DropZone onFile={handleFile} preview={imageData} />
            )}
          </div>

          {/* Emoji Pack Selector */}
          <div className="glass p-6 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 block">
              02 — Carrier Emoji Pack
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.keys(IMAGE_EMOJI_PACKS).map(pack => (
                <button
                  key={pack}
                  onClick={() => { setEmojiPack(pack); setEncoded(''); }}
                  className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border
                    ${emojiPack === pack
                      ? 'bg-cyber-green text-black border-cyber-green'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'}`}
                >
                  {pack}
                </button>
              ))}
            </div>

            {/* Emoji preview */}
            <div className="bg-black/40 rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-2xl tracking-widest break-all leading-loose">
                {emojiSeq || generateEmojiSequence(emojiPack, 10)}
              </span>
              <button onClick={handleRandomizeEmoji}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-cyber-green flex-shrink-0">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Count slider */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                <span>Emoji Count</span>
                <span className="text-cyber-green">{emojiCount}</span>
              </div>
              <input type="range" min={8} max={50} value={emojiCount}
                onChange={e => { setEmojiCount(+e.target.value); setEncoded(''); }}
                className="w-full accent-[#00ff41] cursor-pointer" />
            </div>
          </div>

          {/* Password */}
          <div className="glass p-6 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 block">
              <Key size={11} className="text-cyber-purple" /> 03 — AES Encryption Key (Optional)
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="cyber-input pr-10 text-sm"
                placeholder="Leave empty to skip encryption..."
                value={password}
                onChange={e => { setPassword(e.target.value); setEncoded(''); }}
              />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <p className="mt-2 text-[10px] text-cyber-purple font-mono">
                <Lock size={10} className="inline mr-1" />AES-256 encryption active
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Encode Button */}
          <button
            onClick={handleEncode}
            disabled={!imageData || encoding}
            className="w-full cyber-button py-5 text-base disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {encoding ? (
              <><Cpu className="animate-spin" size={20} /> Injecting Hidden Data...</>
            ) : (
              <><Zap size={20} /> Execute Image Smuggling</>
            )}
          </button>

          {/* Output */}
          <div className="glass p-6 border-cyber-green/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent animate-pulse" />

            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encoded Output</span>
              <div className="flex gap-2">
                {encoded && (
                  <>
                    <button onClick={() => setShowBinary(!showBinary)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all text-[10px] font-mono uppercase">
                      {showBinary ? 'Emoji' : 'Binary'}
                    </button>
                    <button onClick={() => setShowQR(!showQR)}
                      className={`p-1.5 rounded-lg transition-all ${showQR ? 'bg-cyber-green text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                      <QrCode size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showQR && encoded ? (
                <motion.div key="qr"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex justify-center p-4 bg-white rounded-2xl">
                  <QRCodeSVG value={encoded.slice(0, 800)} size={180} level="M" />
                </motion.div>
              ) : showBinary && encoded ? (
                <motion.div key="bin"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-black/60 rounded-xl p-4 min-h-[160px] font-mono text-[9px] text-cyber-green break-all leading-4 overflow-y-auto max-h-48">
                  {/* Show first 500 chars of binary preview */}
                  {Array.from(encoded).slice(0, 300).map((ch, i) => {
                    const isZW = ['\u200B','\u200C','\u200D','\uFEFF'].includes(ch);
                    return <span key={i} className={isZW ? 'text-cyber-purple' : 'text-cyber-green'}>{isZW ? '·' : ch}</span>;
                  })}
                  <span className="text-gray-600">...</span>
                </motion.div>
              ) : (
                <motion.div key="emoji"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-black/60 rounded-xl p-6 min-h-[160px] flex items-center justify-center">
                  {encoded ? (
                    <p className="text-4xl tracking-widest break-all text-center leading-loose select-all">{encoded}</p>
                  ) : (
                    <p className="text-gray-700 font-mono text-xs uppercase tracking-widest">
                      {imageData ? 'Ready to encode — click Execute above' : 'Upload an image to begin'}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats row */}
            {encoded && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-cyber-green font-black text-lg">{[...encoded].filter(c => !'\u200B\u200C\u200D\uFEFF'.includes(c)).length}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Emoji Carriers</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-cyber-purple font-black text-lg">{hiddenCount.toLocaleString()}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Hidden Chars</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-cyber-blue font-black text-lg">{imageData ? fmtBytes(imageData.compressedSize) : '—'}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Payload Size</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={handleCopy} disabled={!encoded}
              className="flex flex-col items-center gap-2 py-4 bg-cyber-green text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30">
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownload} disabled={!encoded}
              className="flex flex-col items-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all disabled:opacity-30">
              <Download size={16} />Save
            </button>
            <button
              onClick={() => navigator.share?.({ text: encoded, title: 'Secret Emoji Message' })}
              disabled={!encoded || !navigator.share}
              className="flex flex-col items-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all disabled:opacity-30">
              <Share2 size={16} />Share
            </button>
          </div>

          {/* How it works mini explainer */}
          <div className="glass p-6 border-white/5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">How it works</p>
            {[
              ['01', 'Image compressed to ~5-30KB JPEG'],
              ['02', 'Bytes converted to binary bits'],
              ['03', 'Bits mapped to Zero-Width Unicode chars (​‌)'],
              ['04', 'Invisible chars injected between emojis'],
              ['05', 'Output looks like a normal emoji message'],
            ].map(([n, t]) => (
              <div key={n} className="flex items-start gap-3 text-xs">
                <span className="text-cyber-green font-mono font-bold flex-shrink-0">{n}</span>
                <span className="text-gray-400">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEncoder;
