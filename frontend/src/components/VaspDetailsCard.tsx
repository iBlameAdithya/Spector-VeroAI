import { useState } from 'react';
import type { TracingSummary, VaspIdentity, TerminalStatus } from '../types/api';
import {
  Building2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Globe,
  ChevronDown,
  ChevronUp,
  Wallet,
  Layers,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { getTronscanAddressUrl } from '../utils/explorer';

interface VaspDetailsCardProps {
  tracingSummary?: TracingSummary;
  vasp?: VaspIdentity | null;
}

export const VaspDetailsCard: React.FC<VaspDetailsCardProps> = ({ tracingSummary, vasp }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);

  const destinationVasp = tracingSummary?.destination_vasp ?? vasp ?? null;
  const exitVaspIdentified = Boolean(tracingSummary?.exit_vasp_identified ?? destinationVasp);
  const rawStatus = tracingSummary?.terminal_status;
  const terminalWallet = tracingSummary?.terminal_wallet ?? destinationVasp?.deposit_address ?? null;

  const handleCopy = (val: string, fieldName: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatShort = (addr: string) => {
    if (!addr) return 'N/A';
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Determine effective status with graceful fallback for older responses
  // Fallback rule: never label the case CLEAN if status is missing
  const effectiveStatus: TerminalStatus | 'LEGACY_FALLBACK' = rawStatus
    ? rawStatus
    : destinationVasp && exitVaspIdentified
    ? 'VASP_TERMINAL'
    : 'LEGACY_FALLBACK';

  // =========================================================================
  // CASE A: VASP_TERMINAL
  // =========================================================================
  if (effectiveStatus === 'VASP_TERMINAL') {
    const vaspName = (exitVaspIdentified && destinationVasp?.name)
      ? destinationVasp.name
      : 'Identified Exchange / VASP';

    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
              WHERE THE MONEY ENDED UP
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              VASP / EXCHANGE
            </span>
          </div>

          {destinationVasp && (
            <button
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="text-xs font-mono text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
            >
              <span>{showTechDetails ? 'Hide technical details' : 'Technical details'}</span>
              {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Primary Destination VASP & Terminal Wallet Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono mb-3">
          {/* Destination Exchange */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block mb-1">VASP / EXCHANGE</span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{vaspName}</span>
            </div>
            {destinationVasp?.cluster_type && (
              <div className="text-[11px] text-slate-600 mt-1">
                <span className="text-slate-400">Account Type: </span>
                <span className="font-semibold text-slate-800 font-sans">{destinationVasp.cluster_type}</span>
              </div>
            )}
          </div>

          {/* Terminal Wallet */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 uppercase">TERMINAL WALLET</span>
              {terminalWallet && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(terminalWallet, 'terminal_wallet')}
                    className="text-slate-500 hover:text-slate-800 transition-colors"
                    title="Copy Terminal Wallet"
                  >
                    {copiedField === 'terminal_wallet' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={getTronscanAddressUrl(terminalWallet)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="Explore on TRONSCAN"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
            <div
              className="font-mono text-xs font-bold text-blue-800 bg-white p-1.5 rounded border border-slate-200 truncate"
              title={terminalWallet || 'N/A'}
            >
              {terminalWallet ? formatShort(terminalWallet) : 'Not specified'}
            </div>
            {terminalWallet && (
              <div className="mt-1.5">
                <a
                  href={getTronscanAddressUrl(terminalWallet)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1"
                >
                  <span>EXPLORE ON TRONSCAN</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Hot Wallet Destination (if provided) */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 uppercase">EXCHANGE MAIN WALLET</span>
              {destinationVasp?.hot_wallet_destination && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(destinationVasp.hot_wallet_destination!, 'hot_wallet')}
                    className="text-slate-500 hover:text-slate-800 transition-colors"
                    title="Copy Hot Wallet Address"
                  >
                    {copiedField === 'hot_wallet' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <a
                    href={getTronscanAddressUrl(destinationVasp.hot_wallet_destination!)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="View on TRONSCAN"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
            <div
              className="font-mono text-xs text-slate-700 bg-white p-1.5 rounded border border-slate-200 truncate"
              title={destinationVasp?.hot_wallet_destination || 'N/A'}
            >
              {formatShort(destinationVasp?.hot_wallet_destination || '')}
            </div>
          </div>

          {/* Sweep Time & Jurisdiction */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              {destinationVasp?.sweep_time_minutes !== undefined && (
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> Transfer Time:
                  </span>
                  <span className="font-bold text-slate-900">{destinationVasp.sweep_time_minutes} min</span>
                </div>
              )}

              {destinationVasp?.jurisdiction && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-500" /> Jurisdiction:
                  </span>
                  <span className="font-semibold text-slate-800 text-[10px] truncate max-w-[100px]" title={destinationVasp.jurisdiction}>
                    {destinationVasp.jurisdiction}
                  </span>
                </div>
              )}
            </div>

            {destinationVasp && (
              <div className="border-t border-slate-200 pt-1 mt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Hold Support:
                </span>
                <span className="font-bold text-emerald-700 text-[10px]">
                  {destinationVasp.supports_instant_freeze ? 'AVAILABLE' : 'MANUAL REVIEW'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Technical Details */}
        {showTechDetails && destinationVasp && (
          <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-2 mb-2">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
              TECHNICAL CLUSTER ATTRIBUTION DETAILS
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">ATTRIBUTION CONFIDENCE SCORE:</span>
                <span className="font-bold text-emerald-700">{destinationVasp.confidence_score}%</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">INTAKE PORTAL ENDPOINT:</span>
                <span className="font-bold text-slate-900 break-all text-[10px]">{destinationVasp.compliance_portal_url || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {destinationVasp?.compliance_portal_url && (
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Target Exchange Intake Portal:</span>
            <a
              href={destinationVasp.compliance_portal_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-semibold flex items-center gap-1"
            >
              <span>{destinationVasp.compliance_portal_url}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // CASE B: HOLDING_WALLET
  // =========================================================================
  if (effectiveStatus === 'HOLDING_WALLET') {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
          <Wallet className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
            WHERE THE MONEY ENDED UP
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs font-mono">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
            ENDPOINT STATUS
          </span>
          <div className="text-xs font-bold text-slate-900 mb-3">
            FUNDS CURRENTLY HELD AT THIS WALLET
          </div>

          {terminalWallet ? (
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">
                TERMINAL WALLET
              </span>
              <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded border border-slate-200 mb-3">
                <span className="font-mono text-xs font-bold text-slate-900 break-all flex-1">
                  {terminalWallet}
                </span>
                <button
                  onClick={() => handleCopy(terminalWallet, 'holding_wallet')}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px]"
                  title="Copy Wallet Address"
                >
                  {copiedField === 'holding_wallet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={getTronscanAddressUrl(terminalWallet)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors shadow-2xs font-mono"
              >
                <span>EXPLORE ON TRONSCAN</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="text-xs text-slate-600">
              Terminal wallet address not provided in the investigation payload.
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE C: TRACE_DEPTH_REACHED
  // =========================================================================
  if (effectiveStatus === 'TRACE_DEPTH_REACHED') {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
          <Layers className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
            TRACE DEPTH REACHED
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs">
          <p className="text-slate-700 leading-relaxed mb-1 font-sans">
            The investigation reached the configured trace depth.
          </p>
          <p className="text-slate-600 leading-relaxed mb-3 font-sans text-[11px]">
            The terminal destination was not identified as a verified VASP.
          </p>

          {terminalWallet && (
            <div className="font-mono">
              <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">
                TERMINAL WALLET:
              </span>
              <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded border border-slate-200 mb-3">
                <span className="font-mono text-xs font-bold text-slate-900 break-all flex-1">
                  {terminalWallet}
                </span>
                <button
                  onClick={() => handleCopy(terminalWallet, 'depth_wallet')}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px]"
                  title="Copy Wallet Address"
                >
                  {copiedField === 'depth_wallet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={getTronscanAddressUrl(terminalWallet)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors shadow-2xs font-mono"
              >
                <span>EXPLORE ON TRONSCAN</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE D: NO_TERMINAL_IDENTIFIED
  // =========================================================================
  if (effectiveStatus === 'NO_TERMINAL_IDENTIFIED') {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
            NO TERMINAL IDENTIFIED
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs">
          <p className="text-slate-700 leading-relaxed font-sans">
            No terminal destination was identified within the available transaction path.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE E: NO_ONCHAIN_ACTIVITY
  // =========================================================================
  if (effectiveStatus === 'NO_ONCHAIN_ACTIVITY') {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
          <AlertCircle className="w-4 h-4 text-slate-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
            NO ON-CHAIN ACTIVITY
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs">
          <p className="text-slate-700 leading-relaxed font-sans">
            No on-chain activity was found for the queried wallet.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE F: QUERY_FAILED
  // =========================================================================
  if (effectiveStatus === 'QUERY_FAILED') {
    return (
      <div className="bg-white border border-red-200 rounded-md p-4 mb-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-red-100">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-red-900">
            ENDPOINT COULD NOT BE DETERMINED
          </h3>
        </div>

        <div className="bg-red-50/50 border border-red-200 rounded-md p-3.5 text-xs">
          <p className="text-red-900 leading-relaxed font-sans">
            The investigation could not determine the terminal destination because the underlying query did not complete successfully.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CASE G: LEGACY FALLBACK (missing status from older backend responses)
  // Ensure the missing-status fallback never labels the case CLEAN
  // =========================================================================
  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200">
        <HelpCircle className="w-4 h-4 text-slate-500" />
        <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
          ENDPOINT STATUS UNCONFIRMED
        </h3>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-xs font-sans">
        <p className="text-slate-700 leading-relaxed mb-2">
          The endpoint status was not reported by the backend service. No verified terminal destination was established.
        </p>

        {terminalWallet && (
          <div className="font-mono mt-3 pt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block mb-1 font-semibold">
              ASSOCIATED WALLET:
            </span>
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded border border-slate-200 mb-2">
              <span className="font-mono text-xs font-bold text-slate-900 break-all flex-1">
                {terminalWallet}
              </span>
              <button
                onClick={() => handleCopy(terminalWallet, 'fallback_wallet')}
                className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px]"
                title="Copy Wallet Address"
              >
                {copiedField === 'fallback_wallet' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={getTronscanAddressUrl(terminalWallet)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors shadow-2xs font-mono"
            >
              <span>EXPLORE ON TRONSCAN</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
