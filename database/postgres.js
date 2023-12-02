import pkg from 'pg';
const { Pool } = pkg;
const pool =  new Pool({
    user: 'akzat',
    host: 'localhost',
    database: 'test',
    password: '1907',
    port: 5432,
  });
export default pool
