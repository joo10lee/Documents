/**
 * FeelFlow Core Module: Ver.0213-7500
 * [Upgrade] 퀘스트 완료 상태 연동 및 데이터 영속성(LocalStorage) 기초 설계
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let activeTaskId = null; // 💡 현재 수행 중인 태스크 ID 추적

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
        this.saveToLocal(); // 💡 상태 변화 시 저장
    },

    checkMedalLevel() {
        const nextLevelXP = this.currentLevel * 100; 
        if (this.totalXP >= nextLevelXP) {
            this.currentLevel++;
            this.medals.push(`Level ${this.currentLevel} Medal`);
            if (typeof UI !== 'undefined' && UI.showLevelUp) UI.showLevelUp(this.currentLevel);
        }
    },

    // 💡 데이터 영속성을 위한 로컬 저장
    saveToLocal() {
        const data = { totalXP: this.totalXP, currentLevel: this.currentLevel, medals: this.medals };
        localStorage.setItem('feelflow_progress', JSON.stringify(data));
    }
};

// 3. 흐름 제어 및 퀘스트 시작
function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5 };
    UI.goToScreen('2', "How strong is it?");
}

// 💡 퀘스트 목록에서 태스크를 클릭했을 때 실행
function startQuest(taskId, title) {
    activeTaskId = taskId; // 어떤 퀘스트를 하는지 기록
    if (window.Activities) {
        window.Activities.setupActivity(title);
    }
}

// 4. 통합 데이터 저장 및 퀘스트 완료 처리
window.finishCheckIn = async function() {
    console.log("💾 데이터 저장 및 퀘스트 완료 처리 시작");
    const note = document.getElementById('actionNote')?.value || "";
    const photo = window.lastCapturedPhoto || null; 

    const entry = {
        emotion: currentEmotion.name,
        intensity: currentEmotion.intensity,
        note: note,
        photo: photo,
        taskId: activeTaskId, // 💡 완료된 태스크 ID 포함
        timestamp: new Date().toISOString()
    };

    try {
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);
        
        // 1. 태스크 목록에서 완료 처리
        if (activeTaskId) {
            const task = DailyTasks.find(t => t.id === activeTaskId);
            if (task) {
                task.completed = true;
                // 태스크 티어에 따른 XP/메달 지급
                FeelFlow.addXP(task.xp, task.tier);
            }
        } else {
            // 일반 체크인인 경우 강도 기반 지급
            const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
            FeelFlow.addXP(tier === 'gold' ? 60 : 30, tier); 
        }

        activeTaskId = null; // 리셋
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 
        
    } catch (error) {
        console.error("❌ 저장 오류:", error);
        UI.goToScreen('5');
    }
};

// 5. 리셋 및 초기화
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

function resetAppInput() {
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    window.lastCapturedPhoto = null; 
    const slider = document.getElementById('intensitySlider');
    if (slider) { slider.value = 5; document.getElementById('intensityDisplay').textContent = '5'; }
}

// 6. 🍔 메뉴 내비게이션
function menuNavigate(target) {
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');

    if (target === 'Home') goHome();
    else if (target === 'Trophies') {
        UI.goToScreen('Trophies', 'My Achievement');
        renderTrophyStats();
    }
}

// 7. 데이터 및 렌더링 (제이슨의 관심사 반영)
const DailyTasks = [
    { id: 1, title: 'Morning Stretch', xp: 30, tier: 'silver', completed: false },
    { id: 2, title: 'Practice Guitar', xp: 60, tier: 'gold', completed: false },
    { id: 3, title: 'Clean My Room', xp: 30, tier: 'silver', completed: false }
];

function renderHomeQuests() {
    const container = document.getElementById('homeQuestList');
    if (!container) return;
    
    // 💡 완료되지 않은 것만 필터링
    const activeTasks = DailyTasks.filter(t => !t.completed);
    
    container.innerHTML = activeTasks.map(t => `
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
    const targetGold = 30; // 🎁 Lego Set Goal
    const content = document.getElementById('trophyContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="medal-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            <div class="medal-slot">🥇<br><strong>${goldCount}</strong></div>
            <div class="medal-slot">🥈<br><strong>${FeelFlow.medals.filter(m => m.includes('Silver')).length}</strong></div>
            <div class="medal-slot">🥉<br><strong>${FeelFlow.currentLevel}</strong></div>
        </div>
        <div class="goal-tracker" style="margin-top:20px; background: white; padding: 15px; border-radius: 20px;">
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

// 8. 전역 바인딩 (ReferenceError 방지)
window.initApp = async function() {
    // 로컬 저장소에서 데이터 복구
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
window.goToResult = goToResult;
window.goHome = goHome;
window.startOver = startOver;
window.toggleMenu = () => document.getElementById('menuOverlay').classList.toggle('active');
window.menuNavigate = menuNavigate;
window.onload = () => window.initApp();