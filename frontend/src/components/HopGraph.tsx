import React, { useState } from 'react';
import type { ForensicGraph, GraphNode } from '../api';
import { Network, ShieldCheck, Wallet, Copy, Check } from 'lucide-react';

interface HopGraphProps {
  graph: ForensicGraph | null;
  onSelectNode?: (node: GraphNode) => void;
}

export const HopGraph: React.FC<HopGraphProps> = ({ graph, onSelectNode }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="bg-specter-card border border-specter-border rounded-xl p-8 text-center">
        <Network className="h-12 w-12 text-specter-muted mx-auto mb-3 opacity-40 animate-pulse" />
        <h3 className="text-sm font-mono text-white font-semibold">AWAITING ON-CHAIN TRACE DATA</h3>
        <p className="text-xs text-specter-muted mt-1 max-w-sm mx-auto">
          Execute a forensic trace above to render the multi-hop peel chain DAG and terminal VASP attribution.
        </p>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId) || graph.nodes[graph.nodes.length - 1];

  // Calculate layout positions for nodes
  const trunkNodes = graph.nodes.filter((n) => n.type === 'victim' || n.type === 'vasp' || !n.label.includes('Fee'));
  const feeNodes = graph.nodes.filter((n) => n.label.includes('Fee') || n.balance <= 500);

  const nodePositions = new Map<string, { x: number; y: number }>();

  const width = 960;
  const height = 340;
  const paddingX = 80;
  const trunkY = 220;
  const feeY = 75;

  const trunkStep = (width - paddingX * 2) / Math.max(1, trunkNodes.length - 1);

  trunkNodes.forEach((node, idx) => {
    nodePositions.set(node.id, {
      x: paddingX + idx * trunkStep,
      y: trunkY,
    });
  });

  feeNodes.forEach((node, idx) => {
    const matchedEdge = graph.edges.find((e) => e.to === node.id);
    let xPos = paddingX + (idx + 0.5) * trunkStep;
    if (matchedEdge && nodePositions.has(matchedEdge.from)) {
      xPos = nodePositions.get(matchedEdge.from)!.x + trunkStep * 0.45;
    }
    nodePositions.set(node.id, {
      x: xPos,
      y: feeY,
    });
  });

  return (
    <div className="bg-specter-card border border-specter-border rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Network className="h-4 w-4 text-specter-cyan" />
            DIRECTED FORENSIC PEEL-CHAIN DAG
          </h2>
          <p className="text-xs text-specter-muted mt-0.5">
            Interactive multi-hop graph showing trunk volume forwarding (&ge;85%) and detachment of operational peel fees.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-specter-crimson"></span>
            <span className="text-specter-muted">Victim</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-specter-gold"></span>
            <span className="text-specter-muted">Peel / Mule</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-specter-cyan"></span>
            <span className="text-specter-muted">Exit VASP</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative w-full overflow-x-auto bg-specter-darkest border border-specter-border rounded-lg p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[720px] h-[320px] select-none"
        >
          <defs>
            {/* Arrow markers */}
            <marker
              id="arrow-trunk"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00f0ff" />
            </marker>
            <marker
              id="arrow-peel"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#848e9c" />
            </marker>

            {/* Linear gradients */}
            <linearGradient id="grad-trunk" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f6465d" />
              <stop offset="50%" stopColor="#f0b90b" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>
          </defs>

          {/* Render Edges */}
          {graph.edges.map((edge, idx) => {
            const start = nodePositions.get(edge.from);
            const end = nodePositions.get(edge.to);
            if (!start || !end) return null;

            const isTrunk = edge.is_trunk;
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2 - (isTrunk ? 14 : 10);

            const d = isTrunk
              ? `M ${start.x} ${start.y} L ${end.x} ${end.y}`
              : `M ${start.x} ${start.y} Q ${midX} ${start.y - 40} ${end.x} ${end.y}`;

            return (
              <g key={`edge-${idx}`}>
                {/* Edge line */}
                <path
                  d={d}
                  fill="none"
                  stroke={isTrunk ? '#00f0ff' : '#4b5563'}
                  strokeWidth={isTrunk ? 3 : 1.5}
                  strokeDasharray={isTrunk ? 'none' : '4,4'}
                  markerEnd={isTrunk ? 'url(#arrow-trunk)' : 'url(#arrow-peel)'}
                  className={isTrunk ? 'filter drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]' : ''}
                />

                {/* Animated particle flow over trunk edges */}
                {isTrunk && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    className="animate-flow-trunk opacity-70"
                  />
                )}

                {/* Edge Amount Badge */}
                <rect
                  x={midX - 36}
                  y={midY - 10}
                  width="72"
                  height="18"
                  rx="4"
                  fill="#12161c"
                  stroke={isTrunk ? '#00f0ff' : '#374151'}
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill={isTrunk ? '#00f0ff' : '#9ca3af'}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  ${edge.amount >= 1000 ? `${(edge.amount / 1000).toFixed(1)}k` : `${edge.amount}`}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {graph.nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id || (!selectedNodeId && node.type === 'vasp');
            const isVictim = node.type === 'victim';
            const isVasp = node.type === 'vasp';
            const isPeelFee = node.label.includes('Fee');

            let nodeColor = '#f0b90b';
            if (isVictim) nodeColor = '#f6465d';
            if (isVasp) nodeColor = '#00f0ff';
            if (isPeelFee) nodeColor = '#6b7280';

            const radius = isVasp ? 26 : isVictim ? 24 : isPeelFee ? 16 : 22;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
              >
                {/* Selection halo */}
                {isSelected && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="animate-spin opacity-80"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Outer Glow */}
                <circle
                  r={radius}
                  fill="#12161c"
                  stroke={nodeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="filter drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                />

                {/* Inner Icon representation */}
                <circle r={radius - 6} fill={`${nodeColor}22`} />

                {/* Label inside node */}
                <text
                  y={4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isPeelFee ? '9' : '11'}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  {isVictim ? 'VIC' : isVasp ? 'VASP' : isPeelFee ? 'FEE' : 'MULE'}
                </text>

                {/* Node subtitle text under node */}
                <text
                  y={radius + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#9ca3af'}
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                </text>

                {/* Balance under subtitle */}
                <text
                  y={radius + 28}
                  textAnchor="middle"
                  fill={nodeColor}
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  ${node.balance.toLocaleString()} USDT
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-lg bg-specter-darkest/90 border border-specter-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${
              selectedNode.type === 'vasp'
                ? 'bg-specter-cyan/10 border-specter-cyan/30 text-specter-cyan'
                : selectedNode.type === 'victim'
                ? 'bg-specter-crimson/10 border-specter-crimson/30 text-specter-crimson'
                : 'bg-specter-gold/10 border-specter-gold/30 text-specter-gold'
            }`}>
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedNode.label}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-specter-card border border-specter-border text-specter-muted uppercase">
                  {selectedNode.type}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-specter-muted text-[11px]">
                <span className="truncate max-w-[280px] sm:max-w-md">{selectedNode.id}</span>
                <button
                  onClick={() => handleCopy(selectedNode.id)}
                  className="text-specter-cyan hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copiedId === selectedNode.id ? <Check className="h-3 w-3 text-specter-emerald" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 w-full md:w-auto justify-end">
            <div className="bg-specter-card px-3 py-1.5 rounded border border-specter-border">
              <span className="text-specter-muted text-[10px] block">NODE BALANCE</span>
              <span className="text-white font-bold">${selectedNode.balance.toLocaleString()} USDT</span>
            </div>

            <div className="bg-specter-card px-3 py-1.5 rounded border border-specter-border">
              <span className="text-specter-muted text-[10px] block">RISK SCORE</span>
              <span className={`font-bold ${selectedNode.risk_score > 70 ? 'text-specter-crimson' : 'text-specter-emerald'}`}>
                {selectedNode.risk_score.toFixed(1)} / 100
              </span>
            </div>

            {selectedNode.type === 'vasp' && (
              <div className="bg-specter-emerald/10 border border-specter-emerald/40 px-3 py-1.5 rounded text-specter-emerald font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>TERMINAL EXIT TARGET</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
