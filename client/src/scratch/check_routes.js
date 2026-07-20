import fs from 'fs';
import path from 'path';

// Recursively get files in a directory
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  return results;
}

const routesDir = 'f:/Projects/CollegeManagementUpdated/Collegemanagementsystem/client/src/routes';
const files = getFiles(routesDir);

const registeredRoutes = new Set();
files.forEach((file) => {
  // Get relative path from routesDir
  let rel = path.relative(routesDir, file).replace(/\\/g, '/');
  // Remove file extension
  rel = rel.substring(0, rel.lastIndexOf('.'));

  // Convert filename to routing path
  // E.g., index -> /
  // reset-password -> /reset-password
  // dashboard/index -> /dashboard/
  // dashboard/admin/index -> /dashboard/admin/
  // dashboard/super-admin/users -> /dashboard/super-admin/users
  // dashboard/students/$studentId -> /dashboard/students/$studentId (dynamic)
  let routePath = '';
  if (rel === '__root') return;

  const parts = rel.split('/');
  const mappedParts = parts.map((part) => {
    if (part === 'index') return '';
    return part;
  });

  routePath = '/' + mappedParts.filter((p) => p !== '').join('/');

  // Clean up double slashes or trail
  if (routePath === '') routePath = '/';

  // Special check: if it is inside dashboard, the path is prefixed with /dashboard
  // wait, the actual route definition has createFileRoute('/dashboard/admin/students') etc.
  // Let's read the file content to find createFileRoute(...) parameter!
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/createFileRoute\((['"`])(.*?)\1\)/);
  if (match) {
    registeredRoutes.add(match[2]);
  } else {
    registeredRoutes.add(routePath);
  }
});

console.log('Registered Routes:');
console.log(Array.from(registeredRoutes).sort());

// Now read roles.ts and extract all "to" values
const rolesContent = fs.readFileSync(
  'f:/Projects/CollegeManagementUpdated/Collegemanagementsystem/client/src/lib/roles.ts',
  'utf8',
);
// Find all occurrences of to: "..."
const toMatches = rolesContent.matchAll(/to:\s*(['"`])(.*?)\1/g);
const targetPaths = new Set();
for (const match of toMatches) {
  targetPaths.add(match[2]);
}

console.log('\nPaths referenced in roles.ts:');
const missing = [];
Array.from(targetPaths)
  .sort()
  .forEach((p) => {
    // Let's check if there is an exact match or a match where query parameters are removed
    const cleanPath = p.split('?')[0];
    let found = registeredRoutes.has(cleanPath);
    if (!found) {
      // try adding or removing trailing slash
      if (cleanPath.endsWith('/')) {
        found = registeredRoutes.has(cleanPath.slice(0, -1));
      } else {
        found = registeredRoutes.has(cleanPath + '/');
      }
    }
    if (!found) {
      missing.push(p);
    }
  });

if (missing.length > 0) {
  console.log('Missing routes in the app (referenced in roles.ts but not registered as routes):');
  console.log(missing);
} else {
  console.log('All paths referenced in roles.ts are valid registered routes!');
}
