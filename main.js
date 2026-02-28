import { RECIPES, DEFAULT_INGREDIENTS } from './recipes.js';

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
            ${isDefault ? '<small>(기본)</small>' : ''}
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
