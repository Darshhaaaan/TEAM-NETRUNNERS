const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    user: process.env.PSUSER,
    host: process.env.PSHOST,
    database: process.env.PSDB,
    password: process.env.PSPASSWORD,
    port: 6000,
    max: 100
})

pool.connect()
  .then(() => console.log("PostgreSQL connected"))
  .catch(err => console.error("PostgreSQL connection error", err));

module.exports = pool;