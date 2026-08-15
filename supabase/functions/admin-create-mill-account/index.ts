import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Check if user is platform_admin
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { data: roleData, error: roleError } = await supabaseClient
      .rpc('has_role', { _user_id: user.id, _role: 'platform_admin' })

    if (roleError || !roleData) {
      throw new Error('Forbidden: Only platform_admin can create accounts')
    }

    // Get request body
    const { email, password, mill_name, owner_name, phone } = await req.json()

    if (!email || !password || !mill_name || !owner_name) {
      throw new Error('Missing required fields')
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Create User
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        millName: mill_name,
        ownerName: owner_name,
        phone: phone || ''
      }
    })

    if (createError) throw createError

    // 2. Profile is usually created by trigger handle_new_user_setup
    // But let's ensure it has the correct active status and additional info
    // Wait a bit for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: owner_name,
        mill_name: mill_name,
        phone: phone,
        subscription_status: 'active'
      })
      .eq('user_id', newUser.user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      // Attempt to insert if update failed (though trigger should have inserted)
      await supabaseAdmin.from('profiles').upsert({
        user_id: newUser.user.id,
        display_name: owner_name,
        mill_name: mill_name,
        phone: phone,
        subscription_status: 'active'
      })
    }
    
    // 3. Assign mill_owner role
    const { error: roleAssignError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'mill_owner'
      })
    
    if (roleAssignError) console.error('Error assigning role:', roleAssignError)

    return new Response(
      JSON.stringify({ message: 'Account created successfully', user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
