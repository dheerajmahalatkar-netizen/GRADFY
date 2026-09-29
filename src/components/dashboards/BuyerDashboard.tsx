import React, { useState } from 'react';
import { Batch, GradeClassification } from '../../types';
import { BatchComparisonModal } from '../batch/BatchComparisonModal';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileText,
  ShieldCheck,
  QrCode,
  ArrowUpDown,
  Download,
  Plus,
  ArrowLeftRight,
} from 'lucide-react';

interface BuyerDashboardProps {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
  onNewBatch: () => void;
  onOpenReport: (batch: Batch) => void;
  onOpenLots: (batch: Batch) => void;
  onOpenVerification: (batch: Batch) => void;
  onOpenQrVerification: () => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  batches,
  onSelectBatch,
  onNewBatch,
  onOpenReport,
  onOpenLots,
  onOpenVerification,
  onOpenQrVerification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'oqi' | 'quantity'>('date');
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Overview metrics
  const totalVolumeKg = batches.reduce((acc, b) => acc + (b.quantityKg || 0), 0);
  const totalLotsSegregated = batches.reduce((acc, b) => acc + (b.lots?.length || 0), 0);
  const pendingReviewCount = batches.filter(
    (b) => b.analysisResult?.flaggedForHumanReview && !b.humanVerification
  ).length;

