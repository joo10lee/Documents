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