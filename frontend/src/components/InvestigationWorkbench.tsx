import { useState } from 'react';
import {
  Search,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Scale,
  Lock,
} from 'lucide-react';
import type { TraceRequest } from '../types/api';
import { getTronscanAddressUrl } from '../utils/explorer';

interface InvestigationWorkbenchProps {
  onStartTrace: (request: TraceRequest) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

const CANONICAL_VICTIM_WALLET = '0x71c6bfb575a35b50e76ec92432dd2741b23ac3a9';
const CANONICAL_STOLEN_TX = '0x4a8b7c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b';

export const InvestigationWorkbench: React.FC<InvestigationWorkbenchProps> = ({
  onStartTrace,
  isLoading,
  errorMessage,
}) => {
  // Main Bar State
  const [tronWallet, setTronWallet] = useState<string>(CANONICAL_VICTIM_WALLET);
  const [maxHops, setMaxHops] = useState<number>(4);

  // Advanced Controls (Collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [minTransferAmount, setMinTransferAmount] = useState<string>('');
  const [peelThreshold, setPeelThreshold] = useState<string>('');
  const [maxChildrenPerNode, setMaxChildrenPerNode] = useState<string>('');
  const [timeWindowStart, setTimeWindowStart] = useState<string>('');
  const [timeWindowEnd, setTimeWindowEnd] = useState<string>('');
  const [excludeKnownServices, setExcludeKnownServices] = useState<boolean | undefined>(undefined);
  const [proportionalClaimOnly, setProportionalClaimOnly] = useState<boolean | undefined>(undefined);

  // Statutory Credentials (Empty by default — no fake defaults)
  const [firNumber, setFirNumber] = useState<string>('');
  const [policeStation, setPoliceStation] = useState<string>('');
  const [officerBadgeId, setOfficerBadgeId] = useState<string>('');
  const [legalStatute, setLegalStatute] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWallet = tronWallet.trim();
    const isCanonical = cleanWallet.toLowerCase() === CANONICAL_VICTIM_WALLET.toLowerCase();

    // Mandatory core fields per existing API contract
    const req: TraceRequest = {
      victim_wallet: cleanWallet,
      stolen_tx_hash: isCanonical ? CANONICAL_STOLEN_TX : cleanWallet,
      chain: 'tron',
      max_hops: Number(maxHops),
    };

    // Only attach advanced fields if explicitly set by the user
    if (minTransferAmount !== '' && !isNaN(Number(minTransferAmount))) {
      req.min_transfer_amount = Number(minTransferAmount);
    }
    if (peelThreshold !== '' && !isNaN(Number(peelThreshold))) {
      req.peel_threshold = Number(peelThreshold);
    }
    if (maxChildrenPerNode !== '' && !isNaN(Number(maxChildrenPerNode))) {
      req.max_children_per_node = Number(maxChildrenPerNode);
    }
    if (timeWindowStart) {
      req.time_window_start = new Date(timeWindowStart).toISOString();
    }
    if (timeWindowEnd) {
      req.time_window_end = new Date(timeWindowEnd).toISOString();
    }
    if (excludeKnownServices !== undefined) {
      req.exclude_known_services = excludeKnownServices;
    }
    if (proportionalClaimOnly !== undefined) {
      req.proportional_claim_only = proportionalClaimOnly;
    }
    if (firNumber.trim()) {
      req.fir_number = firNumber.trim();
    }
    if (policeStation.trim()) {
      req.police_station = policeStation.trim();
    }
    if (officerBadgeId.trim()) {
      req.officer_badge_id = officerBadgeId.trim();
    }
    if (legalStatute.trim()) {
      req.legal_statute = legalStatute.trim();
    }

    onStartTrace(req);
  };

  const handleLoadCanonical = () => {
    setTronWallet(CANONICAL_VICTIM_WALLET);
    setMaxHops(4);
    setMinTransferAmount('');
    setPeelThreshold('');
    setMaxChildrenPerNode('');
    setTimeWindowStart('');
    setTimeWindowEnd('');
    setExcludeKnownServices(undefined);
    setProportionalClaimOnly(undefined);
    setFirNumber('');
    setPoliceStation('');
    setOfficerBadgeId('');
    setLegalStatute('');
  };

