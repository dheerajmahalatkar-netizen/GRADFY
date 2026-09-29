import React, { useState, useRef, useEffect } from 'react';
import { BatchImage, ImageQualityCheck } from '../../types';
import { evaluateImageQuality } from '../../services/aiGradingEngine';
import { HERO_SAMPLE_IMAGE, DEFECT_SAMPLE_IMAGE, FACILITY_SAMPLE_IMAGE } from '../../data/sampleBatches';
import {
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Maximize2,
} from 'lucide-react';

interface SmartCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImagesCaptured: (images: BatchImage[]) => void;
  initialImages?: BatchImage[];
}

type CaptureAngle = 'front' | 'side' | 'base';

export const SmartCaptureModal: React.FC<SmartCaptureModalProps> = ({
  isOpen,
  onClose,
  onImagesCaptured,
  initialImages = [],
}) => {
  const [activeAngle, setActiveAngle] = useState<CaptureAngle>('front');
  const [capturedImages, setCapturedImages] = useState<Record<CaptureAngle, BatchImage | null>>({
    front: initialImages.find((img) => img.angle === 'front') || null,
    side: initialImages.find((img) => img.angle === 'side') || null,
    base: initialImages.find((img) => img.angle === 'base') || null,
  });

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to open camera. Please use file upload or demo samples.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleCaptureFromVideo = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    await processCapturedImage(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await processCapturedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseCalibratedSample = async (sampleUrl: string) => {
    await processCapturedImage(sampleUrl);
  };

  const processCapturedImage = async (dataUrl: string) => {
    setIsEvaluating(true);
    try {
      const qualityCheck = await evaluateImageQuality(dataUrl);
      const angleLabels: Record<CaptureAngle, string> = {
        front: 'Front / Top View (Tray Monolayer)',
        side: 'Side 45° Angle (Profile Inspection)',
        base: 'Base View (Root Plate & Neck Seal)',
      };

      const newBatchImage: BatchImage = {
        id: `img-${Date.now()}-${activeAngle}`,
        angle: activeAngle,
        label: angleLabels[activeAngle],
        url: dataUrl,
        timestamp: new Date().toISOString(),
        qualityCheck,
      };

      setCapturedImages((prev) => ({
        ...prev,
        [activeAngle]: newBatchImage,
      }));

      // Auto-advance to next empty angle
      if (activeAngle === 'front' && !capturedImages.side) {
        setActiveAngle('side');
      } else if (activeAngle === 'side' && !capturedImages.base) {
        setActiveAngle('base');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const currentImage = capturedImages[activeAngle];

  const handleDone = () => {
    const collected: BatchImage[] = [];
    if (capturedImages.front) collected.push(capturedImages.front);
    if (capturedImages.side) collected.push(capturedImages.side);
    if (capturedImages.base) collected.push(capturedImages.base);

    if (collected.length === 0) {
      alert('Please capture at least the Front/Top View before proceeding.');
      return;
    }
    onImagesCaptured(collected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#fbf9f5] rounded-2xl border border-[#dad2c3] max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e5dec9] bg-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#14291f] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#c85a32]" />
              <span>AI-Guided Multi-Angle Smart Capture</span>
            </h2>
            <p className="text-xs text-[#525e57]">
              Multi-angle observable capture with real-time blur, lighting, and cluster validation
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Multi-Angle Progress Stepper (Feature 03) */}
        <div className="px-6 py-3 bg-[#f5f0e8] border-b border-[#e5dec9] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#14291f]">Angle Pipeline:</span>
            <div className="flex items-center gap-1.5">
              {/* Angle 1 */}
              <button
                onClick={() => {
                  stopCamera();
                  setActiveAngle('front');
                }}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                  activeAngle === 'front'
                    ? 'bg-[#1b382b] text-white shadow-xs'
                    : capturedImages.front
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-white text-neutral-700 border border-[#dad2c3]'
                }`}
              >
                {capturedImages.front ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span>1</span>
                )}
                <span>Angle 01: Top View</span>
              </button>

              {/* Angle 2 */}
              <button
                onClick={() => {
                  stopCamera();
                  setActiveAngle('side');
                }}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                  activeAngle === 'side'
                    ? 'bg-[#1b382b] text-white shadow-xs'
                    : capturedImages.side
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-white text-neutral-700 border border-[#dad2c3]'
                }`}
              >
                {capturedImages.side ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span>2</span>
                )}
                <span>Angle 02: Side 45°</span>
              </button>

              {/* Angle 3 */}
              <button
                onClick={() => {
                  stopCamera();
                  setActiveAngle('base');
                }}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors font-medium ${
                  activeAngle === 'base'
                    ? 'bg-[#1b382b] text-white shadow-xs'
                    : capturedImages.base
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-white text-neutral-700 border border-[#dad2c3]'
                }`}
              >
                {capturedImages.base ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span>3</span>
                )}
                <span>Angle 03: Base/Reverse</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-[#556159] italic">
            *Assesses observable surface characteristics across captured perspectives.
          </div>
        </div>

        {/* Main Viewport Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Left: Camera / Image Preview Area */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-4/3 bg-[#14291f] rounded-xl overflow-hidden border border-[#2d4d3b] flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : currentImage ? (
                <img
                  src={currentImage.url}
                  alt="Captured angle"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-neutral-400 flex flex-col items-center">
                  <Camera className="w-10 h-10 mb-2 opacity-50 text-[#c85a32]" />
                  <p className="text-sm font-medium text-white mb-1">
                    No image captured for{' '}
                    <span className="capitalize font-semibold text-[#86efac]">{activeAngle} View</span>
                  </p>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    Use your camera, upload an image file, or select a calibrated sample below.
                  </p>
                </div>
              )}

              {/* Laser Grid Reticle for Framing */}
              <div className="absolute inset-4 pointer-events-none border border-dashed border-white/25 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-white/50 absolute top-0 left-0" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-white/50 absolute top-0 right-0" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-white/50 absolute bottom-0 left-0" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-white/50 absolute bottom-0 right-0" />
                <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
                  MONOLAYER TRAY TARGET
                </span>
              </div>

              {isEvaluating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#22c55e]" />
                  <span className="text-xs font-mono">Evaluating Blur, Lighting & Framing...</span>
                </div>
              )}
            </div>

            {/* Camera / Upload Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {cameraActive ? (
                <>
                  <button
                    onClick={handleCaptureFromVideo}
                    className="flex-1 py-2 px-3 bg-[#22c55e] hover:bg-[#16a34a] text-neutral-900 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    onClick={stopCamera}
                    className="py-2 px-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startCamera}
                    className="flex-1 py-2 px-3 bg-[#1b382b] hover:bg-[#14291f] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-[#dad2c3] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-[#c85a32]" />
                    <span>Upload File</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>

            {cameraError && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Notice: </span>
                  {cameraError}
                </div>
              </div>
            )}

            {/* Quick Test Samples */}
            <div className="pt-2 border-t border-[#e5dec9]">
              <span className="text-[11px] font-semibold text-[#556159] block mb-1.5">
                Load Calibrated Agricultural Inspection Sample:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUseCalibratedSample(HERO_SAMPLE_IMAGE)}
                  className="p-1.5 rounded-lg border border-[#dad2c3] bg-white hover:border-[#1b382b] text-[11px] text-left transition-colors flex flex-col gap-1"
                >
                  <img
                    src={HERO_SAMPLE_IMAGE}
                    alt="Sample 1"
                    className="w-full h-12 object-cover rounded"
                  />
                  <span className="font-medium text-[#14291f] truncate">Pusa Red Monolayer</span>
                </button>
                <button
                  onClick={() => handleUseCalibratedSample(DEFECT_SAMPLE_IMAGE)}
                  className="p-1.5 rounded-lg border border-[#dad2c3] bg-white hover:border-[#1b382b] text-[11px] text-left transition-colors flex flex-col gap-1"
                >
                  <img
                    src={DEFECT_SAMPLE_IMAGE}
                    alt="Sample 2"
                    className="w-full h-12 object-cover rounded"
                  />
                  <span className="font-medium text-[#14291f] truncate">Defect Grid Sample</span>
                </button>
                <button
                  onClick={() => handleUseCalibratedSample(FACILITY_SAMPLE_IMAGE)}
                  className="p-1.5 rounded-lg border border-[#dad2c3] bg-white hover:border-[#1b382b] text-[11px] text-left transition-colors flex flex-col gap-1"
                >
                  <img
                    src={FACILITY_SAMPLE_IMAGE}
                    alt="Sample 3"
                    className="w-full h-12 object-cover rounded"
                  />
                  <span className="font-medium text-[#14291f] truncate">Lot Crate Overview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI-Guided Quality Verification Panel (Feature 02) */}
          <div className="flex flex-col gap-3 justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#14291f] pb-1 border-b border-[#e5dec9]">
                Image Quality & Visibility Assessment
              </h3>

              {currentImage?.qualityCheck ? (
                <div className="space-y-3">
                  {/* Status Banner */}
                  {currentImage.qualityCheck.status === 'pass' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2.5 text-xs text-emerald-900">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Image Quality Optimal: </span>
                        Sharp focus, balanced illumination, and adequate bulb distribution.
                      </div>
                    </div>
                  )}

                  {currentImage.qualityCheck.status === 'warning' && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Image Quality Acceptable (with warnings): </span>
                        Observations extracted, but review recommended guidance below.
                      </div>
                    </div>
                  )}

                  {currentImage.qualityCheck.status === 'fail' && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg flex items-start gap-2.5 text-xs text-rose-900">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Image Quality Insufficient: </span>
                        Cannot reliably grade. Please recapture following actionable guidance.
                      </div>
                    </div>
                  )}

                  {/* Quantitative Quality Scores */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-[#e5dec9]">
                      <div className="text-[11px] text-[#556159] mb-1">Sharpness / Blur</div>
                      <div className="font-mono font-bold text-sm text-[#14291f] tabular-nums">
                        {currentImage.qualityCheck.blurScore}/100
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {currentImage.qualityCheck.blurScore >= 60 ? '✓ Crisp focus' : '⚠ Soft focus'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-[#e5dec9]">
                      <div className="text-[11px] text-[#556159] mb-1">Ambient Illumination</div>
                      <div className="font-mono font-bold text-sm text-[#14291f] tabular-nums">
                        {currentImage.qualityCheck.lightingScore}/100
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {currentImage.qualityCheck.lightingScore >= 65 ? '✓ Balanced light' : '⚠ Shadows'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-[#e5dec9]">
                      <div className="text-[11px] text-[#556159] mb-1">Visible Onions In Frame</div>
                      <div className="font-mono font-bold text-sm text-[#14291f] tabular-nums">
                        ~{currentImage.qualityCheck.detectedOnionsCount} Bulbs
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {currentImage.qualityCheck.detectedOnionsCount >= 8 ? '✓ Sufficient sample' : '⚠ Too few'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-[#e5dec9]">
                      <div className="text-[11px] text-[#556159] mb-1">Cluster Occlusion</div>
                      <div className="font-mono font-bold text-sm text-[#14291f] tabular-nums">
                        {currentImage.qualityCheck.overlapIndex}% Overlap
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        {currentImage.qualityCheck.overlapIndex <= 30 ? '✓ Monolayer' : '⚠ Dense pile'}
                      </div>
                    </div>
                  </div>

                  {/* Actionable Guidance List (Feature 02 requirement) */}
                  <div className="p-3 bg-[#f5f0e8] rounded-lg border border-[#dad2c3]">
                    <span className="text-xs font-bold text-[#14291f] block mb-1.5 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#c85a32]" />
                      Actionable Guidance for Operator:
                    </span>
                    <ul className="text-xs text-[#38433d] space-y-1 list-disc list-inside">
                      {currentImage.qualityCheck.guidance.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-[#556159] bg-white rounded-lg border border-[#e5dec9] text-xs">
                  Capture or select an image to run live quality validation.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#e5dec9] flex items-center justify-between">
              <span className="text-xs text-[#556159]">
                Total captured angles: {Object.values(capturedImages).filter(Boolean).length} / 3
              </span>
              <button
                onClick={handleDone}
                disabled={!capturedImages.front}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                  capturedImages.front
                    ? 'bg-[#1b382b] hover:bg-[#14291f] text-white shadow-xs'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Save Angles & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
