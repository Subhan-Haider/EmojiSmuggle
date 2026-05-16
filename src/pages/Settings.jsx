import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Volume2, VolumeX, Moon, Shield, Sparkles, RefreshCw, Terminal as TerminalIcon, Laptop } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings = () => {
  const { settings, setSettings } = useApp();

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, sounds: !prev.sounds }));
  };

  const updateTheme = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-white/10 rounded-xl">
          <SettingsIcon className="text-white" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest">Core Config</h1>
      </div>

      <div className="space-y-6">
        {/* Sound Toggle */}
        <div className="glass p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              {settings.sounds ? <Volume2 className="text-cyber-green"/> : <VolumeX className="text-red-500"/>}
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Acoustic Feedback</h3>
              <p className="text-xs text-gray-500">Enable UI sound effects during transmission</p>
            </div>
          </div>
          <button 
            onClick={toggleSound}
            className={`w-14 h-7 rounded-full relative transition-all ${settings.sounds ? 'bg-cyber-green' : 'bg-gray-700'}`}
          >
            <motion.div 
              animate={{ x: settings.sounds ? 30 : 4 }}
              className="w-5 h-5 bg-white rounded-full absolute top-1"
            />
          </button>
        </div>

        {/* Terminal Mode Toggle */}
        <div className="glass p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <TerminalIcon className="text-cyber-green"/>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-widest text-sm">Hacker Terminal</h3>
              <p className="text-xs text-gray-500">Enable interactive command-line interface</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings(prev => ({ ...prev, terminalMode: !prev.terminalMode }))}
            className={`w-14 h-7 rounded-full relative transition-all ${settings.terminalMode ? 'bg-cyber-green' : 'bg-gray-700'}`}
          >
            <motion.div 
              animate={{ x: settings.terminalMode ? 30 : 4 }}
              className="w-5 h-5 bg-white rounded-full absolute top-1"
            />
          </button>
        </div>

        {/* Theme Selection */}
        <div className="glass p-8">
           <h3 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
             <Moon size={16} /> Visual Protocol
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <ThemeOption 
                active={settings.theme === 'cyberpunk'} 
                label="Dark" 
                colors={['#00ff41', '#bc13fe']} 
                onClick={() => updateTheme('cyberpunk')}
              />
              <ThemeOption 
                active={settings.theme === 'light'} 
                label="Light" 
                colors={['#ffffff', '#059669']} 
                onClick={() => updateTheme('light')}
              />
              <ThemeOption 
                active={settings.theme === 'system'} 
                label="System" 
                colors={['#334155', '#94a3b8']} 
                onClick={() => updateTheme('system')}
              />
              <ThemeOption 
                active={settings.theme === 'matrix'} 
                label="Matrix" 
                colors={['#00ff41', '#003b00']} 
                onClick={() => updateTheme('matrix')}
              />
              <ThemeOption 
                active={settings.theme === 'phantom'} 
                label="Phantom" 
                colors={['#ffffff', '#1a1a1a']} 
                onClick={() => updateTheme('phantom')}
              />
           </div>
        </div>

        {/* Emoji Pack Selection */}
        <div className="glass p-8">
           <h3 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
             <Sparkles size={16} /> Emoji Carriers
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['cyberpunk', 'clandestine', 'nature', 'space', 'danger'].map(pack => (
                <button 
                  key={pack}
                  onClick={() => setSettings(prev => ({ ...prev, emojiPack: pack }))}
                  className={`p-3 rounded-xl border transition-all text-center ${settings.emojiPack === pack ? 'border-cyber-green bg-cyber-green/10 text-cyber-green' : 'border-white/5 bg-black/40 hover:bg-white/5 text-gray-500'}`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{pack}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Advanced Security */}
        <div className="glass p-8 border-l-4 border-cyber-green">
           <div className="flex items-center gap-4 mb-4">
              <Shield className="text-cyber-green" />
              <h3 className="font-bold uppercase tracking-widest text-sm">Encryption Default</h3>
           </div>
           <div className="flex gap-2">
              {['standard', 'military', 'quantum'].map(level => (
                <button 
                  key={level}
                  onClick={() => setSettings(prev => ({ ...prev, encryptionLevel: level }))}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${settings.encryptionLevel === level ? 'bg-cyber-green/20 border-cyber-green text-cyber-green' : 'border-white/10 text-gray-500 hover:bg-white/5'}`}
                >
                  {level}
                </button>
              ))}
           </div>
        </div>

        <div className="text-center pt-8">
           <button className="text-[10px] font-mono text-gray-600 hover:text-gray-400 flex items-center gap-2 mx-auto uppercase tracking-widest">
              <RefreshCw size={10} /> Reset node to factory defaults
           </button>
        </div>
      </div>
    </div>
  );
};

const ThemeOption = ({ active, label, colors, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-xl border transition-all flex flex-col gap-3 items-center ${active ? 'border-cyber-green bg-white/5' : 'border-white/10 bg-black/40 hover:bg-white/5'}`}
  >
    <div className="flex gap-1">
      {colors.map((c, i) => <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />)}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default Settings;
