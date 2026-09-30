import { phpApi } from "./api";

export async function getCurrentUser() {
  try {
    const res = await phpApi("/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

export const ADMIN_FLASH_COOKIE = "gelife_admin_flash";
