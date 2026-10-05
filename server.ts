import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client (using gemini-3.8-flash)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Culinary Archaeologist - Decode vague food memory or secret unwritten recipe
app.post('/api/decode-memory', async (req, res) => {
  try {
    const { memoryText } = req.body;
    if (!memoryText || typeof memoryText !== 'string' || memoryText.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a food memory or description to decode.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the server environment.' });
    }

    const systemPrompt = `You are the world's foremost Culinary Anthropologist and Ethnogastronomy Historian for "TerraTaste", an atlas of unwritten, secret, never-before-shared heirloom recipes.
Your job is to decipher fragmented food memories, travelers' whispered notes, or grandmother's undocumented dishes.
Analyze the user's sensory clues, ingredients, cooking vessel, or travel memory to identify or reconstruct the authentic local dish.
Provide plausible exact geographic coordinates [latitude, longitude] in the actual region or village where this traditional food originates.
Formulate a rich, evocative, step-by-step heirloom recipe with sensory cues (sound, color shift, aroma), secret techniques, and accessible kitchen substitutes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Decipher this food memory or unwritten recipe description into a complete heirloom culinary record:
"${memoryText}"`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Evocative English or recognizable name of the dish' },
            localName: { type: Type.STRING, description: 'Original local dialect name or native script' },
            country: { type: Type.STRING, description: 'Country of origin' },
            region: { type: Type.STRING, description: 'Specific region, valley, or town' },
            coordinates: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: '[latitude, longitude] pair (e.g. [40.666, 16.604])',
            },
            continent: { type: Type.STRING, description: 'One of: Europe, Asia, Africa, Americas, Oceania, Middle East' },
            category: { type: Type.STRING, description: 'One of: Street Food Wonder, Ancient Hearth Dish, Fermented Secret, Mountain Sustenance, Coastal Hidden Gem, Celebration Feast' },
            secrecyLevel: { type: Type.STRING, description: 'One of: Guarded Family Heirloom, Whispered Village Specialty, Ancient Monastery Archive, Hidden Alleyway Stall, Remote Foraged Tradition' },
            story: { type: Type.STRING, description: 'A literary 2-3 paragraph explanation of why this dish is secretive, its cultural roots, and how it is traditionally transmitted' },
            secretIngredient: { type: Type.STRING, description: 'The unique trick, rare spice, or non-obvious technique that makes it magical' },
            prepTimeMinutes: { type: Type.INTEGER },
            cookTimeMinutes: { type: Type.INTEGER },
            servings: { type: Type.INTEGER },
            difficulty: { type: Type.STRING, description: 'One of: Simple Artisan, Moderate Technique, Patience & Craft' },
            flavorProfile: {
              type: Type.OBJECT,
              properties: {
                umami: { type: Type.INTEGER, description: '1-10' },
                smoky: { type: Type.INTEGER, description: '1-10' },
                sweet: { type: Type.INTEGER, description: '1-10' },
                tangy: { type: Type.INTEGER, description: '1-10' },
                spicy: { type: Type.INTEGER, description: '1-10' },
                bitter: { type: Type.INTEGER, description: '1-10' },
                richness: { type: Type.INTEGER, description: '1-10' },
              },
              required: ['umami', 'smoky', 'sweet', 'tangy', 'spicy', 'bitter', 'richness'],
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  note: { type: Type.STRING },
                  accessibleSub: { type: Type.STRING, description: 'Easy supermarket substitute if wild or rare' },
                },
                required: ['item', 'amount'],
              },
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                  sensoryCue: { type: Type.STRING, description: 'What to look for, smell, or listen for at this stage' },
                  tip: { type: Type.STRING },
                },
                required: ['stepNumber', 'instruction', 'sensoryCue'],
              },
            },
            dietary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'localName',
            'country',
            'region',
            'coordinates',
            'continent',
            'category',
            'secrecyLevel',
            'story',
            'secretIngredient',
            'prepTimeMinutes',
            'cookTimeMinutes',
            'servings',
            'difficulty',
            'flavorProfile',
            'ingredients',
            'steps',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, discovery: parsed });
  } catch (error: any) {
    console.error('Gemini decode-memory error:', error);
    return res.status(500).json({ error: error.message || 'Failed to decode recipe memory.' });
  }
});

// Endpoint: Enhance User Recipe Draft
app.post('/api/enhance-recipe', async (req, res) => {
  try {
    const { draft } = req.body;
    if (!draft || !draft.title) {
      return res.status(400).json({ error: 'Please provide at least a recipe title to enhance.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an ethnogastronomy editor. Review and elevate this secret local recipe draft with sensory cues and cultural context:
${JSON.stringify(draft, null, 2)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sensoryNotes: { type: Type.STRING, description: 'Sensory description of taste, texture, and aroma' },
            secretTwistSuggestion: { type: Type.STRING, description: 'A refinement to the secret technique' },
            culturalLore: { type: Type.STRING, description: 'Historical or regional lore about the cooking vessel or traditions' },
            drinkPairing: { type: Type.STRING, description: 'Hyperlocal traditional beverage or tea pairing' },
          },
          required: ['sensoryNotes', 'secretTwistSuggestion', 'culturalLore', 'drinkPairing'],
        },
      },
    });

    const enhancement = JSON.parse(response.text || '{}');
    return res.json({ success: true, enhancement });
  } catch (error: any) {
    console.error('Enhance recipe error:', error);
    return res.status(500).json({ error: error.message || 'Failed to enhance recipe.' });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TerraTaste server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
