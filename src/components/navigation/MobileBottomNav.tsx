import React from 'react';
import { UserRole } from '../../types';
import {
  Home,
  Camera,
  Layers,
  FileText,
  ShieldCheck,
  Search,
  User,
  RefreshCw,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenSync: () => void;
  syncQueueCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  onOpenSearch,
  onOpenSync,
  syncQueueCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-lg border-t border-[#e5dec9] px-2 py-1 flex items-center justify-around text-xs shadow-lg">
      {/* 1. Home */}
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
          activeTab === 'home'
            ? 'text-[#1b382b] font-bold'
            : 'text-[#556159] hover:text-[#1b382b]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Home</span>
      </button>

      {/* 2. Workspace / Dashboard */}
      <button
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
          activeTab === 'dashboard'
            ? 'text-[#1b382b] font-bold'
            : 'text-[#556159] hover:text-[#1b382b]'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">
          {currentRole === 'farmer' ? 'Batches' : currentRole === 'buyer' ? 'Intake' : 'Queue'}
        </span>
      </button>

      {/* 3. Primary Center Action: Grade / Capture */}
      <button
        onClick={() => onTabChange('grading')}
        className="flex flex-col items-center justify-center -mt-4 bg-[#1b382b] hover:bg-[#14291f] text-white rounded-full p-3 shadow-md border-2 border-[#fbf9f5] transition-transform active:scale-95"
      >
        <Camera className="w-6 h-6 text-[#86efac]" />
        <span className="sr-only">New Batch</span>
      </button>

      {/* 4. Reports */}
      <button
        onClick={() => onTabChange('reports')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[56px] min-h-[44px] ${
          activeTab === 'reports'
            ? 'text-[#1b382b] font-bold'
            : 'text-[#556159] hover:text-[#1b382b]'
        }`}
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Reports</span>
      </button>

      {/* 5. Search / Traceability */}
      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center justify-center p-2 rounded-xl transition-colors text-[#556159] hover:text-[#1b382b] min-w-[56px] min-h-[44px]"
      >
        <Search className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Search</span>
      </button>
    </nav>
  );
};
