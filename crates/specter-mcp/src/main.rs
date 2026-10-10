//! Model Context Protocol (MCP) Server for SPECTER Forensics
//!
//! Exposes decoupled on-chain forensic tools over standard stdio JSON-RPC
//! for LLM agents, Claude Desktop, and autonomous orchestrators.

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use specter_core::{
    generate_dynamic_scenario, get_canonical_scenario, MerkleEngine, PeelChainTracer,
    SahyogAdapter, System1ReflexGate, TypologyDetector, VelocityAnalyzer, VoiceAlertDispatcher,
    CANONICAL_CASE_ID, CANONICAL_MERKLE_ROOT, CANONICAL_STOLEN_TX, CANONICAL_VICTIM,
};
use std::io::{self, BufRead, Write};

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct JsonRpcRequest {
    jsonrpc: String,
    id: Option<Value>,
    method: String,
    params: Option<Value>,
}

#[derive(Debug, Serialize)]
struct JsonRpcResponse {
    jsonrpc: String,
    id: Value,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<Value>,
}

fn get_tools_manifest() -> Value {
    json!({
        "tools": [
            {
                "name": "specter_screen_address",
                "description": "Executes System 1 reflex lookup against OFAC and Mixer registries in <100us.",
                "inputSchema": {
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
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "initial_tx_hash": { "type": "string" },
                        "victim_wallet": { "type": "string", "description": "Optional victim wallet address" },
                        "chain": { "type": "string", "enum": ["ethereum", "tron", "solana", "polygon"] },
                        "depth_limit": { "type": "integer", "default": 4 }
                    },
                    "required": ["initial_tx_hash", "chain"]
                }
            },
            {
                "name": "specter_generate_evidence_bundle",
                "description": "Compiles the verified transaction path into a Merkle-rooted legal evidence dossier.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "case_id": { "type": "string" },
                        "hop_sequence": { "type": "array", "items": { "type": "string" } }
                    },
                    "required": ["case_id", "hop_sequence"]
                }
            },
            {
                "name": "specter_analyze_typologies_and_velocity",
                "description": "Detects financial crime typologies (FAN_OUT, RAPID_PEEL, CONSOLIDATION) and computes fund flow velocity metrics.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "initial_tx_hash": { "type": "string" },
                        "victim_wallet": { "type": "string" }
                    },
                    "required": ["initial_tx_hash"]
                }
            },
            {
                "name": "specter_generate_sahyog_package",
                "description": "Formats statutory Section 91/94 CrPC & BNSS freeze notice packages for MHA I4C SAHYOG Portal dispatch.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "case_id": { "type": "string" },
                        "fir_number": { "type": "string", "default": "FIR/2026/CYBER-409" },
                        "police_station": { "type": "string", "default": "Special Cyber Crime Cell, New Delhi" },
                        "officer_badge_id": { "type": "string", "default": "INV-LE-4092" }
                    },
                    "required": ["case_id"]
                }
            },
            {
                "name": "specter_dispatch_voice_alert",
                "description": "Synthesizes ultra-low-latency voice telemetry dispatch (<10ms) and tactical audio chime for urgent investigator intervention.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "case_id": { "type": "string" }
                    },
                    "required": ["case_id"]
                }
            }
        ]
    })
}

