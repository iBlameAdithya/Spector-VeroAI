import { useState } from 'react';
import type {
  TraceResponse,
  PrepareFreezeResponse,
  SignAndSubmitResponse,
} from '../types/api';
import { api } from '../services/api';
import { Lock, UserCheck, CheckCircle2, ShieldCheck, AlertCircle, FileKey } from 'lucide-react';

interface FreezeWorkflowSectionProps {
  traceData: TraceResponse;
}

export const FreezeWorkflowSection: React.FC<FreezeWorkflowSectionProps> = ({ traceData }) => {
  const [prepareState, setPrepareState] = useState<PrepareFreezeResponse | null>(null);
  const [submitState, setSubmitState] = useState<SignAndSubmitResponse | null>(null);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [officerBadgeId, setOfficerBadgeId] = useState<string>('');
  const [signatureToken, setSignatureToken] = useState<string>('ED25519_SIG_CONFIRMED_OK');
  const [approvedAttestation, setApprovedAttestation] = useState<boolean>(true);

  const vasp = traceData.tracing_summary.destination_vasp;

  const handlePrepareFreeze = async () => {
    if (!vasp) {
      setErrorMsg(
        'Unable to prepare asset hold: No destination exchange identified for this trace. Asset hold requests require a target exchange deposit address.'
      );
      return;
    }
    setIsPreparing(true);
    setErrorMsg(null);
    try {
      const res = await api.prepareFreeze({
        case_id: traceData.case_id,
        target_vasp: vasp.name,
        deposit_address: vasp.deposit_address,
      });
      setPrepareState(res);
    } catch (err: unknown) {
      console.error('[DEV ERROR] prepareFreeze API call failed:', err);
      const rawError = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        `UNABLE TO PREPARE ASSET HOLD — The backend rejected the request. Please review the investigation details and try again.${
          import.meta.env.DEV ? ` (Dev Log: ${rawError})` : ''
        }`
      );
    } finally {
      setIsPreparing(false);
    }
  };

  const handleSignAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvedAttestation) {
      setErrorMsg('Attestation required before signing');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.signAndSubmitFreeze({
        case_id: traceData.case_id,
        officer_badge_id: officerBadgeId.trim(),
        signature_token: signatureToken.trim(),
        approved: approvedAttestation,
      });
      setSubmitState(res);
    } catch (err: unknown) {
      console.error('[DEV ERROR] signAndSubmitFreeze API call failed:', err);
      const rawError = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        `Unable to submit asset hold order. The backend rejected the request. Please review the investigation details and try again.${
          import.meta.env.DEV ? ` (Dev Log: ${rawError})` : ''
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = submitState ? 4 : prepareState ? 3 : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 mb-4 shadow-xs font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 font-mono">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
            ACTION: AUTHORIZE ASSET HOLD
          </h3>
        </div>

        <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
          OFFICER APPROVAL REQUIRED
        </span>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 mb-4 font-mono text-xs text-center">
        <div
          className={`p-2 rounded border transition-colors ${
            currentStep >= 1
              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          1. Prepare Request
        </div>
        <div
          className={`p-2 rounded border transition-colors ${
            currentStep >= 2
              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          2. Review Finding
        </div>
        <div
          className={`p-2 rounded border transition-colors ${
            currentStep >= 3
              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          3. Officer Signature
        </div>
        <div
          className={`p-2 rounded border transition-colors ${
            currentStep >= 4
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          4. Submit Hold Order
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 mb-3 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs flex items-center justify-between shadow-xs font-sans">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {vasp && (
            <button
              type="button"
              onClick={handlePrepareFreeze}
              className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-mono font-bold text-xs shrink-0 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Step 1: Initial Prepare Freeze Call */}
      {!prepareState && !submitState && (
        <div className="bg-slate-50 p-4 rounded border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-mono text-xs font-bold text-slate-900 uppercase mb-1">
                PREPARE EXCHANGE ASSET HOLD REQUEST
              </h4>
              <p className="text-xs text-slate-600 font-sans">
                {vasp
                  ? `Pre-fills official asset hold inputs for target exchange (${vasp.name}) and awaits authorized officer signature.`
                  : 'Requires a target exchange destination account identified in the money flow trace.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrepareFreeze}
              disabled={isPreparing || !vasp}
              className={`px-4 py-2 text-xs font-mono font-bold text-white rounded transition-colors shadow-xs flex items-center gap-2 ${
                isPreparing || !vasp
                  ? 'bg-slate-400 opacity-60 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isPreparing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>PREPARING ASSET HOLD...</span>
                </>
              ) : (
                <>
                  <FileKey className="w-4 h-4" />
                  <span>PREPARE ASSET HOLD</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 & 3: Human-in-the-Loop Form */}
      {prepareState && !submitState && (
        <div className="space-y-4 font-sans text-xs">
          <div className="bg-amber-50 border border-amber-300 rounded p-3 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>AWAITING OFFICER SIGNATURE:</strong> Form pre-filled. Enter badge ID and signature to issue hold order.
              </span>
            </div>

            <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
              READY FOR REVIEW
            </span>
          </div>

          {/* Prefilled Fields Preview */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2 font-mono">
              PRE-FILLED EXCHANGE HOLD INPUTS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Case Reference:</span>
                <span className="font-bold text-slate-900">{prepareState.prefilled_fields.case_ref}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Suspect Account:</span>
                <span className="font-bold text-slate-900 break-all text-[10px]">
                  {prepareState.prefilled_fields.suspect_deposit_address}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Claim Value:</span>
                <span className="font-bold text-emerald-700">{prepareState.prefilled_fields.claim_value}</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[9px]">Evidence ID:</span>
                <span className="font-bold text-slate-900 break-all text-[10px]">
                  {prepareState.prefilled_fields.merkle_proof.slice(0, 16)}...
                </span>
              </div>
            </div>
          </div>

          {/* Form for Officer Badge & Signature Token */}
          <form onSubmit={handleSignAndSubmit} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3 font-mono">
            <h4 className="font-mono text-xs font-bold text-slate-900 uppercase">
              AUTHORIZING OFFICER SIGNATURE & STAMP
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                  Officer Badge ID
                </label>
                <input
                  type="text"
                  required
                  value={officerBadgeId}
                  onChange={(e) => setOfficerBadgeId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                  Digital Signature Token
                </label>
                <input
                  type="text"
                  required
                  value={signatureToken}
                  onChange={(e) => setSignatureToken(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-slate-800">
                <input
                  type="checkbox"
                  checked={approvedAttestation}
                  onChange={(e) => setApprovedAttestation(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I attest that evidence has been reviewed under statutory authority and authorize immediate asset hold.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 text-xs font-mono font-bold text-white rounded bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-2 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>SUBMITTING...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>SIGN & SUBMIT HOLD ORDER</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Final Warrant Issued Receipt */}
      {submitState && (
        <div className="bg-emerald-50 border border-emerald-300 rounded p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm uppercase">ASSET HOLD ORDER ISSUED</span>
            </div>

            <span className="bg-emerald-700 text-white px-2.5 py-0.5 rounded font-bold text-[11px]">
              {submitState.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase">HOLD RECEIPT NUMBER</span>
              <span className="font-bold text-slate-900 text-xs">{submitState.warrant_id}</span>
            </div>

            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase">TARGET ACCOUNT LOCK</span>
              <span className="font-bold text-emerald-800 text-xs">{submitState.target_account_status}</span>
            </div>

            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-[10px] text-slate-500 block uppercase">ISSUANCE TIME (UTC)</span>
              <span className="font-medium text-slate-800 text-xs">{submitState.receipt_timestamp_utc}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
