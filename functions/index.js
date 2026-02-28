const { onRequest } = require("firebase-functions/v2/https");
const { OpenAI } = require("openai");

// OpenAI API 연결 설정 (환경변수에서 키를 가져옴)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getRecipes = onRequest({ cors: true }, async (req, res) => {
  // 1. 프론트엔드에서 보낸 데이터 추출
  const data = req.body.data || req.body;
  const ingredients = data.ingredients;
  const category = data.category;

  // 재료가 비어있으면 돌려보냄
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ data: { error: "재료가 입력되지 않았습니다." } });
  }

  // 2. OpenAI에게 보낼 깐깐한 명령서 (프롬프트 세팅)
  const prompt = `
    너는 전문 셰프야. 
    사용자가 가진 재료: [${ingredients.join(', ')}]
    원하는 요리 종류: '${category}'
    
    이 재료를 최우선으로 활용해서 만들 수 있는 레시피 3개를 추천해줘.
    없는 재료가 있더라도 요리에 치명적이지 않은(대체 가능하거나 생략 가능한) 레시피 위주로 부탁해.
    
    반드시 아래의 JSON 형식으로만 답변해:
    {
      "recipes": [
        {
          "title": "요리 이름",
          "time": "예상 소요 시간(분)",
          "ingredients_needed": ["사용할 사용자의 재료와 추가로 필요한 소량의 재료"],
          "missing_ingredients_note": "없어도 되는 재료나 대체품에 대한 짧은 코멘트",
          "instructions": ["1단계", "2단계", "3단계"]
        }
      ]
    }
  `;

  try {
    // 3. ⭐️ 가짜 데이터가 아닌, "진짜" OpenAI 서버에 요청을 보내는 핵심 부분!
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 빠르고 가성비 좋은 모델
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }, // JSON으로만 대답하라고 강제
      max_tokens: 1000, // 토큰 제한 1000으로 설정
    });

    // 4. OpenAI가 준 진짜 레시피를 프론트엔드로 전달
    const result = JSON.parse(response.choices[0].message.content);
    res.status(200).json({ data: result });

  } catch (error) {
    console.error("OpenAI 통신 에러:", error);
    res.status(500).json({ data: { error: "레시피를 생성하는 중 오류가 발생했습니다." } });
  }
});