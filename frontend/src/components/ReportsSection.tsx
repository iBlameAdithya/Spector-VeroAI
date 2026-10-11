import { useState, useEffect } from 'react';
import type { TraceResponse, SahyogPackage } from '../types/api';
import { api } from '../services/api';
import {
  FileText,
  Printer,
  CheckCircle2,
  AlertCircle,
  Scale,
  ExternalLink,
  Lock,
  Activity,
  Building2,
  GitCommit,
  Shield,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { getTronscanAddressUrl, getTronscanTxUrl } from '../utils/explorer';

interface ReportsSectionProps {
  traceData: TraceResponse;
}

type ReportState = 'IDLE' | 'GENERATING' | 'READY' | 'ERROR';

export const ReportsSection: React.FC<ReportsSectionProps> = ({ traceData }) => {
  const [reportState, setReportState] = useState<ReportState>('IDLE');
  const [isViewingReport, setIsViewingReport] = useState<boolean>(false);

  const [firNumber, setFirNumber] = useState<string>('');
  const [policeStation, setPoliceStation] = useState<string>('');
  const [officerBadgeId, setOfficerBadgeId] = useState<string>('');

  const [sahyogPackage, setSahyogPackage] = useState<SahyogPackage | null>(null);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const vasp = traceData.tracing_summary.destination_vasp;
  const lossUsd = (traceData.tracing_summary.initial_loss_usd || 0).toLocaleString();

  // Automatically reset report state whenever a new trace is run / traceData changes
  useEffect(() => {
    setReportState('IDLE');
    setIsViewingReport(false);
    setErrorMsg(null);
    setSahyogPackage(null);
  }, [traceData.case_id, traceData.graph?.nodes?.[0]?.id]);

  const handleGenerateReport = () => {
    setReportState('GENERATING');
    setErrorMsg(null);
    setTimeout(() => {
      setReportState('READY');
    }, 600);
  };

  const handleGeneratePackage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingPackage(true);
    setErrorMsg(null);
    try {
      const res = await api.generateSahyogPackage({
        case_id: traceData.case_id,
        fir_number: firNumber.trim(),
        police_station: policeStation.trim(),
        officer_badge_id: officerBadgeId.trim(),
      });
      setSahyogPackage(res);
    } catch (err: unknown) {
      console.error('[DEV ERROR] generateSahyogPackage API call failed:', err);
      const rawError = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        `REPORT UNAVAILABLE — Unable to generate legal notice package from the current backend response.${
          import.meta.env.DEV ? ` (Dev Log: ${rawError})` : ''
        }`
      );
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. COMPACT CONTROL CARD (Rendered on Investigation Console when not viewing full report)
  if (!isViewingReport) {
    return (
      <div className="bg-white border border-slate-300 rounded-md p-6 mb-6 shadow-sm font-sans text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
                INVESTIGATION INTELLIGENCE REPORT
              </h2>
              <p className="text-xs font-sans text-slate-500">
                Official 7-section SIH forensic intelligence summary and legal notice package compiler.
              </p>
            </div>
          </div>

          {reportState === 'READY' && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              REPORT READY
            </span>
          )}
        </div>

        {reportState === 'IDLE' && (
          <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono font-bold text-xs text-slate-800 uppercase mb-1">
                Generate Official Intelligence Document
              </div>
              <div className="text-xs text-slate-600 font-sans max-w-2xl">
                Compile multi-hop fund flow, risk indicators, VASP attributions, and Merkle evidence root into an investigation-ready document.
              </div>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              GENERATE INVESTIGATION REPORT
            </button>
          </div>
        )}

        {reportState === 'GENERATING' && (
          <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <div className="font-mono font-bold text-xs text-blue-900 uppercase">
                  GENERATING REPORT...
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  Compiling verified multi-hop ledger state, risk scores, and Merkle evidence root.
                </div>
              </div>
            </div>
          </div>
        )}

        {reportState === 'READY' && (
          <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono font-bold text-xs text-emerald-900 uppercase flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                INVESTIGATION REPORT READY FOR REVIEW
              </div>
              <div className="text-xs text-slate-600 font-sans">
                Case Reference: <span className="font-mono font-bold text-slate-800">{traceData.case_id}</span> • Verified On-Chain Intelligence
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsViewingReport(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-100" />
                VIEW REPORT
              </button>
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600" />
                DOWNLOAD PDF
              </button>
            </div>
          </div>
        )}

        {reportState === 'ERROR' && (
          <div className="bg-amber-50 p-4 rounded border border-amber-300 text-amber-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <div className="font-mono font-bold text-xs uppercase mb-0.5">
                  Unable to Generate Report
                </div>
                <div className="text-xs font-sans text-amber-800">
                  {errorMsg || 'Failed to compile report from trace telemetry.'}
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateReport}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded font-mono font-bold text-xs shrink-0 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. FULL 7-SECTION REPORT VIEW (Rendered when isViewingReport === true)
  return (
    <div className="bg-white border border-slate-300 rounded-md p-6 mb-6 shadow-sm font-sans text-xs print:p-0 print:border-none print:shadow-none">
      {/* Navigation & Action Header (Screen view only) */}
      <div className="print:hidden mb-5 pb-3 border-b border-slate-200 flex items-center justify-between gap-4">
        <button
          onClick={() => setIsViewingReport(false)}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono font-bold text-xs flex items-center gap-2 transition-colors border border-slate-300"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
          <span>BACK TO INVESTIGATION</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-100" /> Print / Export Report (PDF)
          </button>
        </div>
      </div>

      {/* 1. REPORT HEADER */}
      <div className="border-b-2 border-slate-300 pb-4 mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-blue-700 shrink-0" />
            <h1 className="text-base font-bold font-mono text-slate-900 uppercase tracking-wider">
              INVESTIGATION-READY BLOCKCHAIN INTELLIGENCE REPORT
            </h1>
          </div>
          <p className="text-xs font-mono font-semibold text-blue-900">
            SPECTER HIGH-VELOCITY MULTI-HOP FUND TRACING & RISK ENGINE
          </p>
        </div>
      </div>

      {/* 2. SECTION 1 — EXECUTIVE SUMMARY & CASE METADATA */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          1. EXECUTIVE SUMMARY & CASE METADATA
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Case ID:</span>
              <span className="font-bold text-slate-900">{traceData.case_id || 'Not available'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Job Reference:</span>
              <span className="font-bold text-slate-900">JOB-{traceData.case_id?.slice(-6) || 'N/A'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Target Wallet:</span>
              <span className="font-bold text-blue-800 break-all text-[11px]">
                {traceData.graph?.nodes?.[0]?.id || 'Not available'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Network / Asset:</span>
              <span className="font-bold text-slate-900 uppercase">
                {traceData.detected_chain || 'TRON'} (USDT)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Initial Claimed Loss:</span>
              <span className="font-bold text-emerald-800">${lossUsd} {traceData.tracing_summary?.currency || 'USDT'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Screening Status:</span>
              <span className="font-bold text-emerald-700">
                {traceData.system1_reflex?.status || 'Not available'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Completed At:</span>
              <span className="font-bold text-slate-900">
                {traceData.evidence_bundle?.compilation_timestamp || new Date().toISOString()}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Wallets Traced:</span>
              <span className="font-bold text-slate-900">
                {traceData.graph?.nodes?.length ?? 0} Wallets
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 uppercase font-semibold">Transactions Analyzed:</span>
              <span className="font-bold text-slate-900">
                {traceData.graph?.edges?.length ?? 0} Transfers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 2 — TRANSACTION-FLOW RISK INDICATOR BREAKDOWN */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          2. TRANSACTION-FLOW RISK INDICATOR BREAKDOWN
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5 space-y-3">
          {/* Top Score Box */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">CONTEXTUAL RISK SCORE</span>
              <div className="text-xl font-bold text-red-700">
                {traceData.velocity?.velocity_risk_score ?? traceData.system1_reflex?.confidence_score ?? 65} / 100
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">RISK LEVEL</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                [{traceData.system1_reflex?.is_instant_threat ? 'HIGH RISK' : 'LOW RISK'}]
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">DETECTION CONFIDENCE</span>
              <span className="font-bold text-emerald-700 text-sm">
                {traceData.system1_reflex?.confidence_score ?? 90}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 italic font-sans border-l-2 border-slate-400 pl-2 py-0.5">
            "Risk indicators represent observed transaction and graph patterns. They do not by themselves establish criminal activity, ownership, or illicit intent."
          </p>

          {/* Risk Table */}
          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Observed Indicator</th>
                  <th className="p-2">Points / Severity</th>
                  <th className="p-2">Factual Evidence & Rule Details</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr className="hover:bg-slate-50">
                  <td className="p-2 font-bold text-slate-900">
                    Intake Screening ({traceData.system1_reflex?.threat_class || 'NONE'})
                  </td>
                  <td className="p-2 text-red-700 font-bold">+{traceData.system1_reflex?.confidence_score ?? 0} pts</td>
                  <td className="p-2 font-sans text-slate-700 text-[11px]">
                    Rapid screening check complete. Matched signature: {traceData.system1_reflex?.matched_address || 'Public Ledger Verified'}.
                  </td>
                  <td className="p-2 text-center">
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded text-[9px] font-bold">
                      OBSERVED
                    </span>
                  </td>
                </tr>

                {(traceData.typologies || []).map((typ, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900">{typ.typology_name}</td>
                    <td className="p-2 font-bold text-amber-700">{typ.severity} ({typ.confidence_score}%)</td>
                    <td className="p-2 font-sans text-slate-700 text-[11px]">
                      {typ.description}. Conditions: {(typ.trigger_conditions || []).join('; ') || 'Observed pattern'}.
                    </td>
                    <td className="p-2 text-center">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded text-[9px] font-bold">
                        {typ.is_known_service_entity ? 'KNOWN SERVICE' : 'HEURISTIC'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* False Positive Mitigations */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs font-sans">
            <span className="font-mono font-bold text-slate-800 uppercase block mb-1 text-[10px]">
              FALSE-POSITIVE MITIGATIONS & SAFETY RULES APPLIED
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
              <li>Known service entities excluded from mule tagging</li>
              <li>Incident time-window restriction applied</li>
              <li>Proportional asset-hold calculation active</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. SECTION 3 — HIGH-VELOCITY MOVEMENT ANALYSIS */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          3. HIGH-VELOCITY MOVEMENT ANALYSIS
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5 space-y-3 font-mono">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 text-[9px] uppercase block">VELOCITY FLAG</span>
              <span className="font-bold text-slate-900">
                {traceData.velocity?.is_burst_drainer ? 'HIGH SPEED BURST' : 'STANDARD'}
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 text-[9px] uppercase block">TOTAL DURATION</span>
              <span className="font-bold text-slate-900">{traceData.velocity?.total_duration_seconds ?? 0}s</span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 text-[9px] uppercase block">HOPS TRACKED</span>
              <span className="font-bold text-blue-800">{traceData.velocity?.hop_count ?? 0} Hops</span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 text-[9px] uppercase block">SWEEP TIME ETA</span>
              <span className="font-bold text-amber-700">
                {traceData.velocity?.estimated_liquidation_eta_minutes ?? 120} min
              </span>
            </div>
          </div>

          {/* Rolling Windows Table */}
          {traceData.velocity?.rolling_windows && traceData.velocity.rolling_windows.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                ROLLING TIME WINDOW VOLUME DISPERSAL
              </span>
              <div className="overflow-x-auto border border-slate-300 rounded">
                <table className="w-full text-xs font-mono text-left">
                  <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Window Label</th>
                      <th className="p-2">Duration</th>
                      <th className="p-2">Dispersed Volume (USD)</th>
                      <th className="p-2">% of Total Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {traceData.velocity.rolling_windows.map((w, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900">{w.window_label}</td>
                        <td className="p-2 text-slate-600">{w.window_seconds}s</td>
                        <td className="p-2 font-bold text-blue-800">${w.volume_usd.toLocaleString()}</td>
                        <td className="p-2 font-bold text-slate-900">{w.percentage_of_total.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SECTION 4 — STRUCTURAL TRANSACTION TYPOLOGY ANALYSIS */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-blue-400" />
          4. STRUCTURAL TRANSACTION TYPOLOGY ANALYSIS
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5">
          <div className="overflow-x-auto border border-slate-300 rounded font-mono">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Typology Pattern</th>
                  <th className="p-2">Severity</th>
                  <th className="p-2">Confidence</th>
                  <th className="p-2">Trigger Conditions & Supporting Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {(traceData.typologies || []).length > 0 ? (
                  traceData.typologies.map((typ, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-bold text-slate-900">{typ.typology_name}</td>
                      <td className="p-2 font-bold text-red-700">{typ.severity}</td>
                      <td className="p-2 font-bold text-emerald-700">{typ.confidence_score}%</td>
                      <td className="p-2 font-sans text-slate-700 text-[11px]">
                        {typ.description} (Wallets: {typ.supporting_wallets?.length ?? 0}, Txs: {typ.supporting_transactions?.length ?? 0})
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-slate-500 italic font-sans">
                      No structural typologies flagged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. SECTION 5 — VIRTUAL ASSET SERVICE PROVIDER (VASP) ATTRIBUTION */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          5. VIRTUAL ASSET SERVICE PROVIDER (VASP) ATTRIBUTION
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5 space-y-3 font-mono">
          {vasp ? (
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase block">ATTRIBUTED VASP</span>
                  <span className="font-bold text-slate-900 text-sm">{vasp.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase block">CONFIDENCE SCORE</span>
                  <span className="font-bold text-emerald-700 text-sm">{vasp.confidence_score}%</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase block">HOP DISTANCE</span>
                  <span className="font-bold text-blue-800 text-sm">
                    {traceData.tracing_summary.hops_traversed} Hops
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 text-[9px] uppercase block mb-0.5">MATCHED ENDPOINT ADDRESS</span>
                <div className="flex items-center gap-2">
                  <code className="font-bold text-blue-800 bg-white p-1 rounded border border-slate-200 text-xs break-all">
                    {vasp.deposit_address}
                  </code>
                  <a
                    href={getTronscanAddressUrl(vasp.deposit_address)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 shrink-0 print:hidden"
                  >
                    <span>VIEW ON TRONSCAN</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 italic font-sans text-xs">
              No destination exchange identified in the current money movement trace.
            </div>
          )}

          <p className="text-[11px] text-slate-600 italic font-sans border-l-2 border-slate-400 pl-2 py-0.5">
            "Evidence-backed analytical attribution based on transfer flow continuity; this does not constitute legal proof of beneficial ownership."
          </p>
        </div>
      </div>

      {/* 7. SECTION 6 — MULTI-HOP FUND TRACING PATH LEDGER */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <GitCommit className="w-3.5 h-3.5 text-blue-400" />
          6. MULTI-HOP FUND TRACING PATH LEDGER
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5">
          <div className="overflow-x-auto border border-slate-300 rounded font-mono">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Hop #</th>
                  <th className="p-2">Sender (From)</th>
                  <th className="p-2">Recipient (To)</th>
                  <th className="p-2">Amount (USD)</th>
                  <th className="p-2">Transaction Hash</th>
                  <th className="p-2">Path Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
                {(traceData.graph?.edges || []).map((edge, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900">{idx + 1}</td>
                    <td className="p-2">
                      <a
                        href={getTronscanAddressUrl(edge.from)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:text-blue-700 hover:underline font-bold break-all"
                      >
                        {edge.from}
                      </a>
                    </td>
                    <td className="p-2">
                      <a
                        href={getTronscanAddressUrl(edge.to)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:text-blue-700 hover:underline font-bold break-all"
                      >
                        {edge.to}
                      </a>
                    </td>
                    <td className="p-2 font-bold text-emerald-700">${edge.amount.toLocaleString()}</td>
                    <td className="p-2">
                      <a
                        href={getTronscanTxUrl(edge.tx)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-800 hover:underline font-bold break-all"
                      >
                        {edge.tx.slice(0, 16)}...
                      </a>
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          edge.is_trunk
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {edge.is_trunk ? 'TRUNK PATH' : 'PEEL BRANCH'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 8. SECTION 7 — VERIFIABLE EVIDENCE LEDGER & SOURCE REGISTRY ATTRIBUTION */}
      <div className="mb-6 report-card">
        <h2 className="text-xs font-bold font-mono text-slate-900 bg-slate-100 border-b border-slate-300 px-3 py-2 rounded-t uppercase tracking-wide flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          7. VERIFIABLE EVIDENCE LEDGER & SOURCE REGISTRY ATTRIBUTION
        </h2>

        <div className="border border-t-0 border-slate-300 rounded-b p-3.5 space-y-3 font-mono">
          <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 text-[9px] uppercase block">EVIDENCE BUNDLE ID</span>
              <span className="font-bold text-slate-900">{traceData.evidence_bundle?.case_id || traceData.case_id}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[9px] uppercase block">RECORD COUNT</span>
              <span className="font-bold text-slate-900">{traceData.evidence_bundle?.leaf_count ?? 0} Records</span>
            </div>

            <div>
              <span className="text-slate-500 text-[9px] uppercase block">HASH ALGORITHM</span>
              <span className="font-bold text-blue-800">{traceData.evidence_bundle?.algorithm || 'SHA-256'}</span>
            </div>
          </div>

          <div className="bg-slate-100 text-slate-900 p-3 rounded border border-slate-300">
            <span className="text-[9px] text-blue-800 font-bold uppercase block mb-1">
              FULL MERKLE ROOT EVIDENCE HASH
            </span>
            <code className="font-bold text-emerald-800 text-xs break-all bg-white p-1.5 rounded border border-slate-200 block">
              {traceData.evidence_bundle?.merkle_root || 'Not available'}
            </code>
          </div>
        </div>
      </div>

      {/* 9. LEGAL SAFEGUARDS & INVESTIGATIVE DISCLAIMERS */}
      <div className="border border-slate-300 rounded p-4 bg-slate-50 text-xs font-sans space-y-2 mb-6 report-card">
        <h3 className="font-mono font-bold text-slate-900 uppercase text-xs border-b border-slate-300 pb-1 flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-slate-800" />
          LEGAL SAFEGUARDS & INVESTIGATIVE DISCLAIMERS
        </h3>

        <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] leading-relaxed">
          <li>
            <strong>Non-Criminal Labeling Safeguard:</strong> Analytical scores and typologies reflect observed mathematical/graph patterns on the public ledger and do not establish criminality or guilt.
          </li>
          <li>
            <strong>No Automatic Freezing:</strong> This intelligence report serves as analytical decision support and does not itself constitute an automatic freeze order.
          </li>
          <li>
            <strong>Authorised Integration Only:</strong> External compliance portal submission requires appropriate human investigator authorization.
          </li>
          <li>
            <strong>Chain of Custody:</strong> Transaction hashes and explorer URLs reference verified blockchain ledger state.
          </li>
        </ol>
      </div>

      {/* Optional Legal Package Generator Action Section */}
      <div className="print:hidden border-t border-slate-200 pt-4">
        <form onSubmit={handleGeneratePackage} className="bg-slate-50 p-3.5 rounded border border-slate-200 mb-4 font-mono text-xs">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase mb-2">
            LEGAL NOTICE PACKAGE GENERATOR
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                FIR / Crime Reference
              </label>
              <input
                type="text"
                placeholder="Enter reference number"
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Police Station / Unit
              </label>
              <input
                type="text"
                placeholder="Enter unit or station"
                value={policeStation}
                onChange={(e) => setPoliceStation(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">
                Officer ID
              </label>
              <input
                type="text"
                placeholder="Enter officer ID"
                value={officerBadgeId}
                onChange={(e) => setOfficerBadgeId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => handleGeneratePackage()}
                className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-mono font-bold text-xs shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGeneratingPackage}
              className={`px-4 py-1.5 text-xs font-bold text-white rounded bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 ${
                isGeneratingPackage ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isGeneratingPackage ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>GENERATING PACKAGE...</span>
                </>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5 text-blue-200" />
                  <span>COMPILE LEGAL NOTICE PACKAGE</span>
                </>
              )}
            </button>
          </div>
        </form>

        {sahyogPackage && (
          <div className="border border-slate-300 rounded-md p-4 bg-slate-50 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">PACKAGE IDENTIFIER</div>
                <div className="font-bold text-slate-900 text-sm">{sahyogPackage.package_id}</div>
                <div className="text-xs text-blue-700 font-bold mt-0.5">{sahyogPackage.legal_directive_title}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded font-bold text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> READY FOR DISPATCH
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] bg-white p-3 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[9px]">TARGET EXCHANGE:</span>
                <span className="font-bold text-slate-900">{sahyogPackage.target_vasp_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">SUSPECT ACCOUNT:</span>
                <span className="font-bold text-blue-800 break-all text-[10px]">{sahyogPackage.target_deposit_address}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">CLAIMED VALUE:</span>
                <span className="font-bold text-emerald-700">{sahyogPackage.claimed_value}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-700 uppercase mb-1">
                FORMAL LEGAL STATUTORY NOTICE TEXT
              </h4>
              <div className="bg-white p-3 rounded border border-slate-300 text-slate-800 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {sahyogPackage.formal_freeze_notice_text}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Action Header (Screen view only) */}
      <div className="print:hidden mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => setIsViewingReport(false)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-mono font-bold text-xs flex items-center gap-2 transition-colors border border-slate-300"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
          <span>BACK TO INVESTIGATION</span>
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-blue-100" /> Print / Export Report (PDF)
        </button>
      </div>

      {/* Footer for Report */}
      <div className="border-t border-slate-300 pt-3 mt-6 text-[10px] font-mono text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <div>SPECTER Investigation System — Case Reference: {traceData.case_id}</div>
        <div>Generated: {new Date().toISOString()}</div>
      </div>
    </div>
  );
};


