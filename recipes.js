// Recipe Data Store
export const RECIPES = [
    // --- Korean (한식) ---
    { id: 1, name: "김치볶음밥", cuisine: "korean", ingredients: ["김치", "밥", "대파", "스팸", "달걀", "설탕", "간장", "식용유"], time: "15분", difficulty: "쉬움", emoji: "🍳", steps: ["대파를 썰어 파기름을 낸다.", "스팸과 김치를 볶는다.", "밥을 넣고 양념과 함께 볶는다."] },
    { id: 2, name: "된장찌개", cuisine: "korean", ingredients: ["된장", "두부", "애호박", "양파", "감자", "멸치육수", "마늘"], time: "20분", difficulty: "보통", emoji: "🍲", steps: ["육수에 된장을 푼다.", "단단한 채소부터 넣고 끓인다.", "두부와 마늘을 넣고 마무리한다."] },
    { id: 3, name: "제육볶음", cuisine: "korean", ingredients: ["돼지고기", "양파", "대파", "고추장", "고춧가루", "간장", "설탕", "다진마늘"], time: "25분", difficulty: "보통", emoji: "🔥", steps: ["고기를 양념에 재운다.", "팬에 고기를 볶다가 채소를 넣는다.", "센 불에 빠르게 볶아 마무리한다."] },
    { id: 4, name: "불고기", cuisine: "korean", ingredients: ["소고기", "양파", "버섯", "간장", "설탕", "배즙", "다진마늘", "참기름"], time: "30분", difficulty: "보통", emoji: "🥩", steps: ["양념장을 만들어 고기를 재운다.", "채소와 함께 팬에서 볶는다."] },
    { id: 5, name: "비빔밥", cuisine: "korean", ingredients: ["밥", "콩나물", "시금치", "당근", "소고기", "고추장", "참기름", "달걀"], time: "20분", difficulty: "보통", emoji: "🥗", steps: ["각종 나물을 데치고 볶는다.", "밥 위에 나물과 고추장, 달걀을 올린다."] },
    { id: 6, name: "떡볶이", cuisine: "korean", ingredients: ["떡", "어묵", "고추장", "고춧가루", "설탕", "대파", "물"], time: "15분", difficulty: "쉬움", emoji: "🍢", steps: ["물에 양념을 풀고 끓인다.", "떡과 어묵을 넣고 졸인다."] },
    { id: 7, name: "잡채", cuisine: "korean", ingredients: ["당면", "돼지고기", "시금치", "당근", "표고버섯", "간장", "설탕", "참기름"], time: "40분", difficulty: "어려움", emoji: "🍜", steps: ["당면을 삶고 채소와 고기를 따로 볶는다.", "모든 재료를 양념과 함께 버무린다."] },
    { id: 8, name: "김치찌개", cuisine: "korean", ingredients: ["김치", "돼지고기", "두부", "대파", "고춧가루", "다진마늘", "물"], time: "25분", difficulty: "보통", emoji: "🥘", steps: ["고기와 김치를 충분히 볶는다.", "물을 넣고 끓이다 두부와 대파를 넣는다."] },
    { id: 9, name: "순두부찌개", cuisine: "korean", ingredients: ["순두부", "바지락", "달걀", "고춧가루", "파", "마늘", "식용유"], time: "20분", difficulty: "보통", emoji: "🍲", steps: ["고추기름을 내고 물을 붓는다.", "순두부와 해물을 넣고 끓이다 달걀을 넣는다."] },
    { id: 10, name: "삼겹살 구이", cuisine: "korean", ingredients: ["삼겹살", "마늘", "양파", "상추", "쌈장", "소금", "후추"], time: "15분", difficulty: "쉬움", emoji: "🥓", steps: ["고기를 노릇하게 굽는다.", "마늘과 양파를 곁들인다."] },

    // --- Japanese (일식) ---
    { id: 11, name: "초밥", cuisine: "japanese", ingredients: ["생선회", "밥", "식초", "설탕", "소금", "와사비"], time: "40분", difficulty: "어려움", emoji: "🍣", steps: ["단촛물을 만들어 밥과 섞는다.", "회 밑에 와사비를 바르고 밥을 쥔다."] },
    { id: 12, name: "라멘", cuisine: "japanese", ingredients: ["면", "차슈", "달걀", "죽순", "간장", "육수"], time: "50분", difficulty: "어려움", emoji: "🍜", steps: ["진한 육수를 끓인다.", "면을 삶고 고명을 올린다."] },
    { id: 13, name: "돈카츠", cuisine: "japanese", ingredients: ["돼지고기", "빵가루", "밀가루", "달걀", "식용유", "양배추"], time: "30분", difficulty: "보통", emoji: "🍱", steps: ["고기에 튀김옷을 입힌다.", "기름에 바삭하게 튀긴다."] },
    { id: 14, name: "오야코동", cuisine: "japanese", ingredients: ["닭고기", "달걀", "양파", "밥", "쯔유", "간장", "설탕"], time: "15분", difficulty: "쉬움", emoji: "🥣", steps: ["소스에 닭과 양파를 익힌다.", "달걀을 풀어 넣고 반숙으로 익혀 밥에 올린다."] },
    { id: 15, name: "규동", cuisine: "japanese", ingredients: ["소고기", "양파", "초생강", "밥", "간장", "맛술", "설탕"], time: "15분", difficulty: "쉬움", emoji: "🍚", steps: ["소고기와 양파를 소스에 졸인다.", "밥 위에 듬뿍 올린다."] },
    { id: 16, name: "타코야키", cuisine: "japanese", ingredients: ["문어", "밀가루반죽", "가쓰오부시", "마요네즈", "소스", "파"], time: "30분", difficulty: "보통", emoji: "🐙", steps: ["전용 팬에 반죽과 문어를 넣는다.", "동그랗게 굴리며 익힌다."] },
    { id: 17, name: "우동", cuisine: "japanese", ingredients: ["우동면", "쯔유", "어묵", "쑥갓", "튀김가루", "물"], time: "15분", difficulty: "쉬움", emoji: "🍜", steps: ["육수를 끓이고 면을 삶는다.", "고명을 올려 마무리한다."] },
    { id: 18, name: "오코노미야키", cuisine: "japanese", ingredients: ["양배추", "삼겹살", "밀가루", "달걀", "가쓰오부시", "소스"], time: "25분", difficulty: "보통", emoji: "🥞", steps: ["반죽과 재료를 섞어 부친다.", "고기를 올리고 소스를 뿌린다."] },
    { id: 19, name: "텐동", cuisine: "japanese", ingredients: ["새우", "단호박", "고구마", "밥", "간장", "맛술", "설탕", "식용유"], time: "40분", difficulty: "어려움", emoji: "🍤", steps: ["각종 재료를 바삭하게 튀긴다.", "소스와 함께 밥 위에 올린다."] },
    { id: 20, name: "메밀소바", cuisine: "japanese", ingredients: ["메밀면", "쯔유", "무즙", "와사비", "김가루", "파"], time: "15분", difficulty: "쉬움", emoji: "🥢", steps: ["면을 삶아 찬물에 헹군다.", "차가운 쯔유 소스에 찍어 먹는다."] },

    // --- Chinese (중식) ---
    { id: 21, name: "짜장면", cuisine: "chinese", ingredients: ["중화면", "춘장", "돼지고기", "양파", "양배추", "설탕", "식용유"], time: "30분", difficulty: "보통", emoji: "🍜", steps: ["춘장을 기름에 볶는다.", "고기와 채소를 볶다 춘장을 섞고 면에 올린다."] },
    { id: 22, name: "짬뽕", cuisine: "chinese", ingredients: ["중화면", "해물", "돼지고기", "고춧가루", "양파", "배추", "마늘"], time: "30분", difficulty: "어려움", emoji: "🔥", steps: ["채소와 고추기름을 볶는다.", "물을 붓고 해물과 함께 끓여 면에 붓는다."] },
    { id: 23, name: "탕수육", cuisine: "chinese", ingredients: ["돼지고기", "전분가루", "식용유", "식초", "설탕", "간장", "당근"], time: "40분", difficulty: "어려움", emoji: "🥢", steps: ["고기를 튀겨낸다.", "새콤달콤한 소스를 만들어 곁들인다."] },
    { id: 24, name: "마파두부", cuisine: "chinese", ingredients: ["두부", "다진고기", "두반장", "고추기름", "전분물", "파", "마늘"], time: "20분", difficulty: "보통", emoji: "🥘", steps: ["두반장 소스에 고기와 두부를 볶는다.", "전분물로 농도를 맞춘다."] },
    { id: 25, name: "계란볶음밥", cuisine: "chinese", ingredients: ["밥", "달걀", "대파", "굴소스", "식용유", "소금", "후추"], time: "10분", difficulty: "쉬움", emoji: "🍛", steps: ["대파와 달걀을 볶는다.", "밥을 넣고 굴소스로 간을 하며 볶는다."] },
    { id: 26, name: "꿔바로우", cuisine: "chinese", ingredients: ["돼지고기등심", "감자전분", "식용유", "식초", "설탕", "생강"], time: "40분", difficulty: "어려움", emoji: "🍘", steps: ["납작한 고기를 전분반죽으로 튀긴다.", "강한 신맛의 소스에 버무린다."] },
    { id: 27, name: "양장피", cuisine: "chinese", ingredients: ["양장피", "해물", "채소", "겨자소스", "돼지고기", "전분"], time: "50분", difficulty: "어려움", emoji: "🥗", steps: ["각종 재료를 채썰어 담는다.", "볶은 고기와 소스를 곁들인다."] },
    { id: 28, name: "유린기", cuisine: "chinese", ingredients: ["닭고기", "전분", "양상추", "간장", "식초", "고추", "마늘"], time: "35분", difficulty: "보통", emoji: "🍗", steps: ["닭고기를 튀겨 양상추 위에 올린다.", "간장소스를 뿌려 먹는다."] },
    { id: 29, name: "칠리새우", cuisine: "chinese", ingredients: ["새우", "전분", "케첩", "두반장", "설탕", "마늘", "식용유"], time: "30분", difficulty: "보통", emoji: "🍤", steps: ["새우를 튀긴다.", "칠리 소스에 빠르게 버무린다."] },
    { id: 30, name: "꽃빵과 고추잡채", cuisine: "chinese", ingredients: ["꽃빵", "피망", "돼지고기", "굴소스", "고추기름", "전분"], time: "20분", difficulty: "보통", emoji: "🍞", steps: ["피망과 고기를 굴소스에 볶는다.", "찐 꽃빵과 함께 먹는다."] },

    // --- Western (양식) ---
    { id: 31, name: "알리오 올리오", cuisine: "western", ingredients: ["파스타면", "마늘", "올리브오일", "페페론치노", "소금", "후추"], time: "15분", difficulty: "쉬움", emoji: "🍝", steps: ["마늘을 오일에 노릇하게 굽는다.", "삶은 면을 오일 소스에 볶는다."] },
    { id: 32, name: "까르보나라", cuisine: "western", ingredients: ["파스타면", "베이컨", "달걀노른자", "치즈가루", "후추", "올리브오일"], time: "20분", difficulty: "보통", emoji: "🧀", steps: ["베이컨을 굽고 면을 삶는다.", "불을 끄고 노른자 소스와 버무린다."] },
    { id: 33, name: "스테이크", cuisine: "western", ingredients: ["소고기", "올리브오일", "버터", "로즈마리", "소금", "후추"], time: "15분", difficulty: "보통", emoji: "🥩", steps: ["고기에 시즈닝을 한다.", "팬에서 원하는 굽기로 익힌다."] },
    { id: 34, name: "함박 스테이크", cuisine: "western", ingredients: ["다진쇠고기", "다진돼지고기", "양파", "빵가루", "달걀", "소스"], time: "30분", difficulty: "보통", emoji: "🍖", steps: ["반죽을 빚어 팬에 굽는다.", "소스를 만들어 끼얹는다."] },
    { id: 35, name: "봉골레 파스타", cuisine: "western", ingredients: ["파스타면", "바지락", "마늘", "화이트와인", "올리브오일", "페페론치노"], time: "20분", difficulty: "보통", emoji: "🐚", steps: ["마늘을 볶다 조개를 넣고 익힌다.", "와인을 넣어 잡내를 잡고 면을 섞는다."] },
    { id: 36, name: "마르게리따 피자", cuisine: "western", ingredients: ["피자도우", "토마토소스", "모짜렐라치즈", "바질", "올리브오일"], time: "30분", difficulty: "어려움", emoji: "🍕", steps: ["도우에 소스와 치즈를 올린다.", "오븐에 굽고 바질을 올린다."] },
    { id: 37, name: "시저 샐러드", cuisine: "western", ingredients: ["로메인", "크루통", "베이컨", "치즈", "드레싱", "닭가슴살"], time: "15분", difficulty: "쉬움", emoji: "🥗", steps: ["채소를 씻고 재료를 담는다.", "드레싱과 치즈를 뿌린다."] },
    { id: 38, name: "라자냐", cuisine: "western", ingredients: ["라자냐박", "라구소스", "베샤멜소스", "치즈", "소고기"], time: "60분", difficulty: "어려움", emoji: "🥘", steps: ["소스와 면을 층층이 쌓는다.", "치즈를 듬뿍 올려 오븐에 굽는다."] },
    { id: 39, name: "에그 인 헬", cuisine: "western", ingredients: ["달걀", "토마토소스", "소시지", "양파", "치즈", "올리브오일"], time: "20분", difficulty: "쉬움", emoji: "🍳", steps: ["소스에 재료를 넣고 끓인다.", "달걀을 깨 넣고 살짝 익힌다."] },
    { id: 40, name: "감바스 알 아히요", cuisine: "western", ingredients: ["새우", "마늘", "올리브오일", "페페론치노", "소금", "후추"], time: "15분", difficulty: "쉬움", emoji: "🍤", steps: ["오일에 마늘향을 낸다.", "새우를 넣고 익을 때까지 끓인다."] }
];

export const DEFAULT_INGREDIENTS = {
    korean: ["소금", "설탕", "후추", "고춧가루", "고추장", "진간장", "다진마늘", "식용유", "참기름"],
    japanese: ["간장", "식초", "설탕", "맛술", "식용유", "와사비", "쯔유"],
    chinese: ["식용유", "고춧가루", "간장", "설탕", "굴소스", "전분가루", "두반장"],
    western: ["올리브오일", "소금", "후추", "버터", "마늘", "허브", "치즈"]
};
