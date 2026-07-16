import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/config/mock_db.json');
let content = fs.readFileSync(filePath, 'utf8');

console.log("Reading mock_db.json to resolve conflicts...");

// Extract faculty_attendance array elements from the local changes blocks
const faculty_attendance = [
  {
    "id": "fa111111-1111-1111-1111-111111111111",
    "faculty": "f1111111-1111-1111-1111-111111111111",
    "date": "2026-05-24",
    "status": "present",
    "remarks": ""
  },
  {
    "id": "fa222222-2222-2222-2222-222222222222",
    "faculty": "f1111111-1111-1111-1111-111111111111",
    "date": "2026-05-25",
    "status": "present",
    "remarks": ""
  },
  {
    "id": "fa333333-3333-3333-3333-333333333333",
    "faculty": "f1111111-1111-1111-1111-111111111111",
    "date": "2026-05-26",
    "status": "absent",
    "remarks": "Sick leave"
  }
];

// Replace all conflict blocks with their HEAD (remote) side
let cleanedContent = content.replace(/<<<<<<< HEAD([\s\S]*?)=======([\s\S]*?)>>>>>>> .*/g, '$1');

try {
  // Parse the remote version of the JSON
  const db = JSON.parse(cleanedContent);
  
  // Inject our faculty_attendance array
  db.faculty_attendance = faculty_attendance;

  // Save the cleaned and merged JSON database
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
  console.log("🎉 Successfully resolved mock_db.json conflicts!");
} catch (e) {
  console.error("❌ Error parsing cleaned JSON:", e);
}
