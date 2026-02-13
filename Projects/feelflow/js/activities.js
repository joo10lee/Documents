/**
 * Activities 관리 모듈: 감정 및 스트레스 관리 엔진
 * [Phase 3] 306 Line Base + Interactive Grounding + Push Animation + Rich Sound/Haptic
 */

let audioCtx = null;

const Activities = {
    initAudio() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            // 💡 resume은 비동기(Promise)이므로 상태에 상관없이 호출해둡니다.
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } catch (e) {
            console.error("AudioContext 초기화 실패:", e);
        }
    },

    feedback(type) {
        this.initAudio();
        
        const sounds = {
            tap: { freq: 880, dur: 0.1, vib: 15 },
            tick: { freq: 440, dur: 0.05, vib: 8 },
            success: { freq: [523.25, 659.25, 783.99], dur: 0.5, vib: [50, 100, 50] }
        };
        const cfg = sounds[type];
        if (!cfg || !audioCtx) return;

        // 💡 [수정] state check를 제거하거나 비동기 대응을 합니다.
        // 브라우저는 resume()이 호출된 직후의 play 명령을 큐에 쌓아두었다가 
        // 컨텍스트가 활성화되는 즉시 재생합니다.
        if (Array.isArray(cfg.freq)) {
            cfg.freq.forEach((f, i) => this.playTone(f, cfg.dur, audioCtx.currentTime + (i * 0.1)));
        } else {
            this.playTone(cfg.freq, cfg.dur, audioCtx.currentTime);
        }

        if (navigator.vibrate) navigator.vibrate(cfg.vib);
    },

    playTone(freq, dur, startTime) {
        // 💡 스케줄링 버퍼: 현재 시간보다 최소 0.05초 뒤에 재생되도록 보정
        const start = Math.max(startTime, audioCtx.currentTime + 0.05);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        // 볼륨 설정: 0.1에서 0.001까지 부드럽게 감소
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(start);
        osc.stop(start + dur);
    },

    // 💡 startBreathingAnimation에서 참조하는 setPattern 함수 누락 보강
    setPattern(pattern) {
        console.log(`🌬️ 호흡 패턴 변경: ${pattern}`);
        document.querySelectorAll('.btn-mini').forEach(b => b.classList.remove('active'));
        const activeBtn = pattern === 'relax' ? document.getElementById('pRelax') : document.getElementById('pBox');
        if (activeBtn) activeBtn.classList.add('active');
        // 여기서 패턴별 타이밍 조절 로직을 추가할 수 있습니다.
    },

    // 💡 2. 자원 정리 (Navigation Cleanup)
