/**
 * Activities 관리 모듈: 감정별 특수 활동 로직 (Happy/Sad/Anxious)
 */

const Activities = {
    // 1. 활동별 동적 UI 설정
    setupActivity(type) {
        console.log(`🏃 활동 시작: ${type}`);
        
        // 공통 영역 초기화
        const actionArea = document.getElementById('inAppActionArea');
        const actionQuestion = document.getElementById('actionQuestion');
        const actionNote = document.getElementById('actionNote');
        const musicContainer = document.getElementById('musicContainer'); // 추가 필요
        const cameraBtn = document.getElementById('cameraBtn');

        if (!actionArea) return;
        actionArea.style.display = 'block';
        
        // 이전 상태 리셋
        if (window.EmotionActions) window.EmotionActions.reset();

        // 감정 및 활동별 분기 처리
        switch(type) {
            case 'Write it down':
                actionQuestion.textContent = "✍️ What made you happy?";
                actionNote.style.display = 'block';
                cameraBtn.style.display = 'none';
                break;

            case 'Capture the moment':
                actionQuestion.textContent = "📸 Capture this happy moment!";
                actionNote.style.display = 'none';
                cameraBtn.style.display = 'block';
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

    // 2. 문자 메시지(SMS) 전송 설정
    setupSMSAction(type) {
        const question = type === 'Share the joy' ? "🎉 Who do you want to share this with?" : "💬 Who would you like to talk to?";
        document.getElementById('actionQuestion').textContent = question;
        
        // SMS 버튼 생성 또는 표시
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
        smsBtn.onclick = () => { window.location.href = `sms:?body=${encodeURIComponent(message)}`; };
    },

    // 3. 유튜브 음악 링크 연결
    setupMusicAction() {
        document.getElementById('actionQuestion').textContent = "🎵 Let's listen to some calming music.";
        const musicUrl = "http://www.youtube.com/watch?v=1ZYbU82GVz4"; //
        
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
        musicBtn.onclick = () => { window.open(musicUrl, '_blank'); };
    },

    // 4. Anxious: 차가운 것 쥐기 애니메이션 (1-5단계)
    startColdSqueezeAnimation() {
        const question = document.getElementById('actionQuestion');
        question.textContent = "❄️ Hold something cold and follow the steps.";
        
        let step = 1;
        const totalSteps = 5;
        
        // 애니메이션 UI 생성
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
                setTimeout(updateStep, 2000); // 2초마다 단계 상승
            } else {
                question.textContent = "✅ Well done. Do you feel a bit calmer?";
            }
        };
        updateStep();
    }
};