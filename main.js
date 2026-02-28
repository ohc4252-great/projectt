// Recipe Data Store (Popular Recipes Inspired by Top Search Results)
const RECIPES = [
    // --- Korean ---
    {
        id: 1,
        name: "백종원 김치볶음밥",
        cuisine: "korean",
        ingredients: ["김치", "밥", "대파", "스팸", "달걀", "설탕", "간장", "고춧가루", "식용유"],
        time: "15분",
        difficulty: "쉬움",
        emoji: "🍳",
        steps: ["대파를 잘게 썰어 파기름을 낸다.", "스팸과 김치를 넣고 충분히 볶는다.", "설탕과 간장으로 풍미를 올린다.", "밥을 넣고 섞으며 볶은 뒤 달걀 프라이를 올린다."]
    },
    {
        id: 2,
        name: "황금레시피 된장찌개",
        cuisine: "korean",
        ingredients: ["된장", "두부", "애호박", "양파", "감자", "멸치육수", "고추장", "고춧가루", "마늘"],
        time: "20분",
        difficulty: "보통",
        emoji: "🍲",
        steps: ["멸치와 다시마로 육수를 낸다.", "된장과 고추장을 3:1 비율로 푼다.", "감자, 양파, 호박 순으로 넣고 끓인다.", "두부와 다진 마늘을 넣고 마무리한다."]
    },
    {
        id: 3,
        name: "국민 반찬 제육볶음",
        cuisine: "korean",
        ingredients: ["돼지고기", "양파", "대파", "고추장", "고춧가루", "간장", "설탕", "다진마늘", "후추"],
        time: "25분",
        difficulty: "보통",
        emoji: "🔥",
        steps: ["고기에 설탕을 먼저 넣어 버무린다.", "양념장(고추장, 고춧가루, 간장, 마늘)을 넣고 재운다.", "팬에 고기를 볶다가 채소를 넣고 센 불에 빠르게 볶는다."]
    },
    // --- Japanese ---
    {
        id: 4,
        name: "정통 차슈동",
        cuisine: "japanese",
        ingredients: ["삼겹살", "밥", "간장", "맛술", "설탕", "생강", "대파", "양파", "식용유"],
        time: "40분",
        difficulty: "보통",
        emoji: "🍚",
        steps: ["삼겹살 겉면을 팬에 노릇하게 굽는다.", "간장, 맛술, 설탕, 생강을 넣은 소스에 고기를 졸인다.", "고기를 얇게 썰어 밥 위에 올리고 소스를 뿌린다."]
    },
    {
        id: 5,
        name: "부드러운 오야코동",
        cuisine: "japanese",
        ingredients: ["닭다리살", "달걀", "양파", "밥", "쯔유", "간장", "설탕", "식용유"],
        time: "15분",
        difficulty: "쉬움",
        emoji: "🥣",
        steps: ["팬에 쯔유 소스와 양파를 넣고 끓인다.", "한입 크기 닭고기를 넣고 익힌다.", "달걀을 대충 풀어 원을 그리듯 넣고 반숙일 때 밥에 올린다."]
    },
    // --- Chinese ---
    {
        id: 6,
        name: "불맛 마파두부",
        cuisine: "chinese",
        ingredients: ["두부", "다진돼지고기", "두반장", "굴소스", "고춧가루", "전분가루", "식용유", "파", "마늘"],
        time: "20분",
        difficulty: "보통",
        emoji: "🥘",
        steps: ["파와 마늘, 고춧가루로 고추기름을 낸다.", "고기를 볶다가 두반장과 물을 넣고 끓인다.", "두부를 넣고 전분물로 걸쭉하게 농도를 맞춘다."]
    },
    {
        id: 7,
        name: "초간단 계란볶음밥",
        cuisine: "chinese",
        ingredients: ["밥", "달걀", "대파", "굴소스", "식용유", "소금", "후추"],
        time: "10분",
        difficulty: "쉬움",
        emoji: "🍛",
        steps: ["대파를 볶아 향을 낸 뒤 달걀 스크램블을 만든다.", "밥을 넣고 고슬고슬하게 볶는다.", "굴소스로 간을 하고 소금, 후추로 마무리한다."]
    },
    // --- Western ---
    {
        id: 8,
        name: "알리오 올리오",
        cuisine: "western",
        ingredients: ["파스타면", "마늘", "올리브오일", "페페론치노", "소금", "후추", "파슬리"],
        time: "15분",
        difficulty: "쉬움",
        emoji: "🍝",
        steps: ["면을 소금물에 삶는다.", "팬에 올리브오일을 듬뿍 두르고 편마늘을 노릇하게 굽는다.", "삶은 면과 면수를 넣고 오일이 유화될 때까지 섞는다."]
    },
    {
        id: 9,
        name: "정통 까르보나라",
        cuisine: "western",
        ingredients: ["파스타면", "베이컨", "달걀노른자", "파마산치즈", "후추", "올리브오일", "소금"],
        time: "20분",
        difficulty: "보통",
        emoji: "🧀",
        steps: ["베이컨을 바삭하게 굽는다.", "노른자와 치즈, 후추를 섞어 소스를 만든다.", "불을 끄고 면과 소스를 섞어 잔열로 익힌다. (중요: 불을 끄고 섞어야 함)"]
    }
];

// Cuisine Default Ingredients
const DEFAULT_INGREDIENTS = {
    korean: ["소금", "설탕", "후추", "고춧가루", "고추장", "진간장", "다진마늘", "식용유"],
    japanese: ["간장", "식초", "설탕", "맛술", "식용유", "와사비"],
    chinese: ["식용유", "고춧가루", "간장", "설탕", "굴소스", "전분가루"],
    western: ["올리브오일", "소금", "후추", "버터", "마늘", "허브"]
};

