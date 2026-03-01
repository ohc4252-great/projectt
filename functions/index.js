/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 * Node.js 20 환경 및 OpenAI gpt-4o-mini 사용
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

// Secret 명칭 확인 필수: OPENAI_API_KEY
const openAiKey = defineSecret("OPENAI_API_KEY");

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
          content: `You are an expert chef who can suggest recipes with any given ingredients.
          STRICT RULES:
          1. Output must be in ${strategy.label}. ${strategy.constraint}
          2. Always provide exactly 3 recipes that best match the given cuisine and ingredients.
          3. Even if ingredients are insufficient, suggest the most relevant dishes and mention why they are recommended.
          4. Return ONLY a valid JSON object.
          5. Each recipe object must have "title", "reason", "ingredients_needed", and "instructions" (as a string or array of steps).`
        },
        {
          role: "user",
          content: `Cuisine Category: ${category}
          Available Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}
          
          Return JSON format: 
          {
            "recipes": [
              {
                "title": "Recipe Name",
                "reason": "Brief explanation of why this is recommended based on ingredients",
                "ingredients_needed": ["ingredient 1", "ingredient 2", "..."],
                "instructions": "1. Step 1\n2. Step 2\n3. Step 3..."
              }
            ]
          }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
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
        details: error.message,
        stack: error.stack // 디버깅을 위해 일시적으로 추가
      } 
    });
  }
});
