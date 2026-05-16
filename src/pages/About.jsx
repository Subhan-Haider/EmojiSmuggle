import { BookOpen, Code, Lock, Cpu, TerminalSquare, Keyboard } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-yellow-500/20 rounded-xl">
          <BookOpen className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest text-white">The Protocol</h1>
      </div>

      <div className="space-y-12">
        <section className="glass p-10">
          <h2 className="text-xl font-bold mb-6 text-cyber-green uppercase tracking-tighter">What is Emoji Steganography?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Steganography is the practice of concealing a file, message, image, or video within another file, message, image, or video. 
            Emoji Smuggle specifically targets the text-based communication layer, hiding data inside characters that the browser renders but never displays.
          </p>
          <div className="bg-black/40 p-6 rounded-xl border border-white/5 font-mono text-sm">
             <span className="text-cyber-green">Concept:</span> Invisible data payload wrapped in a visible carrier.
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="glass p-8 border-l-4 border-cyber-purple">
              <div className="flex items-center gap-3 mb-4">
                 <Code className="text-cyber-purple" size={20} />
                 <h3 className="font-bold uppercase tracking-widest text-sm">Zero-Width Characters</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                 Unicode includes specific characters that have zero width, meaning they take up no space on the screen. 
                 Specifically, we use the <span className="text-white">Zero Width Joiner (ZWJ)</span> and <span className="text-white">Zero Width Non-Joiner (ZWNJ)</span>. 
                 By treating these as binary 1 and 0, we can encode any text into a sequence of these characters.
              </p>
           </section>

           <section className="glass p-8 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-4">
                 <Cpu className="text-yellow-500" size={20} />
                 <h3 className="font-bold uppercase tracking-widest text-sm">Bit Mapping</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                 Each character in your secret message is converted into its 8-bit binary equivalent (ASCII/UTF-8). 
                 These bits are then mapped 1-to-1 to our invisible characters and appended to standard emojis. 
                 Since emojis are often sent in clusters, the extra hidden bytes go unnoticed.
              </p>
           </section>
        </div>

        <section className="glass p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyber-green/10 rounded-xl border border-cyber-green/20">
              <TerminalSquare className="text-cyber-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Console Guide</h2>
              <p className="text-xs text-gray-500 font-mono">How to use the Console (Terminal + History)</p>
            </div>
          </div>

          <div className="space-y-6 text-gray-400 leading-relaxed">
            <p>
              Open <span className="text-white font-bold">Console</span> from the top navigation. This screen is your control center:
              it includes a built-in terminal, saved transmission history, quick links to Encode/Decode, and local node status.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard size={16} className="text-cyber-green" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Terminal Commands</span>
                </div>
                <div className="font-mono text-sm space-y-2 text-gray-300">
                  <div><span className="text-cyber-green">help</span> — list commands</div>
                  <div><span className="text-cyber-green">encode</span> <span className="text-white">your message</span> — generate emoji carrier</div>
                  <div><span className="text-cyber-green">decode</span> <span className="text-white">emoji text</span> — extract hidden message</div>
                  <div><span className="text-cyber-green">history</span> — show saved entries</div>
                  <div><span className="text-cyber-green">copy</span> — copy last terminal output</div>
                  <div><span className="text-cyber-green">wipe</span> — clear local history</div>
                  <div><span className="text-cyber-green">status</span> — show node status</div>
                  <div><span className="text-cyber-green">clear</span> — clear terminal screen</div>
                </div>
              </div>

              <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={16} className="text-yellow-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quick Examples</span>
                </div>
                <div className="font-mono text-sm space-y-3 text-gray-300">
                  <div className="bg-black/50 rounded-lg border border-white/5 p-3">
                    <span className="text-cyber-purple">&gt;</span> encode meet at 9
                  </div>
                  <div className="bg-black/50 rounded-lg border border-white/5 p-3">
                    <span className="text-cyber-purple">&gt;</span> copy
                  </div>
                  <div className="bg-black/50 rounded-lg border border-white/5 p-3">
                    <span className="text-cyber-purple">&gt;</span> history
                  </div>
                  <div className="text-xs text-gray-500">
                    Tip: after <span className="text-white">encode</span> or <span className="text-white">decode</span>, the result is saved to local history automatically.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-cyber-purple/5 border border-cyber-purple/20 rounded-xl p-6">
              <p className="text-sm">
                <span className="text-white font-bold">Storage note:</span> History is stored in your browser (LocalStorage).
                Wiping local history removes it from this device only.
              </p>
            </div>
          </div>
        </section>

        <section className="glass p-10 text-center">
           <Lock size={40} className="mx-auto mb-6 text-cyber-green opacity-50" />
           <h2 className="text-xl font-bold mb-4 uppercase">Privacy Statement</h2>
           <p className="text-gray-500 max-w-xl mx-auto italic">
              All computations happen on the client-side. Your secret messages never leave your device. 
              We do not track, log, or store any transmitted data. The shadows are your own.
           </p>
        </section>
      </div>
    </div>
  );
};

export default About;
