//! Deterministic Test Scenarios & Canonical Mock On-Chain Data

use crate::graph::RawOnChainTx;

pub const CANONICAL_CASE_ID: &str = "SPECTER-2026-9921";
pub const CANONICAL_STOLEN_TX: &str =
    "0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b";
pub const CANONICAL_VICTIM: &str = "0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9";
pub const CANONICAL_VASP_DEPOSIT: &str = "0x3f5ce5fb59e02f43cf8d1326be81a329d448181a";
pub const CANONICAL_MERKLE_ROOT: &str =
    "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";

pub fn get_canonical_scenario() -> Vec<RawOnChainTx> {
    vec![
        RawOnChainTx {
            tx_hash: "0x111111111111111111111111111111111111111111111111111111111111aaaa"
                .to_string(),
            from: CANONICAL_VICTIM.to_string(),
            outputs: vec![
                (
                    "0x99a34b2f15318721adcc92942472b53b8214a44f".to_string(),
                    149500.0,
                ),
                (
                    "0x88b14a2c11438721adcc92942472b53b8214a11e".to_string(),
                    500.0,
                ),
            ],
            block_number: 19823401,
            timestamp_utc: "2026-10-10T14:12:00Z".to_string(),
        },
        RawOnChainTx {
            tx_hash: "0x222222222222222222222222222222222222222222222222222222222222bbbb"
                .to_string(),
            from: "0x99a34b2f15318721adcc92942472b53b8214a44f".to_string(),
            outputs: vec![
                (
                    "0xd4b72648831f2115e58988a2efc46427357c4110".to_string(),
                    149000.0,
                ),
                (
                    "0x77c24a2c11438721adcc92942472b53b8214a22f".to_string(),
                    500.0,
                ),
            ],
            block_number: 19823415,
            timestamp_utc: "2026-10-10T14:18:00Z".to_string(),
        },
        RawOnChainTx {
            tx_hash: "0x333333333333333333333333333333333333333333333333333333333333cccc"
                .to_string(),
            from: "0xd4b72648831f2115e58988a2efc46427357c4110".to_string(),
            outputs: vec![(CANONICAL_VASP_DEPOSIT.to_string(), 149000.0)],
            block_number: 19823432,
            timestamp_utc: "2026-10-10T14:26:00Z".to_string(),
        },
    ]
}

/// Generates a realistic mock scenario for any custom address or transaction hash
pub fn generate_dynamic_scenario(victim_addr: &str, stolen_tx: &str) -> Vec<RawOnChainTx> {
    if victim_addr.to_lowercase() == CANONICAL_VICTIM.to_lowercase()
        || stolen_tx.to_lowercase() == CANONICAL_STOLEN_TX.to_lowercase()
    {
        return get_canonical_scenario();
    }

    let seed = blake3::hash(stolen_tx.as_bytes());
    let hex_seed = hex::encode(seed.as_bytes());

    let mule1 = format!("0x{}", &hex_seed[0..40]);
    let mule2 = format!("0x{}", &hex_seed[10..50]);

    vec![
        RawOnChainTx {
            tx_hash: format!("0x{}", &hex_seed[0..64]),
            from: victim_addr.to_string(),
            outputs: vec![
                (mule1.clone(), 74500.0),
                (format!("0x{}fe", &hex_seed[20..58]), 500.0),
            ],
            block_number: 19845010,
            timestamp_utc: "2026-10-10T14:15:00Z".to_string(),
        },
        RawOnChainTx {
            tx_hash: format!("0x{}", &hex_seed[16..64]),
            from: mule1,
            outputs: vec![
                (mule2.clone(), 74000.0),
                (format!("0x{}ee", &hex_seed[25..63]), 500.0),
            ],
            block_number: 19845025,
            timestamp_utc: "2026-10-10T14:21:00Z".to_string(),
        },
        RawOnChainTx {
            tx_hash: format!("0x{}", &hex_seed[32..64]),
            from: mule2,
            outputs: vec![(CANONICAL_VASP_DEPOSIT.to_string(), 74000.0)],
            block_number: 19845040,
            timestamp_utc: "2026-10-10T14:28:00Z".to_string(),
        },
    ]
}
