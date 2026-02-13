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

    // 2. 감정별 전략 카드 렌더링
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

    // 3. [수정] 활동별 동적 UI 설정 (지연 실행 및 버튼 리셋 로직 추가)
    setupActivity(type) {
        console.log(`🏃 활동 시작: ${type}`);
        this.initAudio();
        if (window.feedback) window.feedback('tap');

        // 1단계: 먼저 활동 화면으로 즉시 이동
        if (typeof UI !== 'undefined' && UI.goToScreen) {
            UI.goToScreen('Activity', type);
        }

        // 💡 2단계: 화면이 완전히 그려진 후 요소를 조작하기 위해 미세한 지연(100ms)을 줍니다.
        setTimeout(() => {
            const actionArea = document.getElementById('inAppActionArea');
            const actionQuestion = document.getElementById('actionQuestion');
            const actionNote = document.getElementById('actionNote');
            const cameraBtn = document.getElementById('cameraBtn');
            const activityIcon = document.getElementById('activityIcon');
            const activityTitle = document.getElementById('activityTitle');
            const activityBtn = document.getElementById('activityBtn'); // 하단 공통 버튼

            if (!actionArea) return;

            // UI 공통 초기화
            actionArea.style.display = 'block';
            if (activityTitle) activityTitle.textContent = type;
            if (actionNote) {
                actionNote.style.display = 'none';
                actionNote.value = '';
                actionNote.placeholder = "내용을 입력하세요...";
            }
            if (cameraBtn) cameraBtn.style.display = 'none';

            // 💡 3단계: 버튼 이벤트 리셋 (이전 활동의 영향 제거)
            if (activityBtn) {
                activityBtn.textContent = "Save & Finish";
                activityBtn.onclick = () => {
                    if (typeof window.finishCheckIn === 'function') window.finishCheckIn();
                };
            }
            
            // 아이콘 매칭
            const iconMap = { 
                'Write it down': '✍️', 
                'Capture the moment': '📸', 
                'Share the joy': '🎉',
                'Listen to music': '🎵',
                'Hold Something Cold': '❄️'
            };
            if (activityIcon && iconMap[type]) activityIcon.textContent = iconMap[type];

            // 4단계: 활동별 구체적 UI 설정
            switch(type) {
                case 'Write it down':
                    if (actionQuestion) actionQuestion.textContent = "✍️ What made you happy?";
                    if (actionNote) actionNote.style.display = 'block';
                    break;

                case 'Capture the moment':
                    if (actionQuestion) actionQuestion.textContent = "📸 Capture this happy moment!";
                    if (cameraBtn) cameraBtn.style.display = 'block';
                    break;

                case 'Share the joy':
                    // 💡 SMS 전용 로직 호출
                    this.setupSMSAction();
                    break;

                case 'Listen to music':
                    this.setupMusicAction();
                    break;

                case 'Hold Something Cold':
                    this.startColdSqueezeAnimation();
                    break;

                default:
                    if (actionQuestion) actionQuestion.textContent = `Let's try ${type}!`;
                    if (actionNote) actionNote.style.display = 'block';
                    break;
            }
        }, 100); // 100ms 지연으로 DOM 안정성 확보
    },

    // 4. [수정] 문자 메시지(SMS) 전용 UI 및 버튼 설정
    setupSMSAction() {
        const actionQuestion = document.getElementById('actionQuestion');
        const actionNote = document.getElementById('actionNote');
        const activityBtn = document.getElementById('activityBtn');
        
        if (actionQuestion) actionQuestion.textContent = "💌 누구에게 이 기쁨을 전할까요?";
        
        if (actionNote) {
            actionNote.style.display = 'block';
            actionNote.value = `오늘 기분이 정말 좋아! 이 기쁨을 나누고 싶어서 메시지 보내. ✨`;
        }

        // 💡 하단 버튼을 SMS 전송용으로 교체 및 이벤트 바인딩
        if (activityBtn) {
            activityBtn.textContent = "Send via SMS 💌";
            activityBtn.onclick = (e) => {
                e.preventDefault(); // 기본 동작 방지
                const msg = actionNote ? actionNote.value : "오늘 정말 기분 좋은 일이 있었어! 함께 나누고 싶어 ✨";
                
                // 아이폰/안드로이드 SMS 앱 호출
                window.location.href = `sms:?&body=${encodeURIComponent(msg)}`;
                
                // 전송 시도 후 1.5초 뒤 저장 및 성공 화면 이동
                setTimeout(() => {
                    if (typeof window.finishCheckIn === 'function') window.finishCheckIn();
                }, 1500);
            };
        }
    },

    // 5. 유튜브 음악 연결
    setupMusicAction() {
        if (document.getElementById('actionQuestion')) {
            document.getElementById('actionQuestion').textContent = "🎵 Let's listen to some calming music.";
        }
        const musicUrl = "https://www.youtube.com/watch?v=1ZYbU82GVz4"; 
        
        let musicBtn = document.getElementById('musicActionBtn');
        if (!musicBtn) {
            musicBtn = document.createElement('button');
            musicBtn.id = 'musicActionBtn';
            musicBtn.className = 'btn btn-primary';
            musicBtn.style.background = '#FF0000';
            musicBtn.style.width = '100%';
            musicBtn.style.marginTop = '20px';
            document.getElementById('inAppActionArea').appendChild(musicBtn);
        }
        musicBtn.style.display = 'block';
        musicBtn.textContent = "📺 Open YouTube";
        musicBtn.onclick = () => { 
            this.initAudio();
            window.open(musicUrl, '_blank'); 
        };
    },

    // 6. 차가운 것 쥐기 애니메이션 (기존 로직 유지)
    startColdSqueezeAnimation() {
        const question = document.getElementById('actionQuestion');
        const area = document.getElementById('inAppActionArea');
        
        let step = 1;
        const totalSteps = 5;
        
        let animBox = document.getElementById('animBox');
        if (!animBox) {
            animBox = document.createElement('div');
            animBox.id = 'animBox';
            animBox.style.padding = '30px';
            animBox.style.fontSize = '4rem';
            animBox.style.textAlign = 'center';
            area.appendChild(animBox);
        }
        animBox.style.display = 'block';
        
        const updateStep = () => {
            animBox.textContent = "❄️".repeat(step);
            if (question) question.textContent = `Step ${step}: Feel the coldness... (${step}/${totalSteps})`;
            if (step < totalSteps) {
                step++;
                setTimeout(updateStep, 2000);
            } else {
                if (question) question.textContent = "✅ Well done. Do you feel a bit calmer?";
            }
        };
        updateStep();
    },

    // --- 사운드 엔진 (생략 가능하나 유지함) ---
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

// --- 글로벌 브릿지 등록 ---
window.Activities = Activities;

window.feedback = function(type = 'tap') {
    if (type === 'tap') {
        Activities.playTapSound();
        if ("vibrate" in navigator) navigator.vibrate(10);
    } else if (type === 'success') {
        Activities.playTimerEndSound();
        if ("vibrate" in navigator) navigator.vibrate([30, 50, 30]);
    }
};

window.renderStrategies = function(emotion) {
    Activities.renderStrategies(emotion);
};

window.playTickSound = function() { Activities.playTickSound(); };
window.playStartSound = function() { Activities.playTapSound(); };

// iOS/Safari 필수 대응
window.addEventListener('touchstart', () => Activities.initAudio(), { once: true });