  // Filter & Search logic
  const filteredBatches = batches
    .filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.batchCode.toLowerCase().includes(q) ||
        b.farmerName.toLowerCase().includes(q) ||
        b.variety.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);

      const matchesGrade =
        gradeFilter === 'all' || b.analysisResult?.overallGrade === gradeFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'verified' && Boolean(b.humanVerification)) ||
        (statusFilter === 'pending' && b.analysisResult?.flaggedForHumanReview && !b.humanVerification) ||
        (statusFilter === 'lots' && Boolean(b.lots && b.lots.length > 0));

      return matchesSearch && matchesGrade && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'oqi') {
        return (b.analysisResult?.oqiScore || 0) - (a.analysisResult?.oqiScore || 0);
      }
      if (sortBy === 'quantity') {
        return (b.quantityKg || 0) - (a.quantityKg || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#1b382b] to-[#14291f] rounded-2xl text-white border border-[#2d4d3b] shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#c85a32]/20 text-[#f6ad55] border border-[#c85a32]/30 font-semibold">
              BUYER & PROCUREMENT HUB
            </span>
            <span className="text-xs text-neutral-400">· APMC Lasalgaon Terminal #4</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Onion Intake, Lot Allocation & Procurement</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Intake quality analytics, lot segregation for export/domestic retail, and traceability audit.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-white/20"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#86efac]" />
            <span>Compare Batches</span>
          </button>
          <button
            onClick={onOpenQrVerification}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border border-white/20"
          >
            <QrCode className="w-4 h-4 text-[#86efac]" />
            <span>Verify Passport QR</span>
          </button>
          <button
            onClick={onNewBatch}
            className="px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Intake New Batch</span>
          </button>
        </div>
      </div>

      {/* Procurement KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Total Procurement Volume</div>
          <div className="text-2xl font-bold font-mono text-[#14291f] mt-1 tabular-nums">
            {totalVolumeKg.toLocaleString()} kg
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">
            Across {batches.length} registered mandi lots
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Commercial Lots Segregated</div>
          <div className="text-2xl font-bold font-mono text-[#1b382b] mt-1 tabular-nums">
            {totalLotsSegregated} Lots
          </div>
          <div className="text-[10px] text-[#556159] mt-1">Export, domestic & industrial</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Pending Human Review</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {pendingReviewCount} Batches
          </div>
          <div className="text-[10px] text-amber-800 font-medium mt-1">
            Low AI confidence or high sprouting
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Certified Quality Passports</div>
          <div className="text-2xl font-bold font-mono text-[#15803d] mt-1 tabular-nums">
            {batches.filter((b) => b.qualityPassport).length} Active
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">
            100% scannable QR verification
          </div>
        </div>
      </div>

      {/* Real Search & Filter Controls (Section 21 compliance) */}
      <div className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Batch Code, Farmer Name, Location, or Variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#dad2c3] focus:outline-none focus:ring-2 focus:ring-[#1b382b]"
            />
          </div>

          {/* Grade filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#f5f0e8] p-1 rounded-lg border border-[#dad2c3] text-xs">
              <span className="text-[11px] font-semibold text-[#556159] px-1.5">Grade:</span>
              {['all', 'Grade A', 'Grade B', 'Grade C'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    gradeFilter === g
                      ? 'bg-white text-[#14291f] shadow-2xs'
                      : 'text-[#556159] hover:text-[#14291f]'
                  }`}
                >
                  {g === 'all' ? 'All' : g.replace('Grade ', '')}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-[#f5f0e8] p-1 rounded-lg border border-[#dad2c3] text-xs">
              <span className="text-[11px] font-semibold text-[#556159] px-1.5">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-[#14291f] shadow-2xs'
                    : 'text-[#556159] hover:text-[#14291f]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'verified'
                    ? 'bg-white text-[#14291f] shadow-2xs'
                    : 'text-[#556159] hover:text-[#14291f]'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-white text-[#14291f] shadow-2xs'
                    : 'text-[#556159] hover:text-[#14291f]'
                }`}
              >
                Needs Review
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-lg border border-[#dad2c3] bg-white text-xs font-medium text-[#14291f]"
            >
              <option value="date">Sort by Date</option>
              <option value="oqi">Sort by Quality (OQI)</option>
              <option value="quantity">Sort by Quantity</option>
            </select>
          </div>
        </div>

        {/* Batches Table */}
        <div className="border border-[#e5dec9] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f5ee] border-b border-[#e5dec9] text-[#556159] font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Batch Code</th>
                <th className="p-3">Farmer & Location</th>
                <th className="p-3">Variety / Harvest</th>
                <th className="p-3 text-right">Volume</th>
                <th className="p-3 text-center">Grade / OQI</th>
                <th className="p-3">Audit State</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece6da]">
              {filteredBatches.map((batch) => {
                const analysis = batch.analysisResult;
                const isVerified = Boolean(batch.humanVerification);
                const hasLots = Boolean(batch.lots && batch.lots.length > 0);

                return (
                  <tr key={batch.id} className="hover:bg-[#fbf9f5] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#14291f]">
                      <div className="flex items-center gap-1.5">
                        <span>{batch.batchCode}</span>
                        {batch.isDemoData && (
                          <span className="text-[9px] px-1 py-0.2 bg-[#f0eae0] text-[#556159] rounded">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-[#14291f]">{batch.farmerName}</div>
                      <div className="text-[11px] text-[#556159]">{batch.location}</div>
                    </td>

                    <td className="p-3">
                      <div>{batch.variety}</div>
                      <div className="text-[11px] text-[#556159]">Arr: {batch.arrivalDate}</div>
                    </td>

                    <td className="p-3 text-right font-mono font-bold tabular-nums">
                      {batch.quantityKg} kg
                      <div className="text-[10px] font-normal text-[#556159]">
                        {batch.crateCount} crates
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      {analysis ? (
                        <div className="inline-flex flex-col items-center">
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
                          <span className="text-[10px] font-mono text-[#556159] mt-0.5">
                            OQI {analysis.oqiScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Pending AI</span>
                      )}
                    </td>

                    <td className="p-3">
                      {isVerified ? (
                        <span className="text-emerald-700 flex items-center gap-1 text-[11px] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : analysis?.flaggedForHumanReview ? (
                        <button
                          onClick={() => onOpenVerification(batch)}
                          className="text-amber-700 hover:text-amber-900 flex items-center gap-1 text-[11px] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Verify Now
                        </button>
                      ) : (
                        <span className="text-[#556159] text-[11px]">AI Certified</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenLots(batch)}
                          className="px-2.5 py-1 text-xs font-medium text-[#1b382b] bg-[#f4efe6] hover:bg-[#eae2d3] rounded-md transition-colors flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{hasLots ? 'Lots' : '+ Lot'}</span>
                        </button>

                        <button
                          onClick={() => onOpenReport(batch)}
                          className="px-2.5 py-1 text-xs font-medium text-[#1b382b] bg-[#f4efe6] hover:bg-[#eae2d3] rounded-md transition-colors"
                        >
                          Report
                        </button>

                        <button
                          onClick={() => onSelectBatch(batch)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[#1b382b] hover:bg-[#14291f] rounded-md transition-colors"
                        >
                          Inspect
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

      {compareModalOpen && (
        <BatchComparisonModal
          batches={batches}
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          onSelectBatch={(b) => {
            setCompareModalOpen(false);
            onSelectBatch(b);
          }}
        />
      )}
    </div>
  );
};
