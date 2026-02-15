/**
 * FeelFlow Core Module: Ver.0213-7600
 * [Recovery] SyntaxError 복구 및 데이터 무결성 확보
 */

// 1. 전역 상태 관리
let currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
let activeTaskId = null; 
// 💡 [추가] 홈 화면에서 현재 보고 있는 루틴 탭 상태 (오전/오후)
let homeDisplayTab = new Date().getHours() < 12 ? 'morning' : 'evening';

// 1. 루틴 데이터 구조 (LocalStorage 연동)
let DailyRoutines = JSON.parse(localStorage.getItem('feelflow_routines')) || {
    morning: [
        { id: 'm1', text: '🪥 Wash Face & Brush Teeth', completed: false },
        { id: 'm2', text: '🌤️ Check Weather & Dress Up', completed: false },
        { id: 'm3', text: '🥣 Eat Breakfast', completed: false },
        { id: 'm4', text: '🧴 Personal Grooming (Deodorant)', completed: false },
        { id: 'm5', text: '🪞 Mirror Check (Look Good!)', completed: false },
        { id: 'm6', text: '🎒 Check Backpack Items', completed: false },
        { id: 'm7', text: '🔑 Shoes & Keys Ready', completed: false }
    ],
    evening: [
        { id: 'e1', text: '💻 Charge Devices for Tomorrow', completed: false },
        { id: 'e2', text: '📚 Pack Bag for Tomorrow', completed: false },
        { id: 'e3', text: '🚿 Evening Shower', completed: false },
        { id: 'e4', text: '🪥 Brush Teeth', completed: false },
        { id: 'e5', text: '💤 Screens Off & Relax', completed: false }
    ]
};

let currentRoutineTab = new Date().getHours() < 12 ? 'morning' : 'evening';

// 1. 사용자의 첫 터치 여부를 저장하는 전역 변수
window.userInteracted = false;

// 2. 사용자가 화면을 터치하거나 클릭하면 즉시 true로 변경 (딱 한 번만 실행)
['touchstart', 'click', 'mousedown'].forEach(eventType => {
    window.addEventListener(eventType, () => {
        if (!window.userInteracted) {
            window.userInteracted = true;
            console.log("📱 User interaction detected. Vibration unlocked!");
        }
    }, { once: true }); // 메모리 절약을 위해 한 번만 실행
});

// 2. 보상 시스템 엔진 (FeelFlow)
const FeelFlow = {
    totalXP: 0,
    currentLevel: 1,
    medals: [],

    addXP(amount, tier = null) {
        this.totalXP += amount;
        if (tier) {
            this.medals.push(tier.charAt(0).toUpperCase() + tier.slice(1) + " Medal");
        }
        this.checkMedalLevel();
        this.saveToLocal();
    },

    checkMedalLevel() {
        const nextLevelXP = this.currentLevel * 100; 
        if (this.totalXP >= nextLevelXP) {
            this.currentLevel++;
            this.medals.push(`Level ${this.currentLevel} Medal`);
            if (typeof UI !== 'undefined' && UI.showLevelUp) UI.showLevelUp(this.currentLevel);
        }
    },

    saveToLocal() {
        const data = { totalXP: this.totalXP, currentLevel: this.currentLevel, medals: this.medals };
        localStorage.setItem('feelflow_progress', JSON.stringify(data));
    }
};

// 3. 흐름 제어 및 내비게이션
function goHome() {
    console.trace("🏠 goHome 호출됨 (누가 호출했는지 확인용)"); // 💡 호출 경로 추적
    UI.goToScreen('1', "How are you feeling today?");
    resetAppInput();
    if (typeof renderHomeQuests === 'function') renderHomeQuests();
}

function startOver() {
    currentEmotion = { name: '', emoji: '', intensity: 5, color: '' };
    activeTaskId = null;
    goHome();
}

function selectEmotion(name, emoji, color) {
    if (window.Activities) window.Activities.initAudio();
    currentEmotion = { name, emoji, color, intensity: 5 };
    UI.goToScreen('2', "How strong is it?");
}

