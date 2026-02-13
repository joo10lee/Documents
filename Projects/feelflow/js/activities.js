/**
 * Activities 관리 모듈: 감정별 특수 활동 로직 및 사운드/햅틱 엔진
 */

// 전역 오디오 컨텍스트 관리 (엔진 잠금 해제용)
let audioCtx = null;

const Activities = {
    // 1. 오디오 엔진 초기화 및 잠금 해제
    initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    },

    // 2. 활동별 동적 UI 설정
    setupActivity(type) {
        console.log(`🏃 활동 시작: ${type}`);
        this.initAudio(); // 활동 시작 시 오디오 엔진 체크
        
        const actionArea = document.getElementById('inAppActionArea');
        const actionQuestion = document.getElementById('actionQuestion');
        const actionNote = document.getElementById('actionNote');
        const cameraBtn = document.getElementById('cameraBtn');

        if (!actionArea) return;
        actionArea.style.display = 'block';
        
        if (window.EmotionActions) window.EmotionActions.reset();

        switch(type) {
            case 'Write it down':
                actionQuestion.textContent = "✍️ What made you happy?";
                if (actionNote) actionNote.style.display = 'block';
                if (cameraBtn) cameraBtn.style.display = 'none';
                break;
            case 'Capture the moment':
                actionQuestion.textContent = "📸 Capture this happy moment!";
                if (actionNote) actionNote.style.display = 'none';
                if (cameraBtn) cameraBtn.style.display = 'block';
                break;
            case 'Share the joy':
            case 'Talk to someone':
                this.setupSMSAction(type);
                break;
            case 'Listen to music':
                this.setupMusicAction();
                break;
            case 'Hold Something Cold':
                this.startColdSqueezeAnimation();
                break;
        }
    },

    // 3. 문자 메시지(SMS) 전송
    setupSMSAction(type) {
        const question = type === 'Share the joy' ? "🎉 Who do you want to share this with?" : "💬 Who would you like to talk to?";
        document.getElementById('actionQuestion').textContent = question;
        
        let smsBtn = document.getElementById('smsActionBtn');
        if (!smsBtn) {
            smsBtn = document.createElement('button');
            smsBtn.id = 'smsActionBtn';
            smsBtn.className = 'btn-primary';
            smsBtn.style.width = '100%';
            smsBtn.style.marginTop = '10px';
            document.getElementById('inAppActionArea').appendChild(smsBtn);
        }
        
        smsBtn.style.display = 'block';
        smsBtn.textContent = type === 'Share the joy' ? "💬 Send Happy News" : "📞 Request a Chat";
        
        const message = type === 'Share the joy' ? "I'm feeling so happy right now! ✨" : "I'm feeling a bit sad. Can we talk? 🥺";
        smsBtn.onclick = () => { 
            this.initAudio();
            window.location.href = `sms:?body=${encodeURIComponent(message)}`; 
        };
    },

    // 4. 유튜브 음악 연결
    setupMusicAction() {
        document.getElementById('actionQuestion').textContent = "🎵 Let's listen to some calming music.";
        const musicUrl = "http://www.youtube.com/watch?v=1ZYbU82GVz4"; 
        
        let musicBtn = document.getElementById('musicActionBtn');
        if (!musicBtn) {
            musicBtn = document.createElement('button');
            musicBtn.id = 'musicActionBtn';
            musicBtn.className = 'btn-primary';
            musicBtn.style.background = '#FF0000';
            musicBtn.style.width = '100%';
            document.getElementById('inAppActionArea').appendChild(musicBtn);
        }
        musicBtn.style.display = 'block';
        musicBtn.textContent = "📺 Open YouTube";
        musicBtn.onclick = () => { 
            this.initAudio();
            window.open(musicUrl, '_blank'); 
        };
    },

    // 5. 차가운 것 쥐기 애니메이션
    startColdSqueezeAnimation() {
        const question = document.getElementById('actionQuestion');
        question.textContent = "❄️ Hold something cold and follow the steps.";
        let step = 1;
        const totalSteps = 5;
        
        const area = document.getElementById('inAppActionArea');
        let animBox = document.getElementById('animBox');
        if (!animBox) {
            animBox = document.createElement('div');
            animBox.id = 'animBox';
            animBox.style.padding = '20px';
            animBox.style.fontSize = '3rem';
            animBox.style.textAlign = 'center';
            area.appendChild(animBox);
        }
        
        const updateStep = () => {
            animBox.textContent = "❄️".repeat(step);
            question.textContent = `Step ${step}: Feel the coldness... (${step}/${totalSteps})`;
            if (step < totalSteps) {
                step++;
                setTimeout(updateStep, 2000);
            } else {
                question.textContent = "✅ Well done. Do you feel a bit calmer?";
            }
        };
        updateStep();
    },

    // --- 사운드 엔진 (객체 내부 메서드) ---
    playTapSound() {
        try {
            this.initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) { console.log("Sound error:", e); }
    },

    playTimerEndSound() {
        try {
            this.initAudio();
            [660, 880].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
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
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } catch (e) {}
    }
};

/**
 * 글로벌 헬퍼 함수: 전역(window)에서 즉시 호출 가능하도록 설정
 */
window.feedback = function(type = 'tap') {
    if (type === 'tap') {
        Activities.playTapSound();
        if ("vibrate" in navigator) navigator.vibrate(10);
    } else if (type === 'success') {
        Activities.playTimerEndSound();
        if ("vibrate" in navigator) navigator.vibrate([30, 50, 30]);
    }
};

window.playTickSound = function() {
    Activities.playTickSound();
};

window.playStartSound = function() {
    Activities.playTapSound();
};

// 화면 어디든 터치하면 오디오 엔진 잠금 해제 시도
window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });
window.addEventListener('click', () => Activities.initAudio(), { once: true });