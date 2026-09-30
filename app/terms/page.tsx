import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms & refund policy", description: "Terms for GELife Learning courses, including payment and refunds." };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & refund policy" updated="September 23, 2026">
      <p>These terms apply to courses purchased through GELife Learning, operated by GELife Group LLC (&ldquo;GELife&rdquo;, &ldquo;we&rdquo;). By enrolling, you agree to them. Consulting and customized training engagements are covered by a separate written agreement.</p>

      <h2>Your learner account</h2>
      <ul>
        <li>Your learner ID and access code are for you alone. Do not share them.</li>
        <li>If you lose your access code, you can reset it from the login page or by contacting us.</li>
        <li>We may suspend an account that is shared, misused, or used to copy course material for redistribution.</li>
      </ul>

      <h2>Prices and payment</h2>
      <ul>
        <li>Prices are shown in US dollars on each course page.</li>
        <li>A course opens once payment is confirmed. Card payments are processed by Stripe.</li>
        <li>For organizations buying for several learners, contact us for invoicing.</li>
      </ul>

      <h2>Access</h2>
      <p>Once a course opens, you can use it for at least 12 months from the date of purchase. We may update, correct or add to course content over time.</p>

      <h2>Refunds</h2>
      <p>If a course is not right for you, email <a href="mailto:info@gelifegroup.org">info@gelifegroup.org</a> within 14 days of purchase and we will refund you in full. After 14 days, refunds are at our discretion. When a refund is issued, access to that course ends.</p>

      <h2>Course content</h2>
      <p>Course materials are owned by GELife Group LLC and licensed to you for your personal professional development. You may not copy, resell or republish them.</p>
      <p>Courses provide general professional education. They are not a substitute for site-specific safety, engineering, legal or financial advice, and applying them in your workplace remains your responsibility and your employer&rsquo;s.</p>

      <h2>Liability</h2>
      <p>To the extent the law allows, our total liability for any claim about a course is limited to the amount you paid for it.</p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of Texas.</p>

      <h2>Contact</h2>
      <p>GELife Group LLC, 14511 Old Katy Road, Houston, TX 77079 &middot; <a href="mailto:info@gelifegroup.org">info@gelifegroup.org</a> &middot; +1 281 508 5225</p>
    </LegalPage>
  );
}
