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
    // ... existing default data ...
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

// 💡 [Must run AFTER DailyRoutines is defined]
function checkAndResetDailyRoutines() {
    const lastDate = localStorage.getItem('feelflow_last_date');
    const today = new Date().toDateString();

    // 💡 [Req] Always reset routines on app start
    console.log("🔄 App Start: Resetting all routines...");

    // Use the global DailyRoutines if storage is empty or needs reset
    if (DailyRoutines) {
        if (DailyRoutines.morning) DailyRoutines.morning.forEach(t => t.completed = false);
        if (DailyRoutines.evening) DailyRoutines.evening.forEach(t => t.completed = false);
        localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
    }
    localStorage.setItem('feelflow_last_date', today);
}
checkAndResetDailyRoutines();

// ... (skip down to handleRoutineCheck) ...

function handleRoutineCheck(id, source) {
    const tab = source === 'home' ? homeDisplayTab : currentRoutineTab;
    const task = DailyRoutines[tab].find(t => t.id === id);

    if (task) {
        // 💡 [Fix] Toggle Logic (Check / Uncheck)
        task.completed = !task.completed;

        safeVibrate(15);
        if (window.feedback) window.feedback('tap');

        // Ensure saveRoutines is defined or use localStorage directly here
        localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));

        if (source === 'home') {
            const el = document.getElementById(`home-task-${id}`);
            if (el) {
                if (task.completed) {
                    el.classList.add('checked-strikethrough');
                    setTimeout(() => {
                        el.classList.add('fade-out');
                        setTimeout(renderHomeQuests, 500);
                    }, 3000);
                } else {
                    el.classList.remove('checked-strikethrough');
                    el.classList.remove('fade-out');
                }
            }
        } else {
            renderRoutineScreen();
        }

        if (task.completed && DailyRoutines[tab].every(t => t.completed)) {
            // 💡 [수정] 5개 모두 완료 시 레고 블록 지급 애니메이션 (Bronze -> Lego)
            FeelFlow.addXP(50, 'lego');
            if (window.UI && window.UI.showLegoAnimation) {
                window.UI.showLegoAnimation();
            } else {
                alert(`🎉 Fantastic! You earned a LEGO Block! 🧱`);
            }
        }
    }
}

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

    // 💡 [Fix] Update Screen 2 DOM
    const emojiEl = document.getElementById('selectedEmoji');
    const nameEl = document.getElementById('selectedName');
    if (emojiEl) emojiEl.textContent = emoji;
    if (nameEl) nameEl.textContent = name;
    const slider = document.getElementById('intensitySlider');
    if (slider) slider.value = 5;
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = '5';

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
window.finishCheckIn = async function () {
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
/**
 * 🏠 홈 화면 전용: UI 복구 버전 (우측 토글 + 일렬 테스크)
 */
function renderHomeQuests() {
    const container = document.getElementById('quickTaskList');
    // 💡 [Fix] More robust selector for title area (in case it was already modified)
    let titleArea = document.querySelector('#screen1 .section-title');

    if (!container || !titleArea) return;

    // Ensure we don't duplicate the toggle button if it already exists
    if (!titleArea.querySelector('.home-routine-toggle')) {
        titleArea.innerHTML = `
            Daily Quest ⚔️
            <div class="home-routine-toggle" onclick="toggleHomeRoutine()" style="width: auto; margin: 0;">
                <span class="toggle-icon">${homeDisplayTab === 'morning' ? '🌅' : '🌙'}</span>
                <span class="toggle-label" style="margin-left: 5px;">${homeDisplayTab.toUpperCase()}</span>
            </div>
        `;
    } else {
        // Just update the text if it exists
        const toggleIcon = titleArea.querySelector('.toggle-icon');
        const toggleLabel = titleArea.querySelector('.toggle-label');
        if (toggleIcon) toggleIcon.textContent = homeDisplayTab === 'morning' ? '🌅' : '🌙';
        if (toggleLabel) toggleLabel.textContent = homeDisplayTab.toUpperCase();
    }


    const activeTasks = DailyRoutines[homeDisplayTab].filter(t => !t.completed);
    const displayTasks = activeTasks.slice(0, 3);

    if (displayTasks.length === 0) {
        container.innerHTML = `<div style="padding:20px; font-weight:850; color:#10b981; text-align:center;">All tasks done! 🎉</div>`;
        return;
    }

    // 2. 테스크 아이템 구조 복구 (과거 폼 유지)
    container.innerHTML = displayTasks.map(t => `
        <div id="home-task-${t.id}" class="home-quest-item" onclick="handleRoutineCheck('${t.id}', 'home')">
            <div class="custom-checkbox"></div>
            <span class="routine-text">${t.text}</span>
        </div>
    `).join('');
}

// Phase 2: Helper to toggle routine active state
function toggleRoutineActive(id) {
    const tab = currentRoutineTab;
    const task = DailyRoutines[tab].find(t => t.id === id);
    if (task) {
        // Initialize active if undefined (default true)
        if (task.active === undefined) task.active = true;

        task.active = !task.active;
        saveRoutines();
        renderRoutineScreen();
    }
}

function deleteRoutine(id) {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    const tab = currentRoutineTab;
    DailyRoutines[tab] = DailyRoutines[tab].filter(t => t.id !== id);
    saveRoutines();
    renderRoutineScreen();
}

// Global binding
window.toggleRoutineActive = toggleRoutineActive;
window.deleteRoutine = deleteRoutine;

function renderRoutineScreen() {
    const container = document.getElementById('taskList');
    const tabMorning = document.getElementById('tabMorning');
    const tabEvening = document.getElementById('tabEvening');
    if (!container) return;

    tabMorning.classList.toggle('active', currentRoutineTab === 'morning');
    tabEvening.classList.toggle('active', currentRoutineTab === 'evening');

    const tasks = DailyRoutines[currentRoutineTab];
    // Calculated active tasks for progress
    const activeTasks = tasks.filter(t => t.active !== false); // Treat undefined as true
    const done = activeTasks.filter(t => t.completed).length;
    const total = activeTasks.length;
    const percent = total === 0 ? 0 : (done / total) * 100;

    document.getElementById('progressFraction').textContent = `${done}/${total}`;
    document.getElementById('progressBar').style.width = `${percent}%`;

    // Check if we have Custom tasks to show delete button
    const isCustom = (id) => id.toString().startsWith('c');

    container.innerHTML = tasks.map(t => {
        const isActive = t.active !== false;
        const disabledClass = !isActive ? 'disabled' : '';
        const completedClass = t.completed ? 'completed' : '';

        // Disable check action if disabled
        const checkAction = isActive ? `handleRoutineCheck('${t.id}', 'tracker')` : '';

        let controlsHtml = '';
        if (isCustom(t.id)) {
            controlsHtml = `<button class="btn-control delete" onclick="deleteRoutine('${t.id}')">🗑️</button>`;
        } else {
            const btnText = isActive ? 'Disable' : 'Enable';
            controlsHtml = `<button class="btn-control" onclick="toggleRoutineActive('${t.id}')">${btnText}</button>`;
        }

        return `
        <div class="routine-checkbox-item ${completedClass} ${disabledClass}" id="routine-${t.id}">
            <div class="custom-checkbox" onclick="${checkAction}"></div>
            <span class="routine-text" style="flex:1; font-weight:850; font-size:1.05rem;">${t.text}</span>
            <div class="routine-controls">
                ${controlsHtml}
            </div>
        </div>
        `;
    }).join('') + `
        <div class="add-custom-routine">
            <input type="text" id="customRoutineInput" placeholder="+ Add a task..." onkeypress="if(event.key === 'Enter') addCustomRoutine(this.value)">
        </div>`;

    UI.updateNavActive('navRoutine');
}

function handleRoutineCheck(id, source) {
    const tab = source === 'home' ? homeDisplayTab : currentRoutineTab;
    const task = DailyRoutines[tab].find(t => t.id === id);

    if (task) {
        // Toggle Logic
        task.completed = !task.completed;

        safeVibrate(15);
        if (window.feedback) window.feedback('tap');

        saveRoutines();

        if (source === 'home') {
            const el = document.getElementById(`home-task-${id}`);
            if (el) {
                if (task.completed) {
                    el.classList.add('checked-strikethrough');
                    setTimeout(() => {
                        el.classList.add('fade-out');
                        setTimeout(renderHomeQuests, 500);
                    }, 3000);
                } else {
                    el.classList.remove('checked-strikethrough');
                    el.classList.remove('fade-out');
                }
            }
        } else {
            renderRoutineScreen();
        }

        // Phase 2: Track Custom Routine Completions
        if (task.completed && id.toString().startsWith('c')) {
            let customCount = parseInt(localStorage.getItem('feelflow_custom_count')) || 0;
            customCount++;
            localStorage.setItem('feelflow_custom_count', customCount);
            console.log(`✨ Custom Routine Complete! Total: ${customCount}`);
        }
        // Deduct if unchecked? User didn't specify, but logical.
        else if (!task.completed && id.toString().startsWith('c')) {
            let customCount = parseInt(localStorage.getItem('feelflow_custom_count')) || 0;
            if (customCount > 0) {
                customCount--;
                localStorage.setItem('feelflow_custom_count', customCount);
            }
        }

        // Active tasks only for completion check
        const activeTasks = DailyRoutines[tab].filter(t => t.active !== false);
        if (task.completed && activeTasks.every(t => t.completed)) {
            FeelFlow.addXP(50, 'lego');
            if (window.UI && window.UI.showLegoAnimation) {
                window.UI.showLegoAnimation();
            } else {
                alert(`🎉 Fantastic! You earned a LEGO Block! 🧱`);
            }
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

// Phase 2: Goal Message Management
function editGoalMessage() {
    const current = localStorage.getItem('feelflow_goal_msg') || "30 Gold Medals = Pizza Party! 🍕";
    const newMsg = prompt("Enter new goal reward:", current);
    if (newMsg) {
        localStorage.setItem('feelflow_goal_msg', newMsg);
        renderTrophyStats();
    }
}
window.editGoalMessage = editGoalMessage;

function renderTrophyStats() {
    const legoCount = FeelFlow.medals.filter(m => m.toLowerCase().includes('lego')).length;
    const goldCount = FeelFlow.medals.filter(m => m.includes('Gold')).length;
    const silverCount = FeelFlow.medals.filter(m => m.includes('Silver')).length;

    // Custom Routine Logic
    const customCount = parseInt(localStorage.getItem('feelflow_custom_count')) || 0;
    const bonusBronze = Math.floor(customCount / 10);
    const bronzeCount = FeelFlow.medals.filter(m => m.includes('Bronze')).length + bonusBronze; // Start counting real bronze if any, plus bonus

    const targetGold = 30; // Default Target
    const goalMsg = localStorage.getItem('feelflow_goal_msg') || `30 Gold Medals = Pizza Party! 🍕`;

    const content = document.getElementById('trophyContent');
    if (!content) return;

    content.innerHTML = `
        <div class="medal-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
            <div class="medal-slot">🥇<br><strong>${goldCount}</strong><div class="label">Gold</div></div>
            <div class="medal-slot">🥈<br><strong>${silverCount}</strong><div class="label">Silver</div></div>
            <div class="medal-slot" style="background:${bonusBronze > 0 ? '#fff3e0' : '#f8fafc'}">🥉<br><strong>${bronzeCount}</strong><div class="label">Bronze</div></div>
        </div>
        
        <div class="custom-stats-card" style="margin-top:10px; padding:15px; background:white; border-radius:20px; box-shadow:0 4px 10px rgba(0,0,0,0.03); border:1px solid #f1f5f9;">
             <div style="font-size:0.9rem; font-weight:700; color:#475569; display:flex; justify-content:space-between;">
                <span>🎯 Custom Challenges</span>
                <span>${customCount} Done</span>
             </div>
             <div style="font-size:0.75rem; color:#94a3b8; margin-top:5px;">
                10 Challenges = 1 Bronze Medal (Current Bonus: +${bonusBronze})
             </div>
        </div>

        <div class="progress-card" style="margin-top:20px; padding:20px; background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:white; border-radius:24px; position:relative;">
            <button onclick="editGoalMessage()" style="position:absolute; top:15px; right:15px; background:rgba(255,255,255,0.2); border:none; border-radius:50%; width:24px; height:24px; color:white; font-size:0.8rem; cursor:pointer;">✏️</button>
            <div style="font-weight:850; font-size:1.1rem; margin-bottom:15px;">🎁 Next Goal</div>
            
            <div style="font-size:1rem; margin-bottom:5px; opacity:0.9;">${goalMsg}</div>
            
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px; opacity:0.7;">
                <span>Progress (Gold)</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div class="progress-bar-bg" style="height:10px; background:rgba(255,255,255,0.2); border-radius:5px; overflow:hidden;">
                <div style="width:${Math.min((goldCount / targetGold) * 100, 100)}%; height:100%; background:#FFD700; transition:0.5s;"></div>
            </div>
        </div>
        
        <div class="lego-status" style="margin-top:20px; text-align:center;">
             <div style="font-size:2rem; margin-bottom:5px;">🧱 x ${legoCount}</div>
             <div style="font-size:0.85rem; color:#64748b;">Lego Blocks Collected</div>
        </div>
        `;
}

function safeVibrate(pattern) {
    if (!navigator.vibrate) return;
    if (window.userInteracted) {
        try { navigator.vibrate(pattern); } catch (e) { }
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

    // 💡 Screen Mapping Update
    const screenMap = {
        'Home': '1',
        'Routine': 'screenTracker',
        'Trophies': 'screenHistory',
        'History': 'screenSettings',  // New History Screen
        'Settings': 'screenSettings' // For now, points to same place
    };
    const tid = screenMap[target.trim()];

    if (tid) {
        const titleMap = {
            'Home': 'Hey Jason!',
            'Routine': 'Daily Routine',
            'Trophies': 'My Trophies 🏆',
            'History': 'My Journey 📅',
            'Settings': 'My Journey 📅'
        };
        UI.goToScreen(tid, titleMap[target.trim()] || target.trim());

        if (tid === 'screenTracker') setTimeout(renderRoutineScreen, 100);
        if (tid === 'screenHistory') setTimeout(renderTrophyStats, 100);
        if (tid === 'screenSettings') {
            if (window.EmotionAPI && window.EmotionAPI.fetchHistory) {
                EmotionAPI.fetchHistory().then(history => {
                    if (window.UI && window.UI.renderHistory) {
                        UI.renderHistory(history);
                    }
                });
            }
        }
    } else { goHome(); }
};

// 💡 Phase 2.5: Global EmotionAPI Definition (moved out of menuNavigate)
async function fetchHistory() {
    let history = JSON.parse(localStorage.getItem('feelflow_history')) || [];

    // 💡 If empty, restore some sample data for "My Journey" (User req)
    if (history.length === 0) {
        history = [
            { timestamp: "2026-02-14T10:30:00", emotion: "Happy", emoji: "😊", intensity: 7, note: "Played soccer with friends!", photo: null },
            { timestamp: "2026-02-14T18:00:00", emotion: "Proud", emoji: "😎", intensity: 9, note: "Finished my lego castle", photo: null },
            { timestamp: "2026-02-13T20:15:00", emotion: "Calm", emoji: "😌", intensity: 5, note: "Reading before bed", photo: null }
        ];
        localStorage.setItem('feelflow_history', JSON.stringify(history));
    }
    return history;
}

const EmotionAPI = {
    saveCheckIn: async (data) => {
        let history = JSON.parse(localStorage.getItem('feelflow_history')) || [];
        history.push(data);
        localStorage.setItem('feelflow_history', JSON.stringify(history));
        return true;
    },
    fetchHistory: fetchHistory
};

window.EmotionAPI = EmotionAPI;



window.initApp = function () {
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
window.toggleMenu = function () {
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.toggle('active');
};