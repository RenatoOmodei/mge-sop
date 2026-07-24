import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { api, realtimeEnabled, realtimeUrl } from './api/client';
import {
  AdminScreen,
  AiScreen,
  ApsScreen,
  BillingScreen,
  DashboardScreen,
  LoadingScreen,
  PcpScreen,
  ProductsScreen,
  PurchasePendingScreen,
  QualityAlertsScreen,
  QualityRncScreen,
  ReportsScreen,
  SequencingScreen,
  ThirdPartyScreen
} from './modules/ModuleScreens';
import { OrdersScreen } from './modules/OrdersScreen';
import './styles.css';

type HealthResponse = {
  ok: boolean;
  appName: string;
  dbProvider: string;
  version: string;
  environment?: string;
  uptimeSeconds?: number;
};
type BackupSummary = {
  name?: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
  type?: string;
};
type SystemHealth = {
  appName?: string;
  version?: string;
  environment?: string;
  startedAt?: string;
  uptimeSeconds?: number;
  serverOnline?: boolean;
  dbConnected?: boolean;
  dbProvider?: string;
  requestedDbProvider?: string;
  dbError?: string;
  host?: string;
  port?: number;
  protocol?: string;
  httpsEnabled?: boolean;
  activeSessions?: number | null;
  realtimeClients?: number | null;
  latestBackup?: BackupSummary | null;
  nodeVersion?: string;
  platform?: string;
};
type BeforeInstallPromptEvent = Event & {
  platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export type UserRole = 'admin' | 'commercial' | 'production' | 'financial' | 'viewer' | 'user';
export type TabKey =
  | 'orders'
  | 'dashboard'
  | 'billing'
  | 'loading'
  | 'thirdParty'
  | 'pcp'
  | 'sequencing'
  | 'aps'
  | 'products'
  | 'quality'
  | 'reports'
  | 'ai'
  | 'admin';
type ScreenKey =
  | TabKey
  | 'qualityRnc'
  | 'system'
  | 'adminStatus'
  | 'adminCustomers'
  | 'adminPcpMotives'
  | 'adminUsers'
  | 'adminApsOperators'
  | 'adminApsCalendar'
  | 'adminApsWorkCenters'
  | 'adminApsOperations'
  | 'purchasePending';

export type CurrentUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  canEditOrders: boolean;
  visibleTabs: TabKey[];
  editableTabs: TabKey[];
};

type NotificationItem = {
  id: string;
  level: 'critical' | 'warning' | 'info';
  screen: ScreenKey;
  title: string;
  message: string;
  count: number;
};
type NotificationStats = {
  total: number;
  critical: number;
  warning: number;
  info: number;
};
type RealtimeMessage = {
  type?: string;
  scopes?: unknown;
  at?: string;
};
type RealtimeSignalMap = Record<string, number>;
type ScreenAlertMap = Partial<Record<ScreenKey, number>>;
type ChangeEventItem = {
  id?: string;
  createdAt?: string;
  scopes?: string[];
};

type ScreenMeta = {
  key: ScreenKey;
  accessTab: TabKey;
  label: string;
  title: string;
  subtitle: string;
  module: 'sop' | 'billing' | 'supply' | 'quality' | 'ai' | 'management' | 'registrations';
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  commercial: 'Comercial',
  production: 'Producao',
  financial: 'Financeiro',
  viewer: 'Consulta',
  user: 'Usuario'
};

const APP_NAME = 'Synapse';
const APP_VERSION = '2026.7.13';
type AppEnvironmentTone = 'production' | 'homolog';

const moduleLabels: Record<ScreenMeta['module'], string> = {
  sop: 'S&OP',
  billing: 'Faturamento',
  supply: 'Supply',
  quality: 'Qualidade',
  ai: 'IA',
  management: 'Gestao',
  registrations: 'Cadastros'
};

