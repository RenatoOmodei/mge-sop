import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent, FormEvent } from 'react';
import { api } from '../api/client';
import type { CurrentUser } from '../App';
import { IconText } from '../components/Icon';

type OrderColumnKey =
  | 'orderNumber'
  | 'commercialResponsible'
  | 'customer'
  | 'sku'
  | 'itemType'
  | 'productionOrder'
  | 'purchaseOrderNumber'
  | 'capacityTr'
  | 'productLine'
  | 'equipment'
  | 'voltage'
  | 'quantity'
  | 'leadTime'
  | 'entryDate'
  | 'originalDeliveryDate'
  | 'productionDeliveryDate'
  | 'daysLate'
  | 'finalizationDate'
  | 'status'
  | 'notes';

type SortDirection = 'asc' | 'desc';
type ColumnDragEvent = {
  preventDefault(): void;
  dataTransfer: DataTransfer;
};

type SalesOrder = {
  id: string;
  orderNumber: string;
  commercialResponsible: string;
  customer: string;
  sku: string;
  productionOrder: string;
  itemType: 'production' | 'purchased' | string;
  purchaseOrderNumber: string;
  capacityTr: number | null;
  productLine: string;
  equipment: string;
  voltage: string;
  quantity: number | null;
  leadTime: string;
  entryDate: string;
  originalDeliveryDate: string;
  productionDeliveryDate: string;
  daysLate: number | null;
  finalizationDate: string;
  notes: string;
  status: string;
  billingStage: string;
  billingReleasedAt?: string;
  billingReleasedBy?: string;
  invoicedAt?: string;
  invoicedBy?: string;
  loadedAt?: string;
  loadedBy?: string;
  invoiceNumber?: string;
  carrierName?: string;
  machineHeight?: number | null;
  machineWidth?: number | null;
  machineLength?: number | null;
  machineWeight?: number | null;
  machineGrossWeight?: number | null;
  machineVolume?: number | null;
  stages?: OrderStages;
  photoCount: number;
  pcpPendingCount: number;
  pcpPendingSummary: string;
};

type OrderStages = {
  lm?: boolean;
  serpentina?: boolean;
  mechanicalProject?: boolean;
  electricalProject?: boolean;
};

type OrderPhoto = {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  createdAt: string;
};

type QualityAlert = {
  id: string;
  orderId?: string;
  orderNumber?: string;
  customer?: string;
  productLine?: string;
  sku?: string;
  capacityTr?: number | null;
  quantity?: number | null;
  wrongDescription?: string;
  rightDescription?: string;
  status?: string;
  createdAt?: string;
};

type QualityAcknowledgement = {
  alertId: string;
  orderId: string;
};

type StatusDetail = {
  id: string;
  name: string;
  category: 'production' | 'auxiliary' | string;
  sortOrder?: number;
};

type OrdersSummary = {
  totalOrders: number;
  totalEquipment: number;
  productionMachines: number;
  averageLeadTime: number | null;
};

type OrdersPage = {
  orders: SalesOrder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: OrdersSummary;
};

type OrdersTableState = {
  search: string;
  status: string;
  scope: string;
  dueWithinDays: string;
  sortField: OrderColumnKey;
  sortDirection: SortDirection;
  pageSize: number;
  visibleColumns: OrderColumnKey[];
  columnWidths: Partial<Record<OrderColumnKey, number>>;
};

type OrderFormValues = {
  orderNumber: string;
  commercialResponsible: string;
  customer: string;
  sku: string;
  productionOrder: string;
  itemType: string;
  purchaseOrderNumber: string;
  capacityTr: string;
  productLine: string;
  equipment: string;
  voltage: string;
  quantity: string;
  entryDate: string;
  originalDeliveryDate: string;
  productionDeliveryDate: string;
  finalizationDate: string;
  notes: string;
  status: string;
};

type DimensionValues = {
  machineHeight: string;
  machineWidth: string;
  machineLength: string;
  machineWeight: string;
  machineGrossWeight: string;
  machineVolume: string;
};

type StatusDialogState = {
  orderIds: string[];
};

type OrderDialogState = {
  mode: 'new' | 'edit';
  order?: SalesOrder;
};

type OrderColumn = {
  key: OrderColumnKey;
  label: string;
  width: number;
  sort?: OrderColumnKey;
};
type ResizeStartEvent = {
  clientX: number;
  preventDefault: () => void;
  stopPropagation: () => void;
};

const MIN_COLUMN_WIDTH = 82;
const MAX_COLUMN_WIDTH = 480;

const ORDER_COLUMNS: OrderColumn[] = [
  { key: 'orderNumber', label: 'No Pedido', width: 132, sort: 'orderNumber' },
  { key: 'commercialResponsible', label: 'Responsavel comercial', width: 180, sort: 'commercialResponsible' },
  { key: 'customer', label: 'Cliente', width: 180, sort: 'customer' },
  { key: 'sku', label: 'SKU', width: 132, sort: 'sku' },
  { key: 'itemType', label: 'Tipo', width: 130, sort: 'itemType' },
  { key: 'productionOrder', label: 'OP', width: 138, sort: 'productionOrder' },
  { key: 'purchaseOrderNumber', label: 'Pedido compra', width: 150, sort: 'purchaseOrderNumber' },
  { key: 'capacityTr', label: 'Capacidade (TR)', width: 130, sort: 'capacityTr' },
  { key: 'productLine', label: 'Linha de produto', width: 168, sort: 'productLine' },
  { key: 'equipment', label: 'Equipamento', width: 175, sort: 'equipment' },
  { key: 'voltage', label: 'Tensao', width: 105, sort: 'voltage' },
  { key: 'quantity', label: 'Quantidade', width: 112, sort: 'quantity' },
  { key: 'leadTime', label: 'Lead time', width: 112, sort: 'leadTime' },
  { key: 'entryDate', label: 'Data entrada', width: 125, sort: 'entryDate' },
  { key: 'originalDeliveryDate', label: 'Entrega original', width: 150, sort: 'originalDeliveryDate' },
  { key: 'productionDeliveryDate', label: 'Entrega producao', width: 155, sort: 'productionDeliveryDate' },
  { key: 'daysLate', label: 'Dias atraso', width: 115, sort: 'daysLate' },
  { key: 'finalizationDate', label: 'Finalizacao', width: 130, sort: 'finalizationDate' },
  { key: 'status', label: 'Status', width: 178, sort: 'status' },
  { key: 'notes', label: 'Observacoes', width: 260 }
];

const columnByKey = new Map<OrderColumnKey, OrderColumn>(ORDER_COLUMNS.map((column) => [column.key, column]));
const defaultVisibleColumns = ORDER_COLUMNS.map((column) => column.key);

const defaultTableState: OrdersTableState = {
  search: '',
  status: '',
  scope: '',
  dueWithinDays: '',
  sortField: 'entryDate',
  sortDirection: 'desc',
  pageSize: 50,
  visibleColumns: defaultVisibleColumns,
  columnWidths: {}
};

const scopeOptions = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'production', label: 'Em producao' },
  { value: 'cancelled', label: 'Cancelados' },
  { value: 'completed', label: 'Concluidos' }
];

const stageOptions: Array<{ key: keyof OrderStages; label: string }> = [
  { key: 'lm', label: 'LM' },
  { key: 'serpentina', label: 'Serpentina' },
  { key: 'mechanicalProject', label: 'Projeto Mecanico' },
  { key: 'electricalProject', label: 'Projeto Eletrico' }
];

const dimensionFields: Array<{ name: keyof DimensionValues; label: string }> = [
  { name: 'machineHeight', label: 'Altura' },
  { name: 'machineWidth', label: 'Largura' },
  { name: 'machineLength', label: 'Comprimento' },
  { name: 'machineWeight', label: 'Peso liquido' },
  { name: 'machineGrossWeight', label: 'Peso bruto' },
  { name: 'machineVolume', label: 'Volume' }
];

type QualityMatchResult = {
  red: QualityAlert[];
  yellow: QualityAlert[];
  all: QualityAlert[];
};

