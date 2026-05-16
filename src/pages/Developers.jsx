import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Code2, Terminal as TerminalIcon, Key, Zap, Shield, Globe, 
  Cpu, Github, Copy, CheckCircle, ChevronRight, Play, Server, 
  Activity, AlertTriangle, Book, Download, Box, Layers
} from 'lucide-react';

// ── Components ─────────────────────────────────────────────────────────────

const SectionTitle = ({ title, subtitle, icon }) => (
  <div className="mb-12">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-purple/30 bg-cyber-purple/10 text-cyber-purple text-[10px] font-bold uppercase tracking-widest mb-6">
      {icon} {title}
    </div>
    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{subtitle}</h2>
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
    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] font-mono text-xs md:text-sm shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">{language}</span>
        <button onClick={handleCopy} className="text-gray-500 hover:text-white transition-colors">
          {copied ? <CheckCircle size={14} className="text-cyber-green" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-gray-300">
        <pre><code className="whitespace-pre">{code}</code></pre>
      </div>
    </div>
  );
};

// ── Sections ───────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className="relative py-10 px-6 overflow-hidden min-h-[80vh] flex items-center">
    <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
    <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyber-purple/20 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyber-green/10 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-16 items-center">
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
          v3.0.4 API Now Available
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          Emoji Smuggle<br/>
          <span className="bg-gradient-to-r from-cyber-green to-cyber-purple bg-clip-text text-transparent">Developer API</span>
        </h1>
        <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl">
          Integrate powerful Unicode steganography into your applications. 
          Hide secret text and compressed images inside standard emoji payloads using our robust REST APIs and SDKs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard" className="cyber-button px-8 py-4 text-sm w-full sm:w-auto flex items-center justify-center gap-2">
            <Key size={16} /> Get API Key
          </Link>
          <Link to="/about" className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Book size={16} /> Read Docs
          </Link>
          <a href="https://github.com/Subhan-Haider/EmojiSmuggle" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-white/10">
            <Github size={16} /> GitHub
          </a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyber-green/20 to-cyber-purple/20 blur-3xl -z-10" />
        <CodeBlock language="bash" code={`# Install the official SDK
$ npm install emoji-smuggle

# Initialize client
$ smuggle auth --token=YOUR_API_KEY
$ smuggle encode "Hello" --carrier="📦"
> Output: 📦​‌‌​‌​​​‌​‌​​‌​​‌​‌​​‌‌​‌​​‌‌​​‌`} />
      </motion.div>
    </div>
  </section>
);

const QuickStart = () => (
  <section className="py-20 px-6 max-w-7xl mx-auto">
    <SectionTitle icon={<Zap size={16} />} title="Quick Start" subtitle="Get up and running in seconds." />
    <div className="grid md:grid-cols-2 gap-8">
      <div className="glass p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Box size={20} className="text-cyber-green" /> 1. Install SDK</h3>
        <p className="text-gray-400 text-sm mb-4">Install the package via your preferred package manager.</p>
        <CodeBlock language="bash" code="npm install emoji-smuggle" />
      </div>
      <div className="glass p-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Code2 size={20} className="text-cyber-purple" /> 2. Encode Data</h3>
        <p className="text-gray-400 text-sm mb-4">Import and use the encoding methods instantly.</p>
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
    <section className="py-20 px-6 bg-black/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={<Layers size={16} />} title="Core Endpoints" subtitle="REST API Overview" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {endpoints.map((ep, i) => (
            <div key={i} className="glass p-6 hover:border-cyber-green/30 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${ep.method === 'POST' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-cyber-blue/20 text-cyber-blue'}`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">{ep.path}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{ep.desc}</p>
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
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_live_...'
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
    "Authorization": "Bearer sk_live_...",
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
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": "Target acquired",
    "carrier": "cyberpunk"
  }'`
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <SectionTitle icon={<Code2 size={16} />} title="Requests" subtitle="Multi-language Support" />
      <div className="glass rounded-2xl overflow-hidden border-white/10">
        <div className="flex border-b border-white/10 bg-black/40 px-4">
          {Object.keys(snippets).map(lang => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === lang ? 'border-cyber-green text-cyber-green bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="p-6">
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
    <section className="py-20 px-6 bg-cyber-purple/5 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={<Play size={16} />} title="Sandbox" subtitle="Live API Playground" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass p-8">
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-4">Request Body</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-cyber-green uppercase block mb-1">Payload</label>
                <input value={input} onChange={e => setInput(e.target.value)} className="cyber-input font-mono text-sm" />
              </div>
              <button onClick={simulateEncode} disabled={loading || !input} className="cyber-button w-full py-4 text-sm">
                {loading ? 'PROCESSING...' : 'SEND REQUEST →'}
              </button>
            </div>
          </div>
          <div className="relative">
            <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-4 absolute -top-8 left-0">Response JSON</h3>
            <CodeBlock language="json" code={output || '// Click SEND REQUEST to view response'} />
          </div>
        </div>
      </div>
    </section>
  );
};

