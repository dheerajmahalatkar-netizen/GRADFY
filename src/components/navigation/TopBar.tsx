import React, { useState } from 'react';
import { UserRole, AppUser } from '../../types';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Bell,
  User,
  ChevronDown,
  Layers,
  FileText,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface TopBarProps {
  currentRole: UserRole;
  currentUser: AppUser;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOnline: boolean;
  syncQueueCount: number;
  unreadNotificationsCount: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSync: () => void;
  isSyncing: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole,
  currentUser,
  onRoleChange,
  activeTab,
  onTabChange,
  isOnline,
  syncQueueCount,
  unreadNotificationsCount,
  onOpenSearch,
  onOpenNotifications,
  onOpenSync,
  isSyncing,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e5dec9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b382b] rounded"
        >
          <span className="text-xl font-black tracking-tight text-[#14291f]">
            GRADFY
          </span>
          <span className="text-xs px-2 py-0.5 font-mono text-[#c85a32] bg-[#c85a32]/10 rounded font-bold">
            AGRI·AI
          </span>
        </button>

        {/* Zone 2: Clean Text Nav Links (single-line, 1-2 words) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#2c332e]">
          <button
            onClick={() => onTabChange('home')}
            className={`transition-colors whitespace-nowrap hover:text-[#14291f] py-1 ${
              activeTab === 'home'
                ? 'text-[#14291f] font-bold border-b-2 border-[#14291f]'
                : 'text-[#556159]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('grading')}
            className={`transition-colors whitespace-nowrap hover:text-[#14291f] py-1 ${
              activeTab === 'grading'
                ? 'text-[#14291f] font-bold border-b-2 border-[#14291f]'
                : 'text-[#556159]'
            }`}
          >
            Grade Batch
          </button>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`transition-colors whitespace-nowrap hover:text-[#14291f] py-1 ${
              activeTab === 'dashboard'
                ? 'text-[#14291f] font-bold border-b-2 border-[#14291f]'
                : 'text-[#556159]'
            }`}
          >
            Workspace
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={`transition-colors whitespace-nowrap hover:text-[#14291f] py-1 ${
              activeTab === 'reports'
                ? 'text-[#14291f] font-bold border-b-2 border-[#14291f]'
                : 'text-[#556159]'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => onTabChange('traceability')}
            className={`transition-colors whitespace-nowrap hover:text-[#14291f] py-1 ${
              activeTab === 'traceability'
                ? 'text-[#14291f] font-bold border-b-2 border-[#14291f]'
                : 'text-[#556159]'
            }`}
          >
            Traceability
          </button>
          <button
            onClick={() => onTabChange('system-info')}
            className={`transition-colors whitespace-nowrap hover:text-[#14291f] py-1 ${
              activeTab === 'system-info'
                ? 'text-[#14291f] font-bold border-b-2 border-[#14291f]'
                : 'text-[#556159]'
            }`}
          >
            System
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#556159] bg-[#f0eae0] hover:bg-[#eae2d3] border border-[#dad2c3] transition-colors"
            title="Global Search (Batches, Reports, Farmers)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Search</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-[#556159] hover:text-[#14291f] hover:bg-[#f0eae0] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c85a32]" />
            )}
          </button>

          {/* Sync Center Status Pill */}
          <button
            onClick={onOpenSync}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
              !isOnline
                ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                : syncQueueCount > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-[#f0eae0] text-[#424d46] border-[#dad2c3]'
            }`}
            title="Open Sync Center"
          >
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span className="hidden sm:inline font-bold">
              {!isOnline ? 'OFFLINE' : syncQueueCount > 0 ? `${syncQueueCount} SYNC` : 'ONLINE'}
            </span>
            <RefreshCw
              className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-800' : 'opacity-60'}`}
            />
          </button>

          {/* Role & Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-[#f0eae0] hover:bg-[#eae2d3] border border-[#dad2c3] text-xs font-semibold text-[#14291f] transition-colors"
            >
              <span className="w-6 h-6 rounded-lg bg-[#1b382b] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                {currentUser.avatarInitials}
              </span>
              <span className="hidden md:inline font-medium capitalize">
                {currentRole}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#556159]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#dad2c3] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                <div className="p-3 bg-[#fbf9f5] rounded-xl border border-[#e5dec9] mb-2">
                  <div className="font-bold text-[#14291f]">{currentUser.name}</div>
                  <div className="text-[11px] text-[#556159]">{currentUser.organization}</div>
                  <div className="text-[10px] font-mono text-emerald-800 mt-1 uppercase font-bold">
                    Role: {currentRole}
                  </div>
                </div>

                <div className="text-[10px] uppercase font-mono text-[#556159] px-2 py-1 font-bold">
                  Switch Active Role Persona:
                </div>

                <button
                  onClick={() => {
                    onRoleChange('farmer');
                    setProfileDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                    currentRole === 'farmer' ? 'bg-[#1b382b] text-white font-bold' : 'hover:bg-[#f5f0e8]'
                  }`}
                >
                  <div>
                    <div className="font-medium">Farmer Experience</div>
                    <div className="text-[10px] opacity-80">Ramesh Patil (Nashik)</div>
                  </div>
                  {currentRole === 'farmer' && <span>✓</span>}
                </button>

                <button
                  onClick={() => {
                    onRoleChange('buyer');
                    setProfileDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                    currentRole === 'buyer' ? 'bg-[#1b382b] text-white font-bold' : 'hover:bg-[#f5f0e8]'
                  }`}
                >
                  <div>
                    <div className="font-medium">Buyer / Procurement Hub</div>
                    <div className="text-[10px] opacity-80">Sunita Mehta (APMC Hub)</div>
                  </div>
                  {currentRole === 'buyer' && <span>✓</span>}
                </button>

                <button
                  onClick={() => {
                    onRoleChange('inspector');
                    setProfileDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                    currentRole === 'inspector' ? 'bg-[#1b382b] text-white font-bold' : 'hover:bg-[#f5f0e8]'
                  }`}
                >
                  <div>
                    <div className="font-medium">Chief Quality Inspector</div>
                    <div className="text-[10px] opacity-80">Sanjay Deshmukh (APMC)</div>
                  </div>
                  {currentRole === 'inspector' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
