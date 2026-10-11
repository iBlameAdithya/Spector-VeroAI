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

export type TerminalStatus =
  | 'VASP_TERMINAL'
  | 'HOLDING_WALLET'
  | 'TRACE_DEPTH_REACHED'
  | 'NO_TERMINAL_IDENTIFIED'
  | 'NO_ONCHAIN_ACTIVITY'
  | 'QUERY_FAILED';

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
  terminal_status?: TerminalStatus | null;
  terminal_wallet?: string | null;
  initial_loss_usd?: number;
  currency?: string;
  hops_traversed: number;
  exit_vasp_identified: boolean;
  destination_vasp?: VaspIdentity | null;
}

export interface TypologyFinding {
  typology_id: string;
  typology_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string;
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
  burst_velocity_category?: string;
  estimated_liquidation_eta_minutes?: number;
  velocity_risk_score?: number;
  rolling_windows: RollingWindowMetric[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'clean' | 'victim' | 'peel' | 'vasp' | 'mule' | 'mixer' | string;
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
  algorithm?: string;
  leaf_count?: number;
  leaves?: string[];
  statutory_clauses: string[];
  compilation_timestamp?: string;
  integrity_verified?: boolean;
}

export interface RiskReason {
  reason_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MEDIUM' | 'LOW' | 'CLEAN' | string;
  description: string;
  confidence_score: number;
  supporting_transactions?: string[];
  supporting_wallets?: string[];
}

export interface RiskAssessment {
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MEDIUM' | 'LOW' | 'CLEAN' | 'INCONCLUSIVE' | string;
  risk_score: number;
  summary_verdict: string;
  reasons: RiskReason[];
}

export interface TraceResponse {
  case_id: string;
  detected_chain: string;
  system1_reflex: ReflexScreeningResult;
  tracing_summary: TracingSummary;
  risk_assessment?: RiskAssessment;
  typologies: TypologyFinding[];
  velocity: VelocityAnalysis;
  graph: ForensicGraph;
  evidence_bundle: EvidenceBundle;
}

export function getEffectiveRiskAssessment(traceData: TraceResponse): RiskAssessment {
  if (traceData.risk_assessment) {
    return traceData.risk_assessment;
  }

  const typologies = traceData.typologies || [];
  const reflex = traceData.system1_reflex;

  let level = 'LOW';
  let score = reflex?.confidence_score || 0;

  if (reflex?.is_instant_threat || typologies.some((t) => t.severity === 'CRITICAL' || t.severity === 'HIGH')) {
    level = 'HIGH';
    score = Math.max(score, 85);
  } else if (typologies.some((t) => t.severity === 'MEDIUM' || t.severity === 'MODERATE')) {
    level = 'MODERATE';
    score = Math.max(score, 50);
  } else if (reflex?.status === 'CLEAN' && typologies.length === 0) {
    level = 'CLEAN';
    score = 0;
  }

  const summary =
    level === 'CLEAN'
      ? 'No on-chain activity or exfiltration transactions were recorded for this address.'
      : level === 'HIGH'
      ? 'High structuring activity (dispersal/consolidation) detected across multiple wallets.'
      : 'Moderate on-chain movement patterns observed during multi-hop trace.';

  const reasons: RiskReason[] = typologies.map((t) => ({
    reason_type: t.typology_name || t.typology_id,
    severity: t.severity,
    description: t.description,
    confidence_score: t.confidence_score,
    supporting_transactions: t.supporting_transactions || [],
    supporting_wallets: t.supporting_wallets || [],
  }));

  return {
    risk_level: level,
    risk_score: score,
    summary_verdict: summary,
    reasons,
  };
}

export interface TraceRequest {
  stolen_tx_hash: string;
  victim_wallet: string;
  chain: string;
  max_hops: number;

  // Optional Advanced Parameters
  min_transfer_amount?: number;
  peel_threshold?: number;
  max_children_per_node?: number;
  time_window_start?: string | null;
  time_window_end?: string | null;
  exclude_known_services?: boolean;
  proportional_claim_only?: boolean;

  fir_number?: string;
  police_station?: string;
  officer_badge_id?: string;
  legal_statute?: string;
}

export interface PrepareFreezeRequest {
  case_id: string;
  target_vasp: string;
  deposit_address: string;
}

export interface PrepareFreezeResponse {
  status: string;
  portal_url: string;
  prefilled_fields: {
    case_ref: string;
    suspect_deposit_address: string;
    claim_value: string;
    merkle_proof: string;
  };
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

export interface SahyogChainStep {
  step_number: number;
  element_type: string;
  label: string;
  value: string;
  detail?: string;
}

export interface SahyogPackageRequest {
  case_id: string;
  fir_number: string;
  police_station: string;
  officer_badge_id: string;
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
