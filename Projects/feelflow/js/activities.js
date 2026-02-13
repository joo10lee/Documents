/**
 * Activities 관리 모듈: 감정 및 스트레스 관리 엔진
 * [Phase 3] 통합 아키텍처 (Sound + Interactive Camera + Haptic)
 */

let audioCtx = null;

const Activities = {
    // 1. 사운드/햅틱 엔진
    initAudio() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
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

        if (Array.isArray(cfg.freq)) {
            cfg.freq.forEach((f, i) => this.playTone(f, cfg.dur, audioCtx.currentTime + (i * 0.1)));
        } else {
            this.playTone(cfg.freq, cfg.dur, audioCtx.currentTime);
        }
        if (navigator.vibrate) navigator.vibrate(cfg.vib);
    },

    playTone(freq, dur, startTime) {
        const start = Math.max(startTime, audioCtx.currentTime + 0.05);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + dur);
    },

    // 2. 리소스 정리 (타이머 및 카메라 스트림 중단)
    stopAll() {
        console.log("🛑 활동 중단 및 리소스 정리");
        if (this.currentInterval) clearInterval(this.currentInterval);
        this.currentInterval = null;

        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

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

    // 4. 활동 디스패처
    setupActivity(type) {
        this.stopAll();
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
                case 'Capture the moment': this.startCaptureAction(); break;
                case 'Big Hug': this.startBigHugTimer(); break;
                case 'Share the joy': this.startSMSAction(); break;
                case 'Listen to music': this.startMusicAction(); break;
                case 'Hold Something Cold': this.startColdSqueezeAnimation(); break;
                default: this.startWriteAction(`Focus on ${type}`);
            }
        }, 100);
    },

    // 5. 활동별 세부 로직
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
                    area.innerHTML = `<h2>Well Done!</h2><p>You are grounded.</p>`;
                    if (mainBtn) { mainBtn.style.display = 'block'; mainBtn.textContent = "Save & Finish"; }
                    this.feedback('success');
                }
            };
        };
        render(0);
    },

    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="lungContainer" style="display:flex; justify-content:center; align-items:center; height:180px;">
                <div id="lungCircle" style="width:80px; height:80px; background:rgba(124,58,237,0.2); border-radius:50%; border:5px solid #7c3aed; transition:4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:3rem;">🫁</div>
            </div>
            <p id="breathStatus" style="text-align:center; font-weight:800; color:#7c3aed; font-size:1.5rem; margin-top:25px;">Ready...</p>
        `;
        let cy = 0;
        const anim = () => {
            const l = document.getElementById('lungCircle'); const s = document.getElementById('breathStatus');
            if (!l || cy >= 3) return;
            this.feedback('tap'); s.textContent = "Inhale... 🌬️"; l.style.transform = "scale(2.5)";
            setTimeout(() => {
                if (!l) return;
                this.feedback('tick'); s.textContent = "Exhale... 💨"; l.style.transform = "scale(1)";
                cy++; setTimeout(anim, 4500);
            }, 4000);
        };
        setTimeout(anim, 1000);
    },

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
                else { round++; if (round > 3) { clearInterval(this.currentInterval); this.feedback('success'); return; } isSq = true; timeLeft = 5; }
            }
            update();
        }, 1000);
        update();
    },

    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="pContainer" style="text-align:center;">
                <div id="pCir" style="width:130px; height:130px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:3.5rem; font-weight:900; color:#ef4444;">15</div>
                <div style="width:100%; height:12px; background:#e2e8f0; margin-top:30px; border-radius:6px; overflow:hidden;"><div id="pBar" style="width:0%; height:100%; background:#ef4444; transition:1s linear;"></div></div>
                <p id="pInstr" style="margin-top:20px; font-weight:800;">PUSH THE WALL HARD!</p>
            </div>
            <style>@keyframes strain { 0% { transform:translate(1px,1px); } 50% { transform:translate(-1px,-2px); } 100% { transform:translate(1px,1px); } } .straining { animation: strain 0.1s infinite; }</style>
        `;
        let t = 15;
        this.currentInterval = setInterval(() => {
            const cir = document.getElementById('pCir');
            if (!cir) { clearInterval(this.currentInterval); return; }
            t--; cir.textContent = t; this.feedback('tick');
            document.getElementById('pBar').style.width = `${((15-t)/15)*100}%`;
            if (t <= 10) cir.classList.add('straining');
            if (t <= 0) { clearInterval(this.currentInterval); this.feedback('success'); cir.textContent = "💪"; cir.style.color = "#22c55e"; }
        }, 1000);
    },

    startCaptureAction() {
        const area = document.getElementById('inAppActionArea');
        const mainBtn = document.getElementById('activityBtn');
        if (mainBtn) mainBtn.style.display = 'none';

        this.currentFacingMode = this.currentFacingMode || 'user'; 
        area.innerHTML = `
            <div id="cameraModule" style="text-align:center;">
                <div id="videoContainer" style="position:relative; width:100%; aspect-ratio:3/4; background:#000; border-radius:24px; overflow:hidden; margin-bottom:20px;">
                    <video id="webcam" autoplay playsinline style="width:100%; height:100%; object-fit:cover; transform: ${this.currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'};"></video>
                    <div id="photoPreview" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background-size:cover; background-position:center; z-index:10;"></div>
                </div>
                <canvas id="hiddenCanvas" style="display:none;"></canvas>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <button id="snapBtn" class="btn btn-primary" style="width:100%;">📸 Take a Photo</button>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <button id="switchBtn" class="btn btn-secondary">🔄 Switch</button>
                        <button id="retakeBtn" class="btn btn-secondary" style="display:none;">🔄 Retake</button>
                    </div>
                </div>
            </div>`;

        const video = document.getElementById('webcam');
        const canvas = document.getElementById('hiddenCanvas');
        const preview = document.getElementById('photoPreview');
        const snapBtn = document.getElementById('snapBtn');
        const switchBtn = document.getElementById('switchBtn');
        const retakeBtn = document.getElementById('retakeBtn');

        const startStream = async () => {
            if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
            try {
                this.currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.currentFacingMode }, audio: false });
                video.srcObject = this.currentStream;
            } catch (err) { console.error(err); }
        };

        snapBtn.onclick = () => {
            this.feedback('success');
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (this.currentFacingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            preview.style.backgroundImage = `url(${dataUrl})`;
            preview.style.display = 'block';
            snapBtn.style.display = 'none'; switchBtn.style.display = 'none'; retakeBtn.style.display = 'block';
            if (mainBtn) { mainBtn.style.display = 'block'; mainBtn.textContent = "Save Memory"; window.lastCapturedPhoto = dataUrl; }
        };

        switchBtn.onclick = () => {
            this.feedback('tap');
            this.currentFacingMode = (this.currentFacingMode === 'user') ? 'environment' : 'user';
            video.style.transform = (this.currentFacingMode === 'user') ? 'scaleX(-1)' : 'scaleX(1)';
            startStream();
        };

        retakeBtn.onclick = () => {
            this.feedback('tap');
            preview.style.display = 'none'; snapBtn.style.display = 'block'; switchBtn.style.display = 'block'; retakeBtn.style.display = 'none';
            if (mainBtn) mainBtn.style.display = 'none';
        };

        startStream();
    },

    startJasonBreakQuest() {
        const area = document.getElementById('inAppActionArea');
        const quests = ["🎸 1분간 기타 리프 연주하기", "🎤 합창곡 한 소절 부르기", "🎶 새 음악 3분간 감상하기", "🧘 30초간 스트레칭"];
        const q = quests[Math.floor(Math.random() * quests.length)];
        area.innerHTML = `<div style="padding:25px; background:#eff6ff; border:3px solid #3b82f6; border-radius:25px; text-align:center;"><h3>Hey Jason! 🕺</h3><p style="font-size:1.4rem; font-weight:800;">"${q}"</p><button id="sB" class="btn btn-primary" style="width:100%; margin-top:15px;">🔍 아이디어 더 보기</button></div>`;
        document.getElementById('sB').onclick = () => window.open(`https://www.google.com/search?q=${encodeURIComponent("musical break for teens")}`, '_blank');
    },

    startSMSAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<textarea id="actionNote" class="form-control" style="height:120px; border-radius:15px;">오늘 정말 기분 좋은 일이 있었어! ✨</textarea>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Send via SMS 💌"; btn.onclick = () => { window.location.href = `sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`; }; }
    },

    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center;"><div style="font-size:6rem;">🫂</div><div id="hT" style="font-size:4rem; font-weight:900;">10</div></div>`;
        let tl = 10;
        this.currentInterval = setInterval(() => {
            const t = document.getElementById('hT');
            if (!t || tl <= 0) { clearInterval(this.currentInterval); this.feedback('success'); return; }
            tl--; t.textContent = tl; this.feedback('tick');
        }, 1000);
    },

    startMusicAction() { document.getElementById('inAppActionArea').innerHTML = `<button class="btn btn-primary" style="background:#FF0000; width:100%;" onclick="window.open('https://www.youtube.com/watch?v=1ZYbU82GVz4', '_blank')">📺 Open YouTube</button>`; },
    startColdSqueezeAnimation() { 
        const area = document.getElementById('inAppActionArea');
        let s = 1;
        this.currentInterval = setInterval(() => {
            area.innerHTML = `<div style="font-size:5rem; text-align:center;">${"❄️".repeat(s)}</div>`;
            if (s >= 5) { clearInterval(this.currentInterval); return; }
            s++; this.feedback('tick');
        }, 1000);
    },
    startWriteAction(q) { document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="height:180px; border-radius:20px;" placeholder="${q}"></textarea>`; },

    // Legacy 유틸리티
    playTapSound() { this.feedback('tap'); },
    playTickSound() { this.feedback('tick'); },
    playTimerEndSound() { this.feedback('success'); }
};

// --- 글로벌 리스너 ---
window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => Activities.feedback(t);
['click', 'touchstart'].forEach(e => window.addEventListener(e, () => Activities.initAudio(), { once: false }));