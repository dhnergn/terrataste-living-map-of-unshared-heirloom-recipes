import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RecipeDiscovery } from '../types/recipe';
import { Compass, Layers, Plus, MapPin, Eye } from 'lucide-react';

interface RecipeMapProps {
  recipes: RecipeDiscovery[];
  selectedRecipe: RecipeDiscovery | null;
  onSelectRecipe: (recipe: RecipeDiscovery) => void;
  onDropPinAtCoordinates?: (coords: [number, number]) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Street Food Wonder': '#F59E0B', // Amber
  'Ancient Hearth Dish': '#EA580C', // Orange Flame
  'Fermented Secret': '#84CC16', // Lime / Herbal
  'Mountain Sustenance': '#38BDF8', // Glacial Sky Blue
  'Coastal Hidden Gem': '#06B6D4', // Deep Cyan Ocean
  'Celebration Feast': '#EC4899', // Rich Rose
};

export const RecipeMap: React.FC<RecipeMapProps> = ({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  onDropPinAtCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [mapTheme, setMapTheme] = useState<'dark' | 'voyager'>('dark');
  const [activeTempPin, setActiveTempPin] = useState<[number, number] | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [25.0, 15.0],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      worldCopyJump: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    (map as any)._customTileLayer = tileLayer;

    // Handle map ground click for dropping discovery pins
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lng = parseFloat(e.latlng.lng.toFixed(4));
      setActiveTempPin([lat, lng]);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ((map as any)._customTileLayer) {
      map.removeLayer((map as any)._customTileLayer);
    }

    const tileUrl =
      mapTheme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const newLayer = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    (map as any)._customTileLayer = newLayer;
  }, [mapTheme]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    recipes.forEach((recipe) => {
      const isSelected = selectedRecipe?.id === recipe.id;
      const color = CATEGORY_COLORS[recipe.category] || '#F59E0B';

      const iconHtml = `
        <div class="relative group cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-115'
        }">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2" style="background-color: #1A1816; border-color: ${color};">
            <div class="w-3.5 h-3.5 rounded-full" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></div>
          </div>
          <div class="w-2 h-2 rotate-45 mx-auto -mt-1" style="background-color: #1A1816; border-right: 2px solid ${color}; border-bottom: 2px solid ${color};"></div>
          ${
            recipe.isUserPinned
              ? `<span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-culinary-pin',
        iconSize: [32, 40],
        iconAnchor: [16, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(recipe.coordinates, { icon: customIcon });

      const popupContent = `
        <div class="p-3 max-w-[280px]">
          <div class="text-[11px] uppercase tracking-wider text-[#A69C8E] mb-1">
            ${recipe.locationName}
          </div>
          <div class="font-serif text-base font-semibold text-[#FAF7F2] leading-tight mb-1">
            ${recipe.title}
          </div>
          <div class="text-xs text-[#D1C7BA] line-clamp-2 mb-2 italic">
            "${recipe.secretIngredient}"
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-[#332F2A] text-xs">
            <span class="text-[#F59E0B] font-medium">${recipe.secrecyLevel}</span>
            <span class="text-[#A69C8E]">${recipe.cookTimeMinutes + recipe.prepTimeMinutes}m</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        autoPan: false,
      });

      marker.on('click', () => {
        onSelectRecipe(recipe);
      });

      marker.addTo(map);
      markersRef.current[recipe.id] = marker;
    });
  }, [recipes, selectedRecipe]);

  // Fly to selected recipe
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRecipe) return;

    map.flyTo(selectedRecipe.coordinates, 7, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    const marker = markersRef.current[selectedRecipe.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedRecipe]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([25.0, 15.0], 3, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#141312] overflow-hidden rounded-lg border border-[#2A2622]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Utility Bar */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2">
        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EDE8E1] bg-[#1C1A18]/90 backdrop-blur-md border border-[#3A352F] rounded-md shadow-md hover:bg-[#2A2622] transition-colors cursor-pointer"
          title="Reset globe view"
        >
          <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Reset Globe</span>
        </button>

        <button
          onClick={() => setMapTheme(mapTheme === 'dark' ? 'voyager' : 'dark')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EDE8E1] bg-[#1C1A18]/90 backdrop-blur-md border border-[#3A352F] rounded-md shadow-md hover:bg-[#2A2622] transition-colors cursor-pointer"
          title="Toggle parchment or dark cartography"
        >
          <Layers className="w-3.5 h-3.5 text-[#A69C8E]" />
          <span className="capitalize">{mapTheme === 'dark' ? 'Parchment Atlas' : 'Night Hearth'}</span>
        </button>
      </div>

      {/* Temporary Pin Action Callout when user clicks on empty map */}
      {activeTempPin && (
        <div className="absolute top-4 right-4 z-[400] bg-[#1C1A18]/95 backdrop-blur-md border border-[#D97706]/40 p-3 rounded-lg shadow-xl max-w-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#F59E0B]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Uncharted Coordinates</span>
            </div>
            <button
              onClick={() => setActiveTempPin(null)}
              className="text-[#8C8276] hover:text-[#EDE8E1] text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="font-mono text-xs text-[#A69C8E] mb-2.5">
            {activeTempPin[0]}° N, {activeTempPin[1]}° E
          </div>
          <button
            onClick={() => {
              if (onDropPinAtCoordinates) {
                onDropPinAtCoordinates(activeTempPin);
              }
              setActiveTempPin(null);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-black text-xs font-medium rounded transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Secret Discovery Here</span>
          </button>
        </div>
      )}

      {/* Floating Category Legend */}
      <div className="absolute bottom-4 left-4 z-[400] hidden lg:block bg-[#161413]/85 backdrop-blur-md border border-[#2D2925] p-2.5 rounded-md text-xs">
        <div className="text-[10px] uppercase tracking-wider text-[#8C8276] mb-2 font-medium">
          Culinary Biomes
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[#C5BCB0] text-[11px] truncate max-w-[120px]">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
