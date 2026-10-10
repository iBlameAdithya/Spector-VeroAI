# 🔌 SPECTER Frontend Integration & Backend Contract Guide

**Target Audience:** Frontend Teammate (React / TypeScript / Tailwind)  
**Backend Engine:** High-Performance Rust (`specter-core`, `specter-server`, `specter-mcp`)  
**Base API URL:** `http://localhost:8080/api/v1` (also mirrored at `http://localhost:8080`)  
**Mock Exchange Portal URL:** `http://localhost:3000/exchange/compliance-portal`  
**CORS Status:** Permissive (`*`), all origins/headers/methods allowed.

---

## 1. Quick Start for Frontend Dev

1. Start the backend services in a terminal:
   ```powershell
   cargo run -p specter-server
   ```
2. Start the mock exchange compliance portal (in a second terminal):
   ```powershell
   node crates/specter-agent/portal_server.js
   ```
3. Test backend health:
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

---

## 2. API Endpoints Specification

### 2.1 `GET /api/v1/health`
Verifies backend engine status and real-time P99 reflex gate latency.

* **Response (200 OK):**
  ```json
  {
    "status": "ONLINE",
    "engine": "SPECTER-Rust-Core",
    "system1_latency_p99_us": 48,
    "mcp_server_status": "READY",
    "active_browser_drivers": 1
  }
  ```

---

### 2.2 `POST /api/v1/trace`
Executes System 1 reflex screening (<100µs), auto-detects blockchain network, extracts multi-hop peel chains, executes EGRE financial crime typology detection, computes fund flow velocity analytics, identifies terminal VASP liquidation points, and compiles BLAKE3 Merkle evidence.

