export const CONTACT_EMAIL = "info@gelifegroup.org";

export const config = {
  // Using the Next.js rewrite or environment variable
  siteUrl: () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

// Expose these as functions for backwards compatibility where they are used
export const emailEnabled = () => true; // Assuming the PHP backend has PHPMailer set up
export const stripeEnabled = () => process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true';
export const adminEnabled = () => true; // Admin is handled via PHP auth now
