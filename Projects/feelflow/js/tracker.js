/**
 * Tracker Module: 아침/저녁 루틴 및 스티커 보상 시스템 관리
 */

// 1. 기본 루틴 데이터 정의
const defaultTasks = {
    morning: [
        { id: 'm1', title: 'Brush teeth', icon: '🪥', isDefault: true },
        { id: 'm2', title: 'Wash face', icon: '🧼', isDefault: true },
        { id: 'm3', title: 'Get dressed', icon: '👕', isDefault: true },
        { id: 'm4', title: 'Make bed', icon: '🛏️', isDefault: true },
        { id: 'm5', title: 'Eat breakfast', icon: '🥣', isDefault: true },
        { id: 'm6', title: 'Take medication (if needed)', icon: '💊', isDefault: true }
    ],
    evening: [
        { id: 'e1', title: 'Brush teeth', icon: '🪥', isDefault: true },
        { id: 'e2', title: 'Wash face', icon: '🧼', isDefault: true },
        { id: 'e3', title: 'Put on pajamas', icon: '👚', isDefault: true },
        { id: 'e4', title: 'Prepare clothes for tomorrow', icon: '👔', isDefault: true },
        { id: 'e5', title: 'Pack backpack', icon: '🎒', isDefault: true },
        { id: 'e6', title: 'Read or relax', icon: '📖', isDefault: true }
    ]
};

// 2. 데이터 가져오기 및 저장
function getTrackerData() {
    const data = localStorage.getItem('feelflow_tracker');
    if (!data) return { tasks: { ...defaultTasks }, completed: {}, stickers: [] };
    const parsed = JSON.parse(data);
    if (!parsed.tasks) parsed.tasks = { ...defaultTasks };
    if (!parsed.completed) parsed.completed = {};
    if (!parsed.stickers) parsed.stickers = [];
    return parsed;
}

function saveTrackerData(data) {
    localStorage.setItem('feelflow_tracker', JSON.stringify(data));
}

// 3. 루틴 전환 및 렌더링
function switchRoutine(routine) {
    currentRoutine = routine; // 전역 변수 (app.js 선언) 업데이트
    document.getElementById('tabMorning').classList.toggle('active', routine === 'morning');
    document.getElementById('tabEvening').classList.toggle('active', routine === 'evening');
    renderTracker();
}

function renderTracker() {
    const data = getTrackerData();
    const tasks = data.tasks[currentRoutine] || defaultTasks[currentRoutine];
    const key = `${new Date().toISOString().split('T')[0]}_${currentRoutine}`;
    const completed = data.completed[key] || [];

    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    // 진행률 계산
    const total = tasks.length;
    const done = completed.length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    // UI 업데이트
    document.getElementById('progressTitle').textContent = currentRoutine === 'morning' ? '🌅 Morning Routine' : '🌙 Evening Routine';
    document.getElementById('progressFraction').textContent = `${done}/${total}`;
    document.getElementById('progressBar').style.width = `${percent}%`;

    // 리스트 렌더링
    taskList.innerHTML = tasks.map(task => {
        const isComplete = completed.includes(task.id);
        return `
            <div class="task-item ${isComplete ? 'completed' : ''}" onclick="toggleTaskComplete('${task.id}')">
                <div class="task-checkbox">${isComplete ? '✓' : ''}</div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                </div>
                <div class="task-icon">${task.icon}</div>
            </div>
        `;
    }).join('');

    renderStickerCollection(data);
    renderWeeklyStats(data);
}

// 4. 할 일 완료 체크 로직
function toggleTaskComplete(taskId) {
    const data = getTrackerData();
    const dateKey = new Date().toISOString().split('T')[0];
    const key = `${dateKey}_${currentRoutine}`;
    
    if (!data.completed[key]) data.completed[key] = [];
    const index = data.completed[key].indexOf(taskId);

    if (index > -1) data.completed[key].splice(index, 1);
    else data.completed[key].push(taskId);

    saveTrackerData(data);
    renderTracker();
    checkForSticker(data, key);
    
    if (typeof feedback === 'function') feedback('tap');
}

// 5. 스티커 보상 로직
function checkForSticker(data, key) {
    const tasks = data.tasks[currentRoutine] || [];
    const completed = data.completed[key] || [];
    const allComplete = tasks.length > 0 && tasks.every(t => completed.includes(t.id));

    if (allComplete && !data.stickers.includes(key)) {
        data.stickers.push(key);
        saveTrackerData(data);
        showStickerReward();
        if (typeof feedback === 'function') feedback('success');
    }
}

function showStickerReward() {
    const reward = document.getElementById('stickerReward');
    if (reward) {
        reward.style.display = 'block';
        reward.style.animation = 'celebrate 0.5s ease';
    }
}

// 6. 통계 렌더링 (스티커 보관함 & 주간 통계)
function renderStickerCollection(data) {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;
    
    let html = '';
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    for (let i = 0; i < 14; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + Math.floor(i / 2));
        const routine = i % 2 === 0 ? 'morning' : 'evening';
        const stickerKey = `${d.toISOString().split('T')[0]}_${routine}`;
        const earned = data.stickers.includes(stickerKey);
        html += `<div class="sticker-slot ${earned ? 'earned' : 'empty'}">${earned ? '⭐' : (routine === 'morning' ? '🌅' : '🌙')}</div>`;
    }
    grid.innerHTML = html;
}

function renderWeeklyStats(data) {
    const container = document.getElementById('weeklyDays');
    if (!container) return;
    // (기존 renderWeeklyStats 로직 유지)
}