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

        // 💡 Phase 2: Header Logic
        const headerTitle = document.getElementById('headerTitle');
        const homeBtn = document.getElementById('navHomeBtn');
        const weatherIcon = document.getElementById('weatherIcon');

        if (cleanId === '1') {
            // Home Screen: Time-based Greeting
            const hour = new Date().getHours();
            let greeting = "Hey Jason,<br>how's it going?";
            if (hour >= 5 && hour < 12) greeting = "Good Morning,<br>Jason! ☀️";
            else if (hour >= 12 && hour < 18) greeting = "Good Afternoon,<br>Jason! 🌤️";
            else if (hour >= 18) greeting = "Good Evening,<br>Jason! 🌙";

            if (headerTitle) headerTitle.innerHTML = greeting;
            if (homeBtn) homeBtn.style.display = 'none'; // Hide Home Button
        } else {
            // Other Screens: Specific Title
            if (headerTitle) headerTitle.textContent = title || "FeelFlow";
            if (homeBtn) homeBtn.style.display = 'block'; // Show Home Button
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

    // 💡 레고 블록 획득 애니메이션
    showLegoAnimation() {
        const burst = document.createElement('div');
        burst.className = 'xp-burst';
        burst.style.zIndex = '9999';
        burst.innerHTML = `
            <div style="font-size:5rem; animation: bounceIn 1s;">🧱</div>
            <div style="font-weight:900; font-size:1.5rem; color:#d97706; margin-top:10px; text-shadow:0 2px 10px rgba(0,0,0,0.2);">
                LEGO BLOCK GET!<br>
                <span style="font-size:1rem; color:white;">+50 XP</span>
            </div>
        `;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 3000);
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

    // 2. 7일 트렌드 차트 렌더링 (Chart.js 연동)
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

    // 3. 감정 기록 리스트 렌더링
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container || !history) return;

        if (history.length === 0) {
            container.innerHTML = '<div class="empty-history"><p>No records yet!</p></div>';
            return;
        }

        const sorted = [...history].sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

        if (sorted.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:#cbd5e1;">No Check-ins yet! 📝</div>`;
            return;
        }

        container.innerHTML = sorted.map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

            const photoHtml = entry.photo
                ? `<img src="${entry.photo}" class="history-photo" alt="Moment">`
                : '';

            const noteHtml = entry.note
                ? `<div class="history-note">${entry.note}</div>`
                : '';

            return `
                <div class="history-card">
                    <div class="history-header">
                        <span>${dateStr}</span>
                        <span>${timeStr}</span>
                    </div>
                    <div class="history-mood">
                        <span style="font-size:1.5rem;">${entry.emoji || '✨'}</span>
                        <span>${entry.emotion}</span>
                        <span style="font-size:0.8rem; color:#7c3aed; margin-left:auto; background:#f3e8ff; padding:2px 8px; border-radius:10px;">Lv.${entry.intensity}</span>
                    </div>
                    ${noteHtml}
                    ${photoHtml}
                </div>`;
        }).join('');
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