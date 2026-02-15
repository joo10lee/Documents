/**
 * Activities Module: Ver.0215-ULTIMATE-408
 * [최종 통합] 6대 감정 완벽 매핑 + 강도별 지능형 분기 + 12종 퀘스트 상세 구현
 */

let audioCtx = null;

const Activities = {
    currentStream: null,
    currentFacingMode: 'user', 
    currentInterval: null,
    activeTimeouts: [],

    // 1. 오디오/햅틱 엔진 (브라우저 정책 대응)
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
        if (typeof safeVibrate === 'function') safeVibrate(cfg.vib);
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

    // 2. 활동 정리 (메모리 누수 방지)
    stopAll() {
        if (this.currentInterval) clearInterval(this.currentInterval);
        this.activeTimeouts.forEach(clearTimeout);
        this.activeTimeouts = [];
        this.currentInterval = null;
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        if (navigator.vibrate) navigator.vibrate(0);
    },

    // 3. 🧠 [Master] 지능형 전략 렌더러 (감정 매핑 & 강도 분기)
    renderStrategies(emotionName, intensity) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;
    
        const name = emotionName ? emotionName.toString().trim().toLowerCase() : "";
        const level = parseInt(intensity) || 5;
        console.log(`🧠 [STRATEGY] Processing: ${name} (Level ${level})`);

        let quests = [];

        // 💡 기쁨(Happy) - 강도별 정밀 분기 복구
        if (name.includes('happy') || name.includes('😊')) {
            if (level <= 2) {
                quests = [
                    { title: 'Happy Note', icon: '🌱', tier: 'gold', xp: 60, color: '#1e293b', tag: 'SMALL JOY' },
                    { title: 'Share the joy', icon: '✨', tier: 'silver', xp: 30, color: '#fff' }
                ];
            } else {
                quests = [
                    { title: 'Happy Note', icon: '✍️', tier: 'gold', xp: 60, color: '#1e293b', tag: 'WRITE' },
                    { title: 'Capture the moment', icon: '📸', tier: 'silver', xp: 30, color: '#fff' }
                ];
            }
        } 
        // 💡 슬픔(Sad) - 정상 매핑 복구
        else if (name.includes('sad') || name.includes('😢')) {
            quests = [
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b', tag: 'GOLD' },
                { title: 'Listen to music', icon: '🎵', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Big Hug', icon: '🫂', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        // 💡 불안(Anxious)
        else if (name.includes('anxious') || name.includes('😰')) {
            quests = [
                { title: 'Deep Breathing', icon: '🌬️', tier: 'gold', xp: 60, color: '#1e293b', tag: 'CALM' },
                { title: '5-4-3-2-1 Grounding', icon: '🖐️', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        // 💡 분노(Angry)
        else if (name.includes('angry') || name.includes('😠')) {
            quests = [
                { title: 'Push the Wall', icon: '🧱', tier: 'gold', xp: 60, color: '#1e293b', tag: 'POWER' },
                { title: 'Squeeze & Release', icon: '✊', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Deep Breathing', icon: '🌬️', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        // 💡 차분함(Calm)
        else if (name.includes('calm') || name.includes('😌')) {
            quests = [
                { title: 'Meditation', icon: '🧘', tier: 'gold', xp: 60, color: '#1e293b', tag: 'ZEN' },
                { title: 'Listen to music', icon: '🎵', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        // 💡 피곤함(Tired)
        else if (name.includes('tired') || name.includes('😫')) {
            quests = [
                { title: 'Power Nap', icon: '🛌', tier: 'gold', xp: 60, color: '#1e293b', tag: 'REST' },
                { title: 'Hold Something Cold', icon: '❄️', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        // 기본값
        else {
            quests = [
                { title: 'Deep Breathing', icon: '🌬️', tier: 'gold', xp: 60, color: '#1e293b', tag: 'BREATHE' },
                { title: 'Write it down', icon: '✍️', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }

        // 3-버튼 벤토 레이아웃 렌더링
        container.className = `strategy-grid grid-${quests.length}`;
        container.innerHTML = `
            <h3 class="section-title" style="margin-top:25px;">Recommended for you</h3>
            ${quests.map((q, idx) => `
                <button class="bento-card ${q.tier}-tier ${idx === 0 ? 'hero-card' : ''}" 
                        onclick="Activities.setupActivity('${q.title}')" 
                        style="background:${q.color}; ${q.tier==='gold' ? 'color:white;' : ''}">
                    <span class="quest-icon">${q.icon}</span>
                    <div class="quest-info" style="text-align:left;">
                        <div class="quest-title" style="font-weight:850; font-size: ${idx === 0 ? '1.2rem' : '0.95rem'};">${q.title}</div>
                        <div class="quest-reward" style="font-weight:700; font-size:0.8rem; color:${q.tier==='gold' ? '#FFD700' : '#7c3aed'}">
                            ${q.tier==='gold' ? '🥇 Gold' : '🥈 Silver'} (+${q.xp} XP)
                        </div>
                    </div>
                    ${q.tag ? `<div class="recommend-tag">${q.tag}</div>` : ''}
                </button>
            `).join('')}`;
    },

    // 4. 활동 디스패처 (실제 퀘스트 매핑)
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
            if (btn) btn.style.display = 'block';

            switch(type) {
                case 'Capture the moment': this.startCaptureAction(); break;
                case 'Deep Breathing': this.startBreathingAnimation(); break;
                case '5-4-3-2-1 Grounding': this.startGroundingAnimation(); break;
                case 'Push the Wall': this.startPushWallAction(); break;
                case 'Squeeze & Release': this.startSqueezeAction(); break;
                case 'Big Hug': this.startBigHugTimer(); break;
                case 'Listen to music': this.startMusicAction(); break;
                case 'Meditation': case 'Power Nap': this.startRestAction(type); break;
                case 'Hold Something Cold': this.startColdSqueezeAnimation(); break;
                case 'Share the joy': this.startSMSAction(); break;
                default: this.startWriteAction(type);
            }
        }, 100);
    },

    // 5. 세부 활동 상세 구현 (총 408줄 분량)
    startCaptureAction() {
        const area = document.getElementById('inAppActionArea');
        document.getElementById('activityBtn').style.display = 'none';
        area.innerHTML = `
            <div id="cameraModule" style="text-align:center;">
                <div id="videoContainer" style="position:relative; width:92%; margin:0 auto; aspect-ratio:3/4; background:#000; border-radius:32px; overflow:hidden;">
                    <video id="webcam" autoplay playsinline style="width:100%; height:100%; object-fit:cover; transform: ${this.currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'};"></video>
                    <div id="photoPreview" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background-size:cover; background-position:center; z-index:10;"></div>
                </div>
                <div style="margin-top:20px; display:flex; flex-direction:column; gap:12px; padding:0 24px;">
                    <button id="snapBtn" class="btn-primary" style="margin:0; height:65px;">📸 Take Photo</button>
                    <button id="switchBtn" class="btn-secondary" style="background:white; border:none; padding:12px; border-radius:15px; font-weight:700;">🔄 Flip Camera</button>
                    <button id="retakeBtn" style="display:none; background:#475569; color:white; border:none; padding:18px; border-radius:24px;">🔄 Try Again</button>
                    <button id="sendBtn" style="display:none; background:#FFD700; color:#000; padding:20px; border-radius:24px; font-weight:900; animation: pulse 1.5s infinite;">🥇 Get Gold Medal!</button>
                </div>
                <canvas id="hiddenCanvas" style="display:none;"></canvas>
            </div>`;

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
                this.currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.currentFacingMode } });
                video.srcObject = this.currentStream;
            } catch (err) { alert("Camera error"); }
        };

        snapBtn.onclick = () => {
            this.feedback('success');
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (this.currentFacingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
            ctx.drawImage(video, 0, 0);
            window.lastCapturedPhoto = canvas.toDataURL('image/png');
            preview.style.backgroundImage = `url(${window.lastCapturedPhoto})`; preview.style.display = 'block';
            snapBtn.style.display = 'none'; switchBtn.style.display = 'none';
            retakeBtn.style.display = 'block'; sendBtn.style.display = 'block';
        };

        retakeBtn.onclick = () => { preview.style.display = 'none'; snapBtn.style.display = 'block'; switchBtn.style.display = 'block'; retakeBtn.style.display = 'none'; sendBtn.style.display = 'none'; };
        switchBtn.onclick = () => { this.currentFacingMode = (this.currentFacingMode === 'user' ? 'environment' : 'user'); startStream(); };
        sendBtn.onclick = () => this.completeAction('gold', 60);
        startStream();
    },

    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:40px 24px; text-align:center;">
                <div id="lungCircle" style="width:140px; height:140px; margin:0 auto; background:rgba(124,58,237,0.15); border-radius:50%; border:6px solid #7c3aed; transition:all 4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:4.5rem;">🫁</div>
                <h2 id="breathStatus" style="margin-top:40px; font-weight:850; color:#7c3aed; font-size:2.2rem;">Ready...</h2>
            </div>`;
        const l = document.getElementById('lungCircle'); 
        const s = document.getElementById('breathStatus');
        const anim = () => {
            if (!l || !document.getElementById('lungCircle')) return;
            this.feedback('tap'); s.textContent = "Inhale... 🌬️"; l.style.transform = "scale(2.2)";
            this.currentInterval = setTimeout(() => {
                if (!l) return;
                this.feedback('tick'); s.textContent = "Exhale... 💨"; l.style.transform = "scale(1)";
                this.activeTimeouts.push(setTimeout(anim, 4500));
            }, 4000);
        };
        setTimeout(anim, 1000);
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "I'm Calm Now 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
    },

    startGroundingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const steps = [
            {n:5, s:'SEE 👀', c:'#3b82f6'}, {n:4, s:'TOUCH ✋', c:'#10b981'},
            {n:3, s:'HEAR 👂', c:'#f59e0b'}, {n:2, s:'SMELL 👃', c:'#8b5cf6'}, {n:1, s:'TASTE 👅', c:'#ef4444'}
        ];
        let idx = 0;
        const render = (i) => {
            const s = steps[i];
            area.innerHTML = `
                <div style="text-align:center; padding:40px 24px;">
                    <div style="font-size:5rem; font-weight:900; color:${s.c}; margin-bottom:20px;">${s.n}</div>
                    <h2 style="font-weight:850; color:#1e293b;">Things you ${s.s}</h2>
                    <button id="nextG" class="btn-primary" style="margin-top:40px; background:${s.c}; border:none;">${i===4?'Finish Mission':'Next Step'}</button>
                </div>`;
            document.getElementById('nextG').onclick = () => {
                this.feedback('tap');
                if (i < 4) render(i + 1);
                else this.completeAction('silver', 30);
            };
        };
        render(0);
    },

    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="text-align:center; padding:40px 24px;">
                <div id="pCir" style="width:140px; height:140px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:4rem; font-weight:900; color:#ef4444; background:rgba(239,68,68,0.05);">10</div>
                <h2 style="margin-top:30px; font-weight:850;">PUSH THE WALL!</h2>
            </div>`;
        let t = 10;
        this.currentInterval = setInterval(() => {
            const cir = document.getElementById('pCir');
            if (!cir) return clearInterval(this.currentInterval);
            t--; cir.textContent = t; this.feedback('tick');
            if (t <= 0) { 
                clearInterval(this.currentInterval); 
                cir.textContent = "💪"; cir.style.borderColor = "#10b981"; cir.style.color = "#10b981";
                const btn = document.getElementById('activityBtn');
                if (btn) { btn.textContent = "Done! 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
            }
        }, 1000);
    },

    startSqueezeAction() {
        const area = document.getElementById('inAppActionArea');
        let r = 1;
        const update = () => {
            area.innerHTML = `<div style="text-align:center; padding:40px;"><div style="font-size:8rem;">✊</div><h2 style="font-weight:850;">SQUEEZE! (${r}/3)</h2></div>`;
            this.activeTimeouts.push(setTimeout(() => {
                area.innerHTML = `<div style="text-align:center; padding:40px;"><div style="font-size:8rem;">🖐️</div><h2 style="font-weight:850;">RELEASE...</h2></div>`;
                this.activeTimeouts.push(setTimeout(() => { if(r<3){ r++; update(); } else this.completeAction('silver', 30); }, 3000));
            }, 3000));
        };
        update();
    },

    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center; padding:60px 24px;"><div style="font-size:7rem; margin-bottom:20px;">🫂</div><h2 id="hT" style="font-size:4rem; font-weight:900; color:#7c3aed;">10</h2><p style="font-weight:850;">Hold a BIG hug!</p></div>`;
        let tl = 10;
        this.currentInterval = setInterval(() => {
            tl--; const el = document.getElementById('hT');
            if (!el) return clearInterval(this.currentInterval);
            el.textContent = tl; this.feedback('tick');
            if (tl <= 0) { clearInterval(this.currentInterval); this.completeAction('silver', 30); }
        }, 1000);
    },

    startRestAction(t) {
        const area = document.getElementById('inAppActionArea');
        const icon = t.includes('Meditation') ? '🧘' : '🛌';
        area.innerHTML = `<div style="text-align:center; padding:60px 24px;"><div style="font-size:7rem; margin-bottom:30px; animation:pulse 2s infinite;">${icon}</div><h2 style="font-weight:850;">${t}</h2></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Finished! 🏅"; btn.onclick = () => this.completeAction(t.includes('Nap')?'gold':'silver', t.includes('Nap')?60:30); }
    },

    startSMSAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="padding:24px;"><h2 style="font-weight:850; margin-bottom:15px;">Share Joy</h2><textarea id="actionNote" style="width:100%; height:120px; border-radius:20px; padding:15px; border:2px solid #e2e8f0;">I'm feeling good today! ✨</textarea></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Send SMS 🥈"; btn.onclick = () => { window.location.href=`sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`; this.completeAction('silver', 30); }; }
    },

    startWriteAction(type) {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="padding:24px;"><h2 style="font-weight:850; margin-bottom:15px;">${type}</h2><textarea id="actionNote" style="width:100%; height:180px; border-radius:24px; padding:20px; border:3px solid #e2e8f0; font-size:1.1rem;" placeholder="What's on your mind?"></textarea></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Save! 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
    },

    startMusicAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center; padding:40px;"><div style="font-size:6rem; margin-bottom:20px;">🎵</div><button class="btn-primary" style="background:#FF0000;" onclick="window.open('https://www.youtube.com/results?search_query=relaxing+music', '_blank')">📺 Open YouTube</button></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Finished! 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
    },

    startColdSqueezeAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center; padding:60px 24px;"><div style="font-size:7rem; animation:pulse 2s infinite;">❄️</div><h2 style="font-weight:850; margin-top:20px;">Hold Something Cold</h2></div>`;
        this.activeTimeouts.push(setTimeout(() => this.completeAction('silver', 30), 8000));
    },

    // 6. 보상 시퀀스
    completeAction(tier, xp) {
        if (typeof FeelFlow !== 'undefined' && FeelFlow.addXP) FeelFlow.addXP(xp, tier);
        this.showCelebration(tier, xp);
        setTimeout(() => { if (typeof window.finishCheckIn === 'function') window.finishCheckIn(); }, 2200);
    },

    showCelebration(tier, xp) {
        this.feedback('success');
        const burst = document.createElement('div');
        burst.className = 'xp-burst';
        burst.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:9999; text-align:center;";
        burst.innerHTML = `<div style="font-size:6rem;">${tier==='gold'?'🥇':'🥈'}</div><div style="font-weight:900; font-size:2rem; color:${tier==='gold'?'#FFD700':'#7c3aed'};">${tier.toUpperCase()}!<br>+${xp} XP</div>`;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 2500);
    }
};

/**
 * 💓 Safe Vibrate Wrapper
 */
function safeVibrate(pattern) {
    if (!navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (e) {}
}

window.Activities = Activities;
window.renderStrategies = (n, i) => Activities.renderStrategies(n, i);
window.feedback = (t) => Activities.feedback(t);
['click', 'touchstart'].forEach(e => window.addEventListener(e, () => Activities.initAudio(), { once: false }));