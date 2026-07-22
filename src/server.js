const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const defaultConfig = require('./config');
const { LocalDatabase, TAB_KEYS, validateOrder } = require('./database');
const { PostgresDatabase } = require('./postgres-database');
const { createSignedCookieValue, randomToken, readSignedCookieValue, verifyPassword } = require('./security');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};
const USER_ROLE_VALUES = new Set(['admin', 'user', 'commercial', 'production', 'financial', 'viewer']);
const ORDER_COLUMN_KEYS = [
  'orderNumber',
  'commercialResponsible',
  'customer',
  'sku',
  'itemType',
  'productionOrder',
  'purchaseOrderNumber',
  'capacityTr',
  'productLine',
  'equipment',
  'voltage',
  'quantity',
  'leadTime',
  'entryDate',
  'originalDeliveryDate',
  'productionDeliveryDate',
  'daysLate',
  'finalizationDate',
  'status',
  'notes'
];

function loadHttpsOptions(settings) {
  if (!settings.httpsKeyFile || !settings.httpsCertFile) {
    return null;
  }

  try {
    return {
      key: fs.readFileSync(settings.httpsKeyFile),
      cert: fs.readFileSync(settings.httpsCertFile)
    };
  } catch (error) {
    appendTechnicalLog(settings, 'error', 'Falha ao carregar certificado HTTPS', error.message);
    return null;
  }
}

function createServer(overrides = {}) {
  const settings = { ...defaultConfig, ...overrides };
  settings.dbProvider = normalizeDbProvider(settings.requestedDbProvider || settings.dbProvider);
  settings.startedAt = new Date().toISOString();
  const httpsOptions = loadHttpsOptions(settings);
  settings.protocol = httpsOptions ? 'https' : 'http';
  const db = createDatabase(settings);
  db.init();
  try {
    db.createDailyBackupIfNeeded();
  } catch (error) {
    appendTechnicalLog(settings, 'error', 'Falha ao criar backup automatico', error.message);
  }

  const sessions = new Map();
  const realtimeClients = new Set();

  let server;
  const requestHandler = async (req, res) => {
    try {
      const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      if (requestUrl.pathname.startsWith('/api/')) {
        await handleApi({ req, res, requestUrl, db, sessions, settings, server });
        return;
      }

      await serveStatic({ req, res, requestUrl, settings });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: 'Erro interno do servidor.' });
    }
  };
  server = httpsOptions ? https.createServer(httpsOptions, requestHandler) : http.createServer(requestHandler);

  server.on('upgrade', (req, socket, head) => {
    handleRealtimeUpgrade({ req, socket, head, db, sessions, settings, realtimeClients });
  });

  const backupTimer = setInterval(() => {
    try {
      db.createDailyBackupIfNeeded();
    } catch (error) {
      appendTechnicalLog(settings, 'error', 'Falha ao criar backup automatico', error.message);
    }
  }, 60 * 60 * 1000);
  backupTimer.unref?.();

  server.erp = { db, sessions, settings, realtimeClients };
  return server;
}

function createDatabase(settings) {
  return settings.dbProvider === 'postgres'
    ? new PostgresDatabase(settings)
    : new LocalDatabase(settings);
}

function normalizeDbProvider(value) {
  const provider = String(value || '').trim().toLowerCase();
  return ['postgres', 'postgresql', 'pg'].includes(provider) ? 'postgres' : 'sqlite';
}

