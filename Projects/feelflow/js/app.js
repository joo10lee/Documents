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