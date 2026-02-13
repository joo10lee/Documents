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
        const groundingSteps = [
            { icon: '🖐️', text: '5 things you can <b>SEE</b>', color: '#3b82f6' },
            { icon: '🖖', text: '4 things you can <b>HEAR</b>', color: '#10b981' },
            { icon: '🤟', text: '3 things you can <b>SMELL</b>', color: '#f59e0b' },
            { icon: '✌️', text: '2 things you can <b>TOUCH</b>', color: '#ef4444' },
            { icon: '☝️', text: '1 thing you can <b>TASTE</b>', color: '#7c3aed' }
        ];

        area.innerHTML = `
            <div id="groundingContent" style="text-align:center; padding:30px; transition: all 0.5s ease;">
                <div id="fingerEmoji" style="font-size:7rem; margin-bottom:20px; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">🖐️</div>
                <p id="groundingText" style="font-size:1.5rem; line-height:1.4; min-height:3em;"></p>
                <div id="groundingProgress" style="display:flex; justify-content:center; gap:8px; margin-top:20px;"></div>
            </div>
        `;

        const emojiEl = document.getElementById('fingerEmoji');
        const textEl = document.getElementById('groundingText');
        const progEl = document.getElementById('groundingProgress');
        
        let currentStep = 0;

        const updateStep = () => {
            if (currentStep >= groundingSteps.length) {
                emojiEl.textContent = '✨';
                textEl.innerHTML = 'Feeling more grounded now?';
                progEl.innerHTML = '✅'.repeat(5);
                return;
            }

            const step = groundingSteps[currentStep];
            
            // 애니메이션 효과
            emojiEl.style.transform = 'scale(0.5)';
            setTimeout(() => {
                emojiEl.textContent = step.icon;
                emojiEl.style.transform = 'scale(1.2)';
                emojiEl.style.color = step.color;
                textEl.innerHTML = step.text;
                
                // 진행 표시 업데이트
                progEl.innerHTML = groundingSteps.map((_, i) => 
                    `<div style="width:12px; height:12px; border-radius:50%; background:${i <= currentStep ? step.color : '#e2e8f0'}; transition: 0.3s;"></div>`
                ).join('');

                if (window.feedback) window.feedback('tap');
                
                currentStep++;
                setTimeout(updateStep, 5000); // 5초마다 다음 단계로 전환
            }, 300);
        };

        updateStep();
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
        area.innerHTML = `<div style="text-align:center; padding:20px;"><div id="handEmoji" style="font-size:8rem; transition: 0.4s;">✊</div><p id="sqStatus" style="font-size:1.6rem; font-weight:800; color:#7c3aed; margin-top:30px;">Squeeze Tight!</p></div>`;
        let isSq = true; let count = 0;
        const toggle = () => {
            const hand = document.getElementById('handEmoji'); const status = document.getElementById('sqStatus');
            if (!hand || count >= 10) return;
            if (isSq) { hand.textContent = "🖐️"; hand.style.transform = "scale(1.4)"; status.textContent = "Release..."; }
            else { hand.textContent = "✊"; hand.style.transform = "scale(0.8)"; status.textContent = "Squeeze!"; if (navigator.vibrate) navigator.vibrate(30); }
            isSq = !isSq; count++; setTimeout(toggle, 2000);
        };
        setTimeout(toggle, 1000);
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
        const quests = ["🎸 1분간 기타/드럼 자유 연주하기", "🎤 좋아하는 합창곡 소리 내어 부르기", "🎶 새 음악 찾아 3분간 감상하기", "🧘 30초간 기지개 크게 켜기"];
        const q = quests[Math.floor(Math.random() * quests.length)];
        area.innerHTML = `
            <div style="padding:25px; background:#eff6ff; border:3px solid #3b82f6; border-radius:25px; text-align:center;">
                <h3 style="color:#1d4ed8; margin-bottom:10px;">Hey Jason! 🕺</h3>
                <p style="font-size:1.4rem; font-weight:800;">"${q}"</p>
                <button id="sB" class="btn" style="background:#3b82f6; color:white; width:100%; margin-top:15px; border-radius:15px;">🔍 아이디어 더 보기</button>
            </div>
        `;
        document.getElementById('sB').onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent("fun break for musical teens")}`, '_blank');
    },

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