export function OrdersScreen({ user, realtimeRefreshKey = 0 }: { user: CurrentUser; realtimeRefreshKey?: number }) {
  const [tableState, setTableState] = useState<OrdersTableState>(() => loadOrdersTableState(user.id));
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [statusDetails, setStatusDetails] = useState<StatusDetail[]>([]);
  const [productionStatuses, setProductionStatuses] = useState<string[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [qualityAcknowledgements, setQualityAcknowledgements] = useState<QualityAcknowledgement[]>([]);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferenceStatus, setPreferenceStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [orderDialog, setOrderDialog] = useState<OrderDialogState | null>(null);
  const [statusDialog, setStatusDialog] = useState<StatusDialogState | null>(null);
  const [dimensionsDialogOrder, setDimensionsDialogOrder] = useState<SalesOrder | null>(null);
  const [documentsDialogOrder, setDocumentsDialogOrder] = useState<SalesOrder | null>(null);
  const [qualityNoticeOrder, setQualityNoticeOrder] = useState<SalesOrder | null>(null);
  const [dragColumnKey, setDragColumnKey] = useState<OrderColumnKey | null>(null);
  const [dragOverColumnKey, setDragOverColumnKey] = useState<OrderColumnKey | null>(null);
  const [releaseBusyId, setReleaseBusyId] = useState('');
  const [actionBusy, setActionBusy] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedTableState = useDebouncedValue(tableState, 260);
  const topScrollbarRef = useRef<HTMLDivElement | null>(null);
  const topScrollbarInnerRef = useRef<HTMLDivElement | null>(null);
  const tableWrapRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const syncingScrollRef = useRef(false);
  const canEditOrders = user.role === 'admin' || user.canEditOrders || user.editableTabs.includes('orders');
  const visibleColumns = tableState.visibleColumns
    .map((key) => columnByKey.get(key))
    .filter(Boolean)
    .map((column) => ({ ...column!, width: columnWidthFor(column!.key, tableState.columnWidths) })) as OrderColumn[];
  const firstColumnWidth = visibleColumns[0]?.width || 0;
  const tableMinWidth = visibleColumns.reduce((sum, column) => sum + column.width, 120);
  const selectedOrders = useMemo(() => orders.filter((order) => selectedIds.has(order.id)), [orders, selectedIds]);
  const selectedCount = selectedIds.size;

  useEffect(() => {
    let ignore = false;
    Promise.all([
      api<{ statuses: string[]; statusDetails: StatusDetail[]; productionStatuses: string[] }>('/api/status-values'),
      api<{ customers: string[] }>('/api/customers').catch(() => ({ customers: [] }))
    ])
      .then(([data, customerData]) => {
        if (ignore) return;
        setStatuses(data.statuses || []);
        setStatusDetails(data.statusDetails || []);
        setProductionStatuses(data.productionStatuses || []);
        setCustomers(customerData.customers || []);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [user.id, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    api<{ alerts: QualityAlert[]; acknowledgements: QualityAcknowledgement[] }>('/api/quality/alerts')
      .then((data) => {
        if (ignore) return;
        setQualityAlerts(data.alerts || []);
        setQualityAcknowledgements(data.acknowledgements || []);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [refreshKey, realtimeRefreshKey]);

  useEffect(() => {
    let ignore = false;
    api<{ value: Partial<OrdersTableState> }>('/api/preferences/ordersTableState')
      .then(({ value }) => {
        if (ignore) return;
        setTableState(normalizeTableState(value));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!ignore) setPreferencesReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [user.id]);

  useEffect(() => {
    if (!preferencesReady) return;

    setPreferenceStatus('Salvando filtros...');
    const timer = window.setTimeout(() => {
      writeLocalTableState(user.id, tableState);
      api('/api/preferences/ordersTableState', {
        method: 'PUT',
        body: { value: tableState }
      })
        .then(() => setPreferenceStatus('Preferencias salvas para seu usuario'))
        .catch(() => setPreferenceStatus('Preferencias salvas apenas neste computador'));
    }, 500);

    return () => window.clearTimeout(timer);
  }, [preferencesReady, tableState, user.id]);

  useEffect(() => {
    if (!preferencesReady) return;

    let ignore = false;
    const params = new URLSearchParams();
    if (debouncedTableState.search) params.set('search', debouncedTableState.search);
    if (debouncedTableState.status) params.set('status', debouncedTableState.status);
    if (debouncedTableState.scope) params.set('scope', debouncedTableState.scope);
    if (debouncedTableState.dueWithinDays) params.set('dueWithinDays', debouncedTableState.dueWithinDays);
    params.set('sort', debouncedTableState.sortField);
    params.set('direction', debouncedTableState.sortDirection);
    params.set('page', String(page));
    params.set('pageSize', String(debouncedTableState.pageSize));

    setLoading(true);
    setError('');
    api<OrdersPage>(`/api/orders?${params.toString()}`)
      .then((data) => {
        if (ignore) return;
        const nextTotalPages = Math.max(1, Number(data.totalPages) || 1);
        setOrders(data.orders || []);
        setTotal(Number(data.total) || 0);
        setTotalPages(nextTotalPages);
        setSummary(data.summary || null);
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
  }, [preferencesReady, debouncedTableState, page, refreshKey, realtimeRefreshKey]);

  useEffect(() => {
    syncTopScrollbar();
    window.addEventListener('resize', syncTopScrollbar);
    return () => window.removeEventListener('resize', syncTopScrollbar);
  }, [orders, visibleColumns.length, tableMinWidth]);

  useEffect(() => {
    setSelectedIds((current) => {
      const visibleIds = new Set(orders.map((order) => order.id));
      const next = new Set([...current].filter((id) => visibleIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [orders]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) setRefreshKey((value) => value + 1);
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const productionSet = useMemo(() => new Set(productionStatuses), [productionStatuses]);
  const statusCategoryByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const status of statusDetails) {
      map.set(status.name, status.category);
    }
    return map;
  }, [statusDetails]);

  function updateTableState(patch: Partial<OrdersTableState>) {
    setPage(1);
    setTableState((current) => normalizeTableState({ ...current, ...patch }));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    updateTableState({ [event.target.name]: event.target.value } as Partial<OrdersTableState>);
  }

  function handleSort(column: OrderColumn) {
    if (!column.sort) return;
    updateTableState({
      sortField: column.sort,
      sortDirection:
        tableState.sortField === column.sort && tableState.sortDirection === 'asc' ? 'desc' : 'asc'
    });
  }

  function resetFilters() {
    updateTableState({
      search: '',
      status: '',
      scope: '',
      dueWithinDays: '',
      sortField: 'entryDate',
      sortDirection: 'desc'
    });
  }

  function toggleColumn(key: OrderColumnKey) {
    if (key === 'orderNumber') return;
    setTableState((current) => {
      const visibleColumns = current.visibleColumns.includes(key)
        ? current.visibleColumns.filter((item) => item !== key)
        : [...current.visibleColumns, key];
      return normalizeTableState({ ...current, visibleColumns });
    });
  }

  function moveColumnTo(key: OrderColumnKey, targetKey: OrderColumnKey) {
    if (key === 'orderNumber' || targetKey === 'orderNumber' || key === targetKey) return;
    setTableState((current) => {
      const visibleColumns = [...current.visibleColumns];
      const index = visibleColumns.indexOf(key);
      const targetIndex = visibleColumns.indexOf(targetKey);
      if (index <= 0 || targetIndex <= 0 || targetIndex >= visibleColumns.length) return current;
      const [movedColumn] = visibleColumns.splice(index, 1);
      visibleColumns.splice(targetIndex, 0, movedColumn);
      return normalizeTableState({ ...current, visibleColumns });
    });
  }

  function startColumnDrag(column: OrderColumn, event: ColumnDragEvent) {
    if (column.key === 'orderNumber') {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', column.key);
    setDragColumnKey(column.key);
    setDragOverColumnKey(null);
  }

  function handleColumnDragOver(column: OrderColumn, event: ColumnDragEvent) {
    if (!dragColumnKey || column.key === 'orderNumber' || column.key === dragColumnKey) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverColumnKey(column.key);
  }

  function handleColumnDrop(column: OrderColumn, event: ColumnDragEvent) {
    event.preventDefault();
    const dataKey = event.dataTransfer.getData('text/plain');
    const sourceKey = columnByKey.has(dataKey as OrderColumnKey) ? dataKey as OrderColumnKey : dragColumnKey;
    if (sourceKey) moveColumnTo(sourceKey, column.key);
    finishColumnDrag();
  }

  function finishColumnDrag() {
    setDragColumnKey(null);
    setDragOverColumnKey(null);
  }

  function setColumnWidth(key: OrderColumnKey, value: unknown) {
    setTableState((current) => normalizeTableState({
      ...current,
      columnWidths: {
        ...current.columnWidths,
        [key]: clampColumnWidth(key, value)
      }
    }));
  }

  function resetColumnLayout() {
    setTableState((current) => normalizeTableState({
      ...current,
      visibleColumns: defaultVisibleColumns,
      columnWidths: {}
    }));
  }

  function startColumnResize(column: OrderColumn, event: ResizeStartEvent) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = column.width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setColumnWidth(column.key, startWidth + moveEvent.clientX - startX);
    };
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function replaceOrder(updated: SalesOrder) {
    setOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    setSelectedOrder((current) => (current?.id === updated.id ? updated : current));
    setDimensionsDialogOrder((current) => (current?.id === updated.id ? updated : current));
    setDocumentsDialogOrder((current) => (current?.id === updated.id ? updated : current));
  }

  function refreshOrders() {
    setRefreshKey((value) => value + 1);
  }

  function selectedOrderOrError(action: string) {
    if (selectedOrders.length !== 1) {
      setError(`Selecione exatamente um pedido para ${action}.`);
      return null;
    }
    setError('');
    return selectedOrders[0];
  }

  function toggleOrderSelection(orderId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }

  function toggleVisibleSelection(checked: boolean) {
    setSelectedIds(() => {
      if (!checked) return new Set();
      return new Set(orders.map((order) => order.id));
    });
  }

  function openEditSelectedOrder() {
    if (!canEditOrders) return;
    const order = selectedOrderOrError('editar');
    if (order) {
      setDialogError('');
      setOrderDialog({ mode: 'edit', order });
    }
  }

  function openStatusForSelected() {
    if (!canEditOrders) return;
    if (!selectedOrders.length) {
      setError('Selecione pelo menos um pedido para alterar status.');
      return;
    }
    setError('');
    setDialogError('');
    setStatusDialog({ orderIds: selectedOrders.map((order) => order.id) });
  }

  function openDimensionsForSelected() {
    if (!canEditOrders) return;
    const order = selectedOrderOrError('informar dimensional');
    if (order) {
      setDialogError('');
      setDimensionsDialogOrder(order);
    }
  }

  function openDocumentsForSelected() {
    const order = selectedOrderOrError('abrir documentos');
    if (order) {
      setDialogError('');
      setDocumentsDialogOrder(order);
    }
  }

  async function saveOrder(values: OrderFormValues) {
    if (!canEditOrders) return;
    setActionBusy('order');
    setDialogError('');
    try {
      const body = orderFormPayload(values);
      const editing = orderDialog?.mode === 'edit' && orderDialog.order;
      const result = await api<{ order: SalesOrder }>(
        editing ? `/api/orders/${encodeURIComponent(orderDialog.order!.id)}` : '/api/orders',
        {
          method: editing ? 'PUT' : 'POST',
          body
        }
      );
      if (editing) {
        replaceOrder(result.order);
      } else {
        refreshOrders();
      }
      setOrderDialog(null);
      setSelectedIds(new Set(result.order ? [result.order.id] : []));
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Falha ao salvar pedido.');
    } finally {
      setActionBusy('');
    }
  }

  async function deleteOrder(order: SalesOrder) {
    if (!canEditOrders) return;
    if (!window.confirm(`Excluir o pedido ${order.orderNumber || order.id}?`)) return;
    setActionBusy('order-delete');
    setDialogError('');
    try {
      await api(`/api/orders/${encodeURIComponent(order.id)}`, { method: 'DELETE' });
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(order.id);
        return next;
      });
      setSelectedOrder((current) => (current?.id === order.id ? null : current));
      setOrderDialog(null);
      refreshOrders();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Falha ao excluir pedido.');
    } finally {
      setActionBusy('');
    }
  }

  async function saveStatusChange({ status, allowStatusDeviation, statusDeviationReason }: { status: string; allowStatusDeviation: boolean; statusDeviationReason: string }) {
    if (!canEditOrders) return;
    if (!statusDialog?.orderIds.length) return;
    setActionBusy('status');
    setDialogError('');
    try {
      const updatedOrders: SalesOrder[] = [];
      for (const orderId of statusDialog.orderIds) {
        const result = await api<{ order: SalesOrder }>(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          body: { status, allowStatusDeviation, statusDeviationReason }
        });
        updatedOrders.push(result.order);
      }
      updatedOrders.forEach(replaceOrder);
      setStatusDialog(null);
      refreshOrders();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Falha ao alterar status.');
    } finally {
      setActionBusy('');
    }
  }

  async function updateProductionOrderForSelected() {
    if (!canEditOrders) return;
    const order = selectedOrderOrError('inserir OP');
    if (!order) return;
    const productionOrder = window.prompt('Informe o numero da OP:', order.productionOrder || '');
    if (productionOrder === null) return;
    await patchSingleField(order, 'production-order', { productionOrder: productionOrder.trim().toUpperCase() }, 'OP');
  }

  async function updatePurchaseOrderForSelected() {
    if (!canEditOrders) return;
    const order = selectedOrderOrError('inserir pedido de compra');
    if (!order) return;
    const purchaseOrderNumber = window.prompt('Informe o numero do pedido de compra:', order.purchaseOrderNumber || '');
    if (purchaseOrderNumber === null) return;
    await patchSingleField(order, 'purchase-order', { purchaseOrderNumber: purchaseOrderNumber.trim().toUpperCase() }, 'pedido de compra');
  }

  async function patchSingleField(order: SalesOrder, endpoint: string, body: Record<string, unknown>, label: string) {
    if (!canEditOrders) return;
    setActionBusy(endpoint);
    setError('');
    try {
      const result = await api<{ order: SalesOrder }>(`/api/orders/${encodeURIComponent(order.id)}/${endpoint}`, {
        method: 'PATCH',
        body
      });
      replaceOrder(result.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Falha ao atualizar ${label}.`);
    } finally {
      setActionBusy('');
    }
  }

  async function saveDimensions(orderId: string, values: DimensionValues) {
    if (!canEditOrders) return;
    setActionBusy('dimensions');
    setDialogError('');
    try {
      const result = await api<{ order: SalesOrder }>(`/api/orders/${encodeURIComponent(orderId)}/billing-dimensions`, {
        method: 'PATCH',
        body: dimensionPayload(values)
      });
      replaceOrder(result.order);
      setDimensionsDialogOrder(null);
      refreshOrders();
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Falha ao salvar dimensionais.');
    } finally {
      setActionBusy('');
    }
  }

  async function updateOrderStages(order: SalesOrder, stages: OrderStages) {
    if (!canEditOrders) return;
    setActionBusy(`stages-${order.id}`);
    setDialogError('');
    try {
      const result = await api<{ order: SalesOrder }>(`/api/orders/${encodeURIComponent(order.id)}/stages`, {
        method: 'PATCH',
        body: { stages }
      });
      replaceOrder(result.order);
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Falha ao salvar etapas.');
    } finally {
      setActionBusy('');
    }
  }

  async function acknowledgeQualityAlert(alertId: string, orderId: string) {
    setActionBusy(`quality-${alertId}`);
    setDialogError('');
    try {
      const result = await api<{ acknowledgement: QualityAcknowledgement }>(`/api/quality/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
        method: 'POST',
        body: { orderId }
      });
      setQualityAcknowledgements((current) => [...current.filter((item) => !(item.alertId === alertId && item.orderId === orderId)), result.acknowledgement]);
    } catch (err) {
      setDialogError(err instanceof Error ? err.message : 'Falha ao registrar ciencia.');
    } finally {
      setActionBusy('');
    }
  }

  function syncTopScrollbar() {
    if (!tableRef.current || !tableWrapRef.current || !topScrollbarInnerRef.current || !topScrollbarRef.current) return;
    const width = Math.max(tableRef.current.scrollWidth, tableWrapRef.current.scrollWidth);
    topScrollbarInnerRef.current.style.width = `${width}px`;
    topScrollbarRef.current.scrollLeft = tableWrapRef.current.scrollLeft;
  }

  function syncScroll(source: HTMLDivElement | null, target: HTMLDivElement | null) {
    if (!source || !target || syncingScrollRef.current) return;
    syncingScrollRef.current = true;
    target.scrollLeft = source.scrollLeft;
    window.requestAnimationFrame(() => {
      syncingScrollRef.current = false;
    });
  }

  async function releaseBilling(order: SalesOrder) {
    if (!canEditOrders) return;
    setReleaseBusyId(order.id);
    setError('');
    try {
      await api<{ order: SalesOrder }>(`/api/orders/${encodeURIComponent(order.id)}/release-billing`, {
        method: 'PATCH'
      });
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao liberar faturamento.');
    } finally {
      setReleaseBusyId('');
    }
  }

  function exportCurrentPage() {
    const rows = [
      visibleColumns.map((column) => column.label),
      ...orders.map((order) => visibleColumns.map((column) => orderCellText(order, column.key)))
    ];
    const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos-venda-react-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const allVisibleSelected = orders.length > 0 && orders.every((order) => selectedIds.has(order.id));

  return (
    <section className="orders-react">
      <section className="dashboard-grid react-orders-summary" aria-label="Resumo de pedidos">
        <article>
          <span>Pedidos de venda</span>
          <strong>{formatInteger(summary?.totalOrders ?? total)}</strong>
        </article>
        <article>
          <span>Equipamentos em pedidos</span>
          <strong>{formatInteger(summary?.totalEquipment ?? sumQuantity(orders))}</strong>
        </article>
        <article>
          <span>Lead time medio</span>
          <strong>{summary?.averageLeadTime === null || summary?.averageLeadTime === undefined ? '-' : `${formatNumber(summary.averageLeadTime)} dias`}</strong>
        </article>
        <article>
          <span>Maquinas em producao</span>
          <strong>{formatInteger(summary?.productionMachines ?? sumQuantity(orders.filter((order) => productionSet.has(order.status))))}</strong>
        </article>
      </section>

      <section className="orders-toolbar" aria-label="Filtros de pedidos">
        <label className="field search-field">
          <span>Pesquisar</span>
          <input
            className="input"
            name="search"
            type="search"
            value={tableState.search}
            onChange={handleInputChange}
            placeholder="Pedido, cliente, SKU, OP, pedido de compra ou equipamento"
          />
        </label>
        <label className="field">
          <span>Status</span>
          <select className="input" name="status" value={tableState.status} onChange={handleInputChange}>
            <option value="">Todos</option>
            {tableState.status && !statuses.includes(tableState.status) && <option value={tableState.status}>{tableState.status}</option>}
            {statuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Situacao</span>
          <select className="input" name="scope" value={tableState.scope} onChange={handleInputChange}>
            {scopeOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Vencem em</span>
          <input
            className="input"
            name="dueWithinDays"
            type="number"
            min="0"
            step="1"
            value={tableState.dueWithinDays}
            onChange={handleInputChange}
            placeholder="7 dias"
          />
        </label>
        <label className="field compact-field">
          <span>Linhas</span>
          <select
            className="input"
            name="pageSize"
            value={tableState.pageSize}
            onChange={(event) => updateTableState({ pageSize: Number(event.target.value) || 50 })}
          >
            {[25, 50, 100, 200].map((size) => (
              <option value={size} key={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <button className="btn" type="button" onClick={resetFilters}>
          <IconText name="filter">Limpar</IconText>
        </button>
        <button className="btn" type="button" onClick={() => setRefreshKey((value) => value + 1)}>
          <IconText name="refresh">Atualizar</IconText>
        </button>
        <button className="btn" type="button" onClick={exportCurrentPage} disabled={!orders.length}>
          <IconText name="download">Exportar pagina</IconText>
        </button>
        {canEditOrders && (
          <>
            <button className="btn primary" type="button" onClick={() => {
              setDialogError('');
              setOrderDialog({ mode: 'new' });
            }}>
              <IconText name="plus">Novo pedido</IconText>
            </button>
            <button className="btn" type="button" onClick={openEditSelectedOrder} disabled={selectedCount !== 1}>
              <IconText name="edit">Editar</IconText>
            </button>
            <button className="btn" type="button" onClick={openStatusForSelected} disabled={!selectedCount}>
              <IconText name="status">Status</IconText>
            </button>
            <button className="btn" type="button" onClick={updateProductionOrderForSelected} disabled={selectedCount !== 1 || actionBusy === 'production-order'}>
              <IconText name="box">OP</IconText>
            </button>
            <button className="btn" type="button" onClick={updatePurchaseOrderForSelected} disabled={selectedCount !== 1 || actionBusy === 'purchase-order'}>
              <IconText name="file">PC</IconText>
            </button>
            <button className="btn" type="button" onClick={openDimensionsForSelected} disabled={selectedCount !== 1}>
              <IconText name="ruler">Dimensional</IconText>
            </button>
          </>
        )}
        <button className="btn" type="button" onClick={openDocumentsForSelected} disabled={selectedCount !== 1}>
          <IconText name="file">Documentos</IconText>
        </button>
      </section>

      <section className="table-panel orders-table-panel">
        <div className="table-header">
          <span>
            <strong>{formatInteger(total)}</strong> {total === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
            {selectedCount > 0 && <em className="selected-counter"> | {formatInteger(selectedCount)} selecionado(s)</em>}
          </span>
          <span className="table-header-status">
            {loading ? 'Carregando...' : preferenceStatus || 'Preferencias por usuario'}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="table-scrollbar" ref={topScrollbarRef} onScroll={() => syncScroll(topScrollbarRef.current, tableWrapRef.current)}>
          <div ref={topScrollbarInnerRef} />
        </div>

        <div className="orders-table-wrap" ref={tableWrapRef} onScroll={() => syncScroll(tableWrapRef.current, topScrollbarRef.current)}>
          <table className="orders-fast-table" ref={tableRef} style={{ minWidth: tableMinWidth + 118 }}>
            <thead>
              <tr>
                {visibleColumns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`${stickyClass(index)} ${column.key !== 'orderNumber' ? 'draggable-column' : ''} ${dragColumnKey === column.key ? 'column-dragging' : ''} ${dragOverColumnKey === column.key ? 'column-drop-target' : ''}`.trim()}
                    style={stickyStyle(index, column, firstColumnWidth)}
                    title={column.sort ? 'Clique para classificar' : column.label}
                    draggable={column.key !== 'orderNumber'}
                    onDragStart={(event) => startColumnDrag(column, event)}
                    onDragOver={(event) => handleColumnDragOver(column, event)}
                    onDragLeave={() => setDragOverColumnKey((current) => current === column.key ? null : current)}
                    onDrop={(event) => handleColumnDrop(column, event)}
                    onDragEnd={finishColumnDrag}
                  >
                    {column.key === 'orderNumber' ? (
                      <span className="order-header-select">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          aria-label="Selecionar todos os pedidos visiveis"
                          onChange={(event) => toggleVisibleSelection(event.target.checked)}
                        />
                        <button
                          className={`sort-button ${tableState.sortField === column.sort ? 'active' : ''}`}
                          data-direction={tableState.sortField === column.sort ? tableState.sortDirection : ''}
                          type="button"
                          onClick={() => handleSort(column)}
                        >
                          {column.label}
                        </button>
                      </span>
                    ) : column.sort ? (
                      <button
                        className={`sort-button ${tableState.sortField === column.sort ? 'active' : ''}`}
                        data-direction={tableState.sortField === column.sort ? tableState.sortDirection : ''}
                        type="button"
                        onClick={() => handleSort(column)}
                      >
                        {column.label}
                      </button>
                    ) : (
                      <span>{column.label}</span>
                    )}
                    <button
                      className="column-resize-handle"
                      type="button"
                      aria-label={`Ajustar largura da coluna ${column.label}`}
                      draggable={false}
                      onMouseDown={(event) => startColumnResize(column, event)}
                      onDragStart={(event) => event.preventDefault()}
                    />
                  </th>
                ))}
                <th className="actions-col">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr className={orderRowClass(order, productionSet)} key={order.id} onClick={(event) => {
                  if ((event.target as HTMLElement).closest('button, input, a, summary')) return;
                  setSelectedOrder(order);
                }}>
                  {visibleColumns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`${stickyClass(index)} ${cellClass(order, column.key)}`}
                      style={stickyStyle(index, column, firstColumnWidth)}
                      title={orderCellText(order, column.key)}
                      data-label={column.label}
                    >
                      {column.key === 'orderNumber' ? (
                        <OrderNumberCell
                          order={order}
                          selected={selectedIds.has(order.id)}
                          qualityMatches={qualityMatchesForOrder(order, qualityAlerts, qualityAcknowledgements)}
                          onSelect={(checked) => toggleOrderSelection(order.id, checked)}
                          onQualityClick={() => setQualityNoticeOrder(order)}
                        />
                      ) : column.key === 'status' ? (
                        <OrderStatusCell
                          order={order}
                          statusCategory={statusCategoryByName.get(order.status)}
                          onDocumentsClick={() => setDocumentsDialogOrder(order)}
                        />
                      ) : orderCellContent(order, column.key, statusCategoryByName)}
                    </td>
                  ))}
                  <td className="actions-cell" data-label="Acoes">
                    {canEditOrders && canReleaseBilling(order) ? (
                      <button className="btn primary" type="button" disabled={releaseBusyId === order.id} onClick={() => releaseBilling(order)}>
                        <IconText name="check">{releaseBusyId === order.id ? 'Liberando...' : 'Liberar fat.'}</IconText>
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {!orders.length && !loading && (
                <tr>
                  <td className="empty" colSpan={visibleColumns.length + 1}>
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td className="empty" colSpan={visibleColumns.length + 1}>
                    Carregando pedidos...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-mobile-list" aria-label="Pedidos de venda em cards">
          {orders.map((order) => (
            <OrderMobileCard
              key={order.id}
              order={order}
              selected={selectedIds.has(order.id)}
              canEditOrders={canEditOrders}
              canRelease={canReleaseBilling(order)}
              releaseBusy={releaseBusyId === order.id}
              rowClass={orderRowClass(order, productionSet)}
              statusCategory={statusCategoryByName.get(order.status)}
              qualityMatches={qualityMatchesForOrder(order, qualityAlerts, qualityAcknowledgements)}
              onSelect={(checked) => toggleOrderSelection(order.id, checked)}
              onOpen={() => setSelectedOrder(order)}
              onDocuments={() => setDocumentsDialogOrder(order)}
              onQuality={() => setQualityNoticeOrder(order)}
              onRelease={() => releaseBilling(order)}
            />
          ))}
          {!orders.length && !loading && <p className="empty mobile-empty">Nenhum pedido encontrado.</p>}
          {loading && <p className="empty mobile-empty">Carregando pedidos...</p>}
        </div>

        <div className="orders-pagination">
          <button className="btn" type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <IconText name="history">Anterior</IconText>
          </button>
          <span>
            Pagina {formatInteger(page)} de {formatInteger(totalPages)}
          </span>
          <button className="btn" type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
            <IconText name="history">Proxima</IconText>
          </button>
        </div>
      </section>

      {selectedOrder && (
        <OrderSummaryDialog
          order={selectedOrder}
          canEditOrders={canEditOrders}
          onClose={() => setSelectedOrder(null)}
          onEdit={() => {
            setDialogError('');
            setOrderDialog({ mode: 'edit', order: selectedOrder });
          }}
          onStatus={() => {
            setDialogError('');
            setStatusDialog({ orderIds: [selectedOrder.id] });
          }}
          onDimensions={() => {
            setDialogError('');
            setDimensionsDialogOrder(selectedOrder);
          }}
          onDocuments={() => {
            setDialogError('');
            setDocumentsDialogOrder(selectedOrder);
          }}
          onStageChange={(stages) => updateOrderStages(selectedOrder, stages)}
          stageBusy={actionBusy === `stages-${selectedOrder.id}`}
          error={dialogError}
          onRelease={canReleaseBilling(selectedOrder) ? async () => {
            await releaseBilling(selectedOrder);
            setSelectedOrder(null);
          } : undefined}
          releaseBusy={releaseBusyId === selectedOrder.id}
        />
      )}
      {orderDialog && (
        <OrderFormDialog
          mode={orderDialog.mode}
          order={orderDialog.order}
          statuses={statuses}
          customers={customers}
          busy={actionBusy === 'order' || actionBusy === 'order-delete'}
          error={dialogError}
          onClose={() => setOrderDialog(null)}
          onSubmit={saveOrder}
          onDelete={orderDialog.mode === 'edit' && orderDialog.order ? () => deleteOrder(orderDialog.order!) : undefined}
        />
      )}
      {statusDialog && (
        <StatusChangeDialog
          orders={orders.filter((order) => statusDialog.orderIds.includes(order.id))}
          statuses={statuses}
          busy={actionBusy === 'status'}
          error={dialogError}
          onClose={() => setStatusDialog(null)}
          onSubmit={saveStatusChange}
        />
      )}
      {dimensionsDialogOrder && (
        <DimensionsDialog
          order={dimensionsDialogOrder}
          orders={orders}
          busy={actionBusy === 'dimensions'}
          error={dialogError}
          onClose={() => setDimensionsDialogOrder(null)}
          onSubmit={saveDimensions}
        />
      )}
      {documentsDialogOrder && (
        <DocumentsDialog
          order={documentsDialogOrder}
          canEditOrders={canEditOrders}
          onClose={() => setDocumentsDialogOrder(null)}
          onChanged={refreshOrders}
        />
      )}
      {qualityNoticeOrder && (
        <QualityNoticeDialog
          order={qualityNoticeOrder}
          matches={qualityMatchesForOrder(qualityNoticeOrder, qualityAlerts, qualityAcknowledgements)}
          busyId={actionBusy}
          error={dialogError}
          onClose={() => setQualityNoticeOrder(null)}
          onAcknowledge={acknowledgeQualityAlert}
        />
      )}
    </section>
  );
}

function OrderSummaryDialog({
  order,
  canEditOrders,
  onClose,
  onEdit,
  onStatus,
  onDimensions,
  onDocuments,
  onStageChange,
  stageBusy,
  error,
  onRelease,
  releaseBusy
}: {
  order: SalesOrder;
  canEditOrders: boolean;
  onClose: () => void;
  onEdit: () => void;
  onStatus: () => void;
  onDimensions: () => void;
  onDocuments: () => void;
  onStageChange: (stages: OrderStages) => void | Promise<void>;
  stageBusy: boolean;
  error: string;
  onRelease?: () => void | Promise<void>;
  releaseBusy: boolean;
}) {
  const stages = order.stages || {};

  return (
    <div className="dialog-backdrop open" role="dialog" aria-modal="true" aria-labelledby="orderSummaryTitle" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="dialog order-summary-dialog">
        <div className="dialog-header">
          <div>
            <h2 id="orderSummaryTitle">Pedido {order.orderNumber || '-'}</h2>
            <span className="order-summary-subtitle">{order.customer || 'Cliente nao informado'} | {order.sku || 'SKU nao informado'}</span>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>
            x
          </button>
        </div>
        <div className="dialog-body order-summary-body">
          <div className="order-summary-status">
            <span>Status atual</span>
            <strong className={`status ${statusClass(order.status)}`}>{order.status || '-'}</strong>
          </div>
          <div className="order-summary-grid">
            <SummaryItem label="Responsavel comercial" value={order.commercialResponsible} />
            <SummaryItem label="Tipo" value={itemTypeLabel(order.itemType)} />
            <SummaryItem label="Equipamento" value={order.equipment} />
            <SummaryItem label="Linha de produto" value={order.productLine} />
            <SummaryItem label="Quantidade" value={formatNumber(order.quantity)} />
            <SummaryItem label="Capacidade (TR)" value={formatNumber(order.capacityTr)} />
            <SummaryItem label="OP" value={order.productionOrder} />
            <SummaryItem label="Pedido compra" value={order.purchaseOrderNumber} />
            <SummaryItem label="Entrada" value={formatDate(order.entryDate)} />
            <SummaryItem label="Entrega original" value={formatDate(order.originalDeliveryDate)} />
            <SummaryItem label="Entrega producao" value={formatDate(order.productionDeliveryDate)} />
            <SummaryItem label="Dias em atraso" value={formatInteger(order.daysLate)} />
          </div>
          <div className="order-summary-notes">
            <span>Observacoes</span>
            <p>{order.notes || '-'}</p>
          </div>
          {order.pcpPendingCount > 0 && (
            <div className="order-summary-notes warning">
              <span>Pendencias PCP</span>
              <p>{order.pcpPendingSummary || `${order.pcpPendingCount} pendencia(s) aberta(s).`}</p>
            </div>
          )}
          <div className="order-summary-notes">
            <span>Etapas concluidas</span>
            <div className="stage-check-grid">
              {stageOptions.map((stage) => (
                <label key={stage.key}>
                  <input
                    type="checkbox"
                    checked={Boolean(stages[stage.key])}
                    disabled={!canEditOrders || stageBusy}
                    onChange={(event) => onStageChange({ ...stages, [stage.key]: event.target.checked })}
                  />
                  <strong>{stage.label}</strong>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="dialog-actions">
          {canEditOrders && (
            <>
              <button className="btn" type="button" onClick={onEdit}>
                <IconText name="edit">Editar</IconText>
              </button>
              <button className="btn" type="button" onClick={onStatus}>
                <IconText name="status">Status</IconText>
              </button>
              <button className="btn" type="button" onClick={onDimensions}>
                <IconText name="ruler">Dimensional</IconText>
              </button>
            </>
          )}
          <button className="btn" type="button" onClick={onDocuments}>
            <IconText name="file">Documentos</IconText>
          </button>
          {canEditOrders && onRelease && (
            <button className="btn primary" type="button" disabled={releaseBusy} onClick={onRelease}>
              <IconText name="check">{releaseBusy ? 'Liberando...' : 'Liberar faturamento'}</IconText>
            </button>
          )}
          <button className="btn" type="button" onClick={onClose}>
            <IconText name="close">Fechar</IconText>
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="order-summary-item">
      <span>{label}</span>
      <strong>{value === null || value === undefined || value === '' ? '-' : value}</strong>
    </div>
  );
}

function OrderMobileCard({
  order,
  selected,
  canEditOrders,
  canRelease,
  releaseBusy,
  rowClass,
  statusCategory,
  qualityMatches,
  onSelect,
  onOpen,
  onDocuments,
  onQuality,
  onRelease
}: {
  order: SalesOrder;
  selected: boolean;
  canEditOrders: boolean;
  canRelease: boolean;
  releaseBusy: boolean;
  rowClass: string;
  statusCategory?: string;
  qualityMatches: QualityMatchResult;
  onSelect: (checked: boolean) => void;
  onOpen: () => void;
  onDocuments: () => void;
  onQuality: () => void;
  onRelease: () => void;
}) {
  return (
    <article className={`order-mobile-card ${rowClass}`} onClick={onOpen}>
      <header className="order-mobile-header">
        <label className="order-mobile-select" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            aria-label={`Selecionar pedido ${order.orderNumber || order.id}`}
            onChange={(event) => onSelect(event.target.checked)}
          />
          <strong>{order.orderNumber || '-'}</strong>
        </label>
        <OrderStatusCell order={order} statusCategory={statusCategory} onDocumentsClick={onDocuments} />
      </header>

      <div className="order-mobile-subtitle">
        <span>{order.customer || 'Cliente nao informado'}</span>
        <span>{itemTypeLabel(order.itemType)}</span>
      </div>

      <div className="order-mobile-alerts">
        {order.pcpPendingCount > 0 && <span className="mobile-alert-chip pcp">PCP: {order.pcpPendingSummary || `${order.pcpPendingCount} pendencia(s)`}</span>}
        {qualityMatches.red.length > 0 && <button className="mobile-alert-chip quality critical" type="button" onClick={(event) => {
          event.stopPropagation();
          onQuality();
        }}>Alerta qualidade SKU</button>}
        {!qualityMatches.red.length && qualityMatches.yellow.length > 0 && <button className="mobile-alert-chip quality warning" type="button" onClick={(event) => {
          event.stopPropagation();
          onQuality();
        }}>Alerta qualidade relacionado</button>}
      </div>

      <dl className="order-mobile-grid">
        <div>
          <dt>SKU</dt>
          <dd>{order.sku || '-'}</dd>
        </div>
        <div>
          <dt>OP</dt>
          <dd>{order.productionOrder || 'Sem OP'}</dd>
        </div>
        <div>
          <dt>PC</dt>
          <dd>{order.purchaseOrderNumber || '-'}</dd>
        </div>
        <div>
          <dt>Linha</dt>
          <dd>{order.productLine || '-'}</dd>
        </div>
        <div>
          <dt>Capacidade</dt>
          <dd>{formatNumber(order.capacityTr)} TR</dd>
        </div>
        <div>
          <dt>Qtd.</dt>
          <dd>{formatNumber(order.quantity)}</dd>
        </div>
        <div>
          <dt>Entrada</dt>
          <dd>{formatDate(order.entryDate)}</dd>
        </div>
        <div>
          <dt>Entrega original</dt>
          <dd>{formatDate(order.originalDeliveryDate)}</dd>
        </div>
        <div>
          <dt>Entrega producao</dt>
          <dd>
            <span className={isProductionDeliveryDueSoon(order.productionDeliveryDate) ? 'production-delivery-alert' : ''}>
              {formatDate(order.productionDeliveryDate)}
              {isProductionDeliveryDueSoon(order.productionDeliveryDate) && <strong className="delivery-alert-mark">!</strong>}
            </span>
          </dd>
        </div>
        <div>
          <dt>Atraso</dt>
          <dd className={Number(order.daysLate) > 0 && !isOrderCompleted(order) ? 'danger-text' : ''}>{formatInteger(order.daysLate)} dias</dd>
        </div>
      </dl>

      {order.notes && (
        <p className="order-mobile-notes">
          <strong>Obs.</strong>
          <span>{order.notes}</span>
        </p>
      )}

      <footer className="order-mobile-actions" onClick={(event) => event.stopPropagation()}>
        <button className="btn" type="button" onClick={onOpen}>
          <IconText name="eye">Resumo</IconText>
        </button>
        <button className="btn" type="button" onClick={onDocuments}>
          <IconText name="file">Docs</IconText>
        </button>
        {canEditOrders && canRelease && (
          <button className="btn primary" type="button" disabled={releaseBusy} onClick={onRelease}>
            <IconText name="check">{releaseBusy ? 'Liberando...' : 'Liberar fat.'}</IconText>
          </button>
        )}
      </footer>
    </article>
  );
}

function OrderNumberCell({
  order,
  selected,
  qualityMatches,
  onSelect,
  onQualityClick
}: {
  order: SalesOrder;
  selected: boolean;
  qualityMatches: QualityMatchResult;
  onSelect: (checked: boolean) => void;
  onQualityClick: () => void;
}) {
  return (
    <span className="order-number-alert">
      <input
        type="checkbox"
        checked={selected}
        aria-label={`Selecionar pedido ${order.orderNumber || order.id}`}
        onChange={(event) => onSelect(event.target.checked)}
      />
      {order.pcpPendingCount > 0 && <span className="pcp-alert-mark" title={order.pcpPendingSummary || 'Pendencia PCP'}>!</span>}
      {qualityMatches.red.length > 0 && (
        <button className="quality-alert-mark critical" type="button" title="Alerta critico de qualidade para este SKU" onClick={onQualityClick}>Q</button>
      )}
      {!qualityMatches.red.length && qualityMatches.yellow.length > 0 && (
        <button className="quality-alert-mark warning" type="button" title="Alerta relacionado de qualidade" onClick={onQualityClick}>Q</button>
      )}
      <span>{order.orderNumber || '-'}</span>
    </span>
  );
}

function OrderStatusCell({ order, statusCategory, onDocumentsClick }: { order: SalesOrder; statusCategory?: string; onDocumentsClick: () => void }) {
  return (
    <span className="status-stack">
      <span className="status-line">
        <button
          className={`status-doc-button${order.photoCount > 0 ? ' has-documents' : ''}`}
          type="button"
          title={order.photoCount > 0 ? `${order.photoCount} documento(s)` : 'Documentos'}
          aria-label={`Abrir documentos do pedido ${order.orderNumber || order.id}`}
          onClick={(event) => {
            event.stopPropagation();
            onDocumentsClick();
          }}
        >
          <PaperDocumentIcon />
          {order.photoCount > 0 && <span>{order.photoCount}</span>}
        </button>
        <span className={`status ${statusClass(order.status)}`}>{order.status || '-'}</span>
      </span>
      {statusCategory === 'production' && <small>Producao</small>}
    </span>
  );
}

function PaperDocumentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M7 3h7.8L19 7.2V21H7V3Zm7 1.8V8h3.2L14 4.8ZM8.8 4.8v14.4h8.4V9.6h-5V4.8H8.8Zm2 7.4h4.6V14h-4.6v-1.8Zm0 3.4h4.6v1.8h-4.6v-1.8Z" />
    </svg>
  );
}

function OrderFormDialog({
  mode,
  order,
  statuses,
  customers,
  busy,
  error,
  onClose,
  onSubmit,
  onDelete
}: {
  mode: 'new' | 'edit';
  order?: SalesOrder;
  statuses: string[];
  customers: string[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [values, setValues] = useState<OrderFormValues>(() => orderToFormValues(order, statuses));
  const title = mode === 'edit' ? `Editar pedido ${order?.orderNumber || ''}` : 'Novo pedido de venda';

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="dialog-backdrop open" role="dialog" aria-modal="true" aria-labelledby="orderFormTitle" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="dialog order-form-dialog" onSubmit={submit}>
        <div className="dialog-header">
          <h2 id="orderFormTitle">{title}</h2>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>x</button>
        </div>
        <div className="dialog-body order-form-grid">
          <Field label="No Pedido" name="orderNumber" value={values.orderNumber} onChange={update} required />
          <Field label="Responsavel comercial" name="commercialResponsible" value={values.commercialResponsible} onChange={update} />
          <SelectField label="Cliente" name="customer" value={values.customer} onChange={update} options={customers} required />
          <Field label="SKU" name="sku" value={values.sku} onChange={update} required />
          <SelectField label="Tipo" name="itemType" value={values.itemType} onChange={update} options={[
            { value: 'production', label: 'Producao' },
            { value: 'purchased', label: 'Pecas compradas' }
          ]} />
          <Field label="OP" name="productionOrder" value={values.productionOrder} onChange={update} />
          <Field label="Pedido compra" name="purchaseOrderNumber" value={values.purchaseOrderNumber} onChange={update} />
          <Field label="Capacidade (TR)" name="capacityTr" value={values.capacityTr} onChange={update} type="number" step="0.01" min="0" />
          <Field label="Linha de produto" name="productLine" value={values.productLine} onChange={update} />
          <Field label="Equipamento" name="equipment" value={values.equipment} onChange={update} />
          <Field label="Tensao" name="voltage" value={values.voltage} onChange={update} />
          <Field label="Quantidade" name="quantity" value={values.quantity} onChange={update} type="number" step="1" min="0" />
          <Field label="Data entrada" name="entryDate" value={values.entryDate} onChange={update} type="date" required />
          <Field label="Entrega original" name="originalDeliveryDate" value={values.originalDeliveryDate} onChange={update} type="date" />
          <Field label="Entrega producao" name="productionDeliveryDate" value={values.productionDeliveryDate} onChange={update} type="date" />
          <Field label="Finalizacao" name="finalizationDate" value={values.finalizationDate} onChange={update} type="date" />
          <SelectField label="Status" name="status" value={values.status} onChange={update} options={statuses} required />
          <label className="field full">
            <span>Observacoes</span>
            <textarea className="input" name="notes" value={values.notes} onChange={update} rows={4} />
          </label>
          {error && <p className="error full">{error}</p>}
        </div>
        <div className="dialog-actions">
          {mode === 'edit' && onDelete && (
            <button className="btn danger" type="button" disabled={busy} onClick={onDelete}><IconText name="trash">Excluir pedido</IconText></button>
          )}
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Cancelar</IconText></button>
          <button className="btn primary" type="submit" disabled={busy}><IconText name="save">{busy ? 'Salvando...' : 'Salvar'}</IconText></button>
        </div>
      </form>
    </div>
  );
}

function StatusChangeDialog({
  orders,
  statuses,
  busy,
  error,
  onClose,
  onSubmit
}: {
  orders: SalesOrder[];
  statuses: string[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (payload: { status: string; allowStatusDeviation: boolean; statusDeviationReason: string }) => void | Promise<void>;
}) {
  const [status, setStatus] = useState(statuses[0] || '');
  const [allowStatusDeviation, setAllowStatusDeviation] = useState(false);
  const [statusDeviationReason, setStatusDeviationReason] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ status, allowStatusDeviation, statusDeviationReason });
  }

  return (
    <div className="dialog-backdrop open" role="dialog" aria-modal="true" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="dialog" onSubmit={submit}>
        <div className="dialog-header">
          <div>
            <h2>Alterar status</h2>
            <span className="order-summary-subtitle">{orders.length} pedido(s) selecionado(s)</span>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>x</button>
        </div>
        <div className="dialog-body">
          <SelectField label="Novo status" name="status" value={status} onChange={(event) => setStatus(event.target.value)} options={statuses} required />
          <label className="check-line">
            <input type="checkbox" checked={allowStatusDeviation} onChange={(event) => setAllowStatusDeviation(event.target.checked)} />
            <span>Permitir desvio da sequencia cadastrada</span>
          </label>
          {allowStatusDeviation && (
            <label className="field">
              <span>Motivo do desvio</span>
              <textarea className="input" value={statusDeviationReason} onChange={(event) => setStatusDeviationReason(event.target.value)} rows={3} required />
            </label>
          )}
          {error && <p className="error">{error}</p>}
        </div>
        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Cancelar</IconText></button>
          <button className="btn primary" type="submit" disabled={busy || !status}><IconText name="status">{busy ? 'Alterando...' : 'Alterar'}</IconText></button>
        </div>
      </form>
    </div>
  );
}

function DimensionsDialog({
  order,
  orders,
  busy,
  error,
  onClose,
  onSubmit
}: {
  order: SalesOrder;
  orders: SalesOrder[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (orderId: string, values: DimensionValues) => void | Promise<void>;
}) {
  const [orderId, setOrderId] = useState(order.id);
  const selected = orders.find((item) => item.id === orderId) || order;
  const [values, setValues] = useState<DimensionValues>(() => orderToDimensionValues(order));

  useEffect(() => {
    setValues(orderToDimensionValues(selected));
  }, [selected.id]);

  function update(event: ChangeEvent<HTMLInputElement>) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(orderId, values);
  }

  return (
    <div className="dialog-backdrop open" role="dialog" aria-modal="true" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="dialog dimension-dialog" onSubmit={submit}>
        <div className="dialog-header">
          <h2>Informar dimensional</h2>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>x</button>
        </div>
        <div className="dialog-body order-form-grid">
          <label className="field full">
            <span>Pedido</span>
            <select className="input" value={orderId} onChange={(event) => setOrderId(event.target.value)}>
              {orders.map((item) => (
                <option key={item.id} value={item.id}>{item.orderNumber} | {item.customer} | {item.sku}</option>
              ))}
            </select>
          </label>
          {dimensionFields.map((field) => (
            <Field key={field.name} label={field.label} name={field.name} value={values[field.name]} onChange={update} type="number" step="0.001" min="0" />
          ))}
          {error && <p className="error full">{error}</p>}
        </div>
        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Cancelar</IconText></button>
          <button className="btn primary" type="submit" disabled={busy}><IconText name="ruler">{busy ? 'Salvando...' : 'Salvar dimensional'}</IconText></button>
        </div>
      </form>
    </div>
  );
}

function DocumentsDialog({ order, canEditOrders, onClose, onChanged }: { order: SalesOrder; canEditOrders: boolean; onClose: () => void; onChanged: () => void }) {
  const [documents, setDocuments] = useState<OrderPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    api<{ photos: OrderPhoto[] }>(`/api/orders/${encodeURIComponent(order.id)}/photos`)
      .then((data) => {
        if (!ignore) setDocuments(data.photos || []);
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
  }, [order.id]);

  async function addDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy('upload');
    setError('');
    try {
      const dataUrl = await fileToDataUrl(file);
      const result = await api<{ photo: OrderPhoto }>(`/api/orders/${encodeURIComponent(order.id)}/photos`, {
        method: 'POST',
        body: {
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          dataUrl
        }
      });
      setDocuments((current) => [result.photo, ...current]);
      onChanged();
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao anexar documento.');
    } finally {
      setBusy('');
    }
  }

  async function deleteDocument(documentId: string) {
    if (!window.confirm('Excluir este documento?')) return;
    setBusy(documentId);
    setError('');
    try {
      await api(`/api/orders/${encodeURIComponent(order.id)}/photos/${encodeURIComponent(documentId)}`, { method: 'DELETE' });
      setDocuments((current) => current.filter((item) => item.id !== documentId));
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir documento.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="dialog-backdrop open" role="dialog" aria-modal="true" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="dialog documents-dialog">
        <div className="dialog-header">
          <div>
            <h2>Documentos</h2>
            <span className="order-summary-subtitle">{order.orderNumber} | {order.customer}</span>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>x</button>
        </div>
        <div className="dialog-body">
          {canEditOrders && (
            <label className="field">
              <span>Anexar documento</span>
              <input className="input" type="file" onChange={addDocument} disabled={busy === 'upload'} />
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <div className="document-list">
            {loading && <p className="muted-text">Carregando documentos...</p>}
            {!loading && !documents.length && <p className="muted-text">Nenhum documento anexado.</p>}
            {documents.map((document) => (
              <article key={document.id}>
                <div>
                  <strong>{document.fileName}</strong>
                  <span>{formatDateTime(document.createdAt)} | {document.mimeType}</span>
                </div>
                <a className="btn" href={document.dataUrl} download={document.fileName}>Baixar</a>
                <a className="btn" href={document.dataUrl} target="_blank" rel="noreferrer">Abrir</a>
                {canEditOrders && <button className="btn" type="button" disabled={busy === document.id} onClick={() => deleteDocument(document.id)}><IconText name="trash">Excluir</IconText></button>}
              </article>
            ))}
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Fechar</IconText></button>
        </div>
      </section>
    </div>
  );
}

function QualityNoticeDialog({
  order,
  matches,
  busyId,
  error,
  onClose,
  onAcknowledge
}: {
  order: SalesOrder;
  matches: QualityMatchResult;
  busyId: string;
  error: string;
  onClose: () => void;
  onAcknowledge: (alertId: string, orderId: string) => void | Promise<void>;
}) {
  return (
    <div className="dialog-backdrop open" role="dialog" aria-modal="true" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="dialog quality-notice-dialog">
        <div className="dialog-header">
          <div>
            <h2>Alertas de qualidade</h2>
            <span className="order-summary-subtitle">{order.orderNumber} | {order.sku}</span>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>x</button>
        </div>
        <div className="dialog-body">
          {matches.all.map((alert) => {
            const critical = matches.red.some((item) => item.id === alert.id);
            return (
              <article className={`quality-alert-card ${critical ? 'critical' : 'warning'}`} key={alert.id}>
                <strong>{critical ? 'Alerta por SKU' : 'Alerta relacionado'}</strong>
                <span>{alert.orderNumber || '-'} | {alert.customer || '-'} | {alert.productLine || '-'} {formatNumber(alert.capacityTr)}</span>
                <p>{alert.wrongDescription || alert.rightDescription || 'Sem descricao cadastrada.'}</p>
                <button className="btn primary" type="button" disabled={busyId === `quality-${alert.id}`} onClick={() => onAcknowledge(alert.id, order.id)}>
                  <IconText name="check">{busyId === `quality-${alert.id}` ? 'Registrando...' : 'Dar ciencia'}</IconText>
                </button>
              </article>
            );
          })}
          {!matches.all.length && <p className="muted-text">Nenhum alerta ativo para este pedido.</p>}
          {error && <p className="error">{error}</p>}
        </div>
        <div className="dialog-actions">
          <button className="btn" type="button" onClick={onClose}><IconText name="close">Fechar</IconText></button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required = false,
  step,
  min
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<any>) => void;
  type?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input className="input" name={name} value={value} onChange={onChange} type={type} required={required} step={step} min={min} />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<any>) => void;
  options: Array<string | { value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select className="input" name={name} value={value} onChange={onChange} required={required}>
        <option value="">Selecione</option>
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option;
          return <option value={item.value} key={item.value}>{item.label}</option>;
        })}
        {value && !options.some((option) => (typeof option === 'string' ? option : option.value) === value) && <option value={value}>{value}</option>}
      </select>
    </label>
  );
}

function orderToFormValues(order: SalesOrder | undefined, statuses: string[]): OrderFormValues {
  return {
    orderNumber: order?.orderNumber || '',
    commercialResponsible: order?.commercialResponsible || '',
    customer: order?.customer || '',
    sku: order?.sku || '',
    productionOrder: order?.productionOrder || '',
    itemType: order?.itemType || 'production',
    purchaseOrderNumber: order?.purchaseOrderNumber || '',
    capacityTr: valueToInput(order?.capacityTr),
    productLine: order?.productLine || '',
    equipment: order?.equipment || '',
    voltage: order?.voltage || '',
    quantity: valueToInput(order?.quantity),
    entryDate: order?.entryDate || todayText(),
    originalDeliveryDate: order?.originalDeliveryDate || '',
    productionDeliveryDate: order?.productionDeliveryDate || '',
    finalizationDate: order?.finalizationDate || '',
    notes: order?.notes || '',
    status: order?.status || statuses[0] || ''
  };
}

function orderFormPayload(values: OrderFormValues) {
  return {
    orderNumber: values.orderNumber.trim(),
    commercialResponsible: values.commercialResponsible.trim(),
    customer: values.customer.trim(),
    sku: values.sku.trim(),
    productionOrder: values.productionOrder.trim().toUpperCase(),
    itemType: values.itemType,
    purchaseOrderNumber: values.purchaseOrderNumber.trim().toUpperCase(),
    capacityTr: optionalNumber(values.capacityTr),
    productLine: values.productLine.trim(),
    equipment: values.equipment.trim(),
    voltage: values.voltage.trim(),
    quantity: optionalNumber(values.quantity),
    entryDate: values.entryDate,
    originalDeliveryDate: values.originalDeliveryDate,
    productionDeliveryDate: values.productionDeliveryDate,
    finalizationDate: values.finalizationDate,
    notes: values.notes.trim(),
    status: values.status
  };
}

function orderToDimensionValues(order: SalesOrder): DimensionValues {
  return {
    machineHeight: valueToInput(order.machineHeight),
    machineWidth: valueToInput(order.machineWidth),
    machineLength: valueToInput(order.machineLength),
    machineWeight: valueToInput(order.machineWeight),
    machineGrossWeight: valueToInput(order.machineGrossWeight),
    machineVolume: valueToInput(order.machineVolume)
  };
}

function dimensionPayload(values: DimensionValues) {
  return {
    machineHeight: optionalNumber(values.machineHeight),
    machineWidth: optionalNumber(values.machineWidth),
    machineLength: optionalNumber(values.machineLength),
    machineWeight: optionalNumber(values.machineWeight),
    machineGrossWeight: optionalNumber(values.machineGrossWeight),
    machineVolume: optionalNumber(values.machineVolume)
  };
}

function valueToInput(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

function optionalNumber(value: string) {
  const clean = String(value || '').replace(',', '.').trim();
  if (!clean) return null;
  const number = Number(clean);
  return Number.isFinite(number) ? number : null;
}

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function qualityMatchesForOrder(order: SalesOrder, alerts: QualityAlert[], acknowledgements: QualityAcknowledgement[]): QualityMatchResult {
  const acknowledged = new Set(acknowledgements.map((item) => `${item.alertId}:${item.orderId}`));
  const active = alerts.filter((alert) => String(alert.status || 'open') === 'open' && !acknowledged.has(`${alert.id}:${order.id}`));
  const red = active.filter((alert) => normalizeText(alert.sku || '') && normalizeText(alert.sku || '') === normalizeText(order.sku));
  const yellow = active.filter((alert) => {
    if (red.some((item) => item.id === alert.id)) return false;
    const sameCustomer = normalizeText(alert.customer || '') && normalizeText(alert.customer || '') === normalizeText(order.customer);
    const sameLineCapacity = normalizeText(alert.productLine || '')
      && normalizeText(alert.productLine || '') === normalizeText(order.productLine)
      && String(alert.capacityTr ?? '') === String(order.capacityTr ?? '');
    return sameCustomer || sameLineCapacity;
  });
  return { red, yellow, all: [...red, ...yellow] };
}

function normalizeTableState(value: Partial<OrdersTableState> = {}): OrdersTableState {
  return {
    search: String(value.search || '').trim(),
    status: String(value.status || ''),
    scope: scopeOptions.some((option) => option.value === value.scope) ? String(value.scope) : '',
    dueWithinDays: /^\d{1,4}$/.test(String(value.dueWithinDays || '').trim()) ? String(value.dueWithinDays).trim() : '',
    sortField: columnByKey.has(value.sortField as OrderColumnKey) ? (value.sortField as OrderColumnKey) : defaultTableState.sortField,
    sortDirection: value.sortDirection === 'asc' ? 'asc' : 'desc',
    pageSize: clampPageSize(value.pageSize),
    visibleColumns: normalizeVisibleColumns(value.visibleColumns),
    columnWidths: normalizeColumnWidths(value.columnWidths)
  };
}

function loadOrdersTableState(userId: string): OrdersTableState {
  try {
    const raw = window.localStorage.getItem(ordersTableStorageKey(userId));
    return raw ? normalizeTableState(JSON.parse(raw)) : defaultTableState;
  } catch {
    return defaultTableState;
  }
}

function writeLocalTableState(userId: string, state: OrdersTableState) {
  try {
    window.localStorage.setItem(ordersTableStorageKey(userId), JSON.stringify(normalizeTableState(state)));
  } catch {
    // Cache local e apenas conveniencia; a fonte compartilhada continua sendo o backend.
  }
}

function ordersTableStorageKey(userId: string) {
  return `mge-sop-react-orders-table-state:${userId || 'default'}`;
}

function normalizeVisibleColumns(value: unknown): OrderColumnKey[] {
  if (!Array.isArray(value)) return defaultVisibleColumns;
  const clean = value.filter((key): key is OrderColumnKey => columnByKey.has(key as OrderColumnKey));
  const unique = Array.from(new Set<OrderColumnKey>(clean));
  const ordered: OrderColumnKey[] = ['orderNumber', ...unique.filter((key) => key !== 'orderNumber')];
  for (const key of defaultVisibleColumns) {
    if (!ordered.includes(key)) ordered.push(key);
  }
  return ordered.length ? ordered : defaultVisibleColumns;
}

function normalizeColumnWidths(value: unknown): Partial<Record<OrderColumnKey, number>> {
  if (!isPlainObject(value)) return {};
  const widths: Partial<Record<OrderColumnKey, number>> = {};
  for (const [key, width] of Object.entries(value)) {
    if (!columnByKey.has(key as OrderColumnKey)) continue;
    const cleanWidth = clampColumnWidth(key as OrderColumnKey, width);
    if (cleanWidth !== defaultColumnWidth(key as OrderColumnKey)) {
      widths[key as OrderColumnKey] = cleanWidth;
    }
  }
  return widths;
}

function columnWidthFor(key: OrderColumnKey, widths: Partial<Record<OrderColumnKey, number>> = {}) {
  return clampColumnWidth(key, widths[key] || defaultColumnWidth(key));
}

function defaultColumnWidth(key: OrderColumnKey) {
  return columnByKey.get(key)?.width || 120;
}

function clampColumnWidth(key: OrderColumnKey, value: unknown) {
  const number = Number(value);
  const fallback = defaultColumnWidth(key);
  const minWidth = key === 'orderNumber' ? Math.max(MIN_COLUMN_WIDTH, 112) : MIN_COLUMN_WIDTH;
  if (!Number.isFinite(number)) return fallback;
  return Math.round(Math.min(MAX_COLUMN_WIDTH, Math.max(minWidth, number)));
}

function orderColumnsForPicker(visibleKeys: OrderColumnKey[]) {
  const visibleSet = new Set(visibleKeys);
  const visible = visibleKeys.map((key) => columnByKey.get(key)).filter(Boolean) as OrderColumn[];
  const hidden = ORDER_COLUMNS.filter((column) => !visibleSet.has(column.key));
  return [...visible, ...hidden];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clampPageSize(value: unknown) {
  const number = Number(value);
  if ([25, 50, 100, 200].includes(number)) return number;
  return defaultTableState.pageSize;
}

function stickyClass(index: number) {
  if (index === 0) return 'sticky-column sticky-column-one';
  if (index === 1) return 'sticky-column sticky-column-two';
  return '';
}

function stickyStyle(index: number, column: OrderColumn, firstColumnWidth: number): CSSProperties {
  const style: CSSProperties = {
    width: column.width,
    minWidth: column.width,
    maxWidth: column.width
  };
  if (index === 0) style.left = 0;
  if (index === 1) style.left = firstColumnWidth;
  return style;
}

function orderCellContent(order: SalesOrder, key: OrderColumnKey, statusCategoryByName: Map<string, string>) {
  if (key === 'orderNumber') {
    return (
      <span className="order-number-alert">
        {order.pcpPendingCount > 0 && <span className="pcp-alert-mark" title={order.pcpPendingSummary || 'Pendencia PCP'}>!</span>}
        <span>{order.orderNumber || '-'}</span>
      </span>
    );
  }

  if (key === 'itemType') return itemTypeLabel(order.itemType);
  if (key === 'capacityTr') return formatNumber(order.capacityTr);
  if (key === 'quantity') return formatNumber(order.quantity);
  if (key === 'entryDate' || key === 'originalDeliveryDate' || key === 'finalizationDate') return formatDate(order[key]);
  if (key === 'productionDeliveryDate') {
    return (
      <span className={isProductionDeliveryDueSoon(order.productionDeliveryDate) ? 'production-delivery-alert' : ''}>
        {formatDate(order.productionDeliveryDate)}
        {isProductionDeliveryDueSoon(order.productionDeliveryDate) && <strong className="delivery-alert-mark">!</strong>}
      </span>
    );
  }
  if (key === 'daysLate') return formatInteger(order.daysLate);
  if (key === 'status') {
    return (
      <span className="status-stack">
        <span className={`status ${statusClass(order.status)}`}>{order.status || '-'}</span>
        {statusCategoryByName.get(order.status) === 'production' && <small>Producao</small>}
        {order.photoCount > 0 && <small>{order.photoCount} doc.</small>}
      </span>
    );
  }
  return order[key] || '';
}

function orderCellText(order: SalesOrder, key: OrderColumnKey) {
  if (key === 'itemType') return itemTypeLabel(order.itemType);
  if (key === 'capacityTr') return formatNumber(order.capacityTr);
  if (key === 'quantity') return formatNumber(order.quantity);
  if (key === 'entryDate' || key === 'originalDeliveryDate' || key === 'productionDeliveryDate' || key === 'finalizationDate') {
    return formatDate(order[key]);
  }
  if (key === 'daysLate') return formatInteger(order.daysLate);
  return String(order[key] ?? '');
}

function cellClass(order: SalesOrder, key: OrderColumnKey) {
  if (key === 'daysLate' && Number(order.daysLate) > 0 && !isOrderCompleted(order)) return 'danger-text';
  if (key === 'notes') return 'notes-cell';
  return '';
}

function orderRowClass(order: SalesOrder, productionSet: Set<string>) {
  if (isOrderCompleted(order)) return 'order-row-completed';
  if (Number(order.pcpPendingCount) > 0) return 'order-row-pcp-pending';
  if (isOrderOverdue(order)) return 'order-row-overdue';
  if (productionSet.has(order.status)) return 'order-row-production';
  if (isAwaitingBillingRelease(order)) return 'order-row-awaiting-billing';
  return 'order-row-not-production';
}

function isOrderCompleted(order: SalesOrder) {
  return normalizeText(order.status).includes('conclu') || order.billingStage === 'loaded';
}

function isOrderOverdue(order: SalesOrder) {
  const normalizedStatus = normalizeText(order.status);
  if (isOrderCompleted(order) || normalizedStatus.includes('cancel') || normalizedStatus.includes('fatur') || normalizedStatus.includes('carreg')) return false;
  return Number(order.daysLate) > 0;
}

function isAwaitingBillingRelease(order: SalesOrder) {
  const normalizedStatus = normalizeText(order.status);
  return Boolean(order.productionDeliveryDate)
    && !order.billingStage
    && !normalizedStatus.includes('cancel')
    && !normalizedStatus.includes('conclu')
    && !normalizedStatus.includes('fatur');
}

function canReleaseBilling(order: SalesOrder) {
  return !order.billingStage && isBillingReleaseReadyStatus(order.status);
}

function isBillingReleaseReadyStatus(status: string) {
  const normalized = normalizeText(status);
  return normalized.includes('aguardando expedicao')
    || normalized.includes('producao concluida')
    || normalized.includes('producao concluido');
}

function isProductionDeliveryDueSoon(value: string) {
  if (!isValidDateText(value)) return false;
  const today = todayAtMidnight();
  const delivery = parseLocalDate(value);
  const days = Math.floor((delivery.getTime() - today.getTime()) / 86400000);
  return days >= 0 && days <= 7;
}

function statusClass(status: string) {
  const normalized = normalizeText(status);
  if (normalized.includes('cancel')) return 'cancelado';
  if (normalized.includes('fatur')) return 'faturado';
  if (normalized.includes('produc')) return 'producao';
  if (normalized.includes('liber')) return 'liberado';
  return 'analise';
}

function itemTypeLabel(value: string) {
  return value === 'purchased' ? 'Pecas compradas' : 'Producao';
}

function formatDate(value: string) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatDate(value);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(number);
}

function formatInteger(value: number | string | null | undefined) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
}

function sumQuantity(orders: SalesOrder[]) {
  return orders.reduce((sum, order) => sum + (Number(order.quantity) || 0), 0);
}

function normalizeText(value: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isValidDateText(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function todayAtMidnight() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function csvCell(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
