import { translations } from './translations.js';

/**
 * 기본 재료 데이터 (분야별 5개씩 설정)
 */
const DEFAULT_INGREDIENTS = {
    ko: { 
        korean: ["고추장", "간장", "설탕", "다진 마늘", "고춧가루"], 
        japanese: ["미소 된장", "쯔유", "맛술", "간장", "가쓰오부시"], 
        chinese: ["굴소스", "식용유", "간장", "전분가루", "두반장"], 
        western: ["올리브유", "소금", "후추", "버터", "파마산 치즈"] 
    },
    en: { 
        korean: ["Gochujang", "Soy Sauce", "Sugar", "Minced Garlic", "Chili Powder"], 
        japanese: ["Miso", "Tsuyu", "Mirin", "Soy Sauce", "Katsuobushi"], 
        chinese: ["Oyster Sauce", "Cooking Oil", "Soy Sauce", "Starch", "Doubanjiang"], 
        western: ["Olive Oil", "Salt", "Black Pepper", "Butter", "Parmesan Cheese"] 
    }
};

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
    if (!t) return;
    
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
    Object.values(sections).forEach(section => {
        if (section) section.classList.remove('active');
    });
    const target = document.getElementById(stepId);
    if (target) target.classList.add('active');
    
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
    
    const defaults = (DEFAULT_INGREDIENTS[state.lang] && DEFAULT_INGREDIENTS[state.lang][state.selectedCuisine]) || [];

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
    
    if (state.ingredients.length >= 30) {
        alert(state.lang === 'ko' ? '재료는 최대 30개까지만 입력할 수 있습니다.' : 'You can add up to 30 ingredients.');
        return;
    }

    if (value && !state.ingredients.includes(value)) {
        state.ingredients.push(value);
        input.value = '';
        updateIngredientTags();
    }
}

async function findRecipes() {
    const t = translations[state.lang];
    const grid = document.getElementById('recipe-grid');
    
    // 로딩 화면 복구 및 비디오 자동 재생 설정
    grid.innerHTML = `
        <div class="loading-container">
            <div class="loading-video-wrapper">
                <video id="loading-video-player" class="loading-video" autoplay loop muted playsinline>
                    <source src="assets/images/logo_video 1.mp4" type="video/mp4">
                </video>
            </div>
            <div style="margin-bottom: 20px;"><div class="loader"></div></div>
            <p style="font-weight: 700; color: var(--primary-dark); font-size: 1.2rem;">${t.loadingMsg}</p>
        </div>
    `;
    navigateTo('recipe-section');

    // 비디오 강제 재생 (브라우저 정책 대응)
    const video = document.getElementById('loading-video-player');
    if (video) {
        video.play().catch(err => console.log("Video play failed:", err));
    }

    try {
        const response = await fetch('https://us-central1-fridge-raider-bc871.cloudfunctions.net/getRecipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ingredients: state.ingredients,
                category: state.selectedCuisine,
                lang: state.lang 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.data?.details || `Server Error (${response.status})`);
        }

        const result = await response.json();
        const recipes = result.data?.recipes || [];
        
        if (recipes.length > 0) {
            renderRecipes(recipes);
        } else {
            throw new Error(state.lang === 'ko' ? 'AI가 레시피를 생성하지 못했습니다. 재료를 더 추가해보세요.' : 'AI could not generate recipes. Try adding more ingredients.');
        }
    } catch (error) {
        console.error("AI Error:", error);
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <p style="font-weight: 600; color: #e74c3c; margin-bottom: 10px;">${t.noRecipe}</p>
                <small style="color: #999; display: block;">${error.message}</small>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">다시 시도</button>
            </div>
        `;
    }
}

function renderRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    const t = translations[state.lang];

    // 최대 3개까지만 출력 (백엔드에서 3개를 주지만 안전장치)
    recipes.slice(0, 3).forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        const title = recipe.title || recipe.name || '';
        const reason = recipe.reason || '';

        // 사용자가 만족했던 카드 구조 복구
        card.innerHTML = `
            <div class="recipe-img">🥘</div>
            <div class="recipe-info">
                <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 8px; color: var(--primary-dark);">${title}</h3>
                <p style="font-size: 0.95rem; color: #666; font-weight: 600; line-height: 1.4;">${reason}</p>
            </div>
        `;
        card.onclick = () => showRecipeDetail(recipe);
        grid.appendChild(card);
    });

    // 결과 하단 브랜드 로고 추가
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
    const reason = recipe.reason || '';
    // 백엔드 필드명에 맞춰 유연하게 처리
    const ingredients = recipe.essential_ingredients || recipe.ingredients_needed || recipe.ingredients || [];
    const optional = recipe.optional_ingredients || [];
    const instructions = recipe.instructions || '';
    const youtubeLink = recipe.youtube_search_link || '';
    const googleKeyword = recipe.google_search_keyword || '';

    body.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="font-size: 1.8rem; margin-bottom: 15px; font-weight: 800; color: var(--primary-dark);">🥘 ${title}</h2>
            <p style="background: var(--accent); padding: 15px 20px; border-radius: 16px; margin-bottom: 25px; font-weight: 600; color: oklch(0.3 0.1 60); line-height: 1.6;">
                <span style="display: block; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px; opacity: 0.7;">${t.recommendReason}</span>
                ${reason}
            </p>
            <div style="background: oklch(0.98 0.01 100); padding: 20px; border-radius: 20px; margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.05);">
                <h4 style="margin-bottom: 15px; font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">${t.ingredientsTitle}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${ingredients.map(ing => `<span style="padding: 6px 12px; border-radius: 50px; font-size: 0.9rem; background: white; color: #444; border: 1px solid rgba(0,0,0,0.05); font-weight: 600;">${ing}</span>`).join('')}
                </div>
            </div>
            ${optional.length > 0 ? `
            <div style="background: oklch(0.98 0.01 100); padding: 20px; border-radius: 20px; margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.05);">
                <h4 style="margin-bottom: 15px; font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">${t.optionalLabel || '있으면 좋은 재료'}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${optional.map(ing => `<span style="padding: 6px 12px; border-radius: 50px; font-size: 0.9rem; background: white; color: #777; border: 1px solid rgba(0,0,0,0.05); font-weight: 500;">${ing}</span>`).join('')}
                </div>
            </div>` : ''}
            <div style="background: white; padding: 20px; border-radius: 20px; margin-bottom: 30px; border: 1px solid rgba(0,0,0,0.05);">
                <h4 style="margin-bottom: 15px; font-size: 1.1rem; font-weight: 800; color: var(--primary-dark);">${t.stepsTitle}</h4>
                <div style="line-height: 1.7; color: #444; white-space: pre-line; font-weight: 500;">
                    ${instructions}
                </div>
            </div>
            <div class="search-actions" style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
                <a href="${youtubeLink}" target="_blank" class="youtube-btn" style="text-decoration: none;">
                    <span style="font-size: 1.2rem;">📺</span> ${t.youtubeBtn}
                </a>
                <a href="https://www.google.com/search?q=${encodeURIComponent(googleKeyword)}" target="_blank" class="google-btn" style="text-decoration: none;">
                    <span style="font-size: 1.2rem;">🔍</span> ${t.googleBtn}
                </a>
            </div>
        </div>
    `;
    modal.showModal();
}

