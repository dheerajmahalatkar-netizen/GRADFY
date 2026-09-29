import React, { useState } from 'react';
import { Batch } from '../../types';
import { Search, FileText, User, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface GlobalSearchModalProps {
  batches: Batch[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBatch: (batch: Batch) => void;
  onOpenReport: (batch: Batch) => void;
  onOpenVerification: (reportId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  batches,
  isOpen,
  onClose,
  onSelectBatch,
  onOpenReport,
  onOpenVerification,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? batches.filter((b) => {
        const batchCode = b.batchCode.toLowerCase();
        const farmer = b.farmerName.toLowerCase();
        const variety = b.variety.toLowerCase();
        const loc = b.location.toLowerCase();
        const reportId = b.qualityPassport?.reportId.toLowerCase() || '';
        const passportId = b.qualityPassport?.passportId.toLowerCase() || '';
        const lots = b.lots?.map((l) => l.lotId.toLowerCase()).join(' ') || '';

        return (
          batchCode.includes(trimmed) ||
          farmer.includes(trimmed) ||
          variety.includes(trimmed) ||
          loc.includes(trimmed) ||
          reportId.includes(trimmed) ||
          passportId.includes(trimmed) ||
          lots.includes(trimmed)
        );
      })
    : batches.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-16 sm:pt-24">
      <div className="bg-white rounded-2xl border border-[#dad2c3] max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#e5dec9] flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search Batch Code, Report ID, Farmer, Lot ID, or Variety..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium focus:outline-none placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md font-mono hover:bg-neutral-200"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#ece6da]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#556159]">
              No records matching <span className="font-mono font-bold">"{query}"</span>
            </div>
          ) : (
            results.map((batch) => {
              const analysis = batch.analysisResult;
              const passport = batch.qualityPassport;

              return (
                <div
                  key={batch.id}
                  className="p-4 hover:bg-[#fbf9f5] transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#14291f]">
                        {batch.batchCode}
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-semibold text-[#2c332e]">{batch.farmerName}</span>
                      {analysis && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          {analysis.overallGrade} (OQI {analysis.oqiScore})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#556159] flex items-center gap-2">
                      <span>{batch.variety}</span>
                      <span>·</span>
                      <span>{batch.location}</span>
                      <span>·</span>
                      <span>{batch.quantityKg} kg</span>
                      {passport && <span>· Rep: {passport.reportId}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {passport && (
                      <button
                        onClick={() => {
                          onOpenVerification(passport.reportId);
                          onClose();
                        }}
                        className="px-2 py-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectBatch(batch);
                        onClose();
                      }}
                      className="px-3 py-1 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-lg text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#f5f0e8] border-t border-[#dad2c3] text-[11px] text-[#556159] flex items-center justify-between">
          <span>Search spans batches, quality passports, lots, and inspector reports</span>
          <span className="font-mono">{batches.length} total indexed batches</span>
        </div>
      </div>
    </div>
  );
};
