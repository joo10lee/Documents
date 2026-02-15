/**
 * FeelFlow Core Module: Ver.0215-FINAL-FULL
 * 기능: 전역 상태, 루틴 통합 엔진, XP/레벨 시스템, 지능형 전략 연동, 진동 방어
 */

// 1. 전역 상태 관리 및 초기화
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let activeTaskId = null; 
let homeDisplayTab = new Date().getHours() < 12 ? 'morning' : 'evening';
let currentRoutineTab = homeDisplayTab;

// 2. 통합 루틴 데이터 구조 (전체 목록 유지)
let DailyRoutines = JSON.parse(localStorage.getItem('feelflow_routines')) || {
    morning: [
        { id: 'm1', text: '🪥 Wash Face & Brush Teeth', completed: false },
        { id: 'm2', text: '🌤️ Check Weather & Dress Up', completed: false },
        { id: 'm3', text: '🥣 Eat Breakfast', completed: false },
        { id: 'm4', text: '🧴 Personal Grooming (Deodorant)', completed: false },
        { id: 'm5', text: '🪞 Mirror Check (Look Good!)', completed: false },
        { id: 'm6', text: '🎒 Check Backpack Items', completed: false },
        { id: 'm7', text: '🔑 Shoes & Keys Ready', completed: false }
    ],
    evening: [
        { id: 'e1', text: '💻 Charge Devices for Tomorrow', completed: false },
        { id: 'e2', text: '📚 Pack Bag for Tomorrow', completed: false },
        { id: 'e3', text: '🚿 Evening Shower', completed: false },
        { id: 'e4', text: '🪥 Brush Teeth', completed: false },
        { id: 'e5', text: '💤 Screens Off & Relax', completed: false }
    ]
};

// 3. 브라우저 인터랙션 락 해제 (진동/오디오용)
window.userInteracted = false;
['touchstart', 'click', 'mousedown'].forEach(eventType => {
    window.addEventListener(eventType, () => {
        if (!window.userInteracted) {
            window.userInteracted = true;
            console.log("📱 User interaction detected. Systems Unlocked!");
            if (window.Activities) window.Activities.initAudio();
        }
    }, { once: true });
});

// 4. 보상 시스템 엔진 (FeelFlow)
const FeelFlow = {
    totalXP: parseInt(localStorage.getItem('feelflow_xp')) || 0,
    currentLevel: parseInt(localStorage.getItem('feelflow_level')) || 1,
    medals: JSON.parse(localStorage.getItem('feelflow_medals')) || [],

    addXP(amount, tier = null) {
        this.totalXP += amount;
        if (tier) {
            this.medals.push(tier.charAt(0).toUpperCase() + tier.slice(1) + " Medal");
        }
        this.checkLevelUp();
        this.save();
    },

    checkLevelUp() {
        const nextLevelXP = this.currentLevel * 100; 
        if (this.totalXP >= nextLevelXP) {
            this.currentLevel++;
            this.medals.push(`Level ${this.currentLevel} Medal`);
            // 💡 ui.js의 레벨업 애니메이션 호출
            if (window.UI && window.UI.showLevelUp) window.UI.showLevelUp(this.currentLevel);
        }
    },

    save() {
        localStorage.setItem('feelflow_xp', this.totalXP);
        localStorage.setItem('feelflow_level', this.currentLevel);
        localStorage.setItem('feelflow_medals', JSON.stringify(this.medals));
        localStorage.setItem('feelflow_progress', JSON.stringify({
            totalXP: this.totalXP,
            currentLevel: this.currentLevel,
            medals: this.medals
        }));
    }
};

// 5. 흐름 제어 및 내비게이션
function goHome() {
    UI.goToScreen('1', "Hey Jason!");
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
    if (window.Activities) window.Activities.setupActivity(title, taskId);
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
}

