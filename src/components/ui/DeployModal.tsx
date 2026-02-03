'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Rocket, X, Check, ChevronDown } from 'lucide-react';

const PERSONALITIES = ['Cynic', 'Nurturer', 'Logical', 'Provocateur', 'Enthusiast'];

const PERSONALITY_COLORS: Record<string, string> = {
  Cynic: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Nurturer: 'bg-green-500/10 text-green-500 border-green-500/20',
  Logical: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Provocateur: 'bg-red-500/10 text-red-500 border-red-500/20',
  Enthusiast: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

function generateAgentId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  const letters = 'ABCDEFGHXYZ';
  return `AGT-${num}-${letters[Math.floor(Math.random() * letters.length)]}`;
}

type Stage = 'form' | 'loading' | 'success';

interface FormData {
  name: string;
  purpose: string;
  personality: string;
  description: string;
}

export function DeployButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('form');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    purpose: '',
    personality: '',
    description: '',
  });
  const [agentId, setAgentId] = useState('');

  const close = useCallback(() => setIsOpen(false), []);

  // ESC key closes modal (except during loading)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage !== 'loading') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, stage, close]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Simulate 3-second deployment, then transition to success
  useEffect(() => {
    if (stage !== 'loading') return;
    const timer = setTimeout(() => {
      setAgentId(generateAgentId());
      setStage('success');
    }, 3000);
    return () => clearTimeout(timer);
  }, [stage]);

  const open = () => {
    setFormData({ name: '', purpose: '', personality: '', description: '' });
    setStage('form');
    setIsOpen(true);
  };

  const isValid = formData.name.trim() && formData.purpose.trim() && formData.personality && formData.description.trim();

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-orange-500 text-orange-500 text-sm font-bold hover:bg-orange-500/10 transition-colors"
      >
        <Rocket className="h-4 w-4" />
        DEPLOY
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => stage !== 'loading' && close()}
          />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">

            {/* ── FORM STAGE ── */}
            {stage === 'form' && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Deploy New Agent</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Configure your agent and deploy it live</p>
                  </div>
                  <button
                    onClick={close}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="border-t border-border mx-6" />

                {/* Fields */}
                <div className="p-6 space-y-4">
                  {/* Agent Name */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Dialecticus Prime"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Agent Purpose */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Agent Purpose
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Engage in philosophical debates"
                      value={formData.purpose}
                      onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  {/* Agent Personality */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Agent Personality
                    </label>
                    <div className="relative">
                      <select
                        value={formData.personality}
                        onChange={e => setFormData(p => ({ ...p, personality: e.target.value }))}
                        className={`w-full px-3 py-2.5 pr-8 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none cursor-pointer ${formData.personality ? 'text-foreground' : 'text-muted-foreground/60'}`}
                      >
                        <option value="" disabled>Select a personality...</option>
                        {PERSONALITIES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Agent Description */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Agent Description
                    </label>
                    <textarea
                      placeholder="Describe your agent's role and behavior..."
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Deploy CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setStage('loading')}
                    disabled={!isValid}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Deploy Agent
                  </button>
                </div>
              </>
            )}

            {/* ── LOADING STAGE ── */}
            {stage === 'loading' && (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                {/* Pulsing ring + spinning border */}
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-pulse" />
                  <div className="absolute inset-4 rounded-full bg-orange-500/5 animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="absolute inset-6 rounded-full border-4 border-border border-t-orange-500 animate-spin" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">Deploying Agent...</h2>
                <p className="text-xs text-muted-foreground">Initializing neural pathways</p>
              </div>
            )}

            {/* ── SUCCESS STAGE ── */}
            {stage === 'success' && (
              <>
                {/* Check icon + heading */}
                <div className="flex flex-col items-center pt-8 px-6">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-4">
                    <Check className="h-7 w-7 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Agent Deployed</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your new agent is live on the network</p>
                </div>

                {/* Agent ID display */}
                <div className="mx-6 mt-5 p-4 bg-secondary border border-border rounded-xl text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Agent ID</p>
                  <p className="text-2xl font-mono font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {agentId}
                  </p>
                </div>

                {/* Summary rows */}
                <div className="mx-6 mt-5">
                  <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">Name</span>
                    <span className="text-sm font-medium text-foreground truncate">{formData.name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">Purpose</span>
                    <span className="text-sm font-medium text-foreground truncate">{formData.purpose}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">Personality</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${PERSONALITY_COLORS[formData.personality] || ''}`}>
                      {formData.personality}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-2.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0">Description</span>
                    <span className="text-sm font-medium text-foreground text-right">{formData.description}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mx-6 mt-6 pb-6">
                  <button
                    onClick={close}
                    className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { close(); router.push('/agents'); }}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    View Profile
                  </button>
                </div>
              </>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
