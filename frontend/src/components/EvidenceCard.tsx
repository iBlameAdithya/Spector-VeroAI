import React, { useState } from 'react';
import type { EvidenceBundle } from '../api';
import { FileCheck, Hash, Shield, Copy, Check, Scale } from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceBundle | null;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  const [copiedRoot, setCopiedRoot] = useState(false);
  const [copiedLeaf, setCopiedLeaf] = useState<number | null>(null);

  if (!evidence) return null;

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(evidence.merkle_root);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  const handleCopyLeaf = (leaf: string, idx: number) => {
    navigator.clipboard.writeText(leaf);
    setCopiedLeaf(idx);
    setTimeout(() => setCopiedLeaf(null), 2000);
  };

  return (
    <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-specter-cyan/10 border border-specter-cyan/30 text-specter-cyan">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                CRYPTOGRAPHIC MERKLE EVIDENCE DOSSIER
              </h2>
              <p className="text-[11px] text-specter-muted font-sans">
                Tamper-proof mathematical lineage tree for judicial &amp; exchange admissibility
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-specter-emerald/15 border border-specter-emerald/40 text-specter-emerald text-[11px] font-mono font-bold">
            <Shield className="h-3 w-3" />
            <span>VERIFIED</span>
          </span>
        </div>

        {/* Merkle Root Highlight */}
        <div className="bg-specter-darkest/90 border border-specter-border rounded-lg p-3.5 mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-specter-muted mb-1.5">
            <span className="flex items-center gap-1.5 text-specter-gold font-bold">
              <Hash className="h-3.5 w-3.5" />
              <span>ANCHOR MERKLE ROOT ({evidence.algorithm})</span>
            </span>
            <span>Case: {evidence.case_id}</span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-specter-card/80 border border-specter-border px-3 py-2 rounded">
            <span className="text-xs font-mono text-white truncate font-bold tracking-wider">
              {evidence.merkle_root}
            </span>
            <button
              onClick={handleCopyRoot}
              className="p-1 rounded hover:bg-specter-hover text-specter-cyan transition-colors"
              title="Copy Merkle Root"
            >
              {copiedRoot ? <Check className="h-3.5 w-3.5 text-specter-emerald" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Merkle Leaves Breakdown */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-specter-muted mb-2">
            <span>LEAF PATH COMMITMENTS ({evidence.leaf_count} HOPS)</span>
            <span className="text-[10px]">SHA-256 / BLAKE3</span>
          </div>
          <div className="space-y-1.5">
            {evidence.leaves.map((leaf, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-specter-darkest/60 border border-specter-border/80 text-[11px] font-mono"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-specter-muted font-bold">L{idx}:</span>
                  <span className="text-gray-300 truncate">{leaf}</span>
                </div>
                <button
                  onClick={() => handleCopyLeaf(leaf, idx)}
                  className="text-specter-muted hover:text-specter-cyan transition-colors"
                >
                  {copiedLeaf === idx ? <Check className="h-3 w-3 text-specter-emerald" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Clauses */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-specter-muted mb-2">
            <Scale className="h-3.5 w-3.5 text-specter-gold" />
            <span>STATUTORY PRESERVATION CLAUSES</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {evidence.statutory_clauses.map((clause, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded bg-specter-darkest/40 border border-specter-border text-[11px] font-mono text-specter-muted flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-specter-gold"></span>
                <span className="truncate">{clause}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="mt-4 pt-3 border-t border-specter-border/60 flex items-center justify-between text-[11px] font-mono text-specter-muted">
        <span>Proof Timestamp:</span>
        <span className="text-gray-300">{evidence.compilation_timestamp}</span>
      </div>
    </div>
  );
};
