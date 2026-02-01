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
});

// 서버 실행 및 DB 동기화
sequelize.sync().then(() => {
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`=================================`);
        console.log(`✅ Server is live at http://127.0.0.1:${PORT}`);
        console.log(`=================================`);
    });
}).catch(err => {
    console.error('❌ DB Sync Error:', err);
});