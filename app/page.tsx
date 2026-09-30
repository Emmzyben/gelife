import Image from "next/image";
import Link from "@/components/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-glow" aria-hidden="true" />
          <div className="site-shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Houston expertise. Global perspective.</p>
              <h1>Build capability.<br /><span>Transform performance.</span></h1>
              <p className="hero-lede">GELife Group helps organizations strengthen their people, improve operations, and navigate complex energy and business decisions with confidence.</p>
              <div className="button-row">
                <Link href="/contact" className="button-primary">Request a consultation <span aria-hidden="true">→</span></Link>
                <Link href="/services" className="text-link">Explore our services <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="trust-line">
                <span>Practical expertise</span><span>Tailored delivery</span><span>Measurable outcomes</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="image-frame">
                <Image src="/images/business-team.png" alt="A diverse professional team collaborating during a strategy session" width={565} height={589} priority />
              </div>
              <div className="floating-card">
                <span className="pulse" aria-hidden="true" />
                <div><strong>Three integrated pillars</strong><small>People · Energy · Enterprise</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="site-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">What we do</p>
                <h2>Expert support where capability meets execution.</h2>
              </div>
              <p>From workforce development to technical energy consulting and business transformation, every engagement is shaped around your real operating priorities.</p>
            </div>
            <div className="service-grid">
              <article className="service-card">
                <div className="service-icon" aria-hidden="true">01</div>
                <p className="card-kicker">People</p>
                <h3>Professional Training</h3>
                <p>Build job-ready capability through customized programs and self-paced professional courses with secure learner access.</p>
                <Link href="/training" aria-label="Explore professional courses">Explore professional courses <span>→</span></Link>
              </article>
              <article className="service-card featured">
                <div className="service-icon" aria-hidden="true">02</div>
                <p className="card-kicker">Energy</p>
                <h3>Energy Technical Services</h3>
                <p>Strengthen projects and operations with field-informed expertise across drilling, formation evaluation, and technical decision support.</p>
                <Link href="/services#energy" aria-label="Learn more about energy technical services">Explore energy expertise <span>→</span></Link>
              </article>
              <article className="service-card">
                <div className="service-icon" aria-hidden="true">03</div>
                <p className="card-kicker">Enterprise</p>
                <h3>Business Advisory</h3>
                <p>Turn strategy into execution through transformation planning, operational improvement, management advisory, and opportunity development.</p>
                <Link href="/services#advisory" aria-label="Learn more about business advisory">See advisory services <span>→</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="section outcome-section">
          <div className="site-shell outcome-grid">
            <div className="outcome-image">
              <Image src="/images/energy-model.png" alt="Technical subsurface model used in energy-sector analysis" width={415} height={279} />
              <span className="image-label">Technical insight for better decisions</span>
            </div>
            <div>
              <p className="eyebrow !text-[#ffb282]">How we work</p>
              <h2 className="text-[clamp(2rem,4vw,3.35rem)] font-extrabold">Clear advice. Practical delivery. Lasting value.</h2>
              <p className="light-copy">We combine more than two decades of energy and operational leadership experience with a collaborative, outcome-driven approach.</p>
              <ul className="check-list">
                <li><span>✓</span><div><strong>Diagnose the real need</strong><small>We clarify the business, capability, and operating gap before recommending a solution.</small></div></li>
                <li><span>✓</span><div><strong>Design for your context</strong><small>Every engagement is adapted to your workforce, market, risk profile, and objectives.</small></div></li>
                <li><span>✓</span><div><strong>Deliver for adoption</strong><small>We focus on practical transfer, accountable execution, and measurable next steps.</small></div></li>
              </ul>
              <Link href="/about" className="button-primary button-light">Why GELife Group <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="site-shell cta-inner">
            <div>
              <p className="eyebrow">Professional learning</p>
              <h2>Learn at your pace—or build a program for your team.</h2>
              <p>Browse GELife courses, create secure learner access, and continue learning from your personal dashboard.</p>
            </div>
            <Link href="/training" className="button-primary">Browse professional courses <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
