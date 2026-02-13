/**
 * UI 관리 모듈: 화면 전환, 네비게이션, 날씨 및 히스토리 렌더링 담당
 */
const UI = {
    // 1. 화면 전환 함수
    // 1. 화면 전환 함수 (중복 방지를 위해 screenTitle 타겟팅 수정)
    goToScreen(screenIndex, title = "") {
        console.log(`🎬 Screen 전환: ${screenIndex}`);
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => s.classList.remove('active'));

        const target = typeof screenIndex === 'number' ? screens[screenIndex] : document.getElementById(`screen${screenIndex}`);
        if (target) target.classList.add('active');

        // ✅ 수정 포인트: .app-title 대신 id="screenTitle"을 업데이트합니다.
        const screenTitle = document.getElementById('screenTitle');
        if (screenTitle) {
            screenTitle.textContent = title;
        }

        window.scrollTo(0, 0);
    },

    // 2. 하단 네비게이션 활성화
    updateNavActive(navId) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(navId);
        if (activeBtn) activeBtn.classList.add('active');
    },

    // 3. 감정 기록 목록 렌더링 (사진 포함)
    renderHistory(history) {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-history"><div class="empty-history-icon">📔</div><p>No records yet!</p></div>';
            return;
        }

        container.innerHTML = history.map(entry => {
            const date = new Date(entry.timestamp || entry.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const photoHtml = entry.photo && typeof entry.photo === 'string' && entry.photo.startsWith('data:image')
                ? `<div class="history-photo-wrapper" style="margin-top:12px; border-radius:12px; overflow:hidden; border:1px solid #edf2f7;">
                     <img src="${entry.photo}" style="width:100%; display:block;">
                   </div>` 
                : '';

            return `
                <div class="history-item" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 15px; width: 100%;">
                        <span style="font-size: 2.5rem;">${entry.emoji}</span>
                        <div class="history-details">
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

    // 4. 날씨 데이터 가공 로직 (통합본)
    getWeatherInfo(code, temp) {
        const weatherMap = {
            0: { icon: '☀️', description: 'Clear', baseTip: 'Beautiful day!' },
            1: { icon: '🌤️', description: 'Mostly clear', baseTip: 'Nice weather!' },
            2: { icon: '⛅', description: 'Partly cloudy', baseTip: 'Nice day!' },
            3: { icon: '☁️', description: 'Cloudy', baseTip: 'Cozy day inside.' },
            45: { icon: '🌫️', description: 'Foggy', baseTip: 'Be careful outside!' },
            51: { icon: '🌧️', description: 'Drizzle', baseTip: 'Grab a jacket!' },
            61: { icon: '🌧️', description: 'Light rain', baseTip: 'Bring an umbrella! ☔' },
            63: { icon: '🌧️', description: 'Rain', baseTip: 'Bring an umbrella! ☔' },
            65: { icon: '🌧️', description: 'Heavy rain', baseTip: 'Umbrella & raincoat needed! ☔' },
            71: { icon: '🌨️', description: 'Light snow', baseTip: 'Dress warmly! 🧥' },
            73: { icon: '🌨️', description: 'Snow', baseTip: 'Bundle up! 🧤' },
            75: { icon: '❄️', description: 'Heavy snow', baseTip: 'Stay warm! ⛄' },
            95: { icon: '⛈️', description: 'Thunderstorm', baseTip: 'Stay inside! ⚡' }
        };
        let info = weatherMap[code] || { icon: '🌤️', description: 'Weather', baseTip: 'Have a great day!' };
        let tip = info.baseTip;
        if (temp < 32) tip = "It's freezing! 🥶 Wear coat, hat & gloves!";
        else if (temp < 50) tip += " It's chilly - grab a jacket! 🧥";
        else if (temp > 90) tip = "Very hot! 🥵 Stay hydrated!";
        else if (temp > 80) tip += " Stay hydrated! 💧";
        return { icon: info.icon, description: info.description, tip };
    },

    // 5. 실제 날씨 UI 업데이트
    displayWeather(data) {
        const temp = Math.round(data.current.temperature_2m);
        const { icon, description, tip } = this.getWeatherInfo(data.current.weather_code, temp);
        
        const elements = {
            temp: document.getElementById('weatherTemp'),
            icon: document.getElementById('weatherIcon'),
            desc: document.getElementById('weatherDesc'),
            tip: document.getElementById('weatherTipText'),
            date: document.getElementById('weatherDate'),
            day: document.getElementById('weatherDay')
        };

        if (elements.temp) elements.temp.textContent = `${temp}°F`;
        if (elements.icon) elements.icon.textContent = icon;
        if (elements.desc) elements.desc.textContent = description;
        if (elements.tip) elements.tip.textContent = tip;

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        if (elements.date) elements.date.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        if (elements.day) elements.day.textContent = days[now.getDay()];
    },

    // 6. 날씨 API 호출 (데이터 통신 후 5번 displayWeather 호출)
    async fetchWeatherByCity(city) {
        try {
            // 좌표 가져오기 (Geocoding)
            const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
            const geoData = await geoResponse.json();
            
            if (geoData.results && geoData.results.length > 0) {
                const { latitude, longitude } = geoData.results[0];
                
                // 실제 날씨 데이터 가져오기
                const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`);
                const weatherData = await weatherResponse.json();
                
                // 화면 업데이트 호출
                this.displayWeather(weatherData);
            } else {
                console.warn("도시를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("날씨 정보 로드 중 오류 발생:", error);
        }
    }



};