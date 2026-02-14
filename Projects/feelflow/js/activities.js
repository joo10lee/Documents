/**
 * Activities 관리 모듈: Ver.0213-3000 (The Ultimate Engine)
 * 모든 전략 복구 + 3-버튼 벤토 레이아웃 + XP 보상 시스템 통합
 */

let audioCtx = null;

const Activities = {
    currentStream: null,
    currentFacingMode: 'user', 
    currentInterval: null,

    // 1. 오디오/햅틱 엔진
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

    renderStrategies(emotion) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;
    
        // 💡 감정별 맞춤형 퀘스트 데이터 (Sad와 Anxious 구분)
        const fullStrategyMap = {
            'Anxious': [
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b' },
                { title: 'Deep Breathing', icon: '🌬️', tier: 'silver', xp: 30, color: '#fff' },
                { title: '5-4-3-2-1 Grounding', icon: '🖐️', tier: 'silver', xp: 30, color: '#fff' }
            ],
            'Sad': [
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b' },
                { title: 'Listen to music', icon: '🎵', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Big Hug', icon: '🫂', tier: 'silver', xp: 30, color: '#fff' }
            ],
            'Angry': [
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b' },
                { title: 'Push the Wall', icon: '🧱', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Squeeze & Release', icon: '✊', tier: 'silver', xp: 30, color: '#fff' }
            ],
            'default': [
                { title: 'Capture the moment', icon: '📸', tier: 'gold', xp: 60, color: '#1e293b' },
                { title: 'Deep Breathing', icon: '🌬️', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Write it down', icon: '✍️', tier: 'silver', xp: 30, color: '#fff' }
            ]
        };
    
        const quests = fullStrategyMap[emotion] || fullStrategyMap['default'];
        
        // 💡 클래스 강제 주입: 이 줄이 있어야 CSS 그리드가 작동합니다.
        container.className = `strategy-grid grid-${quests.length}`;
        
        container.innerHTML = quests.map((q, idx) => `
            <button class="bento-card ${q.tier}-tier ${idx === 0 ? 'hero-card' : ''}" 
                    onclick="Activities.setupActivity('${q.title}')" 
                    style="background:${q.color}; ${q.tier==='gold' ? 'color:white;' : ''}">
                <span class="quest-icon">${q.icon}</span>
                <div class="quest-info" style="text-align:left;">
                    <div class="quest-title" style="font-weight:850; font-size: ${idx === 0 ? '1.2rem' : '0.95rem'};">
                        ${q.title}
                    </div>
                    <div class="quest-reward" style="font-weight:700; font-size:0.8rem; color:${q.tier==='gold' ? '#FFD700' : '#7c3aed'}">
                        ${q.tier==='gold' ? '🥇 Gold' : '🥈 Silver'} (+${q.xp} XP)
                    </div>
                </div>
                ${idx === 0 ? '<div class="recommend-tag">RECOMMENDED</div>' : ''}
            </button>
        `).join('');
    },

    // 3. 활동 디스패처 (모든 함수 매핑)
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

    // 4. 세부 활동 함수 (XP 지급 로직 스티칭)

    // [GOLD] 사진 촬영
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
                    <button id="snapBtn" class="btn-primary" style="margin:0; width:100%; height:70px; font-size:1.2rem; background:#1e293b; border-radius:24px;">📸 Take Gold Photo</button>
                    <button id="switchBtn" style="background:rgba(255,255,255,0.9); border:none; padding:12px; border-radius:15px; font-weight:700;">🔄 Flip Camera</button>
                    <button id="retakeBtn" style="display:none; background:#475569; color:white; border:none; padding:18px; border-radius:24px;">🔄 Try Again</button>
                    <button id="sendBtn" style="display:none; background:#FFD700; color:#000; padding:20px; border-radius:24px; font-weight:900; animation: pulse 1.5s infinite;">🥇 Send & Get Gold Medal!</button>
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
            window.lastCapturedPhoto = canvas.toDataURL('image/png');
            preview.style.backgroundImage = `url(${window.lastCapturedPhoto})`; preview.style.display = 'block';
            snapBtn.style.display = 'none'; switchBtn.style.display = 'none';
            retakeBtn.style.display = 'block'; sendBtn.style.display = 'block';
        };

        switchBtn.onclick = () => { this.currentFacingMode = (this.currentFacingMode === 'user') ? 'environment' : 'user'; startStream(); };
        retakeBtn.onclick = () => { preview.style.display = 'none'; snapBtn.style.display = 'block'; switchBtn.style.display = 'block'; retakeBtn.style.display = 'none'; sendBtn.style.display = 'none'; };
        sendBtn.onclick = () => { this.completeAction('gold', 60); };

        startStream();
    },

    // [SILVER] 벽 밀기
    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div id="pContainer" style="text-align:center;"><div id="pCir" style="width:130px; height:130px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:3.5rem; font-weight:900; color:#ef4444;">10</div><p style="margin-top:20px; font-weight:800;">PUSH THE WALL HARD!</p></div>`;
        let t = 10;
        this.currentInterval = setInterval(() => {
            const cir = document.getElementById('pCir');
            if (!cir) return clearInterval(this.currentInterval);
            t--; cir.textContent = t; this.feedback('tick');
            // 예: 벽 밀기 미션 성공 시
                if (t <= 0) { 
                    clearInterval(this.currentInterval); 
                    cir.textContent = "💪"; 
                    const btn = document.getElementById('activityBtn');
                    if (btn) {
                        btn.style.display = 'block';
                        btn.textContent = "Finish & Get Silver 🥈";
                        // 💡 화살표 함수를 사용하여 this(Activities) 컨텍스트 유지
                        btn.onclick = () => this.completeAction('silver', 30);
                    }
                }
        }, 1000);
    },

    // [SILVER] 5-4-3-2-1 그라운딩
    startGroundingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const steps = [{n:5, s:'SEE 👀'}, {n:4, s:'TOUCH ✋'}, {n:3, s:'HEAR 👂'}, {n:2, s:'SMELL 👃'}, {n:1, s:'TASTE 👅'}];
        let idx = 0;
        const render = (i) => {
            const s = steps[i];
            area.innerHTML = `<div style="text-align:center;"><h2>${s.n} Things you ${s.s}</h2><button id="nextG" class="btn-primary">${i===4?'Finish':'Next'}</button></div>`;
            document.getElementById('nextG').onclick = () => {
                this.feedback('tap');
                if (i < 4) render(i + 1);
                else this.completeAction('silver', 30);
            };
        };
        render(0);
    },

    // [SILVER] 호흡 애니메이션
    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const btn = document.getElementById('activityBtn'); // 💡 버튼 참조 미리 확보
    
        // 1. UI 초기화: 버튼을 즉시 보이게 하고 텍스트 설정
        if (btn) {
            btn.style.display = 'block';
            btn.textContent = "Finish & Get Silver 🥈";
            // 💡 중요: 버튼 클릭 시 보상 시스템(completeAction)과 연결
            btn.onclick = () => {
                this.stopAll(); // 애니메이션 중단
                this.completeAction('silver', 30); // 보상 지급 및 종료
            };
        }
    
        area.innerHTML = `
            <div id="lungCircle" style="width:120px; height:120px; margin:40px auto; background:rgba(124,58,237,0.2); border-radius:50%; border:5px solid #7c3aed; transition:4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:4rem;">🫁</div>
            <p id="breathStatus" style="text-align:center; font-weight:850; color:#7c3aed; font-size:1.8rem;">Ready...</p>
        `;
    
        const l = document.getElementById('lungCircle'); 
        const s = document.getElementById('breathStatus');
    
        // 2. 애니메이션 엔진 (재귀 호출)
        const anim = () => {
            // 화면이 바뀌었거나 요소가 사라졌으면 중단
            if (!l || !document.getElementById('lungCircle')) return;
    
            this.feedback('tap'); 
            s.textContent = "Inhale... 🌬️"; 
            l.style.transform = "scale(2)";
    
            // 4초 후 날숨 단계
            this.currentInterval = setTimeout(() => {
                if (!l) return;
                this.feedback('tick'); 
                s.textContent = "Exhale... 💨"; 
                l.style.transform = "scale(1)";
    
                // 4.5초 후 다시 반복
                this.currentInterval = setTimeout(anim, 4500);
            }, 4000);
        };
    
        // 1초 대기 후 시작
        setTimeout(anim, 1000);
    },
    // [SILVER] Squeeze & Release
    startSqueezeAction() {
        const area = document.getElementById('inAppActionArea');
        let round = 1;
        const update = () => {
            area.innerHTML = `<div style="text-align:center;"><div style="font-size:8rem;">✊</div><h2>SQUEEZE! (Round ${round}/3)</h2></div>`;
            setTimeout(() => {
                area.innerHTML = `<div style="text-align:center;"><div style="font-size:8rem;">🖐️</div><h2>RELEASE...</h2></div>`;
                setTimeout(() => { if(round < 3) { round++; update(); } else this.completeAction('silver', 30); }, 3000);
            }, 3000);
        };
        update();
    },

    // [SILVER] SMS 보내기
    startSMSAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<textarea id="actionNote" style="width:100%; height:120px; border-radius:20px; padding:15px;">오늘 정말 기분 좋은 일이 있었어! ✨</textarea>`;
        document.getElementById('activityBtn').onclick = () => {
            window.location.href = `sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`;
            this.completeAction('silver', 30);
        };
    },

    // [보조] 기타 활동들
    startMusicAction() {
        document.getElementById('inAppActionArea').innerHTML = `<button class="btn-primary" style="background:#FF0000;" onclick="window.open('https://www.youtube.com/results?search_query=relaxing+music', '_blank')">📺 Open YouTube</button>`;
        document.getElementById('activityBtn').onclick = () => this.completeAction('silver', 30);
    },
    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="text-align:center;"><div style="font-size:6rem;">🫂</div><h2 id="hT">10</h2></div>`;
        let tl = 10;
        this.currentInterval = setInterval(() => {
            tl--; document.getElementById('hT').textContent = tl;
            if (tl <= 0) { clearInterval(this.currentInterval); this.completeAction('silver', 30); }
        }, 1000);
    },
    startJasonBreakQuest() {
        const q = ["🎸 기타 리프 연습하기", "🎤 노래 부르기", "🧘 스트레칭 하기"][Math.floor(Math.random()*3)];
        document.getElementById('inAppActionArea').innerHTML = `<div style="text-align:center; padding:20px; background:#eff6ff; border-radius:25px;"><h3>Quest: ${q}</h3></div>`;
        document.getElementById('activityBtn').onclick = () => this.completeAction('silver', 30);
    },
    startColdSqueezeAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style="font-size:6rem; text-align:center;">❄️</div><p style="text-align:center;">Hold something cold!</p>`;
        setTimeout(() => this.completeAction('silver', 30), 5000);
    },
    startWriteAction(q) { 
        document.getElementById('inAppActionArea').innerHTML = `<textarea id="actionNote" class="form-control" style="width:calc(100% - 48px); margin:0 24px; height:180px; border-radius:20px; padding:15px;" placeholder="${q}"></textarea>`; 
        document.getElementById('activityBtn').onclick = () => this.completeAction('silver', 30);
    },

    // 5. 공통 마무리 로직 (XP 지급 + 애니메이션 + 전송)
