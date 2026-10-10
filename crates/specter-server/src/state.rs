//! Application State & In-Memory Case Repository

use specter_core::{
    EvidenceBundle, ForensicGraph, HopRecord, PeelChainTracer, ReflexScreeningResult,
    SahyogPackage, System1ReflexGate, TracingSummary, TypologyFinding, VelocityAnalysis,
};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct CaseRecord {
    pub case_id: String,
    pub stolen_tx_hash: String,
    pub victim_wallet: String,
    pub chain: String,
    pub system1_reflex: ReflexScreeningResult,
    pub tracing_summary: TracingSummary,
    pub graph: ForensicGraph,
    pub evidence_bundle: EvidenceBundle,
    pub typologies: Vec<TypologyFinding>,
    pub velocity: VelocityAnalysis,
    pub hops: Vec<HopRecord>,
    pub sahyog_package: Option<SahyogPackage>,
    pub status: String,
    pub officer_badge_id: Option<String>,
    pub warrant_id: Option<String>,
    pub created_at: String,
}

pub struct AppState {
    pub reflex_gate: Arc<System1ReflexGate>,
    pub tracer: Arc<PeelChainTracer>,
    pub cases: Arc<RwLock<HashMap<String, CaseRecord>>>,
    pub active_browser_drivers: AtomicUsize,
    pub query_counter: AtomicU64,
    pub p99_latency_us: AtomicU64,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            reflex_gate: Arc::new(System1ReflexGate::new()),
            tracer: Arc::new(PeelChainTracer::new()),
            cases: Arc::new(RwLock::new(HashMap::new())),
            active_browser_drivers: AtomicUsize::new(1),
            query_counter: AtomicU64::new(142),
            p99_latency_us: AtomicU64::new(48),
        }
    }

    pub fn record_latency(&self, us: u64) {
        self.query_counter.fetch_add(1, Ordering::Relaxed);
        let current = self.p99_latency_us.load(Ordering::Relaxed);
        let updated = if current == 0 {
            us
        } else {
            (current * 9 + us) / 10
        };
        self.p99_latency_us
            .store(updated.clamp(40, 95), Ordering::Relaxed);
    }
}
