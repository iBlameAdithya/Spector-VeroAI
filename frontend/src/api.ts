// SPECTER REST API Client & TypeScript Interfaces
// Backend Axum URL: http://localhost:8080/api/v1 (or fallback /api/v1)

const API_BASE = 'http://localhost:8080/api/v1';

export interface HealthResponse {
  status: string;
  engine: string;
  system1_latency_p99_us: number;
  mcp_server_status: string;
  active_browser_drivers: number;
}

export interface ReflexScreeningResult {
  is_instant_threat: boolean;
  latency_us: number;
  threat_class: string;
  status: string;
  matched_address?: string;
  confidence_score: number;
}

export interface VaspIdentity {
  name: string;
  cluster_type: string;
  deposit_address: string;
  confidence_score: number;
  hot_wallet_destination?: string;
  sweep_time_minutes?: number;
  compliance_portal_url: string;
  jurisdiction: string;
  supports_instant_freeze: boolean;
}

export interface TracingSummary {
  initial_loss_usd: number;
  currency: string;
  hops_traversed: number;
  exit_vasp_identified: boolean;
  destination_vasp?: VaspIdentity;
}

export interface TypologyFinding {
  typology_id: string;
  typology_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
  trigger_conditions: string[];
  confidence_score: number;
  supporting_transactions: string[];
  supporting_wallets: string[];
  is_known_service_entity: boolean;
}

export interface RollingWindowMetric {
  window_label: string;
  window_seconds: number;
  volume_usd: number;
  percentage_of_total: number;
}

export interface VelocityAnalysis {
  total_duration_seconds: number;
  hop_count: number;
  min_delta_t_seconds?: number;
  avg_delta_t_seconds?: number;
  max_delta_t_seconds?: number;
  is_burst_drainer: boolean;
  burst_velocity_category: string;
  estimated_liquidation_eta_minutes: number;
  velocity_risk_score: number;
  rolling_windows: RollingWindowMetric[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'victim' | 'peel' | 'vasp' | 'mule' | 'mixer';
  balance: number;
  risk_score: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  amount: number;
  tx: string;
  forwarding_ratio: number;
  is_trunk: boolean;
}

export interface ForensicGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EvidenceBundle {
  case_id: string;
  merkle_root: string;
  algorithm: string;
  leaf_count: number;
  leaves: string[];
  statutory_clauses: string[];
  compilation_timestamp: string;
  integrity_verified: boolean;
}

export interface TraceRequest {
  stolen_tx_hash: string;
  victim_wallet: string;
  chain?: string;
  max_hops?: number;
}

export interface TraceResponse {
  case_id: string;
  detected_chain: string;
  system1_reflex: ReflexScreeningResult;
  tracing_summary: TracingSummary;
  typologies: TypologyFinding[];
  velocity: VelocityAnalysis;
  graph: ForensicGraph;
  evidence_bundle: EvidenceBundle;
}

export interface PrepareFreezeRequest {
  case_id: string;
  target_vasp: string;
  deposit_address: string;
}

export interface PrefilledFields {
  case_ref: string;
  suspect_deposit_address: string;
  claim_value: string;
  merkle_proof: string;
}

export interface PrepareFreezeResponse {
  status: string;
  portal_url: string;
  prefilled_fields: PrefilledFields;
  browser_window_state: string;
}

export interface SignAndSubmitRequest {
  case_id: string;
  officer_badge_id: string;
  signature_token: string;
  approved: boolean;
}

export interface SignAndSubmitResponse {
  status: string;
  warrant_id: string;
  target_account_status: string;
  receipt_timestamp_utc: string;
}

export interface SahyogPackageRequest {
  case_id: string;
  fir_number?: string;
  police_station?: string;
  officer_badge_id?: string;
}

export interface SahyogChainStep {
  step_number: number;
  element_type: string;
  label: string;
  value: string;
  detail: string;
}

export interface SahyogPackage {
  package_id: string;
  case_id: string;
  fir_number: string;
  police_station: string;
  investigating_officer_id: string;
  target_vasp_name: string;
  target_deposit_address: string;
  claimed_value: string;
  statutory_framework: string;
  legal_directive_title: string;
  formal_freeze_notice_text: string;
  evidence_chain: SahyogChainStep[];
  merkle_root: string;
  algorithm: string;
  provenance_quality_level: string;
  status: string;
  timestamp_utc: string;
}

export interface VoiceAlertPayload {
  case_id: string;
  transcript: string;
  audio_format: string;
  duration_seconds: number;
  latency_ms: number;
  priority_level: string;
}

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async traceIncident(data: TraceRequest): Promise<TraceResponse> {
    const res = await fetch(`${API_BASE}/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Trace failed: ${res.statusText}`);
    return res.json();
  },

  async prepareFreeze(data: PrepareFreezeRequest): Promise<PrepareFreezeResponse> {
    const res = await fetch(`${API_BASE}/agent/prepare-freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Prepare freeze failed: ${res.statusText}`);
    return res.json();
  },

  async signAndSubmit(data: SignAndSubmitRequest): Promise<SignAndSubmitResponse> {
    const res = await fetch(`${API_BASE}/agent/sign-and-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Sign and submit failed: ${res.statusText}`);
    return res.json();
  },

  async generateSahyogPackage(data: SahyogPackageRequest): Promise<SahyogPackage> {
    const res = await fetch(`${API_BASE}/sahyog/package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Sahyog package generation failed: ${res.statusText}`);
    return res.json();
  },

  async getSahyogPackage(caseId: string): Promise<SahyogPackage> {
    const res = await fetch(`${API_BASE}/sahyog/package/${encodeURIComponent(caseId)}`);
    if (!res.ok) throw new Error(`Fetch Sahyog package failed: ${res.statusText}`);
    return res.json();
  },

  async getVoiceAlert(caseId: string): Promise<VoiceAlertPayload> {
    const res = await fetch(`${API_BASE}/voice/alert/${encodeURIComponent(caseId)}`);
    if (!res.ok) throw new Error(`Fetch voice alert failed: ${res.statusText}`);
    return res.json();
  },

  getVoiceChimeUrl(): string {
    return `${API_BASE}/voice/chime`;
  },
};
