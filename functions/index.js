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
 * 큐레이션 기반 레시피 추천 함수
 */
exports.getRecipes = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const body = req.body.data || req.body;
  const { ingredients, category, lang = 'ko' } = body;

  if (!ingredients || !category) {
    res.status(400).json({ data: { error: lang === 'ko' ? "재료와 요리 카테고리가 필요합니다." : "Ingredients and cuisine category are required." } });
    return;
  }

  try {
    logger.info(`Curation Request - Category: ${category}, Ingredients: ${ingredients}, Lang: ${lang}`);

    const isEnglish = lang === 'en';
    const systemPrompt = isEnglish 
      ? `You are a master chef who analyzes ingredients in the user's fridge and recommends the best cooking menus.
          
[Mission]
1. Never explain instructions directly. Instead, recommend 3 menus that actually exist and are verified on the internet.
2. Never include specific person names like 'Baek Jong-won' or 'Gordon Ramsay' in the recipe title. Write only the menu name honestly. (e.g., 'Pork Kimchi Stew', 'Clam Pasta')
3. Respond ONLY in valid JSON format.
4. ALL content (title, reason, ingredients_needed) MUST be written in ENGLISH.

[Output Data Structure]
{
  "recipes": [
    {
      "title": "Menu Name (e.g., Pork Kimchi Stew)",
      "reason": "Short explanation of why you recommend this dish (relation to input ingredients)",
      "ingredients_needed": ["Key ingredients needed"],
      "youtube_search_link": "https://www.youtube.com/results?search_query=MenuName+Recipe",
      "google_search_keyword": "MenuName Recipe"
    }
  ]
}`
      : `당신은 사용자의 냉장고 속 재료를 분석하여 최적의 요리 메뉴를 추천하는 수석 셰프입니다.
          
[미션]
1. 직접 요리법(instructions)을 절대 설명하지 마세요. 대신 인터넷에 실제로 존재하고 검증된 메뉴 3가지를 추천하세요.
2. 레시피 제목에 '백종원', '김수미' 같은 특정 인명을 절대 포함하지 마세요. 정직하게 메뉴 명만 작성하세요. (예: '돼지고기 김치찌개', '바지락 칼국수')
3. 결과는 반드시 유효한 JSON 형식으로만 응답하세요.
4. 모든 답변은 반드시 한국어로 작성하세요.

[출력 데이터 구조]
{
  "recipes": [
    {
      "title": "메뉴 명 (예: 돼지고기 김치찌개)",
      "reason": "왜 이 요리를 추천하는지(입력한 재료와의 연관성) 짧은 설명",
      "ingredients_needed": ["필요한 핵심 재료들"],
      "youtube_search_link": "https://www.youtube.com/results?search_query=메뉴명+황금레시피",
      "google_search_keyword": "메뉴명 황금레시피"
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
          content: isEnglish 
            ? `Category: ${category}\nIngredients: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}\nRecommend 3 delicious menus that can be made with these ingredients.`
            : `카테고리: ${category}\n보유 재료: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}\n이 재료들로 만들 수 있는 맛있는 메뉴 3가지를 추천해줘.`,
        },
      ],
      response_format: { type: "json_object" }, 
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = JSON.parse(completion.choices[0].message.content);
    
    if (content.recipes && Array.isArray(content.recipes)) {
      content.recipes = content.recipes.map(recipe => {
        const suffix = isEnglish ? " Recipe" : " 황금레시피";
        const query = encodeURIComponent(recipe.title + suffix);
        recipe.youtube_search_link = `https://www.youtube.com/results?search_query=${query}`;
        recipe.google_search_keyword = recipe.title + suffix;
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
