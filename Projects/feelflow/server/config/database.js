const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    // 최상위 feelflow 폴더에 있는 sqlite 파일을 가리킵니다.
    storage: path.join(__dirname, '../../database.sqlite'), 
    logging: false
});

module.exports = sequelize;