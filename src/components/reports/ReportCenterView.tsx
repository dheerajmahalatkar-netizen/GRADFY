import React, { useState } from 'react';
import { Batch } from '../../types';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface ReportCenterViewProps {
  batches: Batch[];
  onOpenReport: (batch: Batch) => void;
  onOpenVerification: (reportId: string) => void;
}

export const ReportCenterView: React.FC<ReportCenterViewProps> = ({
  batches,
  onOpenReport,
  onOpenVerification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const gradedBatches = batches.filter((b) => b.analysisResult);

  const filtered = gradedBatches.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      b.batchCode.toLowerCase().includes(q) ||
      b.farmerName.toLowerCase().includes(q) ||
      (b.qualityPassport?.reportId.toLowerCase().includes(q) ?? false);

    const matchesGrade =
      gradeFilter === 'all' || b.analysisResult?.overallGrade === gradeFilter;

    const matchesVerif =
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && Boolean(b.humanVerification)) ||
      (verificationFilter === 'pending' && !b.humanVerification);

    return matchesQuery && matchesGrade && matchesVerif;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#182f23] to-[#14291f] rounded-2xl text-white border border-[#2d4d3b] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/30 font-semibold">
              DOCUMENT REGISTRY
            </span>
            <span className="text-xs text-neutral-400">· Official Quality Certificates</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Agricultural Quality Reports & Audit Registry</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Archived inspection certificates, certified lot reports, and verifiable QR passports.
          </p>
        </div>

        <div className="text-right font-mono text-xs text-neutral-300">
          <div>TOTAL ISSUED REPORTS: <strong className="text-white">{gradedBatches.length}</strong></div>
          <div className="text-[11px] text-[#86efac]">VERIFIABLE VIA SHA-256 AUDIT</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Report ID, Batch Code, or Farmer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#dad2c3] focus:outline-none focus:ring-2 focus:ring-[#1b382b]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#dad2c3] bg-white text-xs font-medium"
            >
              <option value="all">All Grades</option>
              <option value="Grade A">Grade A Only</option>
              <option value="Grade B">Grade B Only</option>
              <option value="Grade C">Grade C Only</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#dad2c3] bg-white text-xs font-medium"
            >
              <option value="all">All Audit States</option>
              <option value="verified">Inspector Signed</option>
              <option value="pending">Automated Only</option>
            </select>
          </div>
        </div>

        {/* Table of Reports */}
        <div className="border border-[#e5dec9] rounded-xl overflow-hidden mt-3">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f5ee] border-b border-[#e5dec9] text-[#556159] font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Report ID</th>
                <th className="p-3">Batch Code & Farmer</th>
                <th className="p-3">Certified Grade</th>
                <th className="p-3">OQI Score</th>
                <th className="p-3">Verification</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6da]">
              {filtered.map((batch) => {
                const analysis = batch.analysisResult!;
                const passport = batch.qualityPassport;
                const isVerified = Boolean(batch.humanVerification);

                return (
                  <tr key={batch.id} className="hover:bg-[#fbf9f5] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#14291f]">
                      {passport?.reportId || `REP-${batch.batchCode}`}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-[#14291f]">{batch.batchCode}</div>
                      <div className="text-[11px] text-[#556159]">
                        {batch.farmerName} · {batch.quantityKg} kg
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          analysis.overallGrade === 'Grade A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : analysis.overallGrade === 'Grade B'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {analysis.overallGrade}
                      </span>
                    </td>

                    <td className="p-3 font-mono font-bold text-[#14291f] tabular-nums">
                      {analysis.oqiScore}/100
                    </td>

                    <td className="p-3">
                      {isVerified ? (
                        <span className="text-emerald-700 flex items-center gap-1 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Inspector Signed
                        </span>
                      ) : (
                        <span className="text-[#556159] text-[11px]">AI Calibrated</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {passport && (
                          <button
                            onClick={() => onOpenVerification(passport.reportId)}
                            className="px-2.5 py-1 text-xs font-mono text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                          >
                            Verify QR
                          </button>
                        )}
                        <button
                          onClick={() => onOpenReport(batch)}
                          className="px-3 py-1 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View Report</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
