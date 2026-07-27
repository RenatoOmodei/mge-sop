const fs = require('fs');
const path = require('path');
const { hashPassword, randomToken } = require('./security');

let DatabaseSync;

function createSqliteDatabase(file) {
  if (!DatabaseSync) {
    ({ DatabaseSync } = require('node:sqlite'));
  }
  return new DatabaseSync(file);
}

const STATUS_VALUES = ['Em análise', 'Liberado', 'Em produção', 'Faturado', 'Cancelado'];
const TAB_KEYS = ['orders', 'dashboard', 'billing', 'loading', 'thirdParty', 'pcp', 'sequencing', 'aps', 'products', 'quality', 'reports', 'ai', 'admin'];
const SCREEN_ACCESS_TABS = {
  orders: 'orders',
  dashboard: 'dashboard',
  products: 'products',
  billing: 'billing',
  loading: 'loading',
  thirdParty: 'thirdParty',
  purchasePending: 'pcp',
  pcp: 'pcp',
  sequencing: 'sequencing',
  aps: 'aps',
  quality: 'quality',
  qualityRnc: 'quality',
  ai: 'ai',
  reports: 'reports',
  system: 'admin',
  adminStatus: 'admin',
  adminCustomers: 'admin',
  adminPcpMotives: 'admin',
  adminUsers: 'admin',
  adminApsOperators: 'aps',
  adminApsCalendar: 'aps',
  adminApsWorkCenters: 'aps',
  adminApsOperations: 'aps'
};
const SCREEN_PERMISSION_KEYS = Object.keys(SCREEN_ACCESS_TABS).map((screen) => `screen:${screen}`);
const USER_TAB_KEYS = TAB_KEYS.filter((tab) => !['admin', 'ai'].includes(tab));
const DEFAULT_VISIBLE_TABS = USER_TAB_KEYS;
const DEFAULT_EDITABLE_TABS = ['orders', 'billing', 'loading', 'thirdParty', 'pcp'];
const ROLE_VALUES = ['admin', 'user', 'commercial', 'production', 'financial', 'viewer'];
const ROLE_DEFAULTS = {
  admin: {
    visibleTabs: TAB_KEYS,
    editableTabs: TAB_KEYS,
    canEditOrders: true
  },
  commercial: {
    visibleTabs: ['orders', 'dashboard', 'products', 'reports'],
    editableTabs: ['orders'],
    canEditOrders: true
  },
  production: {
    visibleTabs: ['orders', 'dashboard', 'thirdParty', 'pcp', 'sequencing', 'aps', 'products', 'quality', 'reports'],
    editableTabs: ['thirdParty', 'pcp', 'sequencing', 'aps'],
    canEditOrders: false
  },
  financial: {
    visibleTabs: ['orders', 'dashboard', 'billing', 'loading', 'thirdParty', 'reports'],
    editableTabs: ['billing', 'loading', 'thirdParty'],
    canEditOrders: false
  },
  viewer: {
    visibleTabs: ['orders', 'dashboard', 'products', 'quality', 'reports'],
    editableTabs: [],
    canEditOrders: false
  },
  user: {
    visibleTabs: DEFAULT_VISIBLE_TABS,
    editableTabs: [],
    canEditOrders: false
  }
};
const ORDER_STAGE_DEFS = [
  { key: 'lm', label: 'LM', column: 'stage_lm' },
  { key: 'serpentina', label: 'Serpentina', column: 'stage_serpentina' },
  { key: 'mechanicalProject', label: 'Projeto Mecanico', column: 'stage_mechanical_project' },
  { key: 'electricalProject', label: 'Projeto Eletrico', column: 'stage_electrical_project' }
];
const ORDER_STAGE_KEYS = ORDER_STAGE_DEFS.map((stage) => stage.key);
const DEFAULT_APS_CONFIG = {
  settings: {
    workdayStart: '08:00',
    dailyHours: 8,
    lunchStart: '12:00',
    lunchMinutes: 60,
    priorityRule: 'EDD',
    calendarDays: [],
    timeLearningEnabled: true
  },
  operators: [
    {
      code: 'OP-01',
      name: 'Operador 1',
      shift: '1 turno',
      journeyHours: 8,
      efficiency: 1,
      skill: 'Polivalente',
      enabledOperations: ['lm', 'serpentina', 'mechanicalProject', 'electricalProject'],
      enabledCenters: ['ENG', 'SERP', 'MONT'],
      hourlyCost: 0
    },
    {
      code: 'OP-02',
      name: 'Operador 2',
      shift: '1 turno',
      journeyHours: 8,
      efficiency: 1,
      skill: 'Montagem',
      enabledOperations: ['serpentina', 'lm'],
      enabledCenters: ['SERP', 'MONT'],
      hourlyCost: 0
    }
  ],
  workCenters: [
    {
      code: 'ENG',
      description: 'Engenharia / Projetos',
      machineCount: 2,
      calendar: '1 turno',
      efficiency: 1,
      capacity: 8,
      shift: '1 turno',
      maintenance: ''
    },
    {
      code: 'SERP',
      description: 'Serpentina',
      machineCount: 1,
      calendar: '1 turno',
      efficiency: 1,
      capacity: 8,
      shift: '1 turno',
      maintenance: ''
    },
    {
      code: 'MONT',
      description: 'Montagem / Producao',
      machineCount: 2,
      calendar: '1 turno',
      efficiency: 1,
      capacity: 8,
      shift: '1 turno',
      maintenance: ''
    }
  ],
  operations: [
    {
      code: 'lm',
      description: 'LM',
      setupHours: 0.25,
      processHours: 2,
      lotSize: 1,
      minOperators: 1,
      maxOperators: 1,
      allowedCenters: ['ENG']
    },
    {
      code: 'serpentina',
      description: 'Serpentina',
      setupHours: 0.5,
      processHours: 4,
      lotSize: 1,
      minOperators: 1,
      maxOperators: 1,
      allowedCenters: ['SERP']
    },
    {
      code: 'mechanicalProject',
      description: 'Projeto Mecanico',
      setupHours: 0.25,
      processHours: 3,
      lotSize: 1,
      minOperators: 1,
      maxOperators: 1,
      allowedCenters: ['ENG']
    },
    {
      code: 'electricalProject',
      description: 'Projeto Eletrico',
      setupHours: 0.25,
      processHours: 3,
      lotSize: 1,
      minOperators: 1,
      maxOperators: 1,
      allowedCenters: ['ENG']
    }
  ],
  timeRecords: []
};

const seedOrders = [
  {
    orderNumber: 'PV-10245',
    commercialResponsible: 'Mariana Costa',
    customer: 'Cliente Norte',
    sku: 'MESA-180-BR',
    productionOrder: 'OP-5601',
    capacityTr: 12.5,
    productLine: 'Linha Comercial',
    equipment: 'Chiller Modular',
    voltage: '220V',
    quantity: 2,
    leadTime: '25 dias',
    entryDate: '2026-07-01',
    originalDeliveryDate: '2026-08-01',
    productionDeliveryDate: '2026-08-05',
    finalizationDate: '',
    notes: 'Pedido em validação comercial.',
    status: 'Em análise'
  },
  {
    orderNumber: 'PV-10246',
    commercialResponsible: 'Rafael Lima',
    customer: 'Indústria Vale',
    sku: 'CADE-ERG-PT',
    productionOrder: 'OP-5602',
    capacityTr: 8,
    productLine: 'Linha Industrial',
    equipment: 'Fan Coil',
    voltage: '380V',
    quantity: 1,
    leadTime: '18 dias',
    entryDate: '2026-07-02',
    originalDeliveryDate: '2026-07-28',
    productionDeliveryDate: '2026-07-28',
    finalizationDate: '',
    notes: '',
    status: 'Liberado'
  },
  {
    orderNumber: 'PV-10247',
    commercialResponsible: 'Patrícia Alves',
    customer: 'Hospital Central',
    sku: 'ARM-02P-CZ',
    productionOrder: 'OP-5604',
    capacityTr: 15,
    productLine: 'Linha Hospitalar',
    equipment: 'Unidade Condensadora',
    voltage: '220V',
    quantity: 3,
    leadTime: '30 dias',
    entryDate: '2026-07-03',
    originalDeliveryDate: '2026-08-10',
    productionDeliveryDate: '2026-08-12',
    finalizationDate: '',
    notes: 'Prioridade alta.',
    status: 'Em produção'
  },
  {
    orderNumber: 'PV-10248',
    commercialResponsible: 'Mariana Costa',
    customer: 'Shopping Leste',
    sku: 'GAV-03-BR',
    productionOrder: 'OP-5605',
    capacityTr: 22,
    productLine: 'Linha Comercial',
    equipment: 'Self Contained',
    voltage: '440V',
    quantity: 1,
    leadTime: '20 dias',
    entryDate: '2026-07-03',
    originalDeliveryDate: '2026-07-25',
    productionDeliveryDate: '2026-07-25',
    finalizationDate: '2026-07-24',
    notes: 'Finalizado antes do prazo.',
    status: 'Faturado'
  },
  {
    orderNumber: 'PV-10249',
    commercialResponsible: 'Rafael Lima',
    customer: 'Cliente Oeste',
    sku: 'TAMP-120-NO',
    productionOrder: 'OP-5607',
    capacityTr: 5,
    productLine: 'Linha Leve',
    equipment: 'Splitão',
    voltage: '220V',
    quantity: 4,
    leadTime: '12 dias',
    entryDate: '2026-07-04',
    originalDeliveryDate: '2026-07-20',
    productionDeliveryDate: '2026-07-20',
    finalizationDate: '',
    notes: 'Cancelado pelo cliente.',
    status: 'Cancelado'
  }
];

class LocalDatabase {
  constructor(settings) {
    this.settings = settings;
    this.file = settings.dbFile;
    this.db = null;
  }

