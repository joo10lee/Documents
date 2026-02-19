/**
 * 🏠 FeelFlow UI Module: Ver.0215-TOTAL_PLUS
 * 기능: 화면 전환, 백 버튼, 7일 차트, 히스토리, 날씨, 레벨업 연출
 * 비고: 전략 렌더링(renderStrategies)은 activities.js에서 담당함
 */

console.log("🚀 [SYSTEM] UI Module Initializing (TOTAL_PLUS)...");

const UI = {
    // 1. 화면 전환 및 히스토리 관리
    goToScreen(screenId, title) {
        if (!screenId) return;
        const cleanId = screenId.toString().replace('screen', '');
        this.renderScreen(cleanId, title);

        try {
            window.history.pushState({ screenId: cleanId, title: title }, "", "");
        } catch (e) { console.warn("History push error:", e); }
    },

    renderScreen(screenId, title) {
        const cleanId = screenId.toString().replace('screen', '');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        const target = document.getElementById('screen' + cleanId) || document.getElementById(cleanId);

        // FAB visibility
        const fab = document.getElementById('btnEmergencyFAB');
        const hideFab = ['Landing', 'Login', 'Signup', 'Emergency', 'Crisis', 'Activity'];
        if (fab) fab.style.display = hideFab.includes(cleanId) ? 'none' : 'flex';

        // 💡 Phase 2: Header Logic
        const headerTitle = document.getElementById('headerTitle');

        // 💡 Hide Navigation Elements on Landing & Auth Screens
        if (cleanId === 'Landing' || cleanId === 'Login' || cleanId === 'Signup') {
        } else {

            // Home Screen Specifics
            if (cleanId === '1') {
                const hour = new Date().getHours();
                // ... (greeting logic)
                let greeting = "Hey Jason,<br>how's it going?";
                if (hour >= 5 && hour < 12) greeting = "Good Morning,<br>Jason! ☀️";
                else if (hour >= 12 && hour < 18) greeting = "Good Afternoon,<br>Jason! 🌤️";
                else if (hour >= 18) greeting = "Good Evening,<br>Jason! 🌙";

                if (headerTitle) headerTitle.innerHTML = greeting;
            } else {
                if (headerTitle) headerTitle.textContent = title || "FeelFlow";
            }
        }

        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0);
        } else {
            console.error(`❌ UI Error: screen${cleanId} 요소를 찾을 수 없습니다.`);
        }

        // 활동 화면을 벗어날 때 정리 로직 (activities.js 연동)
        if (cleanId !== 'Activity' && window.Activities?.stopAll) {
            window.Activities.stopAll();
        }
    },

    // 💡 레벨업 축하 연출 (app.js 연동)
    showLevelUp(level) {
        const burst = document.createElement('div');
        burst.className = 'xp-burst';
        burst.innerHTML = `🎊 LEVEL UP! LV.${level}`;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 2500);
    },

    // 4. XP 획득 애니메이션 (Lego -> XP)
    showXPAnimation(type = 'default') {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.background = 'rgba(0,0,0,0.6)';

        // 💡 XP Animation
        overlay.innerHTML = `
            <div style="text-align:center; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="font-size:5rem; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.3));">🌟</div>
                <div style="font-size:2rem; font-weight:900; color:#fbbf24; text-shadow:0 2px 4px rgba(0,0,0,0.3); margin-top:10px;">
                    XP EARNED!
                </div>
                <div style="font-size:1.2rem; color:white; margin-top:5px; font-weight:700;">Great job!</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Sound
        if (typeof playSound === 'function') playSound('success');

        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => overlay.remove(), 300);
        }, 1500);
    },

    back() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.goToScreen('1', 'How are you feeling?');
        }
    },


    // 2. 7일 트렌드 차트 렌더링 (Chart.js 연동)
    renderEmotionChart(history) {
        setTimeout(() => {
            const ctx = document.getElementById('guardianChart');
            if (!ctx || !window.Chart || !history) return;

            const toISODate = (d) => new Date(d).toISOString().split('T')[0];
            const labels = [];
            const isoLabels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                isoLabels.push(toISODate(d));
            }

            const dataPoints = isoLabels.map(isoDate => {
                const dayEntries = history.filter(h => toISODate(h.timestamp || h.createdAt) === isoDate);
                if (dayEntries.length === 0) return 0;
                const sum = dayEntries.reduce((acc, curr) => acc + (Number(curr.intensity) || 0), 0);
                return (sum / dayEntries.length).toFixed(1);
            });

            if (window.myEmotionChart) window.myEmotionChart.destroy();
            window.myEmotionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataPoints,
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        borderWidth: 3, tension: 0.4, fill: true, pointBackgroundColor: '#7c3aed', pointRadius: 5
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 10, ticks: { stepSize: 2 } }, x: { grid: { display: false } } },
                    plugins: { legend: { display: false } }
                }
            });
        }, 300);
    },

    // 3. 감정 기록 리스트 렌더링 (Enhanced Journey)
    renderHistory(history, containerId = 'historyList') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 💡 Guardian Mode Check
        const isGuardian = typeof currentUser !== 'undefined' && currentUser === 'guardian';

        if (!history || history.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#9CA3AF;">No check-ins yet! 📝<br>Check in to see your journey.</div>';
            return;
        }

        // 💡 1. Weekly Summary Card
        const weeklyStats = window.getWeeklyStats ? window.getWeeklyStats(history) : null;
        let summaryHTML = '';
        if (weeklyStats) {
            summaryHTML = `
                <div class="ff-summary-card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <div>
                            <div style="font-size:0.75rem; color:#64748B; font-weight:700; text-transform:uppercase;">This Week</div>
                            <div style="font-size:1.5rem; font-weight:800; color:#1E293B;">${weeklyStats.checkins} Check-ins</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.75rem; color:#64748B; font-weight:700; text-transform:uppercase;">Streak</div>
                            <div style="font-size:1.5rem; font-weight:800; color:#F59E0B;">🔥 ${weeklyStats.streak} Days</div>
                        </div>
                    </div>
                    <div style="display:flex; gap:12px; align-items:center; background:#F8FAFC; padding:10px; border-radius:12px;">
                        <div style="font-size:2rem;">${weeklyStats.topEmotion.emoji}</div>
                        <div>
                            <div style="font-size:0.8rem; font-weight:700; color:#334155;">Most Frequent</div>
                            <div style="font-size:0.9rem; color:#64748B;">${weeklyStats.topEmotion.name} (${weeklyStats.topEmotion.count})</div>
                        </div>
                    </div>
                    <!-- Mini Bar Chart -->
                    <div style="display:flex; align-items:flex-end; height:40px; gap:4px; margin-top:16px;">
                        ${weeklyStats.distribution.map(d => `
                            <div style="flex:1; background:${d.color}; height:${d.percent}%; border-radius:4px; opacity:0.8;" title="${d.name}"></div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // 💡 2. Filter Row
        const currentFilter = window.historyFilter || { emotion: 'all', trigger: null };
        const emotions = ['Happy', 'Sad', 'Anxious', 'Angry', 'Calm', 'Tired'];
        const emojimap = { 'Happy': '😊', 'Sad': '😢', 'Anxious': '😰', 'Angry': '😠', 'Calm': '😌', 'Tired': '😫' };

        let filterHTML = `
            <div class="ff-filter-row">
                <button class="ff-filter-btn ${currentFilter.emotion === 'all' ? 'active' : ''}" onclick="toggleEmotionFilter('all')">All</button>
                ${emotions.map(e => `
                    <button class="ff-filter-btn ${currentFilter.emotion === e ? 'active' : ''}" onclick="toggleEmotionFilter('${e}')">${emojimap[e]}</button>
                `).join('')}
            </div>
        `;

        // 💡 3. What Works For Me (Insights)
        let insightHTML = '';
        const insights = window.getStrategyInsights ? window.getStrategyInsights(history) : [];
        if (insights.length > 0) {
            insightHTML = `
                <div class="ff-insight-card">
                    <div style="font-size:0.9rem; font-weight:800; color:#4F46E5; margin-bottom:8px;">💡 What Works For You</div>
                    ${insights.map(i => `
                        <div style="font-size:0.85rem; color:#1E293B; margin-bottom:4px;">
                            When you feel <b>${i.emotion}</b>, <br>
                            <b>${i.strategy}</b> helps best (Avg ↓${i.drop.toFixed(1)})
                        </div>
                    `).join('')}
                </div>
            `;
        }


        // 💡 4. Timeline Cards
        // Filter logic should be in app.js, assuming passed 'history' is already filtered or valid
        // But let's apply client-side filter here if window.filterHistory is not used yet
        const displayHistory = window.filterHistory ? window.filterHistory(history) : history;

        const sorted = [...displayHistory].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

        const listHTML = sorted.map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const color = entry.color || '#6C5CE7';

            // Intensity Change
            let intensityHTML = `<span style="font-weight:700; color:${color}">Lv.${entry.intensity}</span>`;
            if (entry.afterIntensity) {
                const drop = entry.intensity - entry.afterIntensity;
                const dropColor = drop > 0 ? '#10B981' : (drop < 0 ? '#EF4444' : '#94A3B8');
                intensityHTML = `
                    <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem;">
                        <span style="color:#64748B">Before: <b>${entry.intensity}</b></span>
                        <span>→</span>
                        <span style="color:#64748B">After: <b>${entry.afterIntensity}</b></span>
                        <span style="color:${dropColor}; font-weight:700; font-size:0.75rem; background:${dropColor}15; padding:2px 6px; border-radius:4px;">
                            ${drop > 0 ? '↓' : (drop < 0 ? '↑' : '-')}${Math.abs(drop)}
                        </span>
                    </div>
                `;
            }

            // Triggers
            let triggersHTML = '';
            if (entry.triggers && entry.triggers.length > 0) {
                triggersHTML = `
                    <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">
                        ${entry.triggers.map(t => `<span class="ff-hist-trigger">${t}</span>`).join('')}
                    </div>
                `;
            }

            // Strategy
            let strategyHTML = '';
            if (entry.activityData && entry.activityData.detail) {
                strategyHTML = `
                    <div class="ff-hist-strategy">
                        <span>${entry.activityData.icon || '🧩'}</span>
                        <span style="font-weight:600;">${entry.activityData.detail}</span>
                    </div>
                `;
            }

            // Creative Content (Privacy Check)
            let creativeHTML = '';
            if (isGuardian) {
                // Guardian View: Privacy Mode
                if (entry.note) creativeHTML += `<div class="ff-privacy-tag">📝 Journal Written</div>`;
                if (entry.photo) creativeHTML += `<div class="ff-privacy-tag">📸 Photo Captured</div>`;
                if (entry.drawing) creativeHTML += `<div class="ff-privacy-tag">🎨 Drawing Created</div>`;
                if (creativeHTML) creativeHTML = `<div style="display:flex; gap:6px; margin-top:10px;">${creativeHTML}</div>`;
            } else {
                // Child View: Full Content
                if (entry.note) creativeHTML += `<div class="ff-entry-note">${entry.note}</div>`;
                if (entry.photo) creativeHTML += `<img src="${entry.photo}" class="ff-entry-photo" onclick="UI.showFullScreenImage('${entry.photo}')">`;
                // Add drawing if exists (assuming it's in activityData or separate field, adapting schema)
                if (entry.activityData && entry.activityData.drawing) {
                    creativeHTML += `<img src="${entry.activityData.drawing}" class="ff-entry-photo" style="border:2px solid #E2E8F0;">`;
                }
            }

            // Badges
            let badges = [];
            if (entry.emergency) badges.push('<span class="ff-badge-alert">🆘 Crisis</span>');
            if (entry.fromRoutine) badges.push('<span class="ff-badge-routine">📋 Routine</span>');
            if (entry.earnedXP) badges.push(`<span class="ff-badge-xp">+${entry.earnedXP} XP</span>`);

            return `
                <div class="ff-history-card">
                    <div class="ff-hist-header">
                        <span class="ff-hist-time">${dateStr} · ${timeStr}</span>
                        <button onclick="deleteHistoryEntry('${entry.timestamp || entry.createdAt}')" class="ff-hist-delete">🗑️</button>
                    </div>
                    
                    <div class="ff-hist-body">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <div class="ff-entry-mood">
                                <span class="ff-entry-emoji">${entry.emoji || '✨'}</span>
                                <span class="ff-entry-name">${entry.emotion}</span>
                            </div>
                            ${intensityHTML}
                        </div>
                        
                        ${triggersHTML}
                        ${strategyHTML}
                        
                        ${creativeHTML}
                        
                        ${badges.length > 0 ? `<div style="display:flex; gap:6px; margin-top:12px;">${badges.join('')}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = summaryHTML + filterHTML + insightHTML + listHTML;
    },

    // Helper for Full Screen Image
    showFullScreenImage(src) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '10000';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.onclick = () => overlay.remove();

        overlay.innerHTML = `<img src="${src}" style="max-width:95%; max-height:95%; border-radius:8px;">`;
        document.body.appendChild(overlay);
    },

    // 4. 날씨 정보 표시
    displayWeather(data) {
        if (!data) return;
        const temp = Math.round(data.current.temperature_2m);
        if (document.getElementById('weatherTemp')) document.getElementById('weatherTemp').textContent = `${temp}°F`;
        if (document.getElementById('weatherIcon')) document.getElementById('weatherIcon').textContent = (temp > 80 ? '☀️' : '🌤️');
    },

    async fetchWeatherByCity() {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.2267&longitude=-121.9746&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
            const data = await res.json();
            this.displayWeather(data);
        } catch (e) { console.error("Weather Fail"); }
    },

    // 5. XP Toast Feedback
    showXPToast(message, subtext) {
        const toast = document.createElement('div');
        toast.className = 'xp-toast';
        toast.innerHTML = `
            <div style="font-size:1.5rem; margin-bottom:4px;">⭐ ${message}</div>
            <div style="font-size:0.9rem; opacity:0.9;">${subtext}</div>
        `;
        document.body.appendChild(toast);

        // Animate
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 20px)';
        });

        // Remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
};

// 💡 [필수 보완] 브라우저 백 버튼 이벤트 핸들러
window.onpopstate = function (event) {
    if (event.state && event.state.screenId) {
        UI.renderScreen(event.state.screenId, event.state.title);
    } else {
        UI.renderScreen('1', 'How are you feeling?');
    }
};

// 💡 [필수 보완] 전역 바인딩 (app.js가 UI를 찾을 수 있게 함)
window.UI = UI;
window.renderEmotionChart = (h) => UI.renderEmotionChart(h);