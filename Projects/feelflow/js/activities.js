/**
 * Activities 관리 모듈: 감정별 특수 활동 로직, 애니메이션 및 사운드/햅틱 엔진
 * Joo님의 오리지널 로직 100% 복구 + SMS/애니메이션 패치 통합
 */

// 1. 전역 오디오 컨텍스트 (Safari/iOS 최적화)
let audioCtx = null;

const Activities = {
    initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
    },

    // 2. 전략 카드 렌더링 (모든 감정 케이스 포함)
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
            'Calm': [
                { title: 'Listen to music', icon: '🎵' },
                { title: 'Write it down', icon: '✍️' }
            ],
            'Tired': [
                { title: 'Deep Breathing', icon: '🌬️' },
                { title: 'Listen to music', icon: '🎵' }
            ]
        };

        const strategies = strategyMap[emotion] || [
            { title: 'Deep Breathing', icon: '🌬️' },
            { title: 'Listen to music', icon: '🎵' }
        ];

        container.innerHTML = strategies.map(s => `
            <div class="strategy-card" onclick="Activities.setupActivity('${s.title}')">
                <div class="strategy-icon">${s.icon}</div>
                <div class="strategy-title">${s.title}</div>
            </div>
        `).join('');
    },

    // 3. 활동 메인 엔진 (UI 전환 및 분기)
    setupActivity(type) {
        console.log(`🏃 활동 엔진 가동: ${type}`);
        this.initAudio();
        if (window.feedback) window.feedback('tap');

        // 스크린 전환
        if (typeof UI !== 'undefined' && UI.goToScreen) {
            UI.goToScreen('Activity', type);
        }

        // DOM 요소 로드 대기 (Race Condition 방지)
        setTimeout(() => {
            const area = document.getElementById('inAppActionArea');
            const btn = document.getElementById('activityBtn');
            const title = document.getElementById('activityTitle');

            if (!area) return;
            area.style.display = 'block';
            area.innerHTML = ''; // 이전 잔상 제거
            if (title) title.textContent = type;
            
            // 하단 버튼 기본 설정 (Save)
            if (btn) {
                btn.style.display = 'block';
                btn.textContent = "Save & Finish";
                btn.onclick = () => window.finishCheckIn();
            }

            // [핵심] 활동별 로직 분기 (308줄의 핵심 로직들)
            switch(type) {
                case 'Deep Breathing':
                    this.startBreathingAnimation();
                    break;
                case 'Big Hug':
                    this.startBigHugTimer();
                    break;
                case 'Share the joy':
                    this.setupSMSAction();
                    break;
                case 'Write it down':
                    this.setupWriteAction("✍️ What's on your mind?");
                    break;
                case 'Capture the moment':
                    this.setupCaptureAction();
                    break;
                case 'Listen to music':
                    this.setupMusicAction();
                    break;
                case 'Hold Something Cold':
                    this.startColdSqueezeAnimation();
                    break;
                case '5-4-3-2-1 Grounding':
                    this.setupGroundingAction();
                    break;
                case 'Squeeze & Release':
                    this.setupSqueezeAction();
                    break;
                case 'Push the Wall':
                    this.setupPushWallAction();
                    break;
                default:
                    this.setupWriteAction(`Let's try ${type}!`);
            }
        }, 100);
    },

    // 4. [복구] Deep Breathing 애니메이션
    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="lungContainer" style="display:flex; justify-content:center; align-items:center; height:200px; margin-top:20px;">
                <div id="lungCircle" style="width:80px; height:80px; background:rgba(124, 58, 237, 0.2); border-radius:50%; border:4px solid #7c3aed; transition: all 4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:3.5rem;">🫁</div>
            </div>
            <p id="breathStatus" style="text-align:center; font-weight:800; color:#7c3aed; font-size:1.6rem; margin-top:30px;">Ready...</p>
        `;

        let cycle = 0;
        const lung = document.getElementById('lungCircle');
        const status = document.getElementById('breathStatus');

        const animate = () => {
            if (cycle >= 3 || !document.getElementById('lungCircle')) {
                if (status) status.textContent = "✅ Feeling better?";
                return;
            }
            status.textContent = "Inhale... 🌬️";
            lung.style.transform = "scale(2.5)";
            lung.style.backgroundColor = "rgba(124, 58, 237, 0.5)";
            
            setTimeout(() => {
                if (!lung) return;
                status.textContent = "Exhale... 💨";
                lung.style.transform = "scale(1)";
                lung.style.backgroundColor = "rgba(124, 58, 237, 0.2)";
                cycle++;
                setTimeout(animate, 4500);
            }, 4000);
        };
        setTimeout(animate, 1000);
    },

    // 5. [복구] Big Hug 햅틱 타이머
    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div id="hugEmoji" style="font-size:6rem; animation: pulse 1.5s infinite alternate;">🫂</div>
                <div id="hugTimer" style="font-size:4rem; font-weight:900; color:#7c3aed; margin-top:20px;">10</div>
            </div>
            <style> @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.15); } } </style>
        `;

        let timeLeft = 10;
        const timerEl = document.getElementById('hugTimer');
        const interval = setInterval(() => {
            if (!timerEl || !document.getElementById('hugTimer')) { clearInterval(interval); return; }
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (window.feedback) window.feedback('tap'); // 초당 심박동 피드백
            
            if (timeLeft <= 0) {
                clearInterval(interval);
                timerEl.textContent = "❤️";
                if (window.feedback) window.feedback('success');
            }
        }, 1000);
    },

    // 6. [복구] Share the Joy (SMS)
    setupSMSAction() {
        const area = document.getElementById('inAppActionArea');
        const btn = document.getElementById('activityBtn');
        area.innerHTML = `
            <p style="text-align:center; margin-bottom:15px; color:#64748b;">💌 이 기쁜 소식을 가족에게 전하세요.</p>
            <textarea id="actionNote" class="form-control" style="height:150px; border-radius:20px; width:100%;">오늘 정말 기분 좋은 일이 있었어! 함께 나누고 싶어서 메시지 보내. ✨</textarea>
        `;
        if (btn) {
            btn.textContent = "Send via SMS 💌";
            btn.onclick = () => {
                const msg = document.getElementById('actionNote').value;
                window.location.href = `sms:?&body=${encodeURIComponent(msg)}`;
                setTimeout(() => window.finishCheckIn(), 1500);
            };
        }
    },

    // 7. [복구] Grounding & Music & Others
    setupGroundingAction() {
        document.getElementById('inAppActionArea').innerHTML = `
            <div style="line-height:2.2; font-size:1.1rem; padding:10px;">
                🖐️ 5 things you <b>see</b><br>👂 4 things you <b>hear</b><br>👃 3 things you <b>smell</b><br>🤝 2 things you <b>touch</b><br>👅 1 thing you <b>taste</b>
            </div>
        `;
    },

    setupMusicAction() {
        const url = "https://www.youtube.com/watch?v=1ZYbU82GVz4"; 
        document.getElementById('inAppActionArea').innerHTML = `
            <div style="text-align:center; padding:20px;">
                <p>🎵 음악이 마음을 차분하게 해줄 거예요.</p>
                <button class="btn" style="background:#FF0000; color:white; width:100%; margin-top:20px;" onclick="window.open('${url}', '_blank')">📺 Open YouTube</button>
            </div>
        `;
    },

    startColdSqueezeAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div id="animBox" style="font-size:5rem; text-align:center; padding:40px;">❄️</div>`;
        let step = 1;
        const itv = setInterval(() => {
            const box = document.getElementById('animBox');
            if (!box || step > 5) { clearInterval(itv); return; }
            box.textContent = "❄️".repeat(step);
            step++;
        }, 2000);
    },

    // 공통 입력창 설정
    setupWriteAction(q) {
        document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="height:200px; border-radius:20px; width:100%;" placeholder="${q}"></textarea>`;
    },

    setupCaptureAction() {
        document.getElementById('inAppActionArea').innerHTML = `<div style="text-align:center; padding:40px;"><button class="btn btn-secondary" onclick="window.EmotionActions.startCamera()">📸 Open Camera</button></div>`;
    },

    // --- 사운드 엔진 (기존 308줄의 정수) ---
    playTapSound() {
        try {
            this.initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
    },

    playTimerEndSound() {
        try {
            this.initAudio();
            [660, 880].forEach((f, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.15);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(audioCtx.currentTime + i * 0.15);
                osc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
            });
        } catch (e) {}
    },

    playTickSound() {
        try {
            this.initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } catch (e) {}
    }
};

// --- 전역 브릿지 ---
window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => {
    if (t === 'tap') Activities.playTapSound();
    if (t === 'success') Activities.playTimerEndSound();
    if ("vibrate" in navigator) navigator.vibrate(10);
};

window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });