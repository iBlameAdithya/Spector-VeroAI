import React from 'react';
import { Zap, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import type { ReflexScreeningResult } from '../api';

interface ReflexMetricProps {
  reflex: ReflexScreeningResult | null;
}

export const ReflexMetric: React.FC<ReflexMetricProps> = ({ reflex }) => {
  if (!reflex) return null;

  const isUnderSla = reflex.latency_us < 100;

  return (
    <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-specter-emerald via-specter-cyan to-specter-gold"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Reflex identity and latency badge */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-specter-emerald/10 border border-specter-emerald/40 flex items-center justify-center text-specter-emerald shadow-neon-emerald">
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-specter-muted tracking-widest uppercase">
                SYSTEM 1 REFLEX GATE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-specter-emerald/20 text-specter-emerald border border-specter-emerald/40">
                IN-MEMORY BIT-VECTOR
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {reflex.latency_us} µs
              </span>
              <span className={`text-xs font-mono font-semibold ${isUnderSla ? 'text-specter-emerald' : 'text-specter-gold'}`}>
                {isUnderSla ? '(PASS: <100µs SLA Guaranteed)' : '(COMPLETED)'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Threat Class and Status */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full md:w-auto">
          {/* Threat Class */}
          <div className="bg-specter-darkest/70 border border-specter-border rounded-lg px-3 py-2 min-w-[170px]">
            <div className="text-[10px] font-mono text-specter-muted uppercase flex items-center gap-1">
              <ShieldAlert className="h-3 w-3 text-specter-crimson" />
              <span>THREAT SIGNATURE</span>
            </div>
            <div className="text-xs font-mono font-bold text-specter-crimson mt-0.5 truncate">
              {reflex.threat_class}
            </div>
          </div>

          {/* Screening Status */}
          <div className="bg-specter-darkest/70 border border-specter-border rounded-lg px-3 py-2 min-w-[130px]">
            <div className="text-[10px] font-mono text-specter-muted uppercase flex items-center gap-1">
              <Cpu className="h-3 w-3 text-specter-cyan" />
              <span>GATE STATUS</span>
            </div>
            <div className="text-xs font-mono font-bold text-specter-gold mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-specter-gold animate-ping"></span>
              <span>{reflex.status}</span>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="bg-specter-darkest/70 border border-specter-border rounded-lg px-3 py-2 min-w-[130px]">
            <div className="text-[10px] font-mono text-specter-muted uppercase flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-specter-emerald" />
              <span>CONFIDENCE</span>
            </div>
            <div className="text-xs font-mono font-bold text-specter-emerald mt-0.5">
              {reflex.confidence_score.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
