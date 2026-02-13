/**
 * UI 관리 모듈: 화면 전환, 네비게이션, 날씨 및 히스토리/차트 렌더링 담당
 */
const UI = {
  
    // 1. 화면 전환 함수
    goToScreen(screenId, title) {
        console.log(`🎬 Screen 전환 시도: ${screenId}`);
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        let targetScreen = typeof screenId === 'number' 
            ? document.querySelectorAll('.screen')[screenId] 
            : document.getElementById('screen' + screenId);

        if (targetScreen) {
            targetScreen.classList.add('active');
            if (title) {
                const titleEl = document.getElementById('screenTitle');
                if (titleEl) titleEl.textContent = title;
            }
            window.scrollTo(0, 0);
        } else {
            console.error(`❌ 스크린을 찾을 수 없습니다: screen${screenId}`);
        }
    },

    // 2. 하단 네비게이션 활성화
    updateNavActive(navId) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(navId);
        if (activeBtn) activeBtn.classList.add('active');
    },

    // 3. 7일 트렌드 차트 렌더링 (데이터 타입 검증 보강)
    renderEmotionChart(history) {
        setTimeout(() => {
            const ctx = document.getElementById('emotionChart');
            if (!ctx || !window.Chart) return;

            const labels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }

            const dataPoints = labels.map(label => {
                const dayEntries = history.filter(h => {
                    const hDate = new Date(h.timestamp || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return hDate === label;
                });
                if (dayEntries.length === 0) return 0;
                // intensity가 문자열로 들어올 경우를 대비해 Number()로 강제 형변환
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
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 10, ticks: { stepSize: 2, color: '#94a3b8' }, grid: { borderDash: [5, 5] } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }, 200);
    },

    // 4. 감정 기록 리스트 렌더링 (데이터 필드 보정 로직 추가)
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-history"><div class="empty-history-icon">📔</div><p>No records yet!</p></div>';
            return;
        }

        // 최신 데이터가 위로 오도록 정렬하여 출력
        container.innerHTML = [...history].sort((a, b) => 
            new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
        ).map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // 💡 팁: 'Test'나 'Success'가 표시되는 것을 막기 위해 감정(emotion) 필드 재검증
            // 만약 감정 데이터가 오염되었다면 에모지 뒤의 텍스트를 우선시하거나 기본값을 부여합니다.
            const displayEmotion = (entry.emotion === 'Test' || entry.emotion === 'Success') 
                ? "Emotion Check" 
                : (entry.emotion || "Feeling");

            const photoHtml = entry.photo ? `
                <div class="history-photo" style="margin-top:12px; border-radius:16px; overflow:hidden; border: 1px solid #f1f5f9;">
                    <img src="${entry.photo}" style="width:100%; display:block; object-fit: cover; max-height: 250px;">
                </div>` : '';

            return `
                <div class="history-item" style="background:white; border-radius:24px; padding:20px; margin-bottom:16px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:2.8rem;">${entry.emoji || '✨'}</span>
                        <div style="flex: 1;">
                            <div style="font-weight:800; color:#1e293b; font-size:1.15rem; display: flex; justify-content: space-between;">
                                <span>${displayEmotion}</span>
                                <span style="color:#7c3aed; font-size:0.95rem;">Lv.${entry.intensity}</span>
                            </div>
                            <div style="font-size:0.85rem; color:#64748b; font-weight: 500;">${timeStr}</div>
                        </div>
                    </div>
                    ${entry.note ? `<div style="margin-top:14px; padding:12px 16px; background:#f8fafc; border-radius:16px; font-size:0.95rem; color:#475569; line-height: 1.5;">${entry.note}</div>` : ''}
                    ${photoHtml}
                </div>
            `;
        }).join('');
    },

    // 5. 날씨 시스템 (Los Gatos 로컬라이징)
    getWeatherInfo(code, temp) {
        const weatherMap = {
            0: { icon: '☀️', description: 'Clear', baseTip: 'Perfect day for golf! ⛳' },
            3: { icon: '☁️', description: 'Cloudy', baseTip: 'Great time for Ghost of Tsushima. 🎮' },
            61: { icon: '🌧️', description: 'Rain', baseTip: 'Keep the PS5 controller close. 🎮' }
        };
        const info = weatherMap[code] || { icon: '🌤️', description: 'Fair', baseTip: 'Have a productive day!' };
        let tip = info.baseTip;
        if (temp > 85) tip = "Stay hydrated in the California sun! 💧";
        return { icon: info.icon, description: info.description, tip };
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
            // 로스 가토스 좌표 고정 또는 Geocoding 사용
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=37.2267&longitude=-121.9746&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
            const data = await res.json();
            this.displayWeather(data);
        } catch (e) {
            console.error("Weather load fail:", e);
        }
    }
};

// 전역 브릿지 등록
window.UI = UI;
window.renderEmotionChart = (history) => UI.renderEmotionChart(history);