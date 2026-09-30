const PHP_API_URL = (
  process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost/gelife/php-backend/api"
).replace(/\/+$/, "");

export function backendAssetUrl(value: string | null | undefined): string {
  if (!value) return "";

  const apiBase = new URL(PHP_API_URL, "http://localhost");
  const backendOrigin = apiBase.origin;
  const apiPath = apiBase.pathname.replace(/\/+$/, "");
  const backendRoot = apiPath.replace(/\/api$/i, "").replace(/\/+$/, "");
  let asset: URL;

  try {
    asset = new URL(value, backendOrigin);
  } catch {
    return value;
  }

  const localHost = ["localhost", "127.0.0.1", "::1"].includes(asset.hostname);
  if (!localHost && asset.origin !== backendOrigin) return value;

  const uploadPath = asset.pathname.match(/(?:^|\/)uploads\/(.+)$/);
  if (!uploadPath) return value;

  asset.pathname = `${backendRoot}/uploads/${uploadPath[1]}`;
  asset.protocol = apiBase.protocol;
  asset.host = apiBase.host;
  return asset.toString();
}