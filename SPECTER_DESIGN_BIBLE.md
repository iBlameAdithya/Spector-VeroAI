# 📖 SPECTER: Autonomous On-Chain Incident Response & Human-in-the-Loop Asset Freeze Engine
## Master System Specification & Technical Design Bible

**Document Version:** 1.0.0-PROD  
**Author:** SPECTER Core Architecture Group  
**Target Event:** Hackathon Security Track (incl. Blockchain & Cryptography)  
**Implementation Window:** 8-Hour Accelerated Sprint  
**Target Production Language:** Rust (Backend Engine) + TypeScript/React (Command Surface)  

---

## 1. Executive Thesis & The Operational Problem

### 1.1 The Threat Vector: The "Peel Chain to VASP" Pipeline
In modern cyber fraud (e.g., pig-butchering scams, corporate treasury drainers, ransomware extortion, and phishing attacks), the primary objective of the adversary is not long-term on-chain storage, but **fiat liquidation**. 

The adversary operates through a standardized three-stage pipeline:
1. **Initial Exfiltration:** Loot is sucked from the victim's wallet or smart contract into an ephemeral burner address ($A_0$).
2. **Peel-Chain Dispersion:** The funds are split across a directed acyclic graph (DAG) of intermediate mule wallets ($A_1 \to A_2 \to A_3$). In each hop, a minor fee ("peel") is detached while the bulk payload ($95\%+$) is forwarded to defeat simple static alerts.
3. **VASP Injection (The Cash-Out):** The remaining balance hits a centralized Virtual Asset Service Provider (**VASP** / Crypto Exchange like Binance, Bybit, OKX, or CoinDCX) via an assigned **deposit address** ($D_{VASP}$). Once swept into the exchange's omnibus hot wallet, the funds are instantly sold via P2P fiat rails or off-shore bank transfers.

### 1.2 The Failure of Existing Systems
* **The Latency Trap:** Traditional Law Enforcement Agency (LEA) and corporate fraud response relies on manual blockchain explorers (Etherscan, TronScan). An investigator takes **3 to 14 days** to identify the destination VASP and dispatch a formal preservation letter. The criminal liquidates the deposit in **under 25 minutes**.
* **The "Black-Box Alert" Disease:** Existing blockchain analytics vendors (Chainalysis, Elliptic, TRM Labs) output opaque risk percentages (e.g., *"Risk Score: 88/100"*) without delivering an actionable, legally formatted petition that an exchange compliance desk can execute immediately.
* **The Autonomous Agent Fallacy:** Autonomous AI agents that attempt to execute unilateral asset freezes violate fundamental administrative law, international banking statutes, and exchange Terms of Service. Unilateral AI freezing exposes institutions to catastrophic civil liability and wrongful-seizure lawsuits.

### 1.3 The SPECTER Invariant
> **"Automate the forensics; empower the human."**  
> SPECTER automates the computational heavy lifting—sub-millisecond signature gating, multi-hop path extraction, VASP clustering, cryptographic proof compilation, and browser portal navigation—while placing an authorized human officer at the decisive cryptographic checkpoint.

---

## 2. High-Level System Architecture

