const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emotion = sequelize.define('Emotion', {
    emotion: DataTypes.STRING,
    emoji: DataTypes.STRING,
    intensity: DataTypes.INTEGER,
    note: DataTypes.TEXT,      // "누구와 이야기했나요?" 등 저장
    photo: DataTypes.TEXT,     // 사진 데이터 (Base64)
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Emotion;