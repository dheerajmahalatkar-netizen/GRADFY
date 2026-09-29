import React, { useState } from 'react';
import { Batch, GradeClassification, HumanVerification } from '../../types';
import { OnionOverlayViewer } from '../grading/OnionOverlayViewer';
import {
  ShieldAlert,
  CheckCircle2,
  Edit3,
  HelpCircle,
  XCircle,
  Database,
  ArrowRight,
  AlertTriangle,
  ZoomIn,
  History,
  FileCheck,
} from 'lucide-react';

interface InspectorWorkbenchProps {
  batch: Batch;
  onClose: () => void;
  onSaveVerification: (verification: HumanVerification) => void;
}

export const InspectorWorkbench: React.FC<InspectorWorkbenchProps> = ({
  batch,
  onClose,
  onSaveVerification,
}) => {
  const analysis = batch.analysisResult;

  const [decision, setDecision] = useState<'ACCEPT' | 'CORRECT' | 'UNCERTAIN' | 'REJECT'>('ACCEPT');
  const [adjustedGrade, setAdjustedGrade] = useState<GradeClassification>(
    analysis?.overallGrade || 'Grade B'
  );
  const [adjustedOqi, setAdjustedOqi] = useState<number>(analysis?.oqiScore || 70);
  const [inspectorNotes, setInspectorNotes] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [defectOverrides, setDefectOverrides] = useState<string[]>([]);
  const [includeInFeedback, setIncludeInFeedback] = useState<boolean>(true);

  if (!analysis) return null;

  const handleDecisionSelect = (d: 'ACCEPT' | 'CORRECT' | 'UNCERTAIN' | 'REJECT') => {
    setDecision(d);
    if (d === 'ACCEPT') {
      setAdjustedGrade(analysis.overallGrade);
      setAdjustedOqi(analysis.oqiScore);
    } else if (d === 'REJECT') {
      setAdjustedGrade('Reject');
      setAdjustedOqi(Math.min(40, analysis.oqiScore));
    }
  };

  const handleSave = () => {
    if (!inspectorNotes.trim()) {
      alert('Please enter official inspection notes before saving verification.');
      return;
    }

    const verification: HumanVerification = {
      verifiedBy: 'Sanjay Deshmukh',
      role: 'Chief Quality Inspector (APMC Lasalgaon)',
      timestamp: new Date().toISOString(),
      status: decision === 'ACCEPT' ? 'APPROVED' : 'MODIFIED',
      originalGrade: analysis.overallGrade,
      finalGrade: adjustedGrade,
      originalOqi: analysis.oqiScore,
      finalOqi: adjustedOqi,
      inspectorNotes,
      correctionReason: decision !== 'ACCEPT' ? correctionReason || `Marked as ${decision}` : undefined,
      feedbackDatasetIncluded: includeInFeedback,
    };

    onSaveVerification(verification);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fbf9f5] rounded-3xl border border-[#dad2c3] max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Workbench Header */}
        <div className="px-6 py-4 bg-[#14291f] text-white flex items-center justify-between border-b border-[#2d4d3b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono tracking-tight">
                  INSPECTOR VERIFICATION WORKBENCH
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  FLAGGED FOR REVIEW
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono mt-0.5">
                Batch: {batch.batchCode} · Producer: {batch.farmerName} · Variety: {batch.variety}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Workbench Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left 7 Cols: Image Analysis & Bounding Box Viewer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14291f] uppercase tracking-wider font-mono">
                Visual Inspection Viewport
              </span>
              <span className="text-xs text-[#556159] font-mono">
                AI Confidence: <strong className="text-amber-800">{analysis.confidenceScore}%</strong> ({analysis.confidence})
              </span>
            </div>

            <OnionOverlayViewer
              imageUrl={batch.images[0]?.url || ''}
              detectedOnions={analysis.detectedOnions}
            />

            {/* AI Flag Reason Alert */}
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Algorithmic Uncertainty Trigger: </span>
                {analysis.flagReason ||
                  'Confidence score below threshold (75%) or elevated apical sprout emergence observed.'}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Decision Controls & Inspector Sign-off */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between text-xs">
            <div className="space-y-4">
              {/* Original AI Prediction Box */}
              <div className="p-4 bg-white rounded-xl border border-[#dad2c3] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#556159] block">
                  Original AI Automated Prediction
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-[#14291f]">
                    {analysis.overallGrade}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#1b382b] tabular-nums">
                    OQI: {analysis.oqiScore}/100
                  </span>
                </div>
                <div className="text-[11px] text-[#556159] pt-1 border-t border-[#ece6da]">
                  Observed Defects: {analysis.detectedDefects.map((d) => `${d.type} (${d.percentage}%)`).join(', ') || 'None'}
                </div>
              </div>

              {/* Inspector Decision Buttons (ACCEPT, CORRECT, UNCERTAIN, REJECT) */}
              <div className="space-y-2">
                <label className="font-bold text-[#14291f] block uppercase tracking-wider text-[11px]">
                  Inspector Verification Decision:
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecisionSelect('ACCEPT')}
                    className={`py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      decision === 'ACCEPT'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-[#14291f] border-[#dad2c3] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACCEPT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecisionSelect('CORRECT')}
                    className={`py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      decision === 'CORRECT'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-[#14291f] border-[#dad2c3] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>CORRECT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecisionSelect('UNCERTAIN')}
                    className={`py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      decision === 'UNCERTAIN'
                        ? 'bg-[#1b382b] text-white border-[#14291f] shadow-xs'
                        : 'bg-white text-[#14291f] border-[#dad2c3] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>UNCERTAIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecisionSelect('REJECT')}
                    className={`py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      decision === 'REJECT'
                        ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                        : 'bg-white text-[#14291f] border-[#dad2c3] hover:bg-[#f5f0e8]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>REJECT</span>
                  </button>
                </div>
              </div>

              {/* Adjustments (Active if not Accept) */}
              <div className="space-y-3 p-4 bg-white rounded-xl border border-[#dad2c3]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#556159] block mb-1">Final Grade:</label>
                    <select
                      value={adjustedGrade}
                      onChange={(e) => setAdjustedGrade(e.target.value as GradeClassification)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono font-bold"
                    >
                      <option value="Grade A">Grade A (Prime Export)</option>
                      <option value="Grade B">Grade B (Domestic Wholesale)</option>
                      <option value="Grade C">Grade C (Dehydration / Flake)</option>
                      <option value="Reject">Reject (Market Discard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#556159] block mb-1">Calibrated OQI:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={adjustedOqi}
                      onChange={(e) => setAdjustedOqi(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] font-mono font-bold"
                    />
                  </div>
                </div>

                {decision !== 'ACCEPT' && (
                  <div>
                    <label className="text-[11px] text-[#556159] block mb-1">
                      Reason for Calibration:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Neck firmness intact; superficial tunic peeling."
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-[#556159] block mb-1">
                    Official Inspector Observations & Notes:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Document tactile assessment, smell, cut sample findings, or storage advice..."
                    value={inspectorNotes}
                    onChange={(e) => setInspectorNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3]"
                  />
                </div>
              </div>

              {/* Feedback Dataset Checkbox */}
              <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#dad2c3] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#14291f] block text-xs">
                    Model Improvement Dataset
                  </span>
                  <span className="text-[11px] text-[#556159]">
                    Include this verified sample in fine-tuning corpus
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeInFeedback}
                  onChange={(e) => setIncludeInFeedback(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1b382b]"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 border-t border-[#e5dec9] flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 font-medium text-[#525e57] hover:text-[#14291f]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Save Verified Assessment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