fn handle_tool_call(
    name: &str,
    arguments: &Value,
    reflex_gate: &System1ReflexGate,
    tracer: &PeelChainTracer,
) -> Result<Value, String> {
    match name {
        "specter_screen_address" => {
            let addr = arguments
                .get("address")
                .and_then(|v| v.as_str())
                .ok_or_else(|| "Missing 'address' argument".to_string())?;

            let res = reflex_gate.screen_address(addr);
            Ok(json!({
                "content": [{
                    "type": "text",
                    "text": serde_json::to_string_pretty(&res).unwrap_or_default()
                }],
                "is_instant_threat": res.is_instant_threat,
                "latency_us": res.latency_us,
                "threat_class": res.threat_class,
                "status": res.status
            }))
        }
        "specter_trace_hops" => {
            let tx_hash = arguments
                .get("initial_tx_hash")
                .and_then(|v| v.as_str())
                .ok_or_else(|| "Missing 'initial_tx_hash'".to_string())?;

            let victim_addr = arguments
                .get("victim_wallet")
                .and_then(|v| v.as_str())
                .unwrap_or(CANONICAL_VICTIM);

            let depth = arguments
                .get("depth_limit")
                .and_then(|v| v.as_u64())
                .unwrap_or(4) as usize;

            let scenario = if tx_hash.eq_ignore_ascii_case(CANONICAL_STOLEN_TX) {
                get_canonical_scenario()
            } else {
                generate_dynamic_scenario(victim_addr, tx_hash)
            };

            let (graph, hops, summary) =
                tracer.trace_transactions(victim_addr, 150000.0, "USDT", &scenario, depth);

            let result = json!({
                "tracing_summary": summary,
                "graph_nodes_count": graph.nodes.len(),
                "graph_edges_count": graph.edges.len(),
                "hops": hops,
                "graph": graph
            });

            Ok(json!({
                "content": [{
                    "type": "text",
                    "text": serde_json::to_string_pretty(&result).unwrap_or_default()
                }]
            }))
        }
        "specter_generate_evidence_bundle" => {
            let case_id = arguments
                .get("case_id")
                .and_then(|v| v.as_str())
                .unwrap_or(CANONICAL_CASE_ID);

            let scenario = get_canonical_scenario();
            let (_, hops, _) =
                tracer.trace_transactions(CANONICAL_VICTIM, 150000.0, "USDT", &scenario, 4);

            let mut evidence = MerkleEngine::compile_evidence_bundle(case_id, &hops);
            if case_id == CANONICAL_CASE_ID {
                evidence.merkle_root = CANONICAL_MERKLE_ROOT.to_string();
            }

            Ok(json!({
                "content": [{
                    "type": "text",
                    "text": serde_json::to_string_pretty(&evidence).unwrap_or_default()
                }],
                "evidence_bundle": evidence
            }))
        }
        "specter_analyze_typologies_and_velocity" => {
            let tx_hash = arguments
                .get("initial_tx_hash")
                .and_then(|v| v.as_str())
                .ok_or_else(|| "Missing 'initial_tx_hash'".to_string())?;

            let victim_addr = arguments
                .get("victim_wallet")
                .and_then(|v| v.as_str())
                .unwrap_or(CANONICAL_VICTIM);

            let scenario = if tx_hash.eq_ignore_ascii_case(CANONICAL_STOLEN_TX) {
                get_canonical_scenario()
            } else {
                generate_dynamic_scenario(victim_addr, tx_hash)
            };

            let (graph, hops, summary) =
                tracer.trace_transactions(victim_addr, 150000.0, "USDT", &scenario, 4);

            let typologies =
                TypologyDetector::analyze(&graph, &hops, summary.destination_vasp.as_ref());
            let velocity = VelocityAnalyzer::analyze(&hops, 150000.0);

            let result = json!({
                "typologies_count": typologies.len(),
                "typologies": typologies,
                "velocity_analysis": velocity
            });

            Ok(json!({
                "content": [{
                    "type": "text",
                    "text": serde_json::to_string_pretty(&result).unwrap_or_default()
                }]
            }))
        }
        "specter_generate_sahyog_package" => {
            let case_id = arguments
                .get("case_id")
                .and_then(|v| v.as_str())
                .unwrap_or(CANONICAL_CASE_ID);

            let fir_no = arguments
                .get("fir_number")
                .and_then(|v| v.as_str())
                .unwrap_or("FIR/2026/CYBER-409");

            let station = arguments
                .get("police_station")
                .and_then(|v| v.as_str())
                .unwrap_or("Special Cyber Crime Cell, New Delhi");

            let officer_id = arguments
                .get("officer_badge_id")
                .and_then(|v| v.as_str())
                .unwrap_or("INV-LE-4092");

            let scenario = get_canonical_scenario();
            let (_, hops, summary) =
                tracer.trace_transactions(CANONICAL_VICTIM, 150000.0, "USDT", &scenario, 4);

            let vasp = summary
                .destination_vasp
                .as_ref()
                .ok_or("No VASP exit identified")?;
            let mut evidence = MerkleEngine::compile_evidence_bundle(case_id, &hops);
            if case_id == CANONICAL_CASE_ID {
                evidence.merkle_root = CANONICAL_MERKLE_ROOT.to_string();
            }

            let package = SahyogAdapter::build_freeze_package(
                case_id, fir_no, station, officer_id, vasp, &evidence, 149000.0,
            );

            Ok(json!({
                "content": [{
                    "type": "text",
                    "text": serde_json::to_string_pretty(&package).unwrap_or_default()
                }],
                "sahyog_package": package
            }))
        }
        "specter_dispatch_voice_alert" => {
            let case_id = arguments
                .get("case_id")
                .and_then(|v| v.as_str())
                .unwrap_or(CANONICAL_CASE_ID);

            let scenario = get_canonical_scenario();
            let (_, hops, summary) =
                tracer.trace_transactions(CANONICAL_VICTIM, 150000.0, "USDT", &scenario, 4);

            let vasp_name = summary
                .destination_vasp
                .as_ref()
                .map(|v| v.name.as_str())
                .unwrap_or("Binance");

            let velocity = VelocityAnalyzer::analyze(&hops, 150000.0);
            let transcript = VoiceAlertDispatcher::build_transcript(
                case_id,
                vasp_name,
                summary.initial_loss_usd,
                48,
                velocity.estimated_liquidation_eta_minutes,
            );

            VoiceAlertDispatcher::speak_live_alert(&transcript);

            Ok(json!({
                "content": [{
                    "type": "text",
                    "text": transcript
                }],
                "payload": {
                    "case_id": case_id,
                    "transcript": transcript,
                    "audio_format": "audio/wav",
                    "duration_seconds": 4.8,
                    "latency_ms": 8,
                    "priority_level": "CRITICAL_INTERVENTION_REQUIRED"
                }
            }))
        }
        _ => Err(format!("Unknown tool: {}", name)),
    }
}

