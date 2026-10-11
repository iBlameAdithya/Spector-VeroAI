import { useState, useEffect, useRef } from 'react';
import type { TraceRequest, TraceResponse } from './types/api';
import { api } from './services/api';

import { TopNav, type NavTab } from './components/TopNav';
import { InvestigationWorkbench } from './components/InvestigationWorkbench';
import { CaseSummaryBar } from './components/CaseSummaryBar';
import { ReflexResultCard } from './components/ReflexResultCard';
import { FundFlowGraph } from './components/FundFlowGraph';
import { VaspDetailsCard } from './components/VaspDetailsCard';
import { IntelligenceSection } from './components/IntelligenceSection';
import { EvidenceSection } from './components/EvidenceSection';
import { ReportsSection } from './components/ReportsSection';

import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('investigation');

  // API Connection State
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Investigation Trace State
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [isLoadingTrace, setIsLoadingTrace] = useState<boolean>(false);
  const [traceError, setTraceError] = useState<string | null>(null);

  // Section Refs for tab navigation scroll
  const fundFlowRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);

  // Poll Backend Health (Runs in background silently)
  const checkHealth = async () => {
    try {
      await api.checkHealth();
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Trace Execution
  const handleStartTrace = async (req: TraceRequest) => {
    setIsLoadingTrace(true);
    setTraceError(null);
    setTraceData(null);
    try {
      const data = await api.runTrace(req);
      setTraceData(data);
      setActiveTab('investigation');
    } catch (err: unknown) {
      setTraceError(err instanceof Error ? err.message : 'Investigation trace failed. Please verify connection to the SPECTER backend engine.');
    } finally {
      setIsLoadingTrace(false);
    }
  };

  // Tab change handler
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'fund-flow' && fundFlowRef.current) {
      fundFlowRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'intelligence' && intelligenceRef.current) {
      intelligenceRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'evidence' && evidenceRef.current) {
      evidenceRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'reports' && reportsRef.current) {
      reportsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* 1. Top Navigation */}
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4">
        {/* Connection Warning Banner if offline */}
        {!isBackendConnected && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs font-mono flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>SPECTER BACKEND UNREACHABLE:</strong> Start backend with <code className="bg-amber-100 px-1.5 py-0.5 rounded">cargo run -p specter-server</code> on port 8080.
              </span>
            </div>
            <button
              onClick={checkHealth}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 3. Investigation Workbench */}
        <InvestigationWorkbench
          onStartTrace={handleStartTrace}
          isLoading={isLoadingTrace}
          errorMessage={traceError}
        />

        {/* 4. Investigation Trace Results */}
        {traceData ? (
          <div className="space-y-4">
            {/* Case Summary Bar */}
            <CaseSummaryBar traceData={traceData} />

            {/* Initial Rapid Screening Result */}
            <ReflexResultCard reflex={traceData.system1_reflex} />

            {/* How the Money Moved (Main Workspace) */}
            <div ref={fundFlowRef}>
              <FundFlowGraph
                graph={traceData.graph}
                hopsTraversed={traceData.tracing_summary.hops_traversed}
                chain={traceData.detected_chain}
                terminalStatus={traceData.tracing_summary.terminal_status}
                terminalWallet={traceData.tracing_summary.terminal_wallet}
              />
            </div>

            {/* Where the Money Ended Up */}
            {traceData.tracing_summary && (
              <VaspDetailsCard tracingSummary={traceData.tracing_summary} />
            )}

            {/* Why This Was Flagged (Typologies & Velocity Details) */}
            <div ref={intelligenceRef}>
              <IntelligenceSection traceData={traceData} />
            </div>

            {/* Investigation Evidence */}
            <div ref={evidenceRef}>
              <EvidenceSection evidence={traceData.evidence_bundle} />
            </div>

            {/* Investigation Report */}
            <div ref={reportsRef}>
              <ReportsSection traceData={traceData} />
            </div>
          </div>
        ) : (
          /* Empty State / Prompt */
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center my-6">
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide mb-1">
              READY FOR INVESTIGATION
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 font-sans">
              Enter a TRON wallet address above and click "Start Investigation" (or "Load Canonical Case") to trace where the money went.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono bg-slate-50 text-slate-600 px-3 py-1.5 rounded border border-slate-200">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>All investigation data is retrieved live from the SPECTER backend engine.</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-xs font-mono text-slate-500 mt-auto">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-900">SPECTER</span> — Blockchain Financial-Crime Investigation Workstation
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>On-Chain Forensic Investigation Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
