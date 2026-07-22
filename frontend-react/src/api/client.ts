export type SopConfig = {
  apiBaseUrl?: string;
  realtimeEnabled?: boolean;
  environment?: string;
};

declare global {
  interface Window {
    SOP_CONFIG?: SopConfig;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = String(window.SOP_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  const url = baseUrl ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : path;
  const response = await fetch(url, {
    credentials: baseUrl ? 'include' : 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    ...init
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Falha na comunicacao com o servidor.');
  }
  return data as T;
}
