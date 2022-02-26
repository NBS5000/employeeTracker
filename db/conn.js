const mysql = require('mysql2');
const conn = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
    },
    console.log(`Connected to the employee_db database.`)
);

module.exports = conn;