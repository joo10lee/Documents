/**
 * FeelFlow Core Module: Ver.0215-FINAL-FULL
 * 기능: 전역 상태, 루틴 통합 엔진, XP/레벨 시스템, 지능형 전략 연동, 진동 방어
 */

// 1. 전역 상태 관리 및 초기화
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let activeTaskId = null;
let homeDisplayTab = new Date().getHours() < 12 ? 'morning' : 'evening';
let currentRoutineTab = homeDisplayTab;

// 💡 New: Dynamic Greeting Logic
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning, Jason! ☀️";
    if (hour < 18) return "Good Afternoon, Jason! 🌤️";
    return "Good Evening, Jason! 🌙";
}

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
            // 💡 [수정] 5개 모두 완료 시 블록 지급 (Lego -> Block)
            FeelFlow.addMedalProgress(0, 'block');

            // Haptic Feedback for completion
            safeVibrate([50, 50, 50]);

            alert(`🎉 Fantastic! You earned a Daily Block! 🧱`);
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

// 4. 보상 시스템 엔진 (FeelFlow) - 💡 Unified Medal System
const FeelFlow = {
    medals: JSON.parse(localStorage.getItem('feelflow_medals')) || [],

    // 💡 Renamed addXP to addMedalProgress for clarity
    addMedalProgress(amount, tier = null) {
        // Simple logic: Routine completion directly awards progress or medals?
        // User asked to replace points with medals.
        // Let's keep internal XP but hide it, focusing on Medals in UI.

        if (tier === 'block') { // Formerly 'lego'
            this.medals.push("Block");
        } else if (tier) {
            this.medals.push(tier.charAt(0).toUpperCase() + tier.slice(1) + " Medal");
        }
        this.save();
    },

    save() {
        localStorage.setItem('feelflow_medals', JSON.stringify(this.medals));
    }
};

