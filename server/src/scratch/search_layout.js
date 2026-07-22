import fs from 'fs';
import path from 'path';

const file = 'C:/College Management System GA/Collegemanagementsystem/client/src/layouts/DashboardLayout.tsx';
const content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('nav') || line.includes('role') || line.includes('Link') || line.includes('active')) {
    if (index >= 200 && index <= 900) {
      console.log(`${index + 1}: ${line.trim()}`);
    }
  }
});
