import React, { useEffect, useState } from 'react';
import { Batch } from '../../types';
import { generateQrCodeDataUrl } from '../../services/qrService';
import { Printer, Download, Share2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface DigitalQualityReportModalProps {
  batch: Batch;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalQualityReportModal: React.FC<DigitalQualityReportModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  const passport = batch.qualityPassport;
  const analysis = batch.analysisResult;
  const verification = batch.humanVerification;

  useEffect(() => {
    if (passport?.qrPayload) {
      generateQrCodeDataUrl(passport.qrPayload).then(setQrUrl);
    }
  }, [passport]);

  if (!isOpen || !analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:fixed">
      <div className="bg-white rounded-2xl border border-[#dad2c3] max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col my-8 print:border-none print:shadow-none print:my-0">
        {/* Action Header (Hidden in print) */}
        <div className="px-6 py-4 border-b border-[#e5dec9] bg-[#fbf9f5] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#c85a32]">GRADFY OFFICIAL REPORT</span>
            <span className="text-neutral-400">·</span>
            <span className="text-xs font-mono text-[#556159]">{batch.batchCode}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-8 sm:p-10 space-y-6 text-[#1f2421]">
          {/* Header & Logo */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-[#1b382b]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#14291f]">GRADFY</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-[#c85a32]/10 text-[#c85a32] rounded font-bold">
                  AGRI-AI QUALITY PASSPORT
                </span>
              </div>
              <p className="text-xs text-[#525e57] mt-1 max-w-md">
                National Agricultural Quality Assessment & Computer-Vision Traceability Certificate
              </p>
              <div className="text-[11px] text-[#556159] font-mono mt-2">
                Report ID: {passport?.reportId || `REP-${batch.batchCode}`} · Issue Date:{' '}
                {new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Scannable Verification QR Code */}
            <div className="text-center">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Quality Passport QR"
                  className="w-24 h-24 object-contain border border-[#dad2c3] p-1 rounded"
                />
              ) : (
                <div className="w-24 h-24 bg-neutral-100 rounded border border-[#dad2c3]" />
              )}
              <span className="text-[9px] font-mono text-[#525e57] block mt-1">SCAN TO AUDIT</span>
            </div>
          </div>

          {/* Core Entity Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#fbf9f5] border border-[#e5dec9] text-xs">
            <div>
              <span className="text-[10px] text-[#556159] uppercase font-mono block">Batch Code</span>
              <span className="font-mono font-bold text-[#14291f] text-sm">{batch.batchCode}</span>
              <span className="text-[11px] text-[#525e57] block">{batch.variety}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#556159] uppercase font-mono block">Farmer / Origin</span>
              <span className="font-semibold text-[#14291f] text-sm block">{batch.farmerName}</span>
              <span className="text-[11px] text-[#525e57]">{batch.location}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#556159] uppercase font-mono block">Procurement Hub</span>
              <span className="font-semibold text-[#14291f] text-sm block">
                {passport?.procurementCenter || 'GRADFY Regional Hub'}
              </span>
              <span className="text-[11px] text-[#525e57]">Quantity: {batch.quantityKg} kg</span>
            </div>

            <div>
              <span className="text-[10px] text-[#556159] uppercase font-mono block">Audit Status</span>
              <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#15803d]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {verification ? 'INSPECTOR VERIFIED' : 'AI-ASSISTED AUDIT'}
              </span>
              <span className="text-[10px] font-mono text-[#556159] block mt-0.5">
                Model: {analysis.model.name}
              </span>
            </div>
          </div>

          {/* Certified Grade & OQI Hero Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#1b382b] text-white flex flex-col justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-200">
                Official Assigned Grade
              </span>
              <div className="text-3xl font-black font-mono my-2 text-white">
                {analysis.overallGrade}
              </div>
              <span className="text-[11px] text-emerald-100">
                Distribution: {analysis.gradeDistribution.gradeA}% A · {analysis.gradeDistribution.gradeB}% B · {analysis.gradeDistribution.gradeC}% C
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#f4efe6] border border-[#dad2c3] flex flex-col justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#556159]">
                GRADFY Quality Index (OQI)
              </span>
              <div className="text-3xl font-black font-mono my-2 text-[#14291f] tabular-nums">
                {analysis.oqiScore}
                <span className="text-sm font-normal text-[#556159]">/100</span>
              </div>
              <span className="text-[11px] text-[#525e57]">
                Configured Export / Mandi Weights Applied
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#f4efe6] border border-[#dad2c3] flex flex-col justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#556159]">
                Storage Spoilage Risk
              </span>
              <div
                className={`text-2xl font-bold font-mono my-2 ${
                  analysis.storageRisk.level === 'LOW'
                    ? 'text-emerald-700'
                    : analysis.storageRisk.level === 'MEDIUM'
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {analysis.storageRisk.level} RISK
              </div>
              <span className="text-[11px] text-[#525e57]">
                Score: {analysis.storageRisk.riskScore}/100
              </span>
            </div>
          </div>

          {/* Observable Factor Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14291f] border-b border-[#dad2c3] pb-1">
              Observable Characteristics & Quality Breakdown
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#e5dec9] rounded-lg">
                <span className="font-semibold text-[#14291f] block">Size Uniformity (25% Weight)</span>
                <p className="text-[11px] text-[#556159] mt-0.5">
                  {analysis.oqiBreakdown.sizeUniformity.observation}
                </p>
              </div>

              <div className="p-3 bg-white border border-[#e5dec9] rounded-lg">
                <span className="font-semibold text-[#14291f] block">Visible Defect Rate (30% Weight)</span>
                <p className="text-[11px] text-[#556159] mt-0.5">
                  {analysis.oqiBreakdown.defectRate.observation}
                </p>
              </div>

              <div className="p-3 bg-white border border-[#e5dec9] rounded-lg">
                <span className="font-semibold text-[#14291f] block">Sprouting Dormancy (20% Weight)</span>
                <p className="text-[11px] text-[#556159] mt-0.5">
                  {analysis.oqiBreakdown.sproutingRate.observation}
                </p>
              </div>

              <div className="p-3 bg-white border border-[#e5dec9] rounded-lg">
                <span className="font-semibold text-[#14291f] block">Skin & Papery Tunic (15% Weight)</span>
                <p className="text-[11px] text-[#556159] mt-0.5">
                  {analysis.oqiBreakdown.skinCondition.observation}
                </p>
              </div>
            </div>
          </div>

          {/* Human Inspector Sign-Off (if verified) */}
          {verification && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Inspector Certification Record:
                </span>
                <span className="font-mono text-[11px] text-emerald-800">
                  Signed: {new Date(verification.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-emerald-900 mt-1">
                <strong>Inspector: </strong>
                {verification.verifiedBy} ({verification.role})
              </p>
              <p className="text-emerald-900">
                <strong>Notes: </strong>
                {verification.inspectorNotes}
              </p>
            </div>
          )}

          {/* Mandatory Section 19 Compliance Disclaimer */}
          <div className="pt-4 border-t border-[#dad2c3] text-[11px] text-[#556159] leading-relaxed">
            <p>
              <strong>Important Regulatory Notice: </strong>
              Results represent AI-assisted assessment of observable characteristics in the captured
              sample/images according to configured grading parameters. Storage risk indicators are
              decision-support metrics based on visible surface cues and do not constitute an
              unconditional shelf-life guarantee.
            </p>
            <div className="mt-2 font-mono text-[10px] text-neutral-400 flex items-center justify-between">
              <span>SHA-256: {passport?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e'}</span>
              <span>GRADFY Certified Traceability System v2026.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
