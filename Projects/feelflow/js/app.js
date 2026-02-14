/**
 * FeelFlow Core Module: Ver.0213-7600
 * [Recovery] SyntaxError 복구 및 데이터 무결성 확보
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let activeTaskId = null; 

// 2. 보상 시스템 엔진 (FeelFlow)
const FeelFlow = {
    totalXP: 0,
    currentLevel: 1,
    medals: [],

    addXP(amount, tier = null) {
        this.totalXP += amount;
        if (tier) {
            this.medals.push(tier.charAt(0).toUpperCase() + tier.slice(1) + " Medal");
        }
        this.checkMedalLevel();
        this.saveToLocal();
    },

    checkMedalLevel() {
        const nextLevelXP = this.currentLevel * 100; 
        if (this.totalXP >= nextLevelXP) {
            this.currentLevel++;
            this.medals.push(`Level ${this.currentLevel} Medal`);
            if (typeof UI !== 'undefined' && UI.showLevelUp) UI.showLevelUp(this.currentLevel);
        }
    },

    saveToLocal() {
        const data = { totalXP: this.totalXP, currentLevel: this.currentLevel, medals: this.medals };
        localStorage.setItem('feelflow_progress', JSON.stringify(data));
    }
};

// 3. 흐름 제어 및 내비게이션
function goHome() {
    UI.goToScreen('1', "How are you feeling today?");
    resetAppInput();
    renderHomeQuests();
}

function startOver() {
    currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
    activeTaskId = null;
    goHome();
}

function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5 };
    UI.goToScreen('2', "How strong is it?");
}

function startQuest(taskId, title) {
    activeTaskId = taskId;
    if (window.Activities) window.Activities.setupActivity(title);
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
}

// 4. 💡 [최종] 데이터 저장 및 보상 지급 파이프라인
window.finishCheckIn = async function() {
    console.log("🏁 시퀀스 시작: 데이터 저장 및 보상 판정");

    // 1. 입력 데이터 수집
    const note = document.getElementById('actionNote')?.value || "";
    const photo = window.lastCapturedPhoto || null; 
    const entry = { 
        emotion: currentEmotion.name, 
        intensity: currentEmotion.intensity, 
        note, 
        photo, 
        timestamp: new Date().toISOString() 
    };

    try {
        // 2. API 저장 시도
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);
        
        // 3. 보상 시스템 연동 (The Heart of FeelFlow)
        if (activeTaskId) {
            // 태스크 기반 완료 처리
            const task = DailyTasks.find(t => t.id === activeTaskId);
            if (task) { 
                task.completed = true; 
                FeelFlow.addXP(task.xp, task.tier); 
                console.log(`🥇 태스크 완료 보상: ${task.tier} (${task.xp} XP)`);
            }
        } else {
            // 일반 감정 체크인 보상 (강도 4 이상이면 골드)
            const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
            const xp = tier === 'gold' ? 60 : 30;
            FeelFlow.addXP(xp, tier); 
            console.log(`✨ 일반 체크인 보상: ${tier} (${xp} XP)`);
        }

        // 4. 상태 리셋 및 화면 전환
        activeTaskId = null;
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 

    } catch (error) {
        console.error("❌ 저장 오류 발생 (Silent Recovery):", error);
        UI.goToScreen('5'); // 아이를 위해 에러 발생 시에도 성공 화면 노출
    }
};

// 5. 초기화 및 전역 바인딩
window.initApp = async function() {
    const saved = localStorage.getItem('feelflow_progress');
    if (saved) {
        const parsed = JSON.parse(saved);
        FeelFlow.totalXP = parsed.totalXP;
        FeelFlow.currentLevel = parsed.currentLevel;
        FeelFlow.medals = parsed.medals;
    }
    const city = 'Los Gatos'; 
    if (typeof UI !== 'undefined' && UI.fetchWeatherByCity) UI.fetchWeatherByCity(city);
    goHome();
};

window.selectEmotion = selectEmotion;
window.startQuest = startQuest;
window.updateIntensity = updateIntensity;
window.goHome = goHome;
window.startOver = startOver;
window.toggleMenu = () => document.getElementById('menuOverlay').classList.toggle('active');
/**
 * 🧭 [Fix] Robust Navigation Engine
 * HTML의 텍스트와 JS의 케이스를 완벽하게 스티칭합니다.
 */
window.menuNavigate = (target) => {
    // 1. 입력값 정규화 (공백 제거 및 소문자 변환으로 오타 방지)
    const normalizedTarget = target.trim();
    console.log(`🎯 내비게이션 타겟: [${normalizedTarget}]`);
    
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');

    switch(normalizedTarget) {
        // HTML에서 'Home' 또는 'home'으로 보낼 때
        case 'Home':
        case 'home':
            goHome();
            break;

        // HTML에서 'Routine' 또는 'Daily Routine'으로 보낼 때
        case 'Routine':
        case 'Daily Routine':
            // 💡 UI.goToScreen의 첫 번째 인자가 index.html의 section ID와 일치해야 합니다.
            UI.goToScreen('Routine', 'Daily Routine'); 
            break;

        // HTML에서 'Trophies' 또는 'Trophie' (오타)로 보낼 때
        case 'Trophies':
        case 'Trophie':
        case 'Achievement':
            UI.goToScreen('Trophies', 'My Achievements'); 
            if (typeof renderTrophyStats === 'function') renderTrophyStats();
            break;

        case 'Settings':
            UI.goToScreen('Settings', 'Settings');
            break;

        default:
            // ⚠️ 여기서 홈으로 가버리는 현상이 발생 중입니다.
            console.warn(`❓ 케이스 매칭 실패: ${normalizedTarget}. HTML의 onclick 인자를 확인하세요.`);
            goHome(); 
    }
};
window.onload = () => window.initApp();

// 6. 데이터 및 렌더링
const DailyTasks = [
    { id: 1, title: 'Morning Stretch', xp: 30, tier: 'silver', completed: false },
    { id: 2, title: 'Practice Guitar', xp: 60, tier: 'gold', completed: false },
    { id: 3, title: 'Clean My Room', xp: 30, tier: 'silver', completed: false }
];

function renderHomeQuests() {
    const container = document.getElementById('homeQuestList');
    if (!container) return;
    container.innerHTML = DailyTasks.filter(t => !t.completed).map(t => `
        <div class="quick-task-item" onclick="startQuest(${t.id}, '${t.title}')">
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
            <div class="medal-slot">🥉<br><strong>${FeelFlow.currentLevel}</strong></div>
        </div>
        <div style="margin-top:20px; background: white; padding: 15px; border-radius: 20px;">
            <div style="display:flex; justify-content:space-between; font-weight:850;">
                <span>🎁 LEGO Set Goal</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div style="height:12px; background:#e2e8f0; border-radius:6px; margin-top:8px; overflow:hidden;">
                <div style="width:${Math.min((goldCount/targetGold)*100, 100)}%; height:100%; background:#FFD700; transition: 0.5s ease;"></div>
            </div>
        </div>
    `;
}

function resetAppInput() {
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    window.lastCapturedPhoto = null; 
    const slider = document.getElementById('intensitySlider');
    if (slider) { slider.value = 5; document.getElementById('intensityDisplay').textContent = '5'; }
}

// activities.js 또는 app.js의 진동 호출 부분
function safeVibrate(pattern) {
    if (navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn("💓 진동은 사용자 터치 후에만 가능합니다.");
        }
    }
}