import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = 'mangoiskuning@gmail.com';
  
  console.log(`Searching for user: ${email}...`);
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error listing users:', userError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.error(`User with email ${email} not found in auth.users.`);
    process.exit(1);
  }

  console.log(`Found user ID: ${user.id}`);

  // Update user_metadata in Supabase Auth
  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { user_metadata: { ...user.user_metadata, plan: 'pro', unlimited_posting: true } }
  );

  if (updateError) {
    console.error('Failed to update user_metadata:', updateError.message);
    process.exit(1);
  }

  console.log('Successfully upgraded user plan to PRO (unlimited posting):', updatedUser.user.email, updatedUser.user.user_metadata);
}

run();
