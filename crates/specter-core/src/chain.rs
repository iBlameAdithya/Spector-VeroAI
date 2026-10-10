//! Multi-Chain Address Auto-Detection & Format Resolution
//!
//! Identifies blockchain networks (TRON, Ethereum/EVM, Bitcoin, Solana) from address syntax.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ChainType {
    Tron,
    Ethereum,
    Bitcoin,
    Solana,
    Polygon,
    BnbChain,
    Unknown,
}

impl ChainType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ChainType::Tron => "tron",
            ChainType::Ethereum => "ethereum",
            ChainType::Bitcoin => "bitcoin",
            ChainType::Solana => "solana",
            ChainType::Polygon => "polygon",
            ChainType::BnbChain => "bnb",
            ChainType::Unknown => "unknown",
        }
    }
}

pub struct ChainDetector;

impl ChainDetector {
    /// Detect blockchain network from raw address string
    pub fn detect(address: &str) -> ChainType {
        let trimmed = address.trim();

        // TRON: Base58 starting with 'T', 34 characters
        if trimmed.starts_with('T') && trimmed.len() == 34 && Self::is_base58(trimmed) {
            return ChainType::Tron;
        }

        // EVM / Ethereum / Polygon / BNB: starts with "0x" and is 42 chars long (20 bytes hex)
        if trimmed.starts_with("0x") || trimmed.starts_with("0X") {
            let hex_part = &trimmed[2..];
            if hex_part.len() == 40 && hex_part.chars().all(|c| c.is_ascii_hexdigit()) {
                return ChainType::Ethereum;
            }
        }

        // Bitcoin:
        // Bech32: starts with "bc1", len 42 or 62
        // Legacy: starts with '1', len 26-35
        // Script: starts with '3', len 26-35
        if trimmed.starts_with("bc1") && (trimmed.len() == 42 || trimmed.len() == 62) {
            return ChainType::Bitcoin;
        }
        if (trimmed.starts_with('1') || trimmed.starts_with('3'))
            && (26..=35).contains(&trimmed.len())
            && Self::is_base58(trimmed)
        {
            return ChainType::Bitcoin;
        }

        // Solana: Base58 string, 32 to 44 characters
        if (32..=44).contains(&trimmed.len()) && Self::is_base58(trimmed) {
            return ChainType::Solana;
        }

        ChainType::Unknown
    }

    #[inline]
    fn is_base58(s: &str) -> bool {
        // Base58 alphabet excludes 0, O, I, l
        const B58_CHARS: &str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        s.chars().all(|c| B58_CHARS.contains(c))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chain_detection() {
        // TRON
        assert_eq!(
            ChainDetector::detect("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"),
            ChainType::Tron
        );
        // EVM
        assert_eq!(
            ChainDetector::detect("0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9"),
            ChainType::Ethereum
        );
        // Bitcoin
        assert_eq!(
            ChainDetector::detect("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"),
            ChainType::Bitcoin
        );
        assert_eq!(
            ChainDetector::detect("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"),
            ChainType::Bitcoin
        );
    }
}