const screens: ScreenMeta[] = [
  {
    key: 'orders',
    accessTab: 'orders',
    label: 'Pedidos de vendas',
    title: 'Controle de Pedidos de Venda',
    subtitle: 'Carteira comercial, prazos, status e dados operacionais.',
    module: 'sop'
  },
  {
    key: 'dashboard',
    accessTab: 'dashboard',
    label: 'Dashboards',
    title: 'Dashboard S&OP',
    subtitle: 'Indicadores, metas e analises gerenciais.',
    module: 'sop'
  },
  {
    key: 'products',
    accessTab: 'products',
    label: 'Produtos',
    title: 'Produtos',
    subtitle: 'Historico, filtros, graficos e previsao de demanda.',
    module: 'sop'
  },
  {
    key: 'billing',
    accessTab: 'billing',
    label: 'Faturamento',
    title: 'Faturamento',
    subtitle: 'Itens liberados, notas fiscais e dados de transporte.',
    module: 'billing'
  },
  {
    key: 'loading',
    accessTab: 'loading',
    label: 'Aguardando carregamento',
    title: 'Aguardando carregamento',
    subtitle: 'Itens faturados pendentes de carregamento.',
    module: 'supply'
  },
  {
    key: 'thirdParty',
    accessTab: 'thirdParty',
    label: 'Terceiros',
    title: 'Terceiros',
    subtitle: 'Remessas, beneficiamento e retorno de pecas.',
    module: 'supply'
  },
  {
    key: 'purchasePending',
    accessTab: 'pcp',
    label: 'Pedidos de compras pendentes',
    title: 'Pedidos de compras pendentes',
    subtitle: 'Consulta inicial para importacao de tabelas externas de compras.',
    module: 'supply'
  },
  {
    key: 'pcp',
    accessTab: 'pcp',
    label: 'Pendencias PCP',
    title: 'Pendencias PCP',
    subtitle: 'Compras, engenharia, retrabalho e motivos pendentes.',
    module: 'supply'
  },
  {
    key: 'sequencing',
    accessTab: 'sequencing',
    label: 'Sequenciamento Projetos',
    title: 'Sequenciamento Projetos',
    subtitle: 'Atividades, tempos estimados e cronograma.',
    module: 'supply'
  },
  {
    key: 'aps',
    accessTab: 'aps',
    label: 'APS',
    title: 'APS',
    subtitle: 'Programacao finita, centros de trabalho e cenarios.',
    module: 'supply'
  },
  {
    key: 'quality',
    accessTab: 'quality',
    label: 'Alertas',
    title: 'Alertas de Qualidade',
    subtitle: 'Alertas ativos por pedido, SKU, cliente e linha.',
    module: 'quality'
  },
  {
    key: 'qualityRnc',
    accessTab: 'quality',
    label: 'RNC / A3',
    title: 'Modulo Qualidade',
    subtitle: 'RNC, A3, 5W2H e PDCA integrados ao S&OP.',
    module: 'quality'
  },
  {
    key: 'ai',
    accessTab: 'ai',
    label: 'Bancada de IA',
    title: 'Inteligencia Artificial',
    subtitle: 'Base de conhecimento, treinamentos e apoio generativo a decisao.',
    module: 'ai'
  },
  {
    key: 'reports',
    accessTab: 'reports',
    label: 'Relatorio de atividades',
    title: 'Relatorios de atividades',
    subtitle: 'Historico e auditoria das atividades executadas.',
    module: 'management'
  },
  {
    key: 'system',
    accessTab: 'admin',
    label: 'Sistema',
    title: 'Sistema',
    subtitle: 'Saude do sistema, backups e disponibilidade.',
    module: 'management'
  },
  {
    key: 'adminStatus',
    accessTab: 'admin',
    label: 'Cadastro Status',
    title: 'Cadastro Status',
    subtitle: 'Sequencia, tipo de producao e fluxo dos status.',
    module: 'registrations'
  },
  {
    key: 'adminCustomers',
    accessTab: 'admin',
    label: 'Cadastro cliente',
    title: 'Cadastro cliente',
    subtitle: 'Base comercial de clientes.',
    module: 'registrations'
  },
  {
    key: 'adminPcpMotives',
    accessTab: 'admin',
    label: 'Cadastro de motivos PCP',
    title: 'Cadastro de motivos PCP',
    subtitle: 'Motivos de pendencias de compras, engenharia e retrabalho.',
    module: 'registrations'
  },
  {
    key: 'adminUsers',
    accessTab: 'admin',
    label: 'Cadastro de usuarios',
    title: 'Cadastro de usuarios',
    subtitle: 'Usuarios, perfis e permissoes.',
    module: 'registrations'
  },
  {
    key: 'adminApsOperators',
    accessTab: 'aps',
    label: 'Cadastro de operadores',
    title: 'Cadastro de operadores',
    subtitle: 'Operadores, habilidades e operacoes qualificadas para APS.',
    module: 'registrations'
  },
  {
    key: 'adminApsCalendar',
    accessTab: 'aps',
    label: 'Cadastro calendario produtivo',
    title: 'Cadastro calendario produtivo e jornada de trabalho',
    subtitle: 'Jornada, almoco e regra de prioridade do APS.',
    module: 'registrations'
  },
  {
    key: 'adminApsWorkCenters',
    accessTab: 'aps',
    label: 'Cadastro de centro de trabalho',
    title: 'Cadastro de centro de trabalho',
    subtitle: 'Centros de trabalho, capacidade e eficiencia para APS.',
    module: 'registrations'
  },
  {
    key: 'adminApsOperations',
    accessTab: 'aps',
    label: 'Cadastro de operacoes',
    title: 'Cadastro de operacoes',
    subtitle: 'Operacoes puxadas dos status e parametros produtivos.',
    module: 'registrations'
  }
];

