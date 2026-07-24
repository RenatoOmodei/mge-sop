export type SopConfig = {
  apiBaseUrl?: string;
  realtimeEnabled?: boolean;
  environment?: string;
  version?: string;
  builtAt?: string;
};

export type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

declare global {
  interface Window {
    SOP_CONFIG?: SopConfig;
  }
}

export async function api<T>(path: string, init: ApiOptions = {}): Promise<T> {
  const baseUrl = String(window.SOP_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  const url = baseUrl ? `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : path;
  const headers = new Headers(init.headers || {});
  let body: BodyInit | undefined;

  if (init.body !== undefined) {
    if (init.body instanceof FormData || init.body instanceof Blob || typeof init.body === 'string') {
      body = init.body;
    } else {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(init.body);
    }
  }

  const response = await fetch(url, {
    credentials: baseUrl ? 'include' : 'same-origin',
    ...init,
    headers,
    body
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Falha na comunicacao com o servidor.');
  }

  return data as T;
}

export function realtimeEnabled() {
  return window.SOP_CONFIG?.realtimeEnabled !== false;
}

export function realtimeUrl(path = '/api/realtime') {
  const baseUrl = String(window.SOP_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  const target = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl || window.location.origin);
  target.protocol = target.protocol === 'https:' ? 'wss:' : 'ws:';
  return target.toString();
}