// 💡 [최종 교정] goToResult: ui.js 0215 버전 지능형 전략 엔진 연동
function goToResult() {
    console.log("🎯 전략 엔진 가동: 강도별 맞춤 카드 생성");

    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryText = document.getElementById('summaryText');
    const summaryBar = document.getElementById('resultSummaryBar');

    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} (Lv. ${currentEmotion.intensity})`;
    
    if (summaryBar && currentEmotion.color) {
        summaryBar.style.backgroundColor = `${currentEmotion.color}20`; 
        summaryBar.style.borderColor = currentEmotion.color;
    }

    // 💡 강도(intensity)를 함께 전달하여 Happy 1단계 '🌱' 분기 활성화
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name, currentEmotion.intensity);
    }

    UI.goToScreen('4', "Strategies for Jason");
}

// 6. 데이터 저장 및 보상 지급 파이프라인
window.finishCheckIn = async function() {
    console.log("🏁 시퀀스 종료: 서버 전송 및 보상 확정");

    const entry = { 
        emotion: currentEmotion.name, 
        intensity: currentEmotion.intensity, 
        note: document.getElementById('actionNote')?.value || "", 
        photo: window.lastCapturedPhoto || null, 
        timestamp: new Date().toISOString() 
    };

    try {
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);
        
        if (activeTaskId) {
            FeelFlow.addXP(60, 'gold'); 
        } else {
            const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
            FeelFlow.addXP(tier === 'gold' ? 60 : 30, tier); 
        }

        activeTaskId = null;
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Excellent!"); 

    } catch (error) {
        console.error("Save failed:", error);
        UI.goToScreen('5'); 
    }
};

// 7. 통합 루틴 관리 시스템 (Home & Tracker Sync)
function renderHomeQuests() {
    const container = document.getElementById('quickTaskList');
    const titleArea = document.querySelector('.section-title'); 
    if (!container || !titleArea) return;

    titleArea.innerHTML = `
        Daily Quest ⚔️
        <div class="home-routine-toggle" onclick="toggleHomeRoutine()">
            <span class="toggle-icon">${homeDisplayTab === 'morning' ? '🌅' : '🌙'}</span>
            <span class="toggle-label">${homeDisplayTab}</span>
        </div>
    `;

    const activeTasks = DailyRoutines[homeDisplayTab].filter(t => !t.completed);
    const displayTasks = activeTasks.slice(0, 3);

    if (displayTasks.length === 0) {
        container.innerHTML = `<div style="padding:20px; font-weight:850; color:#10b981;">All tasks done! 🎉</div>`;
        return;
    }

    container.innerHTML = displayTasks.map(t => `
        <div id="home-task-${t.id}" class="home-quest-item" onclick="handleRoutineCheck('${t.id}', 'home')">
            <div class="custom-checkbox"></div>
            <div class="routine-text">${t.text}</div>
        </div>
    `).join('');
}

function renderRoutineScreen() {
    const container = document.getElementById('taskList');
    const tabMorning = document.getElementById('tabMorning');
    const tabEvening = document.getElementById('tabEvening');
    if (!container) return;

    tabMorning.classList.toggle('active', currentRoutineTab === 'morning');
    tabEvening.classList.toggle('active', currentRoutineTab === 'evening');

    const tasks = DailyRoutines[currentRoutineTab];
    const done = tasks.filter(t => t.completed).length;
    const percent = (done / tasks.length) * 100;

    document.getElementById('progressFraction').textContent = `${done}/${tasks.length}`;
    document.getElementById('progressBar').style.width = `${percent}%`;

    container.innerHTML = tasks.map(t => `
        <div class="routine-checkbox-item ${t.completed ? 'completed' : ''}" onclick="handleRoutineCheck('${t.id}', 'tracker')">
            <div class="custom-checkbox"></div>
            <span class="routine-text" style="font-weight:850;">${t.text}</span>
        </div>
    `).join('') + `
        <div class="add-custom-routine">
            <input type="text" id="customRoutineInput" placeholder="+ Add a task..." onkeypress="if(event.key === 'Enter') addCustomRoutine(this.value)">
        </div>`;
}

function handleRoutineCheck(id, source) {
    const tab = source === 'home' ? homeDisplayTab : currentRoutineTab;
    const task = DailyRoutines[tab].find(t => t.id === id);

    if (task && !task.completed) {
        task.completed = true;
        safeVibrate(15);
        if (window.feedback) window.feedback('tap'); //
        
        saveRoutines();

        if (source === 'home') {
            const el = document.getElementById(`home-task-${id}`);
            if (el) {
                el.classList.add('checked-strikethrough');
                setTimeout(() => {
                    el.classList.add('fade-out');
                    setTimeout(renderHomeQuests, 500);
                }, 3000);
            }
        } else {
            renderRoutineScreen();
        }

        if (DailyRoutines[tab].every(t => t.completed)) {
            FeelFlow.addXP(30, 'bronze');
            alert(`🎉 Awesome! You finished your ${tab} routine!`);
        }
    }
}

// 8. 헬퍼 및 기타 로직 복구
function saveRoutines() {
    localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
}

function switchRoutine(type) {
    currentRoutineTab = type;
    renderRoutineScreen();
}

function toggleHomeRoutine() {
    homeDisplayTab = homeDisplayTab === 'morning' ? 'evening' : 'morning';
    safeVibrate(10);
    renderHomeQuests();
}

function addCustomRoutine(text) {
    if (!text.trim()) return;
    const newId = 'c' + Date.now();
    DailyRoutines[currentRoutineTab].push({ id: newId, text, completed: false });
    saveRoutines();
    renderRoutineScreen();
    document.getElementById('customRoutineInput').value = '';
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
        <div class="progress-card" style="margin-top:20px; padding:15px;">
            <div style="display:flex; justify-content:space-between; font-weight:850;">
                <span>🎁 LEGO Set Goal</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div class="progress-bar-bg" style="height:12px; background:#e2e8f0; border-radius:6px; margin-top:8px; overflow:hidden;">
                <div style="width:${Math.min((goldCount/targetGold)*100, 100)}%; height:100%; background:#FFD700; transition:0.5s;"></div>
            </div>
        </div>`;
}

function safeVibrate(pattern) {
    if (!navigator.vibrate) return;
    if (window.userInteracted) {
        try { navigator.vibrate(pattern); } catch (e) {}
    }
}

function resetAppInput() {
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    window.lastCapturedPhoto = null; 
    const slider = document.getElementById('intensitySlider');
    if (slider) { slider.value = 5; document.getElementById('intensityDisplay').textContent = '5'; }
}

window.menuNavigate = (target, event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');

    const screenMap = { 'Home': '1', 'Routine': 'screenTracker', 'Trophies': 'screenHistory', 'Settings': 'screenSettings' };
    const tid = screenMap[target.trim()];
    if (tid) {
        UI.goToScreen(tid, target.trim());
        if (tid === 'screenTracker') setTimeout(renderRoutineScreen, 100);
        if (tid === 'screenHistory') setTimeout(renderTrophyStats, 100);
    } else { goHome(); }
};

window.initApp = function() {
    if (window.UI) window.UI.fetchWeatherByCity();
    goHome();
};

// 전역 바인딩
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.goToResult = goToResult;
window.switchRoutine = switchRoutine;
window.toggleHomeRoutine = toggleHomeRoutine;
window.goHome = goHome;
window.startOver = startOver;
window.startQuest = startQuest;
window.toggleMenu = () => document.getElementById('menuOverlay').classList.toggle('active');