const RateLimits = () => (
  <section className="py-20 px-6 max-w-7xl mx-auto">
    <SectionTitle icon={<Activity size={16} />} title="Limits" subtitle="Fair Usage & Pricing" />
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { tier: 'Hobby', price: 'Free', limit: '100 req/day', desc: 'Perfect for testing and small personal scripts.', color: 'gray-500' },
        { tier: 'Pro', price: '$19/mo', limit: '10,000 req/day', desc: 'For production apps and heavy integrations.', color: 'cyber-green' },
        { tier: 'Enterprise', price: 'Custom', limit: 'Unlimited', desc: 'Dedicated nodes and SLA guarantees.', color: 'cyber-purple' }
      ].map((t, i) => (
        <div key={i} className="glass p-8 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-${t.color}/10 blur-3xl rounded-full group-hover:bg-${t.color}/20 transition-all`} />
          <h3 className={`text-xl font-black uppercase text-${t.color} mb-2`}>{t.tier}</h3>
          <div className="text-3xl font-black text-white mb-6">{t.price}</div>
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle size={14} className={`text-${t.color}`} /> {t.limit}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle size={14} className={`text-${t.color}`} /> Image API Access
            </div>
          </div>
          <p className="text-xs text-gray-500">{t.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const AuthAndWebhooks = () => (
  <section className="py-20 px-6 bg-black/40 border-y border-white/5">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
      <div>
        <SectionTitle icon={<Shield size={16} />} title="Security" subtitle="Authentication" />
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Authenticate requests using Bearer tokens. Keep your keys secure and never share them publicly. 
          Use test keys (`sk_test_...`) for development and live keys (`sk_live_...`) for production.
        </p>
        <CodeBlock language="http" code={`Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxxx`} />
      </div>
      <div>
        <SectionTitle icon={<Globe size={16} />} title="Events" subtitle="Webhooks" />
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Listen for asynchronous events on your server. We deliver a POST request to your endpoint when an event occurs.
        </p>
        <ul className="space-y-3 font-mono text-sm text-gray-300">
          <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyber-green" /> message.encoded</li>
          <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyber-purple" /> message.decoded</li>
          <li className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyber-blue" /> image.processed</li>
        </ul>
      </div>
    </div>
  </section>
);

const ApiStatus = () => (
  <section className="py-20 px-6 max-w-7xl mx-auto">
    <div className="glass p-8 md:p-12 border-cyber-green/20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">System Status</h2>
          <p className="text-gray-500 text-sm">All systems operational.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" /> 99.99% Uptime
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl font-black text-white mb-1">12ms</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">API Latency</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white mb-1">45M+</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Req / Month</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white mb-1">100%</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Success Rate</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white mb-1">0</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Active Incidents</div>
        </div>
      </div>
    </div>
  </section>
);

// ── Main Page ─────────────────────────────────────────────────────────────

const Developers = () => {
  return (
    <div className="bg-[#020203] min-h-screen text-white font-sans">
      <HeroSection />
      <QuickStart />
      <ApiOverview />
      <CodeExamples />
      <ApiPlayground />
      <RateLimits />
      <AuthAndWebhooks />
      <ApiStatus />
    </div>
  );
};

export default Developers;
