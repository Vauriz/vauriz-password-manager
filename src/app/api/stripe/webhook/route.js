import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    if (!webhookSecret) throw new Error('No STRIPE_WEBHOOK_SECRET set in environment variables');
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId || session.client_reference_id;
        if (userId) {
          const status = session.mode === 'payment' ? 'lifetime' : 'premium';
          const supabaseAdmin = createAdminClient();
          await supabaseAdmin.from('profiles').upsert({
             id: userId,
             stripe_customer_id: session.customer,
             subscription_status: status,
             updated_at: new Date().toISOString()
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        // Trialing or Active are both considered premium access
        const isActive = subscription.status === 'active' || subscription.status === 'trialing'; 
        
        // Find user by customer ID
        const supabaseAdmin = createAdminClient();
        const { data: profile } = await supabaseAdmin.from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();
          
        if (profile) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: isActive ? 'premium' : 'free',
            updated_at: new Date().toISOString()
          }).eq('id', profile.id);
        }
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