```
               ┌───────────────────────────────────────────────────────────┐
               │              CRIME INGESTION & COMMAND UI                 │
               │   (Investigator pastes Stolen Tx Hash / Victim Address)    │
               └─────────────────────────────┬─────────────────────────────┘
                                             │ HTTP POST /api/v1/trace
                                             ▼
               ┌───────────────────────────────────────────────────────────┐
               │                  SPECTER RUST CORE ENGINE                 │
               │                                                           │
               │   ┌───────────────────────────────────────────────────┐   │
               │   │ ⚡ SYSTEM 1: IN-MEMORY REFLEX GATE (<100µs)       │   │
               │   │  • Bit-packed Bloom Filter & Exact Hash Sets      │   │
               │   │  • OFAC Sanctions / Tornado Cash / Known Drainers │   │
               │   └─────────────────────────┬─────────────────────────┘   │
               │                             │                             │
               │   ┌─────────────────────────▼─────────────────────────┐   │
               │   │ 🔌 MULTI-HOP GRAPH & PEEL-CHAIN TRACER (MCP)      │   │
               │   │  • Depth-Bounded BFS Traversal (Hops 1 to 5)      │   │
               │   │  • Volume Decay & Split-Ratio Heuristics          │   │
               │   │  • VASP Deposit Clustering Engine                 │   │
               │   └─────────────────────────┬─────────────────────────┘   │
               │                             │                             │
               │   ┌─────────────────────────▼─────────────────────────┐   │
               │   │ 📦 CRYPTOGRAPHIC EVIDENCE BUNDLER                 │   │
               │   │  • BLAKE3 / SHA-256 Merkle Lineage Tree           │   │
               │   │  • Statutory Evidence Dossier Generator           │   │
               │   └───────────────────────────────────────────────────┘   │
               └─────────────────────────────┬─────────────────────────────┘
                                             │ HTTP JSON Stream
                                             ▼
               ┌───────────────────────────────────────────────────────────┐
               │           AGENTIC BROWSER OPERATOR (PLAYWRIGHT)           │
               │   • Spawns visible Chromium session                       │
               │   • Navigates to Exchange Compliance Intake Portal        │
               │   • Pre-fills 15+ statutory fields & Merkle proof         │
               └─────────────────────────────┬─────────────────────────────┘
                                             │
                                             ▼
               ┌───────────────────────────────────────────────────────────┐
               │        🛑 HUMAN-IN-THE-LOOP CHECKPOINT (MANDATORY)        │
               │   • UI prompts: "Review Dossier & Sign Freeze Order"      │
               │   • Investigator verifies evidence & provides signature   │
               └─────────────────────────────┬─────────────────────────────┘
                                             │ Approved & Digitally Signed
                                             ▼
               ┌───────────────────────────────────────────────────────────┐
               │              FINAL SUBMISSION & RECEIPT LOG               │
               │   • Agent clicks "Submit Formal Freeze Request"           │
               │   • Portal returns Warrant Receipt #FW-2026-9921          │
               │   • Immutable audit entry written to local storage        │
               └───────────────────────────────────────────────────────────┘
```

---

## 3. Mathematical & Algorithmic Specifications

### 3.1 System 1 Reflex Gate (Sub-100 Microsecond Screening)
The System 1 engine acts as a pre-cognitive reflex filter. It uses a high-performance in-memory hash set and bit-vector filter in Rust to achieve determinism without garbage-collection spikes or network I/O.

* **Data Structure:** Flat contiguous vector of 20-byte address hashes (`[u8; 20]`) sorted for binary search, coupled with a 64KB bit-packed Bloom Filter with 3 murmur-derived hash seeds:
  $$P(\text{false positive}) \le 0.001 \quad \text{for } n = 10,000 \text{ flagged addresses}$$
* **Lookup Complexity:** $O(1)$ amortized, $< 80\mu\text{s}$ CPU cycle execution.
* **Match Classes:**
  1. `OFAC_SANCTIONED_ENTITY`: Specially Designated Nationals (Lazarus, etc.).
  2. `KNOWN_MIXER_ROUTER`: Tornado Cash, Railgun, Blender contracts.
  3. `ACTIVE_DRAINER_SIGNATURE`: Inferno, PinkDrainer, AngelDrainer contract bytecodes.

### 3.2 Peel-Chain Extraction Algorithm
Given a seed transaction $T_0$ from victim address $V$ with amount $M_0$, the Rust traversal engine extracts the primary value path:

1. **Breadth-First Search with Volume Decay:**
   * For each transaction output $O_i \in T_k$:
     $$\text{Forwarding Ratio } R(O_i) = \frac{\text{Amount}(O_i)}{\sum \text{Amount}(T_k)}$$
   * If $R(O_i) \ge \theta_{\text{peel}}$ (where $\theta_{\text{peel}} = 0.85$):
     * Classify $O_i$ as the **Main Value Trunk**.
     * Classify remaining outputs ($1 - R(O_i)$) as **Peel / Operational Gas Fee**.
