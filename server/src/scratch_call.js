import axios from 'axios';

async function test() {
  console.log("Calling /api/migrate...");
  try {
    const res = await axios.get('http://localhost:5000/api/migrate');
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Error status:", err.response.status);
      console.error("Error data:", err.response.data);
    } else {
      console.error("Error message:", err.message);
    }
  }
}

test();
