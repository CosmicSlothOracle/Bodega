import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SmoothScrollProvider } from "@/components/site/SmoothScrollProvider";
import { Analytics } from "@/components/analytics/Analytics";
import { HashAuthSniffer } from "@/components/auth/HashAuthSniffer";

export default function BloomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HashAuthSniffer />
      <SmoothScrollProvider />
      <Analytics />
      <SiteHeader transparentOnTop />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
