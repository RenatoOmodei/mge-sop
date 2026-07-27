-- S&OP PostgreSQL schema
-- Fase inicial da migracao: cria a estrutura equivalente ao SQLite atual.

SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS app_meta (
  key text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  can_edit_orders integer NOT NULL DEFAULT 0,
  visible_tabs text NOT NULL DEFAULT '',
  editable_tabs text NOT NULL DEFAULT '',
  password_salt text NOT NULL,
  password_hash text NOT NULL,
  password_iterations integer NOT NULL,
  password_digest text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  updated_at text NOT NULL,
  PRIMARY KEY (user_id, key),
  CONSTRAINT fk_user_preferences_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_statuses (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'auxiliary',
  flow_type text NOT NULL DEFAULT 'normal',
  sort_order integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
  id text PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_label text NOT NULL,
  details text NOT NULL DEFAULT '',
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_orders (
  id text PRIMARY KEY,
  order_number text NOT NULL,
  commercial_responsible text NOT NULL DEFAULT '',
  customer text NOT NULL DEFAULT '',
  sku text NOT NULL,
  production_order text NOT NULL,
  item_type text NOT NULL DEFAULT 'production',
  purchase_order_number text NOT NULL DEFAULT '',
  capacity_tr numeric,
  product_line text NOT NULL DEFAULT '',
  equipment text NOT NULL DEFAULT '',
  voltage text NOT NULL DEFAULT '',
  quantity integer,
  lead_time text NOT NULL DEFAULT '',
  entry_date text NOT NULL,
  original_delivery_date text NOT NULL DEFAULT '',
  production_delivery_date text NOT NULL DEFAULT '',
  finalization_date text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL,
  billing_stage text NOT NULL DEFAULT '',
  billing_released_at text NOT NULL DEFAULT '',
  billing_released_by text NOT NULL DEFAULT '',
  invoiced_at text NOT NULL DEFAULT '',
  invoiced_by text NOT NULL DEFAULT '',
  loaded_at text NOT NULL DEFAULT '',
  loaded_by text NOT NULL DEFAULT '',
  invoice_number text NOT NULL DEFAULT '',
  carrier_name text NOT NULL DEFAULT '',
  carrier_cnpj text NOT NULL DEFAULT '',
  freight_address text NOT NULL DEFAULT '',
  billing_customer_name text NOT NULL DEFAULT '',
  billing_customer_cnpj text NOT NULL DEFAULT '',
  invoice_document_name text NOT NULL DEFAULT '',
  invoice_document_mime_type text NOT NULL DEFAULT '',
  invoice_document_data_url text NOT NULL DEFAULT '',
  machine_height numeric,
  machine_width numeric,
  machine_length numeric,
  machine_weight numeric,
  machine_gross_weight numeric,
  machine_volume numeric,
  stage_lm integer NOT NULL DEFAULT 0,
  stage_serpentina integer NOT NULL DEFAULT 0,
  stage_mechanical_project integer NOT NULL DEFAULT 0,
  stage_electrical_project integer NOT NULL DEFAULT 0,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_order_photos (
  id text PRIMARY KEY,
  order_id text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  data_url text NOT NULL,
  created_at text NOT NULL,
  CONSTRAINT fk_sales_order_photos_order
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS third_party_parts (
  id text PRIMARY KEY,
  romaneio_number text NOT NULL,
  supplier_name text NOT NULL DEFAULT '',
  supplier_cnpj text NOT NULL DEFAULT '',
  part_code text NOT NULL,
  part_description text NOT NULL DEFAULT '',
  quantity numeric,
  unit text NOT NULL DEFAULT 'UN',
  process_description text NOT NULL DEFAULT '',
  issue_date text NOT NULL,
  expected_return_date text NOT NULL DEFAULT '',
  return_date text NOT NULL DEFAULT '',
  sales_order_id text NOT NULL DEFAULT '',
  sales_order_reference text NOT NULL DEFAULT '',
  purchase_order_number text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Aguardando pedido de compra',
  billing_stage text NOT NULL DEFAULT '',
  billing_released_at text NOT NULL DEFAULT '',
  billing_released_by text NOT NULL DEFAULT '',
  invoiced_at text NOT NULL DEFAULT '',
  invoiced_by text NOT NULL DEFAULT '',
  loaded_at text NOT NULL DEFAULT '',
  loaded_by text NOT NULL DEFAULT '',
  invoice_number text NOT NULL DEFAULT '',
  carrier_name text NOT NULL DEFAULT '',
  carrier_cnpj text NOT NULL DEFAULT '',
  freight_address text NOT NULL DEFAULT '',
  billing_customer_name text NOT NULL DEFAULT '',
  billing_customer_cnpj text NOT NULL DEFAULT '',
  invoice_document_name text NOT NULL DEFAULT '',
  invoice_document_mime_type text NOT NULL DEFAULT '',
  invoice_document_data_url text NOT NULL DEFAULT '',
  machine_height numeric,
  machine_width numeric,
  machine_length numeric,
  machine_weight numeric,
  machine_gross_weight numeric,
  machine_volume numeric,
  created_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id text PRIMARY KEY,
  order_id text NOT NULL,
  order_number text NOT NULL DEFAULT '',
  completed_status text NOT NULL,
  next_status text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  actor text NOT NULL DEFAULT '',
  completed_at text NOT NULL,
  source_activity_id text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  CONSTRAINT fk_order_status_history_order
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pcp_pending_issues (
  id text PRIMARY KEY,
  order_id text NOT NULL,
  component_code text NOT NULL,
  reason text NOT NULL,
  motive text NOT NULL DEFAULT '',
  purchase_order_number text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  expected_resolution_date text NOT NULL DEFAULT '',
  issue_status text NOT NULL DEFAULT 'open',
  created_by text NOT NULL DEFAULT '',
  resolved_by text NOT NULL DEFAULT '',
  resolved_at text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL,
  CONSTRAINT fk_pcp_pending_issues_order
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pcp_pending_motives (
  id text PRIMARY KEY,
  reason text NOT NULL,
  name text NOT NULL,
  created_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL,
  UNIQUE(reason, name)
);

CREATE TABLE IF NOT EXISTS purchase_pending_items (
  id text PRIMARY KEY,
  import_batch_id text NOT NULL DEFAULT '',
  source_name text NOT NULL DEFAULT '',
  row_index integer NOT NULL DEFAULT 0,
  data_json text NOT NULL DEFAULT '{}',
  sales_order_id text NOT NULL DEFAULT '',
  sales_order_number text NOT NULL DEFAULT '',
  item_status text NOT NULL DEFAULT 'pending',
  resolution_note text NOT NULL DEFAULT '',
  resolved_by text NOT NULL DEFAULT '',
  resolved_at text NOT NULL DEFAULT '',
  imported_by text NOT NULL DEFAULT '',
  imported_at text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS order_stage_sequences (
  id text PRIMARY KEY,
  order_id text NOT NULL,
  activity_key text NOT NULL,
  sequence_number integer NOT NULL,
  estimated_hours numeric,
  updated_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL,
  UNIQUE(order_id, activity_key),
  CONSTRAINT fk_order_stage_sequences_order
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quality_rnc_state (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_alerts (
  id text PRIMARY KEY,
  order_id text NOT NULL DEFAULT '',
  order_number text NOT NULL DEFAULT '',
  customer text NOT NULL DEFAULT '',
  product_line text NOT NULL DEFAULT '',
  sku text NOT NULL DEFAULT '',
  capacity_tr numeric,
  quantity numeric,
  wrong_photo_name text NOT NULL DEFAULT '',
  wrong_photo_mime_type text NOT NULL DEFAULT '',
  wrong_photo_data_url text NOT NULL DEFAULT '',
  wrong_description text NOT NULL DEFAULT '',
  right_photo_name text NOT NULL DEFAULT '',
  right_photo_mime_type text NOT NULL DEFAULT '',
  right_photo_data_url text NOT NULL DEFAULT '',
  right_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  resolved_at text NOT NULL DEFAULT '',
  resolved_by text NOT NULL DEFAULT '',
  created_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS quality_alert_acknowledgements (
  id text PRIMARY KEY,
  alert_id text NOT NULL,
  order_id text NOT NULL,
  user_id text NOT NULL,
  acknowledged_by text NOT NULL DEFAULT '',
  acknowledged_at text NOT NULL,
  UNIQUE(alert_id, order_id, user_id),
  CONSTRAINT fk_quality_alert_ack_alert
    FOREIGN KEY (alert_id) REFERENCES quality_alerts(id) ON DELETE CASCADE,
  CONSTRAINT fk_quality_alert_ack_order
    FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_quality_alert_ack_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_knowledge_sources (
  id text PRIMARY KEY,
  title text NOT NULL,
  source_type text NOT NULL DEFAULT 'manual',
  scope text NOT NULL DEFAULT 'general',
  content text NOT NULL DEFAULT '',
  tags text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_training_runs (
  id text PRIMARY KEY,
  objective text NOT NULL,
  dataset_scope text NOT NULL DEFAULT 'all',
  model_target text NOT NULL DEFAULT 'decision-support',
  status text NOT NULL DEFAULT 'planned',
  notes text NOT NULL DEFAULT '',
  result_summary text NOT NULL DEFAULT '',
  created_by text NOT NULL DEFAULT '',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_analysis_history (
  id text PRIMARY KEY,
  prompt text NOT NULL,
  context_scope text NOT NULL DEFAULT 'all',
  mode text NOT NULL DEFAULT 'rules-engine',
  response text NOT NULL DEFAULT '',
  confidence numeric,
  created_by text NOT NULL DEFAULT '',
  created_at text NOT NULL
);

ALTER TABLE third_party_parts
  ADD COLUMN IF NOT EXISTS sales_order_id text NOT NULL DEFAULT '';

ALTER TABLE third_party_parts
  ADD COLUMN IF NOT EXISTS purchase_order_number text NOT NULL DEFAULT '';

ALTER TABLE quality_alerts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

ALTER TABLE quality_alerts
  ADD COLUMN IF NOT EXISTS resolved_at text NOT NULL DEFAULT '';

ALTER TABLE quality_alerts
  ADD COLUMN IF NOT EXISTS resolved_by text NOT NULL DEFAULT '';

ALTER TABLE purchase_pending_items
  ADD COLUMN IF NOT EXISTS sales_order_id text NOT NULL DEFAULT '';

ALTER TABLE purchase_pending_items
  ADD COLUMN IF NOT EXISTS sales_order_number text NOT NULL DEFAULT '';

ALTER TABLE pcp_pending_issues
  ADD COLUMN IF NOT EXISTS motive text NOT NULL DEFAULT '';

ALTER TABLE pcp_pending_issues
  ADD COLUMN IF NOT EXISTS purchase_order_number text NOT NULL DEFAULT '';

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

UPDATE third_party_parts
SET billing_stage = '',
  status = 'Aguardando pedido de compra',
  billing_released_at = '',
  billing_released_by = ''
WHERE billing_stage = 'released'
  AND trim(COALESCE(purchase_order_number, '')) = ''
  AND trim(COALESCE(invoiced_at, '')) = ''
  AND trim(COALESCE(loaded_at, '')) = '';

INSERT INTO pcp_pending_motives (id, reason, name, created_by, created_at, updated_at)
VALUES
  ('pcp-motive-purchase-001', 'purchase', 'Aguardando compra', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-purchase-002', 'purchase', 'Sem fornecedor definido', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-purchase-003', 'purchase', 'Aguardando prazo do fornecedor', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-engineering-001', 'engineering', 'Item faltou na lista/estrutura', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-engineering-002', 'engineering', 'Falta de informacao tecnica', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-engineering-003', 'engineering', 'Alteracao de projeto', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-rework-001', 'rework', 'Produto danificado no processo', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-rework-002', 'rework', 'Retrabalho de montagem', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text),
  ('pcp-motive-rework-003', 'rework', 'Ajuste de qualidade', 'Sistema', CURRENT_TIMESTAMP::text, CURRENT_TIMESTAMP::text)
ON CONFLICT (reason, name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_sku ON sales_orders(sku);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer);
CREATE INDEX IF NOT EXISTS idx_sales_orders_item_type ON sales_orders(item_type);
CREATE INDEX IF NOT EXISTS idx_sales_orders_billing_stage ON sales_orders(billing_stage);
CREATE INDEX IF NOT EXISTS idx_sales_order_photos_order_id ON sales_order_photos(order_id);
CREATE INDEX IF NOT EXISTS idx_third_party_parts_romaneio ON third_party_parts(romaneio_number);
CREATE INDEX IF NOT EXISTS idx_third_party_parts_billing_stage ON third_party_parts(billing_stage);
CREATE INDEX IF NOT EXISTS idx_third_party_parts_status ON third_party_parts(status);
CREATE INDEX IF NOT EXISTS idx_third_party_parts_supplier ON third_party_parts(supplier_name);
CREATE INDEX IF NOT EXISTS idx_third_party_parts_sales_order_id ON third_party_parts(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_third_party_parts_purchase_order ON third_party_parts(purchase_order_number);
CREATE INDEX IF NOT EXISTS idx_order_status_history_completed_at ON order_status_history(completed_at);
CREATE INDEX IF NOT EXISTS idx_order_status_history_completed_status ON order_status_history(completed_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_status_history_source_activity
  ON order_status_history(source_activity_id)
  WHERE source_activity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_order_id ON pcp_pending_issues(order_id);
CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_status ON pcp_pending_issues(issue_status);
CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_reason ON pcp_pending_issues(reason);
CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_expected_resolution_date ON pcp_pending_issues(expected_resolution_date);
CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_motive ON pcp_pending_issues(motive);
CREATE INDEX IF NOT EXISTS idx_pcp_pending_issues_purchase_order ON pcp_pending_issues(purchase_order_number);
CREATE INDEX IF NOT EXISTS idx_pcp_pending_motives_reason ON pcp_pending_motives(reason, name);
CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_status ON purchase_pending_items(item_status);
CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_imported_at ON purchase_pending_items(imported_at);
CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_source ON purchase_pending_items(source_name);
CREATE INDEX IF NOT EXISTS idx_purchase_pending_items_sales_order ON purchase_pending_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_order_stage_sequences_activity ON order_stage_sequences(activity_key, sequence_number);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_sku ON quality_alerts(sku);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_customer ON quality_alerts(customer);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_line_capacity ON quality_alerts(product_line, capacity_tr);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_status ON quality_alerts(status);
CREATE INDEX IF NOT EXISTS idx_quality_alert_ack_user_order ON quality_alert_acknowledgements(user_id, order_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_status ON ai_knowledge_sources(status);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_sources_scope ON ai_knowledge_sources(scope);
CREATE INDEX IF NOT EXISTS idx_ai_training_runs_status ON ai_training_runs(status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_created_at ON ai_analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_order_statuses_name ON order_statuses(name);
CREATE INDEX IF NOT EXISTS idx_order_statuses_category ON order_statuses(category);
CREATE INDEX IF NOT EXISTS idx_order_statuses_flow_type ON order_statuses(flow_type);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
