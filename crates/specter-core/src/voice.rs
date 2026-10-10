//! Ultra-Low-Latency Voice Alert & Dispatch Engine
//!
//! Generates sub-10ms incident voice telemetry and audio dispatches for urgent asset freeze alerts.
//! Implements pure-Rust PCM/WAV audio synthesis and Windows SAPI speech triggers for live presentations.

use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceAlertPayload {
    pub case_id: String,
    pub transcript: String,
    pub audio_format: String, // "audio/wav"
    pub duration_seconds: f32,
    pub latency_ms: u64,
    pub priority_level: String, // "CRITICAL_INTERVENTION_REQUIRED"
}

pub struct VoiceAlertDispatcher;

impl VoiceAlertDispatcher {
    /// Formats the official tactical voice dispatch transcript
    pub fn build_transcript(
        case_id: &str,
        vasp_name: &str,
        amount_usd: f64,
        latency_us: u64,
        eta_minutes: u64,
    ) -> String {
        format!(
            "SPECTER Priority Alert. Case Ref {case_id}. \
            System One reflex gate matched in {latency_us} microseconds. \
            Illicit value of ${amount_usd:.0} dollars USDT detected peeling towards {vasp_name}. \
            Estimated liquidation window is {eta_minutes} minutes. \
            Agent browser prefill complete. Awaiting authorized officer signature."
        )
    }

    /// Generates a valid 16-bit PCM WAV audio byte buffer with tactical alert chimes
    pub fn synthesize_alert_chime(sample_rate: u32, duration_secs: f32) -> Vec<u8> {
        let num_samples = (sample_rate as f32 * duration_secs) as usize;
        let mut pcm_samples: Vec<i16> = Vec::with_capacity(num_samples);

        // Synthesize a tactical dual-tone chime (880 Hz A5 & 1320 Hz E6) with exponential decay
        for i in 0..num_samples {
            let t = i as f32 / sample_rate as f32;
            let decay = (-3.5 * t).exp();
            let tone1 = (2.0 * std::f32::consts::PI * 880.0 * t).sin();
            let tone2 = (2.0 * std::f32::consts::PI * 1320.0 * t).sin();
            let mixed = (tone1 * 0.6 + tone2 * 0.4) * decay;
            let sample = (mixed * 24000.0).clamp(-32768.0, 32767.0) as i16;
            pcm_samples.push(sample);
        }

        // Build standard 44-byte RIFF/WAV header
        let byte_rate = sample_rate * 2; // 1 channel * 16-bit (2 bytes)
        let block_align = 2u16;
        let bits_per_sample = 16u16;
        let data_size = (pcm_samples.len() * 2) as u32;
        let riff_chunk_size = 36 + data_size;

        let mut wav = Vec::with_capacity(44 + pcm_samples.len() * 2);

        // RIFF header
        wav.extend_from_slice(b"RIFF");
        wav.extend_from_slice(&riff_chunk_size.to_le_bytes());
        wav.extend_from_slice(b"WAVE");

        // "fmt " sub-chunk
        wav.extend_from_slice(b"fmt ");
        wav.extend_from_slice(&16u32.to_le_bytes()); // SubChunk1Size (16 for PCM)
        wav.extend_from_slice(&1u16.to_le_bytes()); // AudioFormat (1 for PCM)
        wav.extend_from_slice(&1u16.to_le_bytes()); // NumChannels (1 mono)
        wav.extend_from_slice(&sample_rate.to_le_bytes());
        wav.extend_from_slice(&byte_rate.to_le_bytes());
        wav.extend_from_slice(&block_align.to_le_bytes());
        wav.extend_from_slice(&bits_per_sample.to_le_bytes());

        // "data" sub-chunk
        wav.extend_from_slice(b"data");
        wav.extend_from_slice(&data_size.to_le_bytes());

        // Audio sample bytes
        for s in pcm_samples {
            wav.extend_from_slice(&s.to_le_bytes());
        }

        wav
    }

    /// Spawns background Windows SAPI speech synthesis for live stage demo
    pub fn speak_live_alert(text: &str) {
        #[cfg(target_os = "windows")]
        {
            let clean_text = text.replace(['"', '\''], "");
            let ps_script = format!(
                "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('{}')",
                clean_text
            );

            let _ = Command::new("powershell")
                .arg("-NoProfile")
                .arg("-Command")
                .arg(ps_script)
                .spawn();
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wav_audio_synthesis() {
        let wav = VoiceAlertDispatcher::synthesize_alert_chime(44100, 0.5);
        assert!(wav.len() > 44);
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..12], b"WAVE");
        assert_eq!(&wav[12..16], b"fmt ");
        assert_eq!(&wav[36..40], b"data");
    }

    #[test]
    fn test_transcript_formatting() {
        let t = VoiceAlertDispatcher::build_transcript(
            "SPECTER-2026-9921",
            "Binance",
            149000.0,
            48,
            25,
        );
        assert!(t.contains("SPECTER-2026-9921"));
        assert!(t.contains("48 microseconds"));
        assert!(t.contains("Binance"));
    }
}
