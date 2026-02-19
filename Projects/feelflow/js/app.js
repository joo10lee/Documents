/**
 * FeelFlow Core Module: Ver.0215-FINAL-FULL
 * 기능: 전역 상태, 루틴 통합 엔진, XP/레벨 시스템, 지능형 전략 연동, 진동 방어
 */

// 1. 전역 상태 관리 및 초기화
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let activeTaskId = null;
let homeDisplayTab = new Date().getHours() < 12 ? 'morning' : 'evening';
let currentRoutineTab = homeDisplayTab;
let currentUser = 'child'; // 'child' or 'guardian'

// 💡 New: Dynamic Greeting Logic
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning, Jason! ☀️";
    if (hour < 18) return "Good Afternoon, Jason! 🌤️";
    return "Good Evening, Jason! 🌙";
}

// 💡 Helper: Safe JSON Parse
function safeJSONParse(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;
        return JSON.parse(item);
    } catch (e) {
        console.error(`❌ Corrupted Data for ${key}:`, e);
        // Optional: Reset corrupted data to prevent future crashes
        // localStorage.setItem(key, JSON.stringify(defaultValue)); 
        return defaultValue;
    }
}

// 2. 통합 루틴 데이터 구조 (전체 목록 유지)



let DailyRoutines = safeJSONParse('feelflow_routines', null) || {
    morning: [
        { id: 'm1', text: '🪥 Wash Face & Brush Teeth', completed: false, owner: 'default', points: 10, timeSlot: 'morning' },
        { id: 'm2', text: '🌤️ Check Weather & Dress Up', completed: false, owner: 'default', points: 10, timeSlot: 'morning' },
        { id: 'm3', text: '🥣 Eat Breakfast', completed: false, owner: 'default', points: 10, timeSlot: 'morning' },
        { id: 'm4', text: '🧴 Personal Grooming', completed: false, owner: 'default', points: 10, timeSlot: 'morning' },
        { id: 'm5', text: '🪞 Mirror Check (Look Good!)', completed: false, owner: 'default', points: 10, timeSlot: 'morning' },
        { id: 'm6', text: '🎒 Check Backpack Items', completed: false, owner: 'default', points: 10, timeSlot: 'morning' },
        { id: 'm7', text: '🔑 Shoes & Keys Ready', completed: false, owner: 'default', points: 10, timeSlot: 'morning' }
    ],
    evening: [
        { id: 'e1', text: '💻 Charge Devices for Tomorrow', completed: false, owner: 'default', points: 10, timeSlot: 'evening' },
        { id: 'e2', text: '📚 Pack Bag for Tomorrow', completed: false, owner: 'default', points: 10, timeSlot: 'evening' },
        { id: 'e3', text: '🚿 Evening Shower', completed: false, owner: 'default', points: 10, timeSlot: 'evening' },
        { id: 'e4', text: '🪥 Brush Teeth', completed: false, owner: 'default', points: 10, timeSlot: 'evening' },
        { id: 'e5', text: '💤 Screens Off & Relax', completed: false, owner: 'default', points: 10, timeSlot: 'evening' }
    ]
};

// 💡 [Must run AFTER DailyRoutines is defined]
function checkAndResetDailyRoutines() {
    const lastDate = localStorage.getItem('feelflow_last_date');
    const today = new Date().toDateString();

    // 💡 Migration Logic: Upgrade old format to new format
    let migrationNeeded = false;
    ['morning', 'evening'].forEach(slot => {
        if (DailyRoutines[slot]) {
            DailyRoutines[slot].forEach(item => {
                if (!item.owner) {
                    item.owner = item.id.startsWith('m') || item.id.startsWith('e') ? 'default' : 'guardian';
                    item.points = 10;
                    item.timeSlot = slot;
                    item.repeat = 'daily';
                    migrationNeeded = true;
                }
            });
        }
    });

    if (migrationNeeded) {
        console.log("🔄 Migrated Routines to V4 format.");
        localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
    }

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

            alert(`🎉 Fantastic! You earned a Daily XP! 🧱`);
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
// 4. 보상 시스템 엔진 (FeelFlow) - 💡 Unified XP System
const FeelFlow = {
    xp: parseInt(localStorage.getItem('feelflow_xp')) || 0,
    xpHistory: safeJSONParse('feelflow_xp_history', []) || [],

    // 💡 Goal Lifecycle Data
    goals: safeJSONParse('feelflow_goals', {
        active: null,
        queue: [],
        completed: [],
        pendingReward: null // 🆕 To be acknowledged by Guardian
    }),

    initGoals() {
        // Migration and Initialization
        if (!this.goals.active) {
            const oldGoal = parseInt(localStorage.getItem('feelflow_xp_goal')) || 1000;
            const oldReward = localStorage.getItem('feelflow_reward_text') || 'Special Reward';

            this.goals.active = {
                id: 'g_' + Date.now(),
                name: 'Ongoing Mission',
                targetXP: oldGoal,
                earnedXP: this.xp || 0,
                reward: oldReward,
                emoji: '🏆',
                status: 'active',
                createdAt: new Date().toISOString()
            };
            this.saveGoals();
        } else if (!this.goals.active.createdAt) {
            this.goals.active.createdAt = new Date().toISOString();
            this.saveGoals();
        }

        // Tiered Trophy Mapping logic for later use
        this.getTrophyIcon = (index) => {
            if (index === 0) return '🥉';
            if (index === 1) return '🥈';
            if (index === 2) return '🥇';
            return '🏆';
        };

        // 🆕 Pull from Cloud on Init
        if (typeof EmotionAPI !== 'undefined' && EmotionAPI.syncGoals) {
            EmotionAPI.syncGoals();
        }
    },

    addXP(amount, reason) {
        if (!amount) return;
        this.xp += amount;
        this.xpHistory.push({ date: new Date().toISOString(), amount, reason });

        // 💡 Distribute to Active Goal
        if (this.goals.active) {
            this.goals.active.earnedXP += amount;
            this.checkGoalCompletion();
        }

        this.save();
        this.saveGoals();

        // 💡 Visual Feedback
        if (window.UI && window.UI.showXPToast) {
            UI.showXPToast(`+${amount} XP`, reason);
        } else {
            console.log(`🎉 +${amount} XP: ${reason} (Total: ${this.xp})`);
        }
        this.updateXPDisplay();
    },

    updateXPDisplay() {
        const el = document.getElementById('topXpDisplay');
        if (el) el.textContent = `${this.xp} XP`;

        // Also update screen5 display if exists
        const s5 = document.getElementById('screen5XpDisplay');
        if (s5) s5.textContent = this.xp;
    },

    checkGoalCompletion() {
        if (this.goals.active && this.goals.active.earnedXP >= this.goals.active.targetXP) {
            this.triggerCelebration();
        }
    },

    triggerCelebration() {
        const goal = this.goals.active;
        if (!goal) return;

        console.log("🎉 GOAL COMPLETED!", goal);

        // 💡 Calculate Stats
        const now = new Date();
        const start = new Date(goal.createdAt || goal.startedAt || now);
        const days = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));

        goal.status = 'achieved';
        goal.completedAt = now.toISOString();
        goal.daysToComplete = days;

        // 💡 Calculate Surplus XP
        const surplus = Math.max(0, goal.earnedXP - goal.targetXP);

        // 💡 Move to Pending Reward
        this.goals.pendingReward = goal;

        // 💡 Visuals (Confetti, Overlay)
        this.showCelebrationOverlay(goal);

        // 💡 Activate Next Goal (Conditional Carry-over)
        this.activateNextGoal(surplus);

        this.saveGoals();
        if (typeof renderTrophies === 'function') renderTrophies();
        if (typeof Guardian !== 'undefined' && Guardian.renderGoalManager) Guardian.renderGoalManager();
    },

    activateNextGoal(surplus = 0) {
        if (this.goals.queue && this.goals.queue.length > 0) {
            const next = this.goals.queue.shift();

            // 💡 Refined Logic: surplus < targetXP carry over
            let carryOver = 0;
            if (surplus < next.targetXP) {
                carryOver = surplus;
                console.log(`⚡ Carry-over ${surplus} XP to next goal.`);
            } else {
                console.warn("⚠️ Surplus XP too large, starting next goal at 0 to prevent skipping.");
            }

            next.status = 'active';
            next.earnedXP = carryOver;
            next.createdAt = new Date().toISOString();
            this.goals.active = next;
            console.log(`🚀 Activated "${next.name}".`);
        } else {
            this.goals.active = {
                id: 'g_placeholder',
                name: 'New Adventure Awaits!',
                targetXP: 1000,
                earnedXP: 0,
                reward: 'Ask Guardian for next goal',
                emoji: '✨',
                status: 'active',
                createdAt: new Date().toISOString()
            };
        }
    },

    triggerExtraConfetti() {
        console.log("🎉 Extra Celebration!");
        this.triggerCelebrationEffect();
    },

    triggerCelebrationEffect() {
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.style.left = Math.random() * 100 + 'vw';
            c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            c.style.animationDuration = (Math.random() * 2 + 1) + 's';
            c.style.width = c.style.height = (Math.random() * 10 + 5) + 'px';
            document.body.appendChild(c);
            setTimeout(() => c.remove(), 3000);
        }
    },

    acknowledgeReward() {
        if (this.goals.pendingReward) {
            const reward = this.goals.pendingReward;
            reward.status = 'completed';
            reward.acknowledgedAt = new Date().toISOString();

            // Move to formal history
            this.goals.completed.unshift(reward);
            this.goals.pendingReward = null;

            this.saveGoals();

            if (typeof renderTrophies === 'function') renderTrophies();
            if (typeof Guardian !== 'undefined' && Guardian.renderGoalManager) Guardian.renderGoalManager();

            // Optional: small celebration sound or toast
            if (window.UI && UI.showXPToast) UI.showXPToast("Reward archived!", "Ready for next mission.");
        }
    },

    resetActiveGoal() {
        if (this.goals.active) {
            if (confirm(`Reset all progress for "${this.goals.active.name}"? This cannot be undone.`)) {
                this.goals.active.earnedXP = 0;
                this.saveGoals();
                if (typeof renderTrophies === 'function') renderTrophies();
                if (typeof Guardian !== 'undefined' && Guardian.renderGoalManager) Guardian.renderGoalManager();
                alert("Progress reset to 0 XP.");
            }
        }
    },

    completeActiveGoalManually() {
        if (this.goals.active && this.goals.active.earnedXP >= this.goals.active.targetXP) {
            if (confirm("Moving this mission to the 'Pending' list and preparing the next one. Proceed?")) {
                this.triggerCelebration();
            }
        }
    },

    showCelebrationOverlay(goal) {
        // Create Overlay Elements dynamically if not exist
        let overlay = document.getElementById('celebrationOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'celebrationOverlay';
            overlay.className = 'celebration-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div style="font-size:5rem; animation: float 3s infinite;">🎉</div>
            <h1 style="font-size:3rem; color:#d946ef; margin:10px 0; text-shadow: 0 4px 10px rgba(0,0,0,0.1);">🏆 GOAL ACHIEVED!</h1>
            <div style="font-size:4rem; margin-bottom:10px;">${goal.emoji}</div>
            <h2 style="color:#1e293b; margin-bottom:10px;">${goal.name}</h2>
            <div style="font-size:1.8rem; color:#475569; margin-bottom:30px; font-weight:700;">
                ${goal.emoji} ${goal.reward}!
            </div>
            <div style="display:flex; gap:15px; justify-content:center; width:100%; max-width:400px;">
                <button onclick="FeelFlow.triggerExtraConfetti()" class="btn-primary" style="flex:1; background:#f97316; padding:15px; border-radius:18px; font-size:1.1rem; box-shadow:0 8px 20px rgba(249, 115, 22, 0.3);">
                    🎉 Celebrate!
                </button>
                <button onclick="FeelFlow.dismissCelebration()" class="btn-secondary" style="flex:1; padding:15px; border-radius:18px; font-size:1.1rem;">
                    Dismiss
                </button>
            </div>
        `;

        // Add Confetti Styling
        for (let i = 0; i < 50; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.background = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'][Math.floor(Math.random() * 6)];
            conf.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear infinite`;
            overlay.appendChild(conf);
        }

        overlay.style.display = 'flex';
        playSound('success');
        safeVibrate([100, 50, 100, 50, 200]);
    },

    dismissCelebration() {
        const overlay = document.getElementById('celebrationOverlay');
        if (overlay) overlay.style.display = 'none';
        if (typeof renderTrophies === 'function') renderTrophies();
    },

    removeXP(amount) {
        this.xp = Math.max(0, this.xp - amount);
        // Also deduct from Active Goal if possible
        if (this.goals.active && this.goals.active.earnedXP > 0) {
            this.goals.active.earnedXP = Math.max(0, this.goals.active.earnedXP - amount);
        }
        this.save();
        this.saveGoals();
    },

    setGoal(amount) {
        // Legacy support - update active goal target
        if (this.goals.active) {
            this.goals.active.targetXP = amount;
            this.saveGoals();
        }
    },

    save() {
        localStorage.setItem('feelflow_xp', this.xp);
        localStorage.setItem('feelflow_xp_history', JSON.stringify(this.xpHistory));
        // Update UI if present
        // if (typeof updateXPDisplay === 'function') updateXPDisplay(); // Deprecated
    },

    saveGoals() {
        localStorage.setItem('feelflow_goals', JSON.stringify(this.goals));
        // 🆕 Sync to Cloud
        if (typeof EmotionAPI !== 'undefined' && EmotionAPI.syncGoals) {
            EmotionAPI.syncGoals(this.goals);
        }
    }
};

// Initialize Goals on Load
FeelFlow.initGoals();

// 💡 Phase 2: Guardian Logic (Parent Mode)
// 💡 Phase 3: Guardian Authentication & Logic
const GuardianAuth = {
    profile: safeJSONParse('guardian_profile', null),

    signup() {
        const name = document.getElementById('signupName').value;
        const phone = document.getElementById('signupPhone').value;
        const pin = document.getElementById('signupPin').value;
        const relationship = document.getElementById('signupRelationship').value; // 💡 New Field

        if (!name || pin.length !== 4) {
            alert("Please enter a name and a 4-digit PIN.");
            return;
        }

        this.profile = { name, phone, pin, relationship }; // 💡 Save Relationship
        localStorage.setItem('guardian_profile', JSON.stringify(this.profile));
        alert("Profile Created! Please Login.");
        UI.goToScreen('Login');
    },

    login() {
        const inputPin = document.getElementById('loginPin').value;
        if (!this.profile) {
            alert("No profile found. Please Sign Up first.");
            return;
        }
        if (inputPin === this.profile.pin) {
            currentUser = 'guardian';
            document.getElementById('loginPin').value = ''; // Clear PIN
            UI.goToScreen('Guardian');
            Guardian.init();
        } else {
            alert("Wrong PIN!");
        }
    },

    logout() {
        currentUser = 'child';
        UI.goToScreen('1', getGreeting());
    },

    check() {
        if (!this.profile) return false;
        return true;
    }
};

