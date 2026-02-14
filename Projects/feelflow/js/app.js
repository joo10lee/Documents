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

// 💡 [추가] 햄버거 메뉴 및 리셋 기능을 위해 전역에 노출
window.startOver = startOver; 
window.toggleMenu = toggleMenu;
window.menuNavigate = menuNavigate;
window.renderTrophyStats = renderTrophyStats;

// 초기화 실행
window.onload = () => {
    if (typeof initApp === 'function') initApp();
};


// 태스크 데이터 구조 보강
const DailyTasks = [
    { id: 1, title: 'Morning Stretch', xp: 30, tier: 'silver', completed: false, category: 'morning' },
    { id: 2, title: 'Practice Guitar', xp: 60, tier: 'gold', completed: false, category: 'music' }, // 제이슨의 음악 관심사 반영
    { id: 3, title: 'Clean My Room', xp: 30, tier: 'silver', completed: true, category: 'routine' }
];

function renderHomeQuests() {
    const container = document.getElementById('homeQuestList');
    if (!container) return;

    // 💡 완료되지 않은(completed: false) 태스크만 필터링
    const activeTasks = DailyTasks.filter(t => !t.completed);

    container.innerHTML = activeTasks.map(t => `
        <div class="quick-task-item" onclick="Activities.setupActivity('${t.title}')">
            <span>${t.tier === 'gold' ? '🥇' : '🥈'}</span>
            <div style="margin-left:12px;">
                <div style="font-weight:850; font-size:1rem;">${t.title}</div>
                <div style="font-size:0.75rem; color:#7c3aed;">+${t.xp} XP</div>
            </div>
        </div>
    `).join('');
}

// goToHistory나 goToTracker처럼 트로피 화면으로 갈 때 아래를 호출해야 합니다.
function goToTrophies() {
    UI.goToScreen('Trophies', 'My Achievement');
    renderTrophyStats(); // 💡 이 시점에 렌더링 함수를 깨워야 데이터가 반영됩니다.
}

function renderTrophyStats() {
    const goldCount = FeelFlow.medals.filter(m => m.includes('Gold')).length;
    const silverCount = FeelFlow.medals.filter(m => m.includes('Silver')).length;
    const targetGold = 30; // 부모가 설정한 목표치

    document.getElementById('trophyContent').innerHTML = `
        <div class="trophy-card">
            <h3>Today's Potential</h3>
            <p>You can still win 🥇 x2 and 🥈 x3 today!</p>
        </div>
        
        <div class="medal-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            <div class="medal-slot">🥇<br><strong>${goldCount}</strong></div>
            <div class="medal-slot">🥈<br><strong>${silverCount}</strong></div>
            <div class="medal-slot">🥉<br><strong>0</strong></div>
        </div>

        <div class="goal-tracker" style="margin-top:20px;">
            <div style="display:flex; justify-content:space-between; font-weight:850;">
                <span>Goal: LEGO Set 🎁</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div class="progress-bar-bg" style="height:12px; background:#e2e8f0; border-radius:6px; margin-top:8px;">
                <div style="width:${(goldCount/targetGold)*100}%; height:100%; background:#FFD700; border-radius:6px;"></div>
            </div>
        </div>
    `;
}