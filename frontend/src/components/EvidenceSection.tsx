import { useState } from 'react';
import type { EvidenceBundle } from '../types/api';
import { ShieldCheck, Copy, FileCheck, Scale, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface EvidenceSectionProps {
  evidence: EvidenceBundle;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({ evidence }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-900">
            INVESTIGATION EVIDENCE
          </h3>
        </div>

        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="text-xs font-mono text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
        >
          <span>{showTechDetails ? 'Hide technical details' : 'Technical details'}</span>
          {showTechDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-xs text-slate-600 mb-3 font-sans">
        This information records what SPECTER found during the investigation.
      </p>

      {/* Main Plain English Evidence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 font-mono text-xs">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">CASE REFERENCE</span>
          <span className="font-bold text-slate-900 text-sm">{evidence.case_id}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">EVIDENCE STATUS</span>
          {evidence.integrity_verified !== false ? (
            <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              VERIFIED
            </span>
          ) : (
            <span className="font-bold text-amber-700 text-sm flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-amber-600" />
              INCOMPLETE
            </span>
          )}
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">NUMBER OF RECORDS</span>
          <span className="font-bold text-slate-900 text-sm">{evidence.leaf_count} Records</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-500 uppercase block mb-1">EVIDENCE ID</span>
          <span className="font-bold text-blue-800 text-xs truncate block" title={evidence.merkle_root}>
            {evidence.merkle_root.slice(0, 16)}...
          </span>
        </div>
      </div>

      {/* Legal References List */}
      <div className="mb-3">
        <h4 className="text-[11px] font-mono font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-blue-600" />
          LEGAL DIRECTIVES & STATUTORY REFERENCES
        </h4>
        <div className="border border-slate-200 rounded divide-y divide-slate-200 bg-slate-50 text-xs font-mono">
          {evidence.statutory_clauses.map((clause, idx) => (
            <div key={idx} className="p-2 flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-800 font-sans">{clause}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Technical Cryptographic Details */}
      {showTechDetails && (
        <div className="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-xs space-y-3 mt-3">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
            CRYPTOGRAPHIC MERKLE TREE & ALGORITHM DETAILS
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="text-slate-400 block text-[9px] mb-1">HASH ALGORITHM:</span>
            <span className="font-bold text-blue-800">{evidence.algorithm}</span>
          </div>

          <div className="bg-slate-100 text-slate-900 p-2.5 rounded border border-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-blue-800 font-bold uppercase">FULL MERKLE ROOT HASH</span>
              <button
                onClick={() => handleCopy(evidence.merkle_root)}
                className="text-slate-600 hover:text-slate-900 text-[10px] flex items-center gap-1"
              >
                {copiedHash === evidence.merkle_root ? (
                  <span className="text-emerald-700 font-bold">Copied</span>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="font-bold text-emerald-800 text-xs break-all bg-white p-1.5 rounded border border-slate-200">
              {evidence.merkle_root}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
              INDIVIDUAL LEAF RECORD HASHES ({(evidence.leaves || []).length}):
            </span>
            <div className="space-y-1">
              {(evidence.leaves || []).map((leaf, idx) => (
                <div key={idx} className="p-1.5 bg-white border border-slate-200 rounded text-[10px] flex items-center justify-between">
                  <span className="truncate pr-2 font-bold text-slate-800">L{idx + 1}: {leaf}</span>
                  <button onClick={() => handleCopy(leaf)} className="text-slate-400 hover:text-slate-700">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
