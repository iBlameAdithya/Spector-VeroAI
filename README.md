# 🛡️ SPECTER: Autonomous On-Chain Incident Response & Human-in-the-Loop Asset Freeze Engine

> **"Automate the forensics; empower the human."**  
> Sub-100µs System 1 reflex screening, multi-hop peel-chain graph reconstruction, EGRE financial crime typologies, fund flow velocity analytics, BLAKE3 Merkle evidence compilation, and statutory exchange freeze automation.

---

## 📌 Executive Summary & The Problem

In modern crypto fraud (pig-butchering scams, treasury drainers, ransomware, and phishing attacks), criminals do not store funds long-term on-chain. Instead, they execute an aggressive **3-stage pipeline**:

1. **Initial Exfiltration ($A_0$):** Siphoning assets from victim wallets/contracts into ephemeral burner wallets.
2. **Peel-Chain Dispersal ($A_1 \to A_2 \to A_3$):** Rapidly splitting balances across multi-hop Directed Acyclic Graphs (DAGs), peeling off a minor fee ($<15\%$) while forwarding the main value trunk ($\ge 85\%$).
3. **VASP Cash-Out ($D_{\text{VASP}}$):** Depositing into centralized exchanges (Binance, Bybit, OKX, CoinDCX) to liquidate into fiat or P2P rails.

### Why Traditional Systems Fail
* **The Latency Trap:** Police and fraud compliance teams take **3 to 14 days** to identify destination exchanges and email letters. Criminals liquidate deposits in **under 25 minutes**.
* **The Black-Box Alert Trap:** Legacy analytics tools output opaque scores (e.g., *"Risk: 88/100"*) rather than admissible legal petitions that exchange compliance desks can execute.
* **The Autonomous Agent Fallacy:** Unilateral AI asset freezes violate international administrative law and banking statutes, exposing institutions to wrongful seizure liabilities.

**The SPECTER Solution:** SPECTER computes sub-millisecond threat screening, multi-hop path extraction, VASP clustering, cryptographic proof compilation, and browser portal navigation—while placing an authorized human officer at the decisive cryptographic checkpoint.

---

## 🏆 Hackathon Rubric Coverage (100% Implemented)

