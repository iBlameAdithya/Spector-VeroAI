import { useState, useEffect } from 'react';
import {
  Activity, ArrowRight, BadgeCheck, Building2, ChartNoAxesCombined,
  CircleHelp, FileCheck2, Fingerprint, Gauge, Landmark, LockKeyhole,
  Network, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Zap,
} from 'lucide-react';
import { api } from './api';
import type {
  HealthResponse, TraceResponse, VoiceAlertPayload, SignAndSubmitResponse, SahyogPackage,
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
import './App.css';

type PipelineState = 'IDLE' | 'SCREENING' | 'TRACING' | 'EVIDENCE_COMPILED' | 'AWAITING_HUMAN_SIGN' | 'COMPLETED';

const DEMO_TX = '0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b';
const DEMO_WALLET = '0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9';

const pipelineSteps: { key: PipelineState; label: string }[] = [
  { key: 'IDLE', label: 'Ready' },
  { key: 'SCREENING', label: 'Reflex screening' },
  { key: 'TRACING', label: 'Trace graph' },
  { key: 'EVIDENCE_COMPILED', label: 'Evidence compiled' },
  { key: 'AWAITING_HUMAN_SIGN', label: 'Human approval' },
  { key: 'COMPLETED', label: 'Completed' },
];

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [trace, setTrace] = useState<TraceResponse | null>(null);
  const [voiceAlert, setVoiceAlert] = useState<VoiceAlertPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>('IDLE');
  const [isHitlOpen, setIsHitlOpen] = useState(false);
  const [isSahyogOpen, setIsSahyogOpen] = useState(false);
  const [sahyogPackage, setSahyogPackage] = useState<SahyogPackage | null>(null);
  const [warrantReceipt, setWarrantReceipt] = useState<SignAndSubmitResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const result = await api.getHealth();
        if (mounted) setHealth(result);
      } catch (error) {
        console.warn('Backend health check unavailable:', error);
        if (mounted) setHealth(null);
      }
    };
    void fetchHealth();
    const interval = window.setInterval(() => void fetchHealth(), 8000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const handleTrace = async (stolenTx: string, victimWallet: string, chain: string, maxHops: number) => {
    setLoading(true);
    setVoiceAlert(null);
    setWarrantReceipt(null);
    setPipelineState('SCREENING');
    try {
      setPipelineState('TRACING');
      const traceRes = await api.traceIncident({
        stolen_tx_hash: stolenTx,
        victim_wallet: victimWallet,
        chain,
        max_hops: maxHops,
      });
      setTrace(traceRes);
      setPipelineState('EVIDENCE_COMPILED');
      try {
        const alertPayload = await api.getVoiceAlert(traceRes.case_id);
        setVoiceAlert(alertPayload);
      } catch (error) {
        console.warn('Voice alert could not be loaded:', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown tracing error';
      window.alert(`Forensic trace error: ${message}`);
      setPipelineState('IDLE');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown freeze preparation error';
      window.alert(`Prepare freeze error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSahyog = async () => {
    if (!trace) return;
    if (!sahyogPackage) {
      try {
        const pkg = await api.getSahyogPackage(trace.case_id);
        setSahyogPackage(pkg);
      } catch (error) {
        console.warn('SAHYOG package will be prepared in the modal:', error);
      }
    }
    setIsSahyogOpen(true);
  };

  const handleWarrantIssued = (warrant: SignAndSubmitResponse) => {
    setWarrantReceipt(warrant);
    setPipelineState('COMPLETED');
  };

  const currentStep = pipelineSteps.findIndex((step) => step.key === pipelineState);
  const healthLabel = health?.status || 'Connecting';
  const healthOnline = Boolean(health && /online|healthy|ok|running/i.test(health.status));
  const riskScore = trace?.velocity?.velocity_risk_score;
  const graphNodes = trace?.graph?.nodes?.length ?? 0;
  const graphEdges = trace?.graph?.edges?.length ?? 0;

  return (
    <div className="sv-app min-h-screen font-sans">
      <Navbar health={health} />

      <div className="sv-layout">
        <aside className="sv-sidebar" aria-label="Dashboard navigation">
          <div className="sv-sidebar-label">WORKSPACE</div>
          <a className="sv-nav-link active" href="#overview"><Activity size={17} /> Overview</a>
          <a className="sv-nav-link" href="#incident"><ShieldAlert size={17} /> Incident triage</a>
          <a className="sv-nav-link" href="#trace-results"><Network size={17} /> Trace analysis</a>
          <a className="sv-nav-link" href="#evidence"><FileCheck2 size={17} /> Evidence dossier</a>
          <div className="sv-sidebar-divider" />
          <div className="sv-sidebar-label">SYSTEM</div>
          <div className="sv-system-state">
            <span className={`sv-status-dot ${healthOnline ? 'online' : ''}`} />
            <div><strong>{healthLabel}</strong><small>Rust core engine</small></div>
          </div>
          <div className="sv-sidebar-note">
            <div className="sv-sidebar-note-icon"><LockKeyhole size={16} /></div>
            <strong>Human-led response</strong>
            <p>Critical actions require officer review and approval.</p>
          </div>
          <div className="sv-sidebar-foot">SPECTER VEROAI <span>v1.0</span></div>
        </aside>

        <main className="sv-main" id="overview">
          <section className="sv-welcome">
            <div>
              <div className="sv-eyebrow"><span className="sv-eyebrow-dot" /> INCIDENT RESPONSE PLATFORM</div>
              <h1>Forensic command center</h1>
              <p>Investigate suspicious fund flows, identify off-ramps, and compile verifiable evidence in one workspace.</p>
            </div>
            <div className="sv-welcome-actions">
              <span className={`sv-connection-pill ${healthOnline ? 'is-online' : ''}`}>
                <span className="sv-status-dot" /> {healthOnline ? 'Systems operational' : 'Waiting for backend'}
              </span>
              <button className="sv-quiet-button" onClick={() => window.location.reload()} title="Refresh dashboard">
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </section>

          <section className="sv-stat-grid" aria-label="System overview metrics">
            <article className="sv-stat-card">
              <div className="sv-stat-top"><span>REFLEX LATENCY</span><span className="sv-stat-icon blue"><Zap size={17} /></span></div>
              <div className="sv-stat-value">{trace?.system1_reflex?.latency_us ?? health?.system1_latency_p99_us ?? '—'} <small>µs</small></div>
              <div className="sv-stat-foot"><span className="sv-mini-check"><BadgeCheck size={13} /></span> Target under 100 µs</div>
              <div className="sv-stat-track"><span style={{ width: `${Math.min(100, ((trace?.system1_reflex?.latency_us ?? health?.system1_latency_p99_us ?? 0) / 100) * 100)}%` }} /></div>
            </article>
            <article className="sv-stat-card">
              <div className="sv-stat-top"><span>WALLETS / NODES</span><span className="sv-stat-icon violet"><Network size={17} /></span></div>
              <div className="sv-stat-value">{trace ? graphNodes : '—'} <small>{trace ? 'nodes' : 'awaiting trace'}</small></div>
              <div className="sv-stat-foot"><span className="sv-stat-neutral">{trace ? `${graphEdges} connections mapped` : 'Run a trace to populate'}</span></div>
              <div className="sv-stat-track violet-track"><span style={{ width: `${trace ? Math.min(100, graphNodes * 8) : 8}%` }} /></div>
            </article>
            <article className="sv-stat-card">
              <div className="sv-stat-top"><span>VELOCITY RISK</span><span className="sv-stat-icon amber"><Gauge size={17} /></span></div>
              <div className="sv-stat-value">{typeof riskScore === 'number' ? riskScore : '—'}<small>{typeof riskScore === 'number' ? '/100' : ' score'}</small></div>
              <div className="sv-stat-foot"><span className={trace?.velocity?.is_burst_drainer ? 'sv-risk-text' : 'sv-stat-neutral'}>{trace?.velocity?.is_burst_drainer ? 'Burst activity detected' : trace ? 'Velocity analysis complete' : 'Awaiting analysis'}</span></div>
              <div className="sv-stat-track amber-track"><span style={{ width: `${typeof riskScore === 'number' ? Math.max(0, Math.min(100, riskScore)) : 0}%` }} /></div>
            </article>
            <article className="sv-stat-card">
              <div className="sv-stat-top"><span>TYPOLOGIES</span><span className="sv-stat-icon green"><Fingerprint size={17} /></span></div>
              <div className="sv-stat-value">{trace?.typologies?.length ?? '—'} <small>{trace ? 'findings' : 'detected'}</small></div>
              <div className="sv-stat-foot"><span className="sv-mini-check"><ShieldCheck size={13} /></span> Pattern classification</div>
              <div className="sv-stat-track green-track"><span style={{ width: `${trace ? Math.min(100, trace.typologies.length * 20) : 0}%` }} /></div>
            </article>
          </section>

          <section className="sv-panel sv-pipeline" aria-label="Incident pipeline">
            <div className="sv-section-heading">
              <div><span className="sv-section-kicker">LIVE WORKFLOW</span><h2>Response pipeline</h2></div>
              <span className={`sv-state-badge ${pipelineState === 'COMPLETED' ? 'complete' : pipelineState === 'AWAITING_HUMAN_SIGN' ? 'pending' : ''}`}>
                <span className="sv-status-dot" /> {pipelineState.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="sv-step-track">
              {pipelineSteps.map((step, index) => {
                const done = currentStep > index || pipelineState === 'COMPLETED';
                const active = currentStep === index;
                return (
                  <div className={`sv-step ${done ? 'done' : ''} ${active ? 'current' : ''}`} key={step.key}>
                    <div className="sv-step-circle">{done ? <BadgeCheck size={15} /> : index + 1}</div>
                    <span>{step.label}</span>
                    {index < pipelineSteps.length - 1 && <div className="sv-step-connector" />}
                  </div>
                );
              })}
            </div>
          </section>

          <section id="incident" className="sv-incident-section">
            <div className="sv-section-title-row">
              <div><span className="sv-section-kicker">NEW INVESTIGATION</span><h2>Incident triage</h2></div>
              <span className="sv-secure-label"><ShieldCheck size={14} /> Secure API workflow</span>
            </div>
            <InputBar onTrace={handleTrace} loading={loading} />
          </section>

          {loading && (
            <div className="sv-loading-banner"><span className="sv-spinner" /><div><strong>Analyzing incident</strong><span>Tracing transaction hops and compiling forensic signals…</span></div></div>
          )}

          {trace && (
            <div id="trace-results" className="sv-results">
              <div className="sv-section-title-row">
                <div><span className="sv-section-kicker">INVESTIGATION OUTPUT</span><h2>Trace analysis</h2></div>
                <span className="sv-case-id">CASE {trace.case_id}</span>
              </div>

              <ReflexMetric reflex={trace.system1_reflex} />

              {voiceAlert && <VoiceAlertBanner alert={voiceAlert} caseId={trace.case_id} />}

              <section className="sv-panel sv-graph-panel">
                <div className="sv-section-heading">
                  <div><span className="sv-section-kicker">ON-CHAIN FORENSICS</span><h2>Fund movement graph</h2><p>Follow the path from the victim wallet to the identified destination.</p></div>
                  <div className="sv-graph-legend"><span><i className="legend-victim" /> Origin</span><span><i className="legend-hop" /> Transfer hop</span><span><i className="legend-vasp" /> Exchange / VASP</span></div>
                </div>
                <HopGraph graph={trace.graph} />
              </section>

              {trace.tracing_summary.destination_vasp && (
                <section className="sv-vasp-card">
                  <div className="sv-vasp-icon"><Building2 size={23} /></div>
                  <div className="sv-vasp-content">
                    <div className="sv-vasp-kicker">TERMINAL VASP IDENTIFIED <span>{trace.tracing_summary.destination_vasp.confidence_score}% attribution</span></div>
                    <h3>{trace.tracing_summary.destination_vasp.name} <span>· {trace.tracing_summary.destination_vasp.cluster_type}</span></h3>
                    <div className="sv-vasp-details"><span>Deposit address</span><code>{trace.tracing_summary.destination_vasp.deposit_address}</code>{trace.tracing_summary.destination_vasp.sweep_time_minutes != null && <span className="sv-sweep-time">Sweep estimate: ~{trace.tracing_summary.destination_vasp.sweep_time_minutes} min</span>}</div>
                  </div>
                  <div className="sv-vasp-actions">
                    <button className="sv-secondary-action" onClick={handleOpenSahyog}><Landmark size={16} /> SAHYOG package</button>
                    <button className="sv-primary-action" onClick={handlePrepareFreeze} disabled={loading}><LockKeyhole size={16} /> Prepare freeze</button>
                  </div>
                </section>
              )}

              <div className="sv-analytics-grid">
                <TypologiesCard typologies={trace.typologies} />
                <VelocityCard velocity={trace.velocity} />
              </div>
              <div id="evidence"><EvidenceCard evidence={trace.evidence_bundle} /></div>

              {warrantReceipt && (
                <div className="sv-success-receipt"><BadgeCheck size={19} /><div><strong>Approval workflow completed</strong><span>Warrant {warrantReceipt.warrant_id} · {warrantReceipt.target_account_status}</span></div></div>
              )}
            </div>
          )}

          {!trace && !loading && (
            <section className="sv-empty-state">
              <div className="sv-empty-art">
                <div className="sv-orbit orbit-one" /><div className="sv-orbit orbit-two" />
                <div className="sv-empty-core"><ShieldAlert size={32} /></div>
                <span className="sv-node node-a" /><span className="sv-node node-b" /><span className="sv-node node-c" />
              </div>
              <span className="sv-section-kicker">READY FOR INVESTIGATION</span>
              <h2>Your next case starts here</h2>
              <p>Submit a transaction hash and victim wallet above to start the forensic workflow. The dashboard will populate with trace paths, risk signals, velocity analysis, and a cryptographic evidence dossier.</p>
              <button className="sv-primary-action sv-demo-button" onClick={() => void handleTrace(DEMO_TX, DEMO_WALLET, 'ethereum', 4)}>
                <Sparkles size={16} /> Run demo incident <ArrowRight size={16} />
              </button>
              <div className="sv-empty-capabilities">
                <div><Network size={17} /><span>Multi-hop tracing</span></div>
                <div><ChartNoAxesCombined size={17} /><span>Risk analytics</span></div>
                <div><FileCheck2 size={17} /><span>Verifiable evidence</span></div>
              </div>
            </section>
          )}

          <footer className="sv-footer">
            <span>© SPECTER VEROAI <b>·</b> Rust core + agentic browser</span>
            <span><CircleHelp size={13} /> Automate the forensics; empower the human.</span>
          </footer>
        </main>
      </div>

      {trace && (
        <HitlModal
          isOpen={isHitlOpen}
          onClose={() => setIsHitlOpen(false)}
          caseId={trace.case_id}
          targetVasp={trace.tracing_summary.destination_vasp?.name || 'Binance'}
          depositAddress={trace.tracing_summary.destination_vasp?.deposit_address || '0x3f5ce5fb59e02f43cf8d1326be81a329d448181a'}
          claimValue={`$${(trace.tracing_summary.initial_loss_usd - 1000).toLocaleString()} USDT`}
          merkleProof={trace.evidence_bundle.merkle_root}
          onWarrantIssued={handleWarrantIssued}
        />
      )}
      {trace && (
        <SahyogModal
          isOpen={isSahyogOpen}
          onClose={() => setIsSahyogOpen(false)}
          caseId={trace.case_id}
          initialPackage={sahyogPackage}
        />
      )}
    </div>
  );
}

export default App;
