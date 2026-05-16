import { FileText, LockKeyhole } from 'lucide-react';

const content = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    icon: <LockKeyhole className="text-cyber-green" />,
    intro:
      'EmojiSmuggle is designed as a local browser tool. The app does not need accounts, cloud storage, or server-side message processing to encode and decode payloads.',
    sections: [
      {
        title: 'What stays local',
        body: 'Messages, passwords, encoded emoji output, and decoded text are processed in your browser. They are not sent to an EmojiSmuggle backend by this app.',
      },
      {
        title: 'History and settings',
        body: 'If you save history or settings, they are stored in your browser storage on this device. You can clear them from the app settings or your browser controls.',
      },
      {
        title: 'What you share',
        body: 'Once you copy encoded text into another app, that app may store, scan, or transmit it according to its own policies. Treat shared carriers like any other message.',
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Terms and Conditions',
    icon: <FileText className="text-cyber-green" />,
    intro:
      'EmojiSmuggle is provided as a utility for private notes, puzzles, demos, and research. Use it responsibly and follow the rules of the platforms where you share content.',
    sections: [
      {
        title: 'Responsible use',
        body: 'Do not use the app to harass people, hide harmful instructions, bypass legal requirements, or violate another service’s terms.',
      },
      {
        title: 'No guarantee of secrecy',
        body: 'Zero-width characters can be detected by technical inspection. The app is useful for camouflage, but it should not be treated as a substitute for professional security controls.',
      },
      {
        title: 'Your responsibility',
        body: 'You are responsible for the content you encode, where you send it, and how you protect any passwords used with encrypted messages.',
      },
    ],
  },
};

const Legal = ({ type }) => {
  const page = content[type] ?? content.privacy;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyber-green/20 bg-cyber-green/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyber-green">
          {page.eyebrow}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
            {page.icon}
          </div>
          <h1 className="text-4xl font-black normal-case tracking-normal text-white">{page.title}</h1>
        </div>
        <p className="mt-6 text-base leading-8 text-slate-400">{page.intro}</p>
      </div>

      <div className="space-y-4">
        {page.sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-lg font-black normal-case tracking-normal text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-xs leading-6 text-slate-600">
        Last updated: May 15, 2026. This page is informational and should be reviewed before production or commercial use.
      </p>
    </div>
  );
};

export default Legal;
