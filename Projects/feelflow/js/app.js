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
    console.trace("🏠 goHome 호출됨 (누가 호출했는지 확인용)"); // 💡 호출 경로 추적
    UI.goToScreen('1', "How are you feeling today?");
    resetAppInput();
    if (typeof renderHomeQuests === 'function') renderHomeQuests();
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
// app.js의 initApp 부분에 추가
window.initApp = async function() {
    console.log("🚀 FeelFlow 인프라 초기화 중...");
    
    // 로컬 데이터 복구 로직 (생략 가능)
    // ...

    const city = 'Los Gatos'; 
    if (typeof UI !== 'undefined' && UI.fetchWeatherByCity) UI.fetchWeatherByCity(city);
    
    // 💡 초기 로드 시에만 홈으로 이동
    goHome();
};

window.selectEmotion = selectEmotion;
window.startQuest = startQuest;
window.goToResult = goToResult;
window.updateIntensity = updateIntensity;
window.goHome = goHome;
window.startOver = startOver;
window.toggleMenu = () => document.getElementById('menuOverlay').classList.toggle('active');
/*
 */
window.menuNavigate = (target, event) => {
    // 💡 1. 브라우저의 기본 동작(페이지 상단 이동 등) 차단
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const normalizedTarget = target.trim();
    console.log(`🎯 내비게이션 시도: [${normalizedTarget}]`);
    
    // 메뉴 닫기 로직
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');

    const screenMap = {
        'Home': '1',
        'Routine': '3',
        'Daily Routine': '3',
        'Trophies': '4',
        'Settings': '5'
    };

    const screenIndex = screenMap[normalizedTarget];

    if (screenIndex) {
        // 💡 2. 화면 전환 실행
        UI.goToScreen(screenIndex, normalizedTarget);
        
        if (normalizedTarget === 'Trophies' && typeof renderTrophyStats === 'function') {
            setTimeout(renderTrophyStats, 50);
        }
    } else {
        // 매핑 실패 시에만 홈으로 가도록 철저히 격리
        console.warn(`❓ 매핑 실패: ${normalizedTarget}`);
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

function goToResult() {
    console.log("🎯 결과 화면으로 이동 시도");

    // 1. 결과 요약 바(Summary Bar) 업데이트
    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryText = document.getElementById('summaryText');
    const summaryBar = document.getElementById('resultSummaryBar');

    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} at Level ${currentEmotion.intensity}`;
    
    // 강도에 따른 배경색 반투명 처리 (기존 로직 스티칭)
    if (summaryBar && currentEmotion.color) {
        summaryBar.style.backgroundColor = `${currentEmotion.color}20`; 
        summaryBar.style.borderColor = currentEmotion.color;
    }

    // 2. 해당 감정에 맞는 추천 전략 렌더링 (ui.js 연동)
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name);
    }

    // 3. 4번 화면(Strategies/Result)으로 이동
    UI.goToScreen('4', "Personalized Strategies");
}

function renderHomeQuests() {
    const container = document.getElementById('homeQuestList');
    if (!container) return;

    // 💡 완료되지 않은(completed: false) 태스크만 필터링하여 노출
    const activeTasks = DailyTasks.filter(t => !t.completed);

    if (activeTasks.length === 0) {
        container.innerHTML = `<div style="padding:20px; color:#64748b;">All done for now! 🎉</div>`;
        return;
    }

    container.innerHTML = activeTasks.map(t => `
        <div class="quick-task-item" onclick="startQuest(${t.id}, '${t.title}')">
            <span>${t.tier === 'gold' ? '🥇' : '🥈'}</span>
            <div style="margin-left:12px; text-align:left;">
                <div style="font-weight:850; font-size:1rem;">${t.title}</div>
                <div style="font-size:0.75rem; color:#7c3aed;">+${t.xp} XP</div>
            </div>
            <div class="task-reward">Ready</div>
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