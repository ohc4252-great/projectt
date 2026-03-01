import { translations } from './translations.js';

let state = {
    lang: localStorage.getItem('lang') || 'ko',
    selectedCuisine: '',
    ingredients: [],
    currentStep: 'cuisine-section'
};

const sections = {
    cuisine: document.getElementById('cuisine-section'),
    ingredient: document.getElementById('ingredient-section'),
    recipe: document.getElementById('recipe-section')
};

function applyTranslations() {
    const t = translations[state.lang];
    if (!t) return;
    document.querySelectorAll('.app-name').forEach(el => el.textContent = t.appName);
    document.getElementById('tagline').textContent = t.tagline;
    document.querySelector('#cuisine-section .section-title').textContent = t.step1Title;
    document.querySelector('#ingredient-section .section-title').textContent = t.step2Title;
    document.querySelector('#recipe-section .section-title').textContent = t.step3Title;
    document.getElementById('selected-cuisine-prefix').textContent = t.selectedCuisine + ": ";
    const input = document.getElementById('ingredient-input');
    if (input) input.placeholder = t.placeholder;
    document.getElementById('add-ingredient-btn').textContent = t.addBtn;
    document.getElementById('find-recipe-btn').textContent = t.findBtn;
    document.getElementById('back-to-cuisine').textContent = t.backBtn;
    document.getElementById('restart-btn').textContent = t.restartBtn;
    document.getElementById('about-link').textContent = t.about;
    document.getElementById('privacy-link').textContent = t.privacy;
    document.getElementById('lang-toggle').textContent = state.lang === 'ko' ? 'English' : '한국어';
    document.querySelectorAll('.cuisine-card').forEach(card => {
        card.querySelector('.label').textContent = t.cuisines[card.dataset.cuisine];
    });
    if (state.selectedCuisine) {
        document.getElementById('selected-cuisine-display').textContent = t.cuisines[state.selectedCuisine];
    }
    updateIngredientTags();
}

function navigateTo(stepId) {
    Object.values(sections).forEach(s => s && s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
    window.scrollTo(0, 0);
}

function updateIngredientTags() {
    const container = document.getElementById('ingredient-tags');
    if (!container) return;
    container.innerHTML = '';
    state.ingredients.forEach((ing, i) => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `${ing}<span class="remove" data-index="${i}">&times;</span>`;
        container.appendChild(tag);
    });
}

async function findRecipes() {
    const t = translations[state.lang];
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = `<div class="loading-container"><div class="loader"></div><p>${t.loadingMsg}</p></div>`;
    navigateTo('recipe-section');

    try {
        const response = await fetch('https://us-central1-fridge-raider-bc871.cloudfunctions.net/getRecipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: state.ingredients, category: state.selectedCuisine, lang: state.lang })
        });
        const result = await response.json();
        const recipes = result.data?.recipes || [];
        renderRecipes(recipes);
    } catch (e) {
        grid.innerHTML = `<p style="color:red;padding:20px;">Error: ${e.message}</p>`;
    }
}

function renderRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');
    grid.innerHTML = '';
    const t = translations[state.lang];
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `<h3>${recipe.title}</h3><p>${recipe.reason}</p>`;
        card.onclick = () => showRecipeDetail(recipe);
        grid.appendChild(card);
    });
}

function showRecipeDetail(recipe) {
    const t = translations[state.lang];
    const modal = document.getElementById('recipe-modal');
    const body = document.getElementById('modal-body');

    // 🔥 초강력 추출 로직: 키 이름에 'ingredient'가 들어간 모든 데이터를 찾음
    let essential = recipe.essential_ingredients || [];
    let optional = recipe.optional_ingredients || [];
    
    // 만약 위 키가 없으면 객체 전체를 뒤져서 배열인 것 중 재료처럼 보이는 걸 찾음
    if (essential.length === 0) {
        for (let key in recipe) {
            if (key.toLowerCase().includes('ingredient') && Array.isArray(recipe[key])) {
                essential = recipe[key];
                break;
            }
        }
    }

    body.innerHTML = `
        <div style="padding:20px; color:#333;">
            <h2 style="margin-bottom:15px; font-weight:800; color:var(--primary-dark);">🥘 ${recipe.title}</h2>
            <div style="background:#f9f9f9; padding:15px; border-radius:12px; margin-bottom:20px;">
                <p><strong>${t.recommendReason}:</strong> ${recipe.reason}</p>
            </div>
            <div style="margin-bottom:20px;">
                <h4 style="color:#e67e22; margin-bottom:10px;">📍 ${t.essentialLabel || '필수재료'}</h4>
                <ul style="list-style:none; padding:0; display:flex; flex-wrap:wrap; gap:8px;">
                    ${essential.map(ing => `<li style="background:#fff4e6; color:#d35400; padding:5px 12px; border-radius:20px; font-size:0.9rem; font-weight:600;">${ing}</li>`).join('')}
                </ul>
            </div>
            ${optional.length > 0 ? `
            <div style="margin-bottom:20px;">
                <h4 style="color:#7f8c8d; margin-bottom:10px;">💡 ${t.optionalLabel || '있으면 좋은 재료'}</h4>
                <ul style="list-style:none; padding:0; display:flex; flex-wrap:wrap; gap:8px;">
                    ${optional.map(ing => `<li style="background:#f8f9fa; color:#7f8c8d; padding:5px 12px; border-radius:20px; font-size:0.9rem;">${ing}</li>`).join('')}
                </ul>
            </div>` : ''}
            <div style="background:#fff; border:1px solid #eee; padding:15px; border-radius:12px; margin-bottom:20px;">
                <h4 style="margin-bottom:10px;">👨‍🍳 ${t.stepsTitle}</h4>
                <p style="white-space:pre-line; line-height:1.6;">${recipe.instructions}</p>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <a href="${recipe.youtube_search_link}" target="_blank" style="background:#FF0000; color:#fff; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:bold;">유튜브 레시피 보기</a>
                <a href="https://www.google.com/search?q=${encodeURIComponent(recipe.google_search_keyword)}" target="_blank" style="background:#4285F4; color:#fff; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:bold;">구글에서 검색</a>
            </div>
        </div>
    `;
    modal.showModal();
}

function initEventListeners() {
    document.getElementById('lang-toggle').onclick = () => {
        state.lang = state.lang === 'ko' ? 'en' : 'ko';
        localStorage.setItem('lang', state.lang);
        applyTranslations();
    };
    document.querySelectorAll('.cuisine-card').forEach(card => {
        card.onclick = () => {
            state.selectedCuisine = card.dataset.cuisine;
            navigateTo('ingredient-section');
            applyTranslations();
        };
    });
    document.getElementById('add-ingredient-btn').onclick = () => {
        const input = document.getElementById('ingredient-input');
        if (input.value.trim()) {
            state.ingredients.push(input.value.trim());
            input.value = '';
            updateIngredientTags();
        }
    };
    document.getElementById('ingredient-input').onkeypress = (e) => { if (e.key === 'Enter') document.getElementById('add-ingredient-btn').click(); };
    document.getElementById('ingredient-tags').onclick = (e) => {
        if (e.target.classList.contains('remove')) {
            state.ingredients.splice(e.target.dataset.index, 1);
            updateIngredientTags();
        }
    };
    document.getElementById('find-recipe-btn').onclick = findRecipes;
    document.getElementById('back-to-cuisine').onclick = () => navigateTo('cuisine-section');
    document.getElementById('restart-btn').onclick = () => location.reload();
    document.getElementById('close-modal').onclick = () => document.getElementById('recipe-modal').close();
}

initEventListeners();
applyTranslations();
