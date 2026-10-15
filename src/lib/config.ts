export const config = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:3333",
  appStoreUrl: (import.meta.env.VITE_APP_STORE_URL as string | undefined) || null,
  playStoreUrl: (import.meta.env.VITE_PLAY_STORE_URL as string | undefined) || null,
};