// 💡 Phase 2: Guardian Logic (Parent Mode)
const Guardian = {
    renderDashboard() {
        const history = JSON.parse(localStorage.getItem('feelflow_history')) || [];
        const alertBox = document.getElementById('guardianAlert');
        const alertMsg = document.getElementById('guardianAlertMsg');
        const timeline = document.getElementById('guardianTimeline');
        const colorMix = document.getElementById('guardianColorMix');
        const insight = document.getElementById('guardianInsight');

        // 1. Alert Check (Most recent critical)
        const recentCritical = history[0] && ['Angry', 'Sad', 'Anxious'].includes(history[0].emotion) && history[0].intensity >= 8;
        if (recentCritical) {
            alertBox.style.display = 'block';
            alertMsg.textContent = `Jason felt ${history[0].emotion} (Lv.${history[0].intensity}) at ${new Date(history[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
        } else {
            alertBox.style.display = 'none';
        }

        // 2. Load Goal
        const savedGoal = localStorage.getItem('feelflow_goal_msg') || '';
        document.getElementById('guardianGoalInput').value = savedGoal;

        // 3. Timeline
        if (timeline) {
            timeline.innerHTML = history.slice(0, 10).map(h => `
                <div class="history-item" style="padding:12px; margin:0 0 10px 0;">
                    <div style="font-size:1.5rem;">${h.emoji || '❓'}</div>
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:0.95rem;">${h.emotion} <span style="font-size:0.8rem; color:#94a3b8;">Lv.${h.intensity}</span></div>
                        <div style="font-size:0.85rem; color:#64748b;">${h.note || 'No note'}</div>
                    </div>
                    <div style="font-size:0.75rem; color:#94a3b8;">${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `).join('');
        }

        // 4. Color Mix (Simple Gradient Mock)
        // Ideally calculate based on recent emotions
    },

    saveGoal() {
        const newGoal = document.getElementById('guardianGoalInput').value;
        if (newGoal) {
            localStorage.setItem('feelflow_goal_msg', newGoal);
            alert("Goal updated!");
        }
    },

    sendSMS() {
        // Simulate SMS
        const tel = "1234567890"; // Mock parent number
        window.location.href = `sms:${tel}&body=Jason, Are you okay? I saw your check-in.`;
    },

    sendReaction() {
        localStorage.setItem('parent_reaction', 'heart');
        alert("Sent ❤️ validation to Jason!");
    }
};
window.Guardian = Guardian;

// 5. 흐름 제어 및 내비게이션
function goHome() {
    UI.goToScreen('1', getGreeting()); // 💡 Dynamic Greeting
    resetAppInput();
    renderHomeQuests();

    // 💡 Phase 2: Check for Parent Reaction
    const reaction = localStorage.getItem('parent_reaction');
    if (reaction === 'heart') {
        localStorage.removeItem('parent_reaction'); // Clear it
        setTimeout(() => alert("❤️ Mom/Dad sent you a Cheer Up Heart!"), 500);
    }
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
            FeelFlow.addMedalProgress(0, 'gold');
        } else {
            const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
            FeelFlow.addMedalProgress(0, tier);
        }

        activeTaskId = null;
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Excellent!");

        // 💡 Phase 2: Guardian Trigger (Simulation)
        if (['Angry', 'Sad', 'Anxious'].includes(entry.emotion) && entry.intensity >= 8) {
            // In real app, this sends FCM. Here we set a flag or just let Guardian Screen detect it.
            // Let's show a simulated "Push Notification" toast if we are in "Demo Mode" or just log it.
            console.log("🚨 [Guardian Trigger] High intensity negative emotion detected!");
            setTimeout(() => alert("📱 [Parent's Phone] \n\nFeelFlow Alert:\nJason is feeling very " + entry.emotion + " (Lv." + entry.intensity + ").\nCheck the app now!"), 1000);
        }

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
        // 💡 [Req] Move Toggle to Right (Flexbox)
        titleArea.style.display = 'flex';
        titleArea.style.justifyContent = 'space-between';
        titleArea.style.alignItems = 'center';

        titleArea.innerHTML = `
            <span>Daily Quest ⚔️</span>
            <div class="home-routine-toggle" onclick="toggleHomeRoutine()" style="display:flex; align-items:center; gap:5px; background:rgba(0,0,0,0.05); padding:4px 10px; border-radius:15px; cursor:pointer;">
                <span class="toggle-icon">${homeDisplayTab === 'morning' ? '🌅' : '🌙'}</span>
                <span class="toggle-label" style="font-size:0.8rem; font-weight:600;">${homeDisplayTab.toUpperCase()}</span>
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
    const displayTasks = activeTasks; // 💡 Show ALL tasks, scrollable

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
    safeVibrate(15); // 💡 Phase 3: Haptic Feedback
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
    const legoCount = FeelFlow.medals.filter(m => m.toLowerCase().includes('block')).length; // 💡 'Lego' -> 'Block'
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
        <!-- 1. Goal Card (Top) - Clean Design -->
        <div class="progress-card" style="margin-bottom:20px; padding:20px; background:white; border:1px solid #e2e8f0; border-radius:24px; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <button onclick="editGoalMessage()" style="position:absolute; top:15px; right:15px; background:#f1f5f9; border:none; border-radius:50%; width:30px; height:30px; color:#64748b; font-size:1rem; cursor:pointer;">✏️</button>
            <div style="font-weight:850; font-size:1.1rem; margin-bottom:10px; color:#1e293b;">🎁 Current Goal</div>
            
            <div style="font-size:1.05rem; margin-bottom:15px; color:#334155; font-weight:600;">${goalMsg}</div>
            
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px; color:#64748b;">
                <span>Progress (Gold)</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div class="progress-bar-bg" style="height:12px; background:#f1f5f9; border-radius:6px; overflow:hidden;">
                <div style="width:${Math.min((goldCount / targetGold) * 100, 100)}%; height:100%; background:linear-gradient(90deg, #fbbf24, #d97706); transition:0.5s;"></div>
            </div>
        </div>

        <!-- 2. Medal Stats (4-Column Grid with Lego) -->
        <div class="medal-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:20px; text-align:center;">
            <div class="medal-slot">🥇<br><strong>${goldCount}</strong><div class="label">Gold</div></div>
            <div class="medal-slot">🥈<br><strong>${silverCount}</strong><div class="label">Silver</div></div>
            <div class="medal-slot">🥉<br><strong>${bronzeCount}</strong><div class="label">Bronze</div></div>
            <div class="medal-slot">🧱<br><strong>${legoCount}</strong><div class="label">Block</div></div>
        </div>
        
        <!-- 3. Conversion Rules & Custom Logic -->
        <div style="background:#f8fafc; padding:15px; border-radius:16px; margin-bottom:20px; font-size:0.85rem; color:#64748b; line-height:1.6;">
            <strong>ℹ️ Conversion Rules:</strong><br>
            • 5 Days Complete = 1 Building Block 🧱<br>
            • 10 Custom Tasks = 1 Bronze Medal 🥉<br>
            • 10 Bronze Medals = 1 Silver Medal 🥈<br>
            • 5 Silver Medals = 1 Gold Medal 🥇
        </div>
        `;
}

// 💡 Fix: Robust Audio Check (Prevents crash if Audio API is missing)
const AudioContextVal = window.AudioContext || window.webkitAudioContext;
let audioCtx;
try {
    if (AudioContextVal) {
        audioCtx = new AudioContextVal();
    } else {
        console.warn("⚠️ Web Audio API not supported on this device.");
    }
} catch (e) {
    console.error("❌ AudioContext Init Failed:", e);
}
function playSound(type = 'tap') {
    if (!window.userInteracted || !audioCtx) return;
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'tap') {
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        }
    } catch (e) { }
}

function safeVibrate(pattern) {
    if (!navigator.vibrate) return;
    if (window.userInteracted) {
        playSound('tap'); // 💡 Phase 3.5: Restore Sound with Vibrate
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
    // 💡 Screen Mapping Update
    const screenMap = {
        'Home': '1',
        'Routine': 'screenTracker',
        'Trophies': 'screenTrophies', // Renamed
        'History': 'screenJourney',   // New Screen
        'Guardian': 'screenGuardian'  // 💡 Phase 2
    };
    const tid = screenMap[target.trim()];

    if (tid) {
        const titleMap = {
            'Home': getGreeting(), // Use dynamic greeting for consistency
            'Routine': 'Daily Routine',
            'Trophies': 'My Trophies 🏆',
            'History': 'My Journey 📅',
            'Guardian': 'Guardian Dashboard 🛡️'
        };
        UI.goToScreen(tid, titleMap[target.trim()] || target.trim());

        if (tid === 'screenTracker') setTimeout(renderRoutineScreen, 100);
        if (tid === 'screenTrophies') setTimeout(renderTrophyStats, 100);
        if (tid === 'screenGuardian') setTimeout(() => Guardian.renderDashboard(), 100); // Render Guardian
        if (tid === 'screenJourney') {
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

// Helper for History if not in api.js
async function fetchHistoryHelper() {
    let history = JSON.parse(localStorage.getItem('feelflow_history')) || [];
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

// Extend existing Window.EmotionAPI or Create
if (!window.EmotionAPI) window.EmotionAPI = {};

window.EmotionAPI.fetchHistory = fetchHistoryHelper;
window.EmotionAPI.saveCheckIn = async (data) => {
    let history = JSON.parse(localStorage.getItem('feelflow_history')) || [];
    history.push(data);
    localStorage.setItem('feelflow_history', JSON.stringify(history));
    return true;
};



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

// 💡 Restore User Interaction Listener (Critical for Audio/Haptics)
window.addEventListener('click', () => {
    window.userInteracted = true;
    if (window.audioCtx && window.audioCtx.state === 'suspended') {
        window.audioCtx.resume();
    } else if (typeof audioCtx !== 'undefined' && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });