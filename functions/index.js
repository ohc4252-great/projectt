/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 * Node.js 22 환경 및 OpenAI gpt-4o-mini 사용
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

// 새로운 Secret 명칭 사용: OPENAI_API_KEY_V2
const openAiKey = defineSecret("OPENAI_API_KEY_V2");

const LANGUAGE_STRATEGY = {
  ko: { label: "Korean", constraint: "Use Korean." },
  en: { label: "English", constraint: "Use English." }
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
          content: `Return EXACTLY 3 REAL, EXISTING recipes using some of the user's ingredients. 
Do NOT invent combinations. Use well-known, standard recipes matching the category.
Respond ONLY in JSON. ${strategy.constraint}`
        },
        {
          role: "user",
          content: `Category: ${category}
Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}

Format:
{
  "recipes": [
    {
      "title": "Real Recipe Name",
      "concept": "1 short sentence",
      "reason": "1 short sentence why this fits",
      "servings": "1",
      "cooking_time": "15분",
      "essential_ingredients": ["amt+item"],
      "minimal_extra_ingredients": ["item"],
      "instructions": "1. step\\n2. step",
      "upgrade_tip": "1 short tip"
    }
  ]
}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    let resultData;

try {
  resultData = JSON.parse(completion.choices[0].message.content);
  resultData.recipes = resultData.recipes.map(r => ({
    ...r,
    cooking_time: r.cooking_time || r.cookingTime || r.time || "30분"
  }));
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