2. **Hop Bounding:** Traversal terminates when:
   * Target node matches a known VASP Deposit Cluster.
   * Target node reaches maximum configured search depth ($D_{\max} = 5$).
   * Balance is locked in a mixer contract or dead address.

### 3.3 VASP Clustering Heuristic
Centralized exchanges manage multi-tenant accounting using single-use deposit addresses that sweep funds into cold/warm omnibus pools. SPECTER attributes a VASP identity using a three-point heuristic:
$$\text{Confidence}(Node) = w_1 \cdot C_{\text{sweep}} + w_2 \cdot C_{\text{interaction}} + w_3 \cdot C_{\text{gas\_funder}}$$
* $C_{\text{sweep}}$: Address balance is swept within 120 minutes to a known exchange omnibus hot wallet (e.g., Binance Hot Wallet 6).
* $C_{\text{interaction}}$: Address exhibits zero contract creation, zero outbound DeFi interaction, and exclusive unidirectional sweeps.
* $C_{\text{gas\_funder}}$: The address's network fee for sweeping was provisioned by an official exchange gas dispenser address.
* **Attribution Threshold:** If $\text{Confidence}(Node) \ge 0.90$, flag as **CONFIRMED EXIT VASP**.

### 3.4 Cryptographic Merkle Lineage Proof
To ensure court-admissibility under digital evidence rules, the transaction path is compiled into an immutable Merkle Tree:
* Each leaf node $L_i$ represents one hop:
  $$L_i = \text{BLAKE3}\Big(\text{TxHash}_i \,\|\, \text{FromAddr}_i \,\|\, \text{ToAddr}_i \,\|\, \text{Amount}_i \,\|\, \text{BlockNumber}_i\Big)$$
* The root hash $R = \text{MerkleRoot}(L_0, L_1, \dots, L_k)$ forms the immutable anchor attached to the statutory freeze warrant. Any modification to the transaction sequence invalidates the root.

---

## 4. Model Context Protocol (MCP) Integration Specification

SPECTER implements Anthropic's Model Context Protocol (MCP) to standardize how the LLM reasoning agent accesses on-chain state and forensic tools.

### MCP Tools Schema (`specter-mcp-server`)

```json
{
  "tools": [
    {
      "name": "specter_screen_address",
      "description": "Executes System 1 reflex lookup against OFAC and Mixer registries in <100us.",
      "parameters": {
        "type": "object",
        "properties": {
          "address": { "type": "string", "description": "0x-prefixed blockchain address" }
        },
        "required": ["address"]
      }
    },
    {
      "name": "specter_trace_hops",
      "description": "Traverses downstream peel-chain transactions to identify the terminal VASP deposit address.",
      "parameters": {
        "type": "object",
        "properties": {
          "initial_tx_hash": { "type": "string" },
          "chain": { "type": "string", "enum": ["ethereum", "tron", "solana", "polygon"] },
          "depth_limit": { "type": "integer", "default": 4 }
        },
        "required": ["initial_tx_hash", "chain"]
      }
    },
    {
      "name": "specter_generate_evidence_bundle",
      "description": "Compiles the verified transaction path into a Merkle-rooted legal evidence dossier.",
      "parameters": {
        "type": "object",
        "properties": {
          "case_id": { "type": "string" },
          "hop_sequence": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["case_id", "hop_sequence"]
      }
    }
  ]
}
```

---

## 5. Human-in-the-Loop (HITL) State Machine

The core runtime state machine is strictly sequential. No state can bypass the human verification gate.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│  1. IDLE     │ ──► │ 2. SCREENING │ ──► │ 3. TRACING   │ ──► │ 4. EVIDENCE_COMPILED │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────┬───────────┘
                                                                          │
                                                                          ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│ 8. COMPLETED │ ◄── │ 7. SUBMITTED │ ◄── │ 6. AUTHORIZED│ ◄── │ 5. AWAITING_HUMAN    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────────────┘
                            ▲                    ▲                        ▲
                            │                    │                        │
                      [Portal Ack]         [Human Sign]           [Agent Launch]
