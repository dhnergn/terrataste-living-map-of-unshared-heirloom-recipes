import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Continent, CulinaryCategory } from '../types/recipe';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedContinent: Continent | 'All';
  onContinentChange: (continent: Continent | 'All') => void;
  selectedCategory: CulinaryCategory | 'All';
  onCategoryChange: (category: CulinaryCategory | 'All') => void;
  selectedSecrecy: string;
  onSecrecyChange: (secrecy: string) => void;
  totalCount: number;
}

const CONTINENTS: (Continent | 'All')[] = [
  'All',
  'Europe',
  'Asia',
  'Africa',
  'Americas',
  'Middle East',
];

const CATEGORIES: (CulinaryCategory | 'All')[] = [
  'All',
  'Street Food Wonder',
  'Ancient Hearth Dish',
  'Fermented Secret',
  'Mountain Sustenance',
  'Coastal Hidden Gem',
  'Celebration Feast',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedContinent,
  onContinentChange,
  selectedCategory,
  onCategoryChange,
  selectedSecrecy,
  onSecrecyChange,
  totalCount,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedContinent !== 'All' ||
    selectedCategory !== 'All' ||
    selectedSecrecy !== 'All';

  const handleResetFilters = () => {
    onSearchChange('');
    onContinentChange('All');
    onCategoryChange('All');
    onSecrecyChange('All');
  };

  return (
    <div className="w-full flex flex-col gap-3 py-3 border-b border-[#2A2622]">
      {/* Top Search & Category Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8276]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by secret ingredient, dish, country, or technique..."
            className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-[#1A1816] text-[#EDE8E1] placeholder-[#736B61] border border-[#332F2A] rounded-md focus:outline-none focus:border-[#F59E0B] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8276] hover:text-[#EDE8E1] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Category & Secrecy Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-[#1A1816] text-[#D1C7BA] border border-[#332F2A] rounded-md focus:outline-none focus:border-[#F59E0B] cursor-pointer whitespace-nowrap"
          >
            <option value="All">All Categories</option>
            <option value="Street Food Wonder">Street Food Wonder</option>
            <option value="Ancient Hearth Dish">Ancient Hearth Dish</option>
            <option value="Fermented Secret">Fermented Secret</option>
            <option value="Mountain Sustenance">Mountain Sustenance</option>
            <option value="Coastal Hidden Gem">Coastal Hidden Gem</option>
            <option value="Celebration Feast">Celebration Feast</option>
          </select>

          <select
            value={selectedSecrecy}
            onChange={(e) => onSecrecyChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-[#1A1816] text-[#D1C7BA] border border-[#332F2A] rounded-md focus:outline-none focus:border-[#F59E0B] cursor-pointer whitespace-nowrap"
          >
            <option value="All">All Secrecy Levels</option>
            <option value="Guarded Family Heirloom">Guarded Family Heirloom</option>
            <option value="Whispered Village Specialty">Whispered Village Specialty</option>
            <option value="Ancient Monastery Archive">Ancient Monastery Archive</option>
            <option value="Hidden Alleyway Stall">Hidden Alleyway Stall</option>
            <option value="Remote Foraged Tradition">Remote Foraged Tradition</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-[#F59E0B] hover:text-[#D97706] px-2 py-1 transition-colors whitespace-nowrap cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-xs text-[#736B61] hidden lg:inline font-mono">
            {totalCount} {totalCount === 1 ? 'heirloom mapped' : 'heirlooms mapped'}
          </span>
        </div>
      </div>

      {/* Continents Segmented Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] uppercase tracking-wider text-[#736B61] mr-1.5 hidden sm:inline">
          Continent:
        </span>
        {CONTINENTS.map((continent) => (
          <button
            key={continent}
            onClick={() => onContinentChange(continent)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              selectedContinent === continent
                ? 'bg-[#2E2822] text-[#F59E0B] border border-[#F59E0B]/30'
                : 'text-[#A69C8E] hover:text-[#EDE8E1] hover:bg-[#1E1B18]'
            }`}
          >
            {continent}
          </button>
        ))}
      </div>
    </div>
  );
};
