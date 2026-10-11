import { getEffectiveRiskAssessment } from '../types/api';
import type { TraceResponse } from '../types/api';
import { ShieldAlert, ArrowRightLeft, DollarSign, CheckCircle2, HelpCircle } from 'lucide-react';

interface CaseSummaryBarProps {
  traceData: TraceResponse;
}

export const CaseSummaryBar: React.FC<CaseSummaryBarProps> = ({ traceData }) => {
  const { case_id, tracing_summary } = traceData;
  
  const assessment = getEffectiveRiskAssessment(traceData);
  const riskLevel = (assessment.risk_level || 'LOW').toUpperCase();
  const isClean = riskLevel === 'CLEAN';
  const isInconclusive = riskLevel === 'INCONCLUSIVE';

  const formattedLoss = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(tracing_summary.initial_loss_usd || 0);

  return (
    <div className="bg-white text-slate-900 rounded-md p-3 mb-4 shadow-sm border border-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Case ID & Status */}
        <div className="flex items-center gap-3 pr-3 border-r border-slate-200">
          <div>
            <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-semibold">CASE REFERENCE</span>
            <span className="font-bold text-slate-900 text-sm">{case_id}</span>
          </div>

          {isClean ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-1 rounded font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>CLEAN</span>
            </div>
          ) : isInconclusive ? (
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-300 px-2 py-1 rounded font-bold text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>INCONCLUSIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 text-red-800 border border-red-300 px-2 py-1 rounded font-bold text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>{riskLevel} RISK</span>
            </div>
          )}
        </div>

        {/* Why this was flagged / status reason */}
        <div className="pr-3 border-r border-slate-200 max-w-sm">
          <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-semibold">INVESTIGATION STATUS</span>
          <span className={`font-semibold flex items-center gap-1 text-[11px] ${isClean ? 'text-emerald-800' : isInconclusive ? 'text-slate-700' : 'text-red-800'}`}>
            <span className="font-sans font-medium text-slate-700">{assessment.summary_verdict}</span>
          </span>
        </div>

        {/* Money Involved */}
        <div className="pr-3 border-r border-slate-200">
          <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-semibold">MONEY INVOLVED</span>
          <span className="font-bold flex items-center gap-0.5 text-emerald-700">
            <DollarSign className="w-3 h-3 text-emerald-600" />
            {formattedLoss} <span className="text-slate-500 text-[10px] ml-1">{tracing_summary.currency || 'USDT'}</span>
          </span>
        </div>

        {/* Hops Traversed */}
        <div>
          <span className="text-slate-500 text-[10px] block uppercase tracking-wider font-semibold">TRANSFERS</span>
          <span className="font-semibold text-slate-900 flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-blue-600" />
            {tracing_summary.hops_traversed} Wallet Hops
          </span>
        </div>
      </div>
    </div>
  );
};
