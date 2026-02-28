const functions = require("firebase-functions");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getAIRecommendations = functions.https.onCall(async (data, context) => {
  const { ingredients, cuisine, lang } = data;

  const systemPrompt = lang === 'ko'
    ? "당신은 세계 최고의 요리 전문가입니다. 사용자의 재료를 바탕으로 가장 인기 있고 검증된 레시피를 추천합니다."
    : "You are a world-class chef. Recommend the most popular and verified recipes based on the user's ingredients.";

  const userPrompt = lang === 'ko' 
    ? `보유 재료: ${ingredients.join(", ")}. 분야: ${cuisine}.
       이 재료들로 만들 수 있는 대중적인 레시피를 **반드시 5개 이상** 알려줘. 
       응답은 반드시 다음 JSON 형식을 지켜야 해:
       { "recipes": [{ "name": "요리명", "ingredients": ["재료1", "재료2"], "time": "15분", "difficulty": "쉬움", "emoji": "🍳", "steps": ["단계1", "단계2"] }] }`
    : `Ingredients: ${ingredients.join(", ")}. Cuisine: ${cuisine}.
       Recommend **at least 5** popular recipes.
       The response must be in this JSON format:
       { "recipes": [{ "name": "Dish Name", "ingredients": ["Ing1", "Ing2"], "time": "15 min", "difficulty": "Easy", "emoji": "🍳", "steps": ["Step1", "Step2"] }] }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return { success: true, recipes: result.recipes || [] };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new functions.https.HttpsError("internal", "AI 추천을 가져오지 못했습니다.");
  }
});
