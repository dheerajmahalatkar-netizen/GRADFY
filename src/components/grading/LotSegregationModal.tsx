import React, { useState } from 'react';
import { Batch, LotSegregation } from '../../types';
import { Layers, IndianRupee, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface LotSegregationModalProps {
  batch: Batch;
  isOpen: boolean;
  onClose: () => void;
  onSaveLots: (lots: LotSegregation[]) => void;
}

export const LotSegregationModal: React.FC<LotSegregationModalProps> = ({
  batch,
  isOpen,
  onClose,
  onSaveLots,
}) => {
  const analysis = batch.analysisResult;
  const dist = analysis?.gradeDistribution || { gradeA: 70, gradeB: 20, gradeC: 10, reject: 0 };

  // Lot percentage allocations initialized from AI grade distribution
  const [pctA, setPctA] = useState<number>(dist.gradeA);
  const [pctB, setPctB] = useState<number>(dist.gradeB);
  const [pctC, setPctC] = useState<number>(dist.gradeC + dist.reject);

  // User-entered reference prices (Feature 08 rule: Never hallucinate live prices)
  const [priceA, setPriceA] = useState<number>(32);
  const [priceB, setPriceB] = useState<number>(22);
  const [priceC, setPriceC] = useState<number>(12);

  if (!isOpen) return null;

  const totalKg = batch.quantityKg || 1000;
  const kgA = Math.round((pctA / 100) * totalKg);
  const kgB = Math.round((pctB / 100) * totalKg);
  const kgC = Math.round((pctC / 100) * totalKg);

  const valA = kgA * priceA;
  const valB = kgB * priceB;
  const valC = kgC * priceC;
  const totalEstimatedValue = valA + valB + valC;

  const totalPct = pctA + pctB + pctC;
  const isBalanced = totalPct === 100;

  const handleSave = () => {
    if (!isBalanced) {
      alert('Total percentage must equal 100%. Please adjust lot allocations.');
      return;
    }

    const lots: LotSegregation[] = [
      {
        lotId: `LOT-${batch.batchCode.replace('GRD-', '')}-A`,
        parentBatchId: batch.id,
        name: 'Lot A — Premium Export / Retail',
        grade: 'Grade A' as const,
        targetDestination: 'High-Value Cold Chain / Retail Supermarkets',
        percentageOfBatch: pctA,
        estimatedKg: kgA,
        userPricePerKg: priceA,
        estimatedValue: valA,
        createdAt: new Date().toISOString(),
        qrHash: Math.random().toString(36).substring(2, 10),
        status: 'Ready' as const,
      },
      {
        lotId: `LOT-${batch.batchCode.replace('GRD-', '')}-B`,
        parentBatchId: batch.id,
        name: 'Lot B — Domestic Mandi Wholesale',
        grade: 'Grade B' as const,
        targetDestination: 'Regional APMC Wholesale Auction',
        percentageOfBatch: pctB,
        estimatedKg: kgB,
        userPricePerKg: priceB,
        estimatedValue: valB,
        createdAt: new Date().toISOString(),
        qrHash: Math.random().toString(36).substring(2, 10),
        status: 'Ready' as const,
      },
      {
        lotId: `LOT-${batch.batchCode.replace('GRD-', '')}-C`,
        parentBatchId: batch.id,
        name: 'Lot C — Processing / Dehydration',
        grade: 'Grade C' as const,
        targetDestination: 'Food Processing / Onion Flakes & Powder',
        percentageOfBatch: pctC,
        estimatedKg: kgC,
        userPricePerKg: priceC,
        estimatedValue: valC,
        createdAt: new Date().toISOString(),
        qrHash: Math.random().toString(36).substring(2, 10),
        status: 'Ready' as const,
      },
    ].filter((lot) => lot.percentageOfBatch > 0);

    onSaveLots(lots);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f5] rounded-2xl border border-[#dad2c3] max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5dec9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b382b]/10 border border-[#1b382b]/20 flex items-center justify-center text-[#1b382b]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14291f]">
                Smart Lot Segregation & Value Estimation
              </h3>
              <p className="text-xs text-[#525e57]">
                Divide batch into graded commercial lots and project realized payout
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Batch context banner */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#e5dec9] text-xs">
            <div>
              <span className="text-[#556159]">Batch: </span>
              <span className="font-bold text-[#14291f]">{batch.batchCode}</span>
              <span className="text-neutral-400 mx-2">·</span>
              <span className="text-[#556159]">Total Quantity: </span>
              <span className="font-bold font-mono text-[#14291f]">{totalKg} kg</span>
            </div>
            <div className="font-mono text-[11px] text-[#1b382b]">
              AI Grade: <span className="font-bold">{analysis?.overallGrade}</span> (OQI {analysis?.oqiScore})
            </div>
          </div>

          {/* Value Estimation Guidance Box (Feature 08 compliance) */}
          <div className="p-3 bg-[#f5f0e8] rounded-lg border border-[#dad2c3] text-xs text-[#38433d]">
            <span className="font-bold text-[#14291f]">Notice on Reference Prices: </span>
            GRADFY calculates value based exclusively on your entered local reference prices. We do not invent live APMC prices or speculative rates.
          </div>

          {/* Graded Lots Form */}
          <div className="space-y-3">
            {/* LOT A */}
            <div className="p-4 bg-white rounded-xl border border-[#dad2c3] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#22c55e]/20 text-[#15803d] font-bold font-mono text-xs flex items-center justify-center">
                    A
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#14291f]">
                      LOT A — Export / Prime Table Grade
                    </h4>
                    <span className="text-[11px] text-[#556159]">
                      Target: Premium Retail & Gulf Export
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#1b382b]">{kgA} kg</span>
                  <div className="text-[11px] text-[#556159]">
                    Est. Value: ₹{valA.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Allocation Share (% of batch):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pctA}
                    onChange={(e) => setPctA(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Applicable Reference Price (₹/kg):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priceA}
                    onChange={(e) => setPriceA(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* LOT B */}
            <div className="p-4 bg-white rounded-xl border border-[#dad2c3] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#eab308]/20 text-[#a16207] font-bold font-mono text-xs flex items-center justify-center">
                    B
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#14291f]">
                      LOT B — Domestic Mandi Wholesale
                    </h4>
                    <span className="text-[11px] text-[#556159]">
                      Target: Local APMC Auction & Mandis
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#1b382b]">{kgB} kg</span>
                  <div className="text-[11px] text-[#556159]">
                    Est. Value: ₹{valB.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Allocation Share (% of batch):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pctB}
                    onChange={(e) => setPctB(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Applicable Reference Price (₹/kg):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priceB}
                    onChange={(e) => setPriceB(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* LOT C */}
            <div className="p-4 bg-white rounded-xl border border-[#dad2c3] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#f97316]/20 text-[#c2410c] font-bold font-mono text-xs flex items-center justify-center">
                    C
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#14291f]">
                      LOT C — Processing & Dehydration
                    </h4>
                    <span className="text-[11px] text-[#556159]">
                      Target: Flakes, Powders & Canning
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#1b382b]">{kgC} kg</span>
                  <div className="text-[11px] text-[#556159]">
                    Est. Value: ₹{valC.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Allocation Share (% of batch):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pctC}
                    onChange={(e) => setPctC(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Applicable Reference Price (₹/kg):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={priceC}
                    onChange={(e) => setPriceC(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Validation & Payout Summary */}
          <div className="p-4 rounded-xl bg-[#14291f] text-white flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[11px] font-mono text-neutral-400">
                TOTAL ESTIMATED BATCH VALUE
              </div>
              <div className="text-xl font-bold font-mono text-[#86efac]">
                ₹{totalEstimatedValue.toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                Calculated on {totalKg} kg total batch across {pctA}% / {pctB}% / {pctC}% distribution
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded ${
                  isBalanced
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-rose-950 text-rose-300 border border-rose-700'
                }`}
              >
                {isBalanced ? '✓ 100% Allocated' : `⚠ ${totalPct}% (Must equal 100%)`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5dec9] bg-white flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#525e57] hover:text-[#14291f]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isBalanced}
            className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              isBalanced
                ? 'bg-[#1b382b] hover:bg-[#14291f] text-white shadow-xs'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <span>Confirm & Generate Lots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
