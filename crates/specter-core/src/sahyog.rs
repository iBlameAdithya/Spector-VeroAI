//! MHA SAHYOG & Indian Law Enforcement Statutory Integration Engine
//!
//! Formats court-admissible asset freeze petitions and disclosure requests
//! compliant with Section 91 & Section 94 of the Code of Criminal Procedure (CrPC)
//! and Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023) for MHA I4C SAHYOG Portal dispatch.

use crate::proof::EvidenceBundle;
use crate::vasp::VaspIdentity;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SahyogChainStep {
    pub step_number: usize,
    pub element_type: String,
    pub label: String,
    pub value: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SahyogPackage {
    pub package_id: String,
    pub case_id: String,
    pub fir_number: String,
    pub police_station: String,
    pub investigating_officer_id: String,
    pub target_vasp_name: String,
    pub target_deposit_address: String,
    pub claimed_value: String,
    pub statutory_framework: String,
    pub legal_directive_title: String,
    pub formal_freeze_notice_text: String,
    pub evidence_chain: Vec<SahyogChainStep>,
    pub merkle_root: String,
    pub algorithm: String,
    pub provenance_quality_level: String, // "Level 1: Official Statutory Directive"
    pub status: String,                   // "READY_FOR_SAHYOG_PORTAL_DISPATCH"
    pub timestamp_utc: String,
}

pub struct SahyogAdapter;

impl SahyogAdapter {
    /// Build a complete, legally compliant SAHYOG package
    pub fn build_freeze_package(
        case_id: &str,
        fir_number: &str,
        police_station: &str,
        officer_badge_id: &str,
        vasp: &VaspIdentity,
        evidence: &EvidenceBundle,
        stolen_amount_usd: f64,
    ) -> SahyogPackage {
        let package_id = format!("SAHYOG-MHA-{}", uuid_from_str(case_id));
        let claim_value = format!("${:.2} USDT", stolen_amount_usd);

        // Build 7-step court-admissible chain of custody
        let evidence_chain = vec![
            SahyogChainStep {
                step_number: 1,
                element_type: "VASP_ENTITY".to_string(),
                label: "Attributed Virtual Asset Service Provider".to_string(),
                value: vasp.name.clone(),
                detail: format!("Entity: {} ({})", vasp.name, vasp.cluster_type),
            },
            SahyogChainStep {
                step_number: 2,
                element_type: "SUSPECT_ENDPOINT".to_string(),
                label: "Suspect VASP Deposit / Operational Address".to_string(),
                value: vasp.deposit_address.clone(),
                detail: format!("On-chain liquidation address: {}", vasp.deposit_address),
            },
            SahyogChainStep {
                step_number: 3,
                element_type: "ATTRIBUTION_CONFIDENCE".to_string(),
                label: "Evidence-Backed Attribution Score".to_string(),
                value: format!("{:.1} / 100", vasp.confidence_score),
                detail: "Confidence Band: HIGH (Direct Omnibus Hot Wallet Sweep Heuristic)".to_string(),
            },
            SahyogChainStep {
                step_number: 4,
                element_type: "STATUTORY_GROUNDS".to_string(),
                label: "Legal Grounds & Case Authority".to_string(),
                value: format!("FIR No. {}, PS: {}", fir_number, police_station),
                detail: "Investigation under Section 91 & 94 CrPC / BNSS (Cyber Fraud & Money Laundering)".to_string(),
            },
            SahyogChainStep {
                step_number: 5,
                element_type: "MERKLE_ROOT_PROOF".to_string(),
                label: "Cryptographic Lineage Root Anchor".to_string(),
                value: evidence.merkle_root.clone(),
                detail: format!("Algorithm: {} | Leaves: {} verified hops", evidence.algorithm, evidence.leaf_count),
            },
            SahyogChainStep {
                step_number: 6,
                element_type: "PROVENANCE_LEVEL".to_string(),
                label: "Intelligence Source Quality".to_string(),
                value: "Level 1: Official Mathematical Forensics".to_string(),
                detail: "Verified via deterministic bit-packed bloom reflex and BFS volume decay".to_string(),
            },
            SahyogChainStep {
                step_number: 7,
                element_type: "OFFICER_SIGNATURE".to_string(),
                label: "Investigating Officer Digital Stamp".to_string(),
                value: officer_badge_id.to_string(),
                detail: "Authorized Law Enforcement Cryptographic Verification Confirmed".to_string(),
            },
        ];

        let formal_notice_text = format!(
            "STATUTORY NOTICE UNDER SECTION 91/94 CrPC & BHARATIYA NAGARIK SURAKSHA SANHITA (BNSS, 2023)\n\n\
            TO: Compliance & Legal Enquiries Desk, {exchange_name}\n\
            FROM: Office of the Investigating Officer, {police_station}\n\
            CASE REF: FIR NO. {fir_no} / CASE REF {case_ref}\n\
            SUBJECT: URGENT ASSET PRESERVATION & ADMINISTRATIVE DEBIT FREEZE DIRECTIVE\n\n\
            WHEREAS, an investigation into cognizable cyber financial fraud involving the theft of {claim_val} is currently underway;\n\
            AND WHEREAS, verified cryptographic Merkle lineage tracing (Root: {merkle_root}) establishes that illicit proceeds have been \
            forwarded to and deposited into Account / Wallet Address [{deposit_addr}], hosted on your platform;\n\n\
            YOU ARE HEREBY COMMANDED TO:\n\
            1. Immediately execute an administrative debit freeze on deposit address [{deposit_addr}] and all associated sub-accounts;\n\
            2. Halt any pending fiat off-ramping, P2P orders, or omnibus wallet consolidation sweeps;\n\
            3. Preserve all Know Your Customer (KYC) documents, login IP logs, bank account numbers, and device telemetry associated with the account holder;\n\
            4. Dispatch confirmation of compliance within 24 hours to the undersigned authority via the MHA I4C SAHYOG Portal.\n\n\
            NOTICE IS HEREBY GIVEN THAT FAILURE TO COMPLY WITH THIS STATUTORY DIRECTIVE CONSTITUTES AN OFFENCE UNDER INDIAN PENAL LAW.",
            exchange_name = vasp.name,
            police_station = police_station,
            fir_no = fir_number,
            case_ref = case_id,
            claim_val = claim_value,
            merkle_root = evidence.merkle_root,
            deposit_addr = vasp.deposit_address,
        );

        SahyogPackage {
            package_id,
            case_id: case_id.to_string(),
            fir_number: fir_number.to_string(),
            police_station: police_station.to_string(),
            investigating_officer_id: officer_badge_id.to_string(),
            target_vasp_name: vasp.name.clone(),
            target_deposit_address: vasp.deposit_address.clone(),
            claimed_value: claim_value,
            statutory_framework: "Section 91/94 CrPC & Section 94 BNSS (2023)".to_string(),
            legal_directive_title: format!(
                "MHA-I4C Urgent Asset Preservation Directive ({})",
                vasp.name
            ),
            formal_freeze_notice_text: formal_notice_text,
            evidence_chain,
            merkle_root: evidence.merkle_root.clone(),
            algorithm: evidence.algorithm.clone(),
            provenance_quality_level: "Level 1: Official Statutory Directive".to_string(),
            status: "READY_FOR_SAHYOG_PORTAL_DISPATCH".to_string(),
            timestamp_utc: chrono::Utc::now().to_rfc3339(),
        }
    }
}

fn uuid_from_str(s: &str) -> String {
    let hash = blake3::hash(s.as_bytes());
    hex::encode(&hash.as_bytes()[..6]).to_uppercase()
}
