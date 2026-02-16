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
    medals: safeJSONParse('feelflow_medals', []) || [],

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

    init() {
        this.renderLegend();
        this.renderWeather('today');
        this.loadSettings();
        this.generateAIInsight();
        this.renderRecentHistory();
    },

    renderDashboard() {
        this.init();
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
        const container = document.getElementById('guardianRecentHistory');
        if (!container) return;
        const history = safeJSONParse('feelflow_history', []) || [];

        if (history.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:0.9rem;">No activity data yet.</div>`;
            return;
        }

        // 💡 Recent: Show last 15, include photos
        const recent = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

        container.innerHTML = recent.map(h => {
            const dateStr = new Date(h.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            // Photo handling
            const photoHtml = h.photo ? `<div style="width:40px; height:40px; border-radius:8px; background:url('${h.photo}') center/cover; margin-right:10px; border:1px solid #e2e8f0;"></div>` : '';

            return `
            <div class="recent-history-item" style="display:flex; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:12px; border:1px solid #f1f5f9; margin-bottom:5px;">
                ${photoHtml}
                <div style="font-size:1.2rem; margin-right:12px;">${h.emoji || '❓'}</div>
                <div style="flex:1;">
                    <div style="font-weight:700; color:#334155; font-size:0.9rem;">
                        ${h.emotion} 
                        <span style="font-weight:400; color:#94a3b8; font-size:0.8rem;">Lv.${h.intensity}</span>
                    </div>
                    <div style="font-size:0.75rem; color:#64748b;">${dateStr}</div>
                </div>
            </div>`;
        }).join('');
    },

    // 💡 Score Calculation & Goal Logic
    loadGoal() {
        const savedGoal = localStorage.getItem('feelflow_goal_msg') || '';
        document.getElementById('guardianGoalInput').value = savedGoal;

        const history = safeJSONParse('feelflow_history', []) || [];

        // 1. Calculate Score (0-100) based on consistency check-ins in last 7 days
        const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentEntries = history.filter(h => new Date(h.timestamp) > oneWeekAgo);

        // Simple logic: 2 check-ins per day = 100% (14 entries/week)
        let score = Math.min(100, Math.round((recentEntries.length / 14) * 100));
        if (recentEntries.length === 0) score = 0;

        const badge = document.getElementById('goalScoreBadge');
        if (badge) {
            badge.textContent = `Score: ${score}`;
            badge.style.background = score > 70 ? '#10b981' : (score > 30 ? '#fbbf24' : '#ef4444');
        }

        const banner = document.getElementById('goalActionBanner');
        const btnBook = document.getElementById('btnBookNext');

        if (banner) {
            banner.style.display = 'block';
            if (score <= 30) {
                banner.innerText = "📉 Consistency is low. Encourage Jason to check in!";
                banner.style.background = "#fee2e2";
                banner.style.color = "#b91c1c";
                if (btnBook) btnBook.style.display = 'none';
            } else if (score >= 80) {
                banner.innerText = "🎉 Excellent consistency! Time for a reward?";
                banner.style.background = "#dcfce7";
                banner.style.color = "#15803d";
                if (btnBook) btnBook.style.display = 'inline-block'; // Show Book button
            } else {
                banner.style.display = 'none';
                if (btnBook) btnBook.style.display = 'none';
            }
        }
    },

    // 💡 Chart.js Integration for "Emotion Weather"
    renderWeather(type, tabEl) {
        if (tabEl) {
            document.querySelectorAll('.weather-tab').forEach(t => t.classList.remove('active'));
            tabEl.classList.add('active');
        }

        const ctx = document.getElementById('guardianChart');
        if (!ctx) return;

        if (this.chartInstance) this.chartInstance.destroy();

        const history = safeJSONParse('feelflow_history', []) || [];
        let labels = [], dataPoints = [], pointColors = [], pointRadius = [], color = '#3b82f6', chartType = 'line';
        let datasets = [];

        if (type === 'today') {
            // 💡 Today: 2-hour intervals from 6AM to 10PM
            const today = new Date().toDateString();
            const todayEntries = history.filter(h => new Date(h.timestamp).toDateString() === today);

            // X-Axis: Fixed 2-hour slots
            labels = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
            dataPoints = new Array(labels.length).fill(null); // Nulls for empty slots
            pointColors = new Array(labels.length).fill('transparent');
            pointRadius = new Array(labels.length).fill(0);

            // Populate slots (Logic: Max intensity in that 2h window)
            todayEntries.forEach(entry => {
                const hour = new Date(entry.timestamp).getHours();
                if (hour < 6 || hour > 22) return;

                // Map hour to slot index (approximate)
                // 6,7->0; 8,9->1; ...
                const slotIndex = Math.floor((hour - 6) / 2);

                if (slotIndex >= 0 && slotIndex < labels.length) {
                    // Update if current slot is empty or this entry has higher intensity
                    if (dataPoints[slotIndex] === null || entry.intensity > dataPoints[slotIndex]) {
                        dataPoints[slotIndex] = entry.intensity;
                        pointColors[slotIndex] = this.emotionColors[entry.emotion] || '#94a3b8';
                        pointRadius[slotIndex] = 6;
                    }
                }
            });

            color = '#94a3b8';
            datasets = [{
                label: 'Intensity',
                data: dataPoints,
                borderColor: color,
                backgroundColor: pointColors,
                pointBackgroundColor: pointColors,
                pointRadius: pointRadius,
                borderWidth: 2,
                tension: 0.4,
                spanGaps: true // Connect lines across nulls
            }];

        } else if (type === 'weekly') {
            // 💡 Weekly: Last 7 days, highlighting max intensity
            chartType = 'bar';
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const dateStr = d.toDateString();
                labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

                const dayEntries = history.filter(h => new Date(h.timestamp).toDateString() === dateStr);
                // Get Max Intensity for the day
                const maxIntensity = dayEntries.reduce((max, c) => Math.max(max, Number(c.intensity) || 0), 0);

                // Find dominant emotion for that max intensity
                const dominant = dayEntries.find(h => h.intensity == maxIntensity);

                dataPoints.push(maxIntensity || 0.5); // 0.5 for empty days visual
                pointColors.push(dominant ? (this.emotionColors[dominant.emotion] || '#8b5cf6') : '#f1f5f9');
            }
            datasets = [{
                label: 'Max Intensity',
                data: dataPoints,
                backgroundColor: pointColors,
                borderRadius: 4,
                barThickness: 12
            }];

        } else if (type === 'monthly') {
            // 💡 2 Months: Weekly Highs (8 weeks)
            // Logic: Group by week number
            for (let i = 7; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - (i * 7));
                labels.push(`W-${i}`);

                // Mock simple aggregation for "Week - i"
                // In real app, proper date range filtering needed. 
                // Here we just pick a random history point to simulate variation if empty
                const weekEntries = history; // Placeholder: Real logic needs date ranges
                let avg = 0; // Placeholder
                if (i < 2 && history.length > 0) avg = 5 + Math.random() * 3; // Simulate data for last 2 weeks

                dataPoints.push(avg);
                pointColors.push('#10b981');
            }
            datasets = [{
                label: 'Weekly Avg',
                data: dataPoints,
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                tension: 0.4
            }];
        }

        this.chartInstance = new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        display: false
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `Level: ${context.raw}`;
                            }
                        }
                    }
                }
            }
        });
    },

    // 💡 Simulated AI Insight (Rule Logic)
    generateAIInsight() {
        const history = safeJSONParse('feelflow_history', []) || [];
        const recent = history.slice(-10); // Check last 10 entries
        const box = document.getElementById('aiInsightText');
        const keywords = localStorage.getItem('guardian_keywords') || "";

        let insight = "Not enough data yet. Encourage check-ins!";
        let suggestion = "";

        if (recent.length > 0) {
            const sadCount = recent.filter(r => r.emotion === 'Sad').length;
            const angryCount = recent.filter(r => r.emotion === 'Angry').length;
            const happyCount = recent.filter(r => r.emotion === 'Happy').length;

            if (sadCount >= 2) {
                insight = "Jason has been feeling down lately. Patterns show a dip in the evenings.";
                suggestion = keywords ? `Try doing some ${keywords.split(',')[0]} together ? ` : "How about a warm cocoa and a chat?";
            } else if (angryCount >= 2) {
                insight = "High energy emotions detected. Might be frustration from school?";
                suggestion = "A physical activity like running or 'Push the Wall' might help release tension.";
            } else if (happyCount >= 3) {
                insight = "Great week! Jason is thriving.";
                suggestion = "Celebrate with a small reward to reinforce this positive streak!";
            } else {
                insight = "Emotions are balanced. No major concerns.";
                suggestion = "Maintain the routine!";
            }
        }

        if (box) box.innerHTML = `< strong > Observation :</strong > ${insight} < br > <br><strong>💡 Suggestion:</strong> ${suggestion}`;

        // Update Suggested Goal UI
        const goalEl = document.getElementById('suggestedGoal');
        if (goalEl && suggestion) {
            goalEl.style.display = 'block';
            goalEl.querySelector('span').textContent = suggestion.substring(0, 30) + "...";
            goalEl.onclick = () => {
                document.getElementById('guardianGoalInput').value = suggestion;
            };
        }
    },

    saveSettings() {
        const k = document.getElementById('childKeywords').value;
        localStorage.setItem('guardian_keywords', k);
        alert("Settings Saved!");
        this.generateAIInsight(); // Refresh logic
    },

    loadSettings() {
        const k = localStorage.getItem('guardian_keywords') || "";
        document.getElementById('childKeywords').value = k;

        const savedGoal = localStorage.getItem('feelflow_goal_msg') || '';
        document.getElementById('guardianGoalInput').value = savedGoal;
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
        'Guardian': 'screenGuardian',  // 💡 Phase 2
        'GuardianSettings': 'screenGuardianSettings' // 💡 Phase 3
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
    let history = safeJSONParse('feelflow_history', []) || [];

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
    let history = safeJSONParse('feelflow_history', []) || [];
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
    let history = safeJSONParse('feelflow_history', []) || [];
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
    const nav = document.querySelector('.menu-content');

    if (overlay && nav) {
        overlay.classList.toggle('active');

        // 💡 Dynamic Menu Rendering
        if (overlay.classList.contains('active')) {
            if (currentUser === 'guardian') {
                nav.innerHTML = `
                    <div style="padding:10px; color:#64748b; font-size:0.9rem; font-weight:700;">GUARDIAN MODE</div>
                    <button class="menu-item" onclick="menuNavigate('Guardian', event)">📊 Dashboard</button>
                    <button class="menu-item" onclick="menuNavigate('History', event)">📅 Child's Journey</button>
                    <button class="menu-item" onclick="menuNavigate('GuardianSettings', event)">⚙️ Settings</button>
                    <div style="width:100%; height:1px; background:#e2e8f0; margin:10px 0;"></div>
                    <button class="menu-item" onclick="GuardianAuth.logout()" style="color:#ef4444;">🚪 Log Out</button>
                `;
            } else {
                nav.innerHTML = `
                    <button class="menu-item" onclick="menuNavigate('Home', event)">🏠 Home</button>
                    <button class="menu-item" onclick="menuNavigate('Routine', event)">✅ Routine</button>
                    <button class="menu-item" onclick="menuNavigate('Trophies', event)">🏆 Trophies</button>
                    <button class="menu-item" onclick="menuNavigate('History', event)">📅 My Journey</button>
                    <div style="width:100%; height:1px; background:#e2e8f0; margin:10px 0;"></div>
                    <button class="menu-item" onclick="UI.goToScreen('Login'); toggleMenu();" 
                        style="font-size:1.1rem; color:#64748b;">🔒 Guardian Login</button>
                `;
            }
        }
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