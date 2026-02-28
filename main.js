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
    if (ingredientInput) ingredientInput.placeholder = t.placeholder;
    
    document.getElementById('add-ingredient-btn').textContent = t.addBtn;
    document.getElementById('find-recipe-btn').textContent = t.findBtn;
    document.getElementById('back-to-cuisine').textContent = t.backBtn;
    document.getElementById('restart-btn').textContent = t.restartBtn;
    document.getElementById('about-link').textContent = t.about;
    document.getElementById('privacy-link').textContent = t.privacy;
    document.getElementById('lang-toggle').textContent = state.lang === 'ko' ? 'English' : '한국어';

    const footerCopy = document.querySelector('[data-t="footerCopy"]');
    if (footerCopy) footerCopy.textContent = t.footerCopy;
    
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
    
    document.body.className = '';
    if (stepId === 'ingredient-section') document.body.classList.add('step-2');
    if (stepId === 'recipe-section') document.body.classList.add('step-3');
    
    state.currentStep = stepId;
    window.scrollTo(0, 0);
}

function updateIngredientTags() {
    const container = document.getElementById('ingredient-tags');
    if (!container) return;
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
            <span class="remove" data-index="${index}" style="cursor:pointer; margin-left:5px;">&times;</span>
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

async function findRecipes() {
    const t = translations[state.lang];
    const grid = document.getElementById('recipe-grid');
    
    grid.innerHTML = `
        <div class="loading-container">
            <div class="loading-video-wrapper">
                <video class="loading-video" autoplay loop muted playsinline>
                    <source src="assets/images/logo_video 1.mp4" type="video/mp4">
                </video>
            </div>
            <div style="margin-bottom: 20px;"><div class="loader"></div></div>
            <p style="font-weight: 700; color: var(--primary-dark); font-size: 1.2rem;">AI가 최적의 레시피를 찾고 있습니다...</p>
        </div>
    `;
    navigateTo('recipe-section');

    const minimumDelay = 10000;

    try {
        // Backend HTTP Trigger URL (Updated to actual deployed URL)
        const response = await fetch('https://getairecommendations-us-central1-fridge-raider-bc871.cloudfunctions.net/getAIRecommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ingredients: state.ingredients,
                category: state.selectedCuisine,
                lang: state.lang
            })
        });

        const result = await response.json();
        
        // Ensure minimum 10s delay
        const elapsedTime = Date.now() - Date.now(); // Simulation, real delay handled by await
        await new Promise(resolve => setTimeout(resolve, Math.max(0, minimumDelay - elapsedTime)));

        if (result.success && result.recipes) {
            renderRecipes(result.recipes);
        } else {
            throw new Error('AI Response Error');
        }
    } catch (error) {
        console.error("AI Error:", error);
        const filtered = RECIPES.filter(recipe => recipe.cuisine === state.selectedCuisine);
        renderRecipes(filtered);
    }
}

function renderRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    const t = translations[state.lang];

    if (!recipes || recipes.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; font-weight: 600;">${t.noRecipe}</p>`;
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        // Backend uses 'title' and 'time', match accordingly
        const title = recipe.title || recipe.name || '';
        const time = recipe.time || '';
        const diff = recipe.difficulty || (state.lang === 'ko' ? '보통' : 'Medium');

        card.innerHTML = `
            <div class="recipe-img">${recipe.emoji || '🥘'}</div>
            <div class="recipe-info">
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">${title}</h3>
                <div class="recipe-meta" style="font-weight: 600;">
                    <span>⏱ ${time}${state.lang === 'ko' && !time.includes('분') ? '분' : ''}</span>
                    <span>📊 ${diff}</span>
                </div>
            </div>
        `;
        card.onclick = () => showRecipeDetail(recipe);
        grid.appendChild(card);
    });

    const brandLogo = document.createElement('img');
    brandLogo.src = 'assets/images/logo3.png';
    brandLogo.className = 'result-direction-logo';
    grid.appendChild(brandLogo);
}

function showRecipeDetail(recipe) {
    const t = translations[state.lang];
    const modal = document.getElementById('recipe-modal');
    const body = document.getElementById('modal-body');
    
    const title = recipe.title || recipe.name || '';
    const time = recipe.time || '';
    const diff = recipe.difficulty || (state.lang === 'ko' ? '보통' : 'Medium');
    const ingredients = recipe.ingredients_needed || recipe.ingredients || [];
    const steps = recipe.instructions || recipe.steps || [];
    const note = recipe.missing_ingredients_note || '';

    body.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="font-size: 2rem; margin-bottom: 10px; font-weight: 800;">${recipe.emoji || '🥘'} ${title}</h2>
            <div style="margin-bottom: 25px; color: #666; font-weight: 600;">
                <p>⏱ ${time}${state.lang === 'ko' && !time.includes('분') ? '분' : ''} | 📊 ${diff}</p>
            </div>
            
            ${note ? `<p style="background: var(--accent); padding: 12px 20px; border-radius: 12px; margin-bottom: 20px; font-weight: 600; color: oklch(0.4 0.1 60);">💡 ${note}</p>` : ''}

            <div style="background: oklch(0.98 0.01 100); padding: 20px; border-radius: 20px; margin-bottom: 25px; border: 1px solid rgba(0,0,0,0.05);">
                <h4 style="margin-bottom: 15px; font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">${t.ingredientsTitle}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${ingredients.map(ing => `<span style="padding: 6px 12px; border-radius: 50px; font-size: 0.9rem; background: white; color: #444; border: 1px solid rgba(0,0,0,0.05); font-weight: 600;">${ing}</span>`).join('')}
                </div>
            </div>

            <h3 style="margin-bottom: 15px; border-bottom: 3px solid var(--primary); display: inline-block; font-weight: 800;">${t.stepsTitle}</h3>
            <ol style="padding-left: 20px;">
                ${steps.map(step => `<li style="margin-bottom: 12px; line-height: 1.6; font-size: 1rem; color: #333; padding-left: 5px;">${step}</li>`).join('')}
            </ol>
        </div>
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
            state.selectedCuisine = card.dataset.cuisine;
            state.ingredients = [...(DEFAULT_INGREDIENTS[state.lang][state.selectedCuisine] || [])];
            applyTranslations();
            navigateTo('ingredient-section');
        });
    });

    document.getElementById('add-ingredient-btn').addEventListener('click', addIngredient);
    const ingredientInput = document.getElementById('ingredient-input');
    if (ingredientInput) {
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addIngredient();
        });
    }

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