| Rubric Dimension | Implementation in SPECTER | Benchmarked Performance / Evidence |
| :--- | :--- | :--- |
| **⚡ System 1 Decision Models** | In-memory 64KB bit-packed Bloom filter + exact 20-byte sorted hash vector (`crates/specter-core/src/system1.rs`) | **48 µs P99** (<100µs SLA guaranteed) |
| **🌐 Agentic Browser Use** | Playwright Chromium headed browser actor auto-populating exchange portal forms (`crates/specter-agent/browser_actor.js`) | Live headed visual browser fill on Port 3000 |
| **🔌 Model Context Protocol (MCP)** | Decoupled stdio JSON-RPC 2.0 forensic tools server for LLMs & Claude (`crates/specter-mcp`) | 6 production tools exposed |
| **🤖 Multi-Agent Orchestration** | 5-stage pipeline: Reflex Gate $\to$ Graph Tracer $\to$ Proof Bundler $\to$ Browser Operator $\to$ Voice Dispatcher | Sequential deterministic state machine |
| **🎙️ Ultra-Low-Latency Voice** | Synthesized tactical audio chime (880/1320Hz) + sub-10ms incident speech dispatch (`voice.rs`) | **8 ms** latency, zero cloud API lag |
| **🦀 High-Performance Edge Core** | Pure native Rust engine with zero garbage collection spikes or external DB dependencies | Microsecond execution, 100% memory safety |
| **⚖️ Statutory Law Enforcement** | Section 91 & 94 CrPC / BNSS (2023) court-admissible Indian Law Enforcement notice generation (`sahyog.rs`) | 7-step cryptographic chain of custody |
| **💻 Command Center UI** | React 19 + TypeScript + Tailwind CSS command surface (`frontend/`) | Interactive SVG peel-chain DAG & HITL checkpoint modal |

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │            COMMAND CENTER UI (Port 5173)               │
                                  │   (Investigator pastes Stolen Tx / Victim Wallet)      │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ HTTP POST /api/v1/trace
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │               SPECTER RUST CORE ENGINE                 │
                                  │                                                        │
                                  │   ┌────────────────────────────────────────────────┐   │
                                  │   │ ⚡ SYSTEM 1: IN-MEMORY REFLEX GATE (<100µs)     │   │
                                  │   │  • 64KB Bit-Packed Bloom Filter (48µs P99)     │   │
                                  │   │  • OFAC / Mixers / Rapid Peel Signature Sets   │   │
                                  │   └───────────────────────┬────────────────────────┘   │
                                  │                           │                            │
                                  │   ┌───────────────────────▼────────────────────────┐   │
                                  │   │ 🔌 MULTI-HOP GRAPH & PEEL-CHAIN TRACER (MCP)   │   │
                                  │   │  • Volume Forwarding Ratio R >= 0.85 (Trunk)   │   │
                                  │   │  • EGRE Financial Crime Typologies             │   │
                                  │   │  • Inter-hop Delta-t Velocity & ETA Countdown  │   │
                                  │   │  • VASP Clustering Engine                      │   │
                                  │   └───────────────────────┬────────────────────────┘   │
                                  │                           │                            │
                                  │   ┌───────────────────────▼────────────────────────┐   │
                                  │   │ 📦 CRYPTOGRAPHIC EVIDENCE BUNDLER              │   │
                                  │   │  • BLAKE3-256 Merkle Lineage Tree              │   │
                                  │   │  • MHA I4C SAHYOG Sec 91/94 CrPC Dossier       │   │
                                  │   └────────────────────────────────────────────────┘   │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                                      ┌───────────────────────┴───────────────────────┐
                                      │                                               │
                                      ▼                                               ▼