function startQuest(taskId, title) {
    activeTaskId = taskId;
    if (window.Activities) window.Activities.setupActivity(title);
}

function updateIntensity(val) {
    currentEmotion.intensity = parseInt(val);
    const display = document.getElementById('intensityDisplay');
    if (display) display.textContent = val;
}

// 4. 💡 [최종] 데이터 저장 및 보상 지급 파이프라인
window.finishCheckIn = async function() {
    console.log("🏁 시퀀스 시작: 데이터 저장 및 보상 판정");

    // 1. 입력 데이터 수집
    const note = document.getElementById('actionNote')?.value || "";
    const photo = window.lastCapturedPhoto || null; 
    const entry = { 
        emotion: currentEmotion.name, 
        intensity: currentEmotion.intensity, 
        note, 
        photo, 
        timestamp: new Date().toISOString() 
    };

    try {
        // 2. API 저장 시도
        if (typeof EmotionAPI !== 'undefined') await EmotionAPI.saveCheckIn(entry);
        
        // 3. 보상 시스템 연동 (The Heart of FeelFlow)
        if (activeTaskId) {
            // 태스크 기반 완료 처리
            const task = DailyTasks.find(t => t.id === activeTaskId);
            if (task) { 
                task.completed = true; 
                FeelFlow.addXP(task.xp, task.tier); 
                console.log(`🥇 태스크 완료 보상: ${task.tier} (${task.xp} XP)`);
            }
        } else {
            // 일반 감정 체크인 보상 (강도 4 이상이면 골드)
            const tier = currentEmotion.intensity >= 4 ? 'gold' : 'silver';
            const xp = tier === 'gold' ? 60 : 30;
            FeelFlow.addXP(xp, tier); 
            console.log(`✨ 일반 체크인 보상: ${tier} (${xp} XP)`);
        }

        // 4. 상태 리셋 및 화면 전환
        activeTaskId = null;
        if (window.Activities) window.Activities.stopAll();
        UI.goToScreen('5', "Check-in Complete!"); 

    } catch (error) {
        console.error("❌ 저장 오류 발생 (Silent Recovery):", error);
        UI.goToScreen('5'); // 아이를 위해 에러 발생 시에도 성공 화면 노출
    }
};

// 5. 초기화 및 전역 바인딩
// app.js의 initApp 부분에 추가
window.initApp = async function() {
    console.log("🚀 FeelFlow 인프라 초기화 중...");
    
    // 로컬 데이터 복구 로직 (생략 가능)
    // ...

    const city = 'Los Gatos'; 
    if (typeof UI !== 'undefined' && UI.fetchWeatherByCity) UI.fetchWeatherByCity(city);
    
    // 💡 초기 로드 시에만 홈으로 이동
    goHome();
};

window.selectEmotion = selectEmotion;
window.startQuest = startQuest;
window.goToResult = goToResult;
window.updateIntensity = updateIntensity;
window.goHome = goHome;
window.startOver = startOver;
window.toggleMenu = () => document.getElementById('menuOverlay').classList.toggle('active');
/*
 */
window.menuNavigate = (target, event) => {
    if (event) { event.preventDefault(); event.stopPropagation(); }

    const normalizedTarget = target.trim();
    const overlay = document.getElementById('menuOverlay');
    if (overlay) overlay.classList.remove('active');

    // 💡 수정: HTML에 정의된 id인 'screenTracker'를 직접 매핑합니다.
    const screenMap = {
        'Home': 'screen1',
        'Routine': 'screenTracker',
        'Daily Routine': 'screenTracker',
        'Trophies': 'screenHistory',
        'Settings': 'screenSettings'
    };

    const targetId = screenMap[normalizedTarget];

    if (targetId) {
        // 1. 화면 전환 (ID를 직접 전달)
        UI.goToScreen(targetId, normalizedTarget);
        
        // 2. 💡 [복구 핵심] 루틴 화면일 경우 'taskList'에 렌더링
        if (targetId === 'screenTracker') {
            setTimeout(() => {
                if (typeof renderRoutineScreen === 'function') renderRoutineScreen();
            }, 100);
        }

        if (targetId === 'screenHistory' && typeof renderTrophyStats === 'function') {
            setTimeout(renderTrophyStats, 100);
        }
    } else {
        goHome();
    }
};

