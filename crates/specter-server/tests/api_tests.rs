//! REST API Integration Tests for SPECTER Axum Engine

use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use specter_server::{create_app, AppState};
use std::sync::Arc;
use tower::ServiceExt;

#[tokio::test]
async fn test_get_health_endpoint() {
    let state = Arc::new(AppState::new());
    let app = create_app(state);

    let req = Request::builder()
        .uri("/api/v1/health")
        .method("GET")
        .body(Body::empty())
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let body = res.into_body().collect().await.unwrap().to_bytes();
    let json_val: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(json_val["status"], "ONLINE");
    assert_eq!(json_val["engine"], "SPECTER-Rust-Core");
    assert_eq!(json_val["mcp_server_status"], "READY");
    assert!(json_val["system1_latency_p99_us"].as_u64().unwrap() <= 100);
}

#[tokio::test]
async fn test_post_trace_canonical_incident() {
    let state = Arc::new(AppState::new());
    let app = create_app(state);

    let payload = json!({
        "stolen_tx_hash": "0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
        "victim_wallet": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9",
        "chain": "ethereum",
        "max_hops": 4
    });

    let req = Request::builder()
        .uri("/api/v1/trace")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&payload).unwrap()))
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let body = res.into_body().collect().await.unwrap().to_bytes();
    let json_val: Value = serde_json::from_slice(&body).unwrap();

    // Verify Case ID
    assert_eq!(json_val["case_id"], "SPECTER-2026-9921");

    // Verify System 1 Reflex
    assert_eq!(json_val["system1_reflex"]["is_instant_threat"], true);
    assert_eq!(json_val["system1_reflex"]["status"], "FLAGGED");
    assert!(json_val["system1_reflex"]["latency_us"].as_u64().unwrap() < 100);

    // Verify Tracing Summary
    let summary = &json_val["tracing_summary"];
    assert_eq!(summary["initial_loss_usd"], 150000.0);
    assert_eq!(summary["currency"], "USDT");
    assert_eq!(summary["hops_traversed"], 3);
    assert_eq!(summary["exit_vasp_identified"], true);

    let vasp = &summary["destination_vasp"];
    assert_eq!(vasp["name"], "Binance");
    assert_eq!(
        vasp["deposit_address"],
        "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a"
    );
    assert_eq!(vasp["confidence_score"], 98.4);

    // Verify Merkle Evidence Bundle
    let evidence = &json_val["evidence_bundle"];
    assert_eq!(
        evidence["merkle_root"],
        "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
    );
    assert_eq!(evidence["algorithm"], "BLAKE3-256");

    let clauses = evidence["statutory_clauses"].as_array().unwrap();
    assert!(clauses.iter().any(|c| c.as_str().unwrap().contains("Section 91 CrPC")));
    assert!(clauses.iter().any(|c| c.as_str().unwrap().contains("FATF Recommendation 16")));

    // Verify Forensic Graph topology
    let graph = &json_val["graph"];
    assert_eq!(graph["nodes"].as_array().unwrap().len(), 6);
    assert_eq!(graph["edges"].as_array().unwrap().len(), 5);
}

#[tokio::test]
async fn test_post_prepare_and_submit_freeze() {
    let state = Arc::new(AppState::new());
    let app = create_app(state);

    // 1. Prepare Freeze
    let prepare_payload = json!({
        "case_id": "SPECTER-2026-9921",
        "target_vasp": "Binance",
        "deposit_address": "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a"
    });

    let req_prepare = Request::builder()
        .uri("/api/v1/agent/prepare-freeze")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&prepare_payload).unwrap()))
        .unwrap();

    let res_prepare = app.clone().oneshot(req_prepare).await.unwrap();
    assert_eq!(res_prepare.status(), StatusCode::OK);

    let body_prepare = res_prepare.into_body().collect().await.unwrap().to_bytes();
    let json_prepare: Value = serde_json::from_slice(&body_prepare).unwrap();

    assert_eq!(json_prepare["status"], "AWAITING_HUMAN_SIGNATURE");
    assert_eq!(json_prepare["browser_window_state"], "HEADED_ACTIVE");
    assert_eq!(
        json_prepare["prefilled_fields"]["case_ref"],
        "SPECTER-2026-9921"
    );
    assert_eq!(
        json_prepare["prefilled_fields"]["suspect_deposit_address"],
        "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a"
    );

    // 2. Sign and Submit Warrant
    let submit_payload = json!({
        "case_id": "SPECTER-2026-9921",
        "officer_badge_id": "INV-LE-4092",
        "signature_token": "ED25519_SIG_CONFIRMED_OK",
        "approved": true
    });

    let req_submit = Request::builder()
        .uri("/api/v1/agent/sign-and-submit")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&submit_payload).unwrap()))
        .unwrap();

    let res_submit = app.oneshot(req_submit).await.unwrap();
    assert_eq!(res_submit.status(), StatusCode::OK);

    let body_submit = res_submit.into_body().collect().await.unwrap().to_bytes();
    let json_submit: Value = serde_json::from_slice(&body_submit).unwrap();

    assert_eq!(json_submit["status"], "FREEZE_WARRANT_ISSUED");
    assert_eq!(json_submit["warrant_id"], "WARRANT-BINANCE-2026-9921");
    assert_eq!(
        json_submit["target_account_status"],
        "FREEZE_APPLIED_TEMPORARY_HOLD"
    );
}
