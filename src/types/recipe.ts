export type Continent = 'Europe' | 'Asia' | 'Africa' | 'Americas' | 'Oceania' | 'Middle East';

export type SecrecyLevel =
  | 'Guarded Family Heirloom'
  | 'Whispered Village Specialty'
  | 'Ancient Monastery Archive'
  | 'Hidden Alleyway Stall'
  | 'Remote Foraged Tradition';

export type CulinaryCategory =
  | 'Street Food Wonder'
  | 'Ancient Hearth Dish'
  | 'Fermented Secret'
  | 'Mountain Sustenance'
  | 'Coastal Hidden Gem'
  | 'Celebration Feast';

export interface FlavorProfile {
  umami: number; // 1-10
  smoky: number;
  sweet: number;
  tangy: number;
  spicy: number;
  bitter: number;
  richness: number;
}

export interface Ingredient {
  item: string;
  amount: string;
  note?: string;
  accessibleSub?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  sensoryCue: string;
  tip?: string;
}

export interface RecipeDiscovery {
  id: string;
  title: string;
  localName: string;
  coordinates: [number, number]; // [lat, lng]
  locationName: string;
  country: string;
  region: string;
  continent: Continent;
  secrecyLevel: SecrecyLevel;
  category: CulinaryCategory;
  story: string;
  secretIngredient: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Simple Artisan' | 'Moderate Technique' | 'Patience & Craft';
  flavorProfile: FlavorProfile;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  imageUrl: string;
  contributorName: string;
  contributorOrigin: string;
  pinnedAt: string;
  isUserPinned?: boolean;
  likesCount: number;
  cookCount: number;
  dietary?: string[];
  traditionalBeverage?: string;
  vesselUsed?: string;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}