```

### State Definitions:
1. `IDLE`: Awaiting user input.
2. `SCREENING`: Running System 1 in-memory reflex check ($<100\mu\text{s}$).
3. `TRACING`: Graph engine reconstructing peel-chain across blocks.
4. `EVIDENCE_COMPILED`: Merkle tree constructed; statutory petition synthesized.
5. `AWAITING_HUMAN_SIGN`: **Playwright launches visible browser, fills all form fields, and halts execution.** UI displays yellow lock: *"Awaiting Authorized Signature"*.
6. `AUTHORIZED`: Human clicks "Approve & Sign Warrant"; injects digital credential.
7. `SUBMITTED`: Agent triggers form submission button in browser.
8. `COMPLETED`: Exchange confirmation receipt parsed; case archived.

---

## 6. Complete REST API Specification

### Base URL: `http://localhost:8080/api/v1`

### 6.1 `GET /health`
Verifies backend status and telemetry counters.
```json
{
  "status": "ONLINE",
  "engine": "SPECTER-Rust-Core",
  "system1_latency_p99_us": 68,
  "mcp_server_status": "READY",
  "active_browser_drivers": 1
}
```

### 6.2 `POST /trace`
Executes forensic tracing and generates the graph.
* **Request:**
  ```json
  {
    "stolen_tx_hash": "0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
    "victim_wallet": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9",
    "chain": "ethereum",
    "max_hops": 4
  }
  ```
* **Response:**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "system1_reflex": {
      "is_instant_threat": true,
      "latency_us": 74,
      "threat_class": "RAPID_PEEL_CHAIN_DISPERSAL",
      "status": "FLAGGED"
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
        "confidence_score": 98.4
      }
    },
    "graph": {
      "nodes": [
        { "id": "0x71c...3a9", "label": "Victim Address", "type": "victim", "balance": 0.0 },
        { "id": "0x99a...44f", "label": "Mule Split 1", "type": "peel", "balance": 500.0 },
        { "id": "0xd4b...110", "label": "Mule Split 2", "type": "peel", "balance": 500.0 },
        { "id": "0x3f5...81a", "label": "Binance Deposit Account", "type": "vasp", "balance": 149000.0 }
      ],
      "edges": [
        { "from": "0x71c...3a9", "to": "0x99a...44f", "amount": 150000.0, "tx": "0x111...aaa" },
        { "from": "0x99a...44f", "to": "0xd4b...110", "amount": 149500.0, "tx": "0x222...bbb" },
        { "from": "0xd4b...110", "to": "0x3f5...81a", "amount": 149000.0, "tx": "0x333...ccc" }
      ]
    },
    "evidence_bundle": {
      "merkle_root": "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      "algorithm": "BLAKE3-256",
      "statutory_clauses": [
        "Section 91 CrPC (Urgent Preservation)",
        "FATF Recommendation 16 Compliance"
      ]
    }
  }
  ```

### 6.3 `POST /agent/prepare-freeze`
Spawns visible Chromium browser, navigates to portal, fills all inputs, and pauses.
* **Request:**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "target_vasp": "Binance",
    "deposit_address": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a"
  }
  ```
* **Response:**
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

### 6.4 `POST /agent/sign-and-submit`
Authorizes the human sign-off and executes the live submit click.
* **Request:**
  ```json
  {
    "case_id": "SPECTER-2026-9921",
    "officer_badge_id": "INV-LE-4092",
    "signature_token": "ED25519_SIG_CONFIRMED_OK",
    "approved": true
  }
  ```
* **Response:**
  ```json
  {
    "status": "FREEZE_WARRANT_ISSUED",
    "warrant_id": "WARRANT-BINANCE-2026-9921",
    "target_account_status": "FREEZE_APPLIED_TEMPORARY_HOLD",
    "receipt_timestamp_utc": "2026-10-10T14:32:00Z"
  }
  ```

---

## 7. Agentic Browser Operator (Playwright) Technical Spec

The browser agent operates in **Headed Mode** (`headless = false`) during live presentations so judges visually watch the agent take action.

