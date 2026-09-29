import React, { useState, useRef } from 'react';
import { DetectedOnion } from '../../types';
import {
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tag,
  AlertTriangle,
  CheckCircle,
  Layers,
  SplitSquareVertical,
  Sliders,
} from 'lucide-react';

interface OnionOverlayViewerProps {
  imageUrl: string;
  detectedOnions: DetectedOnion[];
  aspectRatio?: string;
}

type ViewMode = 'original' | 'detections' | 'defects' | 'compare';

export const OnionOverlayViewer: React.FC<OnionOverlayViewerProps> = ({
  imageUrl,
  detectedOnions,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('detections');
  const [showLabels, setShowLabels] = useState(true);
  const [selectedOnion, setSelectedOnion] = useState<DetectedOnion | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  const getGradeBorderColor = (grade: string) => {
    switch (grade) {
      case 'Grade A':
        return '#22c55e'; // Green
      case 'Grade B':
        return '#eab308'; // Amber
      case 'Grade C':
        return '#f97316'; // Orange
      default:
        return '#ef4444'; // Red
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(3, z + 0.35));
  const handleZoomOut = () => {
    setZoomLevel((z) => {
      const next = Math.max(1, z - 0.35);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  // Filter onions based on viewMode
  const visibleOnions =
    viewMode === 'original'
      ? []
      : viewMode === 'defects'
      ? detectedOnions.filter((o) => o.defects.length > 0)
      : detectedOnions;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#dad2c3] bg-[#14291f] shadow-sm flex flex-col">
      {/* Top Controls Toolbar: Modes + Zoom Tools */}
      <div className="p-3 bg-[#0d1c14] border-b border-[#2d4d3b] flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* View Mode Segmented Tabs (Section 14 requirement: ORIGINAL, DETECTIONS, DEFECTS, COMPARE) */}
        <div className="flex items-center gap-1 bg-[#182f23] p-1 rounded-lg border border-[#2d4d3b]">
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
              viewMode === 'original'
                ? 'bg-[#22c55e] text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            ORIGINAL
          </button>
          <button
            onClick={() => setViewMode('detections')}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
              viewMode === 'detections'
                ? 'bg-[#22c55e] text-neutral-950 shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            DETECTIONS
          </button>
          <button
            onClick={() => setViewMode('defects')}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors ${
              viewMode === 'defects'
                ? 'bg-[#c85a32] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            DEFECTS
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-colors hidden sm:block ${
              viewMode === 'compare'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            COMPARE
          </button>
        </div>

        {/* Right tools: Labels & Zoom */}
        <div className="flex items-center gap-1.5">
          {viewMode !== 'original' && (
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                showLabels
                  ? 'bg-[#22c55e]/20 text-[#86efac] border-[#22c55e]/40'
                  : 'text-neutral-400 border-neutral-700 hover:text-white'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>{showLabels ? 'Tags ON' : 'Tags OFF'}</span>
            </button>
          )}

          <div className="flex items-center bg-[#182f23] rounded-lg border border-[#2d4d3b] p-0.5">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-neutral-300 hover:text-white hover:bg-white/10"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-neutral-300 hover:text-white hover:bg-white/10"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1 rounded text-neutral-300 hover:text-white hover:bg-white/10"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[10px] font-mono text-neutral-400 px-1.5 tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        className={`relative w-full aspect-4/3 max-h-[500px] overflow-hidden bg-black/60 flex items-center justify-center ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* COMPARE MODE: Split View (Side-by-Side on desktop / Tabbed on mobile) */}
        {viewMode === 'compare' ? (
          <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#2d4d3b]">
            {/* Left: Original Clean */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Original Inspection Sample"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300 border border-white/20">
                RAW UNPROCESSED
              </span>
            </div>

            {/* Right: Detected & Overlayed */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <img
                src={imageUrl}
                alt="AI Analyzed Sample"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#1b382b]/90 text-[10px] font-mono text-[#86efac] border border-[#22c55e]/40">
                AI COMPUTER VISION
              </span>

              {/* Bounding boxes in compare pane */}
              <div className="absolute inset-0 pointer-events-none">
                {detectedOnions.map((onion) => {
                  const borderColor = getGradeBorderColor(onion.grade);
                  return (
                    <div
                      key={onion.id}
                      style={{
                        left: `${onion.box.x}%`,
                        top: `${onion.box.y}%`,
                        width: `${onion.box.width}%`,
                        height: `${onion.box.height}%`,
                        borderColor,
                      }}
                      className="absolute border-2 rounded"
                    >
                      {onion.defects.length > 0 && (
                        <span className="absolute -top-4 left-0 px-1 bg-red-600 text-white text-[9px] font-mono rounded">
                          DEFECT
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD VIEWPORT WITH ZOOM & PAN */
          <div
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${
                panPosition.y / zoomLevel
              }px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt="Inspection sample"
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Interactive Bounding Box Overlays */}
            {viewMode !== 'original' && (
              <div className="absolute inset-0">
                {visibleOnions.map((onion) => {
                  const { box, id, diameterMm, grade, defects, confidence } = onion;
                  const borderColor = getGradeBorderColor(grade);
                  const isSelected = selectedOnion?.id === id;

                  return (
                    <div
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOnion(onion);
                      }}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                        borderColor,
                      }}
                      className={`absolute cursor-pointer rounded transition-all border-2 ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-1 bg-white/20 z-20'
                          : 'hover:bg-white/10 z-10'
                      }`}
                    >
                      {/* Metric Tag */}
                      {showLabels && (
                        <div
                          style={{ backgroundColor: borderColor }}
                          className="absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-neutral-950 shadow-xs whitespace-nowrap flex items-center gap-1"
                        >
                          <span>{diameterMm}mm</span>
                          {defects.length > 0 && (
                            <span className="text-red-950 font-black">!</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Onion Inspector Strip */}
      {selectedOnion && (
        <div className="p-3 bg-[#0d1c14] border-t border-[#2d4d3b] text-xs text-neutral-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              style={{ backgroundColor: getGradeBorderColor(selectedOnion.grade) }}
              className="px-2 py-0.5 rounded text-[10px] font-bold text-neutral-950 font-mono"
            >
              {selectedOnion.grade}
            </span>
            <span className="font-semibold text-white">ID: {selectedOnion.id}</span>
            <span className="text-neutral-500">·</span>
            <span className="font-mono text-neutral-200">
              Diameter: {selectedOnion.diameterMm} mm (~{selectedOnion.estimatedWeightGrams}g)
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">Skin: {selectedOnion.skinColor}</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">Confidence: {selectedOnion.confidence}%</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedOnion.defects.length > 0 ? (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Defects: {selectedOnion.defects.join(', ')}
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Clean Exterior
              </span>
            )}

            <button
              onClick={() => setSelectedOnion(null)}
              className="text-neutral-400 hover:text-white px-2 py-0.5 text-xs font-mono"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