* **Request Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "stolen_tx_hash": "0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
    "victim_wallet": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9",
    "chain": "ethereum",
    "max_hops": 4
  }
  ```

* **Response (200 OK):**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "detected_chain": "ethereum",
    "system1_reflex": {
      "is_instant_threat": true,
      "latency_us": 48,
      "threat_class": "RAPID_PEEL_CHAIN_DISPERSAL",
      "status": "FLAGGED",
      "matched_address": "Victim Drain Seed (Active Incident)",
      "confidence_score": 99.8
    },
    "tracing_summary": {
      "initial_loss_usd": 150000.0,
      "currency": "USDT",
      "hops_traversed": 3,
      "exit_vasp_identified": true,
      "destination_vasp": {
        "name": "Binance",
        "cluster_type": "Deposit Hot Wallet #6",
        "deposit_address": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a",
        "confidence_score": 98.4,
        "hot_wallet_destination": "0x28C6c06298d514Db089934071355E5743bf21d60",
        "sweep_time_minutes": 18,
        "compliance_portal_url": "http://localhost:3000/exchange/compliance-portal",
        "jurisdiction": "International / Malta / Cayman",
        "supports_instant_freeze": true
      }
    },
    "typologies": [
      {
        "typology_id": "TYP-PEEL-001",
        "typology_name": "RAPID_PEEL_CHAIN_DISPERSAL",
        "severity": "CRITICAL",
        "description": "Sequential 3-hop peeling structure detected: funds forwarded with >=85% payload retention per hop.",
        "trigger_conditions": [
          "Hop sequence length: 3 hops",
          "Volume forwarding ratio >= 0.85 on primary value trunk",
          "Secondary peel outputs detached at intermediate mule splits"
        ],
        "confidence_score": 96.5,
        "supporting_transactions": ["0x111...aaa", "0x222...bbb", "0x333...ccc"],
        "supporting_wallets": ["0x99a...44f", "0xd4b...110", "0x3f5...81a"],
        "is_known_service_entity": false
      },
      {
        "typology_id": "TYP-VASP-CONV-001",
        "typology_name": "VASP_LIQUIDATION_CONVERGENCE",
        "severity": "CRITICAL",
        "description": "Terminal flow converges directly to centralized VASP Binance. Immediate off-ramping risk.",
        "trigger_conditions": [
          "Destination Exchange: Binance",
          "Deposit Cluster: Deposit Hot Wallet #6"
        ],
        "confidence_score": 98.4,
        "supporting_transactions": ["0x333...ccc"],
        "supporting_wallets": ["0x3f5...81a"],
        "is_known_service_entity": true
      }
    ],
    "velocity": {
      "total_duration_seconds": 840,
      "hop_count": 3,
      "min_delta_t_seconds": 360,
      "avg_delta_t_seconds": 420,
      "max_delta_t_seconds": 480,
      "is_burst_drainer": true,
      "burst_velocity_category": "RAPID_MULE_HOPPING",
      "estimated_liquidation_eta_minutes": 25,
      "velocity_risk_score": 92.5,
      "rolling_windows": [
        { "window_label": "1m", "window_seconds": 60, "volume_usd": 10714.28, "percentage_of_total": 7.14 },
        { "window_label": "5m", "window_seconds": 300, "volume_usd": 53571.42, "percentage_of_total": 35.71 },
        { "window_label": "10m", "window_seconds": 600, "volume_usd": 107142.85, "percentage_of_total": 71.42 },
        { "window_label": "30m", "window_seconds": 1800, "volume_usd": 150000.0, "percentage_of_total": 100.0 },
        { "window_label": "1h", "window_seconds": 3600, "volume_usd": 150000.0, "percentage_of_total": 100.0 }
      ]
    },
    "graph": {
      "nodes": [
        { "id": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9", "label": "Victim Address", "type": "victim", "balance": 0.0, "risk_score": 5.0 },
        { "id": "0x88b14a2c11438721adcc92942472b53b8214a11e", "label": "Peel Split (Fee: $500)", "type": "peel", "balance": 500.0, "risk_score": 85.0 },
        { "id": "0x99a34b2f15318721adcc92942472b53b8214a44f", "label": "Mule Split 1", "type": "peel", "balance": 149500.0, "risk_score": 90.0 },
        { "id": "0x77c24a2c11438721adcc92942472b53b8214a22f", "label": "Peel Split (Fee: $500)", "type": "peel", "balance": 500.0, "risk_score": 85.0 },
        { "id": "0xd4b72648831f2115e58988a2efc46427357c4110", "label": "Mule Split 2", "type": "peel", "balance": 149000.0, "risk_score": 90.0 },
        { "id": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a", "label": "Binance Deposit (Deposit Hot Wallet #6)", "type": "vasp", "balance": 149000.0, "risk_score": 98.4 }
      ],
      "edges": [
        { "from": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9", "to": "0x88b14a2c11438721adcc92942472b53b8214a11e", "amount": 500.0, "tx": "0x111...aaa", "forwarding_ratio": 0.0033, "is_trunk": false },
        { "from": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9", "to": "0x99a34b2f15318721adcc92942472b53b8214a44f", "amount": 149500.0, "tx": "0x111...aaa", "forwarding_ratio": 0.9967, "is_trunk": true },
        { "from": "0x99a34b2f15318721adcc92942472b53b8214a44f", "to": "0x77c24a2c11438721adcc92942472b53b8214a22f", "amount": 500.0, "tx": "0x222...bbb", "forwarding_ratio": 0.0033, "is_trunk": false },
        { "from": "0x99a34b2f15318721adcc92942472b53b8214a44f", "to": "0xd4b72648831f2115e58988a2efc46427357c4110", "amount": 149000.0, "tx": "0x222...bbb", "forwarding_ratio": 0.9967, "is_trunk": true },
        { "from": "0xd4b72648831f2115e58988a2efc46427357c4110", "to": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a", "amount": 149000.0, "tx": "0x333...ccc", "forwarding_ratio": 1.0, "is_trunk": true }
      ]
    },
    "evidence_bundle": {
      "case_id": "SPECTER-2026-9921",
      "merkle_root": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      "algorithm": "BLAKE3-256",
      "leaf_count": 3,
      "leaves": [
        "0xcde190cc5fe30d28dfb2c3d418fcb0b6b97e06ec0df1d15054c8552b6f01a438",
        "0x8ce4fabdc707d1f4ec77503c6e87c93213a7869158fb9a7db4fca4c5826ace96",
        "0x143a157af5bf62c4326d9bb1e583915fa36d92c27e601285fe9e24fb187f0802"
      ],
      "statutory_clauses": [
        "Section 91 CrPC (Urgent Preservation)",
        "FATF Recommendation 16 Compliance",
        "EU MiCA Asset Freeze Directive Art 14",
        "Interpol Red Notice Cybercrime Annex IV"
      ],
      "compilation_timestamp": "2026-10-10T14:30:00Z",
      "integrity_verified": true
    }
  }
  ```

---

### 2.3 `POST /api/v1/sahyog/package`
Generates a court-admissible Indian Law Enforcement / MHA I4C SAHYOG asset freeze package under Section 91 & Section 94 CrPC / BNSS.

