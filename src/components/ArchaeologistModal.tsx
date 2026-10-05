import React, { useState } from 'react';
import { Sparkles, X, MapPin, Flame, Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { RecipeDiscovery } from '../types/recipe';

interface ArchaeologistModalProps {
  onClose: () => void;
  onPinDecodedRecipe: (recipe: RecipeDiscovery) => void;
}

const MEMORY_INSPIRATIONS = [
  'In a foggy mountain village in Crete, an elderly shepherd cooked wild bitter mountain greens in fresh goat milk whey with orange rind and dried mint over olive wood embers.',
  'A tiny stilt hut behind a temple in Chiang Mai where an old cook boiled smoked river catfish in a clear broth with crushed lemongrass, tamarind leaves, and charred green chilies.',
  'An unmarked basement bakery in Matera at 4am where stale durum loaves were crushed into fresh tomato water with sun-dried sweet peppers fried for three seconds.',
];

export const ArchaeologistModal: React.FC<ArchaeologistModalProps> = ({
  onClose,
  onPinDecodedRecipe,
}) => {
  const [memoryText, setMemoryText] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedRecipe, setDecodedRecipe] = useState<RecipeDiscovery | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDecode = async (textToDecode?: string) => {
    const text = (textToDecode || memoryText).trim();
    if (!text) {
      setErrorMsg('Please enter a culinary memory, sensory description, or list of ingredients.');
      return;
    }

    setErrorMsg(null);
    setIsDecoding(true);
    setDecodedRecipe(null);

    try {
      const res = await fetch('/api/decode-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryText: text }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to decode memory.');
      }

      const rec = data.discovery;
      const fullDiscovery: RecipeDiscovery = {
        id: `rec-decoded-${Date.now()}`,
        title: rec.title || 'Reconstructed Heirloom Dish',
        localName: rec.localName || rec.title,
        coordinates: Array.isArray(rec.coordinates) && rec.coordinates.length === 2
          ? [rec.coordinates[0], rec.coordinates[1]]
          : [38.0, 24.0],
        locationName: `${rec.region || 'Highland'}, ${rec.country || 'Mediterranean'}`,
        country: rec.country || 'Global',
        region: rec.region || 'Ancestral Valley',
        continent: rec.continent || 'Europe',
        category: rec.category || 'Ancient Hearth Dish',
        secrecyLevel: rec.secrecyLevel || 'Whispered Village Specialty',
        story: rec.story,
        secretIngredient: rec.secretIngredient,
        prepTimeMinutes: rec.prepTimeMinutes || 25,
        cookTimeMinutes: rec.cookTimeMinutes || 35,
        servings: rec.servings || 4,
        difficulty: rec.difficulty || 'Moderate Technique',
        flavorProfile: rec.flavorProfile || {
          umami: 7,
          smoky: 6,
          sweet: 3,
          tangy: 6,
          spicy: 4,
          bitter: 3,
          richness: 6,
        },
        ingredients: rec.ingredients || [],
        steps: rec.steps || [],
        imageUrl: '/src/assets/images/culinary_atlas_hero_1790895424033.jpg',
        contributorName: 'Culinary Anthropologist & You',
        contributorOrigin: 'Decoded Memory',
        pinnedAt: new Date().toISOString().split('T')[0],
        isUserPinned: true,
        likesCount: 1,
        cookCount: 0,
        dietary: rec.dietary || [],
      };

      setDecodedRecipe(fullDiscovery);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with Culinary Archaeologist.');
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#161413] border border-[#2F2A25] rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2622] bg-[#1A1816]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[#B45309]/20 text-[#F59E0B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                The Culinary Archaeologist
              </h2>
              <p className="text-xs text-[#8C8276]">
                Decipher fragmented food memories, travel diaries, or unwritten grandmother dishes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8276] hover:text-[#EDE8E1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {!decodedRecipe ? (
            <>
              {/* Input Memory Prompt */}
              <div>
                <label className="block text-xs font-medium text-[#C5BCB0] mb-2">
                  Describe the sensory memory, ingredients, hearth style, or travel moment:
                </label>
                <textarea
                  rows={4}
                  value={memoryText}
                  onChange={(e) => setMemoryText(e.target.value)}
                  placeholder="e.g. When I was visiting a small island off the coast of Scotland, a fisherman made a warm chowder using kelp cured in peat smoke, wild chives, and oats..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Sample Inspiration Chips */}
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#8C8276] mb-2 font-medium">
                  Try a fragmented field note:
                </div>
                <div className="space-y-2">
                  {MEMORY_INSPIRATIONS.map((insp, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setMemoryText(insp);
                        handleDecode(insp);
                      }}
                      className="w-full text-left p-2.5 rounded bg-[#1C1A18] hover:bg-[#25221F] border border-[#2B2723] hover:border-[#3D3730] text-xs text-[#D1C7BA] transition-colors cursor-pointer"
                    >
                      <span className="font-serif italic">"{insp}"</span>
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              {/* Decode CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDecode()}
                  disabled={isDecoding}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-black font-medium text-sm rounded-md transition-all cursor-pointer shadow active:scale-98 disabled:opacity-50"
                >
                  {isDecoding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deciphering Culinary Lineage & Coordinates...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Decipher & Reconstruct Dish</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Decoded Result View */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 rounded-lg bg-[#201B15] border border-[#B45309]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F59E0B] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Culinary Reconstruction Successful</span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#FAF7F2]">
                  {decodedRecipe.title}
                </h3>
                <div className="text-sm font-serif italic text-[#D1C7BA]">
                  {decodedRecipe.localName}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8C8276] pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{decodedRecipe.locationName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{decodedRecipe.category}</span>
                </div>
              </div>

              {/* Guarded Technique */}
              <div className="p-3.5 rounded bg-[#1A1816] border border-[#2D2823]">
                <div className="text-xs uppercase tracking-wider font-semibold text-[#F59E0B] mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>The Decoded Secret Technique</span>
                </div>
                <p className="text-xs text-[#EDE8E1] leading-relaxed">
                  {decodedRecipe.secretIngredient}
                </p>
              </div>

              {/* Provenance Narrative */}
              <div>
                <div className="text-xs uppercase tracking-widest text-[#8C8276] mb-1.5 font-semibold">
                  Ethnogastronomic Context
                </div>
                <p className="text-xs sm:text-sm text-[#C5BCB0] leading-relaxed">
                  {decodedRecipe.story}
                </p>
              </div>

              {/* Ingredients and Steps Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded bg-[#181615] border border-[#2A2622]">
                  <div className="text-xs font-semibold text-[#F59E0B] mb-2 uppercase tracking-wider">
                    Reconstructed Ingredients ({decodedRecipe.ingredients.length})
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#D1C7BA]">
                    {decodedRecipe.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i} className="flex justify-between">
                        <span>{ing.item}</span>
                        <span className="font-mono text-[#8C8276]">{ing.amount}</span>
                      </li>
                    ))}
                    {decodedRecipe.ingredients.length > 5 && (
                      <li className="text-[#736B61] text-[11px] italic">
                        + {decodedRecipe.ingredients.length - 5} more ingredients in full dossier
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-3 rounded bg-[#181615] border border-[#2A2622]">
                  <div className="text-xs font-semibold text-[#F59E0B] mb-2 uppercase tracking-wider">
                    Sensory Steps ({decodedRecipe.steps.length})
                  </div>
                  <div className="space-y-2 text-xs text-[#D1C7BA]">
                    {decodedRecipe.steps.slice(0, 2).map((st) => (
                      <div key={st.stepNumber}>
                        <span className="font-mono text-[#F59E0B] mr-1">0{st.stepNumber}.</span>
                        <span>{st.instruction.slice(0, 90)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#2A2622] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDecodedRecipe(null)}
                  className="px-4 py-2 text-xs text-[#A69C8E] hover:text-[#EDE8E1] cursor-pointer"
                >
                  ← Decipher Another Memory
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onPinDecodedRecipe(decodedRecipe);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs md:text-sm font-medium bg-[#F59E0B] hover:bg-[#D97706] text-black rounded-md shadow transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Pin Reconstructed Recipe to Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
