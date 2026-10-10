import { useState, useEffect } from 'react';
import { api } from './api';
import type {
  HealthResponse,
  TraceResponse,
  VoiceAlertPayload,
  SignAndSubmitResponse,
  SahyogPackage,
} from './api';
import { Navbar } from './components/Navbar';
import { InputBar } from './components/InputBar';
import { ReflexMetric } from './components/ReflexMetric';
import { HopGraph } from './components/HopGraph';
import { EvidenceCard } from './components/EvidenceCard';
import { TypologiesCard } from './components/TypologiesCard';
import { VelocityCard } from './components/VelocityCard';
import { VoiceAlertBanner } from './components/VoiceAlertBanner';
import { HitlModal } from './components/HitlModal';
import { SahyogModal } from './components/SahyogModal';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  Landmark,
  Radio,
  Building2,
} from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [voiceAlert, setVoiceAlert] = useState<VoiceAlertPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineState, setPipelineState] = useState<
    'IDLE' | 'SCREENING' | 'TRACING' | 'EVIDENCE_COMPILED' | 'AWAITING_HUMAN_SIGN' | 'COMPLETED'
  >('IDLE');

  // Modals
  const [isHitlOpen, setIsHitlOpen] = useState(false);
  const [isSahyogOpen, setIsSahyogOpen] = useState(false);
  const [sahyogPackage, setSahyogPackage] = useState<SahyogPackage | null>(null);
  const [, setWarrantReceipt] = useState<SignAndSubmitResponse | null>(null);

  // Poll health on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await api.getHealth();
        setHealth(h);
      } catch (e) {
        console.warn('Backend connecting...', e);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle Trace Execution
  const handleTrace = async (stolenTx: string, victimWallet: string, chain: string, maxHops: number) => {
    setLoading(true);
    setPipelineState('SCREENING');
    try {
      // Step 1: Trace incident
      setPipelineState('TRACING');
      const traceRes = await api.traceIncident({
        stolen_tx_hash: stolenTx,
        victim_wallet: victimWallet,
        chain,
        max_hops: maxHops,
      });
      setTrace(traceRes);
      setPipelineState('EVIDENCE_COMPILED');

      // Step 2: Fetch tactical voice alert
      try {
        const vAlert = await api.getVoiceAlert(traceRes.case_id);
        setVoiceAlert(vAlert);
      } catch (e) {
        console.warn('Voice alert fetch notice:', e);
      }
    } catch (err: any) {
      alert(`Forensic trace error: ${err.message}`);
      setPipelineState('IDLE');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Prepare Freeze (Agentic Browser Operator)
  const handlePrepareFreeze = async () => {
    if (!trace) return;
    setLoading(true);
    try {
      const vasp = trace.tracing_summary.destination_vasp;
      await api.prepareFreeze({
        case_id: trace.case_id,
        target_vasp: vasp?.name || 'Binance',
        deposit_address: vasp?.deposit_address || '0x3f5ce5fb59e02f43cf8d1326be81a329d448181a',
      });
      setPipelineState('AWAITING_HUMAN_SIGN');
      setIsHitlOpen(true);
    } catch (err: any) {
      alert(`Prepare freeze error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open SAHYOG Package generator
  const handleOpenSahyog = async () => {
    if (!trace) return;
    if (!sahyogPackage) {
      try {
        const pkg = await api.getSahyogPackage(trace.case_id);
        setSahyogPackage(pkg);
      } catch {
        // will be created in modal
      }
    }
    setIsSahyogOpen(true);
  };

  const handleWarrantIssued = (warrant: SignAndSubmitResponse) => {
    setWarrantReceipt(warrant);
    setPipelineState('COMPLETED');
  };

  return (
    <div className="min-h-screen bg-specter-bg text-white font-sans flex flex-col selection:bg-specter-cyan selection:text-black">
      {/* Top Telemetry Header */}
      <Navbar health={health} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Pipeline State Progress Bar */}
        <div className="bg-specter-card/70 border border-specter-border rounded-xl px-4 py-3 flex items-center justify-between text-xs font-mono overflow-x-auto gap-3">
          <div className="flex items-center gap-1.5 text-specter-muted text-[11px] shrink-0">
            <Radio className="h-3.5 w-3.5 text-specter-cyan" />
            <span>PIPELINE:</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineState === 'IDLE'
                  ? 'bg-specter-gold/20 text-specter-gold border border-specter-gold/40'
                  : 'bg-specter-darkest text-specter-muted'
              }`}
            >
              1. IDLE
            </span>
            <ArrowRight className="h-3 w-3 text-specter-muted" />

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineState === 'SCREENING'
                  ? 'bg-specter-cyan/20 text-specter-cyan border border-specter-cyan/40 animate-pulse'
                  : 'bg-specter-darkest text-specter-muted'
              }`}
            >
              2. REFLEX GATE (&lt;100µs)
            </span>
            <ArrowRight className="h-3 w-3 text-specter-muted" />

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineState === 'TRACING'
                  ? 'bg-specter-cyan/20 text-specter-cyan border border-specter-cyan/40 animate-pulse'
                  : 'bg-specter-darkest text-specter-muted'
              }`}
            >
              3. GRAPH TRACER
            </span>
            <ArrowRight className="h-3 w-3 text-specter-muted" />

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineState === 'EVIDENCE_COMPILED'
                  ? 'bg-specter-emerald/20 text-specter-emerald border border-specter-emerald/40'
                  : 'bg-specter-darkest text-specter-muted'
              }`}
            >
              4. EVIDENCE COMPILED
            </span>
            <ArrowRight className="h-3 w-3 text-specter-muted" />

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineState === 'AWAITING_HUMAN_SIGN'
                  ? 'bg-specter-gold text-black border border-specter-gold animate-bounce font-extrabold'
                  : 'bg-specter-darkest text-specter-muted'
              }`}
            >
              5. HITL CHECKPOINT
            </span>
            <ArrowRight className="h-3 w-3 text-specter-muted" />

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                pipelineState === 'COMPLETED'
                  ? 'bg-specter-emerald text-black border border-specter-emerald font-extrabold'
                  : 'bg-specter-darkest text-specter-muted'
              }`}
            >
              6. WARRANT ISSUED
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <InputBar onTrace={handleTrace} loading={loading} />

        {/* System 1 Reflex Gate Metric Banner */}
        {trace && <ReflexMetric reflex={trace.system1_reflex} />}

        {/* Voice Alert Banner */}
        {trace && voiceAlert && (
          <VoiceAlertBanner alert={voiceAlert} caseId={trace.case_id} />
        )}

        {/* Main Forensic Grid */}
        {trace && (
          <div className="space-y-6">
            {/* Hop Graph Visualizer */}
            <HopGraph graph={trace.graph} />

            {/* Terminal VASP Action Bar */}
            {trace.tracing_summary.destination_vasp && (
              <div className="bg-gradient-to-r from-specter-card via-specter-darkest to-specter-card border border-specter-cyan/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-xl bg-specter-cyan/15 border border-specter-cyan/40 flex items-center justify-center text-specter-cyan shadow-neon-cyan shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-specter-cyan/20 text-specter-cyan border border-specter-cyan/40">
                          TERMINAL VASP IDENTIFIED
                        </span>
                        <span className="text-xs font-mono text-specter-emerald font-semibold">
                          {trace.tracing_summary.destination_vasp.confidence_score}% Attribution
                        </span>
                      </div>
                      <h3 className="text-lg font-bold font-mono text-white mt-0.5">
                        {trace.tracing_summary.destination_vasp.name} —{' '}
                        {trace.tracing_summary.destination_vasp.cluster_type}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-specter-muted mt-0.5">
                        <span>Deposit Address:</span>
                        <span className="text-specter-gold font-bold">
                          {trace.tracing_summary.destination_vasp.deposit_address}
                        </span>
                        <span>&bull;</span>
                        <span className="text-specter-crimson font-bold">
                          Sweeps in ~{trace.tracing_summary.destination_vasp.sweep_time_minutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                    {/* SAHYOG Statutory Package Button */}
                    <button
                      onClick={handleOpenSahyog}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-specter-card hover:bg-specter-hover border border-specter-border hover:border-amber-500/50 text-white font-mono text-xs font-semibold transition-all"
                    >
                      <Landmark className="h-4 w-4 text-amber-400" />
                      <span>MHA SAHYOG PACKAGE</span>
                    </button>

                    {/* Agentic Browser Freeze Button */}
                    <button
                      onClick={handlePrepareFreeze}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-specter-gold to-amber-500 hover:from-specter-gold hover:to-amber-400 text-black font-mono font-bold text-xs tracking-wider transition-all shadow-lg hover:shadow-neon-gold"
                    >
                      <Lock className="h-4 w-4" />
                      <span>PREPARE STATUTORY FREEZE (AGENT BROWSER)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Split Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Typologies Card */}
              <TypologiesCard typologies={trace.typologies} />

              {/* Velocity & Burst Analytics Card */}
              <VelocityCard velocity={trace.velocity} />
            </div>

            {/* Cryptographic Evidence Card */}
            <EvidenceCard evidence={trace.evidence_bundle} />
          </div>
        )}

        {/* Empty / Initial State Greeting when no trace has run */}
        {!trace && (
          <div className="bg-specter-card/50 border border-specter-border/80 rounded-2xl p-10 text-center max-w-2xl mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-specter-cyan/10 border border-specter-cyan/30 flex items-center justify-center text-specter-cyan mx-auto shadow-neon-cyan">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-white">
                SPECTER AUTONOMOUS ON-CHAIN COMMAND CENTER
              </h3>
              <p className="text-xs text-specter-muted mt-1 leading-relaxed">
                Sub-100 microsecond System 1 reflex screening, multi-hop peel-chain graph reconstruction, EGRE financial crime typologies, fund flow velocity analytics, BLAKE3 Merkle evidence compilation, and Human-in-the-Loop browser agent automation.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() =>
                  handleTrace(
                    '0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b',
                    '0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9',
                    'ethereum',
                    4
                  )
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-specter-cyan to-blue-600 hover:from-specter-cyan hover:to-blue-500 text-black font-mono font-bold text-xs tracking-wider transition-all shadow-xl hover:shadow-neon-cyan"
              >
                <span>EXECUTE 90-SECOND STAGE DEMO INCIDENT</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Human-in-the-Loop Modal */}
      {trace && (
        <HitlModal
          isOpen={isHitlOpen}
          onClose={() => setIsHitlOpen(false)}
          caseId={trace.case_id}
          targetVasp={trace.tracing_summary.destination_vasp?.name || 'Binance'}
          depositAddress={
            trace.tracing_summary.destination_vasp?.deposit_address ||
            '0x3f5ce5fb59e02f43cf8d1326be81a329d448181a'
          }
          claimValue={`$${(trace.tracing_summary.initial_loss_usd - 1000).toLocaleString()} USDT`}
          merkleProof={trace.evidence_bundle.merkle_root}
          onWarrantIssued={handleWarrantIssued}
        />
      )}

      {/* MHA SAHYOG Statutory Package Modal */}
      {trace && (
        <SahyogModal
          isOpen={isSahyogOpen}
          onClose={() => setIsSahyogOpen(false)}
          caseId={trace.case_id}
          initialPackage={sahyogPackage}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-specter-border bg-specter-darkest py-4 px-4 text-center text-xs font-mono text-specter-muted mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SPECTER v1.0 &bull; Hackathon Security Track &bull; Rust Core + Agentic Browser</span>
          <span className="text-[11px] text-gray-500">
            Automate the forensics; empower the human.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
