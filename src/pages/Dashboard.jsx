import { motion } from 'framer-motion';
import {
  Copy,
  Database,
  ExternalLink,
  Lock,
  ShieldCheck,
  Terminal as TerminalIcon,
  Trash2,
  Unlock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Terminal from '../components/Terminal';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const { history, deleteHistoryItem, clearHistory, user } = useApp();
  const encodedCount = history.filter((item) => item.type === 'encode').length;
  const decodedCount = history.filter((item) => item.type === 'decode').length;
  const encryptedCount = history.filter((item) => item.isEncrypted).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyber-green">
            <TerminalIcon size={14} />
            Console
          </div>
          <h1 className="text-4xl font-black normal-case tracking-normal text-white sm:text-5xl">Control center</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Encode, decode, inspect local history, and manage this browser node from one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/encode" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyber-green px-5 py-3 text-sm font-black uppercase tracking-widest text-black transition hover:bg-white">
            Encode
            <Lock size={16} />
          </Link>
          <Link to="/decode" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/[0.08]">
            Decode
            <Unlock size={16} />
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Saved entries" value={history.length} icon={<Database size={20} />} />
        <StatCard title="Encoded" value={encodedCount} icon={<Lock size={20} />} />
        <StatCard title="Decoded" value={decodedCount} icon={<Unlock size={20} />} />
        <StatCard title="Encrypted" value={encryptedCount} icon={<ShieldCheck size={20} />} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <Terminal />

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black normal-case tracking-normal text-white">Transmission history</h2>
                <p className="mt-1 text-xs text-slate-600">Stored only in this browser</p>
              </div>
              <span className="rounded-lg border border-white/10 px-3 py-1 font-mono text-xs text-slate-500">{history.length}</span>
            </div>

            {history.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
                No saved transmissions yet. Use the encoder or run <span className="font-mono text-slate-400">encode hello</span> in terminal.
              </div>
            ) : (
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {history.map((item) => (
                  <HistoryItem key={item.id} item={item} onDelete={() => deleteHistoryItem(item.id)} />
                ))}
              </div>
            )}

            <button
              onClick={clearHistory}
              disabled={!history.length}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-400 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={14} />
              Wipe local history
            </button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <h2 className="text-lg font-black normal-case tracking-normal text-white">Node status</h2>
            <div className="mt-5 space-y-3 text-sm">
              <StatusRow label="Operator" value={user.name} />
              <StatusRow label="Storage" value="Local browser" />
              <StatusRow label="Network upload" value="None" />
              <StatusRow label="Protocol" value="Zero-width Unicode" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
    <div className="mb-5 flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">{title}</span>
      <span className="text-cyber-green">{icon}</span>
    </div>
    <div className="text-3xl font-black text-white">{value}</div>
  </div>
);

const HistoryItem = ({ item, onDelete }) => {
  const isEncode = item.type === 'encode';
  const preview = String(item.payload || '').slice(0, 58);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-black/25 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${isEncode ? 'bg-cyber-green/10 text-cyber-green' : 'bg-cyber-purple/10 text-cyber-purple'}`}>
              {isEncode ? <Lock size={15} /> : <Unlock size={15} />}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">{isEncode ? 'Encoded' : 'Decoded'}</p>
              <p className="mt-1 text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <p className="mt-3 truncate text-sm text-slate-400">{preview || 'Empty payload'}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(item.payload || '')}
            className="rounded-lg border border-white/10 p-2 text-slate-500 transition hover:text-white"
            title="Copy payload"
          >
            <Copy size={14} />
          </button>
          <button onClick={onDelete} className="rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10" title="Delete entry">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StatusRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
    <span className="text-slate-600">{label}</span>
    <span className="inline-flex items-center gap-2 text-right font-mono text-xs text-slate-300">
      {value}
      {label === 'Protocol' && <ExternalLink size={12} className="text-slate-600" />}
    </span>
  </div>
);

export default Dashboard;
