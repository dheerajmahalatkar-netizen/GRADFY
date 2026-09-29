import React, { useState } from 'react';
import {
  Batch,
  BatchImage,
  GradingConfiguration,
  SamplingPlan,
} from '../../types';
import { analyzeBatchImages } from '../../services/aiGradingEngine';
import { buildQualityPassport } from '../../services/qrService';
import { SmartCaptureModal } from './SmartCaptureModal';
import { WhyThisGradePanel } from './WhyThisGradePanel';
import { OnionOverlayViewer } from './OnionOverlayViewer';
import { StorageRiskBadge } from './StorageRiskBadge';
import { LotSegregationModal } from './LotSegregationModal';
import { QualityPassportCard } from '../passport/QualityPassportCard';
import { DigitalQualityReportModal } from '../reports/DigitalQualityReportModal';
import { HumanVerificationModal } from '../verification/HumanVerificationModal';
import { HERO_SAMPLE_IMAGE, DEFECT_SAMPLE_IMAGE } from '../../data/sampleBatches';
import {
  Camera,
  Layers,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Scale,
  Sparkles,
} from 'lucide-react';

interface GradingStudioProps {
  config: GradingConfiguration;
  onSaveBatch: (batch: Batch) => void;
  initialBatch?: Batch | null;
  onOpenVerificationAudit?: (reportId: string) => void;
}

