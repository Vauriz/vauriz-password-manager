'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/client';

export default function PricingPage() {
  const [loading, setLoading] = useState(null); // 'monthly' or 'lifetime'

  const handleCheckout = async (priceId, mode) => {
    setLoading(mode);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode, userId: session.user.id })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout failed: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="dashboard">
      <div className="bg-grid" />
      <div className="bg-gradient-orb purple" />
      <div className="bg-gradient-orb blue" />

      <Navbar email="Vauriz Upgrade" onLogout={() => window.location.href = '/dashboard'} />

      <div className="dashboard-content" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Upgrade to Premium
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '48px' }}>
          Unlock unlimited Dead Man's Switches and robust Zero-Knowledge infrastructure.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          {/* Subscriber Tier */}
          <div className="glass-card" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Vauriz Monthly</h2>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '8px' }}>$2.99<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Cancel anytime. Unlocks all core premium features.</p>
            
            <ul style={{ textAlign: 'left', margin: '0 0 32px 0', padding: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <li>✓ Unlimited Password Vaults</li>
              <li>✓ <strong style={{ color: 'var(--text-bright)' }}>Unlimited</strong> Legacy Shares</li>
              <li>✓ Zero-Knowledge Architecture</li>
              <li>✓ Priority Support</li>
            </ul>

            <button 
              className="btn btn-primary btn-full" 
              onClick={() => handleCheckout('price_1TFFsRRtBDKqzUTSWno7hArD', 'subscription')}
              disabled={loading !== null}
            >
              {loading === 'subscription' ? <span className="spinner" /> : 'Subscribe Now'}
            </button>
          </div>

          {/* Lifetime Tier */}
          <div className="glass-card" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(124, 58, 237, 0.5)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-gradient)', padding: '4px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              MOST POPULAR
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Lifetime Access</h2>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '8px' }}>$49<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/once</span></div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Pay once, secure your legacy forever. No recurring bills.</p>
            
            <ul style={{ textAlign: 'left', margin: '0 0 32px 0', padding: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              <li>✓ Everything in Monthly</li>
              <li>✓ <strong style={{ color: 'var(--text-bright)' }}>Never pay again</strong></li>
              <li>✓ Early Access to Future Tiers</li>
              <li>✓ 30-Day Money Back Guarantee</li>
            </ul>

            <button 
              className="btn btn-full" 
              onClick={() => handleCheckout('price_1TFFsRRtBDKqzUTSCTa3h1uk', 'payment')}
              disabled={loading !== null}
              style={{ background: 'white', color: 'black', fontWeight: 'bold' }}
            >
              {loading === 'lifetime' ? <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'black' }} /> : 'Get Lifetime Access'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
