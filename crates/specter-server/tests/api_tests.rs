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
async fn test_post_trace_canonical_incident_with_typologies_and_velocity() {
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

    // Verify Case ID & Chain Detection
    assert_eq!(json_val["case_id"], "SPECTER-2026-9921");
    assert_eq!(json_val["detected_chain"], "ethereum");

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

    // Verify Typologies (EGRE Detection)
    let typologies = json_val["typologies"].as_array().unwrap();
    assert!(!typologies.is_empty());
    assert!(typologies.iter().any(|t| t["typology_name"].as_str().unwrap().contains("PEEL")));
    assert!(typologies.iter().any(|t| t["typology_name"].as_str().unwrap().contains("VASP")));

    // Verify Velocity Analysis
    let velocity = &json_val["velocity"];
    assert_eq!(velocity["hop_count"], 3);
    assert_eq!(velocity["is_burst_drainer"], true);
    assert_eq!(velocity["rolling_windows"].as_array().unwrap().len(), 5);

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

#[tokio::test]
async fn test_sahyog_package_generation_and_fetch() {
    let state = Arc::new(AppState::new());
    let app = create_app(state);

    // 1. First run trace to register the case in state
    let trace_payload = json!({
        "stolen_tx_hash": "0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
        "victim_wallet": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9",
        "chain": "ethereum",
        "max_hops": 4
    });

    let req_trace = Request::builder()
        .uri("/api/v1/trace")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&trace_payload).unwrap()))
        .unwrap();

    let res_trace = app.clone().oneshot(req_trace).await.unwrap();
    assert_eq!(res_trace.status(), StatusCode::OK);

    // 2. Generate SAHYOG package
    let sahyog_payload = json!({
        "case_id": "SPECTER-2026-9921",
        "fir_number": "FIR/2026/CYBER-409",
        "police_station": "Special Cyber Crime Cell, New Delhi",
        "officer_badge_id": "INV-LE-4092"
    });

    let req_sahyog = Request::builder()
        .uri("/api/v1/sahyog/package")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&sahyog_payload).unwrap()))
        .unwrap();

    let res_sahyog = app.clone().oneshot(req_sahyog).await.unwrap();
    assert_eq!(res_sahyog.status(), StatusCode::OK);

    let body_sahyog = res_sahyog.into_body().collect().await.unwrap().to_bytes();
    let json_sahyog: Value = serde_json::from_slice(&body_sahyog).unwrap();

    assert_eq!(json_sahyog["case_id"], "SPECTER-2026-9921");
    assert_eq!(json_sahyog["target_vasp_name"], "Binance");
    assert_eq!(json_sahyog["evidence_chain"].as_array().unwrap().len(), 7);
    assert!(json_sahyog["formal_freeze_notice_text"].as_str().unwrap().contains("SECTION 91/94 CrPC"));

    // 3. Fetch SAHYOG package by case_id
    let req_get = Request::builder()
        .uri("/api/v1/sahyog/package/SPECTER-2026-9921")
        .method("GET")
        .body(Body::empty())
        .unwrap();

    let res_get = app.oneshot(req_get).await.unwrap();
    assert_eq!(res_get.status(), StatusCode::OK);

    let body_get = res_get.into_body().collect().await.unwrap().to_bytes();
    let json_get: Value = serde_json::from_slice(&body_get).unwrap();
    assert_eq!(json_get["case_id"], "SPECTER-2026-9921");
}

#[tokio::test]
async fn test_voice_alert_and_chime_endpoints() {
    let state = Arc::new(AppState::new());
    let app = create_app(state);

    // 1. Run trace to register case
    let trace_payload = json!({
        "stolen_tx_hash": "0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
        "victim_wallet": "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9",
        "chain": "ethereum",
        "max_hops": 4
    });

    let req_trace = Request::builder()
        .uri("/api/v1/trace")
        .method("POST")
        .header("content-type", "application/json")
        .body(Body::from(serde_json::to_vec(&trace_payload).unwrap()))
        .unwrap();

    let res_trace = app.clone().oneshot(req_trace).await.unwrap();
    assert_eq!(res_trace.status(), StatusCode::OK);

    // 2. Test Voice Alert dispatch endpoint
    let req_voice = Request::builder()
        .uri("/api/v1/voice/alert/SPECTER-2026-9921")
        .method("GET")
        .body(Body::empty())
        .unwrap();

    let res_voice = app.clone().oneshot(req_voice).await.unwrap();
    assert_eq!(res_voice.status(), StatusCode::OK);

    let body_voice = res_voice.into_body().collect().await.unwrap().to_bytes();
    let json_voice: Value = serde_json::from_slice(&body_voice).unwrap();

    assert_eq!(json_voice["case_id"], "SPECTER-2026-9921");
    assert!(json_voice["transcript"].as_str().unwrap().contains("SPECTER Priority Alert"));
    assert_eq!(json_voice["audio_format"], "audio/wav");
    assert_eq!(json_voice["priority_level"], "CRITICAL_INTERVENTION_REQUIRED");

    // 3. Test Voice Chime WAV generator
    let req_chime = Request::builder()
        .uri("/api/v1/voice/chime")
        .method("GET")
        .body(Body::empty())
        .unwrap();

    let res_chime = app.oneshot(req_chime).await.unwrap();
    assert_eq!(res_chime.status(), StatusCode::OK);
    assert_eq!(
        res_chime.headers().get("content-type").unwrap(),
        "audio/wav"
    );

    let body_chime = res_chime.into_body().collect().await.unwrap().to_bytes();
    assert!(body_chime.len() > 44);
    assert_eq!(&body_chime[0..4], b"RIFF");
    assert_eq!(&body_chime[8..12], b"WAVE");
}

