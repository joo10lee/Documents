/**
 * Activities 관리 모듈: Ver.0213-2700 (Full Action Library)
 * [Added] Push the Wall, SMS, YouTube 기능 복구 및 티어 시스템 통합
 */

let audioCtx = null;

const Activities = {
    currentStream: null,
    currentFacingMode: 'user', 
    currentInterval: null,

    initAudio() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (e) { console.error("Audio init fail:", e); }
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

    stopAll() {
        if (this.currentInterval) clearInterval(this.currentInterval);
        this.currentInterval = null;
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        if (navigator.vibrate) navigator.vibrate(0);
    },

    // 1. 감정별 맞춤형 2버튼 퀘스트 렌더링
    renderStrategies(emotion) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;

        // 💡 감정에 따라 실버/골드 미션 구성을 다르게 스티칭
        const strategyMap = {
            'Angry': [
                { title: 'Push the Wall', icon: '🧱', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b' }
            ],
            'Happy': [
                { title: 'Share the joy', icon: '💌', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b' }
            ],
            'Tired': [
                { title: 'Listen to music', icon: '🎵', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Deep Breathing', icon: '🌬️', tier: 'silver', xp: 30, color: '#fff' }
            ],
            'default': [
                { title: 'Deep Breathing', icon: '🧘', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Capture the moment', icon: '🎸', tier: 'gold', xp: 60, color: '#1e293b' }
            ]
        };

        const quests = strategyMap[emotion] || strategyMap['default'];

        container.innerHTML = quests.map(q => `
            <button class="bento-card ${q.tier}-tier" 
                    onclick="Activities.setupActivity('${q.title}')" 
                    style="flex-direction:row; justify-content:flex-start; padding:24px; gap:20px; background:${q.color}; ${q.tier==='gold'?'color:white;':''}">
                <span style="font-size:3rem;">${q.icon}</span>
                <div style="text-align:left;">
                    <div style="font-weight:850; font-size:1.1rem;">${q.title}</div>
                    <div style="font-weight:700; font-size:0.8rem; color:${q.tier==='gold'?'#FFD700':'#7c3aed'}">
                        ${q.tier==='gold'?'🥇 Gold':'🥈 Silver'} (+${q.xp} XP)
                    </div>
                </div>
            </button>
        `).join('');
    },

    // 2. 활동 디스패처 (요청하신 기능들 스티칭)
    setupActivity(type) {
        this.stopAll();
        this.feedback('tap');
        if (typeof UI !== 'undefined' && UI.goToScreen) UI.goToScreen('Activity', type);

        setTimeout(() => {
            const area = document.getElementById('inAppActionArea');
            const btn = document.getElementById('activityBtn');
            const title = document.getElementById('activityTitle');
            if (!area) return;
            area.innerHTML = ''; 
            if (title) title.textContent = type;
            
            switch(type) {
                case 'Push the Wall': 
                    this.startPushWallAction(); 
                    if (btn) { btn.style.display = 'block'; btn.textContent = "I feel better 💪"; }
                    break;
                case 'Share the joy': 
                    this.startSMSAction(); 
                    if (btn) { btn.style.display = 'block'; btn.textContent = "Send SMS 💌"; }
                    break;
                case 'Listen to music': 
                    this.startMusicAction(); 
                    if (btn) { btn.style.display = 'block'; btn.textContent = "Finished Listening"; }
                    break;
                case 'Capture the moment': 
                    this.startCaptureAction(); 
                    break;
                case 'Deep Breathing': 
                    this.startBreathingAnimation(); 
                    if (btn) { btn.style.display = 'block'; btn.textContent = "Finish & Get Silver 🥈"; }
                    break;
                default:
                    this.startWriteAction(`Focus on ${type}`);
                    if (btn) btn.style.display = 'block';
            }
        }, 100);
    },

    // 3. [추가] 벽 밀기 (Angry 대응)
    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="pContainer" style="text-align:center; padding:20px;">
                <div id="pCir" style="width:130px; height:130px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:3.5rem; font-weight:900; color:#ef4444;">10</div>
                <p id="pInstr" style="margin-top:20px; font-weight:800; color:#1e293b;">PUSH THE WALL HARD!</p>
                <div style="width:100%; height:12px; background:#e2e8f0; margin-top:20px; border-radius:6px; overflow:hidden;"><div id="pBar" style="width:0%; height:100%; background:#ef4444; transition:1s linear;"></div></div>
            </div>
        `;
        let t = 10;
        this.currentInterval = setInterval(() => {
            const cir = document.getElementById('pCir');
            if (!cir) { clearInterval(this.currentInterval); return; }
            t--; cir.textContent = t; this.feedback('tick');
            document.getElementById('pBar').style.width = `${((10-t)/10)*100}%`;
            if (t <= 0) { 
                clearInterval(this.currentInterval); 
                this.feedback('success'); 
                cir.textContent = "💪"; cir.style.color = "#22c55e"; cir.style.borderColor = "#22c55e";
                document.getElementById('pInstr').textContent = "Great Job! You did it.";
            }
        }, 1000);
    },

    // 4. [추가] SMS 보내기 (Happy 대응)
    startSMSAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px;">
                <p style="font-weight:800; color:#7c3aed; margin-bottom:10px;">Who do you want to tell?</p>
                <textarea id="actionNote" class="form-control" style="width:100%; height:120px; border-radius:20px; border:2px solid #7c3aed; padding:15px; font-family:inherit;">오늘 정말 기분 좋은 일이 있었어! ✨</textarea>
            </div>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) {
            btn.onclick = () => {
                const msg = document.getElementById('actionNote').value;
                window.location.href = `sms:?&body=${encodeURIComponent(msg)}`;
                FeelFlow.addXP(30);
                this.showCelebration('silver');
                window.finishCheckIn();
            };
        }
    },

    // 5. [추가] 유튜브 음악 (Tired/Calm 대응)
    startMusicAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="font-size:4rem; margin-bottom:20px;">🎵</div>
                <button class="btn-primary" style="background:#FF0000; width:100%;" onclick="window.open('https://www.youtube.com/results?search_query=relaxing+music+for+kids', '_blank')">📺 Open YouTube Music</button>
                <p style="margin-top:15px; font-size:0.85rem; color:#64748b;">Listen for a while and come back!</p>
            </div>
        `;
    },

    // 6. [기본] 골드 미션: 카메라 촬영
    startCaptureAction() {
        const area = document.getElementById('inAppActionArea');
        const mainBtn = document.getElementById('activityBtn');
        if (mainBtn) mainBtn.style.display = 'none';

        area.innerHTML = `
            <div id="cameraModule" style="text-align:center;">
                <div id="videoContainer" style="position:relative; width:92%; margin:0 auto; aspect-ratio:3/4; background:#000; border-radius:32px; overflow:hidden;">
                    <video id="webcam" autoplay playsinline style="width:100%; height:100%; object-fit:cover; transform: ${this.currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'};"></video>
                    <div id="photoPreview" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background-size:cover; background-position:center; z-index:10;"></div>
                </div>
                <canvas id="hiddenCanvas" style="display:none;"></canvas>
                <div style="position:fixed; bottom:110px; left:24px; right:24px; z-index:2500; display:flex; flex-direction:column; gap:12px;">
                    <button id="snapBtn" class="btn-primary" style="height:70px; font-size:1.2rem; border-radius:24px;">📸 Take Gold Photo</button>
                    <button id="switchBtn" style="background:rgba(255,255,255,0.9); border:none; padding:12px; border-radius:15px; font-weight:700;">🔄 Flip Camera</button>
                    <button id="retakeBtn" style="display:none; background:#475569; color:white; border:none; padding:18px; border-radius:24px;">🔄 Try Again</button>
                    <button id="sendBtn" style="display:none; background:#FFD700; color:#000; padding:20px; border-radius:24px; font-weight:900; animation: pulse 1.5s infinite;">🥇 Send & Get Medal!</button>
                </div>
            </div>
        `;

        const video = document.getElementById('webcam');
        const canvas = document.getElementById('hiddenCanvas');
        const preview = document.getElementById('photoPreview');
        const snapBtn = document.getElementById('snapBtn');
        const switchBtn = document.getElementById('switchBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const sendBtn = document.getElementById('sendBtn');

        const startStream = async () => {
            if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
            try {
                this.currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.currentFacingMode }, audio: false });
                video.srcObject = this.currentStream;
            } catch (err) { area.innerHTML = `<div style="padding:30px;">😢 Camera error.</div>`; }
        };

        snapBtn.onclick = () => {
            this.feedback('success');
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (this.currentFacingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            window.lastCapturedPhoto = dataUrl;
            preview.style.backgroundImage = `url(${dataUrl})`;
            preview.style.display = 'block';
            snapBtn.style.display = 'none'; switchBtn.style.display = 'none';
            retakeBtn.style.display = 'block'; sendBtn.style.display = 'block';
        };

        switchBtn.onclick = () => {
            this.currentFacingMode = (this.currentFacingMode === 'user') ? 'environment' : 'user';
            startStream();
        };

        retakeBtn.onclick = () => {
            preview.style.display = 'none'; snapBtn.style.display = 'block';
            switchBtn.style.display = 'block'; retakeBtn.style.display = 'none'; sendBtn.style.display = 'none';
        };

        sendBtn.onclick = () => {
            if (typeof FeelFlow !== 'undefined') FeelFlow.addXP(60); 
            this.showCelebration('gold');
            window.finishCheckIn();
        };

        startStream();
    },

    // 7. 공통 UI 유틸리티
    showCelebration(tier) {
        this.feedback('success');
        const burst = document.createElement('div');
        burst.className = 'xp-burst';
        burst.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:9999; text-align:center;";
        burst.innerHTML = tier === 'gold' ? 
            `<div style="font-size:5rem;">🥇</div><div style="font-weight:850; color:#FFD700; text-shadow:0 0 10px rgba(0,0,0,0.5);">GOLD MEDAL!<br>+60 XP</div>` : 
            `<div style="font-size:5rem;">🥈</div><div style="font-weight:850; color:#7c3aed;">SILVER!<br>+30 XP</div>`;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 2500);
    },

    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div id="lungCircle" style="width:120px; height:120px; margin:40px auto; background:rgba(124,58,237,0.2); border-radius:50%; border:5px solid #7c3aed; transition:4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:4rem;">🫁</div>
            <p id="breathStatus" style="text-align:center; font-weight:850; color:#7c3aed; font-size:1.8rem;">Ready...</p>
        `;
        const l = document.getElementById('lungCircle');
        const s = document.getElementById('breathStatus');
        const anim = () => {
            if (!l) return;
            this.feedback('tap'); s.textContent = "Inhale... 🌬️"; l.style.transform = "scale(2)";
            setTimeout(() => {
                if (!l) return;
                this.feedback('tick'); s.textContent = "Exhale... 💨"; l.style.transform = "scale(1)";
                setTimeout(anim, 4500);
            }, 4000);
        };
        setTimeout(anim, 1000);
    },

    startWriteAction(q) { 
        document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="width:calc(100% - 48px); margin:0 24px; height:180px; border-radius:20px; border:2px solid #e2e8f0; padding:15px;" placeholder="${q}"></textarea>`; 
    }
};

window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => Activities.feedback(t);
['click', 'touchstart'].forEach(e => window.addEventListener(e, () => Activities.initAudio(), { once: false }));