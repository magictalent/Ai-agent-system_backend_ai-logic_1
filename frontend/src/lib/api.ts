export const API_BASE = (() => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (/netlify\.app$/i.test(host)) {
      return 'https://ai-agent-system-backend-ai-logic-1.onrender.com';
    }
  }
  return 'http://localhost:3001';
})();

export function api(path: string) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

