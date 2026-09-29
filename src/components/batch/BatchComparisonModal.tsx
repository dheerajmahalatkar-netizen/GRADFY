import React, { useState } from 'react';
import { Batch } from '../../types';
import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  Layers,
} from 'lucide-react';

interface BatchComparisonModalProps {
  batches: Batch[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBatch?: (batch: Batch) => void;
}

export const BatchComparisonModal: React.FC<BatchComparisonModalProps> = ({
  batches,
  isOpen,
  onClose,
  onSelectBatch,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return batches.slice(0, 2).map((b) => b.id);
  });

  if (!isOpen) return null;

  const toggleBatch = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const comparedBatches = batches.filter((b) => selectedIds.includes(b.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f5] rounded-3xl border border-[#dad2c3] max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col my-6 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#e5dec9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b382b]/10 border border-[#1b382b]/20 flex items-center justify-center text-[#1b382b]">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14291f]">
                Multi-Batch Quality Comparison Matrix
              </h3>
              <p className="text-xs text-[#556159]">
                Compare OQI scores, defect density, and procurement value side-by-side
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Selection Bar */}
        <div className="px-6 py-3 bg-[#f5f0e8] border-b border-[#dad2c3] flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-semibold text-[#14291f]">
            Select up to 4 batches to compare ({selectedIds.length}/4 selected):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {batches.map((b) => {
              const isSelected = selectedIds.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBatch(b.id)}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors border ${
                    isSelected
                      ? 'bg-[#1b382b] text-white border-[#14291f] font-bold shadow-xs'
                      : 'bg-white text-[#556159] border-[#dad2c3] hover:text-[#14291f]'
                  }`}
                >
                  {b.batchCode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparedBatches.map((batch) => {
              const analysis = batch.analysisResult;
              const isVerified = Boolean(batch.humanVerification);

              return (
                <div
                  key={batch.id}
                  className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-[#ece6da]">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#14291f] block">
                          {batch.batchCode}
                        </span>
                        <span className="text-[11px] text-[#556159]">{batch.variety}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          analysis?.overallGrade === 'Grade A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : analysis?.overallGrade === 'Grade B'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {analysis?.overallGrade || 'Pending'}
                      </span>
                    </div>

                    {/* Producer & Volume */}
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#556159]">Farmer / Origin:</span>
                        <span className="font-semibold text-[#14291f]">{batch.farmerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#556159]">Intake Volume:</span>
                        <span className="font-mono font-bold">{batch.quantityKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#556159]">Arrival Date:</span>
                        <span>{batch.arrivalDate}</span>
                      </div>
                    </div>

                    {/* OQI Scorecard */}
                    {analysis && (
                      <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#e5dec9] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-[#556159]">
                            Quality Index
                          </span>
                          <span className="text-base font-black font-mono text-[#1b382b]">
                            {analysis.oqiScore}/100
                          </span>
                        </div>

                        {/* Defect percentage bars */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-[#556159]">Size Uniformity:</span>
                            <span className="font-mono font-bold">
                              {analysis.oqiBreakdown.sizeUniformity.score}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#556159]">Observable Defect:</span>
                            <span className="font-mono font-bold text-[#c85a32]">
                              {analysis.oqiBreakdown.defectRate.score}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#556159]">Sprouting Rate:</span>
                            <span className="font-mono font-bold">
                              {analysis.oqiBreakdown.sproutingRate.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Storage Risk */}
                    {analysis && (
                      <div className="text-xs flex items-center justify-between p-2.5 rounded-lg border border-black/5 bg-[#f5f0e8]">
                        <span className="text-[#556159]">Storage Longevity:</span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            analysis.storageRisk.level === 'LOW'
                              ? 'text-emerald-700'
                              : analysis.storageRisk.level === 'MEDIUM'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {analysis.storageRisk.level} RISK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => {
                      onSelectBatch?.(batch);
                      onClose();
                    }}
                    className="w-full py-2 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Inspect Batch Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
