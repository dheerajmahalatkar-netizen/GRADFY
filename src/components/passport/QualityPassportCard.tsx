import React, { useEffect, useState } from 'react';
import { Batch, QualityPassport } from '../../types';
import { generateQrCodeDataUrl } from '../../services/qrService';
import {
  QrCode,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Download,
  Share2,
} from 'lucide-react';

interface QualityPassportCardProps {
  batch: Batch;
  onOpenVerification?: (reportId: string) => void;
}

export const QualityPassportCard: React.FC<QualityPassportCardProps> = ({
  batch,
  onOpenVerification,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const passport = batch.qualityPassport;
  const analysis = batch.analysisResult;

  useEffect(() => {
    if (passport?.qrPayload) {
      generateQrCodeDataUrl(passport.qrPayload).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [passport]);

  if (!passport || !analysis) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-[#dad2c3] text-center text-xs text-[#556159] bg-[#fbf9f5]">
        Digital Quality Passport generated after batch grading analysis.
      </div>
    );
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(passport.sha256Hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#182f23] via-[#14291f] to-[#0f1f17] text-white p-6 border border-[#2d4d3b] shadow-xl overflow-hidden">
      {/* Subtle Security Guilloche Background Watermark Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Banner: Passport Identity */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2d4d3b]/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-wide uppercase font-mono text-white">
                GRADFY QUALITY PASSPORT
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/30">
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Passport ID: {passport.passportId}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-neutral-400">REPORT ID</div>
          <div className="text-xs font-mono font-bold text-[#86efac]">{passport.reportId}</div>
        </div>
      </div>

      {/* Body: Grid Layout with Batch Details + Authentic QR Code */}
      <div className="py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10 items-center">
        {/* Left Column: Essential Metrics */}
        <div className="sm:col-span-2 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                Farmer / Origin
              </span>
              <span className="font-semibold text-white block text-sm">{passport.farmerName}</span>
              <span className="text-[11px] text-neutral-400">{passport.farmerLocation}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">
                Procurement Hub
              </span>
              <span className="font-semibold text-white block text-sm">
                {passport.procurementCenter}
              </span>
              <span className="text-[11px] text-neutral-400">Date: {passport.date}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0d1c14]/90 border border-[#2d4d3b] grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-neutral-400 font-mono">CERTIFIED GRADE</div>
              <div className="text-lg font-black font-mono text-[#4ade80]">
                {passport.overallGrade}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 font-mono">QUALITY INDEX</div>
              <div className="text-lg font-black font-mono text-white tabular-nums">
                {passport.oqiScore}
                <span className="text-xs font-normal text-neutral-400">/100</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 font-mono">STORAGE RISK</div>
              <div
                className={`text-sm font-bold font-mono mt-1 ${
                  passport.storageRiskLevel === 'LOW'
                    ? 'text-[#86efac]'
                    : passport.storageRiskLevel === 'MEDIUM'
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {passport.storageRiskLevel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-neutral-300">
            <span>Model: {passport.modelVersion}</span>
            <span className="text-neutral-500">·</span>
            <span>Batch Units: {analysis.totalBatchEstimatedUnits}</span>
            <span className="text-neutral-500">·</span>
            <span>Quantity: {batch.quantityKg} kg</span>
          </div>
        </div>

        {/* Right Column: Scannable QR Code */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl text-neutral-900 shadow-md">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Traceability QR Code"
              className="w-32 h-32 object-contain"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-neutral-100 text-neutral-400">
              <QrCode className="w-12 h-12" />
            </div>
          )}
          <span className="text-[10px] font-mono font-bold mt-1 text-[#14291f] tracking-tight">
            SCAN TO VERIFY REPORT
          </span>
        </div>
      </div>

      {/* Footer: SHA-256 Hash + Verification Link */}
      <div className="pt-3 border-t border-[#2d4d3b]/80 flex items-center justify-between flex-wrap gap-2 text-xs relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-neutral-400">SHA-256 HASH:</span>
          <span className="font-mono text-[11px] text-neutral-300 max-w-[200px] truncate">
            {passport.sha256Hash}
          </span>
          <button
            onClick={handleCopyHash}
            className="text-neutral-400 hover:text-white p-1 rounded"
            title="Copy SHA-256 hash"
          >
            {copied ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <button
          onClick={() => onOpenVerification?.(passport.reportId)}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#22c55e]/20 hover:bg-[#22c55e]/30 border border-[#22c55e]/40 rounded-lg text-xs font-mono text-[#86efac] transition-colors"
        >
          <span>Open Verification Audit</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
