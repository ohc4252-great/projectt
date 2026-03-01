/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 * Node.js 22 환경 및 OpenAI gpt-4o-mini 사용
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
          content: `You are a practical home-cooking expert specialized in "leftover fridge rescue" meals.
      
      APP CONCEPT:
      This app helps users cook satisfying meals using random leftover ingredients from their fridge.
      The focus is realistic, resourceful, and delicious home cooking — NOT gourmet restaurant food.
      
      LANGUAGE RULE:
      You MUST respond entirely in ${strategy.label}.
      ${strategy.constraint}
      
      CORE RULES:
      1. Provide EXACTLY 3 DIFFERENT recipes.
      2. Prioritize using the given ingredients.
      3. If something is missing, only suggest minimal common pantry items (salt, oil, soy sauce, egg, flour, butter, etc).
      4. Recipes must feel realistic and achievable in a normal home kitchen.
      5. Instructions MUST be detailed (minimum 8–12 steps).
      6. Include heat level (low/medium/high), timing, and texture cues.
      7. Make the dish satisfying enough for a proper meal.
      8. Avoid fancy or unrealistic gourmet ideas.
      9. Return ONLY a valid JSON object. No extra text.
      
      Each recipe MUST contain the following fields:
      - "title"
      - "concept"
      - "reason"
      - "difficulty" (Easy or Normal)
      - "servings"
      - "cooking_time"
      - "taste_profile"
      - "essential_ingredients" (array of "amount + ingredient")
      - "minimal_extra_ingredients" (array of very common pantry items only)
      - "instructions" (8–12 detailed steps as one string separated by \n)
      - "upgrade_tip" (one simple extra ingredient that makes it 2x better)`
        },
        {
          role: "user",
          content: `Cuisine Category: ${category}
      Available Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}
      
      Return a JSON object in this structure:
      
      {
        "recipes": [
          {
            "title": "...",
            "concept": "...",
            "reason": "...",
            "difficulty": "Easy or Normal",
            "servings": "...",
            "cooking_time": "...",
            "taste_profile": "...",
            "essential_ingredients": ["amount + ingredient"],
            "minimal_extra_ingredients": ["common pantry item"],
            "instructions": "1. ...\\n2. ...\\n3. ...",
            "upgrade_tip": "..."
          }
        ]
      }
      
      IMPORTANT:
      - Provide EXACTLY 3 recipes.
      - No explanations outside JSON.
      - Do not include markdown.
      - Do not include backticks.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
    });

    let resultData;

try {
  resultData = JSON.parse(completion.choices[0].message.content);
} catch (e) {
  logger.error("Invalid JSON from AI");
  return res.status(500).json({ data: { error: "AI response format error" }});
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
