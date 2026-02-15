/**
 * UI 관리 모듈: 화면 전환, 네비게이션, 날씨 및 히스토리/차트 렌더링 담당
 */
const UI = {
    // 1. 화면 전환 함수 (히스토리 스택 정규화)
    goToScreen(screenId, title) {
        const cleanId = screenId.toString().replace('screen', '');
        this.renderScreen(cleanId, title);

        const state = { screenId: cleanId, title: title };
        window.history.pushState(state, "", ""); 
        console.log(`📍 History Pushed: screen${cleanId}`);
    },

    // 💡 화면 렌더링 로직 (DOM 조작)
    renderScreen(screenId, title) {
        const cleanId = screenId.toString().replace('screen', '');
        console.log(`🎨 화면 렌더링: screen${cleanId}`);
        
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

    // 💡 백 버튼 (상태 체크 강화)
    back() {
        console.log("🔙 Back Button Clicked");
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.goToScreen('1', 'How are you feeling?');
        }
    },

    // 2. 하단 네비게이션 활성화 상태 업데이트
    updateNavActive(navId) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(navId);
        if (activeBtn) activeBtn.classList.add('active');
    },

    // 3. 7일 트렌드 차트 렌더링 (전체 로직 복구)
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
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true, pointBackgroundColor: '#7c3aed', pointRadius: 5
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

    // 4. 감정 기록 리스트 렌더링 (전체 로직 복구)
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
            if (displayEmotion === "Test" || displayEmotion === "Success") displayEmotion = "Mood Check"; 
            const photoHtml = entry.photo ? `<div class="history-photo-wrapper" style="margin-top:12px; border-radius:12px; overflow:hidden;"><img src="${entry.photo}" style="width:100%; display:block; object-fit:cover; max-height:200px;"></div>` : '';
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
                    ${entry.note ? `<div style="margin-top:12px; padding:12px; background:#f8fafc; border-radius:12px; font-size:0.95rem; color:#4a5568;">${entry.note}</div>` : ''}
                    ${photoHtml}
                </div>`;
        }).join('');
    },

    // 5. 날씨 시스템
    getWeatherInfo(code, temp) {
        const weatherMap = { 0: '☀️', 3: '☁️', 61: '🌧️' };
        const icon = weatherMap[code] || '🌤️';
        return { icon, tip: temp > 80 ? "Perfect day for golf! ⛳" : "Great for a round of Baldur's Gate 3. 🎮" };
    },

    displayWeather(data) {
        const temp = Math.round(data.current.temperature_2m);
        const { icon, tip } = this.getWeatherInfo(data.current.weather_code, temp);
        if (document.getElementById('weatherTemp')) document.getElementById('weatherTemp').textContent = `${temp}°F`;
        if (document.getElementById('weatherIcon')) document.getElementById('weatherIcon').textContent = icon;
        if (document.getElementById('weatherTipText')) document.getElementById('weatherTipText').textContent = tip;
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
 * 🧠 지능형 전략 렌더러 (Fixed Ver.0215)
 * Happy 1-2 로직 및 함수 이름(startQuest) 통일
 */
window.renderStrategies = function(emotionName, intensity) {
    const container = document.getElementById('strategiesContainer');
    if (!container) return;

    const name = emotionName ? emotionName.toString().trim().toLowerCase() : "";
    const level = parseInt(intensity);
    console.log(`🔍 [Strategy Logic] Name: ${name}, Level: ${level}`);

    let strategyHtml = "";

    if (name === 'happy' || name === '😊') {
        if (level <= 2) {
            // [Happy & Level 1-2] 🌱 SMALL JOY
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
            // [Happy & Level 3+] ✍️ JOY JOURNEY
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

// 💡 브라우저/하드웨어 백 버튼 클릭 시 실행
window.onpopstate = function(event) {
    if (event.state && event.state.screenId) {
        UI.renderScreen(event.state.screenId, event.state.title);
    } else {
        UI.renderScreen('1', 'How are you feeling?');
    }
};

window.UI = UI;
window.renderEmotionChart = (history) => UI.renderEmotionChart(history);