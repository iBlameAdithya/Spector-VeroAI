import { useState } from 'react';
import type { TraceResponse, RiskReason } from '../types/api';
import { getEffectiveRiskAssessment } from '../types/api';
import { getTronscanAddressUrl, getTronscanTxUrl } from '../utils/explorer';
import {
  ShieldAlert,
  ShieldCheck,
  Gauge,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRightLeft,
  Activity,
  ExternalLink,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface IntelligenceSectionProps {
  traceData: TraceResponse;
}

function formatReasonTypeTitle(type: string): string {
  const t = type.toUpperCase().trim();
  if (t.includes('FAN_OUT') || t.includes('RAPID_PEEL')) {
    return 'Funds were split across multiple wallets';
  }
  if (t.includes('FAN_IN') || t.includes('CONSOLIDATION') || t.includes('CONVERGENCE') || t.includes('VASP_CONVERGENCE')) {
    return 'Funds from multiple wallets converged into one wallet';
  }
  if (t.includes('REPEATED_PAIR')) {
    return 'Repeated interaction between the same wallets';
  }
  if (t.includes('HIGH_VELOCITY') || t.includes('HIGH_SPEED_BURST')) {
    return 'High-velocity fund transfer pattern';
  }
  if (t.includes('MANUAL_P2P')) {
    return 'Manual peer-to-peer transfers';
  }
  return t
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSeverityBadgeClass(severity: string) {
  const sev = severity.toUpperCase().trim();
  if (sev === 'CRITICAL' || sev === 'HIGH') {
    return 'bg-red-100 text-red-800 border-red-300';
  }
  if (sev === 'MEDIUM' || sev === 'MODERATE') {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  if (sev === 'LOW') {
    return 'bg-blue-100 text-blue-800 border-blue-300';
  }
  if (sev === 'CLEAN') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
  return 'bg-slate-100 text-slate-800 border-slate-300';
}

export const IntelligenceSection: React.FC<IntelligenceSectionProps> = ({ traceData }) => {
  const [openGlobalTechDetails, setOpenGlobalTechDetails] = useState<boolean>(false);
  const [openEvidenceDrawers, setOpenEvidenceDrawers] = useState<Record<number, boolean>>({});
  const [showDetailedTiming, setShowDetailedTiming] = useState<boolean>(false);

  if (!traceData) {
    return null;
  }

  const assessment = getEffectiveRiskAssessment(traceData);
  const riskLevelUpper = assessment.risk_level.toUpperCase();
  const isClean = riskLevelUpper === 'CLEAN';
  const isInconclusive = riskLevelUpper === 'INCONCLUSIVE';

  let verdictBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
  if (riskLevelUpper === 'CRITICAL' || riskLevelUpper === 'HIGH') {
    verdictBadgeClass = 'bg-red-100 text-red-800 border-red-300';
  } else if (riskLevelUpper === 'MODERATE' || riskLevelUpper === 'MEDIUM') {
    verdictBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (riskLevelUpper === 'LOW') {
    verdictBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
  } else if (isClean) {
    verdictBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }

  const toggleEvidenceDrawer = (idx: number) => {
    setOpenEvidenceDrawers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const velocity = traceData.velocity;

  return (
    <div className="space-y-4 mb-4 font-sans text-xs">
      {/* 1. Main Risk Finding: WHY THIS WAS FLAGGED */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 font-mono">
          <div className="flex items-center gap-2">
            {isClean ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            ) : isInconclusive ? (
              <HelpCircle className="w-5 h-5 text-amber-600" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                WHY THIS WAS FLAGGED
              </h3>
              <span className="text-[10px] text-slate-500 font-sans normal-case block">
                Authoritative Backend Risk Assessment (Multi-hop Trace Analysis)
              </span>
            </div>
          </div>

          <button
            onClick={() => setOpenGlobalTechDetails(!openGlobalTechDetails)}
            className="text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1 font-mono"
          >
            <span>{openGlobalTechDetails ? 'Hide technical details' : 'View technical details ▸'}</span>
            {openGlobalTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Main Verdict & Score Banner */}
        <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${verdictBadgeClass}`}>
              [{riskLevelUpper} RISK]
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900 font-sans">
                {isInconclusive
                  ? 'There was not enough verified information to make a reliable risk assessment.'
                  : isClean
                  ? 'No on-chain activity or exfiltration transactions were recorded for this address.'
                  : assessment.summary_verdict}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                INVESTIGATION STATUS: <strong className="text-slate-800">{riskLevelUpper}</strong>
              </div>
            </div>
          </div>
          <div className="font-mono text-xs text-slate-700 bg-white px-3 py-1.5 rounded border border-slate-200 font-semibold shadow-2xs">
            Risk assessment: <span className="text-slate-900 font-bold">{assessment.risk_score}</span> / 100
          </div>
        </div>

        {/* Clean Case handling */}
        {isClean && (
          <div className="mt-3 p-4 bg-emerald-50/50 border border-emerald-200 rounded-md">
            <div className="text-xs font-bold text-emerald-900 font-mono mb-1">
              WHAT WE FOUND
            </div>
            <div className="text-xs text-slate-700 font-sans">
              No significant risk indicators were returned.
            </div>
          </div>
        )}

        {/* Inconclusive Case handling */}
        {isInconclusive && (
          <div className="mt-3 p-4 bg-amber-50/50 border border-amber-200 rounded-md">
            <div className="text-xs font-bold text-amber-900 font-mono mb-1">
              WHAT WE FOUND
            </div>
            <div className="text-xs text-slate-700 font-sans">
              There was not enough verified information to make a reliable risk assessment.
            </div>
          </div>
        )}

        {/* Finding Cards from reasons[] */}
        {!isClean && !isInconclusive && assessment.reasons && assessment.reasons.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="text-xs font-bold font-mono uppercase text-slate-700 tracking-wide">
              WHAT WE FOUND ({assessment.reasons.length} FINDING{assessment.reasons.length > 1 ? 'S' : ''})
            </div>
            {assessment.reasons.map((reason: RiskReason, idx: number) => {
              const isEvidenceOpen = openEvidenceDrawers[idx] || false;
              const title = formatReasonTypeTitle(reason.reason_type);
              const badgeClass = getSeverityBadgeClass(reason.severity);

              return (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                  {/* Title & Severity Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeClass}`}>
                        [{reason.severity.toUpperCase()} RISK]
                      </span>
                      <span className="font-sans font-bold text-slate-900 text-xs">
                        {title}
                      </span>
                    </div>

                    {/* Detection Confidence */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      <span>Detection confidence: <strong className="text-slate-900">{reason.confidence_score}%</strong></span>
                      <span className="text-[10px] text-slate-400 cursor-help" title="Statistical confidence based on detected transaction patterns.">
                        (?)
                      </span>
                    </div>
                  </div>

                  {/* Plain-English Explanation */}
                  <p className="text-xs text-slate-700 font-sans mb-3 leading-relaxed">
                    {reason.description}
                  </p>

                  {/* Expandable Supporting Evidence Button */}
                  <button
                    onClick={() => toggleEvidenceDrawer(idx)}
                    className="text-xs text-blue-700 hover:text-blue-900 font-mono font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{isEvidenceOpen ? 'Collapse Supporting Evidence ▴' : '[ VIEW SUPPORTING EVIDENCE ]'}</span>
                  </button>

                  {/* Supporting Evidence Drawer */}
                  {isEvidenceOpen && (
                    <div className="mt-3 p-3 bg-white rounded border border-slate-200 font-mono text-xs space-y-3 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 pb-1">
                        SUPPORTING EVIDENCE
                      </div>

                      {/* Supporting Wallets */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                          SUPPORTING WALLETS ({reason.supporting_wallets?.length || 0})
                        </span>
                        {reason.supporting_wallets && reason.supporting_wallets.length > 0 ? (
                          <div className="space-y-1">
                            {reason.supporting_wallets.map((addr: string, wIdx: number) => (
                              <div key={wIdx} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                                <span className="text-slate-800 truncate font-mono max-w-[400px]">{addr}</span>
                                <a
                                  href={getTronscanAddressUrl(addr)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0 ml-2"
                                >
                                  <span>[ OPEN WALLET ↗ ]</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            No specific supporting wallets returned for this finding.
                          </div>
                        )}
                      </div>

                      {/* Supporting Transactions */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 block mb-1">
                          SUPPORTING TRANSACTIONS ({reason.supporting_transactions?.length || 0})
                        </span>
                        {reason.supporting_transactions && reason.supporting_transactions.length > 0 ? (
                          <div className="space-y-1">
                            {reason.supporting_transactions.map((tx: string, tIdx: number) => (
                              <div key={tIdx} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                                <span className="text-slate-800 truncate font-mono max-w-[400px]">{tx}</span>
                                <a
                                  href={getTronscanTxUrl(tx)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0 ml-2"
                                >
                                  <span>[ VIEW TRANSACTION ↗ ]</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 italic">
                            No specific supporting transactions returned for this finding.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* System 1 Fast Blacklist Separation Card */}
        {traceData.system1_reflex && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-bold text-slate-800">
                  SYSTEM 1 BLACKLIST CHECK: {traceData.system1_reflex.is_instant_threat ? 'THREAT DETECTED' : 'PASS'}
                </span>
                <span className="text-[10px] text-slate-500 block font-sans">
                  {traceData.system1_reflex.is_instant_threat
                    ? `Matched threat class: ${traceData.system1_reflex.threat_class}`
                    : 'No direct match found in the fast threat registry.'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
              Latency: <strong>{traceData.system1_reflex.latency_us}µs</strong>
            </div>
          </div>
        )}

        {/* Collapsible Technical Details */}
        {openGlobalTechDetails && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-3">
            <div className="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-200 pb-1">
              TECHNICAL CLASSIFICATION & ENGINE TELEMETRY
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">OVERALL RISK LEVEL:</span>
                <span className="font-bold text-slate-900">{assessment.risk_level}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">RAW RISK SCORE:</span>
                <span className="font-bold text-slate-900">{assessment.risk_score}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">TOTAL FINDINGS:</span>
                <span className="font-bold text-slate-900">{assessment.reasons.length}</span>
              </div>
            </div>

            {assessment.reasons.length > 0 && (
              <div className="bg-white p-2.5 rounded border border-slate-200 text-[11px]">
                <span className="text-[9px] text-slate-400 uppercase block mb-1">RAW REASON IDENTIFIERS:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {assessment.reasons.map((r: RiskReason, i: number) => (
                    <li key={i}>
                      <span className="font-bold">{r.reason_type}</span> — Severity: {r.severity} (Confidence: {r.confidence_score}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Velocity Section: HOW QUICKLY DID THE MONEY MOVE? */}
      {velocity && (
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 font-mono">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  HOW QUICKLY DID THE MONEY MOVE?
                </h3>
                <p className="text-[10px] text-slate-500 font-sans normal-case">
                  Shows how quickly funds moved between wallets during this investigation.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailedTiming(!showDetailedTiming)}
              className="text-xs text-slate-600 hover:text-slate-900 underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>{showDetailedTiming ? 'Hide detailed timing analysis' : 'View detailed timing analysis ▸'}</span>
              {showDetailedTiming ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Movement Risk & Primary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            {/* Movement Risk Score */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">MOVEMENT RISK</span>
              <div className="font-bold font-mono text-red-700 text-xl">
                {velocity.velocity_risk_score ?? 65} / 100
              </div>
              <div className="text-[11px] text-slate-600 font-sans mt-1">
                Multiple transfers were detected across {velocity.hop_count} hops.
              </div>
            </div>

            {/* Movement Pattern */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">MOVEMENT PATTERN</span>
              <div className="font-bold font-sans text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>{velocity.burst_velocity_category || (velocity.is_burst_drainer ? 'High speed burst' : 'Moderate speed')}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                {velocity.is_burst_drainer ? 'Rapid Drain Pattern' : 'Standard Dispersal'}
              </div>
            </div>

            {/* Estimated Sweep Time */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">ESTIMATED SWEEP TIME</span>
              <div className="font-bold font-mono text-amber-700 text-lg flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{velocity.estimated_liquidation_eta_minutes ?? 120} minutes</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Total duration: {velocity.total_duration_seconds}s
              </div>
            </div>

            {/* Transfers Tracked */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">TRANSFERS TRACKED</span>
              <div className="font-bold font-mono text-slate-900 text-lg flex items-center gap-1">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span>{velocity.hop_count} hops</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Inter-wallet hops
              </div>
            </div>
          </div>

          {/* Expandable Detailed Timing Analysis */}
          {showDetailedTiming && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-3 mt-3">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                DETAILED TIMING ANALYSIS & VOLUME DISPERSAL
              </div>

              {/* Transfer timing */}
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                  TRANSFER TIMING (TIME DELTAS)
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-700">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">MIN DELTA-T:</span>
                    <span className="font-bold text-slate-900">{velocity.min_delta_t_seconds ?? 0}s</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">AVG DELTA-T:</span>
                    <span className="font-bold text-slate-900">{velocity.avg_delta_t_seconds ?? 0}s</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">MAX DELTA-T:</span>
                    <span className="font-bold text-slate-900">{velocity.max_delta_t_seconds ?? 0}s</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">TOTAL DURATION:</span>
                    <span className="font-bold text-slate-900">{velocity.total_duration_seconds}s</span>
                  </div>
                </div>
              </div>

              {/* Rolling Windows Volume Dispersal Table */}
              {velocity.rolling_windows && velocity.rolling_windows.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono font-bold text-slate-600 uppercase mb-1.5">
                    ROLLING TIME WINDOW VOLUME DISPERSAL
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-xs font-mono text-left">
                      <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Window Label</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2">Dispersed Volume (USD)</th>
                          <th className="p-2">% of Total Loss</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {velocity.rolling_windows.map((w, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900">{w.window_label}</td>
                            <td className="p-2 text-slate-600">{w.window_seconds}s</td>
                            <td className="p-2 font-bold text-blue-800">${w.volume_usd.toLocaleString()}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-200 h-2 rounded overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-full"
                                    style={{ width: `${Math.min(100, w.percentage_of_total)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-slate-800">{w.percentage_of_total.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
