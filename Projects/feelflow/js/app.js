/**
 * FeelFlow Core Module: Ver.0213-6400
 * [Final] 중복 로직 통합 및 전역 바인딩 무결성 확보
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };

// 2. 보상 시스템 엔진 (FeelFlow)
const FeelFlow = {
    totalXP: 0,
    currentLevel: 1,
    medals: [],

    addXP(amount, tier = null) {
        this.totalXP += amount;
        if (tier) {
            // 'gold' -> 'Gold Medal' 형식 저장 (트로피 화면 includes 필터링 대응)
            this.medals.push(tier.charAt(0).toUpperCase() + tier.slice(1) + " Medal");
        }
        this.checkMedalLevel(); 
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

// 3. 흐름 제어 함수
function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5 };
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
    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} at Level ${currentEmotion.intensity}`;
    
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name);
    }
    UI.goToScreen('4', "Strategies");
}

// 4. 통합 데이터 저장 및 보상 지급
window.finishCheckIn = async function() {
    console.log("💾 데이터 저장 시퀀스 시작");
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
        
        // 보상 티어 결정: 강도 4 이상이면 Gold
        const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
        FeelFlow.addXP(tier === 'gold' ? 60 : 30, tier); 
        
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 
    } catch (error) {
        console.error("❌ 저장 오류:", error);
        UI.goToScreen('5');
    }
};

// 5. 리셋 및 내비게이션
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

// 6. 🍔 메뉴 및 트로피 시스템
function toggleMenu() {
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.toggle('active');
}

function menuNavigate(target) {
    toggleMenu();
    if (target === 'Home') goHome();
    else if (target === 'Trophies') {
        UI.goToScreen('Trophies', 'Achievement');
        renderTrophyStats();
    }
}

// 7. 앱 초기화 및 전역 바인딩
window.initApp = async function() {
    const city = 'Los Gatos'; 
    if (typeof UI !== 'undefined' && UI.fetchWeatherByCity) UI.fetchWeatherByCity(city);
    goHome();
};

// 모든 함수 명시적 바인딩
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.goToResult = goToResult;
window.goHome = goHome;
window.startOver = startOver;
window.toggleMenu = toggleMenu;
window.menuNavigate = menuNavigate;
window.renderTrophyStats = renderTrophyStats;

window.onload = () => { window.initApp(); };

// 8. 데이터 관리
const DailyTasks = [
    { id: 1, title: 'Morning Stretch', xp: 30, tier: 'silver', completed: false },
    { id: 2, title: 'Practice Guitar', xp: 60, tier: 'gold', completed: false }
];

function renderHomeQuests() {
    const container = document.getElementById('homeQuestList');
    if (!container) return;
    const activeTasks = DailyTasks.filter(t => !t.completed);
    container.innerHTML = activeTasks.map(t => `
        <div class="quick-task-item" onclick="Activities.setupActivity('${t.title}')">
            <span>${t.tier === 'gold' ? '🥇' : '🥈'}</span>
            <div style="margin-left:12px; text-align:left;">
                <div style="font-weight:850;">${t.title}</div>
                <div style="font-size:0.75rem; color:#7c3aed;">+${t.xp} XP</div>
            </div>
        </div>
    `).join('');
}

function renderTrophyStats() {
    const goldCount = FeelFlow.medals.filter(m => m.includes('Gold')).length;
    const targetGold = 30;
    const content = document.getElementById('trophyContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="medal-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            <div class="medal-slot">🥇<br><strong>${goldCount}</strong></div>
            <div class="medal-slot">🥈<br><strong>${FeelFlow.medals.filter(m => m.includes('Silver')).length}</strong></div>
            <div class="medal-slot">🥉<br><strong>0</strong></div>
        </div>
        <div class="goal-tracker" style="margin-top:20px;">
            <div style="display:flex; justify-content:space-between; font-weight:850;">
                <span>Goal: LEGO Set 🎁</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div style="height:12px; background:#e2e8f0; border-radius:6px; margin-top:8px; overflow:hidden;">
                <div style="width:${(goldCount/targetGold)*100}%; height:100%; background:#FFD700;"></div>
            </div>
        </div>
    `;
}