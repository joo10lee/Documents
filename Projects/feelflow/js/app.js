/**
 * Main App Module: 전역 상태 관리 및 앱 초기화 담당
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5 };
let currentRoutine = 'morning'; // 트래커용

// 2. 앱 초기화 함수 (index.html의 window.onload에서 호출됨)
async function initApp() {
    console.log("🚀 FeelFlow App Initializing...");
    
    // 초기 화면 및 내비게이션 설정
    goHome(); 
    
    // 데이터 로드
    loadSettings();
    initWeather();
    
    try {
        const history = await EmotionAPI.fetchHistory();
        UI.renderHistory(history);
    } catch (e) {
        console.warn("초기 히스토리 로드 실패");
    }
}

// 3. 감정 선택 및 강도 제어
function selectEmotion(name, emoji) {
    currentEmotion.name = name;
    currentEmotion.emoji = emoji;
    
    // HTML의 id값에 맞춰 업데이트
    document.getElementById('selectedEmoji').textContent = emoji;
    document.getElementById('selectedName').textContent = name;
    
    UI.goToScreen(1, "How strong is it?");
}

function updateIntensity(value) {
    currentEmotion.intensity = parseInt(value);
    document.getElementById('intensityDisplay').textContent = value;
}

// 4. 내비게이션 핸들러 (index.html의 onclick과 매칭)
function goHome() {
    UI.goToScreen(0, "How are you feeling today?");
    UI.updateNavActive('navHome');
    document.getElementById('weatherHeader').style.display = 'block';
    document.getElementById('greeting').style.display = 'block';
}

async function goToHistory() {
    UI.goToScreen('History', 'My Check-ins');
    UI.updateNavActive('navHistory');
    document.getElementById('weatherHeader').style.display = 'none';
    document.getElementById('greeting').style.display = 'none';
    
    const history = await EmotionAPI.fetchHistory();
    UI.renderHistory(history);
    if (typeof renderEmotionChart === 'function') renderEmotionChart();
}

function goToTracker() {
    UI.goToScreen('Tracker', 'Life Skills Tracker');
    UI.updateNavActive('navTracker');
    document.getElementById('weatherHeader').style.display = 'none';
    document.getElementById('greeting').style.display = 'none';
    if (typeof renderTracker === 'function') renderTracker();
}

function goToSettings() {
    UI.goToScreen('Settings', 'Settings');
    UI.updateNavActive('navSettings');
    document.getElementById('weatherHeader').style.display = 'none';
    document.getElementById('greeting').style.display = 'none';
}

// 5. 체크인 완료 로직
async function finishCheckIn() {
    const mainNote = document.getElementById('emotionNote').value.trim();
    const actionNoteEl = document.getElementById('actionNote');
    const actionNoteValue = actionNoteEl ? actionNoteEl.value.trim() : '';

    const entry = {
        emotion: currentEmotion.name,
        emoji: currentEmotion.emoji,
        intensity: currentEmotion.intensity,
        note: [mainNote, actionNoteValue].filter(n => n).join(' | Action: '),
        photo: EmotionActions.capturedPhoto,
        timestamp: new Date().toISOString()
    };

    await EmotionManager.saveCheckIn(entry);
    resetAppInput();
    UI.goToScreen(5, "You Did It!");
}

function resetAppInput() {
    document.getElementById('emotionNote').value = '';
    const actionNote = document.getElementById('actionNote');
    if (actionNote) actionNote.value = '';
    EmotionActions.reset();
}

function startOver() {
    goHome();
}

// 6. 날씨 및 세팅 로직 (UI 모듈 연동)
function initWeather() {
    // 실제 API 호출 로직은 UI.fetchWeatherByCity에서 담당
    const city = document.getElementById('settingsCity')?.value || 'Los Gatos';
    UI.fetchWeatherByCity(city);
}

function loadSettings() {
    const saved = localStorage.getItem('feelflow_settings');
    if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('settingsName')) document.getElementById('settingsName').value = data.name || '';
        if (document.getElementById('settingsCity')) document.getElementById('settingsCity').value = data.city || '';
    }
}

/**
 * Settings 관리 기능: 사용자 이름 및 도시 저장/불러오기
 */

