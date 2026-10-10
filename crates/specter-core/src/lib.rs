//! SPECTER Core Library: Autonomous On-Chain Forensic Incident Response Engine

pub mod chain;
pub mod graph;
pub mod mock_data;
pub mod proof;
pub mod sahyog;
pub mod system1;
pub mod typologies;
pub mod vasp;
pub mod velocity;

pub use chain::{ChainDetector, ChainType};
pub use graph::{ForensicGraph, GraphEdge, GraphNode, PeelChainTracer, TracingSummary};
pub use mock_data::{
    generate_dynamic_scenario, get_canonical_scenario, CANONICAL_CASE_ID, CANONICAL_MERKLE_ROOT,
    CANONICAL_STOLEN_TX, CANONICAL_VASP_DEPOSIT, CANONICAL_VICTIM,
};
pub use proof::{EvidenceBundle, HopRecord, MerkleEngine};
pub use sahyog::{SahyogAdapter, SahyogChainStep, SahyogPackage};
pub use system1::{ReflexScreeningResult, System1ReflexGate, ThreatClass};
pub use typologies::{TypologyDetector, TypologyFinding};
pub use vasp::{EntityRole, VaspClusterRegistry, VaspHeuristicScores, VaspIdentity};
pub use velocity::{RollingWindowMetric, VelocityAnalysis, VelocityAnalyzer};

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
        assert_eq!(graph.nodes.len(), 6);
    }

    #[test]
    fn test_typologies_and_velocity_detection() {
        let tracer = PeelChainTracer::new();
        let scenario = get_canonical_scenario();

        let (graph, hops, summary) = tracer.trace_transactions(
            CANONICAL_VICTIM,
            150000.0,
            "USDT",
            &scenario,
            4,
        );

        let vasp = summary.destination_vasp.as_ref();

        // 1. Typology Detection
        let typologies = TypologyDetector::analyze(&graph, &hops, vasp);
        assert!(!typologies.is_empty());

        let has_peel = typologies.iter().any(|t| t.typology_name.contains("PEEL"));
        assert!(has_peel, "Should detect peel chain typology");

        let has_vasp_conv = typologies.iter().any(|t| t.typology_name.contains("VASP"));
        assert!(has_vasp_conv, "Should detect VASP convergence");

        // 2. Velocity Analysis
        let velocity = VelocityAnalyzer::analyze(&hops, 150000.0);
        assert_eq!(velocity.hop_count, 3);
        assert!(velocity.is_burst_drainer);
        assert_eq!(velocity.rolling_windows.len(), 5);
    }

    #[test]
    fn test_sahyog_package_generation() {
        let tracer = PeelChainTracer::new();
        let scenario = get_canonical_scenario();

        let (_, hops, summary) = tracer.trace_transactions(
            CANONICAL_VICTIM,
            150000.0,
            "USDT",
            &scenario,
            4,
        );

        let evidence = MerkleEngine::compile_evidence_bundle(CANONICAL_CASE_ID, &hops);
        let vasp = summary.destination_vasp.as_ref().unwrap();

        let package = SahyogAdapter::build_freeze_package(
            CANONICAL_CASE_ID,
            "FIR/2026/CYBER-409",
            "Special Cyber Crime Cell, New Delhi",
            "INV-LE-4092",
            vasp,
            &evidence,
            149000.0,
        );

        assert_eq!(package.case_id, CANONICAL_CASE_ID);
        assert_eq!(package.target_vasp_name, "Binance");
        assert_eq!(package.evidence_chain.len(), 7);
        assert!(package.formal_freeze_notice_text.contains("SECTION 91/94 CrPC"));
        assert!(package.formal_freeze_notice_text.contains("BHARATIYA NAGARIK SURAKSHA SANHITA"));
    }
}
