import React, { useState } from 'react';
import type { SahyogPackage } from '../api';
import { api } from '../api';
import { Scale, FileText, Copy, Check, Download, X, Layers, Landmark } from 'lucide-react';

interface SahyogModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  initialPackage?: SahyogPackage | null;
}

export const SahyogModal: React.FC<SahyogModalProps> = ({
  isOpen,
  onClose,
  caseId,
  initialPackage,
}) => {
  const [pkg, setPkg] = useState<SahyogPackage | null>(initialPackage || null);
  const [firNumber, setFirNumber] = useState('FIR/2026/CYBER-409');
  const [policeStation, setPoliceStation] = useState('Special Cyber Crime Cell, New Delhi');
  const [badgeId, setBadgeId] = useState('INV-LE-4092');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await api.generateSahyogPackage({
        case_id: caseId,
        fir_number: firNumber,
        police_station: policeStation,
        officer_badge_id: badgeId,
      });
      setPkg(result);
    } catch (err: any) {
      alert(`Error generating SAHYOG package: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNotice = () => {
    if (!pkg) return;
    navigator.clipboard.writeText(pkg.formal_freeze_notice_text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadNotice = () => {
    if (!pkg) return;
    const blob = new Blob([pkg.formal_freeze_notice_text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pkg.package_id}_FREEZE_NOTICE.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-specter-card border border-specter-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-specter-border flex items-center justify-between sticky top-0 bg-specter-card/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono">
                  MHA I4C SAHYOG STATUTORY FREEZE PACKAGE
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SEC 91/94 CrPC &amp; BNSS
                </span>
              </div>
              <p className="text-xs text-specter-muted font-sans mt-0.5">
                Indian Ministry of Home Affairs (MHA) Indian Cyber Crime Coordination Centre (I4C) Statutory Directive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-specter-muted hover:text-white hover:bg-specter-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Statutory Details Form */}
          <div className="bg-specter-darkest/70 border border-specter-border rounded-xl p-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase mb-3 flex items-center gap-2">
              <Scale className="h-4 w-4 text-specter-gold" />
              <span>STATUTORY LAW ENFORCEMENT DIRECTIVE PARAMETERS</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-specter-muted mb-1">FIR NUMBER</label>
                <input
                  type="text"
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  className="w-full bg-specter-card border border-specter-border rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-specter-cyan"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-specter-muted mb-1">POLICE STATION / AGENCY</label>
                <input
                  type="text"
                  value={policeStation}
                  onChange={(e) => setPoliceStation(e.target.value)}
                  className="w-full bg-specter-card border border-specter-border rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-specter-cyan"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-specter-muted mb-1">OFFICER BADGE ID</label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full bg-specter-card border border-specter-border rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-specter-cyan"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-specter-gold hover:bg-amber-400 text-black font-mono font-bold text-xs tracking-wider transition-colors disabled:opacity-50"
              >
                {loading ? 'COMPILING SAHYOG PACKAGE...' : pkg ? 'RE-GENERATE PACKAGE' : 'GENERATE COURT-ADMISSIBLE PACKAGE'}
              </button>
            </div>
          </div>

          {/* Generated Package View */}
          {pkg && (
            <div className="space-y-6">
              {/* Top Package Metadata Banner */}
              <div className="bg-specter-card border border-specter-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono text-specter-muted">PACKAGE IDENTIFIER</div>
                  <div className="text-base font-bold font-mono text-specter-gold">{pkg.package_id}</div>
                  <div className="text-xs text-gray-300 font-sans mt-0.5">{pkg.legal_directive_title}</div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="bg-specter-darkest px-3 py-1.5 rounded border border-specter-border">
                    <span className="text-specter-muted text-[10px] block">CLAIMED VALUE</span>
                    <span className="font-bold text-specter-emerald">{pkg.claimed_value}</span>
                  </div>
                  <div className="bg-specter-darkest px-3 py-1.5 rounded border border-specter-border">
                    <span className="text-specter-muted text-[10px] block">TARGET VASP</span>
                    <span className="font-bold text-white">{pkg.target_vasp_name}</span>
                  </div>
                  <div className="bg-specter-emerald/15 border border-specter-emerald/40 px-3 py-1.5 rounded text-specter-emerald font-bold">
                    {pkg.status}
                  </div>
                </div>
              </div>

              {/* 7-Step Court-Admissible Chain of Custody */}
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-specter-cyan" />
                  <span>7-STEP CRYPTOGRAPHIC CHAIN OF CUSTODY (CRPC / BNSS COMPLIANT)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {pkg.evidence_chain.map((step) => (
                    <div
                      key={step.step_number}
                      className="bg-specter-darkest/90 border border-specter-border rounded-lg p-3 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-specter-muted mb-1 text-[10px]">
                        <span className="font-bold text-specter-gold">STEP 0{step.step_number}</span>
                        <span className="text-[9px] uppercase">{step.element_type}</span>
                      </div>
                      <div className="font-bold text-white text-xs mb-1 truncate">{step.label}</div>
                      <div className="text-[11px] text-specter-cyan truncate font-mono">{step.value}</div>
                      <div className="text-[10px] text-specter-muted font-sans mt-1 leading-tight">{step.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formal Statutory Notice Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <FileText className="h-4 w-4 text-specter-emerald" />
                    <span>FORMAL PRESERVATION &amp; FREEZE DIRECTIVE NOTICE</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyNotice}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-specter-card hover:bg-specter-hover border border-specter-border text-xs font-mono text-specter-cyan transition-colors"
                    >
                      {copiedText ? <Check className="h-3 w-3 text-specter-emerald" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedText ? 'COPIED' : 'COPY TEXT'}</span>
                    </button>
                    <button
                      onClick={handleDownloadNotice}
                      className="flex items-center gap-1.5 px-3 py-1 rounded bg-specter-gold/20 hover:bg-specter-gold/30 border border-specter-gold/40 text-xs font-mono text-specter-gold transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>DOWNLOAD DIRECTIVE</span>
                    </button>
                  </div>
                </div>

                <div className="bg-specter-darkest border border-specter-border rounded-lg p-4 font-mono text-[11px] text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed border-l-4 border-l-specter-gold">
                  {pkg.formal_freeze_notice_text}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-specter-border bg-specter-card/95 flex items-center justify-between text-xs font-mono text-specter-muted sticky bottom-0">
          <span>Statutory Authority: Section 91 &amp; 94 CrPC / BNSS (2023)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-specter-hover border border-specter-border text-white hover:bg-specter-card transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
