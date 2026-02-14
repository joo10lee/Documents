/**
 * Main App Module: 전역 상태 관리 및 앱 초기화 담당
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let currentRoutine = 'morning'; 

// 2. 앱 초기화
async function initApp() {
    console.log("🚀 FeelFlow App Initializing...");
    loadSettings();
    initWeather();
    goHome(); 
    
    try {
        const history = await EmotionAPI.fetchHistory();
        if (history) UI.renderHistory(history);
    } catch (e) {
        console.warn("초기 히스토리 로드 실패");
    }
}

// 3. 감정 및 강도 제어
function selectEmotion(name, emoji, color) {
    if (window.Activities) {
        window.Activities.initAudio();
        window.Activities.feedback('tap'); 
    }

    currentEmotion.name = name;
    currentEmotion.emoji = emoji;
    currentEmotion.color = color; 
    
    const emojiDisplay = document.getElementById('selectedEmoji');
    const nameDisplay = document.getElementById('selectedName');
    if (emojiDisplay) emojiDisplay.textContent = emoji;
    if (nameDisplay) nameDisplay.textContent = name;
    
    // 💡 ID 기반 내비게이션 통일 ('2' = Intensity 화면)
    UI.goToScreen('2', "How strong is it?");
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
}

// 4. 화면 흐름 제어 (ID 기반 무결성 확보)
/**
 * [Build 1630] Screen 3을 건너뛰고 Screen 4로 데이터를 스티칭하는 핵심 로직
 */
