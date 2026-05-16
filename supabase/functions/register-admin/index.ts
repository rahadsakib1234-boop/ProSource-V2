import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { email, password, accountType = 'company' } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (authError) throw authError;
    const user = authData.user;
    if (!user?.id) throw new Error('User creation failed');

    // 2. Create Organization
    const organizationName = accountType === 'personal' ? email.split('@')[0] : (email.split('@')[0] || 'ProSource Org');
    const orgId = crypto.randomUUID();

    const { error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        id: orgId,
        name: organizationName,
        account_type: accountType
      });

    if (orgError) throw orgError;

    // 3. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        organization_id: orgId,
        username: organizationName,
        role: 'admin',
      });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({ success: true, organizationId: orgId }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
