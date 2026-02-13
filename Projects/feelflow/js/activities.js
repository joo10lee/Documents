/**
 * Activities 관리 모듈: 감정별 특수 활동 로직 및 사운드/햅틱 엔진
 */

// 전역 오디오 컨텍스트 관리
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

    // 2. [추가] 감정별 전략 카드 렌더링 (app.js에서 호출)
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

    // 3. 활동별 동적 UI 설정 (가시성 & 자동 스크롤 보강)
    // 3. 활동별 동적 UI 설정 (화면 전환 로직 추가)
    setupActivity(type) {
        console.log(`🏃 활동 시작: ${type}`);
        this.initAudio();
        if (window.feedback) window.feedback('tap');

        // 💡 1단계: 먼저 '활동 화면'으로 이동합니다.
        if (typeof UI !== 'undefined' && UI.goToScreen) {
            UI.goToScreen('Activity', type);
        }

        const actionArea = document.getElementById('inAppActionArea');
        const actionQuestion = document.getElementById('actionQuestion');
        const actionNote = document.getElementById('actionNote');
        const cameraBtn = document.getElementById('cameraBtn');
        const activityIcon = document.getElementById('activityIcon');
        const activityTitle = document.getElementById('activityTitle');

        if (!actionArea) return;

        // 💡 2단계: 화면 상단의 아이콘과 제목을 활동에 맞게 업데이트
        actionArea.style.display = 'block';
        if (activityTitle) activityTitle.textContent = type;
        
        // 아이콘 매칭 (선택사항)
        const iconMap = { 'Write it down': '✍️', 'Capture the moment': '📸', 'Listen to music': '🎵' };
        if (activityIcon && iconMap[type]) activityIcon.textContent = iconMap[type];

        // 3단계: 입력 요소 초기화
        if (actionNote) {
            actionNote.style.display = 'none';
            actionNote.value = ''; 
        }
        if (cameraBtn) cameraBtn.style.display = 'none';

        // 4단계: 활동별 맞춤 UI 활성화
        switch(type) {
            case 'Write it down':
                if (actionQuestion) actionQuestion.textContent = "✍️ What made you happy?";
                if (actionNote) actionNote.style.display = 'block';
                break;
            case 'Capture the moment':
                if (actionQuestion) actionQuestion.textContent = "📸 Capture this happy moment!";
                if (cameraBtn) cameraBtn.style.display = 'block';
                break;
            // ... 나머지 케이스는 기존과 동일
        }
    },

    // 4. 문자 메시지(SMS) 전송 설정
    // js/activities.js 내 추가/수정
setupSMSAction(type) {
    const actionArea = document.getElementById('inAppActionArea');
    const actionQuestion = document.getElementById('actionQuestion');
    const actionNote = document.getElementById('actionNote');
    
    if (!actionArea) return;

    actionArea.style.display = 'block';
    if (actionQuestion) actionQuestion.textContent = "💌 누구에게 이 기쁨을 전할까요?";
    if (actionNote) {
        actionNote.placeholder = "가족이나 친구에게 보낼 메시지를 적어보세요...";
        actionNote.value = "오늘 정말 기분 좋은 일이 있었어! 함께 나누고 싶어 ✨"; 
    }

    // 💡 저장 버튼(Save & Finish) 대신 SMS 전송 버튼으로 역할을 바꿉니다.
    const activityBtn = document.getElementById('activityBtn');
    if (activityBtn) {
        activityBtn.textContent = "Send via SMS 💌";
        activityBtn.onclick = () => {
            const msg = actionNote.value;
            // 아이폰 iMessage를 즉시 깨우는 마법의 주소
            window.location.href = `sms:&body=${encodeURIComponent(msg)}`;
            
            // 전송 시도 후 1초 뒤에 체크인 마무리 함수 실행
            setTimeout(() => finishCheckIn(), 1000); 
        };
    }
},
    // 5. 유튜브 음악 연결
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

    // 6. 차가운 것 쥐기 애니메이션
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

    // --- 사운드 엔진 메서드 ---
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
 * 글로벌 헬퍼 함수 및 브릿지
 * 💡 핵심: Activities 객체와 함수들을 window(전역)에 명시적으로 등록해야 합니다.
 */

// 1. Activities 객체 자체를 전역에 노출 (이게 없으면 카드 클릭 시 ReferenceError 발생)
window.Activities = Activities;

// 2. 피드백 함수 (소리 및 진동)
window.feedback = function(type = 'tap') {
    if (type === 'tap') {
        Activities.playTapSound();
        if ("vibrate" in navigator) navigator.vibrate(10);
    } else if (type === 'success') {
        Activities.playTimerEndSound();
        if ("vibrate" in navigator) navigator.vibrate([30, 50, 30]);
    }
};

// 3. 전략 렌더링 함수 브릿지
window.renderStrategies = function(emotion) {
    Activities.renderStrategies(emotion);
};

// 4. 타이머 사운드 브릿지
window.playTickSound = function() {
    Activities.playTickSound();
};

window.playStartSound = function() {
    Activities.playTapSound();
};

// 5. 오디오 엔진 잠금 해제 (iOS/Safari 필수 대응)
window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });
window.addEventListener('click', () => Activities.initAudio(), { once: true });