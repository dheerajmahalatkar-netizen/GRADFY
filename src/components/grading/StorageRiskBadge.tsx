import React, { useState } from 'react';
import { StorageRiskAssessment } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface StorageRiskBadgeProps {
  storageRisk: StorageRiskAssessment;
}

export const StorageRiskBadge: React.FC<StorageRiskBadgeProps> = ({ storageRisk }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeStyle = () => {
    switch (storageRisk.level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-900',
          tagBg: 'bg-emerald-600',
          icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-900',
          tagBg: 'bg-amber-600',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          text: 'text-rose-900',
          tagBg: 'bg-rose-600',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className={`p-4 rounded-xl border ${style.border} ${style.bg} transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {style.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#14291f]">
                Storage Spoilage Risk
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white ${style.tagBg}`}
              >
                {storageRisk.level} RISK ({storageRisk.riskScore}/100)
              </span>
            </div>
            <p className="text-xs text-[#4b554e] mt-0.5">{storageRisk.recommendation}</p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[#525e57] hover:text-[#14291f] flex items-center gap-1 font-medium p-1 rounded hover:bg-black/5"
        >
          <span>Why?</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-black/10 space-y-2 text-xs">
          <div className="font-semibold text-[#14291f]">Observable Factor Attribution:</div>
          <ul className="space-y-1 list-disc list-inside text-[#38433d]">
            {storageRisk.factors.map((factor, idx) => (
              <li key={idx}>{factor}</li>
            ))}
          </ul>

          <div className="p-2.5 bg-white/70 rounded-md border border-black/5 text-[11px] text-[#556159] italic mt-2">
            <strong>Disclaimer: </strong>
            {storageRisk.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
