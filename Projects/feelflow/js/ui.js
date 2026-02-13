/**
 * UI 관리 모듈: 화면 전환, 네비게이션, 날씨 및 히스토리/차트 렌더링 담당
 */
const UI = {
  
    // 1. 화면 전환 함수 (문자열 ID 및 인덱스 숫자 모두 지원)
    goToScreen(screenId, title) {
        console.log(`🎬 Screen 전환 시도: ${screenId}`);
        
        // 모든 스크린 비활성화
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

        let targetScreen;
        if (typeof screenId === 'number') {
            targetScreen = document.querySelectorAll('.screen')[screenId];
        } else {
            // 'Activity' -> 'screenActivity' 형태로 매칭
            targetScreen = document.getElementById('screen' + screenId);
        }

        if (targetScreen) {
            targetScreen.classList.add('active');
            if (title) {
                const titleEl = document.getElementById('screenTitle');
                if (titleEl) titleEl.textContent = title;
            }
            // 상단 스크롤 초기화
            window.scrollTo(0, 0);
        } else {
            console.error(`❌ 스크린을 찾을 수 없습니다: screen${screenId}`);
        }
    },

    // 2. 하단 네비게이션 활성화 상태 업데이트
    updateNavActive(navId) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(navId);
        if (activeBtn) activeBtn.classList.add('active');
    },

    // 3. [개선] 7일 감정 트렌드 차트 렌더링 (지연 실행 추가)
    renderEmotionChart(history) {
        // 💡 중요: 화면 전환 후 캔버스가 완전히 그려질 시간을 줍니다.
        setTimeout(() => {
            const ctx = document.getElementById('emotionChart');
            if (!ctx || !window.Chart) {
                console.warn("차트 캔버스나 라이브러리를 찾을 수 없습니다.");
                return;
            }

            // 최근 7일 라벨 생성 (월/일 형식)
            const labels = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            }

            // 날짜별 평균 강도 계산: $$Average = \frac{\sum Intensity}{Count}$$
            const dataPoints = labels.map(label => {
                const dayEntries = history.filter(h => 
                    new Date(h.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === label
                );
                if (dayEntries.length === 0) return 0;
                const sum = dayEntries.reduce((acc, curr) => acc + curr.intensity, 0);
                return (sum / dayEntries.length).toFixed(1);
            });

            if (window.myEmotionChart) window.myEmotionChart.destroy();

            window.myEmotionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Avg. Intensity',
                        data: dataPoints,
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#7c3aed',
                        pointRadius: 4
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
        }, 150); // 150ms 지연으로 렌더링 안정성 확보
    },

    // 4. 감정 기록 목록 렌더링
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-history"><div class="empty-history-icon">📔</div><p>No records yet!</p></div>';
            return;
        }

        container.innerHTML = history.slice().reverse().map(entry => {
            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const photoHtml = entry.photo ? `
                <div class="history-photo-wrapper" style="margin-top:12px; border-radius:12px; overflow:hidden; border:1px solid #edf2f7;">
                    <img src="${entry.photo}" style="width:100%; display:block;">
                </div>` : '';

            return `
                <div class="history-item" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 2.5rem;">${entry.emoji}</span>
                        <div>
                            <div style="font-weight: 700; color: #2d3748; font-size: 1.1rem;">${entry.emotion} (Lv.${entry.intensity})</div>
                            <div style="font-size: 0.85rem; color: #a0aec0;">${timeStr}</div>
                        </div>
                    </div>
                    ${entry.note ? `<div style="margin-top:12px; padding:12px; background: #f8fafc; border-radius: 12px; font-size: 0.95rem; color: #4a5568;">${entry.note}</div>` : ''}
                    ${photoHtml}
                </div>
            `;
        }).join('');
    },

    // 5. 날씨 시스템 (로스 가토스 최적화 및 화씨 기준)
    getWeatherInfo(code, temp) {
        const weatherMap = {
            0: { icon: '☀️', description: 'Clear', baseTip: 'Perfect day for golf! ⛳' },
            3: { icon: '☁️', description: 'Cloudy', baseTip: 'Cozy day for gaming on PS5. 🎮' },
            61: { icon: '🌧️', description: 'Rain', baseTip: 'Grab an umbrella! ☔' }
        };
        const info = weatherMap[code] || { icon: '🌤️', description: 'Fair', baseTip: 'Have a great day!' };
        let tip = info.baseTip;
        if (temp > 85) tip = "Stay hydrated in the California sun! 💧";
        return { icon: info.icon, description: info.description, tip };
    },

    displayWeather(data) {
        const temp = Math.round(data.current.temperature_2m);
        const { icon, description, tip } = this.getWeatherInfo(data.current.weather_code, temp);
        
        const el = {
            temp: document.getElementById('weatherTemp'),
            icon: document.getElementById('weatherIcon'),
            desc: document.getElementById('weatherDesc'),
            tip: document.getElementById('weatherTipText'),
            date: document.getElementById('weatherDate'),
            day: document.getElementById('weatherDay')
        };

        if (el.temp) el.temp.textContent = `${temp}°F`;
        if (el.icon) el.icon.textContent = icon;
        if (el.desc) el.desc.textContent = description;
        if (el.tip) el.tip.textContent = tip;

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        if (el.date) el.date.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        if (el.day) el.day.textContent = days[now.getDay()];
    },

    async fetchWeatherByCity(city) {
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
            const geoData = await geoRes.json();
            
            if (geoData.results && geoData.results.length > 0) {
                const { latitude, longitude } = geoData.results[0];
                const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
                const wData = await wRes.json();
                this.displayWeather(wData);
            }
        } catch (e) {
            console.error("Weather load fail:", e);
        }
    }
};

// 전역 브릿지 등록
window.UI = UI;
window.renderEmotionChart = (history) => UI.renderEmotionChart(history);