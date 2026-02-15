/**
 * FeelFlow UI Module: Ver.0215-2600
 * 기능: 화면 전환, 백 버튼, 날씨, 차트, 히스토리 및 모든 감정별 지능형 전략 렌더링
 */

const UI = {
    // 1. 화면 전환 및 히스토리 관리
    goToScreen(screenId, title) {
        const cleanId = screenId.toString().replace('screen', '');
        this.renderScreen(cleanId, title);
        window.history.pushState({ screenId: cleanId, title: title }, "", ""); 
    },

    renderScreen(screenId, title) {
        const cleanId = screenId.toString().replace('screen', '');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const targetScreen = document.getElementById('screen' + cleanId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            if (title) {
                const titleEl = document.getElementById('screenTitle');
                if (titleEl) titleEl.textContent = title;
            }
            window.scrollTo(0, 0);
        }
        if (cleanId !== 'Activity' && cleanId !== 'screenActivity' && window.Activities?.stopAll) {
            window.Activities.stopAll();
        }
    },

    back() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.goToScreen('1', 'How are you feeling?');
        }
    },

    updateNavActive(navId) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(navId);
        if (activeBtn) activeBtn.classList.add('active');
    },

    // 2. 7일 트렌드 차트 렌더링 (전체 복구)
    renderEmotionChart(history) {
        setTimeout(() => {
            const ctx = document.getElementById('emotionChart');
            if (!ctx || !window.Chart) return;
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

    // 3. 감정 기록 리스트 렌더링 (전체 복구)
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container) return;
        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-history"><p>No records yet!</p></div>';
            return;
        }
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
        container.innerHTML = sortedHistory.map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let displayEmotion = entry.emotion || "Feeling";
            const photoHtml = entry.photo ? `<div class="history-photo-wrapper" style="margin-top:12px; border-radius:12px; overflow:hidden;"><img src="${entry.photo}" style="width:100%; object-fit:cover; max-height:200px;"></div>` : '';
            return `
                <div class="history-item" style="background:white; border-radius:24px; padding:20px; margin-bottom:16px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <span style="font-size:2.8rem;">${entry.emoji || '✨'}</span>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#2d3748; font-size:1.1rem; display:flex; justify-content:space-between;">
                                <span>${displayEmotion}</span>
                                <span style="color:#7c3aed;">Lv.${entry.intensity}</span>
                            </div>
                            <div style="font-size:0.85rem; color:#a0aec0;">${timeStr}</div>
                        </div>
                    </div>
                    ${entry.note ? `<div style="margin-top:12px; padding:12px; background:#f8fafc; border-radius:12px;">${entry.note}</div>` : ''}
                    ${photoHtml}
                </div>`;
        }).join('');
    },

    // 4. 날씨 시스템
    displayWeather(data) {
        const temp = Math.round(data.current.temperature_2m);
        if (document.getElementById('weatherTemp')) document.getElementById('weatherTemp').textContent = `${temp}°F`;
        if (document.getElementById('weatherIcon')) document.getElementById('weatherIcon').textContent = (temp > 80 ? '☀️' : '🌤️');
        const now = new Date();
        if (document.getElementById('weatherDate')) document.getElementById('weatherDate').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (document.getElementById('weatherDay')) document.getElementById('weatherDay').textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    },

    async fetchWeatherByCity() {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.2267&longitude=-121.9746&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
            const data = await res.json();
            this.displayWeather(data);
        } catch (e) { console.error("Weather load fail:", e); }
    }
};

/**
 * 🧠 지능형 전략 렌더러 (The Full Spectrum)
 * 모든 감정(Happy, Sad, Anxious, Angry)의 전략을 강도별로 렌더링합니다.
 */
window.renderStrategies = function(emotionName, intensity) {
    const container = document.getElementById('strategiesContainer');
    if (!container) return;

    const rawName = emotionName ? emotionName.toString().trim().toLowerCase() : "";
    const level = parseInt(intensity) || 5;
    let strategyHtml = "";

    // 💡 감정별 전략 데이터셋 매핑
    const strategyMap = {
        'happy': level <= 2 ? 
            [{ title: 'Happy Note', icon: '🌱', tag: 'SMALL JOY', questId: 'HappyNote' }] :
            [{ title: 'Happy Note', icon: '✍️', tag: 'WRITE IT', questId: 'HappyNote' }],
        
        'sad': [
            { title: 'Capture the moment', icon: '📸', tag: 'GOLD', questId: 'Capture', color: '#1e293b' },
            { title: 'Listen to music', icon: '🎵', tag: 'RELAX', questId: 'Music' },
            { title: 'Big Hug', icon: '🫂', tag: 'LOVE', questId: 'BigHug' }
        ],
        
        'anxious': [
            { title: 'Capture the moment', icon: '📸', tag: 'GOLD', questId: 'Capture', color: '#1e293b' },
            { title: 'Deep Breathing', icon: '🌬️', tag: 'CALM', questId: 'DeepBreath' },
            { title: '5-4-3-2-1 Grounding', icon: '🖐️', tag: 'FOCUS', questId: 'Grounding' }
        ],

        'angry': [
            { title: 'Capture the moment', icon: '📸', tag: 'GOLD', questId: 'Capture', color: '#1e293b' },
            { title: 'Push the Wall', icon: '🧱', tag: 'POWER', questId: 'PushWall' },
            { title: 'Squeeze & Release', icon: '✊', tag: 'RELEASE', questId: 'Squeeze' }
        ]
    };

    // 현재 감정에 맞는 전략 가져오기 (없으면 기본값)
    const quests = strategyMap[rawName] || strategyMap['happy']; // 기본은 Happy 로직

    // 그리드 클래스 적용 (카드가 1개면 full, 여러개면 grid)
    container.className = quests.length > 1 ? 'strategy-grid' : '';

    strategyHtml = quests.map((q, idx) => `
        <div class="bento-card ${q.color ? 'hero-card' : ''} ${idx === 0 && quests.length > 1 ? 'featured' : ''}" 
             onclick="startQuest('${q.questId}', '${q.title}')"
             style="${q.color ? `background:${q.color}; color:white;` : ''}">
            <span class="recommend-tag">${q.tag}</span>
            <span class="quest-icon">${q.icon}</span>
            <div class="quest-info">
                <div class="quest-title" style="font-weight:850;">${q.title}</div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h3 class="section-title" style="margin-top:25px;">Recommended for you</h3>
        ${strategyHtml}
    `;
};

// 백 버튼 이벤트
window.onpopstate = function(event) {
    if (event.state && event.state.screenId) {
        UI.renderScreen(event.state.screenId, event.state.title);
    } else {
        UI.renderScreen('1', 'How are you feeling?');
    }
};

window.UI = UI;
window.renderEmotionChart = (history) => UI.renderEmotionChart(history);