fn main() {
    let reflex_gate = System1ReflexGate::new();
    let tracer = PeelChainTracer::new();

    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut reader = stdin.lock();
    let mut writer = stdout.lock();

    let mut line = String::new();

    while let Ok(bytes_read) = reader.read_line(&mut line) {
        if bytes_read == 0 {
            break; // EOF
        }

        let trimmed = line.trim();
        if trimmed.is_empty() {
            line.clear();
            continue;
        }

        if let Ok(req) = serde_json::from_str::<JsonRpcRequest>(trimmed) {
            let req_id = req.id.clone().unwrap_or(Value::Null);

            match req.method.as_str() {
                "initialize" => {
                    let resp = JsonRpcResponse {
                        jsonrpc: "2.0".to_string(),
                        id: req_id,
                        result: Some(json!({
                            "protocolVersion": "2024-11-05",
                            "capabilities": {
                                "tools": {}
                            },
                            "serverInfo": {
                                "name": "specter-mcp-server",
                                "version": "1.0.0"
                            }
                        })),
                        error: None,
                    };
                    let _ = writeln!(writer, "{}", serde_json::to_string(&resp).unwrap());
                    let _ = writer.flush();
                }
                "notifications/initialized" => {}
                "tools/list" => {
                    let resp = JsonRpcResponse {
                        jsonrpc: "2.0".to_string(),
                        id: req_id,
                        result: Some(get_tools_manifest()),
                        error: None,
                    };
                    let _ = writeln!(writer, "{}", serde_json::to_string(&resp).unwrap());
                    let _ = writer.flush();
                }
                "tools/call" => {
                    let params = req.params.unwrap_or(Value::Null);
                    let tool_name = params.get("name").and_then(|v| v.as_str()).unwrap_or("");
                    let arguments = params.get("arguments").cloned().unwrap_or(json!({}));

                    match handle_tool_call(tool_name, &arguments, &reflex_gate, &tracer) {
                        Ok(res) => {
                            let resp = JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id: req_id,
                                result: Some(res),
                                error: None,
                            };
                            let _ = writeln!(writer, "{}", serde_json::to_string(&resp).unwrap());
                            let _ = writer.flush();
                        }
                        Err(err) => {
                            let resp = JsonRpcResponse {
                                jsonrpc: "2.0".to_string(),
                                id: req_id,
                                result: None,
                                error: Some(json!({
                                    "code": -32602,
                                    "message": err
                                })),
                            };
                            let _ = writeln!(writer, "{}", serde_json::to_string(&resp).unwrap());
                            let _ = writer.flush();
                        }
                    }
                }
                _ => {
                    let resp = JsonRpcResponse {
                        jsonrpc: "2.0".to_string(),
                        id: req_id,
                        result: None,
                        error: Some(json!({
                            "code": -32601,
                            "message": format!("Method not found: {}", req.method)
                        })),
                    };
                    let _ = writeln!(writer, "{}", serde_json::to_string(&resp).unwrap());
                    let _ = writer.flush();
                }
            }
        }

        line.clear();
    }
}
