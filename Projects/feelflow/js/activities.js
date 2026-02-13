/**
 * Activities 관리 모듈: 감정 및 스트레스 관리 엔진
 * [완전 통합] 오리지널 306라인 + Squeeze, Push, Jason Break 엔진 완벽 구현
 */

// 1. 전역 오디오 컨텍스트 (Safari/iOS 필수 대응)
let audioCtx = null;

const Activities = {
    initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
    },

    // 2. 전략 카드 렌더링
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

    // 3. 활동 메인 엔진 (이름 불일치 및 바인딩 수정 완료)
    setupActivity(type) {
        console.log(`🏃 활동 엔진 가동: ${type}`);
        this.initAudio();
        if (window.feedback) window.feedback('tap');

        if (typeof UI !== 'undefined' && UI.goToScreen) {
            UI.goToScreen('Activity', type);
        }

        // 💡 화살표 함수(() =>)를 사용하여 'this'가 Activities 객체를 계속 유지하도록 함
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

            // 💡 함수 이름을 start... 형식으로 통일하여 에러 해결
            switch(type) {
                case 'Deep Breathing': this.startBreathingAnimation(); break;
                case 'Big Hug': this.startBigHugTimer(); break;
                case 'Share the joy': this.setupSMSAction(); break;
                case 'Squeeze & Release': this.startSqueezeAction(); break;
                case 'Push the Wall': this.startPushWallAction(); break;
                case 'Take a Break': this.startJasonBreakQuest(); break;
                case '5-4-3-2-1 Grounding': this.setupGroundingAction(); break;
                case 'Listen to music': this.setupMusicAction(); break;
                case 'Capture the moment': this.setupCaptureAction(); break;
                case 'Hold Something Cold': this.startColdSqueezeAnimation(); break;
                default: this.setupWriteAction(`Focus on ${type}`);
            }
        }, 100);
    },

    // 4. [애니메이션] Deep Breathing
    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="lungContainer" style="display:flex; justify-content:center; align-items:center; height:200px; margin-top:20px;">
                <div id="lungCircle" style="width:80px; height:80px; background:rgba(124, 58, 237, 0.2); border-radius:50%; border:5px solid #7c3aed; transition: all 4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:3.5rem;">🫁</div>
            </div>
            <p id="breathStatus" style="text-align:center; font-weight:800; color:#7c3aed; font-size:1.6rem; margin-top:30px;">Ready...</p>
        `;
        let cycle = 0;
        const lung = document.getElementById('lungCircle');
        const status = document.getElementById('breathStatus');
        const animate = () => {
            if (cycle >= 3 || !lung) { if(status) status.textContent = "✅ Much better."; return; }
            status.textContent = "Inhale... 🌬️"; lung.style.transform = "scale(2.5)";
            setTimeout(() => {
                if (!lung) return;
                status.textContent = "Exhale... 💨"; lung.style.transform = "scale(1)";
                cycle++; setTimeout(animate, 4500);
            }, 4000);
        };
        setTimeout(animate, 1000);
    },

    // 5. [애니메이션] Big Hug
    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="text-align:center; padding:30px;">
                <div id="hugEmoji" style="font-size:6rem; animation: hugPulse 1.5s infinite alternate;">🫂</div>
                <div id="hugTimer" style="font-size:4rem; font-weight:900; color:#7c3aed; margin-top:20px;">10</div>
            </div>
            <style> @keyframes hugPulse { from { transform: scale(1); } to { transform: scale(1.15); } } </style>
        `;
        let timeLeft = 10;
        const timerEl = document.getElementById('hugTimer');
        const interval = setInterval(() => {
            if (!timerEl || !document.getElementById('hugTimer')) { clearInterval(interval); return; }
            timeLeft--; timerEl.textContent = timeLeft;
            if (window.feedback) window.feedback('tap');
            if (timeLeft <= 0) {
                clearInterval(interval);
                timerEl.textContent = "❤️";
                if (window.feedback) window.feedback('success');
            }
        }, 1000);
    },

    // 6. [애니메이션] Squeeze & Release (✊ 🖐️)
    startSqueezeAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div id="handEmoji" style="font-size:8rem; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">✊</div>
                <p id="sqStatus" style="font-size:1.6rem; font-weight:800; color:#7c3aed; margin-top:30px;">Squeeze Tight!</p>
            </div>
        `;
        let isSq = true; let count = 0;
        const toggle = () => {
            const hand = document.getElementById('handEmoji');
            const status = document.getElementById('sqStatus');
            if (!hand || count >= 10) return;
            if (isSq) {
                hand.textContent = "🖐️"; hand.style.transform = "scale(1.4)";
                status.textContent = "Release... 💨";
            } else {
                hand.textContent = "✊"; hand.style.transform = "scale(0.8)";
                status.textContent = "Squeeze! 💢";
                if (navigator.vibrate) navigator.vibrate(30);
            }
            isSq = !isSq; count++; setTimeout(toggle, 2000);
        };
        setTimeout(toggle, 1000);
    },

    // 7. [애니메이션] Push the Wall (🧱 15초 진동 타이머)
    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div id="pCir" style="width:130px; height:130px; margin:0 auto; border:8px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:3.5rem; font-weight:900; color:#ef4444;">15</div>
                <div id="pBar" style="width:0%; height:12px; background:#ef4444; margin-top:30px; border-radius:6px; transition: width 1s linear;"></div>
                <p style="margin-top:20px; font-weight:800;">PUSH THE WALL HARD!</p>
            </div>
        `;
        let t = 15;
        const itv = setInterval(() => {
            const c = document.getElementById('pCir');
            const b = document.getElementById('pBar');
            if (!c || t <= 0) {
                clearInterval(itv);
                if (c) { c.textContent = "💪"; c.style.color = "#22c55e"; c.style.borderColor = "#22c55e"; }
                return;
            }
            t--; c.textContent = t;
            if (b) b.style.width = `${((15-t)/15)*100}%`;
            if (navigator.vibrate) navigator.vibrate(60);
        }, 1000);
    },

    // 8. [신규] Jason's Break Quest (제이슨 맞춤형 동적 추천)
    startJasonBreakQuest() {
        const area = document.getElementById('inAppActionArea');
        const quests = [
            "🎸 Play a 1-minute guitar riff or drum fill.",
            "🎤 Sing your favorite choir song out loud.",
            "🎶 Find a new song on YouTube and just listen.",
            "🧘 Step away from the screen and stretch for 30s.",
            "🏃 Find 3 instruments or music items in the room."
        ];
        const quest = quests[Math.floor(Math.random() * quests.length)];
        area.innerHTML = `
            <div style="padding:25px; background:#eff6ff; border:3px solid #3b82f6; border-radius:25px; text-align:center;">
                <h3 style="color:#1d4ed8; margin-bottom:15px;">Hey Jason! 🕺</h3>
                <p style="font-size:1.4rem; font-weight:800; line-height:1.5; color:#1e3a8a;">"${quest}"</p>
                <hr style="margin:20px 0; border:1px solid #bfdbfe;">
                <button id="searchIdeasBtn" class="btn" style="background:#3b82f6; color:white; width:100%; border-radius:15px; font-weight:700; padding:12px;">🔍 Search Activity Ideas</button>
            </div>
        `;
        document.getElementById('searchIdeasBtn').onclick = () => {
            window.open(`https://www.google.com/search?q=${encodeURIComponent("creative quick break for musical teenagers")}`, '_blank');
        };
    },

    // 9. [오리지널 유틸리티] SMS, Grounding, Music, Writing, Capture
    setupSMSAction() {
        const area = document.getElementById('inAppActionArea');
        const btn = document.getElementById('activityBtn');
        area.innerHTML = `<p style="text-align:center; margin-bottom:15px; color:#64748b;">💌 Share this happiness with family.</p><textarea id="actionNote" class="form-control" style="height:150px; border-radius:20px; width:100%;">오늘 정말 기분 좋은 일이 있었어! 함께 나누고 싶어 ✨</textarea>`;
        if (btn) {
            btn.textContent = "Send via SMS 💌";
            btn.onclick = () => {
                window.location.href = `sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`;
                setTimeout(() => { if(typeof window.finishCheckIn === 'function') window.finishCheckIn(); }, 1500);
            };
        }
    },
    setupGroundingAction() { document.getElementById('inAppActionArea').innerHTML = `<div style="line-height:2.2; font-size:1.1rem; padding:10px; background:#f8fafc; border-radius:15px;">🖐️ 5 See / 👂 4 Hear / 👃 3 Smell / 🤝 2 Touch / 👅 1 Taste</div>`; },
    setupMusicAction() { const url = "https://www.youtube.com/watch?v=1ZYbU82GVz4"; document.getElementById('inAppActionArea').innerHTML = `<div style="text-align:center; padding:20px;"><button class="btn" style="background:#FF0000; color:white; width:100%; border-radius:15px;" onclick="window.open('${url}', '_blank')">📺 Open YouTube</button></div>`; },
    startColdSqueezeAnimation() { const area = document.getElementById('inAppActionArea'); area.innerHTML = `<div id="animBox" style="font-size:5rem; text-align:center; padding:40px;">❄️</div>`; let step = 1; const itv = setInterval(() => { const box = document.getElementById('animBox'); if (!box || step > 5) { clearInterval(itv); return; } box.textContent = "❄️".repeat(step); step++; }, 2000); },
    setupWriteAction(q) { document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="height:200px; border-radius:20px; width:100%;" placeholder="${q}"></textarea>`; },
    setupCaptureAction() { document.getElementById('inAppActionArea').innerHTML = `<div style="text-align:center; padding:40px;"><button class="btn btn-secondary" style="border-radius:15px;" onclick="window.EmotionActions.startCamera()">📸 Open Camera</button></div>`; },

    // 10. [오리지널 사운드 엔진]
    playTapSound() { try { this.initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.frequency.setValueAtTime(800, audioCtx.currentTime); gain.gain.setValueAtTime(0.1, audioCtx.currentTime); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.1); } catch (e) {} },
    playTimerEndSound() { try { this.initAudio(); [660, 880].forEach((f, i) => { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.15); gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.15); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + i * 0.15); osc.stop(audioCtx.currentTime + i * 0.15 + 0.3); }); } catch (e) {} },
    playTickSound() { try { this.initAudio(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(150, audioCtx.currentTime); gain.gain.setValueAtTime(0.02, audioCtx.currentTime); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.05); } catch (e) {} }
};

// 11. 글로벌 브릿지 등록
window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => {
    if (t === 'tap') Activities.playTapSound();
    if (t === 'success') Activities.playTimerEndSound();
    if (navigator.vibrate) navigator.vibrate(10);
};
window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });