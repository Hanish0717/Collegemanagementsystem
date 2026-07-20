import dotenv from 'dotenv';
dotenv.config();

// We can run check on supabase.js directly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;

let isMockMode = (!databaseUrl || databaseUrl.includes('your_supabase_postgresql')) &&
                   (!supabaseUrl || supabaseUrl.includes('your-project') || supabaseUrl.includes('placeholder')) ||
                   process.env.FORCE_MOCK_MODE === 'true';

console.log("Evaluated isMockMode:", isMockMode);
console.log("databaseUrl:", databaseUrl);
console.log("supabaseUrl:", supabaseUrl);