```javascript
// specter_browser_actor.js
import { chromium } from 'playwright';

export async function executeFreezePrep(dossier) {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Navigate to Exchange Compliance Portal
  await page.goto('http://localhost:3000/exchange/compliance-portal');

  // 2. Populate Statutory Fields
  await page.fill('#input-case-id', dossier.case_id);
  await page.fill('#input-target-wallet', dossier.deposit_address);
  await page.fill('#input-stolen-amount', dossier.claim_value);
  await page.fill('#input-merkle-proof', dossier.merkle_root);
  await page.selectOption('#select-legal-framework', 'SEC_91_URGENT_PRESERVATION');

  // 3. Highlight the checkpoint banner on screen
  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.id = 'specter-hitl-banner';
    banner.innerText = '⚠️ SPECTER AGENT PAUSED: AWAITING OFFICER DIGITAL SIGNATURE';
    banner.style = 'position:fixed;top:0;left:0;width:100%;background:#eab308;color:#000;font-weight:bold;text-align:center;padding:12px;z-index:99999;font-size:16px;';
    document.body.prepend(banner);
  });

  return { browser, page };
}

export async function submitApprovedWarrant(page, officerCredentials) {
  // 4. Fill Officer Signature
  await page.fill('#input-officer-id', officerCredentials.badge_id);
  await page.check('#checkbox-statutory-attestation');
  
  // 5. Remove warning banner & Click Submit
  await page.evaluate(() => document.getElementById('specter-hitl-banner')?.remove());
  await page.click('#btn-submit-freeze-warrant');
  
  // 6. Capture Confirmation Receipt
  await page.waitForSelector('.warrant-success-confirmation');
  const warrantReceipt = await page.innerText('.warrant-id-display');
  return warrantReceipt;
}
```

---

## 8. Directory Layout & Rust Crate Structure

```text
specter/
├── Cargo.toml                       # Top-level workspace
├── crates/
│   ├── specter-core/                # Rust Core Library
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── system1.rs           # ⚡ In-memory reflex gate (<100µs)
│   │       ├── graph.rs             # 🔌 Peel-chain traversal logic
│   │       ├── vasp.rs              # 🏛️ VASP deposit cluster attribution
│   │       ├── proof.rs             # 📦 BLAKE3 / SHA-256 Merkle tree generator
│   │       └── mock_data.rs         # Deterministic test scenarios
│   ├── specter-server/              # Axum HTTP API & Telemetry Server
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs              # Router & Server Initialization
│   │       ├── routes.rs            # /trace, /agent endpoints
│   │       └── state.rs             # Shared Tokio state
│   └── specter-agent/               # Agentic Node.js / Playwright Bridge
│       ├── package.json
│       ├── browser_actor.js         # Playwright Chromium headed automation
│       └── portal_server.js         # Mock Exchange Compliance Portal
└── frontend/                        # React 18 + TypeScript + Tailwind
    ├── package.json
    ├── src/
    │   ├── App.tsx                  # Main layout
    │   ├── components/
    │   │   ├── InputBar.tsx         # Tx hash ingestion
    │   │   ├── ReflexMetric.tsx     # Sub-100us speed badge
    │   │   ├── HopGraph.tsx         # Visual animated node-link diagram
    │   │   ├── EvidenceCard.tsx     # Merkle root & statutory clauses
    │   │   └── HitlModal.tsx        # Officer Review & Sign modal
    │   └── api.ts                   # Axum backend client
```

---

## 9. 8-Hour Accelerated Execution Schedule

