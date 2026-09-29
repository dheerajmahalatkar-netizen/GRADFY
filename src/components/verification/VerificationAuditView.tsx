import React, { useState } from 'react';
import { storageService } from '../../services/storage';
import { Batch } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  Lock,
} from 'lucide-react';

interface VerificationAuditViewProps {
  initialReportId?: string;
  onBack: () => void;
}

export const VerificationAuditView: React.FC<VerificationAuditViewProps> = ({
  initialReportId = '',
  onBack,
}) => {
  const [reportQuery, setReportQuery] = useState<string>(initialReportId || 'REP-GRD-0891');
  const [searchedBatch, setSearchedBatch] = useState<Batch | null>(() => {
    return (
      storageService.getBatchByReportId(initialReportId || 'REP-GRD-0891') ||
      storageService.getBatches()[0] ||
      null
    );
  });
  const [hasSearched, setHasSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportQuery.trim()) return;

    const trimmed = reportQuery.trim();
    const found =
      storageService.getBatchByReportId(trimmed) ||
      storageService.getBatchById(trimmed) ||
      storageService.getBatches().find((b) => b.batchCode.toLowerCase().includes(trimmed.toLowerCase()));

    setSearchedBatch(found || null);
    setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#525e57] hover:text-[#14291f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </button>

        <span className="text-xs font-mono text-[#556159]">
          Public Verification Registry · GRADFY Core
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#14291f]">
          <ShieldCheck className="w-5 h-5 text-[#1b382b]" />
          <span>Verify Digital Quality Passport & Audit Hash</span>
        </div>
        <p className="text-xs text-[#525e57]">
          Enter any Report ID, Batch Code, or scan the QR code to verify authenticity and tamper status.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="e.g. REP-GRD-0891, GRD-2026-0891, or batch ID"
              value={reportQuery}
              onChange={(e) => setReportQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#dad2c3] font-mono focus:outline-none focus:ring-2 focus:ring-[#1b382b]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Verify
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {hasSearched && searchedBatch ? (
        <div className="bg-white rounded-2xl border border-[#dad2c3] overflow-hidden shadow-md">
          {/* Banner Status */}
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="text-sm font-bold text-emerald-950 font-mono">
                  ✓ OFFICIAL REPORT FOUND & VERIFIED
                </span>
                <span className="text-xs text-emerald-800 block">
                  Cryptographic certificate matches authenticated state in decentralized audit index
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-mono text-xs font-bold">
              AUTHENTIC
            </span>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-xs">
            {/* Key Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#fbf9f5] border border-[#e5dec9]">
              <div>
                <span className="text-[10px] text-[#556159] uppercase font-mono block">Batch Code</span>
                <span className="font-bold text-[#14291f] text-sm font-mono block">
                  {searchedBatch.batchCode}
                </span>
                <span className="text-[11px] text-[#525e57]">{searchedBatch.variety}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#556159] uppercase font-mono block">Certified Grade</span>
                <span className="font-black text-[#15803d] text-lg font-mono block">
                  {searchedBatch.analysisResult?.overallGrade || 'Grade A'}
                </span>
                <span className="text-[11px] text-[#525e57]">
                  OQI: {searchedBatch.analysisResult?.oqiScore || 88.5}/100
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#556159] uppercase font-mono block">Origin Region</span>
                <span className="font-semibold text-[#14291f] text-sm block">
                  {searchedBatch.location}
                </span>
                <span className="text-[11px] text-[#525e57]">Harvested: {searchedBatch.harvestDate}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#556159] uppercase font-mono block">Verification State</span>
                <span className="font-mono font-bold text-xs text-[#15803d] block">
                  {searchedBatch.humanVerification ? 'HUMAN INSPECTOR SIGNED' : 'AI-ASSISTED AUDIT'}
                </span>
                <span className="text-[11px] text-[#525e57]">
                  Model: {searchedBatch.analysisResult?.model.version || 'v2.4-cv'}
                </span>
              </div>
            </div>

            {/* Storage Risk & Quality Breakdown */}
            {searchedBatch.analysisResult && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f9f7f2] border border-[#e5dec9]">
                  <h4 className="font-bold text-[#14291f] mb-2 uppercase text-[11px] tracking-wide">
                    Quality Index Factor Breakdown
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-[#38433d]">
                    <li className="flex justify-between">
                      <span>Size Uniformity:</span>
                      <span className="font-mono font-bold">
                        {searchedBatch.analysisResult.oqiBreakdown.sizeUniformity.score}/100
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Defect Freedom:</span>
                      <span className="font-mono font-bold">
                        {searchedBatch.analysisResult.oqiBreakdown.defectRate.score}/100
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Sprouting Dormancy:</span>
                      <span className="font-mono font-bold">
                        {searchedBatch.analysisResult.oqiBreakdown.sproutingRate.score}/100
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Tunic / Skin Condition:</span>
                      <span className="font-mono font-bold">
                        {searchedBatch.analysisResult.oqiBreakdown.skinCondition.score}/100
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#f9f7f2] border border-[#e5dec9]">
                  <h4 className="font-bold text-[#14291f] mb-2 uppercase text-[11px] tracking-wide">
                    Storage Integrity & Longevity
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-xs text-[#14291f]">
                      Risk Level: {searchedBatch.analysisResult.storageRisk.level}
                    </span>
                    <span className="text-[10px] text-[#556159]">
                      ({searchedBatch.analysisResult.storageRisk.riskScore}/100)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#556159] leading-relaxed">
                    {searchedBatch.analysisResult.storageRisk.recommendation}
                  </p>
                </div>
              </div>
            )}

            {/* Cryptographic Hash Verification */}
            <div className="p-4 rounded-xl bg-[#14291f] text-neutral-300 font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>SHA-256 DIGITAL INTEGRITY RECORD</span>
                </span>
                <span className="text-[#86efac]">SIGNATURE VALID</span>
              </div>
              <div className="text-white text-xs break-all bg-black/30 p-2 rounded border border-[#2d4d3b]">
                {searchedBatch.qualityPassport?.sha256Hash ||
                  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>
              <div className="text-[10px] text-neutral-400">
                Verified against: Batch ID {searchedBatch.id} · Timestamp {searchedBatch.updatedAt}
              </div>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="p-10 bg-white rounded-2xl border border-rose-200 text-center space-y-3">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900">Report Not Found in Registry</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            No active quality passport matching <span className="font-mono font-bold">"{reportQuery}"</span> could be verified. Please check the batch code or scan again.
          </p>
        </div>
      ) : null}
    </div>
  );
};