// State Management
let state = {
    selectedCuisine: '',
    ingredients: [],
    currentStep: 'cuisine-section'
};

// DOM Elements
const sections = {
    cuisine: document.getElementById('cuisine-section'),
    ingredient: document.getElementById('ingredient-section'),
    recipe: document.getElementById('recipe-section')
};

const cuisineCards = document.querySelectorAll('.cuisine-card');
const selectedCuisineDisplay = document.getElementById('selected-cuisine-display');
const ingredientInput = document.getElementById('ingredient-input');
const addIngredientBtn = document.getElementById('add-ingredient-btn');
const ingredientTagsContainer = document.getElementById('ingredient-tags');
const findRecipeBtn = document.getElementById('find-recipe-btn');
const recipeGrid = document.getElementById('recipe-grid');
const recipeModal = document.getElementById('recipe-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

// Functions
function navigateTo(stepId) {
    Object.values(sections).forEach(section => section.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
    state.currentStep = stepId;
    window.scrollTo(0, 0);
}

function updateIngredientTags() {
    ingredientTagsContainer.innerHTML = '';
    state.ingredients.forEach((ing, index) => {
        const isDefault = DEFAULT_INGREDIENTS[state.selectedCuisine]?.includes(ing);
        const tag = document.createElement('div');
        tag.className = `tag ${isDefault ? 'default-tag' : ''}`;
        tag.innerHTML = `
            ${ing}
            ${isDefault ? '<small>(기본)</small>' : `<span class="remove" data-index="${index}">&times;</span>`}
        `;
        ingredientTagsContainer.appendChild(tag);
    });
}

function addIngredient() {
    const value = ingredientInput.value.trim();
    if (value && !state.ingredients.includes(value)) {
        state.ingredients.push(value);
        ingredientInput.value = '';
        updateIngredientTags();
    }
}

function findRecipes() {
    const filtered = RECIPES.filter(recipe => recipe.cuisine === state.selectedCuisine);
    
    // Sort by match count
    const scored = filtered.map(recipe => {
        const matchedItems = recipe.ingredients.filter(recipeIng => 
            state.ingredients.some(userIng => recipeIng.includes(userIng) || userIng.includes(recipeIng))
        );
        const matchCount = matchedItems.length;
        return { ...recipe, matchCount, matchedItems };
    }).sort((a, b) => b.matchCount - a.matchCount);

    renderRecipes(scored);
    navigateTo('recipe-section');
}

function renderRecipes(recipes) {
    recipeGrid.innerHTML = '';
    if (recipes.length === 0) {
        recipeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">해당 분야의 레시피를 찾을 수 없습니다.</p>';
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-img">${recipe.emoji}</div>
            <div class="recipe-info">
                <h3>${recipe.name}</h3>
                <div class="recipe-meta">
                    <span>⏱ ${recipe.time}</span>
                    <span>📊 ${recipe.difficulty}</span>
                </div>
                ${recipe.matchCount > 0 ? `<div class="match-badge">${recipe.matchCount}개 재료 일치</div>` : ''}
            </div>
        `;
        card.onclick = () => showRecipeDetail(recipe);
        recipeGrid.appendChild(card);
    });
}

function showRecipeDetail(recipe) {
    modalBody.innerHTML = `
        <h2 style="font-size: 2rem; margin-bottom: 10px;">${recipe.emoji} ${recipe.name}</h2>
        <div style="margin-bottom: 20px; color: #666;">
            <p>⏱ 소요 시간: ${recipe.time} | 📊 난이도: ${recipe.difficulty}</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">필요한 재료</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${recipe.ingredients.map(ing => {
                    const isMatched = state.ingredients.some(userIng => ing.includes(userIng) || userIng.includes(ing));
                    return `<span style="padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; background: ${isMatched ? 'var(--primary)' : '#eee'}; color: ${isMatched ? 'white' : '#666'}">${ing}</span>`;
                }).join('')}
            </div>
        </div>

        <h3 style="margin-bottom: 15px; border-bottom: 2px solid var(--primary); display: inline-block;">요리 순서</h3>
        <ol style="padding-left: 20px;">
            ${recipe.steps.map(step => `<li style="margin-bottom: 12px; line-height: 1.5;">${step}</li>`).join('')}
        </ol>
    `;
    recipeModal.showModal();
}

// Event Listeners
cuisineCards.forEach(card => {
    card.addEventListener('click', () => {
        const cuisine = card.dataset.cuisine;
        state.selectedCuisine = cuisine;
        state.ingredients = [...(DEFAULT_INGREDIENTS[cuisine] || [])];
        
        const labels = { korean: '한식', japanese: '일식', chinese: '중식', western: '양식' };
        selectedCuisineDisplay.textContent = labels[state.selectedCuisine];
        
        updateIngredientTags();
        navigateTo('ingredient-section');
    });
});

addIngredientBtn.addEventListener('click', addIngredient);
ingredientInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addIngredient();
});

ingredientTagsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
        const index = e.target.dataset.index;
        state.ingredients.splice(index, 1);
        updateIngredientTags();
    }
});

findRecipeBtn.addEventListener('click', findRecipes);

document.getElementById('back-to-cuisine').addEventListener('click', () => {
    navigateTo('cuisine-section');
});

document.getElementById('restart-btn').addEventListener('click', () => {
    state.ingredients = [];
    state.selectedCuisine = '';
    updateIngredientTags();
    navigateTo('cuisine-section');
});

closeModalBtn.addEventListener('click', () => {
    recipeModal.close();
});

// Close modal on backdrop click
recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) recipeModal.close();
});
