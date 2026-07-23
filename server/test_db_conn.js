import net from 'net';

const testPort = (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.once('connect', () => {
      console.log(`✅ Success: Connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      console.log(`❌ Timeout: Connecting to ${host}:${port} timed out`);
      socket.destroy();
      resolve(false);
    });
    socket.once('error', (err) => {
      console.log(`❌ Error connecting to ${host}:${port}:`, err.message);
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

console.log("Starting TCP Port checks to Docker Postgres...");
await testPort("127.0.0.1", 5435);
await testPort("localhost", 5435);
console.log("Checks completed.");
