const config = {
    dbname: '',
    uname: '',
    upwd: '',
    host: 'sql6.freesqldatabase.com',
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};
module.exports = config;