async function handleApi(context) {
  const { req, res, requestUrl, db, sessions, settings, server } = context;
  const pathname = requestUrl.pathname;

  if (req.method === 'POST' && pathname === '/api/login') {
    const body = await readJsonBody(req);
    const user = db.findUserByUsername(body.username || '');

    if (!user || !verifyPassword(body.password || '', user.password)) {
      sendJson(res, 401, { error: 'Usuario ou senha invalidos.' });
      return;
    }

    const sessionId = randomToken(32);
    sessions.set(sessionId, {
      userId: user.id,
      createdAt: Date.now(),
      username: user.username
    });

    db.logActivity({
      actor: user.name || user.username,
      action: 'Login realizado',
      entityType: 'Sessão',
      entityLabel: user.username,
      details: ''
    });
    setSessionCookie(res, settings, db.getServerSecret(), sessionId);
    sendJson(res, 200, { user: db.publicUser(user) });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/logout') {
    const session = getSession(req, db, sessions, settings);
    if (session) {
      db.logActivity({
        actor: session.user.name || session.user.username,
        action: 'Logout realizado',
        entityType: 'Sessão',
        entityLabel: session.user.username,
        details: ''
      });
      sessions.delete(session.id);
    }
    clearSessionCookie(res, settings);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/version') {
    sendJson(res, 200, {
      appName: settings.appName,
      version: settings.appVersion
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/render-health') {
    sendJson(res, 200, {
      ok: true,
      appName: settings.appName,
      version: settings.appVersion,
      dbProvider: settings.dbProvider || 'sqlite',
      uptimeSeconds: Math.floor(process.uptime())
    });
    return;
  }

  const session = getSession(req, db, sessions, settings);
  if (!session) {
    sendJson(res, 401, { error: 'Login necessario.' });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/me') {
    sendJson(res, 200, { user: session.user });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/change-password') {
    const body = await readJsonBody(req);
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const confirmPassword = String(body.confirmPassword || '');
    const freshUser = db.findUserById(session.user.id);

    if (!freshUser) {
      sendJson(res, 404, { error: 'Usuario nao encontrado.' });
      return;
    }

    if (!verifyPassword(currentPassword, freshUser.password)) {
      sendJson(res, 400, { error: 'Senha atual incorreta.' });
      return;
    }

    if (newPassword.trim().length < 6) {
      sendJson(res, 400, { error: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      sendJson(res, 400, { error: 'A confirmacao da nova senha nao confere.' });
      return;
    }

    if (verifyPassword(newPassword, freshUser.password)) {
      sendJson(res, 400, { error: 'A nova senha deve ser diferente da senha atual.' });
      return;
    }

    const user = db.changeUserPassword(freshUser.id, newPassword);
    for (const [sessionId, storedSession] of sessions.entries()) {
      if (storedSession.userId === freshUser.id && sessionId !== session.id) {
        sessions.delete(sessionId);
      }
    }

    db.logActivity({
      actor: user.name || user.username,
      action: 'Senha alterada',
      entityType: 'Usuario',
      entityLabel: user.username,
      details: 'Alterada pelo proprio usuario'
    });
    sendJson(res, 200, { user });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/health') {
    const health = buildHealthStatus({ db, sessions, settings, server });
    sendJson(res, 200, { health });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/dashboard/goals') {
    if (!canViewTab(session, 'dashboard')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    sendJson(res, 200, { goals: db.getDashboardGoals() });
    return;
  }

  if (req.method === 'PUT' && pathname === '/api/dashboard/goals') {
    if (!canEditTab(session, 'dashboard')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar o dashboard.' });
      return;
    }

    const body = await readJsonBody(req);
    const goals = db.setDashboardGoals(body.goals || body);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Metas do dashboard alteradas',
      entityType: 'Dashboard',
      entityLabel: 'Metas',
      details: ''
    });
    broadcastRealtime(server, ['dashboard']);
    sendJson(res, 200, { goals });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/status-values') {
    sendJson(res, 200, {
      statuses: db.listStatusNames(),
      statusDetails: db.listStatuses(),
      productionStatuses: db.listProductionStatusNames()
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/customers') {
    sendJson(res, 200, { customers: db.listCustomerNames() });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/quality/rnc-state') {
    if (!canViewTab(session, 'quality')) {
      sendJson(res, 403, { error: 'Acesso negado ao modulo Qualidade.' });
      return;
    }

    sendJson(res, 200, { state: db.getQualityRncState() });
    return;
  }

  if (req.method === 'PUT' && pathname === '/api/quality/rnc-state') {
    if (!canEditTab(session, 'quality')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar dados da Qualidade.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let qualityState;

    try {
      qualityState = db.saveQualityRncState(body.state || body, actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    broadcastRealtime(server, ['quality']);
    sendJson(res, 200, { state: qualityState });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/quality/alerts') {
    if (!canViewAnyTab(session, ['quality', 'orders'])) {
      sendJson(res, 403, { error: 'Acesso negado aos alertas de qualidade.' });
      return;
    }

    const includePhotos = requestUrl.searchParams.get('includePhotos') === '1';
    sendJson(res, 200, {
      alerts: db.listQualityAlerts({ includePhotos }),
      acknowledgements: db.listQualityAlertAcknowledgementsForUser(session.user.id)
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/quality/alerts') {
    if (!canEditTab(session, 'quality')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para emitir alertas de qualidade.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let alert;
    try {
      alert = db.createQualityAlert(body, actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    db.logActivity({
      actor,
      action: 'Alerta de qualidade emitido',
      entityType: 'Qualidade',
      entityLabel: alert.orderNumber || alert.sku || alert.customer,
      details: `SKU: ${alert.sku || '-'}; Cliente: ${alert.customer || '-'}; Linha/capacidade: ${alert.productLine || '-'} ${alert.capacityTr ?? ''}`
    });
    broadcastRealtime(server, ['quality', 'orders', 'reports']);
    sendJson(res, 201, { alert });
    return;
  }

  const qualityAlertAcknowledgeMatch = pathname.match(/^\/api\/quality\/alerts\/([^/]+)\/acknowledge$/);
  const qualityAlertResolveMatch = pathname.match(/^\/api\/quality\/alerts\/([^/]+)\/resolve$/);
  if (qualityAlertAcknowledgeMatch && req.method === 'POST') {
    if (!canViewAnyTab(session, ['quality', 'orders'])) {
      sendJson(res, 403, { error: 'Acesso negado aos alertas de qualidade.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    const acknowledgement = db.acknowledgeQualityAlert(
      decodeURIComponent(qualityAlertAcknowledgeMatch[1]),
      body.orderId,
      session.user.id,
      actor
    );
    if (!acknowledgement) {
      sendJson(res, 404, { error: 'Alerta ou pedido nao encontrado.' });
      return;
    }

    sendJson(res, 200, { acknowledgement });
    return;
  }

  if (qualityAlertResolveMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'quality')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para resolver alertas de qualidade.' });
      return;
    }

    const id = decodeURIComponent(qualityAlertResolveMatch[1]);
    const actor = session.user.name || session.user.username;
    const alert = db.resolveQualityAlert(id, actor);
    if (!alert) {
      sendJson(res, 404, { error: 'Alerta de qualidade nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Alerta de qualidade resolvido',
      entityType: 'Qualidade',
      entityLabel: alert.orderNumber || alert.sku || alert.customer,
      details: `SKU: ${alert.sku || '-'}; Cliente: ${alert.customer || '-'}`
    });
    broadcastRealtime(server, ['quality', 'orders', 'reports']);
    sendJson(res, 200, { alert });
    return;
  }

  const qualityAlertMatch = pathname.match(/^\/api\/quality\/alerts\/([^/]+)$/);
  if (qualityAlertMatch && (req.method === 'PUT' || req.method === 'PATCH')) {
    if (!canEditTab(session, 'quality')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar alertas de qualidade.' });
      return;
    }

    const id = decodeURIComponent(qualityAlertMatch[1]);
    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let alert;
    try {
      alert = db.updateQualityAlert(id, body, actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!alert) {
      sendJson(res, 404, { error: 'Alerta de qualidade nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Alerta de qualidade editado',
      entityType: 'Qualidade',
      entityLabel: alert.orderNumber || alert.sku || alert.customer,
      details: `SKU: ${alert.sku || '-'}; Cliente: ${alert.customer || '-'}; Linha/capacidade: ${alert.productLine || '-'} ${alert.capacityTr ?? ''}`
    });
    broadcastRealtime(server, ['quality', 'orders', 'reports']);
    sendJson(res, 200, { alert });
    return;
  }

  if (qualityAlertMatch && req.method === 'DELETE') {
    if (!canEditTab(session, 'quality')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para excluir alertas de qualidade.' });
      return;
    }

    const id = decodeURIComponent(qualityAlertMatch[1]);
    const current = db.findQualityAlertById(id, false);
    if (!current) {
      sendJson(res, 404, { error: 'Alerta de qualidade nao encontrado.' });
      return;
    }

    db.deleteQualityAlert(id);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Alerta de qualidade excluido',
      entityType: 'Qualidade',
      entityLabel: current.orderNumber || current.sku || current.customer,
      details: `SKU: ${current.sku || '-'}; Cliente: ${current.customer || '-'}`
    });
    broadcastRealtime(server, ['quality', 'orders', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/product-stats') {
    if (!canViewTab(session, 'products')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    sendJson(res, 200, {
      products: db.listProductStats(),
      forecasts: db.listProductDemandForecasts()
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/activity-log') {
    if (!canViewTab(session, 'reports')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    sendJson(res, 200, { activities: db.listActivityLog() });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/dashboard/status-releases') {
    if (!canViewTab(session, 'dashboard')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    const month = requestUrl.searchParams.get('month') || '';
    sendJson(res, 200, {
      months: db.listStatusReleaseMonths(),
      releases: db.listStatusReleaseSummary(month)
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/aps') {
    if (!canViewTab(session, 'aps')) {
      sendJson(res, 403, { error: 'Acesso negado ao modulo APS.' });
      return;
    }

    sendJson(res, 200, { aps: db.getApsData() });
    return;
  }

  if (req.method === 'PUT' && pathname === '/api/aps/config') {
    if (!canEditTab(session, 'aps')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar o APS.' });
      return;
    }

    const body = await readJsonBody(req);
    const actor = session.user.name || session.user.username;
    let config;

    try {
      config = db.setApsConfig(body.config || body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    db.logActivity({
      actor,
      action: 'Configuracao APS salva',
      entityType: 'APS',
      entityLabel: 'Cadastros APS',
      details: `${config.operators.length} operadores, ${config.workCenters.length} centros, ${config.operations.length} operacoes`
    });
    broadcastRealtime(server, ['aps', 'admin', 'reports']);
    sendJson(res, 200, { config });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/sequencing') {
    if (!canViewTab(session, 'sequencing')) {
      sendJson(res, 403, { error: 'Acesso negado ao modulo Sequenciamento.' });
      return;
    }

    sendJson(res, 200, db.listStageSequencing());
    return;
  }

  if (req.method === 'POST' && pathname === '/api/sequencing/generate') {
    if (!canEditTab(session, 'sequencing')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para gerar sequenciamento.' });
      return;
    }

    const body = await readJsonBody(req);
    const actor = session.user.name || session.user.username;
    let sequencing;

    try {
      sequencing = db.generateStageSequencing(body.activityKey || '', actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    db.logActivity({
      actor,
      action: 'Sequenciamento gerado',
      entityType: 'Sequenciamento',
      entityLabel: body.activityKey || 'Todas as atividades',
      details: ''
    });
    broadcastRealtime(server, ['sequencing', 'aps', 'reports']);
    sendJson(res, 200, sequencing);
    return;
  }

  const sequencingMatch = pathname.match(/^\/api\/sequencing\/([^/]+)$/);
  if (sequencingMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'sequencing')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para salvar sequenciamento.' });
      return;
    }

    const activityKey = decodeURIComponent(sequencingMatch[1]);
    const body = await readJsonBody(req);
    const actor = session.user.name || session.user.username;
    let sequencing;

    try {
      sequencing = db.saveStageSequencing(activityKey, body.items || [], actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    db.logActivity({
      actor,
      action: 'Sequenciamento salvo',
      entityType: 'Sequenciamento',
      entityLabel: activityKey,
      details: `${Array.isArray(body.items) ? body.items.length : 0} itens`
    });
    broadcastRealtime(server, ['sequencing', 'aps', 'reports']);
    sendJson(res, 200, sequencing);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/shortcut') {
    sendShortcutHtml(res, req);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/shortcut-url') {
    sendUrlShortcut(res, req);
    return;
  }

  if (req.method === 'GET' && pathname === '/api/preferences/nav-order') {
    const rawValue = db.getUserPreference(session.user.id, 'navOrder');
    const order = parseNavOrder(rawValue);
    sendJson(res, 200, { order });
    return;
  }

  if (req.method === 'PUT' && pathname === '/api/preferences/nav-order') {
    const body = await readJsonBody(req);
    const order = sanitizeNavOrder(body.order);
    db.setUserPreference(session.user.id, 'navOrder', JSON.stringify(order));
    sendJson(res, 200, { order });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/preferences/order-column-order') {
    const rawValue = db.getUserPreference(session.user.id, 'orderColumnOrder');
    const order = parseOrderColumnOrder(rawValue);
    sendJson(res, 200, { order });
    return;
  }

  if (req.method === 'PUT' && pathname === '/api/preferences/order-column-order') {
    const body = await readJsonBody(req);
    const order = sanitizeOrderColumnOrder(body.order);
    db.setUserPreference(session.user.id, 'orderColumnOrder', JSON.stringify(order));
    sendJson(res, 200, { order });
    return;
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!isAdmin(session)) {
      sendJson(res, 403, { error: 'Acesso restrito ao administrador.' });
      return;
    }

    await handleAdminApi({ req, res, requestUrl, db, session, server });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/orders') {
    if (!canViewAnyTab(session, ['orders', 'dashboard', 'thirdParty', 'pcp'])) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    const filters = {
      search: requestUrl.searchParams.get('search') || '',
      status: requestUrl.searchParams.get('status') || '',
      scope: requestUrl.searchParams.get('scope') || '',
      dueWithinDays: requestUrl.searchParams.get('dueWithinDays') || '',
      sort: requestUrl.searchParams.get('sort') || '',
      direction: requestUrl.searchParams.get('direction') || ''
    };

    if (requestUrl.searchParams.has('page') || requestUrl.searchParams.has('pageSize')) {
      const pageData = db.listOrdersPage({
        ...filters,
        page: requestUrl.searchParams.get('page') || '',
        pageSize: requestUrl.searchParams.get('pageSize') || ''
      });
      sendJson(res, 200, pageData);
      return;
    }

    const orders = db.listOrders(filters);
    sendJson(res, 200, { orders, total: orders.length });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/billing/items') {
    if (!canViewTab(session, 'billing')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    const releasedOrders = [
      ...db.listOrdersByBillingStage('released'),
      ...db.listThirdPartyPartsByBillingStage('released')
    ];
    const invoicedOrders = [
      ...db.listOrdersBillingHistory(),
      ...db.listThirdPartyPartsBillingHistory()
    ].sort((a, b) => billingHistoryTimestamp(b).localeCompare(billingHistoryTimestamp(a)));
    sendJson(res, 200, { orders: releasedOrders, releasedOrders, invoicedOrders });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/loading/items') {
    if (!canViewTab(session, 'loading')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    sendJson(res, 200, {
      orders: [
        ...db.listOrdersByBillingStage('invoiced'),
        ...db.listThirdPartyPartsByBillingStage('invoiced')
      ]
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/third-party-parts') {
    if (!canViewTab(session, 'thirdParty')) {
      sendJson(res, 403, { error: 'Acesso negado ao modulo Terceiros.' });
      return;
    }

    sendJson(res, 200, { items: db.listThirdPartyParts() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/third-party-parts') {
    if (!canEditTab(session, 'thirdParty')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para criar romaneio de terceiros.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let item;
    try {
      item = db.createThirdPartyPart(body, actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    db.logActivity({
      actor,
      action: 'Romaneio de beneficiamento criado',
      entityType: 'Pecas em terceiros',
      entityLabel: item.romaneioNumber,
      details: `Terceiro: ${item.supplierName}; Peca: ${item.partCode}; Quantidade: ${item.quantity} ${item.unit}; aguardando pedido de compra para liberar faturamento`
    });
    broadcastRealtime(server, ['thirdParty', 'billing', 'reports']);
    sendJson(res, 201, { item });
    return;
  }

  const thirdPartyBillingInfoMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)\/billing-info$/);
  const thirdPartyPurchaseOrderMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)\/purchase-order$/);
  const thirdPartyMarkInvoicedMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)\/mark-invoiced$/);
  const thirdPartyMarkLoadedMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)\/mark-loaded$/);
  const thirdPartyInvoiceDocumentMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)\/invoice-document$/);
  const thirdPartyReturnMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)\/return$/);
  const thirdPartyPartMatch = pathname.match(/^\/api\/third-party-parts\/([^/]+)$/);

  if (thirdPartyPurchaseOrderMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'thirdParty')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para informar pedido de compra.' });
      return;
    }

    const id = decodeURIComponent(thirdPartyPurchaseOrderMatch[1]);
    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let item;
    try {
      item = db.updateThirdPartyPurchaseOrderNumber(id, body.purchaseOrderNumber, actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!item) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Pedido de compra informado na remessa',
      entityType: 'Pecas em terceiros',
      entityLabel: item.romaneioNumber,
      details: `PC: ${item.purchaseOrderNumber}; PV: ${item.linkedOrderNumber || item.salesOrderReference || '-'}; remessa liberada ao faturamento como beneficiamento`
    });
    broadcastRealtime(server, ['thirdParty', 'billing', 'reports']);
    sendJson(res, 200, { item, order: item });
    return;
  }

  if (thirdPartyBillingInfoMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'billing')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar faturamento.' });
      return;
    }

    const id = decodeURIComponent(thirdPartyBillingInfoMatch[1]);
    const body = await readJsonBody(req);
    let item;
    try {
      item = db.updateThirdPartyBillingInfo(id, body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!item) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    db.logActivity({
      actor,
      action: 'Dados de faturamento atualizados',
      entityType: 'Remessa beneficiamento',
      entityLabel: item.romaneioNumber,
      details: formatBillingDetails(item)
    });
    broadcastRealtime(server, ['thirdParty', 'billing', 'loading', 'reports']);
    sendJson(res, 200, { order: item, item });
    return;
  }

  if (thirdPartyMarkInvoicedMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'billing')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar faturamento.' });
      return;
    }

    const id = decodeURIComponent(thirdPartyMarkInvoicedMatch[1]);
    const current = db.findThirdPartyPartById(id);
    if (!current) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }
    if (current.billingStage !== 'released') {
      sendJson(res, 400, { error: 'Somente remessas liberadas podem ser marcadas como faturadas.' });
      return;
    }
    if (!current.purchaseOrderNumber) {
      sendJson(res, 400, { error: 'Informe o pedido de compra antes de faturar a remessa.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let item;
    try {
      item = db.markThirdPartyPartInvoiced(id, actor, body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    db.logActivity({
      actor,
      action: 'Remessa de beneficiamento faturada',
      entityType: 'Pecas em terceiros',
      entityLabel: item.romaneioNumber,
      details: `${formatBillingDetails(item)}; ${formatDimensions(item)}`
    });
    broadcastRealtime(server, ['thirdParty', 'billing', 'loading', 'reports']);
    sendJson(res, 200, { order: item, item });
    return;
  }

  if (thirdPartyMarkLoadedMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'loading')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar carregamento.' });
      return;
    }

    const id = decodeURIComponent(thirdPartyMarkLoadedMatch[1]);
    const current = db.findThirdPartyPartById(id);
    if (!current) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }
    if (current.billingStage !== 'invoiced') {
      sendJson(res, 400, { error: 'Somente remessas faturadas podem ser enviadas.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const item = db.markThirdPartyPartLoaded(id, actor);
    db.logActivity({
      actor,
      action: 'Remessa enviada para terceiro',
      entityType: 'Pecas em terceiros',
      entityLabel: item.romaneioNumber,
      details: `Terceiro: ${item.supplierName}; peca: ${item.partCode}; quantidade: ${item.quantity} ${item.unit}`
    });
    broadcastRealtime(server, ['thirdParty', 'loading', 'billing', 'reports']);
    sendJson(res, 200, { order: item, item });
    return;
  }

  if (thirdPartyInvoiceDocumentMatch && req.method === 'GET') {
    if (!canViewAnyTab(session, ['billing', 'loading', 'thirdParty'])) {
      sendJson(res, 403, { error: 'Acesso negado ao documento da nota fiscal.' });
      return;
    }

    const id = decodeURIComponent(thirdPartyInvoiceDocumentMatch[1]);
    const current = db.findThirdPartyPartById(id);
    if (!current) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }

    const document = db.getThirdPartyInvoiceDocument(id);
    if (!document) {
      sendJson(res, 404, { error: 'Nota fiscal nao cadastrada para esta remessa.' });
      return;
    }

    sendJson(res, 200, {
      document: {
        fileName: document.invoiceDocumentName,
        mimeType: document.invoiceDocumentMimeType,
        dataUrl: document.invoiceDocumentDataUrl
      }
    });
    return;
  }

  if (thirdPartyReturnMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'thirdParty')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar remessas de terceiros.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const item = db.markThirdPartyPartReturned(decodeURIComponent(thirdPartyReturnMatch[1]), actor);
    if (!item) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Retorno de peca beneficiada registrado',
      entityType: 'Pecas em terceiros',
      entityLabel: item.romaneioNumber,
      details: `Terceiro: ${item.supplierName}; peca: ${item.partCode}; retorno: ${item.returnDate}`
    });
    broadcastRealtime(server, ['thirdParty', 'reports']);
    sendJson(res, 200, { item });
    return;
  }

  if (thirdPartyPartMatch && req.method === 'DELETE') {
    if (!canEditTab(session, 'thirdParty')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para excluir remessas de terceiros.' });
      return;
    }

    const id = decodeURIComponent(thirdPartyPartMatch[1]);
    const current = db.findThirdPartyPartById(id);
    if (!current) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }
    if (!['', 'released'].includes(current.billingStage || '')) {
      sendJson(res, 400, { error: 'Somente remessas ainda nao faturadas podem ser excluidas.' });
      return;
    }

    const deleted = db.deleteThirdPartyPart(id);
    if (!deleted) {
      sendJson(res, 404, { error: 'Remessa nao encontrada.' });
      return;
    }

    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Remessa de beneficiamento excluida',
      entityType: 'Pecas em terceiros',
      entityLabel: current.romaneioNumber,
      details: `Terceiro: ${current.supplierName}; Peca: ${current.partCode}; Quantidade: ${current.quantity} ${current.unit}`
    });
    broadcastRealtime(server, ['thirdParty', 'billing', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && isPcpPendingMotiveCollectionPath(pathname)) {
    if (!canViewTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    sendJson(res, 200, { motives: db.listPcpPendingMotives() });
    return;
  }

  if (req.method === 'POST' && isPcpPendingMotiveCollectionPath(pathname)) {
    if (!canEditTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar pendencias PCP.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    try {
      const motive = db.createPcpPendingMotive(body, actor);
      db.logActivity({
        actor,
        action: 'Motivo PCP cadastrado',
        entityType: 'Pendencia PCP',
        entityLabel: motive.reasonLabel,
        details: `Motivo: ${motive.name}`
      });
      broadcastRealtime(server, ['pcp', 'reports']);
      sendJson(res, 201, { motive });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === 'GET' && isPcpPendingCollectionPath(pathname)) {
    if (!canViewTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Acesso negado a esta aba.' });
      return;
    }

    const issues = db.listPcpPendingIssues({
      status: requestUrl.searchParams.get('status') || '',
      search: requestUrl.searchParams.get('search') || ''
    });
    sendJson(res, 200, { issues });
    return;
  }

  if (req.method === 'POST' && isPcpPendingCollectionPath(pathname)) {
    if (!canEditTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar pendencias PCP.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const body = await readJsonBody(req);
    let issue;
    try {
      issue = db.createPcpPendingIssue(body, actor);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!issue) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Pendencia PCP cadastrada',
      entityType: 'Pendencia PCP',
      entityLabel: issue.orderNumber,
      details: `Componente: ${issue.componentCode}; Tipo: ${issue.reasonLabel}; Motivo: ${issue.motive}${issue.purchaseOrderNumber ? `; Pedido compra: ${issue.purchaseOrderNumber}` : ''}${issue.expectedResolutionDate ? `; Data prevista: ${issue.expectedResolutionDate}` : ''}`
    });
    broadcastRealtime(server, ['pcp', 'sequencing', 'aps', 'orders', 'dashboard', 'reports']);
    sendJson(res, 201, { issue });
    return;
  }

  const pcpPendingIssueMatch = pathname.match(/^\/api\/(?:pcp-pendencies|pcp-pendencias|pcp-pending-issues)\/([^/]+)$/);
  const pcpPendingIssueResolveMatch = pathname.match(/^\/api\/(?:pcp-pendencies|pcp-pendencias|pcp-pending-issues)\/([^/]+)\/resolve$/);

  if (pcpPendingIssueResolveMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar pendencias PCP.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const issue = db.resolvePcpPendingIssue(decodeURIComponent(pcpPendingIssueResolveMatch[1]), actor);
    if (!issue) {
      sendJson(res, 404, { error: 'Pendencia nao encontrada.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Pendencia PCP resolvida',
      entityType: 'Pendencia PCP',
      entityLabel: issue.orderNumber,
      details: `Componente: ${issue.componentCode}; Tipo: ${issue.reasonLabel}`
    });
    broadcastRealtime(server, ['pcp', 'sequencing', 'aps', 'orders', 'dashboard', 'reports']);
    sendJson(res, 200, { issue });
    return;
  }

  if (pcpPendingIssueMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar pendencias PCP.' });
      return;
    }

    const id = decodeURIComponent(pcpPendingIssueMatch[1]);
    const previous = db.findPcpPendingIssueById(id);
    if (!previous) {
      sendJson(res, 404, { error: 'Pendencia nao encontrada.' });
      return;
    }

    try {
      const body = await readJsonBody(req);
      const issue = db.updatePcpPendingIssueDetails(id, body);
      const actor = session.user.name || session.user.username;
      const changes = [];
      if (Object.prototype.hasOwnProperty.call(body, 'expectedResolutionDate')) {
        changes.push(`Data prevista: ${previous.expectedResolutionDate || '-'} -> ${issue.expectedResolutionDate || '-'}`);
      }
      if (Object.prototype.hasOwnProperty.call(body, 'purchaseOrderNumber')) {
        changes.push(`Pedido compra: ${previous.purchaseOrderNumber || '-'} -> ${issue.purchaseOrderNumber || '-'}`);
      }
      db.logActivity({
        actor,
        action: 'Pendencia PCP alterada',
        entityType: 'Pendencia PCP',
        entityLabel: issue.orderNumber,
        details: `Componente: ${issue.componentCode}; ${changes.join('; ') || 'Sem alteracoes informadas'}`
      });
      broadcastRealtime(server, ['pcp', 'sequencing', 'aps', 'orders', 'dashboard', 'reports']);
      sendJson(res, 200, { issue });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (pcpPendingIssueMatch && req.method === 'DELETE') {
    if (!canEditTab(session, 'pcp')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar pendencias PCP.' });
      return;
    }

    const id = decodeURIComponent(pcpPendingIssueMatch[1]);
    const issue = db.findPcpPendingIssueById(id);
    const deleted = db.deletePcpPendingIssue(id);
    if (!deleted) {
      sendJson(res, 404, { error: 'Pendencia nao encontrada.' });
      return;
    }

    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Pendencia PCP excluida',
      entityType: 'Pendencia PCP',
      entityLabel: issue ? issue.orderNumber : id,
      details: issue ? `Componente: ${issue.componentCode}; Tipo: ${issue.reasonLabel}` : ''
    });
    broadcastRealtime(server, ['pcp', 'sequencing', 'aps', 'orders', 'dashboard', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/orders') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const body = await readJsonBody(req);
    const { order, errors } = validateOrder(body, db.listStatusNames(), db.listCustomerNames());

    if (errors.length) {
      sendJson(res, 400, { error: errors.join(' ') });
      return;
    }

    const created = db.createOrder(order);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Pedido criado',
      entityType: 'Pedido',
      entityLabel: created.orderNumber,
      details: `Cliente: ${created.customer}; Status: ${created.status}`
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'reports']);
    sendJson(res, 201, { order: created });
    return;
  }

  const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  const orderStatusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
  const orderProductionOrderMatch = pathname.match(/^\/api\/orders\/([^/]+)\/production-order$/);
  const orderPurchaseOrderMatch = pathname.match(/^\/api\/orders\/([^/]+)\/purchase-order$/);
  const orderStagesMatch = pathname.match(/^\/api\/orders\/([^/]+)\/stages$/);
  const orderReleaseBillingMatch = pathname.match(/^\/api\/orders\/([^/]+)\/release-billing$/);
  const orderBillingDimensionsMatch = pathname.match(/^\/api\/orders\/([^/]+)\/billing-dimensions$/);
  const orderBillingInfoMatch = pathname.match(/^\/api\/orders\/([^/]+)\/billing-info$/);
  const orderMarkInvoicedMatch = pathname.match(/^\/api\/orders\/([^/]+)\/mark-invoiced$/);
  const orderMarkLoadedMatch = pathname.match(/^\/api\/orders\/([^/]+)\/mark-loaded$/);
  const orderInvoiceDocumentMatch = pathname.match(/^\/api\/orders\/([^/]+)\/invoice-document$/);
  const orderPhotosMatch = pathname.match(/^\/api\/orders\/([^/]+)\/photos$/);
  const orderPhotoMatch = pathname.match(/^\/api\/orders\/([^/]+)\/photos\/([^/]+)$/);

  if (orderProductionOrderMatch && req.method === 'PATCH') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const orderId = decodeURIComponent(orderProductionOrderMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    const body = await readJsonBody(req);
    const productionOrder = String(body.productionOrder || '').trim().toUpperCase();
    if (!productionOrder) {
      sendJson(res, 400, { error: 'Informe o numero da OP.' });
      return;
    }

    const updated = db.updateOrderProductionOrder(orderId, productionOrder);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: current.productionOrder ? 'OP alterada' : 'OP inserida',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `${current.productionOrder || 'Sem OP'} -> ${updated.productionOrder}`
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderPurchaseOrderMatch && req.method === 'PATCH') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const orderId = decodeURIComponent(orderPurchaseOrderMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (current.itemType !== 'purchased') {
      sendJson(res, 400, { error: 'Pedido de compra disponivel apenas para pecas compradas.' });
      return;
    }

    const body = await readJsonBody(req);
    const purchaseOrderNumber = String(body.purchaseOrderNumber || '').trim().toUpperCase();
    if (!purchaseOrderNumber) {
      sendJson(res, 400, { error: 'Informe o numero do pedido de compra.' });
      return;
    }

    const updated = db.updateOrderPurchaseOrder(orderId, purchaseOrderNumber);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: current.purchaseOrderNumber ? 'Pedido de compra alterado' : 'Pedido de compra inserido',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `${current.purchaseOrderNumber || 'Sem pedido de compra'} -> ${updated.purchaseOrderNumber}`
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderStagesMatch && req.method === 'PATCH') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar etapas do pedido.' });
      return;
    }

    const orderId = decodeURIComponent(orderStagesMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    const body = await readJsonBody(req);
    const updated = db.updateOrderStages(orderId, body.stages || body);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Etapas do pedido alteradas',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: formatOrderStages(updated.stages)
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderReleaseBillingMatch && req.method === 'PATCH') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para liberar faturamento.' });
      return;
    }

    const orderId = decodeURIComponent(orderReleaseBillingMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (current.billingStage) {
      sendJson(res, 400, { error: 'Pedido ja foi liberado para faturamento.' });
      return;
    }

    if (!isBillingReleaseReadyStatus(current.status)) {
      sendJson(res, 400, { error: 'Somente pedidos com status de producao concluida ou aguardando expedicao podem ser liberados.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const updated = db.releaseOrderForBilling(orderId, actor);
    db.logActivity({
      actor,
      action: 'Liberado para faturamento',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `Status: ${updated.status}`
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'billing', 'dashboard', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderBillingDimensionsMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'billing') && !canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar dimensionais.' });
      return;
    }

    const orderId = decodeURIComponent(orderBillingDimensionsMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (!['released', 'invoiced'].includes(current.billingStage) && !canEditOrders(session)) {
      sendJson(res, 400, { error: 'Dimensionais antecipados exigem permissao para editar pedidos.' });
      return;
    }

    const body = await readJsonBody(req);
    let updated;
    try {
      updated = db.updateBillingDimensions(orderId, body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    const actor = session.user.name || session.user.username;
    db.logActivity({
      actor,
      action: 'Dimensionais atualizados',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: formatDimensions(updated)
    });
    broadcastRealtime(server, ['billing', 'loading', 'sequencing', 'aps', 'orders', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderBillingInfoMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'billing')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar faturamento.' });
      return;
    }

    const orderId = decodeURIComponent(orderBillingInfoMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (!['released', 'invoiced'].includes(current.billingStage)) {
      sendJson(res, 400, { error: 'Dados de faturamento disponiveis apenas para pedidos liberados ou faturados.' });
      return;
    }

    const body = await readJsonBody(req);
    let updated;
    try {
      updated = db.updateBillingInfo(orderId, body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    const actor = session.user.name || session.user.username;
    db.logActivity({
      actor,
      action: 'Dados de faturamento atualizados',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: formatBillingDetails(updated)
    });
    broadcastRealtime(server, ['billing', 'loading', 'sequencing', 'aps', 'orders', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderMarkInvoicedMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'billing')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar faturamento.' });
      return;
    }

    const orderId = decodeURIComponent(orderMarkInvoicedMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (current.billingStage !== 'released') {
      sendJson(res, 400, { error: 'Somente pedidos liberados podem ser marcados como faturados.' });
      return;
    }

    const body = await readJsonBody(req);
    const actor = session.user.name || session.user.username;
    let updated;
    try {
      updated = db.markOrderInvoiced(orderId, actor, body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }
    db.logActivity({
      actor,
      action: 'Pedido faturado',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `${formatBillingDetails(updated)}; ${formatDimensions(updated)}`
    });
    broadcastRealtime(server, ['billing', 'loading', 'sequencing', 'aps', 'orders', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderMarkLoadedMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'loading')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar carregamento.' });
      return;
    }

    const orderId = decodeURIComponent(orderMarkLoadedMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (current.billingStage !== 'invoiced') {
      sendJson(res, 400, { error: 'Somente pedidos faturados podem ser carregados.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const updated = db.markOrderLoaded(orderId, actor);
    db.logActivity({
      actor,
      action: 'Pedido carregado',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `Status final: ${updated.status}`
    });
    broadcastRealtime(server, ['loading', 'sequencing', 'aps', 'orders', 'dashboard', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderInvoiceDocumentMatch && req.method === 'GET') {
    if (!canViewAnyTab(session, ['billing', 'loading', 'orders'])) {
      sendJson(res, 403, { error: 'Acesso negado ao documento da nota fiscal.' });
      return;
    }

    const orderId = decodeURIComponent(orderInvoiceDocumentMatch[1]);
    const order = db.findOrderById(orderId);
    if (!order) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    const document = db.getInvoiceDocument(orderId);
    if (!document) {
      sendJson(res, 404, { error: 'Nota fiscal nao cadastrada para este pedido.' });
      return;
    }

    sendJson(res, 200, {
      document: {
        fileName: document.invoiceDocumentName,
        mimeType: document.invoiceDocumentMimeType,
        dataUrl: document.invoiceDocumentDataUrl
      }
    });
    return;
  }

  if (orderPhotosMatch && req.method === 'GET') {
    const orderId = decodeURIComponent(orderPhotosMatch[1]);
    if (!db.findOrderById(orderId)) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    sendJson(res, 200, { photos: db.listOrderPhotos(orderId) });
    return;
  }

  if (orderPhotosMatch && req.method === 'POST') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const orderId = decodeURIComponent(orderPhotosMatch[1]);
    const body = await readJsonBody(req);
    let created;
    try {
      created = db.addOrderPhoto(orderId, body);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!created) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    const order = db.findOrderById(orderId);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Documento adicionado',
      entityType: 'Pedido',
      entityLabel: order ? order.orderNumber : orderId,
      details: created.fileName
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'reports']);
    sendJson(res, 201, { photo: created });
    return;
  }

  if (orderPhotoMatch && req.method === 'DELETE') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const orderId = decodeURIComponent(orderPhotoMatch[1]);
    const photoId = decodeURIComponent(orderPhotoMatch[2]);
    const deleted = db.deleteOrderPhoto(orderId, photoId);
    if (!deleted) {
      sendJson(res, 404, { error: 'Documento nao encontrado.' });
      return;
    }

    const order = db.findOrderById(orderId);
    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Documento excluido',
      entityType: 'Pedido',
      entityLabel: order ? order.orderNumber : orderId,
      details: ''
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (orderStatusMatch && req.method === 'PATCH') {
    if (!canEditTab(session, 'orders')) {
      sendJson(res, 403, { error: 'Usuario sem permissao para alterar pedidos.' });
      return;
    }

    const body = await readJsonBody(req);
    const status = String(body.status || '').trim();
    const orderId = decodeURIComponent(orderStatusMatch[1]);

    if (!db.listStatusNames().includes(status)) {
      sendJson(res, 400, { error: 'Informe um status válido.' });
      return;
    }

    const actor = session.user.name || session.user.username;
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    const transition = db.validateStatusTransition(current.status, status, {
      allowDeviation: Boolean(body.allowStatusDeviation),
      deviationReason: body.statusDeviationReason
    });
    if (!transition.ok) {
      sendJson(res, 400, { error: transition.error });
      return;
    }

    const updated = db.updateOrderStatus(orderId, status, actor);
    const deviationReason = String(body.statusDeviationReason || '').trim();

    db.logActivity({
      actor,
      action: transition.isDeviation ? 'Status alterado com desvio' : 'Status alterado',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `${current.status} -> ${updated.status}${transition.isDeviation && deviationReason ? `; Motivo do desvio: ${deviationReason}` : ''}`
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderMatch && req.method === 'PUT') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const body = await readJsonBody(req);
    const { order, errors } = validateOrder(body, db.listStatusNames(), db.listCustomerNames());

    if (errors.length) {
      sendJson(res, 400, { error: errors.join(' ') });
      return;
    }

    const actor = session.user.name || session.user.username;
    const orderId = decodeURIComponent(orderMatch[1]);
    const current = db.findOrderById(orderId);
    if (!current) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    if (current.status !== order.status) {
      const transition = db.validateStatusTransition(current.status, order.status);
      if (!transition.ok) {
        sendJson(res, 400, { error: `${transition.error} Use o botao Status para registrar um desvio com motivo.` });
        return;
      }
    }

    const updated = db.updateOrder(orderId, order, actor);
    if (!updated) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Pedido editado',
      entityType: 'Pedido',
      entityLabel: updated.orderNumber,
      details: `Cliente: ${updated.customer}; Status: ${updated.status}`
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'products', 'reports']);
    sendJson(res, 200, { order: updated });
    return;
  }

  if (orderMatch && req.method === 'DELETE') {
    if (!canEditOrders(session)) {
      sendJson(res, 403, { error: 'Usuario sem permissao para editar pedidos.' });
      return;
    }

    const current = db.findOrderById(decodeURIComponent(orderMatch[1]));
    const deleted = db.deleteOrder(decodeURIComponent(orderMatch[1]));
    if (!deleted) {
      sendJson(res, 404, { error: 'Pedido nao encontrado.' });
      return;
    }

    db.logActivity({
      actor: session.user.name || session.user.username,
      action: 'Pedido excluido',
      entityType: 'Pedido',
      entityLabel: current ? current.orderNumber : decodeURIComponent(orderMatch[1]),
      details: current ? `Cliente: ${current.customer}` : ''
    });
    broadcastRealtime(server, ['orders', 'sequencing', 'aps', 'dashboard', 'products', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: 'Rota nao encontrada.' });
}

async function handleAdminApi({ req, res, requestUrl, db, session, server }) {
  const pathname = requestUrl.pathname;
  const actor = session.user.name || session.user.username;

  if (req.method === 'GET' && pathname === '/api/admin/health') {
    sendJson(res, 200, { health: buildHealthStatus({ db, sessions: null, settings: db.settings, server: null }) });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/backups') {
    sendJson(res, 200, { backups: db.listBackups(), latestBackup: db.latestBackup() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/backups') {
    const backup = db.createBackup('manual');
    db.logActivity({
      actor,
      action: 'Backup criado',
      entityType: 'Sistema',
      entityLabel: backup ? backup.name : 'Backup',
      details: backup ? `${backup.size} bytes` : ''
    });
    sendJson(res, 201, { backup, backups: db.listBackups() });
    return;
  }

  const backupRestoreMatch = pathname.match(/^\/api\/admin\/backups\/([^/]+)\/restore$/);
  if (backupRestoreMatch && req.method === 'POST') {
    const fileName = decodeURIComponent(backupRestoreMatch[1]);
    let restored = false;
    try {
      restored = db.restoreBackup(fileName);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    if (!restored) {
      sendJson(res, 404, { error: 'Backup nao encontrado.' });
      return;
    }

    appendTechnicalLog(db.settings, 'info', 'Backup restaurado', fileName);
    sendJson(res, 200, { ok: true, restored: fileName });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/users') {
    sendJson(res, 200, { users: db.listUsers() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/users') {
    const body = await readJsonBody(req);
    const errors = validateUserBody(body, { requirePassword: true });

    if (errors.length) {
      sendJson(res, 400, { error: errors.join(' ') });
      return;
    }

    if (db.findUserByUsername(body.username)) {
      sendJson(res, 400, { error: 'Usuario ja cadastrado.' });
      return;
    }

    const user = db.createUser(body);
    db.logActivity({
      actor,
      action: 'Usuario cadastrado',
      entityType: 'Usuario',
      entityLabel: user.username,
      details: user.canEditOrders ? 'Pode editar pedidos' : 'Somente consulta'
    });
    broadcastRealtime(server, ['admin', 'reports']);
    sendJson(res, 201, { user });
    return;
  }

  const userMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userMatch && req.method === 'PUT') {
    const body = await readJsonBody(req);
    const id = decodeURIComponent(userMatch[1]);
    const errors = validateUserBody(body, { requirePassword: false });
    const duplicate = db.findUserByUsername(body.username);

    if (errors.length) {
      sendJson(res, 400, { error: errors.join(' ') });
      return;
    }

    if (duplicate && duplicate.id !== id) {
      sendJson(res, 400, { error: 'Usuario ja cadastrado.' });
      return;
    }

    if (session.user.id === id && String(body.role || 'user') !== 'admin') {
      sendJson(res, 400, { error: 'Nao e possivel remover seu proprio acesso de administrador.' });
      return;
    }

    const user = db.updateUser(id, body);
    if (!user) {
      sendJson(res, 404, { error: 'Usuario nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Usuario editado',
      entityType: 'Usuario',
      entityLabel: user.username,
      details: user.canEditOrders ? 'Pode editar pedidos' : 'Somente consulta'
    });
    broadcastRealtime(server, ['admin', 'reports']);
    sendJson(res, 200, { user });
    return;
  }

  if (userMatch && req.method === 'DELETE') {
    const id = decodeURIComponent(userMatch[1]);
    const user = db.findUserById(id);

    if (!user) {
      sendJson(res, 404, { error: 'Usuario nao encontrado.' });
      return;
    }

    if (session.user.id === id || user.role === 'admin') {
      sendJson(res, 400, { error: 'Nao e possivel excluir este usuario.' });
      return;
    }

    db.deleteUser(id);
    db.logActivity({
      actor,
      action: 'Usuario excluido',
      entityType: 'Usuario',
      entityLabel: user.username,
      details: ''
    });
    broadcastRealtime(server, ['admin', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/statuses') {
    sendJson(res, 200, { statuses: db.listStatuses() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/statuses') {
    const body = await readJsonBody(req);
    const name = String(body.name || '').trim();
    const category = normalizeStatusCategory(body.category);
    const sortOrder = body.sortOrder;
    const flowType = normalizeStatusFlowType(body.flowType);

    if (!name) {
      sendJson(res, 400, { error: 'Informe o nome do status.' });
      return;
    }

    if (db.findStatusByName(name)) {
      sendJson(res, 400, { error: 'Status ja cadastrado.' });
      return;
    }

    const status = db.createStatus(name, category, sortOrder, flowType);
    db.logActivity({
      actor,
      action: 'Status cadastrado',
      entityType: 'Status',
      entityLabel: status.name,
      details: `Sequencia: ${status.sortOrder}; Categoria: ${statusCategoryLabel(status.category)}; Fluxo: ${statusFlowLabel(status.flowType)}`
    });
    broadcastRealtime(server, ['admin', 'orders', 'aps', 'dashboard', 'reports']);
    sendJson(res, 201, { status });
    return;
  }

  const statusMatch = pathname.match(/^\/api\/admin\/statuses\/([^/]+)$/);
  if (statusMatch && req.method === 'PUT') {
    const body = await readJsonBody(req);
    const id = decodeURIComponent(statusMatch[1]);
    const name = String(body.name || '').trim();
    const category = normalizeStatusCategory(body.category);
    const sortOrder = body.sortOrder;
    const flowType = normalizeStatusFlowType(body.flowType);
    const duplicate = db.findStatusByName(name);

    if (!name) {
      sendJson(res, 400, { error: 'Informe o nome do status.' });
      return;
    }

    if (duplicate && duplicate.id !== id) {
      sendJson(res, 400, { error: 'Status ja cadastrado.' });
      return;
    }

    const status = db.updateStatus(id, name, category, sortOrder, flowType);
    if (!status) {
      sendJson(res, 404, { error: 'Status nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Status editado',
      entityType: 'Status',
      entityLabel: status.name,
      details: `Sequencia: ${status.sortOrder}; Categoria: ${statusCategoryLabel(status.category)}; Fluxo: ${statusFlowLabel(status.flowType)}`
    });
    broadcastRealtime(server, ['admin', 'orders', 'aps', 'dashboard', 'reports']);
    sendJson(res, 200, { status });
    return;
  }

  if (statusMatch && req.method === 'DELETE') {
    const id = decodeURIComponent(statusMatch[1]);
    const status = db.findStatusById(id);

    if (!status) {
      sendJson(res, 404, { error: 'Status nao encontrado.' });
      return;
    }

    if (db.isStatusUsed(status.name)) {
      sendJson(res, 400, { error: 'Nao e possivel excluir status usado em pedidos.' });
      return;
    }

    db.deleteStatus(id);
    db.logActivity({
      actor,
      action: 'Status excluido',
      entityType: 'Status',
      entityLabel: status.name,
      details: ''
    });
    broadcastRealtime(server, ['admin', 'orders', 'aps', 'dashboard', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/admin/customers') {
    sendJson(res, 200, { customers: db.listCustomers() });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/customers') {
    const body = await readJsonBody(req);
    const name = String(body.name || '').trim();

    if (!name) {
      sendJson(res, 400, { error: 'Informe o nome do cliente.' });
      return;
    }

    if (db.findCustomerByName(name)) {
      sendJson(res, 400, { error: 'Cliente ja cadastrado.' });
      return;
    }

    const customer = db.createCustomer(name);
    db.logActivity({
      actor,
      action: 'Cliente cadastrado',
      entityType: 'Cliente',
      entityLabel: customer.name,
      details: ''
    });
    broadcastRealtime(server, ['admin', 'orders', 'reports']);
    sendJson(res, 201, { customer });
    return;
  }

  const customerMatch = pathname.match(/^\/api\/admin\/customers\/([^/]+)$/);
  if (customerMatch && req.method === 'PUT') {
    const body = await readJsonBody(req);
    const id = decodeURIComponent(customerMatch[1]);
    const name = String(body.name || '').trim();
    const duplicate = db.findCustomerByName(name);

    if (!name) {
      sendJson(res, 400, { error: 'Informe o nome do cliente.' });
      return;
    }

    if (duplicate && duplicate.id !== id) {
      sendJson(res, 400, { error: 'Cliente ja cadastrado.' });
      return;
    }

    const customer = db.updateCustomer(id, name);
    if (!customer) {
      sendJson(res, 404, { error: 'Cliente nao encontrado.' });
      return;
    }

    db.logActivity({
      actor,
      action: 'Cliente editado',
      entityType: 'Cliente',
      entityLabel: customer.name,
      details: `ID: ${id}`
    });
    broadcastRealtime(server, ['admin', 'orders', 'reports']);
    sendJson(res, 200, { customer });
    return;
  }

  if (customerMatch && req.method === 'DELETE') {
    const id = decodeURIComponent(customerMatch[1]);
    const customer = db.findCustomerById(id);

    if (!customer) {
      sendJson(res, 404, { error: 'Cliente nao encontrado.' });
      return;
    }

    if (db.isCustomerUsed(customer.name)) {
      sendJson(res, 400, { error: 'Nao e possivel excluir cliente usado em pedidos.' });
      return;
    }

    db.deleteCustomer(id);
    db.logActivity({
      actor,
      action: 'Cliente excluido',
      entityType: 'Cliente',
      entityLabel: customer.name,
      details: ''
    });
    broadcastRealtime(server, ['admin', 'orders', 'reports']);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: 'Rota administrativa nao encontrada.' });
}

async function serveStatic({ req, res, requestUrl, settings }) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, 'Metodo nao permitido.');
    return;
  }

  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const fullPath = path.resolve(settings.publicDir, relativePath);
  const publicRoot = path.resolve(settings.publicDir);

  if (fullPath !== publicRoot && !fullPath.startsWith(`${publicRoot}${path.sep}`)) {
    sendText(res, 403, 'Acesso negado.');
    return;
  }

  fs.readFile(fullPath, (error, content) => {
    if (error) {
      sendText(res, 404, 'Arquivo nao encontrado.');
      return;
    }

    const mimeType = MIME_TYPES[path.extname(fullPath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-store'
    });

    if (req.method !== 'HEAD') {
      res.end(content);
    } else {
      res.end();
    }
  });
}

function getSession(req, db, sessions, settings) {
  const cookies = parseCookies(req.headers.cookie || '');
  const rawCookie = cookies[settings.sessionCookieName];
  const sessionId = readSignedCookieValue(rawCookie, db.getServerSecret());

  if (!sessionId || !sessions.has(sessionId)) {
    return null;
  }

  const session = sessions.get(sessionId);
  const user = db.findUserById(session.userId);

  if (!user) {
    sessions.delete(sessionId);
    return null;
  }

  return {
    id: sessionId,
    ...session,
    user: db.publicUser(user)
  };
}

function isAdmin(session) {
  return Boolean(session && session.user && session.user.role === 'admin');
}

function canViewTab(session, tab) {
  if (!session || !session.user) return false;
  if (!TAB_KEYS.includes(tab)) return false;
  if (isAdmin(session)) return true;
  return Array.isArray(session.user.visibleTabs) && session.user.visibleTabs.includes(tab);
}

function canViewAnyTab(session, tabs) {
  return tabs.some((tab) => canViewTab(session, tab));
}

function canEditTab(session, tab) {
  if (!session || !session.user) return false;
  if (!TAB_KEYS.includes(tab)) return false;
  if (isAdmin(session)) return true;
  return Array.isArray(session.user.editableTabs) && session.user.editableTabs.includes(tab);
}

function canEditOrders(session) {
  return canEditTab(session, 'orders');
}

function buildHealthStatus({ db, sessions, settings, server }) {
  let dbConnected = false;
  let dbError = '';

  try {
    dbConnected = db.ping();
  } catch (error) {
    dbError = error.message;
    appendTechnicalLog(settings, 'error', 'Falha na verificacao do banco', dbError);
  }

  return {
    appName: settings.appName,
    version: settings.appVersion,
    startedAt: settings.startedAt || '',
    uptimeSeconds: Math.floor(process.uptime()),
    serverOnline: true,
    dbConnected,
    dbFile: settings.dbFile,
    dbProvider: settings.dbProvider || 'sqlite',
    requestedDbProvider: settings.requestedDbProvider || settings.dbProvider || 'sqlite',
    dbError,
    host: settings.host,
    port: settings.port,
    protocol: settings.protocol || 'http',
    httpsEnabled: settings.protocol === 'https',
    activeSessions: sessions ? sessions.size : null,
    realtimeClients: server?.erp?.realtimeClients?.size ?? null,
    latestBackup: db.latestBackup(),
    nodeVersion: process.version,
    platform: `${process.platform} ${process.arch}`
  };
}

function appendTechnicalLog(settings, level, message, details = '') {
  try {
    const logsDir = settings.logsDir || path.join(settings.dataDir || settings.rootDir || process.cwd(), 'logs');
    fs.mkdirSync(logsDir, { recursive: true });
    const line = JSON.stringify({
      at: new Date().toISOString(),
      level,
      message,
      details
    });
    fs.appendFileSync(path.join(logsDir, 'technical.log'), `${line}\n`, 'utf8');
  } catch (error) {
    console.error('Falha ao gravar log tecnico', error);
  }
}

function broadcastRealtime(server, scopes = []) {
  const clients = server?.erp?.realtimeClients;
  if (!clients || !clients.size) return;

  const payload = {
    type: 'data-change',
    scopes,
    at: new Date().toISOString()
  };

  for (const socket of Array.from(clients)) {
    sendWebSocketJson(socket, payload);
  }
}

function handleRealtimeUpgrade({ req, socket, db, sessions, settings, realtimeClients }) {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (requestUrl.pathname !== '/api/realtime') {
      socket.destroy();
      return;
    }

    const session = getSession(req, db, sessions, settings);
    const key = req.headers['sec-websocket-key'];
    if (!session || !key) {
      socket.destroy();
      return;
    }

    const accept = crypto
      .createHash('sha1')
      .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
      .digest('base64');

    socket.write([
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '',
      ''
    ].join('\r\n'));

    realtimeClients.add(socket);
    sendWebSocketJson(socket, { type: 'connected', at: new Date().toISOString() });

    socket.on('close', () => realtimeClients.delete(socket));
    socket.on('error', () => realtimeClients.delete(socket));
  } catch (error) {
    appendTechnicalLog(settings, 'error', 'Falha no WebSocket', error.message);
    socket.destroy();
  }
}

function sendWebSocketJson(socket, payload) {
  if (!socket || socket.destroyed) return;

  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  let header;
  if (body.length < 126) {
    header = Buffer.from([0x81, body.length]);
  } else if (body.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(body.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(body.length), 2);
  }

  socket.write(Buffer.concat([header, body]));
}

function isPcpPendingCollectionPath(pathname) {
  return [
    '/api/pcp-pendencies',
    '/api/pcp-pendencias',
    '/api/pcp-pending-issues'
  ].includes(pathname);
}

function isPcpPendingMotiveCollectionPath(pathname) {
  return [
    '/api/pcp-pending-motives',
    '/api/pcp-pending-motivos',
    '/api/pcp-pendencia-motivos'
  ].includes(pathname);
}

function validateUserBody(body, options = {}) {
  const errors = [];
  const username = String(body.username || '').trim();
  const name = String(body.name || '').trim();
  const password = String(body.password || '').trim();
  const role = String(body.role || 'user').trim();

  if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username)) {
    errors.push('Informe um usuario com 3 a 40 caracteres, usando letras, numeros, ponto, hifen ou underline.');
  }

  if (!name) {
    errors.push('Informe o nome do usuario.');
  }

  if (!USER_ROLE_VALUES.has(role)) {
    errors.push('Informe um perfil valido.');
  }

  if (role !== 'admin' && Array.isArray(body.visibleTabs) && body.visibleTabs.length === 0) {
    errors.push('Informe pelo menos uma aba para visualizacao.');
  }

  if (options.requirePassword && password.length < 6) {
    errors.push('Informe uma senha com pelo menos 6 caracteres.');
  }

  if (!options.requirePassword && password && password.length < 6) {
    errors.push('A nova senha deve ter pelo menos 6 caracteres.');
  }

  return errors;
}

function normalizeStatusCategory(value) {
  return value === 'production' ? 'production' : 'auxiliary';
}

function statusCategoryLabel(category) {
  return category === 'production' ? 'Producao' : 'Processos auxiliares';
}

function normalizeStatusFlowType(value) {
  return value === 'deviation' ? 'deviation' : 'normal';
}

function statusFlowLabel(flowType) {
  return flowType === 'deviation' ? 'Desvio' : 'Normal';
}

function parseNavOrder(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    return sanitizeNavOrder(JSON.parse(rawValue));
  } catch (error) {
    return [];
  }
}

function sanitizeNavOrder(value) {
  const allowed = new Set(['orders', 'dashboard', 'billing', 'loading', 'thirdParty', 'pcp', 'products', 'quality', 'reports', 'admin']);
  return sanitizeUniqueList(value, allowed);
}

function parseOrderColumnOrder(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    return sanitizeOrderColumnOrder(JSON.parse(rawValue));
  } catch (error) {
    return [];
  }
}

function sanitizeOrderColumnOrder(value) {
  return sanitizeUniqueList(value, new Set(ORDER_COLUMN_KEYS));
}

function sanitizeUniqueList(value, allowed) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  return value
    .map((item) => String(item || '').trim())
    .filter((item) => {
      if (!allowed.has(item) || seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });
}

function isProductionConcludedStatus(status) {
  const normalized = normalizeText(status);
  return normalized.includes('producao concluida') || normalized.includes('producao concluido');
}

function isBillingReleaseReadyStatus(status) {
  const normalized = normalizeText(status);
  return isProductionConcludedStatus(status) || normalized.includes('aguardando expedicao');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatDimensions(order) {
  const parts = [
    ['Altura', order.machineHeight],
    ['Largura', order.machineWidth],
    ['Comprimento', order.machineLength],
    ['Peso liquido', order.machineWeight],
    ['Peso bruto', order.machineGrossWeight],
    ['Volume', order.machineVolume]
  ]
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([label, value]) => `${label}: ${value}`);

  return parts.length ? parts.join('; ') : 'Dimensionais nao informados';
}

function formatBillingDetails(order) {
  const isThirdParty = order.sourceType === 'thirdParty';
  const parts = [
    ['Tipo solicitacao', isThirdParty ? 'Beneficiamento' : 'Cliente'],
    ['Pedido venda', isThirdParty ? (order.linkedOrderNumber || order.salesOrderReference) : order.orderNumber],
    ['Pedido compra', order.purchaseOrderNumber],
    ['NF', order.invoiceNumber],
    ['Transportadora', order.carrierName],
    ['CNPJ transportadora', order.carrierCnpj],
    ['Endereco frete', order.freightAddress],
    ['Cliente faturamento', order.billingCustomerName],
    ['CNPJ cliente', order.billingCustomerCnpj],
    ['Documento NF', order.invoiceDocumentName]
  ]
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${value}`);

  return parts.length ? parts.join('; ') : 'Dados de faturamento nao informados';
}

function billingHistoryTimestamp(order = {}) {
  return String(order.loadedAt || order.invoicedAt || order.billingReleasedAt || order.updatedAt || '');
}

function formatOrderStages(stages = {}) {
  const labels = [
    ['LM', stages.lm],
    ['Serpentina', stages.serpentina],
    ['Projeto Mecanico', stages.mechanicalProject],
    ['Projeto Eletrico', stages.electricalProject]
  ];

  return labels.map(([label, checked]) => `${label}: ${checked ? 'concluido' : 'pendente'}`).join('; ');
}

function setSessionCookie(res, settings, secret, sessionId) {
  const value = createSignedCookieValue(sessionId, secret);
  res.setHeader('Set-Cookie', `${settings.sessionCookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`);
}

function clearSessionCookie(res, settings) {
  res.setHeader('Set-Cookie', `${settings.sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

function parseCookies(header) {
  return header.split(';').reduce((cookies, part) => {
    const [key, ...value] = part.trim().split('=');
    if (key) {
      cookies[key] = decodeURIComponent(value.join('='));
    }
    return cookies;
  }, {});
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 24 * 1024 * 1024) {
        reject(new Error('Payload muito grande.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function shortcutOrigin(req) {
  const requestHost = String(req.headers.host || 'localhost:3010').replace(/[\r\n]/g, '');
  const host = normalizeShortcutHost(requestHost);
  const protocol = req.socket.encrypted ? 'https' : 'http';
  return `${protocol}://${host}`;
}

function sendShortcutHtml(res, req) {
  const origin = shortcutOrigin(req);
  const safeOrigin = escapeHtml(origin);
  const shortcut = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${safeOrigin}/">
  <title>S&OP MGE</title>
  <link rel="icon" href="${safeOrigin}/mge-logo.png">
  <script>location.replace(${JSON.stringify(`${origin}/`)});</script>
  <style>
    body{font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f4f7fb;color:#172033}
    main{display:grid;gap:12px;text-align:center}
    img{width:120px;border-radius:10px;background:#16436b}
    a{color:#0f4c81;font-weight:700}
  </style>
</head>
<body>
  <main>
    <img src="${safeOrigin}/mge-logo.png" alt="MGE air">
    <strong>Abrindo S&OP...</strong>
    <a href="${safeOrigin}/">Abrir S&OP</a>
  </main>
</body>
</html>`;

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Disposition': 'attachment; filename="SOP-MGE.html"',
    'Cache-Control': 'no-store'
  });
  res.end(shortcut);
}

function sendUrlShortcut(res, req) {
  const origin = shortcutOrigin(req);
  const shortcut = [
    '[InternetShortcut]',
    `URL=${origin}/`,
    'IDList=',
    'HotKey=0',
    `IconFile=${origin}/mge-logo.png`,
    'IconIndex=0',
    ''
  ].join('\r\n');

  res.writeHead(200, {
    'Content-Type': 'application/internet-shortcut; charset=utf-8',
    'Content-Disposition': 'attachment; filename="SOP-MGE-Area-de-Trabalho.url"',
    'Cache-Control': 'no-store'
  });
  res.end(shortcut);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeShortcutHost(host) {
  const [name, port = '3010'] = host.split(':');
  const normalized = name.toLowerCase();

  if (normalized !== 'localhost' && normalized !== '127.0.0.1' && normalized !== '::1') {
    return host;
  }

  const interfaces = os.networkInterfaces();
  for (const items of Object.values(interfaces)) {
    for (const item of items || []) {
      if (item.family === 'IPv4' && !item.internal) {
        return `${item.address}:${port}`;
      }
    }
  }

  return host;
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(text);
}

function start() {
  const server = createServer();
  const { host, port, protocol, dbProvider, databaseUrl } = server.erp.settings;

  server.listen(port, host, () => {
    console.log(`Banco selecionado: ${dbProvider === 'postgres' ? 'PostgreSQL' : 'SQLite'}`);
    if (dbProvider === 'postgres') {
      console.log(`DATABASE_URL configurada: ${databaseUrl ? 'sim' : 'nao'}`);
    }
    console.log(`Servidor iniciado em ${protocol}://localhost:${port}`);
    console.log(`Na rede local, acesse pelo IP do servidor na porta ${port}.`);
    console.log('Login inicial: admin / admin123');
  });
}

if (require.main === module) {
  if (process.argv.includes('--init-only')) {
    const settings = { ...defaultConfig };
    settings.dbProvider = normalizeDbProvider(settings.requestedDbProvider || settings.dbProvider);
    const db = createDatabase(settings);
    db.init();
    console.log(settings.dbProvider === 'postgres'
      ? 'Banco PostgreSQL inicializado.'
      : `Banco inicializado em: ${defaultConfig.dbFile}`);
    console.log('Login inicial: admin / admin123');
  } else {
    start();
  }
}

module.exports = {
  createServer,
  start
};
