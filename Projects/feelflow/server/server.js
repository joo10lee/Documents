const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = 3000;

// DB 설정
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// [수정] 모델 정의에 note 컬럼을 추가합니다.
const Emotion = sequelize.define('Emotion', {
    emotion: DataTypes.STRING,
    emoji: DataTypes.STRING,
    intensity: DataTypes.INTEGER,
    note: DataTypes.TEXT, // <--- 메모 필드 추가
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
});

app.use(cors());
app.use(bodyParser.json());

// [수정] Sequelize 방식으로 저장 로직 변경
app.post('/api/emotions', async (req, res) => {
    try {
        const { emotion, emoji, intensity, note, timestamp } = req.body;

        // Sequelize의 create 메소드를 사용합니다.
        const newEntry = await Emotion.create({
            emotion,
            emoji,
            intensity,
            note: note || '',
            timestamp: timestamp || new Date()
        });

        console.log(`📦 신규 데이터 저장 완료 (ID: ${newEntry.id}) - 메모: ${note || '없음'}`);
        res.status(201).json(newEntry);
    } catch (error) {
        console.error("❌ DB 저장 에러:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// server.js의 이 부분을 확인하세요
app.get('/api/emotions', async (req, res) => {  // <--- 이 경로와 주소창의 경로가 일치해야 합니다.
    try {
        const emotions = await Emotion.findAll({ order: [['createdAt', 'DESC']] });
        res.json(emotions);
    } catch (error) {
        console.error("❌ 데이터 불러오기 에러:", error);
        res.status(500).json({ error: error.message });
    }
});

// 서버 실행 및 DB 동기화
console.log("🛠️ DB 연결 시도 중...");

sequelize.authenticate()
    .then(() => {
        console.log("✅ 1. DB 연결 자체는 성공했습니다.");
        // alter: true 설정으로 인해 note 컬럼이 자동으로 테이블에 반영됩니다.
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log("✅ 2. 테이블 생성/동기화 완료");
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 3. 서버가 드디어 ${PORT}번에서 대기 중입니다!`);
        });
    })
    .catch(err => {
        console.error("❌ DB 작업 중 에러 발생:", err);
    });