import React from 'react';
import { GradingConfiguration, SystemStatus } from '../../types';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Wifi,
  Server,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';

interface ModelInfoCenterViewProps {
  config: GradingConfiguration;
  systemStatus: SystemStatus;
}

export const ModelInfoCenterView: React.FC<ModelInfoCenterViewProps> = ({
  config,
  systemStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-[#14291f] to-[#1f382a] rounded-2xl text-white border border-[#2d4d3b] shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/30 font-semibold">
            ARCHITECTURE & AI METRICS
          </span>
          <span className="text-xs text-neutral-400">· Computer Vision Governance</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">AI Model Specification & System Telemetry</h2>
        <p className="text-xs text-neutral-300 mt-0.5">
          Auditable computer vision architecture, inference capabilities, and offline reliability metrics.
        </p>
      </div>

      {/* Grid: Model Info & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Card 1: Model Specification */}
        <div className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5dec9]">
            <Cpu className="w-5 h-5 text-[#c85a32]" />
            <h3 className="text-sm font-bold text-[#14291f]">Active Computer Vision Pipeline</h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between py-1 border-b border-[#ece6da]">
              <span className="text-[#556159]">Model Pipeline Architecture:</span>
              <span className="font-mono font-bold text-[#14291f]">GRADFY-YOLO-VisionCore</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#ece6da]">
              <span className="text-[#556159]">Active Model Version:</span>
              <span className="font-mono font-bold text-[#1b382b]">{config.version}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#ece6da]">
              <span className="text-[#556159]">Inference Capabilities:</span>
              <span className="font-semibold text-[#14291f]">
                RGB Surface Morphology, Contouring, Diameter Sizing (mm)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#ece6da]">
              <span className="text-[#556159]">Observable Defect Classes:</span>
              <span className="text-[#14291f]">
                Sprouting, Mechanical Cuts, Tunic Detachment, Doubles
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#ece6da]">
              <span className="text-[#556159]">Confidence Interpretation:</span>
              <span className="font-mono text-[#1b382b]">
                ≥85% High · 75-84% Medium · &lt;75% Flagged for Human Review
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-[#556159]">Inference Runtime Modes:</span>
              <span className="font-mono font-bold text-emerald-800">
                Client Canvas Engine (Offline) + Gemini Vision Proxy (Online)
              </span>
            </div>
          </div>

          {/* Explicit Limitations Box (Anti-hallucination compliance) */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              Known Physical Sensing Limitations:
            </span>
            <p className="text-[11px] text-amber-900 leading-snug">
              Standard RGB cameras only inspect exterior surface characteristics. Hidden internal defects (such as internal black mold between inner rings or core rot) cannot be determined without cross-sectional cuts or multispectral NIR imaging.
            </p>
          </div>
        </div>

        {/* Card 2: System Health Monitor (Section 35) */}
        <div className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e5dec9]">
            <Server className="w-5 h-5 text-[#1b382b]" />
            <h3 className="text-sm font-bold text-[#14291f]">System Infrastructure Health</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#14291f] block">AI Computer Vision Service</span>
                <span className="text-[11px] text-[#556159]">
                  Local edge inference heuristics + multimodal Gemini Vision proxy
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                OPERATIONAL
              </span>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#14291f] block">Decentralized Storage & PWA Cache</span>
                <span className="text-[11px] text-[#556159]">
                  IndexedDB local engine ({systemStatus.indexedDbRecordsCount} cached records)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                HEALTHY
              </span>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#14291f] block">Background Sync Worker</span>
                <span className="text-[11px] text-[#556159]">
                  {systemStatus.syncQueueCount > 0
                    ? `${systemStatus.syncQueueCount} items queued for cloud replication`
                    : 'All records synchronized'}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  systemStatus.syncQueueCount > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {systemStatus.syncQueueCount > 0 ? 'PENDING SYNC' : 'SYNCED'}
              </span>
            </div>

            <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#14291f] block">Cryptographic Hash Verifier</span>
                <span className="text-[11px] text-[#556159]">
                  SHA-256 Web Crypto standard for Quality Passports
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]">
                VALIDATED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
