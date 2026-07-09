import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking social_accounts columns...");
  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error("Error reading social_accounts:", error);
  } else {
    console.log("Data:", data);
    if (data && data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
    } else {
      console.log("Table is empty, trying to insert a dummy row to see if token_expires_at exists");
      const { error: insertError } = await supabase.from('social_accounts').insert({
        user_id: '00000000-0000-0000-0000-000000000000', // might violate FK, but let's see the error
        platform: 'test',
        platform_account_id: 'test',
        account_name: 'test',
        token_expires_at: new Date().toISOString()
      });
      console.error("Insert result:", insertError);
    }
  }
}

check();
