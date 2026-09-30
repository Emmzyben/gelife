import type { AnchorHTMLAttributes } from "react";

/**
 * Plain anchor used instead of next/link.
 *
 * vinext 1.0.0-beta.5's client router throws "navigateClientSide is not a
 * function" when a <Link> is clicked, so clicks did nothing. Full page loads are
 * fast for a site this size and cannot break that way. If you upgrade vinext and
 * confirm client navigation works, you can switch this file back to next/link.
 */
export default function Link({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...props} />;
}
