const mysql = require("mysql");
require("dotenv").config();

const sql = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  port: process.env.DB_PORT
});

sql.connect((err) => {
  if (err) console.log(err);
});

module.exports = sql;
