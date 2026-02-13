const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Emotion = require('./models/Emotion');

const app = express();
const PORT = 3000;

app.use(cors());
// ✅ 사진(Base64) 데이터 수신을 위해 용량 제한을 늘려야 합니다.
app.use(express.json({ limit: '10mb' })); 

// API: 전체 기록 조회
app.get('/api/emotions', async (req, res) => {
    try {
        const data = await Emotion.findAll({ order: [['timestamp', 'DESC']] });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: 새 기록 저장 (메모 및 사진 포함)
app.post('/api/emotions', async (req, res) => {
    console.log("📥 [Server] Received Data:", req.body);
    
    if (req.body.photo) {
        console.log("📸 [Server] Photo detected! (Size:", req.body.photo.length, ")");
    }

    try {
        // 실제 DB에 저장하는 로직
        const newEntry = await Emotion.create(req.body); 
        res.status(201).json(newEntry);
        console.log("✅ [DB] Successfully saved to database!");
    } catch (error) {
        console.error("❌ [DB] Save failed:", error);
        res.status(500).json({ error: error.message });
    }
});

// DB 동기화 및 서버 실행
sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 FeelFlow 백엔드가 ${PORT}번 포트에서 가동 중입니다!`);
    });
});