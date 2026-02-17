// 1. 서버 주소 설정 (AWS API Gateway)
const API_BASE_URL = 'https://f8ambn0bkg.execute-api.us-west-2.amazonaws.com/Prod';

/**
 * [통합] EmotionAPI: 서버 통신 및 로컬 대기열(Queue) 관리
 */
const EmotionAPI = {
    headers: {
        'Content-Type': 'application/json'
    },

    // A. 실제 서버로 전송 (내부용)
    async _postToServer(entry) {
        // Ensure userId is present
        const payload = { ...entry, userId: entry.userId || "test_user" };

        const response = await fetch(`${API_BASE_URL}/emotion`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("서버 응답 오류");
        return await response.json();
    },

    // B. [Main] 체크인 저장 (대기열 및 히스토리 즉시 반영)
    async saveCheckIn(entry) {
        console.log("🚀 저장 프로세스 시작:", entry.emotion);

        // 1. 로컬 대기열 추가 (서버 장애 대비)
        let queue = JSON.parse(localStorage.getItem('emotionQueue') || '[]');
        queue.push(entry);
        localStorage.setItem('emotionQueue', JSON.stringify(queue));

        // 2. 로컬 히스토리 즉시 업데이트 (UI 즉시 반영용)
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
                await this._postToServer(item);
                console.log("✅ 서버 전송 성공:", item.emotion);
            } catch (error) {
                console.warn("⚠️ 전송 실패: 대기열 유지", error.message);
                remainingQueue.push(item);
            }
        }
        localStorage.setItem('emotionQueue', JSON.stringify(remainingQueue));
    },

    // D. 전체 기록 가져오기 (GET)
    // D. 전체 기록 가져오기 (GET)
    async fetchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/history?userId=test_user`, { headers: this.headers });
            if (!response.ok) throw new Error("로드 에러");
            const data = await response.json();

            // 💡 Persistence Fix: Update LocalStorage with server data
            if (Array.isArray(data)) {
                localStorage.setItem('feelflow_history', JSON.stringify(data));
                console.log("✅ History synced with server:", data.length, "items");
            }
            return data;
        } catch (error) {
            console.warn("서버 로드 실패, 로컬 데이터를 불러옵니다.", error);
            return JSON.parse(localStorage.getItem('feelflow_history') || '[]');
        }
    },

    // E. AI Insight 가져오기 (POST)
    async getAIInsight(history) {
        try {
            const response = await fetch(`${API_BASE_URL}/ai/insight`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ history })
            });
            if (!response.ok) throw new Error("AI 분석 실패");
            return await response.json();
        } catch (error) {
            console.error(error);
            return { insight: "AI analysis unavailable right now. Keep tracking!" };
        }
    }
};

window.EmotionAPI = EmotionAPI;

