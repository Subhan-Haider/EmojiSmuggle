import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Info, Settings as SettingsIcon, LayoutDashboard, Menu, X, ChevronRight, Image as ImageIcon, Ghost, Link as LinkIcon, Instagram, Github, Globe, Music } from 'lucide-react';

const TikTokIcon = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-1.561 4.755 4.755 0 0 1-1.161-3.183h-3.48v15.011a4.135 4.135 0 1 1-4.135-4.135 4.11 4.11 0 0 1 2.395.772V10.01a7.618 7.618 0 0 0-2.395-.386 7.625 7.625 0 1 0 7.625 7.625v-8.8a8.318 8.318 0 0 0 5.12 1.745z" />
  </svg>
);
import MatrixBackground from './components/MatrixBackground';
import EmojiParticles from './components/EmojiParticles';
import Landing from './pages/Landing';
import Encoder from './pages/Encoder';
import Decoder from './pages/Decoder';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Legal from './pages/Legal';
import ImageEncoder from './pages/ImageEncoder';
import ImageDecoder from './pages/ImageDecoder';
import Developers from './pages/Developers';
import Contact from './pages/Contact';
import { useApp } from './context/AppContext';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings } = useApp();
  void settings;

  return (
    <Router>
      <div className="min-h-screen relative flex flex-col font-sans selection:bg-cyber-green/30 selection:text-white">
        <MatrixBackground />
        <EmojiParticles />
        <div className="scanline fixed inset-0 pointer-events-none z-50" />
        
        {/* Premium Floating Navbar */}
        <header className="fixed top-3 md:top-6 left-0 w-full z-[100] px-3 md:px-6">
          <nav className="max-w-5xl mx-auto glass px-4 md:px-5 py-3 flex justify-between items-center bg-black/55 backdrop-blur-3xl shadow-2xl shadow-black/40 rounded-2xl">
            <Link to="/" className="flex items-center gap-3 group mx-auto md:mx-0" aria-label="EmojiSmuggle home">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-green to-cyber-purple rounded-2xl flex items-center justify-center shadow-lg shadow-cyber-green/20 group-hover:rotate-12 transition-transform duration-500">
                <Ghost className="text-white w-6 h-6" />
              </div>
              <span className="text-lg font-black uppercase tracking-tight text-white">
                Emoji<span className="text-cyber-green">Smuggle</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />} text="Console" />
              <NavLink to="/encode" icon={<Lock size={16} />} text="Text" />
              <NavLink to="/decode" icon={<Unlock size={16} />} text="Decode" />
              <NavLink to="/image-encode" icon={<ImageIcon size={16} />} text="Images" />
              <NavLink to="/about" icon={<Info size={16} />} text="Docs" />
              
              <div className="w-px h-6 bg-white/10 mx-2" />
              
              <Link to="/settings" className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <SettingsIcon size={20} />
              </Link>
            </div>
          </nav>


        </header>

        {/* Dynamic Content Area */}
        <main className="flex-grow pt-24 md:pt-32 pb-28 md:pb-20">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/encode" element={<PageWrapper><Encoder /></PageWrapper>} />
              <Route path="/decode" element={<PageWrapper><Decoder /></PageWrapper>} />
              <Route path="/image-encode" element={<PageWrapper><ImageEncoder /></PageWrapper>} />
              <Route path="/image-decode" element={<PageWrapper><ImageDecoder /></PageWrapper>} />
              <Route path="/developers" element={<PageWrapper><Developers /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/privacy" element={<PageWrapper><Legal type="privacy" /></PageWrapper>} />
              <Route path="/terms" element={<PageWrapper><Legal type="terms" /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>

        <SiteFooter />
        {/*
        <footer className="py-12 border-t border-white/5">
           <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] mb-1">Carrier Protocol</span>
                    <span className="text-xs font-mono text-gray-400">ZW-v3.0.4 // ENCRYPTED</span>
                 </div>
              </div>
              <div className="flex gap-10 text-[11px] font-medium text-gray-500 uppercase tracking-widest">
                 <Link to="/about" className="hover:text-white transition-all">Protocol Docs</Link>
                 <Link to="/settings" className="hover:text-white transition-all">Node Settings</Link>
                 <a href="#" className="hover:text-white transition-all">Source Code</a>
              </div>
              <div className="text-[10px] text-gray-600 font-mono">
                 © 2026 EMOJISMUGGLE LABS
              </div>
           </div>
        </footer>
        */}
        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/85 backdrop-blur-3xl border-t border-white/10 px-4 py-2 flex justify-around items-center pb-safe">
          <MobileTabLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Console" />
          <MobileTabLink to="/encode" icon={<Lock size={20} />} label="Text" />
          <MobileTabLink to="/decode" icon={<Unlock size={20} />} label="Decode" />
          <MobileTabLink to="/image-encode" icon={<ImageIcon size={20} />} label="Images" />
          <MobileTabLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
        </div>
      </div>
    </Router>
  );
};

