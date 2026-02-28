import { RECIPES, DEFAULT_INGREDIENTS } from './recipes.js';
import { translations } from './translations.js';

// State Management
let state = {
    lang: localStorage.getItem('lang') || 'ko',
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

const appNameElements = document.querySelectorAll('.app-name');
const taglineElement = document.getElementById('tagline');
const step1Title = document.querySelector('#cuisine-section .section-title');
const step2Title = document.querySelector('#ingredient-section .section-title');
const step3Title = document.querySelector('#recipe-section .section-title');
const selectedCuisinePrefix = document.getElementById('selected-cuisine-prefix');
const selectedCuisineDisplay = document.getElementById('selected-cuisine-display');
const ingredientInput = document.getElementById('ingredient-input');
const addIngredientBtn = document.getElementById('add-ingredient-btn');
const ingredientTagsContainer = document.getElementById('ingredient-tags');
const findRecipeBtn = document.getElementById('find-recipe-btn');
const backToCuisineBtn = document.getElementById('back-to-cuisine');
const recipeGrid = document.getElementById('recipe-grid');
const restartBtn = document.getElementById('restart-btn');
const recipeModal = document.getElementById('recipe-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const langToggle = document.getElementById('lang-toggle');
const aboutLink = document.getElementById('about-link');
const privacyLink = document.getElementById('privacy-link');

// Functions
function applyTranslations() {
    const t = translations[state.lang];
    
    appNameElements.forEach(el => el.textContent = t.appName);
    taglineElement.textContent = t.tagline;
    step1Title.textContent = t.step1Title;
    step2Title.textContent = t.step2Title;
    step3Title.textContent = t.step3Title;
    selectedCuisinePrefix.textContent = t.selectedCuisine + ": ";
    ingredientInput.placeholder = t.placeholder;
    addIngredientBtn.textContent = t.addBtn;
    findRecipeBtn.textContent = t.findBtn;
    backToCuisineBtn.textContent = t.backBtn;
    restartBtn.textContent = t.restartBtn;
    aboutLink.textContent = t.about;
    privacyLink.textContent = t.privacy;
    langToggle.textContent = state.lang === 'ko' ? 'English' : '한국어';

    // Update Cuisine Labels
    document.querySelectorAll('.cuisine-card').forEach(card => {
        const key = card.dataset.cuisine;
        card.querySelector('.label').textContent = t.cuisines[key];
    });

    if (state.selectedCuisine) {
        selectedCuisineDisplay.textContent = t.cuisines[state.selectedCuisine];
    }

    updateIngredientTags();
}

function navigateTo(stepId) {
    Object.values(sections).forEach(section => section.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
    state.currentStep = stepId;
    window.scrollTo(0, 0);
}

function updateIngredientTags() {
    ingredientTagsContainer.innerHTML = '';
    const t = translations[state.lang];
    const defaults = DEFAULT_INGREDIENTS[state.lang][state.selectedCuisine] || [];

    state.ingredients.forEach((ing, index) => {
        const isDefault = defaults.some(d => ing.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(ing.toLowerCase()));
        const tag = document.createElement('div');
        tag.className = `tag ${isDefault ? 'default-tag' : ''}`;
        tag.innerHTML = `
            ${ing}
            ${isDefault ? `<small>${t.defaultLabel}</small>` : ''}
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
    const t = translations[state.lang];
    const filtered = RECIPES.filter(recipe => recipe.cuisine === state.selectedCuisine);
    
    const scored = filtered.map(recipe => {
        const recipeIngs = recipe.ingredients[state.lang];
        const matchedItems = recipeIngs.filter(recipeIng => 
            state.ingredients.some(userIng => recipeIng.toLowerCase().includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(recipeIng.toLowerCase()))
        );
        const matchCount = matchedItems.length;
        return { ...recipe, matchCount, matchedItems };
    }).sort((a, b) => b.matchCount - a.matchCount);

    renderRecipes(scored);
    navigateTo('recipe-section');
}

function renderRecipes(recipes) {
    recipeGrid.innerHTML = '';
    const t = translations[state.lang];

    if (recipes.length === 0) {
        recipeGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">${t.noRecipe}</p>`;
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-img">${recipe.emoji}</div>
            <div class="recipe-info">
                <h3>${recipe.name[state.lang]}</h3>
                <div class="recipe-meta">
                    <span>⏱ ${recipe.time[state.lang]}</span>
                    <span>📊 ${recipe.difficulty[state.lang]}</span>
                </div>
                ${recipe.matchCount > 0 ? `<div class="match-badge">${recipe.matchCount}${t.matchCount}</div>` : ''}
            </div>
        `;
        card.onclick = () => showRecipeDetail(recipe);
        recipeGrid.appendChild(card);
    });
}

function showRecipeDetail(recipe) {
    const t = translations[state.lang];
    modalBody.innerHTML = `
        <h2 style="font-size: 2rem; margin-bottom: 10px;">${recipe.emoji} ${recipe.name[state.lang]}</h2>
        <div style="margin-bottom: 20px; color: #666;">
            <p>⏱ ${recipe.time[state.lang]} | 📊 ${recipe.difficulty[state.lang]}</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">${t.ingredientsTitle}</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${recipe.ingredients[state.lang].map(ing => {
                    const isMatched = state.ingredients.some(userIng => ing.toLowerCase().includes(userIng.toLowerCase()) || userIng.toLowerCase().includes(ing.toLowerCase()));
                    return `<span style="padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; background: ${isMatched ? 'var(--primary)' : '#eee'}; color: ${isMatched ? 'white' : '#666'}">${ing}</span>`;
                }).join('')}
            </div>
        </div>

        <h3 style="margin-bottom: 15px; border-bottom: 2px solid var(--primary); display: inline-block;">${t.stepsTitle}</h3>
        <ol style="padding-left: 20px;">
            ${recipe.steps[state.lang].map(step => `<li style="margin-bottom: 12px; line-height: 1.5;">${step}</li>`).join('')}
        </ol>
    `;
    recipeModal.showModal();
}

// Event Listeners
langToggle.addEventListener('click', () => {
    state.lang = state.lang === 'ko' ? 'en' : 'ko';
    localStorage.setItem('lang', state.lang);
    applyTranslations();
});

cuisineCards.forEach(card => {
    card.addEventListener('click', () => {
        const cuisine = card.dataset.cuisine;
        state.selectedCuisine = cuisine;
        state.ingredients = [...(DEFAULT_INGREDIENTS[state.lang][cuisine] || [])];
        
        applyTranslations();
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

backToCuisineBtn.addEventListener('click', () => {
    navigateTo('cuisine-section');
});

restartBtn.addEventListener('click', () => {
    state.ingredients = [];
    state.selectedCuisine = '';
    updateIngredientTags();
    navigateTo('cuisine-section');
});

closeModalBtn.addEventListener('click', () => {
    recipeModal.close();
});

recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) recipeModal.close();
});

// Init
applyTranslations();
