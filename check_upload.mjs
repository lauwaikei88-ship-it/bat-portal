import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = envStr.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2].trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const fileName = `test-${Date.now()}.txt`;
  
  // 1. Get signed url
  const { data: presignData, error: presignError } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(fileName);
      
  console.log("Presign:", presignData, presignError);
  
  if (!presignData) return;

  // 2. Upload to signed URL using the anon client to simulate browser
  const anonClient = createClient(supabaseUrl, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // mock a file (Blob/Buffer)
  const fileBody = Buffer.from('hello world');
  
  const { data: uploadData, error: uploadError } = await anonClient.storage
    .from('media')
    .uploadToSignedUrl(presignData.path, presignData.token, fileBody);
    
  console.log("Upload:", uploadData, uploadError);
}

check();