  init() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    this.db = createSqliteDatabase(this.file);
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.createSchema();
    this.ensureUserColumns();
    this.ensureStatusColumns();
    this.ensureSalesOrderColumns();
    this.ensureBillingColumns();
    this.ensurePcpPendingIssueColumns();
    this.ensurePurchasePendingItemColumns();
    this.ensureStageSequenceColumns();
    this.ensureThirdPartyPartColumns();
    this.ensureQualityAlertColumns();
    this.ensureLoadedDimensionNotes();
    this.ensureMeta();
    this.ensureAdmin();
    this.ensureSequencingUserAccessBackfill();
    this.ensureApsUserAccessBackfill();
    this.ensureSeedOrders();
    this.ensureReferenceData();
    this.ensureStatusReleaseHistoryBackfill();
  }

  reinitialize() {
    if (this.db) {
      this.db.close();
    }
    this.init();
  }

  createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        can_edit_orders INTEGER NOT NULL DEFAULT 0,
        visible_tabs TEXT NOT NULL DEFAULT '',
        editable_tabs TEXT NOT NULL DEFAULT '',
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_iterations INTEGER NOT NULL,
        password_digest TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, key),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS order_statuses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL DEFAULT 'auxiliary',
        flow_type TEXT NOT NULL DEFAULT 'normal',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_label TEXT NOT NULL,
        details TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sales_orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL,
        commercial_responsible TEXT NOT NULL DEFAULT '',
        customer TEXT NOT NULL DEFAULT '',
        sku TEXT NOT NULL,
        production_order TEXT NOT NULL,
        item_type TEXT NOT NULL DEFAULT 'production',
        purchase_order_number TEXT NOT NULL DEFAULT '',
        capacity_tr REAL,
        product_line TEXT NOT NULL DEFAULT '',
        equipment TEXT NOT NULL DEFAULT '',
        voltage TEXT NOT NULL DEFAULT '',
        quantity INTEGER,
        lead_time TEXT NOT NULL DEFAULT '',
        entry_date TEXT NOT NULL,
        original_delivery_date TEXT NOT NULL DEFAULT '',
        production_delivery_date TEXT NOT NULL DEFAULT '',
        finalization_date TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL,
        billing_stage TEXT NOT NULL DEFAULT '',
        billing_released_at TEXT NOT NULL DEFAULT '',
        billing_released_by TEXT NOT NULL DEFAULT '',
        invoiced_at TEXT NOT NULL DEFAULT '',
        invoiced_by TEXT NOT NULL DEFAULT '',
        loaded_at TEXT NOT NULL DEFAULT '',
        loaded_by TEXT NOT NULL DEFAULT '',
        invoice_number TEXT NOT NULL DEFAULT '',
        carrier_name TEXT NOT NULL DEFAULT '',
        carrier_cnpj TEXT NOT NULL DEFAULT '',
        freight_address TEXT NOT NULL DEFAULT '',
        billing_customer_name TEXT NOT NULL DEFAULT '',
        billing_customer_cnpj TEXT NOT NULL DEFAULT '',
        invoice_document_name TEXT NOT NULL DEFAULT '',
        invoice_document_mime_type TEXT NOT NULL DEFAULT '',
        invoice_document_data_url TEXT NOT NULL DEFAULT '',
        machine_height REAL,
        machine_width REAL,
        machine_length REAL,
        machine_weight REAL,
        machine_gross_weight REAL,
        machine_volume REAL,
        stage_lm INTEGER NOT NULL DEFAULT 0,
        stage_serpentina INTEGER NOT NULL DEFAULT 0,
        stage_mechanical_project INTEGER NOT NULL DEFAULT 0,
        stage_electrical_project INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sales_order_photos (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        data_url TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS third_party_parts (
        id TEXT PRIMARY KEY,
        romaneio_number TEXT NOT NULL,
        supplier_name TEXT NOT NULL DEFAULT '',
        supplier_cnpj TEXT NOT NULL DEFAULT '',
        part_code TEXT NOT NULL,
        part_description TEXT NOT NULL DEFAULT '',
        quantity REAL,
        unit TEXT NOT NULL DEFAULT 'UN',
        process_description TEXT NOT NULL DEFAULT '',
        issue_date TEXT NOT NULL,
        expected_return_date TEXT NOT NULL DEFAULT '',
        return_date TEXT NOT NULL DEFAULT '',
        sales_order_id TEXT NOT NULL DEFAULT '',
        sales_order_reference TEXT NOT NULL DEFAULT '',
        purchase_order_number TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Aguardando pedido de compra',
        billing_stage TEXT NOT NULL DEFAULT '',
        billing_released_at TEXT NOT NULL DEFAULT '',
        billing_released_by TEXT NOT NULL DEFAULT '',
        invoiced_at TEXT NOT NULL DEFAULT '',
        invoiced_by TEXT NOT NULL DEFAULT '',
        loaded_at TEXT NOT NULL DEFAULT '',
        loaded_by TEXT NOT NULL DEFAULT '',
        invoice_number TEXT NOT NULL DEFAULT '',
        carrier_name TEXT NOT NULL DEFAULT '',
        carrier_cnpj TEXT NOT NULL DEFAULT '',
        freight_address TEXT NOT NULL DEFAULT '',
        billing_customer_name TEXT NOT NULL DEFAULT '',
        billing_customer_cnpj TEXT NOT NULL DEFAULT '',
        invoice_document_name TEXT NOT NULL DEFAULT '',
        invoice_document_mime_type TEXT NOT NULL DEFAULT '',
        invoice_document_data_url TEXT NOT NULL DEFAULT '',
        machine_height REAL,
        machine_width REAL,
        machine_length REAL,
        machine_weight REAL,
        machine_gross_weight REAL,
        machine_volume REAL,
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_status_history (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        order_number TEXT NOT NULL DEFAULT '',
        completed_status TEXT NOT NULL,
        next_status TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        actor TEXT NOT NULL DEFAULT '',
        completed_at TEXT NOT NULL,
        source_activity_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pcp_pending_issues (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        component_code TEXT NOT NULL,
        reason TEXT NOT NULL,
        motive TEXT NOT NULL DEFAULT '',
        purchase_order_number TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        expected_resolution_date TEXT NOT NULL DEFAULT '',
        issue_status TEXT NOT NULL DEFAULT 'open',
        created_by TEXT NOT NULL DEFAULT '',
        resolved_by TEXT NOT NULL DEFAULT '',
        resolved_at TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS pcp_pending_motives (
        id TEXT PRIMARY KEY,
        reason TEXT NOT NULL,
        name TEXT NOT NULL,
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(reason, name)
      );

      CREATE TABLE IF NOT EXISTS purchase_pending_items (
        id TEXT PRIMARY KEY,
        import_batch_id TEXT NOT NULL DEFAULT '',
        source_name TEXT NOT NULL DEFAULT '',
        row_index INTEGER NOT NULL DEFAULT 0,
        item_key TEXT NOT NULL DEFAULT '',
        data_json TEXT NOT NULL DEFAULT '{}',
        sales_order_id TEXT NOT NULL DEFAULT '',
        sales_order_number TEXT NOT NULL DEFAULT '',
        item_status TEXT NOT NULL DEFAULT 'pending',
        is_viewed INTEGER NOT NULL DEFAULT 1,
        viewed_by TEXT NOT NULL DEFAULT '',
        viewed_at TEXT NOT NULL DEFAULT '',
        resolution_note TEXT NOT NULL DEFAULT '',
        resolved_by TEXT NOT NULL DEFAULT '',
        resolved_at TEXT NOT NULL DEFAULT '',
        imported_by TEXT NOT NULL DEFAULT '',
        imported_at TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_stage_sequences (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        activity_key TEXT NOT NULL,
        sequence_number INTEGER NOT NULL,
        estimated_hours REAL,
        updated_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(order_id, activity_key),
        FOREIGN KEY(order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS quality_rnc_state (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quality_alerts (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL DEFAULT '',
        order_number TEXT NOT NULL DEFAULT '',
        customer TEXT NOT NULL DEFAULT '',
        product_line TEXT NOT NULL DEFAULT '',
        sku TEXT NOT NULL DEFAULT '',
        capacity_tr REAL,
        quantity REAL,
        wrong_photo_name TEXT NOT NULL DEFAULT '',
        wrong_photo_mime_type TEXT NOT NULL DEFAULT '',
        wrong_photo_data_url TEXT NOT NULL DEFAULT '',
        wrong_description TEXT NOT NULL DEFAULT '',
        right_photo_name TEXT NOT NULL DEFAULT '',
        right_photo_mime_type TEXT NOT NULL DEFAULT '',
        right_photo_data_url TEXT NOT NULL DEFAULT '',
        right_description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'open',
        resolved_at TEXT NOT NULL DEFAULT '',
        resolved_by TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quality_alert_acknowledgements (
        id TEXT PRIMARY KEY,
        alert_id TEXT NOT NULL,
        order_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        acknowledged_by TEXT NOT NULL DEFAULT '',
        acknowledged_at TEXT NOT NULL,
        UNIQUE(alert_id, order_id, user_id),
        FOREIGN KEY(alert_id) REFERENCES quality_alerts(id) ON DELETE CASCADE,
        FOREIGN KEY(order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL DEFAULT 'manual',
        scope TEXT NOT NULL DEFAULT 'general',
        content TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_training_runs (
        id TEXT PRIMARY KEY,
        objective TEXT NOT NULL,
        dataset_scope TEXT NOT NULL DEFAULT 'all',
        model_target TEXT NOT NULL DEFAULT 'decision-support',
        status TEXT NOT NULL DEFAULT 'planned',
        notes TEXT NOT NULL DEFAULT '',
        result_summary TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_analysis_history (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        context_scope TEXT NOT NULL DEFAULT 'all',
        mode TEXT NOT NULL DEFAULT 'rules-engine',
        response TEXT NOT NULL DEFAULT '',
        confidence REAL,
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_sales_orders_sku ON sales_orders(sku);
      CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
      CREATE INDEX IF NOT EXISTS idx_sales_order_photos_order_id ON sales_order_photos(order_id);
      CREATE INDEX IF NOT EXISTS idx_third_party_parts_romaneio ON third_party_parts(romaneio_number);
      CREATE INDEX IF NOT EXISTS idx_third_party_parts_billing_stage ON third_party_parts(billing_stage);
      CREATE INDEX IF NOT EXISTS idx_third_party_parts_status ON third_party_parts(status);
      CREATE INDEX IF NOT EXISTS idx_third_party_parts_supplier ON third_party_parts(supplier_name);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_completed_at ON order_status_history(completed_at);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_completed_status ON order_status_history(completed_status);
      CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_order_id ON pcp_pending_issues(order_id);
      CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_status ON pcp_pending_issues(issue_status);
      CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_reason ON pcp_pending_issues(reason);
      CREATE INDEX IF NOT EXISTS idx_pcp_pending_motives_reason ON pcp_pending_motives(reason, name);
      CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_status ON purchase_pending_items(item_status);
      CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_imported_at ON purchase_pending_items(imported_at);
      CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_source ON purchase_pending_items(source_name);
      CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_sales_order ON purchase_pending_items(sales_order_id);
      CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_item_key ON purchase_pending_items(item_key);
      CREATE INDEX IF NOT EXISTS idx_order_stage_sequences_activity ON order_stage_sequences(activity_key, sequence_number);
      CREATE INDEX IF NOT EXISTS idx_quality_alerts_sku ON quality_alerts(sku);
      CREATE INDEX IF NOT EXISTS idx_quality_alerts_customer ON quality_alerts(customer);
      CREATE INDEX IF NOT EXISTS idx_quality_alerts_line_capacity ON quality_alerts(product_line, capacity_tr);
      CREATE INDEX IF NOT EXISTS idx_quality_alert_ack_user_order ON quality_alert_acknowledgements(user_id, order_id);
      CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_status ON ai_knowledge_sources(status);
      CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_scope ON ai_knowledge_sources(scope);
      CREATE INDEX IF NOT EXISTS idx_ai_training_runs_status ON ai_training_runs(status);
      CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_created_at ON ai_analysis_history(created_at);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_order_status_history_source_activity
        ON order_status_history(source_activity_id)
        WHERE source_activity_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_order_statuses_name ON order_statuses(name);
      CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
      CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
    `);
  }

  ensureUserColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(users)').all().map((column) => column.name)
    );

    if (!existingColumns.has('can_edit_orders')) {
      this.db.exec('ALTER TABLE users ADD COLUMN can_edit_orders INTEGER NOT NULL DEFAULT 0');
    }

    if (!existingColumns.has('visible_tabs')) {
      this.db.exec("ALTER TABLE users ADD COLUMN visible_tabs TEXT NOT NULL DEFAULT ''");
    }

    if (!existingColumns.has('editable_tabs')) {
      this.db.exec("ALTER TABLE users ADD COLUMN editable_tabs TEXT NOT NULL DEFAULT ''");
    }

    this.db.exec("UPDATE users SET can_edit_orders = 1 WHERE role = 'admin'");
  }

  ensureStatusColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(order_statuses)').all().map((column) => column.name)
    );

    if (!existingColumns.has('category')) {
      this.db.exec("ALTER TABLE order_statuses ADD COLUMN category TEXT NOT NULL DEFAULT 'auxiliary'");
      const statuses = this.db.prepare('SELECT id, name FROM order_statuses').all();
      const update = this.db.prepare('UPDATE order_statuses SET category = ? WHERE id = ?');
      for (const status of statuses) {
        update.run(statusCategoryForName(status.name), status.id);
      }
    }

    if (!existingColumns.has('flow_type')) {
      this.db.exec("ALTER TABLE order_statuses ADD COLUMN flow_type TEXT NOT NULL DEFAULT 'normal'");
    }

    if (!existingColumns.has('sort_order')) {
      this.db.exec("ALTER TABLE order_statuses ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
      const statuses = this.db.prepare('SELECT id FROM order_statuses ORDER BY name').all();
      const update = this.db.prepare('UPDATE order_statuses SET sort_order = ? WHERE id = ?');
      statuses.forEach((status, index) => update.run(index + 1, status.id));
    }

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_order_statuses_category ON order_statuses(category);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_order_statuses_flow_type ON order_statuses(flow_type);');
  }

  ensureSalesOrderColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(sales_orders)').all().map((column) => column.name)
    );

    const migrations = [
      ['commercial_responsible', "ALTER TABLE sales_orders ADD COLUMN commercial_responsible TEXT NOT NULL DEFAULT ''"],
      ['customer', "ALTER TABLE sales_orders ADD COLUMN customer TEXT NOT NULL DEFAULT ''"],
      ['item_type', "ALTER TABLE sales_orders ADD COLUMN item_type TEXT NOT NULL DEFAULT 'production'"],
      ['purchase_order_number', "ALTER TABLE sales_orders ADD COLUMN purchase_order_number TEXT NOT NULL DEFAULT ''"],
      ['capacity_tr', 'ALTER TABLE sales_orders ADD COLUMN capacity_tr REAL'],
      ['product_line', "ALTER TABLE sales_orders ADD COLUMN product_line TEXT NOT NULL DEFAULT ''"],
      ['equipment', "ALTER TABLE sales_orders ADD COLUMN equipment TEXT NOT NULL DEFAULT ''"],
      ['voltage', "ALTER TABLE sales_orders ADD COLUMN voltage TEXT NOT NULL DEFAULT ''"],
      ['quantity', 'ALTER TABLE sales_orders ADD COLUMN quantity INTEGER'],
      ['lead_time', "ALTER TABLE sales_orders ADD COLUMN lead_time TEXT NOT NULL DEFAULT ''"],
      ['original_delivery_date', "ALTER TABLE sales_orders ADD COLUMN original_delivery_date TEXT NOT NULL DEFAULT ''"],
      ['production_delivery_date', "ALTER TABLE sales_orders ADD COLUMN production_delivery_date TEXT NOT NULL DEFAULT ''"],
      ['finalization_date', "ALTER TABLE sales_orders ADD COLUMN finalization_date TEXT NOT NULL DEFAULT ''"],
      ['notes', "ALTER TABLE sales_orders ADD COLUMN notes TEXT NOT NULL DEFAULT ''"]
    ];

    for (const [columnName, sql] of migrations) {
      if (!existingColumns.has(columnName)) {
        this.db.exec(sql);
      }
    }

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sales_orders_item_type ON sales_orders(item_type);');
  }

  ensureBillingColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(sales_orders)').all().map((column) => column.name)
    );

    const migrations = [
      ['billing_stage', "ALTER TABLE sales_orders ADD COLUMN billing_stage TEXT NOT NULL DEFAULT ''"],
      ['billing_released_at', "ALTER TABLE sales_orders ADD COLUMN billing_released_at TEXT NOT NULL DEFAULT ''"],
      ['billing_released_by', "ALTER TABLE sales_orders ADD COLUMN billing_released_by TEXT NOT NULL DEFAULT ''"],
      ['invoiced_at', "ALTER TABLE sales_orders ADD COLUMN invoiced_at TEXT NOT NULL DEFAULT ''"],
      ['invoiced_by', "ALTER TABLE sales_orders ADD COLUMN invoiced_by TEXT NOT NULL DEFAULT ''"],
      ['loaded_at', "ALTER TABLE sales_orders ADD COLUMN loaded_at TEXT NOT NULL DEFAULT ''"],
      ['loaded_by', "ALTER TABLE sales_orders ADD COLUMN loaded_by TEXT NOT NULL DEFAULT ''"],
      ['invoice_number', "ALTER TABLE sales_orders ADD COLUMN invoice_number TEXT NOT NULL DEFAULT ''"],
      ['carrier_name', "ALTER TABLE sales_orders ADD COLUMN carrier_name TEXT NOT NULL DEFAULT ''"],
      ['carrier_cnpj', "ALTER TABLE sales_orders ADD COLUMN carrier_cnpj TEXT NOT NULL DEFAULT ''"],
      ['freight_address', "ALTER TABLE sales_orders ADD COLUMN freight_address TEXT NOT NULL DEFAULT ''"],
      ['billing_customer_name', "ALTER TABLE sales_orders ADD COLUMN billing_customer_name TEXT NOT NULL DEFAULT ''"],
      ['billing_customer_cnpj', "ALTER TABLE sales_orders ADD COLUMN billing_customer_cnpj TEXT NOT NULL DEFAULT ''"],
      ['invoice_document_name', "ALTER TABLE sales_orders ADD COLUMN invoice_document_name TEXT NOT NULL DEFAULT ''"],
      ['invoice_document_mime_type', "ALTER TABLE sales_orders ADD COLUMN invoice_document_mime_type TEXT NOT NULL DEFAULT ''"],
      ['invoice_document_data_url', "ALTER TABLE sales_orders ADD COLUMN invoice_document_data_url TEXT NOT NULL DEFAULT ''"],
      ['machine_height', 'ALTER TABLE sales_orders ADD COLUMN machine_height REAL'],
      ['machine_width', 'ALTER TABLE sales_orders ADD COLUMN machine_width REAL'],
      ['machine_length', 'ALTER TABLE sales_orders ADD COLUMN machine_length REAL'],
      ['machine_weight', 'ALTER TABLE sales_orders ADD COLUMN machine_weight REAL'],
      ['machine_gross_weight', 'ALTER TABLE sales_orders ADD COLUMN machine_gross_weight REAL'],
      ['machine_volume', 'ALTER TABLE sales_orders ADD COLUMN machine_volume REAL'],
      ['stage_lm', 'ALTER TABLE sales_orders ADD COLUMN stage_lm INTEGER NOT NULL DEFAULT 0'],
      ['stage_serpentina', 'ALTER TABLE sales_orders ADD COLUMN stage_serpentina INTEGER NOT NULL DEFAULT 0'],
      ['stage_mechanical_project', 'ALTER TABLE sales_orders ADD COLUMN stage_mechanical_project INTEGER NOT NULL DEFAULT 0'],
      ['stage_electrical_project', 'ALTER TABLE sales_orders ADD COLUMN stage_electrical_project INTEGER NOT NULL DEFAULT 0']
    ];

    for (const [columnName, sql] of migrations) {
      if (!existingColumns.has(columnName)) {
        this.db.exec(sql);
      }
    }

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_sales_orders_billing_stage ON sales_orders(billing_stage);');
  }

  ensurePcpPendingIssueColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(pcp_pending_issues)').all().map((column) => column.name)
    );

    if (!existingColumns.has('expected_resolution_date')) {
      this.db.exec("ALTER TABLE pcp_pending_issues ADD COLUMN expected_resolution_date TEXT NOT NULL DEFAULT ''");
    }

    if (!existingColumns.has('motive')) {
      this.db.exec("ALTER TABLE pcp_pending_issues ADD COLUMN motive TEXT NOT NULL DEFAULT ''");
    }

    if (!existingColumns.has('purchase_order_number')) {
      this.db.exec("ALTER TABLE pcp_pending_issues ADD COLUMN purchase_order_number TEXT NOT NULL DEFAULT ''");
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pcp_pending_motives (
        id TEXT PRIMARY KEY,
        reason TEXT NOT NULL,
        name TEXT NOT NULL,
        created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(reason, name)
      );

      UPDATE pcp_pending_issues
      SET motive = CASE
          WHEN trim(COALESCE(motive, '')) = '' THEN 'Aguardando compra'
          ELSE motive
        END
      WHERE reason = 'purchase';

      UPDATE pcp_pending_issues
      SET reason = 'rework',
        motive = CASE
          WHEN trim(COALESCE(motive, '')) = '' THEN 'Produto danificado no processo'
          ELSE motive
        END
      WHERE reason = 'damaged';

      UPDATE pcp_pending_issues
      SET reason = 'engineering',
        motive = CASE
          WHEN trim(COALESCE(motive, '')) = '' THEN 'Item faltou na lista/estrutura'
          ELSE motive
        END
      WHERE reason = 'missing_structure';
    `);

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_expected_resolution_date ON pcp_pending_issues(expected_resolution_date);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_motive ON pcp_pending_issues(motive);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_purchase_order ON pcp_pending_issues(purchase_order_number);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_pcp_pending_motives_reason ON pcp_pending_motives(reason, name);');
    this.seedDefaultPcpPendingMotives();
  }

  seedDefaultPcpPendingMotives() {
    const now = new Date().toISOString();
    const defaults = [
      ['purchase', 'Aguardando compra'],
      ['purchase', 'Sem fornecedor definido'],
      ['purchase', 'Aguardando prazo do fornecedor'],
      ['engineering', 'Item faltou na lista/estrutura'],
      ['engineering', 'Falta de informacao tecnica'],
      ['engineering', 'Alteracao de projeto'],
      ['rework', 'Produto danificado no processo'],
      ['rework', 'Retrabalho de montagem'],
      ['rework', 'Ajuste de qualidade']
    ];
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO pcp_pending_motives (id, reason, name, created_by, created_at, updated_at)
      VALUES (?, ?, ?, 'Sistema', ?, ?)
    `);

    for (const [reason, name] of defaults) {
      insert.run(randomToken(12), reason, name, now, now);
    }
  }

  ensurePurchasePendingItemColumns() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS purchase_pending_items (
        id TEXT PRIMARY KEY,
        import_batch_id TEXT NOT NULL DEFAULT '',
        source_name TEXT NOT NULL DEFAULT '',
        row_index INTEGER NOT NULL DEFAULT 0,
        item_key TEXT NOT NULL DEFAULT '',
        data_json TEXT NOT NULL DEFAULT '{}',
        sales_order_id TEXT NOT NULL DEFAULT '',
        sales_order_number TEXT NOT NULL DEFAULT '',
        item_status TEXT NOT NULL DEFAULT 'pending',
        is_viewed INTEGER NOT NULL DEFAULT 1,
        viewed_by TEXT NOT NULL DEFAULT '',
        viewed_at TEXT NOT NULL DEFAULT '',
        resolution_note TEXT NOT NULL DEFAULT '',
        resolved_by TEXT NOT NULL DEFAULT '',
        resolved_at TEXT NOT NULL DEFAULT '',
        imported_by TEXT NOT NULL DEFAULT '',
        imported_at TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(purchase_pending_items)').all().map((column) => column.name)
    );
    if (!existingColumns.has('sales_order_id')) {
      this.db.exec("ALTER TABLE purchase_pending_items ADD COLUMN sales_order_id TEXT NOT NULL DEFAULT ''");
    }
    if (!existingColumns.has('sales_order_number')) {
      this.db.exec("ALTER TABLE purchase_pending_items ADD COLUMN sales_order_number TEXT NOT NULL DEFAULT ''");
    }
    if (!existingColumns.has('item_key')) {
      this.db.exec("ALTER TABLE purchase_pending_items ADD COLUMN item_key TEXT NOT NULL DEFAULT ''");
    }
    if (!existingColumns.has('is_viewed')) {
      this.db.exec("ALTER TABLE purchase_pending_items ADD COLUMN is_viewed INTEGER NOT NULL DEFAULT 1");
    }
    if (!existingColumns.has('viewed_by')) {
      this.db.exec("ALTER TABLE purchase_pending_items ADD COLUMN viewed_by TEXT NOT NULL DEFAULT ''");
    }
    if (!existingColumns.has('viewed_at')) {
      this.db.exec("ALTER TABLE purchase_pending_items ADD COLUMN viewed_at TEXT NOT NULL DEFAULT ''");
    }
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_status ON purchase_pending_items(item_status);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_imported_at ON purchase_pending_items(imported_at);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_source ON purchase_pending_items(source_name);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_sales_order ON purchase_pending_items(sales_order_id);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_item_key ON purchase_pending_items(item_key);');
  }

  ensureStageSequenceColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(order_stage_sequences)').all().map((column) => column.name)
    );

    if (!existingColumns.has('estimated_hours')) {
      this.db.exec('ALTER TABLE order_stage_sequences ADD COLUMN estimated_hours REAL');
    }
  }

  ensureThirdPartyPartColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(third_party_parts)').all().map((column) => column.name)
    );

    if (!existingColumns.has('sales_order_id')) {
      this.db.exec("ALTER TABLE third_party_parts ADD COLUMN sales_order_id TEXT NOT NULL DEFAULT ''");
    }

    if (!existingColumns.has('purchase_order_number')) {
      this.db.exec("ALTER TABLE third_party_parts ADD COLUMN purchase_order_number TEXT NOT NULL DEFAULT ''");
    }

    this.db.exec(`
      UPDATE third_party_parts
      SET billing_stage = '',
        status = 'Aguardando pedido de compra',
        billing_released_at = '',
        billing_released_by = '',
        updated_at = datetime('now')
      WHERE billing_stage = 'released'
        AND trim(COALESCE(purchase_order_number, '')) = ''
        AND trim(COALESCE(invoiced_at, '')) = ''
        AND trim(COALESCE(loaded_at, '')) = '';
    `);

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_third_party_parts_sales_order_id ON third_party_parts(sales_order_id);');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_third_party_parts_purchase_order ON third_party_parts(purchase_order_number);');
  }

  ensureQualityAlertColumns() {
    const existingColumns = new Set(
      this.db.prepare('PRAGMA table_info(quality_alerts)').all().map((column) => column.name)
    );

    const migrations = [
      ['status', "ALTER TABLE quality_alerts ADD COLUMN status TEXT NOT NULL DEFAULT 'open'"],
      ['resolved_at', "ALTER TABLE quality_alerts ADD COLUMN resolved_at TEXT NOT NULL DEFAULT ''"],
      ['resolved_by', "ALTER TABLE quality_alerts ADD COLUMN resolved_by TEXT NOT NULL DEFAULT ''"]
    ];

    for (const [columnName, sql] of migrations) {
      if (!existingColumns.has(columnName)) {
        this.db.exec(sql);
      }
    }

    this.db.exec('CREATE INDEX IF NOT EXISTS idx_quality_alerts_status ON quality_alerts(status);');
  }

  ensureLoadedDimensionNotes() {
    const rows = this.db
      .prepare(`
        ${orderSelectSql()}
        FROM sales_orders
        WHERE billing_stage = 'loaded'
          AND (
            machine_height IS NOT NULL OR machine_width IS NOT NULL OR machine_length IS NOT NULL OR
            machine_weight IS NOT NULL OR machine_gross_weight IS NOT NULL OR machine_volume IS NOT NULL
          )
          AND COALESCE(notes, '') NOT LIKE '%[Dimensionais faturamento]%'
      `)
      .all()
      .map(mapOrder);

    if (!rows.length) {
      return;
    }

    const now = new Date().toISOString();
    const update = this.db.prepare('UPDATE sales_orders SET notes = ?, updated_at = ? WHERE id = ?');

    for (const order of rows) {
      const notes = appendDimensionNotes(order.notes, dimensionNotesText(order));
      if (notes !== order.notes) {
        update.run(notes, now, order.id);
      }
    }
  }

  ensureMeta() {
    const now = new Date().toISOString();
    this.setMetaIfMissing('appName', this.settings.appName);
    this.setMetaIfMissing('createdAt', now);
    this.setMetaIfMissing('serverSecret', randomToken(48));
  }

  setMetaIfMissing(key, value) {
    this.db.prepare('INSERT OR IGNORE INTO app_meta (key, value) VALUES (?, ?)').run(key, value);
  }

  getMeta(key) {
    const row = this.db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key);
    return row ? row.value : null;
  }

  ensureAdmin() {
    const existing = this.findUserByUsername(this.settings.adminUsername);
    if (existing) {
      if (this.settings.resetAdminPasswordOnStart) {
        const password = hashPassword(this.settings.adminPassword);
        this.db
          .prepare(`
            UPDATE users
            SET role = 'admin',
              can_edit_orders = 1,
              password_salt = ?,
              password_hash = ?,
              password_iterations = ?,
              password_digest = ?,
              updated_at = ?
            WHERE id = ?
          `)
          .run(
            password.salt,
            password.hash,
            password.iterations,
            password.digest,
            new Date().toISOString(),
            existing.id
          );
      }
      return;
    }

    const now = new Date().toISOString();
    const password = hashPassword(this.settings.adminPassword);

    this.db
      .prepare(`
        INSERT INTO users (
          id, username, name, role, can_edit_orders, password_salt, password_hash,
          password_iterations, password_digest, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        randomToken(12),
        this.settings.adminUsername,
        'Administrador',
        'admin',
        1,
        password.salt,
        password.hash,
        password.iterations,
        password.digest,
        now,
        now
      );
  }

  ensureSequencingUserAccessBackfill() {
    if (this.getMeta('sequencingUserAccessBackfilled') === '1') {
      return;
    }

    const rows = this.db
      .prepare("SELECT id, role, visible_tabs, editable_tabs FROM users WHERE role = 'production'")
      .all();
    const update = this.db.prepare('UPDATE users SET visible_tabs = ?, editable_tabs = ?, updated_at = ? WHERE id = ?');
    const now = new Date().toISOString();

    for (const row of rows) {
      const defaults = roleDefaults(row.role);
      const visibleTabs = normalizeTabList(row.visible_tabs, defaults.visibleTabs).filter((tab) => tab !== 'admin');
      const editableTabs = normalizeTabList(row.editable_tabs, defaults.editableTabs).filter((tab) => visibleTabs.includes(tab));
      let changed = false;

      if (!visibleTabs.includes('sequencing')) {
        visibleTabs.push('sequencing');
        changed = true;
      }

      if (editableTabs.includes('pcp') && !editableTabs.includes('sequencing')) {
        editableTabs.push('sequencing');
        changed = true;
      }

      if (changed) {
        update.run(JSON.stringify(visibleTabs), JSON.stringify(editableTabs), now, row.id);
      }
    }

    this.db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run('sequencingUserAccessBackfilled', '1');
  }

  ensureApsUserAccessBackfill() {
    if (this.getMeta('apsUserAccessBackfilled') === '1') {
      return;
    }

    const rows = this.db
      .prepare("SELECT id, role, visible_tabs, editable_tabs FROM users WHERE role IN ('production', 'admin')")
      .all();
    const update = this.db.prepare('UPDATE users SET visible_tabs = ?, editable_tabs = ?, updated_at = ? WHERE id = ?');
    const now = new Date().toISOString();

    for (const row of rows) {
      if (row.role === 'admin') continue;
      const defaults = roleDefaults(row.role);
      const visibleTabs = normalizeTabList(row.visible_tabs, defaults.visibleTabs).filter((tab) => tab !== 'admin');
      const editableTabs = normalizeTabList(row.editable_tabs, defaults.editableTabs).filter((tab) => visibleTabs.includes(tab));
      let changed = false;

      if (!visibleTabs.includes('aps')) {
        visibleTabs.push('aps');
        changed = true;
      }

      if (editableTabs.includes('sequencing') && !editableTabs.includes('aps')) {
        editableTabs.push('aps');
        changed = true;
      }

      if (changed) {
        update.run(JSON.stringify(visibleTabs), JSON.stringify(editableTabs), now, row.id);
      }
    }

    this.db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run('apsUserAccessBackfilled', '1');
  }

  ensureSeedOrders() {
    const row = this.db.prepare('SELECT COUNT(*) AS total FROM sales_orders').get();
    if (row.total > 0) {
      return;
    }

    const now = new Date().toISOString();
    const insert = this.db.prepare(`
      INSERT INTO sales_orders (
        id, order_number, commercial_responsible, customer, sku, production_order,
        item_type, purchase_order_number, capacity_tr, product_line, equipment, voltage,
        quantity, lead_time, entry_date, original_delivery_date, production_delivery_date,
        finalization_date, notes, status,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const order of seedOrders) {
      insert.run(
        randomToken(12),
        order.orderNumber,
        order.commercialResponsible,
        order.customer,
        order.sku,
        order.productionOrder,
        'production',
        '',
        order.capacityTr,
        order.productLine,
        order.equipment,
        order.voltage,
        order.quantity,
        order.leadTime,
        order.entryDate,
        order.originalDeliveryDate,
        order.productionDeliveryDate,
        order.finalizationDate,
        order.notes,
        order.status,
        now,
        now
      );
    }
  }

  ensureReferenceData() {
    const now = new Date().toISOString();
    const insertStatus = this.db.prepare(`
      INSERT OR IGNORE INTO order_statuses (id, name, category, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    STATUS_VALUES.forEach((status, index) => {
      insertStatus.run(randomToken(12), status, statusCategoryForName(status), index + 1, now, now);
    });

    const orderStatuses = this.db
      .prepare("SELECT DISTINCT status AS name FROM sales_orders WHERE trim(status) <> ''")
      .all();
    for (const status of orderStatuses) {
      insertStatus.run(randomToken(12), status.name, statusCategoryForName(status.name), 999, now, now);
    }

    const insertCustomer = this.db.prepare(`
      INSERT OR IGNORE INTO customers (id, name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    const orderCustomers = this.db
      .prepare("SELECT DISTINCT customer AS name FROM sales_orders WHERE trim(customer) <> ''")
      .all();
    for (const customer of orderCustomers) {
      insertCustomer.run(randomToken(12), customer.name, now, now);
    }
  }

  ensureStatusReleaseHistoryBackfill() {
    if (this.getMeta('statusReleaseHistoryBackfilled') === '1') {
      return;
    }

    const activities = this.db
      .prepare(`
        SELECT activity_log.id, activity_log.actor, activity_log.entity_label, activity_log.details,
          activity_log.created_at, sales_orders.id AS order_id, sales_orders.quantity
        FROM activity_log
        INNER JOIN sales_orders ON sales_orders.order_number = activity_log.entity_label
        WHERE activity_log.action = 'Status alterado'
          AND activity_log.details LIKE '% -> %'
        ORDER BY activity_log.created_at ASC
      `)
      .all();
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO order_status_history (
        id, order_id, order_number, completed_status, next_status, quantity, actor,
        completed_at, source_activity_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.db.exec('BEGIN');
    try {
      for (const activity of activities) {
        const transition = parseStatusTransitionText(activity.details);
        if (!transition.completedStatus || !transition.nextStatus) continue;
        if (transition.completedStatus === transition.nextStatus) continue;

        insert.run(
          randomToken(12),
          activity.order_id,
          activity.entity_label,
          transition.completedStatus,
          transition.nextStatus,
          optionalInteger(activity.quantity) || 0,
          activity.actor || 'Sistema',
          activity.created_at,
          activity.id,
          activity.created_at,
          activity.created_at
        );
      }

      this.db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run('statusReleaseHistoryBackfilled', '1');
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  getServerSecret() {
    return this.getMeta('serverSecret');
  }

  findUserByUsername(username) {
    const row = this.db
      .prepare(`
        SELECT id, username, name, role, can_edit_orders, visible_tabs, editable_tabs, password_salt, password_hash,
          password_iterations, password_digest, created_at, updated_at
        FROM users
        WHERE lower(username) = lower(?)
      `)
      .get(String(username || ''));

    return mapUser(row);
  }

  findUserById(id) {
    const row = this.db
      .prepare(`
        SELECT id, username, name, role, can_edit_orders, visible_tabs, editable_tabs, password_salt, password_hash,
          password_iterations, password_digest, created_at, updated_at
        FROM users
        WHERE id = ?
      `)
      .get(id);

    return mapUser(row);
  }

  publicUser(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      canEditOrders: user.role === 'admin' || user.canEditOrders,
      visibleTabs: user.role === 'admin' ? TAB_KEYS : user.visibleTabs.filter((tab) => tab !== 'admin'),
      editableTabs: user.role === 'admin' ? TAB_KEYS : user.editableTabs.filter((tab) => tab !== 'admin')
    };
  }

  getUserPreference(userId, key) {
    const row = this.db
      .prepare('SELECT value FROM user_preferences WHERE user_id = ? AND key = ?')
      .get(String(userId || ''), String(key || '').trim());

    return row ? row.value : null;
  }

  setUserPreference(userId, key, value) {
    const cleanUserId = String(userId || '');
    const cleanKey = String(key || '').trim();
    const cleanValue = String(value || '');
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO user_preferences (user_id, key, value, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `)
      .run(cleanUserId, cleanKey, cleanValue, now);

    return cleanValue;
  }

  getDashboardGoals() {
    return sanitizeDashboardGoals(this.getMeta('dashboardGoals'));
  }

  setDashboardGoals(input) {
    const goals = sanitizeDashboardGoals(input);
    this.db
      .prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)')
      .run('dashboardGoals', JSON.stringify(goals));
    return goals;
  }

  getApsConfig() {
    return sanitizeApsConfig(this.getMeta('apsConfig'), this.listStatuses());
  }

  setApsConfig(input) {
    const config = sanitizeApsConfig(input, this.listStatuses());
    this.db
      .prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)')
      .run('apsConfig', JSON.stringify(config));
    return config;
  }

  getApsData() {
    return {
      config: this.getApsConfig(),
      sequencing: this.listStageSequencing(),
      orders: this.listOrders({ scope: 'active' }).filter((order) => order.itemType === 'production')
    };
  }

  listUsers() {
    return this.db
      .prepare(`
        SELECT id, username, name, role, can_edit_orders, visible_tabs, editable_tabs,
          password_salt, password_hash, password_iterations, password_digest,
          created_at, updated_at
        FROM users
        ORDER BY role = 'admin' DESC, name, username
      `)
      .all()
      .map((user) => this.publicUser(mapUser(user)));
  }

  createUser(input) {
    const user = sanitizeUserInput(input);
    const now = new Date().toISOString();
    const id = randomToken(12);
    const password = hashPassword(input.password || '');

    this.db
      .prepare(`
        INSERT INTO users (
          id, username, name, role, can_edit_orders, visible_tabs, editable_tabs, password_salt, password_hash,
          password_iterations, password_digest, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        user.username,
        user.name,
        user.role,
        user.role === 'admin' || user.canEditOrders ? 1 : 0,
        JSON.stringify(user.visibleTabs),
        JSON.stringify(user.editableTabs),
        password.salt,
        password.hash,
        password.iterations,
        password.digest,
        now,
        now
      );

    return this.publicUser(this.findUserById(id));
  }

  updateUser(id, input) {
    const existing = this.findUserById(id);
    if (!existing) {
      return null;
    }

    const user = sanitizeUserInput(input);
    const now = new Date().toISOString();
    const canEditOrders = user.role === 'admin' || user.canEditOrders ? 1 : 0;
    const visibleTabs = JSON.stringify(user.visibleTabs);
    const editableTabs = JSON.stringify(user.editableTabs);

    if (String(input.password || '').trim()) {
      const password = hashPassword(input.password);
      this.db
        .prepare(`
          UPDATE users
          SET username = ?, name = ?, role = ?, can_edit_orders = ?, visible_tabs = ?, editable_tabs = ?,
            password_salt = ?, password_hash = ?, password_iterations = ?,
            password_digest = ?, updated_at = ?
          WHERE id = ?
        `)
        .run(
          user.username,
          user.name,
          user.role,
          canEditOrders,
          visibleTabs,
          editableTabs,
          password.salt,
          password.hash,
          password.iterations,
          password.digest,
          now,
          id
        );
    } else {
      this.db
        .prepare('UPDATE users SET username = ?, name = ?, role = ?, can_edit_orders = ?, visible_tabs = ?, editable_tabs = ?, updated_at = ? WHERE id = ?')
        .run(user.username, user.name, user.role, canEditOrders, visibleTabs, editableTabs, now, id);
    }

    return this.publicUser(this.findUserById(id));
  }

  changeUserPassword(id, newPassword) {
    const existing = this.findUserById(id);
    if (!existing) {
      return null;
    }

    const password = hashPassword(newPassword);
    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE users
        SET password_salt = ?,
          password_hash = ?,
          password_iterations = ?,
          password_digest = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        password.salt,
        password.hash,
        password.iterations,
        password.digest,
        now,
        id
      );

    return this.publicUser(this.findUserById(id));
  }

  deleteUser(id) {
    const user = this.findUserById(id);
    if (!user || user.role === 'admin') {
      return false;
    }

    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  listOrders(filters = {}) {
    const clauses = [];
    const params = [];

    if (filters.search) {
      const search = `%${String(filters.search).trim().toLowerCase()}%`;
      clauses.push(`(
        lower(order_number) LIKE ? OR lower(sku) LIKE ? OR lower(production_order) LIKE ?
        OR lower(purchase_order_number) LIKE ? OR lower(customer) LIKE ?
        OR lower(commercial_responsible) LIKE ? OR lower(equipment) LIKE ?
      )`);
      params.push(search, search, search, search, search, search, search);
    }

    if (filters.status) {
      clauses.push('status = ?');
      params.push(filters.status);
    }

    const scopeClause = orderScopeClause(filters.scope);
    if (scopeClause) {
      clauses.push(scopeClause);
    }
    appendDueWithinClause(filters, clauses, params);

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = orderSortSql(filters.sort, filters.direction);

    return this.db
      .prepare(`
        ${orderSelectSql()}
        FROM sales_orders
        ${where}
        ORDER BY ${orderBy}, entry_date DESC, order_number DESC
      `)
      .all(...params)
      .map(mapOrder);
  }

  listOrdersPage(filters = {}) {
    const clauses = [];
    const params = [];

    if (filters.search) {
      const search = `%${String(filters.search).trim().toLowerCase()}%`;
      clauses.push(`(
        lower(order_number) LIKE ? OR lower(sku) LIKE ? OR lower(production_order) LIKE ?
        OR lower(purchase_order_number) LIKE ? OR lower(customer) LIKE ?
        OR lower(commercial_responsible) LIKE ? OR lower(equipment) LIKE ?
      )`);
      params.push(search, search, search, search, search, search, search);
    }

    if (filters.status) {
      clauses.push('status = ?');
      params.push(filters.status);
    }

    const scopeClause = orderScopeClause(filters.scope);
    if (scopeClause) {
      clauses.push(scopeClause);
    }
    appendDueWithinClause(filters, clauses, params);

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = orderSortSql(filters.sort, filters.direction);
    const pageSize = clampInteger(filters.pageSize, 10, 200, 50);
    const page = clampInteger(filters.page, 1, 1000000, 1);
    const offset = (page - 1) * pageSize;
    const total = this.db
      .prepare(`SELECT COUNT(*) AS total FROM sales_orders ${where}`)
      .get(...params).total;

    const orders = this.db
      .prepare(`
        ${orderSelectSql()}
        FROM sales_orders
        ${where}
        ORDER BY ${orderBy}, entry_date DESC, order_number DESC
        LIMIT ? OFFSET ?
      `)
      .all(...params, pageSize, offset)
      .map(mapOrder);

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      summary: this.orderSummary(where, params)
    };
  }

  orderSummary(where = '', params = []) {
    const row = this.db
      .prepare(`
        SELECT COUNT(*) AS total_orders,
          COALESCE(SUM(COALESCE(quantity, 0)), 0) AS total_equipment,
          COALESCE(SUM(CASE WHEN status IN (SELECT name FROM order_statuses WHERE category = 'production') THEN COALESCE(quantity, 0) ELSE 0 END), 0) AS production_machines,
          AVG(CASE
            WHEN entry_date GLOB '????-??-??'
              AND original_delivery_date GLOB '????-??-??'
              AND original_delivery_date >= entry_date
            THEN julianday(original_delivery_date) - julianday(entry_date)
            ELSE NULL
          END) AS average_lead_time
        FROM sales_orders
        ${where}
      `)
      .get(...params);

    return {
      totalOrders: Number(row.total_orders) || 0,
      totalEquipment: Number(row.total_equipment) || 0,
      productionMachines: Number(row.production_machines) || 0,
      averageLeadTime: row.average_lead_time === null || row.average_lead_time === undefined
        ? null
        : Math.round(Number(row.average_lead_time) * 10) / 10
    };
  }

  listOrdersByBillingStage(stage) {
    return this.db
      .prepare(`
        ${orderSelectSql()}
        FROM sales_orders
        WHERE billing_stage = ?
        ORDER BY COALESCE(NULLIF(invoiced_at, ''), NULLIF(billing_released_at, ''), updated_at) DESC,
          entry_date DESC, order_number DESC
      `)
      .all(String(stage || '').trim())
      .map(mapOrder);
  }

  listOrdersBillingHistory() {
    return this.db
      .prepare(`
        ${orderSelectSql()}
        FROM sales_orders
        WHERE billing_stage IN ('invoiced', 'loaded')
          OR trim(COALESCE(invoiced_at, '')) <> ''
          OR trim(COALESCE(invoice_number, '')) <> ''
        ORDER BY COALESCE(NULLIF(loaded_at, ''), NULLIF(invoiced_at, ''), NULLIF(billing_released_at, ''), updated_at) DESC,
          entry_date DESC, order_number DESC
      `)
      .all()
      .map(mapOrder);
  }

  listThirdPartyParts() {
    return this.db
      .prepare(`
        ${thirdPartyPartSelectSql()}
        FROM third_party_parts
        ORDER BY COALESCE(NULLIF(loaded_at, ''), NULLIF(invoiced_at, ''), NULLIF(billing_released_at, ''), updated_at) DESC,
          issue_date DESC, romaneio_number DESC
      `)
      .all()
      .map(mapThirdPartyPart);
  }

  listThirdPartyPartsByBillingStage(stage) {
    return this.db
      .prepare(`
        ${thirdPartyPartSelectSql()}
        FROM third_party_parts
        WHERE billing_stage = ?
        ORDER BY COALESCE(NULLIF(invoiced_at, ''), NULLIF(billing_released_at, ''), updated_at) DESC,
          issue_date DESC, romaneio_number DESC
      `)
      .all(String(stage || '').trim())
      .map(mapThirdPartyPart);
  }

  listThirdPartyPartsBillingHistory() {
    return this.db
      .prepare(`
        ${thirdPartyPartSelectSql()}
        FROM third_party_parts
        WHERE billing_stage IN ('invoiced', 'loaded')
          OR trim(COALESCE(invoiced_at, '')) <> ''
          OR trim(COALESCE(invoice_number, '')) <> ''
        ORDER BY COALESCE(NULLIF(loaded_at, ''), NULLIF(invoiced_at, ''), NULLIF(billing_released_at, ''), updated_at) DESC,
          issue_date DESC, romaneio_number DESC
      `)
      .all()
      .map(mapThirdPartyPart);
  }

  findThirdPartyPartById(id) {
    const row = this.db
      .prepare(`
        ${thirdPartyPartSelectSql()}
        FROM third_party_parts
        WHERE id = ?
      `)
      .get(String(id || '').trim());
    return mapThirdPartyPart(row);
  }

  createThirdPartyPart(input, actor = '') {
    const item = sanitizeThirdPartyPartInput(input || {});
    const now = new Date().toISOString();
    const id = randomToken(12);
    const romaneioNumber = item.romaneioNumber || this.nextThirdPartyRomaneioNumber();
    const linkedOrder = item.salesOrderId ? this.findOrderById(item.salesOrderId) : null;
    if (item.salesOrderId && !linkedOrder) {
      throw new Error('Pedido de venda vinculado nao encontrado.');
    }
    const salesOrderReference = item.salesOrderReference || linkedOrder?.orderNumber || '';

    this.db
      .prepare(`
        INSERT INTO third_party_parts (
          id, romaneio_number, supplier_name, supplier_cnpj, part_code, part_description,
          quantity, unit, process_description, issue_date, expected_return_date,
          sales_order_id, sales_order_reference, notes, status, billing_stage, billing_released_at,
          billing_released_by, billing_customer_name, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        romaneioNumber,
        item.supplierName,
        item.supplierCnpj,
        item.partCode,
        item.partDescription,
        item.quantity,
        item.unit,
        item.processDescription,
        item.issueDate,
        item.expectedReturnDate,
        item.salesOrderId,
        salesOrderReference,
        item.notes,
        'Aguardando pedido de compra',
        '',
        '',
        '',
        item.supplierName,
        String(actor || '').trim(),
        now,
        now
      );

    return this.findThirdPartyPartById(id);
  }

  nextThirdPartyRomaneioNumber() {
    const row = this.db.prepare('SELECT COUNT(*) AS total FROM third_party_parts').get();
    const number = String((Number(row?.total) || 0) + 1).padStart(4, '0');
    return `ROM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${number}`;
  }

  updateThirdPartyPurchaseOrderNumber(id, purchaseOrderNumber, actor = '') {
    const existing = this.findThirdPartyPartById(id);
    if (!existing) {
      return null;
    }

    const cleanPurchaseOrder = String(purchaseOrderNumber || '').trim().toUpperCase().slice(0, 120);
    if (!cleanPurchaseOrder) {
      throw new Error('Informe o numero do pedido de compra.');
    }

    if (existing.status === 'Retornado') {
      throw new Error('Remessas retornadas nao podem ser reenviadas ao faturamento.');
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE third_party_parts
        SET purchase_order_number = ?,
          billing_stage = CASE WHEN trim(billing_stage) = '' THEN 'released' ELSE billing_stage END,
          status = CASE WHEN trim(billing_stage) = '' OR status = 'Aguardando pedido de compra' THEN 'Aguardando faturamento' ELSE status END,
          billing_released_at = CASE WHEN trim(billing_released_at) = '' THEN ? ELSE billing_released_at END,
          billing_released_by = CASE WHEN trim(billing_released_by) = '' THEN ? ELSE billing_released_by END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        cleanPurchaseOrder,
        now,
        String(actor || '').trim(),
        now,
        id
      );

    return this.findThirdPartyPartById(id);
  }

  updateThirdPartyBillingInfo(id, input) {
    const existing = this.findThirdPartyPartById(id);
    if (!existing) {
      return null;
    }

    const currentDocument = this.getThirdPartyInvoiceDocument(id) || {};
    const source = { ...existing, ...currentDocument, ...(input || {}) };
    const dimensions = sanitizeBillingDimensions(source);
    const billingInfo = sanitizeBillingInfo(source, existing);
    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE third_party_parts
        SET invoice_number = ?, carrier_name = ?, carrier_cnpj = ?,
          freight_address = ?, billing_customer_name = ?, billing_customer_cnpj = ?,
          invoice_document_name = ?, invoice_document_mime_type = ?, invoice_document_data_url = ?,
          machine_height = ?, machine_width = ?, machine_length = ?,
          machine_weight = ?, machine_gross_weight = ?, machine_volume = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(
        billingInfo.invoiceNumber,
        billingInfo.carrierName,
        billingInfo.carrierCnpj,
        billingInfo.freightAddress,
        billingInfo.billingCustomerName,
        billingInfo.billingCustomerCnpj,
        billingInfo.invoiceDocumentName,
        billingInfo.invoiceDocumentMimeType,
        billingInfo.invoiceDocumentDataUrl,
        dimensions.machineHeight,
        dimensions.machineWidth,
        dimensions.machineLength,
        dimensions.machineWeight,
        dimensions.machineGrossWeight,
        dimensions.machineVolume,
        now,
        id
      );

    return this.findThirdPartyPartById(id);
  }

  markThirdPartyPartInvoiced(id, actor, input = {}) {
    const existing = this.findThirdPartyPartById(id);
    if (!existing) {
      return null;
    }

    const currentDocument = this.getThirdPartyInvoiceDocument(id) || {};
    const source = { ...existing, ...currentDocument, ...(input || {}) };
    const dimensions = sanitizeBillingDimensions(source);
    const billingInfo = sanitizeBillingInfo(source, existing);
    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE third_party_parts
        SET billing_stage = 'invoiced',
          status = 'Faturado - aguardando envio',
          invoice_number = ?, carrier_name = ?, carrier_cnpj = ?,
          freight_address = ?, billing_customer_name = ?, billing_customer_cnpj = ?,
          invoice_document_name = ?, invoice_document_mime_type = ?, invoice_document_data_url = ?,
          machine_height = ?, machine_width = ?, machine_length = ?,
          machine_weight = ?, machine_gross_weight = ?, machine_volume = ?,
          invoiced_at = CASE WHEN trim(invoiced_at) = '' THEN ? ELSE invoiced_at END,
          invoiced_by = CASE WHEN trim(invoiced_by) = '' THEN ? ELSE invoiced_by END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        billingInfo.invoiceNumber,
        billingInfo.carrierName,
        billingInfo.carrierCnpj,
        billingInfo.freightAddress,
        billingInfo.billingCustomerName,
        billingInfo.billingCustomerCnpj,
        billingInfo.invoiceDocumentName,
        billingInfo.invoiceDocumentMimeType,
        billingInfo.invoiceDocumentDataUrl,
        dimensions.machineHeight,
        dimensions.machineWidth,
        dimensions.machineLength,
        dimensions.machineWeight,
        dimensions.machineGrossWeight,
        dimensions.machineVolume,
        now,
        String(actor || '').trim(),
        now,
        id
      );

    return this.findThirdPartyPartById(id);
  }

  getThirdPartyInvoiceDocument(id) {
    const row = this.db
      .prepare(`
        SELECT invoice_document_name, invoice_document_mime_type, invoice_document_data_url
        FROM third_party_parts
        WHERE id = ?
      `)
      .get(String(id || '').trim());

    if (!row || !row.invoice_document_data_url) {
      return null;
    }

    return {
      invoiceDocumentName: row.invoice_document_name || 'nota-fiscal-remessa',
      invoiceDocumentMimeType: row.invoice_document_mime_type || 'application/octet-stream',
      invoiceDocumentDataUrl: row.invoice_document_data_url
    };
  }

  markThirdPartyPartLoaded(id, actor) {
    const existing = this.findThirdPartyPartById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE third_party_parts
        SET billing_stage = 'loaded',
          status = 'Em poder de terceiros',
          loaded_at = CASE WHEN trim(loaded_at) = '' THEN ? ELSE loaded_at END,
          loaded_by = CASE WHEN trim(loaded_by) = '' THEN ? ELSE loaded_by END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(now, String(actor || '').trim(), now, id);

    return this.findThirdPartyPartById(id);
  }

  markThirdPartyPartReturned(id, actor) {
    const existing = this.findThirdPartyPartById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE third_party_parts
        SET status = 'Retornado',
          return_date = CASE WHEN trim(return_date) = '' THEN ? ELSE return_date END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(now.slice(0, 10), now, id);

    return this.findThirdPartyPartById(id);
  }

  deleteThirdPartyPart(id) {
    const result = this.db.prepare('DELETE FROM third_party_parts WHERE id = ?').run(String(id || '').trim());
    return result.changes > 0;
  }

  createOrder(input) {
    const order = sanitizeOrderInput(input);
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT INTO sales_orders (
          id, order_number, commercial_responsible, customer, sku, production_order,
          item_type, purchase_order_number, capacity_tr, product_line, equipment, voltage,
          quantity, lead_time, entry_date, original_delivery_date, production_delivery_date,
          finalization_date, notes, status,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        order.orderNumber,
        order.commercialResponsible,
        order.customer,
        order.sku,
        order.productionOrder,
        order.itemType,
        order.purchaseOrderNumber,
        order.capacityTr,
        order.productLine,
        order.equipment,
        order.voltage,
        order.quantity,
        order.leadTime,
        order.entryDate,
        order.originalDeliveryDate,
        order.productionDeliveryDate,
        order.finalizationDate,
        order.notes,
        order.status,
        now,
        now
      );

    return this.findOrderById(id);
  }

  updateOrder(id, input, actor = '') {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const order = sanitizeOrderInput(input);
    const now = new Date().toISOString();

    this.db.exec('BEGIN');
    try {
      if (existing.status !== order.status) {
        this.recordStatusRelease({
          order: { ...existing, orderNumber: order.orderNumber, quantity: order.quantity },
          previousStatus: existing.status,
          nextStatus: order.status,
          actor,
          changedAt: now
        });
      }

      this.db
        .prepare(`
          UPDATE sales_orders
          SET order_number = ?, commercial_responsible = ?, customer = ?, sku = ?,
            production_order = ?, item_type = ?, purchase_order_number = ?, capacity_tr = ?,
            product_line = ?, equipment = ?, voltage = ?, quantity = ?, lead_time = ?, entry_date = ?,
            original_delivery_date = ?, production_delivery_date = ?, finalization_date = ?,
            notes = ?, status = ?, updated_at = ?
          WHERE id = ?
        `)
        .run(
          order.orderNumber,
          order.commercialResponsible,
          order.customer,
          order.sku,
          order.productionOrder,
          order.itemType,
          order.purchaseOrderNumber,
          order.capacityTr,
          order.productLine,
          order.equipment,
          order.voltage,
          order.quantity,
          order.leadTime,
          order.entryDate,
          order.originalDeliveryDate,
          order.productionDeliveryDate,
          order.finalizationDate,
          order.notes,
          order.status,
          now,
          id
        );
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.findOrderById(id);
  }

  deleteOrder(id) {
    const result = this.db.prepare('DELETE FROM sales_orders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  findOrderById(id) {
    const row = this.db
      .prepare(`
        ${orderSelectSql()}
        FROM sales_orders
        WHERE id = ?
      `)
      .get(id);

    return mapOrder(row);
  }

  listOrderPhotos(orderId) {
    return this.db
      .prepare(`
        SELECT id, order_id, file_name, mime_type, data_url, created_at
        FROM sales_order_photos
        WHERE order_id = ?
        ORDER BY created_at DESC
      `)
      .all(orderId)
      .map(mapOrderPhoto);
  }

  addOrderPhoto(orderId, input) {
    if (!this.findOrderById(orderId)) {
      return null;
    }

    const photo = sanitizePhotoInput(input);
    const id = randomToken(12);
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO sales_order_photos (id, order_id, file_name, mime_type, data_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(id, orderId, photo.fileName, photo.mimeType, photo.dataUrl, now);

    return this.listOrderPhotos(orderId).find((item) => item.id === id) || null;
  }

  deleteOrderPhoto(orderId, photoId) {
    const result = this.db
      .prepare('DELETE FROM sales_order_photos WHERE id = ? AND order_id = ?')
      .run(photoId, orderId);
    return result.changes > 0;
  }

  listProductStats() {
    const groups = new Map();

    for (const order of this.listOrders()) {
      const code = order.sku || 'Sem SKU';
      if (!groups.has(code)) {
        groups.set(code, {
          code,
          productLine: order.productLine || '',
          equipment: order.equipment || '',
          salesOrders: 0,
          machinesSold: 0,
          leadTimes: [],
          entryDates: []
        });
      }

      const group = groups.get(code);
      group.salesOrders += 1;
      group.machinesSold += Number(order.quantity) || 0;
      if (!group.productLine && order.productLine) group.productLine = order.productLine;
      if (!group.equipment && order.equipment) group.equipment = order.equipment;

      const leadTime = calculateLeadTimeDays(order);
      if (leadTime !== null) group.leadTimes.push(leadTime);
      if (isValidDateText(order.entryDate)) group.entryDates.push(order.entryDate);
    }

    return Array.from(groups.values())
      .map((group) => {
        const intervals = calculateIntervals(group.entryDates);
        return {
          code: group.code,
          productLine: group.productLine,
          equipment: group.equipment,
          salesOrders: group.salesOrders,
          machinesSold: group.machinesSold,
          averageLeadTime: average(group.leadTimes),
          averageOrderInterval: average(intervals)
        };
      })
      .sort((a, b) => b.machinesSold - a.machinesSold || a.code.localeCompare(b.code));
  }

  listProductDemandForecasts() {
    const groups = new Map();

    for (const order of this.listOrders()) {
      if (!isDemandForecastOrder(order)) continue;

      const groupKey = productDemandGroupKey(order);
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          productLine: cleanProductLine(order.productLine),
          capacityTr: normalizedCapacityNumber(order.capacityTr),
          capacityLabel: capacityLabel(order.capacityTr),
          salesOrders: 0,
          machinesSold: 0,
          monthlyDemand: new Map(),
          leadTimes: [],
          openOrders: []
        });
      }

      const group = groups.get(groupKey);
      const quantity = positiveQuantity(order.quantity);
      group.salesOrders += 1;
      group.machinesSold += quantity;

      if (isValidDateText(order.entryDate)) {
        const month = order.entryDate.slice(0, 7);
        group.monthlyDemand.set(month, (group.monthlyDemand.get(month) || 0) + quantity);
      }

      const leadTime = calculateHistoricalLeadTimeDays(order);
      if (leadTime !== null) {
        group.leadTimes.push(leadTime);
      }

      if (isOpenDemandOrder(order)) {
        group.openOrders.push(order);
      }
    }

    return Array.from(groups.values())
      .map((group) => {
        const forecast = forecastDemand(group.monthlyDemand);
        const averageLeadTime = average(group.leadTimes);
        const delayRisk = summarizeOpenOrderDelayRisk(group.openOrders, averageLeadTime);

        return {
          productLine: group.productLine,
          capacityTr: group.capacityTr,
          capacityLabel: group.capacityLabel,
          salesOrders: group.salesOrders,
          machinesSold: group.machinesSold,
          averageMonthlyDemand: forecast.averageMonthlyDemand,
          forecastNextMonth: forecast.nextMonth,
          forecastNext3Months: forecast.next3Months,
          forecastMonths: forecast.months,
          averageLeadTime,
          confidence: forecast.confidence,
          openOrders: delayRisk.openOrders,
          openMachines: delayRisk.openMachines,
          predictedLateOrders: delayRisk.predictedLateOrders,
          maxPredictedDelayDays: delayRisk.maxPredictedDelayDays,
          delayRiskLabel: delayRisk.label
        };
      })
      .sort((a, b) => b.forecastNext3Months - a.forecastNext3Months
        || b.machinesSold - a.machinesSold
        || a.productLine.localeCompare(b.productLine)
        || String(a.capacityLabel).localeCompare(String(b.capacityLabel)));
  }

  listStatuses() {
    return this.db
      .prepare('SELECT id, name, category, flow_type, sort_order, created_at, updated_at FROM order_statuses ORDER BY sort_order, name')
      .all()
      .map(mapStatus);
  }

  listStatusNames() {
    return this.listStatuses().map((status) => status.name);
  }

  listProductionStatusNames() {
    return this.listStatuses()
      .filter((status) => status.category === 'production')
      .map((status) => status.name);
  }

  findStatusById(id) {
    const row = this.db
      .prepare('SELECT id, name, category, flow_type, sort_order, created_at, updated_at FROM order_statuses WHERE id = ?')
      .get(id);
    return mapStatus(row);
  }

  findStatusByName(name) {
    const row = this.db
      .prepare('SELECT id, name, category, flow_type, sort_order, created_at, updated_at FROM order_statuses WHERE lower(name) = lower(?)')
      .get(String(name || '').trim());
    return mapStatus(row);
  }

  createStatus(name, category = 'auxiliary', sortOrder = null, flowType = 'normal') {
    const cleanName = String(name || '').trim();
    const cleanCategory = sanitizeStatusCategory(category);
    const cleanFlowType = sanitizeStatusFlowType(flowType);
    const now = new Date().toISOString();
    const nextOrder = this.db.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM order_statuses').get().next_order;
    const cleanSortOrder = sanitizeStatusSortOrder(sortOrder, nextOrder);
    const id = randomToken(12);

    this.db
      .prepare('INSERT INTO order_statuses (id, name, category, flow_type, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, cleanName, cleanCategory, cleanFlowType, cleanSortOrder, now, now);

    return this.findStatusById(id);
  }

  updateStatus(id, name, category = 'auxiliary', sortOrder = null, flowType = 'normal') {
    const existing = this.findStatusById(id);
    if (!existing) {
      return null;
    }

    const cleanName = String(name || '').trim();
    const cleanCategory = sanitizeStatusCategory(category);
    const cleanFlowType = sanitizeStatusFlowType(flowType);
    const cleanSortOrder = sanitizeStatusSortOrder(sortOrder, existing.sortOrder || 0);
    const now = new Date().toISOString();

    this.db.exec('BEGIN');
    try {
      this.db.prepare('UPDATE order_statuses SET name = ?, category = ?, flow_type = ?, sort_order = ?, updated_at = ? WHERE id = ?').run(cleanName, cleanCategory, cleanFlowType, cleanSortOrder, now, id);
      this.db.prepare('UPDATE sales_orders SET status = ?, updated_at = ? WHERE status = ?').run(cleanName, now, existing.name);
      this.db.prepare('UPDATE order_status_history SET completed_status = ?, updated_at = ? WHERE completed_status = ?').run(cleanName, now, existing.name);
      this.db.prepare('UPDATE order_status_history SET next_status = ?, updated_at = ? WHERE next_status = ?').run(cleanName, now, existing.name);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.findStatusById(id);
  }

  validateStatusTransition(currentStatusName, nextStatusName, options = {}) {
    const currentName = String(currentStatusName || '').trim();
    const nextName = String(nextStatusName || '').trim();
    if (!nextName || currentName === nextName) {
      return { ok: true, isDeviation: false };
    }

    const statuses = this.listStatuses();
    const nextStatus = statuses.find((status) => status.name === nextName);
    if (!nextStatus) {
      return { ok: false, error: 'Status de destino nao encontrado.' };
    }

    if (nextStatus.flowType === 'deviation') {
      return { ok: true, isDeviation: true };
    }

    const currentStatus = statuses.find((status) => status.name === currentName);
    if (currentStatus?.flowType === 'deviation') {
      return { ok: true, isDeviation: false };
    }

    const normalStatuses = statuses
      .filter((status) => status.flowType !== 'deviation')
      .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder) || a.name.localeCompare(b.name));
    const currentIndex = normalStatuses.findIndex((status) => status.name === currentName);
    const expectedStatus = currentIndex >= 0 ? normalStatuses[currentIndex + 1] : normalStatuses[0];

    if (expectedStatus && expectedStatus.name === nextName) {
      return { ok: true, isDeviation: false };
    }

    const allowDeviation = Boolean(options.allowDeviation);
    const reason = String(options.deviationReason || '').trim();
    if (allowDeviation && reason) {
      return { ok: true, isDeviation: true };
    }

    const expectedText = expectedStatus ? `O proximo status esperado e "${expectedStatus.name}".` : 'Nao ha proximo status normal configurado.';
    return {
      ok: false,
      error: `Mudanca fora da sequencia. ${expectedText} Para pular etapas, marque desvio e informe o motivo.`
    };
  }

  isStatusUsed(name) {
    const row = this.db.prepare('SELECT COUNT(*) AS total FROM sales_orders WHERE status = ?').get(name);
    return row.total > 0;
  }

  deleteStatus(id) {
    const existing = this.findStatusById(id);
    if (!existing || this.isStatusUsed(existing.name)) {
      return false;
    }

    const result = this.db.prepare('DELETE FROM order_statuses WHERE id = ?').run(id);
    return result.changes > 0;
  }

  ensureStatusName(name, category = 'auxiliary') {
    const cleanName = String(name || '').trim();
    const normalized = normalizeText(cleanName);
    const existingByName = this.findStatusByName(cleanName);
    if (existingByName) {
      return existingByName.name;
    }

    const existingByNormalized = this.listStatuses().find((status) => normalizeText(status.name) === normalized);
    if (existingByNormalized) {
      return existingByNormalized.name;
    }

    return this.createStatus(cleanName, category).name;
  }

  recordStatusRelease({ order, previousStatus, nextStatus, actor = '', changedAt = new Date().toISOString(), sourceActivityId = null }) {
    const completedStatus = String(previousStatus || '').trim();
    const cleanNextStatus = String(nextStatus || '').trim();
    if (!order || !completedStatus || !cleanNextStatus || completedStatus === cleanNextStatus) {
      return;
    }

    this.db
      .prepare(`
        INSERT OR IGNORE INTO order_status_history (
          id, order_id, order_number, completed_status, next_status, quantity, actor,
          completed_at, source_activity_id, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        randomToken(12),
        order.id,
        String(order.orderNumber || '').trim(),
        completedStatus,
        cleanNextStatus,
        optionalInteger(order.quantity) || 0,
        String(actor || 'Sistema').trim(),
        changedAt,
        sourceActivityId,
        changedAt,
        changedAt
      );
  }

  updateOrderStatus(id, status, actor = '') {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const cleanStatus = String(status || '').trim();
    const now = new Date().toISOString();

    this.db.exec('BEGIN');
    try {
      if (existing.status !== cleanStatus) {
        this.recordStatusRelease({
          order: existing,
          previousStatus: existing.status,
          nextStatus: cleanStatus,
          actor,
          changedAt: now
        });
      }

      this.db
        .prepare('UPDATE sales_orders SET status = ?, updated_at = ? WHERE id = ?')
        .run(cleanStatus, now, id);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.findOrderById(id);
  }

  updateOrderProductionOrder(id, productionOrder) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    this.db
      .prepare('UPDATE sales_orders SET production_order = ?, updated_at = ? WHERE id = ?')
      .run(String(productionOrder || '').trim().toUpperCase(), new Date().toISOString(), id);

    return this.findOrderById(id);
  }

  updateOrderPurchaseOrder(id, purchaseOrderNumber) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    this.db
      .prepare('UPDATE sales_orders SET purchase_order_number = ?, updated_at = ? WHERE id = ?')
      .run(String(purchaseOrderNumber || '').trim().toUpperCase(), new Date().toISOString(), id);

    return this.findOrderById(id);
  }

  updateOrderStages(id, input) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const stages = sanitizeOrderStages(input);
    this.db
      .prepare(`
        UPDATE sales_orders
        SET stage_lm = ?,
          stage_serpentina = ?,
          stage_mechanical_project = ?,
          stage_electrical_project = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        stages.lm ? 1 : 0,
        stages.serpentina ? 1 : 0,
        stages.mechanicalProject ? 1 : 0,
        stages.electricalProject ? 1 : 0,
        new Date().toISOString(),
        id
      );

    return this.findOrderById(id);
  }

  listStageSequencing() {
    const sequenceRows = this.db
      .prepare('SELECT order_id, activity_key, sequence_number, estimated_hours, updated_by, updated_at FROM order_stage_sequences')
      .all();
    const sequenceByOrderStage = new Map(
      sequenceRows.map((row) => [`${row.activity_key}:${row.order_id}`, row])
    );
    const activities = ORDER_STAGE_DEFS.map((stage) => ({
      key: stage.key,
      label: stage.label,
      totalOrders: 0,
      totalQuantity: 0,
      items: []
    }));
    const activityByKey = new Map(activities.map((activity) => [activity.key, activity]));
    const orders = this.listOrders({ scope: 'active' }).filter((order) => order.itemType === 'production');

    for (const order of orders) {
      for (const stage of ORDER_STAGE_DEFS) {
        if (order.stages && order.stages[stage.key]) continue;
        const sequence = sequenceByOrderStage.get(`${stage.key}:${order.id}`) || null;
        const activity = activityByKey.get(stage.key);
        activity.items.push(sequencingItemFromOrder(order, stage, sequence));
      }
    }

    for (const activity of activities) {
      activity.items.sort(compareSequencingPriority);
      activity.items = activity.items.map((item, index) => ({
        ...item,
        suggestedSequence: index + 1
      }));
      activity.items.sort(compareSequencingDisplay);
      activity.totalOrders = activity.items.length;
      activity.totalQuantity = activity.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }

    return { activities };
  }

  generateStageSequencing(activityKey = '', actor = '') {
    const selectedKey = normalizeStageKey(activityKey);
    const targetKeys = selectedKey ? [selectedKey] : ORDER_STAGE_KEYS;
    const current = this.listStageSequencing();
    const now = new Date().toISOString();

    this.db.exec('BEGIN');
    try {
      for (const key of targetKeys) {
        const activity = current.activities.find((item) => item.key === key);
        if (!activity) continue;

        const orderedItems = [...activity.items].sort(compareSequencingPriority);
        this.replaceStageSequence(key, orderedItems.map((item, index) => ({
          orderId: item.orderId,
          sequenceNumber: index + 1,
          estimatedHours: item.estimatedHours
        })), actor, now);
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.listStageSequencing();
  }

  saveStageSequencing(activityKey, items, actor = '') {
    const cleanActivityKey = normalizeStageKey(activityKey);
    if (!cleanActivityKey) {
      throw new Error('Atividade de sequenciamento invalida.');
    }

    const pending = this.listStageSequencing().activities.find((activity) => activity.key === cleanActivityKey);
    const pendingIds = new Set((pending?.items || []).map((item) => item.orderId));
    const cleanItems = Array.isArray(items)
      ? items
        .map((item) => ({
          orderId: String(item.orderId || '').trim(),
          sequenceNumber: Number(item.sequenceNumber),
          estimatedHours: optionalSequenceHours(item.estimatedHours)
        }))
        .filter((item) => pendingIds.has(item.orderId) && Number.isFinite(item.sequenceNumber) && item.sequenceNumber > 0)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber || compareText(a.orderId, b.orderId))
        .map((item, index) => ({ ...item, sequenceNumber: index + 1 }))
      : [];

    if (!cleanItems.length && pendingIds.size) {
      throw new Error('Informe pelo menos um item pendente para sequenciar.');
    }

    const now = new Date().toISOString();
    this.db.exec('BEGIN');
    try {
      this.replaceStageSequence(cleanActivityKey, cleanItems, actor, now);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    return this.listStageSequencing();
  }

  replaceStageSequence(activityKey, items, actor = '', now = new Date().toISOString()) {
    const deleteExisting = this.db.prepare('DELETE FROM order_stage_sequences WHERE activity_key = ?');
    const upsert = this.db.prepare(`
      INSERT INTO order_stage_sequences (
        id, order_id, activity_key, sequence_number, estimated_hours, updated_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(order_id, activity_key) DO UPDATE SET
        sequence_number = excluded.sequence_number,
        estimated_hours = excluded.estimated_hours,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at
    `);

    deleteExisting.run(activityKey);
    for (const item of items) {
      upsert.run(
        randomToken(12),
        item.orderId,
        activityKey,
        item.sequenceNumber,
        optionalSequenceHours(item.estimatedHours),
        String(actor || '').trim(),
        now,
        now
      );
    }
  }

  releaseOrderForBilling(id, actor) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE sales_orders
        SET billing_stage = 'released',
          billing_released_at = CASE WHEN trim(billing_released_at) = '' THEN ? ELSE billing_released_at END,
          billing_released_by = CASE WHEN trim(billing_released_by) = '' THEN ? ELSE billing_released_by END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(now, String(actor || '').trim(), now, id);

    return this.findOrderById(id);
  }

  updateBillingDimensions(id, input) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const dimensions = sanitizeBillingDimensions(input || {});
    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE sales_orders
        SET machine_height = ?, machine_width = ?, machine_length = ?,
          machine_weight = ?, machine_gross_weight = ?, machine_volume = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(
        dimensions.machineHeight,
        dimensions.machineWidth,
        dimensions.machineLength,
        dimensions.machineWeight,
        dimensions.machineGrossWeight,
        dimensions.machineVolume,
        now,
        id
      );

    return this.findOrderById(id);
  }

  updateBillingInfo(id, input) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const currentDocument = this.getInvoiceDocument(id) || {};
    const source = { ...existing, ...currentDocument, ...(input || {}) };
    const dimensions = sanitizeBillingDimensions(source);
    const billingInfo = sanitizeBillingInfo(source, existing);
    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE sales_orders
        SET invoice_number = ?, carrier_name = ?, carrier_cnpj = ?,
          freight_address = ?, billing_customer_name = ?, billing_customer_cnpj = ?,
          invoice_document_name = ?, invoice_document_mime_type = ?, invoice_document_data_url = ?,
          machine_height = ?, machine_width = ?, machine_length = ?,
          machine_weight = ?, machine_gross_weight = ?, machine_volume = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(
        billingInfo.invoiceNumber,
        billingInfo.carrierName,
        billingInfo.carrierCnpj,
        billingInfo.freightAddress,
        billingInfo.billingCustomerName,
        billingInfo.billingCustomerCnpj,
        billingInfo.invoiceDocumentName,
        billingInfo.invoiceDocumentMimeType,
        billingInfo.invoiceDocumentDataUrl,
        dimensions.machineHeight,
        dimensions.machineWidth,
        dimensions.machineLength,
        dimensions.machineWeight,
        dimensions.machineGrossWeight,
        dimensions.machineVolume,
        now,
        id
      );

    return this.findOrderById(id);
  }

  markOrderInvoiced(id, actor, input = {}) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const currentDocument = this.getInvoiceDocument(id) || {};
    const source = { ...existing, ...currentDocument, ...(input || {}) };
    const dimensions = sanitizeBillingDimensions(source);
    const billingInfo = sanitizeBillingInfo(source, existing);
    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE sales_orders
        SET billing_stage = 'invoiced',
          invoice_number = ?, carrier_name = ?, carrier_cnpj = ?,
          freight_address = ?, billing_customer_name = ?, billing_customer_cnpj = ?,
          invoice_document_name = ?, invoice_document_mime_type = ?, invoice_document_data_url = ?,
          machine_height = ?, machine_width = ?, machine_length = ?,
          machine_weight = ?, machine_gross_weight = ?, machine_volume = ?,
          invoiced_at = CASE WHEN trim(invoiced_at) = '' THEN ? ELSE invoiced_at END,
          invoiced_by = CASE WHEN trim(invoiced_by) = '' THEN ? ELSE invoiced_by END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        billingInfo.invoiceNumber,
        billingInfo.carrierName,
        billingInfo.carrierCnpj,
        billingInfo.freightAddress,
        billingInfo.billingCustomerName,
        billingInfo.billingCustomerCnpj,
        billingInfo.invoiceDocumentName,
        billingInfo.invoiceDocumentMimeType,
        billingInfo.invoiceDocumentDataUrl,
        dimensions.machineHeight,
        dimensions.machineWidth,
        dimensions.machineLength,
        dimensions.machineWeight,
        dimensions.machineGrossWeight,
        dimensions.machineVolume,
        now,
        String(actor || '').trim(),
        now,
        id
      );

    return this.findOrderById(id);
  }

  getInvoiceDocument(id) {
    const row = this.db
      .prepare(`
        SELECT invoice_document_name, invoice_document_mime_type, invoice_document_data_url
        FROM sales_orders
        WHERE id = ?
      `)
      .get(id);

    if (!row || !row.invoice_document_data_url) {
      return null;
    }

    return {
      invoiceDocumentName: row.invoice_document_name || 'nota-fiscal',
      invoiceDocumentMimeType: row.invoice_document_mime_type || 'application/octet-stream',
      invoiceDocumentDataUrl: row.invoice_document_data_url
    };
  }

  markOrderLoaded(id, actor) {
    const existing = this.findOrderById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const completeStatus = this.ensureStatusName('Concluido', 'auxiliary');
    const notes = appendDimensionNotes(existing.notes, dimensionNotesText(existing));

    this.db.exec('BEGIN');
    try {
      if (existing.status !== completeStatus) {
        this.recordStatusRelease({
          order: existing,
          previousStatus: existing.status,
          nextStatus: completeStatus,
          actor,
          changedAt: now
        });
      }

      this.db
        .prepare(`
          UPDATE sales_orders
          SET billing_stage = 'loaded',
            loaded_at = CASE WHEN trim(loaded_at) = '' THEN ? ELSE loaded_at END,
            loaded_by = CASE WHEN trim(loaded_by) = '' THEN ? ELSE loaded_by END,
            status = ?,
            finalization_date = CASE WHEN trim(finalization_date) = '' THEN ? ELSE finalization_date END,
            notes = ?,
            updated_at = ?
          WHERE id = ?
        `)
        .run(now, String(actor || '').trim(), completeStatus, now.slice(0, 10), notes, now, id);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.findOrderById(id);
  }

  listCustomers() {
    return this.db
      .prepare('SELECT id, name, created_at, updated_at FROM customers ORDER BY name')
      .all()
      .map(mapCustomer);
  }

  listCustomerNames() {
    return this.listCustomers().map((customer) => customer.name);
  }

  findCustomerById(id) {
    const row = this.db
      .prepare('SELECT id, name, created_at, updated_at FROM customers WHERE id = ?')
      .get(id);
    return mapCustomer(row);
  }

  findCustomerByName(name) {
    const row = this.db
      .prepare('SELECT id, name, created_at, updated_at FROM customers WHERE lower(name) = lower(?)')
      .get(String(name || '').trim());
    return mapCustomer(row);
  }

  createCustomer(name) {
    const cleanName = String(name || '').trim();
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare('INSERT INTO customers (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)')
      .run(id, cleanName, now, now);

    return this.findCustomerById(id);
  }

  updateCustomer(id, name) {
    const existing = this.findCustomerById(id);
    if (!existing) {
      return null;
    }

    const cleanName = String(name || '').trim();
    const now = new Date().toISOString();

    this.db.exec('BEGIN');
    try {
      this.db.prepare('UPDATE customers SET name = ?, updated_at = ? WHERE id = ?').run(cleanName, now, id);
      this.db.prepare('UPDATE sales_orders SET customer = ?, updated_at = ? WHERE customer = ?').run(cleanName, now, existing.name);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return this.findCustomerById(id);
  }

  isCustomerUsed(name) {
    const row = this.db.prepare('SELECT COUNT(*) AS total FROM sales_orders WHERE customer = ?').get(name);
    return row.total > 0;
  }

  deleteCustomer(id) {
    const existing = this.findCustomerById(id);
    if (!existing || this.isCustomerUsed(existing.name)) {
      return false;
    }

    const result = this.db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return result.changes > 0;
  }

  listPcpPendingMotives() {
    return this.db
      .prepare(`
        SELECT id, reason, name, created_by, created_at, updated_at
        FROM pcp_pending_motives
        ORDER BY reason ASC, name ASC
      `)
      .all()
      .map(mapPcpPendingMotive);
  }

  createPcpPendingMotive(input, actor = '') {
    const motive = sanitizePcpPendingMotiveInput(input);
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT OR IGNORE INTO pcp_pending_motives (id, reason, name, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(id, motive.reason, motive.name, String(actor || '').trim(), now, now);

    const row = this.db
      .prepare(`
        SELECT id, reason, name, created_by, created_at, updated_at
        FROM pcp_pending_motives
        WHERE reason = ? AND name = ?
      `)
      .get(motive.reason, motive.name);

    return mapPcpPendingMotive(row);
  }

  listPcpPendingIssues(filters = {}) {
    const clauses = [];
    const params = [];
    const status = String(filters.status || '').trim();

    if (status === 'open' || status === 'resolved') {
      clauses.push('pcp_pending_issues.issue_status = ?');
      params.push(status);
    }

    if (filters.search) {
      const search = `%${String(filters.search).trim().toLowerCase()}%`;
      clauses.push(`(
        lower(sales_orders.order_number) LIKE ? OR lower(sales_orders.customer) LIKE ?
        OR lower(sales_orders.sku) LIKE ? OR lower(sales_orders.production_order) LIKE ?
        OR lower(pcp_pending_issues.component_code) LIKE ?
        OR lower(pcp_pending_issues.motive) LIKE ?
        OR lower(pcp_pending_issues.purchase_order_number) LIKE ?
      )`);
      params.push(search, search, search, search, search, search, search);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    return this.db
      .prepare(`
        ${pcpPendingIssueSelectSql()}
        FROM pcp_pending_issues
        INNER JOIN sales_orders ON sales_orders.id = pcp_pending_issues.order_id
        ${where}
        ORDER BY pcp_pending_issues.issue_status = 'resolved' ASC,
          pcp_pending_issues.created_at DESC
      `)
      .all(...params)
      .map(mapPcpPendingIssue);
  }

  findPcpPendingIssueById(id) {
    const row = this.db
      .prepare(`
        ${pcpPendingIssueSelectSql()}
        FROM pcp_pending_issues
        INNER JOIN sales_orders ON sales_orders.id = pcp_pending_issues.order_id
        WHERE pcp_pending_issues.id = ?
      `)
      .get(String(id || ''));

    return mapPcpPendingIssue(row);
  }

  createPcpPendingIssue(input, actor = '') {
    const issue = sanitizePcpPendingIssueInput(input);
    const order = this.findOrderById(issue.orderId);
    if (!order) {
      return null;
    }

    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT INTO pcp_pending_issues (
          id, order_id, component_code, reason, motive, purchase_order_number,
          notes, expected_resolution_date, issue_status,
          created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)
      `)
      .run(
        id,
        issue.orderId,
        issue.componentCode,
        issue.reason,
        issue.motive,
        issue.purchaseOrderNumber,
        issue.notes,
        issue.expectedResolutionDate,
        String(actor || '').trim(),
        now,
        now
      );

    return this.findPcpPendingIssueById(id);
  }

  updatePcpPendingIssueDetails(id, input = {}) {
    const issue = this.findPcpPendingIssueById(id);
    if (!issue) {
      return null;
    }

    const merged = sanitizePcpPendingIssueInput({
      orderId: Object.prototype.hasOwnProperty.call(input, 'orderId') ? input.orderId : issue.orderId,
      componentCode: Object.prototype.hasOwnProperty.call(input, 'componentCode') ? input.componentCode : issue.componentCode,
      reason: Object.prototype.hasOwnProperty.call(input, 'reason') ? input.reason : issue.reason,
      motive: Object.prototype.hasOwnProperty.call(input, 'motive') ? input.motive : issue.motive,
      purchaseOrderNumber: Object.prototype.hasOwnProperty.call(input, 'purchaseOrderNumber') ? input.purchaseOrderNumber : issue.purchaseOrderNumber,
      expectedResolutionDate: Object.prototype.hasOwnProperty.call(input, 'expectedResolutionDate') ? input.expectedResolutionDate : issue.expectedResolutionDate,
      notes: Object.prototype.hasOwnProperty.call(input, 'notes') ? input.notes : issue.notes
    });

    const order = this.findOrderById(merged.orderId);
    if (!order) {
      return null;
    }

    this.db
      .prepare(`
        UPDATE pcp_pending_issues
        SET order_id = ?,
          component_code = ?,
          reason = ?,
          motive = ?,
          purchase_order_number = ?,
          notes = ?,
          expected_resolution_date = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        merged.orderId,
        merged.componentCode,
        merged.reason,
        merged.motive,
        merged.purchaseOrderNumber,
        merged.notes,
        merged.expectedResolutionDate,
        new Date().toISOString(),
        String(id || '')
      );

    return this.findPcpPendingIssueById(id);
  }

  updatePcpPendingIssueExpectedResolutionDate(id, expectedResolutionDate) {
    return this.updatePcpPendingIssueDetails(id, { expectedResolutionDate });
  }

  resolvePcpPendingIssue(id, actor = '') {
    const issue = this.findPcpPendingIssueById(id);
    if (!issue) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE pcp_pending_issues
        SET issue_status = 'resolved',
          resolved_by = ?,
          resolved_at = CASE WHEN trim(resolved_at) = '' THEN ? ELSE resolved_at END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(String(actor || '').trim(), now, now, id);

    return this.findPcpPendingIssueById(id);
  }

  deletePcpPendingIssue(id) {
    const result = this.db.prepare('DELETE FROM pcp_pending_issues WHERE id = ?').run(String(id || ''));
    return result.changes > 0;
  }

  listPurchasePendingItems(filters = {}) {
    const clauses = [];
    const params = [];
    const status = String(filters.status || '').trim();

    if (status === 'pending' || status === 'resolved') {
      clauses.push('item_status = ?');
      params.push(status);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    return this.db
      .prepare(`
        SELECT id, import_batch_id, source_name, row_index, item_key, data_json, sales_order_id, sales_order_number, item_status,
          is_viewed, viewed_by, viewed_at, resolution_note, resolved_by, resolved_at, imported_by, imported_at, created_at, updated_at
        FROM purchase_pending_items
        ${where}
        ORDER BY item_status = 'resolved' ASC, imported_at DESC, row_index ASC, created_at DESC
      `)
      .all(...params)
      .map(mapPurchasePendingItem);
  }

  findPurchasePendingItemById(id) {
    const row = this.db
      .prepare(`
        SELECT id, import_batch_id, source_name, row_index, item_key, data_json, sales_order_id, sales_order_number, item_status,
          is_viewed, viewed_by, viewed_at, resolution_note, resolved_by, resolved_at, imported_by, imported_at, created_at, updated_at
        FROM purchase_pending_items
        WHERE id = ?
      `)
      .get(String(id || ''));

    return mapPurchasePendingItem(row);
  }

  replacePurchasePendingItems(rows, sourceName = '', actor = '') {
    const cleanRows = sanitizePurchasePendingRows(rows);
    const cleanSourceName = String(sourceName || '').trim().slice(0, 240);
    const cleanActor = String(actor || '').trim();
    const now = new Date().toISOString();
    const importBatchId = randomToken(12);
    const summary = {
      imported: cleanRows.length,
      created: 0,
      preserved: 0,
      autoResolved: 0
    };

    this.db.exec('BEGIN');
    try {
      const existingRows = this.db
        .prepare(`
          SELECT id, import_batch_id, source_name, row_index, item_key, data_json, sales_order_id, sales_order_number, item_status,
            is_viewed, viewed_by, viewed_at, resolution_note, resolved_by, resolved_at, imported_by, imported_at, created_at, updated_at
          FROM purchase_pending_items
          ORDER BY item_status = 'resolved' ASC, created_at ASC
        `)
        .all();
      const existingByKey = new Map();

      const matchableExistingRows = existingRows.filter((row) => !purchasePendingWasAutoResolved(row));
      matchableExistingRows.forEach((row) => {
        const itemKey = row.item_key || purchasePendingItemKey(parsePurchasePendingData(row.data_json));
        if (!itemKey) return;
        const bucket = existingByKey.get(itemKey) || [];
        bucket.push(row);
        existingByKey.set(itemKey, bucket);
      });

      const consumedExistingIds = new Set();

      const updateExisting = this.db.prepare(`
        UPDATE purchase_pending_items
        SET import_batch_id = ?,
          source_name = ?,
          row_index = ?,
          item_key = ?,
          data_json = ?,
          imported_by = ?,
          imported_at = ?,
          updated_at = ?
        WHERE id = ?
      `);

      const insert = this.db.prepare(`
        INSERT INTO purchase_pending_items (
          id, import_batch_id, source_name, row_index, item_key, data_json, sales_order_id, sales_order_number, item_status,
          is_viewed, viewed_by, viewed_at, resolution_note, resolved_by, resolved_at, imported_by, imported_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, '', '', 'pending', 0, '', '', '', '', '', ?, ?, ?, ?)
      `);

      cleanRows.forEach((row, index) => {
        const itemKey = purchasePendingItemKey(row);
        const existing = (existingByKey.get(itemKey) || []).find((item) => !consumedExistingIds.has(item.id));
        if (existing) {
          consumedExistingIds.add(existing.id);
          updateExisting.run(
            importBatchId,
            cleanSourceName,
            index + 1,
            itemKey,
            JSON.stringify(row),
            cleanActor,
            now,
            now,
            existing.id
          );
          summary.preserved += 1;
        } else {
          insert.run(
            randomToken(12),
            importBatchId,
            cleanSourceName,
            index + 1,
            itemKey,
            JSON.stringify(row),
            cleanActor,
            now,
            now,
            now
          );
          summary.created += 1;
        }
      });

      const autoResolve = this.db.prepare(`
        UPDATE purchase_pending_items
        SET item_status = 'resolved',
          resolution_note = ?,
          resolved_by = ?,
          resolved_at = CASE WHEN trim(resolved_at) = '' THEN ? ELSE resolved_at END,
          updated_at = ?
        WHERE id = ?
      `);
      const autoResolutionNote = `Baixa automatica: item nao encontrado na importacao ${cleanSourceName || importBatchId}.`;

      existingRows
        .filter((row) => row.item_status !== 'resolved' && !consumedExistingIds.has(row.id))
        .forEach((row) => {
          autoResolve.run(autoResolutionNote, cleanActor || 'Sistema', now, now, row.id);
          summary.autoResolved += 1;
        });

      const missingItemKeyRows = existingRows.filter((row) => !row.item_key);
      if (missingItemKeyRows.length) {
        const updateMissingKey = this.db.prepare('UPDATE purchase_pending_items SET item_key = ? WHERE id = ?');
        missingItemKeyRows.forEach((row) => {
          updateMissingKey.run(purchasePendingItemKey(parsePurchasePendingData(row.data_json)), row.id);
        });
      }

      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }

    return {
      items: this.listPurchasePendingItems(),
      summary
    };
  }

  resolvePurchasePendingItem(id, note = '', actor = '') {
    const item = this.findPurchasePendingItemById(id);
    if (!item) {
      return null;
    }

    const cleanNote = sanitizePurchasePendingResolutionNote(note);
    const now = new Date().toISOString();

    this.db
      .prepare(`
        UPDATE purchase_pending_items
        SET item_status = 'resolved',
          resolution_note = ?,
          resolved_by = ?,
          resolved_at = CASE WHEN trim(resolved_at) = '' THEN ? ELSE resolved_at END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(cleanNote, String(actor || '').trim(), now, now, String(id || ''));

    return this.findPurchasePendingItemById(id);
  }

  updatePurchasePendingSalesOrderLink(id, salesOrderId = '', actor = '') {
    const item = this.findPurchasePendingItemById(id);
    if (!item) {
      return null;
    }

    const cleanOrderId = String(salesOrderId || '').trim();
    let orderNumber = '';
    if (cleanOrderId) {
      const order = this.findOrderById(cleanOrderId);
      if (!order) {
        throw new Error('Pedido de venda vinculado nao encontrado.');
      }
      if (!isActiveOrderForLink(order)) {
        throw new Error('Vincule apenas pedidos de venda ativos.');
      }
      orderNumber = order.orderNumber || '';
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE purchase_pending_items
        SET sales_order_id = ?,
          sales_order_number = ?,
          is_viewed = 1,
          viewed_by = CASE WHEN trim(viewed_by) = '' THEN ? ELSE viewed_by END,
          viewed_at = CASE WHEN trim(viewed_at) = '' THEN ? ELSE viewed_at END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(cleanOrderId, orderNumber, String(actor || '').trim(), now, now, String(id || ''));

    return this.findPurchasePendingItemById(id);
  }

  markPurchasePendingItemViewed(id, actor = '') {
    const item = this.findPurchasePendingItemById(id);
    if (!item) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE purchase_pending_items
        SET is_viewed = 1,
          viewed_by = CASE WHEN trim(viewed_by) = '' THEN ? ELSE viewed_by END,
          viewed_at = CASE WHEN trim(viewed_at) = '' THEN ? ELSE viewed_at END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(String(actor || '').trim(), now, now, String(id || ''));

    return this.findPurchasePendingItemById(id);
  }

  clearPurchasePendingItems(scope = 'pending') {
    const sql = scope === 'all'
      ? 'DELETE FROM purchase_pending_items'
      : "DELETE FROM purchase_pending_items WHERE item_status = 'pending'";
    const result = this.db.prepare(sql).run();
    return result.changes || 0;
  }

  getQualityRncState() {
    const row = this.db
      .prepare('SELECT payload FROM quality_rnc_state WHERE id = ?')
      .get('default');

    if (!row) {
      return null;
    }

    try {
      return JSON.parse(row.payload);
    } catch (error) {
      return null;
    }
  }

  saveQualityRncState(input, actor = '') {
    const payload = sanitizeQualityRncState(input);
    const now = new Date().toISOString();
    this.db
      .prepare(`
        INSERT INTO quality_rnc_state (id, payload, updated_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          payload = excluded.payload,
          updated_by = excluded.updated_by,
          updated_at = excluded.updated_at
      `)
      .run('default', JSON.stringify(payload), String(actor || '').trim(), now, now);

    return this.getQualityRncState();
  }

  listQualityAlerts(options = {}) {
    return this.db
      .prepare(`
        ${qualityAlertSelectSql(Boolean(options.includePhotos))}
        FROM quality_alerts
        ORDER BY created_at DESC
      `)
      .all()
      .map(mapQualityAlert);
  }

  findQualityAlertById(id, includePhotos = true) {
    const row = this.db
      .prepare(`
        ${qualityAlertSelectSql(includePhotos)}
        FROM quality_alerts
        WHERE id = ?
      `)
      .get(String(id || '').trim());
    return mapQualityAlert(row);
  }

  listQualityAlertAcknowledgementsForUser(userId) {
    return this.db
      .prepare(`
        SELECT id, alert_id, order_id, user_id, acknowledged_by, acknowledged_at
        FROM quality_alert_acknowledgements
        WHERE user_id = ?
        ORDER BY acknowledged_at DESC
      `)
      .all(String(userId || '').trim())
      .map(mapQualityAlertAcknowledgement);
  }

  createQualityAlert(input, actor = '') {
    const alertInput = sanitizeQualityAlertInput(input || {});
    const linkedOrder = alertInput.orderId ? this.findOrderById(alertInput.orderId) : null;
    if (alertInput.orderId && !linkedOrder) {
      throw new Error('Pedido de venda informado no alerta nao encontrado.');
    }

    const alert = hydrateQualityAlertFromOrder(alertInput, linkedOrder);
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT INTO quality_alerts (
          id, order_id, order_number, customer, product_line, sku, capacity_tr, quantity,
          wrong_photo_name, wrong_photo_mime_type, wrong_photo_data_url, wrong_description,
          right_photo_name, right_photo_mime_type, right_photo_data_url, right_description,
          status, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        alert.orderId,
        alert.orderNumber,
        alert.customer,
        alert.productLine,
        alert.sku,
        alert.capacityTr,
        alert.quantity,
        alert.wrongPhoto.fileName,
        alert.wrongPhoto.mimeType,
        alert.wrongPhoto.dataUrl,
        alert.wrongDescription,
        alert.rightPhoto.fileName,
        alert.rightPhoto.mimeType,
        alert.rightPhoto.dataUrl,
        alert.rightDescription,
        'open',
        String(actor || '').trim(),
        now,
        now
      );

    return this.findQualityAlertById(id, true);
  }

  updateQualityAlert(id, input, actor = '') {
    const existing = this.findQualityAlertById(id, true);
    if (!existing) {
      return null;
    }

    const alertInput = sanitizeQualityAlertInput(input || {});
    const linkedOrder = alertInput.orderId ? this.findOrderById(alertInput.orderId) : null;
    if (alertInput.orderId && !linkedOrder) {
      throw new Error('Pedido de venda informado no alerta nao encontrado.');
    }

    const alert = hydrateQualityAlertFromOrder(alertInput, linkedOrder);
    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE quality_alerts
        SET order_id = ?, order_number = ?, customer = ?, product_line = ?, sku = ?,
          capacity_tr = ?, quantity = ?,
          wrong_photo_name = ?, wrong_photo_mime_type = ?, wrong_photo_data_url = ?, wrong_description = ?,
          right_photo_name = ?, right_photo_mime_type = ?, right_photo_data_url = ?, right_description = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .run(
        alert.orderId,
        alert.orderNumber,
        alert.customer,
        alert.productLine,
        alert.sku,
        alert.capacityTr,
        alert.quantity,
        alert.wrongPhoto.fileName,
        alert.wrongPhoto.mimeType,
        alert.wrongPhoto.dataUrl,
        alert.wrongDescription,
        alert.rightPhoto.fileName,
        alert.rightPhoto.mimeType,
        alert.rightPhoto.dataUrl,
        alert.rightDescription,
        now,
        existing.id
      );

    return this.findQualityAlertById(existing.id, true);
  }

  resolveQualityAlert(id, actor = '') {
    const existing = this.findQualityAlertById(id, false);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE quality_alerts
        SET status = 'resolved',
          resolved_at = CASE WHEN trim(resolved_at) = '' THEN ? ELSE resolved_at END,
          resolved_by = CASE WHEN trim(resolved_by) = '' THEN ? ELSE resolved_by END,
          updated_at = ?
        WHERE id = ?
      `)
      .run(now, String(actor || '').trim(), now, existing.id);

    return this.findQualityAlertById(existing.id, false);
  }

  acknowledgeQualityAlert(alertId, orderId, userId, actor = '') {
    const alert = this.findQualityAlertById(alertId, false);
    const order = this.findOrderById(orderId);
    const cleanUserId = String(userId || '').trim();
    if (!alert || !order || !cleanUserId) {
      return null;
    }

    const now = new Date().toISOString();
    const id = randomToken(12);
    this.db
      .prepare(`
        INSERT INTO quality_alert_acknowledgements (
          id, alert_id, order_id, user_id, acknowledged_by, acknowledged_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(alert_id, order_id, user_id) DO UPDATE SET
          acknowledged_by = excluded.acknowledged_by,
          acknowledged_at = excluded.acknowledged_at
      `)
      .run(id, alert.id, order.id, cleanUserId, String(actor || '').trim(), now);

    return this.listQualityAlertAcknowledgementsForUser(cleanUserId)
      .find((acknowledgement) => acknowledgement.alertId === alert.id && acknowledgement.orderId === order.id) || null;
  }

  deleteQualityAlert(id) {
    const result = this.db.prepare('DELETE FROM quality_alerts WHERE id = ?').run(String(id || '').trim());
    return result.changes > 0;
  }

  listAiKnowledgeSources(options = {}) {
    const clauses = [];
    const params = [];
    if (options.activeOnly) {
      clauses.push("status = 'active'");
    }
    if (options.scope) {
      clauses.push('scope = ?');
      params.push(String(options.scope || '').trim());
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const limit = clampInteger(options.limit, 1, 500, 100);

    return this.db
      .prepare(`
        SELECT id, title, source_type, scope, content, tags, status, created_by, created_at, updated_at
        FROM ai_knowledge_sources
        ${where}
        ORDER BY updated_at DESC
        LIMIT ?
      `)
      .all(...params, limit)
      .map(mapAiKnowledgeSource);
  }

  findAiKnowledgeSourceById(id) {
    const row = this.db
      .prepare(`
        SELECT id, title, source_type, scope, content, tags, status, created_by, created_at, updated_at
        FROM ai_knowledge_sources
        WHERE id = ?
      `)
      .get(String(id || '').trim());
    return mapAiKnowledgeSource(row);
  }

  createAiKnowledgeSource(input, actor = '') {
    const source = sanitizeAiKnowledgeSourceInput(input);
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT INTO ai_knowledge_sources (
          id, title, source_type, scope, content, tags, status, created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        source.title,
        source.sourceType,
        source.scope,
        source.content,
        source.tags,
        source.status,
        String(actor || '').trim(),
        now,
        now
      );

    return this.findAiKnowledgeSourceById(id);
  }

  updateAiKnowledgeSource(id, input, actor = '') {
    const existing = this.findAiKnowledgeSourceById(id);
    if (!existing) {
      return null;
    }
    const source = sanitizeAiKnowledgeSourceInput({ ...existing, ...input });
    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE ai_knowledge_sources
        SET title = ?, source_type = ?, scope = ?, content = ?, tags = ?, status = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(source.title, source.sourceType, source.scope, source.content, source.tags, source.status, now, existing.id);

    if (actor) {
      this.logActivity({
        actor,
        action: 'Base de conhecimento IA atualizada',
        entityType: 'IA',
        entityLabel: source.title,
        details: `Escopo: ${source.scope}; Status: ${source.status}`
      });
    }

    return this.findAiKnowledgeSourceById(existing.id);
  }

  deleteAiKnowledgeSource(id) {
    const result = this.db.prepare('DELETE FROM ai_knowledge_sources WHERE id = ?').run(String(id || '').trim());
    return result.changes > 0;
  }

  listAiTrainingRuns(limit = 80) {
    return this.db
      .prepare(`
        SELECT id, objective, dataset_scope, model_target, status, notes, result_summary,
          created_by, created_at, updated_at
        FROM ai_training_runs
        ORDER BY updated_at DESC
        LIMIT ?
      `)
      .all(clampInteger(limit, 1, 300, 80))
      .map(mapAiTrainingRun);
  }

  findAiTrainingRunById(id) {
    const row = this.db
      .prepare(`
        SELECT id, objective, dataset_scope, model_target, status, notes, result_summary,
          created_by, created_at, updated_at
        FROM ai_training_runs
        WHERE id = ?
      `)
      .get(String(id || '').trim());
    return mapAiTrainingRun(row);
  }

  createAiTrainingRun(input, actor = '') {
    const training = sanitizeAiTrainingRunInput(input);
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT INTO ai_training_runs (
          id, objective, dataset_scope, model_target, status, notes, result_summary,
          created_by, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        training.objective,
        training.datasetScope,
        training.modelTarget,
        training.status,
        training.notes,
        training.resultSummary,
        String(actor || '').trim(),
        now,
        now
      );

    return this.findAiTrainingRunById(id);
  }

  updateAiTrainingRun(id, input) {
    const existing = this.findAiTrainingRunById(id);
    if (!existing) {
      return null;
    }
    const training = sanitizeAiTrainingRunInput({ ...existing, ...input });
    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE ai_training_runs
        SET objective = ?, dataset_scope = ?, model_target = ?, status = ?,
          notes = ?, result_summary = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(
        training.objective,
        training.datasetScope,
        training.modelTarget,
        training.status,
        training.notes,
        training.resultSummary,
        now,
        existing.id
      );

    return this.findAiTrainingRunById(existing.id);
  }

  listAiAnalysisHistory(limit = 80) {
    return this.db
      .prepare(`
        SELECT id, prompt, context_scope, mode, response, confidence, created_by, created_at
        FROM ai_analysis_history
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(clampInteger(limit, 1, 300, 80))
      .map(mapAiAnalysis);
  }

  createAiAnalysisHistory(input, actor = '') {
    const analysis = sanitizeAiAnalysisInput(input);
    const now = new Date().toISOString();
    const id = randomToken(12);

    this.db
      .prepare(`
        INSERT INTO ai_analysis_history (
          id, prompt, context_scope, mode, response, confidence, created_by, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        analysis.prompt,
        analysis.contextScope,
        analysis.mode,
        analysis.response,
        analysis.confidence,
        String(actor || '').trim(),
        now
      );

    return this.listAiAnalysisHistory(1)[0] || null;
  }

  logActivity({ actor, action, entityType, entityLabel, details = '' }) {
    this.db
      .prepare(`
        INSERT INTO activity_log (id, actor, action, entity_type, entity_label, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        randomToken(12),
        String(actor || 'Sistema').trim(),
        String(action || '').trim(),
        String(entityType || '').trim(),
        String(entityLabel || '').trim(),
        String(details || '').trim(),
        new Date().toISOString()
      );
  }

  listActivityLog(limit = 500) {
    return this.db
      .prepare(`
        SELECT id, actor, action, entity_type, entity_label, details, created_at
        FROM activity_log
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(limit)
      .map(mapActivity);
  }

  listActivityLogPage(filters = {}) {
    const clauses = [];
    const params = [];

    appendActivitySearchClause(filters.search, clauses, params);
    appendActivityDateClause(filters, clauses, params);
    appendActivityActionGroupClause(filters.actionGroup, clauses);
    appendActivityColumnFilterClauses(filters.filters, clauses, params);

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = activitySortSql(filters.sort, filters.direction);
    const pageSize = clampInteger(filters.pageSize, 10, 200, 50);
    const page = clampInteger(filters.page, 1, 1000000, 1);
    const offset = (page - 1) * pageSize;
    const total = Number(this.db
      .prepare(`SELECT COUNT(*) AS total FROM activity_log ${where}`)
      .get(...params).total) || 0;

    const activities = this.db
      .prepare(`
        SELECT id, actor, action, entity_type, entity_label, details, created_at
        FROM activity_log
        ${where}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `)
      .all(...params, pageSize, offset)
      .map(mapActivity);

    return {
      activities,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    };
  }

  ping() {
    this.db.prepare('SELECT 1 AS ok').get();
    return true;
  }

  listBackups() {
    const dir = this.backupDir();
    fs.mkdirSync(dir, { recursive: true });
    return fs.readdirSync(dir)
      .filter((name) => /^sop-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.sqlite$/.test(name))
      .map((name) => {
        const fullPath = path.join(dir, name);
        const stat = fs.statSync(fullPath);
        return {
          name,
          size: stat.size,
          createdAt: stat.mtime.toISOString()
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  latestBackup() {
    return this.listBackups()[0] || null;
  }

  createBackup(label = 'manual') {
    const dir = this.backupDir();
    fs.mkdirSync(dir, { recursive: true });
    this.db.exec('PRAGMA wal_checkpoint(FULL);');
    const timestamp = new Date().toISOString().replace(/\..+$/, '').replace(/:/g, '-');
    const fileName = `sop-backup-${timestamp}.sqlite`;
    const fullPath = path.join(dir, fileName);
    fs.copyFileSync(this.file, fullPath);
    const stat = fs.statSync(fullPath);
    this.setMetaIfMissing('backupDir', dir);
    this.db
      .prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)')
      .run('lastBackup', JSON.stringify({ name: fileName, label: String(label || 'manual'), createdAt: stat.mtime.toISOString(), size: stat.size }));
    return this.latestBackup();
  }

  createDailyBackupIfNeeded() {
    const latest = this.latestBackup();
    if (latest && Date.now() - new Date(latest.createdAt).getTime() < 23 * 60 * 60 * 1000) {
      return latest;
    }
    return this.createBackup('automatico');
  }

  restoreBackup(fileName) {
    const backupPath = this.safeBackupPath(fileName);
    if (!fs.existsSync(backupPath)) {
      return false;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    fs.copyFileSync(backupPath, this.file);
    this.init();
    return true;
  }

  testLatestBackupRestore() {
    const backup = this.latestBackup();
    if (!backup) {
      return {
        ok: false,
        backup: null,
        mode: 'sqlite-copy-open',
        message: 'Nenhum backup local encontrado para testar.'
      };
    }

    const backupPath = this.safeBackupPath(backup.name);
    const testDir = path.join(this.settings.dataDir || path.dirname(this.file), 'restore-tests');
    fs.mkdirSync(testDir, { recursive: true });
    const testFile = path.join(testDir, `restore-test-${Date.now()}.sqlite`);

    let testDb = null;
    try {
      fs.copyFileSync(backupPath, testFile);
      testDb = createSqliteDatabase(testFile);
      const users = testDb.prepare('SELECT COUNT(*) AS total FROM users').get();
      const orders = testDb.prepare('SELECT COUNT(*) AS total FROM sales_orders').get();
      return {
        ok: true,
        backup,
        mode: 'sqlite-copy-open',
        message: `Backup aberto com sucesso. Usuarios: ${users.total}; pedidos: ${orders.total}.`
      };
    } finally {
      try {
        testDb?.close?.();
      } catch (error) {
        // Ignora fechamento de teste.
      }
      try {
        fs.rmSync(testFile, { force: true });
      } catch (error) {
        // Ignora limpeza de arquivo temporario.
      }
    }
  }

  backupDir() {
    return this.settings.backupDir || path.join(this.settings.dataDir || path.dirname(this.file), 'backups');
  }

  safeBackupPath(fileName) {
    const cleanName = path.basename(String(fileName || ''));
    if (!/^sop-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.sqlite$/.test(cleanName)) {
      throw new Error('Arquivo de backup invalido.');
    }

    const dir = this.backupDir();
    const fullPath = path.resolve(dir, cleanName);
    const resolvedDir = path.resolve(dir);
    if (!fullPath.startsWith(`${resolvedDir}${path.sep}`)) {
      throw new Error('Arquivo de backup invalido.');
    }
    return fullPath;
  }

  listStatusReleaseMonths() {
    return this.db
      .prepare(`
        SELECT DISTINCT substr(completed_at, 1, 7) AS month
        FROM order_status_history
        WHERE trim(completed_at) <> ''
        ORDER BY month DESC
      `)
      .all()
      .map((row) => row.month)
      .filter(Boolean);
  }

  listStatusReleaseSummary(month = '') {
    const cleanMonth = isValidMonthText(month) ? String(month).trim() : '';
    const params = [];
    const clauses = ["trim(completed_status) <> ''"];

    if (cleanMonth) {
      clauses.push('substr(completed_at, 1, 7) = ?');
      params.push(cleanMonth);
    }

    return this.db
      .prepare(`
        SELECT substr(completed_at, 1, 7) AS month,
          completed_status AS status,
          COUNT(*) AS orders,
          COALESCE(SUM(quantity), 0) AS machines,
          MAX(completed_at) AS last_completed_at
        FROM order_status_history
        WHERE ${clauses.join(' AND ')}
        GROUP BY substr(completed_at, 1, 7), completed_status
        ORDER BY month DESC, machines DESC, status ASC
      `)
      .all(...params)
      .map(mapStatusReleaseSummary);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

function mapUser(row) {
  if (!row) {
    return null;
  }
  const role = normalizeRole(row.role);
  const defaults = roleDefaults(role);

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role,
    canEditOrders: role === 'admin' || Boolean(row.can_edit_orders) || defaults.canEditOrders,
    visibleTabs: normalizeTabList(row.visible_tabs, defaults.visibleTabs),
    editableTabs: normalizeTabList(row.editable_tabs, defaults.editableTabs),
    password: {
      salt: row.password_salt,
      hash: row.password_hash,
      iterations: row.password_iterations,
      digest: row.password_digest
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOrder(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    commercialResponsible: row.commercial_responsible,
    customer: row.customer,
    sku: row.sku,
    productionOrder: row.production_order,
    itemType: row.item_type || 'production',
    purchaseOrderNumber: row.purchase_order_number || '',
    capacityTr: row.capacity_tr,
    productLine: row.product_line,
    equipment: row.equipment,
    voltage: row.voltage,
    quantity: row.quantity,
    leadTime: calculateLeadTimeDisplay(row.entry_date, row.original_delivery_date),
    entryDate: row.entry_date,
    originalDeliveryDate: row.original_delivery_date,
    productionDeliveryDate: row.production_delivery_date,
    daysLate: calculateDaysLate(row.original_delivery_date, row.finalization_date, row.status, row.billing_stage),
    finalizationDate: row.finalization_date,
    notes: row.notes,
    status: row.status,
    billingStage: row.billing_stage || '',
    billingReleasedAt: row.billing_released_at || '',
    billingReleasedBy: row.billing_released_by || '',
    invoicedAt: row.invoiced_at || '',
    invoicedBy: row.invoiced_by || '',
    loadedAt: row.loaded_at || '',
    loadedBy: row.loaded_by || '',
    invoiceNumber: row.invoice_number || '',
    carrierName: row.carrier_name || '',
    carrierCnpj: row.carrier_cnpj || '',
    freightAddress: row.freight_address || '',
    billingCustomerName: row.billing_customer_name || '',
    billingCustomerCnpj: row.billing_customer_cnpj || '',
    invoiceDocumentName: row.invoice_document_name || '',
    invoiceDocumentMimeType: row.invoice_document_mime_type || '',
    hasInvoiceDocument: Boolean(row.has_invoice_document),
    machineHeight: row.machine_height,
    machineWidth: row.machine_width,
    machineLength: row.machine_length,
    machineWeight: row.machine_weight,
    machineGrossWeight: row.machine_gross_weight,
    machineVolume: row.machine_volume,
    stages: {
      lm: Boolean(row.stage_lm),
      serpentina: Boolean(row.stage_serpentina),
      mechanicalProject: Boolean(row.stage_mechanical_project),
      electricalProject: Boolean(row.stage_electrical_project)
    },
    photoCount: Number(row.photo_count) || 0,
    pcpPendingCount: Number(row.pcp_pending_count) || 0,
    pcpPendingSummary: row.pcp_pending_summary || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapThirdPartyPart(row) {
  if (!row) {
    return null;
  }

    return {
      id: row.id,
      sourceType: 'thirdParty',
      sourceLabel: 'Remessa de beneficiamento',
    orderNumber: row.romaneio_number,
    romaneioNumber: row.romaneio_number,
    commercialResponsible: row.created_by || '',
    customer: row.supplier_name,
    supplierName: row.supplier_name,
    supplierCnpj: row.supplier_cnpj || '',
    sku: row.part_code,
    partCode: row.part_code,
    productionOrder: '',
    itemType: 'third_party_processing',
    purchaseOrderNumber: row.purchase_order_number || '',
    capacityTr: null,
    productLine: 'Pecas em terceiros',
    equipment: row.part_description,
    partDescription: row.part_description,
    voltage: '',
    quantity: row.quantity,
    unit: row.unit || 'UN',
    processDescription: row.process_description || '',
    leadTime: '',
    entryDate: row.issue_date,
      issueDate: row.issue_date,
      originalDeliveryDate: row.expected_return_date || '',
      expectedReturnDate: row.expected_return_date || '',
      productionDeliveryDate: '',
      daysLate: calculateDaysLate(row.expected_return_date),
      finalizationDate: row.return_date || '',
      returnDate: row.return_date || '',
      salesOrderId: row.sales_order_id || '',
      salesOrderReference: row.sales_order_reference || '',
      linkedOrderNumber: row.linked_order_number || '',
      linkedOrderCustomer: row.linked_order_customer || '',
      linkedOrderSku: row.linked_order_sku || '',
      notes: row.notes || '',
    status: row.status || 'Aguardando pedido de compra',
    billingStage: row.billing_stage || '',
    billingReleasedAt: row.billing_released_at || '',
    billingReleasedBy: row.billing_released_by || '',
    invoicedAt: row.invoiced_at || '',
    invoicedBy: row.invoiced_by || '',
    loadedAt: row.loaded_at || '',
    loadedBy: row.loaded_by || '',
    invoiceNumber: row.invoice_number || '',
    carrierName: row.carrier_name || '',
    carrierCnpj: row.carrier_cnpj || '',
    freightAddress: row.freight_address || '',
    billingCustomerName: row.billing_customer_name || row.supplier_name || '',
    billingCustomerCnpj: row.billing_customer_cnpj || '',
    invoiceDocumentName: row.invoice_document_name || '',
    invoiceDocumentMimeType: row.invoice_document_mime_type || '',
    hasInvoiceDocument: Boolean(row.has_invoice_document),
    machineHeight: row.machine_height,
    machineWidth: row.machine_width,
    machineLength: row.machine_length,
    machineWeight: row.machine_weight,
    machineGrossWeight: row.machine_gross_weight,
    machineVolume: row.machine_volume,
    stages: {},
    photoCount: 0,
    pcpPendingCount: 0,
    pcpPendingSummary: '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapStatus(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category || 'auxiliary',
    flowType: row.flow_type || 'normal',
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCustomer(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapActivity(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    entityType: row.entity_type,
    entityLabel: row.entity_label,
    details: row.details,
    createdAt: row.created_at
  };
}

function mapStatusReleaseSummary(row) {
  if (!row) {
    return null;
  }

  return {
    month: row.month,
    status: row.status,
    orders: row.orders,
    machines: row.machines,
    lastCompletedAt: row.last_completed_at
  };
}

function mapOrderPhoto(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    orderId: row.order_id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    dataUrl: row.data_url,
    createdAt: row.created_at
  };
}

function mapQualityAlert(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    orderId: row.order_id || '',
    orderNumber: row.order_number || '',
    customer: row.customer || '',
    productLine: row.product_line || '',
    sku: row.sku || '',
    capacityTr: row.capacity_tr,
    quantity: row.quantity,
    wrongPhotoName: row.wrong_photo_name || '',
    wrongPhotoMimeType: row.wrong_photo_mime_type || '',
    wrongPhotoDataUrl: row.wrong_photo_data_url || '',
    hasWrongPhoto: Boolean(row.has_wrong_photo),
    wrongDescription: row.wrong_description || '',
    rightPhotoName: row.right_photo_name || '',
    rightPhotoMimeType: row.right_photo_mime_type || '',
    rightPhotoDataUrl: row.right_photo_data_url || '',
    hasRightPhoto: Boolean(row.has_right_photo),
    rightDescription: row.right_description || '',
    status: row.status || 'open',
    resolvedAt: row.resolved_at || '',
    resolvedBy: row.resolved_by || '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapQualityAlertAcknowledgement(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    alertId: row.alert_id,
    orderId: row.order_id,
    userId: row.user_id,
    acknowledgedBy: row.acknowledged_by || '',
    acknowledgedAt: row.acknowledged_at
  };
}

function mapAiKnowledgeSource(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title || '',
    sourceType: row.source_type || 'manual',
    scope: row.scope || 'general',
    content: row.content || '',
    tags: row.tags || '',
    status: row.status || 'active',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAiTrainingRun(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    objective: row.objective || '',
    datasetScope: row.dataset_scope || 'all',
    modelTarget: row.model_target || 'decision-support',
    status: row.status || 'planned',
    notes: row.notes || '',
    resultSummary: row.result_summary || '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAiAnalysis(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    prompt: row.prompt || '',
    contextScope: row.context_scope || 'all',
    mode: row.mode || 'rules-engine',
    response: row.response || '',
    confidence: row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
    createdBy: row.created_by || '',
    createdAt: row.created_at
  };
}

function mapPcpPendingIssue(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    orderId: row.order_id,
    orderNumber: row.order_number,
    customer: row.customer,
    sku: row.sku,
    productionOrder: row.production_order,
    orderStatus: row.order_status,
    componentCode: row.component_code,
    reason: row.reason,
    reasonLabel: pcpPendingReasonLabel(row.reason),
    motive: row.motive || '',
    purchaseOrderNumber: row.purchase_order_number || '',
    notes: row.notes,
    expectedResolutionDate: row.expected_resolution_date,
    issueStatus: row.issue_status,
    issueStatusLabel: row.issue_status === 'resolved' ? 'Resolvida' : 'Aberta',
    createdBy: row.created_by,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPcpPendingMotive(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    reason: row.reason,
    reasonLabel: pcpPendingReasonLabel(row.reason),
    name: row.name,
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPurchasePendingItem(row) {
  if (!row) {
    return null;
  }

  const data = parsePurchasePendingData(row.data_json);

  const itemStatus = row.item_status === 'resolved' ? 'resolved' : 'pending';
  return {
    ...data,
    id: row.id,
    importBatchId: row.import_batch_id || '',
    sourceName: row.source_name || '',
    rowIndex: Number(row.row_index) || 0,
    itemKey: row.item_key || purchasePendingItemKey(data),
    salesOrderId: row.sales_order_id || '',
    salesOrderNumber: row.sales_order_number || '',
    linkedSalesOrderNumber: row.sales_order_number || '',
    itemStatus,
    itemStatusLabel: itemStatus === 'resolved' ? 'Baixado' : 'Pendente',
    isViewed: Number(row.is_viewed) !== 0,
    viewedBy: row.viewed_by || '',
    viewedAt: row.viewed_at || '',
    resolutionNote: row.resolution_note || '',
    resolvedBy: row.resolved_by || '',
    resolvedAt: row.resolved_at || '',
    importedBy: row.imported_by || '',
    importedAt: row.imported_at || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function parsePurchasePendingData(value) {
  try {
    const data = JSON.parse(value || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (error) {
    return {};
  }
}

function sequencingItemFromOrder(order, stage, sequence) {
  const priorityDate = order.productionDeliveryDate || order.originalDeliveryDate || order.entryDate || '';
  return {
    orderId: order.id,
    activityKey: stage.key,
    activityLabel: stage.label,
    sequenceNumber: sequence ? Number(sequence.sequence_number) || null : null,
    estimatedHours: sequence && sequence.estimated_hours !== null && sequence.estimated_hours !== undefined
      ? Number(sequence.estimated_hours) || null
      : null,
    sequenceUpdatedBy: sequence ? sequence.updated_by || '' : '',
    sequenceUpdatedAt: sequence ? sequence.updated_at || '' : '',
    orderNumber: order.orderNumber,
    customer: order.customer,
    sku: order.sku,
    productionOrder: order.productionOrder,
    productLine: order.productLine,
    equipment: order.equipment,
    capacityTr: order.capacityTr,
    quantity: order.quantity,
    status: order.status,
    entryDate: order.entryDate,
    originalDeliveryDate: order.originalDeliveryDate,
    productionDeliveryDate: order.productionDeliveryDate,
    daysLate: order.daysLate,
    priorityDate,
    pcpPendingCount: order.pcpPendingCount,
    pcpPendingSummary: order.pcpPendingSummary || '',
    notes: order.notes || ''
  };
}

function compareSequencingDisplay(a, b) {
  const sequenceA = Number(a.sequenceNumber) || 0;
  const sequenceB = Number(b.sequenceNumber) || 0;
  if (sequenceA && sequenceB && sequenceA !== sequenceB) return sequenceA - sequenceB;
  if (sequenceA && !sequenceB) return -1;
  if (!sequenceA && sequenceB) return 1;
  return compareSequencingPriority(a, b);
}

function compareSequencingPriority(a, b) {
  return (Number(b.pcpPendingCount) || 0) - (Number(a.pcpPendingCount) || 0)
    || compareDateText(a.priorityDate, b.priorityDate)
    || (Number(b.daysLate) || 0) - (Number(a.daysLate) || 0)
    || compareDateText(a.entryDate, b.entryDate)
    || compareText(a.orderNumber, b.orderNumber);
}

function compareDateText(a, b) {
  const dateA = /^\d{4}-\d{2}-\d{2}$/.test(String(a || '')) ? String(a) : '9999-12-31';
  const dateB = /^\d{4}-\d{2}-\d{2}$/.test(String(b || '')) ? String(b) : '9999-12-31';
  return dateA.localeCompare(dateB);
}

function compareText(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

function normalizeStageKey(value) {
  const key = String(value || '').trim();
  return ORDER_STAGE_KEYS.includes(key) ? key : '';
}

function sanitizeUserInput(input) {
  const role = normalizeRole(input.role);
  const defaults = roleDefaults(role);
  const canEditOrders = Boolean(input.canEditOrders) || defaults.canEditOrders;
  const visibleTabs = role === 'admin'
    ? TAB_KEYS
    : normalizeTabList(input.visibleTabs, defaults.visibleTabs).filter((tab) => tab !== 'admin');
  const editableTabs = role === 'admin'
    ? TAB_KEYS
    : normalizeTabList(input.editableTabs, defaults.editableTabs).filter((tab) => visibleTabs.includes(tab));

  return {
    username: String(input.username || '').trim().toLowerCase(),
    name: String(input.name || '').trim(),
    role,
    canEditOrders: role === 'admin' || canEditOrders || permissionListAllowsTab(editableTabs, 'orders'),
    visibleTabs,
    editableTabs
  };
}

function permissionListAllowsTab(permissions, tab) {
  return Array.isArray(permissions) && permissions.some((permission) => permissionAccessTab(permission) === tab);
}

function permissionAccessTab(permission) {
  const value = String(permission || '').trim();
  if (TAB_KEYS.includes(value)) return value;
  if (!value.startsWith('screen:')) return '';
  return SCREEN_ACCESS_TABS[value.slice(7)] || '';
}

function normalizeRole(role) {
  const value = String(role || 'user').trim();
  return ROLE_VALUES.includes(value) ? value : 'user';
}

function roleDefaults(role) {
  return ROLE_DEFAULTS[normalizeRole(role)] || ROLE_DEFAULTS.user;
}

function sanitizeItemType(value) {
  return value === 'purchased' ? 'purchased' : 'production';
}

function sanitizeOrderInput(input) {
  const itemType = sanitizeItemType(input.itemType);
  return {
    orderNumber: String(input.orderNumber || '').trim(),
    commercialResponsible: String(input.commercialResponsible || '').trim(),
    customer: String(input.customer || '').trim(),
    sku: String(input.sku || '').trim().toUpperCase(),
    productionOrder: String(input.productionOrder || '').trim().toUpperCase(),
    itemType,
    purchaseOrderNumber: itemType === 'purchased' ? String(input.purchaseOrderNumber || '').trim().toUpperCase() : '',
    capacityTr: optionalNumber(input.capacityTr),
    productLine: String(input.productLine || '').trim(),
    equipment: String(input.equipment || '').trim(),
    voltage: String(input.voltage || '').trim(),
    quantity: optionalInteger(input.quantity),
    leadTime: calculateLeadTimeDisplay(String(input.entryDate || '').trim(), String(input.originalDeliveryDate || '').trim()),
    entryDate: String(input.entryDate || '').trim(),
    originalDeliveryDate: String(input.originalDeliveryDate || '').trim(),
    productionDeliveryDate: String(input.productionDeliveryDate || '').trim(),
    finalizationDate: String(input.finalizationDate || '').trim(),
    notes: String(input.notes || '').trim(),
    status: String(input.status || '').trim()
  };
}

function validateOrder(input, statusValues = STATUS_VALUES, customerValues = []) {
  const order = sanitizeOrderInput(input || {});
  const errors = [];

  if (!order.orderNumber) errors.push('Informe o número do pedido de venda.');
  if (!order.customer) errors.push('Informe o cliente.');
  if (!order.sku) errors.push('Informe o SKU.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(order.entryDate)) errors.push('Informe uma data de entrada válida.');
  if (order.originalDeliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(order.originalDeliveryDate)) errors.push('Informe uma data de entrega original válida.');
  if (order.productionDeliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(order.productionDeliveryDate)) errors.push('Informe uma data de entrega de produção válida.');
  if (order.finalizationDate && !/^\d{4}-\d{2}-\d{2}$/.test(order.finalizationDate)) errors.push('Informe uma data de finalização válida.');
  if (order.capacityTr !== null && order.capacityTr < 0) errors.push('Informe uma capacidade válida.');
  if (order.quantity !== null && order.quantity < 0) errors.push('Informe uma quantidade válida.');
  if (!statusValues.includes(order.status)) errors.push('Informe um status válido.');
  if (customerValues.length && order.customer && !customerValues.includes(order.customer)) errors.push('Informe um cliente cadastrado.');

  return { order, errors };
}

function qualityAlertSelectSql(includePhotos = true) {
  const wrongPhotoData = includePhotos ? 'wrong_photo_data_url' : "'' AS wrong_photo_data_url";
  const rightPhotoData = includePhotos ? 'right_photo_data_url' : "'' AS right_photo_data_url";
  return `
        SELECT id, order_id, order_number, customer, product_line, sku, capacity_tr, quantity,
          wrong_photo_name, wrong_photo_mime_type, ${wrongPhotoData},
          CASE WHEN trim(COALESCE(wrong_photo_data_url, '')) <> '' THEN 1 ELSE 0 END AS has_wrong_photo,
          wrong_description,
          right_photo_name, right_photo_mime_type, ${rightPhotoData},
          CASE WHEN trim(COALESCE(right_photo_data_url, '')) <> '' THEN 1 ELSE 0 END AS has_right_photo,
          right_description, status, resolved_at, resolved_by, created_by, created_at, updated_at
      `;
}

function orderSelectSql() {
  return `
        SELECT id, order_number, commercial_responsible, customer, sku, production_order,
          item_type, purchase_order_number, capacity_tr, product_line, equipment, voltage, quantity, lead_time, entry_date,
          original_delivery_date, production_delivery_date, finalization_date, notes, status,
          billing_stage, billing_released_at, billing_released_by, invoiced_at, invoiced_by,
          loaded_at, loaded_by, invoice_number, carrier_name, carrier_cnpj, freight_address,
          billing_customer_name, billing_customer_cnpj, invoice_document_name, invoice_document_mime_type,
          CASE WHEN trim(COALESCE(invoice_document_data_url, '')) <> '' THEN 1 ELSE 0 END AS has_invoice_document,
          machine_height, machine_width, machine_length, machine_weight,
          machine_gross_weight, machine_volume, stage_lm, stage_serpentina, stage_mechanical_project, stage_electrical_project,
          created_at, updated_at,
          (SELECT COUNT(*) FROM sales_order_photos WHERE sales_order_photos.order_id = sales_orders.id) AS photo_count,
          (SELECT COUNT(*) FROM pcp_pending_issues WHERE pcp_pending_issues.order_id = sales_orders.id AND pcp_pending_issues.issue_status = 'open') AS pcp_pending_count,
          (
            SELECT GROUP_CONCAT(
              pcp_pending_issues.component_code || ' - ' ||
              CASE pcp_pending_issues.reason
                WHEN 'purchase' THEN 'Compras'
                WHEN 'engineering' THEN 'Engenharia'
                WHEN 'rework' THEN 'Retrabalho'
                WHEN 'damaged' THEN 'Retrabalho'
                WHEN 'missing_structure' THEN 'Engenharia'
                ELSE pcp_pending_issues.reason
              END ||
              CASE
                WHEN trim(COALESCE(pcp_pending_issues.motive, '')) <> ''
                THEN ' | Motivo: ' || pcp_pending_issues.motive
                ELSE ''
              END ||
              CASE
                WHEN trim(COALESCE(pcp_pending_issues.purchase_order_number, '')) <> ''
                THEN ' | PC: ' || pcp_pending_issues.purchase_order_number
                ELSE ''
              END ||
              CASE
                WHEN trim(COALESCE(pcp_pending_issues.expected_resolution_date, '')) <> ''
                THEN ' | Prev.: ' || pcp_pending_issues.expected_resolution_date
                ELSE ''
              END ||
              CASE
                WHEN trim(COALESCE(pcp_pending_issues.notes, '')) <> ''
                THEN ' | Obs.: ' || replace(replace(pcp_pending_issues.notes, char(13), ' '), char(10), ' ')
                ELSE ''
              END,
              char(10)
            )
            FROM pcp_pending_issues
            WHERE pcp_pending_issues.order_id = sales_orders.id
              AND pcp_pending_issues.issue_status = 'open'
          ) AS pcp_pending_summary`;
}

function thirdPartyPartSelectSql() {
  return `
        SELECT id, romaneio_number, supplier_name, supplier_cnpj, part_code, part_description,
          quantity, unit, process_description, issue_date, expected_return_date, return_date,
          sales_order_id, sales_order_reference, purchase_order_number, notes, status, billing_stage, billing_released_at, billing_released_by,
          invoiced_at, invoiced_by, loaded_at, loaded_by, invoice_number, carrier_name, carrier_cnpj,
          freight_address, billing_customer_name, billing_customer_cnpj, invoice_document_name,
          invoice_document_mime_type,
          CASE WHEN trim(COALESCE(invoice_document_data_url, '')) <> '' THEN 1 ELSE 0 END AS has_invoice_document,
          machine_height, machine_width, machine_length, machine_weight, machine_gross_weight, machine_volume,
          created_by, created_at, updated_at,
          (SELECT order_number FROM sales_orders WHERE sales_orders.id = third_party_parts.sales_order_id) AS linked_order_number,
          (SELECT customer FROM sales_orders WHERE sales_orders.id = third_party_parts.sales_order_id) AS linked_order_customer,
          (SELECT sku FROM sales_orders WHERE sales_orders.id = third_party_parts.sales_order_id) AS linked_order_sku`;
}

function pcpPendingIssueSelectSql() {
  return `
        SELECT pcp_pending_issues.id, pcp_pending_issues.order_id,
          sales_orders.order_number, sales_orders.customer, sales_orders.sku,
          sales_orders.production_order, sales_orders.status AS order_status,
          pcp_pending_issues.component_code, pcp_pending_issues.reason,
          pcp_pending_issues.motive, pcp_pending_issues.purchase_order_number,
          pcp_pending_issues.notes, pcp_pending_issues.expected_resolution_date,
          pcp_pending_issues.issue_status,
          pcp_pending_issues.created_by, pcp_pending_issues.resolved_by,
          pcp_pending_issues.resolved_at, pcp_pending_issues.created_at,
          pcp_pending_issues.updated_at`;
}

function orderScopeClause(scope) {
  const cleanScope = String(scope || '').trim();

  if (cleanScope === 'active') {
    return "(lower(status) NOT LIKE '%cancel%' AND lower(status) NOT LIKE '%conclu%' AND billing_stage <> 'loaded')";
  }

  if (cleanScope === 'production') {
    return "status IN (SELECT name FROM order_statuses WHERE category = 'production')";
  }

  if (cleanScope === 'cancelled') {
    return "lower(status) LIKE '%cancel%'";
  }

  if (cleanScope === 'completed') {
    return "(lower(status) LIKE '%conclu%' OR billing_stage = 'loaded')";
  }

  return '';
}

function isActiveOrderForLink(order) {
  if (!order) return false;
  const status = normalizeText(order.status || '');
  return !status.includes('cancel')
    && !status.includes('conclu')
    && String(order.billingStage || '') !== 'loaded';
}

function appendDueWithinClause(filters, clauses, params) {
  const days = parseDueWithinDays(filters.dueWithinDays);
  if (days === null) {
    return;
  }

  clauses.push(`
    original_delivery_date GLOB '????-??-??'
    AND original_delivery_date >= date('now', 'localtime')
    AND original_delivery_date <= date('now', 'localtime', ?)
  `);
  params.push(`+${days} days`);
}

function parseDueWithinDays(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.min(Math.max(parsed, 0), 3650);
}

function orderSortSql(sort, direction) {
  const dir = String(direction || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const sortMap = {
    orderNumber: 'order_number',
    commercialResponsible: 'commercial_responsible',
    customer: 'customer',
    sku: 'sku',
    productionOrder: 'production_order',
    itemType: 'item_type',
    purchaseOrderNumber: 'purchase_order_number',
    capacityTr: 'COALESCE(capacity_tr, 0)',
    productLine: 'product_line',
    equipment: 'equipment',
    voltage: 'voltage',
    quantity: 'COALESCE(quantity, 0)',
    leadTime: "CASE WHEN entry_date GLOB '????-??-??' AND original_delivery_date GLOB '????-??-??' AND original_delivery_date >= entry_date THEN CAST(julianday(original_delivery_date) - julianday(entry_date) AS INTEGER) ELSE NULL END",
    entryDate: 'entry_date',
    originalDeliveryDate: 'original_delivery_date',
    productionDeliveryDate: 'production_delivery_date',
    daysLate: "CASE WHEN original_delivery_date GLOB '????-??-??' AND finalization_date GLOB '????-??-??' THEN CASE WHEN finalization_date > original_delivery_date THEN CAST(julianday(finalization_date) - julianday(original_delivery_date) AS INTEGER) ELSE 0 END WHEN original_delivery_date GLOB '????-??-??' AND date('now', 'localtime') > original_delivery_date THEN CAST(julianday(date('now', 'localtime')) - julianday(original_delivery_date) AS INTEGER) WHEN original_delivery_date GLOB '????-??-??' THEN 0 ELSE NULL END",
    finalizationDate: 'finalization_date',
    status: 'status',
    updatedAt: 'updated_at'
  };
  const expression = sortMap[String(sort || '').trim()] || 'entry_date';
  return `${expression} ${dir}`;
}

function appendActivitySearchClause(search, clauses, params) {
  const text = String(search || '').trim().toLowerCase();
  if (!text) return;

  const value = `%${text}%`;
  clauses.push(`(
    lower(COALESCE(actor, '')) LIKE ?
    OR lower(COALESCE(action, '')) LIKE ?
    OR lower(COALESCE(entity_type, '')) LIKE ?
    OR lower(COALESCE(entity_label, '')) LIKE ?
    OR lower(COALESCE(details, '')) LIKE ?
    OR lower(COALESCE(created_at, '')) LIKE ?
  )`);
  params.push(value, value, value, value, value, value);
}

function appendActivityDateClause(filters, clauses, params) {
  if (isValidDateText(filters.dateFrom)) {
    clauses.push('created_at >= ?');
    params.push(`${filters.dateFrom}T00:00:00.000Z`);
  }

  if (isValidDateText(filters.dateTo)) {
    clauses.push('created_at <= ?');
    params.push(`${filters.dateTo}T23:59:59.999Z`);
  }
}

function appendActivityActionGroupClause(actionGroup, clauses) {
  const expression = activityActionGroupSql(actionGroup);
  if (expression) {
    clauses.push(expression);
  }
}

function appendActivityColumnFilterClauses(filters, clauses, params) {
  const cleanFilters = filters && typeof filters === 'object' && !Array.isArray(filters) ? filters : {};
  for (const [key, rawValue] of Object.entries(cleanFilters)) {
    const column = activityColumnSql(key);
    const value = String(rawValue || '').trim().toLowerCase();
    if (!column || !value) continue;
    clauses.push(`lower(COALESCE(${column}, '')) LIKE ?`);
    params.push(`%${value}%`);
  }
}

function activityColumnSql(key) {
  const columns = {
    createdAt: 'created_at',
    actor: 'actor',
    action: 'action',
    entityType: 'entity_type',
    entityLabel: 'entity_label',
    details: 'details'
  };
  return columns[String(key || '').trim()] || '';
}

function activitySortSql(sort, direction) {
  const dir = String(direction || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const expression = activityColumnSql(sort) || 'created_at';
  const secondarySort = expression === 'created_at' ? '' : ', created_at DESC';
  return `${expression} ${dir}${secondarySort}`;
}

function activityActionGroupSql(actionGroup) {
  const group = String(actionGroup || '').trim();
  if (!group) return '';

  const action = "lower(COALESCE(action, ''))";
  const danger = `(${action} LIKE '%exclu%' OR ${action} LIKE '%restaur%')`;
  const system = `(${action} LIKE '%backup%' OR ${action} LIKE '%login%' OR ${action} LIKE '%logout%')`;
  const flow = `(${action} LIKE '%status%' OR ${action} LIKE '%fatur%')`;
  const success = `(${action} LIKE '%criad%' OR ${action} LIKE '%cadastr%' OR ${action} LIKE '%novo%')`;

  if (group === 'danger') return danger;
  if (group === 'system') return system;
  if (group === 'flow') return flow;
  if (group === 'success') return success;
  if (group === 'default') return `NOT (${danger} OR ${system} OR ${flow} OR ${success})`;
  return '';
}

function sanitizeStatusCategory(value) {
  return value === 'production' ? 'production' : 'auxiliary';
}

function sanitizeStatusFlowType(value) {
  return value === 'deviation' ? 'deviation' : 'normal';
}

function sanitizeStatusSortOrder(value, fallback) {
  const number = optionalInteger(value);
  if (number === null) {
    return optionalInteger(fallback) ?? 0;
  }

  return Math.max(0, number);
}

function statusCategoryForName(name) {
  return normalizeText(name).includes('produc') ? 'production' : 'auxiliary';
}

function sanitizePhotoInput(input) {
  const fileName = String(input.fileName || 'documento-pedido').trim().slice(0, 180);
  const mimeType = String(input.mimeType || '').trim().toLowerCase();
  const dataUrl = String(input.dataUrl || '').trim();
  const allowedMimeTypes = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]);

  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error('Formato de documento nao permitido.');
  }

  if (!dataUrl.startsWith(`data:${mimeType};base64,`)) {
    throw new Error('Arquivo de documento invalido.');
  }

  if (dataUrl.length > 12 * 1024 * 1024) {
    throw new Error('Cada documento deve ter ate 8 MB.');
  }

  return {
    fileName,
    mimeType,
    dataUrl
  };
}

function sanitizeQualityAlertInput(input) {
  const alert = {
    orderId: String(input.orderId || '').trim().slice(0, 80),
    orderNumber: String(input.orderNumber || '').trim().slice(0, 80),
    customer: String(input.customer || '').trim().slice(0, 180),
    productLine: String(input.productLine || '').trim().slice(0, 180),
    sku: String(input.sku || '').trim().toUpperCase().slice(0, 120),
    capacityTr: optionalDimension(input.capacityTr),
    quantity: optionalDimension(input.quantity),
    wrongPhoto: sanitizeQualityAlertPhoto(input.wrongPhoto || {}),
    wrongDescription: String(input.wrongDescription || '').trim().slice(0, 1200),
    rightPhoto: sanitizeQualityAlertPhoto(input.rightPhoto || {}),
    rightDescription: String(input.rightDescription || '').trim().slice(0, 1200)
  };

  if (!alert.orderId && !alert.orderNumber) {
    throw new Error('Informe o pedido de venda que gerou o alerta.');
  }

  if (!alert.wrongDescription) {
    throw new Error('Informe a descricao do jeito errado.');
  }

  if (!alert.rightDescription) {
    throw new Error('Informe a descricao do jeito certo.');
  }

  return alert;
}

function hydrateQualityAlertFromOrder(alert, order) {
  const hydrated = {
    ...alert,
    orderId: alert.orderId || order?.id || '',
    orderNumber: alert.orderNumber || order?.orderNumber || '',
    customer: alert.customer || order?.customer || '',
    productLine: alert.productLine || order?.productLine || '',
    sku: alert.sku || order?.sku || '',
    capacityTr: alert.capacityTr ?? order?.capacityTr ?? null,
    quantity: alert.quantity ?? order?.quantity ?? null
  };

  if (!hydrated.sku && !hydrated.customer && (!hydrated.productLine || hydrated.capacityTr === null)) {
    throw new Error('Informe SKU, cliente ou linha de produto com capacidade para o alerta.');
  }

  return hydrated;
}

function sanitizeQualityAlertPhoto(input = {}) {
  const fileName = String(input.fileName || '').trim().slice(0, 180);
  const mimeType = String(input.mimeType || '').trim().toLowerCase();
  const dataUrl = String(input.dataUrl || '').trim();

  if (!fileName && !mimeType && !dataUrl) {
    return { fileName: '', mimeType: '', dataUrl: '' };
  }

  const allowedMimeTypes = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
  if (!fileName || !mimeType || !dataUrl) {
    throw new Error('Foto do alerta de qualidade invalida.');
  }

  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error('Use apenas imagens nos alertas de qualidade.');
  }

  if (!dataUrl.startsWith(`data:${mimeType};base64,`)) {
    throw new Error('Arquivo de imagem do alerta invalido.');
  }

  if (dataUrl.length > 8 * 1024 * 1024) {
    throw new Error('Cada foto do alerta deve ter ate 5 MB.');
  }

  return { fileName, mimeType, dataUrl };
}

function sanitizeThirdPartyPartInput(input) {
  const issueDate = String(input.issueDate || '').trim() || new Date().toISOString().slice(0, 10);
  const expectedReturnDate = String(input.expectedReturnDate || '').trim();
  const item = {
    romaneioNumber: String(input.romaneioNumber || '').trim().slice(0, 80),
    supplierName: String(input.supplierName || '').trim().slice(0, 180),
    supplierCnpj: String(input.supplierCnpj || '').trim().slice(0, 32),
    partCode: String(input.partCode || '').trim().slice(0, 120),
    partDescription: String(input.partDescription || '').trim().slice(0, 240),
    quantity: optionalDimension(input.quantity),
    unit: String(input.unit || 'UN').trim().slice(0, 24) || 'UN',
    processDescription: String(input.processDescription || '').trim().slice(0, 280),
    issueDate,
    expectedReturnDate,
    salesOrderId: String(input.salesOrderId || '').trim().slice(0, 80),
    salesOrderReference: String(input.salesOrderReference || '').trim().slice(0, 120),
    notes: String(input.notes || '').trim().slice(0, 1000)
  };

  const errors = [];
  if (!item.supplierName) errors.push('Informe o terceiro/fornecedor.');
  if (!item.partCode) errors.push('Informe o codigo da peca.');
  if (!item.partDescription) errors.push('Informe a descricao da peca.');
  if (item.quantity === null || item.quantity <= 0) errors.push('Informe a quantidade.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.issueDate)) errors.push('Informe uma data de emissao valida.');
  if (item.expectedReturnDate && !/^\d{4}-\d{2}-\d{2}$/.test(item.expectedReturnDate)) {
    errors.push('Informe uma data prevista de retorno valida.');
  }

  if (errors.length) {
    throw new Error(errors.join(' '));
  }

  return item;
}

function sanitizeBillingDimensions(input) {
  return {
    machineHeight: optionalDimension(input.machineHeight),
    machineWidth: optionalDimension(input.machineWidth),
    machineLength: optionalDimension(input.machineLength),
    machineWeight: optionalDimension(input.machineWeight),
    machineGrossWeight: optionalDimension(input.machineGrossWeight),
    machineVolume: optionalDimension(input.machineVolume)
  };
}

function sanitizeBillingInfo(input, existing = {}) {
  const customerFallback = existing.billingCustomerName || existing.customer || '';
  const invoiceDocument = sanitizeInvoiceDocumentInput(input.invoiceDocument || input, {
    fileName: input.invoiceDocumentName || existing.invoiceDocumentName,
    mimeType: input.invoiceDocumentMimeType || existing.invoiceDocumentMimeType,
    dataUrl: input.invoiceDocumentDataUrl || existing.invoiceDocumentDataUrl
  });
  return {
    invoiceNumber: billingText(input.invoiceNumber, 80),
    carrierName: billingText(input.carrierName, 180),
    carrierCnpj: billingText(input.carrierCnpj, 32),
    freightAddress: billingText(input.freightAddress, 280),
    billingCustomerName: billingText(input.billingCustomerName || customerFallback, 180),
    billingCustomerCnpj: billingText(input.billingCustomerCnpj, 32),
    invoiceDocumentName: invoiceDocument.fileName,
    invoiceDocumentMimeType: invoiceDocument.mimeType,
    invoiceDocumentDataUrl: invoiceDocument.dataUrl
  };
}

function billingText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function sanitizeInvoiceDocumentInput(input = {}, existing = {}) {
  const fileName = String(input.fileName || existing.fileName || '').trim().slice(0, 180);
  const mimeType = String(input.mimeType || existing.mimeType || '').trim().toLowerCase();
  const dataUrl = String(input.dataUrl || existing.dataUrl || '').trim();

  if (!fileName && !mimeType && !dataUrl) {
    return { fileName: '', mimeType: '', dataUrl: '' };
  }

  const allowedMimeTypes = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf',
    'application/xml',
    'text/xml',
    'text/plain',
    'application/octet-stream'
  ]);

  if (!fileName || !mimeType || !dataUrl) {
    throw new Error('Documento da nota fiscal invalido.');
  }

  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error('Formato da nota fiscal nao permitido.');
  }

  if (!dataUrl.startsWith(`data:${mimeType};base64,`)) {
    throw new Error('Arquivo da nota fiscal invalido.');
  }

  if (dataUrl.length > 12 * 1024 * 1024) {
    throw new Error('A nota fiscal deve ter ate 8 MB.');
  }

  return { fileName, mimeType, dataUrl };
}

function sanitizeOrderStages(input) {
  const source = input && typeof input === 'object' && input.stages && typeof input.stages === 'object'
    ? input.stages
    : input || {};

  return {
    lm: booleanValue(source.lm),
    serpentina: booleanValue(source.serpentina),
    mechanicalProject: booleanValue(source.mechanicalProject),
    electricalProject: booleanValue(source.electricalProject)
  };
}

function booleanValue(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const normalized = String(value || '').trim().toLowerCase();
  return ['1', 'true', 'sim', 'yes', 'on'].includes(normalized);
}

function sanitizePcpPendingIssueInput(input) {
  const orderId = String(input.orderId || '').trim();
  const componentCode = String(input.componentCode || '').trim().toUpperCase();
  const reason = sanitizePcpPendingReason(input.reason);
  const motive = String(input.motive || '').trim().slice(0, 180);
  const purchaseOrderNumber = String(input.purchaseOrderNumber || '').trim().toUpperCase().slice(0, 80);
  const expectedResolutionDate = String(input.expectedResolutionDate || '').trim();
  const notes = String(input.notes || '').trim();

  if (!orderId) {
    throw new Error('Selecione o pedido da pendencia.');
  }

  if (!componentCode) {
    throw new Error('Informe o codigo do componente pendente.');
  }

  if (!reason) {
    throw new Error('Informe o tipo da pendencia.');
  }

  if (!motive) {
    throw new Error('Informe o motivo da pendencia.');
  }

  if (expectedResolutionDate && !isValidDateText(expectedResolutionDate)) {
    throw new Error('Informe uma data prevista valida.');
  }

  return {
    orderId,
    componentCode,
    reason,
    motive,
    purchaseOrderNumber,
    expectedResolutionDate,
    notes
  };
}

function sanitizePcpPendingMotiveInput(input) {
  const reason = sanitizePcpPendingReason(input.reason);
  const name = String(input.name || '').trim().slice(0, 180);

  if (!reason) {
    throw new Error('Informe o tipo do motivo.');
  }

  if (!name) {
    throw new Error('Informe o nome do motivo.');
  }

  return { reason, name };
}

function sanitizePcpPendingReason(value) {
  const reason = normalizeText(value).trim();
  const aliases = {
    purchase: 'purchase',
    compras: 'purchase',
    compra: 'purchase',
    engineering: 'engineering',
    engenharia: 'engineering',
    missing_structure: 'engineering',
    rework: 'rework',
    retrabalho: 'rework',
    damaged: 'rework'
  };
  return aliases[reason] || '';
}

function sanitizePurchasePendingRows(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('Informe as linhas importadas de pedidos de compras pendentes.');
  }

  return rows
    .slice(0, 10000)
    .map((item) => {
      const row = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
      const output = {};
      Object.entries(row).forEach(([key, value]) => {
        const cleanKey = String(key || '').trim().slice(0, 140);
        if (!cleanKey || purchasePendingMetaKeys().has(cleanKey)) return;
        output[cleanKey] = String(value ?? '').trim().slice(0, 2000);
      });
      return output;
    })
    .filter((row) => Object.values(row).some((value) => String(value || '').trim()));
}

function purchasePendingMetaKeys() {
  return new Set([
    'id',
    'importBatchId',
    'sourceName',
    'rowIndex',
    'itemKey',
    'salesOrderId',
    'salesOrderNumber',
    'linkedSalesOrderNumber',
    'itemStatus',
    'itemStatusLabel',
    'isViewed',
    'viewedBy',
    'viewedAt',
    'resolutionNote',
    'resolvedBy',
    'resolvedAt',
    'importedBy',
    'importedAt',
    'createdAt',
    'updatedAt'
  ]);
}

function purchasePendingItemKey(row) {
  const cleanRow = row && typeof row === 'object' && !Array.isArray(row) ? row : {};
  const purchaseOrder = purchasePendingFieldValue(cleanRow, ['pedido de compra', 'pedido compra', 'purchase order', 'ordem compra', 'pc']);
  const item = purchasePendingFieldValue(cleanRow, ['item', 'linha', 'sequencia', 'seq']);
  const code = purchasePendingFieldValue(cleanRow, ['codigo', 'código', 'material', 'sku', 'produto', 'componente']);
  const supplier = purchasePendingFieldValue(cleanRow, ['fornecedor', 'supplier', 'cliente']);
  const description = purchasePendingFieldValue(cleanRow, ['descricao', 'descrição', 'description']);
  const internalObservation = purchasePendingFieldValue(cleanRow, ['observacao interna', 'observação interna', 'observacao do interna', 'observação do interna']);

  if (purchaseOrder && (item || code || description)) {
    return normalizePurchasePendingKeyParts(['po', purchaseOrder, item, code, description]);
  }

  if (code || description || supplier || internalObservation) {
    return normalizePurchasePendingKeyParts(['row', supplier, code, description, internalObservation]);
  }

  return normalizePurchasePendingKeyParts(
    Object.keys(cleanRow)
      .filter((key) => !purchasePendingMetaKeys().has(key))
      .sort((left, right) => normalizeText(left).localeCompare(normalizeText(right), 'pt-BR'))
      .flatMap((key) => [key, cleanRow[key]])
  );
}

function purchasePendingFieldValue(row, needles) {
  const entry = Object.entries(row).find(([key]) => (
    needles.some((needle) => normalizeText(key).includes(normalizeText(needle)))
  ));
  return entry ? String(entry[1] || '').trim() : '';
}

function normalizePurchasePendingKeyParts(parts) {
  return parts
    .map((part) => normalizeText(part).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('|');
}

function purchasePendingWasAutoResolved(row) {
  return row.item_status === 'resolved' && normalizeText(row.resolution_note || '').startsWith('baixa automatica');
}

function sanitizePurchasePendingResolutionNote(value) {
  const note = String(value || '').trim().slice(0, 1000);
  if (!note) {
    throw new Error('Informe a observacao/motivo da baixa.');
  }
  return note;
}

function sanitizeQualityRncState(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Dados de RNC invalidos.');
  }

  const rncs = Array.isArray(input.rncs) ? input.rncs : [];
  if (!rncs.length) {
    throw new Error('Informe pelo menos uma RNC.');
  }

  const activeId = String(input.activeId || rncs[0]?.id || '').trim();
  const safeState = {
    activeId,
    rncs,
    lastSaved: String(input.lastSaved || new Date().toISOString()).trim()
  };

  if (!safeState.activeId || !rncs.some((record) => String(record?.id || '') === safeState.activeId)) {
    safeState.activeId = String(rncs[0]?.id || '').trim();
  }

  return safeState;
}

function sanitizeAiKnowledgeSourceInput(input = {}) {
  const title = String(input.title || '').trim().slice(0, 160);
  const sourceType = sanitizeAiSourceType(input.sourceType || input.source_type);
  const scope = sanitizeAiContextScope(input.scope);
  const content = String(input.content || '').trim().slice(0, 20000);
  const tags = normalizeAiTags(input.tags);
  const status = sanitizeAiSourceStatus(input.status);

  if (!title) {
    throw new Error('Informe o titulo da base de conhecimento.');
  }

  if (!content) {
    throw new Error('Informe o conteudo da base de conhecimento.');
  }

  return { title, sourceType, scope, content, tags, status };
}

function sanitizeAiTrainingRunInput(input = {}) {
  const objective = String(input.objective || '').trim().slice(0, 240);
  const datasetScope = sanitizeAiContextScope(input.datasetScope || input.dataset_scope);
  const modelTarget = String(input.modelTarget || input.model_target || 'decision-support').trim().slice(0, 80) || 'decision-support';
  const status = sanitizeAiTrainingStatus(input.status);
  const notes = String(input.notes || '').trim().slice(0, 5000);
  const resultSummary = String(input.resultSummary || input.result_summary || '').trim().slice(0, 5000);

  if (!objective) {
    throw new Error('Informe o objetivo do treinamento.');
  }

  return { objective, datasetScope, modelTarget, status, notes, resultSummary };
}

function sanitizeAiAnalysisInput(input = {}) {
  const prompt = String(input.prompt || '').trim().slice(0, 4000);
  const contextScope = sanitizeAiContextScope(input.contextScope || input.context_scope);
  const mode = String(input.mode || 'rules-engine').trim().slice(0, 60) || 'rules-engine';
  const response = String(input.response || '').trim().slice(0, 30000);
  const confidenceNumber = Number(input.confidence);
  const confidence = Number.isFinite(confidenceNumber) ? Math.min(1, Math.max(0, confidenceNumber)) : null;

  if (!prompt) {
    throw new Error('Informe uma pergunta ou objetivo para a IA.');
  }

  return { prompt, contextScope, mode, response, confidence };
}

function sanitizeAiContextScope(value) {
  const scope = normalizeText(value || 'all');
  const aliases = {
    geral: 'all',
    todos: 'all',
    tudo: 'all',
    vendas: 'orders',
    pedidos: 'orders',
    pedido: 'orders',
    producao: 'production',
    produto: 'products',
    produtos: 'products',
    compras: 'pcp',
    pendencias: 'pcp',
    faturamento: 'billing',
    qualidade: 'quality',
    aps: 'aps',
    supply: 'supply',
    gestao: 'management'
  };
  const normalized = aliases[scope] || scope;
  const allowed = new Set(['all', 'orders', 'production', 'products', 'pcp', 'billing', 'quality', 'aps', 'supply', 'management']);
  return allowed.has(normalized) ? normalized : 'all';
}

function sanitizeAiSourceType(value) {
  const type = normalizeText(value || 'manual');
  const allowed = new Set(['manual', 'procedure', 'policy', 'dataset', 'decision', 'training-note']);
  return allowed.has(type) ? type : 'manual';
}

function sanitizeAiSourceStatus(value) {
  const status = normalizeText(value || 'active');
  return status === 'inactive' || status === 'archived' ? status : 'active';
}

function sanitizeAiTrainingStatus(value) {
  const status = normalizeText(value || 'planned');
  const allowed = new Set(['planned', 'running', 'validated', 'rejected', 'archived']);
  return allowed.has(status) ? status : 'planned';
}

function normalizeAiTags(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[;,]/);
  const seen = new Set();
  return raw
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((item) => item.slice(0, 40))
    .filter((item) => {
      const key = normalizeText(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12)
    .join('; ');
}

function pcpPendingReasonLabel(reason) {
  const labels = {
    purchase: 'Compras',
    engineering: 'Engenharia',
    rework: 'Retrabalho',
    damaged: 'Retrabalho',
    missing_structure: 'Engenharia'
  };
  return labels[reason] || reason || '';
}

function dimensionNotesText(order) {
  const dimensions = [
    ['Altura', order.machineHeight],
    ['Largura', order.machineWidth],
    ['Comprimento', order.machineLength],
    ['Peso liquido', order.machineWeight],
    ['Peso bruto', order.machineGrossWeight],
    ['Volume', order.machineVolume]
  ]
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${formatDimensionNoteValue(value)}`);

  return dimensions.length ? `[Dimensionais faturamento] ${dimensions.join('; ')}` : '';
}

function appendDimensionNotes(notes, dimensionsText) {
  const currentNotes = String(notes || '').trim();
  const text = String(dimensionsText || '').trim();
  if (!text || currentNotes.includes('[Dimensionais faturamento]')) {
    return currentNotes;
  }

  return currentNotes ? `${currentNotes}\n${text}` : text;
}

function formatDimensionNoteValue(value) {
  return String(value).replace('.', ',');
}

function optionalDimension(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const number = Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(number) || number < 0) {
    throw new Error('Informe dimensionais validos.');
  }

  return number;
}

function optionalSequenceHours(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const number = Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(number) || number < 0) {
    throw new Error('Informe tempos estimados validos.');
  }

  return Math.round(number * 100) / 100;
}

function optionalNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function optionalInteger(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

function calculateDaysLate(originalDeliveryDate, finalizationDate = '', status = '', billingStage = '') {
  if (!isValidDateText(originalDeliveryDate)) {
    return '';
  }

  const deliveryDate = parseDate(originalDeliveryDate);
  const endDate = isValidDateText(finalizationDate) ? parseDate(finalizationDate) : todayAtMidnight();

  if (!endDate || endDate <= deliveryDate) {
    return 0;
  }

  const diff = Math.floor((endDate - deliveryDate) / 86400000);

  return Math.max(0, diff);
}

function isCompletedOrderForDelay(status, billingStage = '') {
  return normalizeText(status).includes('conclu') || String(billingStage || '') === 'loaded';
}

function calculateLeadTimeDisplay(entryDate, originalDeliveryDate) {
  const days = diffDays(entryDate, originalDeliveryDate);
  return days === null ? '' : `${days} dias`;
}

function calculateLeadTimeDays(order) {
  const finalized = diffDays(order.entryDate, order.finalizationDate);
  if (finalized !== null) return finalized;

  const productionTarget = diffDays(order.entryDate, order.productionDeliveryDate);
  if (productionTarget !== null) return productionTarget;

  return parseLeadTimeDays(order.leadTime);
}

function calculateHistoricalLeadTimeDays(order) {
  const finalized = diffDays(order.entryDate, order.finalizationDate);
  if (finalized !== null) return finalized;

  return calculateLeadTimeDays(order);
}

function isDemandForecastOrder(order) {
  if (!order || order.itemType !== 'production') return false;
  const normalizedStatus = normalizeText(order.status);
  return !normalizedStatus.includes('cancel');
}

function isOpenDemandOrder(order) {
  if (!isDemandForecastOrder(order)) return false;
  if (isValidDateText(order.finalizationDate)) return false;
  if (order.billingStage === 'loaded') return false;

  const normalizedStatus = normalizeText(order.status);
  return !normalizedStatus.includes('conclu')
    && !normalizedStatus.includes('fatur')
    && !normalizedStatus.includes('carreg');
}

function productDemandGroupKey(order) {
  return `${normalizeText(cleanProductLine(order.productLine))}|${capacityLabel(order.capacityTr)}`;
}

function cleanProductLine(value) {
  return String(value || '').trim() || 'Sem linha de produto';
}

function normalizedCapacityNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}

function capacityLabel(value) {
  const number = normalizedCapacityNumber(value);
  if (number === null) return 'Sem capacidade';
  return String(number).replace('.', ',');
}

function positiveQuantity(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function forecastDemand(monthlyDemand) {
  const series = monthlySeries(monthlyDemand).slice(-12);
  const values = series.map((item) => item.value);
  const base = weightedMovingAverage(values);
  const trend = recentLinearTrend(values);
  const referenceMonth = currentMonthKey();
  const nextMonthForecast = Math.round(Math.max(0, base + trend) * 10) / 10;
  const months = [];

  for (let index = 1; index <= 3; index += 1) {
    months.push({
      month: addMonthsToKey(referenceMonth, index),
      forecast: nextMonthForecast
    });
  }

  return {
    averageMonthlyDemand: average(values) || 0,
    nextMonth: nextMonthForecast,
    next3Months: Math.round((nextMonthForecast * 3) * 10) / 10,
    months,
    confidence: forecastConfidence(values)
  };
}

function monthlySeries(monthlyDemand) {
  const keys = Array.from(monthlyDemand.keys()).sort();
  if (!keys.length) return [];

  const series = [];
  let current = keys[0];
  const end = currentMonthKey();
  if (current > end) {
    current = end;
  }

  while (current <= end) {
    series.push({ month: current, value: monthlyDemand.get(current) || 0 });
    current = addMonthsToKey(current, 1);
  }

  return series;
}

function weightedMovingAverage(values) {
  if (!values.length) return 0;
  const recent = values.slice(-3);
  const weights = recent.length === 1 ? [1] : recent.length === 2 ? [0.4, 0.6] : [0.2, 0.3, 0.5];
  return recent.reduce((total, value, index) => total + (value * weights[index]), 0);
}

function recentLinearTrend(values) {
  const recent = values.slice(-6);
  if (recent.length < 3) return 0;

  const xMean = (recent.length - 1) / 2;
  const yMean = recent.reduce((total, value) => total + value, 0) / recent.length;
  let numerator = 0;
  let denominator = 0;

  recent.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
  });

  if (!denominator) return 0;
  return numerator / denominator;
}

function forecastConfidence(values) {
  if (values.length >= 12 && coefficientOfVariation(values) <= 0.9) return 'Alta';
  if (values.length >= 6) return 'Media';
  if (values.length >= 3) return 'Baixa';
  return 'Pouco historico';
}

function coefficientOfVariation(values) {
  const mean = average(values) || 0;
  if (!mean) return Number.POSITIVE_INFINITY;
  const variance = values.reduce((total, value) => total + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function summarizeOpenOrderDelayRisk(openOrders, averageLeadTime) {
  const summary = {
    openOrders: openOrders.length,
    openMachines: openOrders.reduce((total, order) => total + positiveQuantity(order.quantity), 0),
    predictedLateOrders: 0,
    maxPredictedDelayDays: 0,
    label: openOrders.length ? 'Sem lead time historico' : 'Sem pedidos abertos'
  };

  if (!openOrders.length || averageLeadTime === null || averageLeadTime === undefined) {
    return summary;
  }

  for (const order of openOrders) {
    if (!isValidDateText(order.entryDate) || !isValidDateText(order.originalDeliveryDate)) continue;
    const predictedFinish = addDays(parseDate(order.entryDate), Math.ceil(Number(averageLeadTime)));
    const originalDelivery = parseDate(order.originalDeliveryDate);
    const delayDays = Math.floor((predictedFinish - originalDelivery) / 86400000);
    if (delayDays > 0) {
      summary.predictedLateOrders += 1;
      summary.maxPredictedDelayDays = Math.max(summary.maxPredictedDelayDays, delayDays);
    }
  }

  if (summary.predictedLateOrders > 0) {
    summary.label = summary.predictedLateOrders === summary.openOrders ? 'Alto risco' : 'Risco parcial';
  } else {
    summary.label = 'Dentro do prazo previsto';
  }

  return summary;
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function addMonthsToKey(monthKey, offset) {
  const [year, month] = String(monthKey || currentMonthKey()).split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function addDays(date, days) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

function calculateIntervals(dateTexts) {
  const dates = dateTexts
    .filter(isValidDateText)
    .sort((a, b) => a.localeCompare(b));
  const intervals = [];

  for (let index = 1; index < dates.length; index += 1) {
    const diff = diffDays(dates[index - 1], dates[index]);
    if (diff !== null) intervals.push(diff);
  }

  return intervals;
}

function average(values) {
  if (!values.length) return null;
  const result = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.round(result * 10) / 10;
}

function parseLeadTimeDays(value) {
  const match = String(value || '').replace(',', '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function diffDays(startValue, endValue) {
  if (!isValidDateText(startValue) || !isValidDateText(endValue)) return null;
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  const diff = Math.floor((end - start) / 86400000);
  return diff >= 0 ? diff : null;
}

function isValidDateText(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function isValidMonthText(value) {
  return /^\d{4}-\d{2}$/.test(String(value || ''));
}

function normalizeTabList(value, fallback = []) {
  let raw = value;
  if (typeof value === 'string') {
    try {
      raw = JSON.parse(value);
    } catch (error) {
      raw = [];
    }
  }

  const allowed = new Set([...TAB_KEYS, ...SCREEN_PERMISSION_KEYS]);
  const seen = new Set();
  const source = Array.isArray(raw) && raw.length ? raw : fallback;
  return source
    .map((tab) => String(tab || '').trim())
    .filter((tab) => {
      if (!allowed.has(tab) || seen.has(tab)) return false;
      seen.add(tab);
      return true;
    });
}

function sanitizeDashboardGoals(input) {
  let source = input;
  if (typeof input === 'string') {
    try {
      source = JSON.parse(input);
    } catch (error) {
      source = {};
    }
  }

  const raw = source && typeof source === 'object' ? source : {};
  const keys = [
    'soldMonth',
    'finishedMonth',
    'leadTimeMonth',
    'averageSoldYear',
    'deliveryPunctuality',
    'averageProducedYear'
  ];
  const goals = {};

  for (const key of keys) {
    const value = optionalNumber(raw[key]);
    goals[key] = value === null || value < 0 ? '' : value;
  }

  return goals;
}

function sanitizeApsConfig(input, statuses = []) {
  let source = input;
  if (typeof input === 'string') {
    try {
      source = JSON.parse(input);
    } catch (error) {
      source = {};
    }
  }

  const raw = source && typeof source === 'object' ? source : {};
  const defaults = cloneApsDefaults();
  const settings = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};

  const config = {
    settings: {
      workdayStart: sanitizeTimeText(settings.workdayStart, defaults.settings.workdayStart),
      dailyHours: sanitizePositiveNumber(settings.dailyHours, defaults.settings.dailyHours, 1, 24),
      lunchStart: sanitizeTimeText(settings.lunchStart, defaults.settings.lunchStart),
      lunchMinutes: sanitizePositiveNumber(settings.lunchMinutes, defaults.settings.lunchMinutes, 0, 240),
      priorityRule: ['EDD', 'MANUAL'].includes(String(settings.priorityRule || '').toUpperCase())
        ? String(settings.priorityRule || '').toUpperCase()
        : defaults.settings.priorityRule,
      calendarDays: sanitizeApsCalendarDays(settings.calendarDays, defaults.settings),
      timeLearningEnabled: settings.timeLearningEnabled === false ? false : true
    },
    operators: sanitizeApsOperators(raw.operators, defaults.operators),
    workCenters: sanitizeApsWorkCenters(raw.workCenters, defaults.workCenters),
    operations: sanitizeApsOperations(raw.operations, defaults.operations),
    timeRecords: sanitizeApsTimeRecords(raw.timeRecords, defaults.timeRecords)
  };

  config.operations = apsOperationsFromStatuses(statuses, config.operations);
  normalizeApsTimeRecordLinks(config);
  normalizeApsOperatorLinks(config);
  return config;
}

function cloneApsDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_APS_CONFIG));
}

function sanitizeApsOperators(value, fallback) {
  const rows = Array.isArray(value) ? value : [];
  const clean = rows
    .map((row) => {
      const item = row && typeof row === 'object' ? row : {};
      const code = sanitizeCode(item.code);
      if (!code) return null;
      return {
        code,
        name: sanitizePlainText(item.name, code),
        shift: sanitizePlainText(item.shift, '1 turno'),
        journeyHours: sanitizePositiveNumber(item.journeyHours, 8, 1, 24),
        efficiency: sanitizePositiveNumber(item.efficiency, 1, 0.1, 3),
        skill: sanitizePlainText(item.skill, ''),
        enabledOperations: sanitizeStringList(item.enabledOperations),
        enabledCenters: sanitizeStringList(item.enabledCenters).map((center) => center.toUpperCase()),
        hourlyCost: sanitizePositiveNumber(item.hourlyCost, 0, 0, 100000)
      };
    })
    .filter(Boolean);

  return clean.length ? clean : fallback;
}

function sanitizeApsWorkCenters(value, fallback) {
  const rows = Array.isArray(value) ? value : [];
  const clean = rows
    .map((row) => {
      const item = row && typeof row === 'object' ? row : {};
      const code = sanitizeCode(item.code).toUpperCase();
      if (!code) return null;
      return {
        code,
        description: sanitizePlainText(item.description, code),
        machineCount: sanitizePositiveInteger(item.machineCount, 1, 1, 200),
        calendar: sanitizePlainText(item.calendar, '1 turno'),
        efficiency: sanitizePositiveNumber(item.efficiency, 1, 0.1, 3),
        capacity: sanitizePositiveNumber(item.capacity, 8, 0, 100000),
        shift: sanitizePlainText(item.shift, '1 turno'),
        maintenance: sanitizePlainText(item.maintenance, '')
      };
    })
    .filter(Boolean);

  return clean.length ? clean : fallback;
}

function sanitizeApsCalendarDays(value, settings) {
  const rows = Array.isArray(value) ? value : [];
  const byDate = new Map();
  for (const row of rows) {
    const item = row && typeof row === 'object' ? row : {};
    const date = sanitizeDateText(item.date);
    if (!date) continue;
    byDate.set(date, {
      date,
      productive: item.productive === false ? false : true,
      startTime: sanitizeTimeText(item.startTime, settings.workdayStart),
      dailyHours: sanitizePositiveNumber(item.dailyHours, settings.dailyHours, 0, 24),
      lunchStart: sanitizeTimeText(item.lunchStart, settings.lunchStart),
      lunchMinutes: sanitizePositiveNumber(item.lunchMinutes, settings.lunchMinutes, 0, 240),
      note: sanitizePlainText(item.note, '')
    });
  }
  return Array.from(byDate.values()).sort((left, right) => left.date.localeCompare(right.date)).slice(0, 900);
}

function sanitizeApsOperations(value, fallback) {
  const rows = Array.isArray(value) ? value : [];
  const clean = rows
    .map((row) => {
      const item = row && typeof row === 'object' ? row : {};
      const code = sanitizeCode(item.code);
      if (!code) return null;
      return {
        code,
        description: sanitizePlainText(item.description, code),
        statusName: sanitizePlainText(item.statusName, ''),
        sortOrder: sanitizePositiveInteger(item.sortOrder, 999, 0, 100000),
        category: sanitizeStatusCategory(item.category),
        flowType: sanitizeStatusFlowType(item.flowType),
        setupHours: sanitizePositiveNumber(item.setupHours, 0, 0, 10000),
        processHours: sanitizePositiveNumber(item.processHours, 1, 0, 10000),
        lotSize: sanitizePositiveInteger(item.lotSize, 1, 1, 100000),
        minOperators: sanitizePositiveInteger(item.minOperators, 1, 1, 100),
        maxOperators: sanitizePositiveInteger(item.maxOperators, 1, 1, 100),
        allowedCenters: sanitizeStringList(item.allowedCenters).map((center) => center.toUpperCase())
      };
    })
    .filter(Boolean)
    .map((row) => ({
      ...row,
      maxOperators: Math.max(row.minOperators, row.maxOperators)
    }));

  return clean.length ? clean : fallback;
}

function sanitizeApsTimeRecords(value, fallback) {
  const rows = Array.isArray(value) ? value : [];
  const clean = rows
    .map((row) => {
      const item = row && typeof row === 'object' ? row : {};
      const referenceType = item.referenceType === 'productionOrder' ? 'productionOrder' : 'salesOrder';
      const orderNumber = sanitizePlainText(item.orderNumber, '');
      const productionOrder = sanitizePlainText(item.productionOrder, '');
      const reference = sanitizePlainText(item.reference, referenceType === 'productionOrder' ? productionOrder : orderNumber);
      const operationCode = sanitizeCode(item.operationCode);
      const productLine = sanitizePlainText(item.productLine, '');
      const capacity = sanitizePlainText(item.capacity || item.capacityTr, '');
      if (!operationCode || !productLine || !capacity) return null;
      return {
        id: sanitizePlainText(item.id, `tempo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
        referenceType,
        reference,
        orderNumber,
        productionOrder,
        operationCode,
        productLine,
        capacity,
        quantity: sanitizePositiveInteger(item.quantity, 1, 1, 100000),
        setupHours: sanitizePositiveNumber(item.setupHours, 0, 0, 10000),
        processHours: sanitizePositiveNumber(item.processHours, 1, 0, 10000),
        note: sanitizePlainText(item.note, ''),
        recordedAt: sanitizePlainText(item.recordedAt, new Date().toISOString())
      };
    })
    .filter(Boolean);

  return clean.length ? clean.slice(0, 5000) : fallback;
}

function apsOperationsFromStatuses(statuses, existingOperations) {
  const rows = Array.isArray(statuses) ? statuses : [];
  const statusRows = rows
    .filter((status) => status && status.flowType !== 'deviation')
    .filter((status) => status.category === 'production');
  const sourceStatuses = statusRows.length
    ? statusRows
    : rows.filter((status) => status && status.flowType !== 'deviation');

  if (!sourceStatuses.length) {
    return existingOperations;
  }

  const existingByCode = new Map((existingOperations || []).map((operation) => [operation.code, operation]));
  const existingByName = new Map((existingOperations || []).map((operation) => [
    normalizeText(operation.statusName || operation.description || operation.code),
    operation
  ]));

  const statusOperations = sourceStatuses
    .slice()
    .sort((a, b) => (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999) || compareText(a.name, b.name))
    .map((status) => {
      const code = `status:${status.id}`;
      const previous = existingByCode.get(code) || existingByName.get(normalizeText(status.name)) || {};
      return {
        code,
        description: status.name,
        statusName: status.name,
        sortOrder: Number(status.sortOrder) || 999,
        category: status.category || 'auxiliary',
        flowType: status.flowType || 'normal',
        setupHours: sanitizePositiveNumber(previous.setupHours, 0, 0, 10000),
        processHours: sanitizePositiveNumber(previous.processHours, 1, 0, 10000),
        lotSize: sanitizePositiveInteger(previous.lotSize, 1, 1, 100000),
        minOperators: sanitizePositiveInteger(previous.minOperators, 1, 1, 100),
        maxOperators: sanitizePositiveInteger(previous.maxOperators, 1, 1, 100),
        allowedCenters: sanitizeStringList(previous.allowedCenters).map((center) => center.toUpperCase())
      };
    });
  const statusOperationCodes = new Set(statusOperations.map((operation) => operation.code));
  const manualOperations = (existingOperations || [])
    .filter((operation) => String(operation.code || '').startsWith('custom:'))
    .filter((operation) => !statusOperationCodes.has(operation.code));

  return [...statusOperations, ...manualOperations]
    .sort((a, b) => (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999) || compareText(a.description, b.description));
}

function normalizeApsOperatorLinks(config) {
  const operationCodes = new Set((config.operations || []).map((operation) => operation.code));
  const centerCodes = new Set((config.workCenters || []).map((center) => center.code));

  config.operators = (config.operators || []).map((operator) => ({
    ...operator,
    enabledOperations: (operator.enabledOperations || []).filter((code) => operationCodes.has(code)),
    enabledCenters: (operator.enabledCenters || []).filter((code) => centerCodes.has(code))
  }));
}

function normalizeApsTimeRecordLinks(config) {
  const operationCodes = new Set((config.operations || []).map((operation) => operation.code));
  config.timeRecords = (config.timeRecords || []).filter((record) => operationCodes.has(record.operationCode));
}

function sanitizeStringList(value) {
  const raw = Array.isArray(value)
    ? value
    : String(value || '').split(/[;,]/);
  const seen = new Set();
  return raw
    .map((item) => sanitizePlainText(item, ''))
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

function sanitizeCode(value) {
  return String(value || '').trim().slice(0, 50);
}

function sanitizePlainText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return (text || fallback).slice(0, 240);
}

function sanitizeTimeText(value, fallback) {
  const text = String(value || '').trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback;
}

function sanitizeDateText(value) {
  const text = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

function sanitizePositiveNumber(value, fallback, min, max) {
  const number = optionalNumber(value);
  if (number === null) return fallback;
  return Math.min(max, Math.max(min, number));
}

function sanitizePositiveInteger(value, fallback, min, max) {
  const number = optionalInteger(value);
  if (number === null) return fallback;
  return Math.min(max, Math.max(min, number));
}

function parseStatusTransitionText(value) {
  const text = String(value || '');
  const separator = ' -> ';
  const index = text.indexOf(separator);
  if (index === -1) {
    return { completedStatus: '', nextStatus: '' };
  }

  return {
    completedStatus: text.slice(0, index).trim(),
    nextStatus: text.slice(index + separator.length).trim()
  };
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

module.exports = {
  LocalDatabase,
  STATUS_VALUES,
  TAB_KEYS,
  SCREEN_ACCESS_TABS,
  SCREEN_PERMISSION_KEYS,
  validateOrder
};
