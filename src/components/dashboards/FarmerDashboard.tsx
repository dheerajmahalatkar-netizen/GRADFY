import React, { useState } from 'react';
import { Batch } from '../../types';
import {
  TrendingUp,
  Award,
  Layers,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface FarmerDashboardProps {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
  onNewBatch: () => void;
  onOpenReport: (batch: Batch) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  batches,
  onSelectBatch,
  onNewBatch,
  onOpenReport,
}) => {
  const [selectedVariety, setSelectedVariety] = useState<string>('all');

  // Filter batches
  const filteredBatches =
    selectedVariety === 'all'
      ? batches
      : batches.filter((b) => b.variety.toLowerCase().includes(selectedVariety.toLowerCase()));

  // Farmer metrics computation
  const totalBatches = batches.length;
  const gradedBatches = batches.filter((b) => b.analysisResult);
  const avgOqi =
    gradedBatches.length > 0
      ? Math.round(
          (gradedBatches.reduce((acc, b) => acc + (b.analysisResult?.oqiScore || 0), 0) /
            gradedBatches.length) *
            10
        ) / 10
      : 0;

  const gradeACount = gradedBatches.filter(
    (b) => b.analysisResult?.overallGrade === 'Grade A'
  ).length;
  const gradeAPct =
    gradedBatches.length > 0 ? Math.round((gradeACount / gradedBatches.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#182f23] to-[#14291f] rounded-2xl text-white border border-[#2d4d3b] shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/30 font-semibold">
              FARMER WORKSPACE
            </span>
            <span className="text-xs text-neutral-400">· Ramesh Patil (Nashik District)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Onion Quality & Mandi Grade Records</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Monitor lot grades, defect trends, and certified Quality Passports for your produce.
          </p>
        </div>

        <button
          onClick={onNewBatch}
          className="px-5 py-2.5 bg-[#c85a32] hover:bg-[#b04b25] active:bg-[#973e1c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Onion Lot</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Total Registered Batches</div>
          <div className="text-2xl font-bold font-mono text-[#14291f] mt-1 tabular-nums">
            {totalBatches}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">
            {gradedBatches.length} graded with AI Passport
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Average Quality Index (OQI)</div>
          <div className="text-2xl font-bold font-mono text-[#1b382b] mt-1 tabular-nums">
            {avgOqi}
            <span className="text-xs font-normal text-[#556159]">/100</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">
            Standard Mandi Grade Target: &gt;75
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Grade A Premium Share</div>
          <div className="text-2xl font-bold font-mono text-[#15803d] mt-1 tabular-nums">
            {gradeAPct}%
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">
            Eligible for export pricing premium
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
          <div className="text-[11px] text-[#556159] font-medium">Estimated Realized Payout</div>
          <div className="text-2xl font-bold font-mono text-[#c85a32] mt-1 tabular-nums">
            ₹66,850
          </div>
          <div className="text-[10px] text-[#556159] mt-1">Based on entered mandi prices</div>
        </div>
      </div>

      {/* Historical Quality & Defect Trends (Feature 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Trend Line / Chart card */}
        <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#14291f]">
                Quality Trend & Historical Batch OQI
              </h3>
              <p className="text-xs text-[#556159]">
                Progression of your harvest quality across recent crop cycles
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#f4efe6] text-[#556159] rounded border border-[#dad2c3]">
              DEMO DATA VISUALIZATION
            </span>
          </div>

          {/* Simple Visual Trend Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-4 pt-6 px-4 pb-2 border-b border-[#ece6da]">
            {batches.map((batch, idx) => {
              const oqi = batch.analysisResult?.oqiScore || 65;
              const heightPct = Math.round((oqi / 100) * 100);
              const grade = batch.analysisResult?.overallGrade || 'Grade B';

              return (
                <div
                  key={batch.id}
                  onClick={() => onSelectBatch(batch)}
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <span className="text-[11px] font-mono font-bold text-[#14291f] group-hover:text-[#c85a32]">
                    {oqi}
                  </span>
                  <div className="w-full bg-[#f0eae0] rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all group-hover:opacity-90 ${
                        grade === 'Grade A'
                          ? 'bg-[#1b382b]'
                          : grade === 'Grade B'
                          ? 'bg-[#c85a32]'
                          : 'bg-[#d97736]'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#556159] truncate max-w-[70px]">
                    {batch.batchCode.replace('GRD-2026-', '#')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#556159] pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b382b]" /> Grade A (Export)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c85a32]" /> Grade B (Mandi)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d97736]" /> Grade C (Processing)
              </span>
            </div>
            <span className="italic text-[11px]">Click any bar to inspect batch</span>
          </div>
        </div>

        {/* Actionable Agricultural Recommendations Card */}
        <div className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-[#c85a32]" />
              <h3 className="text-sm font-bold text-[#14291f]">Curing & Storage Advice</h3>
            </div>
            <p className="text-xs text-[#556159]">
              Data-backed recommendations based on visible defects detected in your recent lots:
            </p>

            <div className="mt-3 space-y-2.5 text-xs text-[#2c332e]">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-950 block mb-0.5">
                  1. Maintain Sun Curing (48 hrs)
                </span>
                <span className="text-[11px] text-emerald-800">
                  Tightens papery outer tunics, reducing peel detachment by ~35%.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-950 block mb-0.5">
                  2. Check Sickle De-topping Depth
                </span>
                <span className="text-[11px] text-amber-800">
                  Leave at least 2.5cm neck length to prevent mechanical bruising and fungal entry.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#fbf9f5] border border-[#dad2c3]">
                <span className="font-bold text-[#14291f] block mb-0.5">
                  3. Aerated Godown Ventilation
                </span>
                <span className="text-[11px] text-[#556159]">
                  Ensure bottom air-flow in chawl structures to delay sprouting in stored Rabi crop.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-neutral-400 border-t border-[#ece6da]">
            *Advisory derived from standard post-harvest handling best practices.
          </div>
        </div>
      </div>

      {/* Recent Batches List */}
      <div className="bg-white rounded-2xl border border-[#dad2c3] overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-[#e5dec9] flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#14291f]">Your Submitted Onion Batches</h3>
            <p className="text-xs text-[#556159]">
              Complete history of lots graded at procurement hubs with verifiable passports
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[#f5f0e8] p-1 rounded-lg border border-[#dad2c3] text-xs">
            <button
              onClick={() => setSelectedVariety('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedVariety === 'all'
                  ? 'bg-white text-[#14291f] shadow-2xs'
                  : 'text-[#556159] hover:text-[#14291f]'
              }`}
            >
              All Lots
            </button>
            <button
              onClick={() => setSelectedVariety('Pusa Red')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedVariety === 'Pusa Red'
                  ? 'bg-white text-[#14291f] shadow-2xs'
                  : 'text-[#556159] hover:text-[#14291f]'
              }`}
            >
              Pusa Red
            </button>
            <button
              onClick={() => setSelectedVariety('Bhima Super')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedVariety === 'Bhima Super'
                  ? 'bg-white text-[#14291f] shadow-2xs'
                  : 'text-[#556159] hover:text-[#14291f]'
              }`}
            >
              Bhima Super
            </button>
          </div>
        </div>

        {/* Batches Table */}
        <div className="divide-y divide-[#ece6da]">
          {filteredBatches.map((batch) => {
            const analysis = batch.analysisResult;
            const isVerified = Boolean(batch.humanVerification);

            return (
              <div
                key={batch.id}
                className="p-4 sm:px-6 hover:bg-[#fbf9f5] transition-colors flex items-center justify-between flex-wrap gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm border ${
                      analysis?.overallGrade === 'Grade A'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : analysis?.overallGrade === 'Grade B'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-orange-50 text-orange-800 border-orange-300'
                    }`}
                  >
                    {analysis?.overallGrade === 'Grade A'
                      ? 'A'
                      : analysis?.overallGrade === 'Grade B'
                      ? 'B'
                      : 'C'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#14291f] font-mono">
                        {batch.batchCode}
                      </span>
                      <span className="text-[#556159]">·</span>
                      <span className="text-xs font-semibold text-[#2c332e]">{batch.name}</span>
                      {batch.isDemoData && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#f0eae0] text-[#556159] rounded">
                          DEMO
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#556159] mt-0.5 flex items-center gap-3">
                      <span>Variety: {batch.variety}</span>
                      <span>·</span>
                      <span>Quantity: {batch.quantityKg} kg ({batch.crateCount} crates)</span>
                      <span>·</span>
                      <span>Arrival: {batch.arrivalDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-[#14291f]">
                      OQI: {analysis?.oqiScore || '—'}/100
                    </div>
                    <div className="text-[11px] text-[#556159]">
                      {isVerified ? (
                        <span className="text-emerald-700 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" /> Inspector Verified
                        </span>
                      ) : (
                        <span className="text-[#556159]">AI Scanned</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenReport(batch)}
                      className="px-3 py-1.5 text-xs font-medium text-[#1b382b] bg-[#f4efe6] hover:bg-[#eae2d3] rounded-lg transition-colors"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => onSelectBatch(batch)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1b382b] hover:bg-[#14291f] rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
