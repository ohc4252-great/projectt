// Recipe Data Store with Detailed Behavioral Instructions & Precise Measurements (Multi-language)
export const RECIPES = [
    // --- Korean (한식) ---
    { 
        id: 1, 
        name: { ko: "백종원 스타일 김치볶음밥", en: "Kimchi Fried Rice (Paik Style)" },
        cuisine: "korean", 
        ingredients: {
            ko: ["신김치 1공기", "밥 1공기", "대파 1/2대", "스팸 1/2캔", "달걀 1개", "설탕 1큰술", "간장 1큰술", "식용유 3큰술"],
            en: ["1 bowl of Sour Kimchi", "1 bowl of Rice", "1/2 Green onion", "1/2 can of Spam", "1 Egg", "1 tbsp Sugar", "1 tbsp Soy sauce", "3 tbsp Cooking oil"]
        },
        time: { ko: "15분", en: "15 min" }, 
        difficulty: { ko: "쉬움", en: "Easy" }, 
        emoji: "🍳", 
        steps: {
            ko: [
                "대파 1/2대를 흰 부분 위주로 송송 썰어 팬에 식용유 3큰술을 두르고 중불에서 파 향이 진하게 올라올 때까지 볶아 파기름을 냅니다.",
                "잘게 썬 스팸 1/2캔을 넣고 스팸 겉면이 노릇노릇해져 기름이 나올 때까지 충분히 볶아줍니다.",
                "신김치 1공기를 넣고 설탕 1큰술을 고루 뿌려 김치의 신맛을 잡으며 김치가 나른해질 때까지 볶습니다.",
                "팬 한쪽으로 재료를 밀어두고 빈 공간에 간장 1큰술을 부어 보글보글 끓인 뒤(불맛 내기) 재료와 섞어줍니다.",
                "불을 약불로 줄이거나 끈 상태에서 밥 1공기를 넣고 주걱을 세워 밥알이 뭉치지 않게 고루 섞은 뒤 다시 중불에서 1분간 더 볶아 마무리합니다."
            ],
            en: [
                "Chop 1/2 green onion and sauté in 3 tbsp of oil over medium heat until fragrant to make scallion oil.",
                "Add chopped spam and fry until the outside is golden brown and the fat starts to render.",
                "Add 1 bowl of sour kimchi and sprinkle 1 tbsp of sugar to balance the acidity; sauté until the kimchi softens.",
                "Push ingredients to one side, pour 1 tbsp of soy sauce into the empty space to let it bubble (for a smoky flavor), then mix with everything.",
                "Reduce heat to low, add 1 bowl of rice, and mix using a vertical spatula to prevent clumping. Stir-fry for 1 minute on medium heat to finish."
            ]
        }
    },
    { 
        id: 2, 
        name: { ko: "구수한 차돌 된장찌개", en: "Savory Brisket Soybean Paste Stew" },
        cuisine: "korean", 
        ingredients: {
            ko: ["된장 2큰술", "고추장 0.5큰술", "두부 1/2모", "애호박 1/3개", "양파 1/2개", "감자 1개", "멸치육수 500ml", "다진마늘 1큰술", "차돌박이 100g"],
            en: ["2 tbsp Soybean paste", "0.5 tbsp Chili paste", "1/2 block Tofu", "1/3 Zucchini", "1/2 Onion", "1 Potato", "500ml Anchovy broth", "1 tbsp Minced garlic", "100g Beef brisket"]
        },
        time: { ko: "20분", en: "20 min" }, 
        difficulty: { ko: "보통", en: "Medium" }, 
        emoji: "🍲", 
        steps: {
            ko: [
                "냄비에 차돌박이 100g을 먼저 넣고 고기 기름이 충분히 나올 때까지 중불에서 노릇하게 볶아 고소한 풍미를 끌어올립니다.",
                "멸치 육수 500ml(약 2.5컵)를 붓고 깍둑썰기한 감자 1개와 양파 1/2개를 먼저 넣어 감자가 반쯤 투명해질 때까지 끓입니다.",
                "된장 2큰술을 채망에 걸러 곱게 풀고, 고추장 0.5큰술을 추가해 깊고 칼칼한 맛을 더합니다.",
                "반달 썰기한 애호박 1/3개와 두부 1/2모를 넣고 국물이 자작하게 졸아들 때까지 5분 정도 더 보글보글 끓여줍니다.",
                "마지막에 다진 마늘 1큰술과 대파를 넣고 1분만 더 끓여 마늘 향을 살린 뒤 불을 끕니다."
            ],
            en: [
                "Sauté 100g of beef brisket in a pot over medium heat until golden and the fat is rendered.",
                "Pour in 500ml of anchovy broth. Add cubed potato and onion; boil until the potato becomes translucent.",
                "Strain 2 tbsp of soybean paste and 0.5 tbsp of chili paste into the pot for a deep, spicy flavor.",
                "Add sliced zucchini and tofu; simmer for 5 minutes until the stew thickens slightly.",
                "Finish by adding 1 tbsp of minced garlic and green onions; simmer for 1 minute then turn off the heat."
            ]
        }
    },
    { 
        id: 12, 
        name: { ko: "정통 알리오 올리오", en: "Classic Aglio e Olio" },
        cuisine: "western", 
        ingredients: {
            ko: ["파스타면 100g", "마늘 6알", "올리브오일 5큰술", "페페론치노 3개", "소금 2큰술", "면수 1국자"],
            en: ["100g Pasta", "6 cloves Garlic", "5 tbsp Olive oil", "3 Pepperoncino", "2 tbsp Salt", "1 ladle Pasta water"]
        },
        time: { ko: "15분", en: "15 min" }, 
        difficulty: { ko: "쉬움", en: "Easy" }, 
        emoji: "🍝", 
        steps: {
            ko: [
                "냄비에 물 2L와 소금 2큰술을 넣고 물이 끓으면 면 100g을 넣어 봉지에 적힌 시간보다 1분 적게(알덴테) 삶습니다.",
                "팬에 올리브오일 5큰술을 두르고 편썰기한 마늘 6알을 약불에서 타지 않게 서서히 익혀 황금색이 될 때까지 향을 뽑아냅니다.",
                "페페론치노 3개를 손으로 으깨 넣어 매운 향을 더하고, 면수 1국자를 팬에 부어 기름과 물이 잘 섞이게(유화) 합니다.",
                "삶아진 면을 팬으로 옮기고 중불에서 소스가 면에 쫙 달라붙을 때까지 힘차게 저어주며 1분간 볶습니다.",
                "마지막에 엑스트라 버진 올리브오일 1큰술을 추가로 둘러 풍미를 극대화하고 후추를 뿌려 완성합니다."
            ],
            en: [
                "Boil 2L of water with 2 tbsp of salt. Cook 100g of pasta for 1 minute less than instructed on the package (Al dente).",
                "Heat 5 tbsp of olive oil in a pan. Sauté sliced garlic over low heat until golden to infuse the oil with its scent.",
                "Crush 3 pepperoncinos into the pan. Pour in 1 ladle of pasta water to emulsify the oil and water.",
                "Transfer the pasta to the pan. Stir vigorously over medium heat for 1 minute until the sauce clings to the noodles.",
                "Finish with a drizzle of extra virgin olive oil and a dash of black pepper."
            ]
        }
    }
];

export const DEFAULT_INGREDIENTS = {
    ko: {
        korean: ["소금", "설탕", "후추", "고춧가루", "고추장", "진간장", "다진마늘", "식용유", "참기름"],
        japanese: ["간장", "식초", "설탕", "맛술", "식용유", "와사비", "쯔유"],
        chinese: ["식용유", "고춧가루", "간장", "설탕", "굴소스", "전분가루", "두반장"],
        western: ["올리브오일", "소금", "후추", "버터", "마늘", "허브", "치즈"]
    },
    en: {
        korean: ["Salt", "Sugar", "Black pepper", "Chili powder", "Gochujang", "Soy sauce", "Minced garlic", "Cooking oil", "Sesame oil"],
        japanese: ["Soy sauce", "Vinegar", "Sugar", "Mirin", "Cooking oil", "Wasabi", "Tsuyu"],
        chinese: ["Cooking oil", "Chili powder", "Soy sauce", "Sugar", "Oyster sauce", "Starch", "Doubanjiang"],
        western: ["Olive oil", "Salt", "Black pepper", "Butter", "Garlic", "Herbs", "Cheese"]
    }
};