const screenByKey = new Map<ScreenKey, ScreenMeta>(screens.map((screen) => [screen.key, screen]));
const screenRealtimeScopes: Record<ScreenKey, string[]> = {
  orders: ['orders', 'pcp', 'quality', 'admin'],
  dashboard: ['dashboard', 'orders', 'billing', 'loading', 'pcp', 'quality'],
  billing: ['billing', 'orders', 'thirdParty'],
  loading: ['loading', 'billing', 'thirdParty', 'orders'],
  thirdParty: ['thirdParty', 'billing'],
  purchasePending: ['pcp', 'thirdParty', 'admin'],
  pcp: ['pcp', 'orders'],
  sequencing: ['sequencing', 'orders', 'pcp'],
  aps: ['aps', 'sequencing', 'orders', 'pcp', 'admin'],
  products: ['products', 'orders'],
  quality: ['quality', 'orders'],
  qualityRnc: ['quality'],
  ai: ['ai', 'orders', 'dashboard', 'products', 'pcp', 'billing', 'quality'],
  reports: ['reports'],
  admin: ['admin', 'orders', 'pcp', 'quality'],
  system: ['admin'],
  adminStatus: ['admin', 'orders', 'dashboard', 'aps'],
  adminCustomers: ['admin', 'orders'],
  adminPcpMotives: ['admin', 'pcp'],
  adminUsers: ['admin'],
  adminApsOperators: ['aps', 'admin'],
  adminApsCalendar: ['aps', 'admin'],
  adminApsWorkCenters: ['aps', 'admin'],
  adminApsOperations: ['aps', 'admin']
};
const notificationRealtimeScopes = new Set(['all', 'orders', 'billing', 'loading', 'thirdParty', 'pcp', 'quality', 'dashboard', 'ai']);

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState('');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authStatus, setAuthStatus] = useState<'checking' | 'anonymous' | 'authenticated'>('checking');
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [currentScreen, setCurrentScreenState] = useState<ScreenKey>('orders');
  const [openModule, setOpenModule] = useState<ScreenMeta['module'] | ''>('sop');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [notificationsUpdatedAt, setNotificationsUpdatedAt] = useState('');
  const [viewedNotificationTokens, setViewedNotificationTokens] = useState<string[]>([]);
  const [screenAlerts, setScreenAlerts] = useState<ScreenAlertMap>({});
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemHealthError, setSystemHealthError] = useState('');
  const [healthOpen, setHealthOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [installStatus, setInstallStatus] = useState('');
  const [appInstalled, setAppInstalled] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateApplying, setUpdateApplying] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [realtimeSignals, setRealtimeSignals] = useState<RealtimeSignalMap>({});
  const environmentTone = resolveEnvironmentTone(health?.environment);
  const environmentClass = environmentTone === 'homolog' ? 'env-homolog' : 'env-production';
  const loginVersion = health?.version || window.SOP_CONFIG?.version || APP_VERSION;

  useEffect(() => {
    applyEnvironmentDocumentTheme(environmentTone);
  }, [environmentTone]);

  useEffect(() => {
    api<HealthResponse>('/api/render-health')
      .then((data) => setHealth(data))
      .catch((err) => setHealthError(err.message));

    api<{ user: CurrentUser }>('/api/me')
      .then(({ user }) => {
        setUser(user);
        setAuthStatus('authenticated');
      })
      .catch(() => {
        setUser(null);
        setAuthStatus('anonymous');
      });
  }, []);

  const visibleScreens = useMemo(() => {
    if (!user) return [];
    return screens.filter((screen) => canViewScreen(user, screen));
  }, [user]);

  const activeScreen = screenByKey.get(currentScreen) || visibleScreens[0] || screens[0];
  const activeRealtimeRefreshKey = realtimeRefreshKeyForScreen(activeScreen.key, realtimeSignals);
  const visibleNotifications = useMemo(
    () => notifications.filter((item) => !viewedNotificationTokens.includes(notificationViewToken(item))),
    [notifications, viewedNotificationTokens]
  );
  const notificationStats = useMemo(() => summarizeNotifications(visibleNotifications), [visibleNotifications]);

  useEffect(() => {
    if (!user) {
      setViewedNotificationTokens([]);
      setScreenAlerts({});
      return;
    }

    setViewedNotificationTokens(readViewedNotificationTokens(user.id));
    setScreenAlerts(readScreenAlerts(user.id));
  }, [user?.id]);

  useEffect(() => {
    if (!user || !visibleScreens.length) return;

    const requestedScreen = screenFromLocation();
    const savedScreen = readSavedScreen();
    const nextScreen =
      [requestedScreen, savedScreen, currentScreen].filter(Boolean).find((screen) =>
        visibleScreens.some((item) => item.key === screen)
      ) || visibleScreens[0].key;

    setCurrentScreen(nextScreen);
  }, [user, visibleScreens]);

  useEffect(() => {
    if (!user || !visibleScreens.length) return;
    let ignore = false;

    api<{ events?: ChangeEventItem[] }>('/api/change-events?limit=120')
      .then(({ events = [] }) => {
        if (ignore) return;
        const lastSeen = readLastChangeSeenAt(user.id);
        const newest = String(events[0]?.createdAt || '');
        const freshEvents = lastSeen
          ? events.filter((event) => String(event.createdAt || '') > lastSeen)
          : [];
        const scopes = freshEvents.flatMap((event) => normalizeRealtimeScopes(event.scopes));
        if (scopes.length) {
          registerScreenAlerts(scopes);
        }
        if (newest) {
          saveLastChangeSeenAt(user.id, newest);
        }
      })
      .catch(() => null);

    return () => {
      ignore = true;
    };
  }, [user, visibleScreens]);

  useEffect(() => {
    if (!user) return;

    let ignore = false;
    const load = (silent = true) => {
      if (!silent) setNotificationsLoading(true);
      api<{ notifications: NotificationItem[] }>('/api/notifications')
        .then(({ notifications = [] }) => {
          if (ignore) return;
          setNotifications(notifications);
          setNotificationsError('');
          setNotificationsUpdatedAt(new Date().toISOString());
        })
        .catch((error) => {
          if (ignore) return;
          setNotifications([]);
          setNotificationsError(error instanceof Error ? error.message : 'Falha ao carregar alertas.');
        })
        .finally(() => {
          if (!ignore) setNotificationsLoading(false);
        });
    };

    load();
    const timer = window.setInterval(load, 120000);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [user]);

  useEffect(() => {
    if (!user || !realtimeEnabled() || !('WebSocket' in window)) return;

    let socket: WebSocket | null = null;
    let reconnectTimer = 0;
    let refreshTimer = 0;
    let pendingScopes = new Set<string>();
    let closed = false;

    const scheduleRefresh = (event: MessageEvent) => {
      const message = parseRealtimeMessage(event.data);
      if (message.type === 'connected') return;

      const scopes = normalizeRealtimeScopes(message.scopes);
      saveLastChangeSeenAt(user.id, message.at || new Date().toISOString());
      for (const scope of scopes.length ? scopes : ['all']) {
        pendingScopes.add(scope);
      }

      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        const scopes = Array.from(pendingScopes);
        pendingScopes = new Set();
        setRealtimeSignals((current) => bumpRealtimeSignals(current, scopes));
        registerScreenAlerts(scopes);
        if (shouldRefreshNotifications(scopes)) {
          refreshNotifications();
        }
      }, 250);
    };

    const connect = () => {
      if (closed) return;
      socket = new WebSocket(realtimeUrl('/api/realtime'));

      socket.addEventListener('message', scheduleRefresh);
      socket.addEventListener('close', () => {
        if (!closed) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      });
      socket.addEventListener('error', () => {
        socket?.close();
      });
    };

    connect();

    return () => {
      closed = true;
      window.clearTimeout(reconnectTimer);
      window.clearTimeout(refreshTimer);
      socket?.close();
    };
  }, [user, visibleScreens]);

  useEffect(() => {
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    setAppInstalled(alreadyInstalled);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallStatus('');
    };
    const handleAppInstalled = () => {
      setAppInstalled(true);
      setInstallPrompt(null);
      setInstallStatus('Aplicativo instalado com sucesso.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleUpdateAvailable = (event: Event) => {
      const registration = (event as CustomEvent<ServiceWorkerRegistration>).detail;
      setUpdateRegistration(registration || null);
      setUpdateAvailable(true);
      setUpdateMessage('Nova versao disponivel. Salve o que estiver editando e atualize o app.');
    };
    const handleControllerChanged = () => {
      setUpdateApplying(true);
      setUpdateMessage('Atualizacao aplicada. Recarregando...');
      window.setTimeout(() => window.location.reload(), 250);
    };

    window.addEventListener('sop:pwa-update-available', handleUpdateAvailable);
    window.addEventListener('sop:pwa-controller-changed', handleControllerChanged);
    return () => {
      window.removeEventListener('sop:pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('sop:pwa-controller-changed', handleControllerChanged);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let ignore = false;
    const load = () => {
      api<{ health: SystemHealth }>('/api/health')
        .then(({ health }) => {
          if (ignore) return;
          setSystemHealth(health || null);
          setSystemHealthError('');
        })
        .catch((error) => {
          if (ignore) return;
          setSystemHealth(null);
          setSystemHealthError(error instanceof Error ? error.message : 'Falha ao consultar saude do sistema.');
        });
    };

    load();
    const timer = window.setInterval(load, 60000);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [user]);

  function setCurrentScreen(screen: ScreenKey) {
    const meta = screenByKey.get(screen);
    if (!meta || !user || !canViewScreen(user, meta)) return;

    setCurrentScreenState(screen);
    setOpenModule(meta.module);
    clearScreenAlert(screen);
    saveCurrentScreen(screen);
    const url = new URL(window.location.href);
    url.searchParams.set('screen', screen);
    window.history.replaceState({}, '', url);
  }

  function clearScreenAlert(screen: ScreenKey) {
    if (!user) return;

    setScreenAlerts((current) => {
      if (!current[screen]) return current;
      const next = { ...current };
      delete next[screen];
      saveScreenAlerts(user.id, next);
      return next;
    });
  }

  function registerScreenAlerts(scopes: string[]) {
    if (!user) return;
    const changedScreens = changedScreensFromScopes(scopes, visibleScreens);
    if (!changedScreens.length) return;

    setScreenAlerts((current) => {
      const next = { ...current };
      const marker = Date.now();
      for (const screen of changedScreens) {
        next[screen] = marker;
      }
      saveScreenAlerts(user.id, next);
      return next;
    });
  }

  function markNotificationViewed(item: NotificationItem) {
    if (!user) return;
    const token = notificationViewToken(item);
    setViewedNotificationTokens((current) => {
      if (current.includes(token)) return current;
      const next = [...current, token].slice(-250);
      saveViewedNotificationTokens(user.id, next);
      return next;
    });
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError('');
    setLoginBusy(true);

    const form = new FormData(event.currentTarget);
    try {
      const { user } = await api<{ user: CurrentUser }>('/api/login', {
        method: 'POST',
        body: {
          username: String(form.get('username') || ''),
          password: String(form.get('password') || '')
        }
      });
      setUser(user);
      setAuthStatus('authenticated');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Falha no login.');
    } finally {
      setLoginBusy(false);
    }
  }

  async function handleLogout() {
    await api('/api/logout', { method: 'POST' }).catch(() => null);
    setUser(null);
    setNotifications([]);
    setNotificationsOpen(false);
    setNotificationsLoading(false);
    setNotificationsError('');
    setNotificationsUpdatedAt('');
    setViewedNotificationTokens([]);
    setScreenAlerts({});
    setSystemHealth(null);
    setSystemHealthError('');
    setHealthOpen(false);
    setInstallOpen(false);
    setAuthStatus('anonymous');
  }

  async function refreshNotifications() {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const { notifications = [] } = await api<{ notifications: NotificationItem[] }>('/api/notifications');
      setNotifications(notifications);
      setNotificationsUpdatedAt(new Date().toISOString());
    } catch (error) {
      setNotifications([]);
      setNotificationsError(error instanceof Error ? error.message : 'Falha ao carregar alertas.');
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function handleInstallApp() {
    if (appInstalled) {
      setInstallStatus(`Este dispositivo ja esta usando o ${APP_NAME} como aplicativo.`);
      setInstallOpen(true);
      return;
    }

    if (!installPrompt) {
      setInstallOpen((open) => !open);
      return;
    }

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') {
        setAppInstalled(true);
        setInstallStatus('Aplicativo instalado com sucesso.');
      } else {
        setInstallStatus('Instalacao cancelada pelo usuario.');
        setInstallOpen(true);
      }
    } catch (error) {
      setInstallStatus(error instanceof Error ? error.message : 'Nao foi possivel iniciar a instalacao.');
      setInstallOpen(true);
    }
  }

  function handleApplyUpdate() {
    const worker = updateRegistration?.waiting;
    if (!worker) {
      window.location.reload();
      return;
    }

    setUpdateApplying(true);
    setUpdateMessage(`Atualizando o ${APP_NAME}...`);
    worker.postMessage({ type: 'SKIP_WAITING' });
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get('currentPassword') || '');
    const newPassword = String(form.get('newPassword') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmacao da nova senha nao confere.');
      return;
    }

    try {
      const { user } = await api<{ user: CurrentUser }>('/api/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword, confirmPassword }
      });
      setUser(user);
      setPasswordSuccess('Senha alterada com sucesso.');
      event.currentTarget.reset();
      window.setTimeout(() => {
        setPasswordOpen(false);
        setPasswordSuccess('');
      }, 900);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Falha ao alterar senha.');
    }
  }

  if (authStatus === 'checking') {
    return (
      <main className={`login-screen react-login-screen login-animated ${environmentClass}`}>
        <LoginBrandIntro />
        <section className="login-panel login-panel-auth login-panel-checking">
          <BrandHeader />
          <div className="login-loading-row">
            <span className="login-spinner" aria-hidden="true" />
            <span>Validando sessao...</span>
          </div>
        </section>
        <LoginVersionBadge version={loginVersion} />
      </main>
    );
  }

  if (!user) {
    return (
      <main className={`login-screen react-login-screen login-animated ${environmentClass}`}>
        <LoginBrandIntro />
        <section className="login-panel login-panel-auth" aria-label="Login do sistema">
          <BrandHeader />
          <div className="login-copy">
            <span className="login-eyebrow">Sistema integrado</span>
            <h2>Acesse sua area de trabalho</h2>
            <p>Pedidos, faturamento, supply, qualidade e IA em uma unica plataforma operacional.</p>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <label className="field">
              <span>Usuario</span>
              <input className="input login-input" name="username" autoComplete="username" required placeholder="Informe seu usuario" />
            </label>
            <label className="field">
              <span>Senha</span>
              <input
                className="input login-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Informe sua senha"
              />
            </label>
            {loginError && <p className="error">{loginError}</p>}
            <button className="btn primary login-submit" type="submit" disabled={loginBusy}>
              {loginBusy ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
        <LoginVersionBadge version={loginVersion} />
      </main>
    );
  }

  return (
    <div className={`erp-shell react-erp-shell ${environmentClass}`}>
      <aside className="sidebar" aria-label="Menu principal">
        <div className="sidebar-brand">
          <img className="brand-logo sidebar-logo" src="/mge-logo.png" alt="MGE air" />
          <div>
            <strong>{APP_NAME}</strong>
            <span>MGE Smart System</span>
          </div>
        </div>

        <nav className="nav-list nav-modules">
          {(Object.keys(moduleLabels) as ScreenMeta['module'][]).map((moduleKey) => {
            const moduleScreens = visibleScreens.filter((screen) => screen.module === moduleKey);
            if (!moduleScreens.length) return null;

            const isOpen = openModule === moduleKey;
            return (
              <section className={`nav-module ${isOpen ? 'is-open' : ''}`} key={moduleKey}>
                <button className="nav-module-toggle" type="button" onClick={() => setOpenModule((current) => current === moduleKey ? '' : moduleKey)}>
                  {moduleScreens.some((screen) => Boolean(screenAlerts[screen.key])) && (
                    <span className="nav-alert-dot" aria-label="Alteracao nao visualizada" />
                  )}
                  <span>{moduleLabels[moduleKey]}</span>
                </button>
                <div className="nav-module-items">
                  {moduleScreens.map((screen) => (
                    <button
                      className={`nav-item ${activeScreen.key === screen.key ? 'active' : ''}`}
                      key={screen.key}
                      type="button"
                      onClick={() => setCurrentScreen(screen.key)}
                    >
                      {screenAlerts[screen.key] && <span className="nav-alert-dot" aria-hidden="true" />}
                      {screen.label}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h2>{activeScreen.title}</h2>
            <p>{activeScreen.subtitle}</p>
          </div>
          <div className="user-box">
            <SystemStatusButton
              health={systemHealth}
              error={systemHealthError}
              open={healthOpen}
              onToggle={() => setHealthOpen((open) => !open)}
              onRefresh={() => {
                api<{ health: SystemHealth }>('/api/health')
                  .then(({ health }) => {
                    setSystemHealth(health || null);
                    setSystemHealthError('');
                  })
                  .catch((error) => {
                    setSystemHealth(null);
                    setSystemHealthError(error instanceof Error ? error.message : 'Falha ao consultar saude do sistema.');
                  });
              }}
            />
            <NotificationCenter
              notifications={visibleNotifications}
              stats={notificationStats}
              open={notificationsOpen}
              loading={notificationsLoading}
              error={notificationsError}
              updatedAt={notificationsUpdatedAt}
              onToggle={() => setNotificationsOpen((open) => !open)}
              onRefresh={refreshNotifications}
              onOpenNotification={(item) => {
                markNotificationViewed(item);
                setNotificationsOpen(false);
                setCurrentScreen(item.screen);
              }}
            />

            <span className="user-identity" title="Usuario conectado">
              <button className="user-settings-button" type="button" aria-label="Alterar senha" title="Alterar senha" onClick={() => setPasswordOpen(true)}>
                <HeaderIcon name="settings" />
              </button>
              <span className="user-identity-text">
                <strong>{user.name || user.username}</strong>
                <small>{roleLabels[user.role] || user.role}</small>
              </span>
            </span>
            <button className="btn" type="button" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        {(updateAvailable || updateMessage) && (
          <UpdateBanner
            message={updateMessage}
            applying={updateApplying}
            canApply={updateAvailable}
            onApply={handleApplyUpdate}
            onDismiss={() => {
              setUpdateAvailable(false);
              setUpdateMessage('');
            }}
          />
        )}

        <ActiveModule
          screen={activeScreen.key}
          user={user}
          realtimeRefreshKey={activeRealtimeRefreshKey}
          activeScreen={activeScreen}
          health={health}
          healthError={healthError}
        />
      </section>

      {passwordOpen && (
        <div className="dialog-backdrop open" role="dialog" aria-modal="true" aria-labelledby="passwordDialogTitle">
          <form className="dialog password-dialog react-password-dialog" onSubmit={handlePasswordChange}>
            <div className="dialog-header">
              <h2 id="passwordDialogTitle">Alterar senha</h2>
              <button className="icon-button" type="button" aria-label="Fechar" onClick={() => setPasswordOpen(false)}>
                x
              </button>
            </div>
            <div className="dialog-body password-dialog-body">
              <label className="field">
                <span>Senha atual</span>
                <input className="input" name="currentPassword" type="password" autoComplete="current-password" required />
              </label>
              <label className="field">
                <span>Nova senha</span>
                <input className="input" name="newPassword" type="password" autoComplete="new-password" minLength={6} required />
              </label>
              <label className="field">
                <span>Confirmar nova senha</span>
                <input className="input" name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required />
              </label>
              {passwordError && <p className="error full">{passwordError}</p>}
              {passwordSuccess && <p className="success-message full">{passwordSuccess}</p>}
            </div>
            <div className="dialog-actions">
              <button className="btn" type="button" onClick={() => setPasswordOpen(false)}>
                Cancelar
              </button>
              <button className="btn primary" type="submit">
                Salvar senha
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function LoginBrandIntro() {
  return (
    <section className="login-intro" aria-hidden="true">
      <div className="login-intro-mark">
        <img className="login-intro-logo" src="/mge-logo.png" alt="" />
      </div>
      <div className="login-intro-text">
        <span>Bem-vindo ao</span>
        <strong>{APP_NAME}</strong>
        <em>MGE Smart System</em>
      </div>
      <div className="login-intro-line" />
    </section>
  );
}

function BrandHeader() {
  return (
    <div className="brand-line">
      <img className="brand-logo" src="/mge-logo.png" alt="MGE air" />
      <div>
        <h1>{APP_NAME}</h1>
        <p>MGE Smart System</p>
      </div>
    </div>
  );
}

function LoginVersionBadge({ version }: { version: string }) {
  return <span className="login-version-badge">versao {version || APP_VERSION}</span>;
}

function resolveEnvironmentTone(serverEnvironment?: string): AppEnvironmentTone {
  const source = String(serverEnvironment || window.SOP_CONFIG?.environment || '').toLowerCase();
  if (
    source.includes('homolog') ||
    source.includes('hml') ||
    source.includes('local') ||
    source.includes('dev') ||
    source.includes('test')
  ) {
    return 'homolog';
  }
  return 'production';
}

function applyEnvironmentDocumentTheme(environmentTone: AppEnvironmentTone) {
  const isHomolog = environmentTone === 'homolog';
  const themeColor = isHomolog ? '#7f1d1d' : '#172033';
  const iconStem = isHomolog ? 'pwa-icon-homolog' : 'pwa-icon-production';

  document.body.dataset.environment = environmentTone;
  document.title = isHomolog ? 'Synapse - Homologacao' : 'Synapse';

  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  document.querySelector<HTMLMetaElement>('meta[name="msapplication-TileColor"]')?.setAttribute('content', themeColor);

  document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
    const size = link.sizes?.value?.includes('512') ? '512' : '192';
    link.href = `/${iconStem}-${size}.png`;
  });
}

function UpdateBanner({
  message,
  applying,
  canApply,
  onApply,
  onDismiss
}: {
  message: string;
  applying: boolean;
  canApply: boolean;
  onApply: () => void;
  onDismiss: () => void;
}) {
  return (
    <section className={`update-banner ${applying ? 'applying' : ''}`} aria-live="polite">
      <div>
        <strong>{applying ? 'Atualizando' : 'Atualizacao disponivel'}</strong>
        <span>{message || `Existe uma nova versao do ${APP_NAME} pronta para instalar.`}</span>
      </div>
      <div className="update-banner-actions">
        {canApply && (
          <button className="btn primary" type="button" disabled={applying} onClick={onApply}>
            {applying ? 'Aplicando...' : 'Atualizar agora'}
          </button>
        )}
        {!applying && <button className="btn" type="button" onClick={onDismiss}>Depois</button>}
      </div>
    </section>
  );
}

function NotificationCenter({
  notifications,
  stats,
  open,
  loading,
  error,
  updatedAt,
  onToggle,
  onRefresh,
  onOpenNotification
}: {
  notifications: NotificationItem[];
  stats: NotificationStats;
  open: boolean;
  loading: boolean;
  error: string;
  updatedAt: string;
  onToggle: () => void;
  onRefresh: () => void | Promise<void>;
  onOpenNotification: (item: NotificationItem) => void;
}) {
  const tone = stats.critical > 0 ? 'critical' : stats.warning > 0 ? 'warning' : stats.info > 0 ? 'info' : '';
  return (
    <div className="notification-center">
      <button
        className={`btn notification-toggle ${tone}`}
        type="button"
        aria-label={`Alertas${stats.total ? `: ${stats.total}` : ''}`}
        aria-expanded={open}
        title="Alertas"
        onClick={onToggle}
      >
        <HeaderIcon name="bell" />
        {stats.total > 0 && (
          <span className="notification-badge">{stats.total > 99 ? '99+' : stats.total}</span>
        )}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <strong>Alertas automaticos</strong>
              <span>{stats.total ? `${stats.total} ponto(s) de atencao` : 'Sem alertas'}</span>
            </div>
            <button className="btn" type="button" disabled={loading} onClick={onRefresh}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          <div className="notification-summary">
            <span className="critical">Criticos: {stats.critical}</span>
            <span className="warning">Atencao: {stats.warning}</span>
            <span className="info">Informativos: {stats.info}</span>
          </div>

          <div className="notification-updated">
            {error ? <span className="danger-text">{error}</span> : <span>Ultima leitura: {formatNotificationTime(updatedAt)}</span>}
          </div>

          <div className="notification-list">
            {notifications.length ? (
              notifications.map((item) => (
                <button
                  className={`notification-item ${item.level || 'info'}`}
                  key={item.id}
                  type="button"
                  onClick={() => onOpenNotification(item)}
                >
                  <span className="notification-level" />
                  <span>
                    <strong>{item.title || 'Alerta'}</strong>
                    <small>{item.message || ''}</small>
                    <small>{notificationScreenLabel(item.screen)}</small>
                  </span>
                  <em>{item.count || 0}</em>
                </button>
              ))
            ) : (
              <div className="notification-empty">{loading ? 'Carregando alertas...' : 'Nenhum alerta automatico no momento.'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SystemStatusButton({
  health,
  error,
  open,
  onToggle,
  onRefresh
}: {
  health: SystemHealth | null;
  error: string;
  open: boolean;
  onToggle: () => void;
  onRefresh: () => void;
}) {
  const level = systemHealthLevel(health, error);
  return (
    <div className="system-status-center">
      <button
        className={`btn system-status-toggle ${level}`}
        type="button"
        aria-label="Sistema"
        aria-expanded={open}
        title="Sistema"
        onClick={onToggle}
      >
        <HeaderIcon name="server" />
        <span className="system-status-dot" aria-hidden="true" />
      </button>

      {open && (
        <div className="system-status-panel">
          <div className="system-status-header">
            <div>
              <strong>Saude do sistema</strong>
              <span>{health?.environment || 'Ambiente local'}</span>
            </div>
            <button className="btn" type="button" onClick={onRefresh}>Atualizar</button>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="system-status-grid">
            <StatusMetric label="Servidor" value={error ? 'Erro' : health?.serverOnline === false ? 'Offline' : 'Online'} tone={error || health?.serverOnline === false ? 'bad' : 'good'} />
            <StatusMetric label="Banco" value={health?.dbConnected === false ? 'Desconectado' : health?.dbProvider || 'Carregando'} tone={health?.dbConnected === false ? 'bad' : 'good'} />
            <StatusMetric label="HTTPS" value={health?.httpsEnabled ? 'Ativo' : 'Inativo'} tone={health?.httpsEnabled ? 'good' : 'warn'} />
            <StatusMetric label="WebSocket" value={health?.realtimeClients === null || health?.realtimeClients === undefined ? '-' : String(health.realtimeClients)} />
          </div>

          <dl className="system-status-list">
            <div>
              <dt>Versao</dt>
              <dd>{health?.version || '-'}</dd>
            </div>
            <div>
              <dt>Uptime</dt>
              <dd>{formatUptime(health?.uptimeSeconds)}</dd>
            </div>
            <div>
              <dt>Sessoes ativas</dt>
              <dd>{health?.activeSessions === null || health?.activeSessions === undefined ? '-' : health.activeSessions}</dd>
            </div>
            <div>
              <dt>Endereco</dt>
              <dd>{formatSystemAddress(health)}</dd>
            </div>
            <div>
              <dt>Ultimo backup</dt>
              <dd>{formatBackupSummary(health?.latestBackup)}</dd>
            </div>
            <div>
              <dt>Runtime</dt>
              <dd>{[health?.nodeVersion, health?.platform].filter(Boolean).join(' | ') || '-'}</dd>
            </div>
          </dl>

          {health?.dbError && <p className="error">{health.dbError}</p>}
        </div>
      )}
    </div>
  );
}

function InstallAppButton({
  promptReady,
  installed,
  open,
  status,
  onInstall,
  onToggle,
  onDownloadShortcut
}: {
  promptReady: boolean;
  installed: boolean;
  open: boolean;
  status: string;
  onInstall: () => void | Promise<void>;
  onToggle: () => void;
  onDownloadShortcut: () => void;
}) {
  const label = installed ? 'App instalado' : promptReady ? 'Instalar app' : 'Instalar';
  return (
    <div className="install-app-center">
      <button
        className={`btn install-app-toggle ${installed ? 'installed' : promptReady ? 'ready' : ''}`}
        type="button"
        aria-expanded={open}
        onClick={promptReady && !installed ? onInstall : onToggle}
      >
        {label}
      </button>

      {open && (
        <div className="install-app-panel">
          <div className="install-app-header">
            <strong>Instalar {APP_NAME}</strong>
            <span>{installed ? 'Aplicativo ja instalado' : promptReady ? 'Instalacao disponivel' : 'Aguardando navegador'}</span>
          </div>

          {status && <p className={installed ? 'success-message' : 'muted-install-message'}>{status}</p>}

          {!installed && (
            <>
              {promptReady ? (
                <button className="btn primary" type="button" onClick={onInstall}>Instalar como aplicativo</button>
              ) : (
                <div className="install-instructions">
                  <p>Se o botao nativo nao aparecer, use o menu do Chrome ou Edge e escolha instalar aplicativo.</p>
                  <p>No celular, abra o menu do navegador e toque em adicionar a tela inicial.</p>
                </div>
              )}
              <button className="btn" type="button" onClick={onDownloadShortcut}>Baixar atalho antigo</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatusMetric({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  return (
    <article className={`status-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function HeaderIcon({ name }: { name: 'bell' | 'server' | 'settings' }) {
  if (name === 'bell') {
    return (
      <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    );
  }

  if (name === 'server') {
    return (
      <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="6" rx="2" />
        <rect x="3" y="14" width="18" height="6" rx="2" />
        <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
      </svg>
    );
  }

  return (
    <svg className="header-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 20.1 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function HealthStrip({ health, error, compact = false }: { health: HealthResponse | null; error: string; compact?: boolean }) {
  return (
    <section className={`react-health-strip ${compact ? 'compact' : ''}`} aria-label="Saude do sistema">
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
      {error && <p className="error full">{error}</p>}
    </section>
  );
}

function systemHealthLevel(health: SystemHealth | null, error: string) {
  if (error || health?.serverOnline === false || health?.dbConnected === false) return 'bad';
  if (!health) return 'warn';
  return 'good';
}

function formatUptime(seconds: number | undefined) {
  if (!Number.isFinite(Number(seconds))) return '-';
  const total = Math.max(0, Math.floor(Number(seconds)));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function formatSystemAddress(health: SystemHealth | null) {
  if (!health?.host && !health?.port) return '-';
  return `${health.protocol || 'http'}://${health.host || '127.0.0.1'}${health.port ? `:${health.port}` : ''}`;
}

function formatBackupSummary(backup: BackupSummary | null | undefined) {
  if (!backup) return 'Nao encontrado';
  const date = formatCompactDateTime(backup.createdAt || backup.modifiedAt || '');
  const size = formatFileSize(backup.size);
  return [date, size, backup.name].filter(Boolean).join(' | ');
}

function formatCompactDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatFileSize(size: number | undefined) {
  const value = Number(size);
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function summarizeNotifications(notifications: NotificationItem[]): NotificationStats {
  return notifications.reduce<NotificationStats>(
    (stats, item) => {
      const count = Number(item.count) || 1;
      stats.total += count;
      if (item.level === 'critical') stats.critical += count;
      else if (item.level === 'warning') stats.warning += count;
      else stats.info += count;
      return stats;
    },
    { total: 0, critical: 0, warning: 0, info: 0 }
  );
}

function notificationScreenLabel(screen: ScreenKey) {
  const meta = screenByKey.get(screen);
  return meta ? `${moduleLabels[meta.module]} > ${meta.label}` : 'Modulo do sistema';
}

function notificationViewToken(item: NotificationItem) {
  return `${item.id || item.screen}:${Number(item.count) || 0}`;
}

function changedScreensFromScopes(scopes: string[], visibleScreens: ScreenMeta[]) {
  const cleanScopes = scopes.length ? scopes : ['all'];
  const allChanged = cleanScopes.includes('all');
  return visibleScreens
    .filter((screen) => allChanged || (screenRealtimeScopes[screen.key] || [screen.key]).some((scope) => cleanScopes.includes(scope)))
    .map((screen) => screen.key);
}

function readViewedNotificationTokens(userId: string) {
  try {
    const raw = localStorage.getItem(userStorageKey(userId, 'viewed-notifications'));
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.map((item) => String(item || '')).filter(Boolean).slice(-250) : [];
  } catch {
    return [];
  }
}

function saveViewedNotificationTokens(userId: string, tokens: string[]) {
  try {
    localStorage.setItem(userStorageKey(userId, 'viewed-notifications'), JSON.stringify(tokens.slice(-250)));
  } catch {
    // Preferencia visual local; se o navegador bloquear, o sistema continua operacional.
  }
}

function readScreenAlerts(userId: string): ScreenAlertMap {
  try {
    return sanitizeScreenAlerts(JSON.parse(localStorage.getItem(userStorageKey(userId, 'screen-change-alerts')) || '{}'));
  } catch {
    return {};
  }
}

function saveScreenAlerts(userId: string, alerts: ScreenAlertMap) {
  try {
    localStorage.setItem(userStorageKey(userId, 'screen-change-alerts'), JSON.stringify(sanitizeScreenAlerts(alerts)));
  } catch {
    // Indicador visual local; falhas aqui nao devem impedir navegacao.
  }
}

function sanitizeScreenAlerts(value: unknown): ScreenAlertMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const next: ScreenAlertMap = {};
  for (const [key, rawValue] of Object.entries(value as Record<string, unknown>)) {
    const screen = safeScreenKey(key);
    if (!screen) continue;
    const marker = Number(rawValue);
    if (Number.isFinite(marker) && marker > 0) {
      next[screen] = marker;
    }
  }
  return next;
}

function readLastChangeSeenAt(userId: string) {
  try {
    return String(localStorage.getItem(userStorageKey(userId, 'last-change-seen-at')) || '');
  } catch {
    return '';
  }
}

function saveLastChangeSeenAt(userId: string, value: string) {
  try {
    if (value) {
      localStorage.setItem(userStorageKey(userId, 'last-change-seen-at'), value);
    }
  } catch {
    // Marcador local de leitura; se falhar, apenas reaparece como alerta visual.
  }
}

function userStorageKey(userId: string, key: string) {
  return `synapse-react:${userId || 'default'}:${key}`;
}

function formatNotificationTime(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function ActiveModule({
  screen,
  user,
  realtimeRefreshKey,
  activeScreen,
  health,
  healthError
}: {
  screen: ScreenKey;
  user: CurrentUser;
  realtimeRefreshKey: number;
  activeScreen: ScreenMeta;
  health: HealthResponse | null;
  healthError: string;
}) {
  if (screen === 'orders') return <OrdersScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'dashboard') return <DashboardScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'billing') return <BillingScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'loading') return <LoadingScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'thirdParty') return <ThirdPartyScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'purchasePending') return <PurchasePendingScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'pcp') return <PcpScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'sequencing') return <SequencingScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'aps') return <ApsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'products') return <ProductsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'quality') return <QualityAlertsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'qualityRnc') return <QualityRncScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'ai') return <AiScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'reports') return <ReportsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'admin') return <AdminScreen user={user} realtimeRefreshKey={realtimeRefreshKey} />;
  if (screen === 'system') return <AdminScreen user={user} realtimeRefreshKey={realtimeRefreshKey} section="system" />;
  if (screen === 'adminStatus') return <AdminScreen user={user} realtimeRefreshKey={realtimeRefreshKey} section="statuses" />;
  if (screen === 'adminCustomers') return <AdminScreen user={user} realtimeRefreshKey={realtimeRefreshKey} section="customers" />;
  if (screen === 'adminPcpMotives') return <AdminScreen user={user} realtimeRefreshKey={realtimeRefreshKey} section="pcpMotives" />;
  if (screen === 'adminUsers') return <AdminScreen user={user} realtimeRefreshKey={realtimeRefreshKey} section="users" />;
  if (screen === 'adminApsOperators') return <ApsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} configFocus="operators" />;
  if (screen === 'adminApsCalendar') return <ApsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} configFocus="calendar" />;
  if (screen === 'adminApsWorkCenters') return <ApsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} configFocus="centers" />;
  if (screen === 'adminApsOperations') return <ApsScreen user={user} realtimeRefreshKey={realtimeRefreshKey} configFocus="operations" />;
  return (
    <ModulePlaceholder
      activeScreen={activeScreen}
      canEdit={canEditTab(user, activeScreen.accessTab)}
      canView={canViewScreen(user, activeScreen)}
      health={health}
      healthError={healthError}
    />
  );
}

function ModulePlaceholder({
  activeScreen,
  canEdit,
  canView,
  health,
  healthError
}: {
  activeScreen: ScreenMeta;
  canEdit: boolean;
  canView: boolean;
  health: HealthResponse | null;
  healthError: string;
}) {
  return (
    <section className="react-module-shell">
      <div className="module-stage">
        <span>{moduleLabels[activeScreen.module]}</span>
        <strong>{activeScreen.title}</strong>
        <p>{activeScreen.subtitle}</p>
      </div>

      <div className="module-grid">
        <article>
          <span>Acesso</span>
          <strong>{canView ? 'Liberado' : 'Bloqueado'}</strong>
        </article>
        <article>
          <span>Edicao</span>
          <strong>{canEdit ? 'Permitida' : 'Somente consulta'}</strong>
        </article>
        <article>
          <span>Ambiente</span>
          <strong>{health?.environment || window.SOP_CONFIG?.environment || '-'}</strong>
        </article>
        <article>
          <span>Backend</span>
          <strong>{healthError ? 'Erro' : health ? 'Online' : 'Carregando'}</strong>
        </article>
      </div>

      <section className="migration-panel">
        <div>
          <h3>Modulo em migracao</h3>
          <p>Pedidos de venda ja iniciou a migracao React. Este modulo sera convertido em uma proxima etapa.</p>
        </div>
        <HealthStrip health={health} error={healthError} compact />
      </section>
    </section>
  );
}

function canViewScreen(user: CurrentUser, screen: ScreenMeta) {
  return user.role === 'admin' || user.visibleTabs.includes(screen.accessTab);
}

function canEditTab(user: CurrentUser, tab: TabKey) {
  return user.role === 'admin' || user.editableTabs.includes(tab);
}

function screenFromLocation(): ScreenKey | '' {
  return safeScreenKey(new URLSearchParams(window.location.search).get('screen'));
}

function safeScreenKey(value: string | null): ScreenKey | '' {
  return screens.some((screen) => screen.key === value) ? (value as ScreenKey) : '';
}

function parseRealtimeMessage(data: unknown): RealtimeMessage {
  if (typeof data !== 'string') return {};
  try {
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object' ? parsed as RealtimeMessage : {};
  } catch {
    return {};
  }
}

function normalizeRealtimeScopes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((scope) => String(scope || '').trim()).filter(Boolean)));
}

function bumpRealtimeSignals(current: RealtimeSignalMap, scopes: string[]) {
  const next = { ...current };
  const cleanScopes = scopes.length ? scopes : ['all'];
  for (const scope of cleanScopes) {
    next[scope] = (next[scope] || 0) + 1;
  }
  return next;
}

function realtimeRefreshKeyForScreen(screen: ScreenKey, signals: RealtimeSignalMap) {
  const scopes = screenRealtimeScopes[screen] || [screen];
  return scopes.reduce((sum, scope) => sum + (signals[scope] || 0), signals.all || 0);
}

function shouldRefreshNotifications(scopes: string[]) {
  return (scopes.length ? scopes : ['all']).some((scope) => notificationRealtimeScopes.has(scope));
}

function readSavedScreen(): ScreenKey | '' {
  try {
    return safeScreenKey(localStorage.getItem('sop.react.currentScreen'));
  } catch {
    return '';
  }
}

function saveCurrentScreen(screen: ScreenKey) {
  try {
    localStorage.setItem('sop.react.currentScreen', screen);
  } catch {
    // O navegador pode bloquear armazenamento local em perfis corporativos.
  }
}
