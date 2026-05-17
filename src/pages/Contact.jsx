import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Instagram, Terminal, ShieldCheck, Globe, Cpu, Play } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-1.561 4.755 4.755 0 0 1-1.161-3.183h-3.48v15.011a4.135 4.135 0 1 1-4.135-4.135 4.11 4.11 0 0 1 2.395.772V10.01a7.618 7.618 0 0 0-2.395-.386 7.625 7.625 0 1 0 7.625 7.625v-8.8a8.318 8.318 0 0 0 5.12 1.745z" />
  </svg>
);

const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded-full text-xs font-mono mb-4 uppercase tracking-[0.2em]"
        >
          <Terminal size={12} className="animate-pulse" />
          Direct Communications Protocol
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-purple">Console</span>
        </h1>
        <p className="max-w-xl mx-auto text-sm text-slate-400 leading-6">
          Connect directly with the EmojiSmuggle Labs core nodes for inquiries, bug reports, and integrations.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Card: Direct Communication Channels */}
        <div className="glass bg-black/45 backdrop-blur-3xl p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-green/5 blur-3xl -z-10 rounded-full" />
          
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2.5">
              <Mail size={20} className="text-cyber-green" /> Support Channels
            </h3>
            <p className="text-sm text-slate-400 leading-6 mb-6">
              Connect directly through standard communication links. Click any address below to initiate a request:
            </p>
            
            <div className="space-y-4">
              <a 
                href="mailto:support@subhan.tech" 
                className="block p-5 bg-white/5 border border-white/5 hover:border-cyber-green/40 hover:bg-cyber-green/5 rounded-2xl text-slate-350 hover:text-white transition-all group"
              >
                <span className="text-slate-500 block mb-2 text-[10px] uppercase font-bold tracking-widest">Global Communications Node</span>
                <span className="font-mono text-base text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-purple font-black">support@subhan.tech</span>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans group-hover:text-slate-400 transition-colors">
                  Submit stego bug reports, developer API integrations, Android package inquiries, or partnership opportunities.
                </p>
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Core Node Address</span>
            <div className="font-mono text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-white/5">
              HOST: emoji.subhan.tech<br />
              PORT: 443 // SSL_VERIFIED
            </div>
          </div>
        </div>

        {/* Right Card: Social Networks & Protocols */}
        <div className="space-y-6">
          {/* Official Channels */}
          <div className="glass bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Globe size={16} className="text-cyber-green" /> Official Networks
            </h3>
            <p className="text-xs text-slate-400 leading-5 mb-5">
              Follow developers, report issues, and check live stego developments across our official accounts:
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              <a 
                href="https://github.com/Subhan-Haider" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1 rounded-2xl text-gray-400 hover:text-white transition-all text-center gap-2 group shadow-lg"
              >
                <Github size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">GitHub</span>
              </a>
              
              <a 
                href="https://instagram.com/subhan_haid" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 hover:border-cyber-purple/30 hover:bg-cyber-purple/5 hover:-translate-y-1 rounded-2xl text-gray-400 hover:text-white transition-all text-center gap-2 group shadow-lg"
              >
                <Instagram size={20} className="group-hover:text-cyber-purple" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-sans">Instagram</span>
              </a>
              
              <a 
                href="https://tiktok.com/@s.subhan.haider" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 hover:border-cyber-green/30 hover:bg-cyber-green/5 hover:-translate-y-1 rounded-2xl text-gray-400 hover:text-white transition-all text-center gap-2 group shadow-lg"
              >
                <TikTokIcon size={20} className="group-hover:text-cyber-green" />
                <span className="text-[10px] font-bold uppercase tracking-wider">TikTok</span>
              </a>
            </div>
          </div>

          {/* Security Core Card */}
          <div className="glass bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyber-purple" /> Security Shield
            </h3>
            <p className="text-xs text-slate-400 leading-5">
              EmojiSmuggle operates strictly as a local-first cryptography product. All hidden message payloads are generated and decrypted locally in your browser/device—no data ever touches our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
