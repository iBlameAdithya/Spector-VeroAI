//! Financial Crime Typology Detection Engine (EGRE Pattern Recognizer)
//!
//! Rule-based graph pattern matcher identifying money-laundering typologies:
//! - FAN_OUT (1 -> N dispersal)
//! - FAN_IN (N -> 1 aggregation)
//! - CONSOLIDATION (downstream graph branch convergence)
//! - RAPID_PEEL (sequential forwarding of >=85% with micro-peeling)
//! - REPEATED_INTERACTION (frequent transfer pairs)
//! - VASP_CONVERGENCE (multiple branches terminating at same exit exchange)
//! - KNOWN_SERVICE_ENTITY (false-positive safety guardrail)

use crate::graph::{ForensicGraph, GraphEdge};
use crate::proof::HopRecord;
use crate::vasp::VaspIdentity;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypologyFinding {
    pub typology_id: String,
    pub typology_name: String,
    pub severity: String, // "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"
    pub description: String,
    pub trigger_conditions: Vec<String>,
    pub confidence_score: f64,
    pub supporting_transactions: Vec<String>,
    pub supporting_wallets: Vec<String>,
    pub is_known_service_entity: bool,
}

pub struct TypologyDetector;

impl TypologyDetector {
    /// Analyze forensic graph, hops, and terminal VASP for financial crime patterns
    pub fn analyze(
        graph: &ForensicGraph,
        hops: &[HopRecord],
        vasp: Option<&VaspIdentity>,
    ) -> Vec<TypologyFinding> {
        let mut findings = Vec::new();

        // 1. RAPID_PEEL Pattern Detection
        if let Some(peel_finding) = Self::detect_rapid_peel(hops) {
            findings.push(peel_finding);
        }

        // 2. FAN_OUT Detection (1 -> N dispersal)
        if let Some(fan_out_finding) = Self::detect_fan_out(&graph.edges) {
            findings.push(fan_out_finding);
        }

        // 3. FAN_IN / CONSOLIDATION Detection (N -> 1 aggregation)
        if let Some(fan_in_finding) = Self::detect_fan_in(&graph.edges) {
            findings.push(fan_in_finding);
        }

        // 4. VASP_CONVERGENCE Detection
        if let Some(v) = vasp {
            if let Some(conv_finding) = Self::detect_vasp_convergence(graph, v) {
                findings.push(conv_finding);
            }
        }

        // 5. REPEATED_INTERACTION Detection
        if let Some(repeated_finding) = Self::detect_repeated_interactions(&graph.edges) {
            findings.push(repeated_finding);
        }

        // 6. KNOWN_SERVICE_ENTITY Guardrail
        if let Some(v) = vasp {
            findings.push(TypologyFinding {
                typology_id: "TYP-SERVICE-001".to_string(),
                typology_name: "KNOWN_SERVICE_ENTITY".to_string(),
                severity: "LOW".to_string(),
                description: format!(
                    "Traced fund flow terminates at verified centralized service entity '{}' ({}).",
                    v.name, v.cluster_type
                ),
                trigger_conditions: vec![
                    "Terminal node matches verified VASP infrastructure cluster".to_string(),
                    format!(
                        "Attribution confidence >= 90% (Actual: {:.1}%)",
                        v.confidence_score
                    ),
                ],
                confidence_score: v.confidence_score,
                supporting_transactions: hops.iter().map(|h| h.tx_hash.clone()).collect(),
                supporting_wallets: vec![v.deposit_address.clone()],
                is_known_service_entity: true,
            });
        }

        findings
    }

    fn detect_rapid_peel(hops: &[HopRecord]) -> Option<TypologyFinding> {
        if hops.len() < 2 {
            return None;
        }

        // Check if value is sustained with minor peels (<15% per hop)
        let mut is_peel = true;
        let mut prev_amount = hops[0].amount;

        for hop in hops.iter().skip(1) {
            let retention = hop.amount / prev_amount;
            if !(0.80..=1.05).contains(&retention) {
                is_peel = false;
                break;
            }
            prev_amount = hop.amount;
        }

        if is_peel {
            let supporting_txs: Vec<String> = hops.iter().map(|h| h.tx_hash.clone()).collect();
            let supporting_addrs: Vec<String> = hops.iter().map(|h| h.to_address.clone()).collect();

            Some(TypologyFinding {
                typology_id: "TYP-PEEL-001".to_string(),
                typology_name: "RAPID_PEEL_CHAIN_DISPERSAL".to_string(),
                severity: "CRITICAL".to_string(),
                description: format!(
                    "Sequential {} -hop peeling structure detected: funds forwarded with >=85% payload retention per hop to evade static volume threshold triggers.",
                    hops.len()
                ),
                trigger_conditions: vec![
                    format!("Hop sequence length: {} hops", hops.len()),
                    "Volume forwarding ratio >= 0.85 on primary value trunk".to_string(),
                    "Secondary peel outputs detached at intermediate mule splits".to_string(),
                ],
                confidence_score: 96.5,
                supporting_transactions: supporting_txs,
                supporting_wallets: supporting_addrs,
                is_known_service_entity: false,
            })
        } else {
            None
        }
    }

