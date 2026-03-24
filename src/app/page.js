import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="bg-grid" />
      <div className="bg-gradient-orb purple" />
      <div className="bg-gradient-orb blue" />

      {/* Navbar */}
      <header className="navbar landing-navbar">
        <div className="navbar-brand">
          <Image src="/logo.png" alt="Vauriz Logo" width={32} height={32} className="landing-logo-img" />
          <span className="navbar-title">Vauriz</span>
        </div>
        <div className="navbar-actions">
          <Link href="/login" className="btn btn-secondary">Log In</Link>
          <Link href="/login" className="btn btn-primary">Start for Free</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-content">
        <section className="hero-section">
          <div className="hero-badge">Military-Grade Security</div>
          <h1 className="hero-title">
            Absolute Security. <br />
            <span className="hero-gradient">Zero Knowledge.</span>
          </h1>
          <p className="hero-subtitle">
            The premium password manager crafted for those who refuse to compromise. End-to-End encryption and a revolutionary Dead Man's Switch to protect your digital legacy.
          </p>
          <div className="hero-cta-group">
            <Link href="/login" className="btn btn-primary hero-btn">
              Secure Your Vault Today
            </Link>
            <p className="hero-price">Start for free. Premium plans at $2.99/mo.</p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <h2 className="section-title">Why Trust Vauriz?</h2>
          <div className="password-grid landing-features">
            <div className="glass-card feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>AES-256-GCM</h3>
              <p>Your data is locked with military-grade encryption. It is mathematically impossible to crack.</p>
            </div>
            
            <div className="glass-card feature-card">
              <div className="feature-icon">👁️‍🗨️</div>
              <h3>Zero-Knowledge</h3>
              <p>We can't see your passwords even if we wanted to. Your Master Password acts as the sole decoder ring.</p>
            </div>

            <div className="glass-card feature-card">
              <div className="feature-icon">⏳</div>
              <h3>Dead Man's Switch</h3>
              <p>Securely pass down vital credentials to loved ones if you are inactive for a set duration.</p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing-cta">
          <div className="glass-card cta-card">
            <h2>Take Control of Your Digital Life</h2>
            <p>Join thousands of users who sleep peacefully knowing their passwords are truly private.</p>
            <Link href="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Create Your Free Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 Vauriz Security. All rights reserved.</p>
      </footer>
    </div>
  );
}
