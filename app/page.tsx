'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [inputError, setInputError] = useState(false);

  const handleSignup = () => {
    if (!email || !email.includes('@')) {
      setInputError(true);
      setTimeout(() => setInputError(false), 1500);
      return;
    }
    setSubmitted(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Nunito:wght@300;400;500;600&display=swap');

        .lc * { box-sizing: border-box; }
        .lc {
          --bg: #FBF8F2;
          --bg-warm: #F3EDE0;
          --ink: #141210;
          --ink-soft: #3D3228;
          --slate: #2A2F36;
          --sage: #2D5A3D;
          --sage-light: #E5EFE8;
          --sage-hover: #1F3D2A;
          --rust: #B85A3A;
          --rust-light: #FAF0EB;
          --muted: #8C7B70;
          --border: #DDD5C8;
          font-family: 'Nunito', sans-serif;
          background: var(--bg);
          color: var(--ink);
          line-height: 1.65;
          overflow-x: hidden;
        }

        /* NAV */
        .lc-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 3rem; background: var(--bg);
          position: sticky; top: 0; z-index: 100;
        }
        .lc-logo { font-family: 'Instrument Serif', serif; font-size: 1.25rem; color: var(--ink); text-decoration: none; }
        .lc-logo span { color: var(--sage); }
        .lc-nav-links { display: flex; gap: 1.5rem; align-items: center; }
        .lc-nav-link { font-size: 0.82rem; color: var(--muted); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .lc-nav-link:hover { color: var(--ink); }
        .lc-nav-btn { font-size: 0.82rem; font-weight: 600; background: var(--sage); color: white; padding: 0.6rem 1.4rem; border-radius: 100px; text-decoration: none; transition: background 0.2s, transform 0.15s; }
        .lc-nav-btn:hover { background: var(--sage-hover); transform: translateY(-1px); }

        /* HERO */
        .lc-hero {
          min-height: 92vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 6rem 3rem 5rem; border-bottom: 1px solid var(--border);
        }
        .lc-hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2.4rem, 5vw, 4.5rem); line-height: 1.15;
          color: var(--slate); letter-spacing: -0.03em; margin-bottom: 2rem;
          animation: lcFadeUp 0.7s ease both;
        }
        .lc-hero h1 em { font-style: italic; color: var(--sage); }
        @keyframes lcFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .lc-hero-desc { font-size: 1.1rem; color: var(--ink-soft); line-height: 1.8; max-width: 500px; margin-bottom: 3rem; font-weight: 400; animation: lcFadeUp 0.7s 0.15s ease both; }
        .lc-hero-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; animation: lcFadeUp 0.7s 0.25s ease both; }
        .lc-btn-main { display: inline-block; background: var(--sage); color: white; padding: 1rem 2.5rem; border-radius: 100px; font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: background 0.2s, transform 0.2s; }
        .lc-btn-main:hover { background: var(--sage-hover); transform: translateY(-2px); }
        .lc-hero-note { font-size: 0.78rem; color: var(--muted); }

        /* STATS */
        .lc-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--border); }
        .lc-stat { padding: 2.5rem 3rem; border-right: 1px solid var(--border); background: var(--bg); }
        .lc-stat:last-child { border-right: none; }
        .lc-stat-num { font-family: 'Instrument Serif', serif; font-size: clamp(2.2rem, 4vw, 3.8rem); color: var(--slate); font-weight: 700; line-height: 1; display: block; margin-bottom: 0.5rem; }
        .lc-stat-label { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }

        /* OPINION */
        .lc-opinion { padding: 2.5rem 3rem; background: var(--sage); text-align: center; }
        .lc-opinion p { font-family: 'Instrument Serif', serif; font-size: clamp(1.2rem, 2.5vw, 1.75rem); font-style: italic; color: white; margin: 0; letter-spacing: -0.01em; }

        /* SHARED */
        .lc-section { padding: 5rem 3rem; border-bottom: 1px solid var(--border); }
        .lc-inner { max-width: 1100px; margin: 0 auto; }
        .lc-section-tag { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 1.25rem; display: block; }
        .lc-h2 { font-family: 'Instrument Serif', serif; font-size: clamp(1.9rem, 3.5vw, 2.9rem); line-height: 1.15; color: var(--slate); letter-spacing: -0.02em; margin-bottom: 0.75rem; }

        /* PROBLEM */
        .lc-problem { background: var(--bg); }
        .lc-problem-intro { font-size: 1rem; color: var(--ink-soft); max-width: 580px; margin-bottom: 3.5rem; line-height: 1.8; }
        .lc-problem-grid { display: grid; grid-template-columns: repeat(2, 1fr); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .lc-problem-block { padding: 2.5rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: white; transition: background 0.2s; }
        .lc-problem-block:hover { background: var(--sage-light); }
        .lc-problem-block:nth-child(2) { border-right: none; }
        .lc-problem-block:nth-child(3) { border-bottom: none; }
        .lc-problem-block:nth-child(4) { border-right: none; border-bottom: none; }
        .lc-problem-num { font-family: 'Instrument Serif', serif; font-size: 1.1rem; color: #C5D9CC; margin-bottom: 0.75rem; }
        .lc-problem-block h3 { font-size: 1rem; font-weight: 600; color: var(--slate); margin-bottom: 0.6rem; }
        .lc-problem-block p { font-size: 0.85rem; color: var(--ink-soft); line-height: 1.75; }

        /* HOW */
        .lc-how { background: var(--bg-warm); }
        .lc-how-inner { max-width: 700px; }
        .lc-steps { margin-top: 3rem; display: flex; flex-direction: column; }
        .lc-step { display: grid; grid-template-columns: 56px 1fr; gap: 1.5rem; padding: 2rem 0; border-top: 1px solid var(--border); align-items: start; }
        .lc-step:last-child { border-bottom: 1px solid var(--border); }
        .lc-step-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--sage); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; margin-top: 0.2rem; }
        .lc-step h3 { font-size: 1rem; font-weight: 600; color: var(--slate); margin-bottom: 0.4rem; }
        .lc-step p { font-size: 0.875rem; color: var(--ink-soft); line-height: 1.75; }

        /* PRIVACY */
        .lc-privacy { background: var(--sage); }
        .lc-privacy .lc-section-tag { color: rgba(255,255,255,0.5); }
        .lc-privacy .lc-h2 { color: white; margin-bottom: 1rem; }
        .lc-privacy-lead { font-size: 1.05rem; color: rgba(255,255,255,0.75); max-width: 640px; margin-bottom: 3.5rem; line-height: 1.8; }
        .lc-privacy-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
        .lc-privacy-item { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 1.5rem; }
        .lc-privacy-icon { font-size: 1.3rem; margin-bottom: 0.75rem; }
        .lc-privacy-item h4 { font-size: 0.9rem; font-weight: 600; color: white; margin-bottom: 0.4rem; }
        .lc-privacy-item p { font-size: 0.8rem; color: rgba(255,255,255,0.6); line-height: 1.65; }

        /* FOUNDER */
        .lc-founder { background: var(--bg); }
        .lc-founder-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 5rem; align-items: start; }
        .lc-founder-title { font-family: 'Instrument Serif', serif; font-size: 1.8rem; color: var(--slate); line-height: 1.3; letter-spacing: -0.01em; margin-bottom: 1rem; }
        .lc-founder-quote { font-family: 'Instrument Serif', serif; font-size: 1.2rem; font-style: italic; color: var(--ink); line-height: 1.7; margin-bottom: 1.5rem; border-left: 3px solid var(--sage); padding-left: 1.5rem; }
        .lc-founder-credit { padding-left: 1.5rem; margin-bottom: 2rem; }
        .lc-founder-name { font-size: 0.85rem; font-weight: 600; color: var(--slate); display: block; }
        .lc-founder-role { font-size: 0.78rem; color: var(--muted); margin-top: 0.2rem; }
        .lc-b2b { padding-left: 1.5rem; border-left: 3px solid var(--border); }
        .lc-b2b-label { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem; display: block; }
        .lc-b2b p { font-size: 0.875rem; color: var(--ink-soft); line-height: 1.75; }

        /* WHY NOW */
        .lc-why { background: var(--rust-light); }
        .lc-why-intro { font-size: 0.95rem; color: var(--ink-soft); max-width: 580px; margin-bottom: 3rem; line-height: 1.75; }
        .lc-why-list { display: flex; flex-direction: column; }
        .lc-why-item { display: grid; grid-template-columns: 140px 1fr; gap: 2.5rem; padding: 2rem 0; border-top: 1px solid var(--border); align-items: start; }
        .lc-why-item:last-child { border-bottom: 1px solid var(--border); }
        .lc-why-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--rust); padding-top: 0.3rem; }
        .lc-why-item h3 { font-size: 1rem; font-weight: 600; color: var(--slate); margin-bottom: 0.4rem; }
        .lc-why-item p { font-size: 0.85rem; color: var(--ink-soft); line-height: 1.75; }

        /* EMAIL */
        .lc-email { background: var(--bg-warm); }
        .lc-email-inner { max-width: 560px; margin: 0 auto; text-align: center; }
        .lc-email .lc-h2 { margin-bottom: 0.75rem; }
        .lc-email-desc { font-size: 0.95rem; color: var(--ink-soft); margin-bottom: 2.5rem; line-height: 1.75; }
        .lc-email-row { display: flex; gap: 0.5rem; }
        .lc-email-input { flex: 1; padding: 0.85rem 1.25rem; border: 1.5px solid var(--border); border-radius: 100px; background: white; font-size: 0.9rem; font-family: 'Nunito', sans-serif; color: var(--ink); outline: none; transition: border-color 0.2s; }
        .lc-email-input::placeholder { color: var(--muted); }
        .lc-email-input:focus { border-color: var(--sage); }
        .lc-email-input.error { border-color: var(--rust); }
        .lc-email-btn { background: var(--sage); color: white; border: none; padding: 0.85rem 1.5rem; border-radius: 100px; font-size: 0.82rem; font-weight: 600; font-family: 'Nunito', sans-serif; cursor: pointer; white-space: nowrap; transition: background 0.2s, transform 0.15s; }
        .lc-email-btn:hover { background: var(--sage-hover); transform: translateY(-1px); }
        .lc-email-fine { font-size: 0.72rem; color: var(--muted); margin-top: 1rem; }
        .lc-email-success { color: var(--sage); font-size: 0.9rem; font-weight: 500; }

        /* CTA */
        .lc-cta { background: var(--bg); text-align: center; }
        .lc-cta .lc-h2 { margin-bottom: 0.75rem; }
        .lc-cta-sub { font-size: 1rem; color: var(--ink-soft); margin-bottom: 2.5rem; }
        .lc-btn-cta { display: inline-block; background: var(--sage); color: white; padding: 1rem 2.75rem; border-radius: 100px; font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: background 0.2s, transform 0.2s; }
        .lc-btn-cta:hover { background: var(--sage-hover); transform: translateY(-2px); }
        .lc-cta-note { margin-top: 1rem; font-size: 0.75rem; color: var(--muted); }

        /* FOOTER */
        .lc-footer { padding: 1.75rem 3rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--muted); }
        .lc-footer a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
        .lc-footer a:hover { color: var(--sage); }
        .lc-footer-links { display: flex; gap: 1.5rem; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .lc-nav { padding: 1.25rem 1.5rem; }
          .lc-nav-links .lc-nav-link { display: none; }
          .lc-hero { padding: 5rem 1.5rem 4rem; min-height: auto; }
          .lc-stats { grid-template-columns: 1fr; }
          .lc-stat { border-right: none; border-bottom: 1px solid var(--border); }
          .lc-section { padding: 4rem 1.5rem; }
          .lc-opinion { padding: 2rem 1.5rem; }
          .lc-problem-grid { grid-template-columns: 1fr; }
          .lc-problem-block:nth-child(2) { border-right: 1px solid var(--border); }
          .lc-problem-block:nth-child(3) { border-bottom: 1px solid var(--border); }
          .lc-founder-grid { grid-template-columns: 1fr; gap: 2rem; }
          .lc-why-item { grid-template-columns: 1fr; gap: 0.25rem; }
          .lc-email-row { flex-direction: column; }
          .lc-footer { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      <div className="lc">

        {/* NAV */}
        <nav className="lc-nav">
          <a href="/" className="lc-logo">Lab<span>Companion</span></a>
          <div className="lc-nav-links">
            <a href="#how" className="lc-nav-link">How it works</a>
            <a href="#why" className="lc-nav-link">Why now</a>
            <Link href="/upload" className="lc-nav-btn">Try it free</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="lc-hero">
          <h1>You got your lab results.<br /><em>Now you&apos;re Googling at midnight,</em><br />trying to figure out what actually matters.</h1>
          <p className="lc-hero-desc">
            Lab Companion turns confusing medical numbers into simple explanations, so you can walk into your next appointment actually prepared. Everything happens in your browser. Nothing leaves your device.
          </p>
          <div className="lc-hero-actions">
            <Link href="/upload" className="lc-btn-main">Analyze my results →</Link>
            <span className="lc-hero-note">🔒 Free · No account · Nothing uploaded</span>
          </div>
        </section>

        {/* STATS */}
        <div className="lc-stats">
          <div className="lc-stat">
            <span className="lc-stat-num">225M</span>
            <div className="lc-stat-label">Americans receive lab results every year</div>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-num">7–12</span>
            <div className="lc-stat-label">Minutes a doctor has per patient visit</div>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-num">30+</span>
            <div className="lc-stat-label">Biomarkers explained across 7 categories</div>
          </div>
        </div>

        {/* OPINION */}
        <div className="lc-opinion">
          <p>You shouldn&apos;t have to upload your medical data just to understand it.</p>
        </div>

        {/* PROBLEM */}
        <section className="lc-section lc-problem">
          <div className="lc-inner">
            <span className="lc-section-tag">The problem</span>
            <h2 className="lc-h2">Most patients leave more confused<br />than when they arrived.</h2>
            <p className="lc-problem-intro">
              You shouldn&apos;t need a medical degree to understand your own health. But the gap between &ldquo;you have results&rdquo; and &ldquo;you understand them&rdquo; is wide and nobody is filling it without asking for your data first.
            </p>
            <div className="lc-problem-grid">
              {[
                { n: '01', t: 'The panic Google', p: "You see 'high LDL' and search it. Thirty seconds later you're convinced you're dying. You're probably not. But there was no way to know that without the spiral." },
                { n: '02', t: 'The wasted appointment', p: "Your doctor has 7 minutes. You're unprepared, you forget which number was flagged, and you leave with a pamphlet instead of answers." },
                { n: '03', t: 'The caregiver gap', p: "Your parent gets labs back. You try to explain it to them. You don't actually know what it means either. The next appointment is three months away." },
                { n: '04', t: 'Every other tool uploads your data', p: "The existing alternatives send your most sensitive medical information to a cloud server. You're trading your health records for an explanation." },
              ].map((b) => (
                <div key={b.n} className="lc-problem-block">
                  <div className="lc-problem-num">{b.n}</div>
                  <h3>{b.t}</h3>
                  <p>{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="lc-section lc-how" id="how">
          <div className="lc-inner">
            <div className="lc-how-inner">
              <span className="lc-section-tag">How it works</span>
              <h2 className="lc-h2">Three steps. Zero uploads.</h2>
              <div className="lc-steps">
                {[
                  { n: '1', t: 'Upload your report', p: 'Drag and drop a PDF or image of your lab results. Quest, LabCorp, hospital portals, international formats. Handled by local OCR that runs entirely in your browser. Nothing is transmitted.' },
                  { n: '2', t: 'Six AI agents analyze everything', p: 'A parser, context agent, evidence agent, questions agent, safety agent, and orchestrator work through your results. Flagging what matters, explaining what it means, without unnecessary alarm.' },
                  { n: '3', t: 'Walk into your appointment ready', p: 'Plain-language explanations for every flagged marker. Specific questions to ask your doctor. A summary you can actually use in a 7-minute window.' },
                ].map((s) => (
                  <div key={s.n} className="lc-step">
                    <div className="lc-step-circle">{s.n}</div>
                    <div><h3>{s.t}</h3><p>{s.p}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRIVACY */}
        <section className="lc-section lc-privacy">
          <div className="lc-inner">
            <span className="lc-section-tag">On privacy</span>
            <h2 className="lc-h2">Your data doesn&apos;t leave your browser.<br /></h2>
            <p className="lc-privacy-lead">
              We built Lab Companion browser local by design. As health data regulation tightens, this is an advantage cloud-based competitors can&apos;t replicate without rebuilding from scratch.
            </p>
            <div className="lc-privacy-grid">
              {[
                { icon: '🔒', t: 'Zero data transmission', p: 'Your report is processed in your browser. Nothing is sent to any server, not even ours.' },
                { icon: '👤', t: 'No account required', p: 'No email, no sign-up, no tracking. Open the app, upload your results, understand them. Done.' },
                { icon: '📡', t: 'Works offline', p: 'Once loaded, Lab Companion runs without an internet connection. Full privacy, anywhere.' },
                { icon: '🏗️', t: 'Structurally defensible', p: 'Cloud-first competitors face a rebuild as regulations tighten. We never will.' },
              ].map((item) => (
                <div key={item.t} className="lc-privacy-item">
                  <div className="lc-privacy-icon">{item.icon}</div>
                  <h4>{item.t}</h4>
                  <p>{item.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOUNDER */}
        <section className="lc-section lc-founder">
          <div className="lc-inner">
            <div className="lc-founder-grid">
              <div>
                <span className="lc-section-tag">Who built this</span>
                <p className="lc-founder-title">Built by someone who cares about the gap.</p>
              </div>
              <div>
                <blockquote className="lc-founder-quote">
                  &ldquo;I built Lab Companion after seeing how often patients receive lab results they don&apos;t understand and how quickly that turns into confusion, anxiety, or missed questions during appointments. Privacy wasn&apos;t an afterthought. It was the whole point.&rdquo;
                </blockquote>
                <div className="lc-founder-credit">
                  <span className="lc-founder-name">Krista Reed</span>
                  <span className="lc-founder-role">Founder · Public Health · AI Developer · Google MedGemma Challenge</span>
                </div>
                <div className="lc-b2b">
                  <span className="lc-b2b-label">Built for individuals — expandable to health systems</span>
                  <p>The same system can be used in patient portals, clinics, and employer health programs to help patients understand results and reduce time spent explaining them during visits.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY NOW */}
        <section className="lc-section lc-why" id="why">
          <div className="lc-inner">
            <span className="lc-section-tag">Why now</span>
            <h2 className="lc-h2">The market is moving.</h2>
            <p className="lc-why-intro">
              Healthcare is shifting toward AI-powered understanding, but most tools rely on cloud processing and data collection. We&apos;re building the privacy-first alternative from the start.
            </p>
            <div className="lc-why-list">
              {[
                { label: 'Market signal', t: 'Superpower raised $30M — for people who want to get tested', p: "We're solving the other side: the 225M people who already have results they can't interpret. Different problem, bigger population, no privacy-first solution at scale. We submitted to Google's MedGemma Challenge the same day they announced." },
                { label: 'Regulatory tailwind', t: 'Health data laws are tightening everywhere', p: "The White House AI policy and state-level legislation are creating structural advantages for browser-local architecture. Cloud-first competitors will have to rebuild. We never will." },
                { label: 'Big tech validation', t: 'Anthropic and Apple both launched health AI features in 2026', p: "Consumer demand for AI-powered health literacy is proven. The privacy-first alternative that doesn't lock you into an ecosystem isn't built at scale yet." },
              ].map((item) => (
                <div key={item.t} className="lc-why-item">
                  <span className="lc-why-label">{item.label}</span>
                  <div><h3>{item.t}</h3><p>{item.p}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EMAIL */}
        <section className="lc-section lc-email">
          <div className="lc-email-inner">
            <span className="lc-section-tag">Stay in the loop</span>
            <h2 className="lc-h2">We&apos;re building the privacy-first<br />standard for health literacy.</h2>
            <p className="lc-email-desc">Get updates on new features and early access to Trends — multi-report tracking that shows how your biomarkers move over time.</p>
            {!submitted ? (
              <>
                <div className="lc-email-row">
                  <input
                    type="email"
                    className={`lc-email-input${inputError ? ' error' : ''}`}
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                  />
                  <button className="lc-email-btn" onClick={handleSignup}>Get updates</button>
                </div>
                <p className="lc-email-fine">No spam. Unsubscribe anytime.</p>
              </>
            ) : (
              <p className="lc-email-success">✓ You&apos;re on the list.</p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="lc-section lc-cta">
          <div className="lc-inner">
            <span className="lc-section-tag">Try it now</span>
            <h2 className="lc-h2">Understand your lab results<br />in minutes.</h2>
            <p className="lc-cta-sub">Free. Private. No account. No catch.</p>
            <Link href="/upload" className="lc-btn-cta">Analyze my results →</Link>
            <p className="lc-cta-note">Nothing leaves your browser. Ever.</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lc-footer">
          <span>© 2026 Lab Companion · Built by <a href="https://ditdigitallabs.com">DitDigitalLabs</a></span>
          <div className="lc-footer-links">
            <Link href="/upload">App</Link>
            <a href="mailto:hello@labcompanion.app">Contact</a>
          </div>
        </footer>

      </div>
    </>
  );
}