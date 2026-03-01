/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 * Node.js 20 환경 및 OpenAI gpt-4o-mini 사용
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

// OpenAI API 클라이언트 초기화
const apiKey = process.env.OPENAI_API_KEY || "dummy_key_for_deployment";
const openai = new OpenAI({
  apiKey: apiKey,
});

/**
 * [Language Strategy Database]
 */
const LANGUAGE_DATABASE = {
  ko: {
    name: "Korean",
    instruction: "모든 답변(title, reason, ingredients_needed)은 반드시 한국어(Korean)로만 작성하세요.",
    search_suffix: " 황금레시피"
  },
  en: {
    name: "English",
    instruction: "ALL fields (title, reason, ingredients_needed) MUST be written in ENGLISH. Do NOT use any Korean characters. Even if the input ingredients are in Korean, you MUST translate them into English for the output.",
    search_suffix: " Recipe"
  }
};

exports.getRecipes = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // 데이터 추출 (Firebase SDK 또는 직접 fetch 대응)
  const body = req.body.data || req.body;
  
  // 클라이언트에서 보낸 lang 값을 명확히 파악
  const selectedLang = body.lang === 'en' ? 'en' : 'ko';
  const langConfig = LANGUAGE_DATABASE[selectedLang];

  const { ingredients, category } = body;

  if (!ingredients || !category) {
    res.status(400).json({ data: { error: "Missing ingredients or category" } });
    return;
  }

  try {
    logger.info(`Processing request in ${langConfig.name}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `CRITICAL RULE: ${langConfig.instruction}
          
You are a world-class chef. Recommend 3 menus based on the provided ingredients.
1. NEVER explain the cooking steps.
2. Provide ONLY a JSON object.
3. No person names in titles.
4. If the user provided ingredients in a different language, TRANSLATE them to ${langConfig.name} first before processing.`
        },
        {
          role: "user",
          content: `Cuisine Style: ${category}
Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}

Response Format:
{
  "recipes": [
    {
      "title": "Menu name in ${langConfig.name}",
      "reason": "Why this dish? (in ${langConfig.name})",
      "ingredients_needed": ["List of ingredients in ${langConfig.name}"]
    }
  ]
}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // 더 일관된 답변을 위해 온도를 낮춤
    });

    let content = JSON.parse(completion.choices[0].message.content);
    
    // 유튜브/구글 링크 및 키워드 후처리 (서버에서 제어)
    if (content.recipes && Array.isArray(content.recipes)) {
      content.recipes = content.recipes.map(recipe => {
        const queryTerm = recipe.title + langConfig.search_suffix;
        return {
          ...recipe,
          youtube_search_link: `https://www.youtube.com/results?search_query=${encodeURIComponent(queryTerm)}`,
          google_search_keyword: queryTerm
        };
      });
    }

    res.status(200).json({ data: content });

  } catch (error) {
    logger.error("OpenAI Error:", error);
    res.status(500).json({ data: { error: error.message } });
  }
});
