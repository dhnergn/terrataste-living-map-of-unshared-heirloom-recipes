import React from 'react';
import { Compass, Sparkles, Plus, BookOpen, MapPin } from 'lucide-react';

interface NavbarProps {
  activeView: 'map' | 'archive' | 'passport';
  onViewChange: (view: 'map' | 'archive' | 'passport') => void;
  onOpenPinModal: () => void;
  onOpenArchaeologist: () => void;
  userPinsCount: number;
  passportCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onOpenPinModal,
  onOpenArchaeologist,
  userPinsCount,
  passportCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121110]/95 backdrop-blur-md border-b border-[#2A2622] px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onViewChange('map')}
          className="text-left group cursor-pointer focus-visible:outline-none"
        >
          <span className="text-xl md:text-2xl font-serif font-medium tracking-tight text-[#FAF7F2] group-hover:text-[#F59E0B] transition-colors">
            TerraTaste
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A69C8E]">
          <button
            onClick={() => onViewChange('map')}
            className={`transition-colors relative py-1 focus-visible:outline-none ${
              activeView === 'map'
                ? 'text-[#F59E0B]'
                : 'hover:text-[#EDE8E1]'
            }`}
          >
            Living Map
            {activeView === 'map' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
            )}
          </button>

          <button
            onClick={() => onViewChange('archive')}
            className={`transition-colors relative py-1 focus-visible:outline-none ${
              activeView === 'archive'
                ? 'text-[#F59E0B]'
                : 'hover:text-[#EDE8E1]'
            }`}
          >
            Heirloom Archive
            {activeView === 'archive' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
            )}
          </button>

          <button
            onClick={() => onViewChange('passport')}
            className={`transition-colors relative py-1 focus-visible:outline-none flex items-center gap-1.5 ${
              activeView === 'passport'
                ? 'text-[#F59E0B]'
                : 'hover:text-[#EDE8E1]'
            }`}
          >
            My Passport
            {passportCount > 0 && (
              <span className="text-xs bg-[#2E2822] text-[#F59E0B] px-1.5 py-0.2 rounded font-mono">
                {passportCount}
              </span>
            )}
            {activeView === 'passport' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenArchaeologist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium text-[#E4D8C8] bg-[#221F1C] hover:bg-[#2D2925] border border-[#3E3832] rounded-md transition-all whitespace-nowrap cursor-pointer hover:border-[#D97706]/50"
            title="Decipher a vague food memory using Culinary AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden sm:inline">Culinary Archaeologist</span>
            <span className="sm:hidden">Decode</span>
          </button>

          <button
            onClick={onOpenPinModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs md:text-sm font-medium text-black bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-all whitespace-nowrap shadow-sm cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pin A Discovery</span>
          </button>
        </div>
      </div>
    </header>
  );
};
