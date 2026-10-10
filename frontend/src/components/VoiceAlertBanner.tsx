import React, { useState } from 'react';
import { Volume2, Play, Radio } from 'lucide-react';
import type { VoiceAlertPayload } from '../api';
import { api } from '../api';

interface VoiceAlertBannerProps {
  alert: VoiceAlertPayload | null;
  caseId: string;
}

export const VoiceAlertBanner: React.FC<VoiceAlertBannerProps> = ({ alert, caseId }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVoice = () => {
    setIsPlaying(true);

    // 1. Play synthesized tactical chime
    try {
      const chime = new Audio(api.getVoiceChimeUrl());
      chime.play().catch(e => console.warn('Chime play notice:', e));
    } catch (e) {
      console.warn('Audio notice:', e);
    }

    // 2. Play speech using Web Speech API in browser for zero latency
    if ('speechSynthesis' in window && alert?.transcript) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(alert.transcript);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 4500);
    }
  };

  if (!alert) return null;

  return (
    <div className="bg-gradient-to-r from-specter-card via-specter-darkest to-specter-card border border-specter-gold/30 rounded-xl p-4 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-specter-gold/10 border border-specter-gold/30 flex items-center justify-center text-specter-gold shrink-0">
            <Volume2 className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-specter-gold" />
                TACTICAL VOICE ALERT DISPATCH ({caseId})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-specter-emerald/15 text-specter-emerald border border-specter-emerald/30">
                {alert.latency_ms}ms DISPATCH
              </span>
              <span className="text-[10px] font-mono text-specter-crimson font-bold uppercase hidden sm:inline">
                [{alert.priority_level}]
              </span>
            </div>
            <p className="text-xs text-gray-300 font-sans italic mt-1 leading-relaxed">
              &ldquo;{alert.transcript}&rdquo;
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            onClick={handlePlayVoice}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-specter-gold/15 hover:bg-specter-gold/25 border border-specter-gold/40 text-specter-gold text-xs font-mono font-bold transition-all shadow-sm hover:shadow-neon-gold disabled:opacity-50"
          >
            {isPlaying ? (
              <>
                <span className="h-2 w-2 rounded-full bg-specter-gold animate-ping"></span>
                <span>BROADCASTING...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>PLAY TACTICAL VOICE ALERT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
