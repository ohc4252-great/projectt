import { translations } from './translations.js';

const state = {
    lang: localStorage.getItem('lang') || 'ko'
};

function applyTranslations() {
    const t = translations[state.lang];
    const elements = document.querySelectorAll('[data-t]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-t');
        if (t[key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });

    // Handle App Name spans
    document.querySelectorAll('.app-name').forEach(el => el.textContent = t.appName);
    
    // Update Toggle Button
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.textContent = state.lang === 'ko' ? 'English' : '한국어';
}

const langToggle = document.getElementById('lang-toggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        state.lang = state.lang === 'ko' ? 'en' : 'ko';
        localStorage.setItem('lang', state.lang);
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            // For main page, we rely on main.js which has its own listener
            // But we can trigger a custom event or just reload
            location.reload();
        } else {
            applyTranslations();
        }
    });
}

applyTranslations();
