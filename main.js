// Recipe Data Store
const RECIPES = [
    {
        id: 1,
        name: "김치볶음밥",
        cuisine: "korean",
        ingredients: ["김치", "밥", "스팸", "달걀"],
        time: "15분",
        difficulty: "쉬움",
        emoji: "🍳",
        steps: ["김치를 잘게 썬다.", "팬에 기름을 두르고 김치와 스팸을 볶는다.", "밥을 넣고 함께 볶는다.", "달걀 프라이를 올려 마무리한다."]
    },
    {
        id: 2,
        name: "된장찌개",
        cuisine: "korean",
        ingredients: ["된장", "두부", "호박", "감자", "멸치"],
        time: "20분",
        difficulty: "보통",
        emoji: "🍲",
        steps: ["멸치 육수를 낸다.", "된장을 풀고 딱딱한 채소(감자)부터 넣는다.", "호박과 두부를 넣고 끓인다."]
    },
    {
        id: 3,
        name: "계란말이",
        cuisine: "korean",
        ingredients: ["달걀", "파", "당근", "소금"],
        time: "10분",
        difficulty: "쉬움",
        emoji: "🍱",
        steps: ["달걀을 풀고 다진 채소를 섞는다.", "팬에 얇게 펴서 돌돌 만다."]
    },
    {
        id: 4,
        name: "초밥",
        cuisine: "japanese",
        ingredients: ["생선", "밥", "식초", "와사비"],
        time: "30분",
        difficulty: "어려움",
        emoji: "🍣",
        steps: ["밥에 단촛물을 섞는다.", "생선을 손질한다.", "와사비를 올리고 밥과 합친다."]
    },
    {
        id: 5,
        name: "오야코동",
        cuisine: "japanese",
        ingredients: ["닭고기", "달걀", "양파", "밥", "간장"],
        time: "20분",
        difficulty: "보통",
        emoji: "🥣",
        steps: ["팬에 간장 소스와 양파, 닭고기를 넣고 끓인다.", "달걀을 풀어 넣고 반숙으로 익힌 뒤 밥 위에 올린다."]
    },
    {
        id: 6,
        name: "마파두부",
        cuisine: "chinese",
        ingredients: ["두부", "돼지고기", "고추장", "전분", "파"],
        time: "20분",
        difficulty: "보통",
        emoji: "🥘",
        steps: ["두부를 깍둑썰기한다.", "고기와 파를 볶다가 양념을 넣는다.", "두부를 넣고 전분물로 농도를 맞춘다."]
    },
    {
        id: 7,
        name: "토마토 파스타",
        cuisine: "western",
        ingredients: ["파스타면", "토마토소스", "마늘", "양파", "베이컨"],
        time: "15분",
        difficulty: "쉬움",
        emoji: "🍝",
        steps: ["면을 삶는다.", "마늘과 양파를 볶다가 소스를 넣는다.", "면을 소스에 넣고 함께 볶는다."]
    },
    {
        id: 8,
        name: "스테이크",
        cuisine: "western",
        ingredients: ["소고기", "소금", "후추", "로즈마리", "버터"],
        time: "15분",
        difficulty: "보통",
        emoji: "🥩",
        steps: ["고기에 시즈닝을 한다.", "팬을 뜨겁게 달궈 고기를 굽는다.", "버터와 로즈마리로 향을 입힌다."]
    }
];

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
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${ing}
            <span class="remove" data-index="${index}">&times;</span>
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
        const matchCount = recipe.ingredients.filter(ing => 
            state.ingredients.some(userIng => ing.includes(userIng) || userIng.includes(ing))
        ).length;
        return { ...recipe, matchCount };
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
        <h2 style="font-size: 2rem; margin-bottom: 20px;">${recipe.emoji} ${recipe.name}</h2>
        <div style="margin-bottom: 20px;">
            <p><strong>주재료:</strong> ${recipe.ingredients.join(', ')}</p>
            <p><strong>소요 시간:</strong> ${recipe.time} | <strong>난이도:</strong> ${recipe.difficulty}</p>
        </div>
        <hr style="margin: 20px 0; opacity: 0.1;">
        <h3 style="margin-bottom: 15px;">요리 순서</h3>
        <ol style="padding-left: 20px;">
            ${recipe.steps.map(step => `<li style="margin-bottom: 10px;">${step}</li>`).join('')}
        </ol>
    `;
    recipeModal.showModal();
}

// Event Listeners
cuisineCards.forEach(card => {
    card.addEventListener('click', () => {
        state.selectedCuisine = card.dataset.cuisine;
        const labels = { korean: '한식', japanese: '일식', chinese: '중식', western: '양식' };
        selectedCuisineDisplay.textContent = labels[state.selectedCuisine];
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
