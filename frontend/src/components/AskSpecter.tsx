import { useState } from 'react';
import type { TraceResponse } from '../types/api';
import { HelpCircle, MessageSquare, Send, X, ChevronRight, Info } from 'lucide-react';

interface AskSpecterProps {
  traceData: TraceResponse;
}

export const AskSpecter: React.FC<AskSpecterProps> = ({ traceData }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [activeAnswer, setActiveAnswer] = useState<string | null>(null);

  const { tracing_summary } = traceData;
  const terminalStatus = tracing_summary.terminal_status;
  const terminalWallet = tracing_summary.terminal_wallet;
  const destinationVasp = tracing_summary.destination_vasp;
  const vaspName = destinationVasp?.name;
  const lossUsd = (tracing_summary.initial_loss_usd || 0).toLocaleString();
  const currency = tracing_summary.currency || 'USDT';
  const hops = tracing_summary.hops_traversed;
  const sweepTime = destinationVasp?.sweep_time_minutes;

  const getExplanationForQuestion = (q: string): string => {
    const qLower = q.toLowerCase();

    if (qLower.includes('why') && (qLower.includes('flag') || qLower.includes('suspicious'))) {
      const destClause = terminalStatus === 'VASP_TERMINAL' && vaspName
        ? ` toward ${vaspName}`
        : terminalStatus === 'HOLDING_WALLET' && terminalWallet
        ? ` into holding wallet ${terminalWallet.slice(0, 8)}...`
        : '';
      const timeClause = sweepTime ? ` within ${sweepTime} minutes` : '';
      return `This investigation was flagged because $${lossUsd} ${currency} was transferred across ${hops} intermediate wallets${destClause}${timeClause}. Rapid movement across multiple addresses is a key pattern evaluated during screening.`;
    }

    if (qLower.includes('where') || qLower.includes('destination') || qLower.includes('money go')) {
      if (terminalStatus === 'VASP_TERMINAL') {
        return `The tracked funds moved from the starting wallet through ${hops} intermediate wallet steps and arrived at verified exchange ${vaspName || 'VASP'}${terminalWallet ? ` (terminal wallet: ${terminalWallet})` : ''}.`;
      }
      if (terminalStatus === 'HOLDING_WALLET') {
        return `The tracked funds moved across ${hops} wallet steps and are currently held at wallet address ${terminalWallet || 'the terminal wallet'}. Funds have not been identified at a centralized exchange.`;
      }
      if (terminalStatus === 'TRACE_DEPTH_REACHED') {
        return `The investigation reached the configured trace depth of ${hops} steps. The terminal wallet reached is ${terminalWallet || 'unidentified'}, which was not identified as a verified VASP.`;
      }
      if (terminalStatus === 'NO_TERMINAL_IDENTIFIED') {
        return `No terminal destination was identified within the available transaction path across ${hops} wallet steps.`;
      }
      if (terminalStatus === 'NO_ONCHAIN_ACTIVITY') {
        return `No on-chain activity was found for the queried wallet.`;
      }
      if (terminalStatus === 'QUERY_FAILED') {
        return `The investigation could not determine the terminal destination because the underlying query did not complete successfully.`;
      }
      if (destinationVasp) {
        return `The tracked funds moved through ${hops} intermediate wallet steps toward ${vaspName || 'the exchange'}.`;
      }
      return `The tracked funds moved through ${hops} intermediate wallet steps${terminalWallet ? ` to terminal wallet ${terminalWallet}` : ''}. No verified exchange endpoint was identified.`;
    }

    if (qLower.includes('explain') || qLower.includes('summary') || qLower.includes('happen')) {
      const destSummary = terminalStatus === 'VASP_TERMINAL'
        ? `to verified exchange ${vaspName || 'VASP'}`
        : terminalStatus === 'HOLDING_WALLET'
        ? `and are currently held at wallet ${terminalWallet ? terminalWallet.slice(0, 8) + '...' : 'terminal wallet'}`
        : terminalStatus === 'TRACE_DEPTH_REACHED'
        ? `reaching configured trace depth at wallet ${terminalWallet ? terminalWallet.slice(0, 8) + '...' : 'terminal wallet'}`
        : terminalStatus === 'NO_ONCHAIN_ACTIVITY'
        ? `with no on-chain activity identified`
        : `across ${hops} hops`;
      const timeClause = sweepTime ? ` in ${sweepTime} minutes` : '';
      return `In Case ${traceData.case_id}, $${lossUsd} ${currency} was traced across ${hops} wallet transfers${timeClause} ${destSummary}. Findings are backed by ${traceData.evidence_bundle.leaf_count || 1} verified evidence record logs.`;
    }

    if (qLower.includes('evidence') || qLower.includes('proof')) {
      return `The findings are supported by ${traceData.evidence_bundle.leaf_count || 1} verified record logs (Evidence ID: ${traceData.evidence_bundle.merkle_root.slice(0, 16)}...) filed under ${traceData.evidence_bundle.statutory_clauses[0] || 'applicable statutory directives'}.`;
    }

    if (qLower.includes('review') || qLower.includes('action') || qLower.includes('next')) {
      if (terminalStatus === 'VASP_TERMINAL' && destinationVasp) {
        return `To proceed, review the money flow graph and exchange destination details below. If authorized, complete the officer badge ID and sign the asset hold request in the "Action: Authorize Asset Hold" section.`;
      }
      return `To proceed, review the money flow graph and endpoint section above. Examine transaction details and verified evidence records before taking further investigative action.`;
    }

    const destEnding = terminalStatus === 'VASP_TERMINAL' && vaspName
      ? ` to ${vaspName}`
      : terminalStatus === 'HOLDING_WALLET' && terminalWallet
      ? ` to holding wallet ${terminalWallet.slice(0, 8)}...`
      : '';
    return `SPECTER traced $${lossUsd} ${currency} across ${hops} wallet transfers${destEnding}. All findings are recorded under Case Reference ${traceData.case_id}.`;
  };

  const handleSuggestedClick = (question: string) => {
    setQuery(question);
    setActiveAnswer(getExplanationForQuestion(question));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveAnswer(getExplanationForQuestion(query));
  };

  if (!isOpen) {
    return (
      <div className="mb-4 font-sans text-xs">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-blue-50/60 border border-blue-200 hover:border-blue-300 p-3 rounded-md text-left transition-colors flex items-center justify-between group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 font-mono uppercase tracking-wider block">
                ASK SPECTER — EXPLANATION ASSISTANT
              </span>
              <span className="text-[11px] text-slate-600 font-sans">
                Plain-English explanation layer grounded strictly in backend investigation findings
              </span>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center gap-1">
            <span>Ask Assistant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-300 rounded-md p-4 mb-4 shadow-2xs font-sans text-xs">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
            ASK SPECTER — EXPLANATION ASSISTANT
          </h3>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-700 p-1"
          title="Close assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Question Chips */}
      <div className="mb-3">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1.5">
          SUGGESTED QUESTIONS:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            'Why was this wallet flagged?',
            'Where did the money go?',
            'Explain this investigation.',
            'What evidence supports this finding?',
            'What should I review next?',
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(q)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-900 border border-slate-200 transition-colors text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Answer Box */}
      {activeAnswer && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3 text-slate-900 leading-relaxed text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-blue-900 mb-0.5 font-mono text-[10px] uppercase">
              EXPLANATION FINDING:
            </span>
            <p>{activeAnswer}</p>
          </div>
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about this investigation..."
          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center gap-1.5 text-xs transition-colors"
        >
          <span>Ask</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
