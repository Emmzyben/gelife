import { PageHero, SiteFooter, SiteHeader } from "@/components/site-shell";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="GELife Group LLC" title={title}><p>Last updated {updated}</p></PageHero>
        <section className="section">
          <div className="site-shell legal-copy max-w-3xl">{children}</div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
