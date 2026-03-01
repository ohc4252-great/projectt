/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 * Node.js 20 환경 및 OpenAI gpt-4o-mini 사용
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

// Secret 명칭 확인 필수: OPENAI_API_KEY_SECRET
const openAiKey = defineSecret("OPENAI_API_KEY_SECRET");

const LANGUAGE_STRATEGY = {
  ko: {
    label: "Korean",
    constraint: "모든 텍스트는 반드시 한국어로 작성하세요.",
    suffix: " 황금레시피"
  },
  en: {
    label: "English",
    constraint: "ALL fields MUST be in English. No Korean characters allowed.",
    suffix: " Recipe"
  }
};

exports.getRecipes = onRequest({ 
  cors: true, 
  timeoutSeconds: 60, 
  maxInstances: 10,
  secrets: [openAiKey] 
}, async (req, res) => {
  // CORS 프리플라이트 요청 처리
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const body = req.body.data || req.body;
    const { ingredients, category, lang = 'ko' } = body;
    const strategy = LANGUAGE_STRATEGY[lang] || LANGUAGE_STRATEGY.ko;

    if (!ingredients || ingredients.length === 0) {
      return res.status(200).json({ data: { recipes: [], error: "No ingredients provided" } });
    }

    const openai = new OpenAI({
      apiKey: openAiKey.value(),
    });

    logger.info(`Requesting recipes for ${category} in ${strategy.label}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Michelin-starred professional chef. Your task is to provide a "Precision Recipe Analysis".
          
          STRICT RULES:
          1. Language: Output MUST be in ${strategy.label}. ${strategy.constraint}
          2. Precision Analysis: Each ingredient MUST include specific measurements (e.g., "1/2 Onion, diced", "2 tbsp Soy Sauce").
          3. Filtering: ONLY suggest recipes where user's ingredients cover 100% of "essential_ingredients".
          4. Search: Use CLEAN, STANDARD dish names only. ABSOLUTELY NO names of people or chefs.
          5. Response Format: You MUST return a JSON object with EXACTLY this structure:
{
"recipes": [
    {
      "title": "Dish Name",
      "reason": "Expert analysis",
      "ingredients": ["Measurement + Ingredient A", "Measurement + Ingredient B", "Optional Item + Measurement"],
      "instructions": "Professional step-by-step guide"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Cuisine Category: ${category}
          Available Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let resultData = JSON.parse(completion.choices[0].message.content);

    if (resultData.recipes && Array.isArray(resultData.recipes)) {
      resultData.recipes = resultData.recipes.map(recipe => {
        const keyword = recipe.title + strategy.suffix;
        return {
          ...recipe,
          youtube_search_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`,
          google_search_keyword: keyword
        };
      });
    }

    res.status(200).json({ data: resultData });

  } catch (error) {
    logger.error("Backend Error:", error);
    res.status(500).json({ 
      data: { 
        error: "Internal Server Error", 
        details: error.message
      } 
    });
  }
});