// 1. 설정 저장 함수 (index.html의 oninput에서 호출)
function saveSettings() {
    const nameEl = document.getElementById('settingsName');
    const cityEl = document.getElementById('settingsCity');
    
    if (!nameEl || !cityEl) return;

    const nameVal = nameEl.value.trim();
    const cityVal = cityEl.value.trim();

    // 로컬 스토리지에 저장할 객체 구성
    const settings = {
        name: nameVal,
        city: cityVal
    };

    localStorage.setItem('feelflow_settings', JSON.stringify(settings));
    console.log("⚙️ Settings saved:", settings);

    // 저장 성공 시 시각적 피드백 (옵션)
    const savedNotice = document.getElementById('settingsSaved');
    if (savedNotice) {
        savedNotice.classList.add('show');
        setTimeout(() => savedNotice.classList.remove('show'), 2000);
    }

    // 이름이 바뀌었으면 즉시 상단 인사말 업데이트
    updateGreeting(nameVal);
}

// 2. 설정 불러오기 함수 (initApp에서 호출됨)
function loadSettings() {
    const saved = localStorage.getItem('feelflow_settings');
    if (saved) {
        const data = JSON.parse(saved);
        
        const nameEl = document.getElementById('settingsName');
        const cityEl = document.getElementById('settingsCity');
        
        if (nameEl) nameEl.value = data.name || '';
        if (cityEl) cityEl.value = data.city || '';
        
        // 상단 인사말 업데이트
        updateGreeting(data.name);
    }
}

// 3. 상단 인사말 업데이트 보조 함수
function updateGreeting(name) {
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;
    
    const hour = new Date().getHours();
    let timeText = hour >= 5 && hour < 12 ? 'Good morning' : 
                   hour >= 12 && hour < 18 ? 'Good afternoon' : 'Good evening';
                   
    greetingEl.textContent = name ? `${timeText}, ${name}!` : `${timeText}!`;
}


/**
 * Settings & Utilities: 설정 저장, 불러오기 및 위치 서비스
 */

// 1. 설정 저장 (Auto-save on input)
function saveSettings() {
    const nameEl = document.getElementById('settingsName');
    const ageEl = document.getElementById('settingsAge');
    const cityEl = document.getElementById('settingsCity');
    
    if (!nameEl || !cityEl) return;

    const settings = {
        name: nameEl.value.trim(),
        age: ageEl ? ageEl.value : '',
        city: cityEl.value.trim()
    };

    localStorage.setItem('feelflow_settings', JSON.stringify(settings));
    console.log("⚙️ Settings saved:", settings);

    // 저장 완료 메시지 표시
    const savedNotice = document.getElementById('settingsSaved');
    if (savedNotice) {
        savedNotice.classList.add('show');
        setTimeout(() => savedNotice.classList.remove('show'), 2000);
    }

    // 이름 변경 시 즉시 인사말 반영
    updateGreeting(settings.name);
}

// 2. 설정 불러오기
function loadSettings() {
    const saved = localStorage.getItem('feelflow_settings');
    if (saved) {
        const data = JSON.parse(saved);
        if (document.getElementById('settingsName')) document.getElementById('settingsName').value = data.name || '';
        if (document.getElementById('settingsAge')) document.getElementById('settingsAge').value = data.age || '';
        if (document.getElementById('settingsCity')) document.getElementById('settingsCity').value = data.city || '';
        updateGreeting(data.name);
    }
}

// 3. 인사말 업데이트
function updateGreeting(name) {
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;
    
    const hour = new Date().getHours();
    let timeGreeting = hour >= 5 && hour < 12 ? 'Good morning' : 
                       hour >= 12 && hour < 18 ? 'Good afternoon' : 'Good evening';
                       
    greetingEl.textContent = name ? `${timeGreeting}, ${name}!` : `${timeGreeting}!`;
}

// 4. 위치 정보 요청 (Settings 화면용)
function requestLocation() {
    const statusEl = document.getElementById('locationStatus');
    if (!navigator.geolocation) {
        if (statusEl) statusEl.textContent = "Geolocation not supported";
        return;
    }

    statusEl.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            statusEl.textContent = "✓ Location detected";
            statusEl.className = "location-status success";
            
            // 좌표 기반 날씨 업데이트 (UI 모듈에 해당 함수가 있어야 함)
            if (typeof UI.fetchWeatherByCoords === 'function') {
                UI.fetchWeatherByCoords(latitude, longitude);
            }
        },
        (error) => {
            statusEl.textContent = "Error detecting location";
            statusEl.className = "location-status error";
        }
    );
}

// 5. 전체 데이터 초기화
function clearAllData() {
    if (confirm('Delete ALL data including check-ins, tracker, and settings?')) {
        localStorage.clear();
        location.reload();
    }
}