const Guardian = {
    chartInstance: null,
    emotionColors: { 'Happy': '#FFD93D', 'Sad': '#6CB4EE', 'Anxious': '#A084E8', 'Angry': '#FF6B6B', 'Calm': '#6BCB77', 'Tired': '#95A5A6' },
    feelingMap: {
        'Happy': { emoji: '☀️', color: '#FFD93D' },
        'Sad': { emoji: '☁️', color: '#6CB4EE' },
        'Anxious': { emoji: '🌪️', color: '#A084E8' },
        'Angry': { emoji: '🔥', color: '#FF6B6B' },
        'Calm': { emoji: '🌿', color: '#6BCB77' },
        'Tired': { emoji: '💤', color: '#95A5A6' }
    },

    getEmoji(emotion) {
        return (this.feelingMap[emotion] ? this.feelingMap[emotion].emoji : '😶');
    },

    // 💡 Context Tag Presets
    contextTags: [
        { label: 'Doctor Visit', icon: '🏥' },
        { label: 'Med Change', icon: '💊' },
        { label: 'School Event', icon: '🏫' },
        { label: 'Family Event', icon: '👨‍👩‍👦' },
        { label: 'Sleep Issue', icon: '😴' },
        { label: 'Sick Day', icon: '🤒' },
        { label: 'Routine Change', icon: '🔄' },
        { label: 'IEP Meeting', icon: '📝' }
    ],

    init() {
        try {
            this.currentWeatherType = this.currentWeatherType || 'today';
            this.renderWeather(this.currentWeatherType);
            this.loadSettings();
            this.generateAIInsight();
            // this.renderRecentHistory(); // Removed to avoid overwriting the filtered history from renderWeather
            this.checkAlerts();
            this.renderGoalManager();
            this.renderContextBar();

            // 날짜 표시
            const summaryDateEl = document.getElementById('guardianSummaryDate');
            if (summaryDateEl) {
                const now = new Date();
                const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
                const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                summaryDateEl.textContent = `📊 ${dayName}, ${monthDay}`;
            }
            // Routine and Context rendered when settings opened, but we can init data here
        } catch (e) {
            console.error("Guardian Init Error:", e);
            const container = document.getElementById('guardianRecentHistory');
            if (container) container.innerHTML = `<div style="color:red; padding:20px;">Error loading dashboard: ${e.message}</div>`;
        }
    },

    dismissAlert() {
        const alertBox = document.getElementById('guardianAlert');
        if (alertBox) alertBox.style.display = 'none';
        // Mark all alerts as read
        const alerts = safeJSONParse('feelflow_alerts', []) || [];
        alerts.forEach(a => a.read = true);
        localStorage.setItem('feelflow_alerts', JSON.stringify(alerts));
    },

    sendSMS() {
        alert("💬 SMS sent to Jason: 'Hi Jason, I noticed you're feeling a bit overwhelmed. I'm here if you want to talk!'");
        this.dismissAlert();
    },

    sendReaction() {
        alert("❤️ Reaction sent to Jason's phone!");
        this.dismissAlert();
    },

    checkAlerts() {
        const alerts = safeJSONParse('feelflow_alerts', []) || [];
        const unread = alerts.filter(a => !a.read);
        const alertBox = document.getElementById('guardianAlert');
        const alertMsg = document.getElementById('guardianAlertMsg');

        if (unread.length > 0 && alertBox && alertMsg) {
            const latest = unread[unread.length - 1];
            alertBox.style.display = 'block';
            alertMsg.textContent = `${latest.message} (${new Date(latest.timestamp).toLocaleTimeString()})`;

            // Mark as read when seen (or maybe add a dismiss button? For now auto-mark on view is dangerous if they miss it. 
            // Let's leave it unread until they click "SMS" or "Cheer"? Or just leave it for now.)
        } else if (alertBox) {
            alertBox.style.display = 'none';
        }
    },

    renderDashboard() {
        console.log("🛡️ Rendering Guardian Dashboard...");
        // Ensure Screen Visibility
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const s = document.getElementById('screenGuardian');
        if (s) s.classList.add('active');

        this.init();
    },

    // 💡 Routine Management
    renderRoutineManager() {
        // Target the container in Settings screen
        let container = document.getElementById('settingsRoutineContent');
        if (!container) return;

        const renderList = (slot) => {
            const list = DailyRoutines[slot] || [];
            if (list.length === 0) return `<div style="color:#94a3b8; font-size:0.85rem; padding:8px;">No routines set.</div>`;
            return list.map(t => {
                const isChild = t.owner === 'child';
                const isGuardian = t.owner === 'guardian';
                const badge = isGuardian ? '🔒' : (isChild ? '⭐' : '');
                const style = isChild ? 'opacity:0.75;' : '';
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; ${style}">
                        <div style="flex:1;">
                            <div style="font-size:0.9rem; font-weight:600; color:#1e293b;">${badge} ${t.text}</div>
                            <div style="font-size:0.75rem; color:#64748b;">${t.points} XP</div>
                        </div>
                        ${!isChild ? `
                        <div style="display:flex; gap:8px;">
                            <button onclick="Guardian.editRoutinePrompt('${t.id}', '${slot}')" style="font-size:0.8rem; padding:4px 8px; background:#f1f5f9; border:none; border-radius:6px;">✏️</button>
                            ${t.id !== 'm1' ? `<button onclick="Guardian.deleteRoutine('${t.id}', '${slot}')" style="font-size:0.8rem; padding:4px 8px; background:#fef2f2; color:#ef4444; border:none; border-radius:6px;">🗑️</button>` : ''}
                        </div>` : '<span style="font-size:0.7rem; color:#94a3b8;">Child created</span>'}
                    </div>
                `;
            }).join('');
        };

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="font-size:1rem; font-weight:850; color:#1A1A2E; margin:0;">📋 Manage Routines</h3>
                <button onclick="Guardian.addRoutinePrompt()" class="ff-btn-primary" style="width:auto; height:32px; font-size:0.8rem; padding:0 12px;">+ Add</button>
            </div>
            
            <h4 style="font-size:0.85rem; font-weight:700; color:#64748b; margin:12px 0 8px; text-transform:uppercase;">🌅 Morning</h4>
            ${renderList('morning')}

            <h4 style="font-size:0.85rem; font-weight:700; color:#64748b; margin:20px 0 8px; text-transform:uppercase;">🌙 Evening</h4>
            ${renderList('evening')}
        `;
    },

    addRoutinePrompt() {
        const text = prompt("Routine Name:");
        if (!text) return;
        const slot = prompt("Time Slot (morning/evening):", "morning").toLowerCase();
        if (slot !== 'morning' && slot !== 'evening') return alert("Invalid slot");
        const points = parseInt(prompt("XP Points (0-30):", "10")) || 10;

        const newId = (slot === 'morning' ? 'm' : 'e') + Date.now();
        if (!DailyRoutines[slot]) DailyRoutines[slot] = [];

        DailyRoutines[slot].push({
            id: newId,
            text: text,
            completed: false,
            owner: 'guardian',
            points: Math.min(30, Math.max(0, points)),
            timeSlot: slot
        });

        localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
        this.renderRoutineManager();
    },

    deleteRoutine(id, slot) {
        if (confirm("Delete this routine?")) {
            DailyRoutines[slot] = DailyRoutines[slot].filter(t => t.id !== id);
            localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
            this.renderRoutineManager();
        }
    },

    editRoutinePrompt(id, slot) {
        const t = DailyRoutines[slot].find(x => x.id === id);
        if (!t) return;

        const newText = prompt("Edit Task Name:", t.text);
        if (newText) {
            const newPoints = parseInt(prompt("Edit XP:", t.points));
            t.text = newText;
            if (!isNaN(newPoints)) t.points = newPoints;
            localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
            this.renderRoutineManager();
        }
    },

    // 💡 Init Weather & Tip (Child Mode)
    renderWeather(day) {
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherText = document.querySelector('.ff-weather-pill span:last-child');
        if (weatherIcon && weatherText) {
            // Mock Data
            const codes = [
                { icon: '🌤️', text: '68°F', tip: "It's nice out! Short sleeves are fine." },
                { icon: '🌧️', text: '55°F', tip: "Rainy day ☔ Don't forget your umbrella!" },
                { icon: '🌨️', text: '30°F', tip: "Brrr! Wear a warm coat & gloves 🧤" },
                { icon: '🌪️', text: 'Windy', tip: "It's windy! Watch out for flying hats 🧢" }
            ];
            const w = codes[Math.floor(Math.random() * codes.length)];

            weatherIcon.textContent = w.icon;
            weatherText.textContent = w.text;

            // Add Tip
            let tipEl = document.getElementById('weatherTip');
            if (!tipEl) {
                tipEl = document.createElement('span');
                tipEl.id = 'weatherTip';
                tipEl.style.fontSize = '0.75rem';
                tipEl.style.color = '#64748b';
                tipEl.style.marginLeft = '8px';
                tipEl.style.fontWeight = '500';
                weatherText.parentNode.after(tipEl);
            }
            tipEl.textContent = w.tip;
        }
    },

    // 💡 Render Home Quests (Morning/Evening)
    renderHomeQuests() {
        if (typeof renderHomeQuests === 'function') {
            renderHomeQuests();
        }
    },

    // 💡 Update XP Display
    updateXPDisplay() {
        if (FeelFlow && typeof FeelFlow.updateXPDisplay === 'function') {
            FeelFlow.updateXPDisplay();
        }
    },

    // 💡 FAB Visibility Check-in Logic
    shareCheckIn() {
        const btn = document.getElementById('btnShareFamily');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = "✅ Shared! (+100 XP)";
            btn.style.background = "#94a3b8";
            btn.style.color = "white";
        }

        FeelFlow.addXP(100, "Shared with Family ❤️");

        // Simulate Notification
        setTimeout(() => {
            alert("📨 Sent update to Guardian!");
        }, 500);
    },

    // 💡 Clinical Reports & Context Tags Logic
    renderContextBar() {
        const container = document.getElementById('clinicalTagsContainer');
        if (!container) return;

        const todayTags = this.getContextTags(new Date());

        if (todayTags.length === 0) {
            container.innerHTML = `<span style="color:#94a3b8; font-size:0.8rem;">No tags for today. Tap "+ Add Tag" to add context.</span>`;
            return;
        }

        container.innerHTML = todayTags.map(t => `
            <div style="display:flex; align-items:center; gap:8px; background:#eff6ff; padding:6px 14px; border-radius:20px; border:1px solid #bfdbfe; margin-bottom:4px; max-width: 100%;">
                <span style="font-size:1rem;">${t.icon}</span>
                <span style="font-size:0.75rem; font-weight:700; color:#1e40af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.tag}</span>
                ${t.note ? `<span style="font-size:0.7rem; color:#60a5fa; margin-right: 4px;">(${t.note})</span>` : ''}
                <button onclick="Guardian.deleteContextTag('${t.id}')" style="background:none; border:none; color:#93c5fd; font-size:1rem; padding:4px; cursor:pointer; display: flex; align-items: center; justify-content: center; margin-left: auto;">✕</button>
            </div>
        `).join('');
    },

    openContextModal() {
        const modal = document.createElement('div');
        modal.id = 'contextModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '1000';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

        const todayStr = new Date().toISOString().split('T')[0];

        modal.innerHTML = `
            <div class="ff-card" style="width:90%; max-width:400px; padding:24px; animation: slideUp 0.3s ease-out;">
                <h3 style="margin:0 0 16px; font-size:1.2rem; font-weight:800; color:#1e293b;">Add Context Tag</h3>
                
                <label style="display:block; font-size:0.9rem; font-weight:600; color:#64748b; margin-bottom:8px;">Date</label>
                <input type="date" id="tagDate" value="${todayStr}" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:20px;">

                <label style="display:block; font-size:0.9rem; font-weight:600; color:#64748b; margin-bottom:8px;">Select Tag</label>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;">
                    ${this.contextTags.map(t => `
                        <button onclick="Guardian.selectTag(this, '${t.label}', '${t.icon}')" class="tag-option" style="padding:8px 12px; border:1px solid #cbd5e1; border-radius:20px; background:white; font-size:0.9rem; transition:all 0.2s;">
                            ${t.icon} ${t.label}
                        </button>
                    `).join('')}
                </div>

                <label style="display:block; font-size:0.9rem; font-weight:600; color:#64748b; margin-bottom:8px;">Note (Optional)</label>
                <input type="text" id="tagNote" placeholder="e.g. New dosage 5mg" maxlength="30" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:24px;">

                <div style="display:flex; gap:10px;">
                    <button onclick="document.getElementById('contextModal').remove()" class="ff-btn-secondary" style="flex:1;">Cancel</button>
                    <button onclick="Guardian.saveContextTag()" class="ff-btn-primary" style="flex:1;">Save Tag</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        window.selectedTag = null;
    },

    selectTag(btn, label, icon) {
        document.querySelectorAll('.tag-option').forEach(b => {
            b.style.background = 'white';
            b.style.borderColor = '#cbd5e1';
            b.style.color = '#334155';
        });
        btn.style.background = '#eef2ff';
        btn.style.borderColor = '#6366f1';
        btn.style.color = '#4338ca';
        window.selectedTag = { label, icon };
    },

    saveContextTag() {
        if (!window.selectedTag) return alert("Please select a tag.");
        const date = document.getElementById('tagDate').value;
        const note = document.getElementById('tagNote').value;
        const id = 'tag_' + Date.now();

        const tags = safeJSONParse('feelflow_context_tags', []) || [];
        tags.push({
            id,
            date,
            tag: window.selectedTag.label,
            icon: window.selectedTag.icon,
            note,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('feelflow_context_tags', JSON.stringify(tags));

        document.getElementById('contextModal').remove();
        this.renderContextBar();
    },

    deleteContextTag(id) {
        if (!confirm("Delete this tag?")) return;
        let tags = safeJSONParse('feelflow_context_tags', []) || [];
        tags = tags.filter(t => t.id !== id);
        localStorage.setItem('feelflow_context_tags', JSON.stringify(tags));
        this.renderContextBar();
    },

    getContextTags(dateObj) {
        const tags = safeJSONParse('feelflow_context_tags', []) || [];
        if (!dateObj) return tags;
        const dStr = dateObj.toISOString().split('T')[0];
        return tags.filter(t => t.date === dStr);
    },

    calculateIndependenceScore(history, periodDays) {
        if (!history || history.length === 0) return { score: 0, level: '🌱 Building', stats: {} };

        // 1. Self-Initiation (Not triggered by Routine)
        const selfInitCount = history.filter(h => !h.triggers || !h.triggers.includes('Routine')).length;
        const selfInitRate = (selfInitCount / history.length) * 100;

        // 2. Strategy Completion
        const intensityDrop = history.reduce((acc, h) => {
            const before = Number(h.intensity) || 0;
            const after = Number(h.afterIntensity);
            if (!isNaN(after)) return acc + (before - after);
            return acc;
        }, 0);
        const avgDrop = history.filter(h => !isNaN(Number(h.afterIntensity))).length > 0
            ? intensityDrop / history.filter(h => !isNaN(Number(h.afterIntensity))).length
            : 0;

        // 3. Consistency
        const uniqueDays = new Set(history.map(h => new Date(h.timestamp).toDateString())).size;
        const consistencyRate = (uniqueDays / periodDays) * 100;

        // 4. Vocab Diversity
        const uniqueEmotions = new Set(history.map(h => h.emotion)).size;

        // Weighting
        const dropScore = Math.min(100, Math.max(0, avgDrop * 20));
        const vocabScore = Math.min(100, (uniqueEmotions / 6) * 100);

        let weightedScore = (selfInitRate * 0.4) + (consistencyRate * 0.3) + (dropScore * 0.2) + (vocabScore * 0.1);
        weightedScore = Math.round(weightedScore);

        let level = '🌱 Building';
        if (weightedScore >= 50) level = '🌿 Growing';
        if (weightedScore >= 70) level = '🌳 Strong';
        if (weightedScore >= 85) level = '🌟 Independent';

        return {
            score: weightedScore,
            level,
            stats: {
                total: history.length,
                selfInitRate: Math.round(selfInitRate),
                avgDrop: avgDrop.toFixed(1),
                uniqueEmotions
            }
        };
    },

    generateReport(type) {
        const history = safeJSONParse('feelflow_history', []) || [];
        const isWeek = type === 'week';
        const now = new Date();
        const periodDays = isWeek ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(now.getDate() - periodDays);

        const filtered = history.filter(h => new Date(h.timestamp) >= startDate);
        const { score, level, stats } = this.calculateIndependenceScore(filtered, periodDays);

        const title = isWeek ? 'Weekly Clinical Report' : 'Monthly Clinical Report';
        const range = `${startDate.toLocaleDateString()} - ${now.toLocaleDateString()}`;

        // Top Emotion
        const counts = {};
        filtered.forEach(h => counts[h.emotion] = (counts[h.emotion] || 0) + 1);
        const topEmo = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'None';
        const topEmoCount = counts[topEmo] || 0;
        const topEmoPct = stats.total > 0 ? Math.round((topEmoCount / stats.total) * 100) : 0;

        // Context Tags
        const allTags = safeJSONParse('feelflow_context_tags', []) || [];
        const relevantTags = allTags.filter(t => new Date(t.date) >= startDate && new Date(t.date) <= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const modal = document.createElement('div');
        modal.id = 'reportModal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; overflow-y:auto; display:flex; justify-content:center; padding:20px;';

        modal.innerHTML = `
            <div class="ff-card" style="width:100%; max-width:600px; padding:32px; background:white; margin:auto; position:relative;">
                <button onclick="document.getElementById('reportModal').remove()" style="position:absolute; top:12px; right:12px; background:#f1f5f9; border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; cursor:pointer; z-index:10;">✕</button>
                
                <h1 style="font-size:1.5rem; font-weight:900; color:#1e293b; text-align:center; margin-bottom:4px;">${title}</h1>
                <p style="text-align:center; color:#64748b; margin-bottom:24px;">${range} • Jason Lee</p>

                <!-- Independence Score -->
                <div style="background:#f8fafc; padding:20px; border-radius:12px; text-align:center; margin-bottom:24px; border:1px solid #e2e8f0;">
                    <div style="font-size:0.9rem; font-weight:700; color:#64748b; text-transform:uppercase;">Independence Score</div>
                    <div style="font-size:3rem; font-weight:900; color:#3b82f6; margin:8px 0;">${score}</div>
                    <div style="font-size:1.1rem; font-weight:700; color:#1e293b;">${level}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; margin-top:8px;">Powered by AI ✨</div>
                </div>

                <!-- Stats Grid -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
                     <div style="border:1px solid #e2e8f0; padding:12px; border-radius:8px;">
                        <div style="font-size:0.8rem; color:#64748b;">Total Check-ins</div>
                        <div style="font-size:1.2rem; font-weight:800; color:#1e293b;">${stats.total}</div>
                     </div>
                     <div style="border:1px solid #e2e8f0; padding:12px; border-radius:8px;">
                        <div style="font-size:0.8rem; color:#64748b;">Self-Initiated</div>
                        <div style="font-size:1.2rem; font-weight:800; color:#10b981;">${stats.selfInitRate}%</div>
                     </div>
                     <div style="border:1px solid #e2e8f0; padding:12px; border-radius:8px;">
                        <div style="font-size:0.8rem; color:#64748b;">Top Emotion</div>
                        <div style="font-size:1.2rem; font-weight:800; color:#1e293b;">${topEmo} (${topEmoPct}%)</div>
                     </div>
                     <div style="border:1px solid #e2e8f0; padding:12px; border-radius:8px;">
                        <div style="font-size:0.8rem; color:#64748b;">Avg Intensity Drop</div>
                        <div style="font-size:1.2rem; font-weight:800; color:#3b82f6;">${stats.avgDrop}</div>
                     </div>
                </div>

                 <!-- Context & Notes -->
                <h4 style="font-size:1rem; font-weight:800; margin-bottom:12px;">📌 Clinical Context</h4>
                <ul style="font-size:0.9rem; color:#334155; margin-bottom:24px; line-height:1.6; padding-left:20px;">
                    ${relevantTags.length > 0 ? relevantTags.map(t => `
                        <li><strong>${t.date}:</strong> ${t.icon} ${t.tag} ${t.note ? `(${t.note})` : ''}</li>
                    `).join('') : '<li style="color:#94a3b8; list-style:none; margin-left:-20px;">No context tags recorded for this period.</li>'}
                </ul>

                <button onclick="Guardian.shareReport('${title}', '${range}', ${score}, '${level}', '${JSON.stringify(stats).replace(/"/g, '&quot;')}', '${JSON.stringify(relevantTags).replace(/"/g, '&quot;')}')" class="ff-btn-primary" style="width:100%; margin-top:10px;">📤 Share Report</button>
                <p style="text-align:center; font-size:0.7rem; color:#94a3b8; margin-top:16px;">
                    Generated by FeelFlow. Data is self-reported. Not a clinical assessment.
                </p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    },

    shareReport(title, range, score, level, statsStr, tagsStr) {
        const stats = JSON.parse(statsStr);
        const tags = JSON.parse(tagsStr);

        let text = `${title} - Jason Lee\n${range}\n\n`;
        text += `Independence Score: ${score} (${level})\n\n`;
        text += `Stats:\n- Total Check-ins: ${stats.total}\n- Self-Initiated: ${stats.selfInitRate}%\n- Avg Intensity Drop: ${stats.avgDrop}\n\n`;
        text += `Clinical Context:\n`;
        if (tags.length > 0) {
            tags.forEach(t => {
                text += `- ${t.date}: ${t.tag} ${t.note ? `(${t.note})` : ''}\n`;
            });
        } else {
            text += `- None recorded.\n`;
        }
        text += `\nGenerated by FeelFlow app.`;

        if (navigator.share) {
            navigator.share({
                title: title,
                text: text
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text).then(() => alert("Report copied to clipboard! 📋"));
        }
    },

    renderGoalManager() {
        const activeContainer = document.getElementById('guardianActiveGoal');
        const queueContainer = document.getElementById('guardianGoalQueue');
        const active = FeelFlow.goals.active;
        const queue = FeelFlow.goals.queue;
        const pending = FeelFlow.goals.pendingReward;

        // 🆕 Pending Achievement (Awaiting Guardian Action)
        const pendingSlot = document.getElementById('guardianPendingReward');
        if (pendingSlot) {
            if (pending) {
                pendingSlot.style.display = 'block';
                pendingSlot.innerHTML = `
                    <div class="ff-quest-summary-card" style="border-color: #F97316; background: #FFF7ED; margin-bottom: 24px; padding: 16px; border-radius: 12px; display: flex; flex-direction: column; align-items: stretch; gap: 12px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div class="ff-quest-icon-circle" style="background:#FFEDD5; color:#EA580C; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size:1.2rem;">${pending.emoji}</span>
                            </div>
                            <div style="text-align:left; flex: 1;">
                                <p style="font-size:0.95rem; font-weight:800; color:#1A1A2E; margin:0;">Goal Accomplished! 🎉</p>
                                <p style="font-size:0.75rem; color:#9A3412; margin:0;">Reward: ${pending.reward}</p>
                            </div>
                        </div>
                        <button onclick="console.log('Ack clicked'); FeelFlow.goals.pendingReward = null; FeelFlow.saveGoals(); Guardian.renderGoalManager();" class="ff-btn-primary" style="background:#EA580C; padding: 12px; font-size: 0.9rem; margin: 0; width: 100%; border: none; color: white; border-radius: 8px;">Acknowledge & Dismiss</button>
                    </div>
                `;
            } else {
                pendingSlot.style.display = 'none';
            }
        }

        // Active Goal
        if (active && activeContainer) {
            const isCompleted = active.earnedXP >= active.targetXP;

            activeContainer.innerHTML = `
                <div class="ff-goal-card" style="background: #F5F3FF; border-color: #DDD6FE;">
                    <div class="ff-goal-header" style="margin-bottom: 12px;">
                        <div class="ff-goal-icon-large" style="background: #EDE9FE; color: #7C3AED; width: 48px; height: 48px; font-size: 1.5rem;">${active.emoji}</div>
                        <div>
                            <p style="font-size:0.7rem; font-weight:800; color:#7C3AED; text-transform:uppercase; margin:0;">Active Mission</p>
                            <h2 style="font-size:1.05rem; font-weight:800; color:#1A1A2E; margin:0;">${active.name}</h2>
                        </div>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:0.85rem; font-weight:800; color:#1A1A2E;">${active.earnedXP} / ${active.targetXP} XP</span>
                        <span style="font-size:0.75rem; color:#6C5CE7; font-weight:700;">Reward: ${active.reward}</span>
                    </div>

                    ${isCompleted ? `
                    <div style="background:#FFF7ED; padding:10px; border-radius:12px; border:1px solid #FFEDD5; border-left:4px solid #F97316; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.8rem; font-weight:800; color:#C2410C;">🎉 Goal Reached!</span>
                        <button onclick="FeelFlow.completeActiveGoalManually()" class="ff-btn-primary" style="background:#F97316; padding:6px 12px; font-size:0.75rem; margin:0;">Complete</button>
                    </div>
                    ` : ''}

                    <div style="display:flex; gap:8px;">
                        <button onclick="Guardian.editGoalPrompt('active')" class="btn-ff-skip" style="font-size:0.7rem; padding:8px 12px; flex:1;">Edit Reward</button>
                        <button onclick="FeelFlow.resetActiveGoal()" class="btn-ff-skip" style="font-size:0.7rem; padding:8px 12px; flex:1; color:#EF4444;">Reset Progress</button>
                    </div>
                </div>
            `;
        }

        // Queue
        if (queueContainer) {
            if (!queue || queue.length === 0) {
                queueContainer.innerHTML = `
                    <div class="ff-queue-item" style="opacity: 0.6; border-style: dashed; justify-content: center; padding: 24px;">
                        <div style="text-align:center;">
                            <div style="font-size:1.25rem; margin-bottom:4px;">🔒</div>
                            <div style="font-size:0.8rem; color:#94A3B8; font-weight:600;">No upcoming missions</div>
                        </div>
                    </div>`;
            } else {
                queueContainer.innerHTML = queue.map((q, index) => `
                    <div class="ff-queue-item">
                        <div class="ff-queue-icon" style="background: #F1F5F9; color: #1A1A2E;">${q.emoji}</div>
                        <div style="flex:1;" onclick="Guardian.editGoalPrompt(${index})">
                            <div style="font-size:0.9rem; font-weight:800; color:#1A1A2E;">${q.name}</div>
                            <div style="font-size:0.7rem; color:#9CA3AF; font-weight:600;">${q.targetXP} XP • ${q.reward}</div>
                        </div>
                        <div style="display:flex; gap:4px;">
                            <button onclick="Guardian.moveGoalUp(${index})" style="background:#F1F5F9; border:none; color:#64748B; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:800;">↑</button>
                            <button onclick="Guardian.deleteGoal(${index})" style="background:#FEF2F2; border:none; color:#EF4444; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:800;">×</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    },

    editGoalPrompt(index) {
        const isAppActive = (index === 'active');
        const goal = isAppActive ? FeelFlow.goals.active : FeelFlow.goals.queue[index];
        if (!goal) return;

        const isStarted = isAppActive && goal.earnedXP > 0;

        if (isStarted) {
            const newReward = prompt("Edit Reward Text:", goal.reward);
            if (newReward) {
                goal.reward = newReward;
                FeelFlow.saveGoals();
                this.renderGoalManager();
                if (typeof renderTrophies === 'function') renderTrophies();
            }
        } else {
            // Full edit for non-started goals
            const newName = prompt("Goal Name:", goal.name);
            if (!newName) return;
            const newTarget = parseInt(prompt("XP Target (50-1000):", goal.targetXP));
            if (isNaN(newTarget)) return;
            const newReward = prompt("Reward Text:", goal.reward);
            if (!newReward) return;

            goal.name = newName;
            goal.targetXP = newTarget;
            goal.reward = newReward;

            FeelFlow.saveGoals();
            this.renderGoalManager();
            if (typeof renderTrophies === 'function') renderTrophies();
        }
    },

    addNewGoal() {
        const nameEl = document.getElementById('newGoalName');
        const targetEl = document.getElementById('newGoalTarget');
        const rewardEl = document.getElementById('newGoalReward');
        const emojiEl = document.getElementById('newGoalEmoji');

        const name = nameEl.value;
        const target = parseInt(targetEl.value);
        const reward = rewardEl.value;
        const emoji = emojiEl.value;

        if (!name || isNaN(target) || !reward) {
            alert("Please fill all fields!");
            return;
        }

        const newGoal = {
            id: 'g_' + Date.now(),
            name, targetXP: target, reward, emoji,
            earnedXP: 0,
            status: 'queued',
            createdAt: new Date().toISOString()
        };

        if (!FeelFlow.goals.active || FeelFlow.goals.active.id === 'g_placeholder') {
            newGoal.status = 'active';
            newGoal.createdAt = new Date().toISOString();
            FeelFlow.goals.active = newGoal;
        } else {
            FeelFlow.goals.queue.push(newGoal);
        }

        FeelFlow.saveGoals();

        // 💡 Reset and Hide Form
        nameEl.value = '';
        targetEl.value = '';
        rewardEl.value = '';
        document.getElementById('addGoalForm').style.display = 'none';

        this.renderGoalManager();
        if (typeof renderTrophies === 'function') renderTrophies();

        console.log("Mission Saved!");
    },

    setTemplateGoal(type) {
        console.log("🛠️ Loading Template:", type);
        const templates = {
            'first': { name: 'First Steps (Starter)', target: 100, emoji: '⭐', reward: 'Special Sticker' },
            'detective': { name: 'Feeling Detective (Check-ins)', target: 200, emoji: '🔍', reward: 'Extra Playtime' },
            'streak': { name: 'Streak Builder (Consistency)', target: 500, emoji: '🔥', reward: 'Small Toy/Prize' }
        };
        const t = templates[type];
        if (t) {
            const nameEl = document.getElementById('newGoalName');
            const targetEl = document.getElementById('newGoalTarget');
            const rewardEl = document.getElementById('newGoalReward');
            const emojiEl = document.getElementById('newGoalEmoji');
            const displayEl = document.getElementById('selectedEmojiDisplay');

            if (nameEl) nameEl.value = t.name;
            if (targetEl) targetEl.value = t.target;
            if (rewardEl) rewardEl.value = t.reward;
            if (emojiEl) emojiEl.value = t.emoji;
            if (displayEl) displayEl.textContent = `Selected: ${t.emoji}`;

            console.log("✅ Template Applied:", t.name);
        }
    },

    deleteGoal(index) {
        if (confirm("Delete this queued goal?")) {
            FeelFlow.goals.queue.splice(index, 1);
            FeelFlow.saveGoals();
            this.renderGoalManager();
        }
    },

    moveGoalUp(index) {
        if (index > 0) {
            const temp = FeelFlow.goals.queue[index];
            FeelFlow.goals.queue[index] = FeelFlow.goals.queue[index - 1];
            FeelFlow.goals.queue[index - 1] = temp;
            FeelFlow.saveGoals();
            this.renderGoalManager();
        }
    },

    renderLegend() {
        const container = document.getElementById('guardianLegend');
        if (!container) return;
        container.innerHTML = Object.entries(this.emotionColors).map(([emo, color]) => `
            <div class="emotion-legend-item" style="display:flex; align-items:center; margin-right:10px;">
                <div style="width:10px; height:10px; border-radius:50%; background:${color}; margin-right:6px;"></div>
                <span style="font-size:0.8rem; color:#64748b; font-weight:600;">${emo}</span>
            </div>
        `).join('');
    },

    renderRecentHistory() {
        const history = safeJSONParse('feelflow_history', []) || [];
        console.log(`🛡️ Rendering Guardian History via UI Module: ${history.length} items`);

        if (typeof UI !== 'undefined' && UI.renderHistory) {
            UI.renderHistory(history, 'guardianRecentHistory');
        } else {
            console.error("UI Module not loaded yet.");
        }
    },

    // 💡 XP Goal Tracking
    loadGoal() {
        const xp = FeelFlow.xp;
        const goal = FeelFlow.goal;
        const percent = Math.min(100, Math.round((xp / goal) * 100));

        const badge = document.getElementById('goalScoreBadge');
        if (badge) {
            badge.textContent = `${xp} / ${goal} XP`;
            badge.style.background = percent > 70 ? '#10b981' : (percent > 30 ? '#fbbf24' : '#ef4444');
        }

        const banner = document.getElementById('goalActionBanner');
        const btnBook = document.getElementById('btnBookNext'); // We might reuse this for "Send Reward"

        if (banner) {
            banner.style.display = 'block';
            if (percent >= 100) {
                banner.innerText = "🎉 Goal Reached! Send a Reward?";
                banner.style.background = "#dcfce7";
                banner.style.color = "#15803d";
                if (btnBook) {
                    btnBook.style.display = 'inline-block';
                    btnBook.innerText = "🎁 Send Reward";
                    btnBook.onclick = () => this.sendMessage("Great job hitting your goal! 🎁");
                }
            } else if (percent < 30) {
                banner.innerText = "💪 Encouragement needed. Send a message?";
                banner.style.background = "#fee2e2";
                banner.style.color = "#b91c1c";
                if (btnBook) {
                    btnBook.style.display = 'inline-block';
                    btnBook.innerText = "💬 Send Message";
                    btnBook.onclick = () => this.promptMessage();
                }
            } else {
                banner.innerText = `👍 ${percent}% to goal. Keep it up!`;
                banner.style.background = "#f1f5f9";
                banner.style.color = "#334155";
                if (btnBook) btnBook.style.display = 'none';
            }
        }
    },

    // 💡 Communication System
    promptMessage() {
        const msg = prompt("Message for Jason:");
        if (msg) this.sendMessage(msg);
    },

    sendMessage(text) {
        let messages = safeJSONParse('feelflow_messages', []) || [];
        messages.push({
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString(),
            read: false,
            from: 'Guardian'
        });
        localStorage.setItem('feelflow_messages', JSON.stringify(messages));
        alert("Message Sent! 📨");
    },


    // 💡 Phase 7: Settings & AI Recommendation


    async generateGoalRecommendation() {
        const likes = document.getElementById('settingLikes').value;
        const box = document.getElementById('aiGoalSuggestion');
        if (!likes) { alert("Please enter preferences first."); return; }

        box.style.display = 'block';
        box.innerHTML = "✨ AI is thinking...";

        // Simulated AI Call (or real if we have endpoint)
        // Let's use real endpoint `EmotionAPI.getAIInsight` but with different prompt?
        // Or just a simulation for now to stay safe.
        // User requested "AI가 추천해주면 어떨까 함".
        // I'll simulate it for speed/stability, or reuse getAIInsight if flexible.
        // Let's simulate for now:
        setTimeout(() => {
            const suggestions = [
                `How about a "2-Week Dinosaur Streak"? Target: 500 XP. Reward: Trip to Museum!`,
                `Minecraft Master Challenge: Target 800 XP. Reward: New Skin Pack!`,
                `Lego Builder Quest: Target 1000 XP. Reward: Small Lego Set!`
            ];
            box.innerHTML = `<strong>💡 Suggestion:</strong><br>${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
        }, 1500);
    },

    // 💡 Settings Page Navigation & Inline Toggles
    openRoutineManager() {
        const content = document.getElementById('settingsRoutineContent');
        if (!content) return;
        const isOpening = content.style.display === 'none';

        // Close others
        document.querySelectorAll('[id^="settings"][id$="Content"]').forEach(el => el.style.display = 'none');

        if (isOpening) {
            content.style.display = 'block';
            this.renderRoutineManager();
        }
    },

    openAlertSettings() {
        const content = document.getElementById('settingsAlertContent');
        if (!content) return;
        const isOpening = content.style.display === 'none';

        document.querySelectorAll('[id^="settings"][id$="Content"]').forEach(el => el.style.display = 'none');

        if (isOpening) {
            content.style.display = 'block';
        }
    },

    // 💡 Override duplicated method with consolidated logic
    renderStats(type = 'today', filteredHistory) {
        const count = filteredHistory.length;
        const avgIntensity = count > 0
            ? (filteredHistory.reduce((acc, h) => acc + (Number(h.intensity) || 0), 0) / count).toFixed(1)
            : 0;
        const streak = parseInt(localStorage.getItem('feelflow_streak')) || 0;

        const statsRow = document.getElementById('guardianStatsRow');
        if (statsRow) {
            statsRow.innerHTML = `
                <div class="ff-stat-item">
                    <span class="ff-stat-number">${count}</span>
                    <span class="ff-stat-label">Check-ins</span>
                </div>
                <div class="ff-stat-item">
                    <span class="ff-stat-number">${avgIntensity}</span>
                    <span class="ff-stat-label">Avg Level</span>
                </div>
                <div class="ff-stat-item">
                    <span class="ff-stat-number">${streak}d</span>
                    <span class="ff-stat-label">Streak</span>
                </div>
            `;
        }

        this.renderMostFrequent(filteredHistory);
        this.renderTopTriggers(filteredHistory);
        this.renderFilteredHistory(filteredHistory);
    },

    renderMostFrequent(history) {
        const container = document.getElementById('guardianMostFrequent');
        if (!container) return;
        if (history.length === 0) {
            container.innerHTML = `<p style="font-size:0.8rem; color:#94a3b8;">No data for this period.</p>`;
            return;
        }

        const counts = {};
        history.forEach(h => counts[h.emotion] = (counts[h.emotion] || 0) + 1);
        const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
        const pct = Math.round((counts[top] / history.length) * 100);

        container.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; background:#F8FAFC; padding:12px 16px; border-radius:12px;">
                <span style="font-size:1.5rem;">${this.getEmoji(top)}</span>
                <div>
                    <div style="font-size:0.85rem; font-weight:800; color:#1A1A2E;">Most Frequent: ${top}</div>
                    <div style="font-size:0.75rem; color:#64748B;">Appeared in ${pct}% of check-ins</div>
                </div>
            </div>
        `;
    },

    renderTopTriggers(history) {
        const container = document.getElementById('guardianTopTriggers');
        if (!container) return;

        const triggerCounts = {};
        history.forEach(h => {
            if (h.triggers && Array.isArray(h.triggers)) {
                h.triggers.forEach(t => triggerCounts[t] = (triggerCounts[t] || 0) + 1);
            }
        });

        const sorted = Object.keys(triggerCounts).sort((a, b) => triggerCounts[b] - triggerCounts[a]).slice(0, 3);

        if (sorted.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <h4 style="font-size:0.9rem; font-weight:800; color:#1A1A2E; margin-bottom:12px;">🎯 Top Triggers</h4>
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
                ${sorted.map(t => `<span style="font-size:0.75rem; font-weight:700; color:#475569; background:#F1F5F9; padding:6px 12px; border-radius:20px;">${t} (${triggerCounts[t]})</span>`).join('')}
            </div>
        `;
    },

    renderFilteredHistory(history) {
        const container = document.getElementById('guardianRecentHistory');
        if (!container) return;

        // Sort descending and take top 3 (Latest first)
        const sortedHistory = [...history].sort((a, b) => {
            const da = new Date(a.timestamp || a.createdAt || 0);
            const db = new Date(b.timestamp || b.createdAt || 0);
            return db - da;
        });
        const displayList = sortedHistory.slice(0, 3);
        if (displayList.length === 0) {
            container.innerHTML = `<p style="font-size:0.85rem; color:#94a3b8;">No check-ins found.</p>`;
            return;
        }

        container.innerHTML = displayList.map(h => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #F1F5F9;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:1.2rem;">${this.getEmoji(h.emotion)}</span>
                    <div>
                        <div style="font-size:0.85rem; font-weight:700; color:#1A1A2E;">${h.emotion}</div>
                        <div style="font-size:0.7rem; color:#94A3B8;">${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
                <div style="font-weight:800; color:${this.emotionColors[h.emotion]}; font-family:var(--ff-font-mono);">
                    ${(h.afterIntensity !== undefined && h.afterIntensity !== h.intensity)
                ? `<span style="font-size:0.7rem; color: ${h.afterIntensity < h.intensity ? '#10B981' : '#EF4444'}">${h.intensity}→${h.afterIntensity}${h.afterIntensity < h.intensity ? '↓' : '↑'}</span>`
                : `Lv.${h.intensity}`}
                </div>
            </div>
        `).join('');

        if (history.length > 3) {
            container.innerHTML += `
                <button onclick="UI.goToScreen('ChildHistory')" style="width:100%; border:none; background:none; color:#6366F1; font-size:0.8rem; font-weight:700; padding:12px 0; cursor:pointer;">See More History →</button>
            `;
        }
    },



    // 💡 Chart.js Integration for "Emotion Weather" (Consolidated)
    renderWeather(type, tabEl) {
        console.log("📊 Rendering Weather Chart:", type);
        this.currentWeatherType = type; // Save for filtering
        const ctx = document.getElementById('guardianChart');
        if (!ctx) return;

        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }

        if (tabEl) {
            document.querySelectorAll('.ff-weather-tab').forEach(t => t.classList.remove('active'));
            tabEl.classList.add('active');
        }

        const history = safeJSONParse('feelflow_history', []) || [];
        const emotionFilter = window.historyFilter ? window.historyFilter.emotion : 'all';

        let filtered = history;
        if (emotionFilter !== 'all') {
            filtered = filtered.filter(h => h.emotion === emotionFilter);
        }

        // Determine Time Range Filtered History
        const now = new Date();
        let timeFiltered = filtered;
        if (type === 'today') {
            const todayStr = now.toDateString();
            timeFiltered = filtered.filter(h => {
                const hDate = new Date(h.timestamp);
                return !isNaN(hDate) && hDate.toDateString() === todayStr;
            });
        } else if (type === 'weekly') {
            const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
            timeFiltered = filtered.filter(h => new Date(h.timestamp) >= weekAgo);
        } else if (type === 'monthly') {
            const monthAgo = new Date(); monthAgo.setDate(now.getDate() - 30);
            timeFiltered = filtered.filter(h => new Date(h.timestamp) >= monthAgo);
        }

        // Render Stats with this filtered set
        this.renderStats(type, timeFiltered);

        // Refresh AI Insight based on this week
        this.generateLocalInsight();

        let labels = [], datasets = [], chartType = 'line';

        if (type === 'today') {
            labels = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'];
            const beforeData = new Array(labels.length).fill(null);
            const afterData = new Array(labels.length).fill(null);

            timeFiltered.forEach(entry => {
                const d = new Date(entry.timestamp || entry.createdAt);
                if (isNaN(d)) return;
                const hour = d.getHours();
                const slotIndex = Math.floor(hour / 3);
                if (slotIndex >= 0 && slotIndex < labels.length) {
                    beforeData[slotIndex] = entry.intensity;
                    afterData[slotIndex] = entry.afterIntensity || null;
                }
            });

            datasets = [
                {
                    label: 'Intensity',
                    data: beforeData,
                    borderColor: '#94a3b8',
                    backgroundColor: '#94a3b8',
                    pointRadius: 6,
                    borderWidth: 2,
                    tension: 0.3,
                    spanGaps: true
                },
                {
                    label: 'After Strategy',
                    data: afterData,
                    borderColor: '#10b981',
                    backgroundColor: '#10b981',
                    pointRadius: 4,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    spanGaps: true
                }
            ];

        } else if (type === 'weekly') {
            chartType = 'bar';
            const pointColors = [];
            const dataPoints = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const dateStr = d.toDateString();
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

                const dayEntries = timeFiltered.filter(h => new Date(h.timestamp).toDateString() === dateStr);
                const maxIntensity = dayEntries.reduce((max, c) => Math.max(max, Number(c.intensity) || 0), 0);
                const dominant = dayEntries.find(h => h.intensity == maxIntensity);

                dataPoints.push(maxIntensity || 0.1);
                pointColors.push(dominant ? (this.emotionColors[dominant.emotion] || '#8b5cf6') : '#f1f5f9');
            }
            datasets = [{
                label: 'Max Intensity',
                data: dataPoints,
                backgroundColor: pointColors,
                borderRadius: 6,
                barThickness: 12
            }];

        } else if (type === 'monthly') {
            chartType = 'bar';
            const dataPoints = [];
            for (let i = 3; i >= 0; i--) {
                const end = new Date(); end.setDate(end.getDate() - (i * 7));
                const start = new Date(end); start.setDate(start.getDate() - 6);
                labels.push(`${start.getMonth() + 1}/${start.getDate()}`);

                const entries = timeFiltered.filter(h => {
                    const d = new Date(h.timestamp);
                    return d >= start && d <= end;
                });
                const avg = entries.length ? (entries.reduce((a, b) => a + (Number(b.intensity) || 0), 0) / entries.length) : 0;
                dataPoints.push(avg);
            }
            datasets = [{
                label: 'Avg Intensity',
                data: dataPoints,
                backgroundColor: '#6366f1',
                borderRadius: 6
            }];
        }

        this.chartInstance = new Chart(ctx, {
            type: chartType,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 10, display: false },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                },
                plugins: { legend: { display: false } }
            }
        });
    },
    generateAIInsight() {
        this.generateLocalInsight();
    },

    async generateLocalInsight() {
        const history = safeJSONParse('feelflow_history', []) || [];
        const box = document.getElementById('aiInsightBox');
        const textField = document.getElementById('aiInsightText');

        if (!history || history.length === 0) {
            if (box) box.style.display = 'none';
            return;
        }

        // 1. Filter Last 7 Days
        const now = new Date();
        const oneWeekAgo = new Date(); oneWeekAgo.setDate(now.getDate() - 7);
        const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(now.getDate() - 14);

        const thisWeek = history.filter(h => new Date(h.timestamp) >= oneWeekAgo);
        const lastWeek = history.filter(h => {
            const d = new Date(h.timestamp);
            return d >= twoWeeksAgo && d < oneWeekAgo;
        });

        // 2. Calculate Metrics
        const calcAvg = (arr) => arr.length ? (arr.reduce((a, b) => a + (Number(b.intensity) || 0), 0) / arr.length).toFixed(1) : 0;
        const countStrats = (arr) => arr.filter(h => h.afterIntensity).length; // Proxy for completed strategy check-in

        const avgThis = calcAvg(thisWeek);
        const avgLast = calcAvg(lastWeek);
        const countThis = thisWeek.length;
        const countLast = lastWeek.length;
        const stratThis = countStrats(thisWeek);
        const stratLast = countStrats(lastWeek);

        // 3. Render Comparison Cards
        if (comparisonBox) {
            comparisonBox.style.display = 'grid';

            const renderCard = (title, val, diff, isGoodUp) => {
                let trend = 'neutral';
                let icon = '➖';
                if (diff > 0) { trend = isGoodUp ? 'up' : 'down'; icon = '↑'; }
                if (diff < 0) { trend = isGoodUp ? 'down' : 'up'; icon = '↓'; } // e.g. Intensity down is 'up' (good)

                // Correction: The class names are ff-trend-up (green), ff-trend-down (red). 
                // Context: 
                // Check-ins: Up is Green? Usually yes (engagement).
                // Intensity: Down is Green.
                // Strategies: Up is Green.

                let colorClass = 'ff-trend-neutral';
                if (title === 'Avg Intensity') {
                    if (diff < 0) colorClass = 'ff-trend-up'; // Green
                    else if (diff > 0) colorClass = 'ff-trend-down'; // Red
                } else {
                    if (diff > 0) colorClass = 'ff-trend-up';
                    else if (diff < 0) colorClass = 'ff-trend-down';
                }

                return `
                    <div class="ff-comparison-card">
                        <span class="ff-comparison-value">${val}</span>
                        <span class="ff-comparison-label">${title}</span>
                        <div class="ff-trend-indicator ${colorClass}">
                            ${diff !== 0 ? `${icon} ${Math.abs(diff).toFixed(1)}` : '-'}
                        </div>
                    </div>
                `;
            };

            comparisonBox.innerHTML = `
                ${renderCard('Check-ins', countThis, countThis - countLast, true)}
                ${renderCard('Avg Intensity', avgThis, (avgThis - avgLast).toFixed(1), false)}
                ${renderCard('Strategies', stratThis, stratThis - stratLast, true)}
            `;
        }

        // 4. Update Insight Text
        if (box && textField) {
            box.style.display = 'block';
            let insight = "Keep tracking to understand patterns better.";

            // Logic: Highest Average Intensity Day
            const dayMap = {};
            thisWeek.forEach(h => {
                const day = new Date(h.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
                if (!dayMap[day]) dayMap[day] = [];
                dayMap[day].push(Number(h.intensity) || 0);
            });

            let maxDay = '', maxVal = 0;
            Object.entries(dayMap).forEach(([d, arr]) => {
                const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
                if (avg > maxVal) { maxVal = avg; maxDay = d; }
            });

            if (maxDay) {
                insight = `Jason's intensity tends to peak on <strong>${maxDay}s</strong> this week.`;
                if (avgThis < avgLast) insight += ` Overall intensity is trending <strong>down</strong> compared to last week. ✅`;
                else if (avgThis > avgLast) insight += ` Intensity is trending <strong>up</strong>. Monitor triggers.`;
            }

            textField.innerHTML = insight;
        }

        // Trigger Analysis (rendered via renderStats/renderTopTriggers now, so we can skip here or call it)
        // this.analyzeTriggers(history);

        // Trigger Analysis
        this.analyzeTriggers(history);

        // Alerts
        if (history && history.length > 0) {
            this.checkEscalationAlerts(history);
        }
    },

    analyzeTriggers(history) {
        const container = document.getElementById('guardianTriggerAnalysis');
        if (!container) return;

        const last7Days = history.filter(h => {
            const d = new Date(h.timestamp);
            const now = new Date();
            return (now - d) < (7 * 24 * 60 * 60 * 1000);
        });

        if (last7Days.length === 0) { container.style.display = 'none'; return; }

        const triggerCounts = {};
        let total = 0;
        last7Days.forEach(h => {
            if (h.triggers && Array.isArray(h.triggers)) {
                h.triggers.forEach(t => {
                    triggerCounts[t] = (triggerCounts[t] || 0) + 1;
                    total++;
                });
            }
        });

        if (total === 0) { container.style.display = 'none'; return; }

        const sorted = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        container.style.display = 'block';
        container.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 16px; border: 1px solid #f1f5f9;">
                <h4 style="font-size: 0.9rem; font-weight: 800; color: #1e293b; margin: 0 0 12px;">🎯 Top Triggers (7 Days)</h4>
                ${sorted.map(([name, count]) => {
            const pct = Math.round((count / total) * 100);
            return `
                        <div class="ff-trigger-item">
                            <div class="ff-trigger-label">${name}</div>
                            <div class="ff-trigger-bar-container">
                                <div class="ff-trigger-bar-fill" style="width: ${pct}%"></div>
                            </div>
                            <div class="ff-trigger-count">${count} (${pct}%)</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    checkEscalationAlerts(history) {
        const banner = document.getElementById('guardianEscalationAlert');
        if (!banner) return;
        banner.style.display = 'none';

        if (!history.length) return;

        const now = new Date();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

        const recent = history.filter(h => new Date(h.timestamp) > oneWeekAgo);
        const highIntensity = recent.filter(h => (Number(h.intensity) || 0) >= 8);
        const last24hHigh = highIntensity.filter(h => new Date(h.timestamp) > oneDayAgo);
        const negativeEmotions = ['Sad', 'Anxious', 'Angry', 'Fear'];
        const hasCritical = recent.some(h => (Number(h.intensity) === 10 && negativeEmotions.includes(h.emotion)));
        const emergencies = recent.filter(h => h.isEmergency);

        let msg = "";
        let type = "";

        if (last24hHigh.length >= 3 || hasCritical || emergencies.length >= 2) {
            type = 'ff-badge-alert';
            msg = `🔴 <strong>Alert:</strong> High intensity detected ${last24hHigh.length} times in last 24h.`;
            banner.style.backgroundColor = '#FEF2F2';
            banner.style.color = '#991B1B';
        } else if (highIntensity.length >= 3 || emergencies.length > 0) {
            type = 'ff-badge-concern';
            msg = `🟠 <strong>Concern:</strong> ${highIntensity.length} high-intensity events this week.`;
            banner.style.backgroundColor = '#FFF7ED';
            banner.style.color = '#9A3412';
        }

        if (msg) {
            banner.className = 'ff-alert-banner'; // Base class
            banner.style.display = 'flex';
            banner.innerHTML = msg;
        }
    },

    saveSettings() {
        const goal = document.getElementById('settingGoal').value;
        const reward = document.getElementById('settingReward').value;
        const likes = document.getElementById('settingLikes').value;

        if (goal) {
            FeelFlow.goal = parseInt(goal);
            localStorage.setItem('feelflow_xp_goal', goal);
        }
        localStorage.setItem('feelflow_reward_text', reward);
        localStorage.setItem('feelflow_child_likes', likes);

        alert("Settings Saved! ✅");

        // Refresh AI or Navigate
        this.generateAIInsight();
        menuNavigate('Guardian');
    },

    loadSettings() {
        const savedGoal = localStorage.getItem('feelflow_goal_msg') || '';
        const goalInput = document.getElementById('guardianGoalInput');
        if (goalInput) goalInput.value = savedGoal;
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
        const profile = GuardianAuth.profile || {};
        const tel = profile.phone || "1234567890";
        window.location.href = `sms:${tel}&body=Jason, Are you okay? I saw your check-in.`;
    },

    sendReaction() {
        localStorage.setItem('parent_reaction', 'heart');
        alert("Sent ❤️ validation to Jason!");
    }
};

window.Guardian = Guardian;
window.GuardianAuth = GuardianAuth;

// 5. 흐름 제어 및 내비게이션
function goHome() {
    // 💡 Redirect based on Role
    if (window.currentUser === 'guardian') {
        UI.goToScreen('Guardian', 'Guardian Dashboard 🛡️');
        // 💡 Phase 13: Refresh Analytics
        if (window.Guardian && Guardian.generateLocalInsight) Guardian.generateLocalInsight();
    } else if (window.currentUser === 'child') {
        UI.goToScreen('1', getGreeting());
        resetAppInput();
        renderHomeQuests();
    } else {
        UI.goToScreen('Landing');
    }

    // 💡 Phase 2: Check for Parent Reaction
    const reaction = localStorage.getItem('parent_reaction');
    if (reaction === 'heart') {
        localStorage.removeItem('parent_reaction'); // Clear it
        setTimeout(() => alert("❤️ Mom/Dad sent you a Cheer Up Heart!"), 500);
    }

    // 💡 Phase 6: Check for Messages
    checkMessages();
}

function checkMessages() {
    if (window.currentUser !== 'child') return;

    const messages = safeJSONParse('feelflow_messages', []) || [];
    const unread = messages.filter(m => !m.read && m.from === 'Guardian');

    if (unread.length > 0) {
        // Show the latest one
        const latest = unread[unread.length - 1];

        // Mark as read
        latest.read = true;
        localStorage.setItem('feelflow_messages', JSON.stringify(messages));

        // Toast or Alert
        setTimeout(() => {
            if (window.UI && window.UI.showXPToast) {
                UI.showXPToast("New Message from Guardian!", latest.text);
            } else {
                alert(`📩 Message from Guardian:\n"${latest.text}"`);
            }
        }, 1000);
    }
}


function startOver() {
    currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
    activeTaskId = null;
    goHome();
}

// 💡 New Trigger Flow
function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5, triggers: [] };

    // Redirect to Trigger Screen first
    renderTriggerScreen();
}

function renderTriggerScreen() {
    const emojiDisplay = document.getElementById('triggerEmojiDisplay');
    const nameDisplay = document.getElementById('triggerNameDisplay');
    const container = document.getElementById('triggerTagContainer');
    const countDisplay = document.getElementById('triggerCountDisplay');
    const nextBtn = document.getElementById('btnNextTrigger');

    if (emojiDisplay) emojiDisplay.textContent = currentEmotion.emoji;
    if (nameDisplay) nameDisplay.textContent = currentEmotion.name;
    if (countDisplay) countDisplay.textContent = "0/3 selected";
    if (nextBtn) nextBtn.disabled = true;

    if (!container) return;

    // Reset scroll
    container.scrollTop = 0;

    // 2. Define Triggers — 감정별 매핑
    const triggerMap = {
        'Happy': [
            { id: 'friends', text: '👫 Fun with Friends' },
            { id: 'family', text: '👨👩👦 Family Time' },
            { id: 'reward', text: '🎁 Got Reward' },
            { id: 'grade', text: '📝 Good Grade' },
            { id: 'task', text: '✅ Completed Task' },
            { id: 'play', text: '🎮 Free Time' },
            { id: 'food', text: '🍕 Good Food' },
            { id: 'music', text: '🎵 Music' },
            { id: 'nature', text: '🌳 Outside Time' },
            { id: 'other', text: '✏️ Other' }
        ],
        'Sad': [
            { id: 'lonely', text: '🧍 Feeling Lonely' },
            { id: 'missing', text: '💭 Missing Someone' },
            { id: 'grade', text: '📉 Bad Grade' },
            { id: 'leftout', text: '😔 Left Out' },
            { id: 'tired', text: '😴 Tired' },
            { id: 'argument', text: '💬 Argument' },
            { id: 'bored', text: '😑 Bored' },
            { id: 'family', text: '👨👩👦 Family' },
            { id: 'school', text: '🏫 School' },
            { id: 'other', text: '✏️ Other' }
        ],
        'Anxious': [
            { id: 'presentation', text: '📊 Presentation' },
            { id: 'test', text: '📝 Test / Exam' },
            { id: 'noise', text: '🔊 Too Loud' },
            { id: 'routine', text: '🔄 Change in Plan' },
            { id: 'new', text: '🆕 New Situation' },
            { id: 'crowd', text: '👥 Crowded Place' },
            { id: 'school', text: '🏫 School' },
            { id: 'friends', text: '👫 Classmates' },
            { id: 'waiting', text: '⏳ Waiting' },
            { id: 'other', text: '✏️ Other' }
        ],
        'Angry': [
            { id: 'argument', text: '💬 Argument' },
            { id: 'unfair', text: '⚖️ Unfair' },
            { id: 'friends', text: '👫 Classmates' },
            { id: 'noise', text: '🔊 Too Loud' },
            { id: 'waiting', text: '⏳ Waiting Too Long' },
            { id: 'misunderstood', text: '🤷 Misunderstood' },
            { id: 'rules', text: '🚫 Rules / Limits' },
            { id: 'family', text: '👨👩👦 Family' },
            { id: 'school', text: '🏫 School' },
            { id: 'other', text: '✏️ Other' }
        ],
        'Calm': [
            { id: 'rest', text: '😌 Resting' },
            { id: 'music', text: '🎵 Music' },
            { id: 'nature', text: '🌳 Outside Time' },
            { id: 'family', text: '👨👩👦 Family Time' },
            { id: 'play', text: '🎮 Free Time' },
            { id: 'food', text: '🍕 Good Food' },
            { id: 'exercise', text: '🏃 Exercise' },
            { id: 'reading', text: '📖 Reading' },
            { id: 'breathing', text: '🫁 After Breathing' },
            { id: 'other', text: '✏️ Other' }
        ],
        'Tired': [
            { id: 'sleep', text: '😴 Bad Sleep' },
            { id: 'school', text: '🏫 Long School Day' },
            { id: 'overstim', text: '🌀 Overstimulated' },
            { id: 'exercise', text: '🏃 Physical Activity' },
            { id: 'bored', text: '😑 Bored' },
            { id: 'hungry', text: '🍽️ Hungry' },
            { id: 'late', text: '🌙 Stayed Up Late' },
            { id: 'screen', text: '📱 Too Much Screen' },
            { id: 'sick', text: '🤒 Not Feeling Well' },
            { id: 'other', text: '✏️ Other' }
        ]
    };

    // Fallback: 매핑에 없는 감정이면 범용 트리거
    const defaultTriggers = [
        { id: 'school', text: '🏫 School' },
        { id: 'friends', text: '👫 Classmates' },
        { id: 'family', text: '👨👩👦 Family' },
        { id: 'noise', text: '🔊 Too Loud' },
        { id: 'routine', text: '🔄 Change in Plan' },
        { id: 'presentation', text: '📊 Presentation' },
        { id: 'tired', text: '😴 Tired' },
        { id: 'hungry', text: '🍽️ Hungry' },
        { id: 'argument', text: '💬 Argument' },
        { id: 'other', text: '✏️ Other' }
    ];

    const triggers = triggerMap[currentEmotion.name] || defaultTriggers;

    // 감정별 질문 텍스트
    const questionEl = document.getElementById('triggerQuestion');
    const questionMap = {
        'Happy': "What made you happy?",
        'Sad': "What's making you sad?",
        'Anxious': "What's worrying you?",
        'Angry': "What made you angry?",
        'Calm': "What helped you feel calm?",
        'Tired': "Why do you feel tired?"
    };
    if (questionEl) questionEl.textContent = questionMap[currentEmotion.name] || "What happened?";

    // 3. Render Tags
    if (container) {
        container.innerHTML = triggers.map(t => `
            <button id="trig-${t.id}" class="ff-tag-btn" onclick="toggleTrigger('${t.id}', '${t.text.replace("'", "\\'")}')">
                ${t.text}
            </button>
        `).join('');
    }

    currentEmotion.triggers = [];
    UI.goToScreen('Trigger');
}

function toggleTrigger(id, text) {
    const el = document.getElementById(`trig-${id}`);
    if (!el) return;

    if (!currentEmotion.triggers) currentEmotion.triggers = [];
    const idx = currentEmotion.triggers.indexOf(text);

    if (idx > -1) {
        // Remove
        currentEmotion.triggers.splice(idx, 1);
        el.classList.remove('selected');
    } else {
        // Add (max 3)
        if (currentEmotion.triggers.length < 3) {
            currentEmotion.triggers.push(text);
            el.classList.add('selected');
            el.classList.add('animate-tag-pop');
            setTimeout(() => el.classList.remove('animate-tag-pop'), 200);
        } else {
            // Haptic feedback for "too many"
            safeVibrate([50, 50]);
            return;
        }
    }

    // Update UI
    const countDisplay = document.getElementById('triggerCountDisplay');
    if (countDisplay) countDisplay.textContent = `${currentEmotion.triggers.length}/3 selected`;

    const nextBtn = document.getElementById('btnNextTrigger');
    if (nextBtn) nextBtn.disabled = (currentEmotion.triggers.length === 0);

    safeVibrate(10);
}

function submitTriggers() {
    // Go to Next Screen (Intensity)
    const emojiEl = document.getElementById('selectedEmoji');
    const nameEl = document.getElementById('selectedName');
    const triggersEl = document.getElementById('selectedTriggersDisplay');

    if (emojiEl) emojiEl.textContent = currentEmotion.emoji;
    if (nameEl) nameEl.textContent = currentEmotion.name;

    if (triggersEl) {
        triggersEl.innerHTML = currentEmotion.triggers.map(t => `
            <span class="flex items-center gap-1 rounded-full px-2.5 py-1" style="background:#F3F4F6; text-[0.75rem]; color:#6B7280; display:flex; gap:4px; align-items:center;">
                ${t}
            </span>
        `).join('');
    }

    // Reset Slider
    const slider = document.getElementById('intensitySlider');
    const display = document.getElementById('intensityDisplay');
    const fill = document.getElementById('sliderFill');
    const circle = document.getElementById('intensityCircle');

    if (slider) slider.value = 5;
    if (display) display.textContent = '5';
    if (fill) fill.style.width = '44.44%';
    if (circle) circle.style.transform = 'scale(1.066)'; // (1 + (5 - 1) * (0.15 / 9))

    currentEmotion.intensity = 5;

    // Reset background wash
    const screen2 = document.getElementById('screen2');
    if (screen2) screen2.style.backgroundColor = `rgba(108, 92, 231, ${((5 - 1) / 9) * 0.04})`;

    UI.goToScreen('2', "How strong is it?");
}

function skipTriggers() {
    currentEmotion.triggers = [];
    submitTriggers();
}

// 💡 Remeasure Logic
function updateRemeasure(val) {
    const intensity = parseInt(val);
    const display = document.getElementById('remeasureDisplay');
    if (display) display.innerText = val;

    // Update Fill Bar
    const fill = document.getElementById('remeasureFill');
    if (fill) {
        const fillPct = ((intensity - 1) / 9) * 100;
        fill.style.width = `${fillPct}%`;
    }

    // Update Circle Scale
    const circle = document.getElementById('remeasureCircle');
    if (circle) {
        const circleScale = 1 + (intensity - 1) * (0.15 / 9);
        circle.style.transform = `scale(${circleScale})`;
    }

    safeVibrate(5);
}

function submitRemeasure() {
    const val = document.getElementById('remeasureSlider').value;
    currentEmotion.afterIntensity = parseInt(val);
    window.finishCheckIn(); // Re-call finish to save
}

function startQuest(taskId, title) {
    activeTaskId = taskId;
    if (window.Activities) window.Activities.setupActivity(title, taskId);
}

function updateIntensity(val) {
    const intensity = parseInt(val);
    currentEmotion.intensity = intensity;

    // Update Display
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;

    // Update Fill Bar
    const fill = document.getElementById('sliderFill');
    if (fill) {
        const fillPct = ((intensity - 1) / 9) * 100;
        fill.style.width = `${fillPct}%`;
    }

    // Update Circle Scale
    const circle = document.getElementById('intensityCircle');
    if (circle) {
        const circleScale = 1 + (intensity - 1) * (0.15 / 9);
        circle.style.transform = `scale(${circleScale})`;
    }

    // Update Background Wash
    const screen2 = document.getElementById('screen2');
    if (screen2) {
        const bgWashOpacity = ((intensity - 1) / 9) * 0.04;
        screen2.style.backgroundColor = `rgba(108, 92, 231, ${bgWashOpacity})`;
    }

    safeVibrate(5);
}

// 💡 [최종 교정] goToResult: ui.js 0215 버전 지능형 전략 엔진 연동
function goToResult() {
    console.log("🎯 전략 엔진 가동: 강도별 맞춤 카드 생성");

    // Populate V0 Context Strip
    const resultEmoji = document.getElementById('resultEmoji');
    const resultColorDot = document.getElementById('resultColorDot');
    const resultName = document.getElementById('resultName');
    const resultIntensity = document.getElementById('resultIntensity');
    const resultTrigger = document.getElementById('resultTrigger');

    if (resultEmoji) resultEmoji.textContent = currentEmotion.emoji;
    if (resultColorDot) resultColorDot.style.backgroundColor = currentEmotion.color;
    if (resultName) resultName.textContent = currentEmotion.name;
    if (resultIntensity) resultIntensity.textContent = `Intensity ${currentEmotion.intensity}`;
    if (resultTrigger) {
        resultTrigger.textContent = (currentEmotion.triggers && currentEmotion.triggers.length > 0)
            ? currentEmotion.triggers.join(', ')
            : 'No triggers';
    }

    // 💡 강도(intensity)를 함께 전달하여 Happy 1단계 '🌱' 분기 활성화
    console.log("Calling renderStrategies with:", currentEmotion.name, currentEmotion.intensity);
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name, currentEmotion.intensity);
    }

    UI.goToScreen('4', "Strategies for Jason");
}

// 6. 데이터 저장 및 보상 지급 파이프라인
window.finishCheckIn = async function () {
    // 💡 [New] Intercept: Logic - If we haven't done re-measurement yet
    if (currentEmotion.afterIntensity === undefined) {
        console.log("⏳ Intercepting Finish: Go to Re-measure");

        const remeasureBefore = document.getElementById('remeasureBeforeVal');
        const remeasureSlider = document.getElementById('remeasureSlider');
        const remeasureDisplay = document.getElementById('remeasureDisplay');
        const remeasureEmoji = document.getElementById('remeasureEmoji');
        const remeasureFill = document.getElementById('remeasureFill');
        const remeasureCircle = document.getElementById('remeasureCircle');

        // Setup Re-measure Screen
        if (remeasureBefore) remeasureBefore.innerText = currentEmotion.intensity;
        if (remeasureEmoji) remeasureEmoji.innerText = currentEmotion.emoji;

        // Default slider to current intensity for easier comparison
        const startVal = currentEmotion.intensity || 5;
        if (remeasureSlider) remeasureSlider.value = startVal;
        if (remeasureDisplay) remeasureDisplay.innerText = startVal;

        // Sync fill and circle
        if (remeasureFill) remeasureFill.style.width = `${((startVal - 1) / 9) * 100}%`;
        if (remeasureCircle) remeasureCircle.style.transform = `scale(${1 + (startVal - 1) * (0.15 / 9)})`;

        UI.goToScreen('Remeasure');
        return; // Stop here, wait for submitRemeasure
    }

    console.log("🏁 시퀀스 종료: 서버 전송 및 보상 확정");

    const entry = {
        emotion: currentEmotion.name,
        intensity: currentEmotion.intensity,
        afterIntensity: currentEmotion.afterIntensity, // Included
        triggers: currentEmotion.triggers || [],       // Included
        isEmergency: currentEmotion.isEmergency || false, // 🆕 Emergency Flag
        note: document.getElementById('actionNote')?.value || "",
        photo: window.lastCapturedPhoto || null,
        activityData: window.lastActivityData || null, // 💡 Capture Activity Details
        timestamp: new Date().toISOString()
    };

    // Reset global activity data
    window.lastActivityData = null;

    try {
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);

        // 💡 XP Calculation (Phase 7)
        // Base Emotion: 30 XP
        // Note or Photo: +50 XP
        let earnedXP = 30;
        let reasons = [`Checking in: ${entry.emotion}`];

        if (entry.note || entry.photo) {
            earnedXP += 50;
            reasons.push("Journaling/Photo Bonus 📸");
        }

        // Trigger Bonus? Maybe later.

        // Add XP
        FeelFlow.addXP(earnedXP, reasons.join(' + '));

        activeTaskId = null;
        if (window.Activities) window.Activities.stopAll();

        // Pass XP to Screen 5 for Animation
        const screen5 = document.getElementById('screen5');
        if (screen5) {
            screen5.dataset.earnedXp = earnedXP;
            screen5.dataset.emotion = entry.emotion;

            // 💡 Update Final Message with Delta
            const finalP = document.getElementById('finalMessage');
            if (finalP) {
                const diff = entry.intensity - entry.afterIntensity;
                let msg = `Emotion Recorded.`;
                if (diff > 0) msg = `Before: ${entry.intensity} → After: ${entry.afterIntensity} (↓${diff} Improved!)`;
                else if (diff < 0) msg = `Before: ${entry.intensity} → After: ${entry.afterIntensity} (↑ Intensified)`;
                else msg = `Before: ${entry.intensity} → After: ${entry.afterIntensity} (No Change)`;
                finalP.innerText = msg;
            }
        }

        UI.goToScreen('5');

        // 💡 Phase 2: Guardian Trigger (Simulation)
        if (['Angry', 'Sad', 'Anxious'].includes(entry.emotion) && entry.intensity >= 8) {
            // ... existing trigger logic
        }
        if (['Angry', 'Sad', 'Anxious'].includes(entry.emotion) && entry.intensity >= 8) {
            // In real app, this sends FCM. Here we set a flag or just let Guardian Screen detect it.
            // Let's show a simulated "Push Notification" toast if we are in "Demo Mode" or just log it.
            console.log("🚨 [Guardian Trigger] High intensity negative emotion detected!");
            setTimeout(() => alert("📱 [Parent's Phone] \n\nFeelFlow Alert:\nJason is feeling very " + entry.emotion + " (Lv." + entry.intensity + ").\nCheck the app now!"), 1000);
        }

        // 💡 Crisis Auto-Prompt Logic
        if (['Sad', 'Anxious'].includes(entry.emotion) && entry.intensity >= 9) {
            const lastPrompt = localStorage.getItem('feelflow_crisis_prompt_date');
            const today = new Date().toDateString();

            if (lastPrompt !== today) {
                setTimeout(() => {
                    if (confirm("If you're going through a really hard time, there are people who can help. 💙\n\nSee resources?")) {
                        UI.goToScreen('screenCrisis');
                    }
                    localStorage.setItem('feelflow_crisis_prompt_date', today);
                }, 1500);
            }
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
    container.innerHTML = displayTasks.map(t => {
        const isChild = t.owner === 'child';
        const isGuardian = t.owner === 'guardian';
        const badge = isGuardian ? '🔒' : (isChild ? '⭐' : ''); // Small text badge/icon

        return `
            <div id="home-task-${t.id}" class="home-quest-item" onclick="handleRoutineCheck('${t.id}', 'home')">
                <div class="custom-checkbox"></div>
                <div style="flex:1;">
                    <span class="routine-text">${t.text}</span>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">
                        ${badge} ${t.points || 10} XP
                    </div>
                </div>
            </div>
            `;
    }).join('');
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
    const displayList = tasks.filter(t => t.active !== false); // Use displayList instead of activeTasks to match
    // const done = activeTasks.filter(t => t.completed).length; // helper vars moved down
    // const total = activeTasks.length;
    // const percent = total === 0 ? 0 : (done / total) * 100;

    const completedCount = displayList.filter(t => t.completed).length;
    const totalCount = displayList.length;

    // Update Progress Bar
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    document.getElementById('progressBar').style.width = `${progress}%`;
    document.getElementById('progressFraction').textContent = `${completedCount}/${totalCount}`;

    // Calc Earned XP for today (visual only)
    const earnedXP = displayList.reduce((acc, t) => acc + (t.completed ? (t.points || 10) : 0), 0);

    const listContainer = document.getElementById('taskList');
    listContainer.innerHTML = displayList.map(t => {
        const completedClass = t.completed ? 'completed' : '';
        const checkAction = `handleRoutineCheck('${t.id}', 'routine')`;

        // 💡 Visual Indicators
        const isActive = true; // All are active in this view for now

        // Only show active tasks in the list for now to keep it clean, 
        // Or show disabled ones with lower opacity
        if (!isActive) return '';

        const isChild = t.owner === 'child';
        const isGuardian = t.owner === 'guardian';
        const badge = isGuardian ? '🔒' : (isChild ? '⭐' : '');
        const points = t.points || 10;

        return `
            <div class="ff-routine-item ${completedClass}" id="routine-${t.id}" onclick="${checkAction}">
                <div class="ff-routine-checkbox"></div>
                <div style="flex:1;">
                    <div class="ff-routine-text">${badge} ${t.text}</div>
                    <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">+${points} XP</div>
                </div>
                ${isChild ? `<button class="ff-delete-btn" style="background:none; border:none; color:#FCA5A5; font-size:1.2rem; padding:0 8px;" onclick="event.stopPropagation(); deleteChildRoutine('${t.id}')">×</button>` : ''}
            </div>
            `;
    }).join('') + `
            <div style="margin-top: 16px; padding: 0 4px;">
                <button onclick="addChildRoutinePrompt()" class="ff-btn-primary" style="background:#F1F5F9; color:#475569; border:2px dashed #CBD5E1;">
                    ➕ Add My Routine
                </button>
            </div>
            
            <div style="margin-top: 24px; text-align: center; color: #94A3B8; font-size: 0.8rem;">
                Today: ${completedCount}/${totalCount} completed · ${earnedXP} XP earned
            </div>`;

    if (typeof UI !== 'undefined' && UI.updateNavActive) UI.updateNavActive('navRoutine');
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
        // Active tasks only for completion check
        // 💡 XP System Integration (Phase 7)
        if (task.completed) {
            FeelFlow.addXP(10, `Done: ${task.text}`); // Individual: 10XP
        } else {
            FeelFlow.removeXP(10);
        }

        const activeTasks = DailyRoutines[tab].filter(t => t.active !== false);
        if (task.completed && activeTasks.every(t => t.completed)) {
            // Unify logic for Perfect Day / Slot completion
            // For now, let's treat "Morning Complete" or "Evening Complete" as a milestone

            // 💡 Perfect Day Logic (All slots done?) - lets keep it simple: Slot Completion Bonus
            const bonusXP = 10;
            FeelFlow.addXP(bonusXP, `${tab.charAt(0).toUpperCase() + tab.slice(1)} Routines Done! 🌟`);

            // 💡 Streak Logic
            const today = new Date().toDateString();
            const lastStreak = localStorage.getItem('feelflow_last_streak_date');
            let currentStreak = parseInt(localStorage.getItem('feelflow_streak')) || 0;

            if (lastStreak !== today) {
                // If yesterday was the last streak date, increment. If older, reset?
                // Simple logic: If they complete a set today, increment streak.
                // But check if they already incremented today?
                // Let's increment streak only if it wasn't incremented today.

                // Logic: Check if ALL daily routines (morning + evening) are done?
                // Or just if they improved consistency.
                // Let's go with: If they complete *any* full slot (morning OR evening), streak++

                currentStreak++;
                localStorage.setItem('feelflow_streak', currentStreak);
                localStorage.setItem('feelflow_last_streak_date', today);

                if (currentStreak % 3 === 0) {
                    FeelFlow.addXP(20, `🔥 ${currentStreak}-Day Streak Bonus!`);
                    alert(`🔥 ${currentStreak}-Day Streak! +20 XP!`);
                }
            }

            if (window.UI && window.UI.showXPAnimation) {
                window.UI.showXPAnimation();
            } else {
                alert(`🎉 Fantastic! All tasks done! +${bonusXP} XP!`);
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

function addChildRoutinePrompt() {
    const text = prompt("What routine do you want to add?");
    if (!text) return;
    const slot = document.getElementById('tabMorning').classList.contains('active') ? 'morning' : 'evening';

    // Child items: 5 points, unique ID, owner='child'
    const newId = 'c' + Date.now();

    if (!DailyRoutines[slot]) DailyRoutines[slot] = [];
    DailyRoutines[slot].push({
        id: newId,
        text: text,
        completed: false,
        owner: 'child',
        points: 5,
        timeSlot: slot
    });

    // Haptic Feedback
    safeVibrate([50, 50]);
    alert(`Created "${text}"! (+5 XP if you do it!)`);

    localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
    renderRoutineScreen();
}

function deleteChildRoutine(id) {
    const slot = document.getElementById('tabMorning').classList.contains('active') ? 'morning' : 'evening';
    const t = DailyRoutines[slot].find(x => x.id === id);
    if (t && t.owner === 'child') {
        if (confirm(`Remove "${t.text}"?`)) {
            DailyRoutines[slot] = DailyRoutines[slot].filter(x => x.id !== id);
            localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
            renderRoutineScreen();
        }
    } else {
        alert("You can't remove this routine. Ask your Guardian!");
    }
}

// 💡 Phase 2: Goal Message Management (Updated for XP)
function editGoalMessage() {
    const current = FeelFlow.goal;
    const newGoal = prompt("Enter new XP Goal (default 1000):", current);
    if (newGoal && !isNaN(newGoal)) {
        FeelFlow.setGoal(parseInt(newGoal));
        renderTrophyStats();
    }
}
window.editGoalMessage = editGoalMessage;

// 5. 트로피 시스템 (Goal Lifecycle Redesign)
function renderTrophies() {
    const active = FeelFlow.goals.active;
    const pending = FeelFlow.goals.pendingReward;
    const queue = FeelFlow.goals.queue;
    const history = FeelFlow.goals.completed;

    // --- Pending Reward (Achievement!) ---
    const pendingContainer = document.getElementById('pendingGoalContainer');
    if (pendingContainer) {
        if (pending) {
            pendingContainer.style.display = 'block';
            pendingContainer.innerHTML = `
                <div class="ff-quest-summary-card" style="border-color: #F59E0B; background: #FFFBEB;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="ff-quest-icon-circle" style="background: #FEF3C7; color: #F59E0B;">
                            <span style="font-size: 1.2rem;">${pending.emoji}</span>
                        </div>
                        <div style="text-align: left;">
                            <p style="font-size: 0.95rem; font-weight: 800; color: #1A1A2E; margin: 0;">Goal Accomplished!</p>
                            <p style="font-size: 0.75rem; color: #92400E; margin: 0;">${pending.name}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: block; font-size: 0.7rem; color: #B45309; font-weight: 700;">PENDING</span>
                        <span style="font-size: 1.25rem;">🎁</span>
                    </div>
                </div>
            `;
        } else {
            pendingContainer.style.display = 'none';
        }
    }

    // --- Active Goal ---
    const activeContainer = document.getElementById('activeGoalContainer');
    if (active && activeContainer) {
        const earned = active.earnedXP || 0;
        const target = active.targetXP || 1000;
        const percent = Math.min(100, Math.round((earned / target) * 100));

        // Calculate Days Active
        const now = new Date();
        const start = new Date(active.createdAt || active.startedAt || now);
        const days = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));

        document.getElementById('activeGoalEmoji').textContent = active.emoji;
        document.getElementById('activeGoalName').textContent = active.name;
        document.getElementById('activeGoalReward').textContent = active.reward;
        document.getElementById('activeGoalBar').style.width = percent + '%';
        document.getElementById('activeGoalCurrentXP').textContent = earned + ' XP';
        document.getElementById('activeGoalTargetXP').textContent = target + ' XP';

        const daysEl = document.getElementById('activeGoalDays');
        if (daysEl) daysEl.textContent = `Day ${days}`;
    }

    const queueContainer = document.getElementById('goalQueueContainer');
    if (queueContainer) {
        if (!queue || queue.length === 0) {
            queueContainer.innerHTML = `
                <div class="ff-queue-item" style="opacity: 0.6; border-style: dashed;">
                    <div class="ff-queue-icon">🔒</div>
                    <div style="font-size: 0.9rem; font-weight: 600; color: #94A3B8;">Queue is empty</div>
                </div>`;
        } else {
            // V0-style queue items
            queueContainer.innerHTML = queue.slice(0, 2).map(q => `
                <div class="ff-queue-item">
                    <div class="ff-queue-icon">${q.emoji}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.9rem; font-weight: 800; color: #1A1A2E;">${q.name}</div>
                        <div style="font-size: 0.7rem; color: #9CA3AF; font-weight: 600;">Reward: ${q.reward}</div>
                    </div>
                    <div style="font-size: 1.25rem;">🎁</div>
                </div>
            `).join('');
        }
    }

    const historyContainer = document.getElementById('goalHistoryContainer');
    if (historyContainer) {
        if (!history || history.length === 0) {
            historyContainer.innerHTML = `<div style="grid-column: span 2; text-align:center; color:#9CA3AF; font-size:0.9rem; padding:40px;">No trophies yet. Keep going! 🏆</div>`;
        } else {
            // Trophy Case Grid
            historyContainer.innerHTML = history.slice(0, 10).map((h, idx) => `
                <div class="ff-trophy-item">
                    <span class="ff-trophy-icon">${h.emoji}</span>
                    <span class="ff-trophy-name">${h.name}</span>
                    <span class="ff-trophy-date">${new Date(h.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
            `).join('');
        }
    }

    UI.updateNavActive('navTrophies');
}

// Replaces renderTrophyStats as main render function
window.renderTrophies = renderTrophies;
function renderTrophyStats() { renderTrophies(); } // Backwards compatibility

// 💡 Fix: Robust Audio Check (Prevents crash if Audio API is missing)
const AudioContextVal = window.AudioContext || window.webkitAudioContext;
// let audioCtx; // 💡 Removed to prevent "Identifier already declared" error

try {
    if (AudioContextVal) {
        // 💡 Attach to window to be safe against re-declarations
        if (!window.audioCtx) {
            window.audioCtx = new AudioContextVal();
        }
    } else {
        console.warn("⚠️ Web Audio API not supported on this device.");
    }
} catch (e) {
    console.error("❌ AudioContext Init Failed:", e);
}
function playSound(type = 'tap') {
    const ctx = window.audioCtx; // 💡 Local reference
    if (!window.userInteracted || !ctx) return;
    try {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'tap') {
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } else if (type === 'success') {
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
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

// 💡 Auth & Interaction Mode
window.currentUser = localStorage.getItem('feelflow_mode') || null;

window.setMode = function (mode) {
    window.currentUser = mode;
    localStorage.setItem('feelflow_mode', mode);

    if (mode === 'child') {
        UI.goToScreen('1', getGreeting());
    } else if (mode === 'guardian') {
        UI.goToScreen('Login', 'Guardian Login');
    } else {
        UI.goToScreen('Landing');
    }
};

window.logout = function () {
    window.currentUser = null;
    localStorage.removeItem('feelflow_mode');
    UI.goToScreen('Landing');
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');
};

window.menuNavigate = (target, event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');

    // 💡 Dynamic Navigation
    if (target === 'SwitchUser') {
        logout();
        return;
    }

    const screenMap = {
        'Home': '1', // Child Home
        'Routine': 'screenTracker',
        'Trophies': 'screenTrophies',
        'History': 'screenJourney',   // Child History
        'Guardian': 'screenGuardian',  // Guardian Dashboard
        'GuardianSettings': 'screenGuardianSettings',
        'ChildHistory': 'screenJourney', // Guardian viewing Child Journey
        'Crisis': 'screenCrisis' // 💡 New Crisis Screen
    };

    // Guardian going to Home -> Dashboard
    if (window.currentUser === 'guardian' && target === 'Home') {
        UI.goToScreen('Guardian', 'Guardian Dashboard 🛡️');
        return;
    }

    const tid = screenMap[target.trim()];
    if (tid) {
        // ... (existing title logic or just pass null to let UI handle it)
        let title = null;
        if (target === 'Routine') title = 'Daily Routine';
        if (target === 'Trophies') title = 'My Trophies 🏆';
        if (target === 'History') title = 'My Journey 📅';
        if (target === 'Guardian') title = 'Guardian Dashboard 🛡️';
        if (target === 'GuardianSettings') title = 'Guardian Settings ⚙️';

        // Pass Greeting if Home
        if (target === 'Home' && window.currentUser === 'child') title = getGreeting();

        UI.goToScreen(tid, title);

        // Optional: Trigger renders if needed (though UI.renderScreen might handle basic init)
        if (tid === 'screenTracker' && typeof renderRoutineScreen === 'function') setTimeout(renderRoutineScreen, 100);
        if (tid === 'screenTrophies' && typeof renderTrophyStats === 'function') setTimeout(renderTrophyStats, 100);
        if (tid === 'screenGuardian' && typeof Guardian !== 'undefined' && Guardian.renderDashboard) setTimeout(() => Guardian.renderDashboard(), 100);

    } else {
        goHome();
    }
};

// 💡 Phase 2.5: Global EmotionAPI Definition (moved out of menuNavigate)
// [Removed redundant fetchHistory - use EmotionAPI.fetchHistory instead]

// Helper for History if not in api.js
async function fetchHistoryHelper() {
    let history = safeJSONParse('feelflow_history', []) || [];
    if (history.length === 0) {
        const today = new Date();
        const yest = new Date(today); yest.setDate(yest.getDate() - 1);

        history = [
            { timestamp: new Date(today.setHours(10, 30)).toISOString(), emotion: "Happy", emoji: "😊", intensity: 7, note: "Played soccer with friends!", photo: null },
            { timestamp: new Date(today.setHours(18, 0)).toISOString(), emotion: "Proud", emoji: "😎", intensity: 9, note: "Finished my lego castle", photo: null },
            { timestamp: new Date(yest.setHours(20, 15)).toISOString(), emotion: "Calm", emoji: "😌", intensity: 5, note: "Reading before bed", photo: null }
        ];
        localStorage.setItem('feelflow_history', JSON.stringify(history));
    }
    return history;
}

// Extend existing Window.EmotionAPI or Create
if (!window.EmotionAPI) window.EmotionAPI = {};

window.EmotionAPI.fetchHistory = fetchHistoryHelper;
window.EmotionAPI.saveCheckIn = async (data) => {
    let history = safeJSONParse('feelflow_history', []) || [];
    history.push(data);
    localStorage.setItem('feelflow_history', JSON.stringify(history));
    return true;
};



// 💡 Removed duplicate window.initApp to use the async version below

// 전역 바인딩
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.goToResult = goToResult;
window.switchRoutine = switchRoutine;
window.toggleHomeRoutine = toggleHomeRoutine;
window.goHome = goHome;
window.startOver = startOver;
window.startQuest = startQuest;
window.renderTrophies = renderTrophies;

window.selectGoalEmoji = function (emoji) {
    const el = document.getElementById('newGoalEmoji');
    const display = document.getElementById('selectedEmojiDisplay');
    if (el) el.value = emoji;
    if (display) display.textContent = `Selected: ${emoji}`;

    // Visually highlight
    document.querySelectorAll('.emoji-option').forEach(opt => opt.style.background = 'none');
    if (event && event.target) {
        event.target.style.background = '#ddd6fe';
        event.target.style.borderRadius = '8px';
    }
};

if (window.UI) {
    window.UI.showAddGoalForm = function () {
        const form = document.getElementById('addGoalForm');
        if (form) {
            form.style.display = (form.style.display === 'none' || form.style.display === '') ? 'block' : 'none';
            form.scrollIntoView({ behavior: 'smooth' });
        }
    };
}

/* 🚨 EMERGENCY MODE LOGIC 🚨 */

let emergencyStrategies = [];
let currentEmergencyIndex = 0;

window.startEmergencyMode = function () {
    console.log("🚨 Emergency Mode Activated!");

    // 1. Initialize Emergency State
    currentEmotion = { name: 'Emergency', emoji: '🆘', intensity: 10, isEmergency: true, triggers: ['Emergency Button'] };

    // 2. Hide specific UI elements (Header, FAB)
    const header = document.querySelector('.app-header');
    const fab = document.getElementById('btnEmergencyFAB');
    if (header) header.style.display = 'none';
    if (fab) fab.style.display = 'none';

    // 3. Algorithm: Find Best Strategies
    emergencyStrategies = getBestEmergencyStrategies();
    currentEmergencyIndex = 0;

    // 4. Render First Strategy
    renderEmergencyStrategy();

    // 5. Navigate
    // We manually show screenEmergency to bypass normal flow checks
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screenEmergency').classList.add('active');

    // 6. Notify Guardian (Silent Alert)
    addGuardianAlert('Emergency Mode Activated', 'High');
};

function getBestEmergencyStrategies() {
    const candidates = ['Deep Breathing', '5-4-3-2-1 Grounding', 'Squeeze & Release', 'Hold Something Cold', 'Mindful Moment'];
    const history = safeJSONParse('feelflow_history', []) || [];

    // Calculate effectiveness for each candidate
    const scores = candidates.map(type => {
        const attempts = history.filter(h => h.activityData === type && h.afterIntensity !== undefined);
        if (attempts.length === 0) return { type, score: 0 }; // Default score

        const totalDelta = attempts.reduce((sum, h) => sum + ((h.intensity || 10) - h.afterIntensity), 0);
        return { type, score: totalDelta / attempts.length };
    });

    // Sort by score (descending) -> Best first
    return scores.sort((a, b) => b.score - a.score).map(s => s.type);
}

function renderEmergencyStrategy() {
    if (emergencyStrategies.length === 0) return;

    const type = emergencyStrategies[currentEmergencyIndex];
    const container = document.getElementById('emergencyActivityArea');
    if (!container) return;

    console.log(`🚨 Rendering Strategy: ${type}`);
    container.innerHTML = ''; // Clear previous

    // Reuse Activities module but redirect rendering
    // We hijack 'inAppActionArea' temporarily or pass a container? 
    // Activities module hardcodes 'inAppActionArea'. 
    // Hack: We change the ID of our emergency container to 'inAppActionArea' temporarily?
    // Better: We temporarily reparent the content or modify Activities.setupActivity to accept container.
    // Given the constraints, let's replicate the simple render logic here for robust isolation.

    renderEmergencyActivityUI(type, container);
}

function renderEmergencyActivityUI(type, container) {
    if (type === 'Deep Breathing') {
        container.innerHTML = `
            <div class="anim-breathe" style="width:200px; height:200px; background:rgba(16,185,129,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center;">
                <div style="font-size:6rem;">🫁</div>
            </div>
            <h2 style="margin-top:40px; font-weight:850; font-size:2rem; color:#fff;">Breathe In...</h2>
        `;
        // Simple animation loop
        let phase = 0;
        const textEl = container.querySelector('h2');
        window.emergencyInterval = setInterval(() => {
            phase = (phase + 1) % 2;
            textEl.innerText = phase === 0 ? "Breathe In..." : "Breathe Out...";
            safeVibrate(50);
        }, 4000);
    }
    else if (type === '5-4-3-2-1 Grounding') {
        container.innerHTML = `
            <div class="anim-scan" style="font-size:6rem; margin-bottom:20px;">👀</div>
            <h2 style="font-size:1.8rem; margin-bottom:10px;">Look around you.</h2>
            <p style="font-size:1.2rem; opacity:0.8;">Find 5 blue things.</p>
         `;
    }
    else if (type === 'Squeeze & Release') {
        container.innerHTML = `
            <div class="anim-squeeze" style="font-size:6rem; margin-bottom:20px;">✊</div>
            <h2 style="font-size:1.8rem;">Squeeze your fists tight!</h2>
         `;
    }
    else if (type === 'Hold Something Cold') {
        container.innerHTML = `
            <div class="anim-float" style="font-size:6rem; margin-bottom:20px;">🧊</div>
            <h2 style="font-size:1.8rem;">Find something cold.</h2>
            <p style="font-size:1.2rem; opacity:0.8;">Hold it and feel the temp.</p>
         `;
    }
    else {
        // Fallback generic
        container.innerHTML = `
            <div class="anim-float" style="font-size:6rem; margin-bottom:20px;">😌</div>
            <h2 style="font-size:1.8rem;">You are safe here.</h2>
            <p style="font-size:1.2rem; opacity:0.8;">Take a moment.</p>
        `;
    }
}

window.retryEmergencyStrategy = function () {
    // Stop any running intervals
    if (window.emergencyInterval) clearInterval(window.emergencyInterval);

    currentEmergencyIndex = (currentEmergencyIndex + 1) % emergencyStrategies.length;
    renderEmergencyStrategy();
};

window.exitEmergencyMode = function () {
    // Stop intervals
    if (window.emergencyInterval) clearInterval(window.emergencyInterval);

    // Restore Header
    const header = document.querySelector('.app-header');
    if (header) header.style.display = 'flex';

    // Go to Re-measure
    // We inject specific state to CurrentEmotion so finishCheckIn handles it correctly
    currentEmotion.name = 'Emergency';
    currentEmotion.intensity = 10; // Assume max start
    // currentEmotion.afterIntensity will be set by Remeasure screen

    // Show simplified Remeasure
    const screen = document.getElementById('screenRemeasure');
    if (screen) {
        document.getElementById('remeasureEmoji').innerText = '😌';
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }
};

function addGuardianAlert(msg, level) {
    const alerts = safeJSONParse('feelflow_alerts', []) || [];
    alerts.push({
        timestamp: new Date().toISOString(),
        message: msg,
        level: level,
        read: false
    });
    localStorage.setItem('feelflow_alerts', JSON.stringify(alerts));
}

// Ensure global access
window.emergencyStrategies = emergencyStrategies;

// 💡 New Trigger & Remeasure Exports
window.renderTriggerScreen = renderTriggerScreen;
window.toggleTrigger = toggleTrigger;
window.submitTriggers = submitTriggers;
window.skipTriggers = skipTriggers;
window.updateRemeasure = updateRemeasure;
window.submitRemeasure = submitRemeasure;

window.toggleMenu = function () {
    const overlay = document.getElementById('menuOverlay');
    // 💡 Fix: Select specific content container
    const nav = overlay ? overlay.querySelector('.menu-content') : null;

    if (overlay && nav) {
        // Toggle Active State
        overlay.classList.toggle('active');

        // Only render if we are opening it
        if (overlay.classList.contains('active')) {
            const role = window.currentUser; // Explicit window access

            if (role === 'guardian') {
                // 🛡️ Guardian Menu
                nav.innerHTML = `
                    <div style="padding:15px; background:#f1f5f9; border-radius:12px; margin-bottom:15px;">
                        <div style="font-size:0.8rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;">Current Mode</div>
                        <div style="font-size:1.1rem; font-weight:800; color:#1e293b;">🛡️ Guardian</div>
                    </div>
                    <button class="menu-item" onclick="menuNavigate('Guardian', event)">📊 Dashboard</button>
                    <button class="menu-item" onclick="menuNavigate('ChildHistory', event)">📅 Child's Journey</button>
                    <button class="menu-item" onclick="menuNavigate('GuardianSettings', event)">⚙️ Settings</button>
                    <div style="width:100%; height:1px; background:#e2e8f0; margin:10px 0;"></div>
                    <button class="menu-item" onclick="logout()" style="color:#ef4444; font-weight:700;">👋 Switch User (Log Out)</button>
                `;
            } else {
                // 🧒 Child Menu (Default)
                nav.innerHTML = `
                   <div style="padding:15px; background:#eff6ff; border-radius:12px; margin-bottom:15px;">
                        <div style="font-size:0.8rem; font-weight:700; color:#3b82f6; text-transform:uppercase; letter-spacing:1px;">Current Mode</div>
                        <div style="font-size:1.1rem; font-weight:800; color:#1d4ed8;">🧒 Jason</div>
                    </div>
                    <button class="menu-item" onclick="menuNavigate('Home', event)">🏠 Home</button>
                    <button class="menu-item" onclick="menuNavigate('Routine', event)">✅ Routine</button>
                    <button class="menu-item" onclick="menuNavigate('Trophies', event)">🏆 Trophies</button>
                    <button class="menu-item" onclick="menuNavigate('History', event)">📅 My Journey</button>
                    <div style="width:100%; height:1px; background:#e2e8f0; margin:10px 0;"></div>
                    <button class="menu-item" onclick="menuNavigate('Crisis', event)" style="color:#ef4444; font-weight:700;">🆘 Get Help</button>
                    <div style="width:100%; height:1px; background:#e2e8f0; margin:10px 0;"></div>
                    <button class="menu-item" onclick="logout()" style="color:#64748b;">🔄 Switch User</button>
                `;
            }
        }
    }
};

window.sendCrisisMessage = function () {
    // 1. Get Guardian Name/Number (Mock)
    const guardian = { name: "Mom", phone: "555-555-5555" }; // In real app, fetch from settings

    // 2. Construct Message
    // "Jason is having a hard time and could use your support right now."
    const msg = `[FeelFlow] Jason is having a hard time and could use your support right now.`;

    // 3. Simulate Send
    alert(`📨 Message sent to ${guardian.name}:\n\n"${msg}"`);

    // 4. Log Alert internally for Guardian Dashboard
    addGuardianAlert(`Crisis Message Sent`, 'High');

    // 5. Feedback
    const btn = document.querySelector('.btn-guardian');
    if (btn) {
        btn.innerHTML = "✅ Message Sent";
        btn.disabled = true;
        btn.style.background = "#9ca3af";
    }
};

UI.renderCrisisScreen = function () {
    // Populate Guardian Name
    const lbl = document.getElementById('lblCrisisGuardianName');
    if (lbl) {
        // Mock fetch
        lbl.innerText = "Mom";
    }
};

// 💡 Phase 7: Share Logic
window.shareWithFamily = function () {
    const btn = document.getElementById('btnShareFamily');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "✅ Shared! (+100 XP)";
        btn.style.background = "#94a3b8";
    }

    FeelFlow.addXP(100, "Shared with Family ❤️");

    // Simulate Notification
    setTimeout(() => {
        alert("📨 Sent validation to Mom/Dad!");
    }, 500);
};

// 💡 Update Screen 5 Dynamic Display
const originalGoToScreen = UI.goToScreen.bind(UI);
UI.goToScreen = async function (id, title) {
    originalGoToScreen(id, title);

    // 💡 Fix: Hide FAB on Home Screen & Guardian Mode
    const fab = document.getElementById('btnEmergencyFAB');
    if (fab) {
        if (window.currentUser === 'guardian' || id === 'screenGuardian' || id === 'screenGuardianSettings') {
            fab.style.display = 'none';
        } else if (id === '1' || id === 'screen1') {
            fab.style.display = 'none';
        } else if (id === 'Landing' || id === 'Login' || id === 'Signup') {
            fab.style.display = 'none';
        } else {
            fab.style.display = 'flex';
        }
    }

    // 💡 Dynamic Data Loading based on Screen ID
    if (id === '5' || id === 'screen5') {
        const screen5 = document.getElementById('screen5');
        const display = document.getElementById('screen5XpDisplay');
        const btn = document.getElementById('btnShareFamily');

        if (screen5 && display) {
            const xp = screen5.dataset.earnedXp || 30;
            display.textContent = xp;
        }
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = "👨‍👩‍👦 Share with Family (+100 XP)";
            btn.style.background = "#8b5cf6";
            btn.style.color = "white"; // 💡 Fix invisible text
        }
    }

    // 💡 My Journey / Child History
    if (id === 'screenJourney' || id === 'ChildHistory') {
        // Force Fetch & Render
        console.log("📂 Loading Journey Data...");
        const history = await EmotionAPI.fetchHistory();
        UI.renderHistory(history);
    }

    // 💡 Trophies Screen
    if (id === 'screenTrophies') {
        if (typeof renderTrophies === 'function') renderTrophies();
    }

    // 💡 Crisis Screen
    if (id === 'screenCrisis') {
        if (typeof UI.renderCrisisScreen === 'function') UI.renderCrisisScreen();
    }
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

// 💡 Phase 7: App Initialization & Persistence
async function initApp() {
    console.log("🚀 FeelFlow App Initializing...");

    // 0. Initialize Goal System
    if (FeelFlow.initGoals) FeelFlow.initGoals();

    // 1. Fetch History from Server (Background Sync)
    try {
        if (window.EmotionAPI) {
            await EmotionAPI.fetchHistory();
        }
    } catch (e) {
        console.error("Init Fetch Failed:", e);
    }

    // 2. Initialize correct screen based on Mode
    // (Already handled by index.html defaults, but could force routing here if needed)

    // 💡 Fix: Ensure Daily Quests render on load
    // 💡 Fix: Ensure Daily Quests and UI elements render on load
    if (window.currentUser === 'child') {
        // 1. Render Quests Immediately
        if (typeof renderHomeQuests === 'function') renderHomeQuests();

        // 2. Update XP
        if (FeelFlow && typeof FeelFlow.updateXPDisplay === 'function') {
            FeelFlow.updateXPDisplay();
        }

        // 3. Render Weather & Tip
        const weatherIcon = document.getElementById('weatherIcon');
        const weatherText = document.querySelector('.ff-weather-pill span:last-child');
        if (weatherIcon && weatherText) {
            const codes = [
                { icon: '🌤️', text: '68°F', tip: "It's nice out! Short sleeves are fine." },
                { icon: '🌧️', text: '55°F', tip: "Rainy day ☔ Don't forget your umbrella!" },
                { icon: '🌨️', text: '30°F', tip: "Brrr! Wear a warm coat & gloves 🧤" },
                { icon: '🌪️', text: 'Windy', tip: "It's windy! Watch out for flying hats 🧢" }
            ];
            const w = codes[Math.floor(Math.random() * codes.length)];
            weatherIcon.textContent = w.icon;
            weatherText.textContent = w.text;

            let tipEl = document.getElementById('weatherTip');
            if (!tipEl) {
                tipEl = document.createElement('span');
                tipEl.id = 'weatherTip';
                tipEl.style.fontSize = '0.75rem';
                tipEl.style.color = '#64748b';
                tipEl.style.marginLeft = '8px';
                tipEl.style.fontWeight = '500';
                weatherText.parentNode.after(tipEl);
            }
            tipEl.textContent = w.tip;
        }
    }
}

// 💡 Fix: Do not auto-run. Let window.onload handle it.
window.initApp = initApp;
window.FeelFlow = FeelFlow;
window.Guardian = Guardian;

// ==========================================
// 💡 Journey Enhancements Logic (Ver.0218)
// ==========================================

// 1. Filter State
window.historyFilter = { emotion: 'all', trigger: null };

window.toggleEmotionFilter = function (emotion) {
    if (window.historyFilter.emotion === emotion) {
        window.historyFilter.emotion = 'all';
    } else {
        window.historyFilter.emotion = emotion;
    }

    // Re-render
    if (typeof UI !== 'undefined') {
        const history = safeJSONParse('feelflow_history', []);

        if (window.currentUser === 'guardian') {
            // 🛡️ Guardian Mode: Refresh Chart & Stats & History
            if (typeof Guardian !== 'undefined' && Guardian.renderWeather) {
                Guardian.renderWeather(Guardian.currentWeatherType || 'today');
            }
            if (UI.renderHistory) {
                UI.renderHistory(history, 'guardianRecentHistory');
            }
        } else if (UI.renderHistory) {
            UI.renderHistory(history, 'historyList');
        }
    }
};

window.filterHistory = function (history) {
    const { emotion, trigger } = window.historyFilter;
    if (emotion === 'all' && !trigger) return history;

    return history.filter(entry => {
        const matchEmotion = emotion === 'all' || entry.emotion === emotion;
        const matchTrigger = !trigger || (entry.triggers && entry.triggers.includes(trigger));
        return matchEmotion && matchTrigger;
    });
};

// 2. Weekly Stats Calculation
window.getWeeklyStats = function (history) {
    if (!history) return null;

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const recent = history.filter(h => new Date(h.timestamp || h.createdAt) >= oneWeekAgo);

    // Check-ins
    const checkins = recent.length;

    // Top Emotion
    const counts = {};
    recent.forEach(h => {
        const e = h.emotion || 'Unknown';
        counts[e] = (counts[e] || 0) + 1;
    });

    let topEmotion = { name: 'None', count: 0, emoji: '✨' };
    Object.keys(counts).forEach(e => {
        if (counts[e] > topEmotion.count) {
            topEmotion = {
                name: e,
                count: counts[e],
                emoji: recent.find(r => r.emotion === e).emoji || '✨'
            };
        }
    });

    // Streak
    const streak = parseInt(localStorage.getItem('feelflow_streak')) || 0;

    // Distribution (for Mini Bar Chart)
    const emotions = ['Happy', 'Sad', 'Anxious', 'Angry', 'Calm', 'Tired'];
    const colors = { 'Happy': '#FFD93D', 'Sad': '#6CB4EE', 'Anxious': '#A084E8', 'Angry': '#FF6B6B', 'Calm': '#6BCB77', 'Tired': '#95A5A6' };

    const distribution = emotions.map(e => {
        const count = counts[e] || 0;
        const percent = checkins === 0 ? 0 : (count / checkins) * 100;
        return { name: e, count, percent, color: colors[e] };
    });

    return { checkins, topEmotion, streak, distribution };
};

// 3. Strategy Insights ("What Works")
window.getStrategyInsights = function (history) {
    if (!history || history.length < 3) return []; // Need some data (lowered threshold for testing)

    // Map: Emotion -> Strategy -> { totalDrop, count }
    const map = {};

    history.forEach(h => {
        if (h.activityData && h.activityData.detail && h.afterIntensity && h.intensity) {
            const emo = h.emotion;
            const strat = h.activityData.detail;
            const drop = h.intensity - h.afterIntensity;

            if (!map[emo]) map[emo] = {};
            if (!map[emo][strat]) map[emo][strat] = { totalDrop: 0, count: 0 };

            map[emo][strat].totalDrop += drop;
            map[emo][strat].count += 1;
        }
    });

    const results = [];
    Object.keys(map).forEach(emo => {
        let bestStrat = null;
        let maxAvg = -Infinity;

        Object.keys(map[emo]).forEach(strat => {
            const data = map[emo][strat];
            if (data.count >= 2) { // Minimum 2 usages to recommend
                const avg = data.totalDrop / data.count;
                if (avg > maxAvg && avg > 0) { // Only positive impact
                    maxAvg = avg;
                    bestStrat = strat;
                }
            }
        });

        if (bestStrat) {
            results.push({ emotion: emo, strategy: bestStrat, drop: maxAvg });
        }
    });

    return results;
};

// 4. Delete Entry Logic
window.deleteHistoryEntry = function (timestamp) {
    if (confirm("Permanently delete this entry?")) {
        const history = safeJSONParse('feelflow_history', []);
        const newHistory = history.filter(h => (h.timestamp || h.createdAt) !== timestamp);
        localStorage.setItem('feelflow_history', JSON.stringify(newHistory));

        // Refresh
        if (typeof UI !== 'undefined' && UI.renderHistory) {
            UI.renderHistory(newHistory);
        }
    }
};