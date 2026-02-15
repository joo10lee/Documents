/**
 * UI 관리 모듈: 화면 전환, 백 버튼, 지능형 전략 렌더링 통합본
 */
const UI = {
    // 1. 화면 전환 함수
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

    // 2. 백 버튼 함수
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

    // 3. 차트 렌더링
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
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 10 }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }
            });
        }, 300);
    },

    // 4. 히스토리 렌더링
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

    // 5. 날씨 시스템
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
        } catch (e) { console.error("Weather fail:", e); }
    }
};

/**
 * 🧠 지능형 전략 렌더러 (최종 로직 고정)
 */
window.renderStrategies = function(emotionName, intensity) {
    const container = document.getElementById('strategiesContainer');
    if (!container) return;

    // 💡 방어 로직: 이름과 레벨을 확실하게 추출
    const rawName = emotionName ? emotionName.toString().trim() : "";
    const level = parseInt(intensity) || 5;
    
    // "Happy", "happy", "😊" 모두 "기쁨"으로 인정
    const isHappy = rawName.toLowerCase().includes('happy') || rawName === '😊';

    console.log(`🛠️ [Strategy Check] Name: ${rawName}, IsHappy: ${isHappy}, Level: ${level}`);

    let strategyHtml = "";

    if (isHappy) {
        if (level <= 2) {
            // [강도 1~2] 🌱 SMALL JOY
            strategyHtml = `
                <div class="bento-card hero-card" onclick="startQuest('HappyNote', 'Happy Note')">
                    <span class="recommend-tag">SMALL JOY</span>
                    <span class="quest-icon">🌱</span>
                    <div class="quest-info">
                        <div class="quest-title">Happy Note</div>
                        <div style="font-size:0.8rem; opacity:0.9;">What made you smile a little?</div>
                    </div>
                </div>`;
        } else {
            // [강도 3+] ✍️ JOY JOURNEY
            strategyHtml = `
                <div class="strategy-grid">
                    <div class="bento-card hero-card" onclick="startQuest('HappyNote', 'Happy Note')">
                        <span class="recommend-tag">WRITE</span>
                        <span class="quest-icon">✍️</span>
                        <div class="quest-info">
                            <div class="quest-title">Happy Note</div>
                            <div style="font-size:0.8rem; opacity:0.9;">Write your joy + Add Photo</div>
                        </div>
                    </div>
                </div>`;
        }
    } else {
        // 그 외 감정: Deep Breath
        strategyHtml = `
            <div class="bento-card" onclick="startQuest('DeepBreath', 'Deep Breath')">
                <span class="quest-icon">🌬️</span>
                <div class="quest-info">
                    <div class="quest-title">Deep Breath</div>
                    <div style="font-size:0.8rem; color:#64748b;">Let's calm down together.</div>
                </div>
            </div>`;
    }

    container.innerHTML = `<h3 class="section-title" style="margin-top:25px;">Recommended for you</h3>${strategyHtml}`;
};

// 백 버튼 이벤트 바인딩
window.onpopstate = function(event) {
    if (event.state && event.state.screenId) {
        UI.renderScreen(event.state.screenId, event.state.title);
    } else {
        UI.renderScreen('1', 'How are you feeling?');
    }
};

window.UI = UI;
window.renderEmotionChart = (history) => UI.renderEmotionChart(history);