/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

const openAiKey = defineSecret("OPENAI_API_KEY_SECRET");

const LANGUAGE_STRATEGY = {
  ko: { label: "Korean", constraint: "모든 텍스트는 반드시 한국어로 작성하세요.", suffix: " 황금레시피" },
  en: { label: "English", constraint: "ALL fields MUST be in English.", suffix: " Recipe" }
};

exports.getRecipes = onRequest({ 
  cors: true, 
  timeoutSeconds: 60, 
  maxInstances: 10,
  secrets: [openAiKey] 
}, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  try {
    const body = req.body.data || req.body;
    const { ingredients, category, lang = 'ko' } = body;
    const strategy = LANGUAGE_STRATEGY[lang] || LANGUAGE_STRATEGY.ko;

    const openai = new OpenAI({ apiKey: openAiKey.value() });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Michelin-starred chef. Provide a precision recipe analysis.
          STRICT RULES:
          1. Quantity: ALWAYS provide EXACTLY 3 different recipes.
          2. Language: ${strategy.label}. ${strategy.constraint}
          3. Mandatory Structure (JSON):
          {
            "recipes": [
              {
                "title": "Dish Name 1",
                "reason": "Expert reason",
                "essential_ingredients": ["Amount + Ingredient"],
                "optional_ingredients": ["Amount + Ingredient"],
                "instructions": "Step 1. ... Step 2. ..."
              },
              {
                "title": "Dish Name 2",
                "reason": "Expert reason",
                "essential_ingredients": ["Amount + Ingredient"],
                "optional_ingredients": ["Amount + Ingredient"],
                "instructions": "Step 1. ... Step 2. ..."
              },
              {
                "title": "Dish Name 3",
                "reason": "Expert reason",
                "essential_ingredients": ["Amount + Ingredient"],
                "optional_ingredients": ["Amount + Ingredient"],
                "instructions": "Step 1. ... Step 2. ..."
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Category: ${category}, Available Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let resultData = JSON.parse(completion.choices[0].message.content);

    if (resultData.recipes) {
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
    res.status(500).json({ data: { error: error.message } });
  }
});