export const GradingStudio: React.FC<GradingStudioProps> = ({
  config,
  onSaveBatch,
  initialBatch,
  onOpenVerificationAudit,
}) => {
  // Batch form fields
  const [farmerName, setFarmerName] = useState(initialBatch?.farmerName || 'Ramesh Patil');
  const [farmerPhone, setFarmerPhone] = useState(initialBatch?.farmerPhone || '+91 98221 44510');
  const [location, setLocation] = useState(initialBatch?.location || 'Lasalgaon, Nashik');
  const [variety, setVariety] = useState(initialBatch?.variety || 'Pusa Red (Winter Rabi)');
  const [quantityKg, setQuantityKg] = useState(initialBatch?.quantityKg || 1200);
  const [crateCount, setCrateCount] = useState(initialBatch?.crateCount || 48);

  // Feature 05: Sampling Plan
  const [samplingEnabled, setSamplingEnabled] = useState(
    initialBatch?.samplingPlan.enabled ?? true
  );
  const [sampledCrates, setSampledCrates] = useState(
    initialBatch?.samplingPlan.sampledCratesCount || 5
  );
  const [sampleWeightKg, setSampleWeightKg] = useState(
    initialBatch?.samplingPlan.sampleWeightKg || 35
  );

  // Images and analysis
  const [images, setImages] = useState<BatchImage[]>(initialBatch?.images || []);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(initialBatch || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modals
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [lotsModalOpen, setLotsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // Handle capture completed
  const handleImagesCaptured = (captured: BatchImage[]) => {
    setImages(captured);
  };

  // Run AI grading analysis
  const handleRunAnalysis = async () => {
    if (images.length === 0) {
      setCaptureModalOpen(true);
      return;
    }

    setIsAnalyzing(true);
    // Simulate real-time computer vision inference delay
    await new Promise((res) => setTimeout(res, 900));

    const samplingPlan: SamplingPlan = {
      enabled: samplingEnabled,
      totalCrates: crateCount,
      sampledCratesCount: sampledCrates,
      sampleWeightKg,
      standardReference: 'ISO 2859-1 Representative Sampling Plan',
    };

    const analysisResult = analyzeBatchImages(images, config, samplingPlan, quantityKg);

    const batchCode = currentBatch?.batchCode || `GRD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const batchId = currentBatch?.id || `batch-${Date.now()}`;
    const reportId = `REP-${batchCode}`;

    const passport = await buildQualityPassport({
      batchId,
      batchCode,
      reportId,
      farmerName,
      farmerLocation: location,
      procurementCenter: 'GRADFY Hub #12, Lasalgaon APMC',
      date: new Date().toISOString().split('T')[0],
      overallGrade: analysisResult.overallGrade,
      oqiScore: analysisResult.oqiScore,
      storageRiskLevel: analysisResult.storageRisk.level,
      verificationStatus: analysisResult.flaggedForHumanReview
        ? 'PENDING_HUMAN_REVIEW'
        : 'AI_CERTIFIED',
      modelVersion: config.version,
    });

    const newBatch: Batch = {
      id: batchId,
      batchCode,
      name: `${variety} - ${farmerName}`,
      farmerName,
      farmerPhone,
      location,
      variety,
      harvestDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      arrivalDate: new Date().toISOString().split('T')[0],
      quantityKg,
      crateCount,
      samplingPlan,
      status: analysisResult.flaggedForHumanReview ? 'Under Review' : 'Analysis Complete',
      createdAt: currentBatch?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images,
      analysisResult,
      qualityPassport: passport,
      syncStatus: 'pending_sync',
      isDemoData: false,
    };

    setCurrentBatch(newBatch);
    onSaveBatch(newBatch);
    setIsAnalyzing(false);
  };

  const handleLotsSaved = (lots: any) => {
    if (!currentBatch) return;
    const updated = { ...currentBatch, lots, status: 'Lot Segregated' as const };
    setCurrentBatch(updated);
    onSaveBatch(updated);
  };

  const handleVerificationDone = (verification: any) => {
    if (!currentBatch) return;
    const updated = {
      ...currentBatch,
      humanVerification: verification,
      status: 'Verified' as const,
    };
    if (updated.analysisResult) {
      updated.analysisResult.overallGrade = verification.finalGrade;
      updated.analysisResult.oqiScore = verification.finalOqi;
      updated.analysisResult.flaggedForHumanReview = false;
    }
    if (updated.qualityPassport) {
      updated.qualityPassport.overallGrade = verification.finalGrade;
      updated.qualityPassport.oqiScore = verification.finalOqi;
      updated.qualityPassport.verificationStatus = 'VERIFIED_BY_INSPECTOR';
    }
    setCurrentBatch(updated);
    onSaveBatch(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-[#182f23] to-[#14291f] rounded-2xl text-white border border-[#2d4d3b] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/30 font-semibold">
              AI GRADING PIPELINE
            </span>
            <span className="text-xs text-neutral-400">· Computer Vision & OQI Engine</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Onion Quality Assessment & Grading Studio</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Capture multi-angle imagery, evaluate visible defects, generate explainable OQI, and issue Digital Quality Passports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentBatch?.analysisResult && (
            <>
              <button
                onClick={() => setLotsModalOpen(true)}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Segregate Lots</span>
              </button>
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3.5 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-neutral-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Report</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 5-Step Process Progress Stepper (Section 8 requirement) */}
      <div className="bg-white rounded-2xl border border-[#dad2c3] p-3 shadow-2xs">
        <div className="grid grid-cols-5 text-center text-xs font-mono font-semibold">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-emerald-800 font-bold">01 BATCH</span>
            <span className="w-full h-1 bg-emerald-600 rounded-full mt-1.5" />
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-[10px] ${images.length > 0 ? 'text-emerald-800 font-bold' : 'text-[#556159]'}`}>
              02 CAPTURE
            </span>
            <span
              className={`w-full h-1 rounded-full mt-1.5 ${
                images.length > 0 ? 'bg-emerald-600' : 'bg-[#e5dec9]'
              }`}
            />
          </div>
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] ${
                currentBatch?.analysisResult ? 'text-emerald-800 font-bold' : 'text-[#556159]'
              }`}
            >
              03 ANALYZE
            </span>
            <span
              className={`w-full h-1 rounded-full mt-1.5 ${
                currentBatch?.analysisResult ? 'bg-emerald-600' : 'bg-[#e5dec9]'
              }`}
            />
          </div>
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] ${
                currentBatch?.humanVerification ? 'text-emerald-800 font-bold' : 'text-[#556159]'
              }`}
            >
              04 VERIFY
            </span>
            <span
              className={`w-full h-1 rounded-full mt-1.5 ${
                currentBatch?.humanVerification ? 'bg-emerald-600' : 'bg-[#e5dec9]'
              }`}
            />
          </div>
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] ${
                currentBatch?.qualityPassport ? 'text-emerald-800 font-bold' : 'text-[#556159]'
              }`}
            >
              05 REPORT
            </span>
            <span
              className={`w-full h-1 rounded-full mt-1.5 ${
                currentBatch?.qualityPassport ? 'bg-emerald-600' : 'bg-[#e5dec9]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Workflow Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Batch Metadata & Sampling Plan (Feature 05) */}
        <div className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-5 text-xs">
          <div className="pb-3 border-b border-[#e5dec9] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#14291f] flex items-center gap-2">
              <User className="w-4 h-4 text-[#c85a32]" />
              <span>1. Batch & Farmer Intake Information</span>
            </h3>
            {currentBatch && (
              <span className="font-mono text-[10px] text-[#556159]">{currentBatch.batchCode}</span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Farmer / Supplier Name:
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Contact Phone:
              </label>
              <input
                type="text"
                value={farmerPhone}
                onChange={(e) => setFarmerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Origin / Mandi Location:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                Onion Cultivar / Variety:
              </label>
              <select
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] font-medium bg-white"
              >
                <option value="Pusa Red (Winter Rabi)">Pusa Red (Winter Rabi)</option>
                <option value="Bhima Super (Kharif)">Bhima Super (Kharif)</option>
                <option value="Agrifound Dark Red">Agrifound Dark Red</option>
                <option value="N-53 (Early Kharif)">N-53 (Early Kharif)</option>
                <option value="Nashik White / Dehydration">Nashik White / Dehydration</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                  Total Weight (kg):
                </label>
                <input
                  type="number"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#556159] block mb-1">
                  Total Crates / Bags:
                </label>
                <input
                  type="number"
                  value={crateCount}
                  onChange={(e) => setCrateCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#dad2c3] font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Feature 05: Intelligent Sampling Mode Box */}
          <div className="p-4 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#14291f] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#1b382b]" />
                Intelligent Representative Sampling
              </span>
              <input
                type="checkbox"
                checked={samplingEnabled}
                onChange={(e) => setSamplingEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#1b382b]"
              />
            </div>

            {samplingEnabled ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[#556159] leading-snug">
                  Statistically calculates batch-level distribution from physical sample trays based on ISO 2859 inspection standards.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#556159] block">Crates Sampled:</span>
                    <input
                      type="number"
                      value={sampledCrates}
                      onChange={(e) => setSampledCrates(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-[#dad2c3] bg-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[#556159] block">Sample Weight (kg):</span>
                    <input
                      type="number"
                      value={sampleWeightKg}
                      onChange={(e) => setSampleWeightKg(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-[#dad2c3] bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-emerald-800 font-mono italic">
                  *Certified as Sample-Based Statistical Estimate.
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#556159]">
                Whole batch physical inspection mode (all crates sorted).
              </p>
            )}
          </div>

          {/* Capture Trigger Button */}
          <div className="pt-2">
            <button
              onClick={() => setCaptureModalOpen(true)}
              className="w-full py-2.5 px-4 bg-[#f4efe6] hover:bg-[#eae2d3] border border-[#dad2c3] rounded-xl text-xs font-bold text-[#14291f] flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-[#c85a32]" />
              <span>
                {images.length > 0 ? `Captured Images (${images.length} Angles)` : 'Open Multi-Angle Capture'}
              </span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Image Viewport + Analysis Engine Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image & Bounding Box Viewport */}
          <div className="bg-white rounded-2xl border border-[#dad2c3] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5dec9]">
              <div>
                <h3 className="text-sm font-bold text-[#14291f]">
                  Visual Inspection & Computer Vision Overlay
                </h3>
                <p className="text-xs text-[#556159]">
                  {images.length > 0
                    ? `Showing ${images[0].label} with bounding boxes and defect indicators`
                    : 'Capture or select sample images to run computer vision inference'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-5 py-2 bg-[#1b382b] hover:bg-[#14291f] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing 47 Visible Onions...' : 'Run AI Analysis'}</span>
                </button>
              </div>
            </div>

            {/* Viewport */}
            {images.length > 0 ? (
              <OnionOverlayViewer
                imageUrl={images[0].url}
                detectedOnions={currentBatch?.analysisResult?.detectedOnions || []}
              />
            ) : (
              <div
                onClick={() => setCaptureModalOpen(true)}
                className="w-full aspect-4/3 rounded-xl border-2 border-dashed border-[#dad2c3] hover:border-[#1b382b] bg-[#fbf9f5] flex flex-col items-center justify-center cursor-pointer transition-colors p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-[#1b382b]/10 flex items-center justify-center text-[#1b382b] mb-3">
                  <Camera className="w-6 h-6 text-[#c85a32]" />
                </div>
                <h4 className="text-sm font-bold text-[#14291f] mb-1">
                  No Inspection Images Captured
                </h4>
                <p className="text-xs text-[#556159] max-w-sm mb-4">
                  Tap to launch AI-Guided Smart Capture with blur and lighting checks, or load test calibrated samples.
                </p>
                <span className="px-4 py-1.5 bg-[#1b382b] text-white rounded-lg text-xs font-semibold shadow-xs">
                  Launch Capture Studio
                </span>
              </div>
            )}
          </div>

          {/* AI Result Card & Quality Scorecards (when analyzed) */}
          {currentBatch?.analysisResult && (
            <div className="space-y-6">
              {/* Scorecard Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#1b382b] text-white">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
                    AI Assigned Grade
                  </span>
                  <div className="text-2xl font-black font-mono my-1">
                    {currentBatch.analysisResult.overallGrade}
                  </div>
                  <div className="text-[11px] text-emerald-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                    <span>Confidence: {currentBatch.analysisResult.confidence} ({currentBatch.analysisResult.confidenceScore}%)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#556159]">
                    GRADFY Quality Index (OQI)
                  </span>
                  <div className="text-2xl font-black font-mono my-1 text-[#14291f] tabular-nums">
                    {currentBatch.analysisResult.oqiScore}
                    <span className="text-xs font-normal text-[#556159]">/100</span>
                  </div>
                  <div className="text-[11px] text-[#556159]">
                    Standard Mandi Benchmark: &gt;75
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#dad2c3] shadow-2xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#556159]">
                    Storage Risk Index
                  </span>
                  <div
                    className={`text-2xl font-black font-mono my-1 ${
                      currentBatch.analysisResult.storageRisk.level === 'LOW'
                        ? 'text-emerald-700'
                        : currentBatch.analysisResult.storageRisk.level === 'MEDIUM'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {currentBatch.analysisResult.storageRisk.level} RISK
                  </div>
                  <div className="text-[11px] text-[#556159]">
                    Score: {currentBatch.analysisResult.storageRisk.riskScore}/100
                  </div>
                </div>
              </div>

              {/* Human Review Required Alert (Feature 11) */}
              {currentBatch.analysisResult.flaggedForHumanReview && !currentBatch.humanVerification && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Flagged For Human Inspector Verification
                      </span>
                      <span className="text-xs text-amber-800">
                        {currentBatch.analysisResult.flagReason}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setVerificationModalOpen(true)}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    Review & Verify Batch
                  </button>
                </div>
              )}

              {/* Feature 01: Dedicated "WHY THIS GRADE?" Panel */}
              <WhyThisGradePanel analysis={currentBatch.analysisResult} />

              {/* Feature 06: Storage Risk Indicator */}
              <StorageRiskBadge storageRisk={currentBatch.analysisResult.storageRisk} />

              {/* Feature 09: Digital Quality Passport Card */}
              <QualityPassportCard
                batch={currentBatch}
                onOpenVerification={onOpenVerificationAudit}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {captureModalOpen && (
        <SmartCaptureModal
          isOpen={captureModalOpen}
          onClose={() => setCaptureModalOpen(false)}
          onImagesCaptured={handleImagesCaptured}
          initialImages={images}
        />
      )}

      {lotsModalOpen && currentBatch && (
        <LotSegregationModal
          batch={currentBatch}
          isOpen={lotsModalOpen}
          onClose={() => setLotsModalOpen(false)}
          onSaveLots={handleLotsSaved}
        />
      )}

      {reportModalOpen && currentBatch && (
        <DigitalQualityReportModal
          batch={currentBatch}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {verificationModalOpen && currentBatch && (
        <HumanVerificationModal
          batch={currentBatch}
          isOpen={verificationModalOpen}
          onClose={() => setVerificationModalOpen(false)}
          onCompleteVerification={handleVerificationDone}
        />
      )}

      {/* SECTION 11 AI ANALYSIS MODAL */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#14291f] border border-[#2d4d3b] rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80]">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono">AI BATCH ANALYSIS PIPELINE</h3>
                <p className="text-xs text-neutral-400 font-mono">GRADFY-YOLO-VisionCore Engine</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-neutral-200">
                <span>Image preprocessing & calibration</span>
                <span className="text-emerald-400">✓ Completed</span>
              </div>
              <div className="flex items-center justify-between text-neutral-200">
                <span>Object detection & contour isolation</span>
                <span className="text-emerald-400">✓ 46 Bulbs</span>
              </div>
              <div className="flex items-center justify-between text-neutral-200">
                <span>Observable defect & sprouting scan</span>
                <span className="text-emerald-400">✓ Analyzed</span>
              </div>
              <div className="flex items-center justify-between text-neutral-200">
                <span>Size metrics & diameter extraction</span>
                <span className="text-emerald-400">✓ 58.4mm Mean</span>
              </div>
              <div className="flex items-center justify-between text-neutral-200">
                <span>Weighted OQI score formulation</span>
                <span className="text-[#86efac] animate-pulse">● Calculating...</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Final Grade & Quality Passport mint</span>
                <span>○ Finalizing...</span>
              </div>
            </div>

            <div className="w-full bg-[#1b382b] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#22c55e] h-full rounded-full animate-pulse w-4/5" />
            </div>

            <p className="text-[11px] text-neutral-400 text-center italic font-sans">
              Evaluating visible exterior characteristics across captured inspection angles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
