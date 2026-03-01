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
const LANGUAGE_STRATEGY = {
  ko: {
    label: "Korean",
    constraint: "모든 텍스트(제목, 사유, 재료)는 반드시 한국어(Korean)로만 출력하세요.",
    suffix: " 황금레시피"
  },
  en: {
    label: "English",
    constraint: "FORBIDDEN: DO NOT USE KOREAN CHARACTERS. ALL output MUST be in English. Even if the user provides ingredients in Korean, you MUST translate them and provide the recipe title, reason, and ingredients in English only. (e.g., 'Yangnyeom Chicken' -> 'Korean Fried Chicken')",
    suffix: " Recipe"
  }
};

exports.getRecipes = onRequest({ cors: true, timeoutSeconds: 60, maxInstances: 10 }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // 데이터 추출 및 구조 정규화
  const body = req.body.data || req.body;
  const { ingredients, category, lang = 'ko' } = body;
  const strategy = LANGUAGE_STRATEGY[lang] || LANGUAGE_STRATEGY.ko;

  if (!ingredients || !category) {
    res.status(400).json({ data: { error: "Missing required fields" } });
    return;
  }

  try {
    logger.info(`Request for ${strategy.label} - Category: ${category}`);

    const systemMessage = `You are a professional chef. 
STRICT LANGUAGE RULE: ${strategy.constraint}

[TASK]
Recommend 3 actual, verified recipes based on the user's ingredients.
1. Return ONLY a valid JSON object.
2. NO person names in titles.
3. NO cooking instructions.
4. If a recipe is traditionally from another culture, provide its name in ${strategy.label}.

[JSON FORMAT]
{
  "recipes": [
    {
      "title": "Recipe Name in ${strategy.label}",
      "reason": "1-sentence reason why it matches these ingredients (in ${strategy.label})",
      "ingredients_needed": ["Essential ingredients in ${strategy.label}"]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { 
          role: "user", 
          content: `Cuisine Type: ${category}\nAvailable Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}\nProvide 3 recipes entirely in ${strategy.label}.` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0, // 결과의 일관성을 위해 0으로 설정
    });

    let resultData = JSON.parse(completion.choices[0].message.content);

    // 검색 키워드 및 링크 생성
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
    logger.error("API Error:", error);
    res.status(500).json({ 
      data: { error: "Failed to fetch recipes", details: error.message } 
    });
  }
});
