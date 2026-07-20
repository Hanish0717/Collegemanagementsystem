import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:5432/postgres' });
  try {
    await client.connect();
    console.log("Connected to postgres");
    await client.query('CREATE DATABASE college_management;');
    console.log("Database college_management created successfully!");
  } catch (err) {
    console.error("Error creating database:", err.message);
  } finally {
    await client.end();
  }
}
run();
