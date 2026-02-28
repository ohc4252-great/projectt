/**
 * Firebase Cloud Functions v2 - Recipe Curation Logic
 * Node.js 20 환경 및 OpenAI gpt-4o-mini 사용
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

// OpenAI API 클라이언트 초기화
// 프로젝트의 .env 파일에 OPENAI_API_KEY가 설정되어 있어야 합니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 큐레이션 기반 레시피 추천 함수 (기존 getRecipes 이름 유지)
 */
exports.getRecipes = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  // 1. 요청 방식 확인
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Firebase v1 스타일의 { data: { ... } } 구조 또는 일반 JSON 구조 모두 대응
  const body = req.body.data || req.body;
  const { ingredients, category } = body;

  if (!ingredients || !category) {
    res.status(400).json({ data: { error: "재료와 요리 카테고리가 필요합니다." } });
    return;
  }

  try {
    logger.info(`Curation Request - Category: ${category}, Ingredients: ${ingredients}`);

    // 2. OpenAI API 호출 (gpt-4o-mini)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 사용자의 냉장고 속 재료를 분석하여 최적의 유명 요리를 추천하는 수석 셰프입니다.
          
[미션]
1. 직접 요리법(instructions)을 절대 설명하지 마세요. 대신 인터넷에 실제로 존재하고 검증된 유명한 메뉴 3가지를 추천하세요.
2. 각 요리는 반드시 '백종원의 OOO', '김수미의 OOO' 처럼 실제 존재하는 유명 레시피이거나 대중적인 메뉴여야 합니다.
3. 결과는 반드시 유효한 JSON 형식으로만 응답하세요.

[출력 데이터 구조]
{
  "recipes": [
    {
      "title": "요리 이름 (예: 백종원 돼지고기 김치찌개)",
      "reason": "왜 이 요리를 추천하는지(입력한 재료와의 연관성) 짧은 설명",
      "ingredients_needed": ["필요한 핵심 재료들"],
      "youtube_search_link": "https://www.youtube.com/results?search_query=요리이름+황금레시피",
      "google_search_keyword": "요리이름 황금레시피"
    }
  ]
}

[중요 제약 조건]
- 절대 가짜 URL이나 존재하지 않는 도메인을 지어내지 마세요.
- 유튜브 검색 링크는 정해진 양식(https://www.youtube.com/results?search_query=검색어)을 엄수하세요.
- 모든 답변은 한국어로 작성하세요.`,
        },
        {
          role: "user",
          content: `카테고리: ${category}\n보유 재료: ${Array.isArray(ingredients) ? ingredients.join(', ') : ingredients}\n이 재료들로 만들 수 있는 맛있는 메뉴 3가지를 추천해줘.`,
        },
      ],
      response_format: { type: "json_object" }, 
      max_tokens: 1000,
      temperature: 0.7,
    });

    // 3. 응답 파싱
    const content = JSON.parse(completion.choices[0].message.content);
    
    // 링크 안전 처리 (인코딩 보장)
    if (content.recipes && Array.isArray(content.recipes)) {
      content.recipes = content.recipes.map(recipe => {
        const query = encodeURIComponent(recipe.title + " 황금레시피");
        recipe.youtube_search_link = `https://www.youtube.com/results?search_query=${query}`;
        return recipe;
      });
    }

    // 4. 결과 반환 (Firebase Callable Function 응답 형식을 고려하여 data 객체로 감쌈)
    res.status(200).json({ data: content });

  } catch (error) {
    logger.error("OpenAI API Error:", error);
    res.status(500).json({ 
      data: { 
        error: "레시피 추천 중 오류가 발생했습니다.",
        details: error.message 
      }
    });
  }
});
