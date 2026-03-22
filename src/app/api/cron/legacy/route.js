import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic'; // Prevent prerendering

export async function GET(request) {
  // 1. Verify Vercel Cron Secret (if configured)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For local testing, we might bypass this if CRON_SECRET isn't set
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Initialize Supabase Admin Client
  // We MUST use the service_role key to bypass RLS and call the secure RPC
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase service role key configuration' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // 3. Fetch expired pending shares using the secure RPC
    const { data: expiredShares, error: fetchError } = await supabaseAdmin.rpc('get_expired_legacy_shares');

    if (fetchError) throw fetchError;

    if (!expiredShares || expiredShares.length === 0) {
      return NextResponse.json({ success: true, message: 'No expired shares found' });
    }

    const results = { delivered: 0, failed: 0 };

    // 4. Send emails and update status
    for (const share of expiredShares) {
      const unlockUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unlock/${share.id}`;
      
      try {
        await resend.emails.send({
          from: 'Vauriz Vault <noreply@vauriz.com>', // Needs verified domain in Resend
          to: share.recipient_email,
          subject: 'A Legacy Message has been shared with you via Vauriz',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">You have received a secure Legacy Message.</h2>
              <p>A trusted contact set up a "Dead Man's Switch" via Vauriz Password Manager, instructed to send to you if they became inactive.</p>
              <p>Because they have not logged in for their specified inactivity period, this message has been automatically delivered to you.</p>
              <p><strong>This message is heavily encrypted.</strong> Vauriz cannot read it.</p>
              <p>To decrypt the message, you will need the <strong>4-word secret passphrase</strong> they gave you beforehand.</p>
              
              <div style="margin: 30px 0;">
                <a href="${unlockUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Unlock Message</a>
              </div>
              
              <p style="font-size: 12px; color: #666;">If you do not have the passphrase, the message cannot be decrypted. The link is: <br>${unlockUrl}</p>
            </div>
          `
        });

        // Update status to delivered
        await supabaseAdmin
          .from('legacy_shares')
          .update({ status: 'delivered' })
          .eq('id', share.id);

        results.delivered++;
      } catch (emailErr) {
        console.error(`Failed to send email to ${share.recipient_email}:`, emailErr);
        results.failed++;
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
