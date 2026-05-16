import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, RefreshCw, Download, Share2, Terminal, ShieldAlert, Key, QrCode, Save, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { smuggleMessage, getRandomEmojis } from '../utils/stego';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const Encoder = () => {
  const { addToHistory, settings } = useApp();
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [emojiTemplate, setEmojiTemplate] = useState('📦');
  const [encoded, setEncoded] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (text) {
      const result = smuggleMessage(text, password, emojiTemplate);
      setEncoded(result);
    } else {
      setEncoded('');
    }
  }, [text, password, emojiTemplate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(encoded);
    if (settings.sounds) {
      // Trigger success sound or visual feedback
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#00ff41', '#bc13fe']
      });
    }
  };

  const handleSave = () => {
    addToHistory({
      type: 'encode',
      payload: text,
      carrier: emojiTemplate,
      isEncrypted: !!password
    });
    alert('TRANSMISSION_SAVED_TO_LOCAL_NODE');
  };

  const handleRandomize = () => {
    setEmojiTemplate(getRandomEmojis(Math.floor(Math.random() * 3) + 1));
  };

  const downloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([encoded], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `smuggle_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyber-green/20 rounded-xl">
            <Terminal className="text-cyber-green" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest neon-text-green">Smuggling Console</h1>
            <p className="text-gray-500 text-sm font-mono italic">OPERATOR_ACCESS: GRANTED</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
           <div className="glass px-4 py-2 border-white/5 flex items-center gap-2">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-[10px] font-mono text-gray-400">LATENCY: 12ms</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Input Console */}
        <div className="space-y-8">
          <div className="glass p-8 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 block">Payload Injection</label>
            <textarea
              className="cyber-input h-40 resize-none font-mono text-sm leading-relaxed"
              placeholder="Inject secret message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 border-white/5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Key size={12} className="text-cyber-purple" /> Cryptographic Key
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="cyber-input py-2 text-xs"
                placeholder="Optional pass-key..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="text-[8px] text-gray-600 mt-2 uppercase font-bold hover:text-gray-400 transition-all"
              >
                {showPassword ? "Hide Key" : "Reveal Key"}
              </button>
            </div>

            <div className="glass p-6 border-white/5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert size={12} className="text-cyber-green" /> Carrier Shells
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="cyber-input py-2 text-center text-lg"
                  value={emojiTemplate}
                  onChange={(e) => setEmojiTemplate(e.target.value)}
                />
                <button 
                  onClick={() => setEmojiTemplate(getRandomEmojis(settings.emojiPack || 'cyberpunk', Math.floor(Math.random() * 3) + 1))}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-cyber-green"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {(import.meta.env.VITE_EMOJI_LIST || ['🕵️', '📦', '💾', '🔐', '📡', '⚡', '👽', '💀']).map(e => (
                  <button 
                    key={e}
                    onClick={() => setEmojiTemplate(prev => prev + e)}
                    className="w-8 h-8 flex items-center justify-center bg-white/5 rounded hover:bg-white/10 transition-all text-lg"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Output Monitor */}
        <div className="space-y-6 flex flex-col">
          <div className="glass p-8 border-cyber-green/20 flex-grow flex flex-col overflow-hidden relative">
            {/* Pulsing Glow Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-green/50 to-transparent animate-pulse" />
            
            <div className="flex justify-between items-center mb-6">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Digital Manifest</span>
               <div className="flex gap-2">
                  <button onClick={() => setShowQR(!showQR)} className={`p-2 rounded-lg transition-all ${showQR ? 'bg-cyber-green text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                    <QrCode size={16} />
                  </button>
               </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {showQR && encoded ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-6 bg-white rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  >
                    <QRCodeSVG value={encoded} size={200} level="H" />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full"
                  >
                    <div className="bg-black/60 rounded-2xl p-8 min-h-[180px] break-all font-mono text-3xl text-center border border-white/5 flex items-center justify-center">
                      {encoded || <span className="text-gray-800 italic text-sm">NO_DATA_STREAM_DETECTED</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8">
              <button 
                onClick={handleCopy}
                disabled={!encoded}
                className="flex items-center justify-center gap-2 py-4 bg-cyber-green text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
              >
                <Copy size={14} /> Copy
              </button>
              <button 
                onClick={handleSave}
                disabled={!encoded}
                className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <Save size={14} /> Save
              </button>
              <button 
                onClick={downloadTxt}
                disabled={!encoded}
                className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <Download size={14} /> Txt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encoder;
