import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Verify authentication
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

    // Verify requester is an admin of a company organization
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id, role')
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
          .select('*, organizations(name)')
          .eq('organization_id', organizationId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'add': {
        const { email, password, role = 'employee' } = payload;
        const { data: authData, error: aError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { role },
        });
        if (aError) throw aError;

        const { error: pError } = await supabaseAdmin.from('profiles').insert({
          id: authData.user.id,
          organization_id: organizationId,
          username: email.split('@')[0],
          role,
        });
        if (pError) throw pError;

        return new Response(JSON.stringify({ success: true, userId: authData.user.id }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'delete': {
        const { userId } = payload;
        const { error: aError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (aError) throw aError;

        // Profile is deleted via ON DELETE CASCADE in schema
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'update': {
        const { userId, role } = payload;
        const { error: uError } = await supabaseAdmin
          .from('profiles')
          .update({ role })
          .eq('id', userId);
        if (uError) throw uError;
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      }

      case 'bulkAdd': {
        const users = payload as Array<{ email: string; password?: string; role: string }>;
        const results = [];
        for (const u of users) {
          try {
            const { data: authData, error: aError } = await supabaseAdmin.auth.admin.createUser({
              email: u.email,
              password: u.password || 'TemporaryPassword123!',
              email_confirm: true,
              user_metadata: { role: u.role },
            });
            if (aError) throw aError;

            await supabaseAdmin.from('profiles').insert({
              id: authData.user.id,
              organization_id: organizationId,
              username: u.email.split('@')[0],
              role: u.role,
            });
            results.push({ email: u.email, success: true });
          } catch (e) {
            results.push({ email: u.email, success: false, error: e.message });
          }
        }
        return new Response(JSON.stringify({ success: true, results }), { headers: { 'Content-Type': 'application/json' } });
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
