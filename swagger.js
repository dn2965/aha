const swaggerAutogen = require('swagger-autogen')();
const setting = {
    info: {
        title: 'Aha rest API',
        description: 'testing',
    },
    host: 'localhost:3000',
    schemes: ['http'],
    tags: [
        {
            "name": "index",
            "description": "首頁或驗証功能"
        },
        {
            "name": "users",
            "description": "使用者資訊相關"
        },
        {
            "name": "dashboard",
            "description": "simple dashboard 資料相關"
        }
    ]
};

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, setting);