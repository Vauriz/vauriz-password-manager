import { createClient as createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

// Force dynamic rendering — never prerender this page
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  return <DashboardClient userEmail={user.email} userId={user.id} />;
}
