import React from 'react';
import type { TypologyFinding } from '../api';
import { ShieldAlert, CheckCircle2, Hash, Wallet } from 'lucide-react';

interface TypologiesCardProps {
  typologies: TypologyFinding[];
}

export const TypologiesCard: React.FC<TypologiesCardProps> = ({ typologies }) => {
  if (!typologies || typologies.length === 0) {
    return (
      <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-xl text-center">
        <ShieldAlert className="h-8 w-8 text-specter-muted mx-auto mb-2 opacity-50" />
        <h3 className="text-xs font-mono text-white font-semibold">NO TYPOLOGY FINDINGS</h3>
        <p className="text-[11px] text-specter-muted mt-1">Run trace analysis to detect financial crime patterns.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-specter-crimson/15 text-specter-crimson border-specter-crimson/40';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-specter-gold/15 text-specter-gold border-specter-gold/40';
      default:
        return 'bg-specter-cyan/15 text-specter-cyan border-specter-cyan/40';
    }
  };

  return (
    <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-specter-crimson/10 border border-specter-crimson/30 text-specter-crimson">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                EGRE FINANCIAL CRIME TYPOLOGIES
              </h2>
              <p className="text-[11px] text-specter-muted font-sans">
                Autonomous heuristic classification of laundering patterns &amp; exchange convergence
              </p>
            </div>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-specter-darkest border border-specter-border text-white">
            {typologies.length} Detected
          </span>
        </div>

        {/* Typologies List */}
        <div className="space-y-3">
          {typologies.map((t) => (
            <div
              key={t.typology_id}
              className="bg-specter-darkest/80 border border-specter-border rounded-lg p-3.5 hover:border-specter-hover transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white tracking-wide">
                    {t.typology_name.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                      t.severity
                    )}`}
                  >
                    {t.severity}
                  </span>
                </div>
                <span className="text-xs font-mono text-specter-emerald font-semibold">
                  {t.confidence_score.toFixed(1)}% Match
                </span>
              </div>

              <p className="text-xs text-specter-muted font-sans mb-2.5 leading-relaxed">
                {t.description}
              </p>

              {/* Trigger Conditions */}
              {t.trigger_conditions.length > 0 && (
                <div className="mb-2.5 space-y-1">
                  <span className="text-[10px] font-mono text-specter-muted uppercase tracking-wider block">
                    Trigger Conditions:
                  </span>
                  {t.trigger_conditions.map((cond, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-start gap-1.5 text-[11px] font-mono text-gray-300"
                    >
                      <CheckCircle2 className="h-3 w-3 text-specter-emerald mt-0.5 shrink-0" />
                      <span>{cond}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Supporting Artifacts */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono pt-2 border-t border-specter-border/50 text-specter-muted">
                {t.supporting_wallets.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-specter-cyan" />
                    <span>{t.supporting_wallets.length} Target Wallet(s)</span>
                  </div>
                )}
                {t.supporting_transactions.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-specter-gold" />
                    <span>{t.supporting_transactions.length} Proof Tx(s)</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
