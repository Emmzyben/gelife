/**
 * Base URL of the PHP REST API backend (XAMPP/Apache).
 * Set NEXT_PUBLIC_PHP_API_URL in the deployment environment to override.
 * Requests are sent server-side through Next.js route handlers.
 */
const PHP_API = (
  process.env.NEXT_PUBLIC_PHP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.upcionsunlimited.org/php-backend/api"
    : "http://localhost/gelife/php-backend/api")
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
  const [requestPath, query = ""] = path.split("?", 2);
  const queryParams = new URLSearchParams(query);
  const phpEndpoint = new URL(`${PHP_API}/index.php`);

  if (/\/?index\.php$/.test(requestPath)) {
    queryParams.forEach((value, key) => phpEndpoint.searchParams.append(key, value));
  } else {
    phpEndpoint.searchParams.set("_route", requestPath.replace(/^\/+/, ""));
    queryParams.forEach((value, key) => phpEndpoint.searchParams.append(key, value));
  }
  
  const customHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (!customHeaders["Content-Type"] && !(rest.body instanceof FormData)) {
    customHeaders["Content-Type"] = "application/json";
  }

  return fetch(phpEndpoint, {
    cache: "no-store",
    headers: customHeaders,
    ...rest,
  });
}
