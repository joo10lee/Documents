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

const Emotion = sequelize.define('Emotion', {
    emotion: DataTypes.STRING,
    emoji: DataTypes.STRING,
    intensity: DataTypes.INTEGER,
    timestamp: DataTypes.DATE
});

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'FeelFlow Server is Running! 🚀' });

// 1. 여기에 데이터를 받는 POST 경로를 추가합니다.
app.post('/api/emotions', async (req, res) => {
    console.log("----------------------------");
    console.log("📦 아이폰 신호 포착:", req.body);
    
    try {
        // DB에 저장 시도
        const newRecord = await Emotion.create({
            emotion: req.body.emotion,
            emoji: req.body.emoji,
            intensity: req.body.intensity,
            timestamp: new Date() // 타임스탬프 추가
        });
        
        console.log("✅ DB 저장 성공!");
        res.status(201).json(newRecord);
    } catch (err) {
        console.error("❌ DB 저장 실패:", err.message);
        res.status(400).json({ error: err.message });
    }
    console.log("----------------------------");
});


});

// 서버 실행 및 DB 동기화
// 서버 실행 전 DB 동기화 강제
console.log("🛠️ DB 연결 시도 중...");

sequelize.authenticate()
    .then(() => {
        console.log("✅ 1. DB 연결 자체는 성공했습니다.");
        return sequelize.sync({ alter: true }); // 테이블 구조를 강제로 맞춤
    })
    .then(() => {
        console.log("✅ 2. 테이블 생성/동기화 완료 (Executing... 문구가 떠야 함)");
        app.listen(3000, '0.0.0.0', () => {
            console.log("🚀 3. 서버가 드디어 3000번에서 대기 중입니다!");
        });
    })
    .catch(err => {
        console.error("❌ DB 작업 중 에러 발생:");
        console.error(err); // 에러의 진짜 정체를 출력
    });