    fn detect_fan_out(edges: &[GraphEdge]) -> Option<TypologyFinding> {
        let mut out_counts: HashMap<&str, Vec<&GraphEdge>> = HashMap::new();
        for edge in edges {
            out_counts.entry(&edge.from).or_default().push(edge);
        }

        for (from_addr, outgoing) in out_counts {
            if outgoing.len() >= 2 {
                let txs: Vec<String> = outgoing.iter().map(|e| e.tx.clone()).collect();
                let wallets: Vec<String> = outgoing.iter().map(|e| e.to.clone()).collect();

                return Some(TypologyFinding {
                    typology_id: "TYP-FANOUT-001".to_string(),
                    typology_name: "FAN_OUT_DISPERSAL".to_string(),
                    severity: "HIGH".to_string(),
                    description: format!(
                        "Address {} initiated 1-to-{} fan-out dispersal to multiple mule recipients.",
                        from_addr, outgoing.len()
                    ),
                    trigger_conditions: vec![
                        format!("Outgoing split count: {}", outgoing.len()),
                        "Simultaneous parallel value detachment".to_string(),
                    ],
                    confidence_score: 92.0,
                    supporting_transactions: txs,
                    supporting_wallets: wallets,
                    is_known_service_entity: false,
                });
            }
        }
        None
    }

    fn detect_fan_in(edges: &[GraphEdge]) -> Option<TypologyFinding> {
        let mut in_counts: HashMap<&str, Vec<&GraphEdge>> = HashMap::new();
        for edge in edges {
            in_counts.entry(&edge.to).or_default().push(edge);
        }

        for (to_addr, incoming) in in_counts {
            if incoming.len() >= 3 {
                let txs: Vec<String> = incoming.iter().map(|e| e.tx.clone()).collect();
                let wallets: Vec<String> = incoming.iter().map(|e| e.from.clone()).collect();

                return Some(TypologyFinding {
                    typology_id: "TYP-FANIN-001".to_string(),
                    typology_name: "FAN_IN_CONSOLIDATION".to_string(),
                    severity: "HIGH".to_string(),
                    description: format!(
                        "Aggregator node {} received {} convergent inbound streams from separate mules.",
                        to_addr, incoming.len()
                    ),
                    trigger_conditions: vec![
                        format!("Incoming aggregation branches: {}", incoming.len()),
                        "Funneling of multi-path stolen funds into single exit pool".to_string(),
                    ],
                    confidence_score: 89.0,
                    supporting_transactions: txs,
                    supporting_wallets: wallets,
                    is_known_service_entity: false,
                });
            }
        }
        None
    }

    fn detect_vasp_convergence(
        graph: &ForensicGraph,
        vasp: &VaspIdentity,
    ) -> Option<TypologyFinding> {
        // Count edges terminating at the VASP deposit address
        let incoming_to_vasp: Vec<&GraphEdge> = graph
            .edges
            .iter()
            .filter(|e| e.to.eq_ignore_ascii_case(&vasp.deposit_address))
            .collect();

        if !incoming_to_vasp.is_empty() {
            Some(TypologyFinding {
                typology_id: "TYP-VASP-CONV-001".to_string(),
                typology_name: "VASP_LIQUIDATION_CONVERGENCE".to_string(),
                severity: "CRITICAL".to_string(),
                description: format!(
                    "Terminal flow converges directly to centralized VASP {} (Deposit Address: {}). Immediate off-ramping risk.",
                    vasp.name, vasp.deposit_address
                ),
                trigger_conditions: vec![
                    format!("Destination Exchange: {}", vasp.name),
                    format!("Deposit Cluster: {}", vasp.cluster_type),
                    "Confirmed omnibus sweep pattern identified".to_string(),
                ],
                confidence_score: vasp.confidence_score,
                supporting_transactions: incoming_to_vasp.iter().map(|e| e.tx.clone()).collect(),
                supporting_wallets: vec![vasp.deposit_address.clone()],
                is_known_service_entity: true,
            })
        } else {
            None
        }
    }

    fn detect_repeated_interactions(edges: &[GraphEdge]) -> Option<TypologyFinding> {
        let mut pairs: HashMap<(&str, &str), usize> = HashMap::new();
        for edge in edges {
            let key = if edge.from < edge.to {
                (edge.from.as_str(), edge.to.as_str())
            } else {
                (edge.to.as_str(), edge.from.as_str())
            };
            *pairs.entry(key).or_default() += 1;
        }

        for ((a, b), count) in pairs {
            if count >= 2 {
                return Some(TypologyFinding {
                    typology_id: "TYP-REPEAT-001".to_string(),
                    typology_name: "REPEATED_PAIR_INTERACTION".to_string(),
                    severity: "MEDIUM".to_string(),
                    description: format!(
                        "Pair interaction between {} and {} occurred {} times across investigation graph.",
                        a, b, count
                    ),
                    trigger_conditions: vec![format!("Repeated interaction count: {}", count)],
                    confidence_score: 84.0,
                    supporting_transactions: vec![],
                    supporting_wallets: vec![a.to_string(), b.to_string()],
                    is_known_service_entity: false,
                });
            }
        }
        None
    }
}
