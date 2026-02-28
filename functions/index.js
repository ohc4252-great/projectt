const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { OpenAI } = require("openai");
require("dotenv").config();

/**
 * OpenAI API 클라이언트 초기화
 * 환경 변수 OPENAI_API_KEY를 사용합니다.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI 레시피 추천 함수 (HTTP Trigger - onRequest)
 * 사용자가 보낸 재료와 카테고리를 바탕으로 gpt-4o-mini가 레시피를 생성합니다.
 */
exports.getAIRecommendations = onRequest({ cors: true, maxInstances: 10 }, async (req, res) => {
  // 1. 요청 메서드 및 데이터 검증
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed." });
  }

  const { ingredients, category, lang = "ko" } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      error: "재료(ingredients) 데이터가 누락되었거나 올바르지 않습니다.",
    });
  }

  // 2. AI 프롬프트 구성 (요리 로직 핵심 요구사항 반영)
  const systemMessage = lang === "ko" 
    ? "당신은 냉장고 파먹기 전문 셰프입니다. 사용자의 재료를 최우선으로 활용하며, 부족한 재료는 생략 가능하거나 대체 가능한 레시피 위주로 추천합니다."
    : "You are a professional chef specialized in 'Fridge Raiding'. Prioritize user ingredients and suggest recipes where missing parts are optional or replaceable.";

  const userMessage = lang === "ko"
    ? `보유 재료: ${ingredients.join(", ")}. 원하는 요리 분야: ${category || "전체"}.
       이 재료들로 만들 수 있는 인기 레시피를 **반드시 5개** 추천해줘. 
       - 사용자가 가진 재료를 가장 많이 활용할 것.
       - 추가 재료가 필요하다면 누구나 집에 있을 법한 소량의 양념으로 한정할 것.
       - 출력은 반드시 아래 JSON 구조를 따를 것.`
    : `Ingredients: ${ingredients.join(", ")}. Category: ${category || "All"}.
       Recommend **exactly 5** popular recipes.
       - Maximize use of given ingredients.
       - Keep additional requirements to basic pantry staples.
       - Follow the specified JSON structure strictly.`;

  try {
    // 3. OpenAI API 호출 (gpt-4o-mini)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.7,
    });

    // 4. 응답 데이터 파싱 및 반환
    const aiContent = JSON.parse(completion.choices[0].message.content);
    
    // AI 응답이 {"recipes": [...]} 구조인지 확인 및 보정
    const recipes = aiContent.recipes || aiContent;

    logger.info("Recipe generation successful", { count: Array.isArray(recipes) ? recipes.length : 1 });

    return res.status(200).json({
      success: true,
      recipes: Array.isArray(recipes) ? recipes : [recipes],
    });

  } catch (error) {
    // 5. 예외 처리
    logger.error("OpenAI API Error", error);
    
    return res.status(500).json({
      error: "AI 레시피 생성 중 오류가 발생했습니다.",
      message: error.message,
    });
  }
});