| Time Block | Developer 1 (Rust Engine) | Developer 2 (Frontend & Agent) | Sync Milestone |
| :--- | :--- | :--- | :--- |
| **0:00 – 1:30** | Scaffold Cargo workspace, define models, set up Axum routes with mock JSON responses. | Scaffold Vite/React, set up Tailwind, build Mock Exchange Portal (`localhost:3000`). | API JSON contract verified via `curl` / fetch. |
| **1:30 – 3:30** | Implement System 1 in-memory Bloom filter + Hop Graph BFS traversal. | Implement animated Hop Graph (vis.js/SVG) and Reflex Latency Badge. | Frontend renders real Rust graph and microsecond timer. |
| **3:30 – 5:30** | Implement Merkle tree evidence builder + IPC bridge to Playwright agent. | Implement Human-in-the-Loop "Review & Sign Warrant" modal + officer badge input. | Full end-to-end loop: Rust triggers Browser agent. |
| **5:30 – 7:00** | Add telemetry counters (queries/sec, memory footprint) + unit tests. | Polish dark-mode UI, audit receipts, and error toasts. | Rehearse complete live demo 5 times consecutively. |
| **7:00 – 8:00** | Create 60-second offline backup video recording. | Prepare 4-slide presentation deck. | Code freeze & stage ready. |

---

## 10. The 90-Second Stage Demo Script

* **[0:00 – 0:15] The Hook:**  
  *"Judges, every single day, millions of dollars in stolen crypto vanish. Not because the blockchain is untraceable, but because criminals move funds to exchanges in minutes while police and fraud desks take three weeks to write emails. Meet SPECTER."*
* **[0:15 – 0:35] The Rust Engine & System 1 Reflex:**  
  * Developer pastes stolen transaction hash: `0x4a8b...` and clicks **"Investigate"**.
  * The dashboard flashes green: **System 1 Reflex Gate matched in 74 microseconds.**
  * An animated graph draws 3 hops across the screen: *Victim $\to$ Mule $1 \to$ Mule $2 \to$ Binance*.
  * Announcement appears: **"Terminal VASP Located: Binance Deposit Wallet `0x3F5...` holding $149,000 USDT."**
* **[0:35 – 1:05] The Agentic Browser Action (The Spectacle):**  
  * Developer clicks: **"Prepare Statutory Freeze"**.
  * A real Chromium browser window pops open on the projector screen.
  * The audience watches the AI agent navigate to the Binance Compliance Portal and automatically fill out the case ID, target deposit address, stolen amount, statutory clauses, and cryptographic Merkle root.
  * The browser screen pauses with a prominent yellow banner: **"AGENT PAUSED: AWAITING AUTHORIZED OFFICER SIGNATURE"**.
* **[1:05 – 1:20] The Human-in-the-Loop Climax:**  
  * *"Notice that SPECTER refuses to execute unilateral freezes. In high-stakes finance, the human remains the sovereign pilot."*
  * Developer types Badge ID `INV-LE-4092` into the verification modal and clicks **"Approve & Sign Warrant"**.
  * The agent clicks the final submit button in the browser live.
  * The portal issues: **"FREEZE WARRANT #FW-2026-9921 ISSUED. ACCOUNT LOCKED."**
* **[1:20 – 1:30] The Tech Summary:**  
  *"Built entirely from scratch in high-performance Rust, powered by sub-millisecond System 1 reflex gating, standardized MCP tools, and legally compliant human-in-the-loop agentic browser automation."*

---

## 11. Core Invariants & Hackathon Rules Adherence

1. **Zero Disqualification Risk:**
   * Shortlisted project was **ChilliAV** (Enterprise Text-to-SQL Business Intelligence).
   * SPECTER is an **On-Chain Cybercrime Incident Response & Exchange Freeze Platform**. Zero conceptual or architectural overlap.
2. **Fresh Repository Guarantee:**
   * Created in a clean folder completely outside previous projects.
   * Every line of Rust and TypeScript written during the official hackathon hours.
3. **Rubric Coverage:**
   * ✅ **System 1 Decision Models:** Rust $<100\mu\text{s}$ in-memory reflex gate.
   * ✅ **Agentic Browser Use:** Playwright-driven headed Chromium exchange portal submission.
   * ✅ **Model Context Protocol (MCP):** Decoupled forensic tools for on-chain state.
   * ✅ **Multi-Agent Orchestration:** Triage $\to$ Tracer $\to$ Proof Bundler $\to$ Browser Operator.

---
*Signed and ratified for immediate 8-hour execution.*
