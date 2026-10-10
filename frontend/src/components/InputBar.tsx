import React, { useState } from 'react';
import { Search, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface InputBarProps {
  onTrace: (txHash: string, victimWallet: string, chain: string, maxHops: number) => void;
  loading: boolean;
}

const CANONICAL_TX = '0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b';
const CANONICAL_VICTIM = '0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9';

export const InputBar: React.FC<InputBarProps> = ({ onTrace, loading }) => {
  const [stolenTx, setStolenTx] = useState(CANONICAL_TX);
  const [victimWallet, setVictimWallet] = useState(CANONICAL_VICTIM);
  const [chain, setChain] = useState('ethereum');
  const [maxHops, setMaxHops] = useState(4);

  // Auto-detect chain preview
  const getAutoDetectedChain = (addr: string): string => {
    const trimmed = addr.trim();
    if (trimmed.startsWith('0x') && trimmed.length === 42) return 'ethereum / evm';
    if (trimmed.startsWith('T') && trimmed.length === 34) return 'tron';
    if (trimmed.startsWith('bc1') || trimmed.startsWith('1') || trimmed.startsWith('3')) return 'bitcoin';
    if (trimmed.length >= 32 && trimmed.length <= 44 && !trimmed.startsWith('0x') && !trimmed.startsWith('T')) return 'solana';
    return 'ethereum';
  };

  const handleLoadCanonical = () => {
    setStolenTx(CANONICAL_TX);
    setVictimWallet(CANONICAL_VICTIM);
    setChain('ethereum');
    setMaxHops(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stolenTx.trim() || !victimWallet.trim()) return;
    onTrace(stolenTx.trim(), victimWallet.trim(), chain, maxHops);
  };

  return (
    <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-specter-cyan/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            <Search className="h-4 w-4 text-specter-cyan" />
            INCIDENT INGESTION &amp; ON-CHAIN TRIAGE
          </h2>
          <p className="text-xs text-specter-muted mt-0.5">
            Input exploit transaction hash or victim wallet. System 1 Reflex Gate triggers in &lt;100µs.
          </p>
        </div>

        {/* Quick-load canonical demo */}
        <button
          type="button"
          onClick={handleLoadCanonical}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-specter-gold/10 hover:bg-specter-gold/20 border border-specter-gold/30 text-specter-gold text-xs font-mono font-medium transition-all shadow-sm hover:shadow-neon-gold"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Load Canonical Incident (SPECTER-2026-9921)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stolen Tx Input */}
          <div>
            <label className="block text-xs font-mono text-specter-muted mb-1.5 flex items-center justify-between">
              <span>STOLEN EXPLOIT TRANSACTION HASH</span>
              <span className="text-[11px] text-specter-cyan">SHA-256 / KECCAK-256</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={stolenTx}
                onChange={(e) => setStolenTx(e.target.value)}
                placeholder="0x..."
                className="w-full bg-specter-darkest border border-specter-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-specter-cyan focus:ring-1 focus:ring-specter-cyan transition-all"
                required
              />
            </div>
          </div>

          {/* Victim Wallet Input */}
          <div>
            <label className="block text-xs font-mono text-specter-muted mb-1.5 flex items-center justify-between">
              <span>VICTIM SOURCE WALLET ADDRESS</span>
              <span className="text-[11px] text-specter-emerald">
                Auto-Detected: {getAutoDetectedChain(victimWallet)}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={victimWallet}
                onChange={(e) => setVictimWallet(e.target.value)}
                placeholder="0x... or T... or solana address"
                className="w-full bg-specter-darkest border border-specter-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-specter-cyan focus:ring-1 focus:ring-specter-cyan transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Filters and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-specter-border/60">
          <div className="flex items-center flex-wrap gap-4 w-full sm:w-auto">
            {/* Chain Selector */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-specter-muted">CHAIN:</span>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="bg-specter-darkest border border-specter-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-specter-cyan"
              >
                <option value="ethereum">Ethereum (ERC-20 USDT)</option>
                <option value="tron">TRON (TRC-20 USDT)</option>
                <option value="solana">Solana (SPL)</option>
                <option value="polygon">Polygon</option>
                <option value="bitcoin">Bitcoin (UTXO)</option>
              </select>
            </div>

            {/* Depth / Max Hops */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <Layers className="h-3.5 w-3.5 text-specter-muted" />
              <span className="text-specter-muted">MAX HOPS:</span>
              <select
                value={maxHops}
                onChange={(e) => setMaxHops(Number(e.target.value))}
                className="bg-specter-darkest border border-specter-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-specter-cyan"
              >
                <option value={2}>2 Hops</option>
                <option value={3}>3 Hops</option>
                <option value={4}>4 Hops (Recommended)</option>
                <option value={5}>5 Hops (Max Depth)</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-specter-cyan/90 to-blue-600 hover:from-specter-cyan hover:to-blue-500 text-black font-semibold text-xs font-mono tracking-wider transition-all shadow-lg hover:shadow-neon-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>TRACING FORENSIC GRAPH...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>EXECUTE FORENSIC TRACE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
