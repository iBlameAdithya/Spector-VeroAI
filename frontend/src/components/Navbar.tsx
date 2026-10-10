import React from 'react';
import { Shield, Zap, Radio, Globe, Volume2, ExternalLink } from 'lucide-react';
import type { HealthResponse } from '../api';
import { api } from '../api';

interface NavbarProps {
  health: HealthResponse | null;
  onPlayChime?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ health, onPlayChime }) => {
  const playChimeFallback = () => {
    try {
      const audio = new Audio(api.getVoiceChimeUrl());
      audio.play().catch(e => console.warn('Audio play notice:', e));
    } catch (err) {
      console.warn('Audio notice:', err);
    }
  };

  return (
    <header className="border-b border-specter-border bg-specter-bg/95 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-specter-gold/20 via-specter-card to-specter-emerald/20 border border-specter-gold/40 flex items-center justify-center shadow-neon-gold">
            <Shield className="h-5 w-5 text-specter-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-white font-mono">
                SPECTER
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-specter-emerald/10 border border-specter-emerald/30 text-specter-emerald">
                RUST CORE v1.0
              </span>
            </div>
            <p className="text-xs text-specter-muted font-sans hidden sm:block">
              Autonomous On-Chain Incident Response &amp; Human-in-the-Loop Asset Freeze
            </p>
          </div>
        </div>

        {/* Telemetry and Controls */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs font-mono">
          {/* Status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-specter-card border border-specter-border">
            <span className="h-2 w-2 rounded-full bg-specter-emerald animate-pulse"></span>
            <span className="text-specter-muted">ENGINE:</span>
            <span className="text-specter-emerald font-semibold">
              {health?.status || 'ONLINE'}
            </span>
          </div>

          {/* System 1 latency */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-specter-card border border-specter-border">
            <Zap className="h-3.5 w-3.5 text-specter-emerald" />
            <span className="text-specter-muted">P99 REFLEX:</span>
            <span className="text-specter-emerald font-bold">
              {health ? `${health.system1_latency_p99_us} µs` : '48 µs'}
            </span>
          </div>

          {/* MCP Protocol Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-specter-card border border-specter-border">
            <Radio className="h-3.5 w-3.5 text-specter-cyan" />
            <span className="text-specter-muted">MCP:</span>
            <span className="text-specter-cyan font-semibold">
              {health?.mcp_server_status || 'READY'}
            </span>
          </div>

          {/* Browser Actor */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-specter-card border border-specter-border">
            <Globe className="h-3.5 w-3.5 text-specter-gold" />
            <span className="text-specter-muted">AGENT:</span>
            <span className="text-specter-gold font-semibold">
              PLAYWRIGHT
            </span>
          </div>

          {/* Audio Chime Trigger */}
          <button
            onClick={onPlayChime || playChimeFallback}
            title="Play Ultra-Low-Latency Dual-Tone Alert Chime"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-specter-card hover:bg-specter-hover border border-specter-border hover:border-specter-gold text-specter-muted hover:text-specter-gold transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>CHIME</span>
          </button>

          {/* Compliance Portal External Link */}
          <a
            href="http://localhost:3000/exchange/compliance-portal"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Mock Exchange Portal in browser"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-specter-gold/10 hover:bg-specter-gold/20 border border-specter-gold/30 text-specter-gold transition-colors"
          >
            <span>PORTAL</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </header>
  );
};
