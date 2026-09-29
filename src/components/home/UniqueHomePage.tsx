import React from 'react';
import { Onion3DHero } from '../common/Onion3DHero';
import { HERO_SAMPLE_IMAGE, DEFECT_SAMPLE_IMAGE, FACILITY_SAMPLE_IMAGE } from '../../data/sampleBatches';
import {
  Camera,
  Layers,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  WifiOff,
  Cpu,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface UniqueHomePageProps {
  onStartGrading: () => void;
  onExplorePlatform: () => void;
  onOpenAudit: (reportId: string) => void;
}

export const UniqueHomePage: React.FC<UniqueHomePageProps> = ({
  onStartGrading,
  onExplorePlatform,
  onOpenAudit,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* SECTION 1: HERO CONCEPT — "SEE THE QUALITY. KNOW THE GRADE." */}
      <section className="relative pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Zone */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b382b]/10 border border-[#1b382b]/20 text-xs font-mono text-[#1b382b] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#c85a32]" />
              <span>INTELLIGENT ONION QUALITY INFRASTRUCTURE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#14291f] leading-[1.08] text-balance">
              SEE THE QUALITY. <br />
              <span className="text-[#c85a32]">KNOW THE GRADE.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#4b554e] leading-relaxed max-w-xl">
              GRADFY is an AI-powered agricultural quality assessment platform. Using computer vision and explainable metrics, we grade onion batches, detect surface defects, and issue verifiable digital passports for farmers, procurement centers, and exporters.
            </p>

            {/* Both buttons must work (Section 7 requirement) */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <button
                onClick={onStartGrading}
                className="px-6 py-3 rounded-xl bg-[#1b382b] hover:bg-[#14291f] active:bg-[#0f1f17] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md group"
              >
                <span>START GRADING BATCH</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onExplorePlatform}
                className="px-6 py-3 rounded-xl bg-white hover:bg-[#f5f0e8] text-[#14291f] border border-[#dad2c3] font-semibold text-xs sm:text-sm transition-all shadow-2xs"
              >
                EXPLORE PLATFORM
              </button>
            </div>

            {/* Quick Proof Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e5dec9] text-xs">
              <div>
                <span className="font-mono font-bold text-[#14291f] text-base sm:text-lg block tabular-nums">
                  0–100 OQI
                </span>
                <span className="text-[11px] text-[#556159]">Transparent Quality Index</span>
              </div>
              <div>
                <span className="font-mono font-bold text-[#14291f] text-base sm:text-lg block tabular-nums">
                  100% Offline
                </span>
                <span className="text-[11px] text-[#556159]">Local IndexedDB + Sync</span>
              </div>
              <div>
                <span className="font-mono font-bold text-[#14291f] text-base sm:text-lg block tabular-nums">
                  SHA-256
                </span>
                <span className="text-[11px] text-[#556159]">Verifiable QR Passports</span>
              </div>
            </div>
          </div>

          {/* Right 3D Visualizer Zone (Section 8: 3D + Animated UI) */}
          <div className="lg:col-span-6">
            <Onion3DHero />
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW GRADFY WORKS — 5-STEP CORE PIPELINE */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-[#c85a32] uppercase tracking-wider">
            Operational Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14291f]">
            The 5-Stage Agricultural Quality Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-[#556159]">
            From physical mandi crates to verifiable digital passports in under 60 seconds
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-4 bg-white rounded-xl border border-[#dad2c3] shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#c85a32] block">01. CAPTURE</span>
              <h3 className="font-bold text-xs text-[#14291f] mt-1">Multi-Angle Inspection</h3>
              <p className="text-[11px] text-[#556159] mt-1 leading-snug">
                Camera captures top, profile, and base views with real-time blur and lighting validation.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-emerald-800">✓ Monolayer check</div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-white rounded-xl border border-[#dad2c3] shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#c85a32] block">02. ANALYZE</span>
              <h3 className="font-bold text-xs text-[#14291f] mt-1">Computer Vision CV</h3>
              <p className="text-[11px] text-[#556159] mt-1 leading-snug">
                Detects individual bulb diameters, mechanical cuts, tunic peeling, and early neck sprouts.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-emerald-800">✓ Bounding boxes</div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-white rounded-xl border border-[#dad2c3] shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#c85a32] block">03. EXPLAIN</span>
              <h3 className="font-bold text-xs text-[#14291f] mt-1">Transparent OQI</h3>
              <p className="text-[11px] text-[#556159] mt-1 leading-snug">
                Shows exact mathematical attribution separating AI observations from configured standards.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-emerald-800">✓ "Why this grade?"</div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-white rounded-xl border border-[#dad2c3] shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#c85a32] block">04. VERIFY</span>
              <h3 className="font-bold text-xs text-[#14291f] mt-1">Human-in-the-Loop</h3>
              <p className="text-[11px] text-[#556159] mt-1 leading-snug">
                Low-confidence cases route to APMC inspectors for tactile validation and dataset feedback.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-emerald-800">✓ Expert sign-off</div>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-white rounded-xl border border-[#dad2c3] shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#c85a32] block">05. TRACE</span>
              <h3 className="font-bold text-xs text-[#14291f] mt-1">Digital Passport</h3>
              <p className="text-[11px] text-[#556159] mt-1 leading-snug">
                Generates verifiable QR certificates and SHA-256 tamper audits for buyers and exporters.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-emerald-800">✓ Instant audit</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INTERACTIVE GRADING VISUALIZATION & DEFECTS */}
      <section className="p-8 bg-white rounded-3xl border border-[#dad2c3] shadow-xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold text-[#1b382b] uppercase tracking-wider">
              Feature 01 & Feature 04
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14291f]">
              Explainable Grading & Onion Quality Index (OQI)
            </h2>
            <p className="text-xs sm:text-sm text-[#4b554e] leading-relaxed">
              Black-box AI has no place in agricultural trade disputes. GRADFY calculates an objective, 0–100 score based on 5 configurable factors: Size Uniformity (25%), Visible Defect Rate (30%), Sprouting Dormancy (20%), Skin Sheath (15%), and Shape Morphology (10%).
            </p>

            <div className="space-y-2 pt-2">
              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14291f]">Grade A Export Threshold</span>
                <span className="font-mono font-bold text-emerald-800">OQI ≥ 82 · Defects ≤ 6.0%</span>
              </div>
              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14291f]">Grade B Domestic Mandi</span>
                <span className="font-mono font-bold text-amber-800">OQI ≥ 68 · Defects ≤ 18.0%</span>
              </div>
              <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#dad2c3] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14291f]">Grade C Dehydration / Processing</span>
                <span className="font-mono font-bold text-orange-800">OQI 45–67 · Mechanical sorting</span>
              </div>
            </div>

            <button
              onClick={onStartGrading}
              className="px-5 py-2.5 bg-[#1b382b] hover:bg-[#14291f] text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-xs"
            >
              <span>Test Grading Engine On a Sample</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#dad2c3] shadow-md relative">
            <img
              src={DEFECT_SAMPLE_IMAGE}
              alt="Calibrated onion quality inspection sample"
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-[#0d1c14]/90 backdrop-blur-md rounded-xl border border-[#2d4d3b] text-white flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 font-mono">CALIBRATED INTAKE SAMPLE</span>
                <div className="font-bold text-[#86efac]">OQI 88.5 · Grade A Certified</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#86efac] font-mono text-[11px] font-bold">
                ✓ 46 Bulbs Evaluated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DIGITAL QUALITY PASSPORT & QR TRACEABILITY DEMO */}
      <section className="p-8 bg-gradient-to-br from-[#182f23] via-[#14291f] to-[#0f1f17] rounded-3xl text-white border border-[#2d4d3b] shadow-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/30 text-xs font-mono text-[#86efac]">
              <QrCode className="w-3.5 h-3.5" />
              <span>DIGITAL PASSPORT & CRYPTOGRAPHIC VERIFICATION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Anti-Tamper Traceability for Every Crate
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every graded lot is issued a GRADFY Quality Passport anchored with a unique SHA-256 integrity hash, model version tag, and QR code. Retail buyers, export terminals, and customs inspectors can instantly audit report validity without exposing sensitive farmer records.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onOpenAudit('REP-GRD-0891')}
                className="px-5 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simulate Passport Audit (REP-GRD-0891)</span>
              </button>
            </div>
          </div>

          <div className="p-6 bg-[#0d1c14] rounded-2xl border border-[#2d4d3b] font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d4d3b]">
              <span className="text-[#86efac] font-bold">PASSPORT IDENTITY: PASS-2026-0891</span>
              <span className="text-[10px] text-neutral-400">STATUS: VERIFIED</span>
            </div>
            <div className="space-y-1.5 text-neutral-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Farmer:</span>
                <span className="text-white">Ramesh Patil (Nashik)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Intake Hub:</span>
                <span className="text-white">Lasalgaon APMC Terminal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Calculated OQI:</span>
                <span className="text-[#4ade80] font-bold">88.5 / 100 (Grade A)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Storage Risk:</span>
                <span className="text-[#86efac]">LOW (4-6 Months Safe Buffer)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Model Version:</span>
                <span>GRADFY-YOLO-v2.4-cv</span>
              </div>
            </div>
            <div className="pt-2 border-t border-[#2d4d3b] text-[10px] text-neutral-400 break-all">
              HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: OFFLINE-FIRST AGRICULTURAL ARCHITECTURE */}
      <section className="space-y-6 pt-2">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold text-[#1b382b] uppercase tracking-wider">
            Resilient Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14291f]">
            Engineered for Zero-Connectivity Mandis
          </h2>
          <p className="text-xs sm:text-sm text-[#556159]">
            Agricultural procurement takes place in rural yards with spotty 2G coverage. GRADFY works 100% offline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <WifiOff className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#14291f]">1. Local IndexedDB Cache</h3>
            <p className="text-xs text-[#556159] leading-relaxed">
              Every batch, quality score, lot breakdown, and image metadata is persisted locally on the operator's device without requiring a server connection.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#14291f]">2. Client-Side Vision Engine</h3>
            <p className="text-xs text-[#556159] leading-relaxed">
              Color segmentation, blur detection, size estimation, and OQI formula calculations run on-device via optimized JavaScript/Canvas routines.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-800">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#14291f]">3. Automated Background Sync</h3>
            <p className="text-xs text-[#556159] leading-relaxed">
              When network connectivity is restored, the synchronization queue pushes queued batches and audit logs to the master PostgreSQL registry.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: FARMER + BUYER ECOSYSTEM */}
      <section className="p-8 bg-[#f5f0e8] rounded-3xl border border-[#dad2c3] space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-mono font-bold text-[#c85a32] uppercase tracking-wider">
            Two-Sided Market Transparency
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14291f]">
            Empowering Farmers. Assuring Buyers.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#c85a32]/10 flex items-center justify-center text-[#c85a32] font-bold text-xs">
                🌾
              </div>
              <h3 className="text-base font-bold text-[#14291f]">Farmer Benefits</h3>
            </div>
            <ul className="text-xs text-[#4b554e] space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Fair, unmanipulated grade assessment backed by explainable OQI factors</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Historical quality trend charts highlighting curing and storage improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Quality-to-value estimator for calculating fair mandi price realizations</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#dad2c3] shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1b382b]/10 flex items-center justify-center text-[#1b382b] font-bold text-xs">
                🏢
              </div>
              <h3 className="text-base font-bold text-[#14291f]">Buyer & Mandi Benefits</h3>
            </div>
            <ul className="text-xs text-[#4b554e] space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Rapid representative sampling (ISO 2859) avoiding manual crate sorting</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Automated lot segregation into export, domestic, and processing tiers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>Verifiable digital quality passports guaranteeing compliance to end-buyers</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 7: RESPONSIBLE AI / HUMAN-IN-THE-LOOP */}
      <section className="p-6 sm:p-8 bg-white rounded-3xl border border-[#dad2c3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-700 font-bold">
            <UserCheck className="w-4 h-4" />
            <span>RESPONSIBLE AI CONSTITUTION</span>
          </div>
          <h3 className="text-xl font-bold text-[#14291f]">
            Human Oversight is Mandatory for Borderline Inferences
          </h3>
          <p className="text-xs text-[#556159] leading-relaxed">
            GRADFY never makes irreversible commercial claims without safety bounds. When model confidence falls below the configured 75% threshold or active sprouting exceeds safety limits, batches are automatically routed to APMC inspectors for physical sign-off.
          </p>
        </div>

        <button
          onClick={onStartGrading}
          className="px-6 py-3 bg-[#1b382b] hover:bg-[#14291f] text-white font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0 whitespace-nowrap"
        >
          Open Grading Studio
        </button>
      </section>
    </div>
  );
};
