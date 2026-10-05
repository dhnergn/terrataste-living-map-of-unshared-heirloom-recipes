import React, { useState } from 'react';
import { RecipeDiscovery, Continent, CulinaryCategory, SecrecyLevel } from '../types/recipe';
import {
  X,
  MapPin,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Check,
  ChefHat,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PinRecipeModalProps {
  initialCoordinates?: [number, number] | null;
  onClose: () => void;
  onSaveRecipe: (recipe: RecipeDiscovery) => void;
}

const DEFAULT_PRESET_IMAGES = [
  '/src/assets/images/culinary_atlas_hero_1790895424033.jpg',
  '/src/assets/images/heirloom_tajine_pot_1790895436856.jpg',
  '/src/assets/images/night_market_noodles_1790895447208.jpg',
  '/src/assets/images/fermented_jar_pantry_1790895458544.jpg',
];

export const PinRecipeModal: React.FC<PinRecipeModalProps> = ({
  initialCoordinates,
  onClose,
  onSaveRecipe,
}) => {
  const [title, setTitle] = useState('');
  const [localName, setLocalName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState<number>(initialCoordinates ? initialCoordinates[0] : 37.9838);
  const [lng, setLng] = useState<number>(initialCoordinates ? initialCoordinates[1] : 23.7275);
  const [continent, setContinent] = useState<Continent>('Europe');
  const [category, setCategory] = useState<CulinaryCategory>('Ancient Hearth Dish');
  const [secrecyLevel, setSecrecyLevel] = useState<SecrecyLevel>('Guarded Family Heirloom');
  const [story, setStory] = useState('');
  const [secretIngredient, setSecretIngredient] = useState('');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(25);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(30);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<'Simple Artisan' | 'Moderate Technique' | 'Patience & Craft'>('Moderate Technique');
  const [contributorName, setContributorName] = useState('');

  // Flavor Profile
  const [flavorProfile, setFlavorProfile] = useState({
    umami: 7,
    smoky: 6,
    sweet: 3,
    tangy: 5,
    spicy: 4,
    bitter: 2,
    richness: 7,
  });

  // Dynamic Ingredients
  const [ingredients, setIngredients] = useState<
    Array<{ item: string; amount: string; note: string; accessibleSub: string }>
  >([
    { item: 'Main heirloom grain, green, or meat', amount: '400g', note: 'Ancestral variety', accessibleSub: '' },
    { item: 'Rare local herb or cold-pressed oil', amount: '2 tbsp', note: '', accessibleSub: '' },
  ]);

  // Dynamic Steps
  const [steps, setSteps] = useState<
    Array<{ stepNumber: number; instruction: string; sensoryCue: string; tip: string }>
  >([
    {
      stepNumber: 1,
      instruction: 'Sear or sweat ingredients in traditional earthenware over gentle embers.',
      sensoryCue: 'Notice a nutty toasted aroma as edges turn lightly golden.',
      tip: '',
    },
    {
      stepNumber: 2,
      instruction: 'Introduce the secret ingredient in the final moments before pulling from fire.',
      sensoryCue: 'Listen for a soft hiss and immediate herbal plume.',
      tip: '',
    },
  ]);

  const [imageUrl, setImageUrl] = useState(DEFAULT_PRESET_IMAGES[0]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementNote, setEnhancementNote] = useState<string | null>(null);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', note: '', accessibleSub: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        instruction: '',
        sensoryCue: '',
        tip: '',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps
      .filter((_, i) => i !== index)
      .map((st, idx) => ({ ...st, stepNumber: idx + 1 }));
    setSteps(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!title) {
      alert('Please enter at least a dish title before enhancing with culinary lore.');
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: {
            title,
            localName,
            country,
            region,
            secretIngredient,
            story,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.enhancement) {
        const enh = data.enhancement;
        if (!story && enh.culturalLore) {
          setStory(enh.culturalLore);
        }
        if (!secretIngredient && enh.secretTwistSuggestion) {
          setSecretIngredient(enh.secretTwistSuggestion);
        }
        setEnhancementNote(
          `AI Anthropologist notes: ${enh.sensoryNotes}. Traditional pairing: ${enh.drinkPairing}`
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please provide a name for this culinary discovery.');
      return;
    }

    const newDiscovery: RecipeDiscovery = {
      id: `rec-user-${Date.now()}`,
      title: title.trim(),
      localName: localName.trim() || title.trim(),
      coordinates: [lat, lng],
      locationName: locationName.trim() || `${region || 'Highland'}, ${country || 'Earth'}`,
      country: country.trim() || 'Global Origin',
      region: region.trim() || 'Ancestral Hamlet',
      continent,
      category,
      secrecyLevel,
      story: story.trim() || 'Preserved through spoken memory, passed down across generations without written record.',
      secretIngredient: secretIngredient.trim() || 'Gentle embers and patience',
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
      flavorProfile,
      ingredients: ingredients.filter((i) => i.item.trim() !== ''),
      steps: steps.filter((s) => s.instruction.trim() !== ''),
      imageUrl,
      contributorName: contributorName.trim() || 'Fellow Gastronomer',
      contributorOrigin: locationName || 'Global Cartography',
      pinnedAt: new Date().toISOString().split('T')[0],
      isUserPinned: true,
      likesCount: 1,
      cookCount: 0,
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#D97706', '#EA580C', '#10B981'],
      });
    } catch (e) {}

    onSaveRecipe(newDiscovery);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#161413] border border-[#2F2A25] rounded-xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2622] bg-[#1A1816]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[#F59E0B]/20 text-[#F59E0B]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#FAF7F2]">
                Pin a Secret Heirloom Discovery
              </h2>
              <p className="text-xs text-[#8C8276]">
                Map an unwritten recipe, hidden market specialty, or whispered culinary lore
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {/* AI Helper Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#221D17] border border-[#B45309]/30 text-xs">
            <div className="flex items-center gap-2 text-[#D1C7BA]">
              <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Have partial notes? Fill in the title, then click to enrich with culinary lore.</span>
            </div>
            <button
              type="button"
              onClick={handleEnhanceWithAI}
              disabled={isEnhancing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B45309] hover:bg-[#92400E] text-white rounded font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enriching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enrich Lore</span>
                </>
              )}
            </button>
          </div>

          {enhancementNote && (
            <div className="p-3 bg-[#1C1814] rounded-md border border-[#3A3229] text-xs text-[#D6CEBE] italic">
              {enhancementNote}
            </div>
          )}

          {/* Core Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5BCB0] mb-1.5">
                Dish Title (English or Common Name) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Svaneti Wild Herb Kubdari"
                className="w-full px-3 py-2 text-xs md:text-sm bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5BCB0] mb-1.5">
                Local Dialect or Native Script
              </label>
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="e.g. სვანური კუბდარი"
                className="w-full px-3 py-2 text-xs md:text-sm bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none"
              />
            </div>
          </div>

          {/* Geography & Coordinates */}
          <div className="p-4 rounded-lg bg-[#191715] border border-[#2B2723] space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Geographic Pinning</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#8C8276] mb-1">Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Mestia, Upper Svaneti"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#141211] text-[#EDE8E1] border border-[#332F2A] rounded focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C8276] mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Georgia"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#141211] text-[#EDE8E1] border border-[#332F2A] rounded focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C8276] mb-1">Continent</label>
                <select
                  value={continent}
                  onChange={(e) => setContinent(e.target.value as Continent)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#141211] text-[#EDE8E1] border border-[#332F2A] rounded focus:border-[#F59E0B] focus:outline-none"
                >
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">Africa</option>
                  <option value="Americas">Americas</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs text-[#8C8276] mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#141211] text-[#EDE8E1] border border-[#332F2A] rounded"
                />
              </div>

              <div>
                <label className="block text-xs text-[#8C8276] mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#141211] text-[#EDE8E1] border border-[#332F2A] rounded"
                />
              </div>
            </div>
          </div>

          {/* Classification & Secrecy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#C5BCB0] mb-1.5">
                Culinary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CulinaryCategory)}
                className="w-full px-3 py-2 text-xs bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="Ancient Hearth Dish">Ancient Hearth Dish</option>
                <option value="Street Food Wonder">Street Food Wonder</option>
                <option value="Fermented Secret">Fermented Secret</option>
                <option value="Mountain Sustenance">Mountain Sustenance</option>
                <option value="Coastal Hidden Gem">Coastal Hidden Gem</option>
                <option value="Celebration Feast">Celebration Feast</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#C5BCB0] mb-1.5">
                Secrecy Status
              </label>
              <select
                value={secrecyLevel}
                onChange={(e) => setSecrecyLevel(e.target.value as SecrecyLevel)}
                className="w-full px-3 py-2 text-xs bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none"
              >
                <option value="Guarded Family Heirloom">Guarded Family Heirloom</option>
                <option value="Whispered Village Specialty">Whispered Village Specialty</option>
                <option value="Ancient Monastery Archive">Ancient Monastery Archive</option>
                <option value="Hidden Alleyway Stall">Hidden Alleyway Stall</option>
                <option value="Remote Foraged Tradition">Remote Foraged Tradition</option>
              </select>
            </div>
          </div>

          {/* The Secret Technique / Unique Twist */}
          <div>
            <label className="block text-xs font-medium text-[#F59E0B] mb-1.5 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>The Guarded Secret Ingredient or Unwritten Technique *</span>
            </label>
            <input
              type="text"
              required
              value={secretIngredient}
              onChange={(e) => setSecretIngredient(e.target.value)}
              placeholder="e.g. Quenching toasted chili seeds in cold well water, or stone-ground wild blue fenugreek"
              className="w-full px-3 py-2 text-xs md:text-sm bg-[#221C16] text-[#EDE8E1] border border-[#B45309]/50 rounded-md focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          {/* Provenance Narrative */}
          <div>
            <label className="block text-xs font-medium text-[#C5BCB0] mb-1.5">
              The Story & Provenance (Why has it never been shared?)
            </label>
            <textarea
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Who passed this on? Where was it discovered? Describe the sensory memory, the hearth, or the alleyway where you tasted it..."
              className="w-full px-3 py-2 text-xs md:text-sm bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Ingredients Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#C5BCB0]">
                Ingredients & Accessible Substitutes
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1 text-xs text-[#F59E0B] hover:text-[#D97706] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-[#1A1816] rounded border border-[#2B2723]">
                  <input
                    type="text"
                    placeholder="Ingredient item"
                    value={ing.item}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].item = e.target.value;
                      setIngredients(updated);
                    }}
                    className="flex-1 px-2.5 py-1 text-xs bg-[#131110] border border-[#332F2A] rounded text-[#EDE8E1] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Amount (e.g. 200g)"
                    value={ing.amount}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].amount = e.target.value;
                      setIngredients(updated);
                    }}
                    className="w-24 px-2 py-1 text-xs bg-[#131110] border border-[#332F2A] rounded text-[#EDE8E1] focus:outline-none font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Supermarket sub"
                    value={ing.accessibleSub}
                    onChange={(e) => {
                      const updated = [...ingredients];
                      updated[i].accessibleSub = e.target.value;
                      setIngredients(updated);
                    }}
                    className="w-36 px-2 py-1 text-xs bg-[#131110] border border-[#332F2A] rounded text-[#A69C8E] focus:outline-none hidden sm:block"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(i)}
                    className="p-1 text-[#8C8276] hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps Builder with Sensory Cues */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#C5BCB0]">
                Method Steps & Sensory Cues
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 text-xs text-[#F59E0B] hover:text-[#D97706] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((st, i) => (
                <div key={i} className="p-3 bg-[#1A1816] rounded border border-[#2B2723] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#F59E0B] font-mono">
                    <span>Step 0{st.stepNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(i)}
                      className="text-[#8C8276] hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Step instruction..."
                    value={st.instruction}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[i].instruction = e.target.value;
                      setSteps(updated);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#131110] border border-[#332F2A] rounded text-[#EDE8E1] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Sensory cue (What do you hear, smell, or see change?)"
                    value={st.sensoryCue}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[i].sensoryCue = e.target.value;
                      setSteps(updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs bg-[#131110] border border-[#332F2A] rounded text-[#D1C7BA] italic focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Visual Choice */}
          <div>
            <label className="block text-xs font-medium text-[#C5BCB0] mb-2">
              Discovery Imagery
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {DEFAULT_PRESET_IMAGES.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setImageUrl(img)}
                  className={`relative aspect-[4/3] rounded overflow-hidden border cursor-pointer ${
                    imageUrl === img ? 'border-[#F59E0B] ring-1 ring-[#F59E0B]' : 'border-[#2B2723] opacity-60'
                  }`}
                >
                  <img src={img} alt="Preset visual" className="w-full h-full object-cover" />
                  {imageUrl === img && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#221F1C] hover:bg-[#2B2723] text-xs text-[#D1C7BA] rounded border border-[#38332D] cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Upload Field Photo</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <span className="text-[11px] text-[#736B61]">JPEG, PNG, or WebP</span>
            </div>
          </div>

          {/* Contributor Signature */}
          <div className="pt-2 border-t border-[#2A2622]">
            <label className="block text-xs font-medium text-[#C5BCB0] mb-1">
              Your Name / Explorer Alias
            </label>
            <input
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="e.g. Elena V. & Marco"
              className="w-full max-w-sm px-3 py-2 text-xs bg-[#1A1816] text-[#EDE8E1] border border-[#332F2A] rounded-md focus:border-[#F59E0B] focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#2A2622] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8C8276] hover:text-[#EDE8E1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs md:text-sm font-medium text-black bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-md transition-all cursor-pointer active:scale-98"
            >
              Pin to Living Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
