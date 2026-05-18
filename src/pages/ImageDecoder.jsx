import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Unlock, Download, AlertTriangle, CheckCircle, Key,
  Eye, EyeOff, Cpu, Image as ImageIcon, Scan, Copy
} from 'lucide-react';
import { decodeImageFromEmoji, countHiddenChars, fmtBytes } from '../utils/imageStego';
import { extractMessage } from '../utils/stego';
import { useApp } from '../context/AppContext';

const SAMPLE = '🕵️📦💾💿🔌💻📡🔋⚡🌃🔒👁️🤫👾🦾🕵️📦💾💿🔌';

const ImageDecoder = () => {
  const { addToHistory } = useApp();

  const [input, setInput]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [decoding, setDecoding]   = useState(false);
  const [result, setResult]       = useState(null); // { dataUrl, byteLength, isEncrypted }
  const [error, setError]         = useState('');
  const [revealed, setRevealed]   = useState(false);
  const [copied, setCopied]       = useState(false);

  const hiddenCount = input ? countHiddenChars(input) : 0;
  const hasHiddenData = hiddenCount > 0;

  const handleDecode = async () => {
    if (!input.trim()) return;
    setDecoding(true);
    setError('');
    setResult(null);
    setRevealed(false);
    await new Promise(r => setTimeout(r, 800));

    let res = decodeImageFromEmoji(input, password);
    
    // Fallback for Android IMAGE_STAMP payloads
    if (!res.success && res.error === 'NO_IMAGE_PAYLOAD_DETECTED') {
      const txtRes = extractMessage(input, password);
      if (txtRes.success && txtRes.data && txtRes.data.startsWith('IMAGE_STAMP:')) {
        const b64 = txtRes.data.replace('IMAGE_STAMP:', '');
        res = {
          success: true,
          dataUrl: `data:image/jpeg;base64,${b64}`,
          byteLength: Math.floor(b64.length * 0.75),
          isEncrypted: txtRes.encrypted || false
        };
      }
    }

    if (res.success) {
      setResult(res);
      setTimeout(() => setRevealed(true), 300);
      addToHistory({ type: 'image-decode', isEncrypted: res.isEncrypted });
    } else {
      setError(res.error);
    }
    setDecoding(false);
  };

  const handleDownload = () => {
    if (!result?.dataUrl) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = `decoded_image_${Date.now()}.jpg`;
    a.click();
  };

  const handleCopyImage = async () => {
    if (!result?.dataUrl) return;
    try {
      const res = await fetch(result.dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/20 rounded-2xl">
          <Scan className="text-cyber-purple" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest neon-text-purple">Image Extractor</h1>
          <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">Recover hidden images from emoji streams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input */}
        <div className="space-y-6">
          <div className="glass p-6 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 block">
              01 — Paste Encoded Emoji Message
            </label>
            <textarea
              rows={6}
              className="cyber-input resize-none font-mono text-2xl leading-relaxed tracking-widest"
              placeholder={`Paste emoji message here...\n\ne.g. ${SAMPLE}`}
              value={input}
              onChange={e => { setInput(e.target.value); setResult(null); setError(''); }}
            />

            {/* Hidden data scanner */}
            <AnimatePresence>
              {input && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-lg
                    ${hasHiddenData ? 'bg-cyber-green/10 text-cyber-green' : 'bg-white/5 text-gray-500'}`}>
                  {hasHiddenData ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  {hasHiddenData
                    ? `PAYLOAD DETECTED: ${hiddenCount.toLocaleString()} hidden chars`
                    : 'No hidden data detected in this string'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="glass p-6 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 block">
              <Key size={11} className="text-cyber-purple" /> 02 — Decryption Key (if encrypted)
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="cyber-input pr-10 text-sm"
                placeholder="Leave empty if no encryption was used..."
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Decode Button */}
          <button
            onClick={handleDecode}
            disabled={!input.trim() || decoding}
            className="w-full cyber-button py-5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #bc13fe, #0ea5e9)' }}
          >
            {decoding ? (
              <><Cpu className="animate-spin" size={20} /> Extracting Hidden Image...</>
            ) : (
              <><Unlock size={20} /> Decode Image Payload</>
            )}
          </button>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 font-mono text-xs">
                <AlertTriangle size={16} />
                <div>
                  <p className="font-bold">{error}</p>
                  {error === 'PASSWORD_REQUIRED' && <p className="mt-1 text-red-400/70">This image was encoded with a password. Enter the key above.</p>}
                  {error === 'NO_IMAGE_PAYLOAD_DETECTED' && <p className="mt-1 text-red-400/70">This string doesn't contain hidden image data. Make sure you copied the full emoji message.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Output */}
        <div className="space-y-6">
          <div className="glass p-6 border-cyber-purple/10 relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-purple/50 to-transparent animate-pulse" />

            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Decoded Image</p>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result"
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: revealed ? 'blur(0px)' : 'blur(20px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Reveal animation overlay */}
                  <div className="relative group">
                    <img
                      src={result.dataUrl}
                      alt="Decoded hidden image"
                      className="w-full rounded-2xl object-contain max-h-72 shadow-2xl shadow-cyber-purple/20"
                    />
                    {/* Success badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-cyber-green/90 text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-full">
                      <CheckCircle size={10} /> Extracted
                    </div>
                    {result.isEncrypted && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-cyber-purple/90 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full">
                        <Key size={10} /> Decrypted
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-cyber-purple font-black">{fmtBytes(result.byteLength)}</div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Image Size</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-cyber-green font-black">{result.isEncrypted ? 'AES-256' : 'None'}</div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Encryption</div>
                    </div>
                  </div>

                  {/* Download / Copy */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleDownload}
                      className="flex items-center justify-center gap-2 py-3 bg-cyber-purple text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
                      <Download size={14} /> Download
                    </button>
                    <button onClick={handleCopyImage}
                      className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all">
                      {copied ? <CheckCircle size={14} className="text-cyber-green" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Image'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-700" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">Awaiting Payload</p>
                    <p className="text-gray-700 text-[10px] mt-2">Paste an encoded emoji message and click Decode</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scanner info */}
          <div className="glass p-6 border-white/5 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Decoder Pipeline</p>
            {[
              ['01', 'Scans string for zero-width Unicode chars'],
              ['02', 'Verifies header/footer signature markers'],
              ['03', 'Extracts binary bits from ZW characters'],
              ['04', 'Decrypts payload (if password protected)'],
              ['05', 'Decompresses bytes → original JPEG'],
            ].map(([n, t]) => (
              <div key={n} className="flex items-start gap-3 text-xs">
                <span className="text-cyber-purple font-mono font-bold flex-shrink-0">{n}</span>
                <span className="text-gray-400">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDecoder;