function goToResult() {
    if (typeof feedback === 'function') feedback('tap');
    
    // 1. Screen 4 상단의 요약 바 업데이트 (모든 감정 대응)
    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryText = document.getElementById('summaryText');
    const summaryBar = document.getElementById('resultSummaryBar');

    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} at Level ${currentEmotion.intensity}`;
    
    // 💡 감정의 컬러를 요약 바 배경에 살짝 스티칭 (시각적 일관성)
    if (summaryBar) {
        summaryBar.style.backgroundColor = `${currentEmotion.color}20`; // 20% 투명도
        summaryBar.style.borderColor = currentEmotion.color;
    }

    // 2. 해당 감정에 맞는 전략 리스트 렌더링
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name);
    }
    
    // 3. Screen 3을 스킵하고 바로 4번(전략) 화면으로 이동
    UI.goToScreen('4', "Personalized Strategies");
}

function goToStrategies() {
    if (typeof feedback === 'function') feedback('tap');
    
    const container = document.getElementById('strategiesEmoji');
    if (container) container.textContent = currentEmotion.emoji;
    
    if (typeof renderStrategies === 'function') {
        renderStrategies(currentEmotion.name);
    }
    
    // 💡 숫자 3 대신 문자열 ID '4' (Strategies 화면) 사용
    UI.goToScreen('4', "Helpful Strategies");
}

// 5. 활동 전용 기능 (SMS 전송 등)
function setupActivityButton(type) {
    const btn = document.getElementById('activityBtn');
    if (!btn) return;

    if (type === 'joy') {
        btn.textContent = "Send Joy via SMS 💌";
        btn.onclick = () => shareJoy(); 
    } else {
        btn.textContent = "Save & Finish";
        btn.onclick = () => finishCheckIn();
    }
}

function shareJoy() {
    const msgArea = document.getElementById('actionNote');
    const message = msgArea && msgArea.value.trim() !== "" 
        ? msgArea.value 
        : "오늘 정말 기분 좋은 일이 있었어! 함께 나누고 싶어 ✨";
    
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
    setTimeout(() => finishCheckIn(), 1500);
}

// 6. 저장 및 완료 로직 (사진 데이터 동기화)
async function finishCheckIn() {
    console.log("💾 데이터 저장 중...");

    // activities.js에서 촬영된 사진 데이터를 가져옴
    const note = document.getElementById('actionNote')?.value || "";
    const photo = window.lastCapturedPhoto || null; 

    const entry = {
        emotion: currentEmotion.name || "Feeling",
        emoji: currentEmotion.emoji || "✨",
        intensity: currentEmotion.intensity,
        note: note,
        photo: photo,
        timestamp: new Date().toISOString()
    };

    try {
        await EmotionAPI.saveCheckIn(entry);
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 
    } catch (error) {
        console.error("❌ 저장 실패:", error);
    }
}

// 7. 내비게이션 및 리셋
function goHome() {
    UI.goToScreen('1', "How are you feeling today?");
    UI.updateNavActive('navHome');
    
    const weatherHeader = document.getElementById('weatherHeader');
    const greeting = document.getElementById('greeting');
    if (weatherHeader) weatherHeader.style.display = 'block';
    if (greeting) greeting.style.display = 'block';
    
    resetAppInput();
}

function startOver() {
    currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
    goHome();
}

function resetAppInput() {
    if (document.getElementById('emotionNote')) document.getElementById('emotionNote').value = '';
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    
    // 💡 캡처된 사진 변수 초기화 (메모리 누수 방지)
    window.lastCapturedPhoto = null; 
    
    const slider = document.getElementById('intensitySlider');
    if (slider) {
        slider.value = 5;
        const display = document.getElementById('intensityDisplay');
        if (display) display.textContent = '5';
    }
}

// 8. 서브 화면 이동
// app.js의 goToTracker와 goToHistory 함수 내부를 아래처럼 보강하세요.
// Tracker 화면으로 갈 때 데이터 로직 깨우기
function goToTracker() {
    UI.goToScreen('Tracker', 'Life Skills Tracker');
    UI.updateNavActive('navTracker');
    
    // 💡 [핵심] 트래커 데이터 로드 및 렌더링 엔진 호출
    if (window.Tracker && typeof window.Tracker.init === 'function') {
        window.Tracker.init(); 
    } else if (typeof renderTracker === 'function') {
        renderTracker(); 
    }
}

// History 화면으로 갈 때 차트와 로그 깨우기
function goToHistory() {
    UI.goToScreen('History', 'My Check-ins');
    UI.updateNavActive('navHistory');
    
    // 💡 [핵심] API에서 데이터를 가져와서 UI에 뿌리기
    EmotionAPI.fetchHistory().then(data => {
        if (typeof UI.renderHistory === 'function') UI.renderHistory(data);
        if (typeof renderEmotionChart === 'function') renderEmotionChart(data);
    });
}

function goToSettings() {
    UI.goToScreen('Settings', 'Settings');
    UI.updateNavActive('navSettings');
    document.getElementById('weatherHeader').style.display = 'none';
    document.getElementById('greeting').style.display = 'none';
}

// 9. 설정 및 날씨 관리 (로스 가토스 기본값)
function saveSettings() {
    const nameVal = document.getElementById('settingsName')?.value.trim();
    const cityVal = document.getElementById('settingsCity')?.value.trim();
    const ageVal = document.getElementById('settingsAge')?.value;

    localStorage.setItem('feelflow_settings', JSON.stringify({ name: nameVal, city: cityVal, age: ageVal }));
    
    const notice = document.getElementById('settingsSaved');
    if (notice) {
        notice.classList.add('show');
        setTimeout(() => notice.classList.remove('show'), 2000);
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
    if (confirm('모든 데이터를 삭제할까요?')) {
        localStorage.clear();
        location.reload();
    }
}

// 10. 전역 바인딩
window.initApp = initApp;
window.goHome = goHome;
window.goToResult = goToResult;
window.goToStrategies = goToStrategies;
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.finishCheckIn = finishCheckIn;
window.startOver = startOver;
window.goToHistory = goToHistory;
window.goToTracker = goToTracker;
window.goToSettings = goToSettings;
window.saveSettings = saveSettings;
window.clearAllData = clearAllData;