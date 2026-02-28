const functions = require("firebase-functions");
const { OpenAI } = require("openai");
require("dotenv").config();

// OpenAI Client Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getAIRecommendations = functions.https.onCall(async (data, context) => {
  const { ingredients, cuisine, lang } = data;

  const prompt = lang === 'ko' 
    ? `사용자가 가진 재료: ${ingredients.join(", ")}. 
       분야: ${cuisine}.
       사용자의 재료를 최대한 활용하되, 부족한 경우 기본 양념을 사용하여 만들 수 있는 대중적이고 인기 있는 레시피를 **반드시 최소 5개 이상** 추천해줘.
       각 레시피는 다음 JSON 형식의 배열로 응답해줘:
       [{ "name": "요리명", "ingredients": ["재료1", "재료2"], "time": "소요시간", "difficulty": "난이도", "emoji": "이모지", "steps": ["단계1", "단계2"] }]
       다른 설명 없이 오직 JSON 배열만 반환해.`
    : `User ingredients: ${ingredients.join(", ")}. 
       Cuisine: ${cuisine}.
       Suggest **at least 5** popular and well-reviewed recipes using these ingredients. 
       Even if ingredients are limited, suggest diverse dishes using base seasonings.
       Respond only in the following JSON array format:
       [{ "name": "Dish Name", "ingredients": ["Ing1", "Ing2"], "time": "Time", "difficulty": "Difficulty", "emoji": "Emoji", "steps": ["Step1", "Step2"] }]
       Return only the JSON array, no extra text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    let content = response.choices[0].message.content;
    // gpt-4o-mini might return a root object if response_format is used, 
    // or just the string if handled carefully. Let's parse and ensure array.
    let recommendations = JSON.parse(content);
    
    // If the model wraps it in an object like { "recipes": [...] }
    if (!Array.isArray(recommendations) && recommendations.recipes) {
        recommendations = recommendations.recipes;
    }

    return { success: true, recipes: recommendations };
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch recipes from AI");
  }
});