// 2. 루틴 화면 렌더링
function renderRoutineScreen() {
    const container = document.getElementById('taskList');
    const tabMorning = document.getElementById('tabMorning');
    const tabEvening = document.getElementById('tabEvening');
    
    if (!container) return;

    // 탭 활성화 UI 처리
    tabMorning.classList.toggle('active', currentRoutineTab === 'morning');
    tabEvening.classList.toggle('active', currentRoutineTab === 'evening');

    const tasks = DailyRoutines[currentRoutineTab];
    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercent = (completedCount / tasks.length) * 100;

    // 상단 프로그레스 바 업데이트
    document.getElementById('progressFraction').textContent = `${completedCount}/${tasks.length}`;
    document.getElementById('progressBar').style.width = `${progressPercent}%`;

    // 리스트 생성
    container.innerHTML = tasks.map(t => `
        <div class="routine-checkbox-item ${t.completed ? 'completed' : ''}" onclick="toggleRoutine('${t.id}')">
            <div class="custom-checkbox"></div>
            <span class="routine-text" style="font-weight:850; font-size:1.1rem;">${t.text}</span>
        </div>
    `).join('') + `
        <div class="add-custom-routine" style="margin-top:15px;">
            <input type="text" id="customRoutineInput" placeholder="+ Add a task..." 
                   style="width:100%; padding:15px; border-radius:15px; border:2px dashed #cbd5e1; outline:none;"
                   onkeypress="if(event.key === 'Enter') addCustomRoutine(this.value)">
        </div>
    `;
}

// 3. 루틴 토글 및 보상 로직
function toggleRoutine(id) {
    const tasks = DailyRoutines[currentRoutineTab];
    const task = tasks.find(t => t.id === id);
    
    if (task) {
        task.completed = !task.completed;
        if (task.completed) safeVibrate(15);
        
        saveRoutines();
        renderRoutineScreen();

        // 모든 루틴 완료 시 보상 판정
        if (tasks.every(t => t.completed)) {
            triggerRoutineReward();
        }
    }
}

function triggerRoutineReward() {
    // FeelFlow 엔진에 브론즈 메달(30 XP) 추가
    FeelFlow.addXP(30, 'bronze');
    
    // 💡 팝업 메시지 (Joo님의 Q3 요청사항)
    alert(`🎉 Awesome! You finished your ${currentRoutineTab} routine! \nBronze Medal Earned! (+30 XP)`);
}

function addCustomRoutine(text) {
    if (!text.trim()) return;
    const newId = 'c' + Date.now();
    DailyRoutines[currentRoutineTab].push({ id: newId, text, completed: false });
    saveRoutines();
    renderRoutineScreen();
    document.getElementById('customRoutineInput').value = '';
}

function saveRoutines() {
    localStorage.setItem('feelflow_routines', JSON.stringify(DailyRoutines));
    // 서버 사이드 저장이 필요할 경우 여기에 EmotionAPI.saveRoutines(DailyRoutines) 추가 가능
}

function switchRoutine(type) {
    currentRoutineTab = type;
    renderRoutineScreen();
}
// 6. 데이터 및 렌더링
const DailyTasks = [
    { id: 1, title: 'Morning Stretch', xp: 30, tier: 'silver', completed: false },
    { id: 2, title: 'Practice Guitar', xp: 60, tier: 'gold', completed: false },
    { id: 3, title: 'Clean My Room', xp: 30, tier: 'silver', completed: false }
];

