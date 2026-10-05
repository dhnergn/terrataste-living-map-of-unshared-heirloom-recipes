import React, { useState } from 'react';
import { RecipeDiscovery } from '../types/recipe';
import { MapPin, Heart, Clock, Utensils, Sparkles, ChefHat } from 'lucide-react';

interface RecipeCardProps {
  recipe: RecipeDiscovery;
  isSelected?: boolean;
  onSelect: (recipe: RecipeDiscovery) => void;
  onLocateOnMap?: (recipe: RecipeDiscovery) => void;
  onTogglePassport?: (recipe: RecipeDiscovery) => void;
  isInPassport?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isSelected,
  onSelect,
  onLocateOnMap,
  onTogglePassport,
  isInPassport,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article
      onClick={() => onSelect(recipe)}
      className={`group relative flex flex-col bg-[#181615] rounded-lg border transition-all duration-200 overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-[#F59E0B] shadow-lg ring-1 ring-[#F59E0B]/40'
          : 'border-[#2A2622] hover:border-[#3D3730] hover:bg-[#1E1B19]'
      }`}
    >
      {/* Visual Asset Container */}
      <div className="relative aspect-[16/10] w-full bg-[#121110] overflow-hidden">
        {!imageError && recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#241F1A] to-[#141210] p-4 text-center">
            <ChefHat className="w-8 h-8 text-[#A69C8E] mb-2 opacity-60" />
            <span className="font-serif text-xs text-[#8C8276] italic">
              Ancestral field record
            </span>
          </div>
        )}

        {/* Measured scrim overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181615] via-transparent to-black/20" />

        {/* Quick action buttons on image */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {onTogglePassport && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePassport(recipe);
              }}
              className={`p-1.5 rounded-md backdrop-blur-md transition-colors cursor-pointer ${
                isInPassport
                  ? 'bg-[#B45309] text-white'
                  : 'bg-[#181615]/80 text-[#C5BCB0] hover:text-[#EDE8E1] hover:bg-[#25221F]'
              }`}
              title={isInPassport ? 'Saved in Passport' : 'Save to Culinary Passport'}
            >
              <Heart className={`w-3.5 h-3.5 ${isInPassport ? 'fill-current' : ''}`} />
            </button>
          )}

          {onLocateOnMap && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLocateOnMap(recipe);
              }}
              className="p-1.5 rounded-md bg-[#181615]/80 text-[#C5BCB0] hover:text-[#F59E0B] hover:bg-[#25221F] backdrop-blur-md transition-colors cursor-pointer"
              title="Locate on Map"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Content: Zero-Pill Metadata & Curatorial Cadence */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Header */}
          <div className="flex items-center gap-2 text-xs text-[#8C8276] mb-1.5 font-medium">
            <span>{recipe.region}, {recipe.country}</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.category}</span>
          </div>

          {/* Primary Title */}
          <h3 className="font-serif text-base md:text-lg font-semibold text-[#FAF7F2] leading-snug group-hover:text-[#F59E0B] transition-colors mb-1">
            {recipe.title}
          </h3>

          {/* Native Dialect Kicker */}
          <div className="text-xs text-[#A69C8E] font-serif italic mb-2.5 line-clamp-1">
            {recipe.localName}
          </div>

          {/* Secret Ingredient / Technique Hook */}
          <div className="text-xs text-[#D6CEBE] line-clamp-2 leading-relaxed mb-3">
            <span className="text-[#F59E0B] font-medium not-italic">The Secret: </span>
            {recipe.secretIngredient}
          </div>
        </div>

        {/* Card Footer: Unboxed Metrics */}
        <div className="pt-2.5 border-t border-[#2A2622] flex items-center justify-between text-xs text-[#736B61]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#A69C8E]" />
              <span className="tabular-nums">{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#A69C8E]">{recipe.difficulty}</span>
          </div>

          <div className="text-[11px] text-[#A69C8E]">
            {recipe.secrecyLevel}
          </div>
        </div>
      </div>
    </article>
  );
};
