import pkg from 'pg';
const { Client } = pkg;

async function check() {
  const passwords = [
    'postgres',
    'password',
    'admin',
    'root',
    'password123',
    'root123',
    '123456',
    '12345678',
    '1234',
    ''
  ];

  for (const password of passwords) {
    const url = `postgresql://postgres:${password}@127.0.0.1:5432/postgres`;
    console.log(`Trying connection with password "${password}"...`);
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      console.log(`SUCCESS connected to postgres with password "${password}"`);
      const res = await client.query('SELECT version();');
      console.log('Version:', res.rows[0].version);
      
      const dbs = await client.query('SELECT datname FROM pg_database;');
      console.log('Databases:', dbs.rows.map(r => r.datname));
      
      await client.end();
      break;
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
      try {
        await client.end();
      } catch (e) {}
    }
  }
}

check();
