const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "srv982.hstgr.io",
  user: "u183177620_pharma",
  password: "pharamDb@123",
  database: "u183177620_pharmaDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
