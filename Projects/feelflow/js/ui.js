/**
 * UI 관리 모듈: 화면 전환, 네비게이션, 날씨 및 히스토리/차트 렌더링 담당
 */
const UI = {
  
 // 1. 화면 전환 함수 (히스토리 스택 쌓기)
    goToScreen(screenId, title) {
        // 💡 실제 화면을 그리는 로직 호출
        this.renderScreen(screenId, title);

        // 💡 브라우저 히스토리에 상태 저장 (이게 있어야 백 버튼이 동작함)
        const state = { screenId, title };
        window.history.pushState(state, "", ""); 
    },

    // 💡 [신규 추가] 순수하게 화면만 렌더링 (popstate와 중복 사용을 위해 분리)
    renderScreen(screenId, title) {
        console.log(`🎨 화면 렌더링: ${screenId}`);
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        let targetScreen = typeof screenId === 'number' 
            ? document.querySelectorAll('.screen')[screenId] 
            : document.getElementById(screenId.startsWith('screen') ? screenId : 'screen' + screenId);

        if (targetScreen) {
            targetScreen.classList.add('active');
            if (title) {
                const titleEl = document.getElementById('screenTitle');
                if (titleEl) titleEl.textContent = title;
            }
            window.scrollTo(0, 0);
        }

        // 💡 활동 화면이 아닌 곳으로 이동 시 활동 중단(Cleanup)
        if (screenId !== 'Activity' && screenId !== 'screenActivity' && window.Activities?.stopAll) {
            window.Activities.stopAll();
        }
    },

    // 💡 [신규 추가] 인앱 백 버튼 함수
    back() {
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

    // 3. 7일 트렌드 차트 렌더링 (기존 성공 로직 유지 + 날짜 정밀도 강화)
    renderEmotionChart(history) {
        setTimeout(() => {
            const ctx = document.getElementById('emotionChart');
            if (!ctx || !window.Chart) return;

            // 💡 날짜 비교를 위한 YYYY-MM-DD 추출 헬퍼
            const toISODate = (d) => new Date(d).toISOString().split('T')[0];

            const labels = [];
            const isoLabels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                isoLabels.push(toISODate(d));
            }

            const dataPoints = isoLabels.map(isoDate => {
                const dayEntries = history.filter(h => toISODate(h.timestamp || h.createdAt) === isoDate);
                if (dayEntries.length === 0) return 0;
                
                // 평균 강도 계산: $$ \text{Average} = \frac{\sum \text{Intensity}}{\text{Count}} $$
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
                        fill: true,
                        pointBackgroundColor: '#7c3aed',
                        pointRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 10, ticks: { stepSize: 2 } },
                        x: { grid: { display: false } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }, 300); // 렌더링 안정성을 위해 300ms 지연 유지
    },

    // 4. [수정] 감정 기록 리스트 렌더링 (데이터 필드 보정 및 최신순 정렬)
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-history"><p>No records yet!</p></div>';
            return;
        }

        // 💡 최신 데이터가 위로 오도록 정렬
        const sortedHistory = [...history].sort((a, b) => 
            new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
        );

        container.innerHTML = sortedHistory.map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // 💡 "Test"나 "Success" 같은 오염된 텍스트 방어 로직
            let displayEmotion = entry.emotion || "Feeling";
            if (displayEmotion === "Test" || displayEmotion === "Success") {
                displayEmotion = "Mood Check"; 
            }

            const photoHtml = entry.photo ? `
                <div class="history-photo-wrapper" style="margin-top:12px; border-radius:12px; overflow:hidden;">
                    <img src="${entry.photo}" style="width:100%; display:block; object-fit:cover; max-height:200px;">
                </div>` : '';

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
                </div>
            `;
        }).join('');
    },

    // 5. 날씨 시스템 (로스 가토스/취미 테마 유지)
    getWeatherInfo(code, temp) {
        const weatherMap = { 0: '☀️', 3: '☁️', 61: '🌧️' };
        const icon = weatherMap[code] || '🌤️';
        let tip = temp > 80 ? "Perfect day for golf! ⛳" : "Great for a round of Baldur's Gate 3. 🎮";
        return { icon, tip };
    },

    displayWeather(data) {
        const temp = Math.round(data.current.temperature_2m);
        const { icon, tip } = this.getWeatherInfo(data.current.weather_code, temp);
        
        const el = {
            temp: document.getElementById('weatherTemp'),
            icon: document.getElementById('weatherIcon'),
            tip: document.getElementById('weatherTipText'),
            date: document.getElementById('weatherDate'),
            day: document.getElementById('weatherDay')
        };

        if (el.temp) el.temp.textContent = `${temp}°F`;
        if (el.icon) el.icon.textContent = icon;
        if (el.tip) el.tip.textContent = tip;

        const now = new Date();
        if (el.date) el.date.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        if (el.day) el.day.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    },

    async fetchWeatherByCity(city) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.2267&longitude=-121.9746&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
            const data = await res.json();
            this.displayWeather(data);
        } catch (e) { console.error("Weather load fail:", e); }
    }
};

/**
 * 🧠 지능형 전략 렌더러 (Ver.0215-1500)
 * 제이슨의 감정 상태를 분석하여 맞춤형 미션 카드를 생성합니다.
 */
/**
 * 🧠 지능형 전략 렌더러 (Ver.0215-1700 / Debug Mode)
 */
wwindow.renderStrategies = function(emotionName, intensity) {
    const container = document.getElementById('strategiesContainer');
    if (!container) return;

    console.log(`🔍 [Strategy Logic] Emotion: ${emotionName}, Intensity: ${intensity}`);

    let strategyHtml = "";
    const name = emotionName ? emotionName.trim().toLowerCase() : "";

    // 💡 텍스트 "happy" 뿐만 아니라 에모지 "😊" 도 직접 체크합니다.
    if (name === 'happy' || name === '😊') {
        if (Number(intensity) > 2) {
            strategyHtml = `
                <div class="strategy-grid">
                    <div class="bento-card hero-card" onclick="startActivity('Happy Note')">
                        <span class="recommend-tag">WRITE</span>
                        <span class="quest-icon">✍️</span>
                        <div class="quest-info">
                            <div class="quest-title">Happy Note</div>
                            <div style="font-size:0.8rem; opacity:0.9;">Write your joy + Add Photo</div>
                        </div>
                    </div>
                </div>`;
        } else {
            strategyHtml = `
                <div class="bento-card hero-card" onclick="startActivity('Happy Note')">
                    <span class="recommend-tag">SMALL JOY</span>
                    <span class="quest-icon">🌱</span>
                    <div class="quest-info">
                        <div class="quest-title">Happy Note</div>
                        <div style="font-size:0.8rem; opacity:0.9;">What made you smile a little?</div>
                    </div>
                </div>`;
        }
    } else {
        // Happy가 아닐 때만 Deep Breath
        strategyHtml = `
            <div class="bento-card" onclick="startActivity('Deep Breath')">
                <span class="quest-icon">🌬️</span>
                <div class="quest-info">
                    <div class="quest-title">Deep Breath</div>
                    <div style="font-size:0.8rem; color:#64748b;">Let's calm down together.</div>
                </div>
            </div>`;
    }

    container.innerHTML = `<h3 class="section-title" style="margin-top:25px;">Recommended for you</h3>${strategyHtml}`;
};


// 전역 등록
// 💡 브라우저/하드웨어 백 버튼 클릭 시 실행
window.onpopstate = function(event) {
    if (event.state) {
        // 히스토리에 저장된 이전 화면 ID로 화면만 다시 그림 (pushState 호출 안 함)
        UI.renderScreen(event.state.screenId, event.state.title);
    } else {
        // 초기 상태(홈 화면)
        UI.renderScreen('1', 'How are you feeling?');
    }
};
window.UI = UI;
window.renderEmotionChart = (history) => UI.renderEmotionChart(history);
