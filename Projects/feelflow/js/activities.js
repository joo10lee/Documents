/**
 * Activities Module: FeelFlow 활동 엔진 (Ver.0215-TOTAL)
 * 기능: 오디오 엔진 관리, 퀘스트(HappyNote, Capture 등) UI 렌더링, 활동 중단 관리
 */

const Activities = {
    audioCtx: null,
    activeQuests: [],

    // 1. 오디오 엔진 초기화 (app.js에서 감정 선택 시 호출)
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log("🎵 Activities: Audio Engine Unlocked");
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    // 2. 활동 설정 및 화면 전환 (app.js의 startQuest에서 호출)
    setupActivity(title) {
        const container = document.getElementById('inAppActionArea');
        const titleEl = document.getElementById('activityTitle');
        const iconEl = document.getElementById('activityIcon');

        if (!container) return;
        
        // UI 모듈을 통해 활동 전용 화면으로 이동
        if (window.UI) window.UI.goToScreen('Activity', title);
        
        if (titleEl) titleEl.textContent = title;
        container.innerHTML = ""; // 기존 UI 초기화

        // 💡 퀘스트 타이틀에 따른 UI 분기
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('happy note')) {
            if (iconEl) iconEl.textContent = "✍️";
            this.renderHappyNote(container);
        } else if (lowerTitle.includes('capture')) {
            if (iconEl) iconEl.textContent = "📸";
            this.renderCapture(container);
        } else if (lowerTitle.includes('breathing')) {
            if (iconEl) iconEl.textContent = "🌬️";
            this.renderBreathing(container);
        } else if (lowerTitle.includes('music')) {
            if (iconEl) iconEl.textContent = "🎵";
            this.renderMusic(container);
        } else {
            container.innerHTML = `<p style="padding:40px; text-align:center; color:#64748b;">Ready to start ${title}?</p>`;
        }
    },

    // 3. Happy Note: 글쓰기 + 사진 추가 UI
    renderHappyNote(container) {
        container.innerHTML = `
            <div class="quest-box" style="padding: 20px; text-align: center;">
                <p style="font-weight: 850; margin-bottom: 20px; color:#1e293b;">What's one thing that made you smile?</p>
                
                <button class="btn-primary" onclick="window.EmotionActions.startCamera()" id="cameraBtn" style="margin: 0 0 15px 0; width: 100%;">📸 Add a Photo</button>
                
                <div id="videoContainer" style="display:none; border-radius: 20px; overflow: hidden; margin-bottom: 15px; position: relative; background:#000;">
                    <video id="videoElement" autoplay playsinline style="width: 100%;"></video>
                    <button onclick="window.EmotionActions.takePhoto()" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 70px; height: 70px; border-radius: 35px; border: 5px solid white; background:rgba(255,255,255,0.3);"></button>
                </div>

                <div id="photoPreviewContainer" style="display:none; margin-bottom: 15px;">
                    <img id="capturedPhoto" style="width: 100%; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                </div>

                <textarea id="actionNote" placeholder="Write it here..." style="width: 100%; margin: 0; min-height:120px;"></textarea>
                <canvas id="hiddenCanvas" style="display:none;"></canvas>
            </div>
        `;
    },

    // 4. Capture the moment: 카메라 중심 UI
    renderCapture(container) {
        this.renderHappyNote(container); // 동일한 카메라 로직 공유
    },

    // 5. Deep Breathing: 인터랙티브 애니메이션
    renderBreathing(container) {
        container.innerHTML = `
            <div class="breathing-space" style="height: 300px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <div id="breathCircle" style="width: 100px; height: 100px; background: rgba(124, 58, 237, 0.2); border: 4px solid #7c3aed; border-radius: 50%; transition: all 4s ease-in-out;"></div>
                <p id="breathText" style="margin-top: 40px; font-weight: 850; color: #7c3aed; font-size: 1.8rem;">Inhale...</p>
            </div>
        `;
        this.startBreathingAnim();
    },

    startBreathingAnim() {
        const circle = document.getElementById('breathCircle');
        const text = document.getElementById('breathText');
        if (!circle || !text) return;

        let state = 'in';
        const interval = setInterval(() => {
            if (state === 'in') {
                circle.style.transform = 'scale(2.5)';
                text.textContent = "Exhale...";
                state = 'out';
            } else {
                circle.style.transform = 'scale(1)';
                text.textContent = "Inhale...";
                state = 'in';
            }
        }, 4000);
        this.activeQuests.push(interval);
    },

    // 6. Music: 힐링 사운드 활동
    renderMusic(container) {
        container.innerHTML = `
            <div style="padding:40px; text-align:center;">
                <div style="font-size:5rem; margin-bottom:20px; animation: pulse 2s infinite;">🎵</div>
                <p style="font-weight:850; color:#475569;">Close your eyes and <br>listen to your favorite song.</p>
            </div>
        `;
    },

    // 7. 활동 종료 시 정리 (Cleanup)
    stopAll() {
        console.log("🧹 Activities: All background tasks stopped");
        // 실행 중인 인터벌(호흡 등) 제거
        this.activeQuests.forEach(clearInterval);
        this.activeQuests = [];
        
        // 카메라 중지
        if (window.EmotionActions) window.EmotionActions.stopCamera();
    }
};

window.Activities = Activities;