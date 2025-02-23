import {Pool} from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'taskmanagerapp',
    password: 'daffodils235',
    port: 5432,
});

export default pool;