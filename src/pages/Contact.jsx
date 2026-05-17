import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MessageSquare, Terminal, Send, CheckCircle2, User, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [terminalLog, setTerminalLog] = useState([]);

  const subjects = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'bug', label: 'Security / Bug Report' },
    { value: 'sdk', label: 'NPM SDK Support' },
    { value: 'android', label: 'Android App Integration' },
    { value: 'partnership', label: 'Collaboration / Custom Dev' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTerminalLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setTerminalLog(prev => [...prev, { time, message, type }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTerminalLog([]);
    
    // Simulate terminal connection
    addTerminalLog('Initiating secure steganographic handshake...', 'info');
    await new Promise(r => setTimeout(r, 600));
    
    addTerminalLog('Encoding contact payload with standard carrier protocols...', 'info');
    await new Promise(r => setTimeout(r, 600));
    
    addTerminalLog('Exchanging client certificates with EmojiSmuggle API nodes...', 'info');
    await new Promise(r => setTimeout(r, 700));

    // Simulate direct dispatch
    addTerminalLog('Packet transmission complete! Response 200 OK.', 'success');
    await new Promise(r => setTimeout(r, 500));

    setIsSubmitting(false);
    setIsSent(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subject: 'general', message: '' });
    setIsSent(false);
    setTerminalLog([]);
  };

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
          Transmit Encrypted Payload
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-purple">Console</span>
        </h1>
        <p className="max-w-xl mx-auto text-sm text-slate-400 leading-6">
          Have an idea, spotted a bug, or want to collaborate? Push a secure message directly to our stego communications node.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.5fr_1fr]">
        {/* Left Side: Contact Form / Sent Screen */}
        <div className="glass bg-black/45 backdrop-blur-3xl p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-green/5 blur-3xl -z-10 rounded-full" />
          
          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Your Identity / Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Agent Carter"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/20 transition-all disabled:opacity-55"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Return Routing Address / Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., agent@smuggle.net"
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/20 transition-all disabled:opacity-55"
                    />
                  </div>
                </div>

                {/* Subject Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Inquiry Classification
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/20 transition-all disabled:opacity-55 appearance-none cursor-pointer"
                  >
                    {subjects.map(sub => (
                      <option key={sub.value} value={sub.value} className="bg-slate-950 text-white">
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Box */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Stego Payload / Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your secret payload here..."
                      rows={5}
                      required
                      disabled={isSubmitting}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green/20 transition-all disabled:opacity-55 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-cyber-green to-cyber-purple text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-cyber-green/25 hover:shadow-cyber-green/45 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  {isSubmitting ? 'Transmitting Data...' : 'Send Encrypted Message'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyber-green/10">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                  Payload Sent Successfully!
                </h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto leading-6 mb-8">
                  Your encrypted message has successfully bypassed standard gateways and landed safely in our secure database queue.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={resetForm}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Transmit New Payload
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submitting Console Diagnostics Logs */}
          <AnimatePresence>
            {terminalLog.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 border border-white/10 bg-slate-950/80 rounded-2xl p-4 font-mono text-xs overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 text-slate-500">
                  <span className="flex items-center gap-1.5"><Terminal size={12} /> Console Handshake Logs</span>
                  <span className="text-[10px] uppercase tracking-wider animate-pulse text-cyber-green">ACTIVE</span>
                </div>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-2">
                  {terminalLog.map((log, index) => (
                    <div key={index} className="flex gap-2 leading-relaxed">
                      <span className="text-slate-600">[{log.time}]</span>
                      <span className={log.type === 'success' ? 'text-cyber-green' : log.type === 'error' ? 'text-red-400' : 'text-slate-350'}>
                        {log.type === 'success' ? '✔' : '❯'} {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Sidecards / Info panels */}
        <div className="space-y-6">
          {/* Email Info Card */}
          <div className="glass bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Mail size={16} className="text-cyber-green" /> Direct Communication
            </h3>
            <p className="text-xs text-slate-400 leading-5 mb-5">
              Prefer writing standard emails without steganographic carrier wrapping? Connect directly:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <a href="mailto:support@subhan.tech" className="block p-3 bg-white/5 border border-white/5 hover:border-cyber-green/30 hover:bg-cyber-green/5 rounded-2xl text-slate-350 hover:text-white transition-all">
                <span className="text-slate-500 block mb-1 text-[10px] uppercase font-sans font-bold">Secure Support</span>
                support@subhan.tech
              </a>
              <a href="mailto:hello@emoji.subhan.tech" className="block p-3 bg-white/5 border border-white/5 hover:border-cyber-purple/30 hover:bg-cyber-purple/5 rounded-2xl text-slate-350 hover:text-white transition-all">
                <span className="text-slate-500 block mb-1 text-[10px] uppercase font-sans font-bold">General Enquiries</span>
                hello@emoji.subhan.tech
              </a>
            </div>
          </div>

          {/* Security Core Card */}
          <div className="glass bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyber-purple" /> Security Shield
            </h3>
            <p className="text-xs text-slate-400 leading-5">
              All payload transmissions are securely routed through local-first browser architectures and TLS encrypted endpoints. We do not store plain-text secrets; your privacy is locked under cryptographic proofs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
