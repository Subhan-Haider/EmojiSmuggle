import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, Terminal, ShieldCheck, Key, AlertTriangle, FileUp, Clipboard, Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { extractMessage } from '../utils/stego';
import { decodeImageFromEmoji, fmtBytes } from '../utils/imageStego';
import { useApp } from '../context/AppContext';

const Decoder = () => {
  const { addToHistory } = useApp();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDecode = () => {
    setIsDecoding(true);
    setTimeout(() => {
      const imgRes = decodeImageFromEmoji(input, password);
      
      if (imgRes.success || ['PASSWORD_REQUIRED', 'WRONG_PASSWORD', 'DECOMPRESSION_FAILED', 'CORRUPTED_PAYLOAD', 'PAYLOAD_TOO_SHORT'].includes(imgRes.error)) {
        setResult({ ...imgRes, type: 'image' });
        setIsDecoding(false);
        if (imgRes.success) addToHistory({ type: 'image-decode', isEncrypted: imgRes.isEncrypted });
      } else {
        const txtRes = extractMessage(input, password);
        if (txtRes.success && txtRes.data && txtRes.data.startsWith('IMAGE_STAMP:')) {
          const b64 = txtRes.data.replace('IMAGE_STAMP:', '');
          setResult({
            success: true,
            type: 'image',
            dataUrl: `data:image/jpeg;base64,${b64}`,
            byteLength: Math.floor(b64.length * 0.75),
            isEncrypted: txtRes.encrypted
          });
          setIsDecoding(false);
          addToHistory({ type: 'image-decode', isEncrypted: txtRes.encrypted });
        } else {
          setResult({ ...txtRes, type: 'text' });
          setIsDecoding(false);
          if (txtRes.success) addToHistory({ type: 'decode', payload: txtRes.data, isEncrypted: txtRes.encrypted });
        }
      }
    }, 800);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (re) => setInput(re.target.result);
      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-cyber-purple/20 rounded-xl">
          <Unlock className="text-cyber-purple" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest neon-text-purple">Extraction Module</h1>
          <p className="text-gray-500 text-sm font-mono italic">DECRYPT_AUTH: INITIALIZED</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Input & Drop Zone */}
        <div className="space-y-6">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`glass p-8 border-2 transition-all relative ${isDragging ? 'border-cyber-purple bg-cyber-purple/10 scale-105' : 'border-white/5 border-dashed'}`}
          >
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Inbound transmission</label>
            <textarea
              className="cyber-input h-64 resize-none font-mono text-xl bg-transparent border-none p-0 focus:ring-0"
              placeholder="Paste emoji cluster or drop .txt file here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            
            <div className="flex justify-between items-center mt-6">
               <div className="flex gap-2">
                 <button onClick={() => setInput('')} className="p-2 text-gray-600 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
               </div>
               <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                 <FileUp size={12} /> DROP_FILE_TO_LOAD
               </div>
            </div>
          </div>

          <div className="glass p-6 border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Key size={12} className="text-cyber-purple" /> Decryption Pass-key
            </label>
            <input
              type="password"
              className="cyber-input py-3 text-sm"
              placeholder="Enter key if encrypted..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            onClick={handleDecode}
            disabled={!input || isDecoding}
            className="w-full py-5 bg-cyber-purple text-black font-black uppercase tracking-[0.3em] rounded-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {isDecoding ? 'OVERRIDING_ENCRYPTION...' : 'EXECUTE_DECODE'}
          </button>
        </div>

        {/* Right: Results Monitor */}
        <div className="flex flex-col">
          <div className="glass p-8 flex-grow border-cyber-purple/20 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-purple/5 blur-3xl -z-10" />
             
             <div className="flex items-center gap-2 mb-8">
               <ShieldCheck size={14} className="text-cyber-purple" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decrypted Data Node</span>
             </div>

             <div className={`flex-grow bg-black/60 rounded-2xl p-8 border border-white/5 transition-all duration-500 flex items-center justify-center text-center ${result?.success ? 'border-cyber-green/40 shadow-[0_0_30px_rgba(0,255,65,0.1)]' : ''}`}>
                <AnimatePresence mode="wait">
                  {isDecoding ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 w-full px-12"
                    >
                      <div className="h-2 bg-cyber-purple/20 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="h-full w-1/2 bg-cyber-purple"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-cyber-purple animate-pulse">PARSING_UNICODE_OFFSETS...</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                    >
                      {result.success ? (
                        <div className="space-y-4">
                           {result.type === 'image' ? (
                             <div className="flex flex-col items-center gap-4">
                               <img src={result.dataUrl} alt="Decoded" className="max-h-48 rounded-xl border border-white/10 shadow-lg" />
                               <div className="text-[10px] text-gray-400 font-mono">SIZE: {fmtBytes(result.byteLength)}</div>
                             </div>
                           ) : (
                             <div className="text-2xl font-bold text-white break-words leading-relaxed">
                               "{result.data}"
                             </div>
                           )}
                           <div className="flex items-center justify-center gap-4 pt-4">
                              <span className="text-[8px] font-mono py-1 px-2 bg-cyber-green/10 text-cyber-green rounded border border-cyber-green/20 uppercase tracking-widest">Integrity: 100%</span>
                              {(result.encrypted || result.isEncrypted) && <span className="text-[8px] font-mono py-1 px-2 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 uppercase tracking-widest">AES-256 Verified</span>}
                           </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-red-500">
                          <AlertTriangle className="mx-auto" size={32} />
                          <div className="font-mono text-xs uppercase tracking-widest">
                            {result.error === 'WRONG_PASSWORD' ? 'ACCESS_DENIED: WRONG_KEY' : 
                             result.error === 'PASSWORD_REQUIRED' ? 'ENCRYPTION_DETECTED: KEY_REQUIRED' : 
                             'NO_DATA_OFFSETS_FOUND'}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="text-gray-800 text-sm font-mono uppercase tracking-[0.2em]">Awaiting inbound stream</div>
                  )}
                </AnimatePresence>
             </div>

             {result?.success && (
                <div className="mt-8 flex gap-4">
                  {result.type === 'image' ? (
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = result.dataUrl;
                        a.download = `decoded_image_${Date.now()}.jpg`;
                        a.click();
                      }}
                      className="flex-grow py-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Download Image
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.data)}
                      className="flex-grow py-3 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Clipboard size={14} /> Copy Secret
                    </button>
                  )}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Decoder;
