//! SPECTER Core Library: Autonomous On-Chain Forensic Incident Response Engine

pub mod graph;
pub mod mock_data;
pub mod proof;
pub mod system1;
pub mod vasp;

pub use graph::{ForensicGraph, GraphEdge, GraphNode, PeelChainTracer, TracingSummary};
pub use mock_data::{
    generate_dynamic_scenario, get_canonical_scenario, CANONICAL_CASE_ID, CANONICAL_MERKLE_ROOT,
    CANONICAL_STOLEN_TX, CANONICAL_VASP_DEPOSIT, CANONICAL_VICTIM,
};
pub use proof::{EvidenceBundle, HopRecord, MerkleEngine};
pub use system1::{ReflexScreeningResult, System1ReflexGate, ThreatClass};
pub use vasp::{VaspClusterRegistry, VaspIdentity};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_system1_reflex_latency_and_accuracy() {
        let gate = System1ReflexGate::new();

        // 1. Check known malicious address (Lazarus)
        let res_malicious = gate.screen_address("0x098B716B8Aaf21512996dC57EB0615e2383E2f96");
        assert!(res_malicious.is_instant_threat);
        assert_eq!(res_malicious.status, "FLAGGED");
        assert!(
            res_malicious.latency_us < 100,
            "Latency must be sub-100 microseconds, got {}",
            res_malicious.latency_us
        );

        // 2. Check clean address
        let res_clean = gate.screen_address("0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae");
        assert!(!res_clean.is_instant_threat);
        assert_eq!(res_clean.status, "CLEAN");
        assert!(
            res_clean.latency_us < 100,
            "Latency must be sub-100 microseconds, got {}",
            res_clean.latency_us
        );
    }

    #[test]
    fn test_canonical_peel_chain_and_merkle_root() {
        let tracer = PeelChainTracer::new();
        let scenario = get_canonical_scenario();

        let (graph, hops, summary) = tracer.trace_transactions(
            CANONICAL_VICTIM,
            150000.0,
            "USDT",
            &scenario,
            4,
        );

        assert_eq!(hops.len(), 3);
        assert!(summary.exit_vasp_identified);
        assert_eq!(
            summary.destination_vasp.as_ref().unwrap().name,
            "Binance"
        );
        assert_eq!(
            summary.destination_vasp.as_ref().unwrap().deposit_address,
            CANONICAL_VASP_DEPOSIT
        );

        // Verify Merkle Root generation
        let evidence = MerkleEngine::compile_evidence_bundle(CANONICAL_CASE_ID, &hops);
        assert!(!evidence.merkle_root.is_empty());
        assert_eq!(evidence.leaf_count, 3);
        assert!(evidence.statutory_clauses.len() >= 2);
        assert_eq!(graph.nodes.len(), 6); // victim, 2 mule trunks, 2 peels, 1 vasp
    }
}
