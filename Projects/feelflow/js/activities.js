/**
 * Activities 관리 모듈: 감정 및 스트레스 관리 엔진
 * [Full Integration] 306 Line Base + Squeeze, Push, Jason Break + 5-4-3-2-1 Animation
 */

let audioCtx = null;

const Activities = {
    initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
    },

    // 1. 전략 카드 렌더링
    renderStrategies(emotion) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;

        const strategyMap = {
            'Happy': [
                { title: 'Write it down', icon: '✍️' },
                { title: 'Capture the moment', icon: '📸' },
                { title: 'Share the joy', icon: '🎉' }
            ],
            'Sad': [
                { title: 'Talk to someone', icon: '💬' },
                { title: 'Listen to music', icon: '🎵' },
                { title: 'Big Hug', icon: '🧸' }
            ],
            'Anxious': [
                { title: 'Deep Breathing', icon: '🌬️' },
                { title: '5-4-3-2-1 Grounding', icon: '🖐️' },
                { title: 'Hold Something Cold', icon: '❄️' }
            ],
            'Angry': [
                { title: 'Squeeze & Release', icon: '✊' },
                { title: 'Take a Break', icon: '🚶' },
                { title: 'Push the Wall', icon: '🧱' }
            ],
            'Calm': [ { title: 'Listen to music', icon: '🎵' }, { title: 'Write it down', icon: '✍️' } ],
            'Tired': [ { title: 'Deep Breathing', icon: '🌬️' }, { title: 'Listen to music', icon: '🎵' } ]
        };

        const strategies = strategyMap[emotion] || [{ title: 'Deep Breathing', icon: '🌬️' }];
        container.innerHTML = strategies.map(s => `
            <div class="strategy-card" onclick="Activities.setupActivity('${s.title}')">
                <div class="strategy-icon">${s.icon}</div>
                <div class="strategy-title">${s.title}</div>
            </div>
        `).join('');
    },

    // 2. 활동 메인 엔진
    setupActivity(type) {
        console.log(`🏃 활동 엔진 가동: ${type}`);
        this.initAudio();
        if (window.feedback) window.feedback('tap');

        if (typeof UI !== 'undefined' && UI.goToScreen) {
            UI.goToScreen('Activity', type);
        }

        setTimeout(() => {
            const area = document.getElementById('inAppActionArea');
            const btn = document.getElementById('activityBtn');
            const title = document.getElementById('activityTitle');

            if (!area) return;
            area.style.display = 'block';
            area.innerHTML = ''; 
            if (title) title.textContent = type;
            
            if (btn) {
                btn.style.display = 'block';
                btn.textContent = "Finish Activity";
                btn.onclick = () => { if(typeof window.finishCheckIn === 'function') window.finishCheckIn(); };
            }

            // setupActivity 함수 내부
        switch(type) {
            case '5-4-3-2-1 Grounding': this.startGroundingAnimation(); break; // 💡 이름 변경
            case 'Squeeze & Release': this.startSqueezeAction(); break;      // 💡 이름 변경
            case 'Push the Wall': this.startPushWallAction(); break;        // 💡 이름 변경
            case 'Take a Break': this.startJasonBreakQuest(); break;        // 💡 Jason 전용 엔진
            case 'Deep Breathing': this.startBreathingAnimation(); break;
            case 'Big Hug': this.startBigHugTimer(); break;
            case 'Share the joy': this.startSMSAction(); break;
            case 'Listen to music': this.startMusicAction(); break;
            case 'Capture the moment': this.startCaptureAction(); break;
            case 'Hold Something Cold': this.startColdSqueezeAnimation(); break;
            default: this.startWriteAction(`Focus on ${type}`);
        }
        }, 100);
    },

    // 💡 3. [신규] 5-4-3-2-1 Grounding 손가락 애니메이션
    startGroundingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const mainBtn = document.getElementById('activityBtn');
        
        // 💡 시작 시 메인 버튼을 숨겨서 단계 집중 유도
        if (mainBtn) mainBtn.style.display = 'none';
    
        const groundingSteps = [
            { n: 5, s: 'SEE 👀', p: 'Name 5 things you can see.', c: '#3b82f6', i: '🖐️' },
            { n: 4, s: 'TOUCH ✋', p: 'Notice 4 things you can feel.', c: '#10b981', i: '🖖' },
            { n: 3, s: 'HEAR 👂', p: 'Name 3 sounds you hear.', c: '#f59e0b', i: '🤟' },
            { n: 2, s: 'SMELL 👃', p: 'Notice 2 things you can smell.', c: '#ef4444', i: '✌️' },
            { n: 1, s: 'TASTE 👅', p: 'Notice 1 thing you can taste.', c: '#7c3aed', i: '☝️' }
        ];
    
        let currentStep = 0;
    
        const renderStep = (idx) => {
            const step = groundingSteps[idx];
            
            // 입력창 동적 생성 (제이슨의 음악적 관심을 유도하는 placeholder)
            let inputsHTML = '';
            const placeholders = idx === 2 ? ['Guitar sound', 'Wind', 'Footsteps'] : ['Something blue', 'A chair', 'The screen'];
            
            for (let i = 1; i <= step.n; i++) {
                inputsHTML += `
                    <input type="text" class="grounding-input" 
                           placeholder="${i}. ${placeholders[i-1] || 'I ' + step.s.split(' ')[1].toLowerCase() + '...'}" 
                           style="width:100%; margin-bottom:10px; padding:12px; border:2px solid #e2e8f0; border-radius:12px; font-size:1rem; outline:none; transition:border-color 0.3s;">
                `;
            }
    
            area.innerHTML = `
                <div id="stepContainer" style="text-align:center; animation: fadeIn 0.4s;">
                    <div style="font-size:6rem; color:${step.c}; transition:transform 0.3s;" id="stepEmoji">${step.i}</div>
                    <h2 style="color:${step.c}; margin-bottom:10px;">${step.n} Things to ${step.s.split(' ')[1]}</h2>
                    <p style="color:#64748b; margin-bottom:20px;">${step.p}</p>
                    <div style="max-height:200px; overflow-y:auto; padding:5px;">${inputsHTML}</div>
                    <button id="nextStepBtn" class="btn btn-primary" style="width:100%; margin-top:20px; background:${step.c}; border:none;">
                        ${idx === 4 ? 'Finish' : 'Next Step'}
                    </button>
                    <div style="display:flex; justify-content:center; gap:8px; margin-top:20px;">
                        ${groundingSteps.map((_, i) => `<div style="width:10px; height:10px; border-radius:50%; background:${i <= idx ? step.c : '#e2e8f0'};"></div>`).join('')}
                    </div>
                </div>
            `;
    
            // 다음 단계 버튼 로직
            document.getElementById('nextStepBtn').onclick = () => {
                if (window.feedback) window.feedback('tap');
                if (idx < 4) {
                    renderStep(idx + 1);
                } else {
                    completeGrounding();
                }
            };
        };
    
        const completeGrounding = () => {
            area.innerHTML = `
                <div style="text-align:center; padding:40px; animation: scaleUp 0.5s;">
                    <div style="font-size:5rem;">✨</div>
                    <h2 style="color:#7c3aed; margin-top:20px;">Well Done!</h2>
                    <p>You've successfully grounded yourself.</p>
                </div>
            `;
            if (mainBtn) {
                mainBtn.style.display = 'block';
                mainBtn.textContent = "Save & Finish";
            }
            if (window.feedback) window.feedback('success');
        };
    
        renderStep(0);
    },

    // 4. [기존] Deep Breathing
    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div id="lungContainer" style="display:flex; justify-content:center; align-items:center; height:200px; margin-top:20px;"><div id="lungCircle" style="width:80px; height:80px; background:rgba(124, 58, 237, 0.2); border-radius:50%; border:5px solid #7c3aed; transition: 4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:3.5rem;">🫁</div></div><p id="breathStatus" style="text-align:center; font-weight:800; color:#7c3aed; font-size:1.6rem; margin-top:30px;">Ready...</p>`;
        let cycle = 0; const lung = document.getElementById('lungCircle'); const status = document.getElementById('breathStatus');
        const animate = () => {
            if (cycle >= 3 || !lung) return;
            status.textContent = "Inhale... 🌬️"; lung.style.transform = "scale(2.5)";
            setTimeout(() => { if (!lung) return; status.textContent = "Exhale... 💨"; lung.style.transform = "scale(1)"; cycle++; setTimeout(animate, 4500); }, 4000);
        };
        setTimeout(animate, 1000);
    },

    // 5. [기존] Big Hug
    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center; padding:30px;"><div id="hugEmoji" style="font-size:6rem; animation: hPulse 1.5s infinite alternate;">🫂</div><div id="hugTimer" style="font-size:4rem; font-weight:900; color:#7c3aed; margin-top:20px;">10</div></div><style>@keyframes hPulse { from { transform: scale(1); } to { transform: scale(1.15); } }</style>`;
        let timeLeft = 10; const timerEl = document.getElementById('hugTimer');
        const interval = setInterval(() => {
            if (!timerEl || timeLeft <= 0) { clearInterval(interval); if(timerEl) timerEl.textContent="❤️"; return; }
            timeLeft--; timerEl.textContent = timeLeft; if (window.feedback) window.feedback('tap');
        }, 1000);
    },

    // 6. [복구] Squeeze & Release
    startSqueezeAction() {
        const area = document.getElementById('inAppActionArea');
        let round = 1;
        let timeLeft = 5;
        let isSqueezing = true;
    
        const updateUI = () => {
            area.innerHTML = `
                <div style="text-align:center; animation: pulse 1s infinite alternate;">
                    <div id="squeezeEmoji" style="font-size: 8rem; transition: transform 0.3s;">${isSqueezing ? '✊' : '🖐️'}</div>
                    <h2 style="color: #7c3aed; margin-top: 20px;">${isSqueezing ? 'SQUEEZE!' : 'RELEASE...'}</h2>
                    <div style="font-size: 3rem; font-weight: 800; margin: 20px 0;">${timeLeft}</div>
                    <p style="color: #94a3b8;">Round ${round} of 3</p>
                </div>
            `;
            const emoji = document.getElementById('squeezeEmoji');
            if (isSqueezing) {
                emoji.style.transform = 'scale(0.8)';
                if (navigator.vibrate) navigator.vibrate(50);
            } else {
                emoji.style.transform = 'scale(1.2)';
            }
        };
    
        const timer = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                if (isSqueezing) {
                    isSqueezing = false;
                    timeLeft = 5;
                } else {
                    round++;
                    if (round > 3) {
                        clearInterval(timer);
                        area.innerHTML = `<div style="text-align:center; padding:40px;"><h3>Feeling relaxed?</h3><p>Muscle tension has been released.</p></div>`;
                        return;
                    }
                    isSqueezing = true;
                    timeLeft = 5;
                }
            }
            updateUI();
        }, 1000);
    
        updateUI();
        this.currentInterval = timer; // 클린업용
    },

    // 7. [복구] Push the Wall
    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="pContainer" style="text-align:center; padding:20px;">
                <div id="pCir" style="width:130px; height:130px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:3.5rem; font-weight:900; color:#ef4444;">15</div>
                <div style="width:100%; height:12px; background:#e2e8f0; margin-top:30px; border-radius:6px; overflow:hidden;"><div id="pBar" style="width:0%; height:100%; background:#ef4444; transition: width 1s linear;"></div></div>
                <p id="pInstr" style="margin-top:20px; font-weight:800;">PUSH THE WALL HARD!</p>
            </div>
            <style>
                @keyframes strain { 0% { transform: translate(1px, 1px); } 50% { transform: translate(-1px,-2px); } 100% { transform: translate(1px,1px); } }
                .straining { animation: strain 0.1s infinite; }
            </style>
        `;
        let t = 15; const circle = document.getElementById('pCir');
        const itv = setInterval(() => {
            if (!circle) { clearInterval(itv); return; }
            t--; circle.textContent = t;
            document.getElementById('pBar').style.width = `${((15-t)/15)*100}%`;
            if (t <= 10) circle.classList.add('straining');
            if (navigator.vibrate) navigator.vibrate(t <= 5 ? 80 : 40);
            if (t <= 0) { 
                clearInterval(itv); circle.classList.remove('straining'); 
                circle.textContent = "💪"; circle.style.color = "#22c55e"; circle.style.borderColor = "#22c55e";
            }
        }, 1000);
    },

    // 8. [신규] Jason's Break Quest
    startJasonBreakQuest() {
        const area = document.getElementById('inAppActionArea');
        const quests = [
            { t: "🎸 Guitar Hero", d: "1분 동안 가장 좋아하는 리프를 연주해보세요.", q: "guitar chords for beginners" },
            { t: "🎤 Choir Practice", d: "합창단에서 부르는 곡의 한 소절을 소리내어 불러보세요.", q: "vocal warm up exercises" },
            { t: "🎶 Music Discovery", d: "YouTube에서 본 적 없는 새로운 악기 연주 영상을 찾아보세요.", q: "amazing unusual musical instruments" },
            { t: "🧘 Physical Reset", d: "악기에서 잠시 떨어져 전신 스트레칭을 30초간 하세요.", q: "quick stretches for musicians" }
        ];
    
        const quest = quests[Math.floor(Math.random() * quests.length)];
    
        area.innerHTML = `
            <div style="padding: 20px; border: 2px solid #3b82f6; border-radius: 20px; background: #eff6ff; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🕺</div>
                <h3 style="color: #1d4ed8; margin-bottom: 15px;">Hey Jason!</h3>
                <div style="font-size: 1.1rem; font-weight: 700; background: white; padding: 15px; border-radius: 15px; margin-bottom: 20px;">
                    "${quest.d}"
                </div>
                <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(quest.q)}', '_blank')" 
                        style="width:100%; padding:12px; background:#3b82f6; color:white; border:none; border-radius:12px; font-weight:700;">
                    🔍 Get Ideas on Google
                </button>
            </div>
        `;
    },

        // activities.js 내부 - PHASE 3
    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        // 💡 삭제했던 HTML의 핵심 요소를 JS 안에서 정의합니다.
        area.innerHTML = `
            <div class="pattern-selector" style="display:flex; gap:10px; margin-bottom:20px;">
                <button class="btn-mini" onclick="Activities.setPattern('relax')">Relax</button>
                <button class="btn-mini" onclick="Activities.setPattern('box')">Box</button>
            </div>
            <div id="lungCircle" ...>🫁</div>
            <p id="breathStatus">Ready...</p>
        `;
        // ... 이후 애니메이션 로직 실행
    }
    // 9. 기타 원본 로직 유지
    startSMSAction() {
        const area = document.getElementById('inAppActionArea'); const btn = document.getElementById('activityBtn');
        area.innerHTML = `<textarea id="actionNote" class="form-control" style="height:150px; border-radius:20px; width:100%;">오늘 정말 기분 좋은 일이 있었어! ✨</textarea>`;
        if (btn) { btn.textContent = "Send via SMS 💌"; btn.onclick = () => { window.location.href = `sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`; setTimeout(() => window.finishCheckIn(), 1500); }; }
    },
    startMusicAction() { const url = "https://www.youtube.com/watch?v=1ZYbU82GVz4"; document.getElementById('inAppActionArea').innerHTML = `<button class="btn" style="background:#FF0000; color:white; width:100%;" onclick="window.open('${url}', '_blank')">📺 Open YouTube</button>`; },
    startColdSqueezeAnimation() { const area = document.getElementById('inAppActionArea'); area.innerHTML = `<div id="animBox" style="font-size:5rem; text-align:center; padding:40px;">❄️</div>`; let step = 1; const itv = setInterval(() => { const box = document.getElementById('animBox'); if (!box || step > 5) { clearInterval(itv); return; } box.textContent = "❄️".repeat(step); step++; }, 2000); },
    startWriteAction(q) { document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="height:200px; border-radius:20px; width:100%;" placeholder="${q}"></textarea>`; },
    startCaptureAction() { document.getElementById('inAppActionArea').innerHTML = `<div style="text-align:center; padding:40px;"><button class="btn btn-secondary" onclick="window.EmotionActions.startCamera()">📸 Open Camera</button></div>`; },

    // 10. 사운드 엔진
    playTapSound() { try { this.initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.frequency.setValueAtTime(800, audioCtx.currentTime); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.1); } catch (e) {} },
    playTimerEndSound() { try { this.initAudio(); [660, 880].forEach((f, i) => { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.15); gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.15); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + i * 0.15); osc.stop(audioCtx.currentTime + i * 0.15 + 0.3); }); } catch (e) {} },
    playTickSound() { try { this.initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gain.gain.setValueAtTime(0.02, audioCtx.currentTime); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.05); } catch (e) {} }
};

// --- 글로벌 브릿지 ---
window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => {
    if (t === 'tap') Activities.playTapSound();
    if (t === 'success') Activities.playTimerEndSound();
    if (navigator.vibrate) navigator.vibrate(10);
};
window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });