//! Latency Benchmark & Stress Test for System 1 In-Memory Reflex Gate

use specter_core::{
    get_canonical_scenario, MerkleEngine, PeelChainTracer, System1ReflexGate, CANONICAL_CASE_ID,
    CANONICAL_VICTIM,
};
use std::time::Instant;

#[test]
fn test_reflex_gate_sub_100_microsecond_p99_guarantee() {
    let gate = System1ReflexGate::new();

    let test_addresses = [
        // Malicious / Flagged
        "0x098B716B8Aaf21512996dC57EB0615e2383E2f96", // Lazarus
        "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b", // Tornado Router
        "0x00000000ae3479303288527399330c60c766b168", // Inferno Drainer
        "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9", // Canonical Victim
        // Clean Addresses
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // vitalik.eth
        "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", // Binance 7
        "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503", // Clean Hot Wallet
    ];

    let mut latencies_us = Vec::with_capacity(1000);

    // Warm-up run
    for addr in &test_addresses {
        let _ = gate.screen_address(addr);
    }

    // Benchmark 1,000 iterations
    let benchmark_start = Instant::now();
    for i in 0..1000 {
        let addr = test_addresses[i % test_addresses.len()];
        let start = Instant::now();
        let res = gate.screen_address(addr);
        let elapsed_us = start.elapsed().as_micros() as u64;
        latencies_us.push(res.latency_us.max(elapsed_us));
    }
    let total_elapsed = benchmark_start.elapsed();

    latencies_us.sort_unstable();
    let p50 = latencies_us[500];
    let p90 = latencies_us[900];
    let p99 = latencies_us[990];
    let max = latencies_us[latencies_us.len() - 1];

    println!("--------------------------------------------------");
    println!("⚡ SPECTER SYSTEM 1 REFLEX GATE BENCHMARK (1,000 runs)");
    println!("Total Elapsed Time: {:?}", total_elapsed);
    println!("P50 Latency: {} µs", p50);
    println!("P90 Latency: {} µs", p90);
    println!("P99 Latency: {} µs", p99);
    println!("Max Latency: {} µs", max);
    println!("--------------------------------------------------");

    assert!(
        p99 < 100,
        "System 1 Invariant Violated: P99 latency must be strictly < 100µs, got {} µs",
        p99
    );
}

#[test]
fn test_end_to_end_forensic_pipeline_throughput() {
    let tracer = PeelChainTracer::new();
    let scenario = get_canonical_scenario();

    let start = Instant::now();
    for _ in 0..100 {
        let (graph, hops, summary) =
            tracer.trace_transactions(CANONICAL_VICTIM, 150000.0, "USDT", &scenario, 4);
        let evidence = MerkleEngine::compile_evidence_bundle(CANONICAL_CASE_ID, &hops);
        assert_eq!(hops.len(), 3);
        assert!(summary.exit_vasp_identified);
        assert!(!evidence.merkle_root.is_empty());
        assert_eq!(graph.nodes.len(), 6);
    }
    let duration = start.elapsed();
    println!(
        "100 complete end-to-end forensic traces compiled in {:?}",
        duration
    );
    assert!(
        duration.as_millis() < 500,
        "100 traces must execute in < 500ms"
    );
}
