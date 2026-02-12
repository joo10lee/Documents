const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emotion = sequelize.define('Emotion', {
    emotion: DataTypes.STRING,
    emoji: DataTypes.STRING,
    intensity: DataTypes.INTEGER,
    note: DataTypes.TEXT,      // "누구와 이야기했나요?", "눈에 들어온 환경" 등 저장
    photo: DataTypes.TEXT,     // 사진 데이터를 Base64 문자열로 저장
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Emotion;