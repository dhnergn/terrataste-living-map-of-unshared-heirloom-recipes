import React, { useState, useEffect, useMemo } from 'react';
import { SEED_RECIPES } from './data/seedRecipes';
import { RecipeDiscovery, Continent, CulinaryCategory } from './types/recipe';
import { Navbar } from './components/Navbar';
import { RecipeMap } from './components/RecipeMap';
import { RecipeCard } from './components/RecipeCard';
import { FilterBar } from './components/FilterBar';
import { RecipeModal } from './components/RecipeModal';
import { CookModeModal } from './components/CookModeModal';
import { PinRecipeModal } from './components/PinRecipeModal';
import { ArchaeologistModal } from './components/ArchaeologistModal';
import { PassportDrawer } from './components/PassportDrawer';
import {
  Compass,
  Map as MapIcon,
  LayoutGrid,
  Sparkles,
  Flame,
  Plus,
  BookOpen,
} from 'lucide-react';

export default function App() {
  // Recipes State (Seeds + LocalStorage User Pins)
  const [recipes, setRecipes] = useState<RecipeDiscovery[]>(() => {
    try {
      const stored = localStorage.getItem('terrataste_user_pins');
      if (stored) {
        const userPins: RecipeDiscovery[] = JSON.parse(stored);
        return [...userPins, ...SEED_RECIPES];
      }
    } catch (e) {
      console.error(e);
    }
    return SEED_RECIPES;
  });

  // Passport Bookmarks State
  const [passportIds, setPassportIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('terrataste_passport');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return ['rec-matera-cialledda', 'rec-penang-clan-crab'];
  });

  // Navigation & View States
  const [activeView, setActiveView] = useState<'map' | 'archive' | 'passport'>('map');
  const [mapLayoutMode, setMapLayoutMode] = useState<'split' | 'map-only'>('split');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<Continent | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<CulinaryCategory | 'All'>('All');
  const [selectedSecrecy, setSelectedSecrecy] = useState<string>('All');

  // Active Modals
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDiscovery | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<RecipeDiscovery | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isArchaeologistOpen, setIsArchaeologistOpen] = useState(false);
  const [tempPinCoordinates, setTempPinCoordinates] = useState<[number, number] | null>(null);

  // Sync Passport to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('terrataste_passport', JSON.stringify(passportIds));
    } catch (e) {}
  }, [passportIds]);

  // Handle Adding User Pin
  const handleSaveRecipe = (newRecipe: RecipeDiscovery) => {
    const updated = [newRecipe, ...recipes];
    setRecipes(updated);
    setSelectedRecipe(newRecipe);

    // Save only user pinned items
    try {
      const userOnly = updated.filter((r) => r.isUserPinned);
      localStorage.setItem('terrataste_user_pins', JSON.stringify(userOnly));
    } catch (e) {}
  };

  // Toggle Passport
  const handleTogglePassport = (recipe: RecipeDiscovery) => {
    setPassportIds((prev) =>
      prev.includes(recipe.id) ? prev.filter((id) => id !== recipe.id) : [...prev, recipe.id]
    );
  };

  const handleRemoveFromPassport = (recipeId: string) => {
    setPassportIds((prev) => prev.filter((id) => id !== recipeId));
  };

  // Filter Recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Continent filter
      if (selectedContinent !== 'All' && recipe.continent !== selectedContinent) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'All' && recipe.category !== selectedCategory) {
        return false;
      }
      // Secrecy filter
      if (selectedSecrecy !== 'All' && recipe.secrecyLevel !== selectedSecrecy) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesLocal = recipe.localName.toLowerCase().includes(q);
        const matchesCountry = recipe.country.toLowerCase().includes(q);
        const matchesRegion = recipe.region.toLowerCase().includes(q);
        const matchesSecret = recipe.secretIngredient.toLowerCase().includes(q);
        const matchesIngredient = recipe.ingredients.some((ing) =>
          ing.item.toLowerCase().includes(q)
        );
        return (
          matchesTitle ||
          matchesLocal ||
          matchesCountry ||
          matchesRegion ||
          matchesSecret ||
          matchesIngredient
        );
      }
      return true;
    });
  }, [recipes, selectedContinent, selectedCategory, selectedSecrecy, searchQuery]);

  // Passport recipes
  const passportRecipes = useMemo(() => {
    return recipes.filter((r) => passportIds.includes(r.id));
  }, [recipes, passportIds]);

  const userPinsCount = recipes.filter((r) => r.isUserPinned).length;

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-[#EDE8E1] flex flex-col font-sans">
      {/* Top Bar Contract Navbar */}
      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenPinModal={() => {
          setTempPinCoordinates(null);
          setIsPinModalOpen(true);
        }}
        onOpenArchaeologist={() => setIsArchaeologistOpen(true)}
        userPinsCount={userPinsCount}
        passportCount={passportIds.length}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeView === 'passport' ? (
          <PassportDrawer
            savedRecipes={passportRecipes}
            onSelectRecipe={setSelectedRecipe}
            onRemoveFromPassport={handleRemoveFromPassport}
            onEnterCookMode={setCookingRecipe}
            onClose={() => setActiveView('map')}
          />
        ) : (
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-4 flex-1 flex flex-col">
            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedContinent={selectedContinent}
              onContinentChange={setSelectedContinent}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedSecrecy={selectedSecrecy}
              onSecrecyChange={setSelectedSecrecy}
              totalCount={filteredRecipes.length}
            />

            {/* View Header with Split/Map Switcher when on Map View */}
            {activeView === 'map' && (
              <div className="flex items-center justify-between py-2.5 text-xs text-[#8C8276]">
                <div className="flex items-center gap-2 font-mono">
                  <span>LIVE CARTOGRAPHY</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#F59E0B]">CLICK ANYWHERE ON GLOBE TO PIN</span>
                </div>

                <div className="flex items-center gap-1 bg-[#1A1816] p-1 rounded-md border border-[#2D2925]">
                  <button
                    onClick={() => setMapLayoutMode('split')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      mapLayoutMode === 'split'
                        ? 'bg-[#292522] text-[#FAF7F2]'
                        : 'text-[#8C8276] hover:text-[#EDE8E1]'
                    }`}
                  >
                    Split Map & Feed
                  </button>
                  <button
                    onClick={() => setMapLayoutMode('map-only')}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      mapLayoutMode === 'map-only'
                        ? 'bg-[#292522] text-[#FAF7F2]'
                        : 'text-[#8C8276] hover:text-[#EDE8E1]'
                    }`}
                  >
                    Expanded Map
                  </button>
                </div>
              </div>
            )}

            {/* Active View Content */}
            {activeView === 'map' ? (
              <div
                className={`flex-1 grid gap-4 py-2 ${
                  mapLayoutMode === 'split'
                    ? 'grid-cols-1 lg:grid-cols-12 min-h-[700px]'
                    : 'grid-cols-1 min-h-[750px]'
                }`}
              >
                {/* The Map Component */}
                <div
                  className={`${
                    mapLayoutMode === 'split' ? 'lg:col-span-8' : 'col-span-1'
                  } h-[500px] lg:h-[720px] rounded-lg overflow-hidden border border-[#2A2622]`}
                >
                  <RecipeMap
                    recipes={filteredRecipes}
                    selectedRecipe={selectedRecipe}
                    onSelectRecipe={setSelectedRecipe}
                    onDropPinAtCoordinates={(coords) => {
                      setTempPinCoordinates(coords);
                      setIsPinModalOpen(true);
                    }}
                  />
                </div>

                {/* The Accompanying Feed */}
                {mapLayoutMode === 'split' && (
                  <div className="lg:col-span-4 h-[720px] overflow-y-auto pr-1 space-y-3.5">
                    <div className="sticky top-0 z-10 bg-[#0F0E0D]/95 backdrop-blur-sm py-1.5 flex items-center justify-between text-xs text-[#8C8276] border-b border-[#2A2622]">
                      <span className="font-semibold uppercase tracking-wider text-[#A69C8E]">
                        Heirloom Dossiers ({filteredRecipes.length})
                      </span>
                      <span>Select card to center map</span>
                    </div>

                    {filteredRecipes.length === 0 ? (
                      <div className="p-8 text-center rounded-lg bg-[#161413] border border-[#26221E] space-y-2">
                        <Compass className="w-6 h-6 text-[#736B61] mx-auto opacity-50" />
                        <div className="font-serif text-sm text-[#FAF7F2]">
                          No unwritten recipes match this filter
                        </div>
                        <p className="text-xs text-[#8C8276]">
                          Drop a pin directly onto the globe to be the first to map this region!
                        </p>
                      </div>
                    ) : (
                      filteredRecipes.map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          isSelected={selectedRecipe?.id === recipe.id}
                          onSelect={setSelectedRecipe}
                          onLocateOnMap={setSelectedRecipe}
                          onTogglePassport={handleTogglePassport}
                          isInPassport={passportIds.includes(recipe.id)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Archive / Catalog Grid View */
              <div className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      isSelected={selectedRecipe?.id === recipe.id}
                      onSelect={setSelectedRecipe}
                      onLocateOnMap={(r) => {
                        setSelectedRecipe(r);
                        setActiveView('map');
                      }}
                      onTogglePassport={handleTogglePassport}
                      isInPassport={passportIds.includes(recipe.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onEnterCookMode={(rec) => {
            setSelectedRecipe(null);
            setCookingRecipe(rec);
          }}
          onLocateOnMap={(rec) => {
            setActiveView('map');
            setSelectedRecipe(rec);
          }}
          onTogglePassport={handleTogglePassport}
          isInPassport={passportIds.includes(selectedRecipe.id)}
        />
      )}

      {cookingRecipe && (
        <CookModeModal
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
        />
      )}

      {isPinModalOpen && (
        <PinRecipeModal
          initialCoordinates={tempPinCoordinates}
          onClose={() => {
            setIsPinModalOpen(false);
            setTempPinCoordinates(null);
          }}
          onSaveRecipe={handleSaveRecipe}
        />
      )}

      {isArchaeologistOpen && (
        <ArchaeologistModal
          onClose={() => setIsArchaeologistOpen(false)}
          onPinDecodedRecipe={(rec) => {
            handleSaveRecipe(rec);
            setActiveView('map');
          }}
        />
      )}
    </div>
  );
}
