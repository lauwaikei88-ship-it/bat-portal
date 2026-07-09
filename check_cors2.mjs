import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = envStr.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

async function check() {
  const testUrl = `${supabaseUrl}/storage/v1/object/upload/sign/media/test.txt?token=fake`;
  const res = await fetch(testUrl, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'PUT',
      'Access-Control-Request-Headers': 'content-type, authorization, x-client-info'
    }
  });
  
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
}

check();
