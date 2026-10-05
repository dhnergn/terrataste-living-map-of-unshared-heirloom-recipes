import React from 'react';
import { RecipeDiscovery } from '../types/recipe';
import { Compass, Heart, ChefHat, MapPin, Award, Trash2, BookOpen } from 'lucide-react';

interface PassportDrawerProps {
  savedRecipes: RecipeDiscovery[];
  onSelectRecipe: (recipe: RecipeDiscovery) => void;
  onRemoveFromPassport: (recipeId: string) => void;
  onEnterCookMode: (recipe: RecipeDiscovery) => void;
  onClose: () => void;
}

export const PassportDrawer: React.FC<PassportDrawerProps> = ({
  savedRecipes,
  onSelectRecipe,
  onRemoveFromPassport,
  onEnterCookMode,
  onClose,
}) => {
  // Compute continents visited
  const continentsVisited = Array.from(new Set(savedRecipes.map((r) => r.continent)));

  // Badges calculation
  const badges = [
    {
      title: 'Hearth Keeper',
      desc: 'Collected ancestral fire dishes',
      unlocked: savedRecipes.some((r) => r.category === 'Ancient Hearth Dish'),
    },
    {
      title: 'Flame Seeker',
      desc: 'Discovered high-heat street food wonders',
      unlocked: savedRecipes.some((r) => r.category === 'Street Food Wonder'),
    },
    {
      title: 'Alpine Forager',
      desc: 'Mapped mountain survival sustenance',
      unlocked: savedRecipes.some((r) => r.category === 'Mountain Sustenance'),
    },
    {
      title: 'Global Cartographer',
      desc: 'Charter of 3 or more continents',
      unlocked: continentsVisited.length >= 3,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-8 animate-in fade-in">
      {/* Passport Hero Banner */}
      <div className="p-6 md:p-8 rounded-xl bg-gradient-to-r from-[#1C1814] via-[#1E1B18] to-[#161413] border border-[#2F2923] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#F59E0B] mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Official Culinary Passport · Field Record</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold text-[#FAF7F2] mb-1">
            My Gastronomic Archive
          </h2>
          <p className="text-xs md:text-sm text-[#A69C8E] max-w-xl">
            A preserved ledger of secret preparations, unwritten family heirloom traditions, and personal taste discoveries across the globe.
          </p>
        </div>

        {/* Passport Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[#332E28] pt-4 md:pt-0 md:pl-6 text-xs">
          <div>
            <div className="font-serif text-2xl font-bold text-[#FAF7F2] tabular-nums">
              {savedRecipes.length}
            </div>
            <div className="text-[#8C8276] uppercase tracking-wider text-[10px]">
              Heirlooms Collected
            </div>
          </div>

          <div>
            <div className="font-serif text-2xl font-bold text-[#F59E0B] tabular-nums">
              {continentsVisited.length}/6
            </div>
            <div className="text-[#8C8276] uppercase tracking-wider text-[10px]">
              Continents Charted
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Badges */}
      <div>
        <div className="text-xs uppercase tracking-widest text-[#8C8276] font-semibold mb-3">
          Culinary Expedition Seals
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-lg border transition-all ${
                b.unlocked
                  ? 'bg-[#1F1B16] border-[#D97706]/40 text-[#EDE8E1]'
                  : 'bg-[#151312] border-[#262320] opacity-40 text-[#736B61]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Award className={`w-4 h-4 ${b.unlocked ? 'text-[#F59E0B]' : 'text-[#736B61]'}`} />
                <span className="text-xs font-semibold">{b.title}</span>
              </div>
              <p className="text-[11px] leading-tight text-[#8C8276]">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Collected Recipes List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-[#8C8276] font-semibold">
            Collected Dishes ({savedRecipes.length})
          </div>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#161413] border border-[#26221E] space-y-3">
            <BookOpen className="w-8 h-8 text-[#8C8276] mx-auto opacity-50" />
            <h3 className="font-serif text-lg font-medium text-[#FAF7F2]">
              Your Passport is pristine
            </h3>
            <p className="text-xs text-[#8C8276] max-w-sm mx-auto leading-relaxed">
              Explore the living map and click the heart icon on any secret discovery to collect it into your personal heirloom book.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group relative p-4 rounded-lg bg-[#181615] border border-[#2A2622] hover:border-[#3D3730] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8C8276] mb-1">
                    <span>{recipe.locationName}</span>
                    <button
                      onClick={() => onRemoveFromPassport(recipe.id)}
                      className="text-[#736B61] hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove from passport"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4
                    onClick={() => onSelectRecipe(recipe)}
                    className="font-serif text-lg font-semibold text-[#FAF7F2] group-hover:text-[#F59E0B] transition-colors cursor-pointer mb-1 line-clamp-1"
                  >
                    {recipe.title}
                  </h4>

                  <div className="text-xs font-serif italic text-[#A69C8E] mb-2 line-clamp-1">
                    {recipe.localName}
                  </div>

                  <p className="text-xs text-[#C5BCB0] line-clamp-2 mb-3">
                    <span className="text-[#F59E0B]">Secret: </span>
                    {recipe.secretIngredient}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#26221E] flex items-center justify-between">
                  <button
                    onClick={() => onSelectRecipe(recipe)}
                    className="text-xs text-[#F59E0B] hover:underline cursor-pointer"
                  >
                    Open Dossier
                  </button>

                  <button
                    onClick={() => onEnterCookMode(recipe)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#221F1C] hover:bg-[#2E2822] text-xs font-medium text-[#EDE8E1] rounded transition-colors cursor-pointer"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Cook</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
