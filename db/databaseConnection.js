const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'sql6.freesqldatabase.com',
    user: 'sql6490699',
    password: 'skDIktgjq7',
    database: 'sql6490699'
});
connection.connect((error) => {
    if (error) {
        throw error;
    } else {
        console.log('Connected!:)');
    }
});
module.exports = connection;
