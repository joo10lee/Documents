/**
 * FeelFlow Core Module: Ver.0213-4000 (The Final Stitch)
 * [Fix] checkMedalLevel 참조 오류 해결 및 종료 시퀀스 통합
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let currentRoutine = 'morning'; 

// 2. 보상 시스템 엔진 (FeelFlow)
const FeelFlow = {
    totalXP: 0,
    currentLevel: 1,
    medals: [],

    addXP(amount) {
        this.totalXP += amount;
        console.log(`✨ XP 획득: +${amount} (Total: ${this.totalXP})`);
        // 💡 참조 무결성을 위해 'FeelFlow' 명시적 호출 (this 바인딩 에러 방지)
        FeelFlow.checkMedalLevel(); 
    },

    checkMedalLevel() {
        const nextLevelXP = this.currentLevel * 100; 
        if (this.totalXP >= nextLevelXP) {
            this.currentLevel++;
            this.medals.push(`Level ${this.currentLevel} Medal`);
            console.log(`🎊 레벨업! 현재 레벨: ${this.currentLevel}`);
            if (typeof UI !== 'undefined' && UI.showLevelUp) UI.showLevelUp(this.currentLevel);
        }
    },

    reset() {
        this.totalXP = 0;
        this.currentLevel = 1;
        this.medals = [];
    }
};

// 3. 감정 및 흐름 제어 함수
function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5 };
    
    const emojiDisplay = document.getElementById('selectedEmoji');
    const nameDisplay = document.getElementById('selectedName');
    if (emojiDisplay) emojiDisplay.textContent = emoji;
    if (nameDisplay) nameDisplay.textContent = name;
    
    UI.goToScreen('2', "How strong is it?");
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
}

function goToResult() {
    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryText = document.getElementById('summaryText');
    const summaryBar = document.getElementById('resultSummaryBar');

    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} at Level ${currentEmotion.intensity}`;
    
    if (summaryBar) {
        summaryBar.style.backgroundColor = `${currentEmotion.color}20`; // 20% 투명도
        summaryBar.style.borderColor = currentEmotion.color;
    }

    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name);
    }
    UI.goToScreen('4', "Personalized Strategies");
}

// 4. 💡 [통합] 데이터 저장 및 종료 로직
window.finishCheckIn = async function() {
    console.log("💾 데이터 저장 및 종료 시퀀스 시작");

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
        // API 저장 및 리소스 정리
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 
    } catch (error) {
        console.error("❌ 저장 실패:", error);
        UI.goToScreen('5'); // 실패하더라도 아이의 흐름은 끊지 않음
    }
};

// 5. 내비게이션 및 기타 유틸리티
function goHome() {
    UI.goToScreen('1', "How are you feeling today?");
    resetAppInput();
}

function resetAppInput() {
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    window.lastCapturedPhoto = null; 
    const slider = document.getElementById('intensitySlider');
    if (slider) { slider.value = 5; document.getElementById('intensityDisplay').textContent = '5'; }
}

// 6. 앱 초기화 (로스 가토스 기반 날씨 연동)
window.initApp = async function() {
    loadSettings();
    const city = document.getElementById('settingsCity')?.value || 'Los Gatos';
    UI.fetchWeatherByCity(city);
    goHome();
};

function loadSettings() {
    const saved = localStorage.getItem('feelflow_settings');
    if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('settingsName')) document.getElementById('settingsName').value = data.name || '';
        updateGreeting(data.name);
    }
}

function updateGreeting(name) {
    const el = document.getElementById('greeting');
    if (!el) return;
    const hr = new Date().getHours();
    const msg = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    el.textContent = name ? `${msg}, ${name}!` : `${msg}!`;
}

// 7. 전역 브릿지 연결
window.FeelFlow = FeelFlow;
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.goToResult = goToResult;
window.goHome = goHome;