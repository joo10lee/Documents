/**
 * Main App Module: 전역 상태 관리 및 앱 초기화 담당
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5 };
let currentRoutine = 'morning'; 

// 2. 앱 초기화 함수
async function initApp() {
    console.log("🚀 FeelFlow App Initializing...");
    goHome(); 
    loadSettings();
    initWeather();
    
    try {
        const history = await EmotionAPI.fetchHistory();
        UI.renderHistory(history);
    } catch (e) {
        console.warn("초기 히스토리 로드 실패");
    }
}

// 3. 감정 선택 및 흐름 제어 (에러 해결 포인트)
function selectEmotion(name, emoji) {
    if (typeof feedback === 'function') feedback('tap');
    currentEmotion.name = name;
    currentEmotion.emoji = emoji;
    
    document.getElementById('selectedEmoji').textContent = emoji;
    document.getElementById('selectedName').textContent = name;
    
    UI.goToScreen(1, "How strong is it?");
}

function updateIntensity(value) {
    currentEmotion.intensity = parseInt(value);
    document.getElementById('intensityDisplay').textContent = value;
}

// [에러 해결] index.html의 Next 버튼이 찾는 함수
function goToResult() {
    if (typeof feedback === 'function') feedback('tap');
    
    document.getElementById('resultEmoji').textContent = currentEmotion.emoji;
    document.getElementById('resultText').textContent = `${currentEmotion.name} at level ${currentEmotion.intensity}`;
    
    UI.goToScreen(2, "Check-in Complete!");
}

// [추가] Strategies 화면으로 이동
function goToStrategies() {
    if (typeof feedback === 'function') feedback('tap');
    
    const container = document.getElementById('strategiesEmoji');
    if (container) container.textContent = currentEmotion.emoji;
    
    // activities.js의 로직을 호출하여 추천 활동 표시
    if (typeof renderStrategies === 'function') {
        renderStrategies(currentEmotion.name);
    }
    
    UI.goToScreen(3, "Helpful Strategies");
}

// 4. 내비게이션 핸들러
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

// 5. 체크인 완료 및 데이터 저장
async function finishCheckIn() {
    if (typeof feedback === 'function') feedback('success');
    
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
    const intensitySlider = document.getElementById('intensitySlider');
    if (intensitySlider) intensitySlider.value = 5;
    document.getElementById('intensityDisplay').textContent = '5';
    
    if (window.EmotionActions) window.EmotionActions.reset();
}

function startOver() {
    goHome();
}

// 6. 설정(Settings) 및 날씨 관리 (중복 제거 통합본)
function saveSettings() {
    const nameVal = document.getElementById('settingsName')?.value.trim();
    const cityVal = document.getElementById('settingsCity')?.value.trim();
    const ageVal = document.getElementById('settingsAge')?.value;

    const settings = { name: nameVal, city: cityVal, age: ageVal };
    localStorage.setItem('feelflow_settings', JSON.stringify(settings));

    const savedNotice = document.getElementById('settingsSaved');
    if (savedNotice) {
        savedNotice.classList.add('show');
        setTimeout(() => savedNotice.classList.remove('show'), 2000);
    }

    updateGreeting(nameVal);
    if (cityVal) UI.fetchWeatherByCity(cityVal);
}

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

function updateGreeting(name) {
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;
    
    const hour = new Date().getHours();
    let timeGreeting = hour >= 5 && hour < 12 ? 'Good morning' : 
                       hour >= 12 && hour < 18 ? 'Good afternoon' : 'Good evening';
                       
    greetingEl.textContent = name ? `${timeGreeting}, ${name}!` : `${timeGreeting}!`;
}

function initWeather() {
    const city = document.getElementById('settingsCity')?.value || 'Los Gatos';
    UI.fetchWeatherByCity(city);
}

function clearAllData() {
    if (confirm('Delete ALL data including check-ins, tracker, and settings?')) {
        localStorage.clear();
        location.reload();
    }
}