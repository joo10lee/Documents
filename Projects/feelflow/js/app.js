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
function selectEmotion(name, emoji, color) {
    // 💡 객체 내부에 값을 할당합니다.
    currentEmotion.name = name;
    currentEmotion.emoji = emoji;
    
    const emojiDisplay = document.getElementById('selectedEmoji');
    const nameDisplay = document.getElementById('selectedName');
    if (emojiDisplay) emojiDisplay.textContent = emoji;
    if (nameDisplay) nameDisplay.textContent = name;
    
    UI.goToScreen(1, "How strong is it?");
}

// 3. 강도 업데이트
function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
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

// js/app.js 내 goToHistory 함수 교체
async function goToHistory() {
    console.log("📊 히스토리 화면으로 이동 중...");
    
    // 💡 1단계: 화면 전환부터 즉시 실행 (사용자 경험 개선)
    UI.goToScreen('History', 'My Check-ins');
    UI.updateNavActive('navHistory');
    
    // 헤더 숨기기
    const weatherHeader = document.getElementById('weatherHeader');
    const greeting = document.getElementById('greeting');
    if (weatherHeader) weatherHeader.style.display = 'none';
    if (greeting) greeting.style.display = 'none';

    // 💡 2단계: 로딩 표시 (선택 사항)
    const listContainer = document.getElementById('historyList');
    if (listContainer) listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#a0aec0;">Loading your memories... ⌛</p>';

    try {
        // 💡 3단계: 데이터를 비동기로 가져오기
        const history = await EmotionAPI.fetchHistory();
        console.log("📥 데이터 수신 완료:", history);

        if (history && history.length > 0) {
            // 💡 4단계: 리스트와 차트를 순차적으로 렌더링
            UI.renderHistory(history);
            UI.renderEmotionChart(history);
        } else {
            UI.renderHistory([]); // 데이터 없을 때 처리
        }
    } catch (error) {
        console.error("❌ 데이터 로드 실패:", error);
        if (listContainer) listContainer.innerHTML = '<p>데이터를 불러오지 못했습니다.</p>';
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

// 5. 체크인 완료 및 데이터 저장
// js/app.js 내 finishCheckIn 함수 수정
// js/app.js 내 수정
// 4. 저장 및 완료 함수
async function finishCheckIn() {
    console.log("💾 데이터 저장 프로세스 시작...");

    const note = document.getElementById('actionNote')?.value || "";
    const photo = document.getElementById('capturedPhoto')?.src || null;

    // 💡 호출 시 currentEmotion 객체의 속성을 사용합니다.
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

// 5. 다시 시작 (상태 초기화)
function startOver() {
    // 객체 초기화
    currentEmotion = { name: '', emoji: '', intensity: 5 };
    
    UI.goToScreen(0, "How are you feeling today?");
    UI.updateNavActive('navHome');
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

// js/app.js 내 수정
async function goToHistory() {
    UI.goToScreen('History', 'My Check-ins');
    UI.updateNavActive('navHistory');
    document.getElementById('weatherHeader').style.display = 'none';
    document.getElementById('greeting').style.display = 'none';
    
    const history = await EmotionAPI.fetchHistory();
    UI.renderHistory(history);

    // ✅ 차트 렌더링 함수 호출 추가
    if (typeof renderEmotionChart === 'function') {
        renderEmotionChart(history);
    }
}

// js/app.js 맨 하단에 추가
window.goToResult = goToResult;
window.goToStrategies = goToStrategies;
window.selectEmotion = selectEmotion;
window.updateIntensity = updateIntensity;

