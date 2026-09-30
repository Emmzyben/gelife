import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy policy", description: "How GELife Group collects, uses and protects personal information." };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="September 23, 2026">
      <p>GELife Group LLC (&ldquo;GELife&rdquo;, &ldquo;we&rdquo;) runs this website and the GELife Learning portal. This policy explains what personal information we collect, why, and the choices you have. Questions go to <a href="mailto:info@gelifegroup.org">info@gelifegroup.org</a>.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>When you contact us:</strong> your name, email address, organization (if given), area of interest and message.</li>
        <li><strong>When you enroll in a course:</strong> your name, email address, organization (if given), the courses you enroll in, payment status, and which lessons you mark complete.</li>
        <li><strong>When you pay:</strong> card payments are handled by Stripe. We receive confirmation that you paid and the amount. We never see or store your full card number.</li>
        <li><strong>Technical data:</strong> our hosting provider processes IP addresses and request logs to deliver and secure the site.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry and provide the services you ask about.</li>
        <li>To create your learner account, give you access to courses you have paid for, and save your progress.</li>
        <li>To send you essential messages about your account, enrollment and payment, such as your login details or a recovery link.</li>
      </ul>
      <p>We do not sell your personal information, and we do not send marketing email unless you ask us to.</p>

      <h2>Cookies</h2>
      <p>We use one essential cookie to keep you signed in to the learner portal. It expires after seven days or when you sign out. We do not use advertising or analytics cookies. Our fonts are loaded from Google Fonts, which means your browser contacts Google&rsquo;s servers when you visit.</p>

      <h2>Who we share it with</h2>
      <p>We use a small number of service providers to run the site, and they process data only on our behalf:</p>
      <ul>
        <li><strong>Cloudflare</strong> hosts the website and stores learner and enquiry records.</li>
        <li><strong>Stripe</strong> processes card payments.</li>
        <li><strong>Resend</strong> delivers account and enquiry emails.</li>
      </ul>
      <p>We may also disclose information when the law requires it.</p>

      <h2>How long we keep it</h2>
      <p>We keep learner accounts while they are in use and for up to three years after your last activity, so you can return to your courses. We keep enquiries for as long as needed to respond and follow up, and for up to two years afterwards. Payment records are kept as long as tax and accounting rules require.</p>

      <h2>Your choices</h2>
      <p>You can ask us to access, correct or delete your personal information by emailing <a href="mailto:info@gelifegroup.org">info@gelifegroup.org</a>. Deleting your learner account removes your course access and progress. Depending on where you live, you may have additional rights under local law, and we will honor them.</p>

      <h2>Security</h2>
      <p>Access codes and sign-in sessions are stored only in hashed form, and the site is served over HTTPS. No system is perfectly secure, so please keep your access code private.</p>

      <h2>Children</h2>
      <p>Our services are for adults and professionals. We do not knowingly collect information from anyone under 16.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date at the top of this page.</p>

      <h2>Contact</h2>
      <p>GELife Group LLC, 14511 Old Katy Road, Houston, TX 77079 &middot; <a href="mailto:info@gelifegroup.org">info@gelifegroup.org</a> &middot; +1 281 508 5225</p>
    </LegalPage>
  );
}
