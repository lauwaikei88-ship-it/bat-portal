import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Trying upsert...");
  const { data, error } = await supabase
    .from('social_accounts')
    .upsert({
      user_id: '00000000-0000-0000-0000-000000000000',
      platform: 'facebook_page',
      platform_account_id: 'test_id',
      account_name: 'test_name',
    }, { onConflict: 'user_id,platform,platform_account_id' });
    
  console.log("Error:", error);
}

check();
