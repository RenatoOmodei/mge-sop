import { useEffect, useState } from 'react';
import { api } from './api/client';
import './styles.css';

type HealthResponse = {
  ok: boolean;
  appName: string;
  dbProvider: string;
  version: string;
};

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<HealthResponse>('/api/render-health')
      .then((data) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="react-shell">
      <header>
        <img src="/pwa-icon-192.png" alt="MGE S&OP" />
        <div>
          <h1>S&OP React/TypeScript</h1>
          <p>Base paralela para migracao segura por modulos.</p>
        </div>
      </header>

      <section className="status-grid">
        <article>
          <span>Servidor</span>
          <strong>{error ? 'Erro' : health ? 'Online' : 'Carregando'}</strong>
        </article>
        <article>
          <span>Banco</span>
          <strong>{health?.dbProvider || '-'}</strong>
        </article>
        <article>
          <span>Versao</span>
          <strong>{health?.version || '-'}</strong>
        </article>
      </section>

      {error && <p className="error">{error}</p>}
    </main>
  );
}
