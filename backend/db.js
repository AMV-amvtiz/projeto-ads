const { Pool } = require('pg');

const pool = new Pool({
    user:  'postgres',
    host:  'localhost',
    database:  'projeto_ads',
    password:  '37ADt29g',
    port:  5432
});

module.exports = pool;