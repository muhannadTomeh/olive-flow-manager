import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Create a client with the user's token to check roles
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Check if user is platform_admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'platform_admin' });

    if (roleError || !roleData) {
      console.error('Role check failed:', roleError, roleData);
      throw new Error('Forbidden: Only platform_admin can create accounts');
    }

    // Get request body
    const { email, password, mill_name, owner_name, phone } = await req.json();

    if (!email || !password || !mill_name || !owner_name) {
      throw new Error('Missing required fields');
    }

    // Create admin client with service role to bypass RLS and perform auth actions
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`Creating user for ${email}...`);

    // 1. Create User in Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        millName: mill_name,
        ownerName: owner_name,
        phone: phone || ''
      }
    });

    if (createError) throw createError;
    const newUserId = newUser.user.id;
    console.log(`User created: ${newUserId}`);

    // 2. Ensure Profile exists and is active
    // The handle_new_user_setup trigger might take a moment
    // We'll upsert to be safe and override subscription status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: newUserId,
        display_name: owner_name,
        mill_name: mill_name,
        phone: phone || null,
        subscription_status: 'active',
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error with profile upsert:', profileError);
      // We don't fail here because the user is created, but it's not ideal
    }

    // 3. Assign mill_owner role
    const { error: roleAssignError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role: 'mill_owner'
      });
    
    if (roleAssignError) {
      console.error('Error assigning role:', roleAssignError);
    }

    return new Response(
      JSON.stringify({ message: 'Account created successfully', user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Edge Function Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