* **Request Body:**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "fir_number": "FIR/2026/CYBER-409",
    "police_station": "Special Cyber Crime Cell, New Delhi",
    "officer_badge_id": "INV-LE-4092"
  }
  ```

* **Response (200 OK):**
  ```json
  {
    "package_id": "SAHYOG-MHA-42F32FAB3F1A",
    "case_id": "SPECTER-2026-9921",
    "fir_number": "FIR/2026/CYBER-409",
    "police_station": "Special Cyber Crime Cell, New Delhi",
    "investigating_officer_id": "INV-LE-4092",
    "target_vasp_name": "Binance",
    "target_deposit_address": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a",
    "claimed_value": "$149000.00 USDT",
    "statutory_framework": "Section 91/94 CrPC & Section 94 BNSS (2023)",
    "legal_directive_title": "MHA-I4C Urgent Asset Preservation Directive (Binance)",
    "formal_freeze_notice_text": "STATUTORY NOTICE UNDER SECTION 91/94 CrPC...",
    "evidence_chain": [
      { "step_number": 1, "element_type": "VASP_ENTITY", "label": "Attributed VASP", "value": "Binance" },
      { "step_number": 2, "element_type": "SUSPECT_ENDPOINT", "label": "Suspect Deposit Address", "value": "0x3f5...81a" },
      { "step_number": 3, "element_type": "ATTRIBUTION_CONFIDENCE", "label": "Attribution Score", "value": "98.4 / 100" },
      { "step_number": 4, "element_type": "STATUTORY_GROUNDS", "label": "Legal Grounds", "value": "FIR No. FIR/2026/CYBER-409" },
      { "step_number": 5, "element_type": "MERKLE_ROOT_PROOF", "label": "Cryptographic Root", "value": "0x7f83...9069" },
      { "step_number": 6, "element_type": "PROVENANCE_LEVEL", "label": "Source Quality", "value": "Level 1: Official Mathematical Forensics" },
      { "step_number": 7, "element_type": "OFFICER_SIGNATURE", "label": "Officer Digital Stamp", "value": "INV-LE-4092" }
    ],
    "merkle_root": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    "algorithm": "BLAKE3-256",
    "provenance_quality_level": "Level 1: Official Statutory Directive",
    "status": "READY_FOR_SAHYOG_PORTAL_DISPATCH",
    "timestamp_utc": "2026-10-10T14:35:00Z"
  }
  ```

---

### 2.4 `POST /api/v1/agent/prepare-freeze`
Triggers the browser agent to pre-populate statutory compliance inputs on the exchange intake portal and halts at the mandatory Human-in-the-Loop checkpoint.

* **Request Body:**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "target_vasp": "Binance",
    "deposit_address": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a"
  }
  ```

* **Response (200 OK):**
  ```json
  {
    "status": "AWAITING_HUMAN_SIGNATURE",
    "portal_url": "http://localhost:3000/compliance/portal",
    "prefilled_fields": {
      "case_ref": "SPECTER-2026-9921",
      "suspect_deposit_address": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a",
      "claim_value": "$149,000.00 USDT",
      "merkle_proof": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
    },
    "browser_window_state": "HEADED_ACTIVE"
  }
  ```

---

### 2.5 `POST /api/v1/agent/sign-and-submit`
Receives the authorized officer's badge ID, legal attestation, and cryptographic signature to execute the final freeze warrant submission.

* **Request Body:**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "officer_badge_id": "INV-LE-4092",
    "signature_token": "ED25519_SIG_CONFIRMED_OK",
    "approved": true
  }
  ```

* **Response (200 OK):**
  ```json
  {
    "status": "FREEZE_WARRANT_ISSUED",
    "warrant_id": "WARRANT-BINANCE-2026-9921",
    "target_account_status": "FREEZE_APPLIED_TEMPORARY_HOLD",
    "receipt_timestamp_utc": "2026-10-10T14:32:00Z"
  }
  ```

---

### 2.6 `GET /api/v1/voice/alert/:case_id` & `GET /api/v1/voice/chime`
Ultra-low-latency tactical voice telemetry and synthesized audio alert chime.

* **`GET /api/v1/voice/alert/:case_id` Response (200 OK):**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "transcript": "SPECTER Priority Alert. Case Ref SPECTER-2026-9921. System One reflex gate matched in 48 microseconds. Illicit value of $150000 dollars USDT detected peeling towards Binance. Estimated liquidation window is 25 minutes. Agent browser prefill complete. Awaiting authorized officer signature.",
    "audio_format": "audio/wav",
    "duration_seconds": 4.8,
    "latency_ms": 8,
    "priority_level": "CRITICAL_INTERVENTION_REQUIRED"
  }
  ```
* **`GET /api/v1/voice/chime`:** Returns raw audio stream (`Content-Type: audio/wav`) of a dual-tone tactical alert chime (880Hz / 1320Hz) synthesized in pure Rust with <5ms latency. Can be played directly via `<audio src="http://localhost:8080/api/v1/voice/chime" autoplay />`.

---

## 3. Recommended TypeScript Types

You can paste these interfaces directly into your frontend code:

```typescript
export interface VoiceAlertPayload {
  case_id: string;
  transcript: string;
  audio_format: string;
  duration_seconds: number;
  latency_ms: number;
  priority_level: string;
}
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
```

---

## 4. Canonical Presentation Test Data

* **Stolen Exploit Tx Hash:** `0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b`
* **Victim Address:** `0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9`
* **Initial Loss:** $150,000.00 USDT
* **Identified Terminal VASP:** Binance Deposit Wallet `0x3f5ce5fb59e02f43cf8d1326be81a329d448181a` ($149,000.00 USDT)
* **Default Officer Badge ID:** `INV-LE-4092`
* **Resulting Warrant Receipt:** `WARRANT-BINANCE-2026-9921`
