import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Code2, Terminal as TerminalIcon, Key, Zap, Shield, Globe, 
  Cpu, Github, Copy, CheckCircle, ChevronRight, Play, Server, 
  Activity, AlertTriangle, Book, Download, Box, Layers, MousePointer2
} from 'lucide-react';

// ── Components ─────────────────────────────────────────────────────────────

const SectionTitle = ({ title, subtitle, icon }) => (
  <div className="mb-12">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-purple/30 bg-cyber-purple/10 text-cyber-purple text-[10px] font-bold uppercase tracking-widest mb-6">
      {icon} {title}
    </div>
    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{subtitle}</h2>
    <div className="h-1.5 w-24 bg-gradient-to-r from-cyber-green to-cyber-purple rounded-full" />
  </div>
);

const CodeBlock = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] font-mono text-xs md:text-sm shadow-2xl">
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{language}</span>
        <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
          {copied ? <CheckCircle size={14} className="text-cyber-green" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-5 overflow-x-auto text-gray-300 leading-relaxed">
        <pre><code className="whitespace-pre">{code}</code></pre>
      </div>
    </div>
  );
};

// ── Sections ───────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className="relative py-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
    <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyber-purple/15 blur-[140px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyber-green/10 blur-[140px] rounded-full pointer-events-none" />
    
    <div className="max-w-7xl mx-auto w-full relative z-10">
      <div className="grid lg:grid-cols-12 gap-16 items-center">
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            System Version 3.0.4 Online
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
            Build with the<br/>
            <span className="bg-gradient-to-r from-cyber-green via-cyber-blue to-cyber-purple bg-clip-text text-transparent">Invisible Protocol</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-2xl">
            Integrate industry-standard Unicode steganography into your apps. 
            Open, keyless access to high-performance hidden message encoding and image smuggling.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link to="/dashboard" className="cyber-button px-10 py-5 text-sm flex items-center justify-center gap-3 shadow-xl shadow-cyber-green/10 group">
              <Zap size={18} className="group-hover:scale-125 transition-transform" /> Get Started Now
            </Link>
            <Link to="/about" className="px-10 py-5 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 backdrop-blur-md">
              <Book size={18} /> Documentation
            </Link>
            <a href="https://github.com/Subhan-Haider/EmojiSmuggle" target="_blank" rel="noopener noreferrer" className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-transparent hover:border-white/10">
              <Github size={20} />
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-5 relative hidden lg:block"
          initial={{ opacity: 0, scale: 0.9, x: 30 }} 
          animate={{ opacity: 1, scale: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyber-green/20 to-cyber-purple/20 blur-[100px] -z-10" />
          <div className="glass p-2 rounded-[2rem] border-white/5">
            <CodeBlock language="bash" code={`# Install official SDK
$ npm install emoji-smuggle

# Quick Encode
$ smuggle encode "Top Secret"
> Output: 😂​‌‌​‌​​​‌​‌​​‌​​‌​‌​​‌‌​‌​​‌‌​​‌🔥`} />
          </div>
          
          {/* Floating cards */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -left-10 glass p-5 rounded-2xl border-cyber-green/30 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-green/20 flex items-center justify-center text-cyber-green">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-black">Latency</div>
                <div className="text-white font-bold">12ms avg</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

const QuickStart = () => (
  <section className="py-32 px-6 max-w-7xl mx-auto">
    <SectionTitle icon={<Zap size={16} />} title="Setup" subtitle="Instant Integration" />
    <div className="grid md:grid-cols-2 gap-10">
      <div className="glass p-10 group hover:border-cyber-green/40 transition-all duration-500">
        <div className="w-14 h-14 rounded-2xl bg-cyber-green/10 flex items-center justify-center text-cyber-green mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all">
          <Box size={28} />
        </div>
        <h3 className="text-2xl font-black text-white mb-4">1. Install Package</h3>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">Add the core engine to your project. Lightweight, zero-dependency, and works everywhere.</p>
        <CodeBlock language="bash" code="npm install emoji-smuggle" />
      </div>
      <div className="glass p-10 group hover:border-cyber-purple/40 transition-all duration-500">
        <div className="w-14 h-14 rounded-2xl bg-cyber-purple/10 flex items-center justify-center text-cyber-purple mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all">
          <Code2 size={28} />
        </div>
        <h3 className="text-2xl font-black text-white mb-4">2. Encode Data</h3>
        <p className="text-gray-400 text-base mb-8 leading-relaxed">Import and use the encoding methods instantly with single-line function calls.</p>
        <CodeBlock language="javascript" code={`import { encodeMessage } from 'emoji-smuggle';
        
const { emoji } = await encodeMessage("Secret Message", {
  carrier: "cyberpunk",
  password: "secure_pass"
});`} />
      </div>
    </div>
  </section>
);

const ApiOverview = () => {
  const endpoints = [
    { method: 'POST', path: '/v1/encode', desc: 'Hide text payload inside emoji string.' },
    { method: 'POST', path: '/v1/decode', desc: 'Extract hidden text from emoji string.' },
    { method: 'POST', path: '/v1/image/encode', desc: 'Compress and hide image inside emojis.' },
    { method: 'POST', path: '/v1/image/decode', desc: 'Extract and rebuild hidden image.' },
    { method: 'GET', path: '/v1/carriers', desc: 'Get available emoji carrier packs.' },
    { method: 'POST', path: '/v1/detect', desc: 'Scan string for zero-width signatures.' },
  ];

  return (
    <section className="py-32 px-6 bg-black/60 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-blue/10 blur-[100px] -z-10 rounded-full" />
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={<Layers size={16} />} title="API" subtitle="REST Endpoints" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {endpoints.map((ep, i) => (
            <div key={i} className="glass p-8 hover:border-cyber-green/30 transition-all group cursor-pointer hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${ep.method === 'POST' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-blue/20 text-cyber-blue'}`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">{ep.path}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CodeExamples = () => {
  const [activeTab, setActiveTab] = useState('javascript');
  
  const snippets = {
    javascript: `const response = await fetch('https://api.emoji.subhan.tech/v1/encode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    payload: 'Target acquired',
    carrier: 'cyberpunk',
    encrypt: true,
    password: 'secure_pass'
  })
});

const data = await response.json();
console.log(data.emoji); // 🕵️​‌‌​‌​​​‌​‌​​‌​​‌​‌​​‌‌​‌​​‌‌​​‌📦`,
    python: `import requests

url = "https://api.emoji.subhan.tech/v1/encode"
headers = {
    "Content-Type": "application/json"
}
data = {
    "payload": "Target acquired",
    "carrier": "cyberpunk",
    "encrypt": True,
    "password": "secure_pass"
}

response = requests.post(url, json=data, headers=headers)
print(response.json()["emoji"])`,
    curl: `curl -X POST https://api.emoji.subhan.tech/v1/encode \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": "Target acquired",
    "carrier": "cyberpunk"
  }'`
  };

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <SectionTitle icon={<Code2 size={16} />} title="SDK" subtitle="Multi-language Support" />
      <div className="glass rounded-[2.5rem] overflow-hidden border-white/10 shadow-3xl">
        <div className="flex border-b border-white/10 bg-black/40 px-6 overflow-x-auto">
          {Object.keys(snippets).map(lang => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === lang ? 'border-cyber-green text-cyber-green bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="p-8 md:p-12">
          <CodeBlock language={activeTab} code={snippets[activeTab]} />
        </div>
      </div>
    </section>
  );
};

const ApiPlayground = () => {
  const [input, setInput] = useState('Test payload');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const simulateEncode = () => {
    setLoading(true);
    setTimeout(() => {
      setOutput(`{
  "status": "success",
  "emoji": "📦​‌‌​‌​​​‌​‌​​‌​​‌​‌​​‌‌​‌​​‌‌​​‌",
  "meta": {
    "bytes": ${input.length},
    "hidden_chars": ${input.length * 8},
    "latency_ms": 42
  }
}`);
      setLoading(false);
    }, 800);
  };

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-black/0 to-cyber-purple/5 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={<Play size={16} />} title="Sandbox" subtitle="Live Playground" />
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="glass p-10">
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-500 mb-8 flex items-center gap-2">
              <MousePointer2 size={12} className="text-cyber-green" /> Request Payload
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-cyber-green font-black uppercase tracking-widest block mb-3">Payload Message</label>
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder="Enter text to hide..."
                  className="cyber-input font-mono text-base px-6 py-4" 
                />
              </div>
              <button 
                onClick={simulateEncode} 
                disabled={loading || !input} 
                className="cyber-button w-full py-5 text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-cyber-green/10"
              >
                {loading ? 'Smuggling Data...' : 'POST /v1/encode →'}
              </button>
            </div>
          </div>
          <div className="relative pt-8 lg:pt-0">
             <div className="absolute top-0 right-10 px-4 py-1.5 rounded-full bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-[10px] font-black uppercase tracking-widest z-10 hidden md:block">
               HTTP 200 OK
             </div>
            <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-500 mb-8 absolute -top-8 left-0 lg:static">Response Body</h3>
            <CodeBlock language="json" code={output || '// Click SEND REQUEST to see live steganography result'} />
          </div>
        </div>
      </div>
    </section>
  );
};

const ApiStatus = () => (
  <section className="py-32 px-6 max-w-7xl mx-auto">
    <div className="glass p-12 md:p-16 border-cyber-green/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-green to-transparent opacity-50" />
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">System Health</h2>
          <p className="text-gray-500 text-base max-w-md leading-relaxed">The Emoji Smuggle network is monitored 24/7 to ensure zero downtime and maximum security.</p>
        </div>
        <div className="px-6 py-3 rounded-2xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-cyber-green/5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" /> Network Optimal
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        {[
          { val: '12ms', label: 'API Latency' },
          { val: '45M+', label: 'Req / Month' },
          { val: '100%', label: 'Success Rate' },
          { val: '0', label: 'Active Incidents' }
        ].map((stat, i) => (
          <div key={i} className="group">
            <div className="text-4xl font-black text-white mb-2 group-hover:text-cyber-green transition-colors">{stat.val}</div>
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Main Page ─────────────────────────────────────────────────────────────

const Developers = () => {
  return (
    <div className="bg-[#020203] min-h-screen text-white font-sans selection:bg-cyber-green/30 selection:text-white">
      <HeroSection />
      <QuickStart />
      <ApiOverview />
      <CodeExamples />
      <ApiPlayground />
      <ApiStatus />
    </div>
  );
};

export default Developers;