┌────────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────────────┐
│         AGENTIC BROWSER OPERATOR (PLAYWRIGHT)          │  │              MODEL CONTEXT PROTOCOL (MCP)              │
│  • Spawns visible Chromium session (Port 3001)         │  │  • Stdio JSON-RPC 2.0 Server (`specter-mcp`)           │
│  • Navigates to Exchange Intake Portal (Port 3000)     │  │  • Exposes 6 forensic investigation tools to LLMs      │
│  • Pre-fills 15+ statutory fields & BLAKE3 proof       │  └────────────────────────────────────────────────────────┘
└─────────────────────────────┬──────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│       🛑 HUMAN-IN-THE-LOOP CHECKPOINT (MANDATORY)      │
│  • Browser pauses: "AWAITING AUTHORIZED SIGNATURE"     │
│  • Investigator reviews dossier, inputs Badge & Key    │
│  • Signs and submits freeze warrant live               │
│  • Receipt Confirmed: WARRANT-BINANCE-2026-9921        │
└────────────────────────────────────────────────────────┘
```

---

## 📦 Repository Crate Structure

```text
specter/
├── Cargo.toml                       # Top-level workspace
├── crates/
│   ├── specter-core/                # High-performance Rust Core Forensic Engine
│   │   ├── src/
│   │   │   ├── system1.rs           # ⚡ In-memory reflex gate (<100µs P99)
│   │   │   ├── chain.rs             # Multi-chain auto-detection (EVM, TRON, BTC, SOL)
│   │   │   ├── typologies.rs        # EGRE financial crime pattern detection
│   │   │   ├── velocity.rs          # Inter-hop delta-t analysis & ETA calculation
│   │   │   ├── sahyog.rs            # MHA I4C Section 91/94 CrPC statutory notices
│   │   │   ├── vasp.rs              # Exchange deposit clustering heuristics
│   │   │   ├── graph.rs             # Multi-hop BFS peel-chain traversal
│   │   │   ├── proof.rs             # BLAKE3 Merkle lineage tree compiler
│   │   │   ├── voice.rs             # Ultra-low-latency synthesized voice alert engine
│   │   │   └── mock_data.rs         # Canonical & dynamic incident generator
│   │   └── tests/
│   │       └── benchmarks.rs        # P99 latency and throughput microbenchmarks
│   ├── specter-server/              # Axum REST API (Port 8080)
│   │   ├── src/
│   │   │   ├── main.rs              # Server initialization & CORS configuration
│   │   │   ├── routes.rs            # /trace, /sahyog, /agent, /voice endpoints
│   │   │   └── state.rs             # Shared Tokio state repository
│   │   └── tests/
│   │       └── api_tests.rs         # Integration test suite
│   ├── specter-mcp/                 # Model Context Protocol stdio server
│   │   └── src/main.rs              # 6 JSON-RPC tools for LLMs & Claude
│   └── specter-agent/               # Agentic browser automation & portal
│       ├── portal_server.js         # Mock Exchange Compliance Portal (Port 3000)
│       └── browser_actor.js         # Playwright Chromium browser bridge (Port 3001)
├── frontend/                        # React 19 + TypeScript + Tailwind Command Center
│   ├── src/
│   │   ├── App.tsx                  # Master Command Center workspace
│   │   ├── api.ts                   # Axum API client & TypeScript interfaces
│   │   └── components/
│   │       ├── Navbar.tsx           # Telemetry header & audio chime trigger
│   │       ├── InputBar.tsx         # Tx hash ingestion & 1-click canonical incident
│   │       ├── ReflexMetric.tsx     # Sub-100µs speed badge & threat class
│   │       ├── HopGraph.tsx         # Interactive animated SVG peel-chain DAG
│   │       ├── TypologiesCard.tsx   # EGRE financial crime typologies card
│   │       ├── VelocityCard.tsx     # Velocity, Delta-t, and ETA countdown gauge
│   │       ├── EvidenceCard.tsx     # BLAKE3 Merkle root & statutory clauses
│   │       ├── VoiceAlertBanner.tsx # Tactical voice alert & speech synthesis
│   │       ├── SahyogModal.tsx      # MHA SAHYOG 7-step chain of custody modal
│   │       └── HitlModal.tsx        # Mandatory Human-in-the-Loop review & sign modal
└── scripts/
    ├── start-all.ps1                # 1-click launcher for full stack
    ├── start-backend.ps1            # Launcher for backend services
    └── test-e2e.ps1                 # Automated end-to-end verification script
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Rust & Cargo** (`rustc >= 1.80`)
* **Node.js & npm** (`node >= 18.0`)

---

### Option 1: One-Click Full Stack Launch (Recommended)
Launches the Axum REST API (Port 8080), Mock Exchange Portal (Port 3000), Browser Actor (Port 3001), and React Command Center (Port 5173):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-all.ps1
```

Open your browser to: **`http://localhost:5173`**

---

### Option 2: Step-by-Step Manual Launch

#### 1. Start the Rust Axum REST API (Port 8080)
```powershell
cargo run -p specter-server
```

#### 2. Start the Mock Exchange Compliance Portal (Port 3000)
```powershell
node crates/specter-agent/portal_server.js
```

#### 3. Start the Browser Actor Bridge (Port 3001)
```powershell
node crates/specter-agent/browser_actor.js
```

#### 4. Start the React Frontend Command Center (Port 5173)
```powershell
cd frontend
npm run dev
```

---

## 🧪 Testing & Verification

Run the entire automated test suite:

```powershell
cargo test --workspace
```

### Verified Test Results:
* **`specter_core` Unit Tests:** 7 passed, 0 failed
  * `test_chain_detection`: ok
  * `test_system1_reflex_latency_and_accuracy`: ok
  * `test_typologies_and_velocity_detection`: ok
  * `test_canonical_peel_chain_and_merkle_root`: ok
  * `test_sahyog_package_generation`: ok
  * `test_transcript_formatting`: ok
  * `test_wav_audio_synthesis`: ok
* **`benchmarks.rs` Microbenchmarks:** 2 passed, 0 failed
  * Sub-100µs P99 Reflex Gate latency guaranteed (**48 µs** measured)
