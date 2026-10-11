import { useState, useMemo, useEffect, useRef } from 'react';
import type { ForensicGraph, GraphNode, TerminalStatus } from '../types/api';
import {
  Building2,
  ArrowRight,
  Maximize2,
  Copy,
  Check,
  Zap,
  ExternalLink,
  DollarSign,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Info,
  X,
  HelpCircle,
  Wallet,
  Layers,
} from 'lucide-react';
import { getTronscanAddressUrl, getTronscanTxUrl } from '../utils/explorer';

interface FundFlowGraphProps {
  graph: ForensicGraph;
  hopsTraversed?: number;
  chain?: string;
  terminalStatus?: TerminalStatus | null;
  terminalWallet?: string | null;
}

interface AggregatedEdge {
  id: string;
  from: string;
  to: string;
  totalAmount: number;
  transferCount: number;
  isTrunk: boolean;
  transactions: { tx: string; amount: number }[];
}

export const FundFlowGraph: React.FC<FundFlowGraphProps> = ({
  graph,
  hopsTraversed,
  terminalStatus,
  terminalWallet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<AggregatedEdge | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // RESET all local graph selection state when a new graph prop arrives
  useEffect(() => {
    setSelectedNodeId(null);
    setSelectedEdge(null);
    setZoomLevel(1);
  }, [graph]);

  // Aggregate edges between the same (from, to) pair into single clean flow connections
  const aggregatedEdges = useMemo(() => {
    const edgeMap: Record<string, AggregatedEdge> = {};

    graph.edges.forEach((e) => {
      const key = `${e.from}--->${e.to}`;
      if (!edgeMap[key]) {
        edgeMap[key] = {
          id: key,
          from: e.from,
          to: e.to,
          totalAmount: e.amount || 0,
          transferCount: 1,
          isTrunk: e.is_trunk,
          transactions: [{ tx: e.tx, amount: e.amount || 0 }],
        };
      } else {
        edgeMap[key].totalAmount += e.amount || 0;
        edgeMap[key].transferCount += 1;
        if (e.is_trunk) edgeMap[key].isTrunk = true;
        edgeMap[key].transactions.push({ tx: e.tx, amount: e.amount || 0 });
      }
    });

    return Object.values(edgeMap);
  }, [graph.edges]);

  // Compute Layout Positions (DAG Layering)
  const { nodePositions, width, height } = useMemo(() => {
    const nodes = graph.nodes;
    const edges = graph.edges;

    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};
    nodes.forEach((n) => {
      inDegree[n.id] = 0;
      outDegree[n.id] = 0;
    });

    edges.forEach((e) => {
      outDegree[e.from] = (outDegree[e.from] || 0) + 1;
      inDegree[e.to] = (inDegree[e.to] || 0) + 1;
    });

    const nodeLayer: Record<string, number> = {};

    nodes.forEach((n) => {
      if (n.type === 'victim' || n.type === 'clean' || inDegree[n.id] === 0) {
        nodeLayer[n.id] = 0;
      }
    });

    let maxLayer = 0;
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 15) {
      changed = false;
      iterations++;
      edges.forEach((e) => {
        const fromLayer = nodeLayer[e.from];
        if (fromLayer !== undefined) {
          const targetLayer = fromLayer + 1;
          if (nodeLayer[e.to] === undefined || nodeLayer[e.to] < targetLayer) {
            nodeLayer[e.to] = targetLayer;
            if (targetLayer > maxLayer) maxLayer = targetLayer;
            changed = true;
          }
        }
      });
    }

    nodes.forEach((n) => {
      if (n.type === 'vasp') {
        nodeLayer[n.id] = Math.max(maxLayer, nodeLayer[n.id] || 0);
      }
      if (nodeLayer[n.id] === undefined) {
        nodeLayer[n.id] = 1;
      }
    });

    const layerGroups: Record<number, GraphNode[]> = {};
    nodes.forEach((n) => {
      const l = nodeLayer[n.id] || 0;
      if (!layerGroups[l]) layerGroups[l] = [];
      layerGroups[l].push(n);
    });

    const totalLayers = Math.max(...Object.keys(layerGroups).map(Number), 0) + 1;
    const layerSpacingX = 280;
    const nodeSpacingY = 110;

    const maxNodesInLayer = Math.max(...Object.values(layerGroups).map((g) => g.length), 1);

    const canvasWidth = Math.max(950, totalLayers * layerSpacingX + 100);
    const canvasHeight = Math.max(400, maxNodesInLayer * nodeSpacingY + 100);

    const positions: Record<string, { x: number; y: number }> = {};

    Object.entries(layerGroups).forEach(([layerStr, layerNodes]) => {
      const layerIdx = Number(layerStr);
      const x = 50 + layerIdx * layerSpacingX;

      const columnHeight = layerNodes.length * nodeSpacingY;
      const startY = (canvasHeight - columnHeight) / 2 + nodeSpacingY / 2;

      layerNodes.forEach((node, nodeIdx) => {
        positions[node.id] = {
          x,
          y: startY + nodeIdx * nodeSpacingY,
        };
      });
    });

    return {
      nodePositions: positions,
      width: canvasWidth,
      height: canvasHeight,
    };
  }, [graph]);

  const selectedNode = useMemo(() => {
    return graph.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [graph.nodes, selectedNodeId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatHash = (h: string) => {
    if (!h) return 'N/A';
    if (h.length <= 12) return h;
    return `${h.slice(0, 5)}...${h.slice(-4)}`;
  };

  const isTerminalNode = (nodeId: string) => {
    if (!terminalWallet) return false;
    return nodeId.trim().toLowerCase() === terminalWallet.trim().toLowerCase();
  };

  const getNodeRoleLabel = (node: GraphNode) => {
    if (node.type === 'clean') return 'Queried Wallet (Clean)';
    if (node.type === 'victim') return 'Starting Wallet';

    if (isTerminalNode(node.id)) {
      if (terminalStatus === 'VASP_TERMINAL') {
        return node.label || 'VASP / Exchange Endpoint';
      }
      if (terminalStatus === 'HOLDING_WALLET') {
        return 'Holding Wallet (Terminal)';
      }
      if (terminalStatus === 'TRACE_DEPTH_REACHED') {
        return 'Trace Depth Wallet';
      }
      return 'Terminal Wallet';
    }

    if (node.type === 'vasp') {
      if (terminalStatus === 'VASP_TERMINAL') {
        return node.label || 'VASP / Exchange';
      }
      // Never infer that this is a destination exchange if backend hasn't flagged VASP_TERMINAL
      return node.label || 'Associated Cluster';
    }

    return 'Intermediate Wallet';
  };

  const getWalletTransferCount = (walletId: string) => {
    let count = 0;
    graph.edges.forEach((e) => {
      if (e.from === walletId || e.to === walletId) {
        count++;
      }
    });
    return count;
  };

  const handleFitView = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const fitZoom = Math.min(1.2, Math.max(0.6, containerWidth / (width + 40)));
      setZoomLevel(fitZoom);
    }
  };

  const actualTotalTransfers = graph.edges.length;
  const uniqueWalletCount = graph.nodes.length;
  const actualDepth = hopsTraversed ?? Math.max(0, Object.keys(nodePositions).length - 1);

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs mb-4 font-sans text-xs relative overflow-hidden">
      {/* 1. Main Graph Header */}
      <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              HOW THE MONEY MOVED
            </h2>
            <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded border border-blue-200">
              <span>{actualTotalTransfers} transfers traced</span>
              <span>•</span>
              <span>{uniqueWalletCount} wallets identified</span>
              <span>•</span>
              <span className="flex items-center gap-1" title="Depth shows how many wallet-to-wallet steps the investigation followed.">
                <span>{actualDepth} maximum depth</span>
                <HelpCircle className="w-3 h-3 text-blue-600" />
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Shows how funds moved between wallets during this investigation.
          </p>
        </div>

        {/* Minimal Graph Controls: [ Fit ] [ + ] [ − ] */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={handleFitView}
            className="px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded font-semibold transition-colors flex items-center gap-1"
            title="Fit graph to available space"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Fit</span>
          </button>

          <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold transition-colors"
              title="Zoom Out (−)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-slate-700 font-bold border-x border-slate-200">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Graph Canvas Workspace / Empty State */}
      {graph.edges.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/80 min-h-[260px] flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <h4 className="text-xs font-bold font-mono text-slate-900 uppercase tracking-wide mb-1">
            NO OUTGOING MOVEMENT IDENTIFIED
          </h4>
          <p className="text-xs text-slate-600 max-w-md font-sans leading-relaxed">
            No outgoing movement was identified in the available investigation data for this wallet on the public ledger.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div ref={containerRef} className="overflow-auto bg-slate-50/60 min-h-[440px] max-h-[640px] select-none">
            <div
              className="transition-transform duration-150 origin-top-left p-6"
              style={{ transform: `scale(${zoomLevel})`, width: `${width}px`, height: `${height}px` }}
            >
              <svg width={width} height={height} className="absolute inset-0 pointer-events-none">
                <defs>
                  <marker
                    id="arrow-trunk"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                  </marker>

                  <marker
                    id="arrow-peel"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                  </marker>
                </defs>

                {/* Render Aggregated Edge Connections */}
                {aggregatedEdges.map((edge) => {
                  const fromPos = nodePositions[edge.from];
                  const toPos = nodePositions[edge.to];
                  if (!fromPos || !toPos) return null;

                  const startX = fromPos.x + 210;
                  const startY = fromPos.y;
                  const endX = toPos.x;
                  const endY = toPos.y;

                  const deltaX = Math.max(30, Math.abs(endX - startX) / 2);
                  const pathD = `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;

                  const midX = (startX + endX) / 2;
                  const midY = (startY + endY) / 2;

                  const isSelectedEdge = selectedEdge?.id === edge.id;

                  return (
                    <g key={edge.id}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isSelectedEdge ? '#1d4ed8' : edge.isTrunk ? '#2563eb' : '#94a3b8'}
                        strokeWidth={isSelectedEdge ? 3 : edge.isTrunk ? 2.5 : 1.5}
                        strokeDasharray={edge.isTrunk ? undefined : '4 3'}
                        markerEnd={edge.isTrunk ? 'url(#arrow-trunk)' : 'url(#arrow-peel)'}
                      />

                      {/* Edge Label Badge */}
                      <foreignObject
                        x={midX - 55}
                        y={midY - 12}
                        width={110}
                        height={24}
                        className="pointer-events-auto"
                      >
                        <button
                          onClick={() => {
                            setSelectedEdge(edge);
                            setSelectedNodeId(null);
                          }}
                          className={`w-full px-1.5 py-0.5 rounded text-[10px] font-mono text-center shadow-2xs border transition-all cursor-pointer truncate ${
                            isSelectedEdge
                              ? 'bg-blue-600 text-white border-blue-700 font-bold ring-2 ring-blue-300'
                              : edge.isTrunk
                              ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold hover:bg-blue-100'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                          title={`Click to inspect transfer: $${edge.totalAmount.toLocaleString()} (${edge.transferCount} transfer${edge.transferCount > 1 ? 's' : ''})`}
                        >
                          <span>
                            ${edge.totalAmount.toLocaleString()}
                            {edge.transferCount > 1 && ` (${edge.transferCount})`}
                          </span>
                        </button>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>

              {/* Render Wallet Nodes */}
              {graph.nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;

                const isSelected = selectedNodeId === node.id;

                const isTerminal = isTerminalNode(node.id);

                let badgeBg = 'bg-slate-100 text-slate-800 border-slate-300';
                let icon = <ArrowRight className="w-3 h-3 text-slate-600" />;

                if (node.type === 'clean') {
                  badgeBg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                  icon = <CheckCircle2 className="w-3 h-3 text-emerald-700" />;
                } else if (node.type === 'victim') {
                  badgeBg = 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
                  icon = <Zap className="w-3 h-3 text-indigo-700" />;
                } else if (isTerminal && terminalStatus === 'VASP_TERMINAL') {
                  badgeBg = 'bg-blue-100 text-blue-900 border-blue-400 font-bold';
                  icon = <Building2 className="w-3 h-3 text-blue-700" />;
                } else if (isTerminal && terminalStatus === 'HOLDING_WALLET') {
                  badgeBg = 'bg-slate-200 text-slate-900 border-slate-400 font-bold';
                  icon = <Wallet className="w-3 h-3 text-slate-800" />;
                } else if (isTerminal && terminalStatus === 'TRACE_DEPTH_REACHED') {
                  badgeBg = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
                  icon = <Layers className="w-3 h-3 text-amber-800" />;
                } else if (node.type === 'vasp' && terminalStatus === 'VASP_TERMINAL') {
                  badgeBg = 'bg-blue-100 text-blue-900 border-blue-400 font-bold';
                  icon = <Building2 className="w-3 h-3 text-blue-700" />;
                }

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setSelectedEdge(null);
                    }}
                    style={{ left: `${pos.x}px`, top: `${pos.y - 32}px` }}
                    className={`absolute w-[210px] bg-white rounded border p-2 shadow-2xs cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/20'
                        : isTerminal
                        ? 'border-blue-500 bg-blue-50/10 ring-1 ring-blue-400'
                        : node.type === 'victim'
                        ? 'border-indigo-400 bg-indigo-50/10'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 font-mono">
                      <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded border flex items-center gap-1 font-semibold ${badgeBg}`}>
                        {icon}
                        <span className="truncate max-w-[130px]">{getNodeRoleLabel(node)}</span>
                      </span>
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-900 truncate mb-0.5" title={node.id}>
                      {formatHash(node.id)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-100 pt-1 text-slate-600">
                      <span className="text-slate-400">AMOUNT:</span>
                      <span className="font-bold text-slate-900">
                        ${node.balance.toLocaleString()} USDT
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. RIGHT-SIDE WALLET DETAILS DRAWER */}
          {selectedNode && (
            <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col font-sans transition-all">
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-mono">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900">
                    WALLET DETAILS
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded font-bold text-xs transition-colors"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 space-y-4 font-sans text-xs flex-1 overflow-y-auto">
                {/* Role */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    ROLE
                  </span>
                  <div className="font-bold text-slate-900 text-xs font-sans">
                    {getNodeRoleLabel(selectedNode)}
                  </div>
                </div>

                {/* Short Address */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    WALLET ADDRESS (SHORT)
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-xs bg-slate-50 p-2 rounded border border-slate-200">
                    {formatHash(selectedNode.id)}
                  </div>
                </div>

                {/* Transfers Associated */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    TRANSFERS ASSOCIATED
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    {getWalletTransferCount(selectedNode.id)} transfers
                  </div>
                </div>

                {/* Amount / Balance */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    RECORDED AMOUNT / BALANCE
                  </span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    ${selectedNode.balance.toLocaleString()} USDT
                  </div>
                </div>

                {/* Primary Action Button: EXPLORE ON TRONSCAN */}
                <div className="pt-2 border-t border-slate-200">
                  <a
                    href={getTronscanAddressUrl(selectedNode.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs font-mono"
                  >
                    <span>EXPLORE ON TRONSCAN</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Full Address & Copy Button */}
                <div className="pt-2 border-t border-slate-200 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                    FULL WALLET ADDRESS
                  </span>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded break-all text-[11px] font-bold text-slate-900 mb-2">
                    {selectedNode.id}
                  </div>

                  <button
                    onClick={() => handleCopy(selectedNode.id)}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedId === selectedNode.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY ADDRESS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. RIGHT-SIDE TRANSFER DETAILS DRAWER */}
          {selectedEdge && (
            <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-white border-l border-blue-200 shadow-xl z-30 flex flex-col font-sans transition-all">
              {/* Drawer Header */}
              <div className="p-3.5 border-b border-blue-200 flex items-center justify-between bg-blue-50/60">
                <div className="flex items-center gap-2 font-mono">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wide text-blue-900">
                    TRANSFER DETAILS
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEdge(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-blue-100 rounded font-bold text-xs transition-colors"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 space-y-4 font-sans text-xs flex-1 overflow-y-auto">
                {/* Transfer Value */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    TRANSFER VALUE
                  </span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    ${selectedEdge.totalAmount.toLocaleString()} USDT
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedEdge.transferCount} transfer{selectedEdge.transferCount > 1 ? 's' : ''} aggregated
                  </span>
                </div>

                {/* From Sender */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    FROM (SENDER WALLET)
                  </span>
                  <div className="font-mono text-[11px] font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200 break-all">
                    {selectedEdge.from}
                  </div>
                </div>

                {/* To Recipient */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold block mb-1">
                    TO (RECIPIENT WALLET)
                  </span>
                  <div className="font-mono text-[11px] font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200 break-all">
                    {selectedEdge.to}
                  </div>
                </div>

                {/* Transactions List */}
                <div className="space-y-2 pt-2 border-t border-slate-200 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    TRANSACTIONS RECORDED ({selectedEdge.transactions.length})
                  </span>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {selectedEdge.transactions.map((txItem, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between text-slate-800 font-bold">
                          <span>Tx #{idx + 1}</span>
                          <span className="text-emerald-700">${txItem.amount.toLocaleString()} USDT</span>
                        </div>

                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">TRANSACTION HASH</span>
                          <div className="font-bold text-blue-900 break-all text-[10px] bg-white p-1.5 rounded border border-slate-200">
                            {txItem.tx}
                          </div>
                        </div>

                        {txItem.tx && txItem.tx !== '0x00' && (
                          <a
                            href={getTronscanTxUrl(txItem.tx)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] flex items-center justify-center gap-1 transition-colors font-mono"
                          >
                            <span>VIEW TRANSACTION ON TRONSCAN</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
