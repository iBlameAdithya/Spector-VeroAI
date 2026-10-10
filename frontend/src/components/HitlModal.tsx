import React, { useState } from 'react';
import { ShieldAlert, Lock, CheckCircle2, AlertOctagon, Key, ExternalLink, Copy, Check } from 'lucide-react';
import type { SignAndSubmitResponse } from '../api';
import { api } from '../api';

interface HitlModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  targetVasp: string;
  depositAddress: string;
  claimValue: string;
  merkleProof: string;
  onWarrantIssued: (warrant: SignAndSubmitResponse) => void;
}

export const HitlModal: React.FC<HitlModalProps> = ({
  isOpen,
  onClose,
  caseId,
  targetVasp,
  depositAddress,
  claimValue,
  merkleProof,
  onWarrantIssued,
}) => {
  const [badgeId, setBadgeId] = useState('INV-LE-4092');
  const [signatureToken, setSignatureToken] = useState('ED25519_SIG_CONFIRMED_OK');
  const [attestationChecked, setAttestationChecked] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warrantReceipt, setWarrantReceipt] = useState<SignAndSubmitResponse | null>(null);
  const [copiedWarrant, setCopiedWarrant] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attestationChecked || !badgeId.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.signAndSubmit({
        case_id: caseId,
        officer_badge_id: badgeId.trim(),
        signature_token: signatureToken.trim(),
        approved: true,
      });
      setWarrantReceipt(res);
      onWarrantIssued(res);
    } catch (err: any) {
      alert(`Warrant authorization error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyWarrant = () => {
    if (!warrantReceipt) return;
    navigator.clipboard.writeText(warrantReceipt.warrant_id);
    setCopiedWarrant(true);
    setTimeout(() => setCopiedWarrant(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-specter-card border border-specter-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Prominent Checkpoint Top Banner */}
        <div className="bg-specter-gold text-black px-5 py-3 font-mono font-bold text-xs tracking-wider flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-black animate-pulse" />
            <span>MANDATORY HUMAN-IN-THE-LOOP CHECKPOINT: AUTONOMOUS FREEZE HALTED</span>
          </div>
          <span className="text-[11px] bg-black/15 px-2 py-0.5 rounded font-mono">
            LEGAL REQUIREMENT
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!warrantReceipt ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Legal explanation */}
              <div className="bg-specter-darkest/90 border border-specter-border rounded-xl p-4 text-xs font-sans text-gray-300 leading-relaxed border-l-4 border-l-specter-gold">
                <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-specter-gold" />
                  Statutory Administrative Law Invariant:
                </p>
                <p className="text-specter-muted text-xs">
                  Autonomous AI agents are legally prohibited from executing unilateral asset seizures under Section 91/94 CrPC, FATF Recommendation 16, and Exchange Compliance Protocols. An authorized human investigator must review the cryptographic dossier and affix their digital credential.
                </p>
              </div>

              {/* Dossier Pre-filled Summary */}
              <div className="bg-specter-darkest/60 border border-specter-border rounded-xl p-4 space-y-2.5 font-mono text-xs">
                <span className="text-[10px] text-specter-muted uppercase tracking-wider block">
                  AGENT PRE-FILLED STATUTORY DOSSIER (PAUSED IN BROWSER)
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-specter-muted block">CASE IDENTIFIER</span>
                    <span className="text-white font-bold">{caseId}</span>
                  </div>
                  <div>
                    <span className="text-specter-muted block">TARGET EXCHANGE</span>
                    <span className="text-specter-cyan font-bold">{targetVasp}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-specter-muted block">SUSPECT DEPOSIT ADDRESS</span>
                    <span className="text-specter-gold font-bold truncate block">{depositAddress}</span>
                  </div>
                  <div>
                    <span className="text-specter-muted block">PRESERVED CLAIM AMOUNT</span>
                    <span className="text-specter-emerald font-bold">{claimValue}</span>
                  </div>
                  <div>
                    <span className="text-specter-muted block">CRYPTOGRAPHIC MERKLE ROOT</span>
                    <span className="text-gray-300 truncate block">{merkleProof}</span>
                  </div>
                </div>
              </div>

              {/* Officer Signature Fields */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-specter-muted text-[11px] mb-1 flex items-center justify-between">
                    <span>OFFICER BADGE ID / LAW ENFORCEMENT CREDENTIAL</span>
                    <span className="text-specter-cyan">VERIFIED OFFICER</span>
                  </label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    required
                    className="w-full bg-specter-darkest border border-specter-border rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-specter-gold font-mono"
                    placeholder="e.g. INV-LE-4092"
                  />
                </div>

                <div>
                  <label className="block text-specter-muted text-[11px] mb-1 flex items-center justify-between">
                    <span>DIGITAL ED25519 ATTESTATION KEY / TOKEN</span>
                    <span className="text-specter-emerald">CRYPTOGRAPHIC STAMP</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={signatureToken}
                      onChange={(e) => setSignatureToken(e.target.value)}
                      required
                      className="w-full bg-specter-darkest border border-specter-border rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-specter-gold font-mono"
                      placeholder="ED25519_SIG_CONFIRMED_OK"
                    />
                    <Key className="absolute right-3 top-2.5 h-4 w-4 text-specter-muted" />
                  </div>
                </div>

                {/* Attestation Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={attestationChecked}
                    onChange={(e) => setAttestationChecked(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-specter-border text-specter-gold focus:ring-specter-gold accent-specter-gold"
                  />
                  <span className="text-xs text-gray-300 font-sans leading-tight">
                    I solemnly attest under penalty of administrative perjury that this emergency asset freeze request is justified by mathematical Merkle graph forensics and conforms to statutory requirements.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-specter-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg bg-specter-hover border border-specter-border text-white text-xs font-mono hover:bg-specter-card transition-colors"
                >
                  Cancel &amp; Abort
                </button>

                <button
                  type="submit"
                  disabled={submitting || !attestationChecked}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-specter-gold to-amber-500 hover:from-specter-gold hover:to-amber-400 text-black font-mono font-bold text-xs tracking-wider transition-all shadow-lg hover:shadow-neon-gold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Lock className="h-4 w-4 animate-spin" />
                      <span>SIGNING &amp; DISPATCHING AGENT...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>APPROVE &amp; SIGN FREEZE WARRANT</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Success confirmation screen */
            <div className="space-y-5 text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-specter-emerald/20 border border-specter-emerald/40 flex items-center justify-center text-specter-emerald mx-auto shadow-neon-emerald">
                <CheckCircle2 className="h-9 w-9 animate-bounce" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded bg-specter-emerald/20 text-specter-emerald border border-specter-emerald/30">
                  STATUTORY ASSET FREEZE EXECUTED
                </span>
                <h3 className="text-xl font-bold font-mono text-white mt-2">
                  FREEZE WARRANT ISSUED
                </h3>
                <p className="text-xs text-specter-muted mt-1">
                  Exchange compliance intake portal confirmed receipt and initiated temporary hold.
                </p>
              </div>

              {/* Warrant Receipt Card */}
              <div className="bg-specter-darkest border border-specter-border rounded-xl p-4 text-left font-mono space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-specter-muted">OFFICIAL WARRANT RECEIPT:</span>
                  <div className="flex items-center gap-1.5 text-specter-emerald font-bold">
                    <span>{warrantReceipt.warrant_id}</span>
                    <button
                      onClick={handleCopyWarrant}
                      className="p-1 hover:text-white transition-colors"
                      title="Copy Warrant ID"
                    >
                      {copiedWarrant ? <Check className="h-3 w-3 text-specter-emerald" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-specter-muted">TARGET ACCOUNT LOCK STATUS:</span>
                  <span className="text-specter-gold font-bold">{warrantReceipt.target_account_status}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-specter-muted">SUBMISSION RECEIPT TIMESTAMP:</span>
                  <span className="text-gray-300">{warrantReceipt.receipt_timestamp_utc}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="http://localhost:3000/exchange/compliance-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-specter-cyan/15 hover:bg-specter-cyan/25 border border-specter-cyan/40 text-specter-cyan font-mono text-xs font-semibold transition-all"
                >
                  <span>VIEW COMPLIANCE INTAKE PORTAL</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-specter-emerald hover:bg-emerald-400 text-black font-mono font-bold text-xs tracking-wider transition-colors shadow-neon-emerald"
                >
                  DONE &amp; ARCHIVE CASE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