const SiteFooter = () => {
  const groups = [
    {
      title: 'Product',
      links: [
        { label: 'Text Encoder', to: '/encode' },
        { label: 'Text Decoder', to: '/decode' },
        { label: 'Image Smuggler', to: '/image-encode' },
        { label: 'Image Extractor', to: '/image-decode' },
        { label: 'Developers', to: '/developers' },
        { label: 'Console', to: '/dashboard' },
        { label: 'Settings', to: '/settings' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', to: '/about' },
        { label: 'Protocol docs', to: '/about' },
        { label: 'Contact Us', to: '/contact' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms & Conditions', to: '/terms' },
      ],
    },
    {
      title: 'Network',
      links: [
        { label: 'https://www.lootops.me', to: 'https://www.lootops.me', external: true, icon: <Globe size={14} /> },
        { label: 'https://lootops.website', to: 'https://lootops.website', external: true, icon: <Globe size={14} /> },
        { label: 'https://subhan.tech', to: 'https://subhan.tech', external: true, icon: <Globe size={14} /> },
        { label: 'https://codelens.site', to: 'https://codelens.site', external: true, icon: <Globe size={14} /> },
        { label: 'https://codiner.online', to: 'https://codiner.online', external: true, icon: <Globe size={14} /> },
        { label: 'https://blizflow.online', to: 'https://blizflow.online', external: true, icon: <Globe size={14} /> },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-black/30 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.2fr_1fr_1fr_1.5fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 group" aria-label="EmojiSmuggle home">
            <div className="w-10 h-10 bg-gradient-to-br from-cyber-green to-cyber-purple rounded-2xl flex items-center justify-center shadow-lg shadow-cyber-green/20 group-hover:rotate-12 transition-transform duration-500">
              <Ghost className="text-white w-6 h-6" />
            </div>
            <span className="text-lg font-black uppercase tracking-tight text-white">
              Emoji<span className="text-cyber-green">Smuggle</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
            A local-first tool for hiding short private messages inside emoji carriers using invisible Unicode characters.
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-600">
            ZW-v3.0.4 / local protocol
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a href="https://github.com/Subhan-Haider" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all shadow-lg">
              <Github size={20} />
            </a>
            <a href="https://instagram.com/subhan_haid" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all shadow-lg">
              <Instagram size={20} />
            </a>
            <a href="https://tiktok.com/@s.subhan.haider" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all shadow-lg">
              <Music size={20} />
            </a>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">{group.title}</h2>
            <div className="mt-5 grid gap-3">
              {group.links.map((link) => (
                link.external ? (
                  <a key={`${group.title}-${link.label}`} href={link.to} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-white">
                    {link.icon && <span className="text-gray-600">{link.icon}</span>}
                    {link.label}
                  </a>
                ) : (
                  <Link key={`${group.title}-${link.label}`} to={link.to} className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-white">
                    {link.icon && <span className="text-gray-600">{link.icon}</span>}
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 px-6 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 EmojiSmuggle Labs. All rights reserved.</span>
        <span>Built for private notes, puzzles, and local-first experiments.</span>
      </div>
    </footer>
  );
};

const NavLink = ({ to, icon, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`relative px-4 py-2 flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-wider transition-all rounded-xl group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
    >
      <span className={isActive ? 'text-cyber-green' : 'text-gray-500 group-hover:text-gray-300'}>{icon}</span>
      {text}
      {isActive && (
        <motion.div 
          layoutId="nav-pill" 
          className="absolute inset-0 bg-white/[0.05] border border-white/10 -z-10 rounded-xl" 
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

const MobileNavLink = ({ to, text, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl group active:bg-white/10 transition-all"
  >
    <span className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">{text}</span>
    <ChevronRight size={18} className="text-gray-600 group-hover:text-cyber-green" />
  </Link>
);

const MobileTabLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all gap-1 cursor-pointer ${isActive ? 'text-cyber-green' : 'text-gray-500 hover:text-white'}`}
    >
      <span className="transition-transform duration-300 active:scale-75">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
    </Link>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="max-w-7xl mx-auto w-full px-6"
  >
    {children}
  </motion.div>
);

export default App;