// Event Listeners Initialization
function initEventListeners() {
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            state.lang = state.lang === 'ko' ? 'en' : 'ko';
            localStorage.setItem('lang', state.lang);
            state.ingredients = [];
            applyTranslations();
        });
    }

    document.querySelectorAll('.cuisine-card').forEach(card => {
        card.addEventListener('click', () => {
            state.selectedCuisine = card.dataset.cuisine;
            // 기본 재료 5개 자동 추가
            const defaults = (DEFAULT_INGREDIENTS[state.lang] && DEFAULT_INGREDIENTS[state.lang][state.selectedCuisine]) || [];
            state.ingredients = [...defaults];
            applyTranslations();
            navigateTo('ingredient-section');
        });
    });

    const addBtn = document.getElementById('add-ingredient-btn');
    if (addBtn) addBtn.addEventListener('click', addIngredient);

    const ingredientInput = document.getElementById('ingredient-input');
    if (ingredientInput) {
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addIngredient();
        });
    }

    const tagContainer = document.getElementById('ingredient-tags');
    if (tagContainer) {
        tagContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove')) {
                const index = e.target.dataset.index;
                state.ingredients.splice(index, 1);
                updateIngredientTags();
            }
        });
    }

    const findBtn = document.getElementById('find-recipe-btn');
    if (findBtn) findBtn.addEventListener('click', findRecipes);

    const backBtn = document.getElementById('back-to-cuisine');
    if (backBtn) backBtn.addEventListener('click', () => navigateTo('cuisine-section'));

    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            state.ingredients = [];
            state.selectedCuisine = '';
            updateIngredientTags();
            navigateTo('cuisine-section');
        });
    }

    const modal = document.getElementById('recipe-modal');
    const closeModal = document.getElementById('close-modal');
    if (closeModal) closeModal.addEventListener('click', () => modal.close());
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.close();
        });
    }
}

// Initialize
initEventListeners();
applyTranslations();
