/**
 * 🏠 FeelFlow UI Module: Ver.0215-4000
 * 기능: 화면 전환, 백 버튼 복구, 날씨, 7일 차트, 히스토리 리스트, 전 감정 전략 통합
 */

const UI = {
    // 1. 화면 전환 및 히스토리 관리 (ID 정규화 포함)
    goToScreen(screenId, title) {
        if (!screenId) return;
        const cleanId = screenId.toString().replace('screen', '');
        console.log(`📍 UI: Moving to screen${cleanId}`);
        
        this.renderScreen(cleanId, title);

        try {
            // 브라우저 히스토리에 정규화된 ID 저장 (백 버튼 복구의 핵심)
            window.history.pushState({ screenId: cleanId, title: title }, "", ""); 
        } catch (e) { console.error("History Error:", e); }
    },

    renderScreen(screenId, title) {
        const cleanId = screenId.toString().replace('screen', '');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        // ID가 'screen1' 혹은 '1'인 경우 모두 대응
        const target = document.getElementById('screen' + cleanId) || document.getElementById(cleanId);
        
        if (target) {
            target.classList.add('active');
            const titleEl = document.getElementById('screenTitle');
            if (titleEl && title) titleEl.textContent = title;
            window.scrollTo(0, 0);
        }

        // 활동 중단 Cleanup (Activity 화면을 벗어날 때)
        if (cleanId !== 'Activity' && cleanId !== 'screenActivity' && window.Activities?.stopAll) {
            window.Activities.stopAll();
        }
    },

    back() {
        console.log("🔙 UI: Back Button Triggered");
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

    // 2. 7일 트렌드 차트 렌더링 (전체 로직 복구)
    renderEmotionChart(history) {
        setTimeout(() => {
            const ctx = document.getElementById('emotionChart');
            if (!ctx || !window.Chart || !history) return;

            const toISODate = (d) => new Date(d).toISOString().split('T')[0];
            const labels = [];
            const isoLabels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                isoLabels.push(toISODate(d));
            }

            // 평균 강도 계산 수식 적용
            // $$ \text{Avg Intensity} = \frac{\sum \text{Intensity}}{\text{Count}} $$
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

    // 3. 감정 기록 리스트 렌더링 (전체 로직 복구)
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container || !history) return;

        if (history.length === 0) {
            container.innerHTML = '<div class="empty-history"><p>No records yet!</p></div>';
            return;
        }

        const sorted = [...history].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
        container.innerHTML = sorted.map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const photoHtml = entry.photo ? `<div class="history-photo-wrapper" style="margin-top:12px; border-radius:12px; overflow:hidden;"><img src="${entry.photo}" style="width:100%; object-fit:cover; max-height:200px;"></div>` : '';
            return `
                <div class="history-item" style="background:white; border-radius:24px; padding:20px; margin-bottom:16px; box-shadow:0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <span style="font-size:2.8rem;">${entry.emoji || '✨'}</span>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#2d3748;"><span>${entry.emotion}</span> <span style="color:#7c3aed; float:right;">Lv.${entry.intensity}</span></div>
                            <div style="font-size:0.85rem; color:#a0aec0;">${timeStr}</div>
                        </div>
                    </div>
                    ${entry.note ? `<div style="margin-top:12px; padding:12px; background:#f8fafc; border-radius:12px;">${entry.note}</div>` : ''}
                    ${photoHtml}
                </div>`;
        }).join('');
    },

    // 4. 날씨 및 시간
    displayWeather(data) {
        if (!data) return;
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
        } catch (e) { console.error("Weather Fail"); }
    }
};

/**
 * 🧠 지능형 전략 렌더러 (Fixed & Complete Spectrum)
 * 이 함수는 Happy 1/2 단계 판정 및 모든 감정의 추천 카드를 생성합니다.
 */
window.renderStrategies = function(emotionName, intensity) {
    // DOM 로드 대기를 위해 50ms 지연
    setTimeout(() => {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;

        const name = emotionName ? emotionName.toString().trim().toLowerCase() : "";
        const level = parseInt(intensity) || 5;
        
        console.log(`🧠 Strategy Logic: Emotion=${name}, Level=${level}`);

        let strategyHtml = "";

        // 1. Happy (😊) - 1, 2단계는 Small Joy
        if (name.includes('happy') || name === '😊') {
            if (level <= 2) {
                strategyHtml = `<div class="bento-card hero-card" onclick="startQuest('HappyNote', 'Happy Note')"><span class="recommend-tag">SMALL JOY</span><span class="quest-icon">🌱</span><div class="quest-info"><div class="quest-title">Happy Note</div><div style="font-size:0.8rem; opacity:0.9;">One tiny happy thing?</div></div></div>`;
            } else {
                strategyHtml = `<div class="strategy-grid"><div class="bento-card hero-card" onclick="startQuest('HappyNote', 'Happy Note')"><span class="recommend-tag">WRITE</span><span class="quest-icon">✍️</span><div class="quest-info"><div class="quest-title">Happy Note</div><div style="font-size:0.8rem; opacity:0.9;">Write your joy + Photo</div></div></div></div>`;
            }
        } 
        // 2. Sad (😢)
        else if (name.includes('sad') || name === '😢') {
            strategyHtml = `<div class="strategy-grid"><div class="bento-card hero-card" onclick="startQuest('Capture', 'Capture the moment')"><span class="recommend-tag">GOLD</span><span class="quest-icon">📸</span><div class="quest-info"><div>Capture joy</div></div></div><div class="bento-card" onclick="startQuest('Music', 'Listen to music')"><span class="quest-icon">🎵</span><div class="quest-info"><div>Music</div></div></div></div>`;
        }
        // 3. Anxious (😰)
        else if (name.includes('anxious') || name === '😰') {
            strategyHtml = `<div class="strategy-grid"><div class="bento-card hero-card" onclick="startQuest('DeepBreath', 'Deep Breathing')"><span class="recommend-tag">CALM</span><span class="quest-icon">🌬️</span><div class="quest-info"><div>Breathing</div></div></div><div class="bento-card" onclick="startQuest('Grounding', '5-4-3-2-1 Grounding')"><span class="quest-icon">🖐️</span><div class="quest-info"><div>Grounding</div></div></div></div>`;
        }
        // 4. Angry (😡)
        else if (name.includes('angry') || name === '😡') {
            strategyHtml = `<div class="strategy-grid"><div class="bento-card hero-card" onclick="startQuest('PushWall', 'Push the Wall')"><span class="recommend-tag">POWER</span><span class="quest-icon">🧱</span><div class="quest-info"><div>Push hard!</div></div></div><div class="bento-card" onclick="startQuest('Squeeze', 'Squeeze & Release')"><span class="quest-icon">✊</span><div class="quest-info"><div>Squeeze</div></div></div></div>`;
        }
        else {
            strategyHtml = `<div class="bento-card" onclick="startQuest('DeepBreath', 'Deep Breathing')"><span class="quest-icon">🌬️</span><div class="quest-info"><div>Just Breathe</div></div></div>`;
        }

        container.innerHTML = `<h3 class="section-title" style="margin-top:25px;">Recommended for you</h3>${strategyHtml}`;
    }, 50);
};

// 브라우저 백 버튼 이벤트
window.onpopstate = function(event) {
    if (event.state && event.state.screenId) {
        UI.renderScreen(event.state.screenId, event.state.title);
    } else {
        UI.renderScreen('1', 'How are you feeling?');
    }
};

window.UI = UI;
window.renderEmotionChart = (h) => UI.renderEmotionChart(h);