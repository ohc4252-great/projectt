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
 * 언어별 출력 규칙 및 검색 키워드 설정
 */
const LANGUAGE_DATABASE = {
  ko: {
    name: "Korean",
    instruction: "모든 답변(제목, 사유, 재료)을 반드시 한국어로 작성하세요.",
    search_suffix: " 황금레시피",
    category_names: {
      korean: "한식",
      japanese: "일식",
      chinese: "중식",
      western: "양식"
    }
  },
  en: {
    name: "English",
    instruction: "ALL content (title, reason, ingredients_needed) MUST be written in ENGLISH. Even if the input ingredients are in Korean, you MUST translate them and provide the results in English only.",
    search_suffix: " Recipe",
    category_names: {
      korean: "Korean",
      japanese: "Japanese",
      chinese: "Chinese",
      western: "Western"
    }
  }
};

/**
 * 큐레이션 기반 레시피 추천 함수
 */
exports.getRecipes = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const body = req.body.data || req.body;
  const { ingredients, category, lang = 'ko' } = body;

  // 설정 데이터베이스에서 해당 언어 설정 가져오기 (기본값 ko)
  const langConfig = LANGUAGE_DATABASE[lang] || LANGUAGE_DATABASE.ko;

  if (!ingredients || !category) {
    res.status(400).json({ data: { error: lang === 'ko' ? "재료와 요리 카테고리가 필요합니다." : "Ingredients and cuisine category are required." } });
    return;
  }

  try {
    logger.info(`Curation Request - Category: ${category}, Lang: ${lang}`);

    const systemPrompt = `You are a master chef. Follow these rules strictly:
    
[Language Setting]
- Target Language: ${langConfig.name}
- Directive: ${langConfig.instruction}

[Mission]
1. Recommend 3 menus that actually exist and are verified on the internet based on the provided ingredients.
2. NEVER explain instructions directly.
3. NEVER include person names (e.g., 'Baek Jong-won') in titles.
4. Respond ONLY in valid JSON format.

[Output Data Structure]
{
  "recipes": [
    {
      "title": "Menu Name in ${langConfig.name}",
      "reason": "Why this dish is recommended (in ${langConfig.name})",
      "ingredients_needed": ["Key ingredients in ${langConfig.name}"],
      "youtube_search_link": "https://www.youtube.com/results?search_query=MenuName+${langConfig.search_suffix}",
      "google_search_keyword": "MenuName ${langConfig.search_suffix}"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Cuisine Style: ${langConfig.category_names[category] || category}\nInput Ingredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}\nBased on these, recommend 3 menus. Remember, the output MUST be entirely in ${langConfig.name}.`,
        },
      ],
      response_format: { type: "json_object" }, 
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = JSON.parse(completion.choices[0].message.content);
    
    // 유튜브 링크 보정 및 검색어 생성 (데이터베이스 설정 참조)
    if (content.recipes && Array.isArray(content.recipes)) {
      content.recipes = content.recipes.map(recipe => {
        const query = encodeURIComponent(recipe.title + langConfig.search_suffix);
        recipe.youtube_search_link = `https://www.youtube.com/results?search_query=${query}`;
        recipe.google_search_keyword = recipe.title + langConfig.search_suffix;
        return recipe;
      });
    }

    res.status(200).json({ data: content });

  } catch (error) {
    logger.error("OpenAI API Error:", error);
    res.status(500).json({ 
      data: { 
        error: lang === 'ko' ? "레시피 추천 중 오류가 발생했습니다." : "Error occurred during recipe recommendation.",
        details: error.message 
      }
    });
  }
});
