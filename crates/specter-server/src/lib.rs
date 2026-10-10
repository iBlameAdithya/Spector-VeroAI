//! SPECTER Server Library & App Factory

pub mod routes;
pub mod state;

use axum::{
    routing::{get, post},
    Router,
};
pub use state::AppState;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

pub fn create_app(state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Standard root routes
        .route("/health", get(routes::health_handler))
        .route("/trace", post(routes::trace_handler))
        .route(
            "/agent/prepare-freeze",
            post(routes::prepare_freeze_handler),
        )
        .route(
            "/agent/sign-and-submit",
            post(routes::sign_and_submit_handler),
        )
        .route("/sahyog/package", post(routes::sahyog_package_handler))
        .route(
            "/sahyog/package/:case_id",
            get(routes::get_sahyog_package_handler),
        )
        .route("/voice/alert/:case_id", get(routes::voice_alert_handler))
        .route("/voice/chime", get(routes::voice_chime_handler))
        // Prefixed /api/v1 routes
        .route("/api/v1/health", get(routes::health_handler))
        .route("/api/v1/trace", post(routes::trace_handler))
        .route(
            "/api/v1/agent/prepare-freeze",
            post(routes::prepare_freeze_handler),
        )
        .route(
            "/api/v1/agent/sign-and-submit",
            post(routes::sign_and_submit_handler),
        )
        .route(
            "/api/v1/sahyog/package",
            post(routes::sahyog_package_handler),
        )
        .route(
            "/api/v1/sahyog/package/:case_id",
            get(routes::get_sahyog_package_handler),
        )
        .route(
            "/api/v1/voice/alert/:case_id",
            get(routes::voice_alert_handler),
        )
        .route("/api/v1/voice/chime", get(routes::voice_chime_handler))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