// activities.js 내 stopAll 보강
    stopAll() {
        console.log("🛑 활동 중단 및 리소스 정리");
        
        // 1. 타이머 중단
        if (this.currentInterval) clearInterval(this.currentInterval);
        this.currentInterval = null;

        // 2. 카메라 스트림 중단 💡 (추가된 부분)
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        // 3. 진동 중단
        if (navigator.vibrate) navigator.vibrate(0);
    },

    // 3. 전략 카드 렌더링
    renderStrategies(emotion) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;
        const strategyMap = {
            'Happy': [{ title: 'Write it down', icon: '✍️' }, { title: 'Capture the moment', icon: '📸' }, { title: 'Share the joy', icon: '🎉' }],
            'Sad': [{ title: 'Talk to someone', icon: '💬' }, { title: 'Listen to music', icon: '🎵' }, { title: 'Big Hug', icon: '🧸' }],
            'Anxious': [{ title: 'Deep Breathing', icon: '🌬️' }, { title: '5-4-3-2-1 Grounding', icon: '🖐️' }, { title: 'Hold Something Cold', icon: '❄️' }],
            'Angry': [{ title: 'Squeeze & Release', icon: '✊' }, { title: 'Take a Break', icon: '🚶' }, { title: 'Push the Wall', icon: '🧱' }],
            'Calm': [{ title: 'Listen to music', icon: '🎵' }, { title: 'Write it down', icon: '✍️' }],
            'Tired': [{ title: 'Deep Breathing', icon: '🌬️' }, { title: 'Listen to music', icon: '🎵' }]
        };
        const strategies = strategyMap[emotion] || [{ title: 'Deep Breathing', icon: '🌬️' }];
        container.innerHTML = strategies.map(s => `
            <div class="strategy-card" onclick="Activities.setupActivity('${s.title}')">
                <div class="strategy-icon">${s.icon}</div>
                <div class="strategy-title">${s.title}</div>
            </div>
        `).join('');
    },

    // 4. 활동 메인 엔진
    setupActivity(type) {
        console.log(`🏃 활동 엔진 가동: ${type}`);
        this.stopAll(); // 이전 활동 정리
        this.feedback('tap');

        if (typeof UI !== 'undefined' && UI.goToScreen) {
            UI.goToScreen('Activity', type);
        }

        setTimeout(() => {
            const area = document.getElementById('inAppActionArea');
            const btn = document.getElementById('activityBtn');
            const title = document.getElementById('activityTitle');
            if (!area) return;
            area.style.display = 'block'; area.innerHTML = ''; 
            if (title) title.textContent = type;
            if (btn) {
                btn.style.display = 'block'; btn.textContent = "Finish Activity";
                btn.onclick = () => { if(typeof window.finishCheckIn === 'function') window.finishCheckIn(); };
            }

            switch(type) {
                case '5-4-3-2-1 Grounding': this.startGroundingAnimation(); break;
                case 'Squeeze & Release': this.startSqueezeAction(); break;
                case 'Push the Wall': this.startPushWallAction(); break;
                case 'Take a Break': this.startJasonBreakQuest(); break;
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

    // 🖐️ 5-4-3-2-1 Grounding (Interactive Version)
    startGroundingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const mainBtn = document.getElementById('activityBtn');
        if (mainBtn) mainBtn.style.display = 'none';

        const steps = [
            { n: 5, s: 'SEE 👀', p: 'Name 5 things you can see.', c: '#3b82f6', i: '🖐️' },
            { n: 4, s: 'TOUCH ✋', p: 'Notice 4 things you can feel.', c: '#10b981', i: '🖖' },
            { n: 3, s: 'HEAR 👂', p: 'Name 3 sounds you hear.', c: '#f59e0b', i: '🤟' },
            { n: 2, s: 'SMELL 👃', p: 'Notice 2 things you can smell.', c: '#ef4444', i: '✌️' },
            { n: 1, s: 'TASTE 👅', p: 'Notice 1 thing you can taste.', c: '#7c3aed', i: '☝️' }
        ];

        let cur = 0;
        const render = (idx) => {
            const s = steps[idx];
            let inputs = '';
            for (let i = 1; i <= s.n; i++) {
                inputs += `<input type="text" class="grounding-input" placeholder="${i}. I ${s.s.split(' ')[1].toLowerCase()}..." style="width:100%; margin-bottom:10px; padding:12px; border:2px solid #e2e8f0; border-radius:12px;">`;
            }
            area.innerHTML = `
                <div style="text-align:center; animation: fadeIn 0.4s;">
                    <div style="font-size:6rem; color:${s.c};">${s.i}</div>
                    <h2 style="color:${s.c};">${s.n} Things to ${s.s.split(' ')[1]}</h2>
                    <p style="color:#64748b; margin-bottom:20px;">${s.p}</p>
                    <div style="max-height:180px; overflow-y:auto;">${inputs}</div>
                    <button id="nextG" class="btn btn-primary" style="width:100%; margin-top:20px; background:${s.c}; border:none;">${idx === 4 ? 'Finish' : 'Next Step'}</button>
                </div>`;
            document.getElementById('nextG').onclick = () => {
                this.feedback('tap');
                if (idx < 4) render(idx + 1);
                else {
                    area.innerHTML = `<div style="text-align:center; padding:40px;"><h2>Well Done!</h2><p>You are grounded.</p></div>`;
                    if (mainBtn) { mainBtn.style.display = 'block'; mainBtn.textContent = "Save & Finish"; }
                    this.feedback('success');
                }
            };
        };
        render(0);
    },

    // 🫁 Deep Breathing (Pattern UI + Animation)
    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div class="pattern-selector" style="display:flex; justify-content:center; gap:10px; margin-bottom:25px;">
                <button class="btn-mini active" id="pRelax" onclick="Activities.setPattern('relax')">Relax</button>
                <button class="btn-mini" id="pBox" onclick="Activities.setPattern('box')">Box</button>
            </div>
            <div id="lungContainer" style="display:flex; justify-content:center; align-items:center; height:180px;">
                <div id="lungCircle" style="width:80px; height:80px; background:rgba(124,58,237,0.2); border-radius:50%; border:5px solid #7c3aed; transition:4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:3rem;">🫁</div>
            </div>
            <p id="breathStatus" style="text-align:center; font-weight:800; color:#7c3aed; font-size:1.5rem; margin-top:25px;">Ready...</p>
        `;
        let cy = 0;
        const anim = () => {
            const l = document.getElementById('lungCircle'); const s = document.getElementById('breathStatus');
            if (!l || cy >= 3) { if(s) s.textContent = "✅ Balanced."; return; }
            this.feedback('tap'); s.textContent = "Inhale... 🌬️"; l.style.transform = "scale(2.5)";
            setTimeout(() => {
                if (!l) return;
                this.feedback('tick'); s.textContent = "Exhale... 💨"; l.style.transform = "scale(1)";
                cy++; setTimeout(anim, 4500);
            }, 4000);
        };
        setTimeout(anim, 1000);
    },

    // ✊ Squeeze & Release (Animated Rounds)
    startSqueezeAction() {
        const area = document.getElementById('inAppActionArea');
        let round = 1; let timeLeft = 5; let isSq = true;
        const update = () => {
            area.innerHTML = `
                <div style="text-align:center;">
                    <div id="sqEmoji" style="font-size:8rem; transition:0.3s;">${isSq ? '✊' : '🖐️'}</div>
                    <h2 style="color:#7c3aed; margin-top:20px;">${isSq ? 'SQUEEZE!' : 'RELEASE...'}</h2>
                    <div style="font-size:3.5rem; font-weight:900; margin:15px 0;">${timeLeft}</div>
                    <p style="color:#94a3b8;">Round ${round} of 3</p>
                </div>`;
            const e = document.getElementById('sqEmoji');
            if (isSq) { e.style.transform = 'scale(0.8)'; if (navigator.vibrate) navigator.vibrate(40); }
            else { e.style.transform = 'scale(1.2)'; }
        };
        this.currentInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                if (isSq) { isSq = false; timeLeft = 5; }
                else { round++; if (round > 3) { clearInterval(this.currentInterval); this.feedback('success'); area.innerHTML = "<h3>Feeling relaxed?</h3>"; return; } isSq = true; timeLeft = 5; }
            }
            update();
        }, 1000);
        update();
    },

    // 🧱 Push the Wall (Strain Animation)
    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="pContainer" style="text-align:center;">
                <div id="pCir" style="width:130px; height:130px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:3.5rem; font-weight:900; color:#ef4444;">15</div>
                <div style="width:100%; height:12px; background:#e2e8f0; margin-top:30px; border-radius:6px; overflow:hidden;"><div id="pBar" style="width:0%; height:100%; background:#ef4444; transition:1s linear;"></div></div>
                <p id="pInstr" style="margin-top:20px; font-weight:800; font-size:1.2rem;">PUSH THE WALL HARD!</p>
            </div>
            <style>@keyframes strain { 0% { transform:translate(1px,1px); } 50% { transform:translate(-1px,-2px); } 100% { transform:translate(1px,1px); } } .straining { animation: strain 0.1s infinite; }</style>
        `;
        let t = 15; const cir = document.getElementById('pCir');
        this.currentInterval = setInterval(() => {
            if (!cir) { clearInterval(this.currentInterval); return; }
            t--; cir.textContent = t; this.feedback('tick');
            document.getElementById('pBar').style.width = `${((15-t)/15)*100}%`;
            if (t <= 10) cir.classList.add('straining');
            if (t <= 5 && navigator.vibrate) navigator.vibrate(80);
            if (t <= 0) { clearInterval(this.currentInterval); this.feedback('success'); cir.classList.remove('straining'); cir.textContent = "💪"; cir.style.color = "#22c55e"; }
        }, 1000);
    },

    // 🎸 Jason's Break Quest
    startJasonBreakQuest() {
        const area = document.getElementById('inAppActionArea');
        const quests = ["🎸 1분간 기타/드럼 자유 연주하기", "🎤 좋아하는 합창곡 소리 내어 부르기", "🎶 새 음악 찾아 3분간 감상하기", "🧘 30초간 기지개 크게 켜기"];
        const q = quests[Math.floor(Math.random() * quests.length)];
        area.innerHTML = `
            <div style="padding:25px; background:#eff6ff; border:3px solid #3b82f6; border-radius:25px; text-align:center;">
                <h3 style="color:#1d4ed8;">Hey Jason! 🕺</h3>
                <p style="font-size:1.4rem; font-weight:800;">"${q}"</p>
                <button id="sB" class="btn btn-primary" style="width:100%; margin-top:15px; background:#3b82f6; border:none;">🔍 아이디어 더 보기</button>
            </div>`;
        document.getElementById('sB').onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent("musical break for teens")}`, '_blank');
    },

    // 🧸 Utility Activities (SMS, Capture, etc.)
    startSMSAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<p style="color:#64748b; margin-bottom:10px;">💌 이 기쁨을 가족과 나누세요.</p><textarea id="actionNote" class="form-control" style="height:120px; border-radius:15px;">오늘 정말 기분 좋은 일이 있었어! ✨</textarea>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Send via SMS 💌"; btn.onclick = () => { window.location.href = `sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`; setTimeout(() => window.finishCheckIn(), 1500); }; }
    },
    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center;"><div style="font-size:6rem; animation:hPulse 1.5s infinite alternate;">🫂</div><div id="hT" style="font-size:4rem; font-weight:900; color:#7c3aed; margin-top:20px;">10</div></div><style>@keyframes hPulse { from { transform: scale(1); } to { transform: scale(1.15); } }</style>`;
        let tl = 10; const itv = setInterval(() => {
            const t = document.getElementById('hT'); if (!t || tl <= 0) { clearInterval(itv); if(t) t.textContent="❤️"; this.feedback('success'); return; }
            tl--; t.textContent = tl; this.feedback('tick');
        }, 1000);
    },
    startMusicAction() { document.getElementById('inAppActionArea').innerHTML = `<button class="btn btn-primary" style="background:#FF0000; width:100%; border:none;" onclick="window.open('https://www.youtube.com/watch?v=1ZYbU82GVz4', '_blank')">📺 Open YouTube</button>`; },
    startColdSqueezeAnimation() { 
        const area = document.getElementById('inAppActionArea'); area.innerHTML = `<div id="anB" style="font-size:5rem; text-align:center; padding:40px;">❄️</div>`;
        let s = 1; const i = setInterval(() => { const b = document.getElementById('anB'); if (!b || s > 5) { clearInterval(i); return; } b.textContent = "❄️".repeat(s); s++; this.feedback('tick'); }, 2000);
    },
    startWriteAction(q) { document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="height:180px; border-radius:20px;" placeholder="${q}"></textarea>`; },
    // 📸 Capture the Moment 활동 (Camera Stitching)
// activities.js 내 stopAll 보강
stopAll() {
    console.log("🛑 활동 중단 및 리소스 정리");
    
    // 1. 타이머 중단
    if (this.currentInterval) clearInterval(this.currentInterval);
    this.currentInterval = null;

    // 2. 카메라 스트림 중단 💡 (추가된 부분)
    if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
        this.currentStream = null;
    }

    // 3. 진동 중단
    if (navigator.vibrate) navigator.vibrate(0);
},

    // 💡 Legacy Sounds (For compatibility)
    playTapSound() { this.feedback('tap'); },
    playTickSound() { this.feedback('tick'); },
    playTimerEndSound() { this.feedback('success'); }
};

// --- 글로벌 브릿지 ---
window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => Activities.feedback(t);
window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });
window.addEventListener('click', () => Activities.initAudio(), { once: false });
window.addEventListener('touchstart', () => Activities.initAudio(), { once: false });