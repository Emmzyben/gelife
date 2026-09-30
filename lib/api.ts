/**
 * Base URL of the PHP REST API backend (XAMPP/Apache).
 * Set NEXT_PUBLIC_PHP_API_URL in .env.local to override.
 * Next.js rewrites proxies /api/* in development so the browser never hits
 * a different origin — no CORS headers needed on the PHP side during dev.
 */
const PHP_API = (
  process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost/gelife/php-backend/api"
).replace(/\/+$/, "");

/**
 * Calls the PHP API. Path should start with "/", e.g. "/auth/login".
 * Authenticated callers pass an Authorization: Bearer header explicitly.
 */
export async function phpApi(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const { headers, ...rest } = options;
  
  const customHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (!customHeaders["Content-Type"] && !(rest.body instanceof FormData)) {
    customHeaders["Content-Type"] = "application/json";
  }

  return fetch(`${PHP_API}${path}`, {
    cache: "no-store",
    headers: customHeaders,
    ...rest,
  });
}
