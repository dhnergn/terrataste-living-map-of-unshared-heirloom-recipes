import React, { useState, useEffect } from 'react';
import { RecipeDiscovery } from '../types/recipe';
import {
  X,
  MapPin,
  Volume2,
  VolumeX,
  ChefHat,
  Heart,
  Clock,
  Printer,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';

interface RecipeModalProps {
  recipe: RecipeDiscovery | null;
  onClose: () => void;
  onEnterCookMode: (recipe: RecipeDiscovery) => void;
  onLocateOnMap?: (recipe: RecipeDiscovery) => void;
  onTogglePassport?: (recipe: RecipeDiscovery) => void;
  isInPassport?: boolean;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  onClose,
  onEnterCookMode,
  onLocateOnMap,
  onTogglePassport,
  isInPassport,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);

  useEffect(() => {
    setSpeechSynthesisAvailable('speechSynthesis' in window);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    setCheckedIngredients({});
    setIsPlayingAudio(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [recipe]);

  if (!recipe) return null;

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleToggleVoiceStory = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const narrative = `${recipe.title}. Known locally as ${recipe.localName}. Mapped in ${recipe.locationName}. ${recipe.story}. The secret technique: ${recipe.secretIngredient}.`;
    const utterance = new SpeechSynthesisUtterance(narrative);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#161413] border border-[#2F2A25] rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Operational Ribbon */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#2A2622] bg-[#1A1816]/90 text-xs text-[#8C8276]">
          <div className="flex items-center gap-2 font-mono">
            <span>LOC: {recipe.coordinates[0]}° N, {recipe.coordinates[1]}° E</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.secrecyLevel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 hover:text-[#EDE8E1] transition-colors cursor-pointer"
              title="Print Carte Gastronomique"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C8276] hover:text-[#EDE8E1] transition-colors cursor-pointer"
              title="Close dossier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 space-y-8">
          {/* Header Title Section */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-medium uppercase tracking-wider mb-2">
              <span>{recipe.category}</span>
              <span aria-hidden="true">·</span>
              <span>{recipe.locationName}</span>
              {onLocateOnMap && (
                <button
                  onClick={() => {
                    onLocateOnMap(recipe);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 text-[#F59E0B] hover:underline ml-2 normal-case cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Show on globe</span>
                </button>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2] leading-tight mb-2">
              {recipe.title}
            </h1>

            <div className="text-base text-[#D1C7BA] font-serif italic mb-4">
              {recipe.localName}
            </div>

            {/* Quiet Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8C8276] pt-3 border-t border-[#2A2622]">
              <span>Contributed by {recipe.contributorName}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Prep {recipe.prepTimeMinutes}m</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Cook {recipe.cookTimeMinutes}m</span>
              <span aria-hidden="true">·</span>
              <span>Yields {recipe.servings} servings</span>
              <span aria-hidden="true">·</span>
              <span>Craft: {recipe.difficulty}</span>
            </div>
          </div>

          {/* Visual Presentation Hero */}
          {recipe.imageUrl && (
            <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-[#2D2925] bg-[#121110]">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161413]/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-xs font-serif text-[#D6CEBE] italic">
                Fig. 1 · {recipe.title} — {recipe.vesselUsed || 'Ancestral hearth preparation'}
              </div>
            </div>
          )}

          {/* Secret Ingredient / Technique Callout */}
          <div className="p-4 sm:p-5 rounded-lg bg-[#221B14] border border-[#B45309]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-[#B45309]/20 text-[#F59E0B] shrink-0 mt-0.5 sm:mt-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-[#F59E0B] mb-1">
                  The Guarded Technique & Secret Ingredient
                </div>
                <div className="text-sm text-[#EDE8E1] leading-relaxed">
                  {recipe.secretIngredient}
                </div>
              </div>
            </div>

            {speechSynthesisAvailable && (
              <button
                onClick={handleToggleVoiceStory}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[#B45309] text-white'
                    : 'bg-[#2E2822] text-[#E4D8C8] hover:bg-[#3D352D]'
                }`}
                title="Listen to story audio narration"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Mute Narration</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Listen to Lore</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Narrative Provenance with Drop Cap */}
          <div className="border-t border-[#2A2622] pt-6">
            <div className="text-xs uppercase tracking-widest text-[#8C8276] mb-3 font-semibold">
              01. Archival Provenance & Transmission
            </div>
            <p className="text-[#C5BCB0] text-sm sm:text-base leading-relaxed max-w-prose first-letter:text-4xl first-letter:font-serif first-letter:font-semibold first-letter:text-[#F59E0B] first-letter:float-left first-letter:mr-2.5 first-letter:leading-none">
              {recipe.story}
            </p>
          </div>

          {/* Flavor Profile Spectrum */}
          <div className="border-t border-[#2A2622] pt-6">
            <div className="text-xs uppercase tracking-widest text-[#8C8276] mb-4 font-semibold">
              02. Sensory Flavor Architecture
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(recipe.flavorProfile).map(([flavor, val]) => (
                <div key={flavor} className="p-3 bg-[#1B1917] rounded-md border border-[#2A2622]">
                  <div className="flex items-center justify-between text-xs text-[#A69C8E] capitalize mb-1.5">
                    <span>{flavor}</span>
                    <span className="font-mono text-[#F59E0B]">{val}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#2A2622] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#B45309] to-[#F59E0B] rounded-full"
                      style={{ width: `${(val / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Matrix */}
          <div className="border-t border-[#2A2622] pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-widest text-[#8C8276] font-semibold">
                03. Hearth Ingredients & Wild Substitutions
              </div>
              <span className="text-xs text-[#736B61]">Click to check off as prepared</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients.map((ing, i) => {
                const isChecked = !!checkedIngredients[i];
                return (
                  <div
                    key={i}
                    onClick={() => toggleIngredient(i)}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-[#1C1A18]/50 border-[#2D2A26] opacity-60'
                        : 'bg-[#1C1A18] border-[#2A2622] hover:border-[#3D3730]'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[#F59E0B] focus:outline-none shrink-0"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#8C8276]" />
                      )}
                    </button>

                    <div className="text-xs">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`font-medium ${isChecked ? 'line-through text-[#8C8276]' : 'text-[#EDE8E1]'}`}>
                          {ing.item}
                        </span>
                        <span className="font-mono text-[#F59E0B] shrink-0">{ing.amount}</span>
                      </div>
                      {ing.note && (
                        <div className="text-[#8C8276] mt-0.5 italic">{ing.note}</div>
                      )}
                      {ing.accessibleSub && (
                        <div className="text-[#A69C8E] mt-1 text-[11px]">
                          <span className="text-[#F59E0B]">Modern substitute: </span>
                          {ing.accessibleSub}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Instructions with Sensory Cues */}
          <div className="border-t border-[#2A2622] pt-6">
            <div className="text-xs uppercase tracking-widest text-[#8C8276] mb-4 font-semibold">
              04. Method & Sensory Milestones
            </div>

            <div className="space-y-4">
              {recipe.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="p-4 rounded-lg bg-[#1A1816] border border-[#2A2622] flex items-start gap-4"
                >
                  <div className="font-serif text-lg font-semibold text-[#F59E0B] w-6 shrink-0 text-center">
                    0{st.stepNumber}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-[#EDE8E1] leading-relaxed">
                      {st.instruction}
                    </p>
                    <div className="p-2.5 rounded bg-[#131110] border border-[#2B2723] text-xs text-[#D1C7BA]">
                      <span className="text-[#F59E0B] font-medium">Sensory cue: </span>
                      {st.sensoryCue}
                    </div>
                    {st.tip && (
                      <div className="text-xs text-[#8C8276] italic">
                        Elder note: {st.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Companion Lore: Traditional Beverage & Vessel */}
          {(recipe.traditionalBeverage || recipe.vesselUsed) && (
            <div className="border-t border-[#2A2622] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A69C8E]">
              {recipe.traditionalBeverage && (
                <div className="p-3 bg-[#191715] rounded-md border border-[#2A2622]">
                  <span className="text-[#F59E0B] font-semibold block mb-1 uppercase tracking-wider text-[10px]">
                    Traditional Beverage Pairing
                  </span>
                  <span>{recipe.traditionalBeverage}</span>
                </div>
              )}
              {recipe.vesselUsed && (
                <div className="p-3 bg-[#191715] rounded-md border border-[#2A2622]">
                  <span className="text-[#F59E0B] font-semibold block mb-1 uppercase tracking-wider text-[10px]">
                    Ancestral Cooking Vessel
                  </span>
                  <span>{recipe.vesselUsed}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Operational Bar */}
        <div className="px-6 py-4 border-t border-[#2A2622] bg-[#1A1816] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onTogglePassport && (
              <button
                onClick={() => onTogglePassport(recipe)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                  isInPassport
                    ? 'bg-[#B45309] border-[#B45309] text-white'
                    : 'bg-[#24211D] border-[#38322B] text-[#D1C7BA] hover:text-white hover:bg-[#2F2A25]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isInPassport ? 'fill-current' : ''}`} />
                <span>{isInPassport ? 'In My Passport' : 'Collect to Passport'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEnterCookMode(recipe)}
              className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium text-black bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-all shadow cursor-pointer active:scale-98"
            >
              <ChefHat className="w-4 h-4 stroke-[2.5]" />
              <span>Enter Kitchen Cook Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
