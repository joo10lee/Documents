// public/js/api.js
const API_BASE_URL = 'https://ungainable-sonja-bewailingly.ngrok-free.dev';

const EmotionAPI = {
    // 공통 헤더 (ngrok 우회 포함)
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },

    // 1. 전체 기록 가져오기 (GET)
    async fetchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/emotions`, {
                headers: this.headers
            });
            if (!response.ok) throw new Error("네트워크 응답 에러");
            return await response.json();
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            throw error;
        }
    },

    // 2. 단일 기록 저장하기 (POST)
    async saveEntry(entry) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/emotions`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(entry)
            });
            return await response.json();
        } catch (error) {
            console.warn("서버 전송 실패, 로컬 대기열에 저장합니다.");
            throw error;
        }
    }
};

// public/js/api.js 하단에 추가

const EmotionManager = {
    // 1. 체크인 저장 (기존 saveCheckIn 대체)
    async saveCheckIn(entry) {
        console.log("🚀 저장 프로세스 시작:", entry.emotion);
        
        // 로컬 대기열 관리
        let queue = JSON.parse(localStorage.getItem('emotionQueue') || '[]');
        queue.push(entry);
        localStorage.setItem('emotionQueue', JSON.stringify(queue));

        // 로컬 히스토리 업데이트 (즉시 반영용)
        const history = JSON.parse(localStorage.getItem('feelflow_history') || '[]');
        history.unshift(entry);
        localStorage.setItem('feelflow_history', JSON.stringify(history));

        // 서버 동기화 시도
        return await this.syncQueue();
    },

    // 2. 서버 동기화 (기존 syncQueueWithServer 대체)
    async syncQueue() {
        let queue = JSON.parse(localStorage.getItem('emotionQueue') || '[]');
        if (queue.length === 0) return;

        console.log(`🔄 동기화 시도 중... (남은 항목: ${queue.length}개)`);
        const remainingQueue = [];

        for (const item of queue) {
            try {
                // 아까 만든 EmotionAPI.saveEntry 사용
                await EmotionAPI.saveEntry(item); 
                console.log("✅ 서버 전송 성공:", item.emotion);
            } catch (error) {
                console.warn("⚠️ 전송 실패: 대기열 유지");
                remainingQueue.push(item);
            }
        }
        localStorage.setItem('emotionQueue', JSON.stringify(remainingQueue));
    }
};

// 카메라 및 인앱 액션 관리 객체
const EmotionActions = {
    // 내부 변수
    activeStream: null, 
    capturedPhoto: null,

    // 1. 카메라 시작
    async startCamera() {
        const video = document.getElementById('videoElement');
        const container = document.getElementById('videoContainer');
        const cameraBtn = document.getElementById('cameraBtn');

        try {
            // 카메라 중복 실행 방지
            if (this.activeStream) this.stopCamera();

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" }, 
                audio: false 
            });
            
            this.activeStream = stream; // 변수에 스트림 저장
            video.srcObject = stream;
            
            container.style.display = 'block';
            cameraBtn.style.display = 'none';
            console.log("📸 카메라 시작됨");
        } catch (err) {
            alert("카메라를 켤 수 없습니다: " + err.message);
        }
    },

    // 2. 사진 촬영 및 종료
    takePhoto() {
        const video = document.getElementById('videoElement');
        const canvas = document.getElementById('hiddenCanvas');
        const previewImg = document.getElementById('capturedPhoto');
        const previewContainer = document.getElementById('photoPreviewContainer');
        const videoContainer = document.getElementById('videoContainer');

        if (!video.videoWidth) return; // 비디오 로드 확인

        // 캔버스에 그리기
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        // 데이터 저장
        this.capturedPhoto = canvas.toDataURL('image/jpeg', 0.7);
        previewImg.src = this.capturedPhoto;
        
        // UI 전환
        previewContainer.style.display = 'block';
        videoContainer.style.display = 'none';
        
        // ✅ 여기서 카메라를 확실히 끕니다.
        this.stopCamera();
        console.log("✅ 촬영 완료 및 카메라 종료");
    },

    // 3. 카메라 엔진 끄기 (핵심 로직)
    stopCamera() {
        if (this.activeStream) {
            const tracks = this.activeStream.getTracks();
            tracks.forEach(track => {
                track.stop(); // 트랙 정지
                console.log(`🚫 ${track.kind} 트랙 정지됨`);
            });
            this.activeStream = null;
        }
        
        const video = document.getElementById('videoElement');
        if (video) video.srcObject = null; // 비디오 연결 해제
    },

    // 4. 리셋 (다시 찍기 버튼용)
    reset() {
        this.capturedPhoto = null;
        this.stopCamera();
        
        const preview = document.getElementById('photoPreviewContainer');
        if (preview) preview.style.display = 'none';
        
        const cameraBtn = document.getElementById('cameraBtn');
        if (cameraBtn) cameraBtn.style.display = 'block';
        
        const videoContainer = document.getElementById('videoContainer');
        if (videoContainer) videoContainer.style.display = 'none';

        const actionNote = document.getElementById('actionNote');
        if (actionNote) actionNote.value = '';
    }
};