import { useState } from 'react';
import type { ReflexScreeningResult } from '../types/api';
import { CheckCircle2, ShieldAlert, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface ReflexResultCardProps {
  reflex: ReflexScreeningResult;
}

export const ReflexResultCard: React.FC<ReflexResultCardProps> = ({ reflex }) => {
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);
  const isPass = !reflex.is_instant_threat && reflex.status === 'CLEAN';

  return (
    <div className="bg-white border border-slate-200 rounded-md p-3.5 mb-4 shadow-xs font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono">
          <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                SYSTEM 1 BLACKLIST CHECK
              </span>
              {isPass ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  PASS · {reflex.latency_us || 35}µs
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-800 border border-red-300 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-600" />
                  ALERT · {reflex.latency_us || 35}µs
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-sans block mt-0.5">
              {isPass
                ? 'No direct match found in the fast threat registry.'
                : `Instant threat match: ${reflex.threat_class || 'Known flagged signature'}`}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1 font-mono"
        >
          <span>{showTechDetails ? 'Hide technical details' : 'View technical details ▸'}</span>
          {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showTechDetails && (
        <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-2 mt-3">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
            SYSTEM 1 FAST REGISTRY SCREENING DATA
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">SCREENING LATENCY:</span>
              <span className="font-bold text-slate-900">{reflex.latency_us || 35} µs</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">REGISTRY THREAT CLASS:</span>
              <span className="font-bold text-slate-900">{reflex.threat_class || 'NONE'}</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[9px]">MATCHED ADDRESS SIGNATURE:</span>
              <span className="font-bold text-slate-900 break-all text-[10px]">
                {reflex.matched_address || 'None (Query Checked Against Public Ledger)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