// activities.js 내 completeAction 수정
    completeAction(tier, xp) {
        console.log(`🎁 보상 지급: ${tier} 티어, ${xp} XP`);
        
        // 1. XP 지급 (전역 객체 확인)
        if (typeof FeelFlow !== 'undefined' && FeelFlow.addXP) {
            FeelFlow.addXP(xp);
        }

        // 2. 축하 애니메이션 실행
        this.showCelebration(tier, xp);

        // 3. 💡 핵심: 2초 후 전역 종료 함수 호출
        setTimeout(() => {
            if (typeof window.finishCheckIn === 'function') {
                window.finishCheckIn();
            } else {
                console.error("❌ finishCheckIn 함수를 찾을 수 없습니다.");
            }
        }, 2000);
    },

    showCelebration(tier, xp) {
        this.feedback('success');
        const burst = document.createElement('div');
        burst.className = 'xp-burst';
        burst.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:9999; text-align:center;";
        burst.innerHTML = `
            <div style="font-size:5rem;">${tier==='gold'?'🥇':'🥈'}</div>
            <div style="font-weight:850; color:${tier==='gold'?'#FFD700':'#7c3aed'}; text-shadow:0 0 10px rgba(0,0,0,0.5);">
                ${tier.toUpperCase()} MISSION!<br>+${xp} XP
            </div>`;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 2500);
    }
};

window.Activities = Activities;
window.renderStrategies = (e) => Activities.renderStrategies(e);
window.feedback = (t) => Activities.feedback(t);
['click', 'touchstart'].forEach(e => window.addEventListener(e, () => Activities.initAudio(), { once: false }));