  const tronscanUrl = tronWallet.trim() ? getTronscanAddressUrl(tronWallet.trim()) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 mb-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2 font-mono">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              INVESTIGATION WORKBENCH
            </h2>
            <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200 uppercase font-mono">
              TRON (TRC-20)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Wallet-first investigation workstation for TRON on-chain assets and VASP liquidation tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-mono font-bold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-300 hover:border-blue-300 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>ADVANCED INVESTIGATION OPTIONS</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Visual Workflow Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2 mb-4 font-mono text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          1. TRON WALLET ADDRESS
        </span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700">2. Verify on TRONSCAN</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700">3. Start Investigation</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700">4. Fund Flow</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700">5. Where the money ended up</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          6. Evidence & Report
        </span>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Main Focal Bar (TRON Wallet Input + Hops) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-900 uppercase font-mono">
                TRON WALLET ADDRESS
              </label>
              {tronscanUrl && (
                <a
                  href={tronscanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View on TRONSCAN</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <input
              type="text"
              required
              value={tronWallet}
              onChange={(e) => setTronWallet(e.target.value)}
              placeholder="Enter TRON wallet address (e.g. T... or 0x71c6...)"
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-xs font-semibold"
            />
          </div>

          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 font-mono">
              Trace Depth
            </label>
            <select
              value={maxHops}
              onChange={(e) => setMaxHops(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            >
              <option value={1}>1 Hop Traversal</option>
              <option value={2}>2 Hops Traversal</option>
              <option value={3}>3 Hops Traversal</option>
              <option value={4}>4 Hops Traversal (Standard)</option>
              <option value={5}>5 Hops Traversal (Max)</option>
            </select>
          </div>
        </div>

        {/* 2. Collapsible Advanced Investigation Options */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-200 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-700 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-mono uppercase text-slate-900 block text-[11px] mb-0.5">
                  ADVANCED INVESTIGATION OPTIONS (OPTIONAL)
                </strong>
                <p className="text-slate-600 font-sans text-xs">
                  Optional parameters for fine-tuning transfer filtering, time windows, and investigation details. Leave blank to run standard trace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Card A: Advanced Investigation Parameters */}
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-3 font-mono">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-slate-900 uppercase text-xs">
                    FILTERING & TIME WINDOWS
                  </h4>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    Dust Filter Minimum ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Optional (e.g. 100.00)"
                    value={minTransferAmount}
                    onChange={(e) => setMinTransferAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    Peel Trunk Threshold
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="0.95"
                    placeholder="Optional (e.g. 0.80)"
                    value={peelThreshold}
                    onChange={(e) => setPeelThreshold(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    Max Branch Fanout
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    placeholder="Optional (e.g. 10)"
                    value={maxChildrenPerNode}
                    onChange={(e) => setMaxChildrenPerNode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">
                      Incident Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={timeWindowStart}
                      onChange={(e) => setTimeWindowStart(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 uppercase mb-1">
                      Incident Cutoff Time
                    </label>
                    <input
                      type="datetime-local"
                      value={timeWindowEnd}
                      onChange={(e) => setTimeWindowEnd(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2 font-sans">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-800">
                    <input
                      type="checkbox"
                      checked={excludeKnownServices === true}
                      onChange={(e) => setExcludeKnownServices(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <strong className="block font-mono text-[11px] text-slate-900 uppercase">
                        EXCLUDE KNOWN SERVICES
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        Excludes known service entities and DEX routers from mule classification.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-800">
                    <input
                      type="checkbox"
                      checked={proportionalClaimOnly === true}
                      onChange={(e) => setProportionalClaimOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <strong className="block font-mono text-[11px] text-slate-900 uppercase">
                        PROPORTIONAL ASSET HOLD
                      </strong>
                      <span className="text-[10px] text-slate-500 block">
                        Limits the requested hold to the amount supported by the investigation data.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Card B: Investigation Details (Starts Empty) */}
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-3 font-mono">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Scale className="w-4 h-4 text-slate-600" />
                  <h4 className="font-bold text-slate-900 uppercase text-xs">
                    CASE & OFFICER DETAILS
                  </h4>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    FIR / Crime Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reference number if available"
                    value={firNumber}
                    onChange={(e) => setFirNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    Police Station / Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Enter unit or station if available"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    Officer ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter officer ID if available"
                    value={officerBadgeId}
                    onChange={(e) => setOfficerBadgeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 uppercase mb-1">
                    Legal Provision
                  </label>
                  <input
                    type="text"
                    placeholder="Enter legal provision if available"
                    value={legalStatute}
                    onChange={(e) => setLegalStatute(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Target Protocol: TRON (TRC-20 USDT) | Verified On-Chain Tracing</span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              type="button"
              onClick={handleLoadCanonical}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors flex items-center gap-1.5"
              title="Load default canonical TRON case wallet"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Canonical Case</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs flex items-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>EXECUTING TRACE...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-blue-200" />
                  <span>START INVESTIGATION</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

