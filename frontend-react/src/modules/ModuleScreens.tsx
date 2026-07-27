import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { api } from '../api/client';
import type { CurrentUser, PermissionKey, ScreenKey, TabKey, UserRole } from '../App';
import { DocumentPreviewDialog, downloadPreviewDocument, type PreviewDocument } from '../components/DocumentPreviewDialog';
import { IconText } from '../components/Icon';

type Row = Record<string, unknown>;
type Column = {
  key: string;
  label: string;
  format?: (value: unknown, row: Row) => string;
  render?: (row: Row) => ReactNode;
};
type PreferenceKey =
  | 'productTableState'
  | 'reportTableState'
  | 'pcpTableState'
  | 'billingHistoryState'
  | 'loadingTableState'
  | 'thirdPartyTableState'
  | 'sequencingUiState'
  | 'apsUiState';
type ModuleProps = {
  user: CurrentUser;
  realtimeRefreshKey?: number;
};
type AdminScreenSection = 'all' | 'system' | 'statuses' | 'customers' | 'pcpMotives' | 'users';
type ApsConfigFocus = 'operations' | 'centers' | 'operators' | 'calendar';

type BillingDialogMode = 'released' | 'invoiced';
type BillingHistoryFilters = {
  search: string;
  sourceType: string;
  dateFrom: string;
  dateTo: string;
  document: string;
};
type LoadingTableState = {
  search: string;
  sourceType: string;
  document: string;
  dateFrom: string;
  dateTo: string;
};
type InvoiceDocumentInput = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
};
type BillingFormState = {
  invoiceNumber: string;
  carrierName: string;
  carrierCnpj: string;
  freightAddress: string;
  billingCustomerName: string;
  billingCustomerCnpj: string;
  machineHeight: string;
  machineWidth: string;
  machineLength: string;
  machineWeight: string;
  machineGrossWeight: string;
  machineVolume: string;
};
type ThirdPartyFormState = {
  romaneioNumber: string;
  salesOrderId: string;
  salesOrderReference: string;
  supplierName: string;
  supplierCnpj: string;
  partCode: string;
  partDescription: string;
  quantity: string;
  unit: string;
  processDescription: string;
  issueDate: string;
  expectedReturnDate: string;
  notes: string;
};
type ThirdPartyTableState = {
  search: string;
  returnScope: string;
  status: string;
  billingStage: string;
  dateMode: string;
};
type PcpFormState = {
  orderId: string;
  componentCode: string;
  reason: string;
  motive: string;
  purchaseOrderNumber: string;
  expectedResolutionDate: string;
  notes: string;
};
type PcpTableState = {
  search: string;
  status: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  columnFilters: Record<string, string>;
};
type DashboardGoals = {
  soldMonth: string;
  finishedMonth: string;
  leadTimeMonth: string;
  averageSoldYear: string;
  deliveryPunctuality: string;
  averageProducedYear: string;
};
type DashboardReleaseFilters = {
  year: string;
  month: string;
  dateFrom: string;
  dateTo: string;
  itemType: string;
};
type DashboardSeriesPoint = {
  label: string;
  value: number;
  delivered?: number;
  onTime?: number;
};
type DashboardChartDefinition = {
  key: string;
  title: string;
  series: DashboardSeriesPoint[];
  type: 'bar' | 'scatter';
  yTitle: string;
  goal: number | null;
  percentage?: boolean;
};
type DashboardChartMode = 'auto' | 'bar' | 'line';
type DashboardChartSort = 'period' | 'desc' | 'asc';
type AiKnowledgeFormState = {
  title: string;
  sourceType: string;
  scope: string;
  tags: string;
  content: string;
  status: string;
};
type AiTrainingFormState = {
  objective: string;
  datasetScope: string;
  modelTarget: string;
  notes: string;
  resultSummary: string;
  status: string;
};
type ProductTableState = {
  search: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  riskFilter: string;
  productFilters: Record<string, string>;
  forecastFilters: Record<string, string>;
};
type ActivityTableState = {
  search: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
  actionGroup: string;
  pageSize: number;
  filters: Record<string, string>;
};
type ActivityLogPage = {
  activities?: Row[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
};
type AdminStatusForm = {
  name: string;
  category: 'production' | 'auxiliary';
  sortOrder: string;
  flowType: 'normal' | 'deviation';
};
type AdminCustomerForm = {
  name: string;
};
type AdminPcpMotiveForm = {
  reason: string;
  name: string;
};
type AdminUserForm = {
  name: string;
  username: string;
  password: string;
  role: UserRole;
  canEditOrders: boolean;
  visibleTabs: PermissionKey[];
  editableTabs: PermissionKey[];
};
type QualityAlertFormState = {
  orderId: string;
  orderNumber: string;
  customer: string;
  productLine: string;
  sku: string;
  capacityTr: string;
  quantity: string;
  wrongDescription: string;
  rightDescription: string;
  wrongPhoto: InvoiceDocumentInput | null;
  rightPhoto: InvoiceDocumentInput | null;
};
type SequencingDraft = {
  sequenceNumber: string;
  estimatedHours: string;
};
type SequencingUiState = {
  activityKey: string;
  startDateTime: string;
};
type SequencingScheduleItem = {
  row: Row;
  sequenceNumber: number;
  startAt: Date;
  endAt: Date;
  durationHours: number;
  offsetPercent: number;
  widthPercent: number;
};
type ApsSettings = {
  workdayStart: string;
  dailyHours: number;
  lunchStart: string;
  lunchMinutes: number;
  priorityRule: 'EDD' | 'MANUAL';
  calendarDays: ApsCalendarDay[];
  timeLearningEnabled: boolean;
};
type ApsCalendarDay = {
  date: string;
  productive: boolean;
  startTime: string;
  dailyHours: number;
  lunchStart: string;
  lunchMinutes: number;
  note: string;
};
type ApsOperator = {
  code: string;
  name: string;
  shift: string;
  journeyHours: number;
  efficiency: number;
  skill: string;
  enabledOperations: string[];
  enabledCenters: string[];
  hourlyCost: number;
};
type ApsWorkCenter = {
  code: string;
  description: string;
  machineCount: number;
  calendar: string;
  efficiency: number;
  capacity: number;
  shift: string;
  maintenance: string;
};
type ApsOperation = {
  code: string;
  description: string;
  statusName: string;
  sortOrder: number;
  category: string;
  flowType: string;
  setupHours: number;
  processHours: number;
  lotSize: number;
  minOperators: number;
  maxOperators: number;
  allowedCenters: string[];
};
type ApsTimeReferenceType = 'productionOrder' | 'salesOrder';
type ApsTimeRecord = {
  id: string;
  referenceType: ApsTimeReferenceType;
  reference: string;
  orderNumber: string;
  productionOrder: string;
  operationCode: string;
  productLine: string;
  capacity: string;
  quantity: number;
  setupHours: number;
  processHours: number;
  note: string;
  recordedAt: string;
};
type ApsLearnedTimeRow = {
  key: string;
  productLine: string;
  capacity: string;
  operationCode: string;
  operationLabel: string;
  samples: number;
  setupHours: number;
  processHoursPerUnit: number;
  averageQuantity: number;
  confidence: string;
};
type ApsTimeModelBucket = {
  key: string;
  productLine: string;
  capacity: string;
  operationCode: string;
  samples: number;
  setupHours: number;
  processHoursPerUnit: number;
  averageQuantity: number;
  setupTotal: number;
  processPerUnitTotal: number;
  quantityTotal: number;
};
type ApsConfig = {
  settings: ApsSettings;
  operators: ApsOperator[];
  workCenters: ApsWorkCenter[];
  operations: ApsOperation[];
  timeRecords: ApsTimeRecord[];
};
type ApsUiState = {
  startDate: string;
  priorityRule: 'EDD' | 'MANUAL';
  scenarioExtraHours: string;
  scenarioOperatorBoost: string;
  configTab: 'operations' | 'centers' | 'operators';
};
type ApsMachineResource = {
  code: string;
  name: string;
  type: 'machine';
  centerCode: string;
  availableAt: Date;
  loadHours: number;
};
type ApsOperatorResource = ApsOperator & {
  type: 'operator';
  availableAt: Date;
  loadHours: number;
};
type ApsResource = ApsMachineResource | ApsOperatorResource;
type ApsTask = Row & {
  orderId: string;
  activityKey: string;
  activityLabel: string;
  routeRank: number;
  dueDate: string;
  manualSequence: number;
  estimatedSetupHours: number;
  estimatedHours: number;
  timeSource: string;
  timeSamples: number;
  priority: number;
};
type ApsScheduleRow = ApsTask & {
  operationCode: string;
  operationLabel: string;
  centerCode: string;
  centerLabel: string;
  machineCode: string;
  operatorCode: string;
  operatorName: string;
  startAt: Date;
  setupEnd: Date;
  endAt: Date;
  setupHours: number;
  processHours: number;
  queueHours: number;
  dueAt: Date | null;
  delayDays: number;
  statusText: string;
};
type ApsSegment = {
  row: ApsScheduleRow;
  type: 'setup' | 'production' | 'late';
  label: string;
  resourceCode: string;
  startAt: Date;
  endAt: Date;
  offsetPercent: number;
  widthPercent: number;
};
type DhtmlxGanttTask = {
  id: string;
  text: string;
  start_date: Date;
  end_date: Date;
  parent?: string;
  open?: boolean;
  progress?: number;
  resource?: string;
  durationHours?: number;
  typeClass?: string;
  readonly?: boolean;
  type?: string;
};
type DhtmlxGanttLink = {
  id: string;
  source: string;
  target: string;
  type: string;
};
type DhtmlxGanttApi = {
  config: Record<string, unknown>;
  templates: Record<string, unknown>;
  plugins?: (plugins: Record<string, boolean>) => void;
  clearAll: () => void;
  init: (container: HTMLElement) => void;
  parse: (data: { data: DhtmlxGanttTask[]; links: DhtmlxGanttLink[] }) => void;
  render?: () => void;
  setSkin?: (skin: string) => void;
  license?: string;
};
type ApsUtilization = {
  code: string;
  name: string;
  type: string;
  loadHours: number;
  utilization: number;
  status: string;
};
type ApsDelay = {
  orderId: string;
  orderNumber: string;
  productionOrder: string;
  customer: string;
  dueDate: string;
  dueAt: Date | null;
  predictedAt: Date;
  delayDays: number;
  quantity: number;
};
type ApsMetrics = {
  makespanHours: number;
  makespanDays: number;
  totalOperations: number;
  lateOperations: number;
  totalOrders: number;
  lateOrders: number;
  otif: number;
  delays: ApsDelay[];
  utilizations: ApsUtilization[];
  bottleneck: ApsUtilization | null;
};
type ApsSchedule = {
  scenarioName: string;
  settings: ApsSettings;
  rows: ApsScheduleRow[];
  segments: ApsSegment[];
  resources: ApsResource[];
  rangeStart: Date;
  rangeEnd: Date;
  metrics: ApsMetrics;
};

declare global {
  interface Window {
    gantt?: DhtmlxGanttApi;
    __dhtmlxGanttPromise?: Promise<DhtmlxGanttApi>;
  }
}

const reasonLabels: Record<string, string> = {
  purchase: 'Compras',
  engineering: 'Engenharia',
  rework: 'Retrabalho',
  damaged: 'Retrabalho',
  missing_structure: 'Engenharia'
};
const monthNumberOptions = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Marco' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

export function DashboardScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [summary, setSummary] = useState<Row | null>(null);
  const [analysis, setAnalysis] = useState<Row | null>(null);
  const [orders, setOrders] = useState<Row[]>([]);
  const [releases, setReleases] = useState<Row[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [releaseMonth, setReleaseMonth] = useState('');
  const [releaseDateFrom, setReleaseDateFrom] = useState('');
  const [releaseDateTo, setReleaseDateTo] = useState('');
  const [releaseType, setReleaseType] = useState('');
  const [chartMode, setChartMode] = useState<DashboardChartMode>('auto');
  const [chartSort, setChartSort] = useState<DashboardChartSort>('period');
  const [chartLimit, setChartLimit] = useState('12');
  const [selectedChartKey, setSelectedChartKey] = useState('soldMonth');
  const [selectedPoint, setSelectedPoint] = useState<DashboardSeriesPoint | null>(null);
  const [expandedChartKey, setExpandedChartKey] = useState('');
  const [productionStatuses, setProductionStatuses] = useState<string[]>([]);
  const [goals, setGoals] = useState<DashboardGoals>(() => emptyDashboardGoals());
  const [goalDraft, setGoalDraft] = useState<DashboardGoals>(() => emptyDashboardGoals());
  const [goalBusy, setGoalBusy] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ orders?: Row[] }>('/api/orders').catch((): { orders?: Row[] } => ({ orders: [] })),
      api<{ summary?: Row }>('/api/orders?page=1&pageSize=1').catch((): { summary?: Row } => ({})),
      api<{ analysis?: Row }>('/api/ai/insights').catch((): { analysis?: Row } => ({})),
      api<{ months?: string[]; releases?: Row[] }>(`/api/dashboard/status-releases${month ? `?month=${encodeURIComponent(month)}` : ''}`),
      api<{ goals?: Row }>('/api/dashboard/goals').catch((): { goals?: Row } => ({})),
      api<{ productionStatuses?: string[] }>('/api/status-values').catch((): { productionStatuses?: string[] } => ({ productionStatuses: [] }))
    ])
      .then(([ordersData, ordersSummaryData, aiData, statusData, goalsData, statusValues]) => {
        if (ignore) return;
        const nextGoals = dashboardGoalsFromRow(goalsData.goals || {});
        setOrders(ordersData.orders || []);
        setSummary(ordersSummaryData.summary || null);
        setAnalysis(aiData.analysis || null);
        setMonths(statusData.months || []);
        setReleases(statusData.releases || []);
        setGoals(nextGoals);
        setGoalDraft(nextGoals);
        setProductionStatuses(statusValues.productionStatuses || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [month, refresh, realtimeRefreshKey]);

  const cards = Array.isArray(analysis?.cards) ? (analysis.cards as Row[]) : [];
  const insights = Array.isArray(analysis?.insights) ? (analysis.insights as unknown[]) : [];
  const recommendations = Array.isArray(analysis?.recommendations) ? (analysis.recommendations as unknown[]) : [];
  const aiNotifications = Array.isArray(analysis?.notifications) ? (analysis.notifications as Row[]) : [];
  const years = useMemo(() => dashboardYears(orders), [orders]);
  const productionOrders = useMemo(() => orders.filter(isProductionItem), [orders]);
  const releaseSummaryRows = useMemo(() => deliveryReleaseSummaryByFinalizationMonth(orders, {
    year: releaseYear,
    month: releaseMonth,
    dateFrom: releaseDateFrom,
    dateTo: releaseDateTo,
    itemType: releaseType
  }), [orders, releaseDateFrom, releaseDateTo, releaseMonth, releaseType, releaseYear]);
  const statusReleaseRows = useMemo(() => {
    const allowed = new Set(productionStatuses);
    return allowed.size ? releases.filter((row) => allowed.has(String(row.status || ''))) : releases;
  }, [productionStatuses, releases]);
  const rawCharts = useMemo(() => dashboardCharts(productionOrders, year, goals), [productionOrders, year, goals]);
  const charts = useMemo(() => prepareDashboardCharts(rawCharts, {
    mode: chartMode,
    sort: chartSort,
    limit: chartLimit
  }), [chartLimit, chartMode, chartSort, rawCharts]);
  const selectedChart = charts.find((chart) => chart.key === selectedChartKey) || charts[0] || null;
  const selectedChartRows = useMemo(() => dashboardChartDetailRows(selectedChart), [selectedChart]);
  const selectedChartMetrics = useMemo(() => dashboardChartMetrics(selectedChart), [selectedChart]);
  const canEditDashboard = canEdit(user, 'dashboard');

  useEffect(() => {
    if (!charts.length) return;
    if (!charts.some((chart) => chart.key === selectedChartKey)) {
      setSelectedChartKey(charts[0].key);
      setSelectedPoint(null);
    }
  }, [charts, selectedChartKey]);

  async function saveGoals() {
    if (!canEditDashboard) return;
    setGoalBusy(true);
    setGoalError('');
    try {
      const payload = dashboardGoalPayload(goalDraft);
      const { goals: saved } = await api<{ goals?: Row }>('/api/dashboard/goals', {
        method: 'PUT',
        body: { goals: payload }
      });
      const nextGoals = dashboardGoalsFromRow(saved || payload);
      setGoals(nextGoals);
      setGoalDraft(nextGoals);
    } catch (err) {
      setGoalError(err instanceof Error ? err.message : 'Falha ao salvar metas.');
    } finally {
      setGoalBusy(false);
    }
  }

  return (
    <ModuleFrame title="Dashboard S&OP" subtitle="Indicadores operacionais, metas, graficos e liberacoes por status." error={error}>
      <div className="module-metrics">
        <Metric label="Pedidos de venda" value={summary?.totalOrders ?? '-'} />
        <Metric label="Equipamentos em pedidos" value={summary?.totalEquipment ?? '-'} />
        <Metric label="Lead time medio" value={summary?.averageLeadTime === null || summary?.averageLeadTime === undefined ? '-' : `${formatNumber(summary.averageLeadTime)} dias`} />
        <Metric label="Maquinas em producao" value={summary?.productionMachines ?? '-'} />
      </div>

      <section className="module-panel dashboard-control-panel">
        <div className="panel-title">
          <h3>Segmentacao e metas</h3>
          <span>{canEditDashboard ? 'Metas editaveis' : 'Consulta'}</span>
        </div>
        <div className="module-toolbar dashboard-filters">
          <label className="field">
            <span>Ano dos graficos</span>
            <select className="input mini-input" value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">Todos</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Visualizacao</span>
            <select className="input mini-input" value={chartMode} onChange={(event) => setChartMode(event.target.value as DashboardChartMode)}>
              <option value="auto">Automatica</option>
              <option value="bar">Barras</option>
              <option value="line">Linhas</option>
            </select>
          </label>
          <label className="field">
            <span>Ordenacao</span>
            <select className="input mini-input" value={chartSort} onChange={(event) => setChartSort(event.target.value as DashboardChartSort)}>
              <option value="period">Periodo</option>
              <option value="desc">Maior valor</option>
              <option value="asc">Menor valor</option>
            </select>
          </label>
          <label className="field">
            <span>Pontos</span>
            <select className="input mini-input" value={chartLimit} onChange={(event) => setChartLimit(event.target.value)}>
              <option value="6">Ultimos 6</option>
              <option value="12">Ultimos 12</option>
              <option value="24">Ultimos 24</option>
              <option value="">Todos</option>
            </select>
          </label>
          {dashboardGoalFields().map((field) => (
            <label className="field dashboard-goal-field" key={field.key}>
              <span>{field.label}</span>
              <input
                className="input"
                type="number"
                min="0"
                step="0.1"
                value={goalDraft[field.key]}
                disabled={!canEditDashboard || goalBusy}
                onChange={(event) => setGoalDraft((current) => ({ ...current, [field.key]: event.target.value }))}
              />
            </label>
          ))}
          {canEditDashboard && <button className="btn primary" type="button" disabled={goalBusy} onClick={saveGoals}>Salvar metas</button>}
          <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}><IconText name="refresh">Atualizar</IconText></button>
        </div>
        {goalError && <p className="error">{goalError}</p>}
      </section>

      <section className={`dashboard-chart-grid ${expandedChartKey ? 'has-expanded-chart' : ''}`}>
        {charts.map((chart) => (
          <article className={`module-panel chart-panel ${selectedChart?.key === chart.key ? 'selected' : ''} ${expandedChartKey === chart.key ? 'expanded' : expandedChartKey ? 'collapsed' : ''}`} key={chart.key}>
            <div className="chart-panel-header">
              <div>
                <h3>{chart.title}</h3>
                <span>{chart.series.length} ponto(s) | {chart.yTitle}</span>
              </div>
              <div className="panel-actions">
                <button className="btn" type="button" onClick={() => {
                  setSelectedChartKey(chart.key);
                  setSelectedPoint(null);
                }}><IconText name="eye">Detalhes</IconText></button>
                <button className="btn" type="button" onClick={() => setExpandedChartKey((current) => current === chart.key ? '' : chart.key)}>
                  <IconText name="box">{expandedChartKey === chart.key ? 'Normal' : 'Destacar'}</IconText>
                </button>
              </div>
            </div>
            <PlotlyChart
              {...chart}
              onPointSelect={(point) => {
                setSelectedChartKey(chart.key);
                setSelectedPoint(point);
              }}
            />
          </article>
        ))}
      </section>

      {selectedChart && (
        <section className="module-panel dashboard-chart-detail-panel">
          <div className="panel-title">
            <div>
              <h3>Detalhe do grafico</h3>
              <span>{selectedChart.title}{selectedPoint ? ` | ponto selecionado: ${selectedPoint.label}` : ''}</span>
            </div>
            <div className="panel-actions">
              <button className="btn" type="button" onClick={() => exportDashboardChartCsv(selectedChart)}><IconText name="download">Exportar serie</IconText></button>
              {selectedPoint && <button className="btn" type="button" onClick={() => setSelectedPoint(null)}><IconText name="close">Limpar ponto</IconText></button>}
            </div>
          </div>
          <div className="module-metrics compact">
            <Metric label="Pontos exibidos" value={formatInteger(selectedChartMetrics.points)} />
            <Metric label={selectedChart.percentage ? 'Media exibida' : 'Total exibido'} value={selectedChart.percentage ? `${formatNumber(selectedChartMetrics.average)}%` : formatNumber(selectedChartMetrics.total)} />
            <Metric label="Maior valor" value={selectedChart.percentage ? `${formatNumber(selectedChartMetrics.max)}%` : formatNumber(selectedChartMetrics.max)} />
            <Metric label="Meta" value={selectedChart.goal === null ? '-' : `${formatNumber(selectedChart.goal)}${selectedChart.percentage ? '%' : ''}`} />
          </div>
          {selectedPoint && (
            <div className="dashboard-point-summary">
              <strong>{selectedPoint.label}</strong>
              <span>Valor: {formatNumber(selectedPoint.value)}{selectedChart.percentage ? '%' : ''}</span>
              {selectedPoint.delivered !== undefined && <span>Entregues: {formatInteger(selectedPoint.delivered)}</span>}
              {selectedPoint.onTime !== undefined && <span>No prazo: {formatInteger(selectedPoint.onTime)}</span>}
            </div>
          )}
          <DataTable rows={selectedChartRows} columns={[
            { key: 'label', label: 'Periodo' },
            { key: 'value', label: selectedChart.yTitle, format: (_value, row) => `${formatNumber(row.value)}${selectedChart.percentage ? '%' : ''}` },
            { key: 'goal', label: 'Meta', format: (_value, row) => row.goal === null ? '-' : `${formatNumber(row.goal)}${selectedChart.percentage ? '%' : ''}` },
            { key: 'gap', label: 'Desvio', format: (_value, row) => row.gap === null ? '-' : `${formatNumber(row.gap)}${selectedChart.percentage ? '%' : ''}` },
            { key: 'delivered', label: 'Entregues', format: formatInteger },
            { key: 'onTime', label: 'No prazo', format: formatInteger }
          ]} rowClass={(row) => String(row.label || '') === selectedPoint?.label ? 'row-highlight' : ''} />
        </section>
      )}

      <SopAiPanel
        analysis={analysis}
        cards={cards}
        insights={insights}
        recommendations={recommendations}
        notifications={aiNotifications}
        onRefresh={() => setRefresh((value) => value + 1)}
      />

      <section className="module-panel dashboard-table-panel dashboard-release-month-panel">
        <div className="panel-title">
          <div>
            <h3>Liberacao por mes</h3>
            <span>Base: data de finalizacao</span>
          </div>
          <span>{releaseSummaryRows.length} meses</span>
        </div>
        <div className="module-toolbar dashboard-release-filters">
          <label className="field">
            <span>Mes</span>
            <select className="input mini-input" value={releaseMonth} onChange={(event) => setReleaseMonth(event.target.value)}>
              <option value="">Todos</option>
              {monthNumberOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Ano</span>
            <select className="input mini-input" value={releaseYear} onChange={(event) => setReleaseYear(event.target.value)}>
              <option value="">Todos</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Periodo de</span>
            <input className="input mini-input" type="date" value={releaseDateFrom} onChange={(event) => setReleaseDateFrom(event.target.value)} />
          </label>
          <label className="field">
            <span>Periodo ate</span>
            <input className="input mini-input" type="date" value={releaseDateTo} onChange={(event) => setReleaseDateTo(event.target.value)} />
          </label>
          <label className="field">
            <span>Tipo</span>
            <select className="input mini-input" value={releaseType} onChange={(event) => setReleaseType(event.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="production">Producao</option>
              <option value="purchased">Comprado</option>
            </select>
          </label>
          <button className="btn" type="button" onClick={() => {
            setReleaseMonth('');
            setReleaseYear('');
            setReleaseDateFrom('');
            setReleaseDateTo('');
            setReleaseType('');
          }}>Limpar</button>
        </div>
        <DataTable rows={releaseSummaryRows} columns={[
          { key: 'label', label: 'Mes' },
          { key: 'late', label: 'Em atraso', format: formatInteger },
          { key: 'onTime', label: 'No prazo', format: formatInteger },
          { key: 'early', label: 'Antecipadas', format: formatInteger }
        ]} />
      </section>

      <section className="module-panel dashboard-table-panel dashboard-status-release-panel">
        <div className="panel-title">
          <h3>Maquinas liberadas por status</h3>
          <div className="panel-actions">
            <select className="input mini-input" value={month} onChange={(event) => setMonth(event.target.value)}>
              <option value="">Todos os meses</option>
              {months.map((item) => <option value={item} key={item}>{formatMonth(item)}</option>)}
            </select>
            <button className="btn" type="button" onClick={() => setMonth('')}>Limpar</button>
          </div>
        </div>
        <DataTable
          rows={statusReleaseRows}
          columns={[
            { key: 'month', label: 'Mes', format: (value) => formatMonth(String(value || '')) },
            { key: 'status', label: 'Status' },
            { key: 'orders', label: 'Pedidos', format: formatInteger },
            { key: 'machines', label: 'Maquinas', format: formatInteger },
            { key: 'lastCompletedAt', label: 'Ultima conclusao', format: formatDateTime }
          ]}
        />
      </section>
    </ModuleFrame>
  );
}

function SopAiPanel({
  analysis,
  cards,
  insights,
  recommendations,
  notifications,
  onRefresh
}: {
  analysis: Row | null;
  cards: Row[];
  insights: unknown[];
  recommendations: unknown[];
  notifications: Row[];
  onRefresh: () => void;
}) {
  const hasAnalysis = Boolean(cards.length || insights.length || recommendations.length || notifications.length);
  return (
    <section className="module-panel sop-ai-panel">
      <div className="panel-title">
        <div>
          <h3>IA operacional S&OP</h3>
          <span>{sopAiSubtitle(analysis, hasAnalysis)}</span>
        </div>
        <div className="panel-actions">
          <span>{analysis?.mode ? `Motor: ${String(analysis.mode)}` : 'Motor local'}</span>
          <button className="btn" type="button" onClick={onRefresh}>Atualizar analise</button>
        </div>
      </div>

      <div className="sop-ai-grid">
        <div className="sop-ai-main">
          <div className="module-metrics compact sop-ai-cards">
            {cards.length ? cards.map((card) => (
              <Metric key={String(card.label)} label={String(card.label || '-')} value={card.value ?? '-'} />
            )) : <Metric label="Analise" value="Sem dados" />}
            <Metric label="Pedidos producao abertos" value={analysis?.productionOpenOrders ?? '-'} />
            <Metric label="LLM pronta" value={analysis?.llmReady ? 'Sim' : 'Nao'} />
          </div>

          <div className="sop-ai-columns">
            <article className="sop-ai-section">
              <h4>Insights</h4>
              <div className="insight-list sop-ai-list">
                {insights.length
                  ? insights.map((item, index) => <p key={index}>{String(item)}</p>)
                  : <p>Nenhum insight automatico no momento.</p>}
              </div>
            </article>

            <article className="sop-ai-section">
              <h4>Recomendacoes</h4>
              <ol className="sop-ai-recommendations">
                {recommendations.length
                  ? recommendations.map((item, index) => <li key={index}>{String(item)}</li>)
                  : <li>Sem recomendacoes automaticas para o filtro atual.</li>}
              </ol>
            </article>
          </div>
        </div>

        <aside className="sop-ai-alerts">
          <div className="panel-title">
            <h4>Alertas relacionados</h4>
            <span>{notifications.length} item(ns)</span>
          </div>
          <div className="sop-ai-alert-list">
            {notifications.length ? notifications.map((item) => (
              <article className={`sop-ai-alert ${String(item.level || 'info')}`} key={String(item.id || item.title)}>
                <strong>{String(item.title || 'Alerta')}</strong>
                <span>{String(item.message || '')}</span>
                <em>{formatInteger(item.count)} ocorrencia(s)</em>
              </article>
            )) : <p className="muted-text">Sem alertas vinculados a analise.</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}

function PlotlyChart({
  title,
  series,
  type,
  yTitle,
  goal,
  percentage,
  onPointSelect
}: {
  title: string;
  series: DashboardSeriesPoint[];
  type: 'bar' | 'scatter';
  yTitle: string;
  goal: number | null;
  percentage?: boolean;
  onPointSelect?: (point: DashboardSeriesPoint) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    if (isVisible) return;

    if (typeof IntersectionObserver === 'undefined') {
      const timer = setTimeout(() => setIsVisible(true), 80);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '180px' });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let disposed = false;
    let plotlyInstance: any = null;

    if (!series.length) {
      container.innerHTML = '<div class="empty chart-empty">Sem dados para exibir.</div>';
      return;
    }

    if (!isVisible) {
      container.innerHTML = '<div class="empty chart-empty">Carregando grafico...</div>';
      return;
    }

    const traces: any[] = [{
      x: series.map((item) => item.label),
      y: series.map((item) => item.value),
      type,
      mode: type === 'scatter' ? 'lines+markers' : undefined,
      name: title,
      marker: { color: percentage ? '#1e7f4f' : '#0d6efd' },
      line: { color: percentage ? '#1e7f4f' : '#0d6efd', width: 3 },
      customdata: series.map((item) => [item.onTime || 0, item.delivered || 0]),
      hovertemplate: percentage
        ? '%{x}<br>%{y}%<br>No prazo: %{customdata[0]}<br>Entregues: %{customdata[1]}<extra></extra>'
        : '%{x}<br>%{y}<extra></extra>'
    }];

    if (goal !== null) {
      traces.push({
        x: series.map((item) => item.label),
        y: series.map(() => goal),
        type: 'scatter',
        mode: 'lines',
        name: 'Meta',
        marker: { color: '#dc2626' },
        line: { color: '#dc2626', width: 2, dash: 'dash' },
        customdata: [],
        hovertemplate: `Meta: %{y}${percentage ? '%' : ''}<extra></extra>`
      });
    }

    import('plotly.js-dist-min').then((module) => {
      if (disposed || !container) return;
      plotlyInstance = module.default;
      plotlyInstance.newPlot(container, traces, {
        margin: { t: 10, r: 14, b: 48, l: 48 },
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#ffffff',
        hovermode: 'x unified',
        font: { family: 'Arial, Helvetica, sans-serif', size: 11, color: '#172033' },
        xaxis: { automargin: true, tickangle: -25, gridcolor: '#edf2f7' },
        yaxis: {
          title: yTitle,
          rangemode: percentage ? undefined : 'tozero',
          range: percentage ? [0, 100] : undefined,
          ticksuffix: percentage ? '%' : '',
          gridcolor: '#edf2f7'
        },
        bargap: 0.24,
        showlegend: goal !== null,
        uirevision: `${title}-${type}`
      }, {
        displayModeBar: true,
        displaylogo: false,
        responsive: true,
        scrollZoom: true,
        doubleClick: 'reset',
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
      });

      if (onPointSelect && typeof (container as any).on === 'function') {
        (container as any).on('plotly_click', (eventData: any) => {
          const pointIndex = Number(eventData?.points?.[0]?.pointIndex);
          const point = Number.isFinite(pointIndex) ? series[pointIndex] : null;
          if (point) onPointSelect(point);
        });
      }
    });

    return () => {
      disposed = true;
      if (plotlyInstance) plotlyInstance.purge(container);
    };
  }, [goal, isVisible, onPointSelect, percentage, series, title, type, yTitle]);

  return <div className="plotly-chart" ref={ref} />;
}

export function AiScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const editable = canEdit(user, 'ai');
  const [workbench, setWorkbench] = useState<Row | null>(null);
  const [knowledgeSources, setKnowledgeSources] = useState<Row[]>([]);
  const [trainingRuns, setTrainingRuns] = useState<Row[]>([]);
  const [history, setHistory] = useState<Row[]>([]);
  const [analysis, setAnalysis] = useState<Row | null>(null);
  const [prompt, setPrompt] = useState('Quais riscos podem impactar os pedidos abertos e quais acoes devo priorizar?');
  const [contextScope, setContextScope] = useState('all');
  const [sourceForm, setSourceForm] = useState(emptyAiKnowledgeForm());
  const [trainingForm, setTrainingForm] = useState(emptyAiTrainingForm());
  const [selectedSource, setSelectedSource] = useState<Row | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setError('');
    api<{ workbench?: Row }>('/api/ai/workbench')
      .then((data) => applyAiWorkbench(data.workbench || {}))
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar o modulo IA.'));
  };

  useEffect(load, [realtimeRefreshKey]);

  function applyAiWorkbench(nextWorkbench: Row) {
    setWorkbench(nextWorkbench);
    setKnowledgeSources(arrayRows(nextWorkbench.knowledgeSources));
    setTrainingRuns(arrayRows(nextWorkbench.trainingRuns));
    setHistory(arrayRows(nextWorkbench.analysisHistory));
  }

  async function generateAnalysis(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await api<{ analysis?: Row; history?: Row[] }>('/api/ai/analyze', {
        method: 'POST',
        body: { prompt, contextScope }
      });
      setAnalysis(data.analysis || null);
      setSelectedHistory(data.analysis || null);
      setHistory(arrayRows(data.history));
      setSuccess('Analise IA gerada e registrada no historico.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar analise IA.');
    } finally {
      setBusy(false);
    }
  }

  async function submitSource(event: FormEvent) {
    event.preventDefault();
    if (!editable) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await api<{ workbench?: Row }>('/api/ai/knowledge', {
        method: 'POST',
        body: sourceForm
      });
      applyAiWorkbench(data.workbench || {});
      setSourceForm(emptyAiKnowledgeForm());
      setSuccess('Base de conhecimento incluida na IA.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar base de conhecimento.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleSource(row: Row) {
    if (!editable) return;
    const id = String(row.id || '');
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<{ workbench?: Row }>(`/api/ai/knowledge/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { status: String(row.status || 'active') === 'active' ? 'inactive' : 'active' }
      });
      applyAiWorkbench(data.workbench || {});
      setSuccess('Status da base de conhecimento atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar base de conhecimento.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteSource(row: Row) {
    if (!editable) return;
    const id = String(row.id || '');
    if (!id || !window.confirm('Excluir esta base de conhecimento da IA?')) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<{ workbench?: Row }>(`/api/ai/knowledge/${encodeURIComponent(id)}`, { method: 'DELETE' });
      applyAiWorkbench(data.workbench || {});
      setSelectedSource((current) => current && String(current.id || '') === id ? null : current);
      setSuccess('Base de conhecimento excluida.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir base de conhecimento.');
    } finally {
      setBusy(false);
    }
  }

  async function submitTraining(event: FormEvent) {
    event.preventDefault();
    if (!editable) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const data = await api<{ workbench?: Row }>('/api/ai/training-runs', {
        method: 'POST',
        body: trainingForm
      });
      applyAiWorkbench(data.workbench || {});
      setTrainingForm(emptyAiTrainingForm());
      setSuccess('Ciclo de treinamento cadastrado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar treinamento IA.');
    } finally {
      setBusy(false);
    }
  }

  async function updateTrainingStatus(row: Row, status: string) {
    if (!editable) return;
    const id = String(row.id || '');
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<{ workbench?: Row }>(`/api/ai/training-runs/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: { status }
      });
      applyAiWorkbench(data.workbench || {});
      setSuccess('Status do treinamento atualizado.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar treinamento IA.');
    } finally {
      setBusy(false);
    }
  }

  const metrics = asRow(workbench?.metrics);
  const insights = asRow(workbench?.insights);

  return (
    <ModuleFrame title="Inteligencia Artificial" subtitle="Base de conhecimento, treinamento e apoio generativo a decisao." error={error}>
      {success && <p className="success-message">{success}</p>}

      <div className="module-metrics compact ai-metrics">
        <Metric label="Bases ativas" value={`${formatInteger(metrics.activeSources)} / ${formatInteger(metrics.knowledgeSources)}`} />
        <Metric label="Treinamentos validados" value={`${formatInteger(metrics.validatedRuns)} / ${formatInteger(metrics.trainingRuns)}`} />
        <Metric label="Analises salvas" value={formatInteger(metrics.analyses)} />
        <Metric label="LLM configurada" value={workbench?.llmConfigured ? 'Sim' : 'Preparado'} />
      </div>

      <section className="module-panel ai-command-panel">
        <div className="panel-title">
          <div>
            <h3>Bancada de decisao</h3>
            <span>Gere analises usando pedidos, PCP, produtos, faturamento, qualidade e bases internas.</span>
          </div>
          <div className="panel-actions">
            <button className="btn" type="button" onClick={load}><IconText name="refresh">Atualizar</IconText></button>
          </div>
        </div>

        <form className="ai-prompt-grid" onSubmit={generateAnalysis}>
          <label className="field ai-prompt-field">
            <span>Pergunta / objetivo</span>
            <textarea className="input" rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ex.: Quais pedidos devo priorizar esta semana?" />
          </label>
          <label className="field">
            <span>Contexto</span>
            <select className="input" value={contextScope} onChange={(event) => setContextScope(event.target.value)}>
              {aiContextOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
            </select>
          </label>
          <div className="ai-prompt-actions">
            <button className="btn primary" type="submit" disabled={busy}><IconText name="status">{busy ? 'Analisando' : 'Gerar analise'}</IconText></button>
          </div>
        </form>

        <div className="ai-decision-grid">
          <article className="ai-response-card">
            <div className="panel-title">
              <h3>Resposta da IA</h3>
              <span>{analysis?.generatedAt ? formatDateTime(analysis.generatedAt) : 'Aguardando execucao'}</span>
            </div>
            <pre>{String((analysis || selectedHistory)?.response || 'Digite uma pergunta e clique em Gerar analise para obter uma recomendacao operacional.')}</pre>
          </article>
          <aside className="ai-context-card">
            <h3>Contexto usado</h3>
            <DataTable rows={aiContextRows(analysis, insights)} columns={[
              { key: 'label', label: 'Indicador' },
              { key: 'value', label: 'Valor' }
            ]} />
          </aside>
        </div>
      </section>

      <section className="ai-workbench-grid">
        <article className="module-panel ai-form-panel">
          <div className="panel-title">
            <h3>Base de conhecimento</h3>
            <span>Procedimentos, decisoes e regras para treinar a IA.</span>
          </div>
          {editable ? (
            <form className="ai-form-grid" onSubmit={submitSource}>
              <label className="field">
                <span>Titulo</span>
                <input className="input" value={sourceForm.title} onChange={(event) => setSourceForm((form) => ({ ...form, title: event.target.value }))} required />
              </label>
              <label className="field">
                <span>Tipo</span>
                <select className="input" value={sourceForm.sourceType} onChange={(event) => setSourceForm((form) => ({ ...form, sourceType: event.target.value }))}>
                  {aiSourceTypeOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Escopo</span>
                <select className="input" value={sourceForm.scope} onChange={(event) => setSourceForm((form) => ({ ...form, scope: event.target.value }))}>
                  {aiContextOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Tags</span>
                <input className="input" value={sourceForm.tags} onChange={(event) => setSourceForm((form) => ({ ...form, tags: event.target.value }))} placeholder="prazo; risco; producao" />
              </label>
              <label className="field ai-span-2">
                <span>Conteudo</span>
                <textarea className="input" rows={7} value={sourceForm.content} onChange={(event) => setSourceForm((form) => ({ ...form, content: event.target.value }))} required />
              </label>
              <div className="ai-form-actions">
                <button className="btn primary" type="submit" disabled={busy}><IconText name="plus">Incluir base</IconText></button>
              </div>
            </form>
          ) : <p className="muted-text">Seu perfil pode consultar a IA, mas nao pode alterar bases de conhecimento.</p>}
        </article>

        <article className="module-panel ai-form-panel">
          <div className="panel-title">
            <h3>Treinamento LLM</h3>
            <span>Planejamento dos datasets e validacoes antes de plugar uma LLM externa.</span>
          </div>
          {editable ? (
            <form className="ai-form-grid" onSubmit={submitTraining}>
              <label className="field ai-span-2">
                <span>Objetivo</span>
                <input className="input" value={trainingForm.objective} onChange={(event) => setTrainingForm((form) => ({ ...form, objective: event.target.value }))} required />
              </label>
              <label className="field">
                <span>Dataset</span>
                <select className="input" value={trainingForm.datasetScope} onChange={(event) => setTrainingForm((form) => ({ ...form, datasetScope: event.target.value }))}>
                  {aiContextOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Modelo alvo</span>
                <input className="input" value={trainingForm.modelTarget} onChange={(event) => setTrainingForm((form) => ({ ...form, modelTarget: event.target.value }))} />
              </label>
              <label className="field ai-span-2">
                <span>Notas</span>
                <textarea className="input" rows={4} value={trainingForm.notes} onChange={(event) => setTrainingForm((form) => ({ ...form, notes: event.target.value }))} />
              </label>
              <div className="ai-form-actions">
                <button className="btn primary" type="submit" disabled={busy}><IconText name="save">Cadastrar ciclo</IconText></button>
              </div>
            </form>
          ) : <p className="muted-text">Seu perfil nao pode cadastrar ciclos de treinamento.</p>}
        </article>
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Bases cadastradas</h3>
          <span>{knowledgeSources.length} registro(s)</span>
        </div>
        <DataTable
          rows={knowledgeSources}
          columns={[
            { key: 'title', label: 'Titulo' },
            { key: 'sourceType', label: 'Tipo', format: aiSourceTypeLabel },
            { key: 'scope', label: 'Escopo', format: aiContextLabel },
            { key: 'status', label: 'Status', format: aiSourceStatusLabel },
            { key: 'tags', label: 'Tags' },
            { key: 'updatedAt', label: 'Atualizado', format: formatDateTime }
          ]}
          onRowClick={(row) => setSelectedSource(row)}
          rowClass={(row) => String(row.status || '') !== 'active' ? 'row-muted' : ''}
          actions={editable ? (row) => (
            <div className="table-actions">
              <button className="btn" type="button" onClick={() => toggleSource(row)}><IconText name="status">{String(row.status || '') === 'active' ? 'Inativar' : 'Ativar'}</IconText></button>
              <button className="btn" type="button" onClick={() => deleteSource(row)}><IconText name="trash">Excluir</IconText></button>
            </div>
          ) : undefined}
        />
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Ciclos de treinamento</h3>
          <span>{trainingRuns.length} ciclo(s)</span>
        </div>
        <DataTable
          rows={trainingRuns}
          columns={[
            { key: 'objective', label: 'Objetivo' },
            { key: 'datasetScope', label: 'Dataset', format: aiContextLabel },
            { key: 'modelTarget', label: 'Modelo' },
            { key: 'status', label: 'Status', format: aiTrainingStatusLabel },
            { key: 'updatedAt', label: 'Atualizado', format: formatDateTime }
          ]}
          actions={editable ? (row) => (
            <div className="table-actions">
              <button className="btn" type="button" onClick={() => updateTrainingStatus(row, 'running')}><IconText name="status">Rodando</IconText></button>
              <button className="btn" type="button" onClick={() => updateTrainingStatus(row, 'validated')}><IconText name="check">Validado</IconText></button>
              <button className="btn" type="button" onClick={() => updateTrainingStatus(row, 'archived')}><IconText name="close">Arquivar</IconText></button>
            </div>
          ) : undefined}
        />
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Historico de analises</h3>
          <span>{history.length} registro(s)</span>
        </div>
        <DataTable
          rows={history}
          columns={[
            { key: 'createdAt', label: 'Data', format: formatDateTime },
            { key: 'contextScope', label: 'Contexto', format: aiContextLabel },
            { key: 'prompt', label: 'Pergunta' },
            { key: 'confidence', label: 'Confianca', format: aiConfidenceLabel },
            { key: 'createdBy', label: 'Usuario' }
          ]}
          onRowClick={(row) => {
            setSelectedHistory(row);
            setAnalysis(null);
          }}
        />
      </section>

      {selectedSource && (
        <section className="module-panel ai-detail-panel">
          <div className="panel-title">
            <div>
              <h3>{String(selectedSource.title || 'Base de conhecimento')}</h3>
              <span>{aiContextLabel(selectedSource.scope)} | {aiSourceTypeLabel(selectedSource.sourceType)}</span>
            </div>
            <button className="btn" type="button" onClick={() => setSelectedSource(null)}><IconText name="close">Fechar</IconText></button>
          </div>
          <pre>{String(selectedSource.content || '')}</pre>
        </section>
      )}
    </ModuleFrame>
  );
}

export function ProductsScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [products, setProducts] = useState<Row[]>([]);
  const [forecasts, setForecasts] = useState<Row[]>([]);
  const [tableState, setTableState] = useState<ProductTableState>(() => loadProductTableState(user.id));
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    api<{ products?: Row[]; forecasts?: Row[] }>('/api/product-stats')
      .then((data) => {
        if (ignore) return;
        setProducts(data.products || []);
        setForecasts(data.forecasts || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('productTableState', loadProductTableState(user.id), normalizeProductTableState)
      .then((value) => {
        if (!ignore) setTableState(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistProductTableState(user.id, tableState);
  }, [preferencesReady, tableState, user.id]);

  const filteredForecasts = useMemo(() => {
    const query = normalizeText(tableState.search);
    return sortProductRows(
      forecasts
        .filter((forecast) => !query || forecastSearchText(forecast).includes(query))
        .filter((forecast) => filterProductColumns(forecast, tableState.forecastFilters, productForecastColumns()))
        .filter((forecast) => forecastMatchesRiskFilter(forecast, tableState.riskFilter)),
      tableState.sortField,
      tableState.sortDirection
    );
  }, [forecasts, tableState]);
  const filteredProducts = useMemo(() => {
    const query = normalizeText(tableState.search);
    return sortProductRows(
      products
        .filter((product) => !query || productSearchText(product).includes(query))
        .filter((product) => filterProductColumns(product, tableState.productFilters, productStatsColumns())),
      tableState.sortField,
      tableState.sortDirection
    );
  }, [products, tableState]);
  const cards = useMemo(() => productSopCards(filteredForecasts, filteredProducts), [filteredForecasts, filteredProducts]);
  const insights = useMemo(() => productSopInsights(filteredForecasts), [filteredForecasts]);
  const charts = useMemo(() => productCharts(filteredForecasts, filteredProducts), [filteredForecasts, filteredProducts]);

  function updateState(patch: Partial<ProductTableState>) {
    setTableState((current) => ({ ...current, ...patch }));
  }

  function updateForecastFilter(key: string, value: string) {
    setTableState((current) => ({ ...current, forecastFilters: { ...current.forecastFilters, [key]: value } }));
  }

  function updateProductFilter(key: string, value: string) {
    setTableState((current) => ({ ...current, productFilters: { ...current.productFilters, [key]: value } }));
  }

  function clearProductFilters() {
    setTableState(emptyProductTableState());
  }

  return (
    <ModuleFrame title="Produtos" subtitle="Historico, filtros, previsao S&OP e analise estatistica por linha/capacidade." error={error}>
      <div className="module-toolbar products-toolbar">
        <ToolbarSearch value={tableState.search} onChange={(value) => updateState({ search: value })} placeholder="Filtrar por SKU, linha, equipamento, capacidade ou risco" />
        <label className="field">
          <span>Ordenar por</span>
          <select className="input mini-input" value={tableState.sortField} onChange={(event) => updateState({ sortField: event.target.value })}>
            {productSortOptions().map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Direcao</span>
          <select className="input mini-input" value={tableState.sortDirection} onChange={(event) => updateState({ sortDirection: event.target.value === 'asc' ? 'asc' : 'desc' })}>
            <option value="desc">Maior primeiro</option>
            <option value="asc">Menor primeiro</option>
          </select>
        </label>
        <label className="field">
          <span>Risco</span>
          <select className="input mini-input" value={tableState.riskFilter} onChange={(event) => updateState({ riskFilter: event.target.value })}>
            <option value="">Todos</option>
            <option value="late">Com atraso previsto</option>
            <option value="ok">Dentro do prazo</option>
            <option value="low-confidence">Baixa confianca</option>
          </select>
        </label>
        <button className="btn" type="button" onClick={clearProductFilters}>Limpar filtros</button>
        <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}><IconText name="refresh">Atualizar</IconText></button>
      </div>

      <div className="module-metrics">
        {cards.map((card) => <Metric key={card.label} label={card.label} value={card.value} />)}
      </div>

      <section className="dashboard-chart-grid products-chart-grid">
        {charts.map((chart) => (
          <article className="module-panel chart-panel" key={chart.key}>
            <PlotlyChart {...chart} />
          </article>
        ))}
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Analise S&OP profissional</h3>
          <span>{filteredForecasts.length} grupo(s) analisado(s)</span>
        </div>
        <div className="insight-list">
          {insights.map((item, index) => <p key={index}>{item}</p>)}
        </div>
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Previsao de demanda por linha e capacidade</h3>
          <span>{filteredForecasts.length === forecasts.length ? `${forecasts.length} linhas` : `${filteredForecasts.length} de ${forecasts.length} linhas`}</span>
        </div>
        <ProductDataTable
          rows={filteredForecasts}
          columns={productForecastColumns()}
          filters={tableState.forecastFilters}
          sortField={tableState.sortField}
          sortDirection={tableState.sortDirection}
          onSort={(field) => updateState({
            sortField: field,
            sortDirection: tableState.sortField === field && tableState.sortDirection === 'desc' ? 'asc' : 'desc'
          })}
          onFilter={updateForecastFilter}
          rowClass={(row) => Number(row.predictedLateOrders) > 0 ? 'row-warning' : ''}
        />
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Historico por codigo do produto</h3>
          <span>{filteredProducts.length === products.length ? `${products.length} produtos` : `${filteredProducts.length} de ${products.length} produtos`}</span>
        </div>
        <ProductDataTable
          rows={filteredProducts}
          columns={productStatsColumns()}
          filters={tableState.productFilters}
          sortField={tableState.sortField}
          sortDirection={tableState.sortDirection}
          onSort={(field) => updateState({
            sortField: field,
            sortDirection: tableState.sortField === field && tableState.sortDirection === 'desc' ? 'asc' : 'desc'
          })}
          onFilter={updateProductFilter}
        />
      </section>
    </ModuleFrame>
  );
}

function ProductDataTable({
  rows,
  columns,
  filters,
  sortField,
  sortDirection,
  onSort,
  onFilter,
  rowClass
}: {
  rows: Row[];
  columns: Column[];
  filters: Record<string, string>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onFilter: (field: string, value: string) => void;
  rowClass?: (row: Row) => string;
}) {
  return (
    <div className="generic-table-wrap product-table-wrap">
      <table className="generic-table product-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button
                  className={`table-sort-button ${sortField === column.key ? 'active' : ''}`}
                  data-direction={sortField === column.key ? sortDirection : ''}
                  type="button"
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                </button>
              </th>
            ))}
          </tr>
          <tr className="table-filter-row">
            {columns.map((column) => (
              <th key={`${column.key}-filter`}>
                <input
                  className="input table-filter-input"
                  value={filters[column.key] || ''}
                  onChange={(event) => onFilter(column.key, event.target.value)}
                  placeholder="Filtrar"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id || row.code || `${row.productLine}-${row.capacityLabel}-${index}`)} className={rowClass ? rowClass(row) : ''}>
              {columns.map((column) => <td key={column.key} title={cellValue(row, column)}>{cellValue(row, column)}</td>)}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={columns.length}>Nenhum registro encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ReportsScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [activities, setActivities] = useState<Row[]>([]);
  const [tableState, setTableState] = useState<ActivityTableState>(() => loadActivityTableState(user.id));
  const [detail, setDetail] = useState<Row | null>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const debouncedTableState = useDebouncedValue(tableState, 260);

  useEffect(() => {
    if (!preferencesReady) return;
    let ignore = false;
    const params = buildActivityLogParams(debouncedTableState, page);
    setLoading(true);
    setError('');
    api<ActivityLogPage>(`/api/activity-log?${params.toString()}`)
      .then((data) => {
        if (ignore) return;
        const nextTotalPages = Math.max(1, Number(data.totalPages) || 1);
        setActivities(data.activities || []);
        setTotal(Number(data.total) || 0);
        setTotalPages(nextTotalPages);
        if (page > nextTotalPages) {
          setPage(nextTotalPages);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [debouncedTableState, page, preferencesReady, refresh, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('reportTableState', loadActivityTableState(user.id), normalizeActivityTableState)
      .then((value) => {
        if (!ignore) setTableState(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistActivityTableState(user.id, tableState);
  }, [preferencesReady, tableState, user.id]);

  useEffect(() => {
    setDetail((current) => current ? activities.find((activity) => String(activity.id || '') === String(current.id || '')) || current : null);
  }, [activities]);

  function updateState(patch: Partial<ActivityTableState>) {
    setPage(1);
    setTableState((current) => ({ ...current, ...patch }));
  }

  function updateFilter(field: string, value: string) {
    setPage(1);
    setTableState((current) => ({
      ...current,
      filters: { ...current.filters, [field]: value }
    }));
  }

  function clearFilters() {
    setPage(1);
    setTableState((current) => ({
      ...emptyActivityTableState(),
      sortField: current.sortField,
      sortDirection: current.sortDirection,
      pageSize: current.pageSize
    }));
  }

  const metrics = useMemo(() => activityMetrics(activities, activities), [activities]);
  const columns = activityColumns();

  return (
    <ModuleFrame title="Relatorios de atividades" subtitle="Historico completo das acoes executadas no sistema." error={error}>
      <div className="module-metrics compact">
        <Metric label="Eventos filtrados" value={total} />
        <Metric label="Na pagina" value={activities.length} />
        <Metric label="Pagina" value={`${formatInteger(page)} / ${formatInteger(totalPages)}`} />
        <Metric label="Usuarios na pagina" value={metrics.actors} />
        <Metric label="Fluxo/status na pagina" value={metrics.flow} />
      </div>
      <div className="module-toolbar reports-toolbar">
        <ToolbarSearch value={tableState.search} onChange={(search) => updateState({ search })} placeholder="Filtrar usuario, acao, pedido ou detalhe" />
        <label className="field mini-input">
          <span>De</span>
          <input className="input" type="date" value={tableState.dateFrom} onChange={(event) => updateState({ dateFrom: event.target.value })} />
        </label>
        <label className="field mini-input">
          <span>Ate</span>
          <input className="input" type="date" value={tableState.dateTo} onChange={(event) => updateState({ dateTo: event.target.value })} />
        </label>
        <label className="field mini-input">
          <span>Grupo</span>
          <select className="input" value={tableState.actionGroup} onChange={(event) => updateState({ actionGroup: event.target.value })}>
            <option value="">Todos</option>
            <option value="flow">Fluxo/status/faturamento</option>
            <option value="success">Criacao/cadastro</option>
            <option value="system">Sistema/backups/login</option>
            <option value="danger">Exclusao/restauracao</option>
            <option value="default">Outros</option>
          </select>
        </label>
        <label className="field mini-input">
          <span>Linhas</span>
          <select className="input" value={tableState.pageSize} onChange={(event) => updateState({ pageSize: Number(event.target.value) || 50 })}>
            {[25, 50, 100, 200].map((size) => (
              <option value={size} key={size}>{size}</option>
            ))}
          </select>
        </label>
        <button className="btn" type="button" onClick={clearFilters}>Limpar filtros</button>
        <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}>Atualizar</button>
        <button className="btn primary" type="button" onClick={() => exportActivityCsv(activities)}>Exportar pagina</button>
      </div>

      <section className="module-panel reports-panel">
        <div className="panel-title">
          <h3>Auditoria das atividades</h3>
          <span>{loading ? 'Atualizando...' : `${formatInteger(activities.length)} de ${formatInteger(total)} registros`}</span>
        </div>
        <ActivityDataTable
          rows={activities}
          columns={columns}
          filters={tableState.filters}
          sortField={tableState.sortField}
          sortDirection={tableState.sortDirection}
          onSort={(field) => updateState({
            sortField: field,
            sortDirection: tableState.sortField === field && tableState.sortDirection === 'desc' ? 'asc' : 'desc'
          })}
          onFilter={updateFilter}
          onOpen={setDetail}
        />
        <div className="orders-pagination">
          <button className="btn" type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Anterior
          </button>
          <span>Pagina {formatInteger(page)} de {formatInteger(totalPages)}</span>
          <button className="btn" type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            Proxima
          </button>
        </div>
      </section>

      {detail && (
        <section className="module-panel activity-detail-panel">
          <div className="panel-title">
            <h3>Detalhe da atividade</h3>
            <button className="btn" type="button" onClick={() => setDetail(null)}>Fechar</button>
          </div>
          <div className="order-summary-grid">
            <SummaryItem label="Data/hora" value={formatDateTime(detail.createdAt)} />
            <SummaryItem label="Usuario" value={detail.actor} />
            <SummaryItem label="Acao" value={detail.action} />
            <SummaryItem label="Grupo" value={activityActionGroupLabel(activityActionClass(detail.action))} />
            <SummaryItem label="Tipo" value={detail.entityType} />
            <SummaryItem label="Registro" value={detail.entityLabel} />
          </div>
          <article className="order-summary-notes">
            <span>Detalhes</span>
            <p>{String(detail.details || '-')}</p>
          </article>
        </section>
      )}
    </ModuleFrame>
  );
}

function ActivityDataTable({
  rows,
  columns,
  filters,
  sortField,
  sortDirection,
  onSort,
  onFilter,
  onOpen
}: {
  rows: Row[];
  columns: Column[];
  filters: Record<string, string>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onFilter: (field: string, value: string) => void;
  onOpen: (row: Row) => void;
}) {
  return (
    <div className="generic-table-wrap activity-table-wrap">
      <table className="generic-table activity-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button
                  className={`table-sort-button ${sortField === column.key ? 'active' : ''}`}
                  data-direction={sortField === column.key ? sortDirection : ''}
                  type="button"
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                </button>
              </th>
            ))}
          </tr>
          <tr className="table-filter-row">
            {columns.map((column) => (
              <th key={`${column.key}-filter`}>
                <input
                  className="input table-filter-input"
                  value={filters[column.key] || ''}
                  onChange={(event) => onFilter(column.key, event.target.value)}
                  placeholder="Filtrar"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id || `${row.createdAt || 'activity'}-${index}`)} onClick={() => onOpen(row)}>
              {columns.map((column) => (
                <td key={column.key} title={cellValue(row, column)}>
                  {column.key === 'action'
                    ? <span className={`activity-pill-react ${activityActionClass(row.action)}`}>{cellValue(row, column)}</span>
                    : cellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={columns.length}>Nenhuma atividade encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PcpScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [issues, setIssues] = useState<Row[]>([]);
  const [orders, setOrders] = useState<Row[]>([]);
  const [motives, setMotives] = useState<Row[]>([]);
  const [tableState, setTableState] = useState<PcpTableState>(() => loadPcpTableState(user.id));
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PcpFormState>(() => emptyPcpForm());
  const [editingIssue, setEditingIssue] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (tableState.status) params.set('status', tableState.status);
    if (tableState.search) params.set('search', tableState.search);
    api<{ issues?: Row[] }>(`/api/pcp-pendencies?${params.toString()}`)
      .then((data) => {
        if (!ignore) setIssues(data.issues || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [tableState.search, tableState.status, refresh, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ orders?: Row[] }>('/api/orders?scope=active&sort=orderNumber&direction=asc&page=1&pageSize=1000').catch((): { orders?: Row[] } => ({ orders: [] })),
      api<{ motives?: Row[] }>('/api/pcp-pending-motives').catch((): { motives?: Row[] } => ({ motives: [] }))
    ]).then(([ordersData, motivesData]) => {
      if (ignore) return;
      setOrders(ordersData.orders || []);
      setMotives(motivesData.motives || []);
    }).catch((err) => {
      if (!ignore) setError(err.message);
    });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('pcpTableState', loadPcpTableState(user.id), normalizePcpTableState)
      .then((value) => {
        if (!ignore) setTableState(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistPcpTableState(user.id, tableState);
  }, [preferencesReady, tableState, user.id]);

  useEffect(() => {
    if (editingIssue) return;
    const validMotive = motives.some((motive) => String(motive.reason || '') === form.reason && String(motive.name || '') === form.motive);
    if (!validMotive && form.motive) {
      setForm((current) => ({ ...current, motive: '' }));
    }
  }, [editingIssue, form.reason, form.motive, motives]);

  const canEditPcp = canEdit(user, 'pcp');
  const visibleIssues = useMemo(() => sortPcpIssues(filterPcpIssues(issues, tableState.columnFilters), tableState.sortField, tableState.sortDirection), [issues, tableState]);
  const openCount = issues.filter((issue) => String(issue.issueStatus) !== 'resolved').length;
  const overdueCount = issues.filter(isPcpIssueOverdue).length;
  const purchaseCount = issues.filter((issue) => String(issue.reason) === 'purchase' && String(issue.issueStatus) !== 'resolved').length;
  const reasonMotives = motives.filter((motive) => String(motive.reason || '') === form.reason);

  function updateTableState(patch: Partial<PcpTableState>) {
    setTableState((current) => ({ ...current, ...patch }));
  }

  function updateColumnFilter(key: string, value: string) {
    setTableState((current) => ({
      ...current,
      columnFilters: { ...current.columnFilters, [key]: value }
    }));
  }

  function setSort(field: string) {
    setTableState((current) => ({
      ...current,
      sortField: field,
      sortDirection: current.sortField === field && current.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }

  function clearFilters() {
    setTableState(emptyPcpTableState());
  }

  async function resolveIssue(row: Row) {
    if (!canEditPcp) return;
    await runAction(setError, async () => {
      await api(`/api/pcp-pendencies/${encodeURIComponent(String(row.id))}/resolve`, { method: 'PATCH' });
      setRefresh((value) => value + 1);
    });
  }

  async function deleteIssue(row: Row) {
    if (!canEditPcp) return;
    if (!window.confirm('Excluir esta pendencia PCP?')) return;
    await runAction(setError, async () => {
      await api(`/api/pcp-pendencies/${encodeURIComponent(String(row.id))}`, { method: 'DELETE' });
      setRefresh((value) => value + 1);
    });
  }

  async function updateIssue(row: Row, payload: { expectedResolutionDate?: string; purchaseOrderNumber?: string }) {
    if (!canEditPcp) return;
    await runAction(setError, async () => {
      await api(`/api/pcp-pendencies/${encodeURIComponent(String(row.id))}`, { method: 'PATCH', body: payload });
      setRefresh((value) => value + 1);
    });
  }

  function openEditIssue(row: Row) {
    if (!canEditPcp) return;
    setEditingIssue(row);
    setForm(pcpFormFromIssue(row));
    setFormOpen(true);
  }

  async function addMotive() {
    if (!canEditPcp) return;
    const name = window.prompt('Informe o motivo da pendencia:', '');
    if (name === null) return;
    const cleanName = name.trim();
    if (!cleanName) return;
    await runAction(setError, async () => {
      const { motive } = await api<{ motive?: Row }>('/api/pcp-pending-motives', {
        method: 'POST',
        body: { reason: form.reason, name: cleanName }
      });
      const created = motive || { reason: form.reason, name: cleanName };
      setMotives((rows) => [...rows.filter((row) => !(String(row.reason) === String(created.reason) && String(row.name) === String(created.name))), created]);
      setForm((current) => ({ ...current, motive: String(created.name || cleanName) }));
    });
  }

  async function submitIssue() {
    if (!canEditPcp) return;
    setBusy(true);
    await runAction(setError, async () => {
      if (editingIssue?.id) {
        await api(`/api/pcp-pendencies/${encodeURIComponent(String(editingIssue.id))}`, { method: 'PATCH', body: form });
      } else {
        await api('/api/pcp-pendencies', { method: 'POST', body: form });
      }
      setForm(emptyPcpForm());
      setEditingIssue(null);
      setFormOpen(false);
      setRefresh((value) => value + 1);
    });
    setBusy(false);
  }

  return (
    <ModuleFrame title="Pendencias PCP" subtitle="Pendencias por pedido, componente, tipo, motivo, compra e data prevista." error={error}>
      <div className="module-metrics">
        <Metric label="Pendencias abertas" value={openCount} />
        <Metric label="Em atraso" value={overdueCount} />
        <Metric label="Compras abertas" value={purchaseCount} />
        <Metric label="Motivos cadastrados" value={motives.length} />
      </div>

      <div className="module-toolbar pcp-toolbar">
        <ToolbarSearch value={tableState.search} onChange={(value) => updateTableState({ search: value })} placeholder="Filtrar pedido, cliente, componente, motivo ou PC" />
        <label className="field">
          <span>Situacao</span>
          <select className="input mini-input" value={tableState.status} onChange={(event) => updateTableState({ status: event.target.value })}>
            <option value="open">Abertas</option>
            <option value="resolved">Resolvidas</option>
            <option value="">Todas</option>
          </select>
        </label>
        <label className="field">
          <span>Ordenar por</span>
          <select className="input mini-input" value={tableState.sortField} onChange={(event) => updateTableState({ sortField: event.target.value })}>
            {pcpColumns().map((column) => <option key={column.key} value={column.key}>{column.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Direcao</span>
          <select className="input mini-input" value={tableState.sortDirection} onChange={(event) => updateTableState({ sortDirection: event.target.value === 'desc' ? 'desc' : 'asc' })}>
            <option value="asc">A-Z / menor</option>
            <option value="desc">Z-A / maior</option>
          </select>
        </label>
        <button className="btn" type="button" onClick={clearFilters}><IconText name="filter">Limpar filtros</IconText></button>
        <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}><IconText name="refresh">Atualizar</IconText></button>
        {canEditPcp && <button className="btn primary" type="button" onClick={() => {
          setEditingIssue(null);
          setForm(emptyPcpForm());
          setFormOpen(true);
        }}><IconText name="plus">Inserir nova pendencia</IconText></button>}
      </div>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Lista de pendencias</h3>
          <span>{visibleIssues.length === issues.length ? `${issues.length} registros` : `${visibleIssues.length} de ${issues.length} registros`}</span>
        </div>
        <PcpIssueTable
          rows={visibleIssues}
          canEdit={canEditPcp}
          filters={tableState.columnFilters}
          sortField={tableState.sortField}
          sortDirection={tableState.sortDirection}
          onSort={setSort}
          onFilter={updateColumnFilter}
          onResolve={resolveIssue}
          onDelete={deleteIssue}
          onUpdate={updateIssue}
          onEdit={openEditIssue}
        />
      </section>

      {formOpen && (
        <PcpIssueDialog
          form={form}
          orders={orders}
          motives={reasonMotives}
          busy={busy}
          editing={Boolean(editingIssue)}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onAddMotive={addMotive}
          onSubmit={submitIssue}
          onClose={() => {
            setFormOpen(false);
            setForm(emptyPcpForm());
            setEditingIssue(null);
          }}
        />
      )}
    </ModuleFrame>
  );
}

function PcpIssueDialog({
  form,
  orders,
  motives,
  busy,
  editing,
  onChange,
  onAddMotive,
  onSubmit,
  onClose
}: {
  form: PcpFormState;
  orders: Row[];
  motives: Row[];
  busy: boolean;
  editing: boolean;
  onChange: (patch: Partial<PcpFormState>) => void;
  onAddMotive: () => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const selectedOrder = orders.find((order) => String(order.id) === form.orderId);

  return (
    <div className="dialog-backdrop open">
      <section className="dialog pcp-dialog" role="dialog" aria-modal="true" aria-labelledby="pcpDialogTitle">
        <div className="dialog-header">
          <div>
            <h2 id="pcpDialogTitle">{editing ? 'Editar pendencia PCP' : 'Inserir pendencia PCP'}</h2>
            <p>{selectedOrder ? pcpOrderOptionLabel(selectedOrder) : 'Selecione o pedido e informe a pendencia.'}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">x</button>
        </div>

        <div className="dialog-body">
          <div className="pcp-form-grid">
            <label className="field full">
              <span>Pedido de venda</span>
              <select className="input" value={form.orderId} disabled={busy} onChange={(event) => onChange({ orderId: event.target.value })}>
                <option value="">Selecione o pedido</option>
                {orders.map((order) => <option key={String(order.id)} value={String(order.id)}>{pcpOrderOptionLabel(order)}</option>)}
              </select>
            </label>

            <label className="field">
              <span>Codigo do componente</span>
              <input className="input" value={form.componentCode} disabled={busy} onChange={(event) => onChange({ componentCode: event.target.value.toUpperCase() })} />
            </label>

            <label className="field">
              <span>Tipo de pendencia</span>
              <select
                className="input"
                value={form.reason}
                disabled={busy}
                onChange={(event) => onChange({ reason: event.target.value, motive: '', purchaseOrderNumber: event.target.value === 'purchase' ? form.purchaseOrderNumber : '' })}
              >
                <option value="purchase">Compras</option>
                <option value="engineering">Engenharia</option>
                <option value="rework">Retrabalho</option>
              </select>
            </label>

            <label className="field motive-field">
              <span>Motivo</span>
              <span className="input-with-button">
                <select className="input" value={form.motive} disabled={busy} onChange={(event) => onChange({ motive: event.target.value })}>
                  <option value="">Selecione um motivo</option>
                  {form.motive && !motives.some((motive) => String(motive.name || '') === form.motive) && <option value={form.motive}>{form.motive}</option>}
                  {motives.map((motive) => <option key={String(motive.id || motive.name)} value={String(motive.name)}>{String(motive.name)}</option>)}
                </select>
                <button className="btn" type="button" disabled={busy} onClick={onAddMotive}><IconText name="plus">Motivo</IconText></button>
              </span>
            </label>

            {form.reason === 'purchase' && (
              <label className="field">
                <span>Pedido de compra</span>
                <input className="input" value={form.purchaseOrderNumber} disabled={busy} onChange={(event) => onChange({ purchaseOrderNumber: event.target.value.toUpperCase() })} />
              </label>
            )}

            <label className="field">
              <span>Data prevista</span>
              <input className="input" type="date" value={form.expectedResolutionDate} disabled={busy} onChange={(event) => onChange({ expectedResolutionDate: event.target.value })} />
            </label>

            <label className="field full">
              <span>Observacoes</span>
              <textarea className="input" rows={3} value={form.notes} disabled={busy} onChange={(event) => onChange({ notes: event.target.value })} />
            </label>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Cancelar</IconText></button>
          <button className="btn primary" type="button" disabled={busy} onClick={onSubmit}><IconText name="save">{editing ? 'Salvar edicao' : 'Salvar pendencia'}</IconText></button>
        </div>
      </section>
    </div>
  );
}

function PcpIssueTable({
  rows,
  canEdit,
  filters,
  sortField,
  sortDirection,
  onSort,
  onFilter,
  onResolve,
  onDelete,
  onUpdate,
  onEdit
}: {
  rows: Row[];
  canEdit: boolean;
  filters: Record<string, string>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onFilter: (field: string, value: string) => void;
  onResolve: (row: Row) => void;
  onDelete: (row: Row) => void;
  onUpdate: (row: Row, payload: { expectedResolutionDate?: string; purchaseOrderNumber?: string }) => void;
  onEdit: (row: Row) => void;
}) {
  const columns = pcpColumns();

  return (
    <div className="generic-table-wrap pcp-table-wrap">
      <table className="generic-table pcp-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button
                  className={`table-sort-button ${sortField === column.key ? 'active' : ''}`}
                  data-direction={sortField === column.key ? sortDirection : ''}
                  type="button"
                  onClick={() => onSort(column.key)}
                >
                  {column.label}
                </button>
              </th>
            ))}
            {canEdit && <th>Acoes</th>}
          </tr>
          <tr className="table-filter-row">
            {columns.map((column) => (
              <th key={`${column.key}-filter`}>
                {column.key === 'reason' ? (
                  <select className="input table-filter-input" value={filters[column.key] || ''} onChange={(event) => onFilter(column.key, event.target.value)}>
                    <option value="">Todos</option>
                    <option value="purchase">Compras</option>
                    <option value="engineering">Engenharia</option>
                    <option value="rework">Retrabalho</option>
                  </select>
                ) : column.key === 'issueStatus' ? (
                  <select className="input table-filter-input" value={filters[column.key] || ''} onChange={(event) => onFilter(column.key, event.target.value)}>
                    <option value="">Todos</option>
                    <option value="open">Aberta</option>
                    <option value="resolved">Resolvida</option>
                  </select>
                ) : (
                  <input className="input table-filter-input" value={filters[column.key] || ''} onChange={(event) => onFilter(column.key, event.target.value)} placeholder="Filtrar" />
                )}
              </th>
            ))}
            {canEdit && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PcpIssueRow key={String(row.id)} row={row} canEdit={canEdit} onResolve={onResolve} onDelete={onDelete} onUpdate={onUpdate} onEdit={onEdit} />
          ))}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={columns.length + (canEdit ? 1 : 0)}>Nenhuma pendencia encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PcpIssueRow({
  row,
  canEdit,
  onResolve,
  onDelete,
  onUpdate,
  onEdit
}: {
  row: Row;
  canEdit: boolean;
  onResolve: (row: Row) => void;
  onDelete: (row: Row) => void;
  onUpdate: (row: Row, payload: { expectedResolutionDate?: string; purchaseOrderNumber?: string }) => void;
  onEdit: (row: Row) => void;
}) {
  const [expectedDate, setExpectedDate] = useState(String(row.expectedResolutionDate || ''));
  const [purchaseOrder, setPurchaseOrder] = useState(String(row.purchaseOrderNumber || ''));
  const resolved = String(row.issueStatus) === 'resolved';

  useEffect(() => {
    setExpectedDate(String(row.expectedResolutionDate || ''));
    setPurchaseOrder(String(row.purchaseOrderNumber || ''));
  }, [row]);

  return (
    <tr className={isPcpIssueOverdue(row) ? 'row-danger' : resolved ? 'row-muted' : ''}>
      <td data-label="Pedido">{formatLoose(row.orderNumber)}</td>
      <td data-label="Cliente">{formatLoose(row.customer)}</td>
      <td data-label="SKU">{formatLoose(row.sku)}</td>
      <td data-label="OP">{formatLoose(row.productionOrder)}</td>
      <td data-label="Status pedido">{formatLoose(row.orderStatus)}</td>
      <td data-label="Componente">{formatLoose(row.componentCode)}</td>
      <td data-label="Tipo">{formatLoose(row.reasonLabel)}</td>
      <td data-label="Motivo" title={String(row.motive || '')}>{formatLoose(row.motive)}</td>
      <td data-label="Pedido compra">
        {canEdit && !resolved ? (
          <span className="pcp-inline-edit">
            <input className="input table-inline-input" value={purchaseOrder} onChange={(event) => setPurchaseOrder(event.target.value.toUpperCase())} />
            <button className="btn" type="button" onClick={() => onUpdate(row, { purchaseOrderNumber: purchaseOrder })}>Salvar</button>
          </span>
        ) : formatLoose(row.purchaseOrderNumber)}
      </td>
      <td data-label="Data prevista">
        {canEdit && !resolved ? (
          <span className="pcp-inline-edit">
            <input className="input table-inline-input" type="date" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} />
            <button className="btn" type="button" onClick={() => onUpdate(row, { expectedResolutionDate: expectedDate })}>Salvar</button>
          </span>
        ) : formatDate(row.expectedResolutionDate)}
      </td>
      <td data-label="Situacao">{formatLoose(row.issueStatusLabel)}</td>
      <td data-label="Observacoes" title={String(row.notes || '')}>{formatLoose(row.notes)}</td>
      <td data-label="Criado por">{formatLoose(row.createdBy)}</td>
      <td data-label="Criado em">{formatDateTime(row.createdAt)}</td>
      {canEdit && (
        <td className="row-actions-cell" data-label="Acoes">
          <span className="table-actions">
            <button className="btn" type="button" onClick={() => onEdit(row)}><IconText name="edit">Editar</IconText></button>
            {!resolved && <button className="btn primary" type="button" onClick={() => onResolve(row)}><IconText name="check">Resolver</IconText></button>}
            <button className="btn" type="button" onClick={() => onDelete(row)}><IconText name="trash">Excluir</IconText></button>
          </span>
        </td>
      )}
    </tr>
  );
}

export function BillingScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [released, setReleased] = useState<Row[]>([]);
  const [invoiced, setInvoiced] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [historyFilters, setHistoryFilters] = useState<BillingHistoryFilters>(() => loadBillingHistoryFilters(user.id));
  const [collapsedHistory, setCollapsedHistory] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState<{ item: Row; mode: BillingDialogMode } | null>(null);
  const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    api<{ releasedOrders?: Row[]; invoicedOrders?: Row[]; orders?: Row[] }>('/api/billing/items')
      .then((data) => {
        if (ignore) return;
        setReleased(data.releasedOrders || data.orders || []);
        setInvoiced(data.invoicedOrders || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefresh((value) => value + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('billingHistoryState', loadBillingHistoryFilters(user.id), normalizeBillingHistoryFilters)
      .then((value) => {
        if (!ignore) setHistoryFilters(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistBillingHistoryFilters(user.id, historyFilters);
  }, [preferencesReady, historyFilters, user.id]);

  const canTreatBilling = canEdit(user, 'billing');
  const releasedRows = useMemo(() => filterBillingReleasedRows(released, search), [released, search]);
  const invoicedRows = useMemo(() => filterBillingHistoryRows(invoiced, historyFilters), [invoiced, historyFilters]);
  const allBillingRows = useMemo(() => [...released, ...invoiced], [released, invoiced]);

  async function saveBillingInfo(item: Row, payload: Partial<BillingFormState> & { invoiceDocument?: InvoiceDocumentInput }) {
    if (!canTreatBilling) return;
    await executeBillingDialogAction(async () => {
      const data = await api<{ order?: Row; item?: Row }>(`${billingItemApiBase(item)}/billing-info`, {
        method: 'PATCH',
        body: payload
      });
      mergeBillingItem(data.order || data.item);
    });
  }

  async function saveBillingDimensions(item: Row, payload: Partial<BillingFormState>) {
    if (!canTreatBilling) return;
    await executeBillingDialogAction(async () => {
      const endpoint = billingSourceType(item) === 'thirdParty' ? 'billing-info' : 'billing-dimensions';
      const data = await api<{ order?: Row; item?: Row }>(`${billingItemApiBase(item)}/${endpoint}`, {
        method: 'PATCH',
        body: payload
      });
      mergeBillingItem(data.order || data.item);
    });
  }

  async function markInvoiced(item: Row, payload: Partial<BillingFormState> & { invoiceDocument?: InvoiceDocumentInput }) {
    if (!canTreatBilling) return;
    await executeBillingDialogAction(async () => {
      await api(`${billingItemApiBase(item)}/mark-invoiced`, { method: 'PATCH', body: payload });
      setSelectedBilling(null);
      setRefresh((value) => value + 1);
    });
  }

  async function executeBillingDialogAction(action: () => Promise<void>) {
    setBusy(true);
    setDialogError('');
    setError('');
    try {
      await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao executar faturamento.';
      setDialogError(message);
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  function mergeBillingItem(item?: Row) {
    if (!item?.id) {
      setRefresh((value) => value + 1);
      return;
    }

    const merge = (row: Row) => sameBillingItem(row, item) ? { ...row, ...item } : row;
    setReleased((rows) => rows.map(merge));
    setInvoiced((rows) => rows.map(merge));
    setSelectedBilling((current) => current && sameBillingItem(current.item, item)
      ? { ...current, item: { ...current.item, ...item } }
      : current);
    setRefresh((value) => value + 1);
  }

  async function downloadInvoice(item: Row, openInBrowser = false) {
    await executeBillingDialogAction(async () => {
      const { document } = await api<{ document: InvoiceDocumentInput }>(`${billingItemApiBase(item)}/invoice-document`);
      if (openInBrowser) {
        setPreviewDocument(document);
      } else {
        downloadDataUrl(document.dataUrl, document.fileName || 'nota-fiscal');
      }
    });
  }

  function setHistoryFilter(key: keyof BillingHistoryFilters, value: string) {
    setHistoryFilters((current) => ({ ...current, [key]: value }));
  }

  function clearHistoryFilters() {
    setHistoryFilters(emptyBillingHistoryFilters());
  }

  function openBillingItem(row: Row, mode: BillingDialogMode) {
    setDialogError('');
    setSelectedBilling({ item: row, mode });
  }

  return (
    <ModuleFrame title="Faturamento" subtitle="Itens aguardando faturamento, nota fiscal, transportadora e historico faturado." error={error}>
      <div className="module-metrics">
        <Metric label="Aguardando faturamento" value={released.length} />
        <Metric label="Historico faturado" value={invoiced.length} />
        <Metric label="Com NF anexada" value={allBillingRows.filter(hasBillingDocument).length} />
        <Metric label="Beneficiamento" value={allBillingRows.filter((row) => billingSourceType(row) === 'thirdParty').length} />
      </div>

      <div className="module-toolbar billing-toolbar">
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Filtrar pedido, cliente, romaneio, transportadora ou NF" />
        <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}>Atualizar</button>
      </div>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Aguardando faturamento</h3>
          <span>{releasedRows.length} itens | clique na linha para tratar</span>
        </div>
        <div className="billing-awaiting-table">
          <DataTable
            rows={releasedRows}
            columns={billingReleasedColumns()}
            actions={(row) => (
              <button
                className="btn primary"
                type="button"
                disabled={!canTreatBilling}
                onClick={() => openBillingItem(row, 'released')}
              >
                Tratar
              </button>
            )}
            onRowClick={(row) => openBillingItem(row, 'released')}
            rowClass={() => 'billing-awaiting-invoice-row'}
          />
        </div>
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Itens faturados</h3>
          <div className="panel-actions">
            <span>{invoicedRows.length} registros</span>
            <button className="btn" type="button" onClick={() => setCollapsedHistory((value) => !value)}>
              {collapsedHistory ? 'Mostrar historico' : 'Recolher historico'}
            </button>
          </div>
        </div>
        {!collapsedHistory && (
          <>
            <div className="module-toolbar billing-filters">
              <ToolbarSearch value={historyFilters.search} onChange={(value) => setHistoryFilter('search', value)} placeholder="Filtrar historico por pedido, cliente, NF ou transportadora" />
              <label className="field">
                <span>Origem</span>
                <select className="input mini-input" value={historyFilters.sourceType} onChange={(event) => setHistoryFilter('sourceType', event.target.value)}>
                  <option value="">Todas</option>
                  <option value="order">Cliente</option>
                  <option value="thirdParty">Beneficiamento</option>
                </select>
              </label>
              <label className="field">
                <span>Faturado de</span>
                <input className="input mini-input" type="date" value={historyFilters.dateFrom} onChange={(event) => setHistoryFilter('dateFrom', event.target.value)} />
              </label>
              <label className="field">
                <span>Faturado ate</span>
                <input className="input mini-input" type="date" value={historyFilters.dateTo} onChange={(event) => setHistoryFilter('dateTo', event.target.value)} />
              </label>
              <label className="field">
                <span>Arquivo NF</span>
                <select className="input mini-input" value={historyFilters.document} onChange={(event) => setHistoryFilter('document', event.target.value)}>
                  <option value="">Todos</option>
                  <option value="with">Com NF</option>
                  <option value="without">Sem NF</option>
                </select>
              </label>
              <button className="btn" type="button" onClick={clearHistoryFilters}><IconText name="filter">Limpar filtros</IconText></button>
            </div>
            <DataTable
              rows={invoicedRows}
              columns={billingHistoryColumns()}
              onRowClick={(row) => {
                openBillingItem(row, 'invoiced');
              }}
            />
          </>
        )}
      </section>

      {selectedBilling && (
        <BillingDialog
          item={selectedBilling.item}
          mode={selectedBilling.mode}
          canEdit={canTreatBilling}
          busy={busy}
          error={dialogError}
          onClose={() => setSelectedBilling(null)}
          onSaveInfo={saveBillingInfo}
          onSaveDimensions={saveBillingDimensions}
          onMarkInvoiced={markInvoiced}
          onDownloadInvoice={downloadInvoice}
          onPreviewDocument={setPreviewDocument}
        />
      )}
      {previewDocument && (
        <DocumentPreviewDialog
          document={previewDocument}
          title="Documento fiscal"
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </ModuleFrame>
  );
}

function BillingDialog({
  item,
  mode,
  canEdit,
  busy,
  error,
  onClose,
  onSaveInfo,
  onSaveDimensions,
  onMarkInvoiced,
  onDownloadInvoice,
  onPreviewDocument
}: {
  item: Row;
  mode: BillingDialogMode;
  canEdit: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSaveInfo: (item: Row, payload: Partial<BillingFormState> & { invoiceDocument?: InvoiceDocumentInput }) => Promise<void>;
  onSaveDimensions: (item: Row, payload: Partial<BillingFormState>) => Promise<void>;
  onMarkInvoiced: (item: Row, payload: Partial<BillingFormState> & { invoiceDocument?: InvoiceDocumentInput }) => Promise<void>;
  onDownloadInvoice: (item: Row, openInBrowser?: boolean) => Promise<void>;
  onPreviewDocument: (document: PreviewDocument) => void;
}) {
  const [form, setForm] = useState<BillingFormState>(() => billingFormFromRow(item));
  const [invoiceDocument, setInvoiceDocument] = useState<InvoiceDocumentInput | null>(null);
  const [fileError, setFileError] = useState('');
  const isReleased = mode === 'released';
  const isEditable = canEdit && isReleased;
  const needsPurchaseOrder = billingSourceType(item) === 'thirdParty' && !String(item.purchaseOrderNumber || '').trim();

  useEffect(() => {
    setForm(billingFormFromRow(item));
    setInvoiceDocument(null);
    setFileError('');
  }, [item, mode]);

  function updateField(key: keyof BillingFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFileError('');
    const file = event.target.files?.[0];
    setInvoiceDocument(null);
    if (!file) return;

    try {
      const document = await invoiceDocumentFromFile(file);
      setInvoiceDocument(document);
    } catch (err) {
      event.target.value = '';
      setFileError(err instanceof Error ? err.message : 'Arquivo invalido.');
    }
  }

  const payload = () => ({
    ...form,
    ...(invoiceDocument ? { invoiceDocument } : {})
  });
  const dimensionPayload = () => ({
    machineHeight: form.machineHeight,
    machineWidth: form.machineWidth,
    machineLength: form.machineLength,
    machineWeight: form.machineWeight,
    machineGrossWeight: form.machineGrossWeight,
    machineVolume: form.machineVolume
  });

  return (
    <div className="dialog-backdrop open">
      <section className="dialog billing-dialog" role="dialog" aria-modal="true" aria-labelledby="billingDialogTitle">
        <div className="dialog-header">
          <div>
            <h2 id="billingDialogTitle">{isReleased ? 'Tratar faturamento' : 'Consulta de faturamento'}</h2>
            <p>{billingDialogSubtitle(item)}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">x</button>
        </div>

        <div className="dialog-body">
          {error && <p className="error">{error}</p>}
          {fileError && <p className="error">{fileError}</p>}
          {needsPurchaseOrder && <p className="error">Informe o pedido de compra na tela Terceiros antes de faturar esta remessa.</p>}

          <div className="billing-summary-strip">
            <span className="source-badge">{billingRequestTypeLabel(item)}</span>
            <strong>{billingPrimaryLabel(item)}</strong>
            <span>{billingSalesOrderLabel(item)}</span>
            <span>{String(item.customer || item.supplierName || '-')}</span>
          </div>

          <div className="billing-form-grid">
            <BillingField label="Numero NF" value={form.invoiceNumber} disabled={!isEditable || busy} onChange={(value) => updateField('invoiceNumber', value)} />
            <BillingField label="Transportadora" value={form.carrierName} disabled={!isEditable || busy} onChange={(value) => updateField('carrierName', value)} />
            <BillingField label="CNPJ transportadora" value={form.carrierCnpj} disabled={!isEditable || busy} onChange={(value) => updateField('carrierCnpj', value)} />
            <BillingField label="Cliente / fornecedor faturamento" value={form.billingCustomerName} disabled={!isEditable || busy} onChange={(value) => updateField('billingCustomerName', value)} />
            <BillingField label="CNPJ cliente" value={form.billingCustomerCnpj} disabled={!isEditable || busy} onChange={(value) => updateField('billingCustomerCnpj', value)} />
            <label className="field full">
              <span>Endereco do frete</span>
              <textarea className="input" rows={2} value={form.freightAddress} disabled={!isEditable || busy} onChange={(event) => updateField('freightAddress', event.target.value)} />
            </label>
          </div>

          <section className="billing-section">
            <div className="panel-title">
              <h3>Dimensionais</h3>
              <span>{billingDimensionSummary({ ...item, ...form })}</span>
            </div>
            <div className="billing-form-grid dimensions">
              <BillingField label="Altura" type="number" value={form.machineHeight} disabled={!isEditable || busy} onChange={(value) => updateField('machineHeight', value)} />
              <BillingField label="Largura" type="number" value={form.machineWidth} disabled={!isEditable || busy} onChange={(value) => updateField('machineWidth', value)} />
              <BillingField label="Comprimento" type="number" value={form.machineLength} disabled={!isEditable || busy} onChange={(value) => updateField('machineLength', value)} />
              <BillingField label="Peso liquido" type="number" value={form.machineWeight} disabled={!isEditable || busy} onChange={(value) => updateField('machineWeight', value)} />
              <BillingField label="Peso bruto" type="number" value={form.machineGrossWeight} disabled={!isEditable || busy} onChange={(value) => updateField('machineGrossWeight', value)} />
              <BillingField label="Volume" type="number" value={form.machineVolume} disabled={!isEditable || busy} onChange={(value) => updateField('machineVolume', value)} />
            </div>
          </section>

          <section className="billing-section">
            <div className="panel-title">
              <h3>Documento fiscal</h3>
              <span>{billingDocumentLabel(item, invoiceDocument)}</span>
            </div>
            {isEditable && (
              <label className="field">
                <span>Nota fiscal</span>
                <input className="input" type="file" accept=".pdf,.xml,.txt,.png,.jpg,.jpeg,.webp" disabled={busy} onChange={handleFileChange} />
              </label>
            )}
            <div className="table-actions">
              {invoiceDocument && (
                <>
                  <button className="btn" type="button" onClick={() => onPreviewDocument(invoiceDocument)}><IconText name="eye">Visualizar selecionado</IconText></button>
                  <button className="btn" type="button" onClick={() => downloadPreviewDocument(invoiceDocument)}><IconText name="download">Baixar selecionado</IconText></button>
                </>
              )}
              {hasBillingDocument(item) && (
                <>
                  <button className="btn" type="button" disabled={busy} onClick={() => onDownloadInvoice(item, true)}><IconText name="eye">Visualizar NF</IconText></button>
                  <button className="btn" type="button" disabled={busy} onClick={() => onDownloadInvoice(item, false)}><IconText name="download">Baixar NF</IconText></button>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Fechar</IconText></button>
          {isEditable && (
            <>
              <button className="btn" type="button" disabled={busy} onClick={() => onSaveDimensions(item, dimensionPayload())}><IconText name="ruler">Salvar dimensionais</IconText></button>
              <button className="btn" type="button" disabled={busy} onClick={() => onSaveInfo(item, payload())}><IconText name="save">Salvar dados</IconText></button>
              <button className="btn primary" type="button" disabled={busy || needsPurchaseOrder} onClick={() => onMarkInvoiced(item, payload())}><IconText name="check">Faturado</IconText></button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function BillingField({
  label,
  value,
  onChange,
  disabled,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: 'text' | 'number';
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" type={type} step={type === 'number' ? '0.01' : undefined} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export function LoadingScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [orders, setOrders] = useState<Row[]>([]);
  const [filters, setFilters] = useState<LoadingTableState>(() => loadLoadingTableState(user.id));
  const [selected, setSelected] = useState<Row | null>(null);
  const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    api<{ orders?: Row[] }>('/api/loading/items')
      .then((data) => {
        if (!ignore) setOrders(data.orders || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('loadingTableState', loadLoadingTableState(user.id), normalizeLoadingTableState)
      .then((value) => {
        if (!ignore) setFilters(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistLoadingTableState(user.id, filters);
  }, [preferencesReady, filters, user.id]);

  useEffect(() => {
    setSelected((current) => current ? orders.find((row) => sameBillingItem(row, current)) || current : null);
  }, [orders]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefresh((value) => value + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function markLoaded(row: Row) {
    if (!canEdit(user, 'loading')) return;
    if (!window.confirm(`Confirmar carregamento de ${billingPrimaryLabel(row)}?`)) return;
    setBusy(true);
    await runAction(setError, async () => {
      await api(`${billingItemApiBase(row)}/mark-loaded`, { method: 'PATCH' });
      setSelected(null);
      setRefresh((value) => value + 1);
    });
    setBusy(false);
  }

  async function downloadInvoice(row: Row, openInBrowser = false) {
    setBusy(true);
    await runAction(setError, async () => {
      const { document } = await api<{ document: InvoiceDocumentInput }>(`${billingItemApiBase(row)}/invoice-document`);
      if (openInBrowser) {
        setPreviewDocument(document);
      } else {
        downloadDataUrl(document.dataUrl, document.fileName || 'nota-fiscal');
      }
    });
    setBusy(false);
  }

  function updateFilters(patch: Partial<LoadingTableState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  const filtered = useMemo(() => filterLoadingRows(orders, filters), [orders, filters]);
  const metrics = useMemo(() => loadingMetrics(orders), [orders]);

  return (
    <ModuleFrame title="Aguardando carregamento" subtitle="Pedidos faturados aguardando expedicao/carregamento." error={error}>
      <div className="module-metrics compact">
        <Metric label="Aguardando carregamento" value={metrics.total} />
        <Metric label="Com NF" value={metrics.withDocument} />
        <Metric label="Sem NF" value={metrics.withoutDocument} />
        <Metric label="Beneficiamento" value={metrics.thirdParty} />
        <Metric label="Peso bruto total" value={`${metrics.grossWeight} kg`} />
      </div>

      <section className="module-panel loading-toolbar-panel">
        <div className="module-toolbar loading-toolbar">
          <ToolbarSearch value={filters.search} onChange={(search) => updateFilters({ search })} placeholder="Filtrar pedido, cliente, transportadora, NF ou romaneio" />
          <label className="field mini-input">
            <span>Origem</span>
            <select className="input" value={filters.sourceType} onChange={(event) => updateFilters({ sourceType: event.target.value })}>
              <option value="">Todas</option>
              <option value="order">Cliente</option>
              <option value="thirdParty">Beneficiamento</option>
            </select>
          </label>
          <label className="field mini-input">
            <span>Arquivo NF</span>
            <select className="input" value={filters.document} onChange={(event) => updateFilters({ document: event.target.value })}>
              <option value="">Todos</option>
              <option value="with">Com NF</option>
              <option value="without">Sem NF</option>
            </select>
          </label>
          <label className="field mini-input">
            <span>Faturado de</span>
            <input className="input" type="date" value={filters.dateFrom} onChange={(event) => updateFilters({ dateFrom: event.target.value })} />
          </label>
          <label className="field mini-input">
            <span>Faturado ate</span>
            <input className="input" type="date" value={filters.dateTo} onChange={(event) => updateFilters({ dateTo: event.target.value })} />
          </label>
          <button className="btn" type="button" onClick={() => updateFilters(emptyLoadingTableState())}><IconText name="filter">Limpar filtros</IconText></button>
          <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}><IconText name="refresh">Atualizar</IconText></button>
        </div>
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Itens faturados aguardando carregamento</h3>
          <span>{filtered.length} itens</span>
        </div>
        <LoadingTable
          rows={filtered}
          canEdit={canEdit(user, 'loading')}
          busy={busy}
          onOpen={setSelected}
          onDownloadInvoice={downloadInvoice}
          onMarkLoaded={markLoaded}
        />
      </section>

      {selected && (
        <LoadingDetailDialog
          item={selected}
          canEdit={canEdit(user, 'loading')}
          busy={busy}
          onClose={() => setSelected(null)}
          onDownloadInvoice={downloadInvoice}
          onMarkLoaded={markLoaded}
        />
      )}
      {previewDocument && (
        <DocumentPreviewDialog
          document={previewDocument}
          title="Documento fiscal"
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </ModuleFrame>
  );
}

function LoadingTable({
  rows,
  canEdit,
  busy,
  onOpen,
  onDownloadInvoice,
  onMarkLoaded
}: {
  rows: Row[];
  canEdit: boolean;
  busy: boolean;
  onOpen: (row: Row) => void;
  onDownloadInvoice: (row: Row, openInBrowser?: boolean) => void | Promise<void>;
  onMarkLoaded: (row: Row) => void | Promise<void>;
}) {
  return (
    <div className="generic-table-wrap loading-table-wrap">
      <table className="generic-table loading-table">
        <thead>
          <tr>
            <th>Origem</th>
            <th>Pedido / Romaneio</th>
            <th>Pedido venda</th>
            <th>Pedido compra</th>
            <th>Cliente / fornecedor</th>
            <th>NF</th>
            <th>Transportadora</th>
            <th>CNPJ transp.</th>
            <th>Qtd.</th>
            <th>Peso liq.</th>
            <th>Peso bruto</th>
            <th>Volume</th>
            <th>Faturado em</th>
            <th>Arquivo NF</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const id = `${billingSourceType(row)}-${String(row.id || index)}`;
            return (
              <tr key={id} className={`${hasBillingDocument(row) ? '' : 'row-warning'} clickable-row`.trim()} onClick={() => onOpen(row)}>
                <td data-label="Origem"><span className="source-badge">{billingRequestTypeLabel(row)}</span></td>
                <td data-label="Pedido / Romaneio">{billingPrimaryLabel(row)}</td>
                <td data-label="Pedido venda">{billingSalesOrderLabel(row)}</td>
                <td data-label="Pedido compra">{formatLoose(row.purchaseOrderNumber)}</td>
                <td data-label="Cliente / fornecedor" title={String(row.customer || row.supplierName || '-')}>{formatLoose(row.customer || row.supplierName)}</td>
                <td data-label="NF">{formatLoose(row.invoiceNumber)}</td>
                <td data-label="Transportadora" title={String(row.carrierName || '-')}>{formatLoose(row.carrierName)}</td>
                <td data-label="CNPJ transp.">{formatLoose(row.carrierCnpj)}</td>
                <td data-label="Qtd.">{formatNumber(row.quantity)}</td>
                <td data-label="Peso liq.">{formatNumber(row.machineWeight)}</td>
                <td data-label="Peso bruto">{formatNumber(row.machineGrossWeight)}</td>
                <td data-label="Volume">{formatNumber(row.machineVolume)}</td>
                <td data-label="Faturado em">{formatDateTime(row.invoicedAt)}</td>
                <td data-label="Arquivo NF" onClick={(event) => event.stopPropagation()}>
                  {hasBillingDocument(row) ? (
                    <div className="table-actions">
                      <button className="btn" type="button" disabled={busy} onClick={() => onDownloadInvoice(row, true)}><IconText name="eye">Ver</IconText></button>
                      <button className="btn" type="button" disabled={busy} onClick={() => onDownloadInvoice(row, false)}><IconText name="download">Baixar</IconText></button>
                    </div>
                  ) : 'Pendente'}
                </td>
                <td className="row-actions-cell" data-label="Acoes" onClick={(event) => event.stopPropagation()}>
                  <div className="table-actions">
                    {canEdit && <button className="btn primary" type="button" disabled={busy} onClick={() => onMarkLoaded(row)}><IconText name="truck">Carregado</IconText></button>}
                  </div>
                </td>
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={15}>Nenhum item aguardando carregamento.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadingDetailDialog({
  item,
  canEdit,
  busy,
  onClose,
  onDownloadInvoice,
  onMarkLoaded
}: {
  item: Row;
  canEdit: boolean;
  busy: boolean;
  onClose: () => void;
  onDownloadInvoice: (row: Row, openInBrowser?: boolean) => void | Promise<void>;
  onMarkLoaded: (row: Row) => void | Promise<void>;
}) {
  return (
    <div className="dialog-backdrop open">
      <section className="dialog loading-dialog" role="dialog" aria-modal="true" aria-labelledby="loadingDialogTitle">
        <div className="dialog-header">
          <div>
            <h2 id="loadingDialogTitle">Consulta de carregamento</h2>
            <p>{billingDialogSubtitle(item)}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">x</button>
        </div>

        <div className="dialog-body">
          <div className="billing-summary-strip">
            <span className="source-badge">{billingRequestTypeLabel(item)}</span>
            <strong>{billingPrimaryLabel(item)}</strong>
            <span>{billingSalesOrderLabel(item)}</span>
            <span>{String(item.customer || item.supplierName || '-')}</span>
          </div>

          <div className="order-summary-grid">
            <SummaryItem label="NF" value={item.invoiceNumber} />
            <SummaryItem label="Transportadora" value={item.carrierName} />
            <SummaryItem label="CNPJ transportadora" value={item.carrierCnpj} />
            <SummaryItem label="Endereco frete" value={item.freightAddress} />
            <SummaryItem label="Pedido compra" value={item.purchaseOrderNumber} />
            <SummaryItem label="SKU / peca" value={item.sku || item.partCode} />
            <SummaryItem label="Equipamento / descricao" value={item.equipment || item.partDescription} />
            <SummaryItem label="Quantidade" value={formatNumber(item.quantity)} />
            <SummaryItem label="Peso liquido" value={formatNumber(item.machineWeight)} />
            <SummaryItem label="Peso bruto" value={formatNumber(item.machineGrossWeight)} />
            <SummaryItem label="Volume" value={formatNumber(item.machineVolume)} />
            <SummaryItem label="Faturado em" value={formatDateTime(item.invoicedAt)} />
          </div>

          <section className="billing-section">
            <div className="panel-title">
              <h3>Documento fiscal</h3>
              <span>{hasBillingDocument(item) ? String(item.invoiceDocumentName || 'NF cadastrada') : 'NF pendente'}</span>
            </div>
            <div className="table-actions">
              {hasBillingDocument(item) ? (
                <>
                  <button className="btn" type="button" disabled={busy} onClick={() => onDownloadInvoice(item, true)}><IconText name="eye">Visualizar NF</IconText></button>
                  <button className="btn" type="button" disabled={busy} onClick={() => onDownloadInvoice(item, false)}><IconText name="download">Baixar NF</IconText></button>
                </>
              ) : (
                <span className="muted-text">Nenhum arquivo de nota fiscal anexado.</span>
              )}
            </div>
          </section>
        </div>

        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Fechar</IconText></button>
          {canEdit && <button className="btn primary" type="button" disabled={busy} onClick={() => onMarkLoaded(item)}><IconText name="truck">Carregado</IconText></button>}
        </div>
      </section>
    </div>
  );
}

export function ThirdPartyScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const editable = canEdit(user, 'thirdParty');
  const [items, setItems] = useState<Row[]>([]);
  const [orders, setOrders] = useState<Row[]>([]);
  const [tableState, setTableState] = useState<ThirdPartyTableState>(() => loadThirdPartyTableState(user.id));
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ThirdPartyFormState>(() => emptyThirdPartyForm());
  const [purchaseDrafts, setPurchaseDrafts] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Row | null>(null);
  const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ items?: Row[] }>('/api/third-party-parts'),
      canView(user, 'orders')
        ? api<{ orders?: Row[] }>('/api/orders?sort=orderNumber&direction=desc&pageSize=500')
        : Promise.resolve({ orders: [] })
    ])
      .then((data) => {
        if (ignore) return;
        const [itemData, orderData] = data;
        setItems(itemData.items || []);
        setOrders(orderData.orders || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey, user]);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('thirdPartyTableState', loadThirdPartyTableState(user.id), normalizeThirdPartyTableState)
      .then((value) => {
        if (!ignore) setTableState(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistThirdPartyTableState(user.id, tableState);
  }, [preferencesReady, tableState, user.id]);

  useEffect(() => {
    setDetail((current) => current ? items.find((item) => String(item.id || '') === String(current.id || '')) || current : null);
  }, [items]);

  function updateTable(patch: Partial<ThirdPartyTableState>) {
    setTableState((current) => ({ ...current, ...patch }));
  }

  function updateForm(key: keyof ThirdPartyFormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectSalesOrder(orderId: string) {
    const order = orders.find((item) => String(item.id || '') === orderId);
    setForm((current) => ({
      ...current,
      salesOrderId: orderId,
      salesOrderReference: String(order?.orderNumber || current.salesOrderReference || '')
    }));
  }

  async function createItem(event: FormEvent) {
    event.preventDefault();
    if (!editable) return;
    setSuccess('');
    await runAction(setError, async () => {
      await api('/api/third-party-parts', { method: 'POST', body: thirdPartyPayload(form) });
      setForm(emptyThirdPartyForm());
      setFormOpen(false);
      setSuccess('Remessa criada. Informe o pedido de compra para liberar ao faturamento.');
      setRefresh((value) => value + 1);
    });
  }

  async function markReturned(row: Row) {
    if (!editable) return;
    await runAction(setError, async () => {
      await api(`/api/third-party-parts/${encodeURIComponent(String(row.id))}/return`, { method: 'PATCH' });
      setSuccess('Retorno registrado.');
      setRefresh((value) => value + 1);
    });
  }

  async function savePurchaseOrder(row: Row) {
    if (!editable) return;
    const id = String(row.id || '');
    const purchaseOrderNumber = String(purchaseDrafts[id] ?? row.purchaseOrderNumber ?? '').trim();
    await runAction(setError, async () => {
      await api(`/api/third-party-parts/${encodeURIComponent(id)}/purchase-order`, {
        method: 'PATCH',
        body: { purchaseOrderNumber }
      });
      setPurchaseDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setSuccess('Pedido de compra informado. Remessa liberada ao faturamento.');
      setRefresh((value) => value + 1);
    });
  }

  async function deleteItem(row: Row) {
    if (!editable) return;
    if (!window.confirm('Excluir esta remessa?')) return;
    await runAction(setError, async () => {
      await api(`/api/third-party-parts/${encodeURIComponent(String(row.id))}`, { method: 'DELETE' });
      setSuccess('Remessa excluida.');
      setDetail(null);
      setRefresh((value) => value + 1);
    });
  }

  async function downloadInvoice(row: Row, openInBrowser = false) {
    await runAction(setError, async () => {
      const { document } = await api<{ document: InvoiceDocumentInput }>(`/api/third-party-parts/${encodeURIComponent(String(row.id))}/invoice-document`);
      if (openInBrowser) {
        setPreviewDocument(document);
      } else {
        downloadDataUrl(document.dataUrl, document.fileName || 'nota-fiscal');
      }
    });
  }

  const filtered = useMemo(() => filterThirdPartyItems(items, tableState), [items, tableState]);
  const metrics = useMemo(() => thirdPartyMetrics(items), [items]);

  return (
    <ModuleFrame title="Terceiros" subtitle="Pecas em poder de terceiros e remessas de beneficiamento." error={error}>
      {success && <p className="success-message">{success}</p>}
      <div className="module-metrics compact">
        <Metric label="Remessas" value={metrics.total} />
        <Metric label="Aguardando PC" value={metrics.waitingPurchase} />
        <Metric label="Liberadas faturamento" value={metrics.released} />
        <Metric label="Faturadas" value={metrics.invoiced} />
        <Metric label="Retornadas" value={metrics.returned} />
      </div>

      <div className="module-toolbar third-party-toolbar">
        <ToolbarSearch value={tableState.search} onChange={(search) => updateTable({ search })} placeholder="Filtrar romaneio, fornecedor, pedido ou peca" />
        <label className="field mini-input">
          <span>Remessas</span>
          <select className="input" value={tableState.returnScope} onChange={(event) => updateTable({ returnScope: event.target.value })}>
            <option value="active">Ativas</option>
            <option value="returned">Retornadas</option>
            <option value="">Todas</option>
          </select>
        </label>
        <label className="field mini-input">
          <span>Status</span>
          <select className="input" value={tableState.status} onChange={(event) => updateTable({ status: event.target.value })}>
            <option value="">Todos</option>
            <option value="Aguardando pedido de compra">Aguardando PC</option>
            <option value="Aguardando faturamento">Aguardando faturamento</option>
            <option value="Faturado">Faturado</option>
            <option value="Enviado ao terceiro">Enviado</option>
            <option value="Retornado">Retornado</option>
          </select>
        </label>
        <label className="field mini-input">
          <span>Faturamento</span>
          <select className="input" value={tableState.billingStage} onChange={(event) => updateTable({ billingStage: event.target.value })}>
            <option value="">Todos</option>
            <option value="none">Nao liberado</option>
            <option value="released">Liberado</option>
            <option value="invoiced">Faturado</option>
            <option value="loaded">Enviado</option>
          </select>
        </label>
        <label className="field mini-input">
          <span>Prazo retorno</span>
          <select className="input" value={tableState.dateMode} onChange={(event) => updateTable({ dateMode: event.target.value })}>
            <option value="">Todos</option>
            <option value="late">Atrasado</option>
            <option value="next7">Proximos 7 dias</option>
          </select>
        </label>
        <button className="btn" type="button" onClick={() => updateTable(emptyThirdPartyTableState())}><IconText name="filter">Limpar filtros</IconText></button>
        {editable && <button className="btn primary" type="button" onClick={() => setFormOpen((value) => !value)}><IconText name={formOpen ? 'close' : 'plus'}>{formOpen ? 'Fechar cadastro' : 'Nova remessa'}</IconText></button>}
      </div>

      {formOpen && editable && (
        <section className="module-panel third-party-form-panel">
          <div className="panel-title">
            <h3>Nova remessa para terceiros</h3>
            <span>Beneficiamento</span>
          </div>
          <form className="third-party-form-grid" onSubmit={createItem}>
            <label className="field">
              <span>Romaneio</span>
              <input className="input" value={form.romaneioNumber} placeholder="Automatico se vazio" onChange={(event) => updateForm('romaneioNumber', event.target.value)} />
            </label>
            <label className="field third-party-span-2">
              <span>Pedido de venda vinculado</span>
              <select className="input" value={form.salesOrderId} onChange={(event) => selectSalesOrder(event.target.value)}>
                <option value="">Sem vinculo</option>
                {orders.map((order) => <option key={String(order.id || order.orderNumber)} value={String(order.id || '')}>{thirdPartyOrderLabel(order)}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Pedido venda texto</span>
              <input className="input" value={form.salesOrderReference} onChange={(event) => updateForm('salesOrderReference', event.target.value)} />
            </label>
            <label className="field">
              <span>Nome cliente / fornecedor</span>
              <input className="input" value={form.supplierName} onChange={(event) => updateForm('supplierName', event.target.value)} required />
            </label>
            <label className="field">
              <span>CNPJ</span>
              <input className="input" value={form.supplierCnpj} onChange={(event) => updateForm('supplierCnpj', event.target.value)} />
            </label>
            <label className="field">
              <span>Codigo da peca</span>
              <input className="input" value={form.partCode} onChange={(event) => updateForm('partCode', event.target.value.toUpperCase())} required />
            </label>
            <label className="field third-party-span-2">
              <span>Descricao da peca</span>
              <input className="input" value={form.partDescription} onChange={(event) => updateForm('partDescription', event.target.value)} required />
            </label>
            <label className="field">
              <span>Quantidade</span>
              <input className="input" type="number" min="0.01" step="0.01" value={form.quantity} onChange={(event) => updateForm('quantity', event.target.value)} required />
            </label>
            <label className="field">
              <span>Unidade</span>
              <input className="input" value={form.unit} onChange={(event) => updateForm('unit', event.target.value.toUpperCase())} />
            </label>
            <label className="field">
              <span>Emissao</span>
              <input className="input" type="date" value={form.issueDate} onChange={(event) => updateForm('issueDate', event.target.value)} required />
            </label>
            <label className="field">
              <span>Prev. retorno</span>
              <input className="input" type="date" value={form.expectedReturnDate} onChange={(event) => updateForm('expectedReturnDate', event.target.value)} />
            </label>
            <label className="field third-party-span-2">
              <span>Processo de beneficiamento</span>
              <textarea className="input" rows={2} value={form.processDescription} onChange={(event) => updateForm('processDescription', event.target.value)} />
            </label>
            <label className="field third-party-span-2">
              <span>Observacoes</span>
              <textarea className="input" rows={2} value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} />
            </label>
            <div className="admin-form-actions third-party-span-2">
              <button className="btn primary" type="submit"><IconText name="plus">Criar remessa</IconText></button>
              <button className="btn" type="button" onClick={() => setForm(emptyThirdPartyForm())}><IconText name="filter">Limpar</IconText></button>
            </div>
          </form>
        </section>
      )}

      <section className="module-panel">
        <div className="panel-title">
          <h3>Remessas criadas</h3>
          <span>{filtered.length} registros</span>
        </div>
        <ThirdPartyTable
          rows={filtered}
          canEdit={editable}
          purchaseDrafts={purchaseDrafts}
          onDraftChange={(id, value) => setPurchaseDrafts((current) => ({ ...current, [id]: value }))}
          onSavePurchase={savePurchaseOrder}
          onOpen={setDetail}
          onReturned={markReturned}
          onDelete={deleteItem}
        />
      </section>

      {detail && (
        <section className="module-panel third-party-detail-panel">
          <div className="panel-title">
            <h3>Detalhe da remessa</h3>
            <button className="btn" type="button" onClick={() => setDetail(null)}><IconText name="close">Fechar</IconText></button>
          </div>
          <div className="order-summary-grid">
            <SummaryItem label="Romaneio" value={detail.romaneioNumber} />
            <SummaryItem label="Pedido venda" value={detail.linkedOrderNumber || detail.salesOrderReference} />
            <SummaryItem label="Pedido compra" value={detail.purchaseOrderNumber} />
            <SummaryItem label="Cliente / fornecedor" value={detail.supplierName} />
            <SummaryItem label="Codigo peca" value={detail.partCode} />
            <SummaryItem label="Quantidade" value={`${formatNumber(detail.quantity)} ${String(detail.unit || '')}`} />
            <SummaryItem label="Status" value={detail.status} />
            <SummaryItem label="Faturamento" value={thirdPartyBillingStageLabel(detail.billingStage)} />
            <SummaryItem label="NF" value={detail.invoiceNumber} />
            <SummaryItem label="Transportadora" value={detail.carrierName} />
            <SummaryItem label="Prev. retorno" value={formatDate(detail.expectedReturnDate)} />
            <SummaryItem label="Retorno" value={formatDate(detail.returnDate)} />
          </div>
          <article className="order-summary-notes">
            <span>Processo / observacoes</span>
            <p>{[detail.processDescription, detail.notes].filter(Boolean).join('\n') || '-'}</p>
          </article>
          <div className="table-actions">
            {hasBillingDocument(detail) && <button className="btn" type="button" onClick={() => downloadInvoice(detail, true)}><IconText name="eye">Visualizar NF</IconText></button>}
            {hasBillingDocument(detail) && <button className="btn" type="button" onClick={() => downloadInvoice(detail, false)}><IconText name="download">Baixar NF</IconText></button>}
            {editable && String(detail.status) !== 'Retornado' && <button className="btn" type="button" onClick={() => markReturned(detail)}><IconText name="truck">Registrar retorno</IconText></button>}
          </div>
        </section>
      )}
      {previewDocument && (
        <DocumentPreviewDialog
          document={previewDocument}
          title="Documento fiscal"
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </ModuleFrame>
  );
}

function ThirdPartyTable({
  rows,
  canEdit,
  purchaseDrafts,
  onDraftChange,
  onSavePurchase,
  onOpen,
  onReturned,
  onDelete
}: {
  rows: Row[];
  canEdit: boolean;
  purchaseDrafts: Record<string, string>;
  onDraftChange: (id: string, value: string) => void;
  onSavePurchase: (row: Row) => void | Promise<void>;
  onOpen: (row: Row) => void;
  onReturned: (row: Row) => void | Promise<void>;
  onDelete: (row: Row) => void | Promise<void>;
}) {
  return (
    <div className="generic-table-wrap third-party-table-wrap">
      <table className="generic-table third-party-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Romaneio</th>
            <th>Pedido venda</th>
            <th>Pedido compra</th>
            <th>Cliente / fornecedor</th>
            <th>Peca</th>
            <th>Descricao</th>
            <th>Qtd.</th>
            <th>Emissao</th>
            <th>Prev. retorno</th>
            <th>Faturamento</th>
            {canEdit && <th>Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const id = String(row.id || `${row.romaneioNumber || 'third'}-${index}`);
            return (
              <tr key={id} className={thirdPartyRowClass(row)} onClick={() => onOpen(row)}>
                <td><span className={`third-party-status ${thirdPartyStatusClass(row)}`}>{formatLoose(row.status)}</span></td>
                <td>{formatLoose(row.romaneioNumber)}</td>
                <td>{formatLoose(row.linkedOrderNumber || row.salesOrderReference)}</td>
                <td onClick={(event) => event.stopPropagation()}>
                  {canEdit && !String(row.purchaseOrderNumber || '').trim() && String(row.status || '') !== 'Retornado' ? (
                    <div className="pcp-inline-edit">
                      <input className="input table-inline-input" value={purchaseDrafts[id] || ''} onChange={(event) => onDraftChange(id, event.target.value.toUpperCase())} placeholder="PC" />
                      <button className="btn" type="button" onClick={() => onSavePurchase(row)}><IconText name="save">Salvar</IconText></button>
                    </div>
                  ) : formatLoose(row.purchaseOrderNumber)}
                </td>
                <td title={String(row.supplierName || '-')}>{formatLoose(row.supplierName)}</td>
                <td title={String(row.partCode || '-')}>{formatLoose(row.partCode)}</td>
                <td title={String(row.partDescription || '-')}>{formatLoose(row.partDescription)}</td>
                <td>{formatNumber(row.quantity)} {String(row.unit || '')}</td>
                <td>{formatDate(row.issueDate)}</td>
                <td>{formatDate(row.expectedReturnDate)}</td>
                <td>{thirdPartyBillingStageLabel(row.billingStage)}</td>
                {canEdit && (
                  <td className="row-actions-cell" onClick={(event) => event.stopPropagation()}>
                    <div className="table-actions">
                      {String(row.status) !== 'Retornado' && <button className="btn" type="button" onClick={() => onReturned(row)}><IconText name="truck">Retorno</IconText></button>}
                      <button className="btn" type="button" disabled={!['', 'released'].includes(String(row.billingStage || ''))} onClick={() => onDelete(row)}><IconText name="trash">Excluir</IconText></button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={canEdit ? 12 : 11}>Nenhuma remessa encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

type PurchasePendingState = {
  rows: Row[];
  sourceName: string;
  importedAt: string;
  search: string;
  buyerFilter: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
};

export function PurchasePendingScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const editable = canEdit(user, 'pcp');
  const [state, setState] = useState<PurchasePendingState>(() => loadPurchasePendingState(user.id));
  const [activeOrderOptions, setActiveOrderOptions] = useState<Row[]>([]);
  const [resolvingRow, setResolvingRow] = useState<Row | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [linkBusyId, setLinkBusyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setState((current) => ({ ...current, ...loadPurchasePendingState(user.id), rows: current.rows }));
  }, [user.id]);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ items?: Row[] }>('/api/purchase-pending'),
      api<{ orders?: Row[] }>('/api/orders/active-options').catch(() => ({ orders: [] }))
    ])
      .then(([payload, orderPayload]) => {
        if (ignore) return;
        const rows = normalizePurchasePendingRows(payload.items);
        setActiveOrderOptions(orderPayload.orders || []);
        setState((current) => ({
          ...current,
          rows,
          sourceName: purchasePendingCurrentSourceName(rows),
          importedAt: purchasePendingCurrentImportedAt(rows)
        }));
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [realtimeRefreshKey]);

  function persistUiState(patch: Partial<Pick<PurchasePendingState, 'search' | 'buyerFilter' | 'sortField' | 'sortDirection'>>) {
    setState((current) => {
      const next = { ...current, ...patch };
      writeLocalPreference(purchasePendingStorageKey(user.id), {
        search: next.search,
        buyerFilter: next.buyerFilter,
        sortField: next.sortField,
        sortDirection: next.sortDirection
      });
      return next;
    });
  }

  function applyServerRows(rows: Row[]) {
    const normalizedRows = normalizePurchasePendingRows(rows);
    setState((current) => ({
      ...current,
      rows: normalizedRows,
      sourceName: purchasePendingCurrentSourceName(normalizedRows),
      importedAt: purchasePendingCurrentImportedAt(normalizedRows)
    }));
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    setError('');
    setSuccess('');
    if (!file) return;

    try {
      const parsedRows = parsePurchasePendingImport(await file.text());
      if (!parsedRows.length) {
        setError('Nenhuma linha valida foi encontrada no arquivo importado.');
        return;
      }
      const payload = await api<{ items?: Row[] }>('/api/purchase-pending/import', {
        method: 'POST',
        body: { sourceName: file.name, rows: parsedRows }
      });
      applyServerRows(payload.items || []);
      setSuccess(`${parsedRows.length} pedido(s) de compra pendente(s) importado(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao importar a tabela.');
    }
  }

  function updateSearch(value: string) {
    persistUiState({ search: value });
  }

  function updateBuyerFilter(value: string) {
    persistUiState({ buyerFilter: value });
  }

  function updateSort(field: string) {
    persistUiState({
      sortField: field,
      sortDirection: state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc'
    });
  }

  async function clearRows() {
    if (!window.confirm('Limpar a tabela importada de pedidos de compras pendentes?')) return;
    setSuccess('');
    await runAction(setError, async () => {
      const payload = await api<{ items?: Row[]; removed?: number }>('/api/purchase-pending', { method: 'DELETE' });
      applyServerRows(payload.items || []);
      setSuccess(`${formatInteger(payload.removed || 0)} pedido(s) pendente(s) removido(s). Baixas anteriores preservadas.`);
    });
  }

  function exportCsv() {
    const columns = purchasePendingColumns(state.rows);
    const csvRows = [
      columns.map((column) => column.label),
      ...visibleRows.map((row) => columns.map((column) => cellValue(row, column)))
    ];
    const csv = csvRows.map((row) => row.map((value) => escapeCsvCell(String(value || ''))).join(';')).join('\r\n');
    const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
    downloadDataUrl(dataUrl, `pedidos-compras-pendentes-${dateInputValue(new Date())}.csv`);
  }

  function openResolve(row: Row) {
    setResolvingRow(row);
    setResolutionNote('');
    setError('');
    setSuccess('');
  }

  async function submitResolve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resolvingRow) return;
    setSuccess('');
    await runAction(setError, async () => {
      const payload = await api<{ items?: Row[] }>(`/api/purchase-pending/${encodeURIComponent(String(resolvingRow.id || ''))}/resolve`, {
        method: 'PATCH',
        body: { note: resolutionNote }
      });
      applyServerRows(payload.items || []);
      setResolvingRow(null);
      setResolutionNote('');
      setSuccess('Pedido de compra pendente baixado com historico.');
    });
  }

  async function updateLinkedSalesOrder(row: Row, salesOrderId: string) {
    const id = String(row.id || '');
    if (!id || linkBusyId) return;
    setSuccess('');
    setLinkBusyId(id);
    try {
      await runAction(setError, async () => {
        const payload = await api<{ items?: Row[] }>(`/api/purchase-pending/${encodeURIComponent(id)}/sales-order`, {
          method: 'PATCH',
          body: { salesOrderId }
        });
        applyServerRows(payload.items || []);
        setSuccess(salesOrderId ? 'Pedido de venda vinculado a compra pendente.' : 'Vinculo removido da compra pendente.');
      });
    } finally {
      setLinkBusyId('');
    }
  }

  const buyerOptions = useMemo(() => purchasePendingBuyerOptions(state.rows), [state.rows]);
  const filteredRows = useMemo(() => filterPurchasePendingRows(state.rows, state.search, state.buyerFilter), [state.rows, state.search, state.buyerFilter]);
  const buyerDelayRows = useMemo(() => purchasePendingBuyerDelayRows(state.rows), [state.rows]);
  const metrics = purchasePendingMetrics(state.rows);
  const columns = purchasePendingColumns(state.rows, {
    editable,
    activeOrderOptions,
    linkBusyId,
    onLinkChange: updateLinkedSalesOrder
  });
  const visibleRows = useMemo(
    () => sortPurchasePendingRows(filteredRows, columns, state.sortField, state.sortDirection),
    [filteredRows, columns, state.sortField, state.sortDirection]
  );

  return (
    <ModuleFrame title="Pedidos de compras pendentes" subtitle="Importacao e consulta inicial de tabela externa de compras." error={error}>
      {success && <p className="success-message">{success}</p>}
      <div className="module-metrics compact">
        <Metric label="Pendentes" value={formatInteger(metrics.pending)} />
        <Metric label="Baixados" value={formatInteger(metrics.resolved)} />
        <Metric label="Fornecedores" value={formatInteger(metrics.suppliers)} />
        <Metric label="Entregas atrasadas" value={formatInteger(metrics.overdue)} />
        <Metric label="Sem pedido de compra" value={formatInteger(metrics.missingPurchaseOrder)} />
      </div>

      <section className="module-panel purchase-pending-panel">
        <div className="module-toolbar">
          <ToolbarSearch value={state.search} onChange={updateSearch} placeholder="Filtrar fornecedor, codigo, pedido ou status" />
          <label className="field module-search compact-field">
            <span>Comprador</span>
            <select className="input" value={state.buyerFilter} onChange={(event) => updateBuyerFilter(event.target.value)} disabled={!buyerOptions.length}>
              <option value="">Todos</option>
              {buyerOptions.map((buyer) => <option key={buyer} value={buyer}>{buyer}</option>)}
            </select>
          </label>
          {editable && (
            <label className="btn file-action">
              <IconText name="upload">Importar CSV/TSV</IconText>
              <input type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={importFile} />
            </label>
          )}
          <button className="btn" type="button" disabled={!filteredRows.length} onClick={exportCsv}><IconText name="download">Exportar Excel</IconText></button>
          {editable && <button className="btn" type="button" disabled={!state.rows.length} onClick={clearRows}><IconText name="trash">Limpar tabela</IconText></button>}
        </div>
        <div className="purchase-pending-origin">
          <span>Origem: <strong>{state.sourceName || 'Nenhuma tabela importada'}</strong></span>
          <span>Atualizado em: <strong>{formatDateTime(state.importedAt)}</strong></span>
          <span>Exibindo: <strong>{formatInteger(filteredRows.length)}</strong></span>
        </div>
      </section>

      <section className="module-panel purchase-buyer-delay-panel">
        <div className="panel-title">
          <h3>Atraso por comprador</h3>
          <span>{buyerDelayRows.length} comprador(es)</span>
        </div>
        <DataTable rows={buyerDelayRows} columns={[
          { key: 'buyer', label: 'Comprador' },
          { key: 'pending', label: 'Pendentes', format: formatInteger },
          { key: 'overdue', label: 'Atrasados', format: formatInteger },
          { key: 'averageDelayDays', label: 'Media atraso dias', format: formatNumber },
          { key: 'maxDelayDays', label: 'Maior atraso dias', format: formatInteger }
        ]} rowClass={(row) => Number(row.averageDelayDays || 0) > 0 ? 'row-warning' : ''} />
      </section>

      {resolvingRow && (
        <section className="module-panel purchase-resolve-panel">
          <div className="panel-title">
            <div>
              <h3>Dar baixa em pedido pendente</h3>
              <span>{purchasePendingRowLabel(resolvingRow)}</span>
            </div>
            <div className="panel-actions">
              <button className="btn" type="button" onClick={() => setResolvingRow(null)}><IconText name="close">Cancelar</IconText></button>
            </div>
          </div>
          <form className="admin-form" onSubmit={submitResolve}>
            <label className="field">
              <span>Observacao / motivo da baixa</span>
              <textarea
                className="input"
                rows={3}
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="Ex.: Material recebido, compra cancelada, item substituido ou resolvido fora do fluxo."
                required
              />
            </label>
            <div className="admin-form-actions">
              <button className="btn primary" type="submit"><IconText name="check">Confirmar baixa</IconText></button>
            </div>
          </form>
        </section>
      )}

      <section className="module-panel">
        <div className="panel-title">
          <h3>Consulta de compras pendentes</h3>
          <span>{visibleRows.length} registro(s)</span>
        </div>
        <DataTable
          rows={visibleRows}
          columns={columns}
          sortField={state.sortField}
          sortDirection={state.sortDirection}
          onSort={updateSort}
          rowClass={(row) => purchasePendingRowClass(row)}
          actions={editable ? (row) => (
            String(row.itemStatus || 'pending') === 'resolved'
              ? <span className="status-pill neutral">Baixado</span>
              : <button className="btn" type="button" onClick={() => openResolve(row)}><IconText name="check">Dar baixa</IconText></button>
          ) : undefined}
        />
      </section>
    </ModuleFrame>
  );
}

export function SequencingScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const [data, setData] = useState<Row | null>(null);
  const [ui, setUi] = useState<SequencingUiState>(() => loadSequencingUiState(user.id));
  const [drafts, setDrafts] = useState<Record<string, Record<string, SequencingDraft>>>({});
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('sequencingUiState', loadSequencingUiState(user.id), normalizeSequencingUiState)
      .then((value) => {
        if (ignore) return;
        setUi((current) => ({ ...value, activityKey: value.activityKey || current.activityKey }));
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    let ignore = false;
    api<Row>('/api/sequencing')
      .then((payload) => {
        if (ignore) return;
        const nextActivities = Array.isArray(payload.activities) ? payload.activities as Row[] : [];
        setData(payload);
        setDrafts(buildSequencingDrafts(nextActivities));
        setUi((current) => current.activityKey || !nextActivities[0]
          ? current
          : { ...current, activityKey: sequencingActivityKey(nextActivities[0]) });
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistSequencingUiState(user.id, ui);
  }, [preferencesReady, ui, user.id]);

  async function generate(activityKey = '') {
    if (!canEditSequencing) return;
    await runAction(setError, async () => {
      await api('/api/sequencing/generate', { method: 'POST', body: { activityKey } });
      setRefresh((value) => value + 1);
    });
  }

  const activities = Array.isArray(data?.activities) ? data.activities as Row[] : [];
  const selectedActivity = activities.find((activity) => sequencingActivityKey(activity) === ui.activityKey) || activities[0];
  const selectedActivityKey = selectedActivity ? sequencingActivityKey(selectedActivity) : '';
  const selectedRows = selectedActivity && Array.isArray(selectedActivity.items) ? selectedActivity.items as Row[] : [];
  const selectedDrafts = drafts[selectedActivityKey] || {};
  const orderedRows = useMemo(() => orderSequencingRows(selectedRows, selectedDrafts), [selectedRows, selectedDrafts]);
  const schedule = useMemo(
    () => buildSequencingSchedule(orderedRows, selectedDrafts, ui.startDateTime),
    [orderedRows, selectedDrafts, ui.startDateTime]
  );
  const scheduleStart = schedule[0]?.startAt || parseSequencingDateTime(ui.startDateTime);
  const scheduleEnd = schedule.length ? schedule[schedule.length - 1].endAt : scheduleStart;
  const totalEstimatedHours = schedule.reduce((sum, item) => sum + item.durationHours, 0);
  const pcpPendingCount = selectedRows.reduce((sum, row) => sum + (Number(row.pcpPendingCount) > 0 ? 1 : 0), 0);
  const canEditSequencing = canEdit(user, 'sequencing');

  function updateUi(patch: Partial<SequencingUiState>) {
    setUi((current) => ({ ...current, ...patch }));
  }

  function updateDraft(activityKey: string, row: Row, patch: Partial<SequencingDraft>) {
    if (!canEditSequencing) return;
    const orderKey = sequencingOrderKey(row);
    setDrafts((current) => ({
      ...current,
      [activityKey]: {
        ...(current[activityKey] || {}),
        [orderKey]: {
          ...sequencingDraftFromRow(row),
          ...(current[activityKey]?.[orderKey] || {}),
          ...patch
        }
      }
    }));
  }

  async function saveSelectedActivity() {
    if (!canEditSequencing || !selectedActivityKey) return;
    await runAction(setError, async () => {
      const items = selectedRows
        .filter((row) => row.orderId !== null && row.orderId !== undefined && row.orderId !== '')
        .map((row, index) => {
          const draft = selectedDrafts[sequencingOrderKey(row)] || sequencingDraftFromRow(row);
          return {
            orderId: row.orderId,
            sequenceNumber: normalizeSequencingSequence(draft.sequenceNumber, index + 1),
            estimatedHours: normalizeSequencingHours(draft.estimatedHours)
          };
        });
      await api(`/api/sequencing/${encodeURIComponent(selectedActivityKey)}`, { method: 'PATCH', body: { items } });
      setRefresh((value) => value + 1);
    });
  }

  function exportSelectedActivity() {
    if (!selectedActivity) return;
    exportSequencingCsv(selectedActivity, orderedRows, schedule);
  }

  function printSequencingReport() {
    if (!selectedActivity) return;
    printHtmlDocument(
      `Relatorio de Sequenciamento - ${String(selectedActivity.label || selectedActivity.key || '')}`,
      buildSequencingPrintDocument({
        activity: selectedActivity,
        rows: orderedRows,
        schedule,
        scheduleStart,
        scheduleEnd,
        totalEstimatedHours,
        pcpPendingCount
      })
    );
  }

  return (
    <ModuleFrame title="Sequenciamento" subtitle="Filas por atividade, tempo estimado e cronograma Gantt." error={error}>
      <div className="module-metrics compact">
        <Metric label="Atividade selecionada" value={String(selectedActivity?.label || selectedActivity?.key || '-')} />
        <Metric label="Itens pendentes" value={formatInteger(selectedRows.length)} />
        <Metric label="Tempo total estimado" value={`${formatNumber(totalEstimatedHours)} h`} />
        <Metric label="Com pendencia PCP" value={formatInteger(pcpPendingCount)} />
      </div>

      <section className="module-panel sequencing-toolbar-panel">
        <div className="module-toolbar sequencing-toolbar">
          <label className="field">
            <span>Atividade</span>
            <select className="input" value={selectedActivityKey} onChange={(event) => updateUi({ activityKey: event.target.value })}>
              {activities.map((activity) => (
                <option key={sequencingActivityKey(activity)} value={sequencingActivityKey(activity)}>
                  {String(activity.label || activity.key)} ({Array.isArray(activity.items) ? activity.items.length : 0})
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Inicio do cronograma</span>
            <input className="input" type="datetime-local" value={ui.startDateTime} onChange={(event) => updateUi({ startDateTime: event.target.value })} />
          </label>
          {canEditSequencing && (
            <>
              <button className="btn" type="button" onClick={() => generate(selectedActivityKey)} disabled={!selectedActivityKey}>Gerar fila</button>
              <button className="btn primary" type="button" onClick={saveSelectedActivity} disabled={!selectedActivityKey}>Salvar sequencia</button>
              <button className="btn" type="button" onClick={() => generate('')}>Gerar geral</button>
            </>
          )}
          <button className="btn" type="button" onClick={exportSelectedActivity} disabled={!orderedRows.length}>Exportar Excel</button>
          <button className="btn" type="button" onClick={printSequencingReport} disabled={!orderedRows.length}><IconText name="printer">Imprimir</IconText></button>
        </div>
      </section>

      <section className="module-panel">
        <div className="panel-title">
          <h3>Fila de trabalho</h3>
          <span>{orderedRows.length} itens em sequencia</span>
        </div>
        <div className="generic-table-wrap sequencing-table-wrap">
          <table className="generic-table sequencing-table">
            <thead>
              <tr>
                <th>Seq.</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>SKU</th>
                <th>OP</th>
                <th>Linha</th>
                <th>Equipamento</th>
                <th>Capacidade</th>
                <th>Qtd.</th>
                <th>Status</th>
                <th>Entrega prod.</th>
                <th>Atraso</th>
                <th>Pend. PCP</th>
                <th>Tempo estimado h</th>
              </tr>
            </thead>
            <tbody>
              {orderedRows.map((row, index) => {
                const orderKey = sequencingOrderKey(row);
                const draft = selectedDrafts[orderKey] || sequencingDraftFromRow(row);
                const pending = Number(row.pcpPendingCount) > 0;
                return (
                  <tr key={`${selectedActivityKey}-${orderKey || index}`} className={pending ? 'row-warning' : ''}>
                    <td>
                      <input
                        className="input sequence-input"
                        type="number"
                        min="1"
                        step="1"
                        value={draft.sequenceNumber}
                        disabled={!canEditSequencing}
                        onChange={(event) => updateDraft(selectedActivityKey, row, { sequenceNumber: event.target.value })}
                      />
                    </td>
                    <td>{String(row.orderNumber || '-')}</td>
                    <td title={String(row.customer || '')}>{String(row.customer || '-')}</td>
                    <td>{String(row.sku || '-')}</td>
                    <td>{String(row.productionOrder || '-')}</td>
                    <td>{String(row.productLine || '-')}</td>
                    <td>{String(row.equipment || '-')}</td>
                    <td>{formatLoose(row.capacityTr)}</td>
                    <td>{formatInteger(row.quantity)}</td>
                    <td>{String(row.status || '-')}</td>
                    <td>{formatDate(row.productionDeliveryDate)}</td>
                    <td>{formatInteger(row.daysLate)}</td>
                    <td title={String(row.pcpPendingSummary || '')}>{pending ? `${formatInteger(row.pcpPendingCount)} pend.` : '-'}</td>
                    <td>
                      <input
                        className="input sequence-input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={draft.estimatedHours}
                        disabled={!canEditSequencing}
                        onChange={(event) => updateDraft(selectedActivityKey, row, { estimatedHours: event.target.value })}
                      />
                    </td>
                  </tr>
                );
              })}
              {!orderedRows.length && (
                <tr>
                  <td className="empty" colSpan={14}>Nenhum pedido pendente nesta atividade.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="module-panel sequencing-gantt-panel">
        <div className="panel-title">
          <h3>Cronograma Gantt</h3>
          <span>{formatLocalDateTime(scheduleStart)} ate {formatLocalDateTime(scheduleEnd)}</span>
        </div>
        <div className="gantt-header-line">
          <span>Cabecalho: data e hora</span>
          <strong>Inicio {formatLocalDateTime(scheduleStart)}</strong>
          <strong>Fim {formatLocalDateTime(scheduleEnd)}</strong>
        </div>
        <div className="gantt-grid">
          {schedule.map((item, index) => (
            <div className="gantt-row" key={`gantt-${sequencingOrderKey(item.row) || index}`}>
              <div className="gantt-label">
                <strong>{formatInteger(item.sequenceNumber)}. Pedido {String(item.row.orderNumber || '-')}</strong>
                <span>{String(item.row.customer || '-')} | {String(item.row.sku || '-')}</span>
              </div>
              <div className="gantt-track">
                <div
                  className="gantt-bar"
                  style={{ left: `${item.offsetPercent}%`, width: `${item.widthPercent}%` }}
                  title={`${formatLocalDateTime(item.startAt)} - ${formatLocalDateTime(item.endAt)}`}
                >
                  {formatNumber(item.durationHours)} h
                </div>
              </div>
              <div className="gantt-time">
                <span>{formatLocalDateTime(item.startAt)}</span>
                <span>{formatLocalDateTime(item.endAt)}</span>
              </div>
            </div>
          ))}
          {!schedule.length && <div className="chart-empty">Sem itens para montar o cronograma.</div>}
        </div>
      </section>
      {!!orderedRows.length && (
        <SequencingPrintSheet
          activity={selectedActivity}
          rows={orderedRows}
          schedule={schedule}
          scheduleStart={scheduleStart}
          scheduleEnd={scheduleEnd}
          totalEstimatedHours={totalEstimatedHours}
          pcpPendingCount={pcpPendingCount}
        />
      )}
    </ModuleFrame>
  );
}

function SequencingPrintSheet({
  activity,
  rows,
  schedule,
  scheduleStart,
  scheduleEnd,
  totalEstimatedHours,
  pcpPendingCount
}: {
  activity?: Row;
  rows: Row[];
  schedule: SequencingScheduleItem[];
  scheduleStart: Date;
  scheduleEnd: Date;
  totalEstimatedHours: number;
  pcpPendingCount: number;
}) {
  const scheduleByOrder = new Map(schedule.map((item) => [sequencingOrderKey(item.row), item]));
  const activityLabel = String(activity?.label || activity?.key || '-');

  return (
    <section className="sequencing-print-sheet" aria-hidden="true">
      <header className="sequencing-print-header">
        <img src="/mge-logo.png" alt="MGE air" />
        <div>
          <span>Synapse | MGE Smart System</span>
          <h1>Relatorio de Sequenciamento</h1>
          <p>{activityLabel}</p>
        </div>
        <strong>{formatLocalDateTime(new Date())}</strong>
      </header>

      <div className="sequencing-print-meta">
        <article>
          <span>Atividade</span>
          <strong>{activityLabel}</strong>
        </article>
        <article>
          <span>Itens na fila</span>
          <strong>{formatInteger(rows.length)}</strong>
        </article>
        <article>
          <span>Tempo total</span>
          <strong>{formatNumber(totalEstimatedHours)} h</strong>
        </article>
        <article>
          <span>Pendencias PCP</span>
          <strong>{formatInteger(pcpPendingCount)}</strong>
        </article>
        <article>
          <span>Inicio</span>
          <strong>{formatLocalDateTime(scheduleStart)}</strong>
        </article>
        <article>
          <span>Fim</span>
          <strong>{formatLocalDateTime(scheduleEnd)}</strong>
        </article>
      </div>

      <div className="sequencing-print-gantt">
        <h2>Cronograma Gantt</h2>
        {schedule.map((item, index) => (
          <div className="sequencing-print-gantt-row" key={`print-gantt-${sequencingOrderKey(item.row) || index}`}>
            <div>
              <strong>{formatInteger(item.sequenceNumber)}. Pedido {String(item.row.orderNumber || '-')}</strong>
              <span>{String(item.row.customer || '-')} | {String(item.row.sku || '-')}</span>
            </div>
            <div className="sequencing-print-gantt-track">
              <span style={{ left: `${item.offsetPercent}%`, width: `${item.widthPercent}%` }}>{formatNumber(item.durationHours)} h</span>
            </div>
            <small>{formatLocalDateTime(item.startAt)} - {formatLocalDateTime(item.endAt)}</small>
          </div>
        ))}
      </div>

      <table className="sequencing-print-table">
        <thead>
          <tr>
            <th>Seq.</th>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>SKU</th>
            <th>OP</th>
            <th>Linha</th>
            <th>Qtd.</th>
            <th>Status</th>
            <th>Inicio</th>
            <th>Fim</th>
            <th>Tempo h</th>
            <th>Pendencias</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const item = scheduleByOrder.get(sequencingOrderKey(row));
            return (
              <tr key={`print-row-${sequencingOrderKey(row) || index}`}>
                <td>{formatInteger(item?.sequenceNumber || index + 1)}</td>
                <td>{String(row.orderNumber || '-')}</td>
                <td>{String(row.customer || '-')}</td>
                <td>{String(row.sku || '-')}</td>
                <td>{String(row.productionOrder || '-')}</td>
                <td>{String(row.productLine || '-')}</td>
                <td>{formatInteger(row.quantity)}</td>
                <td>{String(row.status || '-')}</td>
                <td>{item ? formatLocalDateTime(item.startAt) : '-'}</td>
                <td>{item ? formatLocalDateTime(item.endAt) : '-'}</td>
                <td>{item ? formatNumber(item.durationHours) : '-'}</td>
                <td>{String(row.pcpPendingSummary || (Number(row.pcpPendingCount) > 0 ? `${formatInteger(row.pcpPendingCount)} pend.` : '-'))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function buildSequencingPrintDocument({
  activity,
  rows,
  schedule,
  scheduleStart,
  scheduleEnd,
  totalEstimatedHours,
  pcpPendingCount
}: {
  activity: Row;
  rows: Row[];
  schedule: SequencingScheduleItem[];
  scheduleStart: Date;
  scheduleEnd: Date;
  totalEstimatedHours: number;
  pcpPendingCount: number;
}) {
  const scheduleByOrder = new Map(schedule.map((item) => [sequencingOrderKey(item.row), item]));
  const activityLabel = String(activity.label || activity.key || '-');
  const printedAt = formatLocalDateTime(new Date());
  const ganttRows = schedule.map((item, index) => `
    <div class="gantt-row">
      <div class="gantt-label">
        <strong>${escapeHtml(formatInteger(item.sequenceNumber))}. Pedido ${escapeHtml(item.row.orderNumber || '-')}</strong>
        <span>${escapeHtml(item.row.customer || '-')} | ${escapeHtml(item.row.sku || '-')}</span>
      </div>
      <div class="gantt-track">
        <span style="left:${printPercent(item.offsetPercent)};width:${printPercent(item.widthPercent)}">${escapeHtml(formatNumber(item.durationHours))} h</span>
      </div>
      <small>${escapeHtml(formatLocalDateTime(item.startAt))} - ${escapeHtml(formatLocalDateTime(item.endAt))}</small>
    </div>
  `).join('');
  const tableRows = rows.map((row, index) => {
    const item = scheduleByOrder.get(sequencingOrderKey(row));
    const pcpPending = String(row.pcpPendingSummary || (Number(row.pcpPendingCount) > 0 ? `${formatInteger(row.pcpPendingCount)} pend.` : '-'));
    return `
      <tr>
        <td>${escapeHtml(formatInteger(item?.sequenceNumber || index + 1))}</td>
        <td>${escapeHtml(row.orderNumber || '-')}</td>
        <td>${escapeHtml(row.customer || '-')}</td>
        <td>${escapeHtml(row.sku || '-')}</td>
        <td>${escapeHtml(row.productionOrder || '-')}</td>
        <td>${escapeHtml(row.productLine || '-')}</td>
        <td>${escapeHtml(formatInteger(row.quantity))}</td>
        <td>${escapeHtml(row.status || '-')}</td>
        <td>${escapeHtml(item ? formatLocalDateTime(item.startAt) : '-')}</td>
        <td>${escapeHtml(item ? formatLocalDateTime(item.endAt) : '-')}</td>
        <td>${escapeHtml(item ? formatNumber(item.durationHours) : '-')}</td>
        <td>${escapeHtml(pcpPending)}</td>
      </tr>
    `;
  }).join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(`Relatorio de Sequenciamento - ${activityLabel}`)}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; background: #ffffff; font-family: Arial, sans-serif; }
    .report { width: 100%; }
    .header { display: grid; grid-template-columns: 76px 1fr auto; align-items: center; gap: 14px; padding-bottom: 10px; border-bottom: 2px solid #1f4e79; }
    .header img { max-width: 76px; max-height: 48px; }
    .header span { display: block; color: #4b5563; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .header h1 { margin: 2px 0; color: #102a43; font-size: 21px; }
    .header p { margin: 0; color: #374151; font-size: 12px; font-weight: 700; }
    .header strong { color: #374151; font-size: 11px; }
    .meta { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 7px; margin: 12px 0; }
    .metric { min-height: 48px; padding: 7px; border: 1px solid #d8e0ea; border-radius: 5px; break-inside: avoid; }
    .metric span { display: block; color: #64748b; font-size: 8px; font-weight: 800; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 3px; color: #111827; font-size: 11px; }
    .gantt { display: grid; gap: 5px; margin-bottom: 12px; break-inside: avoid; }
    .gantt h2 { margin: 0 0 3px; color: #102a43; font-size: 14px; }
    .gantt-row { display: grid; grid-template-columns: 180px minmax(240px, 1fr) 170px; gap: 7px; align-items: center; min-height: 26px; }
    .gantt-label strong, .gantt-label span, .gantt-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gantt-label strong { color: #111827; font-size: 9px; }
    .gantt-label span, .gantt-row small { color: #64748b; font-size: 8px; }
    .gantt-track { position: relative; height: 18px; overflow: hidden; background: #eef2f7; border: 1px solid #d8e0ea; border-radius: 5px; }
    .gantt-track span { position: absolute; top: 2px; bottom: 2px; min-width: 22px; display: grid; place-items: center; color: #ffffff; background: #0f5ea8; border-radius: 4px; font-size: 8px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; font-size: 8px; }
    th, td { padding: 4px 5px; border: 1px solid #d8e0ea; text-align: left; vertical-align: top; }
    th { color: #102a43; background: #eef5fb; font-size: 8px; text-transform: uppercase; }
    tr { break-inside: avoid; }
  </style>
</head>
<body>
  <main class="report">
    <header class="header">
      <img src="/mge-logo.png" alt="MGE air" />
      <div>
        <span>Synapse | MGE Smart System</span>
        <h1>Relatorio de Sequenciamento</h1>
        <p>${escapeHtml(activityLabel)}</p>
      </div>
      <strong>${escapeHtml(printedAt)}</strong>
    </header>
    <section class="meta">
      <article class="metric"><span>Atividade</span><strong>${escapeHtml(activityLabel)}</strong></article>
      <article class="metric"><span>Itens na fila</span><strong>${escapeHtml(formatInteger(rows.length))}</strong></article>
      <article class="metric"><span>Tempo total</span><strong>${escapeHtml(formatNumber(totalEstimatedHours))} h</strong></article>
      <article class="metric"><span>Pendencias PCP</span><strong>${escapeHtml(formatInteger(pcpPendingCount))}</strong></article>
      <article class="metric"><span>Inicio</span><strong>${escapeHtml(formatLocalDateTime(scheduleStart))}</strong></article>
      <article class="metric"><span>Fim</span><strong>${escapeHtml(formatLocalDateTime(scheduleEnd))}</strong></article>
    </section>
    <section class="gantt">
      <h2>Cronograma Gantt</h2>
      ${ganttRows || '<p>Sem itens para montar o cronograma.</p>'}
    </section>
    <table>
      <thead>
        <tr>
          <th>Seq.</th><th>Pedido</th><th>Cliente</th><th>SKU</th><th>OP</th><th>Linha</th><th>Qtd.</th><th>Status</th><th>Inicio</th><th>Fim</th><th>Tempo h</th><th>Pendencias</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </main>
</body>
</html>`;
}

function printHtmlDocument(title: string, html: string) {
  const frame = document.createElement('iframe');
  frame.title = title;
  frame.style.position = 'fixed';
  frame.style.left = '-10000px';
  frame.style.top = '0';
  frame.style.width = '1123px';
  frame.style.height = '794px';
  frame.style.border = '0';
  frame.setAttribute('aria-hidden', 'true');
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const frameDocument = frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    frame.remove();
    window.print();
    return;
  }

  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();

  window.setTimeout(() => {
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(() => frame.remove(), 1200);
  }, 300);
}

function printPercent(value: number) {
  const clean = Number.isFinite(value) ? value : 0;
  return `${Math.min(100, Math.max(0, clean)).toFixed(3)}%`;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ApsScreen({ user, realtimeRefreshKey = 0, configFocus }: ModuleProps & { configFocus?: ApsConfigFocus }) {
  const [aps, setAps] = useState<Row | null>(null);
  const [config, setConfig] = useState<ApsConfig>(() => defaultApsConfig());
  const [ui, setUi] = useState<ApsUiState>(() => loadApsUiState(user.id));
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [ganttFullscreen, setGanttFullscreen] = useState(false);

  useEffect(() => {
    let ignore = false;
    setPreferencesReady(false);
    loadPreferenceState('apsUiState', loadApsUiState(user.id), normalizeApsUiState)
      .then((value) => {
        if (!ignore) setUi(value);
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    let ignore = false;
    api<{ aps?: Row }>('/api/aps')
      .then((data) => {
        if (ignore) return;
        const nextAps = data.aps || {};
        const nextConfig = normalizeApsConfig(nextAps.config);
        setAps(nextAps);
        setConfig(nextConfig);
        setUi((current) => ({ ...current, priorityRule: nextConfig.settings.priorityRule || current.priorityRule }));
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey]);

  useEffect(() => {
    if (!preferencesReady) return;
    persistApsUiState(user.id, ui);
  }, [preferencesReady, ui, user.id]);

  useEffect(() => {
    if (!configFocus || configFocus === 'calendar') return;
    setUi((current) => current.configTab === configFocus ? current : { ...current, configTab: configFocus });
  }, [configFocus]);

  const sequencing = (aps?.sequencing || {}) as Row;
  const activities = Array.isArray(sequencing.activities) ? sequencing.activities as Row[] : [];
  const orders = Array.isArray(aps?.orders) ? aps.orders as Row[] : [];
  const learnedTimeRows = useMemo(
    () => buildApsLearnedTimeRows(config.timeRecords, config.operations),
    [config.timeRecords, config.operations]
  );
  const canEditAps = canEdit(user, 'aps');
  const runConfig = useMemo(() => ({
    ...config,
    settings: {
      ...config.settings,
      priorityRule: ui.priorityRule
    }
  }), [config, ui.priorityRule]);
  const schedule = useMemo(() => buildApsScheduleReact(aps || {}, runConfig, ui.startDate, 'Atual'), [aps, runConfig, ui.startDate]);
  const simulatedSchedule = useMemo(
    () => buildApsScheduleReact(aps || {}, apsScenarioConfigReact(runConfig, ui), ui.startDate, 'Simulado'),
    [aps, runConfig, ui, ui.startDate]
  );
  const bestSchedule = chooseBestApsScheduleReact(schedule, simulatedSchedule);
  const recommendations = apsRecommendations(schedule, simulatedSchedule, bestSchedule);
  const configOnly = Boolean(configFocus);
  const activeConfigTab = configFocus && configFocus !== 'calendar' ? configFocus : ui.configTab;
  const showApsSettings = !configFocus || configFocus === 'calendar';
  const showApsCalendar = configFocus === 'calendar';
  const showApsTabs = !configFocus;
  const showApsOperations = activeConfigTab === 'operations' && configFocus !== 'calendar';
  const showApsCenters = activeConfigTab === 'centers' && configFocus !== 'calendar';
  const showApsOperators = activeConfigTab === 'operators' && configFocus !== 'calendar';
  const frameTitle = configFocus ? apsConfigFocusTitle(configFocus) : 'APS';
  const frameSubtitle = configFocus ? apsConfigFocusSubtitle(configFocus) : 'Programacao finita, centros de trabalho, operadores e simulacao.';

  function updateUi(patch: Partial<ApsUiState>) {
    setUi((current) => ({ ...current, ...patch }));
  }

  function updateConfig(updater: (current: ApsConfig) => ApsConfig) {
    if (!canEditAps) return;
    setSuccess('');
    setConfig((current) => normalizeApsConfig(updater(cloneApsConfig(current))));
  }

  async function persistApsConfig(nextConfig: ApsConfig, message: string) {
    if (!canEditAps) return;
    setSuccess('');
    await runAction(setError, async () => {
      const payload = await api<{ config?: Row }>('/api/aps/config', { method: 'PUT', body: { config: nextConfig } });
      setConfig(normalizeApsConfig(payload.config || nextConfig));
      setRefresh((value) => value + 1);
      setSuccess(message);
    });
  }

  function commitConfig(updater: (current: ApsConfig) => ApsConfig, message: string) {
    if (!canEditAps) return;
    const nextConfig = normalizeApsConfig(updater(cloneApsConfig(config)));
    setConfig(nextConfig);
    void persistApsConfig(nextConfig, message);
  }

  function updateSettings(patch: Partial<ApsSettings>) {
    updateConfig((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }

  function saveOperation(index: number | null, operation: ApsOperation) {
    commitConfig((current) => ({
      ...current,
      operations: index !== null && current.operations[index]
        ? current.operations.map((row, rowIndex) => (rowIndex === index ? normalizeApsOperation(operation) : row))
        : [...current.operations, normalizeApsOperation(operation)]
    }), 'Operacao APS salva no banco.');
  }

  function saveTimeRecord(index: number | null, record: ApsTimeRecord) {
    commitConfig((current) => {
      const cleanRecord = normalizeApsTimeRecord(record);
      const timeRecords = index !== null && current.timeRecords[index]
        ? current.timeRecords.map((row, rowIndex) => (rowIndex === index ? cleanRecord : row))
        : [...current.timeRecords, cleanRecord];
      return { ...current, timeRecords };
    }, 'Tempo APS salvo no banco.');
  }

  function removeTimeRecord(id: string) {
    commitConfig((current) => ({
      ...current,
      timeRecords: current.timeRecords.filter((record) => record.id !== id)
    }), 'Tempo APS excluido do banco.');
  }

  function removeWorkCenter(code: string) {
    commitConfig((current) => ({
      ...current,
      workCenters: current.workCenters.filter((center) => center.code !== code),
      operators: current.operators.map((operator) => ({
        ...operator,
        enabledCenters: operator.enabledCenters.filter((centerCode) => centerCode !== code)
      })),
      operations: current.operations.map((operation) => ({
        ...operation,
        allowedCenters: operation.allowedCenters.filter((centerCode) => centerCode !== code)
      }))
    }), 'Centro de trabalho excluido e salvo no banco.');
  }

  function saveWorkCenter(index: number | null, center: ApsWorkCenter) {
    commitConfig((current) => {
      const cleanCenter = normalizeApsWorkCenter(center);
      const previousCode = index !== null ? current.workCenters[index]?.code : '';
      const workCenters = index !== null && current.workCenters[index]
        ? current.workCenters.map((row, rowIndex) => (rowIndex === index ? cleanCenter : row))
        : [...current.workCenters, cleanCenter];
      const replaceCenterCode = (codes: string[]) => codes.map((code) => previousCode && code === previousCode ? cleanCenter.code : code);

      return {
        ...current,
        workCenters,
        operators: current.operators.map((operator) => ({
          ...operator,
          enabledCenters: replaceCenterCode(operator.enabledCenters)
        })),
        operations: current.operations.map((operation) => ({
          ...operation,
          allowedCenters: replaceCenterCode(operation.allowedCenters)
        }))
      };
    }, 'Centro de trabalho salvo no banco.');
  }

  function saveOperator(index: number | null, operator: ApsOperator) {
    commitConfig((current) => {
      const cleanOperator = normalizeApsOperator(operator);
      const operators = index !== null && current.operators[index]
        ? current.operators.map((row, rowIndex) => (rowIndex === index ? cleanOperator : row))
        : [...current.operators, cleanOperator];
      return { ...current, operators };
    }, 'Operador APS salvo no banco.');
  }

  function removeOperator(code: string) {
    commitConfig((current) => ({
      ...current,
      operators: current.operators.filter((operator) => operator.code !== code)
    }), 'Operador APS excluido do banco.');
  }

  async function saveConfig() {
    if (!canEditAps) return;
    await persistApsConfig(config, 'Configuracao APS salva.');
  }

  function exportSchedule() {
    exportApsScheduleCsv(schedule);
  }

  return (
    <ModuleFrame title={frameTitle} subtitle={frameSubtitle} error={error}>
      {success && <p className="success-message">{success}</p>}
      {!configOnly && <div className="module-metrics">
        <Metric label="Makespan previsto" value={`${formatNumber(schedule.metrics.makespanDays)} dias`} />
        <Metric label="OTIF previsto" value={`${formatNumber(schedule.metrics.otif)}%`} />
        <Metric label="Operacoes em atraso" value={formatInteger(schedule.metrics.lateOperations)} />
        <Metric label="Gargalo principal" value={schedule.metrics.bottleneck ? `${schedule.metrics.bottleneck.code} ${formatNumber(schedule.metrics.bottleneck.utilization)}%` : 'Sem carga'} />
      </div>}

      {!configOnly && <section className="module-panel">
        <div className="module-toolbar aps-toolbar-react">
          <label className="field">
            <span>Inicio</span>
            <input className="input" type="date" value={ui.startDate} onChange={(event) => updateUi({ startDate: event.target.value })} />
          </label>
          <label className="field">
            <span>Regra prioridade</span>
            <select className="input" value={ui.priorityRule} onChange={(event) => updateUi({ priorityRule: event.target.value === 'MANUAL' ? 'MANUAL' : 'EDD' })}>
              <option value="EDD">EDD - menor data prometida</option>
              <option value="MANUAL">Manual / sequencia cadastrada</option>
            </select>
          </label>
          <label className="field">
            <span>Hora extra diaria</span>
            <input className="input" type="number" min="0" max="8" step="0.5" value={ui.scenarioExtraHours} onChange={(event) => updateUi({ scenarioExtraHours: event.target.value })} />
          </label>
          <label className="field">
            <span>Ganho operador %</span>
            <input className="input" type="number" min="0" max="50" step="1" value={ui.scenarioOperatorBoost} onChange={(event) => updateUi({ scenarioOperatorBoost: event.target.value })} />
          </label>
          <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}>Atualizar</button>
          <button className="btn" type="button" onClick={exportSchedule} disabled={!schedule.rows.length}>Exportar Excel</button>
          <button className="btn" type="button" onClick={() => window.print()} disabled={!schedule.rows.length}>Imprimir</button>
          {canEditAps && <button className="btn primary" type="button" onClick={saveConfig}>Salvar APS</button>}
        </div>
      </section>}

      {!configOnly && <div className="dashboard-chart-grid">
        <section className={`module-panel aps-gantt-panel-react ${ganttFullscreen ? 'is-fullscreen' : ''}`}>
          <div className="panel-title">
            <div>
              <h3>Gantt APS</h3>
              <span>{formatLocalDateTime(schedule.rangeStart)} ate {formatLocalDateTime(schedule.rangeEnd)}</span>
            </div>
            <div className="panel-actions">
              <button className="btn" type="button" onClick={() => setGanttFullscreen((value) => !value)}>
                <IconText name="expand">{ganttFullscreen ? 'Reduzir' : 'Tela cheia'}</IconText>
              </button>
            </div>
          </div>
          <div className="gantt-header-line">
            <span>{schedule.metrics.totalOperations} operacoes</span>
            <strong>Fim previsto {formatLocalDateTime(schedule.rangeEnd)}</strong>
            <strong>{formatInteger(schedule.metrics.lateOrders)} OPs em atraso</strong>
          </div>
          <DhtmlxApsGantt schedule={schedule} />
        </section>

        <section className="module-panel">
          <div className="panel-title">
            <h3>Analise APS</h3>
            <span>Cenario atual x simulado</span>
          </div>
          <DataTable rows={[
            apsScenarioSummaryRow(schedule),
            apsScenarioSummaryRow(simulatedSchedule),
            { ...apsScenarioSummaryRow(bestSchedule), scenarioName: 'Melhor opcao' }
          ]} columns={[
            { key: 'scenarioName', label: 'Cenario' },
            { key: 'rangeEnd', label: 'Fim previsto' },
            { key: 'lateOrders', label: 'OPs atraso', format: formatInteger },
            { key: 'otif', label: 'OTIF %', format: formatNumber },
            { key: 'bottleneck', label: 'Gargalo' },
            { key: 'recommendation', label: 'Recomendacao' }
          ]} />
          <div className="insight-list">
            {recommendations.map((item, index) => <p key={index}>{item}</p>)}
          </div>
        </section>
      </div>}

      {!configOnly && <section className="module-panel">
        <div className="panel-title">
          <h3>Programacao calculada</h3>
          <span>{schedule.rows.length} operacoes</span>
        </div>
        <DataTable rows={schedule.rows} rowClass={(row) => Number(row.delayDays) > 0 ? 'row-danger' : ''} columns={[
          { key: 'productionOrder', label: 'OP', format: (_value, row) => String(row.productionOrder || 'Sem OP') },
          { key: 'orderNumber', label: 'Pedido' },
          { key: 'customer', label: 'Cliente' },
          { key: 'operationLabel', label: 'Operacao' },
          { key: 'centerCode', label: 'Centro' },
          { key: 'machineCode', label: 'Maquina' },
          { key: 'operatorName', label: 'Operador' },
          { key: 'startAt', label: 'Inicio', format: (value) => formatLocalDateTime(value as Date) },
          { key: 'endAt', label: 'Fim', format: (value) => formatLocalDateTime(value as Date) },
          { key: 'setupHours', label: 'Setup h', format: formatNumber },
          { key: 'processHours', label: 'Proc. h', format: formatNumber },
          { key: 'timeSource', label: 'Base tempo' },
          { key: 'queueHours', label: 'Fila h', format: formatNumber },
          { key: 'dueDate', label: 'Prometida', format: formatDate },
          { key: 'delayDays', label: 'Atraso', format: formatInteger }
        ]} />
      </section>}

      {!configOnly && <section className="module-panel">
        <div className="panel-title">
          <h3>Base operacional</h3>
          <span>{orders.length} pedidos ativos de producao | {activities.length} filas do sequenciamento</span>
        </div>
        <div className="split-grid">
          <SimplePanel title="Operacoes por status" rows={config.operations.map((operation) => ({
            sortOrder: operation.sortOrder,
            description: operation.description,
            category: operation.category === 'production' ? 'Producao' : 'Auxiliar',
            setupHours: operation.setupHours,
            processHours: operation.processHours,
            allowedCenters: operation.allowedCenters.join(', ') || 'Todos'
          }))} columns={[
            { key: 'sortOrder', label: 'Seq.', format: formatInteger },
            { key: 'description', label: 'Operacao' },
            { key: 'category', label: 'Tipo' },
            { key: 'setupHours', label: 'Setup h', format: formatNumber },
            { key: 'processHours', label: 'Proc. h', format: formatNumber },
            { key: 'allowedCenters', label: 'Centros' }
          ]} />
          <SimplePanel title="Filas do sequenciamento" rows={activities.map((activity) => ({
            activity: activity.label || activity.key,
            pending: Array.isArray(activity.items) ? activity.items.length : 0
          }))} columns={[
            { key: 'activity', label: 'Atividade' },
            { key: 'pending', label: 'Itens pendentes', format: formatInteger }
          ]} />
        </div>
      </section>}

      <section className="module-panel">
        <div className="panel-title">
          <h3>{configFocus ? frameTitle : 'Configuracao APS'}</h3>
          <div className="panel-actions">
            {showApsTabs && (
              <>
                <button className={`btn ${ui.configTab === 'operations' ? 'primary' : ''}`} type="button" onClick={() => updateUi({ configTab: 'operations' })}>Operacoes</button>
                <button className={`btn ${ui.configTab === 'centers' ? 'primary' : ''}`} type="button" onClick={() => updateUi({ configTab: 'centers' })}>Centros</button>
                <button className={`btn ${ui.configTab === 'operators' ? 'primary' : ''}`} type="button" onClick={() => updateUi({ configTab: 'operators' })}>Operadores</button>
              </>
            )}
            {configOnly && <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}>Atualizar</button>}
            {configOnly && canEditAps && <button className="btn primary" type="button" onClick={saveConfig}>Salvar APS</button>}
          </div>
        </div>
        {showApsSettings && <div className="module-toolbar aps-settings-grid">
          <label className="field">
            <span>Inicio jornada</span>
            <input className="input" type="time" value={config.settings.workdayStart} disabled={!canEditAps} onChange={(event) => updateSettings({ workdayStart: event.target.value })} />
          </label>
          <label className="field">
            <span>Horas dia</span>
            <input className="input" type="number" min="1" max="24" step="0.5" value={config.settings.dailyHours} disabled={!canEditAps} onChange={(event) => updateSettings({ dailyHours: toNumber(event.target.value, 8) })} />
          </label>
          <label className="field">
            <span>Inicio almoco</span>
            <input className="input" type="time" value={config.settings.lunchStart} disabled={!canEditAps} onChange={(event) => updateSettings({ lunchStart: event.target.value })} />
          </label>
          <label className="field">
            <span>Almoco min.</span>
            <input className="input" type="number" min="0" max="240" step="5" value={config.settings.lunchMinutes} disabled={!canEditAps} onChange={(event) => updateSettings({ lunchMinutes: toNumber(event.target.value, 60) })} />
          </label>
        </div>}

        {!configFocus && (
          <ApsTimeLearningEditor
            records={config.timeRecords}
            learnedRows={learnedTimeRows}
            orders={orders}
            operations={config.operations}
            canEdit={canEditAps}
            enabled={config.settings.timeLearningEnabled}
            onToggleEnabled={(enabled) => updateSettings({ timeLearningEnabled: enabled })}
            onSave={saveTimeRecord}
            onRemove={removeTimeRecord}
          />
        )}

        {showApsCalendar && (
          <ApsProductiveCalendarEditor settings={config.settings} canEdit={canEditAps} onUpdate={updateSettings} />
        )}

        {showApsOperations && (
          <ApsOperationsEditor operations={config.operations} centers={config.workCenters} canEdit={canEditAps} onSave={saveOperation} />
        )}
        {showApsCenters && (
          <ApsCentersEditor centers={config.workCenters} canEdit={canEditAps} onSave={saveWorkCenter} onRemove={removeWorkCenter} />
        )}
        {showApsOperators && (
          <ApsOperatorsEditor
            operators={config.operators}
            operations={config.operations}
            centers={config.workCenters}
            canEdit={canEditAps}
            onSave={saveOperator}
            onRemove={removeOperator}
          />
        )}
      </section>
    </ModuleFrame>
  );
}

function apsConfigFocusTitle(focus: ApsConfigFocus) {
  if (focus === 'operators') return 'Cadastro de operadores';
  if (focus === 'calendar') return 'Cadastro calendario produtivo e jornada de trabalho';
  if (focus === 'centers') return 'Cadastro de centro de trabalho';
  return 'Cadastro de operacoes';
}

function apsConfigFocusSubtitle(focus: ApsConfigFocus) {
  if (focus === 'operators') return 'Operadores, habilidades e vinculacao com operacoes qualificadas.';
  if (focus === 'calendar') return 'Jornada de trabalho, almoco, horas produtivas e regra de prioridade.';
  if (focus === 'centers') return 'Centros de trabalho, maquinas, capacidade, eficiencia e calendario.';
  return 'Operacoes puxadas dos status, tempos, lote, operadores e centros permitidos.';
}

const DHTMLX_GANTT_JS_URL = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js';
const DHTMLX_GANTT_CSS_URL = 'https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css';

function DhtmlxApsGantt({ schedule }: { schedule: ApsSchedule }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    if (!schedule.rows.length) {
      setState('ready');
      setMessage('');
      container.innerHTML = '';
      return;
    }

    setState('loading');
    setMessage('Carregando DHTMLX Gantt Community...');

    loadDhtmlxGantt()
      .then((gantt) => {
        if (cancelled || !containerRef.current) return;
        configureDhtmlxApsGantt(gantt);
        containerRef.current.innerHTML = '';
        gantt.clearAll();
        gantt.init(containerRef.current);
        gantt.parse(buildDhtmlxApsGanttData(schedule));
        setState('ready');
        setMessage('DHTMLX Gantt Community');
      })
      .catch((error) => {
        if (cancelled) return;
        setState('fallback');
        setMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o DHTMLX Gantt.');
      });

    return () => {
      cancelled = true;
    };
  }, [schedule]);

  if (!schedule.rows.length) {
    return <div className="chart-empty">Nenhuma operacao pendente para programar.</div>;
  }

  return (
    <div className="dhtmlx-aps-gantt-shell">
      <div className="dhtmlx-aps-gantt-status">
        <span>{state === 'fallback' ? 'Gantt interno' : message}</span>
        {state === 'fallback' && <strong>{message}</strong>}
      </div>
      <div className={`dhtmlx-aps-gantt-frame ${state === 'fallback' ? 'is-hidden' : ''}`} ref={containerRef} />
      {state === 'loading' && <div className="chart-empty">Carregando Gantt profissional...</div>}
      {state === 'fallback' && <ApsInternalGantt schedule={schedule} />}
    </div>
  );
}

function ApsInternalGantt({ schedule }: { schedule: ApsSchedule }) {
  return (
    <div className="aps-gantt-grid-react">
      {apsGanttGroups(schedule).map((group) => (
        <div className="aps-gantt-lane-react" key={group.resourceCode}>
          <div className="gantt-label">
            <strong>{group.resourceCode}</strong>
            <span>{group.segments.length} barra(s)</span>
          </div>
          <div className="gantt-track aps-gantt-track-react">
            {group.segments.map((segment, index) => (
              <div
                className={`gantt-bar aps-bar-react ${segment.type === 'setup' ? 'setup' : segment.type === 'late' ? 'late' : 'production'}`}
                key={`${segment.resourceCode}-${segment.row.orderId}-${segment.row.operationCode}-${index}`}
                style={{ left: `${segment.offsetPercent}%`, width: `${segment.widthPercent}%` }}
                title={apsSegmentTitle(segment)}
              >
                {segment.type === 'setup' ? 'Setup' : String(segment.row.orderNumber || '-')}
              </div>
            ))}
          </div>
        </div>
      ))}
      {!schedule.rows.length && <div className="chart-empty">Nenhuma operacao pendente para programar.</div>}
    </div>
  );
}

function ApsProductiveCalendarEditor({
  settings,
  canEdit,
  onUpdate
}: {
  settings: ApsSettings;
  canEdit: boolean;
  onUpdate: (patch: Partial<ApsSettings>) => void;
}) {
  const normalizedSettings = normalizeApsSettings(settings);
  const months = useMemo(() => buildApsCalendarMonths(), []);
  const allDates = useMemo(() => months.flatMap((month) => month.days.map(dateInputValue)), [months]);
  const [selectedDate, setSelectedDate] = useState('');
  const calendarByDate = useMemo(
    () => new Map(normalizedSettings.calendarDays.map((day) => [day.date, day])),
    [normalizedSettings.calendarDays]
  );
  const activeDateKey = selectedDate && allDates.includes(selectedDate) ? selectedDate : allDates[0] || '';
  const activeDate = activeDateKey ? parseLocalDate(activeDateKey) : null;
  const activeDay = activeDate ? calendarByDate.get(activeDateKey) || apsEffectiveCalendarDay(activeDate, normalizedSettings) : null;
  const productiveCount = allDates.reduce((sum, date) => {
    const day = calendarByDate.get(date) || apsEffectiveCalendarDay(parseLocalDate(date), normalizedSettings);
    return sum + (day.productive ? 1 : 0);
  }, 0);

  function updateDay(date: string, patch: Partial<ApsCalendarDay>) {
    if (!canEdit) return;
    const current = calendarByDate.get(date) || apsEffectiveCalendarDay(parseLocalDate(date), normalizedSettings);
    const next = normalizeApsCalendarDay({ ...current, ...patch, date }, normalizedSettings);
    onUpdate({ calendarDays: upsertApsCalendarDay(normalizedSettings.calendarDays, next, normalizedSettings) });
  }

  function generateWeekdayCalendar() {
    const days = allDates.map((date) => {
      const parsed = parseLocalDate(date);
      return normalizeApsCalendarDay({
        date,
        productive: !isWeekend(parsed),
        startTime: normalizedSettings.workdayStart,
        dailyHours: normalizedSettings.dailyHours,
        lunchStart: normalizedSettings.lunchStart,
        lunchMinutes: normalizedSettings.lunchMinutes,
        note: ''
      }, normalizedSettings);
    });
    onUpdate({ calendarDays: days });
  }

  function applyDefaultHoursToProductiveDays() {
    const days = allDates.map((date) => {
      const current = calendarByDate.get(date) || apsEffectiveCalendarDay(parseLocalDate(date), normalizedSettings);
      return normalizeApsCalendarDay({
        ...current,
        startTime: normalizedSettings.workdayStart,
        dailyHours: normalizedSettings.dailyHours,
        lunchStart: normalizedSettings.lunchStart,
        lunchMinutes: normalizedSettings.lunchMinutes
      }, normalizedSettings);
    });
    onUpdate({ calendarDays: days });
  }

  function applySelectedHoursToAllDays() {
    if (!canEdit || !activeDay) return;
    const days = allDates.map((date) => {
      const current = calendarByDate.get(date) || apsEffectiveCalendarDay(parseLocalDate(date), normalizedSettings);
      return normalizeApsCalendarDay({
        ...current,
        startTime: activeDay.startTime,
        dailyHours: activeDay.dailyHours,
        lunchStart: activeDay.lunchStart,
        lunchMinutes: activeDay.lunchMinutes
      }, normalizedSettings);
    });
    onUpdate({ calendarDays: days });
  }

  return (
    <section className="aps-calendar-editor">
      <div className="panel-title">
        <div>
          <h3>Calendario produtivo</h3>
          <span>{productiveCount} dias produtivos nos proximos 12 meses</span>
        </div>
        <div className="panel-actions">
          <button className="btn" type="button" disabled={!canEdit} onClick={generateWeekdayCalendar}>Gerar seg-sex</button>
          <button className="btn" type="button" disabled={!canEdit} onClick={applyDefaultHoursToProductiveDays}>Aplicar horarios padrao</button>
          <button className="btn" type="button" disabled={!canEdit} onClick={() => onUpdate({ calendarDays: [] })}>Limpar excecoes</button>
        </div>
      </div>
      {activeDate && activeDay && (
        <div className="aps-calendar-selected-editor">
          <div className="aps-calendar-selected-title">
            <span>Dia selecionado</span>
            <strong>{formatDate(activeDateKey)} - {weekdayShortLabel(activeDate)}</strong>
            <em className={activeDay.productive ? 'productive' : 'inactive'}>{activeDay.productive ? 'Produtivo' : 'Nao produtivo'}</em>
          </div>
          <label className="aps-calendar-productive-toggle">
            <input type="checkbox" checked={activeDay.productive} disabled={!canEdit} onChange={(event) => updateDay(activeDateKey, { productive: event.target.checked })} />
            <span>Dia produtivo</span>
          </label>
          <label className="field">
            <span>Inicio jornada</span>
            <input className="input" type="time" value={activeDay.startTime} disabled={!canEdit || !activeDay.productive} onChange={(event) => updateDay(activeDateKey, { startTime: event.target.value })} />
          </label>
          <label className="field">
            <span>Horas dia</span>
            <input className="input" type="number" min="0" max="24" step="0.5" value={activeDay.dailyHours} disabled={!canEdit || !activeDay.productive} onChange={(event) => updateDay(activeDateKey, { dailyHours: toNumber(event.target.value, activeDay.dailyHours) })} />
          </label>
          <label className="field">
            <span>Inicio almoco</span>
            <input className="input" type="time" value={activeDay.lunchStart} disabled={!canEdit || !activeDay.productive} onChange={(event) => updateDay(activeDateKey, { lunchStart: event.target.value })} />
          </label>
          <label className="field">
            <span>Min. almoco</span>
            <input className="input" type="number" min="0" max="240" step="5" value={activeDay.lunchMinutes} disabled={!canEdit || !activeDay.productive} onChange={(event) => updateDay(activeDateKey, { lunchMinutes: toNumber(event.target.value, activeDay.lunchMinutes) })} />
          </label>
          <label className="field aps-calendar-note-field">
            <span>Observacao</span>
            <input className="input" value={activeDay.note} disabled={!canEdit} onChange={(event) => updateDay(activeDateKey, { note: event.target.value })} />
          </label>
          <div className="aps-calendar-selected-actions">
            <button className="btn primary" type="button" disabled={!canEdit} onClick={applySelectedHoursToAllDays}>Aplicar para todos</button>
          </div>
        </div>
      )}
      <div className="aps-calendar-months">
        {months.map((month) => (
          <article className="aps-calendar-month" key={month.key}>
            <h4>{month.label}</h4>
            <div className="aps-calendar-weekdays">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="aps-calendar-grid">
              {Array.from({ length: month.blanks }, (_item, index) => <span className="aps-calendar-blank" key={`blank-${month.key}-${index}`} />)}
              {month.days.map((date) => {
                const dateKey = dateInputValue(date);
                const day = calendarByDate.get(dateKey) || apsEffectiveCalendarDay(date, normalizedSettings);
                return (
                  <button className={`aps-calendar-day ${day.productive ? 'productive' : 'inactive'} ${activeDateKey === dateKey ? 'selected' : ''}`} key={dateKey} type="button" onClick={() => setSelectedDate(dateKey)}>
                    <span className="aps-calendar-day-top">
                      <strong>{date.getDate()}</strong>
                      <span>{weekdayShortLabel(date)}</span>
                    </span>
                    <span className="aps-calendar-day-status">{day.productive ? 'Prod.' : 'Folga'}</span>
                    <span className="aps-calendar-day-hours">{day.productive ? `${day.startTime} | ${formatNumber(day.dailyHours)}h` : '-'}</span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ApsOperationsEditor({
  operations,
  centers,
  canEdit,
  onSave
}: {
  operations: ApsOperation[];
  centers: ApsWorkCenter[];
  canEdit: boolean;
  onSave: (index: number | null, operation: ApsOperation) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ApsOperation | null>(null);
  const draftIsManual = Boolean(draft && isManualApsOperation(draft));

  function startNew() {
    setEditingIndex(null);
    setDraft(nextApsOperation(operations, centers));
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft({ ...operations[index], allowedCenters: [...operations[index].allowedCenters] });
  }

  function updateDraft(patch: Partial<ApsOperation>) {
    setDraft((current) => current ? normalizeApsOperation({ ...current, ...patch }) : current);
  }

  function updateAllowedCentersText(value: string) {
    updateDraft({ allowedCenters: stringList(value).map((center) => center.toUpperCase()) });
  }

  function toggleDraftCenter(code: string) {
    if (!draft) return;
    const cleanCode = code.toUpperCase();
    const values = new Set(draft.allowedCenters);
    if (values.has(cleanCode)) {
      values.delete(cleanCode);
    } else {
      values.add(cleanCode);
    }
    updateDraft({ allowedCenters: Array.from(values) });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    onSave(editingIndex, draft);
    setEditingIndex(null);
    setDraft(null);
  }

  return (
    <>
      {canEdit && (
        <div className="module-action-row">
          <button className="btn primary" type="button" onClick={startNew}><IconText name="plus">Inserir operacao</IconText></button>
        </div>
      )}
      {draft && (
        <form className="aps-operation-form" onSubmit={submit}>
          <div className="panel-title">
            <h3>{editingIndex === null ? 'Inserir operacao APS' : 'Editar operacao APS'}</h3>
            <span>{draftIsManual ? 'Operacao manual' : 'Operacao vinculada ao status'}</span>
          </div>
          <div className="aps-operation-form-grid">
            <label className="field">
              <span>Codigo</span>
              <input className="input" value={draft.code} disabled />
            </label>
            <label className="field aps-operation-span-2">
              <span>Operacao / status</span>
              <input className="input" value={draft.description} disabled={!canEdit || !draftIsManual} onChange={(event) => updateDraft({ description: event.target.value })} required />
            </label>
            <label className="field">
              <span>Sequencia</span>
              <input className="input" type="number" min="0" step="1" value={draft.sortOrder} disabled={!canEdit || !draftIsManual} onChange={(event) => updateDraft({ sortOrder: toInteger(event.target.value, draft.sortOrder) })} />
            </label>
            <label className="field">
              <span>Tipo</span>
              {draftIsManual ? (
                <select className="input" value={draft.category} disabled={!canEdit} onChange={(event) => updateDraft({ category: event.target.value })}>
                  <option value="production">Producao</option>
                  <option value="auxiliary">Auxiliar</option>
                </select>
              ) : (
                <input className="input" value={draft.category === 'production' ? 'Producao' : 'Auxiliar'} disabled />
              )}
            </label>
            <label className="field">
              <span>Fluxo</span>
              {draftIsManual ? (
                <select className="input" value={draft.flowType} disabled={!canEdit} onChange={(event) => updateDraft({ flowType: event.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="deviation">Desvio</option>
                </select>
              ) : (
                <input className="input" value={draft.flowType === 'deviation' ? 'Desvio' : 'Normal'} disabled />
              )}
            </label>
            <label className="field">
              <span>Setup h</span>
              <input className="input" type="number" min="0" step="0.25" value={draft.setupHours} disabled={!canEdit} onChange={(event) => updateDraft({ setupHours: toNumber(event.target.value, 0) })} />
            </label>
            <label className="field">
              <span>Processo h padrao</span>
              <input className="input" type="number" min="0" step="0.25" value={draft.processHours} disabled={!canEdit} onChange={(event) => updateDraft({ processHours: toNumber(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Lote</span>
              <input className="input" type="number" min="1" step="1" value={draft.lotSize} disabled={!canEdit} onChange={(event) => updateDraft({ lotSize: toInteger(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Operadores min.</span>
              <input className="input" type="number" min="1" step="1" value={draft.minOperators} disabled={!canEdit} onChange={(event) => updateDraft({ minOperators: toInteger(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Operadores max.</span>
              <input className="input" type="number" min="1" step="1" value={draft.maxOperators} disabled={!canEdit} onChange={(event) => updateDraft({ maxOperators: toInteger(event.target.value, 1) })} />
            </label>
            <label className="field aps-operation-span-2">
              <span>Centros permitidos</span>
              <input
                className="input"
                value={draft.allowedCenters.join(', ')}
                disabled={!canEdit}
                onChange={(event) => updateAllowedCentersText(event.target.value)}
                placeholder="Ex.: MONT, TESTE, EMB"
              />
            </label>
            <div className="field aps-operation-span-2">
              <span>Centros cadastrados</span>
              <div className="checkbox-grid aps-center-link-grid">
                {centers.map((center) => (
                  <label key={center.code}>
                    <input
                      type="checkbox"
                      checked={draft.allowedCenters.includes(center.code)}
                      disabled={!canEdit}
                      onChange={() => toggleDraftCenter(center.code)}
                    />
                    <span>{center.code} - {center.description}</span>
                  </label>
                ))}
                {!centers.length && <span className="empty-inline">Nenhum centro cadastrado.</span>}
              </div>
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn primary" type="submit" disabled={!canEdit}><IconText name="save">Salvar operacao</IconText></button>
            <button className="btn" type="button" onClick={() => { setDraft(null); setEditingIndex(null); }}><IconText name="close">Cancelar</IconText></button>
          </div>
        </form>
      )}
      <div className="generic-table-wrap aps-config-table-wrap">
        <table className="generic-table aps-config-table">
          <thead>
            <tr>
              <th>Seq.</th>
              <th>Operacao/status</th>
              <th>Tipo</th>
              <th>Setup h</th>
              <th>Processo h</th>
              <th>Lote</th>
              <th>Operadores</th>
              <th>Centros permitidos</th>
              {canEdit && <th>Acoes</th>}
            </tr>
          </thead>
          <tbody>
            {operations.map((operation, index) => (
              <tr key={operation.code}>
                <td>{formatInteger(operation.sortOrder)}</td>
                <td title={operation.code}>
                  <strong>{operation.description}</strong>
                  <small>{operation.flowType === 'deviation' ? 'Desvio' : 'Fluxo normal'}</small>
                </td>
                <td>{operation.category === 'production' ? 'Producao' : 'Auxiliar'}</td>
                <td>{formatNumber(operation.setupHours)}</td>
                <td>{formatNumber(operation.processHours)}</td>
                <td>{formatInteger(operation.lotSize)}</td>
                <td>{formatInteger(operation.minOperators)} a {formatInteger(operation.maxOperators)}</td>
                <td>{operation.allowedCenters.join(', ') || 'Todos'}</td>
                {canEdit && (
                  <td className="row-actions-cell">
                    <button className="btn" type="button" onClick={() => startEdit(index)}><IconText name="edit">Editar</IconText></button>
                  </td>
                )}
              </tr>
            ))}
            {!operations.length && (
              <tr>
                <td className="empty" colSpan={canEdit ? 9 : 8}>Cadastre status de producao para gerar operacoes APS.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ApsTimeLearningEditor({
  records,
  learnedRows,
  orders,
  operations,
  canEdit,
  enabled,
  onToggleEnabled,
  onSave,
  onRemove
}: {
  records: ApsTimeRecord[];
  learnedRows: ApsLearnedTimeRow[];
  orders: Row[];
  operations: ApsOperation[];
  canEdit: boolean;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onSave: (index: number | null, record: ApsTimeRecord) => void;
  onRemove: (id: string) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ApsTimeRecord | null>(null);
  const orderOptions = useMemo(() => orders.filter((order) => String(order.itemType || 'production') === 'production'), [orders]);

  function startNew() {
    const base = nextApsTimeRecord(records, operations);
    setEditingIndex(null);
    setDraft(orderOptions[0] ? applyApsOrderToTimeRecord(base, orderOptions[0], base.referenceType) : base);
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft({ ...records[index] });
  }

  function updateDraft(patch: Partial<ApsTimeRecord>) {
    setDraft((current) => current ? normalizeApsTimeRecord({ ...current, ...patch }) : current);
  }

  function selectOrder(key: string) {
    const order = findApsOrderByOptionKey(orderOptions, key);
    setDraft((current) => current && order ? applyApsOrderToTimeRecord(current, order, current.referenceType) : current);
  }

  function changeReferenceType(value: string) {
    const referenceType: ApsTimeReferenceType = value === 'productionOrder' ? 'productionOrder' : 'salesOrder';
    setDraft((current) => {
      if (!current) return current;
      return normalizeApsTimeRecord({
        ...current,
        referenceType,
        reference: referenceType === 'productionOrder' ? current.productionOrder : current.orderNumber
      });
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    onSave(editingIndex, draft);
    setEditingIndex(null);
    setDraft(null);
  }

  return (
    <div className="aps-learning-panel">
      <div className="panel-title">
        <div>
          <h3>Tempos por OP/Pedido e aprendizado</h3>
          <span>{records.length} apontamentos | {learnedRows.length} padroes por linha/capacidade</span>
        </div>
        <div className="panel-actions">
          <label className="aps-learning-toggle">
            <input type="checkbox" checked={enabled} disabled={!canEdit} onChange={(event) => onToggleEnabled(event.target.checked)} />
            <span>Usar tempos aprendidos no APS</span>
          </label>
          {canEdit && <button className="btn primary" type="button" onClick={startNew}><IconText name="plus">Novo tempo</IconText></button>}
        </div>
      </div>

      {draft && (
        <form className="aps-time-form" onSubmit={submit}>
          <div className="aps-time-form-grid">
            <label className="field aps-operation-span-2">
              <span>Pedido base</span>
              <select className="input" value={apsOrderOptionKey(findApsOrderForTimeRecord(draft, orderOptions))} disabled={!canEdit} onChange={(event) => selectOrder(event.target.value)}>
                <option value="">Selecionar pedido</option>
                {orderOptions.map((order) => (
                  <option key={apsOrderOptionKey(order)} value={apsOrderOptionKey(order)}>{apsOrderOptionLabel(order)}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Referencia</span>
              <select className="input" value={draft.referenceType} disabled={!canEdit} onChange={(event) => changeReferenceType(event.target.value)}>
                <option value="salesOrder">Pedido de venda</option>
                <option value="productionOrder">Ordem de producao</option>
              </select>
            </label>
            <label className="field">
              <span>Numero referencia</span>
              <input className="input" value={draft.reference} disabled={!canEdit} onChange={(event) => updateDraft({ reference: event.target.value })} required />
            </label>
            <label className="field">
              <span>Operacao</span>
              <select className="input" value={draft.operationCode} disabled={!canEdit} onChange={(event) => updateDraft({ operationCode: event.target.value })} required>
                {operations.map((operation) => <option key={operation.code} value={operation.code}>{operation.description}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Linha de produto</span>
              <input className="input" value={draft.productLine} disabled={!canEdit} onChange={(event) => updateDraft({ productLine: event.target.value })} required />
            </label>
            <label className="field">
              <span>Capacidade</span>
              <input className="input" value={draft.capacity} disabled={!canEdit} onChange={(event) => updateDraft({ capacity: event.target.value })} required />
            </label>
            <label className="field">
              <span>Quantidade</span>
              <input className="input" type="number" min="1" step="1" value={draft.quantity} disabled={!canEdit} onChange={(event) => updateDraft({ quantity: toInteger(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Setup h real</span>
              <input className="input" type="number" min="0" step="0.25" value={draft.setupHours} disabled={!canEdit} onChange={(event) => updateDraft({ setupHours: toNumber(event.target.value, 0) })} />
            </label>
            <label className="field">
              <span>Processo h real</span>
              <input className="input" type="number" min="0.1" step="0.25" value={draft.processHours} disabled={!canEdit} onChange={(event) => updateDraft({ processHours: toNumber(event.target.value, 1) })} required />
            </label>
            <label className="field aps-operation-span-2">
              <span>Observacao</span>
              <input className="input" value={draft.note} disabled={!canEdit} onChange={(event) => updateDraft({ note: event.target.value })} />
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="btn primary" type="submit" disabled={!canEdit}><IconText name="save">Salvar tempo</IconText></button>
            <button className="btn" type="button" onClick={() => { setDraft(null); setEditingIndex(null); }}><IconText name="close">Cancelar</IconText></button>
          </div>
        </form>
      )}

      <div className="split-grid aps-learning-grid">
        <div className="generic-table-wrap aps-config-table-wrap">
          <table className="generic-table aps-config-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Operacao</th>
                <th>Linha/capacidade</th>
                <th>Qtd.</th>
                <th>Setup h</th>
                <th>Processo h</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id}>
                  <td>
                    <strong>{record.reference || '-'}</strong>
                    <small>{apsTimeReferenceTypeLabel(record.referenceType)}</small>
                  </td>
                  <td>{apsOperationLabel(record.operationCode, operations)}</td>
                  <td>
                    <strong>{record.productLine || '-'}</strong>
                    <small>{apsCapacityDisplay(record.capacity)}</small>
                  </td>
                  <td>{formatInteger(record.quantity)}</td>
                  <td>{formatNumber(record.setupHours)}</td>
                  <td>{formatNumber(record.processHours)}</td>
                  <td className="row-actions-cell">
                    <div className="table-actions">
                      {canEdit && <button className="btn" type="button" onClick={() => startEdit(index)}><IconText name="edit">Editar</IconText></button>}
                      {canEdit && <button className="btn" type="button" onClick={() => onRemove(record.id)}><IconText name="trash">Excluir</IconText></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td className="empty" colSpan={7}>Lance tempos reais por OP ou pedido para o APS aprender por linha de produto e capacidade.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="generic-table-wrap aps-config-table-wrap">
          <table className="generic-table aps-config-table">
            <thead>
              <tr>
                <th>Linha</th>
                <th>Capacidade</th>
                <th>Operacao</th>
                <th>Amostras</th>
                <th>Setup medio</th>
                <th>Proc. medio/un.</th>
                <th>Confianca</th>
              </tr>
            </thead>
            <tbody>
              {learnedRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.productLine}</td>
                  <td>{apsCapacityDisplay(row.capacity)}</td>
                  <td>{row.operationLabel}</td>
                  <td>{formatInteger(row.samples)}</td>
                  <td>{formatNumber(row.setupHours)}</td>
                  <td>{formatNumber(row.processHoursPerUnit)}</td>
                  <td>{row.confidence}</td>
                </tr>
              ))}
              {!learnedRows.length && (
                <tr>
                  <td className="empty" colSpan={7}>Sem padroes aprendidos ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ApsCentersEditor({
  centers,
  canEdit,
  onSave,
  onRemove
}: {
  centers: ApsWorkCenter[];
  canEdit: boolean;
  onSave: (index: number | null, center: ApsWorkCenter) => void;
  onRemove: (code: string) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ApsWorkCenter | null>(null);

  function startNew() {
    setEditingIndex(null);
    setDraft(nextApsWorkCenter(centers));
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft({ ...centers[index] });
  }

  function updateDraft(patch: Partial<ApsWorkCenter>) {
    setDraft((current) => current ? normalizeApsWorkCenter({ ...current, ...patch }) : current);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    onSave(editingIndex, draft);
    setEditingIndex(null);
    setDraft(null);
  }

  return (
    <>
      {canEdit && (
        <div className="module-action-row">
          <button className="btn primary" type="button" onClick={startNew}><IconText name="plus">Novo centro</IconText></button>
        </div>
      )}
      {draft && (
        <form className="aps-center-form" onSubmit={submit}>
          <div className="panel-title">
            <h3>{editingIndex === null ? 'Novo centro de trabalho' : 'Editar centro de trabalho'}</h3>
            <span>{draft.code || 'Informe o codigo'}</span>
          </div>
          <div className="aps-center-form-grid">
            <label className="field">
              <span>Codigo</span>
              <input className="input" value={draft.code} disabled={!canEdit} onChange={(event) => updateDraft({ code: event.target.value.toUpperCase() })} required />
            </label>
            <label className="field aps-center-span-2">
              <span>Descricao</span>
              <input className="input" value={draft.description} disabled={!canEdit} onChange={(event) => updateDraft({ description: event.target.value })} required />
            </label>
            <label className="field">
              <span>Maquinas</span>
              <input className="input" type="number" min="1" step="1" value={draft.machineCount} disabled={!canEdit} onChange={(event) => updateDraft({ machineCount: toInteger(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Eficiencia</span>
              <input className="input" type="number" min="0.1" step="0.05" value={draft.efficiency} disabled={!canEdit} onChange={(event) => updateDraft({ efficiency: toNumber(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Capacidade h</span>
              <input className="input" type="number" min="0" step="0.5" value={draft.capacity} disabled={!canEdit} onChange={(event) => updateDraft({ capacity: toNumber(event.target.value, 8) })} />
            </label>
            <label className="field">
              <span>Turno</span>
              <input className="input" value={draft.shift} disabled={!canEdit} onChange={(event) => updateDraft({ shift: event.target.value, calendar: event.target.value })} />
            </label>
            <label className="field">
              <span>Calendario</span>
              <input className="input" value={draft.calendar} disabled={!canEdit} onChange={(event) => updateDraft({ calendar: event.target.value })} />
            </label>
            <label className="field aps-center-span-2">
              <span>Manutencao / observacoes</span>
              <textarea className="input" rows={2} value={draft.maintenance} disabled={!canEdit} onChange={(event) => updateDraft({ maintenance: event.target.value })} />
            </label>
          </div>
          <div className="admin-form-actions">
            <button className="btn primary" type="submit" disabled={!canEdit}><IconText name="save">Salvar centro</IconText></button>
            <button className="btn" type="button" onClick={() => { setDraft(null); setEditingIndex(null); }}><IconText name="close">Cancelar</IconText></button>
          </div>
        </form>
      )}
      <div className="generic-table-wrap aps-config-table-wrap">
        <table className="generic-table aps-config-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Descricao</th>
              <th>Maquinas</th>
              <th>Eficiencia</th>
              <th>Capacidade h</th>
              <th>Turno</th>
              <th>Manutencao</th>
              {canEdit && <th>Acoes</th>}
            </tr>
          </thead>
          <tbody>
            {centers.map((center, index) => (
              <tr key={`${center.code}-${index}`}>
                <td><strong>{center.code}</strong></td>
                <td>{center.description}</td>
                <td>{formatInteger(center.machineCount)}</td>
                <td>{formatNumber(center.efficiency)}</td>
                <td>{formatNumber(center.capacity)}</td>
                <td>{center.shift}</td>
                <td>{center.maintenance || '-'}</td>
                {canEdit && (
                  <td className="row-actions-cell">
                    <div className="table-actions">
                      <button className="btn" type="button" onClick={() => startEdit(index)}><IconText name="edit">Editar</IconText></button>
                      <button className="btn" type="button" onClick={() => onRemove(center.code)}><IconText name="trash">Excluir</IconText></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ApsOperatorsEditor({
  operators,
  operations,
  centers,
  canEdit,
  onSave,
  onRemove
}: {
  operators: ApsOperator[];
  operations: ApsOperation[];
  centers: ApsWorkCenter[];
  canEdit: boolean;
  onSave: (index: number | null, operator: ApsOperator) => void;
  onRemove: (code: string) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ApsOperator | null>(null);

  function startNew() {
    setEditingIndex(null);
    setDraft(nextApsOperator(operators, operations, centers));
  }

  function startEdit(index: number) {
    const operator = operators[index];
    setEditingIndex(index);
    setDraft({
      ...operator,
      enabledOperations: [...operator.enabledOperations],
      enabledCenters: [...operator.enabledCenters]
    });
  }

  function updateDraft(patch: Partial<ApsOperator>) {
    setDraft((current) => current ? normalizeApsOperator({ ...current, ...patch }) : current);
  }

  function toggleDraftLink(field: 'enabledOperations' | 'enabledCenters', code: string) {
    if (!draft) return;
    const cleanCode = field === 'enabledCenters' ? code.toUpperCase() : code;
    const values = new Set(draft[field]);
    if (values.has(cleanCode)) {
      values.delete(cleanCode);
    } else {
      values.add(cleanCode);
    }
    updateDraft({ [field]: Array.from(values) } as Partial<ApsOperator>);
  }

  function updateDraftLinksFromText(field: 'enabledOperations' | 'enabledCenters', value: string) {
    const values = stringList(value).map((item) => field === 'enabledCenters' ? item.toUpperCase() : item);
    updateDraft({ [field]: values } as Partial<ApsOperator>);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    onSave(editingIndex, draft);
    setEditingIndex(null);
    setDraft(null);
  }

  return (
    <>
      {canEdit && (
        <div className="module-action-row">
          <button className="btn primary" type="button" onClick={startNew}><IconText name="plus">Adicionar operador</IconText></button>
        </div>
      )}
      {draft && (
        <form className="aps-operator-form" onSubmit={submit}>
          <div className="panel-title">
            <h3>{editingIndex === null ? 'Adicionar operador' : 'Editar operador'}</h3>
            <span>{draft.code || 'Informe o codigo do operador'}</span>
          </div>
          <div className="aps-operator-form-grid">
            <label className="field">
              <span>Codigo</span>
              <input className="input" value={draft.code} disabled={!canEdit} onChange={(event) => updateDraft({ code: event.target.value.toUpperCase() })} required />
            </label>
            <label className="field">
              <span>Nome</span>
              <input className="input" value={draft.name} disabled={!canEdit} onChange={(event) => updateDraft({ name: event.target.value })} required />
            </label>
            <label className="field">
              <span>Turno</span>
              <input className="input" value={draft.shift} disabled={!canEdit} onChange={(event) => updateDraft({ shift: event.target.value })} />
            </label>
            <label className="field">
              <span>Jornada h</span>
              <input className="input" type="number" min="1" max="24" step="0.5" value={draft.journeyHours} disabled={!canEdit} onChange={(event) => updateDraft({ journeyHours: toNumber(event.target.value, 8) })} />
            </label>
            <label className="field">
              <span>Eficiencia</span>
              <input className="input" type="number" min="0.1" max="3" step="0.05" value={draft.efficiency} disabled={!canEdit} onChange={(event) => updateDraft({ efficiency: toNumber(event.target.value, 1) })} />
            </label>
            <label className="field">
              <span>Custo hora</span>
              <input className="input" type="number" min="0" step="0.01" value={draft.hourlyCost} disabled={!canEdit} onChange={(event) => updateDraft({ hourlyCost: toNumber(event.target.value, 0) })} />
            </label>
            <label className="field aps-operation-span-2">
              <span>Habilidade</span>
              <input className="input" value={draft.skill} disabled={!canEdit} onChange={(event) => updateDraft({ skill: event.target.value })} />
            </label>
            <label className="field aps-operation-span-2">
              <span>Operacoes qualificadas</span>
              <input
                className="input"
                value={draft.enabledOperations.join(', ')}
                disabled={!canEdit}
                onChange={(event) => updateDraftLinksFromText('enabledOperations', event.target.value)}
                placeholder="Ex.: lm, serpentina, montagem"
              />
            </label>
            <label className="field aps-operation-span-2">
              <span>Centros habilitados</span>
              <input
                className="input"
                value={draft.enabledCenters.join(', ')}
                disabled={!canEdit}
                onChange={(event) => updateDraftLinksFromText('enabledCenters', event.target.value)}
                placeholder="Ex.: MONT, TESTE"
              />
            </label>
          </div>
          <div className="aps-link-grid">
            <div>
              <strong>Operacoes qualificadas</strong>
              <div className="checkbox-grid">
                {operations.map((operation) => (
                  <label key={operation.code}>
                    <input
                      type="checkbox"
                      checked={draft.enabledOperations.includes(operation.code)}
                      disabled={!canEdit}
                      onChange={() => toggleDraftLink('enabledOperations', operation.code)}
                    />
                    <span>{operation.description}</span>
                  </label>
                ))}
                {!operations.length && <span className="empty-inline">Nenhuma operacao cadastrada.</span>}
              </div>
            </div>
            <div>
              <strong>Centros habilitados</strong>
              <div className="checkbox-grid">
                {centers.map((center) => (
                  <label key={center.code}>
                    <input
                      type="checkbox"
                      checked={draft.enabledCenters.includes(center.code)}
                      disabled={!canEdit}
                      onChange={() => toggleDraftLink('enabledCenters', center.code)}
                    />
                    <span>{center.code} - {center.description}</span>
                  </label>
                ))}
                {!centers.length && <span className="empty-inline">Nenhum centro cadastrado.</span>}
              </div>
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn primary" type="submit" disabled={!canEdit}><IconText name="save">Salvar operador</IconText></button>
            <button className="btn" type="button" onClick={() => { setDraft(null); setEditingIndex(null); }}><IconText name="close">Cancelar</IconText></button>
          </div>
        </form>
      )}
      <div className="generic-table-wrap aps-config-table-wrap">
        <table className="generic-table aps-config-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nome</th>
              <th>Turno</th>
              <th>Jornada h</th>
              <th>Eficiencia</th>
              <th>Habilidade</th>
              <th>Operacoes</th>
              <th>Centros</th>
              <th>Custo hora</th>
              {canEdit && <th>Acoes</th>}
            </tr>
          </thead>
          <tbody>
            {operators.map((operator, index) => (
              <tr key={`${operator.code}-${index}`}>
                <td><strong>{operator.code}</strong></td>
                <td>{operator.name}</td>
                <td>{operator.shift}</td>
                <td>{formatNumber(operator.journeyHours)}</td>
                <td>{formatNumber(operator.efficiency)}</td>
                <td>{operator.skill || '-'}</td>
                <td>{operator.enabledOperations.map((code) => apsOperationLabel(code, operations)).join(', ') || 'Todas'}</td>
                <td>{operator.enabledCenters.join(', ') || 'Todos'}</td>
                <td>{formatNumber(operator.hourlyCost)}</td>
                {canEdit && (
                  <td className="row-actions-cell">
                    <div className="table-actions">
                      <button className="btn" type="button" onClick={() => startEdit(index)}><IconText name="edit">Editar</IconText></button>
                      <button className="btn" type="button" onClick={() => onRemove(operator.code)}><IconText name="trash">Excluir</IconText></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!operators.length && (
              <tr>
                <td className="empty" colSpan={canEdit ? 10 : 9}>Nenhum operador cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function QualityAlertsScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const editable = canEdit(user, 'quality');
  const [alerts, setAlerts] = useState<Row[]>([]);
  const [orders, setOrders] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState<QualityAlertFormState>(emptyQualityAlertForm);
  const [detailAlert, setDetailAlert] = useState<Row | null>(null);
  const [printAlert, setPrintAlert] = useState<Row | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ alerts?: Row[] }>('/api/quality/alerts?includePhotos=1'),
      canView(user, 'orders')
        ? api<{ orders?: Row[] }>('/api/orders?sort=orderNumber&direction=desc&pageSize=500')
        : Promise.resolve({ orders: [] })
    ])
      .then((data) => {
        if (ignore) return;
        const [alertData, orderData] = data;
        setAlerts(alertData.alerts || []);
        setOrders(orderData.orders || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey, user]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => alerts.some((alert) => String(alert.id || '') === id)));
    setDetailAlert((current) => current ? alerts.find((alert) => String(alert.id || '') === String(current.id || '')) || current : null);
  }, [alerts]);

  useEffect(() => {
    const clearPrintAlert = () => setPrintAlert(null);
    window.addEventListener('afterprint', clearPrintAlert);
    return () => window.removeEventListener('afterprint', clearPrintAlert);
  }, []);

  async function qualityAction(message: string, action: () => Promise<void>) {
    if (!editable) return;
    setSuccess('');
    await runAction(setError, async () => {
      await action();
      setSuccess(message);
      setRefresh((value) => value + 1);
    });
  }

  function openEditor(alert?: Row) {
    if (!editable) return;
    setError('');
    setSuccess('');
    setEditingId(String(alert?.id || ''));
    setForm(alert ? qualityAlertFormFromRow(alert) : emptyQualityAlertForm());
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditingId('');
    setForm(emptyQualityAlertForm());
    setEditorOpen(false);
  }

  function editSelected() {
    if (!editable) return;
    const selected = selectedQualityAlerts(alerts, selectedIds);
    if (selected.length !== 1) {
      setSuccess('');
      setError('Selecione apenas um alerta para editar.');
      return;
    }
    openEditor(selected[0]);
  }

  async function submitAlert(event: FormEvent) {
    event.preventDefault();
    await qualityAction(editingId ? 'Alerta atualizado.' : 'Alerta emitido.', async () => {
      await api(editingId ? `/api/quality/alerts/${encodeURIComponent(editingId)}` : '/api/quality/alerts', {
        method: editingId ? 'PUT' : 'POST',
        body: qualityAlertPayload(form)
      });
      closeEditor();
      setSelectedIds([]);
    });
  }

  async function resolve(row: Row) {
    await qualityAction('Alerta marcado como resolvido.', async () => {
      await api(`/api/quality/alerts/${encodeURIComponent(String(row.id))}/resolve`, { method: 'PATCH' });
    });
  }

  async function resolveSelected() {
    const selected = selectedQualityAlerts(alerts, selectedIds).filter((alert) => String(alert.status || 'open') !== 'resolved');
    if (!selected.length) {
      setSuccess('');
      setError('Selecione pelo menos um alerta ativo para resolver.');
      return;
    }
    await qualityAction(`${selected.length} alerta(s) resolvido(s).`, async () => {
      await Promise.all(selected.map((alert) => api(`/api/quality/alerts/${encodeURIComponent(String(alert.id))}/resolve`, { method: 'PATCH' })));
      setSelectedIds([]);
    });
  }

  async function remove(row: Row) {
    if (!window.confirm('Excluir este alerta de qualidade?')) return;
    await qualityAction('Alerta excluido.', async () => {
      await api(`/api/quality/alerts/${encodeURIComponent(String(row.id))}`, { method: 'DELETE' });
      setSelectedIds((current) => current.filter((id) => id !== String(row.id || '')));
      if (String(detailAlert?.id || '') === String(row.id || '')) setDetailAlert(null);
    });
  }

  async function removeSelected() {
    const selected = selectedQualityAlerts(alerts, selectedIds);
    if (!selected.length) {
      setSuccess('');
      setError('Selecione pelo menos um alerta para excluir.');
      return;
    }
    if (!window.confirm(`Excluir ${selected.length} alerta(s) de qualidade?`)) return;
    await qualityAction(`${selected.length} alerta(s) excluido(s).`, async () => {
      await Promise.all(selected.map((alert) => api(`/api/quality/alerts/${encodeURIComponent(String(alert.id))}`, { method: 'DELETE' })));
      setSelectedIds([]);
      setDetailAlert(null);
    });
  }

  function printQualityAlert(row: Row) {
    setPrintAlert(row);
    window.setTimeout(() => window.print(), 80);
  }

  const filtered = useMemo(() => filterRows(alerts, search), [alerts, search]);
  const selected = selectedQualityAlerts(alerts, selectedIds);
  const activeCount = alerts.filter((alert) => String(alert.status || 'open') !== 'resolved').length;
  const resolvedCount = alerts.length - activeCount;

  return (
    <ModuleFrame title="Alertas de Qualidade" subtitle="Alertas ativos por pedido, SKU, cliente e linha." error={error}>
      {success && <p className="success-message">{success}</p>}
      <div className="module-metrics compact">
        <Metric label="Alertas ativos" value={activeCount} />
        <Metric label="Resolvidos" value={resolvedCount} />
        <Metric label="Com foto errado" value={alerts.filter((alert) => alert.hasWrongPhoto || alert.wrongPhotoDataUrl).length} />
        <Metric label="Com foto certo" value={alerts.filter((alert) => alert.hasRightPhoto || alert.rightPhotoDataUrl).length} />
      </div>
      <div className="module-toolbar">
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Filtrar pedido, cliente, SKU ou linha" />
        {editable && (
          <>
            <button className="btn primary" type="button" onClick={() => openEditor()}><IconText name="plus">Inserir novo alerta</IconText></button>
            <button className="btn" type="button" disabled={selected.length !== 1} onClick={editSelected}><IconText name="edit">Editar alerta</IconText></button>
            <button className="btn" type="button" disabled={!selected.length} onClick={resolveSelected}><IconText name="check">Alerta resolvido</IconText></button>
            <button className="btn" type="button" disabled={!selected.length} onClick={removeSelected}><IconText name="trash">Excluir</IconText></button>
          </>
        )}
      </div>

      {editorOpen && editable && (
        <section className="module-panel quality-editor-panel">
          <div className="panel-title">
            <h3>{editingId ? 'Editar alerta' : 'Inserir novo alerta'}</h3>
            <span>{editingId ? 'Atualizacao de alerta existente' : 'Registro de novo alerta'}</span>
          </div>
          <form className="quality-alert-form" onSubmit={submitAlert}>
            <div className="quality-alert-header-grid">
              <label className="field quality-span-2">
                <span>Pedido de venda</span>
                <select
                  className="input"
                  value={form.orderId}
                  onChange={(event) => setForm((current) => qualityFormWithOrder(current, orders, event.target.value))}
                >
                  <option value="">Selecionar pedido</option>
                  {orders.map((order) => <option key={String(order.id || order.orderNumber)} value={String(order.id || '')}>{qualityOrderLabel(order)}</option>)}
                </select>
              </label>
              <label className="field">
                <span>N. pedido</span>
                <input className="input" value={form.orderNumber} onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))} required />
              </label>
              <label className="field">
                <span>Cliente</span>
                <input className="input" value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} />
              </label>
              <label className="field">
                <span>Linha de produto</span>
                <input className="input" value={form.productLine} onChange={(event) => setForm((current) => ({ ...current, productLine: event.target.value }))} />
              </label>
              <label className="field">
                <span>SKU</span>
                <input className="input" value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value.toUpperCase() }))} />
              </label>
              <label className="field">
                <span>Capacidade</span>
                <input className="input" type="number" step="0.01" value={form.capacityTr} onChange={(event) => setForm((current) => ({ ...current, capacityTr: event.target.value }))} />
              </label>
              <label className="field">
                <span>Quantidade</span>
                <input className="input" type="number" step="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
              </label>
            </div>
            <div className="quality-comparison-grid">
              <QualityPhotoEditor
                title="Jeito errado"
                photo={form.wrongPhoto}
                description={form.wrongDescription}
                required
                onPhotoChange={(photo) => setForm((current) => ({ ...current, wrongPhoto: photo }))}
                onDescriptionChange={(value) => setForm((current) => ({ ...current, wrongDescription: value }))}
              />
              <QualityPhotoEditor
                title="Jeito certo"
                photo={form.rightPhoto}
                description={form.rightDescription}
                required
                onPhotoChange={(photo) => setForm((current) => ({ ...current, rightPhoto: photo }))}
                onDescriptionChange={(value) => setForm((current) => ({ ...current, rightDescription: value }))}
              />
            </div>
            <div className="admin-form-actions">
              <button className="btn primary" type="submit"><IconText name="save">{editingId ? 'Salvar alteracoes' : 'Salvar alerta'}</IconText></button>
              <button className="btn" type="button" onClick={closeEditor}><IconText name="close">Cancelar</IconText></button>
            </div>
          </form>
        </section>
      )}

      <section className="module-panel">
        <div className="panel-title">
          <h3>Alertas registrados</h3>
          <span>{filtered.length} registros</span>
        </div>
        <QualityAlertsTable
          rows={filtered}
          selectedIds={selectedIds}
          canEdit={editable}
          onToggle={(id) => setSelectedIds((current) => toggleStringValue(current, id))}
          onOpen={(row) => setDetailAlert(row)}
          onResolve={resolve}
          onRemove={remove}
        />
      </section>

      {detailAlert && (
        <section className="module-panel quality-detail-panel">
          <div className="panel-title">
            <h3>Detalhe do alerta</h3>
            <div className="panel-actions">
              <button className="btn" type="button" onClick={() => printQualityAlert(detailAlert)}><IconText name="printer">Imprimir alerta</IconText></button>
              <button className="btn" type="button" onClick={() => setDetailAlert(null)}><IconText name="close">Fechar</IconText></button>
            </div>
          </div>
          <div className="quality-detail-grid">
            <div className="order-summary-grid">
              <SummaryItem label="Status" value={qualityAlertStatusLabel(detailAlert)} />
              <SummaryItem label="Pedido" value={detailAlert.orderNumber} />
              <SummaryItem label="Cliente" value={detailAlert.customer} />
              <SummaryItem label="Linha" value={detailAlert.productLine} />
              <SummaryItem label="SKU" value={detailAlert.sku} />
              <SummaryItem label="Capacidade" value={formatNumber(detailAlert.capacityTr)} />
              <SummaryItem label="Quantidade" value={formatNumber(detailAlert.quantity)} />
              <SummaryItem label="Emitido por" value={detailAlert.createdBy} />
              <SummaryItem label="Emitido em" value={formatDateTime(detailAlert.createdAt)} />
              <SummaryItem label="Resolvido por" value={detailAlert.resolvedBy} />
              <SummaryItem label="Resolvido em" value={formatDateTime(detailAlert.resolvedAt)} />
            </div>
            <div className="quality-comparison-grid">
              <QualityPhotoCard title="Jeito errado" photo={qualityAlertPhotoFromRow(detailAlert, 'wrong')} description={String(detailAlert.wrongDescription || '-')} tone="wrong" />
              <QualityPhotoCard title="Jeito certo" photo={qualityAlertPhotoFromRow(detailAlert, 'right')} description={String(detailAlert.rightDescription || '-')} tone="right" />
            </div>
          </div>
        </section>
      )}
      {(printAlert || detailAlert) && <QualityAlertPrintSheet alert={printAlert || detailAlert} />}
    </ModuleFrame>
  );
}

function QualityAlertPrintSheet({ alert }: { alert: Row | null }) {
  if (!alert) return null;
  const wrongPhoto = qualityAlertPhotoFromRow(alert, 'wrong');
  const rightPhoto = qualityAlertPhotoFromRow(alert, 'right');
  return (
    <section className="quality-print-sheet" aria-hidden="true">
      <header className="quality-print-header">
        <img src="/mge-logo.png" alt="MGE air" />
        <div>
          <span>Synapse | MGE Smart System</span>
          <h1>Alerta de Qualidade</h1>
        </div>
        <strong className={`quality-status-pill ${String(alert.status || 'open') === 'resolved' ? 'resolved' : 'open'}`}>
          {qualityAlertStatusLabel(alert)}
        </strong>
      </header>
      <div className="quality-print-meta">
        <SummaryItem label="Pedido de venda" value={alert.orderNumber} />
        <SummaryItem label="Cliente" value={alert.customer} />
        <SummaryItem label="Linha de produto" value={alert.productLine} />
        <SummaryItem label="SKU" value={alert.sku} />
        <SummaryItem label="Capacidade" value={formatNumber(alert.capacityTr)} />
        <SummaryItem label="Quantidade" value={formatNumber(alert.quantity)} />
        <SummaryItem label="Emitido por" value={alert.createdBy} />
        <SummaryItem label="Emitido em" value={formatDateTime(alert.createdAt)} />
      </div>
      <div className="quality-print-comparison">
        <article>
          <h2>Jeito errado</h2>
          <div className="quality-print-photo">
            {wrongPhoto?.dataUrl ? <img src={wrongPhoto.dataUrl} alt="Jeito errado" /> : <span>Sem foto</span>}
          </div>
          <p>{String(alert.wrongDescription || '-')}</p>
        </article>
        <article>
          <h2>Jeito certo</h2>
          <div className="quality-print-photo">
            {rightPhoto?.dataUrl ? <img src={rightPhoto.dataUrl} alt="Jeito certo" /> : <span>Sem foto</span>}
          </div>
          <p>{String(alert.rightDescription || '-')}</p>
        </article>
      </div>
      <footer className="quality-print-footer">
        <span>Impresso em {formatDateTime(new Date().toISOString())}</span>
        <span>Registro: {formatLoose(alert.id)}</span>
      </footer>
    </section>
  );
}

function QualityAlertsTable({
  rows,
  selectedIds,
  canEdit,
  onToggle,
  onOpen,
  onResolve,
  onRemove
}: {
  rows: Row[];
  selectedIds: string[];
  canEdit: boolean;
  onToggle: (id: string) => void;
  onOpen: (row: Row) => void;
  onResolve: (row: Row) => void | Promise<void>;
  onRemove: (row: Row) => void | Promise<void>;
}) {
  return (
    <div className="generic-table-wrap quality-table-wrap">
      <table className="generic-table quality-alert-table">
        <thead>
          <tr>
            <th className="select-col">Sel.</th>
            <th>Status</th>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>SKU</th>
            <th>Linha</th>
            <th>Capacidade</th>
            <th>Quantidade</th>
            <th>Fotos</th>
            <th>Emitido por</th>
            <th>Emitido em</th>
            <th>Resolvido em</th>
            {canEdit && <th>Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const id = String(row.id || `${row.orderNumber || 'alert'}-${index}`);
            const resolved = String(row.status || 'open') === 'resolved';
            return (
              <tr
                key={id}
                className={resolved ? 'row-muted' : ''}
                onClick={() => onOpen(row)}
              >
                <td className="select-col" data-label="Selecionar" onClick={(event) => event.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(id)} onChange={() => onToggle(id)} aria-label="Selecionar alerta" />
                </td>
                <td data-label="Status"><span className={`quality-status-pill ${resolved ? 'resolved' : 'open'}`}>{resolved ? 'Resolvido' : 'Ativo'}</span></td>
                <td data-label="Pedido" title={String(row.orderNumber || '-')}>{formatLoose(row.orderNumber)}</td>
                <td data-label="Cliente" title={String(row.customer || '-')}>{formatLoose(row.customer)}</td>
                <td data-label="SKU" title={String(row.sku || '-')}>{formatLoose(row.sku)}</td>
                <td data-label="Linha" title={String(row.productLine || '-')}>{formatLoose(row.productLine)}</td>
                <td data-label="Capacidade">{formatNumber(row.capacityTr)}</td>
                <td data-label="Quantidade">{formatNumber(row.quantity)}</td>
                <td data-label="Fotos">{qualityPhotoSummary(row)}</td>
                <td data-label="Emitido por" title={String(row.createdBy || '-')}>{formatLoose(row.createdBy)}</td>
                <td data-label="Emitido em">{formatDateTime(row.createdAt)}</td>
                <td data-label="Resolvido em">{formatDateTime(row.resolvedAt)}</td>
                {canEdit && (
                  <td className="row-actions-cell" data-label="Acoes" onClick={(event) => event.stopPropagation()}>
                    <div className="table-actions">
                      {!resolved && <button className="btn" type="button" onClick={() => onResolve(row)}><IconText name="check">Resolvido</IconText></button>}
                      <button className="btn" type="button" onClick={() => onRemove(row)}><IconText name="trash">Excluir</IconText></button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={canEdit ? 13 : 12}>Nenhum alerta encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function QualityPhotoEditor({
  title,
  photo,
  description,
  required,
  onPhotoChange,
  onDescriptionChange
}: {
  title: string;
  photo: InvoiceDocumentInput | null;
  description: string;
  required?: boolean;
  onPhotoChange: (photo: InvoiceDocumentInput | null) => void;
  onDescriptionChange: (value: string) => void;
}) {
  const [fileError, setFileError] = useState('');

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setFileError('');
    if (!file) {
      onPhotoChange(null);
      return;
    }

    try {
      onPhotoChange(await qualityPhotoFromFile(file));
    } catch (error) {
      event.target.value = '';
      setFileError(error instanceof Error ? error.message : 'Falha ao carregar imagem.');
      onPhotoChange(null);
    }
  }

  return (
    <article className="quality-photo-editor">
      <div className="panel-title">
        <h3>{title}</h3>
        <span>{photo?.fileName || 'Sem foto'}</span>
      </div>
      <div className={`quality-photo-preview ${photo?.dataUrl ? 'has-image' : ''}`}>
        {photo?.dataUrl ? <img src={photo.dataUrl} alt={photo.fileName || title} /> : <span>Sem foto</span>}
      </div>
      <label className="field">
        <span>Foto</span>
        <input className="input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFile} />
      </label>
      {photo && <button className="btn" type="button" onClick={() => onPhotoChange(null)}><IconText name="trash">Remover foto</IconText></button>}
      {fileError && <p className="error">{fileError}</p>}
      <label className="field">
        <span>Descricao</span>
        <textarea className="input" rows={5} value={description} onChange={(event) => onDescriptionChange(event.target.value)} required={required} />
      </label>
    </article>
  );
}

function QualityPhotoCard({ title, photo, description, tone }: { title: string; photo: InvoiceDocumentInput | null; description: string; tone: 'wrong' | 'right' }) {
  const [previewDocument, setPreviewDocument] = useState<PreviewDocument | null>(null);
  return (
    <article className={`quality-photo-card ${tone}`}>
      <strong>{title}</strong>
      <div className={`quality-photo-preview ${photo?.dataUrl ? 'has-image' : ''}`}>
        {photo?.dataUrl ? <button type="button" onClick={() => setPreviewDocument(photo)}><img src={photo.dataUrl} alt={photo.fileName || title} /></button> : <span>Sem foto</span>}
      </div>
      <p>{description || '-'}</p>
      {previewDocument && (
        <DocumentPreviewDialog
          document={previewDocument}
          title={title}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </article>
  );
}

function SummaryItem({ label, value }: { label: string; value: unknown }) {
  return (
    <article className="order-summary-item">
      <span>{label}</span>
      <strong>{formatLoose(value)}</strong>
    </article>
  );
}

export function QualityRncScreen({ user, realtimeRefreshKey = 0 }: ModuleProps) {
  const editable = canEdit(user, 'quality');
  const [state, setState] = useState<Row>(() => emptyRncState());
  const [search, setSearch] = useState('');
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;
    api<{ state?: Row }>('/api/quality/rnc-state')
      .then((data) => {
        if (!ignore) setState(normalizeRncState(data.state));
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [realtimeRefreshKey]);

  const rncs = rncRecords(state);
  const active = activeRncRecord(state);
  const activeId = String(state.activeId || active.id || '');
  const filteredRncs = useMemo(() => filterRows(rncs, search), [rncs, search]);
  const metrics = rncMetrics(rncs);
  const contencao = asRow(active.contencao);
  const a3 = asRow(active.a3);
  const fishbone = asRow(a3.fishbone);
  const porques = asRow(a3.porques);
  const pdca = asRow(active.pdca);
  const fechamento = asRow(active.fechamento);
  const acoes = rncActions(active);

  function updateLocal(updater: (current: Row) => Row) {
    if (!editable) return;
    setState((current) => updater(current));
    setDirty(true);
    setSuccess('');
  }

  function patchActive(patch: Row) {
    updateLocal((current) => patchRncRecord(current, activeId, patch));
  }

  function patchSection(section: string, patch: Row) {
    updateLocal((current) => patchRncSection(current, activeId, section, patch));
  }

  async function saveState(message = 'Dados salvos.') {
    if (!editable) return;
    await runAction(setError, async () => {
      const next = { ...normalizeRncState(state), lastSaved: new Date().toISOString() };
      const data = await api<{ state?: Row }>('/api/quality/rnc-state', { method: 'PUT', body: { state: next } });
      setState(normalizeRncState(data.state || next));
      setDirty(false);
      setSuccess(message);
    });
  }

  async function newRnc() {
    if (!editable) return;
    const record = emptyRncRecord(rncs.length + 1);
    const next = { ...state, activeId: record.id, rncs: [record, ...rncs], lastSaved: new Date().toISOString() };
    setState(next);
    setDirty(true);
    await runAction(setError, async () => {
      const data = await api<{ state?: Row }>('/api/quality/rnc-state', { method: 'PUT', body: { state: next } });
      setState(normalizeRncState(data.state || next));
      setDirty(false);
      setSuccess('Nova RNC criada.');
    });
  }

  async function deleteActiveRnc() {
    if (!editable || rncs.length <= 1) return;
    if (!window.confirm(`Excluir ${String(active.codigo || active.titulo || 'esta RNC')}?`)) return;
    const remaining = rncs.filter((record) => String(record.id || '') !== activeId);
    const next = { ...state, activeId: String(remaining[0]?.id || ''), rncs: remaining, lastSaved: new Date().toISOString() };
    setState(next);
    setDirty(true);
    await runAction(setError, async () => {
      const data = await api<{ state?: Row }>('/api/quality/rnc-state', { method: 'PUT', body: { state: next } });
      setState(normalizeRncState(data.state || next));
      setDirty(false);
      setSuccess('RNC excluida.');
    });
  }

  function exportJson() {
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
    downloadDataUrl(dataUrl, `rnc-a3-${dateInputValue(new Date())}.json`);
  }

  function scrollToRncSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <ModuleFrame title="RNC / A3" subtitle="Abertura, contencao, causa raiz, plano 5W2H, PDCA e fechamento." error={error}>
      {success && <p className="success-message">{success}</p>}
      <div className="module-metrics compact">
        <Metric label="RNCs registradas" value={metrics.total} />
        <Metric label="Abertas" value={metrics.open} />
        <Metric label="Atrasadas" value={metrics.late} />
        <Metric label="Criticidade alta" value={metrics.highCriticality} />
        <Metric label="Acoes abertas" value={metrics.openActions} />
      </div>
      <div className="module-toolbar rnc-toolbar">
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Filtrar RNC, status, setor, cliente ou responsavel" />
        {editable && <button className="btn primary" type="button" onClick={newRnc}><IconText name="plus">Nova RNC</IconText></button>}
        {editable && <button className="btn" type="button" disabled={!dirty} onClick={() => saveState()}><IconText name="save">Salvar alteracoes</IconText></button>}
        {editable && <button className="btn" type="button" disabled={rncs.length <= 1} onClick={deleteActiveRnc}><IconText name="trash">Excluir RNC</IconText></button>}
        <button className="btn" type="button" onClick={exportJson}><IconText name="download">Exportar JSON</IconText></button>
        <a className="btn" href="/modules/qualidade/RNC.html" target="_blank" rel="noreferrer">Abrir tela antiga</a>
      </div>
      {dirty && <p className="muted-text">Ha alteracoes locais nao salvas nesta RNC.</p>}

      <section className="module-panel rnc-overview-panel">
        <div className="panel-title">
          <div>
            <h3>Painel e indicadores</h3>
            <span>{String(active.codigo || '-')} | {String(active.status || '-')}</span>
          </div>
          <span>{state.lastSaved ? `Ultimo salvamento: ${formatDateTime(state.lastSaved)}` : 'Ainda nao salvo'}</span>
        </div>
        <div className="rnc-stage-strip">
          {rncStageLinks.map((stage) => (
            <button className="btn" type="button" key={stage.id} onClick={() => scrollToRncSection(stage.id)}>{stage.label}</button>
          ))}
        </div>
        <DataTable rows={rncPanelRows(active, metrics, acoes)} columns={[
          { key: 'label', label: 'Indicador' },
          { key: 'value', label: 'Valor' }
        ]} />
      </section>

      <section className="rnc-layout">
        <aside className="module-panel rnc-sidebar-panel">
          <div className="panel-title">
            <h3>RNCs</h3>
            <span>{filteredRncs.length} registros</span>
          </div>
          <div className="rnc-list-react">
            {filteredRncs.map((record) => (
              <button
                key={String(record.id)}
                className={`rnc-list-item ${String(record.id || '') === activeId ? 'active' : ''}`}
                type="button"
                onClick={() => setState((current) => ({ ...current, activeId: String(record.id || '') }))}
              >
                <strong>{String(record.codigo || '-')}</strong>
                <span>{String(record.titulo || 'Sem titulo')}</span>
                <em>{String(record.status || '-')} | {String(record.criticidade || '-')}</em>
              </button>
            ))}
            {!filteredRncs.length && <p className="muted-text">Nenhuma RNC encontrada.</p>}
          </div>
        </aside>

        <section className="rnc-workspace">
          <section className="module-panel" id="rnc-abertura">
            <div className="panel-title"><h3>Abertura</h3><span>{String(active.codigo || '-')}</span></div>
            <div className="rnc-form-grid">
              <RncField label="Titulo da RNC" value={active.titulo} disabled={!editable} span={2} onChange={(value) => patchActive({ titulo: value })} />
              <RncField label="Codigo" value={active.codigo} disabled={!editable} onChange={(value) => patchActive({ codigo: value })} />
              <RncField label="Status" value={active.status} disabled={!editable} options={rncStatusOptions} onChange={(value) => patchActive({ status: value })} />
              <RncField label="Data abertura" type="date" value={active.dataAbertura} disabled={!editable} onChange={(value) => patchActive({ dataAbertura: value })} />
              <RncField label="Prazo" type="date" value={active.prazo} disabled={!editable} onChange={(value) => patchActive({ prazo: value })} />
              <RncField label="Setor" value={active.setor} disabled={!editable} onChange={(value) => patchActive({ setor: value })} />
              <RncField label="Processo" value={active.processo} disabled={!editable} onChange={(value) => patchActive({ processo: value })} />
              <RncField label="Origem" value={active.origem} disabled={!editable} options={rncOriginOptions} onChange={(value) => patchActive({ origem: value })} />
              <RncField label="Criticidade" value={active.criticidade} disabled={!editable} options={rncCriticalityOptions} onChange={(value) => patchActive({ criticidade: value })} />
              <RncField label="Responsavel" value={active.responsavel} disabled={!editable} onChange={(value) => patchActive({ responsavel: value })} />
              <RncField label="Cliente" value={active.cliente} disabled={!editable} onChange={(value) => patchActive({ cliente: value })} />
              <RncField label="Lote / pedido" value={active.lote} disabled={!editable} onChange={(value) => patchActive({ lote: value })} />
              <RncField label="Descricao da nao conformidade" value={active.descricao} disabled={!editable} textarea span={2} onChange={(value) => patchActive({ descricao: value })} />
              <RncField label="Requisito nao atendido" value={active.requisito} disabled={!editable} textarea onChange={(value) => patchActive({ requisito: value })} />
              <RncField label="Evidencia" value={active.evidencia} disabled={!editable} textarea onChange={(value) => patchActive({ evidencia: value })} />
              <RncField label="Impacto" value={active.impacto} disabled={!editable} textarea span={2} onChange={(value) => patchActive({ impacto: value })} />
            </div>
          </section>

          <section className="module-panel" id="rnc-contencao">
            <div className="panel-title"><h3>Plano de contencao</h3><span>{String(contencao.status || 'Planejada')}</span></div>
            <div className="rnc-form-grid">
              <RncField label="Acao de contencao" value={contencao.acao} disabled={!editable} textarea span={2} onChange={(value) => patchSection('contencao', { acao: value })} />
              <RncField label="Responsavel" value={contencao.responsavel} disabled={!editable} onChange={(value) => patchSection('contencao', { responsavel: value })} />
              <RncField label="Data" type="date" value={contencao.data} disabled={!editable} onChange={(value) => patchSection('contencao', { data: value })} />
              <RncField label="Abrangencia" value={contencao.abrangencia} disabled={!editable} onChange={(value) => patchSection('contencao', { abrangencia: value })} />
              <RncField label="Disposicao" value={contencao.disposicao} disabled={!editable} onChange={(value) => patchSection('contencao', { disposicao: value })} />
              <RncField label="Risco" value={contencao.risco} disabled={!editable} options={['Baixo', 'Medio', 'Alto']} onChange={(value) => patchSection('contencao', { risco: value })} />
              <RncField label="Status" value={contencao.status} disabled={!editable} options={['Planejada', 'Em execucao', 'Concluida']} onChange={(value) => patchSection('contencao', { status: value })} />
              <RncField label="Verificacao" value={contencao.verificacao} disabled={!editable} textarea span={2} onChange={(value) => patchSection('contencao', { verificacao: value })} />
            </div>
          </section>

          <section className="module-panel" id="rnc-a3">
            <div className="panel-title"><h3>A3 e causa raiz</h3><span>5 porques + Ishikawa</span></div>
            <div className="rnc-form-grid">
              <RncField label="Contexto" value={a3.contexto} disabled={!editable} textarea onChange={(value) => patchSection('a3', { contexto: value })} />
              <RncField label="Condicao atual" value={a3.condicaoAtual} disabled={!editable} textarea onChange={(value) => patchSection('a3', { condicaoAtual: value })} />
              <RncField label="Meta" value={a3.meta} disabled={!editable} textarea onChange={(value) => patchSection('a3', { meta: value })} />
              <RncField label="Causa raiz provavel" value={a3.causaRaiz} disabled={!editable} textarea onChange={(value) => patchSection('a3', { causaRaiz: value })} />
            </div>
            <div className="rnc-subgrid">
              <section>
                <h4>5 porques</h4>
                <div className="rnc-form-grid single">
                  {['why1', 'why2', 'why3', 'why4', 'why5'].map((key, index) => (
                    <RncField key={key} label={`${index + 1}. Por que?`} value={porques[key]} disabled={!editable} onChange={(value) => patchSection('a3', { porques: { ...porques, [key]: value } })} />
                  ))}
                </div>
              </section>
              <section>
                <h4>Ishikawa</h4>
                <div className="rnc-form-grid single">
                  {rncFishboneFields.map((field) => (
                    <RncField key={field.key} label={field.label} value={fishbone[field.key]} disabled={!editable} onChange={(value) => patchSection('a3', { fishbone: { ...fishbone, [field.key]: value } })} />
                  ))}
                </div>
              </section>
            </div>
          </section>

          <section className="module-panel" id="rnc-5w2h">
            <div className="panel-title">
              <h3>Plano 5W2H</h3>
              {editable && <button className="btn" type="button" onClick={() => updateLocal((current) => addRncAction(current, activeId))}><IconText name="plus">Adicionar acao</IconText></button>}
            </div>
            <RncActionsTable
              rows={acoes}
              disabled={!editable}
              onPatch={(index, patch) => updateLocal((current) => patchRncAction(current, activeId, index, patch))}
              onRemove={(index) => updateLocal((current) => removeRncAction(current, activeId, index))}
            />
          </section>

          <section className="module-panel" id="rnc-pdca">
            <div className="panel-title"><h3>PDCA</h3><span>Verificacao de eficacia</span></div>
            <div className="rnc-form-grid">
              <RncField label="Plan" value={pdca.plan} disabled={!editable} textarea onChange={(value) => patchSection('pdca', { plan: value })} />
              <RncField label="Do" value={pdca.do} disabled={!editable} textarea onChange={(value) => patchSection('pdca', { do: value })} />
              <RncField label="Check" value={pdca.check} disabled={!editable} textarea onChange={(value) => patchSection('pdca', { check: value })} />
              <RncField label="Act" value={pdca.act} disabled={!editable} textarea onChange={(value) => patchSection('pdca', { act: value })} />
            </div>
          </section>

          <section className="module-panel" id="rnc-fechamento">
            <div className="panel-title"><h3>Fechamento</h3><span>{String(fechamento.resultado || 'Em verificacao')}</span></div>
            <div className="rnc-form-grid">
              <RncField label="Data eficacia" type="date" value={fechamento.dataEficacia} disabled={!editable} onChange={(value) => patchSection('fechamento', { dataEficacia: value })} />
              <RncField label="Resultado" value={fechamento.resultado} disabled={!editable} options={['Em verificacao', 'Eficaz', 'Ineficaz']} onChange={(value) => patchSection('fechamento', { resultado: value })} />
              <RncField label="Aprovador" value={fechamento.aprovador} disabled={!editable} onChange={(value) => patchSection('fechamento', { aprovador: value })} />
              <RncField label="Data fechamento" type="date" value={fechamento.dataFechamento} disabled={!editable} onChange={(value) => patchSection('fechamento', { dataFechamento: value })} />
              <RncField label="Evidencia de eficacia" value={fechamento.evidenciaEficacia} disabled={!editable} textarea onChange={(value) => patchSection('fechamento', { evidenciaEficacia: value })} />
              <RncField label="Padronizacao" value={fechamento.padronizacao} disabled={!editable} textarea onChange={(value) => patchSection('fechamento', { padronizacao: value })} />
              <RncField label="Licoes aprendidas" value={fechamento.licoes} disabled={!editable} textarea span={2} onChange={(value) => patchSection('fechamento', { licoes: value })} />
            </div>
          </section>

          <section className="module-panel rnc-report-panel" id="rnc-relatorio">
            <div className="panel-title">
              <div>
                <h3>Apresentacao de relatorio</h3>
                <span>Resumo executivo para consulta ou impressao</span>
              </div>
              <button className="btn" type="button" onClick={() => window.print()}><IconText name="printer">Imprimir relatorio</IconText></button>
            </div>
            <div className="rnc-report-grid">
              <RncReportBlock title="Identificacao" lines={[
                `Codigo: ${formatLoose(active.codigo)}`,
                `Titulo: ${formatLoose(active.titulo)}`,
                `Cliente / lote: ${formatLoose(active.cliente)} / ${formatLoose(active.lote)}`,
                `Status: ${formatLoose(active.status)} | Criticidade: ${formatLoose(active.criticidade)}`
              ]} />
              <RncReportBlock title="Nao conformidade" lines={[
                `Descricao: ${formatLoose(active.descricao)}`,
                `Requisito: ${formatLoose(active.requisito)}`,
                `Impacto: ${formatLoose(active.impacto)}`
              ]} />
              <RncReportBlock title="Contencao" lines={[
                `Acao: ${formatLoose(contencao.acao)}`,
                `Responsavel: ${formatLoose(contencao.responsavel)}`,
                `Verificacao: ${formatLoose(contencao.verificacao)}`
              ]} />
              <RncReportBlock title="A3 / causa raiz" lines={[
                `Contexto: ${formatLoose(a3.contexto)}`,
                `Causa raiz provavel: ${formatLoose(a3.causaRaiz)}`,
                `Meta: ${formatLoose(a3.meta)}`
              ]} />
              <RncReportBlock title="PDCA" lines={[
                `Plan: ${formatLoose(pdca.plan)}`,
                `Do: ${formatLoose(pdca.do)}`,
                `Check: ${formatLoose(pdca.check)}`,
                `Act: ${formatLoose(pdca.act)}`
              ]} />
              <RncReportBlock title="Fechamento" lines={[
                `Resultado: ${formatLoose(fechamento.resultado)}`,
                `Aprovador: ${formatLoose(fechamento.aprovador)}`,
                `Licoes aprendidas: ${formatLoose(fechamento.licoes)}`
              ]} />
            </div>
          </section>
        </section>
      </section>
    </ModuleFrame>
  );
}

function RncReportBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <article className="rnc-report-block">
      <h4>{title}</h4>
      {lines.map((line, index) => <p key={`${title}-${index}`}>{line}</p>)}
    </article>
  );
}

function RncField({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
  textarea = false,
  options,
  span = 1
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: string;
  textarea?: boolean;
  options?: string[];
  span?: 1 | 2;
}) {
  const textValue = String(value || '');
  return (
    <label className={`field ${span === 2 ? 'rnc-span-2' : ''}`}>
      <span>{label}</span>
      {options ? (
        <select className="input" value={textValue} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : textarea ? (
        <textarea className="input" rows={4} value={textValue} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className="input" type={type} value={textValue} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function RncActionsTable({ rows, disabled, onPatch, onRemove }: { rows: Row[]; disabled: boolean; onPatch: (index: number, patch: Row) => void; onRemove: (index: number) => void }) {
  const columns = rncActionColumns;
  return (
    <div className="generic-table-wrap rnc-action-table-wrap">
      <table className="generic-table rnc-action-table">
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
            {!disabled && <th>Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${index}-${String(row.what || '')}`}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.key === 'status' ? (
                    <select className="input table-inline-input wide" value={String(row[column.key] || 'Aberta')} disabled={disabled} onChange={(event) => onPatch(index, { [column.key]: event.target.value })}>
                      {['Aberta', 'Em andamento', 'Concluida', 'Atrasada'].map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input className="input table-inline-input wide" value={String(row[column.key] || '')} disabled={disabled} onChange={(event) => onPatch(index, { [column.key]: event.target.value })} />
                  )}
                </td>
              ))}
              {!disabled && (
                <td className="row-actions-cell">
                  <button className="btn" type="button" onClick={() => onRemove(index)}><IconText name="trash">Excluir</IconText></button>
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={columns.length + (disabled ? 0 : 1)}>Nenhuma acao cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function emptyRncState(): Row {
  const initial = emptyRncRecord(1);
  initial.titulo = 'RNC sem titulo';
  return { activeId: initial.id, rncs: [initial], lastSaved: '' };
}

function emptyRncRecord(sequence = 1): Row {
  return {
    id: makeLocalId('rnc'),
    codigo: `RNC-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`,
    titulo: 'Nova RNC',
    status: 'Aberta',
    dataAbertura: dateInputValue(new Date()),
    prazo: '',
    setor: '',
    processo: '',
    origem: 'Processo interno',
    criticidade: 'Media',
    responsavel: '',
    cliente: '',
    lote: '',
    descricao: '',
    requisito: '',
    evidencia: '',
    impacto: '',
    contencao: {
      acao: '',
      responsavel: '',
      data: dateInputValue(new Date()),
      abrangencia: '',
      disposicao: '',
      risco: 'Baixo',
      status: 'Planejada',
      verificacao: ''
    },
    a3: {
      contexto: '',
      condicaoAtual: '',
      meta: '',
      causaRaiz: '',
      fishbone: {
        metodo: '',
        maoDeObra: '',
        maquina: '',
        material: '',
        medicao: '',
        meioAmbiente: ''
      },
      porques: {
        why1: '',
        why2: '',
        why3: '',
        why4: '',
        why5: ''
      }
    },
    acoes: [emptyRncAction()],
    pdca: {
      plan: '',
      do: '',
      check: '',
      act: ''
    },
    fechamento: {
      dataEficacia: '',
      resultado: 'Em verificacao',
      aprovador: '',
      dataFechamento: '',
      evidenciaEficacia: '',
      padronizacao: '',
      licoes: ''
    }
  };
}

function emptyRncAction(): Row {
  return {
    what: '',
    why: '',
    where: '',
    when: '',
    who: '',
    how: '',
    howMuch: '',
    status: 'Aberta'
  };
}

function normalizeRncState(value: unknown): Row {
  const row = asRow(value);
  const rncs = rncRecords(row);
  if (!rncs.length) return emptyRncState();
  const activeId = String(row.activeId || rncs[0]?.id || '');
  return {
    activeId: rncs.some((record) => String(record.id || '') === activeId) ? activeId : String(rncs[0]?.id || ''),
    rncs,
    lastSaved: String(row.lastSaved || '')
  };
}

function rncRecords(state: Row): Row[] {
  return arrayRows(state.rncs).map(normalizeRncRecord);
}

function normalizeRncRecord(record: Row): Row {
  const base = emptyRncRecord(1);
  const merged = {
    ...base,
    ...record,
    id: String(record.id || base.id),
    contencao: { ...asRow(base.contencao), ...asRow(record.contencao) },
    a3: {
      ...asRow(base.a3),
      ...asRow(record.a3),
      fishbone: { ...asRow(asRow(base.a3).fishbone), ...asRow(asRow(record.a3).fishbone) },
      porques: { ...asRow(asRow(base.a3).porques), ...asRow(asRow(record.a3).porques) }
    },
    acoes: rncActions(record).length ? rncActions(record) : [emptyRncAction()],
    pdca: { ...asRow(base.pdca), ...asRow(record.pdca) },
    fechamento: { ...asRow(base.fechamento), ...asRow(record.fechamento) }
  };
  return merged;
}

function activeRncRecord(state: Row): Row {
  const rncs = rncRecords(state);
  return rncs.find((record) => String(record.id || '') === String(state.activeId || '')) || rncs[0] || emptyRncRecord(1);
}

function rncActions(record: Row): Row[] {
  return arrayRows(record.acoes).map((action) => ({ ...emptyRncAction(), ...action }));
}

function patchRncRecord(state: Row, activeId: string, patch: Row): Row {
  return {
    ...state,
    rncs: rncRecords(state).map((record) => String(record.id || '') === activeId ? { ...record, ...patch } : record)
  };
}

function patchRncSection(state: Row, activeId: string, section: string, patch: Row): Row {
  return {
    ...state,
    rncs: rncRecords(state).map((record) => {
      if (String(record.id || '') !== activeId) return record;
      return { ...record, [section]: { ...asRow(record[section]), ...patch } };
    })
  };
}

function patchRncAction(state: Row, activeId: string, index: number, patch: Row): Row {
  return {
    ...state,
    rncs: rncRecords(state).map((record) => {
      if (String(record.id || '') !== activeId) return record;
      const actions = rncActions(record).map((action, actionIndex) => actionIndex === index ? { ...action, ...patch } : action);
      return { ...record, acoes: actions };
    })
  };
}

function addRncAction(state: Row, activeId: string): Row {
  return {
    ...state,
    rncs: rncRecords(state).map((record) => {
      if (String(record.id || '') !== activeId) return record;
      return { ...record, acoes: [...rncActions(record), emptyRncAction()] };
    })
  };
}

function removeRncAction(state: Row, activeId: string, index: number): Row {
  return {
    ...state,
    rncs: rncRecords(state).map((record) => {
      if (String(record.id || '') !== activeId) return record;
      const actions = rncActions(record).filter((_, actionIndex) => actionIndex !== index);
      return { ...record, acoes: actions.length ? actions : [emptyRncAction()] };
    })
  };
}

function rncMetrics(rncs: Row[]) {
  const today = dateInputValue(new Date());
  const open = rncs.filter((record) => String(record.status || '') !== 'Fechada').length;
  return {
    total: rncs.length,
    open,
    late: rncs.filter((record) => String(record.status || '') !== 'Fechada' && String(record.prazo || '') && String(record.prazo || '') < today).length,
    highCriticality: rncs.filter((record) => ['alta', 'critica', 'crítica'].includes(normalizeText(record.criticidade))).length,
    openActions: rncs.flatMap(rncActions).filter((action) => !['concluida', 'concluída'].includes(normalizeText(action.status))).length
  };
}

function rncPanelRows(active: Row, metrics: Row, actions: Row[]): Row[] {
  const openActions = actions.filter((action) => !normalizeText(action.status).startsWith('conclu')).length;
  const completedActions = actions.length - openActions;
  const progress = actions.length ? Math.round((completedActions / actions.length) * 100) : 0;
  return [
    { label: 'RNCs registradas', value: metrics.total },
    { label: 'RNCs abertas', value: metrics.open },
    { label: 'RNCs atrasadas', value: metrics.late },
    { label: 'Criticidade alta/critica', value: metrics.highCriticality },
    { label: 'Acoes abertas desta RNC', value: openActions },
    { label: 'Avanco do plano 5W2H', value: `${progress}%` },
    { label: 'Prazo da RNC ativa', value: formatDate(active.prazo) },
    { label: 'Responsavel', value: formatLoose(active.responsavel) }
  ];
}

function makeLocalId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const rncStageLinks = [
  { id: 'rnc-abertura', label: 'Abertura' },
  { id: 'rnc-contencao', label: 'Plano de contencao' },
  { id: 'rnc-a3', label: 'A3' },
  { id: 'rnc-5w2h', label: '5W2H' },
  { id: 'rnc-pdca', label: 'PDCA' },
  { id: 'rnc-fechamento', label: 'Fechamento' },
  { id: 'rnc-relatorio', label: 'Relatorio' }
];

const rncStatusOptions = ['Aberta', 'Em analise', 'Em contencao', 'Plano em execucao', 'Em verificacao', 'Fechada'];
const rncOriginOptions = ['Processo interno', 'Cliente', 'Fornecedor', 'Auditoria', 'Campo', 'Producao'];
const rncCriticalityOptions = ['Baixa', 'Media', 'Alta', 'Critica'];
const rncFishboneFields = [
  { key: 'metodo', label: 'Metodo' },
  { key: 'maoDeObra', label: 'Mao de obra' },
  { key: 'maquina', label: 'Maquina' },
  { key: 'material', label: 'Material' },
  { key: 'medicao', label: 'Medicao' },
  { key: 'meioAmbiente', label: 'Meio ambiente' }
];
const rncActionColumns = [
  { key: 'what', label: 'O que' },
  { key: 'why', label: 'Por que' },
  { key: 'where', label: 'Onde' },
  { key: 'when', label: 'Quando' },
  { key: 'who', label: 'Quem' },
  { key: 'how', label: 'Como' },
  { key: 'howMuch', label: 'Quanto' },
  { key: 'status', label: 'Status' }
];

export function AdminScreen({ user, realtimeRefreshKey = 0, section = 'all' }: ModuleProps & { section?: AdminScreenSection }) {
  const canViewAdmin = user.role === 'admin' || canView(user, 'admin');
  const canManageAdmin = user.role === 'admin' || canEdit(user, 'admin');
  const [health, setHealth] = useState<Row | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [statuses, setStatuses] = useState<Row[]>([]);
  const [customers, setCustomers] = useState<Row[]>([]);
  const [pcpMotives, setPcpMotives] = useState<Row[]>([]);
  const [backups, setBackups] = useState<Row[]>([]);
  const [statusForm, setStatusForm] = useState<AdminStatusForm>(emptyAdminStatusForm);
  const [statusEditingId, setStatusEditingId] = useState('');
  const [customerForm, setCustomerForm] = useState<AdminCustomerForm>(emptyAdminCustomerForm);
  const [customerEditingId, setCustomerEditingId] = useState('');
  const [pcpMotiveForm, setPcpMotiveForm] = useState<AdminPcpMotiveForm>(emptyAdminPcpMotiveForm);
  const [userForm, setUserForm] = useState<AdminUserForm>(emptyAdminUserForm);
  const [userEditingId, setUserEditingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!canViewAdmin) return;
    let ignore = false;
    Promise.all([
      api<{ health?: Row }>('/api/admin/health'),
      api<{ users?: Row[] }>('/api/admin/users'),
      api<{ statuses?: Row[] }>('/api/admin/statuses'),
      api<{ customers?: Row[] }>('/api/admin/customers'),
      api<{ motives?: Row[] }>('/api/pcp-pending-motives'),
      api<{ backups?: Row[] }>('/api/admin/backups')
    ])
      .then(([healthData, userData, statusData, customerData, motiveData, backupData]) => {
        if (ignore) return;
        setHealth(healthData.health || null);
        setUsers(userData.users || []);
        setStatuses(statusData.statuses || []);
        setCustomers(customerData.customers || []);
        setPcpMotives(motiveData.motives || []);
        setBackups(backupData.backups || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [refresh, realtimeRefreshKey, canViewAdmin]);

  async function adminAction(message: string, action: () => Promise<void>) {
    if (!canManageAdmin) {
      setSuccess('');
      setError('Seu perfil permite consulta, mas nao permite alterar cadastros.');
      return;
    }
    setSuccess('');
    await runAction(setError, async () => {
      await action();
      setSuccess(message);
      setRefresh((value) => value + 1);
    });
  }

  async function createBackup() {
    await adminAction('Backup criado com sucesso.', async () => {
      await api('/api/admin/backups', { method: 'POST' });
    });
  }

  async function testBackup() {
    await adminAction('Teste de restauracao concluido.', async () => {
      await api('/api/admin/backups/test-restore', { method: 'POST' });
    });
  }

  async function restoreBackup(row: Row) {
    const fileName = String(row.name || row.fileName || '');
    if (!fileName) return;
    const confirmation = window.prompt(`Digite RESTAURAR para confirmar a restauracao do backup:\n${fileName}`);
    if (confirmation !== 'RESTAURAR') return;

    await adminAction('Backup restaurado. Reinicie a tela para conferir os dados.', async () => {
      await api(`/api/admin/backups/${encodeURIComponent(fileName)}/restore`, { method: 'POST' });
    });
  }

  async function submitStatus(event: FormEvent) {
    event.preventDefault();
    const body = adminStatusPayload(statusForm);
    await adminAction(statusEditingId ? 'Status atualizado.' : 'Status cadastrado.', async () => {
      if (statusEditingId) {
        await api(`/api/admin/statuses/${encodeURIComponent(statusEditingId)}`, { method: 'PUT', body });
      } else {
        await api('/api/admin/statuses', { method: 'POST', body });
      }
      setStatusEditingId('');
      setStatusForm(emptyAdminStatusForm());
    });
  }

  async function deleteStatus(row: Row) {
    const id = String(row.id || '');
    const name = String(row.name || '');
    if (!id) return;
    if (!window.confirm(`Excluir o status ${name || id}?`)) return;
    await adminAction('Status excluido.', async () => {
      await api(`/api/admin/statuses/${encodeURIComponent(id)}`, { method: 'DELETE' });
    });
  }

  async function submitCustomer(event: FormEvent) {
    event.preventDefault();
    const body = { name: customerForm.name.trim() };
    await adminAction(customerEditingId ? 'Cliente atualizado.' : 'Cliente cadastrado.', async () => {
      if (customerEditingId) {
        await api(`/api/admin/customers/${encodeURIComponent(customerEditingId)}`, { method: 'PUT', body });
      } else {
        await api('/api/admin/customers', { method: 'POST', body });
      }
      setCustomerEditingId('');
      setCustomerForm(emptyAdminCustomerForm());
    });
  }

  async function deleteCustomer(row: Row) {
    const id = String(row.id || '');
    const name = String(row.name || '');
    if (!id) return;
    if (!window.confirm(`Excluir o cliente ${name || id}?`)) return;
    await adminAction('Cliente excluido.', async () => {
      await api(`/api/admin/customers/${encodeURIComponent(id)}`, { method: 'DELETE' });
    });
  }

  async function submitPcpMotive(event: FormEvent) {
    event.preventDefault();
    const body = {
      reason: pcpMotiveForm.reason,
      name: pcpMotiveForm.name.trim()
    };
    await adminAction('Motivo PCP cadastrado.', async () => {
      await api('/api/pcp-pending-motives', { method: 'POST', body });
      setPcpMotiveForm(emptyAdminPcpMotiveForm());
    });
  }

  async function submitUser(event: FormEvent) {
    event.preventDefault();
    if (!userEditingId && userForm.password.trim().length < 6) {
      setSuccess('');
      setError('Informe uma senha com pelo menos 6 caracteres.');
      return;
    }

    const body = adminUserPayload(userForm, Boolean(userEditingId));
    await adminAction(userEditingId ? 'Usuario atualizado.' : 'Usuario cadastrado.', async () => {
      if (userEditingId) {
        await api(`/api/admin/users/${encodeURIComponent(userEditingId)}`, { method: 'PUT', body });
      } else {
        await api('/api/admin/users', { method: 'POST', body });
      }
      setUserEditingId('');
      setUserForm(emptyAdminUserForm());
    });
  }

  async function deleteUser(row: Row) {
    const id = String(row.id || '');
    const name = String(row.username || row.name || '');
    if (!id) return;
    if (!window.confirm(`Excluir o usuario ${name || id}?`)) return;
    await adminAction('Usuario excluido.', async () => {
      await api(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
    });
  }

  const showSystem = section === 'all' || section === 'system';
  const showStatuses = section === 'all' || section === 'statuses';
  const showCustomers = section === 'all' || section === 'customers';
  const showPcpMotives = section === 'all' || section === 'pcpMotives';
  const showUsers = section === 'all' || section === 'users';
  const showRegistryGrid = showStatuses || showCustomers || showPcpMotives || showUsers;
  const frameTitle = adminSectionTitle(section);
  const frameSubtitle = adminSectionSubtitle(section);

  if (!canViewAdmin) {
    return (
      <ModuleFrame title={frameTitle} subtitle="Area restrita ao administrador." error={error}>
        <section className="module-panel">
          <h3>Acesso restrito</h3>
          <p className="muted-text">Seu perfil nao possui permissao para gerenciar cadastros, usuarios, backups e saude do sistema.</p>
        </section>
      </ModuleFrame>
    );
  }

  return (
    <ModuleFrame title={frameTitle} subtitle={frameSubtitle} error={error}>
      {success && <p className="success-message">{success}</p>}
      <div className="module-metrics">
        {showSystem && <Metric label="Servidor" value={health?.serverOnline ? 'Online' : 'Offline'} />}
        {showSystem && <Metric label="Banco" value={health?.dbConnected ? `${health.dbProvider || '-'} conectado` : 'Sem conexao'} />}
        {showUsers && <Metric label="Usuarios" value={users.length} />}
        {showStatuses && <Metric label="Status" value={statuses.length} />}
        {showCustomers && <Metric label="Clientes" value={customers.length} />}
        {showPcpMotives && <Metric label="Motivos PCP" value={pcpMotives.length} />}
        {showSystem && <Metric label="Backups" value={backups.length} />}
      </div>
      {showSystem && (
        <div className="module-toolbar">
          <button className="btn primary" type="button" disabled={!canManageAdmin} onClick={createBackup}><IconText name="save">Criar backup</IconText></button>
          <button className="btn" type="button" disabled={!canManageAdmin} onClick={testBackup}><IconText name="check">Testar restauracao</IconText></button>
          <button className="btn" type="button" onClick={() => setRefresh((value) => value + 1)}><IconText name="refresh">Atualizar</IconText></button>
        </div>
      )}

      {showSystem && (
        <section className="admin-overview-grid">
          <section className="module-panel">
            <div className="panel-title">
              <h3>Saude do sistema</h3>
              <span>{health?.environment || '-'}</span>
            </div>
            <DataTable rows={adminHealthRows(health)} columns={[
              { key: 'label', label: 'Indicador' },
              { key: 'value', label: 'Valor' }
            ]} />
          </section>
          <section className="module-panel">
            <div className="panel-title">
              <h3>Backups</h3>
              <span>{backups.length} arquivos</span>
            </div>
            <DataTable rows={backups} columns={[
              { key: 'name', label: 'Arquivo' },
              { key: 'size', label: 'Tamanho', format: formatFileSize },
              { key: 'createdAt', label: 'Criado em', format: formatDateTime }
            ]} actions={canManageAdmin ? (row) => (
              <div className="table-actions">
                <button className="btn" type="button" onClick={() => restoreBackup(row)}><IconText name="history">Restaurar</IconText></button>
              </div>
            ) : undefined} />
          </section>
        </section>
      )}

      {showRegistryGrid && (
        <section className="admin-grid">
        {showStatuses && <section className="module-panel admin-card">
          <div className="panel-title">
            <h3>{statusEditingId ? 'Editar status' : 'Cadastrar status'}</h3>
            <span>Fluxo de producao</span>
          </div>
          <form className="admin-form-grid" onSubmit={submitStatus}>
            <label className="field admin-span-2">
              <span>Nome do status</span>
              <input className="input" value={statusForm.name} onChange={(event) => setStatusForm((form) => ({ ...form, name: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Sequencia</span>
              <input className="input" type="number" value={statusForm.sortOrder} onChange={(event) => setStatusForm((form) => ({ ...form, sortOrder: event.target.value }))} />
            </label>
            <label className="field">
              <span>Tipo</span>
              <select className="input" value={statusForm.category} onChange={(event) => setStatusForm((form) => ({ ...form, category: event.target.value === 'production' ? 'production' : 'auxiliary' }))}>
                <option value="production">Producao</option>
                <option value="auxiliary">Processos auxiliares</option>
              </select>
            </label>
            <label className="field">
              <span>Fluxo</span>
              <select className="input" value={statusForm.flowType} onChange={(event) => setStatusForm((form) => ({ ...form, flowType: event.target.value === 'deviation' ? 'deviation' : 'normal' }))}>
                <option value="normal">Normal</option>
                <option value="deviation">Desvio</option>
              </select>
            </label>
            <div className="admin-form-actions">
              <button className="btn primary" type="submit" disabled={!canManageAdmin}><IconText name="save">{statusEditingId ? 'Salvar status' : 'Cadastrar status'}</IconText></button>
              {statusEditingId && (
                <button className="btn" type="button" onClick={() => {
                  setStatusEditingId('');
                  setStatusForm(emptyAdminStatusForm());
                }}><IconText name="close">Cancelar</IconText></button>
              )}
            </div>
          </form>
          <DataTable rows={statuses} columns={[
            { key: 'sortOrder', label: 'Seq.', format: formatInteger },
            { key: 'name', label: 'Status' },
            { key: 'category', label: 'Tipo', format: statusCategoryLabelReact },
            { key: 'flowType', label: 'Fluxo', format: statusFlowLabelReact }
          ]} actions={canManageAdmin ? (row) => (
            <div className="table-actions">
              <button className="btn" type="button" onClick={() => {
                setStatusEditingId(String(row.id || ''));
                setStatusForm(statusFormFromRow(row));
              }}><IconText name="edit">Editar</IconText></button>
              <button className="btn" type="button" onClick={() => deleteStatus(row)}><IconText name="trash">Excluir</IconText></button>
            </div>
          ) : undefined} />
        </section>}

        {showCustomers && <section className="module-panel admin-card">
          <div className="panel-title">
            <h3>{customerEditingId ? 'Editar cliente' : 'Cadastrar cliente'}</h3>
            <span>Base comercial</span>
          </div>
          <form className="admin-form-grid" onSubmit={submitCustomer}>
            <label className="field admin-span-2">
              <span>Nome do cliente</span>
              <input className="input" value={customerForm.name} onChange={(event) => setCustomerForm({ name: event.target.value })} required />
            </label>
            <div className="admin-form-actions">
              <button className="btn primary" type="submit" disabled={!canManageAdmin}><IconText name="save">{customerEditingId ? 'Salvar cliente' : 'Cadastrar cliente'}</IconText></button>
              {customerEditingId && (
                <button className="btn" type="button" onClick={() => {
                  setCustomerEditingId('');
                  setCustomerForm(emptyAdminCustomerForm());
                }}><IconText name="close">Cancelar</IconText></button>
              )}
            </div>
          </form>
          <DataTable rows={customers} columns={[
            { key: 'name', label: 'Cliente' },
            { key: 'createdAt', label: 'Criado em', format: formatDateTime }
          ]} actions={canManageAdmin ? (row) => (
            <div className="table-actions">
              <button className="btn" type="button" onClick={() => {
                setCustomerEditingId(String(row.id || ''));
                setCustomerForm(customerFormFromRow(row));
              }}><IconText name="edit">Editar</IconText></button>
              <button className="btn" type="button" onClick={() => deleteCustomer(row)}><IconText name="trash">Excluir</IconText></button>
            </div>
          ) : undefined} />
        </section>}

        {showPcpMotives && <section className="module-panel admin-card">
          <div className="panel-title">
            <h3>Cadastrar motivo PCP</h3>
            <span>Compras, engenharia e retrabalho</span>
          </div>
          <form className="admin-form-grid" onSubmit={submitPcpMotive}>
            <label className="field">
              <span>Tipo</span>
              <select className="input" value={pcpMotiveForm.reason} onChange={(event) => setPcpMotiveForm((form) => ({ ...form, reason: event.target.value }))}>
                <option value="purchase">Compras</option>
                <option value="engineering">Engenharia</option>
                <option value="rework">Retrabalho</option>
              </select>
            </label>
            <label className="field admin-span-2">
              <span>Motivo</span>
              <input className="input" value={pcpMotiveForm.name} onChange={(event) => setPcpMotiveForm((form) => ({ ...form, name: event.target.value }))} required />
            </label>
            <div className="admin-form-actions">
              <button className="btn primary" type="submit" disabled={!canManageAdmin}><IconText name="plus">Cadastrar motivo</IconText></button>
            </div>
          </form>
          <DataTable rows={pcpMotives} columns={[
            { key: 'reason', label: 'Tipo', format: pcpReasonLabel },
            { key: 'name', label: 'Motivo' },
            { key: 'createdAt', label: 'Criado em', format: formatDateTime }
          ]} />
        </section>}

        {showUsers && <section className="module-panel admin-card admin-card-wide">
          <div className="panel-title">
            <h3>{userEditingId ? 'Editar usuario' : 'Cadastrar usuario'}</h3>
            <span>Perfis e permissoes por tela</span>
          </div>
          <form className="admin-user-form" onSubmit={submitUser}>
            <div className="admin-form-grid">
              <label className="field">
                <span>Nome</span>
                <input className="input" value={userForm.name} onChange={(event) => setUserForm((form) => ({ ...form, name: event.target.value }))} required />
              </label>
              <label className="field">
                <span>Usuario</span>
                <input className="input" value={userForm.username} onChange={(event) => setUserForm((form) => ({ ...form, username: event.target.value }))} required />
              </label>
              <label className="field">
                <span>{userEditingId ? 'Nova senha' : 'Senha'}</span>
                <input className="input" type="password" value={userForm.password} placeholder={userEditingId ? 'Manter senha atual' : ''} onChange={(event) => setUserForm((form) => ({ ...form, password: event.target.value }))} />
              </label>
              <label className="field">
                <span>Perfil</span>
                <select className="input" value={userForm.role} onChange={(event) => setUserForm((form) => adminUserRoleForm(form, event.target.value as UserRole))}>
                  {adminRoleOptions.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}
                </select>
              </label>
              <label className="admin-checkbox admin-span-2">
                <input type="checkbox" checked={userForm.canEditOrders} onChange={(event) => setUserForm((form) => ({ ...form, canEditOrders: event.target.checked }))} />
                <span>Pode editar pedidos de venda</span>
              </label>
            </div>
            <div className="admin-permission-grid">
              <fieldset>
                <legend>Telas visiveis</legend>
                <div className="permission-actions">
                  <button className="btn" type="button" disabled={userForm.role === 'admin'} onClick={() => setUserForm((form) => adminSetAllVisible(form))}>
                    Todas
                  </button>
                  <button className="btn" type="button" disabled={userForm.role === 'admin'} onClick={() => setUserForm((form) => adminClearVisible(form))}>
                    Limpar
                  </button>
                </div>
                <div className="permission-check-grid">
                  {adminPermissionOptions.map((tab) => (
                    <label key={tab.key}>
                      <input
                        type="checkbox"
                        checked={userForm.role === 'admin' || userForm.visibleTabs.includes(tab.key)}
                        disabled={userForm.role === 'admin'}
                        onChange={() => setUserForm((form) => toggleAdminVisibleTab(form, tab.key))}
                      />
                      <span>{tab.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Telas editaveis</legend>
                <div className="permission-actions">
                  <button className="btn" type="button" disabled={userForm.role === 'admin'} onClick={() => setUserForm((form) => adminSetAllEditable(form))}>
                    Todas visiveis
                  </button>
                  <button className="btn" type="button" disabled={userForm.role === 'admin'} onClick={() => setUserForm((form) => ({ ...form, editableTabs: [] }))}>
                    Limpar
                  </button>
                </div>
                <div className="permission-check-grid">
                  {adminPermissionOptions.map((tab) => (
                    <label key={tab.key}>
                      <input
                        type="checkbox"
                        checked={userForm.role === 'admin' || userForm.editableTabs.includes(tab.key)}
                        disabled={userForm.role === 'admin' || !userForm.visibleTabs.includes(tab.key)}
                        onChange={() => setUserForm((form) => toggleAdminEditableTab(form, tab.key))}
                      />
                      <span>{tab.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="admin-form-actions">
              <button className="btn primary" type="submit" disabled={!canManageAdmin}><IconText name="save">{userEditingId ? 'Salvar usuario' : 'Cadastrar usuario'}</IconText></button>
              {userEditingId && (
                <button className="btn" type="button" onClick={() => {
                  setUserEditingId('');
                  setUserForm(emptyAdminUserForm());
                }}><IconText name="close">Cancelar</IconText></button>
              )}
            </div>
          </form>
          <DataTable rows={users} columns={[
            { key: 'name', label: 'Nome' },
            { key: 'username', label: 'Usuario' },
            { key: 'role', label: 'Perfil', format: adminRoleLabel },
            { key: 'canEditOrders', label: 'Edita pedidos', format: yesNo },
            { key: 'visibleTabs', label: 'Visualiza', format: formatTabList },
            { key: 'editableTabs', label: 'Edita telas', format: formatTabList }
          ]} actions={canManageAdmin ? (row) => (
            <div className="table-actions">
              <button className="btn" type="button" onClick={() => {
                setUserEditingId(String(row.id || ''));
                setUserForm(userFormFromRow(row));
              }}><IconText name="edit">Editar</IconText></button>
              <button className="btn" type="button" disabled={String(row.id || '') === user.id || String(row.role || '') === 'admin'} onClick={() => deleteUser(row)}><IconText name="trash">Excluir</IconText></button>
            </div>
          ) : undefined} />
        </section>}
      </section>
      )}
    </ModuleFrame>
  );
}

function adminSectionTitle(section: AdminScreenSection) {
  if (section === 'system') return 'Sistema';
  if (section === 'statuses') return 'Cadastro Status';
  if (section === 'customers') return 'Cadastro cliente';
  if (section === 'pcpMotives') return 'Cadastro de motivos PCP';
  if (section === 'users') return 'Cadastro de usuarios';
  return 'Cadastros administrativos';
}

function adminSectionSubtitle(section: AdminScreenSection) {
  if (section === 'system') return 'Saude do sistema, backups, banco conectado e disponibilidade.';
  if (section === 'statuses') return 'Sequencia, tipo de producao e fluxo dos status.';
  if (section === 'customers') return 'Base de clientes utilizada nos pedidos de venda.';
  if (section === 'pcpMotives') return 'Motivos padronizados para pendencias de compras, engenharia e retrabalho.';
  if (section === 'users') return 'Usuarios, perfis, permissoes de visualizacao e permissao de edicao.';
  return 'Usuarios, status, clientes, motivos e parametrizacoes.';
}

function emptyAdminStatusForm(): AdminStatusForm {
  return {
    name: '',
    category: 'production',
    sortOrder: '',
    flowType: 'normal'
  };
}

function statusFormFromRow(row: Row): AdminStatusForm {
  return {
    name: String(row.name || ''),
    category: row.category === 'production' ? 'production' : 'auxiliary',
    sortOrder: row.sortOrder === null || row.sortOrder === undefined ? '' : String(row.sortOrder),
    flowType: row.flowType === 'deviation' ? 'deviation' : 'normal'
  };
}

function adminStatusPayload(form: AdminStatusForm) {
  return {
    name: form.name.trim(),
    category: form.category,
    sortOrder: form.sortOrder === '' ? null : Number(form.sortOrder),
    flowType: form.flowType
  };
}

function emptyAdminCustomerForm(): AdminCustomerForm {
  return { name: '' };
}

function customerFormFromRow(row: Row): AdminCustomerForm {
  return { name: String(row.name || '') };
}

function emptyAdminPcpMotiveForm(): AdminPcpMotiveForm {
  return {
    reason: 'purchase',
    name: ''
  };
}

function emptyAdminUserForm(): AdminUserForm {
  return {
    name: '',
    username: '',
    password: '',
    role: 'viewer',
    canEditOrders: false,
    visibleTabs: adminPermissionKeysForAccessTabs(['orders', 'dashboard', 'products', 'reports']),
    editableTabs: []
  };
}

function userFormFromRow(row: Row): AdminUserForm {
  const role = adminUserRole(row.role);
  const visibleTabs = adminTabList(row.visibleTabs);
  const editableTabs = adminTabList(row.editableTabs).filter((tab) => visibleTabs.includes(tab));
  const fullTabs = adminAllTabs();
  return {
    name: String(row.name || ''),
    username: String(row.username || ''),
    password: '',
    role,
    canEditOrders: Boolean(row.canEditOrders),
    visibleTabs: role === 'admin' ? fullTabs : visibleTabs,
    editableTabs: role === 'admin' ? fullTabs : editableTabs
  };
}

function adminUserPayload(form: AdminUserForm, editing: boolean) {
  const role = adminUserRole(form.role);
  const visibleTabs = role === 'admin' ? adminAllTabs() : form.visibleTabs;
  const editableTabs = role === 'admin'
    ? adminAllTabs()
    : form.editableTabs.filter((tab) => visibleTabs.includes(tab));
  const body: Row = {
    name: form.name.trim(),
    username: form.username.trim(),
    role,
    canEditOrders: role === 'admin' ? true : form.canEditOrders,
    visibleTabs,
    editableTabs
  };
  if (!editing || form.password.trim()) {
    body.password = form.password.trim();
  }
  return body;
}

function adminUserRoleForm(form: AdminUserForm, roleValue: UserRole): AdminUserForm {
  const role = adminUserRole(roleValue);
  if (role === 'admin') {
    return {
      ...form,
      role,
      canEditOrders: true,
      visibleTabs: adminAllTabs(),
      editableTabs: adminAllTabs()
    };
  }
  return {
    ...form,
    role,
    editableTabs: form.editableTabs.filter((tab) => form.visibleTabs.includes(tab))
  };
}

function toggleAdminVisibleTab(form: AdminUserForm, tab: PermissionKey): AdminUserForm {
  if (form.role === 'admin') return form;
  const visibleTabs = toggleStringValue(form.visibleTabs, tab);
  return {
    ...form,
    visibleTabs,
    editableTabs: form.editableTabs.filter((item) => visibleTabs.includes(item))
  };
}

function toggleAdminEditableTab(form: AdminUserForm, tab: PermissionKey): AdminUserForm {
  if (form.role === 'admin' || !form.visibleTabs.includes(tab)) return form;
  return {
    ...form,
    editableTabs: toggleStringValue(form.editableTabs, tab)
  };
}

function adminSetAllVisible(form: AdminUserForm): AdminUserForm {
  if (form.role === 'admin') return form;
  return {
    ...form,
    visibleTabs: adminAllTabs()
  };
}

function adminClearVisible(form: AdminUserForm): AdminUserForm {
  if (form.role === 'admin') return form;
  return {
    ...form,
    visibleTabs: [],
    editableTabs: []
  };
}

function adminSetAllEditable(form: AdminUserForm): AdminUserForm {
  if (form.role === 'admin') return form;
  return {
    ...form,
    editableTabs: form.visibleTabs
  };
}

function toggleStringValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function adminAllTabs(): PermissionKey[] {
  return adminPermissionOptions.map((tab) => tab.key);
}

function adminTabList(rawValue: unknown): PermissionKey[] {
  const allowed = new Set(adminAllTabs());
  const output: PermissionKey[] = [];
  for (const value of stringList(rawValue)) {
    if (allowed.has(value as PermissionKey)) {
      output.push(value as PermissionKey);
      continue;
    }
    output.push(...adminPermissionKeysForAccessTabs([value as TabKey]));
  }
  return Array.from(new Set(output));
}

function adminUserRole(value: unknown): UserRole {
  const role = String(value || 'viewer');
  return adminRoleOptions.some((option) => option.key === role) ? role as UserRole : 'viewer';
}

function adminRoleLabel(value: unknown) {
  const role = adminUserRole(value);
  return adminRoleOptions.find((option) => option.key === role)?.label || role;
}

function formatTabList(value: unknown) {
  const tabs = adminTabList(value);
  return tabs.length ? tabs.map(adminTabLabel).join(', ') : '-';
}

function adminTabLabel(tab: PermissionKey) {
  return adminPermissionOptions.find((option) => option.key === tab)?.label || tab;
}

function statusCategoryLabelReact(value: unknown) {
  return value === 'production' ? 'Producao' : 'Processos auxiliares';
}

function statusFlowLabelReact(value: unknown) {
  return value === 'deviation' ? 'Desvio' : 'Normal';
}

function pcpReasonLabel(value: unknown) {
  return reasonLabels[String(value || '')] || formatLoose(value);
}

function formatFileSize(value: unknown) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${formatInteger(bytes)} B`;
  if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024)} KB`;
  return `${formatNumber(bytes / 1024 / 1024)} MB`;
}

function formatUptime(value: unknown) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function adminHealthRows(health: Row | null): Row[] {
  const latestBackup = asRow(health?.latestBackup);
  return [
    { label: 'Aplicacao', value: String(health?.appName || 'S&OP') },
    { label: 'Versao', value: String(health?.version || '-') },
    { label: 'Ambiente', value: String(health?.environment || '-') },
    { label: 'Servidor', value: health?.serverOnline ? 'Online' : 'Offline' },
    { label: 'Banco', value: health?.dbConnected ? `${String(health?.dbProvider || '-')}` : `Falha ${String(health?.dbError || '')}`.trim() },
    { label: 'Porta', value: String(health?.port || '-') },
    { label: 'Uptime', value: formatUptime(health?.uptimeSeconds) },
    { label: 'WebSocket', value: health?.realtimeClients === null || health?.realtimeClients === undefined ? '-' : String(health.realtimeClients) },
    { label: 'Sessoes', value: health?.activeSessions === null || health?.activeSessions === undefined ? '-' : String(health.activeSessions) },
    { label: 'Ultimo backup', value: latestBackup.name ? `${String(latestBackup.name)} - ${formatDateTime(latestBackup.createdAt)}` : '-' },
    { label: 'Node', value: String(health?.nodeVersion || '-') },
    { label: 'Plataforma', value: String(health?.platform || '-') }
  ];
}

const adminRoleOptions: Array<{ key: UserRole; label: string }> = [
  { key: 'admin', label: 'Administrador' },
  { key: 'commercial', label: 'Comercial' },
  { key: 'production', label: 'Producao' },
  { key: 'financial', label: 'Financeiro' },
  { key: 'viewer', label: 'Consulta' },
  { key: 'user', label: 'Usuario' }
];

const adminPermissionOptions: Array<{ key: PermissionKey; label: string; accessTab: TabKey }> = [
  { key: screenPermissionKey('orders'), label: 'S&OP / Pedidos de vendas', accessTab: 'orders' },
  { key: screenPermissionKey('dashboard'), label: 'S&OP / Dashboards', accessTab: 'dashboard' },
  { key: screenPermissionKey('products'), label: 'S&OP / Produtos', accessTab: 'products' },
  { key: screenPermissionKey('billing'), label: 'Faturamento / Faturamento', accessTab: 'billing' },
  { key: screenPermissionKey('loading'), label: 'Supply / Aguardando carregamento', accessTab: 'loading' },
  { key: screenPermissionKey('thirdParty'), label: 'Supply / Terceiros', accessTab: 'thirdParty' },
  { key: screenPermissionKey('purchasePending'), label: 'Supply / Pedidos de compras pendentes', accessTab: 'pcp' },
  { key: screenPermissionKey('pcp'), label: 'Supply / Pendencias PCP', accessTab: 'pcp' },
  { key: screenPermissionKey('sequencing'), label: 'Supply / Sequenciamento Projetos', accessTab: 'sequencing' },
  { key: screenPermissionKey('aps'), label: 'Supply / APS', accessTab: 'aps' },
  { key: screenPermissionKey('quality'), label: 'Qualidade / Alertas', accessTab: 'quality' },
  { key: screenPermissionKey('qualityRnc'), label: 'Qualidade / RNC A3', accessTab: 'quality' },
  { key: screenPermissionKey('ai'), label: 'IA / Bancada de IA', accessTab: 'ai' },
  { key: screenPermissionKey('reports'), label: 'Gestao / Relatorio de atividades', accessTab: 'reports' },
  { key: screenPermissionKey('system'), label: 'Gestao / Sistema', accessTab: 'admin' },
  { key: screenPermissionKey('adminStatus'), label: 'Cadastros / Cadastro Status', accessTab: 'admin' },
  { key: screenPermissionKey('adminCustomers'), label: 'Cadastros / Cadastro cliente', accessTab: 'admin' },
  { key: screenPermissionKey('adminPcpMotives'), label: 'Cadastros / Cadastro de motivos PCP', accessTab: 'admin' },
  { key: screenPermissionKey('adminUsers'), label: 'Cadastros / Cadastro de usuarios', accessTab: 'admin' },
  { key: screenPermissionKey('adminApsOperators'), label: 'Cadastros / Cadastro de operadores', accessTab: 'aps' },
  { key: screenPermissionKey('adminApsCalendar'), label: 'Cadastros / Calendario produtivo', accessTab: 'aps' },
  { key: screenPermissionKey('adminApsWorkCenters'), label: 'Cadastros / Centro de trabalho', accessTab: 'aps' },
  { key: screenPermissionKey('adminApsOperations'), label: 'Cadastros / Operacoes', accessTab: 'aps' }
];

function screenPermissionKey(screen: ScreenKey): PermissionKey {
  return `screen:${screen}` as PermissionKey;
}

function adminPermissionKeysForAccessTabs(tabs: TabKey[]) {
  const requested = new Set(tabs);
  return adminPermissionOptions
    .filter((option) => requested.has(option.accessTab))
    .map((option) => option.key);
}

const aiContextOptions = [
  { key: 'all', label: 'Geral' },
  { key: 'orders', label: 'Pedidos de venda' },
  { key: 'production', label: 'Producao' },
  { key: 'products', label: 'Produtos / demanda' },
  { key: 'pcp', label: 'Pendencias PCP' },
  { key: 'billing', label: 'Faturamento' },
  { key: 'quality', label: 'Qualidade' },
  { key: 'aps', label: 'APS' },
  { key: 'supply', label: 'Supply' },
  { key: 'management', label: 'Gestao' }
];

const aiSourceTypeOptions = [
  { key: 'manual', label: 'Manual' },
  { key: 'procedure', label: 'Procedimento' },
  { key: 'policy', label: 'Politica' },
  { key: 'dataset', label: 'Dataset' },
  { key: 'decision', label: 'Decisao registrada' },
  { key: 'training-note', label: 'Nota de treinamento' }
];

function emptyAiKnowledgeForm(): AiKnowledgeFormState {
  return {
    title: '',
    sourceType: 'manual',
    scope: 'all',
    tags: '',
    content: '',
    status: 'active'
  };
}

function emptyAiTrainingForm(): AiTrainingFormState {
  return {
    objective: '',
    datasetScope: 'all',
    modelTarget: 'decision-support',
    notes: '',
    resultSummary: '',
    status: 'planned'
  };
}

function aiContextLabel(value: unknown) {
  const key = String(value || 'all');
  return aiContextOptions.find((option) => option.key === key)?.label || key;
}

function aiSourceTypeLabel(value: unknown) {
  const key = String(value || 'manual');
  return aiSourceTypeOptions.find((option) => option.key === key)?.label || key;
}

function aiSourceStatusLabel(value: unknown) {
  const status = String(value || 'active');
  if (status === 'inactive') return 'Inativa';
  if (status === 'archived') return 'Arquivada';
  return 'Ativa';
}

function aiTrainingStatusLabel(value: unknown) {
  const status = String(value || 'planned');
  if (status === 'running') return 'Em treinamento';
  if (status === 'validated') return 'Validado';
  if (status === 'rejected') return 'Reprovado';
  if (status === 'archived') return 'Arquivado';
  return 'Planejado';
}

function aiConfidenceLabel(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return `${formatNumber(number * 100)}%`;
}

function aiContextRows(analysis: Row | null, insights: Row): Row[] {
  const metrics = asRow(analysis?.metrics);
  return [
    { label: 'Pedidos ativos', value: metrics.activeOrders ?? insights.productionOpenOrders ?? '-' },
    { label: 'Pedidos em atraso', value: metrics.lateOrders ?? '-' },
    { label: 'Vencendo em 7 dias', value: metrics.dueSoonOrders ?? '-' },
    { label: 'Pendencias PCP abertas', value: metrics.openPcp ?? '-' },
    { label: 'Pendencias PCP vencidas', value: metrics.overduePcp ?? '-' },
    { label: 'Liberados faturamento', value: metrics.billingReleased ?? '-' },
    { label: 'Alertas qualidade', value: metrics.qualityAlerts ?? '-' },
    { label: 'Previsoes usadas', value: metrics.forecasts ?? '-' },
    { label: 'Confianca', value: aiConfidenceLabel(analysis?.confidence) }
  ];
}

function emptyQualityAlertForm(): QualityAlertFormState {
  return {
    orderId: '',
    orderNumber: '',
    customer: '',
    productLine: '',
    sku: '',
    capacityTr: '',
    quantity: '',
    wrongDescription: '',
    rightDescription: '',
    wrongPhoto: null,
    rightPhoto: null
  };
}

function qualityAlertFormFromRow(row: Row): QualityAlertFormState {
  return {
    orderId: String(row.orderId || ''),
    orderNumber: String(row.orderNumber || ''),
    customer: String(row.customer || ''),
    productLine: String(row.productLine || ''),
    sku: String(row.sku || ''),
    capacityTr: formNumber(row.capacityTr),
    quantity: formNumber(row.quantity),
    wrongDescription: String(row.wrongDescription || ''),
    rightDescription: String(row.rightDescription || ''),
    wrongPhoto: qualityAlertPhotoFromRow(row, 'wrong'),
    rightPhoto: qualityAlertPhotoFromRow(row, 'right')
  };
}

function qualityAlertPayload(form: QualityAlertFormState) {
  return {
    orderId: form.orderId,
    orderNumber: form.orderNumber.trim(),
    customer: form.customer.trim(),
    productLine: form.productLine.trim(),
    sku: form.sku.trim().toUpperCase(),
    capacityTr: form.capacityTr,
    quantity: form.quantity,
    wrongPhoto: form.wrongPhoto || {},
    wrongDescription: form.wrongDescription.trim(),
    rightPhoto: form.rightPhoto || {},
    rightDescription: form.rightDescription.trim()
  };
}

function qualityFormWithOrder(form: QualityAlertFormState, orders: Row[], orderId: string): QualityAlertFormState {
  const order = orders.find((item) => String(item.id || '') === orderId);
  if (!order) return { ...form, orderId };
  return {
    ...form,
    orderId,
    orderNumber: String(order.orderNumber || ''),
    customer: String(order.customer || ''),
    productLine: String(order.productLine || ''),
    sku: String(order.sku || ''),
    capacityTr: formNumber(order.capacityTr),
    quantity: formNumber(order.quantity)
  };
}

function selectedQualityAlerts(alerts: Row[], selectedIds: string[]) {
  const selected = new Set(selectedIds);
  return alerts.filter((alert) => selected.has(String(alert.id || '')));
}

function qualityOrderLabel(order: Row) {
  return [
    order.orderNumber || 'Sem numero',
    order.customer || 'Sem cliente',
    order.sku || 'Sem SKU',
    [order.productLine, order.capacityTr ? `${formatNumber(order.capacityTr)} TR` : ''].filter(Boolean).join(' ')
  ].filter(Boolean).join(' | ');
}

function qualityAlertStatusLabel(row: Row) {
  return String(row.status || 'open') === 'resolved' ? 'Resolvido' : 'Ativo';
}

function qualityPhotoSummary(row: Row) {
  const parts: string[] = [];
  if (row.hasWrongPhoto || row.wrongPhotoDataUrl) parts.push('Errado');
  if (row.hasRightPhoto || row.rightPhotoDataUrl) parts.push('Certo');
  return parts.length ? parts.join(' + ') : '-';
}

function qualityAlertPhotoFromRow(row: Row, kind: 'wrong' | 'right'): InvoiceDocumentInput | null {
  const prefix = kind === 'right' ? 'right' : 'wrong';
  const fileName = String(row[`${prefix}PhotoName`] || '');
  const mimeType = String(row[`${prefix}PhotoMimeType`] || '');
  const dataUrl = String(row[`${prefix}PhotoDataUrl`] || '');
  if (!fileName || !mimeType || !dataUrl) return null;
  return { fileName, mimeType, dataUrl };
}

async function qualityPhotoFromFile(file: File): Promise<InvoiceDocumentInput> {
  const mimeType = (file.type || inferQualityImageMimeType(file.name)).toLowerCase();
  if (!qualityImageMimeTypes.has(mimeType)) {
    throw new Error(`Formato nao permitido: ${file.name}. Use PNG, JPG, WEBP ou GIF.`);
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error(`Imagem muito grande: ${file.name}. Limite de 5 MB.`);
  }
  const dataUrl = await readFileAsDataUrl(file);
  return {
    fileName: file.name,
    mimeType,
    dataUrl: normalizeDataUrlMime(dataUrl, mimeType)
  };
}

function inferQualityImageMimeType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return '';
}

const qualityImageMimeTypes = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);

async function loadPreferenceState<T>(key: PreferenceKey, fallback: T, normalize: (value: unknown) => T): Promise<T> {
  try {
    const { value } = await api<{ value?: unknown }>(`/api/preferences/${key}`);
    if (isPlainPreference(value) && Object.keys(value).length) {
      return normalize(value);
    }
  } catch {
    // Mantem a tela funcional se a preferencia ainda nao existir ou o backend estiver em homologacao.
  }
  return fallback;
}

function persistPreferenceState(key: PreferenceKey, value: unknown) {
  api(`/api/preferences/${key}`, { method: 'PUT', body: { value } }).catch(() => null);
}

function readLocalPreference(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalPreference(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cache local e apenas conveniencia; a fonte principal continua sendo o backend.
  }
}

function loadPurchasePendingState(userId: string): PurchasePendingState {
  const rawState = asRow(readLocalPreference(purchasePendingStorageKey(userId)));
  return {
    rows: [],
    sourceName: '',
    importedAt: '',
    search: String(rawState.search || ''),
    buyerFilter: String(rawState.buyerFilter || ''),
    sortField: String(rawState.sortField || ''),
    sortDirection: rawState.sortDirection === 'desc' ? 'desc' : 'asc'
  };
}

function purchasePendingStorageKey(userId: string) {
  return `mge-sop-react-purchase-pending:${userId || 'default'}`;
}

function normalizePurchasePendingRows(value: unknown): Row[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      const row = asRow(item);
      const itemStatus = String(row.itemStatus || 'pending') === 'resolved' ? 'resolved' : 'pending';
      const salesOrderNumber = String(row.salesOrderNumber || row.linkedSalesOrderNumber || '').trim();
      return {
        ...row,
        id: String(row.id || `purchase-pending-${index + 1}`),
        salesOrderId: String(row.salesOrderId || '').trim(),
        salesOrderNumber,
        linkedSalesOrderNumber: salesOrderNumber || 'Sem vinculo',
        itemStatus,
        itemStatusLabel: itemStatus === 'resolved' ? 'Baixado' : 'Pendente'
      };
    })
    .filter((row) => Object.entries(row).some(([key, cell]) => !purchasePendingMetaKeys().has(key) && String(cell || '').trim()));
}

function parsePurchasePendingImport(text: string): Row[] {
  const cleanText = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!cleanText) return [];
  const delimiter = detectDelimitedSeparator(cleanText);
  const table = parseDelimitedText(cleanText, delimiter)
    .map((row) => row.map((cell) => String(cell || '').trim()))
    .filter((row) => row.some(Boolean));
  if (table.length < 2) return [];

  const headers = uniqueColumnLabels(table[0].map((header, index) => header || `Coluna ${index + 1}`));
  return table.slice(1)
    .map((cells, rowIndex) => {
      const row: Row = { id: `purchase-pending-${Date.now()}-${rowIndex}` };
      headers.forEach((header, columnIndex) => {
        row[header] = cells[columnIndex] || '';
      });
      return row;
    })
    .filter((row) => Object.entries(row).some(([key, cell]) => key !== 'id' && String(cell || '').trim()));
}

function detectDelimitedSeparator(text: string) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || '';
  const candidates = ['\t', ';', ','];
  return candidates
    .map((separator) => ({ separator, count: firstLine.split(separator).length }))
    .sort((left, right) => right.count - left.count)[0]?.separator || ';';
}

function parseDelimitedText(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === delimiter && !quoted) {
      row.push(cell);
      cell = '';
      continue;
    }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function uniqueColumnLabels(labels: string[]) {
  const counts = new Map<string, number>();
  return labels.map((label, index) => {
    const cleanLabel = String(label || `Coluna ${index + 1}`).trim() || `Coluna ${index + 1}`;
    const count = (counts.get(cleanLabel) || 0) + 1;
    counts.set(cleanLabel, count);
    return count === 1 ? cleanLabel : `${cleanLabel} ${count}`;
  });
}

function purchasePendingColumns(rows: Row[], linkOptions?: {
  editable: boolean;
  activeOrderOptions: Row[];
  linkBusyId: string;
  onLinkChange: (row: Row, salesOrderId: string) => void;
}): Column[] {
  const keys = rows.flatMap((row) => Object.keys(row).filter((key) => !purchasePendingMetaKeys().has(key)));
  const orderedKeys = Array.from(new Set(keys));
  const linkedOrderColumn: Column = {
    key: 'linkedSalesOrderNumber',
    label: 'Pedido venda vinculado',
    render: (row) => purchasePendingLinkCell(row, linkOptions),
    format: (value, row) => String(row.salesOrderNumber || value || 'Sem vinculo')
  };
  return orderedKeys.length
    ? [
      ...orderedKeys.map((key) => ({ key, label: key })),
      linkedOrderColumn,
      { key: 'itemStatusLabel', label: 'Situacao' },
      { key: 'resolvedBy', label: 'Baixado por' },
      { key: 'resolvedAt', label: 'Baixado em', format: formatDateTime },
      { key: 'resolutionNote', label: 'Obs. baixa' }
    ]
    : [
      { key: 'Fornecedor', label: 'Fornecedor' },
      { key: 'Pedido de compra', label: 'Pedido de compra' },
      { key: 'Codigo', label: 'Codigo' },
      { key: 'Descricao', label: 'Descricao' },
      { key: 'Quantidade', label: 'Quantidade' },
      { key: 'Data entrega prevista', label: 'Data entrega prevista' },
      { key: 'Status', label: 'Status' },
      linkedOrderColumn,
      { key: 'itemStatusLabel', label: 'Situacao' }
    ];
}

function purchasePendingLinkCell(row: Row, options?: {
  editable: boolean;
  activeOrderOptions: Row[];
  linkBusyId: string;
  onLinkChange: (row: Row, salesOrderId: string) => void;
}) {
  const currentOrderId = String(row.salesOrderId || '').trim();
  const rawCurrentOrderNumber = String(row.salesOrderNumber || row.linkedSalesOrderNumber || '').trim();
  const currentOrderNumber = normalizeText(rawCurrentOrderNumber) === 'sem vinculo' ? '' : rawCurrentOrderNumber;
  const isResolved = String(row.itemStatus || 'pending') === 'resolved';
  const suggestedOrders = options ? purchasePendingSuggestedSalesOrders(row, options.activeOrderOptions) : [];
  if (!options?.editable || isResolved) {
    return (
      <div className="purchase-link-cell">
        {currentOrderNumber
          ? <span className="purchase-link-chip active">{currentOrderNumber}</span>
          : <span className="muted-text">Sem vinculo</span>}
      </div>
    );
  }

  const hasCurrentOption = !currentOrderId || options.activeOrderOptions.some((order) => String(order.id || '') === currentOrderId);
  return (
    <div className="purchase-link-cell">
      {!!suggestedOrders.length && (
        <div className="purchase-link-chip-list" aria-label="Pedidos sugeridos pela observacao interna">
          {suggestedOrders.map((order) => {
            const orderId = String(order.id || '');
            const selected = currentOrderId === orderId;
            return (
              <button
                key={orderId}
                className={`purchase-link-chip ${selected ? 'active' : ''}`}
                type="button"
                disabled={selected || options.linkBusyId === String(row.id || '')}
                title={purchasePendingOrderOptionLabel(order)}
                onClick={() => options.onLinkChange(row, orderId)}
              >
                {String(order.orderNumber || orderId)}
              </button>
            );
          })}
        </div>
      )}
      <select
        className="input purchase-link-select"
        value={currentOrderId}
        disabled={options.linkBusyId === String(row.id || '')}
        onChange={(event) => options.onLinkChange(row, event.target.value)}
      >
        <option value="">Sem vinculo</option>
        {!hasCurrentOption && <option value={currentOrderId}>{currentOrderNumber || 'Pedido vinculado indisponivel'}</option>}
        {options.activeOrderOptions.map((order) => (
          <option key={String(order.id || '')} value={String(order.id || '')}>
            {purchasePendingOrderOptionLabel(order)}
          </option>
        ))}
      </select>
    </div>
  );
}

function purchasePendingOrderOptionLabel(order: Row) {
  return [
    String(order.orderNumber || '').trim(),
    String(order.customer || '').trim(),
    String(order.sku || '').trim()
  ].filter(Boolean).join(' | ') || String(order.id || 'Pedido ativo');
}

function purchasePendingSuggestedSalesOrders(row: Row, orders: Row[]) {
  const observation = purchasePendingInternalObservation(row);
  if (!observation) return [];
  return orders
    .filter((order) => purchasePendingObservationHasOrder(observation, String(order.orderNumber || '')))
    .sort((left, right) => compareLoose(left.orderNumber, right.orderNumber));
}

function purchasePendingInternalObservation(row: Row) {
  const keys = Object.keys(row).filter((key) => !purchasePendingMetaKeys().has(key));
  const key = keys.find((item) => {
    const normalized = normalizeText(item).replace(/\s+/g, ' ').trim();
    return normalized.includes('observ') && normalized.includes('interna');
  }) || '';
  return key ? String(row[key] || '').trim() : '';
}

function purchasePendingObservationHasOrder(observation: string, orderNumber: string) {
  const cleanOrder = normalizePurchasePendingOrderReference(orderNumber);
  if (!cleanOrder) return false;
  const cleanObservation = ` ${normalizePurchasePendingOrderReference(observation)} `;
  return cleanObservation.includes(` ${cleanOrder} `);
}

function normalizePurchasePendingOrderReference(value: unknown) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function purchasePendingMetrics(rows: Row[]) {
  const supplierKey = findPurchasePendingKey(rows, ['fornecedor', 'supplier', 'cliente']);
  const purchaseOrderKey = findPurchasePendingKey(rows, ['pedido de compra', 'pedido compra', 'purchase order', 'pc']);
  const pendingRows = rows.filter((row) => String(row.itemStatus || 'pending') !== 'resolved');
  return {
    pending: pendingRows.length,
    resolved: rows.length - pendingRows.length,
    suppliers: new Set(pendingRows.map((row) => String(row[supplierKey] || '').trim()).filter(Boolean)).size,
    overdue: pendingRows.filter((row) => purchasePendingIsOverdue(row)).length,
    missingPurchaseOrder: purchaseOrderKey
      ? pendingRows.filter((row) => !String(row[purchaseOrderKey] || '').trim()).length
      : 0
  };
}

function filterPurchasePendingRows(rows: Row[], search: string, buyerFilter: string) {
  const buyerKey = purchasePendingBuyerKey(rows);
  const filteredByBuyer = buyerFilter && buyerKey
    ? rows.filter((row) => String(row[buyerKey] || '').trim() === buyerFilter)
    : rows;
  return filterRows(filteredByBuyer, search);
}

function sortPurchasePendingRows(rows: Row[], columns: Column[], field: string, direction: 'asc' | 'desc') {
  if (!field) return rows;
  const column = columns.find((item) => item.key === field) || { key: field, label: field };
  return [...rows].sort((left, right) => {
    const result = compareLoose(purchasePendingSortValue(left, column), purchasePendingSortValue(right, column));
    if (result !== 0) return direction === 'asc' ? result : -result;
    return compareLoose(left.id, right.id);
  });
}

function purchasePendingSortValue(row: Row, column: Column) {
  const displayValue = column.format ? column.format(row[column.key], row) : row[column.key];
  const dateValue = normalizePurchasePendingDate(displayValue);
  if (dateValue) return dateValue;
  return displayValue;
}

function purchasePendingBuyerOptions(rows: Row[]) {
  const buyerKey = purchasePendingBuyerKey(rows);
  if (!buyerKey) return [];
  return Array.from(new Set(
    rows
      .map((row) => String(row[buyerKey] || '').trim())
      .filter(Boolean)
  )).sort((left, right) => left.localeCompare(right, 'pt-BR'));
}

function purchasePendingBuyerDelayRows(rows: Row[]): Row[] {
  const buyerKey = purchasePendingBuyerKey(rows);
  if (!buyerKey) return [];
  const buckets = new Map<string, { buyer: string; pending: number; overdue: number; totalDelayDays: number; maxDelayDays: number }>();

  rows
    .filter((row) => String(row.itemStatus || 'pending') !== 'resolved')
    .forEach((row) => {
      const buyer = String(row[buyerKey] || '').trim() || 'Sem comprador';
      const delayDays = purchasePendingDelayDays(row);
      const bucket = buckets.get(buyer) || { buyer, pending: 0, overdue: 0, totalDelayDays: 0, maxDelayDays: 0 };
      bucket.pending += 1;
      bucket.totalDelayDays += delayDays;
      if (delayDays > 0) bucket.overdue += 1;
      bucket.maxDelayDays = Math.max(bucket.maxDelayDays, delayDays);
      buckets.set(buyer, bucket);
    });

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      averageDelayDays: bucket.pending ? bucket.totalDelayDays / bucket.pending : 0
    }))
    .sort((left, right) => Number(right.averageDelayDays) - Number(left.averageDelayDays) || String(left.buyer).localeCompare(String(right.buyer), 'pt-BR'));
}

function purchasePendingBuyerKey(rows: Row[]) {
  return findPurchasePendingKey(rows, ['comprador', 'buyer', 'responsavel compras', 'responsável compras', 'responsavel pela compra']);
}

function purchasePendingIsOverdue(row: Row) {
  if (String(row.itemStatus || 'pending') === 'resolved') return false;
  return purchasePendingDelayDays(row) > 0;
}

function purchasePendingDelayDays(row: Row) {
  if (String(row.itemStatus || 'pending') === 'resolved') return 0;
  const deliveryKey = purchasePendingExpectedDeliveryKey(row);
  const deliveryDate = deliveryKey ? normalizePurchasePendingDate(row[deliveryKey]) : '';
  if (!deliveryDate) return 0;
  return diffDays(deliveryDate, dateInputValue(new Date())) || 0;
}

function normalizePurchasePendingDate(value: unknown) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s|$)/);
  if (!match) return '';
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${month}-${day}`;
}

function findPurchasePendingKey(rows: Row[], needles: string[]) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row).filter((key) => !purchasePendingMetaKeys().has(key)))));
  return keys.find((key) => needles.some((needle) => normalizeText(key).includes(normalizeText(needle)))) || '';
}

function purchasePendingRowClass(row: Row) {
  if (String(row.itemStatus || 'pending') === 'resolved') return 'row-muted';
  return purchasePendingIsOverdue(row) ? 'row-danger' : '';
}

function purchasePendingExpectedDeliveryKey(row: Row) {
  const keys = Object.keys(row).filter((key) => !purchasePendingMetaKeys().has(key));
  return keys.find((key) => normalizeText(key).replace(/\s+/g, ' ').trim() === 'data entrega prevista')
    || keys.find((key) => normalizeText(key).includes('data entrega prevista'))
    || '';
}

function purchasePendingCurrentSourceName(rows: Row[]) {
  const pending = rows.find((row) => String(row.itemStatus || 'pending') !== 'resolved');
  return String((pending || rows[0] || {}).sourceName || '');
}

function purchasePendingCurrentImportedAt(rows: Row[]) {
  const pending = rows.find((row) => String(row.itemStatus || 'pending') !== 'resolved');
  return String((pending || rows[0] || {}).importedAt || '');
}

function purchasePendingRowLabel(row: Row) {
  const preferredKeys = [
    findPurchasePendingKey([row], ['pedido de compra', 'pedido compra', 'purchase order', 'pc']),
    findPurchasePendingKey([row], ['fornecedor', 'supplier', 'cliente']),
    findPurchasePendingKey([row], ['codigo', 'código']),
    findPurchasePendingKey([row], ['descricao', 'descrição'])
  ].filter(Boolean);
  for (const key of preferredKeys) {
    const value = String(row[key] || '').trim();
    if (value) return value;
  }
  return String(row.id || 'Pedido pendente');
}

function purchasePendingMetaKeys() {
  return new Set([
    'id',
    'importBatchId',
    'sourceName',
    'rowIndex',
    'salesOrderId',
    'salesOrderNumber',
    'linkedSalesOrderNumber',
    'itemStatus',
    'itemStatusLabel',
    'resolutionNote',
    'resolvedBy',
    'resolvedAt',
    'importedBy',
    'importedAt',
    'createdAt',
    'updatedAt'
  ]);
}

function isPlainPreference(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> {
  if (!isPlainPreference(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, String(item || '')]));
}

function emptyActivityTableState(): ActivityTableState {
  return {
    search: '',
    sortField: 'createdAt',
    sortDirection: 'desc',
    dateFrom: '',
    dateTo: '',
    actionGroup: '',
    pageSize: 50,
    filters: {}
  };
}

function loadActivityTableState(userId: string): ActivityTableState {
  return normalizeActivityTableState(readLocalPreference(activityTableStorageKey(userId)));
}

function normalizeActivityTableState(value: unknown): ActivityTableState {
  const parsed = isPlainPreference(value) ? value : {};
  return {
    ...emptyActivityTableState(),
    ...parsed,
    sortDirection: parsed.sortDirection === 'asc' ? 'asc' : 'desc',
    pageSize: clampActivityPageSize(parsed.pageSize),
    filters: stringRecord(parsed.filters)
  };
}

function persistActivityTableState(userId: string, state: ActivityTableState) {
  const cleanState = normalizeActivityTableState(state);
  writeLocalPreference(activityTableStorageKey(userId), cleanState);
  persistPreferenceState('reportTableState', cleanState);
}

function activityTableStorageKey(userId: string) {
  return `mge-sop-react-activity-table:${userId || 'default'}`;
}

function buildActivityLogParams(state: ActivityTableState, page: number) {
  const params = new URLSearchParams();
  if (state.search) params.set('search', state.search);
  if (state.dateFrom) params.set('dateFrom', state.dateFrom);
  if (state.dateTo) params.set('dateTo', state.dateTo);
  if (state.actionGroup) params.set('actionGroup', state.actionGroup);
  if (state.sortField) params.set('sort', state.sortField);
  params.set('direction', state.sortDirection);
  params.set('page', String(Math.max(1, page)));
  params.set('pageSize', String(clampActivityPageSize(state.pageSize)));
  for (const [field, value] of Object.entries(state.filters || {})) {
    if (String(value || '').trim()) {
      params.set(`filter.${field}`, String(value).trim());
    }
  }
  return params;
}

function clampActivityPageSize(value: unknown) {
  const number = Number(value);
  return [25, 50, 100, 200].includes(number) ? number : 50;
}

function activityColumns(): Column[] {
  return [
    { key: 'createdAt', label: 'Data/hora', format: formatDateTime },
    { key: 'actor', label: 'Usuario' },
    { key: 'action', label: 'Acao' },
    { key: 'entityType', label: 'Tipo' },
    { key: 'entityLabel', label: 'Registro' },
    { key: 'details', label: 'Detalhes' }
  ];
}

function filterActivityRows(rows: Row[], state: ActivityTableState) {
  const query = normalizeText(state.search);
  return rows.filter((row) => {
    if (query && !normalizeText(Object.values(row).join(' ')).includes(query)) return false;
    if (state.actionGroup && activityActionClass(row.action) !== state.actionGroup) return false;
    const day = String(row.createdAt || '').slice(0, 10);
    if (state.dateFrom && (!day || day < state.dateFrom)) return false;
    if (state.dateTo && (!day || day > state.dateTo)) return false;
    return activityMatchesColumnFilters(row, state.filters);
  });
}

function activityMatchesColumnFilters(row: Row, filters: Record<string, string>) {
  return activityColumns().every((column) => {
    const filter = normalizeText(filters[column.key] || '');
    if (!filter) return true;
    return normalizeText(cellValue(row, column)).includes(filter);
  });
}

function sortActivityRows(rows: Row[], field: string, direction: 'asc' | 'desc') {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    const result = compareLoose(activitySortValue(left, field), activitySortValue(right, field));
    if (result !== 0) return result * multiplier;
    return compareLoose(left.createdAt, right.createdAt) * -1;
  });
}

function activitySortValue(row: Row, field: string) {
  if (field === 'createdAt') return row.createdAt || '';
  if (field === 'action') return row.action || '';
  if (field === 'actor') return row.actor || '';
  if (field === 'entityType') return row.entityType || '';
  if (field === 'entityLabel') return row.entityLabel || '';
  return row[field] || '';
}

function activityMetrics(filtered: Row[], all: Row[]) {
  const today = dateInputValue(new Date());
  return {
    today: all.filter((activity) => String(activity.createdAt || '').slice(0, 10) === today).length,
    actors: new Set(filtered.map((activity) => String(activity.actor || '').trim()).filter(Boolean)).size,
    flow: filtered.filter((activity) => activityActionClass(activity.action) === 'flow').length
  };
}

function activityActionClass(action: unknown) {
  const text = normalizeText(action);
  if (text.includes('exclu') || text.includes('restaur')) return 'danger';
  if (text.includes('backup') || text.includes('login') || text.includes('logout')) return 'system';
  if (text.includes('status') || text.includes('fatur')) return 'flow';
  if (text.includes('criad') || text.includes('cadastr') || text.includes('novo')) return 'success';
  return 'default';
}

function activityActionGroupLabel(group: string) {
  if (group === 'danger') return 'Exclusao/restauracao';
  if (group === 'system') return 'Sistema';
  if (group === 'flow') return 'Fluxo/status/faturamento';
  if (group === 'success') return 'Criacao/cadastro';
  return 'Outros';
}

function exportActivityCsv(rows: Row[]) {
  const columns = activityColumns();
  const csvRows = [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => cellValue(row, column)))
  ];
  const csv = csvRows.map((row) => row.map((value) => escapeCsvCell(String(value || ''))).join(';')).join('\r\n');
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
  downloadDataUrl(dataUrl, `relatorio-atividades-${dateInputValue(new Date())}.csv`);
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function ModuleFrame({ error, children }: { title: string; subtitle: string; error?: string; children: ReactNode }) {
  return (
    <section className="module-screen">
      {error && <p className="error">{error}</p>}
      {children}
    </section>
  );
}

function emptySequencingUiState(): SequencingUiState {
  return {
    activityKey: '',
    startDateTime: datetimeLocalValue(roundToNextHour(new Date()))
  };
}

function loadSequencingUiState(userId: string): SequencingUiState {
  try {
    const raw = window.localStorage.getItem(sequencingUiStorageKey(userId));
    if (!raw) return emptySequencingUiState();
    return normalizeSequencingUiState(JSON.parse(raw));
  } catch {
    return emptySequencingUiState();
  }
}

function persistSequencingUiState(userId: string, state: SequencingUiState) {
  const cleanState = normalizeSequencingUiState(state);
  writeLocalPreference(sequencingUiStorageKey(userId), cleanState);
  persistPreferenceState('sequencingUiState', cleanState);
}

function sequencingUiStorageKey(userId: string) {
  return `mge-sop-react-sequencing-ui:${userId || 'default'}`;
}

function normalizeSequencingUiState(value: unknown): SequencingUiState {
  const row = asRow(value);
  const defaults = emptySequencingUiState();
  return {
    activityKey: String(row.activityKey || ''),
    startDateTime: isDateTimeLocalText(row.startDateTime) ? String(row.startDateTime) : defaults.startDateTime
  };
}

function isDateTimeLocalText(value: unknown) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(value || ''));
}

function buildSequencingDrafts(activities: Row[]) {
  const next: Record<string, Record<string, SequencingDraft>> = {};
  for (const activity of activities) {
    const activityKey = sequencingActivityKey(activity);
    const items = Array.isArray(activity.items) ? activity.items as Row[] : [];
    next[activityKey] = {};
    for (const row of items) {
      next[activityKey][sequencingOrderKey(row)] = sequencingDraftFromRow(row);
    }
  }
  return next;
}

function sequencingActivityKey(activity: Row) {
  return String(activity.key || '');
}

function sequencingOrderKey(row: Row) {
  return String(row.orderId || row.id || row.orderNumber || '');
}

function sequencingDraftFromRow(row: Row): SequencingDraft {
  return {
    sequenceNumber: row.sequenceNumber === null || row.sequenceNumber === undefined ? '' : String(row.sequenceNumber),
    estimatedHours: row.estimatedHours === null || row.estimatedHours === undefined ? '' : String(row.estimatedHours)
  };
}

function orderSequencingRows(rows: Row[], drafts: Record<string, SequencingDraft>) {
  return rows
    .map((row, index) => {
      const draft = drafts[sequencingOrderKey(row)] || sequencingDraftFromRow(row);
      return {
        row,
        index,
        sequenceNumber: normalizeSequencingSequence(draft.sequenceNumber, index + 1),
        priorityDate: String(row.priorityDate || row.productionDeliveryDate || row.originalDeliveryDate || '')
      };
    })
    .sort((left, right) => (
      left.sequenceNumber - right.sequenceNumber
      || compareLoose(left.priorityDate, right.priorityDate)
      || left.index - right.index
    ))
    .map((item) => item.row);
}

function buildSequencingSchedule(rows: Row[], drafts: Record<string, SequencingDraft>, startDateTime: string): SequencingScheduleItem[] {
  const start = parseSequencingDateTime(startDateTime);
  let cursor = new Date(start);
  const rawItems = rows.map((row, index) => {
    const draft = drafts[sequencingOrderKey(row)] || sequencingDraftFromRow(row);
    const durationHours = normalizeSequencingHours(draft.estimatedHours);
    const startAt = new Date(cursor);
    const endAt = addHours(cursor, durationHours);
    cursor = new Date(endAt);
    return {
      row,
      sequenceNumber: normalizeSequencingSequence(draft.sequenceNumber, index + 1),
      startAt,
      endAt,
      durationHours,
      offsetPercent: 0,
      widthPercent: 0
    };
  });
  const totalMs = Math.max(1, (rawItems[rawItems.length - 1]?.endAt.getTime() || start.getTime()) - start.getTime());
  return rawItems.map((item) => ({
    ...item,
    offsetPercent: Math.max(0, ((item.startAt.getTime() - start.getTime()) / totalMs) * 100),
    widthPercent: Math.min(100, Math.max(2, ((Math.max(0.25, item.durationHours) * 60 * 60 * 1000) / totalMs) * 100))
  }));
}

function normalizeSequencingSequence(value: unknown, fallback: number) {
  const number = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback;
}

function normalizeSequencingHours(value: unknown) {
  const number = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function parseSequencingDateTime(value: string) {
  const date = value ? new Date(value) : roundToNextHour(new Date());
  if (!Number.isNaN(date.getTime())) return date;
  return roundToNextHour(new Date());
}

function roundToNextHour(date: Date) {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  if (date.getMinutes() || date.getSeconds() || date.getMilliseconds()) {
    next.setHours(next.getHours() + 1);
  }
  return next;
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function datetimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function formatLocalDateTime(date: Date) {
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function exportSequencingCsv(activity: Row, rows: Row[], schedule: SequencingScheduleItem[]) {
  const scheduleByOrder = new Map(schedule.map((item) => [sequencingOrderKey(item.row), item]));
  const lines = [
    ['Sequencia', 'Atividade', 'Pedido', 'Cliente', 'SKU', 'OP', 'Status', 'Tempo estimado h', 'Inicio', 'Fim', 'Pendencias PCP']
  ];
  for (const row of rows) {
    const item = scheduleByOrder.get(sequencingOrderKey(row));
    lines.push([
      String(item?.sequenceNumber || row.sequenceNumber || ''),
      String(activity.label || activity.key || ''),
      String(row.orderNumber || ''),
      String(row.customer || ''),
      String(row.sku || ''),
      String(row.productionOrder || ''),
      String(row.status || ''),
      String(item?.durationHours || row.estimatedHours || ''),
      item ? formatLocalDateTime(item.startAt) : '',
      item ? formatLocalDateTime(item.endAt) : '',
      String(row.pcpPendingSummary || row.pcpPendingCount || '')
    ]);
  }
  const csv = lines.map((line) => line.map(escapeCsvCell).join(';')).join('\r\n');
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
  const fileKey = normalizeText(activity.label || activity.key || 'sequenciamento').replace(/\s+/g, '-');
  downloadDataUrl(dataUrl, `sequenciamento-${fileKey || 'atividade'}.csv`);
}

function escapeCsvCell(value: string) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function emptyApsUiState(): ApsUiState {
  return {
    startDate: dateInputValue(new Date()),
    priorityRule: 'EDD',
    scenarioExtraHours: '0',
    scenarioOperatorBoost: '0',
    configTab: 'operations'
  };
}

function loadApsUiState(userId: string): ApsUiState {
  try {
    const raw = window.localStorage.getItem(apsUiStorageKey(userId));
    if (!raw) return emptyApsUiState();
    const parsed = JSON.parse(raw);
    return normalizeApsUiState(parsed);
  } catch {
    return emptyApsUiState();
  }
}

function persistApsUiState(userId: string, state: ApsUiState) {
  const cleanState = normalizeApsUiState(state);
  writeLocalPreference(apsUiStorageKey(userId), cleanState);
  persistPreferenceState('apsUiState', cleanState);
}

function apsUiStorageKey(userId: string) {
  return `mge-sop-react-aps-ui:${userId || 'default'}`;
}

function normalizeApsUiState(value: unknown): ApsUiState {
  const row = asRow(value);
  const defaults = emptyApsUiState();
  return {
    startDate: isDateText(row.startDate) ? String(row.startDate) : defaults.startDate,
    priorityRule: row.priorityRule === 'MANUAL' ? 'MANUAL' : 'EDD',
    scenarioExtraHours: String(row.scenarioExtraHours ?? defaults.scenarioExtraHours),
    scenarioOperatorBoost: String(row.scenarioOperatorBoost ?? defaults.scenarioOperatorBoost),
    configTab: ['operations', 'centers', 'operators'].includes(String(row.configTab)) ? row.configTab as ApsUiState['configTab'] : defaults.configTab
  };
}

function defaultApsConfig(): ApsConfig {
  return {
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
        enabledOperations: [],
        enabledCenters: [],
        hourlyCost: 0
      }
    ],
    workCenters: [
      {
        code: 'MONT',
        description: 'Montagem',
        machineCount: 1,
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
        statusName: '',
        sortOrder: 1,
        category: 'production',
        flowType: 'normal',
        setupHours: 0.25,
        processHours: 2,
        lotSize: 1,
        minOperators: 1,
        maxOperators: 1,
        allowedCenters: ['MONT']
      }
    ],
    timeRecords: []
  };
}

function normalizeApsConfig(value: unknown): ApsConfig {
  const row = asRow(value);
  const defaults = defaultApsConfig();
  const settings = asRow(row.settings);
  const operations = arrayRows(row.operations).map(normalizeApsOperation).filter((operation) => operation.code);
  const workCenters = arrayRows(row.workCenters).map(normalizeApsWorkCenter).filter((center) => center.code);
  const operators = arrayRows(row.operators).map(normalizeApsOperator).filter((operator) => operator.code);
  const validOperationCodes = new Set((operations.length ? operations : defaults.operations).map((operation) => operation.code));
  const validCenterCodes = new Set((workCenters.length ? workCenters : defaults.workCenters).map((center) => center.code));

  return {
    settings: {
      workdayStart: isTimeText(settings.workdayStart) ? String(settings.workdayStart) : defaults.settings.workdayStart,
      dailyHours: clampNumber(settings.dailyHours, 1, 24, defaults.settings.dailyHours),
      lunchStart: isTimeText(settings.lunchStart) ? String(settings.lunchStart) : defaults.settings.lunchStart,
      lunchMinutes: clampNumber(settings.lunchMinutes, 0, 240, defaults.settings.lunchMinutes),
      priorityRule: settings.priorityRule === 'MANUAL' ? 'MANUAL' : 'EDD',
      calendarDays: arrayRows(settings.calendarDays).map((day) => normalizeApsCalendarDay(day, defaults.settings)).filter((day) => day.date),
      timeLearningEnabled: settings.timeLearningEnabled === false ? false : true
    },
    operators: (operators.length ? operators : defaults.operators).map((operator) => ({
      ...operator,
      enabledOperations: operator.enabledOperations.filter((code) => validOperationCodes.has(code)),
      enabledCenters: operator.enabledCenters.filter((code) => validCenterCodes.has(code))
    })),
    workCenters: workCenters.length ? workCenters : defaults.workCenters,
    operations: operations.length ? operations : defaults.operations,
    timeRecords: arrayRows(row.timeRecords).map(normalizeApsTimeRecord).filter((record) => record.id && record.operationCode && record.productLine && record.capacity)
  };
}

function normalizeApsOperation(value: unknown): ApsOperation {
  const row = asRow(value);
  const code = String(row.code || '').trim();
  return {
    code,
    description: String(row.description || row.statusName || code),
    statusName: String(row.statusName || ''),
    sortOrder: toInteger(row.sortOrder, 999),
    category: String(row.category || 'auxiliary'),
    flowType: String(row.flowType || 'normal'),
    setupHours: clampNumber(row.setupHours, 0, 10000, 0),
    processHours: clampNumber(row.processHours, 0, 10000, 1),
    lotSize: toInteger(row.lotSize, 1),
    minOperators: toInteger(row.minOperators, 1),
    maxOperators: Math.max(toInteger(row.minOperators, 1), toInteger(row.maxOperators, 1)),
    allowedCenters: stringList(row.allowedCenters).map((center) => center.toUpperCase())
  };
}

function normalizeApsTimeRecord(value: unknown): ApsTimeRecord {
  const row = asRow(value);
  const referenceType: ApsTimeReferenceType = row.referenceType === 'productionOrder' ? 'productionOrder' : 'salesOrder';
  const orderNumber = String(row.orderNumber || '').trim();
  const productionOrder = String(row.productionOrder || '').trim();
  const reference = String(row.reference || (referenceType === 'productionOrder' ? productionOrder : orderNumber)).trim();
  const quantity = Math.max(1, toInteger(row.quantity, 1));
  return {
    id: String(row.id || `tempo-${Date.now()}`).trim(),
    referenceType,
    reference,
    orderNumber,
    productionOrder,
    operationCode: String(row.operationCode || '').trim(),
    productLine: String(row.productLine || '').trim(),
    capacity: String(row.capacity || row.capacityTr || '').trim(),
    quantity,
    setupHours: clampNumber(row.setupHours, 0, 10000, 0),
    processHours: clampNumber(row.processHours, 0, 10000, 1),
    note: String(row.note || '').trim(),
    recordedAt: String(row.recordedAt || new Date().toISOString())
  };
}

function normalizeApsWorkCenter(value: unknown): ApsWorkCenter {
  const row = asRow(value);
  const code = String(row.code || '').trim().toUpperCase();
  return {
    code,
    description: String(row.description || code),
    machineCount: toInteger(row.machineCount, 1),
    calendar: String(row.calendar || row.shift || '1 turno'),
    efficiency: clampNumber(row.efficiency, 0.1, 3, 1),
    capacity: clampNumber(row.capacity, 0, 100000, 8),
    shift: String(row.shift || row.calendar || '1 turno'),
    maintenance: String(row.maintenance || '')
  };
}

function normalizeApsCalendarDay(value: unknown, settings: ApsSettings): ApsCalendarDay {
  const row = asRow(value);
  const date = isDateText(row.date) ? String(row.date) : '';
  return {
    date,
    productive: row.productive === false ? false : true,
    startTime: isTimeText(row.startTime) ? String(row.startTime) : settings.workdayStart,
    dailyHours: clampNumber(row.dailyHours, 0, 24, settings.dailyHours),
    lunchStart: isTimeText(row.lunchStart) ? String(row.lunchStart) : settings.lunchStart,
    lunchMinutes: clampNumber(row.lunchMinutes, 0, 240, settings.lunchMinutes),
    note: String(row.note || '')
  };
}

function upsertApsCalendarDay(days: ApsCalendarDay[], day: ApsCalendarDay, settings: ApsSettings) {
  const next = [
    ...arrayRows(days).map((row) => normalizeApsCalendarDay(row, settings)).filter((item) => item.date && item.date !== day.date),
    day
  ];
  return next.sort((left, right) => left.date.localeCompare(right.date));
}

function buildApsCalendarMonths() {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);
  const months: Array<{ key: string; label: string; blanks: number; days: Date[] }> = [];

  for (let offset = 0; offset < 12; offset += 1) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const nextMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const firstVisible = monthStart < startDate ? startDate : monthStart;
    const days: Date[] = [];
    for (let cursor = new Date(firstVisible); cursor < nextMonth && cursor < endDate; cursor = addDays(cursor, 1)) {
      days.push(new Date(cursor));
    }
    months.push({
      key: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
      label: monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      blanks: days[0]?.getDay() || 0,
      days
    });
  }

  return months;
}

function weekdayShortLabel(date: Date) {
  return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][date.getDay()] || '';
}

function normalizeApsOperator(value: unknown): ApsOperator {
  const row = asRow(value);
  const code = String(row.code || '').trim().toUpperCase();
  return {
    code,
    name: String(row.name || code),
    shift: String(row.shift || '1 turno'),
    journeyHours: clampNumber(row.journeyHours, 1, 24, 8),
    efficiency: clampNumber(row.efficiency, 0.1, 3, 1),
    skill: String(row.skill || ''),
    enabledOperations: stringList(row.enabledOperations),
    enabledCenters: stringList(row.enabledCenters).map((center) => center.toUpperCase()),
    hourlyCost: clampNumber(row.hourlyCost, 0, 100000, 0)
  };
}

function cloneApsConfig(config: ApsConfig): ApsConfig {
  return normalizeApsConfig(JSON.parse(JSON.stringify(config)));
}

function nextApsWorkCenter(centers: ApsWorkCenter[]): ApsWorkCenter {
  let number = centers.length + 1;
  let code = `CT-${String(number).padStart(2, '0')}`;
  const existing = new Set(centers.map((center) => center.code));
  while (existing.has(code)) {
    number += 1;
    code = `CT-${String(number).padStart(2, '0')}`;
  }
  return normalizeApsWorkCenter({ code, description: 'Novo centro', machineCount: 1, efficiency: 1, capacity: 8, shift: '1 turno' });
}

function nextApsOperation(operations: ApsOperation[], centers: ApsWorkCenter[]): ApsOperation {
  let number = operations.filter(isManualApsOperation).length + 1;
  let code = `custom:op-${String(number).padStart(2, '0')}`;
  const existing = new Set(operations.map((operation) => operation.code));
  while (existing.has(code)) {
    number += 1;
    code = `custom:op-${String(number).padStart(2, '0')}`;
  }
  const maxSortOrder = operations.reduce((max, operation) => Math.max(max, Number(operation.sortOrder) || 0), 0);
  return normalizeApsOperation({
    code,
    description: 'Nova operacao',
    statusName: '',
    sortOrder: maxSortOrder + 10,
    category: 'production',
    flowType: 'normal',
    setupHours: 0,
    processHours: 1,
    lotSize: 1,
    minOperators: 1,
    maxOperators: 1,
    allowedCenters: centers.map((center) => center.code)
  });
}

function isManualApsOperation(operation: ApsOperation) {
  return !String(operation.statusName || '').trim() || String(operation.code || '').startsWith('custom:');
}

function nextApsOperator(operators: ApsOperator[], operations: ApsOperation[], centers: ApsWorkCenter[]): ApsOperator {
  let number = operators.length + 1;
  let code = `OP-${String(number).padStart(2, '0')}`;
  const existing = new Set(operators.map((operator) => operator.code));
  while (existing.has(code)) {
    number += 1;
    code = `OP-${String(number).padStart(2, '0')}`;
  }
  return normalizeApsOperator({
    code,
    name: 'Novo operador',
    shift: '1 turno',
    journeyHours: 8,
    efficiency: 1,
    skill: '',
    enabledOperations: operations.map((operation) => operation.code),
    enabledCenters: centers.map((center) => center.code),
    hourlyCost: 0
  });
}

function nextApsTimeRecord(records: ApsTimeRecord[], operations: ApsOperation[]): ApsTimeRecord {
  return normalizeApsTimeRecord({
    id: `tempo-${Date.now()}-${records.length + 1}`,
    referenceType: 'salesOrder',
    reference: '',
    orderNumber: '',
    productionOrder: '',
    operationCode: operations[0]?.code || '',
    productLine: '',
    capacity: '',
    quantity: 1,
    setupHours: 0,
    processHours: 1,
    note: '',
    recordedAt: new Date().toISOString()
  });
}

function applyApsOrderToTimeRecord(record: ApsTimeRecord, order: Row, referenceType: ApsTimeReferenceType): ApsTimeRecord {
  const orderNumber = String(order.orderNumber || '').trim();
  const productionOrder = String(order.productionOrder || '').trim();
  return normalizeApsTimeRecord({
    ...record,
    referenceType,
    reference: referenceType === 'productionOrder' ? productionOrder : orderNumber,
    orderNumber,
    productionOrder,
    productLine: String(order.productLine || record.productLine || '').trim(),
    capacity: String(order.capacityTr || record.capacity || '').trim(),
    quantity: Math.max(1, toInteger(order.quantity, record.quantity || 1))
  });
}

function findApsOrderForTimeRecord(record: ApsTimeRecord, orders: Row[]) {
  const orderNumber = normalizeText(record.orderNumber || (record.referenceType === 'salesOrder' ? record.reference : ''));
  const productionOrder = normalizeText(record.productionOrder || (record.referenceType === 'productionOrder' ? record.reference : ''));
  return orders.find((order) => {
    const currentOrderNumber = normalizeText(order.orderNumber);
    const currentProductionOrder = normalizeText(order.productionOrder);
    return Boolean((orderNumber && currentOrderNumber === orderNumber) || (productionOrder && currentProductionOrder === productionOrder));
  }) || null;
}

function findApsOrderByOptionKey(orders: Row[], key: string) {
  return orders.find((order) => apsOrderOptionKey(order) === key) || null;
}

function apsOrderOptionKey(order: Row | null) {
  if (!order) return '';
  return String(order.id || order.orderId || order.orderNumber || order.productionOrder || '');
}

function apsOrderOptionLabel(order: Row) {
  return [
    `PV ${String(order.orderNumber || '-')}`,
    String(order.productionOrder || '').trim() ? `OP ${String(order.productionOrder)}` : 'Sem OP',
    String(order.customer || '-'),
    [String(order.productLine || '').trim(), apsCapacityDisplay(order.capacityTr)].filter(Boolean).join(' ')
  ].filter(Boolean).join(' | ');
}

function apsTimeReferenceTypeLabel(value: ApsTimeReferenceType) {
  return value === 'productionOrder' ? 'Ordem de producao' : 'Pedido de venda';
}

function apsOperationLabel(operationCode: string, operations: ApsOperation[]) {
  return operations.find((operation) => operation.code === operationCode)?.description || operationCode || '-';
}

function buildApsTimeModel(records: ApsTimeRecord[]) {
  const model = new Map<string, ApsTimeModelBucket>();
  for (const record of records) {
    if (!record.operationCode || !record.productLine || !record.capacity || record.processHours <= 0) continue;
    const key = apsTimeModelKey(record.productLine, record.capacity, record.operationCode);
    const quantity = Math.max(1, Number(record.quantity) || 1);
    const processPerUnit = record.processHours / quantity;
    const bucket = model.get(key) || emptyApsTimeModelBucket(key, record);
    bucket.samples += 1;
    bucket.setupTotal += Math.max(0, Number(record.setupHours) || 0);
    bucket.processPerUnitTotal += processPerUnit;
    bucket.quantityTotal += quantity;
    bucket.setupHours = bucket.setupTotal / bucket.samples;
    bucket.processHoursPerUnit = bucket.processPerUnitTotal / bucket.samples;
    bucket.averageQuantity = bucket.quantityTotal / bucket.samples;
    model.set(key, bucket);
  }
  return model;
}

function emptyApsTimeModelBucket(key: string, record: ApsTimeRecord): ApsTimeModelBucket {
  return {
    key,
    productLine: record.productLine,
    capacity: record.capacity,
    operationCode: record.operationCode,
    samples: 0,
    setupHours: 0,
    processHoursPerUnit: 0,
    averageQuantity: 0,
    setupTotal: 0,
    processPerUnitTotal: 0,
    quantityTotal: 0
  };
}

function buildApsLearnedTimeRows(records: ApsTimeRecord[], operations: ApsOperation[]): ApsLearnedTimeRow[] {
  return Array.from(buildApsTimeModel(records).values())
    .map((bucket) => ({
      key: bucket.key,
      productLine: bucket.productLine || '-',
      capacity: bucket.capacity || '-',
      operationCode: bucket.operationCode,
      operationLabel: apsOperationLabel(bucket.operationCode, operations),
      samples: bucket.samples,
      setupHours: bucket.setupHours,
      processHoursPerUnit: bucket.processHoursPerUnit,
      averageQuantity: bucket.averageQuantity,
      confidence: apsTimeConfidence(bucket.samples)
    }))
    .sort((left, right) => compareLoose(left.productLine, right.productLine) || compareLoose(left.capacity, right.capacity) || compareLoose(left.operationLabel, right.operationLabel));
}

function resolveApsTaskTimeEstimate(
  order: Row,
  operation: ApsOperation,
  quantity: number,
  records: ApsTimeRecord[],
  model: Map<string, ApsTimeModelBucket>
) {
  const exact = findExactApsTimeRecord(order, operation.code, records);
  if (exact && exact.processHours > 0) {
    return {
      setupHours: Math.max(0, Number(exact.setupHours) || 0),
      processHours: Math.max(0.1, Number(exact.processHours) || 0.1),
      source: exact.referenceType === 'productionOrder' ? 'Tempo OP' : 'Tempo pedido',
      samples: 1
    };
  }

  const key = apsTimeModelKey(order.productLine, order.capacityTr, operation.code);
  const learned = model.get(key);
  if (learned && learned.samples > 0 && learned.processHoursPerUnit > 0) {
    return {
      setupHours: Math.max(0, learned.setupHours),
      processHours: Math.max(0.1, learned.processHoursPerUnit * Math.max(1, quantity)),
      source: `Media linha/cap. (${learned.samples})`,
      samples: learned.samples
    };
  }

  const lotSize = Math.max(1, Number(operation.lotSize) || 1);
  return {
    setupHours: Math.max(0, Number(operation.setupHours) || 0),
    processHours: Math.max(0.1, (Number(operation.processHours) || 1) * Math.ceil(Math.max(1, quantity) / lotSize)),
    source: 'Padrao operacao',
    samples: 0
  };
}

function findExactApsTimeRecord(order: Row, operationCode: string, records: ApsTimeRecord[]) {
  const orderNumber = normalizeText(order.orderNumber);
  const productionOrder = normalizeText(order.productionOrder);
  return records.find((record) => {
    if (record.operationCode !== operationCode) return false;
    const reference = normalizeText(record.reference);
    const recordOrder = normalizeText(record.orderNumber);
    const recordProductionOrder = normalizeText(record.productionOrder);
    if (record.referenceType === 'productionOrder') {
      return Boolean(productionOrder && (reference === productionOrder || recordProductionOrder === productionOrder));
    }
    return Boolean(orderNumber && (reference === orderNumber || recordOrder === orderNumber));
  }) || null;
}

function apsTimeModelKey(productLine: unknown, capacity: unknown, operationCode: unknown) {
  return `${normalizeText(productLine)}|${normalizeApsCapacityKey(capacity)}|${String(operationCode || '')}`;
}

function normalizeApsCapacityKey(value: unknown) {
  const text = String(value || '').trim().replace(',', '.');
  const number = Number(text);
  if (Number.isFinite(number)) return String(Math.round(number * 100) / 100);
  return normalizeText(text);
}

function apsCapacityDisplay(value: unknown) {
  const text = String(value || '').trim();
  if (!text) return '-';
  const number = Number(text.replace(',', '.'));
  if (Number.isFinite(number)) return `${formatNumber(number)} TR`;
  return text;
}

function apsTimeConfidence(samples: number) {
  if (samples >= 8) return 'Alta';
  if (samples >= 3) return 'Media';
  return 'Baixa';
}

function apsScenarioConfigReact(config: ApsConfig, ui: ApsUiState): ApsConfig {
  const scenario = cloneApsConfig(config);
  const extraHours = clampNumber(ui.scenarioExtraHours, 0, 8, 0);
  const operatorBoost = clampNumber(ui.scenarioOperatorBoost, 0, 50, 0);
  scenario.settings.dailyHours = clampNumber(scenario.settings.dailyHours + extraHours, 1, 24, scenario.settings.dailyHours);
  scenario.operators = scenario.operators.map((operator) => ({
    ...operator,
    efficiency: clampNumber(operator.efficiency * (1 + operatorBoost / 100), 0.1, 5, operator.efficiency)
  }));
  return scenario;
}

function buildApsScheduleReact(data: Row, configValue: ApsConfig, startDate: string, scenarioName: string): ApsSchedule {
  const config = normalizeApsConfig(configValue);
  const settings = normalizeApsSettings(config.settings);
  const rangeStart = apsDateAtWorkStart(startDate, settings);
  const tasks = collectApsTasksReact(data, config, settings.priorityRule);
  const centerResources = buildApsCenterResources(config.workCenters, rangeStart);
  const operatorResources = buildApsOperatorResources(config.operators, rangeStart);
  const operationByCode = new Map(config.operations.map((operation) => [operation.code, operation]));
  const centerByCode = new Map(config.workCenters.map((center) => [center.code, center]));
  const rows: ApsScheduleRow[] = [];
  const rawSegments: Omit<ApsSegment, 'offsetPercent' | 'widthPercent'>[] = [];
  const orderCursor = new Map<string, Date>();

  for (const task of tasks) {
    const operation = operationByCode.get(task.activityKey) || defaultApsOperation(task.activityKey, task.activityLabel);
    const allocation = chooseApsAllocationReact({
      task,
      operation,
      settings,
      startDate: rangeStart,
      centerResources,
      operatorResources,
      centerByCode,
      readyAt: orderCursor.get(task.orderId) || rangeStart
    });
    const setupEnd = addApsWorkingHours(allocation.startAt, allocation.setupHours, settings);
    const endAt = addApsWorkingHours(setupEnd, allocation.processHours, settings);
    const dueAt = apsDueDate(task.dueDate, settings);
    const delayDays = dueAt && endAt > dueAt ? Math.ceil((endAt.getTime() - dueAt.getTime()) / 86400000) : 0;
    const queueHours = Math.max(0, (allocation.startAt.getTime() - allocation.readyAt.getTime()) / 3600000);

    allocation.machine.availableAt = endAt;
    allocation.operator.availableAt = endAt;
    allocation.machine.loadHours += allocation.setupHours + allocation.processHours;
    allocation.operator.loadHours += allocation.setupHours + allocation.processHours;
    orderCursor.set(task.orderId, endAt);

    const row: ApsScheduleRow = {
      ...task,
      operationCode: operation.code,
      operationLabel: operation.description || task.activityLabel,
      centerCode: allocation.center.code,
      centerLabel: allocation.center.description || allocation.center.code,
      machineCode: allocation.machine.code,
      operatorCode: allocation.operator.code,
      operatorName: allocation.operator.name,
      startAt: allocation.startAt,
      setupEnd,
      endAt,
      setupHours: allocation.setupHours,
      processHours: allocation.processHours,
      queueHours,
      dueAt,
      delayDays,
      statusText: delayDays > 0 ? 'Atraso previsto' : 'No prazo'
    };

    if (allocation.setupHours > 0) {
      rawSegments.push({
        row,
        type: 'setup',
        label: 'Setup',
        resourceCode: allocation.machine.code,
        startAt: allocation.startAt,
        endAt: setupEnd
      });
    }
    rawSegments.push({
      row,
      type: delayDays > 0 ? 'late' : 'production',
      label: row.operationLabel,
      resourceCode: allocation.machine.code,
      startAt: setupEnd,
      endAt
    });
    rows.push(row);
  }

  const rangeEndRaw = rows.length ? new Date(Math.max(...rows.map((row) => row.endAt.getTime()))) : addApsWorkingHours(rangeStart, settings.dailyHours, settings);
  const rangeEnd = rangeEndRaw <= rangeStart ? addApsWorkingHours(rangeStart, settings.dailyHours, settings) : rangeEndRaw;
  const segments = positionApsSegments(rawSegments, rangeStart, rangeEnd);
  const resources: ApsResource[] = [...Array.from(centerResources.values()).flat(), ...operatorResources];
  const metrics = apsScheduleMetricsReact(rows, resources, rangeStart, rangeEnd, settings);

  return {
    scenarioName,
    settings,
    rows,
    segments,
    resources,
    rangeStart,
    rangeEnd,
    metrics
  };
}

function collectApsTasksReact(data: Row, config: ApsConfig, priorityRule: 'EDD' | 'MANUAL'): ApsTask[] {
  const orders = arrayRows(data.orders);
  const timeLearningEnabled = config.settings.timeLearningEnabled !== false;
  const timeRecords = timeLearningEnabled ? config.timeRecords : [];
  const timeModel = timeLearningEnabled ? buildApsTimeModel(timeRecords) : new Map<string, ApsTimeModelBucket>();
  const operations = config.operations
    .filter((operation) => operation.flowType !== 'deviation')
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder || compareLoose(left.description, right.description));
  const operationByStatus = new Map(operations.map((operation) => [normalizeText(operation.statusName || operation.description), operation]));
  const tasks: ApsTask[] = [];

  for (const order of orders) {
    const currentOperation = operationByStatus.get(normalizeText(order.status || ''));
    const currentSortOrder = currentOperation ? Number(currentOperation.sortOrder) || 0 : 0;
    const pendingOperations = operations.filter((operation) => currentOperation ? operation.sortOrder >= currentSortOrder : true);
    pendingOperations.forEach((operation, operationIndex) => {
      const dueDate = String(order.productionDeliveryDate || order.originalDeliveryDate || order.entryDate || '');
      const manualSequence = (operation.sortOrder || operationIndex + 1) * 100000 + tasks.length;
      const quantity = Math.max(1, Number(order.quantity) || 1);
      const timeEstimate = resolveApsTaskTimeEstimate(order, operation, quantity, timeRecords, timeModel);
      tasks.push({
        ...order,
        orderId: String(order.id || order.orderId || order.orderNumber || manualSequence),
        activityKey: operation.code,
        activityLabel: operation.description || operation.statusName || operation.code,
        operationCode: operation.code,
        routeRank: operation.sortOrder || operationIndex + 1,
        dueDate,
        manualSequence,
        estimatedSetupHours: timeEstimate.setupHours,
        estimatedHours: timeEstimate.processHours,
        timeSource: timeEstimate.source,
        timeSamples: timeEstimate.samples,
        pcpPendingCount: Number(order.pcpPendingCount) || 0,
        pcpPendingSummary: String(order.pcpPendingSummary || ''),
        priority: 0
      });
    });
  }

  tasks.sort((left, right) => {
    if (priorityRule === 'MANUAL') {
      return left.manualSequence - right.manualSequence || left.routeRank - right.routeRank || compareLoose(left.orderNumber, right.orderNumber);
    }
    return compareLoose(left.dueDate || '9999-12-31', right.dueDate || '9999-12-31')
      || left.routeRank - right.routeRank
      || left.manualSequence - right.manualSequence
      || compareLoose(left.orderNumber, right.orderNumber);
  });

  return tasks.map((task, index) => ({ ...task, priority: index + 1 }));
}

function chooseApsAllocationReact({
  task,
  operation,
  settings,
  startDate,
  centerResources,
  operatorResources,
  centerByCode,
  readyAt
}: {
  task: ApsTask;
  operation: ApsOperation;
  settings: ApsSettings;
  startDate: Date;
  centerResources: Map<string, ApsMachineResource[]>;
  operatorResources: ApsOperatorResource[];
  centerByCode: Map<string, ApsWorkCenter>;
  readyAt: Date;
}) {
  const allowedCenterCodes = operation.allowedCenters.length ? operation.allowedCenters : Array.from(centerResources.keys());
  const candidates: Array<{
    center: ApsWorkCenter;
    machine: ApsMachineResource;
    operator: ApsOperatorResource;
    readyAt: Date;
    startAt: Date;
    endAt: Date;
    setupHours: number;
    processHours: number;
  }> = [];

  for (const centerCode of allowedCenterCodes) {
    const cleanCenterCode = String(centerCode || '').toUpperCase();
    const machines = centerResources.get(cleanCenterCode) || [];
    const center = centerByCode.get(cleanCenterCode) || defaultApsCenter(cleanCenterCode);
    for (const machine of machines) {
      const qualifiedOperators = operatorResources.filter((operator) => apsOperatorCanRun(operator, operation.code, center.code));
      const usableOperators = qualifiedOperators.length ? qualifiedOperators : [defaultApsOperator(startDate)];
      for (const operator of usableOperators) {
        const setupHours = Math.max(0, Number(task.estimatedSetupHours) || Number(operation.setupHours) || 0);
        const processHours = apsProcessHoursReact(task, operation, center, operator);
        const earliest = new Date(Math.max(readyAt.getTime(), machine.availableAt.getTime(), operator.availableAt.getTime()));
        const startAt = normalizeApsWorkStart(earliest, settings);
        const setupEnd = addApsWorkingHours(startAt, setupHours, settings);
        const endAt = addApsWorkingHours(setupEnd, processHours, settings);
        candidates.push({ center, machine, operator, readyAt, startAt, endAt, setupHours, processHours });
      }
    }
  }

  if (!candidates.length) {
    const firstEntry = Array.from(centerResources.entries())[0];
    const fallbackCenterCode = firstEntry ? firstEntry[0] : 'SEM-CENTRO';
    const center = centerByCode.get(fallbackCenterCode) || defaultApsCenter(fallbackCenterCode);
    const machine = firstEntry?.[1]?.[0] || defaultApsMachine(center.code, startDate);
    const operator = operatorResources[0] || defaultApsOperator(startDate);
    const startAt = normalizeApsWorkStart(new Date(Math.max(readyAt.getTime(), machine.availableAt.getTime(), operator.availableAt.getTime())), settings);
    return {
      center,
      machine,
      operator,
      readyAt,
      startAt,
      setupHours: Math.max(0, Number(task.estimatedSetupHours) || Number(operation.setupHours) || 0),
      processHours: Math.max(0.25, Number(task.estimatedHours) || Number(operation.processHours) || 1)
    };
  }

  candidates.sort((left, right) => left.endAt.getTime() - right.endAt.getTime() || left.startAt.getTime() - right.startAt.getTime() || compareLoose(left.machine.code, right.machine.code));
  return candidates[0];
}

function apsProcessHoursReact(task: ApsTask, operation: ApsOperation, center: ApsWorkCenter, operator: ApsOperatorResource) {
  const quantity = Math.max(1, Number(task.quantity) || 1);
  const lotSize = Math.max(1, Number(operation.lotSize) || 1);
  const baseHours = Number(task.estimatedHours) > 0
    ? Number(task.estimatedHours)
    : (Number(operation.processHours) || 1) * Math.ceil(quantity / lotSize);
  const efficiency = Math.max(0.1, (Number(center.efficiency) || 1) * (Number(operator.efficiency) || 1));
  return Math.max(0.1, baseHours / efficiency);
}

function buildApsCenterResources(workCenters: ApsWorkCenter[], startDate: Date) {
  const resources = new Map<string, ApsMachineResource[]>();
  for (const center of workCenters) {
    const code = String(center.code || '').toUpperCase();
    if (!code) continue;
    const count = Math.max(1, Number(center.machineCount) || 1);
    resources.set(code, Array.from({ length: count }, (_item, index) => ({
      code: `${code}-${index + 1}`,
      name: `${center.description || code} ${index + 1}`,
      type: 'machine',
      centerCode: code,
      availableAt: new Date(startDate),
      loadHours: 0
    })));
  }

  if (!resources.size) {
    resources.set('SEM-CENTRO', [defaultApsMachine('SEM-CENTRO', startDate)]);
  }
  return resources;
}

function buildApsOperatorResources(operators: ApsOperator[], startDate: Date): ApsOperatorResource[] {
  const resources = operators
    .filter((operator) => operator.code)
    .map((operator) => ({
      ...operator,
      type: 'operator' as const,
      availableAt: new Date(startDate),
      loadHours: 0
    }));
  return resources.length ? resources : [defaultApsOperator(startDate)];
}

function apsOperatorCanRun(operator: ApsOperatorResource, operationCode: string, centerCode: string) {
  const operationOk = !operator.enabledOperations.length || operator.enabledOperations.includes(operationCode);
  const centerOk = !operator.enabledCenters.length || operator.enabledCenters.includes(String(centerCode || '').toUpperCase());
  return operationOk && centerOk;
}

function positionApsSegments(rawSegments: Omit<ApsSegment, 'offsetPercent' | 'widthPercent'>[], rangeStart: Date, rangeEnd: Date): ApsSegment[] {
  const totalMs = Math.max(1, rangeEnd.getTime() - rangeStart.getTime());
  return rawSegments.map((segment) => ({
    ...segment,
    offsetPercent: Math.max(0, ((segment.startAt.getTime() - rangeStart.getTime()) / totalMs) * 100),
    widthPercent: Math.min(100, Math.max(1.2, ((segment.endAt.getTime() - segment.startAt.getTime()) / totalMs) * 100))
  }));
}

function apsScheduleMetricsReact(rows: ApsScheduleRow[], resources: ApsResource[], rangeStart: Date, rangeEnd: Date, settings: ApsSettings): ApsMetrics {
  const horizonHours = Math.max(settings.dailyHours, (rangeEnd.getTime() - rangeStart.getTime()) / 3600000);
  const delays = apsDelayRowsReact(rows);
  const lateOrders = delays.filter((row) => row.delayDays > 0).length;
  const totalOrders = delays.length;
  const utilizations = resources
    .filter((resource) => resource.loadHours > 0)
    .map((resource) => ({
      code: resource.code,
      name: resource.name || resource.code,
      type: resource.type === 'operator' ? 'Operador' : 'Maquina',
      loadHours: resource.loadHours,
      utilization: Math.round((resource.loadHours / horizonHours) * 1000) / 10,
      status: resource.loadHours / horizonHours >= 0.85 ? 'Gargalo' : 'Normal'
    }))
    .sort((left, right) => right.utilization - left.utilization || compareLoose(left.code, right.code));
  const makespanHours = Math.max(0, (rangeEnd.getTime() - rangeStart.getTime()) / 3600000);

  return {
    makespanHours,
    makespanDays: settings.dailyHours ? Math.round((makespanHours / settings.dailyHours) * 10) / 10 : 0,
    totalOperations: rows.length,
    lateOperations: rows.filter((row) => row.delayDays > 0).length,
    totalOrders,
    lateOrders,
    otif: totalOrders ? Math.round(((totalOrders - lateOrders) / totalOrders) * 1000) / 10 : 100,
    delays,
    utilizations,
    bottleneck: utilizations[0] || null
  };
}

function apsDelayRowsReact(rows: ApsScheduleRow[]): ApsDelay[] {
  const byOrder = new Map<string, ApsDelay>();
  for (const row of rows) {
    const current = byOrder.get(row.orderId);
    if (!current || row.endAt > current.predictedAt) {
      byOrder.set(row.orderId, {
        orderId: row.orderId,
        orderNumber: String(row.orderNumber || ''),
        productionOrder: String(row.productionOrder || 'Sem OP'),
        customer: String(row.customer || ''),
        dueDate: row.dueDate,
        dueAt: row.dueAt,
        predictedAt: row.endAt,
        delayDays: row.dueAt && row.endAt > row.dueAt ? Math.ceil((row.endAt.getTime() - row.dueAt.getTime()) / 86400000) : 0,
        quantity: Number(row.quantity) || 0
      });
    }
  }
  return Array.from(byOrder.values()).sort((left, right) => right.delayDays - left.delayDays || compareLoose(left.dueDate, right.dueDate));
}

function apsGanttGroups(schedule: ApsSchedule) {
  const grouped = new Map<string, ApsSegment[]>();
  for (const segment of schedule.segments) {
    if (!grouped.has(segment.resourceCode)) grouped.set(segment.resourceCode, []);
    grouped.get(segment.resourceCode)?.push(segment);
  }
  return Array.from(grouped.entries()).map(([resourceCode, segments]) => ({ resourceCode, segments }));
}

function loadDhtmlxGantt() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('DHTMLX Gantt disponivel apenas no navegador.'));
  }
  if (window.gantt) return Promise.resolve(window.gantt);
  if (window.__dhtmlxGanttPromise) return window.__dhtmlxGanttPromise;

  ensureStylesheet('dhtmlx-gantt-community-css', DHTMLX_GANTT_CSS_URL);
  window.__dhtmlxGanttPromise = new Promise<DhtmlxGanttApi>((resolve, reject) => {
    const existing = document.getElementById('dhtmlx-gantt-community-js') as HTMLScriptElement | null;
    const finish = () => window.gantt ? resolve(window.gantt) : reject(new Error('DHTMLX Gantt nao inicializou.'));
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar o DHTMLX Gantt. Usando Gantt interno.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'dhtmlx-gantt-community-js';
    script.src = DHTMLX_GANTT_JS_URL;
    script.async = true;
    script.onload = finish;
    script.onerror = () => reject(new Error('Falha ao carregar o DHTMLX Gantt. Usando Gantt interno.'));
    document.head.appendChild(script);
  });
  return window.__dhtmlxGanttPromise;
}

function ensureStylesheet(id: string, href: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function configureDhtmlxApsGantt(gantt: DhtmlxGanttApi) {
  try {
    gantt.plugins?.({ tooltip: true, marker: true });
  } catch {
    // Plugins variam por versao; o Gantt principal continua funcional.
  }
  gantt.config.readonly = true;
  gantt.config.grid_width = 420;
  gantt.config.row_height = 30;
  gantt.config.bar_height = 18;
  gantt.config.duration_unit = 'hour';
  gantt.config.scale_height = 48;
  gantt.config.fit_tasks = true;
  gantt.config.open_tree_initially = true;
  gantt.config.columns = [
    { name: 'text', label: 'Operacao', tree: true, width: 230 },
    { name: 'resource', label: 'Recurso', align: 'center', width: 90 },
    { name: 'durationHours', label: 'h', align: 'center', width: 55 }
  ];
  gantt.config.scales = [
    { unit: 'day', step: 1, format: '%d/%m' },
    { unit: 'hour', step: 2, format: '%H:%i' }
  ];
  gantt.templates.task_class = (_start: Date, _end: Date, task: DhtmlxGanttTask) => task.typeClass || '';
  gantt.templates.tooltip_text = (_start: Date, _end: Date, task: DhtmlxGanttTask) => [
    `<b>${escapeHtml(task.text || '')}</b>`,
    task.resource ? `Recurso: ${escapeHtml(task.resource)}` : '',
    task.durationHours ? `Tempo: ${escapeHtml(formatNumber(task.durationHours))} h` : ''
  ].filter(Boolean).join('<br>');
}

function buildDhtmlxApsGanttData(schedule: ApsSchedule) {
  const data: DhtmlxGanttTask[] = [];
  const links: DhtmlxGanttLink[] = [];
  const taskByRow = new Map<ApsScheduleRow, string>();

  for (const group of apsGanttGroups(schedule)) {
    const parentId = `resource:${group.resourceCode}`;
    data.push({
      id: parentId,
      text: group.resourceCode,
      start_date: schedule.rangeStart,
      end_date: schedule.rangeEnd,
      open: true,
      readonly: true,
      type: 'project',
      resource: group.resourceCode
    });

    group.segments
      .slice()
      .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
      .forEach((segment, index) => {
        const row = segment.row;
        const id = `task:${group.resourceCode}:${row.orderId}:${row.operationCode}:${segment.type}:${index}`;
        if (segment.type !== 'setup') taskByRow.set(row, id);
        data.push({
          id,
          parent: parentId,
          text: segment.type === 'setup'
            ? `Setup | ${String(row.orderNumber || row.productionOrder || '-')}`
            : `${String(row.orderNumber || '-')}: ${row.operationLabel}`,
          start_date: segment.startAt,
          end_date: segment.endAt,
          progress: segment.type === 'setup' ? 0.1 : 0.35,
          resource: group.resourceCode,
          durationHours: Math.round(((segment.endAt.getTime() - segment.startAt.getTime()) / 3600000) * 10) / 10,
          typeClass: `dhx-aps-${segment.type}`,
          readonly: true
        });
      });
  }

  const rowsByOrder = new Map<string, ApsScheduleRow[]>();
  for (const row of schedule.rows) {
    const key = String(row.orderId || row.orderNumber || '');
    if (!rowsByOrder.has(key)) rowsByOrder.set(key, []);
    rowsByOrder.get(key)?.push(row);
  }
  rowsByOrder.forEach((rows, orderKey) => {
    rows
      .slice()
      .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
      .forEach((row, index, sortedRows) => {
        if (index === 0) return;
        const source = taskByRow.get(sortedRows[index - 1]);
        const target = taskByRow.get(row);
        if (source && target) links.push({ id: `link:${orderKey}:${index}`, source, target, type: '0' });
      });
  });

  return { data, links };
}

function apsSegmentTitle(segment: ApsSegment) {
  const row = segment.row;
  return [
    `${String(row.productionOrder || 'Sem OP')} - ${String(row.orderNumber || '')}`,
    `Operacao: ${row.operationLabel}`,
    `Maquina: ${row.machineCode}`,
    `Operador: ${row.operatorName || row.operatorCode}`,
    `Inicio: ${formatLocalDateTime(segment.startAt)}`,
    `Fim: ${formatLocalDateTime(segment.endAt)}`,
    `Setup: ${formatNumber(row.setupHours)} h`,
    `Processo: ${formatNumber(row.processHours)} h`,
    `Atraso: ${formatInteger(row.delayDays)} dias`
  ].join('\n');
}

function apsScenarioSummaryRow(schedule: ApsSchedule): Row {
  return {
    scenarioName: schedule.scenarioName,
    rangeEnd: formatLocalDateTime(schedule.rangeEnd),
    lateOrders: schedule.metrics.lateOrders,
    otif: schedule.metrics.otif,
    bottleneck: schedule.metrics.bottleneck ? `${schedule.metrics.bottleneck.code} (${formatNumber(schedule.metrics.bottleneck.utilization)}%)` : 'Sem gargalo',
    recommendation: apsScenarioRecommendation(schedule)
  };
}

function apsScenarioRecommendation(schedule: ApsSchedule) {
  if (!schedule.metrics.totalOperations) return 'Sem carga';
  if (schedule.metrics.lateOrders > 0) return 'Revisar capacidade e gargalo';
  if (schedule.metrics.bottleneck && schedule.metrics.bottleneck.utilization >= 85) return 'Monitorar gargalo';
  return 'Cenario viavel';
}

function apsRecommendations(currentSchedule: ApsSchedule, simulatedSchedule: ApsSchedule, bestSchedule: ApsSchedule) {
  const current = currentSchedule.metrics;
  const simulated = simulatedSchedule.metrics;
  const improvement = current.lateOrders - simulated.lateOrders;
  const bottleneck = current.bottleneck;
  const criticalDelay = current.delays.find((delay) => delay.delayDays > 0);
  return [
    `Sequencia calculada por ${currentSchedule.settings.priorityRule === 'MANUAL' ? 'prioridade manual' : 'EDD, menor data prometida primeiro'}, respeitando maquina e operador qualificado por operacao.`,
    bottleneck ? `Gargalo principal: ${bottleneck.code}, com utilizacao prevista de ${formatNumber(bottleneck.utilization)}%.` : 'Nao ha gargalo relevante com a carga atual.',
    criticalDelay ? `OP critica: ${criticalDelay.productionOrder}, prevista para ${formatLocalDateTime(criticalDelay.predictedAt)}, com ${formatInteger(criticalDelay.delayDays)} dias de atraso.` : 'Nenhuma OP ficou atrasada no sequenciamento atual.',
    improvement > 0 ? `O cenario simulado reduz ${formatInteger(improvement)} OPs em atraso; vale avaliar hora extra ou ganho de produtividade.` : 'O cenario simulado nao reduz atrasos de forma relevante com os parametros atuais.',
    bestSchedule === simulatedSchedule ? 'Melhor cenario sugerido: simulado.' : 'Melhor cenario sugerido: atual.'
  ];
}

function chooseBestApsScheduleReact(currentSchedule: ApsSchedule, simulatedSchedule: ApsSchedule) {
  const current = currentSchedule.metrics;
  const simulated = simulatedSchedule.metrics;
  if (simulated.lateOrders < current.lateOrders) return simulatedSchedule;
  if (simulated.lateOrders === current.lateOrders && simulated.makespanHours < current.makespanHours) return simulatedSchedule;
  return currentSchedule;
}

function exportApsScheduleCsv(schedule: ApsSchedule) {
  const rows = [
    ['OP', 'Pedido', 'Cliente', 'Produto', 'Operacao', 'Centro', 'Maquina', 'Operador', 'Inicio previsto', 'Fim previsto', 'Setup h', 'Processo h', 'Base tempo', 'Fila h', 'Data prometida', 'Atraso dias', 'Prioridade', 'Status'],
    ...schedule.rows.map((row) => [
      String(row.productionOrder || ''),
      String(row.orderNumber || ''),
      String(row.customer || ''),
      String(row.sku || row.productLine || ''),
      row.operationLabel,
      row.centerCode,
      row.machineCode,
      row.operatorName || row.operatorCode,
      formatLocalDateTime(row.startAt),
      formatLocalDateTime(row.endAt),
      formatNumber(row.setupHours),
      formatNumber(row.processHours),
      String(row.timeSource || ''),
      formatNumber(row.queueHours),
      formatDate(row.dueDate),
      formatInteger(row.delayDays),
      String(row.priority),
      row.statusText
    ])
  ];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n');
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
  downloadDataUrl(dataUrl, `aps-programacao-${dateInputValue(new Date())}.csv`);
}

function normalizeApsSettings(settings: ApsSettings): ApsSettings {
  const defaults = defaultApsConfig().settings;
  return {
    workdayStart: isTimeText(settings.workdayStart) ? settings.workdayStart : '08:00',
    dailyHours: clampNumber(settings.dailyHours, 1, 24, 8),
    lunchStart: isTimeText(settings.lunchStart) ? settings.lunchStart : '12:00',
    lunchMinutes: clampNumber(settings.lunchMinutes, 0, 240, 60),
    priorityRule: settings.priorityRule === 'MANUAL' ? 'MANUAL' : 'EDD',
    calendarDays: arrayRows(settings.calendarDays).map((day) => normalizeApsCalendarDay(day, defaults)).filter((day) => day.date),
    timeLearningEnabled: settings.timeLearningEnabled === false ? false : true
  };
}

function apsDateAtWorkStart(value: string, settings: ApsSettings) {
  const date = isDateText(value) ? parseLocalDate(value) : new Date();
  return normalizeApsWorkStart(date, settings);
}

function apsDueDate(value: string, settings: ApsSettings) {
  if (!isDateText(value)) return null;
  const date = parseLocalDate(value);
  const periods = apsWorkPeriods(date, settings);
  return periods.length ? periods[periods.length - 1].end : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function normalizeApsWorkStart(value: Date, settings: ApsSettings) {
  let date = new Date(value);
  if (Number.isNaN(date.getTime())) date = new Date();

  for (let guard = 0; guard < 730; guard += 1) {
    const periods = apsWorkPeriods(date, settings);
    for (const period of periods) {
      if (date < period.start) return new Date(period.start);
      if (date >= period.start && date < period.end) return date;
    }
    date = apsNextCalendarDay(date);
  }

  return date;
}

function addApsWorkingHours(start: Date, hours: number, settings: ApsSettings) {
  let cursor = normalizeApsWorkStart(start, settings);
  let remaining = Math.max(0, Number(hours) || 0);
  if (remaining <= 0) return cursor;

  while (remaining > 0) {
    const periods = apsWorkPeriods(cursor, settings);
    const period = periods.find((item) => cursor >= item.start && cursor < item.end);
    if (!period) {
      cursor = normalizeApsWorkStart(cursor, settings);
      continue;
    }
    const available = Math.max(0, (period.end.getTime() - cursor.getTime()) / 3600000);
    const used = Math.min(remaining, available);
    cursor = new Date(cursor.getTime() + used * 3600000);
    remaining -= used;
    if (remaining > 0 || cursor >= period.end) {
      const nextPeriod = periods.find((item) => item.start > cursor);
      cursor = nextPeriod ? new Date(nextPeriod.start) : apsNextWorkDayStart(cursor, settings);
    }
  }
  return cursor;
}

function apsWorkPeriods(value: Date, settings: ApsSettings) {
  const daySettings = apsEffectiveCalendarDay(value, settings);
  if (!daySettings.productive || daySettings.dailyHours <= 0) return [];

  const [startHour, startMinute] = daySettings.startTime.split(':').map(Number);
  const [lunchHour, lunchMinute] = daySettings.lunchStart.split(':').map(Number);
  const dayStart = new Date(value.getFullYear(), value.getMonth(), value.getDate(), startHour, startMinute, 0, 0);
  const lunchStart = new Date(value.getFullYear(), value.getMonth(), value.getDate(), lunchHour, lunchMinute, 0, 0);
  const lunchEnd = new Date(lunchStart.getTime() + daySettings.lunchMinutes * 60000);
  const totalMinutes = daySettings.dailyHours * 60;

  if (daySettings.lunchMinutes <= 0 || lunchStart <= dayStart) {
    return [{ start: dayStart, end: new Date(dayStart.getTime() + totalMinutes * 60000) }];
  }
  const beforeLunchMinutes = Math.min(totalMinutes, Math.max(0, (lunchStart.getTime() - dayStart.getTime()) / 60000));
  const periods: Array<{ start: Date; end: Date }> = [];
  if (beforeLunchMinutes > 0) {
    periods.push({ start: dayStart, end: new Date(dayStart.getTime() + beforeLunchMinutes * 60000) });
  }
  const remainingMinutes = totalMinutes - beforeLunchMinutes;
  if (remainingMinutes > 0) {
    periods.push({ start: lunchEnd, end: new Date(lunchEnd.getTime() + remainingMinutes * 60000) });
  }
  return periods.length ? periods : [{ start: dayStart, end: new Date(dayStart.getTime() + totalMinutes * 60000) }];
}

function apsNextWorkDayStart(value: Date, settings: ApsSettings) {
  let next = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
  for (let guard = 0; guard < 730; guard += 1) {
    const periods = apsWorkPeriods(next, settings);
    if (periods.length) return new Date(periods[0].start);
    next = apsNextCalendarDay(next);
  }
  return next;
}

function apsNextCalendarDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
}

function apsEffectiveCalendarDay(value: Date, settings: ApsSettings): ApsCalendarDay {
  const date = dateInputValue(value);
  const explicit = (settings.calendarDays || []).find((day) => day.date === date);
  if (explicit) return normalizeApsCalendarDay(explicit, settings);
  return {
    date,
    productive: !isWeekend(value),
    startTime: settings.workdayStart,
    dailyHours: settings.dailyHours,
    lunchStart: settings.lunchStart,
    lunchMinutes: settings.lunchMinutes,
    note: ''
  };
}

function defaultApsOperation(code: string, label: string): ApsOperation {
  return {
    code,
    description: label || code,
    statusName: '',
    sortOrder: 999,
    category: 'production',
    flowType: 'normal',
    setupHours: 0,
    processHours: 1,
    lotSize: 1,
    minOperators: 1,
    maxOperators: 1,
    allowedCenters: []
  };
}

function defaultApsCenter(code: string): ApsWorkCenter {
  const cleanCode = String(code || 'SEM-CENTRO').toUpperCase();
  return normalizeApsWorkCenter({ code: cleanCode, description: cleanCode, machineCount: 1, efficiency: 1, capacity: 8 });
}

function defaultApsMachine(centerCode: string, startDate: Date): ApsMachineResource {
  const cleanCode = String(centerCode || 'SEM-CENTRO').toUpperCase();
  return {
    code: `${cleanCode}-1`,
    name: cleanCode,
    type: 'machine',
    centerCode: cleanCode,
    availableAt: new Date(startDate),
    loadHours: 0
  };
}

function defaultApsOperator(startDate: Date): ApsOperatorResource {
  return {
    code: 'SEM-OPERADOR',
    name: 'Sem operador cadastrado',
    shift: '',
    journeyHours: 8,
    efficiency: 1,
    skill: '',
    enabledOperations: [],
    enabledCenters: [],
    hourlyCost: 0,
    type: 'operator',
    availableAt: new Date(startDate),
    loadHours: 0
  };
}

function selectedOptionValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isTimeText(value: unknown) {
  return /^\d{2}:\d{2}$/.test(String(value || ''));
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function toNumber(value: unknown, fallback: number) {
  const number = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(number) ? number : fallback;
}

function toInteger(value: unknown, fallback: number) {
  const number = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(number) ? Math.max(1, Math.round(number)) : fallback;
}

function asRow(value: unknown): Row {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
}

function arrayRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') as Row[] : [];
}

function stringList(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value || '').split(/[;,]/);
  const seen = new Set<string>();
  return raw
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

function SimplePanel({ title, rows, columns }: { title: string; rows: Row[]; columns: Column[] }) {
  return (
    <section className="module-panel">
      <div className="panel-title">
        <h3>{title}</h3>
        <span>{rows.length} registros</span>
      </div>
      <DataTable rows={rows} columns={columns} />
    </section>
  );
}

function DataTable({
  rows,
  columns,
  actions,
  rowClass,
  onRowClick,
  sortField = '',
  sortDirection = 'asc',
  onSort
}: {
  rows: Row[];
  columns: Column[];
  actions?: (row: Row) => ReactNode;
  rowClass?: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}) {
  return (
    <div className="generic-table-wrap">
      <table className="generic-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {onSort ? (
                  <button
                    className={`table-sort-button ${sortField === column.key ? 'active' : ''}`}
                    data-direction={sortField === column.key ? sortDirection : ''}
                    type="button"
                    title="Clique para classificar"
                    onClick={() => onSort(column.key)}
                  >
                    {column.label}
                  </button>
                ) : column.label}
              </th>
            ))}
            {actions && <th>Acoes</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={String(row.id || `${row.orderNumber || row.romaneioNumber || 'row'}-${index}`)}
              className={[rowClass ? rowClass(row) : '', onRowClick ? 'clickable-row' : ''].filter(Boolean).join(' ')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} title={cellValue(row, column)} data-label={column.label}>
                  {column.render ? column.render(row) : cellValue(row, column)}
                </td>
              ))}
              {actions && <td className="row-actions-cell" data-label="Acoes" onClick={onRowClick ? (event) => event.stopPropagation() : undefined}>{actions(row)}</td>}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="empty" colSpan={columns.length + (actions ? 1 : 0)}>Nenhum registro encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: unknown }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{String(value ?? '-')}</strong>
    </article>
  );
}

function ToolbarSearch({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="field module-search">
      <span>Filtrar</span>
      <input className="input" type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function MiniBars({ rows, labelKey, valueKey }: { rows: Row[]; labelKey: string; valueKey: string }) {
  const max = Math.max(1, ...rows.map((row) => Number(row[valueKey]) || 0));
  return (
    <div className="mini-bars">
      {rows.map((row, index) => {
        const value = Number(row[valueKey]) || 0;
        return (
          <div className="mini-bar-row" key={`${String(row[labelKey])}-${index}`}>
            <span>{String(row[labelKey] || '-')} {String(row.capacityLabel || '')}</span>
            <div><strong style={{ width: `${Math.max(4, (value / max) * 100)}%` }} /></div>
            <em>{formatNumber(value)}</em>
          </div>
        );
      })}
    </div>
  );
}

function dashboardGoalFields(): { key: keyof DashboardGoals; label: string }[] {
  return [
    { key: 'soldMonth', label: 'Meta vendidas/mes' },
    { key: 'finishedMonth', label: 'Meta finalizadas/mes' },
    { key: 'leadTimeMonth', label: 'Meta lead time' },
    { key: 'averageSoldYear', label: 'Meta media venda/ano' },
    { key: 'deliveryPunctuality', label: 'Meta pontualidade %' },
    { key: 'averageProducedYear', label: 'Meta media prod./ano' }
  ];
}

function emptyDashboardGoals(): DashboardGoals {
  return {
    soldMonth: '',
    finishedMonth: '',
    leadTimeMonth: '',
    averageSoldYear: '',
    deliveryPunctuality: '',
    averageProducedYear: ''
  };
}

function dashboardGoalsFromRow(row: Row): DashboardGoals {
  const goals = emptyDashboardGoals();
  for (const field of dashboardGoalFields()) {
    const value = row[field.key];
    goals[field.key] = value === null || value === undefined || value === '' ? '' : String(value);
  }
  return goals;
}

function dashboardGoalPayload(goals: DashboardGoals) {
  return Object.fromEntries(dashboardGoalFields().map((field) => {
    const rawValue = String(goals[field.key] || '').trim();
    return [field.key, rawValue === '' ? '' : Number(rawValue)];
  }));
}

function numericDashboardGoal(goals: DashboardGoals, key: keyof DashboardGoals) {
  const value = Number(goals[key]);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function dashboardCharts(orders: Row[], year: string, goals: DashboardGoals): DashboardChartDefinition[] {
  return [
    {
      key: 'soldMonth',
      title: 'Maquinas vendidas por mes',
      series: groupMachinesByMonth(orders, 'entryDate', year),
      type: 'bar' as const,
      yTitle: 'Maquinas',
      goal: numericDashboardGoal(goals, 'soldMonth')
    },
    {
      key: 'finishedMonth',
      title: 'Maquinas finalizadas por mes',
      series: groupMachinesByMonth(orders, 'finalizationDate', year),
      type: 'bar' as const,
      yTitle: 'Maquinas',
      goal: numericDashboardGoal(goals, 'finishedMonth')
    },
    {
      key: 'leadTimeMonth',
      title: 'Lead time medio por mes',
      series: groupLeadTimeByFinalizationMonth(orders, year),
      type: 'scatter' as const,
      yTitle: 'Dias',
      goal: numericDashboardGoal(goals, 'leadTimeMonth')
    },
    {
      key: 'averageSoldYear',
      title: 'Media mensal vendida por ano',
      series: averageMachinesByYear(orders, year),
      type: 'bar' as const,
      yTitle: 'Maquinas',
      goal: numericDashboardGoal(goals, 'averageSoldYear')
    },
    {
      key: 'deliveryPunctuality',
      title: 'Pontualidade de entrega',
      series: deliveryPunctualityByFinalizationMonth(orders, year),
      type: 'bar' as const,
      yTitle: '% no prazo',
      goal: numericDashboardGoal(goals, 'deliveryPunctuality'),
      percentage: true
    },
    {
      key: 'averageProducedYear',
      title: 'Media mensal produzida por ano',
      series: averageProducedByYear(orders, year),
      type: 'bar' as const,
      yTitle: 'Itens',
      goal: numericDashboardGoal(goals, 'averageProducedYear')
    }
  ];
}

function prepareDashboardCharts(
  charts: DashboardChartDefinition[],
  options: { mode: DashboardChartMode; sort: DashboardChartSort; limit: string }
): DashboardChartDefinition[] {
  return charts.map((chart) => {
    const type = options.mode === 'auto' ? chart.type : options.mode === 'line' ? 'scatter' : 'bar';
    return {
      ...chart,
      type,
      series: prepareDashboardSeries(chart.series, options.sort, options.limit)
    };
  });
}

function prepareDashboardSeries(series: DashboardSeriesPoint[], sort: DashboardChartSort, limitValue: string) {
  const limit = Number(limitValue);
  const ordered = [...series].sort((left, right) => {
    if (sort === 'desc') return right.value - left.value || left.label.localeCompare(right.label, 'pt-BR', { numeric: true, sensitivity: 'base' });
    if (sort === 'asc') return left.value - right.value || left.label.localeCompare(right.label, 'pt-BR', { numeric: true, sensitivity: 'base' });
    return 0;
  });
  if (!Number.isFinite(limit) || limit <= 0 || ordered.length <= limit) return ordered;
  return sort === 'period' ? ordered.slice(-limit) : ordered.slice(0, limit);
}

function dashboardChartDetailRows(chart: DashboardChartDefinition | null): Row[] {
  if (!chart) return [];
  return chart.series.map((point) => ({
    id: point.label,
    label: point.label,
    value: point.value,
    goal: chart.goal,
    gap: chart.goal === null ? null : Math.round((point.value - chart.goal) * 10) / 10,
    delivered: point.delivered ?? '',
    onTime: point.onTime ?? ''
  }));
}

function dashboardChartMetrics(chart: DashboardChartDefinition | null) {
  const values = chart?.series.map((point) => Number(point.value) || 0) || [];
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    points: values.length,
    total,
    average: values.length ? Math.round((total / values.length) * 10) / 10 : 0,
    max: values.length ? Math.max(...values) : 0
  };
}

function exportDashboardChartCsv(chart: DashboardChartDefinition) {
  const rows = dashboardChartDetailRows(chart);
  const columns = [
    { key: 'label', label: 'Periodo' },
    { key: 'value', label: chart.yTitle },
    { key: 'goal', label: 'Meta' },
    { key: 'gap', label: 'Desvio' },
    { key: 'delivered', label: 'Entregues' },
    { key: 'onTime', label: 'No prazo' }
  ];
  const csvRows = [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => row[column.key] ?? ''))
  ];
  const csv = csvRows.map((row) => row.map((value) => escapeCsvCell(String(value || ''))).join(';')).join('\r\n');
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${csv}`)}`;
  const fileKey = normalizeText(chart.title).replace(/\s+/g, '-').slice(0, 40) || 'dashboard';
  downloadDataUrl(dataUrl, `dashboard-${fileKey}-${dateInputValue(new Date())}.csv`);
}

function dashboardYears(orders: Row[]) {
  const years = new Set<string>();
  for (const order of orders) {
    for (const value of [order.entryDate, order.finalizationDate]) {
      const text = String(value || '');
      if (isDateText(text)) years.add(text.slice(0, 4));
    }
  }
  return Array.from(years).sort((left, right) => right.localeCompare(left));
}

function isProductionItem(order: Row) {
  return String(order.itemType || 'production') === 'production';
}

function groupMachinesByMonth(orders: Row[], dateField: string, year = ''): DashboardSeriesPoint[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    const key = monthKey(order[dateField]);
    if (!key || (year && key.slice(0, 4) !== year)) continue;
    totals.set(key, (totals.get(key) || 0) + (Number(order.quantity) || 0));
  }
  return mapMonthSeries(totals);
}

function groupLeadTimeByFinalizationMonth(orders: Row[], year = ''): DashboardSeriesPoint[] {
  const groups = new Map<string, { total: number; count: number }>();
  for (const order of orders) {
    const key = monthKey(order.finalizationDate);
    const leadTime = diffDays(order.entryDate, order.finalizationDate);
    if (!key || leadTime === null || (year && key.slice(0, 4) !== year)) continue;
    const group = groups.get(key) || { total: 0, count: 0 };
    group.total += leadTime;
    group.count += 1;
    groups.set(key, group);
  }
  const averages = new Map<string, number>();
  for (const [key, group] of groups.entries()) {
    averages.set(key, Math.round((group.total / group.count) * 10) / 10);
  }
  return mapMonthSeries(averages);
}

function averageMachinesByYear(orders: Row[], year = ''): DashboardSeriesPoint[] {
  return averageMonthlyQuantityByYear(orders, 'entryDate', year);
}

function averageProducedByYear(orders: Row[], year = ''): DashboardSeriesPoint[] {
  return averageMonthlyQuantityByYear(orders, 'finalizationDate', year);
}

function averageMonthlyQuantityByYear(orders: Row[], dateField: string, year = ''): DashboardSeriesPoint[] {
  const monthlyTotals = new Map<string, number>();
  const yearlyMonths = new Map<string, number[]>();
  for (const order of orders) {
    const key = monthKey(order[dateField]);
    if (!key || (year && key.slice(0, 4) !== year)) continue;
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (Number(order.quantity) || 0));
  }
  for (const [month, total] of monthlyTotals.entries()) {
    const currentYear = month.slice(0, 4);
    if (!yearlyMonths.has(currentYear)) yearlyMonths.set(currentYear, []);
    yearlyMonths.get(currentYear)?.push(total);
  }
  return Array.from(yearlyMonths.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, totals]) => ({
      label,
      value: Math.round((totals.reduce((sum, value) => sum + value, 0) / totals.length) * 10) / 10
    }));
}

function deliveryReleaseSummaryByFinalizationMonth(orders: Row[], filters: DashboardReleaseFilters | string = '', legacyItemType = ''): Row[] {
  const releaseFilters: DashboardReleaseFilters = typeof filters === 'string'
    ? { year: filters, month: '', dateFrom: '', dateTo: '', itemType: legacyItemType }
    : filters;
  const groups = new Map<string, { late: number; onTime: number; early: number }>();
  for (const order of orders) {
    const finalizationText = String(order.finalizationDate || '');
    if (releaseFilters.itemType && String(order.itemType || 'production') !== releaseFilters.itemType) continue;
    if (!isDateText(finalizationText) || !isDateText(order.originalDeliveryDate)) continue;
    const key = finalizationText.slice(0, 7);
    if (releaseFilters.year && key.slice(0, 4) !== releaseFilters.year) continue;
    if (releaseFilters.month && key.slice(5, 7) !== releaseFilters.month) continue;
    if (releaseFilters.dateFrom && finalizationText < releaseFilters.dateFrom) continue;
    if (releaseFilters.dateTo && finalizationText > releaseFilters.dateTo) continue;
    const quantity = Number(order.quantity) || 0;
    if (quantity <= 0) continue;
    const finalizationDate = parseLocalDate(finalizationText);
    const originalDeliveryDate = parseLocalDate(String(order.originalDeliveryDate));
    const group = groups.get(key) || { late: 0, onTime: 0, early: 0 };
    if (finalizationDate > originalDeliveryDate) {
      group.late += quantity;
    } else if (finalizationDate < originalDeliveryDate) {
      group.early += quantity;
    } else {
      group.onTime += quantity;
    }
    groups.set(key, group);
  }
  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, group]) => ({ label: formatMonth(month), ...group }));
}

function deliveryPunctualityByFinalizationMonth(orders: Row[], year = ''): DashboardSeriesPoint[] {
  const groups = new Map<string, { delivered: number; onTime: number }>();
  for (const order of orders) {
    const key = monthKey(order.finalizationDate);
    if (!key || !isDateText(order.originalDeliveryDate) || (year && key.slice(0, 4) !== year)) continue;
    const quantity = Number(order.quantity) || 0;
    if (quantity <= 0) continue;
    const group = groups.get(key) || { delivered: 0, onTime: 0 };
    group.delivered += quantity;
    if (isOnTimeDelivery(order)) group.onTime += quantity;
    groups.set(key, group);
  }
  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, group]) => ({
      label: formatMonth(month),
      value: group.delivered ? Math.round((group.onTime / group.delivered) * 1000) / 10 : 0,
      delivered: group.delivered,
      onTime: group.onTime
    }));
}

function isOnTimeDelivery(order: Row) {
  if (!isDateText(order.finalizationDate) || !isDateText(order.originalDeliveryDate)) return false;
  return parseLocalDate(String(order.finalizationDate)) <= parseLocalDate(String(order.originalDeliveryDate));
}

function mapMonthSeries(valuesByMonth: Map<string, number>): DashboardSeriesPoint[] {
  return Array.from(valuesByMonth.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, value]) => ({ label: formatMonth(month), value }));
}

function monthKey(value: unknown) {
  const text = String(value || '');
  return isDateText(text) ? text.slice(0, 7) : '';
}

function isDateText(value: unknown) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function diffDays(startValue: unknown, endValue: unknown) {
  if (!startValue || !endValue) return null;
  if (!isDateText(startValue) || !isDateText(endValue)) return null;
  const start = parseLocalDate(String(startValue));
  const end = parseLocalDate(String(endValue));
  const diff = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return diff >= 0 ? diff : null;
}

function productSortOptions() {
  return [
    { key: 'forecastNext3Months', label: 'Previsao 3 meses' },
    { key: 'forecastNextMonth', label: 'Previsao prox. mes' },
    { key: 'machinesSold', label: 'Maquinas vendidas' },
    { key: 'salesOrders', label: 'Pedidos' },
    { key: 'averageLeadTime', label: 'Lead time medio' },
    { key: 'averageOrderInterval', label: 'Intervalo pedidos' },
    { key: 'productLine', label: 'Linha' },
    { key: 'code', label: 'Codigo' }
  ];
}

function productForecastColumns(): Column[] {
  return [
    { key: 'productLine', label: 'Linha' },
    { key: 'capacityLabel', label: 'Capacidade' },
    { key: 'machinesSold', label: 'Vendidas', format: formatInteger },
    { key: 'averageMonthlyDemand', label: 'Media mensal', format: formatDemand },
    { key: 'forecastNextMonth', label: 'Prox. mes', format: formatDemand },
    { key: 'forecastNext3Months', label: 'Prox. 3 meses', format: formatDemand },
    { key: 'averageLeadTime', label: 'Lead time', format: formatDays },
    { key: 'openSummary', label: 'Carteira aberta', format: (_value, row) => `${formatInteger(row.openOrders)} ped. / ${formatInteger(row.openMachines)} maq.` },
    { key: 'delayRiskLabel', label: 'Risco' },
    { key: 'confidence', label: 'Confianca', format: forecastConfidenceLabel }
  ];
}

function productStatsColumns(): Column[] {
  return [
    { key: 'code', label: 'Codigo' },
    { key: 'productLine', label: 'Linha' },
    { key: 'equipment', label: 'Equipamento' },
    { key: 'salesOrders', label: 'Pedidos', format: formatInteger },
    { key: 'machinesSold', label: 'Vendidas', format: formatInteger },
    { key: 'averageLeadTime', label: 'Lead time', format: formatDays },
    { key: 'averageOrderInterval', label: 'Intervalo pedidos', format: formatDays }
  ];
}

function emptyProductTableState(): ProductTableState {
  return {
    search: '',
    sortField: 'forecastNext3Months',
    sortDirection: 'desc',
    riskFilter: '',
    productFilters: {},
    forecastFilters: {}
  };
}

function loadProductTableState(userId: string): ProductTableState {
  return normalizeProductTableState(readLocalPreference(productTableStorageKey(userId)));
}

function normalizeProductTableState(value: unknown): ProductTableState {
  const parsed = isPlainPreference(value) ? value : {};
  return {
    ...emptyProductTableState(),
    ...parsed,
    sortDirection: parsed.sortDirection === 'asc' ? 'asc' : 'desc',
    productFilters: stringRecord(parsed.productFilters),
    forecastFilters: stringRecord(parsed.forecastFilters)
  };
}

function persistProductTableState(userId: string, state: ProductTableState) {
  const cleanState = normalizeProductTableState(state);
  writeLocalPreference(productTableStorageKey(userId), cleanState);
  persistPreferenceState('productTableState', cleanState);
}

function productTableStorageKey(userId: string) {
  return `mge-sop-react-product-table-state:${userId || 'default'}`;
}

function filterProductColumns(row: Row, filters: Record<string, string>, columns: Column[]) {
  return Object.entries(filters)
    .map(([key, value]) => [key, String(value || '').trim()] as const)
    .filter(([, value]) => value)
    .every(([key, value]) => {
      const column = columns.find((item) => item.key === key);
      if (!column) return true;
      return normalizeText(cellValue(row, column)).includes(normalizeText(value));
    });
}

function productSearchText(product: Row) {
  return normalizeText([
    product.code,
    product.productLine,
    product.equipment,
    product.salesOrders,
    product.machinesSold,
    product.averageLeadTime,
    product.averageOrderInterval
  ].join(' '));
}

function forecastSearchText(forecast: Row) {
  return normalizeText([
    forecast.productLine,
    forecast.capacityLabel,
    forecast.machinesSold,
    forecast.averageMonthlyDemand,
    forecast.forecastNextMonth,
    forecast.forecastNext3Months,
    forecast.averageLeadTime,
    forecast.openOrders,
    forecast.openMachines,
    forecast.delayRiskLabel,
    forecast.confidence
  ].join(' '));
}

function forecastMatchesRiskFilter(forecast: Row, filter: string) {
  if (filter === 'late') return Number(forecast.predictedLateOrders) > 0;
  if (filter === 'ok') return Number(forecast.predictedLateOrders) <= 0;
  if (filter === 'low-confidence') {
    const confidence = normalizeText(forecast.confidence);
    return confidence.includes('baixa') || confidence.includes('pouco historico');
  }
  return true;
}

function sortProductRows(rows: Row[], field: string, direction: 'asc' | 'desc') {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    const result = compareLoose(productSortValue(left, field), productSortValue(right, field));
    if (result !== 0) return result * multiplier;
    return compareLoose(productSortValue(left, 'productLine'), productSortValue(right, 'productLine'))
      || compareLoose(productSortValue(left, 'code'), productSortValue(right, 'code'));
  });
}

function productSortValue(row: Row, field: string) {
  if (field === 'forecastNext3Months') return row.forecastNext3Months ?? row.machinesSold ?? 0;
  if (field === 'forecastNextMonth') return row.forecastNextMonth ?? row.averageMonthlyDemand ?? row.machinesSold ?? 0;
  if (field === 'machinesSold') return row.machinesSold ?? 0;
  if (field === 'salesOrders') return row.salesOrders ?? 0;
  if (field === 'averageLeadTime') return row.averageLeadTime ?? Number.POSITIVE_INFINITY;
  if (field === 'averageOrderInterval') return row.averageOrderInterval ?? Number.POSITIVE_INFINITY;
  if (field === 'productLine') return row.productLine ?? '';
  if (field === 'code') return row.code ?? row.productLine ?? '';
  return row[field] ?? '';
}

function productSopCards(forecasts: Row[], products: Row[]) {
  const totalForecast3 = sumBy(forecasts, 'forecastNext3Months');
  const totalSold = sumBy(products, 'machinesSold');
  const openMachines = sumBy(forecasts, 'openMachines');
  const lateOrders = sumBy(forecasts, 'predictedLateOrders');
  const averageLeadTime = averageNumbers(forecasts.map((item) => item.averageLeadTime));
  return [
    { label: 'Previsao 3 meses', value: `${formatDemand(totalForecast3)} maq.` },
    { label: 'Historico vendido', value: `${formatInteger(totalSold)} maq.` },
    { label: 'Carteira aberta', value: `${formatInteger(openMachines)} maq.` },
    { label: 'Risco operacional', value: `${formatInteger(lateOrders)} pedidos` },
    { label: 'Lead time medio', value: formatDays(averageLeadTime) }
  ];
}

function productSopInsights(forecasts: Row[]) {
  const topDemand = maxBy(forecasts, (item) => Number(item.forecastNext3Months) || 0);
  const topRisk = maxBy(forecasts, (item) => Number(item.predictedLateOrders) || 0);
  const longLead = maxBy(forecasts, (item) => Number(item.averageLeadTime) || 0);
  const lowConfidenceCount = forecasts.filter((item) => forecastMatchesRiskFilter(item, 'low-confidence')).length;
  const insights: string[] = [];

  if (topDemand) {
    insights.push(`Prioridade de demanda: ${forecastLabel(topDemand)} concentra ${formatDemand(topDemand.forecastNext3Months)} maquinas previstas nos proximos 3 meses.`);
  }
  if (topRisk && Number(topRisk.predictedLateOrders) > 0) {
    insights.push(`Atencao PCP: ${forecastLabel(topRisk)} tem ${formatInteger(topRisk.predictedLateOrders)} pedido(s) com atraso previsto e desvio maximo de ${formatInteger(topRisk.maxPredictedDelayDays)} dias.`);
  } else if (forecasts.length) {
    insights.push('Carteira aberta sem atraso previsto pelo lead time historico dos grupos filtrados.');
  }
  if (longLead && Number(longLead.averageLeadTime) > 0) {
    insights.push(`Restricao de capacidade: maior lead time em ${forecastLabel(longLead)}, com media de ${formatDays(longLead.averageLeadTime)}.`);
  }
  if (lowConfidenceCount > 0) {
    insights.push(`${formatInteger(lowConfidenceCount)} grupo(s) com pouca base estatistica; usar previsao como sinal direcional e revisar com Comercial/PCP.`);
  }
  if (!insights.length) {
    insights.push('Sem dados suficientes no filtro atual para gerar analise S&OP.');
  }
  return insights;
}

function productCharts(forecasts: Row[], products: Row[]) {
  return [
    {
      key: 'demand',
      title: 'Previsao 3 meses',
      series: topSeries(forecasts, 'forecastNext3Months', forecastLabel, 12),
      type: 'bar' as const,
      yTitle: 'Maquinas',
      goal: null
    },
    {
      key: 'leadTime',
      title: 'Lead time medio',
      series: topSeries(forecasts, 'averageLeadTime', forecastLabel, 12),
      type: 'bar' as const,
      yTitle: 'Dias',
      goal: null
    },
    {
      key: 'mix',
      title: 'Top produtos vendidos',
      series: topSeries(products, 'machinesSold', (item) => String(item.code || '-'), 12),
      type: 'bar' as const,
      yTitle: 'Maquinas',
      goal: null
    },
    {
      key: 'risk',
      title: 'Pedidos com atraso previsto',
      series: topSeries(forecasts.filter((item) => Number(item.predictedLateOrders) > 0), 'predictedLateOrders', forecastLabel, 12),
      type: 'bar' as const,
      yTitle: 'Pedidos',
      goal: null
    }
  ];
}

function topSeries(rows: Row[], valueKey: string, labelFn: (row: Row) => string, limit: number): DashboardSeriesPoint[] {
  return [...rows]
    .map((item) => ({ label: labelFn(item), value: Number(item[valueKey]) || 0 }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, 'pt-BR', { numeric: true, sensitivity: 'base' }))
    .slice(0, limit);
}

function forecastLabel(forecast: Row) {
  return `${String(forecast.productLine || '-')} ${String(forecast.capacityLabel || '')}`.trim();
}

function sumBy(rows: Row[], key: string) {
  return rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
}

function averageNumbers(values: unknown[]) {
  const numbers = values.map(Number).filter(Number.isFinite);
  if (!numbers.length) return null;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function maxBy(rows: Row[], valueFn: (row: Row) => number) {
  return rows.reduce<Row | null>((best, item) => {
    if (!best) return item;
    return valueFn(item) > valueFn(best) ? item : best;
  }, null);
}

function formatDays(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  return `${formatNumber(value)} dias`;
}

function formatDemand(value: unknown) {
  return formatNumber(value);
}

function forecastConfidenceLabel(value: unknown) {
  const normalized = normalizeText(value);
  if (normalized === 'media') return 'Media';
  return String(value || '-');
}

function pcpColumns(): Column[] {
  return [
    { key: 'orderNumber', label: 'Pedido' },
    { key: 'customer', label: 'Cliente' },
    { key: 'sku', label: 'SKU' },
    { key: 'productionOrder', label: 'OP' },
    { key: 'orderStatus', label: 'Status pedido' },
    { key: 'componentCode', label: 'Componente' },
    { key: 'reason', label: 'Tipo' },
    { key: 'motive', label: 'Motivo' },
    { key: 'purchaseOrderNumber', label: 'Pedido compra' },
    { key: 'expectedResolutionDate', label: 'Data prevista' },
    { key: 'issueStatus', label: 'Situacao' },
    { key: 'notes', label: 'Observacoes' },
    { key: 'createdBy', label: 'Criado por' },
    { key: 'createdAt', label: 'Criado em' }
  ];
}

function emptyPcpForm(): PcpFormState {
  return {
    orderId: '',
    componentCode: '',
    reason: 'purchase',
    motive: '',
    purchaseOrderNumber: '',
    expectedResolutionDate: '',
    notes: ''
  };
}

function pcpFormFromIssue(issue: Row): PcpFormState {
  const reason = sanitizePcpReasonForForm(issue.reason);
  return {
    orderId: String(issue.orderId || ''),
    componentCode: String(issue.componentCode || ''),
    reason,
    motive: String(issue.motive || ''),
    purchaseOrderNumber: reason === 'purchase' ? String(issue.purchaseOrderNumber || '') : '',
    expectedResolutionDate: String(issue.expectedResolutionDate || '').slice(0, 10),
    notes: String(issue.notes || '')
  };
}

function sanitizePcpReasonForForm(value: unknown) {
  const reason = String(value || '').trim();
  return ['purchase', 'engineering', 'rework'].includes(reason) ? reason : 'purchase';
}

function emptyPcpTableState(): PcpTableState {
  return {
    search: '',
    status: 'open',
    sortField: 'expectedResolutionDate',
    sortDirection: 'asc',
    columnFilters: {}
  };
}

function loadPcpTableState(userId: string): PcpTableState {
  return normalizePcpTableState(readLocalPreference(pcpTableStorageKey(userId)));
}

function normalizePcpTableState(value: unknown): PcpTableState {
  const parsed = isPlainPreference(value) ? value : {};
  return {
    ...emptyPcpTableState(),
    ...parsed,
    sortDirection: parsed.sortDirection === 'desc' ? 'desc' : 'asc',
    columnFilters: stringRecord(parsed.columnFilters)
  };
}

function persistPcpTableState(userId: string, state: PcpTableState) {
  const cleanState = normalizePcpTableState(state);
  writeLocalPreference(pcpTableStorageKey(userId), cleanState);
  persistPreferenceState('pcpTableState', cleanState);
}

function pcpTableStorageKey(userId: string) {
  return `mge-sop-react-pcp-table-state:${userId || 'default'}`;
}

function pcpOrderOptionLabel(order: Row) {
  return [
    order.orderNumber,
    order.customer,
    order.sku,
    order.equipment,
    order.productionOrder ? `OP ${order.productionOrder}` : ''
  ].filter(Boolean).join(' | ') || String(order.id || '-');
}

function filterPcpIssues(rows: Row[], filters: Record<string, string>) {
  const activeFilters = Object.entries(filters)
    .map(([key, value]) => [key, String(value || '').trim()] as const)
    .filter(([, value]) => value);
  if (!activeFilters.length) return rows;
  return rows.filter((row) => activeFilters.every(([key, value]) => pcpFilterMatches(row, key, value)));
}

function pcpFilterMatches(row: Row, key: string, value: string) {
  if (key === 'reason' || key === 'issueStatus') {
    return String(row[key] || '') === value;
  }
  return normalizeText(pcpDisplayValue(row, key)).includes(normalizeText(value));
}

function sortPcpIssues(rows: Row[], field: string, direction: 'asc' | 'desc') {
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...rows].sort((left, right) => {
    const result = compareLoose(pcpSortValue(left, field), pcpSortValue(right, field));
    if (result !== 0) return result * multiplier;
    return compareLoose(left.orderNumber, right.orderNumber) || compareLoose(left.componentCode, right.componentCode);
  });
}

function pcpSortValue(row: Row, field: string) {
  if (field === 'reason') return row.reasonLabel || row.reason;
  if (field === 'issueStatus') return row.issueStatusLabel || row.issueStatus;
  return row[field];
}

function pcpDisplayValue(row: Row, field: string) {
  if (field === 'reason') return row.reasonLabel || row.reason;
  if (field === 'issueStatus') return row.issueStatusLabel || row.issueStatus;
  if (field === 'expectedResolutionDate') return formatDate(row.expectedResolutionDate);
  if (field === 'createdAt') return formatDateTime(row.createdAt);
  return row[field];
}

function compareLoose(left: unknown, right: unknown) {
  const leftText = normalizeText(left);
  const rightText = normalizeText(right);
  const leftNumber = Number(String(left).replace(',', '.'));
  const rightNumber = Number(String(right).replace(',', '.'));
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber) && leftNumber !== rightNumber) {
    return leftNumber - rightNumber;
  }
  return leftText.localeCompare(rightText, 'pt-BR', { numeric: true });
}

function isPcpIssueOverdue(issue: Row) {
  return String(issue.issueStatus || '') !== 'resolved' && isPastDate(String(issue.expectedResolutionDate || ''));
}

function billingReleasedColumns(): Column[] {
  return [
    { key: 'sourceLabel', label: 'Origem', format: (_value, row) => billingSourceLabel(row) },
    { key: 'orderNumber', label: 'Pedido / Romaneio', format: (_value, row) => billingPrimaryLabel(row) },
    { key: 'requestType', label: 'Tipo solicitacao', format: (_value, row) => billingRequestTypeLabel(row) },
    { key: 'salesOrderReference', label: 'Pedido venda', format: (_value, row) => billingSalesOrderLabel(row) },
    { key: 'purchaseOrderNumber', label: 'Pedido compra' },
    { key: 'customer', label: 'Cliente / fornecedor' },
    { key: 'sku', label: 'SKU / peca' },
    { key: 'equipment', label: 'Equipamento / descricao' },
    { key: 'status', label: 'Status' },
    { key: 'quantity', label: 'Qtd.', format: formatNumber },
    { key: 'dimensionSummary', label: 'Dimensionais', format: (_value, row) => billingDimensionSummary(row) },
    { key: 'billingReleasedAt', label: 'Liberado em', format: formatDateTime },
    { key: 'documentStatus', label: 'Arquivo NF', format: (_value, row) => hasBillingDocument(row) ? 'Cadastrada' : 'Pendente' }
  ];
}

function billingHistoryColumns(): Column[] {
  return [
    { key: 'sourceLabel', label: 'Origem', format: (_value, row) => billingSourceLabel(row) },
    { key: 'orderNumber', label: 'Pedido / Romaneio', format: (_value, row) => billingPrimaryLabel(row) },
    { key: 'requestType', label: 'Tipo solicitacao', format: (_value, row) => billingRequestTypeLabel(row) },
    { key: 'salesOrderReference', label: 'Pedido venda', format: (_value, row) => billingSalesOrderLabel(row) },
    { key: 'purchaseOrderNumber', label: 'Pedido compra' },
    { key: 'invoiceNumber', label: 'NF' },
    { key: 'carrierName', label: 'Transportadora' },
    { key: 'carrierCnpj', label: 'CNPJ transp.' },
    { key: 'billingCustomerName', label: 'Cliente faturamento' },
    { key: 'quantity', label: 'Qtd.', format: formatNumber },
    { key: 'machineWeight', label: 'Peso liq.', format: formatNumber },
    { key: 'machineGrossWeight', label: 'Peso bruto', format: formatNumber },
    { key: 'machineVolume', label: 'Volume', format: formatNumber },
    { key: 'documentStatus', label: 'Arquivo NF', format: (_value, row) => hasBillingDocument(row) ? 'Cadastrada' : 'Pendente' },
    { key: 'invoicedAt', label: 'Faturado em', format: formatDateTime },
    { key: 'loadedAt', label: 'Carregado em', format: formatDateTime }
  ];
}

function billingColumns(includeLoaded = false): Column[] {
  return [
    { key: 'sourceLabel', label: 'Origem', format: (_value, row) => billingSourceLabel(row) },
    { key: 'orderNumber', label: 'Pedido / Romaneio', format: (_value, row) => billingPrimaryLabel(row) },
    { key: 'customer', label: 'Cliente / fornecedor' },
    { key: 'purchaseOrderNumber', label: 'Pedido compra' },
    { key: 'invoiceNumber', label: 'NF' },
    { key: 'carrierName', label: 'Transportadora' },
    { key: 'quantity', label: 'Qtd.', format: formatNumber },
    { key: 'machineWeight', label: 'Peso liq.', format: formatNumber },
    { key: 'machineGrossWeight', label: 'Peso bruto', format: formatNumber },
    { key: includeLoaded ? 'loadedAt' : 'invoicedAt', label: includeLoaded ? 'Carregado em' : 'Faturado em', format: formatDateTime }
  ];
}

function filterBillingReleasedRows(rows: Row[], search: string) {
  const query = normalizeText(search);
  return rows
    .filter((row) => !query || billingSearchText(row).includes(query))
    .sort((a, b) => billingTimestamp(b, 'released').localeCompare(billingTimestamp(a, 'released')));
}

function filterBillingHistoryRows(rows: Row[], filters: BillingHistoryFilters) {
  const query = normalizeText(filters.search);
  return rows
    .filter((row) => {
      if (query && !billingSearchText(row).includes(query)) return false;
      if (filters.sourceType && billingSourceType(row) !== filters.sourceType) return false;
      const date = billingTimestamp(row, 'history').slice(0, 10);
      if (filters.dateFrom && (!date || date < filters.dateFrom)) return false;
      if (filters.dateTo && (!date || date > filters.dateTo)) return false;
      if (filters.document === 'with' && !hasBillingDocument(row)) return false;
      if (filters.document === 'without' && hasBillingDocument(row)) return false;
      return true;
    })
    .sort((a, b) => billingTimestamp(b, 'history').localeCompare(billingTimestamp(a, 'history')));
}

function billingSearchText(row: Row) {
  return normalizeText([
    billingSourceLabel(row),
    billingRequestTypeLabel(row),
    billingPrimaryLabel(row),
    billingSalesOrderLabel(row),
    row.orderNumber,
    row.romaneioNumber,
    row.customer,
    row.supplierName,
    row.sku,
    row.partCode,
    row.equipment,
    row.partDescription,
    row.purchaseOrderNumber,
    row.invoiceNumber,
    row.carrierName,
    row.carrierCnpj,
    row.billingCustomerName,
    row.billingCustomerCnpj,
    row.status
  ].join(' '));
}

function billingSourceType(row: Row) {
  return String(row.sourceType || '') === 'thirdParty' ? 'thirdParty' : 'order';
}

function billingSourceLabel(row: Row) {
  return billingSourceType(row) === 'thirdParty' ? 'Remessa de beneficiamento' : String(row.sourceLabel || 'Pedido de venda');
}

function billingRequestTypeLabel(row: Row) {
  return billingSourceType(row) === 'thirdParty' ? 'Beneficiamento' : 'Cliente';
}

function billingPrimaryLabel(row: Row) {
  return String(row.orderNumber || row.romaneioNumber || row.id || '-');
}

function billingSalesOrderLabel(row: Row) {
  if (billingSourceType(row) === 'thirdParty') {
    return String(row.linkedOrderNumber || row.salesOrderReference || '-');
  }
  return String(row.orderNumber || '-');
}

function billingItemApiBase(row: Row) {
  const id = encodeURIComponent(String(row.id || ''));
  return billingSourceType(row) === 'thirdParty' ? `/api/third-party-parts/${id}` : `/api/orders/${id}`;
}

function sameBillingItem(left: Row, right: Row) {
  return String(left.id || '') === String(right.id || '') && billingSourceType(left) === billingSourceType(right);
}

function billingTimestamp(row: Row, mode: 'released' | 'history') {
  if (mode === 'released') {
    return String(row.billingReleasedAt || row.updatedAt || row.entryDate || '');
  }
  return String(row.loadedAt || row.invoicedAt || row.billingReleasedAt || row.updatedAt || '');
}

function hasBillingDocument(row: Row) {
  return Boolean(row.hasInvoiceDocument || row.invoiceDocumentName || row.invoiceDocumentDataUrl);
}

function billingDimensionSummary(row: Row) {
  const parts = [
    ['A', row.machineHeight],
    ['L', row.machineWidth],
    ['C', row.machineLength],
    ['PL', row.machineWeight],
    ['PB', row.machineGrossWeight],
    ['V', row.machineVolume]
  ]
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => `${label}: ${formatNumber(value)}`);
  return parts.length ? parts.join(' | ') : 'Nao informado';
}

function billingDialogSubtitle(row: Row) {
  const labels = [
    billingSourceLabel(row),
    billingPrimaryLabel(row),
    billingSalesOrderLabel(row),
    row.customer || row.supplierName,
    row.sku || row.partCode
  ].filter(Boolean);
  return labels.join(' | ');
}

function billingDocumentLabel(row: Row, pendingDocument: InvoiceDocumentInput | null) {
  if (pendingDocument) return `Novo arquivo selecionado: ${pendingDocument.fileName}`;
  if (hasBillingDocument(row)) return `Documento cadastrado: ${String(row.invoiceDocumentName || 'NF')}`;
  return 'Nenhum documento cadastrado.';
}

function billingFormFromRow(row: Row): BillingFormState {
  return {
    invoiceNumber: String(row.invoiceNumber || ''),
    carrierName: String(row.carrierName || ''),
    carrierCnpj: String(row.carrierCnpj || ''),
    freightAddress: String(row.freightAddress || ''),
    billingCustomerName: String(row.billingCustomerName || row.customer || row.supplierName || ''),
    billingCustomerCnpj: String(row.billingCustomerCnpj || ''),
    machineHeight: formNumber(row.machineHeight),
    machineWidth: formNumber(row.machineWidth),
    machineLength: formNumber(row.machineLength),
    machineWeight: formNumber(row.machineWeight),
    machineGrossWeight: formNumber(row.machineGrossWeight),
    machineVolume: formNumber(row.machineVolume)
  };
}

function formNumber(value: unknown) {
  return value === null || value === undefined || value === '' ? '' : String(value);
}

function emptyBillingHistoryFilters(): BillingHistoryFilters {
  return {
    search: '',
    sourceType: '',
    dateFrom: '',
    dateTo: '',
    document: ''
  };
}

function loadBillingHistoryFilters(userId: string): BillingHistoryFilters {
  return normalizeBillingHistoryFilters(readLocalPreference(billingHistoryStorageKey(userId)));
}

function normalizeBillingHistoryFilters(value: unknown): BillingHistoryFilters {
  const parsed = isPlainPreference(value) ? value : {};
  return {
    ...emptyBillingHistoryFilters(),
    ...parsed
  };
}

function persistBillingHistoryFilters(userId: string, filters: BillingHistoryFilters) {
  const cleanFilters = normalizeBillingHistoryFilters(filters);
  writeLocalPreference(billingHistoryStorageKey(userId), cleanFilters);
  persistPreferenceState('billingHistoryState', cleanFilters);
}

function billingHistoryStorageKey(userId: string) {
  return `mge-sop-react-billing-history-filters:${userId || 'default'}`;
}

function emptyLoadingTableState(): LoadingTableState {
  return {
    search: '',
    sourceType: '',
    document: '',
    dateFrom: '',
    dateTo: ''
  };
}

function loadLoadingTableState(userId: string): LoadingTableState {
  return normalizeLoadingTableState(readLocalPreference(loadingTableStorageKey(userId)));
}

function normalizeLoadingTableState(value: unknown): LoadingTableState {
  const parsed = isPlainPreference(value) ? value : {};
  return {
    ...emptyLoadingTableState(),
    ...parsed
  };
}

function persistLoadingTableState(userId: string, state: LoadingTableState) {
  const cleanState = normalizeLoadingTableState(state);
  writeLocalPreference(loadingTableStorageKey(userId), cleanState);
  persistPreferenceState('loadingTableState', cleanState);
}

function loadingTableStorageKey(userId: string) {
  return `mge-sop-react-loading-table-state:${userId || 'default'}`;
}

function filterLoadingRows(rows: Row[], filters: LoadingTableState) {
  const query = normalizeText(filters.search);
  return rows
    .filter((row) => {
      if (query && !billingSearchText(row).includes(query)) return false;
      if (filters.sourceType && billingSourceType(row) !== filters.sourceType) return false;
      const date = String(row.invoicedAt || '').slice(0, 10);
      if (filters.dateFrom && (!date || date < filters.dateFrom)) return false;
      if (filters.dateTo && (!date || date > filters.dateTo)) return false;
      if (filters.document === 'with' && !hasBillingDocument(row)) return false;
      if (filters.document === 'without' && hasBillingDocument(row)) return false;
      return true;
    })
    .sort((a, b) => String(b.invoicedAt || '').localeCompare(String(a.invoicedAt || '')));
}

function loadingMetrics(rows: Row[]) {
  const grossWeight = rows.reduce((sum, row) => {
    const value = Number(row.machineGrossWeight || 0);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  return {
    total: formatInteger(rows.length),
    withDocument: formatInteger(rows.filter(hasBillingDocument).length),
    withoutDocument: formatInteger(rows.filter((row) => !hasBillingDocument(row)).length),
    thirdParty: formatInteger(rows.filter((row) => billingSourceType(row) === 'thirdParty').length),
    grossWeight: formatNumber(grossWeight)
  };
}

function emptyThirdPartyForm(): ThirdPartyFormState {
  return {
    romaneioNumber: '',
    salesOrderId: '',
    salesOrderReference: '',
    supplierName: '',
    supplierCnpj: '',
    partCode: '',
    partDescription: '',
    quantity: '1',
    unit: 'UN',
    processDescription: '',
    issueDate: dateInputValue(new Date()),
    expectedReturnDate: '',
    notes: ''
  };
}

function emptyThirdPartyTableState(): ThirdPartyTableState {
  return {
    search: '',
    returnScope: 'active',
    status: '',
    billingStage: '',
    dateMode: ''
  };
}

function loadThirdPartyTableState(userId: string): ThirdPartyTableState {
  return normalizeThirdPartyTableState(readLocalPreference(thirdPartyTableStorageKey(userId)));
}

function normalizeThirdPartyTableState(value: unknown): ThirdPartyTableState {
  const parsed = isPlainPreference(value) ? value : {};
  return {
    ...emptyThirdPartyTableState(),
    ...parsed
  };
}

function persistThirdPartyTableState(userId: string, state: ThirdPartyTableState) {
  const cleanState = normalizeThirdPartyTableState(state);
  writeLocalPreference(thirdPartyTableStorageKey(userId), cleanState);
  persistPreferenceState('thirdPartyTableState', cleanState);
}

function thirdPartyTableStorageKey(userId: string) {
  return `mge-sop-react-third-party-table-state:${userId || 'default'}`;
}

function thirdPartyPayload(form: ThirdPartyFormState) {
  return {
    romaneioNumber: form.romaneioNumber.trim(),
    supplierName: form.supplierName.trim(),
    supplierCnpj: form.supplierCnpj.trim(),
    partCode: form.partCode.trim().toUpperCase(),
    partDescription: form.partDescription.trim(),
    quantity: Number(form.quantity),
    unit: form.unit.trim().toUpperCase() || 'UN',
    processDescription: form.processDescription.trim(),
    issueDate: form.issueDate,
    expectedReturnDate: form.expectedReturnDate,
    salesOrderId: form.salesOrderId || null,
    salesOrderReference: form.salesOrderReference.trim(),
    notes: form.notes.trim()
  };
}

function filterThirdPartyItems(items: Row[], state: ThirdPartyTableState) {
  const filteredByText = filterRows(items, state.search);
  return filteredByText.filter((item) => {
    const returned = String(item.status || '') === 'Retornado';
    if (state.returnScope === 'active' && returned) return false;
    if (state.returnScope === 'returned' && !returned) return false;
    if (state.status && String(item.status || '') !== state.status) return false;
    const stage = String(item.billingStage || '');
    if (state.billingStage === 'none' && stage) return false;
    if (state.billingStage && state.billingStage !== 'none' && stage !== state.billingStage) return false;
    if (state.dateMode === 'late' && !isThirdPartyReturnLate(item)) return false;
    if (state.dateMode === 'next7' && !isThirdPartyReturnNext7(item)) return false;
    return true;
  });
}

function thirdPartyMetrics(items: Row[]) {
  return {
    total: formatInteger(items.length),
    waitingPurchase: formatInteger(items.filter((item) => String(item.status || '') === 'Aguardando pedido de compra').length),
    released: formatInteger(items.filter((item) => String(item.billingStage || '') === 'released').length),
    invoiced: formatInteger(items.filter((item) => String(item.billingStage || '') === 'invoiced').length),
    returned: formatInteger(items.filter((item) => String(item.status || '') === 'Retornado').length)
  };
}

function thirdPartyOrderLabel(order: Row) {
  return [
    order.orderNumber,
    order.customer,
    order.sku,
    [order.productLine, order.capacityTr ? `${order.capacityTr} TR` : ''].filter(Boolean).join(' ')
  ].filter(Boolean).join(' | ');
}

function thirdPartyBillingStageLabel(value: unknown) {
  const stage = String(value || '');
  if (stage === 'released') return 'Liberado faturamento';
  if (stage === 'invoiced') return 'Faturado';
  if (stage === 'loaded') return 'Enviado';
  return 'Nao liberado';
}

function thirdPartyRowClass(row: Row) {
  if (String(row.status || '') === 'Retornado') return 'row-muted';
  if (isThirdPartyReturnLate(row)) return 'row-danger';
  if (String(row.billingStage || '') === 'released') return 'row-warning';
  return '';
}

function thirdPartyStatusClass(row: Row) {
  const status = normalizeText(row.status);
  if (status.includes('retornado')) return 'returned';
  if (isThirdPartyReturnLate(row)) return 'late';
  if (status.includes('faturado')) return 'invoiced';
  if (status.includes('aguardando faturamento') || String(row.billingStage || '') === 'released') return 'released';
  return 'open';
}

function isThirdPartyReturnLate(row: Row) {
  if (String(row.status || '') === 'Retornado') return false;
  return isPastDate(String(row.expectedReturnDate || '').slice(0, 10));
}

function isThirdPartyReturnNext7(row: Row) {
  if (String(row.status || '') === 'Retornado') return false;
  const value = String(row.expectedReturnDate || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const today = dateInputValue(new Date());
  return value >= today && value <= dateInputValue(addDays(new Date(), 7));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function invoiceDocumentFromFile(file: File): Promise<InvoiceDocumentInput> {
  const allowed = new Set([
    'application/pdf',
    'application/xml',
    'text/xml',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/octet-stream'
  ]);
  const mimeType = (file.type || inferInvoiceMimeType(file.name)).toLowerCase();
  if (!allowed.has(mimeType)) {
    throw new Error(`Formato nao permitido para NF: ${file.name}`);
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error(`Nota fiscal muito grande: ${file.name}. Limite de 8 MB.`);
  }
  const dataUrl = await readFileAsDataUrl(file);
  return {
    fileName: file.name,
    mimeType,
    dataUrl: normalizeDataUrlMime(dataUrl, mimeType)
  };
}

function inferInvoiceMimeType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.xml')) return 'application/xml';
  if (lower.endsWith('.txt')) return 'text/plain';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Nao foi possivel ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function normalizeDataUrlMime(dataUrl: string, mimeType: string) {
  return dataUrl.replace(/^data:[^;]+;base64,/, `data:${mimeType};base64,`);
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName || 'nota-fiscal';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function filterRows(rows: Row[], search: string) {
  const query = normalizeText(search);
  if (!query) return rows;
  return rows.filter((row) => normalizeText(Object.values(row).join(' ')).includes(query));
}

function cellValue(row: Row, column: Column) {
  const value = row[column.key];
  return column.format ? column.format(value, row) : formatLoose(value);
}

function formatLoose(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
  if (Array.isArray(value)) return `${value.length} item(ns)`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDate(value: unknown) {
  const text = String(value || '');
  if (!/^\d{4}-\d{2}-\d{2}/.test(text)) return text || '-';
  const [year, month, day] = text.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: unknown) {
  const text = String(value || '');
  if (!text) return '-';
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return formatDate(text);
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatMonth(value: string) {
  const [year, month] = String(value || '').split('-');
  return year && month ? `${month}/${year}` : value || '-';
}

function sopAiSubtitle(analysis: Row | null, hasAnalysis: boolean) {
  if (!hasAnalysis) return 'Sem analise disponivel';
  const generatedAt = formatDateTime(analysis?.generatedAt);
  return generatedAt && generatedAt !== '-' ? `Analise gerada em ${generatedAt}` : 'Analise disponivel';
}

function formatNumber(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value === null || value === undefined || value === '' ? '-' : String(value);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(number);
}

function formatInteger(value: unknown) {
  const number = Number(value);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(Number.isFinite(number) ? Math.round(number) : 0);
}

function yesNo(value: unknown) {
  return value ? 'Sim' : 'Nao';
}

function normalizeText(value: unknown) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isPastDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function arrayCount(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function canEdit(user: CurrentUser, tab: TabKey) {
  return user.role === 'admin' || permissionListAllowsTab(user.editableTabs, tab);
}

function canView(user: CurrentUser, tab: TabKey) {
  return user.role === 'admin' || permissionListAllowsTab(user.visibleTabs, tab);
}

function permissionListAllowsTab(permissions: readonly PermissionKey[], tab: TabKey) {
  return permissions.some((permission) => permissionAccessTab(permission) === tab);
}

function permissionAccessTab(permission: PermissionKey | string): TabKey | '' {
  const value = String(permission || '');
  if (adminLegacyTabKeys().includes(value as TabKey)) return value as TabKey;
  if (!value.startsWith('screen:')) return '';
  return adminPermissionOptions.find((option) => option.key === value)?.accessTab || '';
}

function adminLegacyTabKeys(): TabKey[] {
  return ['orders', 'dashboard', 'billing', 'loading', 'thirdParty', 'pcp', 'sequencing', 'aps', 'products', 'quality', 'reports', 'ai', 'admin'];
}

async function runAction(setError: (message: string) => void, action: () => Promise<void>) {
  setError('');
  try {
    await action();
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Falha ao executar acao.');
  }
}
