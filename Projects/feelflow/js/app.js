/**
 * Main App Module: 전역 상태 관리 및 앱 초기화 담당
 */

// 1. 전역 상태 관리 (객체 구조 유지)
let currentEmotion = { name: '', emoji: '', intensity: 5 };
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
    currentEmotion.name = name;
    currentEmotion.emoji = emoji;
    
    const emojiDisplay = document.getElementById('selectedEmoji');
    const nameDisplay = document.getElementById('selectedName');
    if (emojiDisplay) emojiDisplay.textContent = emoji;
    if (nameDisplay) nameDisplay.textContent = name;
    
    UI.goToScreen(1, "How strong is it?");
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
}

// 4. 화면 흐름 제어
function goToResult() {
    if (typeof feedback === 'function') feedback('tap');
    
    document.getElementById('resultEmoji').textContent = currentEmotion.emoji;
    document.getElementById('resultText').textContent = `${currentEmotion.name} at level ${currentEmotion.intensity}`;
    
    UI.goToScreen(2, "Check-in Complete!");
}

function goToStrategies() {
    if (typeof feedback === 'function') feedback('tap');
    
    const container = document.getElementById('strategiesEmoji');
    if (container) container.textContent = currentEmotion.emoji;
    
    if (typeof renderStrategies === 'function') {
        renderStrategies(currentEmotion.name);
    }
    
    UI.goToScreen(3, "Helpful Strategies");
}

/**
 * 💡 [추가] 활동 유형에 따른 하단 버튼 설정
 * activities.js에서 "Share the Joy"를 클릭할 때 이 함수를 호출해야 합니다.
 */
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

// 5. [Share the Joy] SMS 전송 기능
function shareJoy() {
    const msgArea = document.getElementById('actionNote');
    // Joo님의 가족(Solbee, Jason)에게 보낼 수 있는 기본 메시지 설정
    const message = msgArea && msgArea.value.trim() !== "" 
        ? msgArea.value 
        : "오늘 정말 기분 좋은 일이 있었어! 함께 나누고 싶어 ✨";
    
    // 아이폰/안드로이드 SMS 앱 호출
    window.location.href = `sms:?&body=${encodeURIComponent(message)}`;
    
    // 전송 시도 후 1.5초 뒤에 자동으로 저장 및 성공 화면으로 이동
    setTimeout(() => finishCheckIn(), 1500);
}

// 6. 저장 및 완료 로직
async function finishCheckIn() {
    console.log("💾 데이터 저장 및 화면 전환 시작...");

    const note = document.getElementById('actionNote')?.value || "";
    const photo = document.getElementById('capturedPhoto')?.src || null;

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
        UI.goToScreen(4, "Check-in Complete!"); 
    } catch (error) {
        console.error("❌ 저장 실패:", error);
    }
}

// 7. 내비게이션 및 초기화 로직 (통합 및 중복 제거)
function goHome() {
    UI.goToScreen(0, "How are you feeling today?");
    UI.updateNavActive('navHome');
    
    const weatherHeader = document.getElementById('weatherHeader');
    const greeting = document.getElementById('greeting');
    if (weatherHeader) weatherHeader.style.display = 'block';
    if (greeting) greeting.style.display = 'block';
    
    resetAppInput();
}

function startOver() {
    currentEmotion = { name: '', emoji: '', intensity: 5 };
    goHome();
}

function resetAppInput() {
    const emotionNote = document.getElementById('emotionNote');
    const actionNote = document.getElementById('actionNote');
    if (emotionNote) emotionNote.value = '';
    if (actionNote) actionNote.value = '';
    
    const intensitySlider = document.getElementById('intensitySlider');
    if (intensitySlider) {
        intensitySlider.value = 5;
        const display = document.getElementById('intensityDisplay');
        if (display) display.textContent = '5';
    }
    
    if (window.EmotionActions) window.EmotionActions.reset();
}

// 8. 서브 화면 이동 (히스토리 최적화 버전)
async function goToHistory() {
    console.log("📊 히스토리 화면 로드...");
    UI.goToScreen('History', 'My Check-ins');
    UI.updateNavActive('navHistory');
    
    document.getElementById('weatherHeader').style.display = 'none';
    document.getElementById('greeting').style.display = 'none';

    const listContainer = document.getElementById('historyList');
    if (listContainer) listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#a0aec0;">Loading... ⌛</p>';

    try {
        const history = await EmotionAPI.fetchHistory();
        UI.renderHistory(history);
        if (typeof renderEmotionChart === 'function') {
            renderEmotionChart(history);
        }
    } catch (error) {
        console.error("❌ 로드 실패:", error);
    }
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

// 9. 설정 및 날씨 관리
function saveSettings() {
    const nameVal = document.getElementById('settingsName')?.value.trim();
    const cityVal = document.getElementById('settingsCity')?.value.trim();
    const ageVal = document.getElementById('settingsAge')?.value;

    localStorage.setItem('feelflow_settings', JSON.stringify({ name: nameVal, city: cityVal, age: ageVal }));

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
    // Joo님의 홈타운인 로스 가토스를 기본값으로 유지합니다.
    const city = document.getElementById('settingsCity')?.value || 'Los Gatos';
    UI.fetchWeatherByCity(city);
}

function clearAllData() {
    if (confirm('Delete ALL data including check-ins, tracker, and settings?')) {
        localStorage.clear();
        location.reload();
    }
}

// 10. 전역 윈도우 객체 바인딩
window.initApp = initApp;
window.goHome = goHome;
window.goToResult = goToResult;
window.goToStrategies = goToStrategies;
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;
window.setupActivityButton = setupActivityButton;
window.finishCheckIn = finishCheckIn;
window.shareJoy = shareJoy;
window.startOver = startOver;
window.goToHistory = goToHistory;
window.goToTracker = goToTracker;
window.goToSettings = goToSettings;
window.saveSettings = saveSettings;
window.clearAllData = clearAllData;