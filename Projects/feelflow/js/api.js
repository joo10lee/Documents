// 1. 서버 주소 설정 (ngrok)
const API_BASE_URL = 'https://ungainable-sonja-bewailingly.ngrok-free.dev';

/**
 * [통합] EmotionAPI: 서버 통신 및 로컬 대기열(Queue) 관리
 */
const EmotionAPI = {
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },

    // A. [Network] 실제 서버로 전송 (저수준 함수)
    async _postToServer(entry) {
        const response = await fetch(`${API_BASE_URL}/api/emotions`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(entry)
        });
        if (!response.ok) throw new Error("서버 응답 오류");
        return await response.json();
    },

    // B. [Main] app.js가 호출하는 저장 함수
    async saveCheckIn(entry) {
        console.log("🚀 저장 프로세스 시작:", entry.emotion);
        
        // 1. 로컬 대기열에 추가 (서버 장애 대비)
        let queue = JSON.parse(localStorage.getItem('emotionQueue') || '[]');
        queue.push(entry);
        localStorage.setItem('emotionQueue', JSON.stringify(queue));

        // 2. 로컬 히스토리에 즉시 반영 (사용자 체감 속도 향상)
        const history = JSON.parse(localStorage.getItem('feelflow_history') || '[]');
        history.unshift(entry);
        localStorage.setItem('feelflow_history', JSON.stringify(history));

        // 3. 서버 동기화 시도 (비동기)
        return await this.syncQueue();
    },

    // C. [Sync] 대기열 비우기 및 서버 동기화
    async syncQueue() {
        let queue = JSON.parse(localStorage.getItem('emotionQueue') || '[]');
        if (queue.length === 0) return;

        console.log(`🔄 동기화 시도 중... (남은 항목: ${queue.length}개)`);
        const remainingQueue = [];

        for (const item of queue) {
            try {
                // 실제 서버 전송 호출
                await this._postToServer(item); 
                console.log("✅ 서버 전송 성공:", item.emotion);
            } catch (error) {
                console.warn("⚠️ 전송 실패: 다음 기회에 재시도", error.message);
                remainingQueue.push(item);
            }
        }
        localStorage.setItem('emotionQueue', JSON.stringify(remainingQueue));
    },

    // D. [History] 전체 기록 가져오기
    async fetchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/emotions`, { headers: this.headers });
            if (!response.ok) throw new Error("로드 에러");
            return await response.json();
        } catch (error) {
            console.warn("서버 로드 실패, 로컬 데이터를 불러옵니다.");
            return JSON.parse(localStorage.getItem('feelflow_history') || '[]');
        }
    }
};

/**
 * EmotionActions: 카메라 및 인앱 액션 관리
 */
const EmotionActions = {
    activeStream: null, 
    capturedPhoto: null,

    async startCamera() {
        const video = document.getElementById('videoElement');
        const container = document.getElementById('videoContainer');
        const cameraBtn = document.getElementById('cameraBtn');
        try {
            if (this.activeStream) this.stopCamera();
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            this.activeStream = stream;
            video.srcObject = stream;
            container.style.display = 'block';
            cameraBtn.style.display = 'none';
        } catch (err) { alert("카메라를 켤 수 없습니다: " + err.message); }
    },

    takePhoto() {
        const video = document.getElementById('videoElement');
        const canvas = document.getElementById('hiddenCanvas');
        const previewImg = document.getElementById('capturedPhoto');
        const previewContainer = document.getElementById('photoPreviewContainer');

        if (!video || !video.videoWidth) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.5);
        previewImg.src = this.capturedPhoto;
        
        previewContainer.style.display = 'block';
        document.getElementById('videoContainer').style.display = 'none';
        this.stopCamera();
    },

    stopCamera() {
        if (this.activeStream) {
            this.activeStream.getTracks().forEach(track => track.stop());
            this.activeStream = null;
        }
        const video = document.getElementById('videoElement');
        if (video) video.srcObject = null;
    },

    reset() {
        this.capturedPhoto = null;
        this.stopCamera();
        document.getElementById('photoPreviewContainer').style.display = 'none';
        document.getElementById('cameraBtn').style.display = 'block';
        document.getElementById('videoContainer').style.display = 'none';
        const actionNote = document.getElementById('actionNote');
        if (actionNote) actionNote.value = '';
    }
};

// 전역 브릿지 등록
window.EmotionAPI = EmotionAPI;
window.EmotionActions = EmotionActions;