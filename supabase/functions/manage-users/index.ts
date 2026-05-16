import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, role, account_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('Profile not found');
    if (profile.role !== 'admin') throw new Error('Only administrators can manage users');

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('account_type')
      .eq('id', profile.organization_id)
      .single();

    if (org?.account_type !== 'company') {
      throw new Error('Employee management is only available for company accounts');
    }

    const { action, payload } = await req.json();
    const organizationId = profile.organization_id;

    switch (action) {
      case 'list': {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('id, organization_id, username, role, account_type, permissions, created_at, updated_at, last_login, organizations(name, account_type)')
          .eq('organization_id', organizationId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'add': {
        const { email, password, role = 'employee', permissions = [] } = payload;
        const { data: authData, error: aError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role, permissions },
        });
        if (aError) throw aError;

        const { error: pError } = await supabaseAdmin.from('profiles').insert({
          id: authData.user.id,
          organization_id: organizationId,
          username: email.split('@')[0],
          role,
          account_type: 'company',
          permissions,
        });
        if (pError) throw pError;

        return new Response(JSON.stringify({ success: true, userId: authData.user.id }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'delete': {
        const { userId } = payload;
        if (userId === user.id) throw new Error('You cannot delete your own account from here');
        const { error: aError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (aError) throw aError;
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'update': {
        const { userId, role, permissions = [] } = payload;
        const { error: uError } = await supabaseAdmin
          .from('profiles')
          .update({ role, permissions })
          .eq('id', userId)
          .eq('organization_id', organizationId);
        if (uError) throw uError;
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
