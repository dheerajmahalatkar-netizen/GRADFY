import React, { useState } from 'react';
import { Batch, GradeClassification, HumanVerification } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  Edit3,
  HelpCircle,
  Database,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface HumanVerificationModalProps {
  batch: Batch;
  isOpen: boolean;
  onClose: () => void;
  onCompleteVerification: (verification: HumanVerification) => void;
}

export const HumanVerificationModal: React.FC<HumanVerificationModalProps> = ({
  batch,
  isOpen,
  onClose,
  onCompleteVerification,
}) => {
  const analysis = batch.analysisResult;

  const [finalGrade, setFinalGrade] = useState<GradeClassification>(
    analysis?.overallGrade || 'Grade B'
  );
  const [finalOqi, setFinalOqi] = useState<number>(analysis?.oqiScore || 70);
  const [inspectorNotes, setInspectorNotes] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [includeInFeedback, setIncludeInFeedback] = useState<boolean>(true);
  const [inspectorName, setInspectorName] = useState<string>('Sanjay Deshmukh');
  const [inspectorRole, setInspectorRole] = useState<string>('Chief Quality Inspector (APMC)');

  if (!isOpen || !analysis) return null;

  const isModified =
    finalGrade !== analysis.overallGrade || Math.abs(finalOqi - analysis.oqiScore) > 1.0;

  const handleSubmit = () => {
    if (!inspectorNotes.trim()) {
      alert('Please provide inspector notes for the audit record.');
      return;
    }

    const record: HumanVerification = {
      verifiedBy: inspectorName,
      role: inspectorRole,
      timestamp: new Date().toISOString(),
      status: isModified ? 'MODIFIED' : 'APPROVED',
      originalGrade: analysis.overallGrade,
      finalGrade,
      originalOqi: analysis.oqiScore,
      finalOqi,
      inspectorNotes,
      correctionReason: isModified ? correctionReason : undefined,
      feedbackDatasetIncluded: includeInFeedback,
    };

    onCompleteVerification(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f5] rounded-2xl border border-[#dad2c3] max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5dec9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14291f]">
                Human-in-the-Loop Quality Verification
              </h3>
              <p className="text-xs text-[#525e57]">
                Expert inspector verification for uncertain or borderline AI batch classifications
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* AI Trigger Alert */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Flagged Reason: </span>
              {analysis.flagReason ||
                `AI confidence (${analysis.confidenceScore}%) is borderline or observable sprouting requires manual calibration.`}
            </div>
          </div>

          {/* Current AI Observations vs Inspector Override */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#e5dec9]">
            <div>
              <span className="text-[10px] text-[#556159] uppercase font-mono block">
                Original AI Prediction
              </span>
              <div className="text-base font-bold font-mono text-[#14291f]">
                {analysis.overallGrade}
              </div>
              <div className="text-[11px] text-[#556159]">
                OQI Score: <span className="font-bold">{analysis.oqiScore}/100</span>
              </div>
              <div className="text-[10px] font-mono text-amber-700 mt-1">
                Confidence: {analysis.confidence} ({analysis.confidenceScore}%)
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#556159] uppercase font-mono block">
                Observed Defect Breakdown
              </span>
              <ul className="text-[11px] text-[#2c332e] space-y-0.5 mt-1">
                {analysis.detectedDefects.map((def, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{def.type}:</span>
                    <span className="font-mono font-semibold">{def.percentage}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Inspector Calibration Controls */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-[#14291f] uppercase tracking-wide text-[11px]">
              Inspector Determination & Adjustment
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#556159] block mb-1">
                  Final Verified Grade:
                </label>
                <select
                  value={finalGrade}
                  onChange={(e) => setFinalGrade(e.target.value as GradeClassification)}
                  className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] bg-white font-mono text-xs font-semibold"
                >
                  <option value="Grade A">Grade A (Export / Prime)</option>
                  <option value="Grade B">Grade B (Domestic Wholesale)</option>
                  <option value="Grade C">Grade C (Industrial / Processing)</option>
                  <option value="Reject">Reject (Commercial Discard)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#556159] block mb-1">
                  Adjusted OQI (0–100):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={finalOqi}
                  onChange={(e) => setFinalOqi(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] bg-white font-mono text-xs font-semibold"
                >
                </input>
              </div>
            </div>

            {isModified && (
              <div>
                <label className="text-[11px] text-[#556159] block mb-1">
                  Reason for Grade Correction / Override:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tactile check revealed firm neck tissue; superficial scale darkening was non-invasive."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] bg-white text-xs"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-[#556159] block mb-1">
                Official Inspection Notes & Physical Observations:
              </label>
              <textarea
                rows={2}
                placeholder="Document curing uniformity, neck tightness, pungency, or storage recommendations..."
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] bg-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#556159] block mb-1">Inspector Name:</label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] bg-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#556159] block mb-1">Inspector Role / APMC Hub:</label>
                <input
                  type="text"
                  value={inspectorRole}
                  onChange={(e) => setInspectorRole(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#dad2c3] bg-white text-xs"
                />
              </div>
            </div>

            {/* Continuous Learning / Feedback Dataset inclusion (Feature 11 architecture) */}
            <div className="p-3 bg-[#f5f0e8] rounded-xl border border-[#dad2c3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#1b382b]" />
                <div>
                  <span className="font-semibold text-[#14291f] block">
                    Model Improvement Dataset
                  </span>
                  <span className="text-[11px] text-[#556159]">
                    Append verified audit pair to training dataset for future model fine-tuning
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                checked={includeInFeedback}
                onChange={(e) => setIncludeInFeedback(e.target.checked)}
                className="w-4 h-4 rounded text-[#1b382b]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e5dec9] bg-white flex items-center justify-between">
          <span className="text-xs text-[#556159]">
            {isModified ? 'Manual Override Active' : 'AI Prediction Confirmed'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#525e57] hover:text-[#14291f]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1b382b] hover:bg-[#14291f] text-white flex items-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sign & Verify Batch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
