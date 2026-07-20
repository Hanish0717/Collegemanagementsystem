import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configure DATE (OID 1082) parsing to return raw YYYY-MM-DD string instead of converting to local Date objects
pkg.types.setTypeParser(1082, (val) => val);

const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

let pool = null;
if (connectionString && process.env.FORCE_MOCK_MODE !== 'true') {
  pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
}

export default pool;