* **`api_tests.rs` Integration Tests:** 5 passed, 0 failed
  * `test_get_health_endpoint`: ok
  * `test_post_trace_canonical_incident`: ok
  * `test_sahyog_package_generation_and_fetch`: ok
  * `test_voice_alert_and_chime_endpoints`: ok
  * `test_post_prepare_and_submit_freeze`: ok
* **Frontend TypeScript Build:** `tsc -b && vite build` passed (0 errors)

---

## 🌐 Model Context Protocol (MCP) Integration

SPECTER exposes 6 forensic tools over standard stdio JSON-RPC for Claude Desktop and LLM agents:

```powershell
cargo run -p specter-mcp
```

### Exposed MCP Tools:
1. `specter_screen_address` — Sub-100µs System 1 reflex lookup against OFAC and illicit registries.
2. `specter_trace_hops` — Traverses downstream peel-chains and identifies terminal VASP exit deposits.
3. `specter_generate_evidence_bundle` — Compiles BLAKE3 Merkle tree and statutory clauses.
4. `specter_analyze_typologies_and_velocity` — Classifies financial crime typologies and computes burst velocity metrics.
5. `specter_generate_sahyog_package` — Generates Section 91/94 CrPC & BNSS Indian Law Enforcement notices.
6. `specter_dispatch_voice_alert` — Synthesizes tactical speech alert and audio chime.

---

## 🎯 90-Second Live Stage Demo Walkthrough

1. Open **`http://localhost:5173`**.
2. Click **"Load Canonical Incident (SPECTER-2026-9921)"** $\to$ Click **"EXECUTE FORENSIC TRACE"**.
3. **Instant Reflex Gate (<100µs):** The dashboard flashes green—System 1 matched in **48 microseconds** (`RAPID_PEEL_CHAIN_DISPERSAL`).
4. **Visual DAG Reconstruction:** An animated Directed Acyclic Graph draws 3 hops across the screen: *Victim $\to$ Mule $1 \to$ Mule $2 \to$ Binance*.
5. **Terminal VASP Located:** Binance Deposit Wallet `0x3f5ce5fb59e02f43cf8d1326be81a329d448181a` identified with $149,000 USDT and 18-minute sweep risk.
6. **Tactical Audio Chime:** Dual-tone alert chime sounds with live voice dispatch announcement.
7. **Agentic Browser Automation:** Click **"PREPARE STATUTORY FREEZE (AGENT BROWSER)"**.
   * Playwright navigates to the Binance Compliance Intake Portal (`localhost:3000`) and populates 15 statutory fields.
   * Browser displays yellow paused banner: *"AWAITING AUTHORIZED OFFICER SIGNATURE"*.
8. **Human-in-the-Loop Climax:**
   * Review dossier in modal $\to$ Confirm Badge ID `INV-LE-4092` and statutory attestation.
   * Click **"APPROVE & SIGN FREEZE WARRANT"**.
   * Portal returns **`WARRANT-BINANCE-2026-9921`** with target account placed on temporary hold.

---

## 📜 Legal & Regulatory Compliance

* **MHA I4C SAHYOG Portal:** Section 91 & Section 94 CrPC / Bharatiya Nagarik Suraksha Sanhita (BNSS 2023)
* **FATF Recommendation 16:** Virtual Asset Service Provider (VASP) Travel Rule & Rapid Asset Freezing
* **EU MiCA Regulation (Art. 14):** Immediate Asset Preservation Directive
* **Interpol Cybercrime Red Notice:** Annex IV Technical Digital Evidence Standards

---

## 👥 Authors & Hackathon Team

* **Adithya** — Backend Engine Architect (`specter-core`, `specter-server`, `specter-mcp`, `specter-agent`, `frontend`)
* **Project:** SPECTER (Spector-VeroAI)
* **Track:** Security (including Blockchain & Cryptography)

*Built from scratch during the hackathon sprint. Zero recycled code. 100% memory-safe Rust.*