function goToResult() {
    console.log("🎯 결과 화면으로 이동 시도");

    // 1. 결과 요약 바(Summary Bar) 업데이트
    const summaryEmoji = document.getElementById('summaryEmoji');
    const summaryText = document.getElementById('summaryText');
    const summaryBar = document.getElementById('resultSummaryBar');

    if (summaryEmoji) summaryEmoji.textContent = currentEmotion.emoji;
    if (summaryText) summaryText.textContent = `${currentEmotion.name} at Level ${currentEmotion.intensity}`;
    
    if (summaryBar && currentEmotion.color) {
        summaryBar.style.backgroundColor = `${currentEmotion.color}20`; 
        summaryBar.style.borderColor = currentEmotion.color;
    }

    // 2. [수정됨] 감정 이름과 함께 '강도'도 함께 전달합니다.
    // 이래야 Happy가 1일 때와 8일 때 다른 카드가 나옵니다!
    if (typeof window.renderStrategies === 'function') {
        window.renderStrategies(currentEmotion.name, currentEmotion.intensity);
    }

    // 3. 4번 화면(Strategies/Result)으로 이동
    UI.goToScreen('4', "Personalized Strategies");
}


function renderTrophyStats() {
    const goldCount = FeelFlow.medals.filter(m => m.includes('Gold')).length;
    const targetGold = 30;
    const content = document.getElementById('trophyContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="medal-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            <div class="medal-slot">🥇<br><strong>${goldCount}</strong></div>
            <div class="medal-slot">🥈<br><strong>${FeelFlow.medals.filter(m => m.includes('Silver')).length}</strong></div>
            <div class="medal-slot">🥉<br><strong>${FeelFlow.currentLevel}</strong></div>
        </div>
        <div style="margin-top:20px; background: white; padding: 15px; border-radius: 20px;">
            <div style="display:flex; justify-content:space-between; font-weight:850;">
                <span>🎁 LEGO Set Goal</span>
                <span>${goldCount}/${targetGold}</span>
            </div>
            <div style="height:12px; background:#e2e8f0; border-radius:6px; margin-top:8px; overflow:hidden;">
                <div style="width:${Math.min((goldCount/targetGold)*100, 100)}%; height:100%; background:#FFD700; transition: 0.5s ease;"></div>
            </div>
        </div>
    `;
}

function resetAppInput() {
    if (document.getElementById('actionNote')) document.getElementById('actionNote').value = '';
    window.lastCapturedPhoto = null; 
    const slider = document.getElementById('intensitySlider');
    if (slider) { slider.value = 5; document.getElementById('intensityDisplay').textContent = '5'; }
}

// activities.js 또는 app.js의 진동 호출 부분

function safeVibrate(pattern) {
    if (!navigator.vibrate) return;

    // 💡 브라우저 표준 API와 우리의 수동 플래그를 모두 체크 (Double Shield)
    const isBrowserActive = (navigator.userActivation && navigator.userActivation.isActive);
    const isReady = isBrowserActive || window.userInteracted;

    if (isReady) {
        try {
            navigator.vibrate(pattern); 
        } catch (e) {
            // 조용히 넘김
        }
    } else {
        // 제이슨이 아직 화면을 만지기 전이라면 '절대로' 호출하지 않음
        // 이 '절대 호출 금지'가 콘솔의 Intervention 메시지를 없애는 핵심입니다.
    }
}

/**
 * 🏠 홈 화면 전용: 스마트 퀘스트 엔진
 */

/**
 * 🏠 홈 화면 전용: 스마트 퀘스트 엔진 (Toggle + Instant Feedback)
 */

// 1. 홈 화면 퀘스트 렌더링 (토글 버튼 포함)
function renderHomeQuests() {
    const container = document.getElementById('quickTaskList');
    const titleArea = document.querySelector('.section-title'); 
    if (!container || !titleArea) return;

    // 제목 영역 옆에 오전/오후 토글 버튼 주입
    titleArea.style.display = "flex";
    titleArea.style.justifyContent = "space-between";
    titleArea.style.alignItems = "center";
    titleArea.style.width = "100%";
    
    titleArea.innerHTML = `
        Daily Quest ⚔️
        <div class="home-routine-toggle" onclick="toggleHomeRoutine()" 
             style="display:flex; align-items:center; background:rgba(124,58,237,0.1); padding:5px 12px; border-radius:12px; cursor:pointer;">
            <span style="font-size:0.8rem; margin-right:5px;">${homeDisplayTab === 'morning' ? '🌅' : '🌙'}</span>
            <span style="font-size:0.75rem; font-weight:900; color:#7c3aed;">${homeDisplayTab.toUpperCase()}</span>
        </div>
    `;

    // 현재 선택된 탭에서 아직 완료되지 않은 항목 3개 추출
    const activeTasks = DailyRoutines[homeDisplayTab].filter(t => !t.completed);
    const displayTasks = activeTasks.slice(0, 3);

    if (displayTasks.length === 0) {
        const isAllDone = DailyRoutines[homeDisplayTab].every(t => t.completed);
        container.innerHTML = isAllDone ? 
            `<div style="padding:20px; color:#10b981; font-weight:850;">All ${homeDisplayTab} tasks done! 🎉</div>` :
            `<div style="padding:20px; color:#64748b;">No more tasks to show.</div>`;
        return;
    }

    container.innerHTML = displayTasks.map(t => `
        <div id="home-task-${t.id}" class="home-quest-item" 
             onclick="handleHomeCheck('${t.id}')"
             style="display:flex; align-items:center; padding:18px; background:white; border-radius:22px; margin-bottom:10px; box-shadow:0 4px 10px rgba(0,0,0,0.03); cursor:pointer;">
            <div class="custom-checkbox" style="width:22px; height:22px; border:2px solid #cbd5e1; border-radius:6px; margin-right:12px; display:flex; align-items:center; justify-content:center;"></div>
            <div style="text-align:left;">
                <div class="routine-text" style="font-weight:850; font-size:1rem; color:#1e293b;">${t.text}</div>
            </div>
        </div>
    `).join('');
}

// 2. 홈 화면 체크 핸들러 (즉시 취소선 -> 3초 후 삭제)
function handleHomeCheck(id) {
    const taskElement = document.getElementById(`home-task-${id}`);
    const tasks = DailyRoutines[homeDisplayTab];
    const task = tasks.find(t => t.id === id);

    if (task && !task.completed) {
        // [1단계] 데이터 업데이트 및 진동
        task.completed = true;
        safeVibrate(15);
        
        // [2단계] 즉시 취소선 스타일 적용 (Joo님 요청사항)
        if (taskElement) {
            taskElement.classList.add('checked-strikethrough');
            console.log(`✅ Task ${id} checked. Waiting 3 seconds...`);
        }

        // [3단계] 3초 대기 후 사라짐 애니메이션 실행
        setTimeout(() => {
            if (taskElement) {
                taskElement.classList.add('fade-out');
                
                // 애니메이션(0.5초) 종료 후 리스트 갱신
                setTimeout(() => {
                    saveRoutines();
                    renderHomeQuests(); // 사라진 자리에 다음 퀘스트가 채워짐
                    
                    if (tasks.every(t => t.completed)) {
                        triggerRoutineReward();
                    }
                }, 500);
            }
        }, 3000); // 3초간 취소선 유지
    }
}
/**
 * 🔄 홈 화면 오전/오후 토글 기능
 */
function toggleHomeRoutine() {
    // morning <-> evening 전환
    homeDisplayTab = (homeDisplayTab === 'morning') ? 'evening' : 'morning';
    
    // 가벼운 진동 피드백
    safeVibrate(10); 
    
    // 화면 갱신 (토글된 탭의 퀘스트를 보여줌)
    renderHomeQuests();
    
    console.log(`🌓 Switched to ${homeDisplayTab} routine on Home.`);
}

// 💡 잊지 말고 전역 바인딩에도 추가하세요!
window.toggleHomeRoutine = toggleHomeRoutine;
// 전역 바인딩
window.switchRoutine = switchRoutine;
window.toggleRoutine = toggleRoutine;
window.addCustomRoutine = addCustomRoutine;