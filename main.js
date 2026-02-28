import { RECIPES, DEFAULT_INGREDIENTS } from './recipes.js';
import { translations } from './translations.js';

// Firebase Config
const firebaseConfig = {
    projectId: "fridge-raider-bc871",
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const functions = firebase.functions();

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
    // 1. 모든 섹션에서 active 클래스 제거 (확실한 숨김)
    Object.values(sections).forEach(section => {
        section.classList.remove('active');
    });

    // 2. 목표 섹션에만 active 클래스 추가
    const targetSection = document.getElementById(stepId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 3. body class 업데이트 (헤더 제어용)
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
        const getAIRecommendations = functions.httpsCallable('getAIRecommendations');
        const [result] = await Promise.all([
            getAIRecommendations({
                ingredients: state.ingredients,
                cuisine: state.selectedCuisine,
                lang: state.lang
            }),
            new Promise(resolve => setTimeout(resolve, minimumDelay))
        ]);

        if (result.data && result.data.success) {
            renderRecipes(result.data.recipes);
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

    const recipeList = Array.isArray(recipes) ? recipes : (recipes.recipes || []);

    recipeList.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        const name = typeof recipe.name === 'string' ? recipe.name : (recipe.name?.[state.lang] || '');
        const time = typeof recipe.time === 'string' ? recipe.time : (recipe.time?.[state.lang] || '');
        const diff = typeof recipe.difficulty === 'string' ? recipe.difficulty : (recipe.difficulty?.[state.lang] || '');

        card.innerHTML = `
            <div class="recipe-img">${recipe.emoji || '🥘'}</div>
            <div class="recipe-info">
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">${name}</h3>
                <div class="recipe-meta" style="font-weight: 600;">
                    <span>⏱ ${time}</span>
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
    
    const recipeName = typeof recipe.name === 'string' ? recipe.name : (recipe.name?.[state.lang] || '');
    const recipeTime = typeof recipe.time === 'string' ? recipe.time : (recipe.time?.[state.lang] || '');
    const recipeDifficulty = typeof recipe.difficulty === 'string' ? recipe.difficulty : (recipe.difficulty?.[state.lang] || '');
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : (recipe.ingredients?.[state.lang] || []);
    const steps = Array.isArray(recipe.steps) ? recipe.steps : (recipe.steps?.[state.lang] || []);

    body.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="font-size: 2rem; margin-bottom: 10px; font-weight: 800;">${recipe.emoji || ''} ${recipeName}</h2>
            <div style="margin-bottom: 25px; color: #666; font-weight: 600;">
                <p>⏱ ${recipeTime} | 📊 ${recipeDifficulty}</p>
            </div>
            
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
