// models/Emotion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emotion = sequelize.define('Emotion', {
    emotion: { type: DataTypes.STRING, allowNull: false },
    emoji: { type: DataTypes.STRING },
    intensity: { type: DataTypes.INTEGER },
    note: { type: DataTypes.TEXT },
    // ✅ 사진 데이터를 저장할 컬럼이 반드시 있어야 합니다!
    photo: { type: DataTypes.TEXT }, 
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = Emotion;