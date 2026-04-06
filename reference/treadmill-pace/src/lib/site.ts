/** Base URL for metadata (Open Graph, canonical). Prefer setting NEXT_PUBLIC_SITE_URL in production. */
export function getMetadataBase(): URL {
  const custom = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (custom) {
    const normalized = custom.replace(/\/$/, "");
    return new URL(`${normalized}/`);
  }
  const vercel = process.env.VERCEL_URL?.replace(/^https?:\/\//, "");
  if (vercel) {
    return new URL(`https://${vercel}/`);
  }
  return new URL("http://localhost:3000/");
}
