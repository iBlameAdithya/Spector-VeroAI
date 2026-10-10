import React from 'react';
import type { VelocityAnalysis } from '../api';
import { Activity, Clock, AlertTriangle, TrendingUp, BarChart2 } from 'lucide-react';

interface VelocityCardProps {
  velocity: VelocityAnalysis | null;
}

export const VelocityCard: React.FC<VelocityCardProps> = ({ velocity }) => {
  if (!velocity) return null;

  return (
    <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-specter-gold/10 border border-specter-gold/30 text-specter-gold">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">
                VELOCITY &amp; BURST LIQUIDATION ANALYTICS
              </h2>
              <p className="text-[11px] text-specter-muted font-sans">
                Inter-hop time delta (&Delta;t) analysis and automated drainer bot signature detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-specter-crimson/15 border border-specter-crimson/40 text-specter-crimson text-xs font-mono font-bold animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{velocity.burst_velocity_category}</span>
          </div>
        </div>

        {/* Highlight Banner: Liquidation ETA & Velocity Risk Score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Liquidation ETA */}
          <div className="bg-gradient-to-br from-specter-crimson/15 via-specter-darkest to-specter-darkest border border-specter-crimson/30 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-specter-muted mb-1">
              <span className="flex items-center gap-1 text-specter-crimson font-bold">
                <Clock className="h-3.5 w-3.5" />
                <span>OFF-RAMP LIQUIDATION ETA</span>
              </span>
              <span className="text-[10px] text-specter-muted">CRITICAL</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">
                ~{velocity.estimated_liquidation_eta_minutes} MINS
              </span>
              <span className="text-xs text-specter-crimson font-mono font-bold">
                (URGENT FREEZE WINDOW)
              </span>
            </div>
          </div>

          {/* Velocity Risk Score */}
          <div className="bg-specter-darkest/80 border border-specter-border rounded-lg p-3.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-specter-muted mb-1">
              <span className="flex items-center gap-1 text-specter-gold font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>VELOCITY RISK SCORE</span>
              </span>
              <span className="text-[10px]">HOP RATE</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">
                {velocity.velocity_risk_score.toFixed(1)} / 100
              </span>
              <span className="text-xs text-specter-gold font-mono font-bold">
                HIGH BURST THREAT
              </span>
            </div>
          </div>
        </div>

        {/* Delta-T Hop Gap Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4 font-mono text-center">
          <div className="bg-specter-darkest/60 border border-specter-border rounded p-2">
            <span className="text-[10px] text-specter-muted block">MIN &Delta;t</span>
            <span className="text-xs font-bold text-white">
              {velocity.min_delta_t_seconds ? `${velocity.min_delta_t_seconds}s` : 'N/A'}
            </span>
          </div>
          <div className="bg-specter-darkest/60 border border-specter-border rounded p-2">
            <span className="text-[10px] text-specter-muted block">AVG &Delta;t</span>
            <span className="text-xs font-bold text-specter-cyan">
              {velocity.avg_delta_t_seconds ? `${velocity.avg_delta_t_seconds}s` : 'N/A'}
            </span>
          </div>
          <div className="bg-specter-darkest/60 border border-specter-border rounded p-2">
            <span className="text-[10px] text-specter-muted block">MAX &Delta;t</span>
            <span className="text-xs font-bold text-white">
              {velocity.max_delta_t_seconds ? `${velocity.max_delta_t_seconds}s` : 'N/A'}
            </span>
          </div>
          <div className="bg-specter-darkest/60 border border-specter-border rounded p-2">
            <span className="text-[10px] text-specter-muted block">TOTAL SPAN</span>
            <span className="text-xs font-bold text-specter-gold">
              {Math.round(velocity.total_duration_seconds / 60)} mins
            </span>
          </div>
        </div>

        {/* Rolling Time Windows Volume Dispersal */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-specter-muted mb-2">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5 text-specter-cyan" />
              <span>ROLLING TIME WINDOW VOLUME CONVERGENCE</span>
            </span>
            <span className="text-[10px]">CUMULATIVE %</span>
          </div>
          <div className="space-y-2">
            {velocity.rolling_windows.map((win) => (
              <div key={win.window_label} className="font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-gray-300 font-bold">{win.window_label} Window</span>
                  <div className="flex items-center gap-2">
                    <span className="text-specter-muted">${win.volume_usd.toLocaleString()}</span>
                    <span className="text-specter-cyan font-bold">{win.percentage_of_total.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-specter-darkest rounded-full overflow-hidden border border-specter-border/80">
                  <div
                    className="h-full bg-gradient-to-r from-specter-cyan to-specter-emerald rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(4, win.percentage_of_total))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
