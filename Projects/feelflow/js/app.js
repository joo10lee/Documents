/**
 * FeelFlow Core Module: Ver.0213-6200
 * [Fix] startOver 참조 오류 해결 및 finishCheckIn 로직 통합
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let currentRoutine = 'morning'; 

// 2. 보상 시스템 엔진 (FeelFlow)
const FeelFlow = {
    totalXP: 0,
    currentLevel: 1,
    medals: [],

    addXP(amount, tier = null) {
        this.totalXP += amount;
        if (tier) {
            // 'gold' -> 'Gold Medal' 형식으로 저장하여 트로피 화면과 연동
            this.medals.push(tier.charAt(0).toUpperCase() + tier.slice(1) + " Medal");
        }
        FeelFlow.checkMedalLevel(); 
    },

    checkMedalLevel() {
        const nextLevelXP = this.currentLevel * 100; 
        if (this.totalXP >= nextLevelXP) {
            this.currentLevel++;
            this.medals.push(`Level ${this.currentLevel} Medal`);
            if (typeof UI !== 'undefined' && UI.showLevelUp) UI.showLevelUp(this.currentLevel);
        }
    }
};

// 3. 감정 및 흐름 제어 함수
function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5 };
    UI.goToScreen('2', "How strong is it?");
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    document.getElementById('intensityDisplay').textContent = val;
}

function goToResult() {
    // Result Summary Bar 업데이트 로직
    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryText = document.getElementById('summaryText');
    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} at Level ${currentEmotion.intensity}`;
    
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name);
    }
    UI.goToScreen('4', "Strategies");
}

// 4. 💡 통합 데이터 저장 및 보상 지급 로직
window.finishCheckIn = async function() {
    console.log("💾 데이터 저장 및 보상 시퀀스 시작");
    const note = document.getElementById('actionNote')?.value || "";
    const photo = window.lastCapturedPhoto || null; 

    const entry = {
        emotion: currentEmotion.name,
        emoji: currentEmotion.emoji,
        intensity: currentEmotion.intensity,
        note: note,
        photo: photo,
        timestamp: new Date().toISOString()
    };

    try {
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);
        
        // 🥇 보상 지급: 강도 4 이상이면 Gold, 아니면 Silver
        const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
        FeelFlow.addXP(tier === 'gold' ? 60 : 30, tier); 
        
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 
    } catch (error) {
        console.error("❌ 저장 오류:", error);
        UI.goToScreen('5');
    }
};

// 5. 내비게이션 및 리셋 (Check In Again용)
function goHome() {
    UI.goToScreen('1', "How are you feeling today?");
    resetAppInput();
    if (typeof renderHomeQuests === 'function') renderHomeQuests();
}

function startOver() {
    currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
    goHome();
}

function resetAppInput() {
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    window.lastCapturedPhoto = null; 
    const slider = document.getElementById('intensitySlider');
    if (slider) { slider.value = 5; document.getElementById('intensityDisplay').textContent = '5'; }
}

// 6. 🍔 메뉴 및 트로피 시스템 연동
function toggleMenu() {
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.toggle('active');
}

function menuNavigate(target) {
    toggleMenu();
    if (target === 'Home') goHome();
    else if (target === 'Trophies') {
        UI.goToScreen('Trophies', 'Achievement');
        if (typeof renderTrophyStats === 'function') renderTrophyStats();
    }
}

// 7. 앱 초기화 및 전역 바인딩
window.initApp = async function() {
    const city = 'Los Gatos'; // 기본 지역 설정
    if (typeof UI !== 'undefined' && UI.fetchWeatherByCity) UI.fetchWeatherByCity(city);
    goHome();
};

// 💡 모든 함수를 전역 window 객체에 명시적으로 연결하여 ReferenceError 차단
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.goToResult = goToResult;
window.goHome = goHome;
window.startOver = startOver;
window.toggleMenu = toggleMenu;
window.menuNavigate = menuNavigate;

window.onload = () => { window.initApp(); };

// 8. 퀘스트 및 트로피 데이터 (기존 로직 유지)
const DailyTasks = [
    { id: 1, title: 'Morning Stretch', xp: 30, tier: 'silver', completed: false },
    { id: 2, title: 'Practice Guitar', xp: 60, tier: 'gold', completed: false } // 제이슨의 관심사 반영
];

function renderHomeQuests() { /* ... 기존 renderHomeQuests 코드 ... */ }
function renderTrophyStats() { /* ... 기존 renderTrophyStats 코드 ... */ }