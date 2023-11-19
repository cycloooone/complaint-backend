import pkg from 'pg';
const { Pool } = pkg;
const pool =  new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'apc',
    password: '1907',
    port: 5432,
  });
export default pool
