import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WhyThisGradePanelProps {
  analysis: AnalysisResult;
}

export const WhyThisGradePanel: React.FC<WhyThisGradePanelProps> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'observations' | 'rules' | 'distinction'>('observations');

  const { explainability, oqiBreakdown, overallGrade, oqiScore } = analysis;

  return (
    <div className="bg-white rounded-xl border border-[#dad2c3] p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#ece6da]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c85a32]/10 border border-[#c85a32]/30 flex items-center justify-center text-[#c85a32]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#14291f]">
              WHY THIS GRADE? — Explainable AI Breakdown
            </h3>
            <p className="text-xs text-[#525e57]">
              Transparent attribution separating computer-vision detections from configured business rules
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded text-[#525e57] hover:bg-[#f4efe6] transition-colors"
          aria-label={isExpanded ? 'Collapse explainability' : 'Expand explainability'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Executive Summary Statement */}
          <div className="bg-[#fbf9f5] border border-[#e5dec9] rounded-lg p-3 text-xs leading-relaxed text-[#2c332e]">
            <span className="font-semibold text-[#14291f]">Summary: </span>
            {explainability.summary}
          </div>

          {/* Tripartite Distinction: AI Observation vs Configured Rule vs Human Review */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#f9f7f2] border border-[#e5dec9] flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1b382b]">
                <Eye className="w-3.5 h-3.5 text-[#1b382b]" />
                <span>1. AI Observation</span>
              </div>
              <p className="text-xs text-[#4b554e] leading-snug">
                {explainability.distinction.aiObservation}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#f9f7f2] border border-[#e5dec9] flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#c85a32]">
                <Sliders className="w-3.5 h-3.5 text-[#c85a32]" />
                <span>2. Configured Grading Rule</span>
              </div>
              <p className="text-xs text-[#4b554e] leading-snug">
                {explainability.distinction.configuredRule}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#f9f7f2] border border-[#e5dec9] flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#525e57]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                <span>3. Human Verification</span>
              </div>
              <p className="text-xs text-[#4b554e] leading-snug">
                {explainability.distinction.humanVerificationNeeded
                  ? 'Flagged for physical verification due to uncertainty or borderline metrics.'
                  : 'Automated confidence within high benchmark (>75%); inspector sign-off optional.'}
              </p>
            </div>
          </div>

          {/* Detailed Metric Contributing Factors */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-[#14291f] tracking-wide uppercase">
              Observable Factor Weights & Benchmarks
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Factor 1: Size Uniformity */}
              <div className="p-3 rounded-lg border border-[#e8e2d5] bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#14291f]">
                    Size Uniformity ({oqiBreakdown.sizeUniformity.weight}%)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1b382b] tabular-nums">
                    {oqiBreakdown.sizeUniformity.score}/100
                  </span>
                </div>
                <div className="w-full bg-[#eee7db] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#1b382b] h-full rounded-full"
                    style={{ width: `${oqiBreakdown.sizeUniformity.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#556159]">
                  {oqiBreakdown.sizeUniformity.observation}
                </p>
              </div>

              {/* Factor 2: Defect Rate */}
              <div className="p-3 rounded-lg border border-[#e8e2d5] bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#14291f]">
                    Observable Defects ({oqiBreakdown.defectRate.weight}%)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1b382b] tabular-nums">
                    {oqiBreakdown.defectRate.score}/100
                  </span>
                </div>
                <div className="w-full bg-[#eee7db] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#c85a32] h-full rounded-full"
                    style={{ width: `${oqiBreakdown.defectRate.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#556159]">
                  {oqiBreakdown.defectRate.observation}
                </p>
              </div>

              {/* Factor 3: Sprouting Rate */}
              <div className="p-3 rounded-lg border border-[#e8e2d5] bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#14291f]">
                    Sprouting Dormancy ({oqiBreakdown.sproutingRate.weight}%)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1b382b] tabular-nums">
                    {oqiBreakdown.sproutingRate.score}/100
                  </span>
                </div>
                <div className="w-full bg-[#eee7db] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#22c55e] h-full rounded-full"
                    style={{ width: `${oqiBreakdown.sproutingRate.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#556159]">
                  {oqiBreakdown.sproutingRate.observation}
                </p>
              </div>

              {/* Factor 4: Skin Condition */}
              <div className="p-3 rounded-lg border border-[#e8e2d5] bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#14291f]">
                    Tunic & Skin Sheath ({oqiBreakdown.skinCondition.weight}%)
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1b382b] tabular-nums">
                    {oqiBreakdown.skinCondition.score}/100
                  </span>
                </div>
                <div className="w-full bg-[#eee7db] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#d97736] h-full rounded-full"
                    style={{ width: `${oqiBreakdown.skinCondition.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#556159]">
                  {oqiBreakdown.skinCondition.observation}
                </p>
              </div>
            </div>
          </div>

          {/* Positive vs Penalizing Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
              <span className="text-xs font-bold text-emerald-900 block mb-1.5">
                Positive Value Drivers
              </span>
              <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                {explainability.positiveObservations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg">
              <span className="text-xs font-bold text-amber-900 block mb-1.5">
                Grade Deductions & Penalties
              </span>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {explainability.penalizingObservations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
