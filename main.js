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

// Functions
function applyTranslations() {
    const t = translations[state.lang];
    
    document.querySelectorAll('.app-name').forEach(el => el.textContent = t.appName);
    document.getElementById('tagline').textContent = t.tagline;
    document.querySelector('#cuisine-section .section-title').textContent = t.step1Title;
    document.querySelector('#ingredient-section .section-title').textContent = t.step2Title;
    document.querySelector('#recipe-section .section-title').textContent = t.step3Title;
    document.getElementById('selected-cuisine-prefix').textContent = t.selectedCuisine + ": ";
    
    const ingredientInput = document.getElementById('ingredient-input');
    ingredientInput.placeholder = t.placeholder;
    
    document.getElementById('add-ingredient-btn').textContent = t.addBtn;
    document.getElementById('find-recipe-btn').textContent = t.findBtn;
    document.getElementById('back-to-cuisine').textContent = t.backBtn;
    document.getElementById('restart-btn').textContent = t.restartBtn;
    document.getElementById('about-link').textContent = t.about;
    document.getElementById('privacy-link').textContent = t.privacy;
    document.getElementById('lang-toggle').textContent = state.lang === 'ko' ? 'English' : '한국어';

    // Footer & Links translation
    const footerCopy = document.querySelector('[data-t="footerCopy"]');
    if (footerCopy) footerCopy.textContent = t.footerCopy;
    
    const footerAbout = document.querySelector('footer [data-t="about"]');
    if (footerAbout) footerAbout.textContent = t.about;
    
    const footerPrivacy = document.querySelector('footer [data-t="privacy"]');
    if (footerPrivacy) footerPrivacy.textContent = t.privacy;

    // Update Cuisine Labels
    document.querySelectorAll('.cuisine-card').forEach(card => {
        const key = card.dataset.cuisine;
        card.querySelector('.label').textContent = t.cuisines[key];
    });

    if (state.selectedCuisine) {
        document.getElementById('selected-cuisine-display').textContent = t.cuisines[state.selectedCuisine];
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
    const container = document.getElementById('ingredient-tags');
    container.innerHTML = '';
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
        container.appendChild(tag);
    });
}

function addIngredient() {
    const input = document.getElementById('ingredient-input');
    const value = input.value.trim();
    if (value && !state.ingredients.includes(value)) {
        state.ingredients.push(value);
        input.value = '';
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
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    const t = translations[state.lang];

    if (recipes.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">${t.noRecipe}</p>`;
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
        grid.appendChild(card);
    });
}

function showRecipeDetail(recipe) {
    const t = translations[state.lang];
    const modal = document.getElementById('recipe-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = `
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
    modal.showModal();
}

// Event Listeners Initialization
function initEventListeners() {
    document.getElementById('lang-toggle').addEventListener('click', () => {
        state.lang = state.lang === 'ko' ? 'en' : 'ko';
        localStorage.setItem('lang', state.lang);
        applyTranslations();
    });

    document.querySelectorAll('.cuisine-card').forEach(card => {
        card.addEventListener('click', () => {
            const cuisine = card.dataset.cuisine;
            state.selectedCuisine = cuisine;
            state.ingredients = [...(DEFAULT_INGREDIENTS[state.lang][cuisine] || [])];
            
            applyTranslations();
            navigateTo('ingredient-section');
        });
    });

    document.getElementById('add-ingredient-btn').addEventListener('click', addIngredient);
    document.getElementById('ingredient-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addIngredient();
    });

    document.getElementById('ingredient-tags').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove')) {
            const index = e.target.dataset.index;
            state.ingredients.splice(index, 1);
            updateIngredientTags();
        }
    });

    document.getElementById('find-recipe-btn').addEventListener('click', findRecipes);
    document.getElementById('back-to-cuisine').addEventListener('click', () => {
        navigateTo('cuisine-section');
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        state.ingredients = [];
        state.selectedCuisine = '';
        updateIngredientTags();
        navigateTo('cuisine-section');
    });

    const modal = document.getElementById('recipe-modal');
    document.getElementById('close-modal').addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });
}

// Initialize
initEventListeners();
applyTranslations();
