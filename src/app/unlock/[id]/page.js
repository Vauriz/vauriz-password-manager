import { createAdminClient } from '@/lib/supabase/admin';
import UnlockClient from './UnlockClient';

export const dynamic = 'force-dynamic';

export default async function UnlockPage({ params }) {
  // In Next.js 15, params is a Promise that must be awaited
  const { id } = await params;
  
  // We use the admin client here to fetch the share securely by ID, bypassing RLS
  const supabase = createAdminClient();

  // Try to fetch the legacy share
  const { data: share, error } = await supabase
    .from('legacy_shares')
    .select('id, recipient_email, encrypted_payload, iv, status')
    .eq('id', id)
    .single();

  if (error || !share || share.status !== 'delivered') {
    return (
      <div className="login-page">
        <div className="bg-grid" />
        <div className="bg-gradient-orb purple" />
        <div className="bg-gradient-orb blue" />
        <div className="login-container" style={{ textAlign: 'center' }}>
          <h2>Invalid or Pending Share</h2>
          <p style={{ color: 'var(--text-muted)' }}>This legacy share does not exist, has been deleted, or is not yet ready to be delivered.</p>
        </div>
      </div>
    );
  }

  return <UnlockClient share={share} />;
}
