const state = {
  user: null,
  statuses: [],
  statusDetails: [],
  productionStatuses: [],
  customers: [],
  orders: [],
  allOrders: [],
  sortField: 'entryDate',
  sortDirection: 'desc',
  ordersPage: 1,
  ordersPageSize: 50,
  ordersTotal: 0,
  ordersTotalPages: 1,
  ordersSummary: null,
  productStats: [],
  productDemandForecasts: [],
  productFilters: {},
  productForecastFilters: {},
  productSearch: '',
  productSortField: 'forecastNext3Months',
  productSortDirection: 'desc',
  productRiskFilter: '',
  activities: [],
  activityFilters: {},
  billingItems: [],
  billingInvoicedItems: [],
  billingInvoicedFilters: {
    search: '',
    sourceType: '',
    dateFrom: '',
    dateTo: '',
    document: ''
  },
  billingInvoicedCollapsed: false,
  billingInvoiceDocument: null,
  thirdPartyItems: [],
  thirdPartyOrderOptions: [],
  loadingItems: [],
  loadingSearch: '',
  pcpPendingIssues: [],
  pcpMotiveOptions: [],
  pcpColumnFilters: {},
  pcpFormOpen: false,
  sequencingActivities: [],
  sequencingStartDate: '',
  sequencingDailyHours: 8,
  apsData: null,
  apsConfig: null,
  apsSchedule: null,
  apsStartDate: '',
  pcpSortField: 'orderNumber',
  pcpSortDirection: 'asc',
  pcpOrderOptions: [],
  statusReleaseRows: [],
  dashboardOrders: [],
  dashboardGoals: {},
  orderPhotos: [],
  qualityAlerts: [],
  qualityAlertAcknowledgements: [],
  qualityAlertOrderOptions: [],
  qualityAlertWrongPhoto: null,
  qualityAlertRightPhoto: null,
  qualityAlertEditingId: '',
  currentScreen: 'orders',
  realtimeSocket: null,
  realtimeRefreshTimer: null,
  appVersion: '',
  updateCheckTimer: null,
  updateInProgress: false,
  draggedColumnKey: '',
  columnOrder: [],
  selectedOrderIds: new Set(),
  activeColumnFilter: null,
  editingId: null,
  dimensionOrderOptions: [],
  billingDialogOrderId: null,
  billingDialogSourceType: 'order',
  statusOrderIds: [],
  editingStatusId: null,
  editingCustomerId: null,
  editingUserId: null,
  editingApsWorkCenterCode: null,
  editingApsOperatorCode: null,
  adminApsConfig: null
};

const el = {
  loginScreen: document.querySelector('#loginScreen'),
  appShell: document.querySelector('#appShell'),
  loginForm: document.querySelector('#loginForm'),
  loginError: document.querySelector('#loginError'),
  username: document.querySelector('#username'),
  password: document.querySelector('#password'),
  userName: document.querySelector('#userName'),
  logoutButton: document.querySelector('#logoutButton'),
  changePasswordButton: document.querySelector('#changePasswordButton'),
  downloadShortcut: document.querySelector('#downloadShortcut'),
  mainNav: document.querySelector('#mainNav'),
  ordersNav: document.querySelector('#ordersNav'),
  dashboardNav: document.querySelector('#dashboardNav'),
  billingNav: document.querySelector('#billingNav'),
  loadingNav: document.querySelector('#loadingNav'),
  thirdPartyNav: document.querySelector('#thirdPartyNav'),
  pcpNav: document.querySelector('#pcpNav'),
  sequencingNav: document.querySelector('#sequencingNav'),
  apsNav: document.querySelector('#apsNav'),
  productsNav: document.querySelector('#productsNav'),
  qualityAlertsNav: document.querySelector('#qualityAlertsNav'),
  qualityNav: document.querySelector('#qualityNav'),
  reportsNav: document.querySelector('#reportsNav'),
  adminNav: document.querySelector('#adminNav'),
  pageTitle: document.querySelector('#pageTitle'),
  pageSubtitle: document.querySelector('#pageSubtitle'),
  ordersScreen: document.querySelector('#ordersScreen'),
  dashboardScreen: document.querySelector('#dashboardScreen'),
  billingScreen: document.querySelector('#billingScreen'),
  loadingScreen: document.querySelector('#loadingScreen'),
  thirdPartyScreen: document.querySelector('#thirdPartyScreen'),
  pcpScreen: document.querySelector('#pcpScreen'),
  sequencingScreen: document.querySelector('#sequencingScreen'),
  apsScreen: document.querySelector('#apsScreen'),
  productsScreen: document.querySelector('#productsScreen'),
  qualityScreen: document.querySelector('#qualityScreen'),
  qualityRncScreen: document.querySelector('#qualityRncScreen'),
  reportsScreen: document.querySelector('#reportsScreen'),
  adminScreen: document.querySelector('#adminScreen'),
  search: document.querySelector('#search'),
  statusFilter: document.querySelector('#statusFilter'),
  scopeFilter: document.querySelector('#scopeFilter'),
  dueWithinDays: document.querySelector('#dueWithinDays'),
  clearFilters: document.querySelector('#clearFilters'),
  exportOrders: document.querySelector('#exportOrders'),
  informDimensions: document.querySelector('#informDimensions'),
  editSelectedOrder: document.querySelector('#editSelectedOrder'),
  changeSelectedStatus: document.querySelector('#changeSelectedStatus'),
  newOrder: document.querySelector('#newOrder'),
  ordersTableWrap: document.querySelector('#ordersTableWrap'),
  ordersTopScrollbar: document.querySelector('#ordersTopScrollbar'),
  ordersTopScrollbarInner: document.querySelector('#ordersTopScrollbarInner'),
  ordersTable: document.querySelector('#ordersTable'),
  ordersBody: document.querySelector('#ordersBody'),
  emptyState: document.querySelector('#emptyState'),
  resultCount: document.querySelector('#resultCount'),
  selectedCount: document.querySelector('#selectedCount'),
  ordersPrevPage: document.querySelector('#ordersPrevPage'),
  ordersNextPage: document.querySelector('#ordersNextPage'),
  ordersPageInfo: document.querySelector('#ordersPageInfo'),
  billingBody: document.querySelector('#billingBody'),
  billingEmpty: document.querySelector('#billingEmpty'),
  toggleBillingInvoiced: document.querySelector('#toggleBillingInvoiced'),
  billingInvoicedCount: document.querySelector('#billingInvoicedCount'),
  billingInvoicedFilters: document.querySelector('#billingInvoicedFilters'),
  billingInvoicedSearch: document.querySelector('#billingInvoicedSearch'),
  billingInvoicedType: document.querySelector('#billingInvoicedType'),
  billingInvoicedDateFrom: document.querySelector('#billingInvoicedDateFrom'),
  billingInvoicedDateTo: document.querySelector('#billingInvoicedDateTo'),
  billingInvoicedDocument: document.querySelector('#billingInvoicedDocument'),
  billingInvoicedClearFilters: document.querySelector('#billingInvoicedClearFilters'),
  billingInvoicedContent: document.querySelector('#billingInvoicedContent'),
  billingInvoicedBody: document.querySelector('#billingInvoicedBody'),
  billingInvoicedEmpty: document.querySelector('#billingInvoicedEmpty'),
  thirdPartyFormPanel: document.querySelector('#thirdPartyFormPanel'),
  thirdPartyForm: document.querySelector('#thirdPartyForm'),
  thirdPartyRomaneioNumber: document.querySelector('#thirdPartyRomaneioNumber'),
  thirdPartyIssueDate: document.querySelector('#thirdPartyIssueDate'),
  thirdPartyExpectedReturnDate: document.querySelector('#thirdPartyExpectedReturnDate'),
  thirdPartySupplierName: document.querySelector('#thirdPartySupplierName'),
  thirdPartySupplierCnpj: document.querySelector('#thirdPartySupplierCnpj'),
  thirdPartySalesOrderId: document.querySelector('#thirdPartySalesOrderId'),
  thirdPartySalesOrderReference: document.querySelector('#thirdPartySalesOrderReference'),
  thirdPartyPartCode: document.querySelector('#thirdPartyPartCode'),
  thirdPartyPartDescription: document.querySelector('#thirdPartyPartDescription'),
  thirdPartyQuantity: document.querySelector('#thirdPartyQuantity'),
  thirdPartyUnit: document.querySelector('#thirdPartyUnit'),
  thirdPartyProcessDescription: document.querySelector('#thirdPartyProcessDescription'),
  thirdPartyNotes: document.querySelector('#thirdPartyNotes'),
  thirdPartyError: document.querySelector('#thirdPartyError'),
  thirdPartySubmit: document.querySelector('#thirdPartySubmit'),
  thirdPartyCount: document.querySelector('#thirdPartyCount'),
  thirdPartyBody: document.querySelector('#thirdPartyBody'),
  thirdPartyEmpty: document.querySelector('#thirdPartyEmpty'),
  loadingSearch: document.querySelector('#loadingSearch'),
  loadingBody: document.querySelector('#loadingBody'),
  loadingEmpty: document.querySelector('#loadingEmpty'),
  pcpPendingForm: document.querySelector('#pcpPendingForm'),
  pcpNewPending: document.querySelector('#pcpNewPending'),
  pcpOrder: document.querySelector('#pcpOrder'),
  pcpComponentCode: document.querySelector('#pcpComponentCode'),
  pcpReason: document.querySelector('#pcpReason'),
  pcpMotive: document.querySelector('#pcpMotive'),
  pcpAddMotive: document.querySelector('#pcpAddMotive'),
  pcpExpectedResolutionDate: document.querySelector('#pcpExpectedResolutionDate'),
  pcpPurchaseOrderField: document.querySelector('#pcpPurchaseOrderField'),
  pcpPurchaseOrderNumber: document.querySelector('#pcpPurchaseOrderNumber'),
  pcpNotes: document.querySelector('#pcpNotes'),
  pcpPendingSubmit: document.querySelector('#pcpPendingSubmit'),
  pcpCancelPending: document.querySelector('#pcpCancelPending'),
  pcpPendingError: document.querySelector('#pcpPendingError'),
  pcpSearch: document.querySelector('#pcpSearch'),
  pcpStatusFilter: document.querySelector('#pcpStatusFilter'),
  pcpSortField: document.querySelector('#pcpSortField'),
  pcpSortDirection: document.querySelector('#pcpSortDirection'),
  pcpClearFilters: document.querySelector('#pcpClearFilters'),
  pcpPendingTable: document.querySelector('#pcpPendingTable'),
  pcpPendingCount: document.querySelector('#pcpPendingCount'),
  pcpPendingBody: document.querySelector('#pcpPendingBody'),
  pcpPendingEmpty: document.querySelector('#pcpPendingEmpty'),
  sequencingCount: document.querySelector('#sequencingCount'),
  sequencingBoard: document.querySelector('#sequencingBoard'),
  sequencingEmpty: document.querySelector('#sequencingEmpty'),
  sequencingError: document.querySelector('#sequencingError'),
  sequencingStartDate: document.querySelector('#sequencingStartDate'),
  sequencingDailyHours: document.querySelector('#sequencingDailyHours'),
  sequencingGantt: document.querySelector('#sequencingGantt'),
  sequencingGanttTimestamp: document.querySelector('#sequencingGanttTimestamp'),
  sequencingGanttSummary: document.querySelector('#sequencingGanttSummary'),
  generateAllSequencing: document.querySelector('#generateAllSequencing'),
  refreshSequencing: document.querySelector('#refreshSequencing'),
  printSequencingReport: document.querySelector('#printSequencingReport'),
  exportSequencingExcel: document.querySelector('#exportSequencingExcel'),
  apsKpiMakespan: document.querySelector('#apsKpiMakespan'),
  apsKpiOtif: document.querySelector('#apsKpiOtif'),
  apsKpiLate: document.querySelector('#apsKpiLate'),
  apsKpiBottleneck: document.querySelector('#apsKpiBottleneck'),
  apsScheduleSummary: document.querySelector('#apsScheduleSummary'),
  apsRun: document.querySelector('#apsRun'),
  apsExport: document.querySelector('#apsExport'),
  apsRefresh: document.querySelector('#apsRefresh'),
  apsStartDate: document.querySelector('#apsStartDate'),
  apsPriorityRule: document.querySelector('#apsPriorityRule'),
  apsScenarioExtraHours: document.querySelector('#apsScenarioExtraHours'),
  apsScenarioOperatorBoost: document.querySelector('#apsScenarioOperatorBoost'),
  apsError: document.querySelector('#apsError'),
  apsGanttTimestamp: document.querySelector('#apsGanttTimestamp'),
  apsGantt: document.querySelector('#apsGantt'),
  apsSaveConfig: document.querySelector('#apsSaveConfig'),
  apsOperatorsJson: document.querySelector('#apsOperatorsJson'),
  apsWorkCentersJson: document.querySelector('#apsWorkCentersJson'),
  apsOperationsJson: document.querySelector('#apsOperationsJson'),
  apsOperationBody: document.querySelector('#apsOperationBody'),
  apsScheduleCount: document.querySelector('#apsScheduleCount'),
  apsScheduleBody: document.querySelector('#apsScheduleBody'),
  apsScheduleEmpty: document.querySelector('#apsScheduleEmpty'),
  apsBottleneckBody: document.querySelector('#apsBottleneckBody'),
  apsDelayBody: document.querySelector('#apsDelayBody'),
  apsScenarioBody: document.querySelector('#apsScenarioBody'),
  apsRecommendations: document.querySelector('#apsRecommendations'),
  dashboardOrders: document.querySelector('#dashboardOrders'),
  dashboardEquipment: document.querySelector('#dashboardEquipment'),
  dashboardLeadTime: document.querySelector('#dashboardLeadTime'),
  dashboardProductionLabel: document.querySelector('#dashboardProductionLabel'),
  dashboardProductionMachines: document.querySelector('#dashboardProductionMachines'),
  productSearch: document.querySelector('#productSearch'),
  productSort: document.querySelector('#productSort'),
  productSortDirection: document.querySelector('#productSortDirection'),
  productRiskFilter: document.querySelector('#productRiskFilter'),
  productClearFilters: document.querySelector('#productClearFilters'),
  productSopCards: document.querySelector('#productSopCards'),
  productSopInsights: document.querySelector('#productSopInsights'),
  productChartDemand: document.querySelector('#productChartDemand'),
  productChartLeadTime: document.querySelector('#productChartLeadTime'),
  productChartMix: document.querySelector('#productChartMix'),
  productChartRisk: document.querySelector('#productChartRisk'),
  productForecastBody: document.querySelector('#productForecastBody'),
  productForecastEmpty: document.querySelector('#productForecastEmpty'),
  productStatsBody: document.querySelector('#productStatsBody'),
  productStatsEmpty: document.querySelector('#productStatsEmpty'),
  qualityAlertForm: document.querySelector('#qualityAlertForm'),
  qualityAlertEditor: document.querySelector('#qualityAlertEditor'),
  qualityAlertNew: document.querySelector('#qualityAlertNew'),
  qualityAlertResolve: document.querySelector('#qualityAlertResolve'),
  qualityAlertEdit: document.querySelector('#qualityAlertEdit'),
  qualityAlertDelete: document.querySelector('#qualityAlertDelete'),
  qualityAlertOrderId: document.querySelector('#qualityAlertOrderId'),
  qualityAlertOrderNumber: document.querySelector('#qualityAlertOrderNumber'),
  qualityAlertCustomer: document.querySelector('#qualityAlertCustomer'),
  qualityAlertProductLine: document.querySelector('#qualityAlertProductLine'),
  qualityAlertSku: document.querySelector('#qualityAlertSku'),
  qualityAlertCapacityTr: document.querySelector('#qualityAlertCapacityTr'),
  qualityAlertQuantity: document.querySelector('#qualityAlertQuantity'),
  qualityAlertWrongPhoto: document.querySelector('#qualityAlertWrongPhoto'),
  qualityAlertWrongPreview: document.querySelector('#qualityAlertWrongPreview'),
  qualityAlertWrongDescription: document.querySelector('#qualityAlertWrongDescription'),
  qualityAlertRightPhoto: document.querySelector('#qualityAlertRightPhoto'),
  qualityAlertRightPreview: document.querySelector('#qualityAlertRightPreview'),
  qualityAlertRightDescription: document.querySelector('#qualityAlertRightDescription'),
  qualityAlertError: document.querySelector('#qualityAlertError'),
  qualityAlertSubmit: document.querySelector('#qualityAlertSubmit'),
  qualityAlertReset: document.querySelector('#qualityAlertReset'),
  qualityAlertList: document.querySelector('#qualityAlertList'),
  qualityAlertEmpty: document.querySelector('#qualityAlertEmpty'),
  activityLogBody: document.querySelector('#activityLogBody'),
  activityLogEmpty: document.querySelector('#activityLogEmpty'),
  chartMachinesSoldMonth: document.querySelector('#chartMachinesSoldMonth'),
  chartMachinesFinishedMonth: document.querySelector('#chartMachinesFinishedMonth'),
  chartLeadTimeMonth: document.querySelector('#chartLeadTimeMonth'),
  chartAverageMachinesYear: document.querySelector('#chartAverageMachinesYear'),
  chartDeliveryPunctuality: document.querySelector('#chartDeliveryPunctuality'),
  chartAverageProducedYear: document.querySelector('#chartAverageProducedYear'),
  releaseSummaryList: document.querySelector('#releaseSummaryList'),
  releaseSummaryEmpty: document.querySelector('#releaseSummaryEmpty'),
  releaseSummaryTypeFilter: document.querySelector('#releaseSummaryTypeFilter'),
  statusReleaseMonth: document.querySelector('#statusReleaseMonth'),
  statusReleaseClear: document.querySelector('#statusReleaseClear'),
  statusReleaseBody: document.querySelector('#statusReleaseBody'),
  statusReleaseEmpty: document.querySelector('#statusReleaseEmpty'),
  dashboardYear: document.querySelector('#dashboardYear'),
  dashboardGoalSold: document.querySelector('#dashboardGoalSold'),
  dashboardGoalFinished: document.querySelector('#dashboardGoalFinished'),
  dashboardGoalLeadTime: document.querySelector('#dashboardGoalLeadTime'),
  dashboardGoalAverageSold: document.querySelector('#dashboardGoalAverageSold'),
  dashboardGoalPunctuality: document.querySelector('#dashboardGoalPunctuality'),
  dashboardGoalAverageProduced: document.querySelector('#dashboardGoalAverageProduced'),
  saveDashboardGoals: document.querySelector('#saveDashboardGoals'),
  dashboardGoalError: document.querySelector('#dashboardGoalError'),
  backdrop: document.querySelector('#dialogBackdrop'),
  form: document.querySelector('#orderForm'),
  formError: document.querySelector('#formError'),
  dialogTitle: document.querySelector('#dialogTitle'),
  closeDialog: document.querySelector('#closeDialog'),
  cancelDialog: document.querySelector('#cancelDialog'),
  deleteOrder: document.querySelector('#deleteOrder'),
  orderNumber: document.querySelector('#orderNumber'),
  commercialResponsible: document.querySelector('#commercialResponsible'),
  customer: document.querySelector('#customer'),
  sku: document.querySelector('#sku'),
  itemType: document.querySelector('#itemType'),
  productionOrder: document.querySelector('#productionOrder'),
  purchaseOrderField: document.querySelector('#purchaseOrderField'),
  purchaseOrderNumber: document.querySelector('#purchaseOrderNumber'),
  capacityTr: document.querySelector('#capacityTr'),
  productLine: document.querySelector('#productLine'),
  equipment: document.querySelector('#equipment'),
  voltage: document.querySelector('#voltage'),
  quantity: document.querySelector('#quantity'),
  leadTime: document.querySelector('#leadTime'),
  entryDate: document.querySelector('#entryDate'),
  originalDeliveryDate: document.querySelector('#originalDeliveryDate'),
  productionDeliveryDate: document.querySelector('#productionDeliveryDate'),
  daysLatePreview: document.querySelector('#daysLatePreview'),
  finalizationDate: document.querySelector('#finalizationDate'),
  notes: document.querySelector('#notes'),
  status: document.querySelector('#status'),
  statusDialogBackdrop: document.querySelector('#statusDialogBackdrop'),
  statusDialogTitle: document.querySelector('#statusDialogTitle'),
  statusChangeForm: document.querySelector('#statusChangeForm'),
  statusChangeSelect: document.querySelector('#statusChangeSelect'),
  statusChangeAllowDeviation: document.querySelector('#statusChangeAllowDeviation'),
  statusChangeDeviationReasonField: document.querySelector('#statusChangeDeviationReasonField'),
  statusChangeDeviationReason: document.querySelector('#statusChangeDeviationReason'),
  statusChangeError: document.querySelector('#statusChangeError'),
  closeStatusDialog: document.querySelector('#closeStatusDialog'),
  cancelStatusDialog: document.querySelector('#cancelStatusDialog'),
  passwordDialogBackdrop: document.querySelector('#passwordDialogBackdrop'),
  changePasswordForm: document.querySelector('#changePasswordForm'),
  currentPassword: document.querySelector('#currentPassword'),
  newPassword: document.querySelector('#newPassword'),
  confirmNewPassword: document.querySelector('#confirmNewPassword'),
  changePasswordError: document.querySelector('#changePasswordError'),
  closePasswordDialog: document.querySelector('#closePasswordDialog'),
  cancelPasswordDialog: document.querySelector('#cancelPasswordDialog'),
  dimensionsDialogBackdrop: document.querySelector('#dimensionsDialogBackdrop'),
  dimensionsForm: document.querySelector('#dimensionsForm'),
  dimensionOrderSelect: document.querySelector('#dimensionOrderSelect'),
  dimensionMachineHeight: document.querySelector('#dimensionMachineHeight'),
  dimensionMachineWidth: document.querySelector('#dimensionMachineWidth'),
  dimensionMachineLength: document.querySelector('#dimensionMachineLength'),
  dimensionMachineWeight: document.querySelector('#dimensionMachineWeight'),
  dimensionMachineGrossWeight: document.querySelector('#dimensionMachineGrossWeight'),
  dimensionMachineVolume: document.querySelector('#dimensionMachineVolume'),
  dimensionsError: document.querySelector('#dimensionsError'),
  closeDimensionsDialog: document.querySelector('#closeDimensionsDialog'),
  cancelDimensionsDialog: document.querySelector('#cancelDimensionsDialog'),
  billingDialogBackdrop: document.querySelector('#billingDialogBackdrop'),
  billingForm: document.querySelector('#billingForm'),
  billingDialogSubtitle: document.querySelector('#billingDialogSubtitle'),
  billingInvoiceNumber: document.querySelector('#billingInvoiceNumber'),
  billingInvoiceDocument: document.querySelector('#billingInvoiceDocument'),
  billingInvoiceDocumentInfo: document.querySelector('#billingInvoiceDocumentInfo'),
  billingCarrierName: document.querySelector('#billingCarrierName'),
  billingCarrierCnpj: document.querySelector('#billingCarrierCnpj'),
  billingFreightAddress: document.querySelector('#billingFreightAddress'),
  billingCustomerName: document.querySelector('#billingCustomerName'),
  billingCustomerCnpj: document.querySelector('#billingCustomerCnpj'),
  billingMachineHeight: document.querySelector('#billingMachineHeight'),
  billingMachineWidth: document.querySelector('#billingMachineWidth'),
  billingMachineLength: document.querySelector('#billingMachineLength'),
  billingMachineWeight: document.querySelector('#billingMachineWeight'),
  billingMachineGrossWeight: document.querySelector('#billingMachineGrossWeight'),
  billingMachineVolume: document.querySelector('#billingMachineVolume'),
  billingError: document.querySelector('#billingError'),
  closeBillingDialog: document.querySelector('#closeBillingDialog'),
  cancelBillingDialog: document.querySelector('#cancelBillingDialog'),
  saveBillingInfo: document.querySelector('#saveBillingInfo'),
  markBillingInvoiced: document.querySelector('#markBillingInvoiced'),
  statusAdminForm: document.querySelector('#statusAdminForm'),
  statusAdminName: document.querySelector('#statusAdminName'),
  statusAdminSortOrder: document.querySelector('#statusAdminSortOrder'),
  statusAdminCategory: document.querySelector('#statusAdminCategory'),
  statusAdminFlowType: document.querySelector('#statusAdminFlowType'),
  statusAdminSave: document.querySelector('#statusAdminSave'),
  statusAdminCancel: document.querySelector('#statusAdminCancel'),
  statusAdminError: document.querySelector('#statusAdminError'),
  statusAdminList: document.querySelector('#statusAdminList'),
  apsWorkCenterForm: document.querySelector('#apsWorkCenterForm'),
  apsWorkCenterCode: document.querySelector('#apsWorkCenterCode'),
  apsWorkCenterDescription: document.querySelector('#apsWorkCenterDescription'),
  apsWorkCenterMachineCount: document.querySelector('#apsWorkCenterMachineCount'),
  apsWorkCenterCalendar: document.querySelector('#apsWorkCenterCalendar'),
  apsWorkCenterEfficiency: document.querySelector('#apsWorkCenterEfficiency'),
  apsWorkCenterCapacity: document.querySelector('#apsWorkCenterCapacity'),
  apsWorkCenterShift: document.querySelector('#apsWorkCenterShift'),
  apsWorkCenterMaintenance: document.querySelector('#apsWorkCenterMaintenance'),
  apsWorkCenterSave: document.querySelector('#apsWorkCenterSave'),
  apsWorkCenterCancel: document.querySelector('#apsWorkCenterCancel'),
  apsWorkCenterError: document.querySelector('#apsWorkCenterError'),
  apsWorkCenterList: document.querySelector('#apsWorkCenterList'),
  apsOperatorForm: document.querySelector('#apsOperatorForm'),
  apsOperatorCode: document.querySelector('#apsOperatorCode'),
  apsOperatorName: document.querySelector('#apsOperatorName'),
  apsOperatorShift: document.querySelector('#apsOperatorShift'),
  apsOperatorJourneyHours: document.querySelector('#apsOperatorJourneyHours'),
  apsOperatorEfficiency: document.querySelector('#apsOperatorEfficiency'),
  apsOperatorSkill: document.querySelector('#apsOperatorSkill'),
  apsOperatorOperations: document.querySelector('#apsOperatorOperations'),
  apsOperatorCenters: document.querySelector('#apsOperatorCenters'),
  apsOperatorHourlyCost: document.querySelector('#apsOperatorHourlyCost'),
  apsOperatorSave: document.querySelector('#apsOperatorSave'),
  apsOperatorCancel: document.querySelector('#apsOperatorCancel'),
  apsOperatorError: document.querySelector('#apsOperatorError'),
  apsOperatorList: document.querySelector('#apsOperatorList'),
  customerAdminForm: document.querySelector('#customerAdminForm'),
  customerAdminName: document.querySelector('#customerAdminName'),
  customerAdminSave: document.querySelector('#customerAdminSave'),
  customerAdminCancel: document.querySelector('#customerAdminCancel'),
  customerAdminError: document.querySelector('#customerAdminError'),
  customerAdminList: document.querySelector('#customerAdminList'),
  userAdminForm: document.querySelector('#userAdminForm'),
  userAdminName: document.querySelector('#userAdminName'),
  userAdminUsername: document.querySelector('#userAdminUsername'),
  userAdminPassword: document.querySelector('#userAdminPassword'),
  userAdminRole: document.querySelector('#userAdminRole'),
  userAdminCanEditOrders: document.querySelector('#userAdminCanEditOrders'),
  userAdminTabAccess: document.querySelector('#userAdminTabAccess'),
  userAdminSave: document.querySelector('#userAdminSave'),
  userAdminCancel: document.querySelector('#userAdminCancel'),
  userAdminError: document.querySelector('#userAdminError'),
  userAdminList: document.querySelector('#userAdminList'),
  systemHealthGrid: document.querySelector('#systemHealthGrid'),
  createBackup: document.querySelector('#createBackup'),
  refreshHealth: document.querySelector('#refreshHealth'),
  backupError: document.querySelector('#backupError'),
  backupList: document.querySelector('#backupList'),
  orderPhotoSection: document.querySelector('#orderPhotoSection'),
  orderPhotoInput: document.querySelector('#orderPhotoInput'),
  orderPhotoError: document.querySelector('#orderPhotoError'),
  orderPhotoList: document.querySelector('#orderPhotoList'),
  photosDialogBackdrop: document.querySelector('#photosDialogBackdrop'),
  photosViewList: document.querySelector('#photosViewList'),
  photosViewEmpty: document.querySelector('#photosViewEmpty'),
  closePhotosDialog: document.querySelector('#closePhotosDialog'),
  cancelPhotosDialog: document.querySelector('#cancelPhotosDialog')
};

const TAB_DEFS = [
  { key: 'orders', label: 'Pedidos' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'billing', label: 'Faturamento' },
  { key: 'loading', label: 'Carregamento' },
  { key: 'thirdParty', label: 'Terceiros' },
  { key: 'pcp', label: 'Pend\u00eancias PCP' },
  { key: 'sequencing', label: 'Sequenciamento' },
  { key: 'aps', label: 'APS' },
  { key: 'products', label: 'Produtos' },
  { key: 'quality', label: 'Qualidade' },
  { key: 'reports', label: 'Relat\u00f3rios' },
  { key: 'admin', label: 'Cadastros' }
];
const USER_TAB_KEYS = TAB_DEFS.filter((tab) => tab.key !== 'admin').map((tab) => tab.key);
const DEFAULT_VISIBLE_TABS = [...USER_TAB_KEYS];
const DEFAULT_EDITABLE_TABS = ['orders', 'billing', 'loading', 'thirdParty', 'pcp', 'sequencing', 'aps'];
const ROLE_LABELS = {
  admin: 'Administrador',
  commercial: 'Comercial',
  production: 'Produ\u00e7\u00e3o',
  financial: 'Financeiro',
  viewer: 'Consulta',
  user: 'Usu\u00e1rio personalizado'
};
const ROLE_ACCESS_PRESETS = {
  admin: { visibleTabs: TAB_DEFS.map((tab) => tab.key), editableTabs: TAB_DEFS.map((tab) => tab.key), canEditOrders: true },
  commercial: { visibleTabs: ['orders', 'dashboard', 'products', 'reports'], editableTabs: ['orders'], canEditOrders: true },
  production: { visibleTabs: ['orders', 'dashboard', 'thirdParty', 'pcp', 'sequencing', 'aps', 'products', 'quality', 'reports'], editableTabs: ['thirdParty', 'pcp', 'sequencing', 'aps'], canEditOrders: false },
  financial: { visibleTabs: ['orders', 'dashboard', 'billing', 'loading', 'thirdParty', 'reports'], editableTabs: ['billing', 'loading', 'thirdParty'], canEditOrders: false },
  viewer: { visibleTabs: ['orders', 'dashboard', 'products', 'quality', 'reports'], editableTabs: [], canEditOrders: false },
  user: { visibleTabs: DEFAULT_VISIBLE_TABS, editableTabs: [], canEditOrders: false }
};
const ORDER_STAGE_DEFS = [
  { key: 'lm', label: 'LM' },
  { key: 'serpentina', label: 'Serpentina' },
  { key: 'mechanicalProject', label: 'Projeto Mec\u00e2nico' },
  { key: 'electricalProject', label: 'Projeto El\u00e9trico' }
];
const DASHBOARD_GOAL_FIELDS = {
  soldMonth: 'dashboardGoalSold',
  finishedMonth: 'dashboardGoalFinished',
  leadTimeMonth: 'dashboardGoalLeadTime',
  averageSoldYear: 'dashboardGoalAverageSold',
  deliveryPunctuality: 'dashboardGoalPunctuality',
  averageProducedYear: 'dashboardGoalAverageProduced'
};
const ORDER_DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;
const QUALITY_ALERT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const QUALITY_ALERT_IMAGE_MIME_BY_EXTENSION = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif'
};
const QUALITY_ALERT_IMAGE_MIME_TYPES = new Set(Object.values(QUALITY_ALERT_IMAGE_MIME_BY_EXTENSION));
const ORDER_DOCUMENT_MIME_BY_EXTENSION = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  xml: 'application/xml',
  txt: 'text/plain',
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};
const ORDER_DOCUMENT_MIME_TYPES = new Set(Object.values(ORDER_DOCUMENT_MIME_BY_EXTENSION));

const PRODUCT_FILTER_COLUMNS = [
  { key: 'code', label: 'C\u00f3digo do produto', value: (product) => product.code },
  { key: 'productLine', label: 'Linha de produto', value: (product) => product.productLine },
  { key: 'equipment', label: 'Equipamento', value: (product) => product.equipment },
  { key: 'salesOrders', label: 'Pedidos', value: (product) => formatInteger(product.salesOrders) },
  { key: 'machinesSold', label: 'M\u00e1quinas vendidas', value: (product) => formatInteger(product.machinesSold) },
  { key: 'averageLeadTime', label: 'Lead time m\u00e9dio', value: (product) => formatDays(product.averageLeadTime) },
  { key: 'averageOrderInterval', label: 'Intervalo m\u00e9dio entre pedidos', value: (product) => formatDays(product.averageOrderInterval) }
];

const PRODUCT_FORECAST_FILTER_COLUMNS = [
  { key: 'productLine', label: 'Linha de produto', value: (forecast) => forecast.productLine },
  { key: 'capacityLabel', label: 'Capacidade', value: (forecast) => forecast.capacityLabel },
  { key: 'machinesSold', label: 'Maquinas vendidas', value: (forecast) => formatInteger(forecast.machinesSold) },
  { key: 'averageMonthlyDemand', label: 'Media mensal', value: (forecast) => formatDemand(forecast.averageMonthlyDemand) },
  { key: 'forecastNextMonth', label: 'Previsao proximo mes', value: (forecast) => formatDemand(forecast.forecastNextMonth) },
  { key: 'forecastNext3Months', label: 'Previsao 3 meses', value: (forecast) => formatDemand(forecast.forecastNext3Months) },
  { key: 'averageLeadTime', label: 'Lead time medio', value: (forecast) => formatDays(forecast.averageLeadTime) },
  { key: 'openSummary', label: 'Carteira aberta', value: (forecast) => `${formatInteger(forecast.openOrders)} ped. / ${formatInteger(forecast.openMachines)} maq.` },
  { key: 'delayRiskLabel', label: 'Risco de atraso', value: (forecast) => forecast.delayRiskLabel || '-' },
  { key: 'confidence', label: 'Confianca', value: (forecast) => forecastConfidenceLabel(forecast.confidence) }
];

const ACTIVITY_FILTER_COLUMNS = [
  { key: 'createdAt', label: 'Data / hora', value: (activity) => formatDateTime(activity.createdAt) },
  { key: 'actor', label: 'Usu\u00e1rio', value: (activity) => activity.actor },
  { key: 'action', label: 'A\u00e7\u00e3o', value: (activity) => activity.action },
  { key: 'entityType', label: 'Tipo', value: (activity) => activity.entityType },
  { key: 'entityLabel', label: 'Registro', value: (activity) => activity.entityLabel },
  { key: 'details', label: 'Detalhes', value: (activity) => activity.details }
];

const TABLE_FILTERS = {
  products: {
    columns: PRODUCT_FILTER_COLUMNS,
    rows: () => state.productStats,
    filters: () => state.productFilters,
    table: () => el.productStatsBody.closest('table'),
    render: () => renderProductScreen()
  },
  productForecasts: {
    columns: PRODUCT_FORECAST_FILTER_COLUMNS,
    rows: () => state.productDemandForecasts,
    filters: () => state.productForecastFilters,
    table: () => el.productForecastBody.closest('table'),
    render: () => renderProductScreen()
  },
  reports: {
    columns: ACTIVITY_FILTER_COLUMNS,
    rows: () => state.activities,
    filters: () => state.activityFilters,
    table: () => el.activityLogBody.closest('table'),
    render: () => renderActivityLog()
  }
};

const DEFAULT_ORDER_COLUMNS = [
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

const ORDER_COLUMN_DEFS = {
  orderNumber: { label: 'Nº Pedido', sort: 'orderNumber', width: 130 },
  commercialResponsible: { label: 'Responsavel comercial', sort: 'commercialResponsible', width: 180 },
  customer: { label: 'Cliente', sort: 'customer', width: 180 },
  sku: { label: 'SKU', sort: 'sku', width: 130 },
  itemType: { label: 'Tipo', sort: 'itemType', width: 120 },
  productionOrder: { label: 'OP', sort: 'productionOrder', width: 150 },
  purchaseOrderNumber: { label: 'Pedido compra', sort: 'purchaseOrderNumber', width: 170 },
  capacityTr: { label: 'Capacidade (TR)', sort: 'capacityTr', width: 135 },
  productLine: { label: 'Linha de produto', sort: 'productLine', width: 165 },
  equipment: { label: 'Equipamento', sort: 'equipment', width: 175 },
  voltage: { label: 'Tensao', sort: 'voltage', width: 105 },
  quantity: { label: 'Quantidade', sort: 'quantity', width: 110 },
  leadTime: { label: 'Lead Time', sort: 'leadTime', width: 115 },
  entryDate: { label: 'Data entrada', sort: 'entryDate', width: 125 },
  originalDeliveryDate: { label: 'Data entrega Original', sort: 'originalDeliveryDate', width: 165 },
  productionDeliveryDate: { label: 'Data entrega Producao', sort: 'productionDeliveryDate', width: 165 },
  daysLate: { label: 'Dias em atraso', sort: 'daysLate', width: 125 },
  finalizationDate: { label: 'Data finalizacao', sort: 'finalizationDate', width: 145 },
  status: { label: 'Status', sort: 'status', width: 170 },
  notes: { label: 'Observacoes', width: 240 }
};

async function api(path, options = {}) {
  const url = apiUrl(path);
  const usesExternalApi = /^https?:\/\//i.test(url) && !url.startsWith(window.location.origin);
  const request = {
    method: options.method || 'GET',
    headers: options.headers || {},
    credentials: usesExternalApi ? 'include' : 'same-origin'
  };

  if (options.body !== undefined) {
    request.headers['Content-Type'] = 'application/json';
    request.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, request);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Erro na comunicação com o servidor.');
  }

  return data;
}

function runtimeConfig() {
  return window.SOP_CONFIG || {};
}

function apiUrl(path) {
  const baseUrl = String(runtimeConfig().apiBaseUrl || '').trim().replace(/\/+$/, '');
  if (!baseUrl || /^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${String(path || '').startsWith('/') ? '' : '/'}${path}`;
}

function showLogin() {
  state.user = null;
  state.selectedOrderIds.clear();
  if (state.realtimeSocket) {
    state.realtimeSocket.close();
    state.realtimeSocket = null;
  }
  el.loginScreen.hidden = false;
  el.appShell.hidden = true;
  el.password.focus();
}

async function showApp(user) {
  state.user = user;
  state.selectedOrderIds.clear();
  el.userName.textContent = user.name || user.username;
  el.loginScreen.hidden = true;
  el.appShell.hidden = false;
  ensureModuleNavigation();
  applyUserAccess();
  await loadColumnOrder();
  setupOrdersHorizontalScrollbar();
  setScreen(canViewTab(state.currentScreen) ? state.currentScreen : firstVisibleScreen());
  await refreshReferences();
  if (canViewTab('orders')) await loadOrders();
  connectRealtime();
}

async function boot() {
  try {
    const { user } = await api('/api/me');
    await showApp(user);
  } catch (error) {
    showLogin();
  }
}

function startAutoUpdateCheck() {
  checkForApplicationUpdate();
  clearInterval(state.updateCheckTimer);
  state.updateCheckTimer = setInterval(checkForApplicationUpdate, 60 * 1000);
  window.addEventListener('focus', checkForApplicationUpdate);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkForApplicationUpdate();
  });
}

async function checkForApplicationUpdate() {
  if (state.updateInProgress) return;

  try {
    const response = await fetch(`/api/version?ts=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'same-origin'
    });
    if (!response.ok) return;

    const data = await response.json();
    const version = String(data.version || '').trim();
    if (!version) return;

    if (!state.appVersion) {
      state.appVersion = version;
      return;
    }

    if (version !== state.appVersion) {
      await queueApplicationUpdate(version);
    }
  } catch (error) {
    // Verificacao silenciosa: se o servidor estiver reiniciando, tenta novamente no proximo ciclo.
  }
}

async function queueApplicationUpdate(version) {
  if (isApplicationBusy()) {
    showUpdateNotice(version);
    return;
  }

  await applyApplicationUpdate();
}

function isApplicationBusy() {
  return [
    el.backdrop,
    el.statusDialogBackdrop,
    el.passwordDialogBackdrop,
    el.dimensionsDialogBackdrop,
    el.billingDialogBackdrop,
    el.photosDialogBackdrop
  ].some((node) => node && node.classList.contains('open'));
}

function showUpdateNotice(version) {
  let notice = document.querySelector('#autoUpdateNotice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'autoUpdateNotice';
    notice.className = 'auto-update-notice';
    notice.innerHTML = `
      <span>Nova versao disponivel.</span>
      <button class="btn primary" type="button">Atualizar agora</button>
    `;
    document.body.appendChild(notice);
    notice.querySelector('button').addEventListener('click', () => applyApplicationUpdate());
  }

  notice.dataset.version = version;
  notice.hidden = false;
}

async function applyApplicationUpdate() {
  state.updateInProgress = true;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    }
  } catch (error) {
    // Mesmo se o service worker falhar, o reload busca a versao atual pelo servidor.
  }

  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    }
  } catch (error) {
    // Se a limpeza de cache falhar, o reload ainda tenta buscar a versao nova na rede.
  }

  window.location.reload();
}

async function loadColumnOrder() {
  const localOrder = readLocalColumnOrder();
  applyColumnOrder(localOrder);

  try {
    const { order } = await api('/api/preferences/order-column-order');
    if (Array.isArray(order) && order.length) {
      applyColumnOrder(order);
      cacheColumnOrder();
      return;
    }

    if (localOrder.length) {
      await persistColumnOrder({ skipLocalCache: true });
    }
  } catch (error) {
    applyColumnOrder(localOrder);
  }
}

function readLocalColumnOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(columnOrderStorageKey()) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function applyColumnOrder(order = []) {
  try {
    order = Array.isArray(order) ? order : [];
  } catch (error) {
    order = [];
  }

  const seen = new Set();
  state.columnOrder = [...order, ...DEFAULT_ORDER_COLUMNS].filter((key) => {
    if (!ORDER_COLUMN_DEFS[key] || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function persistColumnOrder(options = {}) {
  if (!options.skipLocalCache) {
    cacheColumnOrder();
  }

  try {
    await api('/api/preferences/order-column-order', {
      method: 'PUT',
      body: { order: state.columnOrder }
    });
  } catch (error) {
    // O cache local mantem a preferencia neste dispositivo ate a proxima sincronizacao.
  }
}

function cacheColumnOrder() {
  try {
    localStorage.setItem(columnOrderStorageKey(), JSON.stringify(state.columnOrder));
  } catch (error) {
    // Navegadores em modo restrito podem bloquear localStorage; o servidor segue sendo a fonte principal.
  }
}

function columnOrderStorageKey() {
  return `sop.orderColumns.${state.user?.username || 'default'}`;
}

function connectRealtime() {
  if (runtimeConfig().realtimeEnabled === false) {
    return;
  }

  if (state.realtimeSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(state.realtimeSocket.readyState)) {
    return;
  }

  if (!('WebSocket' in window)) return;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(`${protocol}//${window.location.host}/api/realtime`);
  state.realtimeSocket = socket;

  socket.addEventListener('message', (event) => {
    let message = null;
    try {
      message = JSON.parse(event.data);
    } catch (error) {
      return;
    }

    if (message.type !== 'data-change') return;
    const scopes = Array.isArray(message.scopes) ? message.scopes : [];
    if (!scopes.includes(state.currentScreen) && !scopes.includes('all')) return;

    clearTimeout(state.realtimeRefreshTimer);
    state.realtimeRefreshTimer = setTimeout(refreshCurrentScreen, 250);
  });

  socket.addEventListener('close', () => {
    if (state.user) setTimeout(connectRealtime, 3000);
  });
}

async function refreshCurrentScreen() {
  try {
    await refreshReferences();
    if (state.currentScreen === 'orders') await loadOrders();
    if (state.currentScreen === 'billing') await loadBillingItems();
    if (state.currentScreen === 'loading') await loadLoadingItems();
    if (state.currentScreen === 'thirdParty') await loadThirdPartyParts();
    if (state.currentScreen === 'pcp') await loadPcpScreen();
    if (state.currentScreen === 'sequencing') await loadSequencing();
    if (state.currentScreen === 'aps') await loadAps();
    if (state.currentScreen === 'products') await loadProductStats();
    if (state.currentScreen === 'quality') await loadQualityAlertsScreen();
    if (state.currentScreen === 'reports') await loadActivityLog();
    if (state.currentScreen === 'dashboard') await loadDashboardCharts();
    if (state.currentScreen === 'admin') await loadAdminData();
  } catch (error) {
    console.warn('Falha ao atualizar dados em tempo real', error);
  }
}

function moveOrderColumn(sourceKey, targetKey, event) {
  if (sourceKey === targetKey) return;

  const nextOrder = state.columnOrder.filter((key) => key !== sourceKey);
  const targetIndex = nextOrder.indexOf(targetKey);
  if (targetIndex < 0) return;

  const bounds = event.target.closest('th').getBoundingClientRect();
  const insertAfter = event.clientX > bounds.left + bounds.width / 2;
  nextOrder.splice(targetIndex + (insertAfter ? 1 : 0), 0, sourceKey);
  state.columnOrder = nextOrder;
}

function setScreen(screen) {
  if (!canViewTab(screen)) {
    screen = firstVisibleScreen();
  }

  const screens = {
    orders: el.ordersScreen,
    dashboard: el.dashboardScreen,
    billing: el.billingScreen,
    loading: el.loadingScreen,
    thirdParty: el.thirdPartyScreen,
    pcp: el.pcpScreen,
    sequencing: el.sequencingScreen,
    aps: el.apsScreen,
    products: el.productsScreen,
    quality: el.qualityScreen,
    qualityRnc: el.qualityRncScreen,
    reports: el.reportsScreen,
    admin: el.adminScreen
  };
  const navItems = {
    orders: el.ordersNav,
    dashboard: el.dashboardNav,
    billing: el.billingNav,
    loading: el.loadingNav,
    thirdParty: el.thirdPartyNav,
    pcp: el.pcpNav,
    sequencing: el.sequencingNav,
    aps: el.apsNav,
    products: el.productsNav,
    quality: el.qualityAlertsNav,
    qualityRnc: el.qualityNav,
    reports: el.reportsNav,
    admin: el.adminNav
  };
  const titles = {
    orders: ['Controle de Pedidos de Venda', 'S&OP conectado ao banco do servidor local.'],
    dashboard: ['Dashboard S&OP', 'Gráficos gerenciais baseados no histórico de pedidos.'],
    billing: ['Faturamento', 'Pedidos liberados para faturar com dimensionais da maquina.'],
    loading: ['Aguardando carregamento', 'Pedidos faturados aguardando expedicao.'],
    thirdParty: ['Terceiros', 'Controle de pecas em poder de terceiros e remessas de beneficiamento.'],
    pcp: ['Pend\u00eancias PCP', 'Controle de componentes pendentes vinculados aos pedidos de venda.'],
    sequencing: ['Sequenciamento', 'Fila de atividades pendentes por pedido de venda.'],
    aps: ['APS', 'Programacao finita da producao, cenarios e gargalos.'],
    quality: ['Alertas de Qualidade', 'Avisos visuais para evitar reincidencia nos pedidos.'],
    qualityRnc: ['Modulo Qualidade', 'RNC, A3, 5W2H e PDCA integrados ao S&OP.'],
    products: ['Produtos', 'Indicadores por código de produto a partir do histórico.'],
    reports: ['Relatórios de atividades', 'Histórico completo das ações executadas no sistema.'],
    admin: ['Cadastros administrativos', 'Cadastro de status e clientes disponíveis nos pedidos.']
  };

  state.currentScreen = screen;

  Object.entries(screens).forEach(([name, node]) => {
    node.hidden = name !== screen;
  });
  Object.entries(navItems).forEach(([name, node]) => {
    node.classList.toggle('active', name === screen);
  });

  el.pageTitle.textContent = titles[screen][0];
  el.pageSubtitle.textContent = titles[screen][1];
  openNavigationModuleForScreen(screen);

  if (screen === 'admin') loadAdminData();
  if (screen === 'billing') loadBillingItems();
  if (screen === 'loading') loadLoadingItems();
  if (screen === 'thirdParty') loadThirdPartyParts();
  if (screen === 'pcp') loadPcpScreen();
  if (screen === 'sequencing') loadSequencing();
  if (screen === 'aps') loadAps();
  if (screen === 'products') loadProductStats();
  if (screen === 'quality') loadQualityAlertsScreen();
  if (screen === 'qualityRnc') loadQualityAlertData(false);
  if (screen === 'reports') loadActivityLog();
  if (screen === 'dashboard') loadDashboardCharts();
}

function applyUserAccess() {
  const navItems = {
    orders: el.ordersNav,
    dashboard: el.dashboardNav,
    billing: el.billingNav,
    loading: el.loadingNav,
    thirdParty: el.thirdPartyNav,
    pcp: el.pcpNav,
    sequencing: el.sequencingNav,
    aps: el.apsNav,
    products: el.productsNav,
    quality: el.qualityAlertsNav,
    qualityRnc: el.qualityNav,
    reports: el.reportsNav,
    admin: el.adminNav
  };

  Object.entries(navItems).forEach(([screen, node]) => {
    node.hidden = !canViewTab(screen === 'qualityRnc' ? 'quality' : screen);
  });

  updateNavModuleVisibility();

  el.newOrder.hidden = !canEditTab('orders') || !canViewTab('orders');
  el.changeSelectedStatus.hidden = !canEditTab('orders') || !canViewTab('orders');
  el.exportOrders.hidden = !canViewTab('orders');
  el.informDimensions.hidden = !canEditOrders() || !canViewTab('orders');
  state.pcpFormOpen = state.pcpFormOpen && canEditTab('pcp') && canViewTab('pcp');
  updatePcpPendingFormVisibility();
  el.thirdPartyFormPanel.hidden = !canEditTab('thirdParty') || !canViewTab('thirdParty');
  if (el.qualityAlertNew) el.qualityAlertNew.hidden = !canEditTab('quality') || !canViewTab('quality');
  if (el.qualityAlertResolve) el.qualityAlertResolve.hidden = !canEditTab('quality') || !canViewTab('quality');
  if (el.qualityAlertEdit) el.qualityAlertEdit.hidden = !canEditTab('quality') || !canViewTab('quality');
  if (el.qualityAlertDelete) el.qualityAlertDelete.hidden = !canEditTab('quality') || !canViewTab('quality');
  el.generateAllSequencing.hidden = !canEditTab('sequencing') || !canViewTab('sequencing');
  el.apsSaveConfig.hidden = state.user?.role !== 'admin';
}

function ensureModuleNavigation() {
  if (!el.mainNav || el.mainNav.classList.contains('nav-modules')) return;

  const groups = [
    { key: 'sop', label: 'S&OP', items: [el.ordersNav, el.dashboardNav] },
    { key: 'operations', label: 'Operacoes', items: [el.billingNav, el.loadingNav, el.thirdPartyNav, el.pcpNav, el.sequencingNav, el.apsNav, el.productsNav] },
    { key: 'quality', label: 'Qualidade', items: [el.qualityAlertsNav, el.qualityNav] },
    { key: 'management', label: 'Gestao', items: [el.reportsNav, el.adminNav] }
  ];

  el.mainNav.textContent = '';
  el.mainNav.classList.add('nav-modules');

  for (const group of groups) {
    const section = document.createElement('section');
    section.className = 'nav-module';
    section.dataset.module = group.key;

    const button = document.createElement('button');
    button.className = 'nav-module-toggle';
    button.type = 'button';
    button.dataset.moduleToggle = group.key;
    button.textContent = group.label;

    const items = document.createElement('div');
    items.className = 'nav-module-items';

    for (const item of group.items) {
      if (item) items.appendChild(item);
    }

    section.append(button, items);
    el.mainNav.appendChild(section);
  }

  const firstModule = el.mainNav.querySelector('.nav-module');
  if (firstModule) firstModule.classList.add('is-open');
}

function updateNavModuleVisibility() {
  if (!el.mainNav) return;

  el.mainNav.querySelectorAll('.nav-module').forEach((module) => {
    const hasVisibleItem = Array.from(module.querySelectorAll('.nav-item')).some((item) => !item.hidden);
    module.hidden = !hasVisibleItem;
  });
}

function openNavigationModuleForScreen(screen) {
  const navItems = {
    orders: el.ordersNav,
    dashboard: el.dashboardNav,
    billing: el.billingNav,
    loading: el.loadingNav,
    thirdParty: el.thirdPartyNav,
    pcp: el.pcpNav,
    sequencing: el.sequencingNav,
    aps: el.apsNav,
    products: el.productsNav,
    quality: el.qualityAlertsNav,
    qualityRnc: el.qualityNav,
    reports: el.reportsNav,
    admin: el.adminNav
  };
  const activeModule = navItems[screen]?.closest('.nav-module');
  if (!activeModule) return;

  el.mainNav.querySelectorAll('.nav-module').forEach((module) => {
    module.classList.toggle('is-open', module === activeModule);
  });
}

function firstVisibleScreen() {
  return USER_TAB_KEYS.find((tab) => canViewTab(tab)) || (canViewTab('admin') ? 'admin' : 'orders');
}

async function refreshReferences() {
  await loadStatuses();
  await loadCustomers();
}

async function loadStatuses() {
  const { statuses, statusDetails = [], productionStatuses = [] } = await api('/api/status-values');
  state.statuses = statuses;
  state.statusDetails = statusDetails;
  state.productionStatuses = productionStatuses;

  fillStatusSelects();
}

async function loadCustomers() {
  const { customers } = await api('/api/customers');
  state.customers = customers;

  fillCustomerSelect();
}

function fillStatusSelects() {
  el.statusFilter.innerHTML = '<option value="">Todos</option>';
  el.status.innerHTML = '<option value="">Selecione</option>';
  el.statusChangeSelect.innerHTML = '<option value="">Selecione</option>';

  for (const status of state.statuses) {
    const detail = statusDetail(status);
    const optionLabel = statusOptionLabel(status, detail);
    el.statusFilter.appendChild(new Option(labelStatus(status), status));
    el.status.appendChild(new Option(optionLabel, status));
    el.statusChangeSelect.appendChild(new Option(optionLabel, status));
  }
}

function statusDetail(name) {
  return state.statusDetails.find((status) => status.name === name) || null;
}

function statusOptionLabel(name, detail = statusDetail(name)) {
  if (!detail) return labelStatus(name);
  const suffix = detail.flowType === 'deviation' ? ' - Desvio' : '';
  return `Seq. ${detail.sortOrder ?? '-'} - ${labelStatus(name)}${suffix}`;
}

function fillCustomerSelect() {
  el.customer.innerHTML = '<option value="">Selecione</option>';

  for (const customer of state.customers) {
    el.customer.appendChild(new Option(customer, customer));
  }
}

async function loadOrders() {
  const params = new URLSearchParams();
  if (el.search.value.trim()) params.set('search', el.search.value.trim());
  if (el.statusFilter.value) params.set('status', el.statusFilter.value);
  if (el.scopeFilter.value) params.set('scope', el.scopeFilter.value);
  if (el.dueWithinDays.value.trim()) params.set('dueWithinDays', el.dueWithinDays.value.trim());
  params.set('sort', state.sortField);
  params.set('direction', state.sortDirection);
  params.set('page', state.ordersPage);
  params.set('pageSize', state.ordersPageSize);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const [pageData, allData] = await Promise.all([
    api(`/api/orders${suffix}`),
    (el.search.value.trim() || el.statusFilter.value || el.scopeFilter.value || el.dueWithinDays.value.trim()) ? api('/api/orders') : Promise.resolve(null),
    loadQualityAlertData(false)
  ]);
  state.orders = pageData.orders;
  state.ordersTotal = Number(pageData.total) || pageData.orders.length;
  state.ordersTotalPages = Number(pageData.totalPages) || 1;
  state.ordersPage = Number(pageData.page) || state.ordersPage;
  state.ordersPageSize = Number(pageData.pageSize) || state.ordersPageSize;
  state.ordersSummary = pageData.summary || null;
  state.allOrders = allData ? allData.orders : pageData.orders;
  renderOrders();
  renderDashboard();
  updateSortIndicators();
}

async function refreshOrdersIfVisible() {
  if (canViewTab('orders') && state.currentScreen === 'orders') {
    await loadOrders();
  }
}

function exportCurrentOrders() {
  const columns = state.columnOrder.filter((key) => ORDER_COLUMN_DEFS[key]);
  const rows = [
    columns.map((key) => ORDER_COLUMN_DEFS[key].label),
    ...state.orders.map((order) => columns.map((key) => exportOrderValue(order, key)))
  ];
  const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pedidos-venda-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportOrderValue(order, key) {
  const values = {
    orderNumber: order.orderNumber,
    commercialResponsible: order.commercialResponsible,
    customer: order.customer,
    sku: order.sku,
    itemType: itemTypeLabel(order.itemType),
    productionOrder: order.productionOrder,
    purchaseOrderNumber: order.purchaseOrderNumber,
    capacityTr: formatNumber(order.capacityTr),
    productLine: order.productLine,
    equipment: order.equipment,
    voltage: order.voltage,
    quantity: formatNumber(order.quantity),
    leadTime: order.leadTime,
    entryDate: formatDate(order.entryDate),
    originalDeliveryDate: formatDate(order.originalDeliveryDate),
    productionDeliveryDate: formatDate(order.productionDeliveryDate),
    daysLate: order.daysLate,
    finalizationDate: formatDate(order.finalizationDate),
    status: order.status,
    notes: order.notes
  };
  return values[key] ?? '';
}

function csvCell(value) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}

function renderOrders() {
  pruneSelectedOrders();
  el.ordersBody.innerHTML = '';
  el.emptyState.hidden = state.orders.length > 0;
  el.resultCount.textContent = `${state.ordersTotal} ${state.ordersTotal === 1 ? 'pedido encontrado' : 'pedidos encontrados'}`;
  el.ordersPageInfo.textContent = `Pagina ${state.ordersPage} de ${state.ordersTotalPages}`;
  el.ordersPrevPage.disabled = state.ordersPage <= 1;
  el.ordersNextPage.disabled = state.ordersPage >= state.ordersTotalPages;
  const userCanEdit = canEditOrders();
  renderOrderTableStructure();

  for (const order of state.orders) {
    const row = document.createElement('tr');
    const isSelected = state.selectedOrderIds.has(order.id);
    row.className = `${orderRowClass(order)}${isSelected ? ' is-selected' : ''}`;
    row.dataset.orderId = order.id;
    row.innerHTML = `${orderSelectionCell(order)}${state.columnOrder.map((key, index) => orderColumnCell(key, order, userCanEdit, index)).join('')}${orderActionsCell(order, userCanEdit)}`;
    el.ordersBody.appendChild(row);
  }

  updateSelectionActions();
  requestAnimationFrame(syncOrdersHorizontalScrollbar);
}

function orderSelectionCell(order) {
  const checked = state.selectedOrderIds.has(order.id) ? 'checked' : '';
  return `
    <td class="selection-cell sticky-first-cell">
      <input class="order-select" type="checkbox" data-select-order="${escapeHtml(order.id)}" aria-label="Selecionar pedido ${escapeHtml(order.orderNumber)}" ${checked}>
    </td>
  `;
}

function pruneSelectedOrders() {
  const visibleIds = new Set(state.orders.map((order) => order.id));
  state.selectedOrderIds = new Set([...state.selectedOrderIds].filter((id) => visibleIds.has(id)));
}

function getSelectedOrders() {
  return state.orders.filter((order) => state.selectedOrderIds.has(order.id));
}

function updateSelectionActions() {
  const selectedOrders = getSelectedOrders();
  const selectedCount = selectedOrders.length;

  el.selectedCount.textContent = `${selectedCount} ${selectedCount === 1 ? 'selecionado' : 'selecionados'}`;
  el.editSelectedOrder.hidden = !canEditOrders();
  el.editSelectedOrder.disabled = !canEditOrders() || selectedCount !== 1;
  el.changeSelectedStatus.hidden = !canEditOrders();
  el.changeSelectedStatus.disabled = !canEditOrders() || selectedCount < 1;

  const selectAll = el.ordersTable.querySelector('[data-select-all-orders]');
  if (selectAll) {
    selectAll.disabled = state.orders.length === 0;
    selectAll.checked = state.orders.length > 0 && selectedCount === state.orders.length;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < state.orders.length;
  }
}

function ensureOrderSummaryDialog() {
  let backdrop = document.querySelector('#orderSummaryBackdrop');
  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'orderSummaryBackdrop';
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <section class="dialog order-summary-dialog" role="dialog" aria-modal="true" aria-labelledby="orderSummaryTitle">
      <div class="dialog-header">
        <div>
          <h2 id="orderSummaryTitle">Resumo do pedido</h2>
          <span id="orderSummarySubtitle" class="order-summary-subtitle"></span>
        </div>
        <button class="btn icon-button" type="button" data-close-order-summary aria-label="Fechar resumo">X</button>
      </div>
      <div class="dialog-body order-summary-body" id="orderSummaryBody"></div>
      <div class="dialog-footer">
        <button class="btn primary" type="button" data-edit-order-summary>Editar</button>
        <button class="btn" type="button" data-close-order-summary>Fechar</button>
      </div>
    </section>
  `;
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-order-summary]');

    if (event.target === backdrop || event.target.closest('[data-close-order-summary]')) {
      closeOrderSummary();
      return;
    }

    if (editButton) {
      const order = state.orders.find((item) => item.id === backdrop.dataset.orderId);
      closeOrderSummary();
      if (order) openDialog(order);
    }
  });

  backdrop.addEventListener('change', (event) => {
    if (!event.target.closest('[data-order-stage]')) return;
    saveOrderStagesFromSummary(backdrop);
  });

  return backdrop;
}

function openOrderSummary(order) {
  if (!order) return;

  const backdrop = ensureOrderSummaryDialog();
  const title = backdrop.querySelector('#orderSummaryTitle');
  const subtitle = backdrop.querySelector('#orderSummarySubtitle');
  const body = backdrop.querySelector('#orderSummaryBody');
  const editButton = backdrop.querySelector('[data-edit-order-summary]');

  backdrop.dataset.orderId = order.id;
  title.textContent = `Pedido ${order.orderNumber || '-'}`;
  subtitle.textContent = `${order.customer || 'Cliente n\u00e3o informado'} | ${order.sku || 'SKU n\u00e3o informado'}`;
  editButton.hidden = !canEditOrders();
  body.innerHTML = `
    <div class="order-summary-status">
      <span>Status atual</span>
      <strong class="status ${statusClass(order.status)}">${escapeHtml(order.status || '-')}</strong>
    </div>
    <div class="order-summary-grid">
      ${summaryItem('Cliente', order.customer)}
      ${summaryItem('Respons\u00e1vel comercial', order.commercialResponsible)}
      ${summaryItem('SKU', order.sku)}
      ${summaryItem('Tipo', itemTypeLabel(order.itemType))}
      ${summaryItem('Equipamento', order.equipment)}
      ${summaryItem('Linha de produto', order.productLine)}
      ${summaryItem('Quantidade', formatNumber(order.quantity))}
      ${summaryItem('Capacidade (TR)', formatNumber(order.capacityTr))}
      ${summaryItem('OP', order.productionOrder || 'Ainda sem OP')}
      ${summaryItem('Pedido de compra', order.itemType === 'purchased' ? order.purchaseOrderNumber : 'N\u00e3o se aplica')}
      ${summaryItem('Data entrada', formatDate(order.entryDate))}
      ${summaryItem('Entrega original', formatDate(order.originalDeliveryDate))}
      ${summaryItem('Entrega produ\u00e7\u00e3o', formatDate(order.productionDeliveryDate))}
      ${summaryItem('Finaliza\u00e7\u00e3o', formatDate(order.finalizationDate))}
      ${summaryItem('Dias em atraso', order.daysLate)}
      ${summaryItem('Lead time', order.leadTime)}
    </div>
    ${orderStageChecklist(order)}
    <div class="order-summary-notes">
      <span>Observa\u00e7\u00f5es</span>
      <p>${escapeHtml(order.notes || 'Sem observa\u00e7\u00f5es.')}</p>
    </div>
  `;
  backdrop.classList.add('open');
}

function closeOrderSummary() {
  document.querySelector('#orderSummaryBackdrop')?.classList.remove('open');
}

async function saveOrderStagesFromSummary(backdrop) {
  const orderId = backdrop.dataset.orderId;
  if (!orderId || !canEditOrders()) return;

  const inputs = Array.from(backdrop.querySelectorAll('[data-order-stage]'));
  const stages = {};
  for (const input of inputs) {
    stages[input.dataset.orderStage] = input.checked;
    input.disabled = true;
  }

  try {
    const { order } = await api(`/api/orders/${encodeURIComponent(orderId)}/stages`, {
      method: 'PATCH',
      body: { stages }
    });
    updateOrderInMemory(order);
  } catch (error) {
    alert(error.message);
    const current = state.orders.find((item) => item.id === orderId);
    if (current) openOrderSummary(current);
  } finally {
    for (const input of inputs) {
      input.disabled = !canEditOrders();
    }
  }
}

function updateOrderInMemory(order) {
  if (!order) return;

  const replace = (item) => (item.id === order.id ? order : item);
  state.orders = state.orders.map(replace);
  state.allOrders = state.allOrders.map(replace);
}

function summaryItem(label, value) {
  const text = value === null || value === undefined || value === '' ? '-' : String(value);
  return `
    <div class="order-summary-item">
      <span>${escapeHtml(label)}</span>
      <strong title="${escapeHtml(text)}">${escapeHtml(text)}</strong>
    </div>
  `;
}

function orderStageChecklist(order) {
  const stages = order.stages || {};
  const disabled = canEditOrders() ? '' : 'disabled';
  return `
    <div class="order-summary-stages">
      <span>Etapas conclu\u00eddas</span>
      <div class="order-stage-grid">
        ${ORDER_STAGE_DEFS.map((stage) => `
          <label class="order-stage-option">
            <input type="checkbox" data-order-stage="${escapeHtml(stage.key)}" ${stages[stage.key] ? 'checked' : ''} ${disabled}>
            <strong>${escapeHtml(stage.label)}</strong>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function setupOrdersHorizontalScrollbar() {
  if (!el.ordersTableWrap || !el.ordersTopScrollbar || !el.ordersTopScrollbarInner) {
    return;
  }

  if (el.ordersTableWrap.dataset.scrollSync === 'ready') {
    return;
  }

  el.ordersTableWrap.dataset.scrollSync = 'ready';
  let isSyncingScroll = false;

  const syncScroll = (source, target) => {
    if (isSyncingScroll) {
      return;
    }

    isSyncingScroll = true;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      isSyncingScroll = false;
    });
  };

  el.ordersTableWrap.addEventListener('scroll', () => {
    syncScroll(el.ordersTableWrap, el.ordersTopScrollbar);
  });
  el.ordersTopScrollbar.addEventListener('scroll', () => {
    syncScroll(el.ordersTopScrollbar, el.ordersTableWrap);
  });
  window.addEventListener('resize', syncOrdersHorizontalScrollbar);
  syncOrdersHorizontalScrollbar();
}

function syncOrdersHorizontalScrollbar() {
  if (!el.ordersTable || !el.ordersTableWrap || !el.ordersTopScrollbar || !el.ordersTopScrollbarInner) {
    return;
  }

  const tableWidth = Math.max(el.ordersTable.scrollWidth, el.ordersTableWrap.scrollWidth);
  el.ordersTopScrollbarInner.style.width = `${tableWidth}px`;
  el.ordersTopScrollbar.scrollLeft = el.ordersTableWrap.scrollLeft;
}

function renderOrderTableStructure() {
  if (!state.columnOrder.length) {
    applyColumnOrder();
  }

  let colgroup = el.ordersTable.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('colgroup');
    el.ordersTable.insertBefore(colgroup, el.ordersTable.firstElementChild);
  }

  colgroup.innerHTML = [
    '<col style="width: 54px">',
    ...state.columnOrder.map((key) => `<col style="width: ${ORDER_COLUMN_DEFS[key].width}px">`),
    '<col style="width: 150px">'
  ].join('');

  const headerRow = el.ordersTable.querySelector('thead tr');
  headerRow.innerHTML = `
    <th class="selection-col sticky-first-cell"><input type="checkbox" data-select-all-orders aria-label="Selecionar pedidos"></th>
    ${state.columnOrder.map((key, index) => orderHeaderCell(key, index)).join('')}
    <th class="actions-col">Acoes</th>
  `;
}

function orderHeaderCell(key, index = -1) {
  const column = ORDER_COLUMN_DEFS[key];
  const content = column.sort
    ? `<button class="sort-button" type="button" data-sort="${column.sort}">${escapeHtml(column.label)}</button>`
    : `<span>${escapeHtml(column.label)}</span>`;
  const stickyClass = index === 0 ? 'sticky-second-cell' : '';

  return `<th class="${stickyClass}" draggable="true" data-column-key="${key}" title="Arraste para mover a coluna">${content}</th>`;
}

function orderColumnCell(key, order, userCanEdit, index = -1) {
  const renderers = {
    orderNumber: () => orderNumberCell(order),
    commercialResponsible: () => cell(order.commercialResponsible),
    customer: () => cell(order.customer),
    sku: () => cell(order.sku),
    itemType: () => cell(itemTypeLabel(order.itemType)),
    productionOrder: () => productionOrderCell(order, userCanEdit),
    purchaseOrderNumber: () => purchaseOrderCell(order, userCanEdit),
    capacityTr: () => cell(formatNumber(order.capacityTr)),
    productLine: () => cell(order.productLine),
    equipment: () => cell(order.equipment),
    voltage: () => cell(order.voltage),
    quantity: () => cell(formatNumber(order.quantity)),
    leadTime: () => cell(order.leadTime),
    entryDate: () => cell(formatDate(order.entryDate)),
    originalDeliveryDate: () => cell(formatDate(order.originalDeliveryDate)),
    productionDeliveryDate: () => productionDeliveryDateCell(order),
    daysLate: () => cell(order.daysLate),
    finalizationDate: () => cell(formatDate(order.finalizationDate)),
    status: () => statusCell(order),
    notes: () => cell(order.notes)
  };

  const html = renderers[key] ? renderers[key]() : '';
  return index === 0 ? addCellClass(html, 'sticky-second-cell') : html;
}

function addCellClass(html, className) {
  const text = String(html);
  if (!text.trim()) {
    return text;
  }

  if (text.startsWith('<td class="')) {
    return text.replace('<td class="', `<td class="${className} `);
  }

  return text.replace('<td', `<td class="${className}"`);
}

function orderNumberCell(order) {
  const orderNumber = order.orderNumber || '';
  const qualityMatches = activeQualityAlertMatches(order);
  const qualityMarkers = qualityAlertMarkers(order, qualityMatches);
  const hasPcpPending = hasOpenPcpPending(order);
  if (!hasPcpPending && !qualityMarkers) {
    return cell(orderNumber);
  }

  const pendingText = hasPcpPending
    ? `${order.pcpPendingCount} pendencia${Number(order.pcpPendingCount) === 1 ? '' : 's'} PCP aberta${Number(order.pcpPendingCount) === 1 ? '' : 's'}`
    : '';
  const pendingSummary = String(order.pcpPendingSummary || '').trim();
  const qualityText = qualityMatches.all.length
    ? `${qualityMatches.red.length} alerta(s) critico(s) e ${qualityMatches.yellow.length} alerta(s) relacionado(s) de qualidade`
    : '';
  const tooltip = [orderNumber, qualityText, pendingText, pendingSummary].filter(Boolean).join('\n');
  const pcpMarker = hasPcpPending
    ? `<span class="pcp-alert-mark" aria-label="Pendencia PCP" title="${escapeHtml(tooltip)}">!</span>`
    : '';
  return `
    <td title="${escapeHtml(tooltip)}">
      <span class="order-number-alert">
        ${qualityMarkers}
        ${pcpMarker}
        <span>${escapeHtml(orderNumber || '-')}</span>
      </span>
    </td>
  `;
}

function productionDeliveryDateCell(order) {
  const formattedDate = formatDate(order.productionDeliveryDate);
  if (!formattedDate) return cell('');

  if (!isProductionDeliveryDueSoon(order.productionDeliveryDate)) {
    return cell(formattedDate);
  }

  const title = `${formattedDate} - entrega produ\u00e7\u00e3o em at\u00e9 7 dias`;
  return `
    <td class="production-delivery-alert" title="${escapeHtml(title)}">
      <span>${escapeHtml(formattedDate)}</span>
      <strong class="delivery-alert-mark" aria-label="Alerta de entrega produ\u00e7\u00e3o">!</strong>
    </td>
  `;
}

function isProductionDeliveryDueSoon(value) {
  if (!isValidDateText(value)) return false;
  const deliveryDate = parseLocalDate(value);
  const today = todayAtMidnight();
  const daysUntilDelivery = Math.floor((deliveryDate - today) / 86400000);
  return daysUntilDelivery >= 0 && daysUntilDelivery <= 7;
}

function statusCell(order) {
  return `
    <td>
      <span class="status-stack">
        <span class="status ${statusClass(order.status)}">${labelStatus(order.status)}</span>
        <button class="photo-button ${order.photoCount ? 'has-photos' : ''}" type="button" data-photos="${order.id}" aria-label="Ver documentos do pedido" title="Ver documentos"></button>
      </span>
    </td>
  `;
}

function orderActionsCell(order, userCanEdit) {
  const canReleaseBilling = userCanEdit && isBillingReleaseReadyStatus(order.status) && !order.billingStage;
  if (!canReleaseBilling) {
    return '<td class="actions-cell actions-cell-empty"></td>';
  }

  return `
    <td class="row-actions actions-cell">
      <button class="btn primary" type="button" data-release-billing="${order.id}">Liberar fat.</button>
    </td>
  `;
}

function renderDashboard() {
  const summary = state.ordersSummary;
  const totalOrders = summary ? summary.totalOrders : state.orders.length;
  const totalEquipment = summary ? summary.totalEquipment : sumEquipment(state.orders);
  const averageLeadTime = summary ? summary.averageLeadTime : calculateAverageLeadTime(state.orders);
  const productionSet = new Set(state.productionStatuses);
  const productionOrders = state.allOrders.filter((order) => productionSet.has(order.status));

  el.dashboardOrders.textContent = formatInteger(totalOrders);
  el.dashboardEquipment.textContent = formatInteger(totalEquipment);
  el.dashboardLeadTime.textContent = averageLeadTime === null ? '-' : `${formatNumber(averageLeadTime)} dias`;
  el.dashboardProductionLabel.textContent = 'Máquinas em produção';
  el.dashboardProductionMachines.textContent = formatInteger(summary ? summary.productionMachines : sumEquipment(productionOrders));
}

async function loadBillingItems() {
  const data = await api('/api/billing/items');
  state.billingItems = data.releasedOrders || data.orders || [];
  state.billingInvoicedItems = data.invoicedOrders || [];
  renderBillingItems();
}

function renderBillingItems() {
  el.billingBody.innerHTML = '';
  el.billingEmpty.hidden = state.billingItems.length > 0;
  el.billingInvoicedContent.hidden = state.billingInvoicedCollapsed;
  el.billingInvoicedFilters.hidden = state.billingInvoicedCollapsed;
  el.toggleBillingInvoiced.textContent = state.billingInvoicedCollapsed ? 'Expandir faturados' : 'Recolher faturados';
  const canEditBilling = canEditTab('billing');

  for (const order of state.billingItems) {
    const row = document.createElement('tr');
    row.dataset.orderId = order.id;
    row.dataset.sourceType = billingSourceType(order);
    row.className = canEditBilling ? 'clickable-row' : '';
    row.innerHTML = `
      ${cell(order.orderNumber)}
      ${billingRequestTypeCell(order)}
      ${cell(billingSalesOrderLabel(order))}
      ${cell(billingPurchaseOrderLabel(order))}
      ${cell(order.customer)}
      ${cell(order.sku)}
      ${cell(order.equipment)}
      ${cell(formatNumber(order.quantity))}
      ${billingStatusCell(order)}
      ${cell(dimensionSummary(order))}
      ${cell(formatDateTime(order.billingReleasedAt))}
      <td class="row-actions">
        ${canEditBilling ? `<button class="btn primary" type="button" data-open-billing="${order.id}" data-source-type="${billingSourceType(order)}">Tratar faturamento</button>` : ''}
      </td>
    `;
    el.billingBody.appendChild(row);
  }

  el.billingInvoicedBody.innerHTML = '';
  const filteredInvoicedItems = filteredBillingInvoicedItems();
  el.billingInvoicedEmpty.hidden = filteredInvoicedItems.length > 0;
  el.billingInvoicedCount.textContent = billingInvoicedCountText(filteredInvoicedItems.length, state.billingInvoicedItems.length);

  for (const order of filteredInvoicedItems) {
    const row = document.createElement('tr');
    row.dataset.orderId = order.id;
    row.dataset.sourceType = billingSourceType(order);
    row.className = 'clickable-row';
    row.innerHTML = `
      ${cell(order.orderNumber)}
      ${billingRequestTypeCell(order)}
      ${cell(billingSalesOrderLabel(order))}
      ${cell(billingPurchaseOrderLabel(order))}
      ${cell(order.customer)}
      ${cell(order.sku)}
      ${cell(order.equipment)}
      ${cell(formatNumber(order.quantity))}
      ${cell(order.invoiceNumber)}
      ${cell(order.carrierName)}
      ${cell(order.carrierCnpj)}
      ${cell(order.billingCustomerName)}
      ${cell(order.billingCustomerCnpj)}
      ${cell(dimensionSummary(order))}
      ${cell(formatDateTime(order.invoicedAt))}
      <td class="row-actions">
        <button class="btn" type="button" data-view-invoiced="${order.id}" data-source-type="${billingSourceType(order)}">Consultar</button>
      </td>
    `;
    el.billingInvoicedBody.appendChild(row);
  }
}

function billingInvoicedCountText(filteredCount, totalCount) {
  if (!totalCount) {
    return 'Nenhum pedido faturado registrado';
  }

  if (filteredCount === totalCount) {
    return `${totalCount} ${totalCount === 1 ? 'item faturado' : 'itens faturados'} no historico`;
  }

  return `${filteredCount} de ${totalCount} itens faturados exibidos`;
}

function filteredBillingInvoicedItems() {
  const filters = state.billingInvoicedFilters;
  const search = normalizeText(filters.search);
  const sourceType = String(filters.sourceType || '').trim();
  const dateFrom = String(filters.dateFrom || '').trim();
  const dateTo = String(filters.dateTo || '').trim();
  const documentFilter = String(filters.document || '').trim();

  return state.billingInvoicedItems.filter((item) => {
    if (sourceType && billingSourceType(item) !== sourceType) {
      return false;
    }

    if (documentFilter === 'with' && !item.hasInvoiceDocument) {
      return false;
    }

    if (documentFilter === 'without' && item.hasInvoiceDocument) {
      return false;
    }

    const invoicedDate = billingInvoicedDateValue(item);
    if (dateFrom && (!invoicedDate || invoicedDate < dateFrom)) {
      return false;
    }

    if (dateTo && (!invoicedDate || invoicedDate > dateTo)) {
      return false;
    }

    if (!search) {
      return true;
    }

    return billingInvoicedSearchText(item).includes(search);
  });
}

function billingInvoicedDateValue(item = {}) {
  const value = String(item.invoicedAt || item.loadedAt || item.billingReleasedAt || '').trim();
  return value.slice(0, 10);
}

function billingInvoicedSearchText(item = {}) {
  return normalizeText([
    item.orderNumber,
    billingRequestTypeLabel(item),
    billingSalesOrderLabel(item),
    billingPurchaseOrderLabel(item),
    item.customer,
    item.sku,
    item.equipment,
    item.invoiceNumber,
    item.carrierName,
    item.carrierCnpj,
    item.billingCustomerName,
    item.billingCustomerCnpj,
    item.invoiceDocumentName,
    dimensionSummary(item),
    formatDateTime(item.invoicedAt)
  ].join(' '));
}

function billingSourceType(item = {}) {
  return item.sourceType === 'thirdParty' ? 'thirdParty' : 'order';
}

function billingRequestTypeLabel(item = {}) {
  return billingSourceType(item) === 'thirdParty' ? 'Beneficiamento' : 'Cliente';
}

function billingRequestTypeCell(item = {}) {
  const label = billingRequestTypeLabel(item);
  const extraClass = billingSourceType(item) === 'thirdParty' ? '' : 'client-source-badge';
  return `<td><span class="source-badge ${extraClass}">${escapeHtml(label)}</span></td>`;
}

function billingSalesOrderLabel(item = {}) {
  if (billingSourceType(item) === 'thirdParty') {
    return thirdPartyLinkedOrderLabel(item);
  }

  return item.orderNumber || '-';
}

function billingPurchaseOrderLabel(item = {}) {
  return item.purchaseOrderNumber || '-';
}

function billingDialogSubtitle(order = {}) {
  const origin = billingSourceType(order) === 'thirdParty'
    ? `Romaneio ${order.romaneioNumber || order.orderNumber || '-'}`
    : `Pedido ${order.orderNumber || '-'}`;
  const salesOrder = billingSourceType(order) === 'thirdParty' ? `PV ${billingSalesOrderLabel(order)}` : '';
  const purchaseOrder = order.purchaseOrderNumber ? `PC ${order.purchaseOrderNumber}` : '';
  return [
    billingRequestTypeLabel(order),
    origin,
    salesOrder,
    purchaseOrder,
    order.customer || 'Cliente nao informado',
    order.sku || 'SKU nao informado'
  ].filter(Boolean).join(' | ');
}

function billingStatusCell(item = {}) {
  return `
    <td>
      <span class="status-stack">
        <span class="status ${statusClass(item.status)}">${escapeHtml(labelStatus(item.status))}</span>
        ${billingSourceType(item) === 'thirdParty' ? '<span class="source-badge">Remessa beneficiamento</span>' : ''}
      </span>
    </td>
  `;
}

function billingItemApiBase(sourceType, id) {
  const cleanId = encodeURIComponent(id);
  return sourceType === 'thirdParty'
    ? `/api/third-party-parts/${cleanId}`
    : `/api/orders/${cleanId}`;
}

function findBillingItem(orderId, sourceType = '') {
  const cleanSource = sourceType || '';
  return [...state.billingItems, ...state.billingInvoicedItems, ...state.loadingItems, ...state.thirdPartyItems]
    .find((item) => item.id === orderId && (!cleanSource || billingSourceType(item) === cleanSource))
    || [...state.billingItems, ...state.billingInvoicedItems, ...state.loadingItems, ...state.thirdPartyItems].find((item) => item.id === orderId);
}

async function loadThirdPartyParts() {
  const [thirdPartyData] = await Promise.all([
    api('/api/third-party-parts'),
    loadThirdPartyOrderOptions()
  ]);
  state.thirdPartyItems = thirdPartyData.items || [];
  renderThirdPartyParts();
}

async function loadThirdPartyOrderOptions() {
  const params = new URLSearchParams();
  params.set('sort', 'orderNumber');
  params.set('direction', 'desc');
  const { orders = [] } = await api(`/api/orders?${params.toString()}`);
  state.thirdPartyOrderOptions = orders;
  renderThirdPartyOrderOptions();
  return orders;
}

function renderThirdPartyOrderOptions() {
  const currentValue = el.thirdPartySalesOrderId.value;
  el.thirdPartySalesOrderId.innerHTML = '<option value="">Sem vinculo</option>';

  for (const order of state.thirdPartyOrderOptions) {
    const label = [order.orderNumber, order.customer, order.sku, order.productionOrder]
      .filter(Boolean)
      .join(' | ');
    el.thirdPartySalesOrderId.appendChild(new Option(label || order.id, order.id));
  }

  if (state.thirdPartyOrderOptions.some((order) => order.id === currentValue)) {
    el.thirdPartySalesOrderId.value = currentValue;
  }
}

function renderThirdPartyParts() {
  el.thirdPartyBody.innerHTML = '';
  el.thirdPartyEmpty.hidden = state.thirdPartyItems.length > 0;
  el.thirdPartyCount.textContent = `${state.thirdPartyItems.length} ${state.thirdPartyItems.length === 1 ? 'remessa' : 'remessas'}`;
  el.thirdPartyFormPanel.hidden = !canEditTab('thirdParty') || !canViewTab('thirdParty');
  if (!el.thirdPartyIssueDate.value) {
    el.thirdPartyIssueDate.value = localDateInputValue(todayAtMidnight());
  }

  const canEditThirdParty = canEditTab('thirdParty');
  for (const item of state.thirdPartyItems) {
    const row = document.createElement('tr');
    row.dataset.orderId = item.id;
    row.dataset.sourceType = 'thirdParty';
    row.className = `${billingSourceType(item) === 'thirdParty' && item.status === 'Retornado' ? 'third-party-returned' : ''} clickable-row`.trim();
    row.innerHTML = `
      <td><span class="status ${statusClass(item.status)}">${escapeHtml(item.status || '-')}</span></td>
      ${cell(item.romaneioNumber)}
      ${cell(item.supplierName)}
      ${cell(thirdPartyLinkedOrderLabel(item))}
      ${thirdPartyPurchaseOrderCell(item, canEditThirdParty)}
      ${cell(item.partCode)}
      ${cell(item.partDescription)}
      ${cell(`${formatNumber(item.quantity)} ${item.unit || ''}`.trim())}
      ${cell(item.processDescription)}
      ${cell(formatDate(item.issueDate))}
      ${cell(formatDate(item.expectedReturnDate))}
      ${cell(item.invoiceNumber || '-')}
      ${cell(thirdPartyBillingStageLabel(item))}
      <td class="row-actions">
        ${canEditThirdParty && item.billingStage === 'loaded' && item.status !== 'Retornado' ? `<button class="btn primary" type="button" data-return-third-party="${item.id}">Registrar retorno</button>` : ''}
        ${canEditThirdParty && ['', 'released'].includes(item.billingStage || '') ? `<button class="btn danger" type="button" data-delete-third-party="${item.id}">Excluir</button>` : ''}
      </td>
    `;
    el.thirdPartyBody.appendChild(row);
  }
}

function thirdPartyBillingStageLabel(item) {
  if (item.status === 'Retornado') return 'Retornado';
  if (item.billingStage === 'loaded') return 'Em poder de terceiros';
  if (item.billingStage === 'invoiced') return 'Faturado / aguardando envio';
  if (item.billingStage === 'released') return 'No faturamento';
  return 'Aguardando pedido de compra';
}

function thirdPartyLinkedOrderLabel(item) {
  return item.linkedOrderNumber
    ? [item.linkedOrderNumber, item.linkedOrderCustomer, item.linkedOrderSku].filter(Boolean).join(' | ')
    : (item.salesOrderReference || '-');
}

function thirdPartyPurchaseOrderCell(item, canEditThirdParty) {
  const text = item.purchaseOrderNumber || '';
  const canEditPurchaseOrder = canEditThirdParty
    && !['invoiced', 'loaded'].includes(item.billingStage || '')
    && item.status !== 'Retornado';

  if (!canEditPurchaseOrder) {
    return cell(text || '-');
  }

  const buttonLabel = text ? 'Salvar PC' : 'Liberar fat.';
  return `
    <td class="purchase-order-entry" title="${escapeHtml(text)}">
      <span class="cell-action-wrap third-party-purchase-order-wrap">
        <input class="input compact-input" data-third-party-purchase-order-input="${escapeHtml(item.id)}" value="${escapeHtml(text)}" placeholder="Pedido compra">
        <button class="inline-action" type="button" data-save-third-party-purchase-order="${escapeHtml(item.id)}">${buttonLabel}</button>
      </span>
    </td>
  `;
}

function thirdPartyPayload() {
  return {
    romaneioNumber: el.thirdPartyRomaneioNumber.value,
    issueDate: el.thirdPartyIssueDate.value,
    expectedReturnDate: el.thirdPartyExpectedReturnDate.value,
    supplierName: el.thirdPartySupplierName.value,
    supplierCnpj: el.thirdPartySupplierCnpj.value,
    salesOrderId: el.thirdPartySalesOrderId.value,
    salesOrderReference: el.thirdPartySalesOrderReference.value,
    partCode: el.thirdPartyPartCode.value,
    partDescription: el.thirdPartyPartDescription.value,
    quantity: el.thirdPartyQuantity.value,
    unit: el.thirdPartyUnit.value,
    processDescription: el.thirdPartyProcessDescription.value,
    notes: el.thirdPartyNotes.value
  };
}

function resetThirdPartyForm() {
  el.thirdPartyForm.reset();
  el.thirdPartyIssueDate.value = localDateInputValue(todayAtMidnight());
  el.thirdPartyUnit.value = 'UN';
  el.thirdPartySalesOrderId.value = '';
}

async function submitThirdPartyPart() {
  el.thirdPartyError.hidden = true;
  try {
    await api('/api/third-party-parts', {
      method: 'POST',
      body: thirdPartyPayload()
    });
    resetThirdPartyForm();
    await loadThirdPartyParts();
    if (state.currentScreen === 'billing') await loadBillingItems();
  } catch (error) {
    el.thirdPartyError.textContent = error.message;
    el.thirdPartyError.hidden = false;
  }
}

async function markThirdPartyReturned(id) {
  try {
    await api(`/api/third-party-parts/${encodeURIComponent(id)}/return`, { method: 'PATCH' });
    await loadThirdPartyParts();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteThirdPartyPart(id) {
  const item = state.thirdPartyItems.find((entry) => entry.id === id);
  const label = item?.romaneioNumber || 'esta remessa';
  if (!confirm(`Excluir ${label}? Esta acao remove a solicitacao antes do faturamento.`)) return;

  try {
    await api(`/api/third-party-parts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadThirdPartyParts();
    if (state.currentScreen === 'billing') await loadBillingItems();
  } catch (error) {
    alert(error.message);
  }
}

async function saveThirdPartyPurchaseOrder(id) {
  const input = document.querySelector(`[data-third-party-purchase-order-input="${cssEscape(id)}"]`);
  const purchaseOrderNumber = String(input?.value || '').trim();
  if (!purchaseOrderNumber) {
    alert('Informe o numero do pedido de compra para liberar a remessa ao faturamento.');
    input?.focus();
    return;
  }

  try {
    await api(`/api/third-party-parts/${encodeURIComponent(id)}/purchase-order`, {
      method: 'PATCH',
      body: { purchaseOrderNumber }
    });
    await loadThirdPartyParts();
    if (state.currentScreen === 'billing') await loadBillingItems();
  } catch (error) {
    alert(error.message);
  }
}

async function loadLoadingItems() {
  const { orders } = await api('/api/loading/items');
  state.loadingItems = orders;
  renderLoadingItems();
}

function renderLoadingItems() {
  el.loadingBody.innerHTML = '';
  const visibleItems = filteredLoadingItems();
  el.loadingEmpty.hidden = visibleItems.length > 0;
  const canEditLoading = canEditTab('loading');

  for (const order of visibleItems) {
    const row = document.createElement('tr');
    row.dataset.orderId = order.id;
    row.dataset.sourceType = billingSourceType(order);
    row.innerHTML = `
      ${cell(order.orderNumber)}
      ${cell(order.customer)}
      ${cell(order.sku)}
      ${cell(order.equipment)}
      ${cell(formatNumber(order.quantity))}
      ${cell(order.carrierName)}
      ${cell(order.invoiceNumber)}
      ${cell(formatDateTime(order.invoicedAt))}
      ${cell(dimensionSummary(order))}
      <td class="row-actions">
        ${order.hasInvoiceDocument ? `<button class="btn" type="button" data-download-invoice="${order.id}" data-source-type="${billingSourceType(order)}">Baixar</button>` : '<span class="muted-cell">Sem NF</span>'}
      </td>
      <td class="row-actions">
        ${canEditLoading ? `<button class="btn primary" type="button" data-mark-loaded="${order.id}" data-source-type="${billingSourceType(order)}">Carregado</button>` : ''}
      </td>
    `;
    el.loadingBody.appendChild(row);
  }
}

function filteredLoadingItems() {
  const search = normalizeText(state.loadingSearch);
  if (!search) return state.loadingItems;

  return state.loadingItems.filter((order) => {
    return normalizeText(order.orderNumber).includes(search)
      || normalizeText(order.carrierName).includes(search)
      || normalizeText(order.customer).includes(search)
      || normalizeText(order.sourceLabel).includes(search);
  });
}

async function loadPcpScreen() {
  await Promise.all([
    loadPcpOrderOptions(),
    loadPcpMotives(),
    loadPcpPendingIssues()
  ]);
  state.pcpFormOpen = state.pcpFormOpen && canEditTab('pcp') && canViewTab('pcp');
  updatePcpPendingFormVisibility();
}

async function loadPcpOrderOptions() {
  const params = new URLSearchParams();
  params.set('sort', 'orderNumber');
  params.set('direction', 'desc');

  const { orders } = await api(`/api/orders?${params.toString()}`);
  state.pcpOrderOptions = orders;
  renderPcpOrderOptions();
}

function renderPcpOrderOptions() {
  const currentValue = el.pcpOrder.value;
  el.pcpOrder.innerHTML = `
    <option value="">Selecione o pedido</option>
    ${state.pcpOrderOptions.map((order) => {
      const label = [
        order.orderNumber || 'Sem numero',
        order.customer || 'Sem cliente',
        order.sku || 'Sem SKU'
      ].join(' | ');
      return `<option value="${escapeHtml(order.id)}">${escapeHtml(label)}</option>`;
    }).join('')}
  `;

  if (state.pcpOrderOptions.some((order) => order.id === currentValue)) {
    el.pcpOrder.value = currentValue;
  }
}

async function loadPcpMotives() {
  const { motives = [] } = await api('/api/pcp-pending-motives');
  state.pcpMotiveOptions = motives;
  renderPcpMotiveOptions();
}

function renderPcpMotiveOptions() {
  if (!el.pcpMotive) return;

  const currentValue = el.pcpMotive.value;
  const reason = el.pcpReason?.value || 'purchase';
  const motives = state.pcpMotiveOptions.filter((motive) => motive.reason === reason);
  el.pcpMotive.innerHTML = `
    <option value="">Selecione um motivo</option>
    ${motives.map((motive) => `<option value="${escapeHtml(motive.name)}">${escapeHtml(motive.name)}</option>`).join('')}
  `;

  if (motives.some((motive) => motive.name === currentValue)) {
    el.pcpMotive.value = currentValue;
  }
}

function updatePcpPendingFormVisibility() {
  const canEditPcp = canEditTab('pcp') && canViewTab('pcp');
  if (el.pcpNewPending) el.pcpNewPending.hidden = !canEditPcp;
  if (el.pcpAddMotive) el.pcpAddMotive.hidden = !canEditPcp;
  if (el.pcpPendingForm) el.pcpPendingForm.hidden = !canEditPcp || !state.pcpFormOpen;
  togglePcpPurchaseOrderField();
}

function openPcpPendingForm() {
  if (!canEditTab('pcp') || !canViewTab('pcp')) return;
  state.pcpFormOpen = true;
  updatePcpPendingFormVisibility();
  renderPcpMotiveOptions();
  el.pcpOrder.focus();
}

function closePcpPendingForm({ reset = true } = {}) {
  if (reset) {
    el.pcpPendingForm.reset();
    el.pcpPendingError.hidden = true;
    el.pcpPendingError.textContent = '';
  }
  state.pcpFormOpen = false;
  updatePcpPendingFormVisibility();
  renderPcpMotiveOptions();
}

function togglePcpPurchaseOrderField() {
  if (!el.pcpPurchaseOrderField) return;

  const isPurchase = el.pcpReason?.value === 'purchase';
  el.pcpPurchaseOrderField.hidden = !isPurchase;
  if (!isPurchase && el.pcpPurchaseOrderNumber) {
    el.pcpPurchaseOrderNumber.value = '';
  }
}

async function addPcpMotive() {
  const reason = el.pcpReason.value;
  const value = prompt('Informe o motivo da pendencia:', '');
  if (value === null) return;

  const name = value.trim();
  if (!name) return;

  try {
    const { motive } = await api('/api/pcp-pending-motives', {
      method: 'POST',
      body: { reason, name }
    });
    await loadPcpMotives();
    if (motive?.name) {
      el.pcpMotive.value = motive.name;
    }
  } catch (error) {
    alert(error.message);
  }
}

async function loadPcpPendingIssues() {
  const params = new URLSearchParams();
  if (el.pcpStatusFilter.value) params.set('status', el.pcpStatusFilter.value);
  if (el.pcpSearch.value.trim()) params.set('search', el.pcpSearch.value.trim());

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const { issues } = await api(`/api/pcp-pendencies${suffix}`);
  state.pcpPendingIssues = issues;
  renderPcpPendingIssues();
}

function renderPcpPendingIssues() {
  el.pcpPendingBody.innerHTML = '';
  const rows = sortedPcpPendingIssues();
  const total = state.pcpPendingIssues.length;
  el.pcpPendingEmpty.hidden = rows.length > 0;
  el.pcpPendingCount.textContent = rows.length === total
    ? `${total} ${total === 1 ? 'pendencia' : 'pendencias'}`
    : `${rows.length} de ${total} pendencias`;
  if (el.pcpSortField) el.pcpSortField.value = state.pcpSortField;
  if (el.pcpSortDirection) el.pcpSortDirection.value = state.pcpSortDirection;
  syncPcpTableControls();
  const canEditPcp = canEditTab('pcp');

  for (const issue of rows) {
    const row = document.createElement('tr');
    row.className = issue.issueStatus === 'resolved'
      ? 'pcp-issue-resolved'
      : `pcp-issue-open${isPcpIssueOverdue(issue) ? ' pcp-issue-overdue' : ''}`;
    const canEditOpen = canEditPcp && issue.issueStatus !== 'resolved';
    const expectedDateCell = canEditPcp && issue.issueStatus !== 'resolved'
      ? `<td><input class="input pcp-date-input" type="date" value="${escapeHtml(issue.expectedResolutionDate || '')}" data-pcp-date-input="${issue.id}" aria-label="Data prevista"></td>`
      : cell(formatDate(issue.expectedResolutionDate));
    const purchaseOrderCell = issue.reason === 'purchase' && canEditPcp
      ? `<td class="pcp-purchase-order-cell">
          <span class="cell-action-wrap pcp-purchase-order-wrap">
            <input class="input compact-input pcp-purchase-order-input" value="${escapeHtml(issue.purchaseOrderNumber || '')}" data-pcp-purchase-order-input="${issue.id}" placeholder="Pedido compra" aria-label="Pedido de compra">
            <button class="inline-action" type="button" data-save-pcp-purchase-order="${issue.id}">Salvar</button>
          </span>
        </td>`
      : cell(issue.purchaseOrderNumber || '');
    row.innerHTML = `
      <td><span class="pcp-issue-badge ${issue.issueStatus === 'resolved' ? 'resolved' : 'open'}">${escapeHtml(issue.issueStatusLabel)}</span></td>
      ${cell(issue.orderNumber)}
      ${cell(issue.customer)}
      ${cell(issue.sku)}
      ${cell(issue.productionOrder || 'Sem OP')}
      <td><span class="status ${statusClass(issue.orderStatus)}">${labelStatus(issue.orderStatus)}</span></td>
      ${cell(issue.componentCode)}
      ${cell(issue.reasonLabel)}
      ${cell(issue.motive)}
      ${purchaseOrderCell}
      ${expectedDateCell}
      ${cell(issue.notes)}
      ${cell(issue.createdBy)}
      ${cell(formatDateTime(issue.createdAt))}
      ${cell(formatDateTime(issue.resolvedAt))}
      <td class="row-actions">
        ${canEditOpen ? `<button class="btn" type="button" data-save-pcp-date="${issue.id}">Salvar data</button>` : ''}
        ${canEditOpen ? `<button class="btn primary" type="button" data-resolve-pcp="${issue.id}">Resolver</button>` : ''}
        ${canEditPcp ? `<button class="btn danger" type="button" data-delete-pcp="${issue.id}">Excluir</button>` : ''}
      </td>
    `;
    el.pcpPendingBody.appendChild(row);
  }
}

function syncPcpTableControls() {
  if (!el.pcpPendingTable) return;

  el.pcpPendingTable.querySelectorAll('[data-pcp-sort]').forEach((button) => {
    const isActive = button.dataset.pcpSort === state.pcpSortField;
    button.classList.toggle('active', isActive);
    button.dataset.direction = isActive ? state.pcpSortDirection : '';
  });

  el.pcpPendingTable.querySelectorAll('[data-pcp-filter]').forEach((field) => {
    const value = state.pcpColumnFilters[field.dataset.pcpFilter] || '';
    if (field.value !== value && document.activeElement !== field) {
      field.value = value;
    }
  });
}

function sortedPcpPendingIssues() {
  const direction = state.pcpSortDirection === 'desc' ? -1 : 1;
  return filteredPcpPendingIssues().sort((a, b) => {
    const result = compareText(pcpSortValue(a, state.pcpSortField), pcpSortValue(b, state.pcpSortField));
    if (result !== 0) return result * direction;
    return compareText(a.orderNumber, b.orderNumber) || compareText(a.componentCode, b.componentCode);
  });
}

function filteredPcpPendingIssues() {
  const filters = Object.entries(state.pcpColumnFilters)
    .map(([key, value]) => [key, String(value || '').trim()])
    .filter(([, value]) => value);

  if (!filters.length) return [...state.pcpPendingIssues];

  return state.pcpPendingIssues.filter((issue) => {
    return filters.every(([key, value]) => {
      if (key === 'issueStatus' || key === 'reason') {
        return String(issue[key] || '') === value;
      }

      return normalizeText(pcpFilterValue(issue, key)).includes(normalizeText(value));
    });
  });
}

function pcpFilterValue(issue, field) {
  if (field === 'issueStatus') return issue.issueStatus || '';
  if (field === 'issueStatusLabel') return issue.issueStatusLabel || '';
  if (field === 'reason') return issue.reason || '';
  if (field === 'reasonLabel') return issue.reasonLabel || '';
  if (field === 'orderStatus') return labelStatus(issue.orderStatus);
  if (field === 'createdAt' || field === 'resolvedAt') return formatDateTime(issue[field]);
  if (field === 'expectedResolutionDate') return issue.expectedResolutionDate || '';
  return issue[field] || '';
}

function pcpSortValue(issue, field) {
  if (field === 'expectedResolutionDate') return issue.expectedResolutionDate || '';
  if (field === 'createdAt' || field === 'resolvedAt') return issue[field] || '';
  if (field === 'orderStatus') return labelStatus(issue.orderStatus);
  return issue[field] || '';
}

function compareText(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

function isPcpIssueOverdue(issue) {
  if (issue.issueStatus === 'resolved' || !isValidDateText(issue.expectedResolutionDate)) {
    return false;
  }

  return parseLocalDate(issue.expectedResolutionDate) < todayAtMidnight();
}

async function submitPcpPendingIssue() {
  el.pcpPendingError.hidden = true;

  try {
    await api('/api/pcp-pendencies', {
      method: 'POST',
      body: {
        orderId: el.pcpOrder.value,
        componentCode: el.pcpComponentCode.value,
        reason: el.pcpReason.value,
        motive: el.pcpMotive.value,
        purchaseOrderNumber: el.pcpPurchaseOrderNumber.value,
        expectedResolutionDate: el.pcpExpectedResolutionDate.value,
        notes: el.pcpNotes.value
      }
    });

    closePcpPendingForm();
    await loadPcpPendingIssues();
  } catch (error) {
    el.pcpPendingError.textContent = error.message;
    el.pcpPendingError.hidden = false;
  }
}

async function resolvePcpPendingIssue(id) {
  try {
    await api(`/api/pcp-pendencies/${encodeURIComponent(id)}/resolve`, { method: 'PATCH' });
    await loadPcpPendingIssues();
  } catch (error) {
    alert(error.message);
  }
}

async function updatePcpPendingIssueExpectedDate(id) {
  const input = Array.from(el.pcpPendingBody.querySelectorAll('[data-pcp-date-input]'))
    .find((item) => item.dataset.pcpDateInput === String(id));
  const expectedResolutionDate = input ? input.value : '';

  try {
    await api(`/api/pcp-pendencies/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { expectedResolutionDate }
    });
    await loadPcpPendingIssues();
  } catch (error) {
    alert(error.message);
  }
}

async function updatePcpPendingIssuePurchaseOrder(id) {
  const input = Array.from(el.pcpPendingBody.querySelectorAll('[data-pcp-purchase-order-input]'))
    .find((item) => item.dataset.pcpPurchaseOrderInput === String(id));
  const purchaseOrderNumber = input ? input.value : '';

  try {
    await api(`/api/pcp-pendencies/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { purchaseOrderNumber }
    });
    await loadPcpPendingIssues();
  } catch (error) {
    alert(error.message);
  }
}

async function deletePcpPendingIssue(id) {
  if (!confirm('Excluir esta pendencia PCP?')) return;

  try {
    await api(`/api/pcp-pendencies/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadPcpPendingIssues();
  } catch (error) {
    alert(error.message);
  }
}

async function loadSequencing() {
  try {
    el.sequencingError.hidden = true;
    const { activities = [] } = await api('/api/sequencing');
    state.sequencingActivities = activities;
    renderSequencing();
  } catch (error) {
    state.sequencingActivities = [];
    renderSequencing();
    el.sequencingError.textContent = error.message;
    el.sequencingError.hidden = false;
  }
}

function renderSequencing() {
  ensureSequencingScheduleDefaults();
  const activities = state.sequencingActivities || [];
  const totalPending = activities.reduce((sum, activity) => sum + (Number(activity.totalOrders) || 0), 0);
  el.sequencingCount.textContent = `${totalPending} ${totalPending === 1 ? 'pendencia' : 'pendencias'}`;
  el.sequencingEmpty.hidden = totalPending > 0;
  renderSequencingGantt();
  el.sequencingBoard.innerHTML = activities.map((activity) => sequencingActivityCard(activity)).join('');
}

function sequencingActivityCard(activity) {
  const canEditSequencing = canEditTab('sequencing');
  const items = activity.items || [];
  return `
    <section class="sequencing-card" data-sequencing-activity="${escapeHtml(activity.key)}">
      <div class="sequencing-card-header">
        <div>
          <strong>${escapeHtml(activity.label)}</strong>
          <span>${formatInteger(activity.totalOrders)} pedidos / ${formatInteger(activity.totalQuantity)} maquinas</span>
        </div>
        <div class="row-actions">
          ${canEditSequencing ? `<button class="btn" type="button" data-generate-sequence="${escapeHtml(activity.key)}">Gerar</button>` : ''}
          ${canEditSequencing ? `<button class="btn primary" type="button" data-save-sequence="${escapeHtml(activity.key)}">Salvar</button>` : ''}
        </div>
      </div>
      ${items.length ? sequencingTable(activity, canEditSequencing) : '<div class="empty sequencing-card-empty">Sem itens pendentes.</div>'}
    </section>
  `;
}

function sequencingTable(activity, canEditSequencing) {
  return `
    <div class="table-wrap sequencing-table-wrap">
      <table class="sequencing-table">
        <thead>
          <tr>
            <th>Seq.</th>
            <th>Tempo est. (h)</th>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>SKU</th>
            <th>OP</th>
            <th>Linha / Cap.</th>
            <th>Qtd.</th>
            <th>Status</th>
            <th>Entrega prod.</th>
            <th>Entrega original</th>
            <th>Atraso</th>
            <th>PCP</th>
          </tr>
        </thead>
        <tbody>
          ${(activity.items || []).map((item) => sequencingRow(item, canEditSequencing)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function sequencingRow(item, canEditSequencing) {
  const sequence = item.sequenceNumber || item.suggestedSequence || '';
  const estimatedHours = item.estimatedHours ?? '';
  const pcpTitle = item.pcpPendingSummary || '';
  const pcpCell = Number(item.pcpPendingCount) > 0
    ? `<td title="${escapeHtml(pcpTitle)}"><span class="pcp-alert-mark">!</span> ${formatInteger(item.pcpPendingCount)}</td>`
    : cell('');
  const sequenceCell = canEditSequencing
    ? `<td><input class="input sequence-input" type="number" min="1" step="1" value="${escapeHtml(sequence)}" data-sequence-input data-order-id="${escapeHtml(item.orderId)}" aria-label="Sequencia ${escapeHtml(item.orderNumber)}"></td>`
    : cell(sequence);
  const estimatedCell = canEditSequencing
    ? `<td><input class="input sequence-time-input" type="number" min="0" step="0.25" value="${escapeHtml(estimatedHours)}" data-sequence-hours data-order-id="${escapeHtml(item.orderId)}" aria-label="Tempo estimado ${escapeHtml(item.orderNumber)}"></td>`
    : cell(formatNumber(estimatedHours));
  const lineCapacity = [item.productLine, formatCapacity(item.capacityTr)].filter(Boolean).join(' / ');

  return `
    <tr class="${Number(item.pcpPendingCount) > 0 ? 'sequencing-row-pcp' : ''}">
      ${sequenceCell}
      ${estimatedCell}
      ${cell(item.orderNumber)}
      ${cell(item.customer)}
      ${cell(item.sku)}
      ${cell(item.productionOrder || 'Sem OP')}
      ${cell(lineCapacity)}
      ${cell(formatInteger(item.quantity))}
      <td><span class="status ${statusClass(item.status)}">${escapeHtml(labelStatus(item.status))}</span></td>
      ${cell(formatDate(item.productionDeliveryDate))}
      ${cell(formatDate(item.originalDeliveryDate))}
      ${cell(formatInteger(item.daysLate))}
      ${pcpCell}
    </tr>
  `;
}

function formatCapacity(value) {
  if (value === null || value === undefined || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return `${formatNumber(number)} TR`;
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === 'function') {
    return window.CSS.escape(String(value));
  }
  return String(value).replace(/["\\]/g, '\\$&');
}

async function generateSequencing(activityKey = '') {
  try {
    el.sequencingError.hidden = true;
    const { activities = [] } = await api('/api/sequencing/generate', {
      method: 'POST',
      body: { activityKey }
    });
    state.sequencingActivities = activities;
    renderSequencing();
  } catch (error) {
    el.sequencingError.textContent = error.message;
    el.sequencingError.hidden = false;
  }
}

async function saveSequencing(activityKey) {
  const card = el.sequencingBoard.querySelector(`[data-sequencing-activity="${cssEscape(activityKey)}"]`);
  const items = Array.from(card?.querySelectorAll('[data-sequence-input]') || []).map((input) => ({
    orderId: input.dataset.orderId,
    sequenceNumber: input.value,
    estimatedHours: card.querySelector(`[data-sequence-hours][data-order-id="${cssEscape(input.dataset.orderId)}"]`)?.value || ''
  }));

  try {
    el.sequencingError.hidden = true;
    const { activities = [] } = await api(`/api/sequencing/${encodeURIComponent(activityKey)}`, {
      method: 'PATCH',
      body: { items }
    });
    state.sequencingActivities = activities;
    renderSequencing();
  } catch (error) {
    el.sequencingError.textContent = error.message;
    el.sequencingError.hidden = false;
  }
}

function ensureSequencingScheduleDefaults() {
  if (!state.sequencingStartDate) {
    state.sequencingStartDate = localDateInputValue(todayAtMidnight());
  }
  if (!Number.isFinite(Number(state.sequencingDailyHours)) || Number(state.sequencingDailyHours) <= 0) {
    state.sequencingDailyHours = 8;
  }
  if (el.sequencingStartDate) el.sequencingStartDate.value = state.sequencingStartDate;
  if (el.sequencingDailyHours) el.sequencingDailyHours.value = state.sequencingDailyHours;
}

function renderSequencingGantt() {
  const schedule = buildSequencingSchedule();
  if (el.sequencingGanttTimestamp) {
    el.sequencingGanttTimestamp.textContent = `Gerado em ${formatDateTimeObject(new Date())}`;
  }
  el.sequencingGanttSummary.textContent = schedule.summary;

  if (!schedule.rows.length) {
    el.sequencingGantt.innerHTML = '<div class="empty sequencing-card-empty">Informe tempo estimado nos itens e salve para montar o cronograma.</div>';
    return;
  }

  el.sequencingGantt.innerHTML = schedule.activities.map((activity) => {
    const rows = schedule.rows.filter((row) => row.activityKey === activity.key);
    if (!rows.length) return '';

    return `
      <section class="gantt-lane">
        <div class="gantt-lane-title">
          <strong>${escapeHtml(activity.label)}</strong>
          <span>${formatInteger(rows.length)} itens</span>
        </div>
        <div class="gantt-track">
          ${rows.map((row) => ganttBar(row, schedule)).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function ganttBar(row, schedule) {
  const total = Math.max(1, schedule.rangeEnd - schedule.rangeStart);
  const left = Math.max(0, ((row.startAt - schedule.rangeStart) / total) * 100);
  const width = Math.max(1.5, ((row.endAt - row.startAt) / total) * 100);
  const title = [
    `${row.activityLabel} - ${row.orderNumber}`,
    `Seq.: ${row.sequenceNumber}`,
    `Tempo: ${formatNumber(row.estimatedHours)} h`,
    `Inicio: ${formatDateTimeObject(row.startAt)}`,
    `Fim: ${formatDateTimeObject(row.endAt)}`
  ].join('\n');

  return `
    <div class="gantt-row">
      <span class="gantt-row-label">${escapeHtml(row.sequenceNumber)}. ${escapeHtml(row.orderNumber)}</span>
      <span class="gantt-bar" title="${escapeHtml(title)}" style="left: ${left.toFixed(3)}%; width: ${width.toFixed(3)}%;">
        ${escapeHtml(row.orderNumber)}
      </span>
    </div>
  `;
}

function buildSequencingSchedule() {
  ensureSequencingScheduleDefaults();
  const activities = state.sequencingActivities || [];
  const dailyHours = sequencingDailyHoursValue();
  const startDate = parseLocalDate(state.sequencingStartDate);
  const baseStart = normalizeWorkStart(startDate, dailyHours);
  const rows = [];
  let unscheduled = 0;

  for (const activity of activities) {
    let cursor = new Date(baseStart);
    const items = [...(activity.items || [])].sort(compareSequencingItemDisplay);

    for (const item of items) {
      const estimatedHours = Number(item.estimatedHours) || 0;
      if (estimatedHours <= 0) {
        unscheduled += 1;
        continue;
      }

      const startAt = normalizeWorkStart(cursor, dailyHours);
      const endAt = addWorkingHours(startAt, estimatedHours, dailyHours);
      rows.push({
        ...item,
        activityKey: activity.key,
        activityLabel: activity.label,
        sequenceNumber: item.sequenceNumber || item.suggestedSequence || '',
        estimatedHours,
        startAt,
        endAt
      });
      cursor = new Date(endAt);
    }
  }

  const rangeStart = rows.length
    ? new Date(Math.min(...rows.map((row) => row.startAt.getTime())))
    : new Date(baseStart);
  const rangeEnd = rows.length
    ? new Date(Math.max(...rows.map((row) => row.endAt.getTime())))
    : addWorkingHours(baseStart, dailyHours, dailyHours);
  const summaryParts = [
    rows.length ? `${formatInteger(rows.length)} itens planejados` : 'Nenhum item planejado',
    `inicio ${formatDateTimeObject(rangeStart)}`,
    rows.length ? `fim ${formatDateTimeObject(rangeEnd)}` : '',
    unscheduled ? `${formatInteger(unscheduled)} sem tempo estimado` : ''
  ].filter(Boolean);

  return {
    activities,
    rows,
    rangeStart,
    rangeEnd: rangeEnd <= rangeStart ? addWorkingHours(rangeStart, dailyHours, dailyHours) : rangeEnd,
    summary: summaryParts.join(' | ')
  };
}

function compareSequencingItemDisplay(a, b) {
  const seqA = Number(a.sequenceNumber) || Number(a.suggestedSequence) || 0;
  const seqB = Number(b.sequenceNumber) || Number(b.suggestedSequence) || 0;
  if (seqA && seqB && seqA !== seqB) return seqA - seqB;
  if (seqA && !seqB) return -1;
  if (!seqA && seqB) return 1;
  return compareText(a.orderNumber, b.orderNumber);
}

function sequencingDailyHoursValue() {
  const value = Number(state.sequencingDailyHours);
  if (!Number.isFinite(value) || value <= 0) return 8;
  return Math.min(24, Math.max(1, value));
}

function normalizeWorkStart(value, dailyHours) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return normalizeWorkStart(todayAtMidnight(), dailyHours);

  let normalized = new Date(date);
  while (isWeekend(normalized)) {
    normalized.setDate(normalized.getDate() + 1);
  }

  const dayStart = workDayStart(normalized);
  const dayEnd = workDayEnd(normalized, dailyHours);
  if (normalized < dayStart) return dayStart;
  if (normalized >= dayEnd) return nextWorkDayStart(normalized);
  return normalized;
}

function addWorkingHours(start, hours, dailyHours) {
  let cursor = normalizeWorkStart(start, dailyHours);
  let remaining = Math.max(0, Number(hours) || 0);
  if (remaining <= 0) return cursor;

  while (remaining > 0) {
    const dayEnd = workDayEnd(cursor, dailyHours);
    const available = Math.max(0, (dayEnd - cursor) / 3600000);
    const used = Math.min(remaining, available);
    cursor = new Date(cursor.getTime() + used * 3600000);
    remaining -= used;

    if (remaining > 0 || cursor >= dayEnd) {
      cursor = nextWorkDayStart(cursor);
    }
  }

  return cursor;
}

function workDayStart(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 8, 0, 0, 0);
}

function workDayEnd(value, dailyHours) {
  const end = workDayStart(value);
  end.setMinutes(end.getMinutes() + sequencingDailyHoursValueFrom(dailyHours) * 60);
  return end;
}

function sequencingDailyHoursValueFrom(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.min(24, Math.max(1, number)) : 8;
}

function nextWorkDayStart(value) {
  const next = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1, 8, 0, 0, 0);
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function isWeekend(value) {
  const day = value.getDay();
  return day === 0 || day === 6;
}

function localDateInputValue(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTimeObject(value) {
  return value.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function exportSequencingExcel() {
  const schedule = buildSequencingSchedule();
  const rows = [
    ['Atividade', 'Sequencia', 'Pedido', 'Cliente', 'SKU', 'OP', 'Linha', 'Capacidade', 'Quantidade', 'Status', 'Entrega producao', 'Entrega original', 'Dias em atraso', 'Tempo estimado (h)', 'Inicio previsto', 'Fim previsto', 'Pendencias PCP'],
    ...schedule.rows.map((row) => [
      row.activityLabel,
      row.sequenceNumber,
      row.orderNumber,
      row.customer,
      row.sku,
      row.productionOrder || '',
      row.productLine || '',
      formatCapacity(row.capacityTr),
      formatInteger(row.quantity),
      labelStatus(row.status),
      formatDate(row.productionDeliveryDate),
      formatDate(row.originalDeliveryDate),
      formatInteger(row.daysLate),
      formatNumber(row.estimatedHours),
      formatDateTimeObject(row.startAt),
      formatDateTimeObject(row.endAt),
      row.pcpPendingSummary || ''
    ])
  ];
  const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sequenciamento-gantt-${localDateInputValue(todayAtMidnight())}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function printSequencingReport() {
  renderSequencingGantt();
  document.body.classList.add('print-sequencing');
  window.print();
  setTimeout(() => document.body.classList.remove('print-sequencing'), 500);
}

async function loadAps() {
  try {
    el.apsError.hidden = true;
    const { aps } = await api('/api/aps');
    state.apsData = aps || {};
    state.apsConfig = state.apsData.config || defaultApsConfigFallback();
    renderAps();
  } catch (error) {
    state.apsData = null;
    state.apsConfig = defaultApsConfigFallback();
    renderAps();
    el.apsError.textContent = error.message;
    el.apsError.hidden = false;
  }
}

function renderAps() {
  syncApsControls();
  renderApsConfigEditor();
  renderApsSchedule();
}

function syncApsControls() {
  const config = state.apsConfig || defaultApsConfigFallback();
  if (!state.apsStartDate) {
    state.apsStartDate = localDateInputValue(todayAtMidnight());
  }

  el.apsStartDate.value = state.apsStartDate;
  el.apsPriorityRule.value = config.settings?.priorityRule || 'EDD';
}

function renderApsConfigEditor() {
  const config = state.apsConfig || defaultApsConfigFallback();
  if (!el.apsOperationBody) return;

  el.apsOperationBody.innerHTML = (config.operations || []).map((operation) => `
    <tr>
      ${cell(operation.sortOrder ?? '')}
      ${cell(operation.statusName || operation.description)}
      ${cell(operation.category === 'production' ? 'Producao' : 'Processo auxiliar')}
      ${cell(operation.flowType === 'deviation' ? 'Desvio' : 'Fluxo normal')}
      ${cell(formatNumber(operation.setupHours))}
      ${cell(formatNumber(operation.processHours))}
      ${cell((operation.allowedCenters || []).join(', ') || 'Todos')}
    </tr>
  `).join('') || '<tr><td colspan="7">Cadastre status para gerar operacoes APS.</td></tr>';
}

function renderApsSchedule() {
  const config = apsConfigForRun();
  const currentSchedule = buildApsSchedule(config, { scenarioName: 'Atual' });
  const simulatedSchedule = buildApsSchedule(apsScenarioConfig(config), { scenarioName: 'Simulado' });
  const bestSchedule = chooseBestApsSchedule(currentSchedule, simulatedSchedule);
  state.apsSchedule = currentSchedule;

  renderApsKpis(currentSchedule);
  renderApsGantt(currentSchedule);
  renderApsScheduleTable(currentSchedule);
  renderApsBottlenecks(currentSchedule);
  renderApsDelays(currentSchedule);
  renderApsScenarios(currentSchedule, simulatedSchedule, bestSchedule);
  renderApsRecommendations(currentSchedule, simulatedSchedule, bestSchedule);
}

function apsConfigForRun() {
  const config = clonePlain(state.apsConfig || defaultApsConfigFallback());
  config.settings = config.settings || {};
  config.settings.priorityRule = el.apsPriorityRule.value || 'EDD';
  return config;
}

function apsScenarioConfig(config) {
  const scenario = clonePlain(config);
  const extraHours = clampNumber(el.apsScenarioExtraHours.value, 0, 8, 0);
  const operatorBoost = clampNumber(el.apsScenarioOperatorBoost.value, 0, 50, 0);

  scenario.settings.dailyHours = clampNumber((scenario.settings.dailyHours || 8) + extraHours, 1, 24, 8);
  scenario.operators = (scenario.operators || []).map((operator) => ({
    ...operator,
    efficiency: clampNumber((Number(operator.efficiency) || 1) * (1 + operatorBoost / 100), 0.1, 5, 1)
  }));

  return scenario;
}

function buildApsSchedule(config, options = {}) {
  const data = state.apsData || {};
  const settings = normalizeApsSettings(config.settings || {});
  const startDate = apsDateAtWorkStart(state.apsStartDate, settings);
  const tasks = collectApsTasks(data, config, settings.priorityRule);
  const centerResources = buildApsCenterResources(config.workCenters || [], startDate);
  const operatorResources = buildApsOperatorResources(config.operators || [], startDate);
  const operationByCode = new Map((config.operations || []).map((operation) => [operation.code, operation]));
  const centerByCode = new Map((config.workCenters || []).map((center) => [center.code, center]));
  const rows = [];
  const segments = [];
  const orderCursor = new Map();

  for (const task of tasks) {
    const operation = operationByCode.get(task.activityKey) || defaultApsOperation(task.activityKey, task.activityLabel);
    const allocation = chooseApsAllocation({
      task,
      operation,
      settings,
      startDate,
      centerResources,
      operatorResources,
      centerByCode,
      readyAt: orderCursor.get(task.orderId) || startDate
    });

    const setupEnd = addApsWorkingHours(allocation.startAt, allocation.setupHours, settings);
    const endAt = addApsWorkingHours(setupEnd, allocation.processHours, settings);
    const dueAt = apsDueDate(task.dueDate, settings);
    const delayDays = dueAt && endAt > dueAt ? Math.ceil((endAt - dueAt) / 86400000) : 0;
    const queueHours = Math.max(0, (allocation.startAt - allocation.readyAt) / 3600000);

    allocation.machine.availableAt = endAt;
    allocation.operator.availableAt = endAt;
    allocation.machine.loadHours += allocation.setupHours + allocation.processHours;
    allocation.operator.loadHours += allocation.setupHours + allocation.processHours;
    orderCursor.set(task.orderId, endAt);

    const row = {
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
      priority: task.priority,
      dueAt,
      delayDays,
      statusText: delayDays > 0 ? 'Atraso previsto' : 'No prazo'
    };

    if (allocation.setupHours > 0) {
      segments.push({
        row,
        type: 'setup',
        label: 'Setup',
        resourceCode: allocation.machine.code,
        startAt: allocation.startAt,
        endAt: setupEnd
      });
    }

    segments.push({
      row,
      type: delayDays > 0 ? 'late' : 'production',
      label: row.operationLabel,
      resourceCode: allocation.machine.code,
      startAt: setupEnd,
      endAt
    });
    rows.push(row);
  }

  const rangeStart = rows.length ? new Date(Math.min(...rows.map((row) => row.startAt.getTime()))) : startDate;
  const rangeEnd = rows.length ? new Date(Math.max(...rows.map((row) => row.endAt.getTime()))) : addApsWorkingHours(startDate, settings.dailyHours, settings);
  const resources = [
    ...Array.from(centerResources.values()).flat(),
    ...operatorResources
  ];
  const metrics = apsScheduleMetrics(rows, resources, rangeStart, rangeEnd, settings);

  return {
    scenarioName: options.scenarioName || 'Atual',
    settings,
    rows,
    segments,
    resources,
    rangeStart,
    rangeEnd: rangeEnd <= rangeStart ? addApsWorkingHours(rangeStart, settings.dailyHours, settings) : rangeEnd,
    metrics
  };
}

function collectApsTasks(data, config, priorityRule) {
  const orders = Array.isArray(data.orders) ? data.orders : [];
  const operations = (config.operations || [])
    .filter((operation) => operation.flowType !== 'deviation')
    .slice()
    .sort((a, b) => (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999) || compareText(a.description, b.description));
  const operationByStatus = new Map(operations.map((operation) => [normalizeText(operation.statusName || operation.description), operation]));
  const tasks = [];

  for (const order of orders) {
    const currentOperation = operationByStatus.get(normalizeText(order.status || ''));
    const currentSortOrder = currentOperation ? Number(currentOperation.sortOrder) || 0 : 0;
    const pendingOperations = operations.filter((operation) => {
      const sortOrder = Number(operation.sortOrder) || 999;
      return currentOperation ? sortOrder >= currentSortOrder : true;
    });

    pendingOperations.forEach((operation, operationIndex) => {
      const dueDate = order.productionDeliveryDate || order.originalDeliveryDate || order.entryDate || '';
      const manualSequence = ((Number(operation.sortOrder) || operationIndex + 1) * 100000) + tasks.length;
      tasks.push({
        ...order,
        orderId: order.id,
        activityKey: operation.code,
        activityLabel: operation.description || operation.statusName,
        operationCode: operation.code,
        routeRank: Number(operation.sortOrder) || operationIndex + 1,
        dueDate,
        manualSequence,
        estimatedHours: operation.processHours,
        pcpPendingCount: order.pcpPendingCount || 0,
        pcpPendingSummary: order.pcpPendingSummary || '',
        priority: 0
      });
    });
  }

  tasks.sort((a, b) => {
    if (priorityRule === 'MANUAL') {
      return a.manualSequence - b.manualSequence
        || a.routeRank - b.routeRank
        || compareText(a.orderNumber, b.orderNumber);
    }
    return compareText(a.dueDate || '9999-12-31', b.dueDate || '9999-12-31')
      || a.routeRank - b.routeRank
      || a.manualSequence - b.manualSequence
      || compareText(a.orderNumber, b.orderNumber);
  });

  return tasks.map((task, index) => ({ ...task, priority: index }));
}

function chooseApsAllocation({ task, operation, settings, startDate, centerResources, operatorResources, centerByCode, readyAt }) {
  const allowedCenterCodes = operation.allowedCenters?.length
    ? operation.allowedCenters
    : Array.from(centerResources.keys());
  const candidates = [];

  for (const centerCode of allowedCenterCodes) {
    const machines = centerResources.get(String(centerCode || '').toUpperCase()) || [];
    const center = centerByCode.get(String(centerCode || '').toUpperCase()) || defaultApsCenter(centerCode);
    for (const machine of machines) {
      const operators = operatorResources.filter((operator) => apsOperatorCanRun(operator, operation.code, center.code));
      const usableOperators = operators.length ? operators : [defaultApsOperator(startDate)];
      for (const operator of usableOperators) {
        const setupHours = Math.max(0, Number(operation.setupHours) || 0);
        const processHours = apsProcessHours(task, operation, center, operator);
        const earliest = new Date(Math.max(readyAt.getTime(), machine.availableAt.getTime(), operator.availableAt.getTime()));
        const startAt = normalizeApsWorkStart(earliest, settings);
        const setupEnd = addApsWorkingHours(startAt, setupHours, settings);
        const endAt = addApsWorkingHours(setupEnd, processHours, settings);
        candidates.push({
          center,
          machine,
          operator,
          readyAt,
          startAt,
          endAt,
          setupHours,
          processHours
        });
      }
    }
  }

  if (!candidates.length) {
    const firstEntry = Array.from(centerResources.entries())[0];
    const fallbackCenterCode = firstEntry ? firstEntry[0] : 'SEM-CENTRO';
    const center = centerByCode.get(fallbackCenterCode) || defaultApsCenter(fallbackCenterCode);
    const machine = firstEntry?.[1]?.[0] || defaultApsMachine(center.code, startDate);
    const operator = operatorResources[0] || defaultApsOperator(startDate);
    const earliest = new Date(Math.max(readyAt.getTime(), machine.availableAt.getTime(), operator.availableAt.getTime()));
    const startAt = normalizeApsWorkStart(earliest, settings);
    return {
      center,
      machine,
      operator,
      readyAt,
      startAt,
      setupHours: Math.max(0, Number(operation.setupHours) || 0),
      processHours: Math.max(0.25, Number(operation.processHours) || 1)
    };
  }

  candidates.sort((a, b) => a.endAt - b.endAt || a.startAt - b.startAt || compareText(a.machine.code, b.machine.code));
  return candidates[0];
}

function apsProcessHours(task, operation, center, operator) {
  const quantity = Math.max(1, Number(task.quantity) || 1);
  const lotSize = Math.max(1, Number(operation.lotSize) || 1);
  const baseHours = Number(task.estimatedHours) > 0
    ? Number(task.estimatedHours)
    : (Number(operation.processHours) || 1) * Math.ceil(quantity / lotSize);
  const efficiency = Math.max(0.1, (Number(center.efficiency) || 1) * (Number(operator.efficiency) || 1));
  return Math.max(0.1, baseHours / efficiency);
}

function buildApsCenterResources(workCenters, startDate) {
  const resources = new Map();
  for (const center of workCenters) {
    const code = String(center.code || '').toUpperCase();
    if (!code) continue;
    const count = Math.max(1, Number(center.machineCount) || 1);
    resources.set(code, Array.from({ length: count }, (_, index) => ({
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

function buildApsOperatorResources(operators, startDate) {
  const resources = operators
    .filter((operator) => operator.code)
    .map((operator) => ({
      ...operator,
      type: 'operator',
      availableAt: new Date(startDate),
      loadHours: 0
    }));

  return resources.length ? resources : [defaultApsOperator(startDate)];
}

function apsOperatorCanRun(operator, operationCode, centerCode) {
  const enabledOperations = operator.enabledOperations || [];
  const enabledCenters = (operator.enabledCenters || []).map((item) => String(item).toUpperCase());
  const operationOk = !enabledOperations.length || enabledOperations.includes(operationCode);
  const centerOk = !enabledCenters.length || enabledCenters.includes(String(centerCode || '').toUpperCase());
  return operationOk && centerOk;
}

function apsScheduleMetrics(rows, resources, rangeStart, rangeEnd, settings) {
  const horizonHours = Math.max(settings.dailyHours, (rangeEnd - rangeStart) / 3600000);
  const delays = apsDelayRows(rows);
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
      status: (resource.loadHours / horizonHours) >= 0.85 ? 'Gargalo' : 'Normal'
    }))
    .sort((a, b) => b.utilization - a.utilization || compareText(a.code, b.code));
  const makespanHours = Math.max(0, (rangeEnd - rangeStart) / 3600000);

  return {
    makespanHours,
    makespanDays: settings.dailyHours ? makespanHours / settings.dailyHours : 0,
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

function apsDelayRows(rows) {
  const byOrder = new Map();
  for (const row of rows) {
    const current = byOrder.get(row.orderId);
    if (!current || row.endAt > current.predictedAt) {
      byOrder.set(row.orderId, {
        orderId: row.orderId,
        orderNumber: row.orderNumber,
        productionOrder: row.productionOrder || 'Sem OP',
        customer: row.customer,
        dueDate: row.dueDate,
        dueAt: row.dueAt,
        predictedAt: row.endAt,
        delayDays: row.dueAt && row.endAt > row.dueAt ? Math.ceil((row.endAt - row.dueAt) / 86400000) : 0,
        quantity: Number(row.quantity) || 0
      });
    }
  }

  return Array.from(byOrder.values()).sort((a, b) => b.delayDays - a.delayDays || compareText(a.dueDate, b.dueDate));
}

function renderApsKpis(schedule) {
  const metrics = schedule.metrics;
  el.apsKpiMakespan.textContent = `${formatNumber(Math.round(metrics.makespanDays * 10) / 10)} dias`;
  el.apsKpiOtif.textContent = `${formatNumber(metrics.otif)}%`;
  el.apsKpiLate.textContent = formatInteger(metrics.lateOperations);
  el.apsKpiBottleneck.textContent = metrics.bottleneck ? `${metrics.bottleneck.code} ${formatNumber(metrics.bottleneck.utilization)}%` : 'Sem carga';
  el.apsScheduleSummary.textContent = `${formatInteger(metrics.totalOperations)} operacoes | fim ${formatDateTimeObject(schedule.rangeEnd)} | ${formatInteger(metrics.lateOrders)} OPs em atraso`;
}

function renderApsGantt(schedule) {
  el.apsGanttTimestamp.textContent = `Gerado em ${formatDateTimeObject(new Date())}`;

  if (!schedule.rows.length) {
    el.apsGantt.innerHTML = '<div class="empty sequencing-card-empty">Nenhuma operacao pendente para programar.</div>';
    return;
  }

  const grouped = new Map();
  for (const segment of schedule.segments) {
    if (!grouped.has(segment.resourceCode)) grouped.set(segment.resourceCode, []);
    grouped.get(segment.resourceCode).push(segment);
  }

  el.apsGantt.innerHTML = Array.from(grouped.entries()).map(([resourceCode, segments]) => `
    <section class="gantt-lane aps-gantt-lane">
      <div class="gantt-lane-title">
        <strong>${escapeHtml(resourceCode)}</strong>
        <span>${formatInteger(segments.length)} barras</span>
      </div>
      <div class="gantt-track aps-gantt-track">
        ${segments.map((segment) => apsGanttBar(segment, schedule)).join('')}
      </div>
    </section>
  `).join('');
}

function apsGanttBar(segment, schedule) {
  const total = Math.max(1, schedule.rangeEnd - schedule.rangeStart);
  const left = Math.max(0, ((segment.startAt - schedule.rangeStart) / total) * 100);
  const width = Math.max(1.2, ((segment.endAt - segment.startAt) / total) * 100);
  const row = segment.row;
  const title = [
    `${row.productionOrder || 'Sem OP'} - ${row.orderNumber}`,
    `Operacao: ${row.operationLabel}`,
    `Maquina: ${row.machineCode}`,
    `Operador: ${row.operatorName || row.operatorCode}`,
    `Inicio: ${formatDateTimeObject(segment.startAt)}`,
    `Fim: ${formatDateTimeObject(segment.endAt)}`,
    `Setup: ${formatNumber(row.setupHours)} h`,
    `Processo: ${formatNumber(row.processHours)} h`,
    `Atraso: ${formatInteger(row.delayDays)} dias`
  ].join('\n');

  return `
    <div class="gantt-row">
      <span class="gantt-row-label">${escapeHtml(row.productionOrder || row.orderNumber)}</span>
      <span class="gantt-bar aps-bar aps-bar-${segment.type}" title="${escapeHtml(title)}" style="left: ${left.toFixed(3)}%; width: ${width.toFixed(3)}%;">
        ${escapeHtml(segment.type === 'setup' ? 'Setup' : row.orderNumber)}
      </span>
    </div>
  `;
}

function renderApsScheduleTable(schedule) {
  el.apsScheduleBody.innerHTML = '';
  el.apsScheduleCount.textContent = `${formatInteger(schedule.rows.length)} operacoes`;
  el.apsScheduleEmpty.hidden = schedule.rows.length > 0;

  for (const row of schedule.rows) {
    const tr = document.createElement('tr');
    if (row.delayDays > 0) tr.classList.add('aps-row-late');
    tr.innerHTML = `
      ${cell(row.productionOrder || 'Sem OP')}
      ${cell(row.orderNumber)}
      ${cell(row.operationLabel)}
      ${cell(row.centerCode)}
      ${cell(row.machineCode)}
      ${cell(row.operatorName || row.operatorCode)}
      ${cell(formatDateTimeObject(row.startAt))}
      ${cell(formatDateTimeObject(row.endAt))}
      ${cell(formatNumber(Math.round(row.setupHours * 100) / 100))}
      ${cell(formatNumber(Math.round(row.processHours * 100) / 100))}
      ${cell(formatNumber(Math.round(row.queueHours * 100) / 100))}
      ${cell(row.statusText)}
      ${cell(row.priority)}
      ${cell(formatInteger(row.delayDays))}
    `;
    el.apsScheduleBody.appendChild(tr);
  }
}

function renderApsBottlenecks(schedule) {
  el.apsBottleneckBody.innerHTML = schedule.metrics.utilizations.map((resource) => `
    <tr class="${resource.status === 'Gargalo' ? 'aps-row-warning' : ''}">
      ${cell(resource.code)}
      ${cell(resource.type)}
      ${cell(formatNumber(Math.round(resource.loadHours * 10) / 10))}
      ${cell(`${formatNumber(resource.utilization)}%`)}
      ${cell(resource.status)}
    </tr>
  `).join('') || '<tr><td colspan="5">Sem carga programada.</td></tr>';
}

function renderApsDelays(schedule) {
  el.apsDelayBody.innerHTML = schedule.metrics.delays.map((delay) => `
    <tr class="${delay.delayDays > 0 ? 'aps-row-late' : ''}">
      ${cell(delay.productionOrder)}
      ${cell(delay.customer)}
      ${cell(formatDate(delay.dueDate))}
      ${cell(formatDateTimeObject(delay.predictedAt))}
      ${cell(formatInteger(delay.delayDays))}
      ${cell(delay.delayDays > 0 ? `${formatInteger(delay.quantity)} maquinas impactadas` : 'No prazo')}
    </tr>
  `).join('') || '<tr><td colspan="6">Sem OPs programadas.</td></tr>';
}

function renderApsScenarios(currentSchedule, simulatedSchedule, bestSchedule) {
  const rows = [currentSchedule, simulatedSchedule, { ...bestSchedule, scenarioName: 'Melhor IA' }];
  el.apsScenarioBody.innerHTML = rows.map((schedule) => `
    <tr>
      ${cell(schedule.scenarioName)}
      ${cell(formatDateTimeObject(schedule.rangeEnd))}
      ${cell(`${formatInteger(schedule.metrics.lateOrders)} OPs`)}
      ${cell(`${formatNumber(schedule.metrics.otif)}%`)}
      ${cell(schedule.metrics.bottleneck ? `${schedule.metrics.bottleneck.code} (${formatNumber(schedule.metrics.bottleneck.utilization)}%)` : 'Sem gargalo')}
      ${cell(apsScenarioRecommendation(schedule))}
    </tr>
  `).join('');
}

function renderApsRecommendations(currentSchedule, simulatedSchedule, bestSchedule) {
  const current = currentSchedule.metrics;
  const simulated = simulatedSchedule.metrics;
  const best = bestSchedule.metrics;
  const improvement = current.lateOrders - simulated.lateOrders;
  const bottleneck = current.bottleneck;
  const criticalDelay = current.delays.find((delay) => delay.delayDays > 0);
  const items = [
    `Sequencia calculada por ${currentSchedule.settings.priorityRule === 'MANUAL' ? 'prioridade manual' : 'EDD, menor data prometida primeiro'}, respeitando uma maquina e um operador por operacao.`,
    bottleneck ? `Gargalo principal: ${bottleneck.code}, com utilizacao prevista de ${formatNumber(bottleneck.utilization)}%.` : 'Nao ha gargalo relevante com a carga atual.',
    criticalDelay ? `OP critica: ${criticalDelay.productionOrder}, prevista para ${formatDateTimeObject(criticalDelay.predictedAt)}, com ${formatInteger(criticalDelay.delayDays)} dias de atraso.` : 'Nenhuma OP ficou atrasada no sequenciamento atual.',
    improvement > 0 ? `O cenario simulado reduz ${formatInteger(improvement)} OPs em atraso; vale avaliar hora extra ou ganho de produtividade.` : 'O cenario simulado nao reduz atrasos de forma relevante com os parametros atuais.',
    best === simulated ? 'Melhor cenario sugerido: simulado.' : 'Melhor cenario sugerido: atual.'
  ];

  el.apsRecommendations.innerHTML = items.map((item) => `<p>${escapeHtml(item)}</p>`).join('');
}

function chooseBestApsSchedule(currentSchedule, simulatedSchedule) {
  const current = currentSchedule.metrics;
  const simulated = simulatedSchedule.metrics;
  if (simulated.lateOrders < current.lateOrders) return simulatedSchedule;
  if (simulated.lateOrders === current.lateOrders && simulated.makespanHours < current.makespanHours) return simulatedSchedule;
  return currentSchedule;
}

function apsScenarioRecommendation(schedule) {
  if (!schedule.metrics.totalOperations) return 'Sem carga';
  if (schedule.metrics.lateOrders > 0) return 'Revisar capacidade e gargalo';
  if (schedule.metrics.bottleneck?.utilization >= 85) return 'Monitorar gargalo';
  return 'Cenario viavel';
}

async function saveApsConfig() {
  setScreen('admin');
}

function exportApsExcel() {
  const schedule = state.apsSchedule || buildApsSchedule(apsConfigForRun(), { scenarioName: 'Atual' });
  const rows = [
    ['OP', 'Pedido', 'Cliente', 'Produto', 'Operacao', 'Centro', 'Maquina', 'Operador', 'Inicio previsto', 'Fim previsto', 'Setup h', 'Processo h', 'Fila h', 'Data prometida', 'Atraso dias', 'Prioridade', 'Status'],
    ...schedule.rows.map((row) => [
      row.productionOrder || '',
      row.orderNumber,
      row.customer,
      row.sku || row.productLine || '',
      row.operationLabel,
      row.centerCode,
      row.machineCode,
      row.operatorName || row.operatorCode,
      formatDateTimeObject(row.startAt),
      formatDateTimeObject(row.endAt),
      formatNumber(Math.round(row.setupHours * 100) / 100),
      formatNumber(Math.round(row.processHours * 100) / 100),
      formatNumber(Math.round(row.queueHours * 100) / 100),
      formatDate(row.dueDate),
      formatInteger(row.delayDays),
      row.priority,
      row.statusText
    ])
  ];
  const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(';')).join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aps-programacao-${localDateInputValue(todayAtMidnight())}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function defaultApsConfigFallback() {
  return {
    settings: { workdayStart: '08:00', dailyHours: 8, lunchStart: '12:00', lunchMinutes: 60, priorityRule: 'EDD' },
    operators: [{ code: 'OP-01', name: 'Operador 1', efficiency: 1, enabledOperations: [], enabledCenters: [] }],
    workCenters: [{ code: 'MONT', description: 'Montagem', machineCount: 1, efficiency: 1 }],
    operations: ORDER_STAGE_DEFS.map((stage) => ({ code: stage.key, description: stage.label, setupHours: 0.25, processHours: 2, lotSize: 1, minOperators: 1, maxOperators: 1, allowedCenters: ['MONT'] }))
  };
}

function normalizeApsSettings(settings) {
  return {
    workdayStart: /^\d{2}:\d{2}$/.test(settings.workdayStart || '') ? settings.workdayStart : '08:00',
    dailyHours: clampNumber(settings.dailyHours, 1, 24, 8),
    lunchStart: /^\d{2}:\d{2}$/.test(settings.lunchStart || '') ? settings.lunchStart : '12:00',
    lunchMinutes: clampNumber(settings.lunchMinutes, 0, 240, 60),
    priorityRule: ['EDD', 'MANUAL'].includes(settings.priorityRule) ? settings.priorityRule : 'EDD'
  };
}

function apsDateAtWorkStart(value, settings) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? parseLocalDate(value) : todayAtMidnight();
  return normalizeApsWorkStart(date, settings);
}

function apsDueDate(value, settings) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = parseLocalDate(value);
  const periods = apsWorkPeriods(date, settings);
  return periods.length ? periods[periods.length - 1].end : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function normalizeApsWorkStart(value, settings) {
  let date = new Date(value);
  if (Number.isNaN(date.getTime())) date = todayAtMidnight();

  while (isWeekend(date)) {
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  }

  const periods = apsWorkPeriods(date, settings);
  for (const period of periods) {
    if (date < period.start) return new Date(period.start);
    if (date >= period.start && date < period.end) return date;
  }

  return apsNextWorkDayStart(date, settings);
}

function addApsWorkingHours(start, hours, settings) {
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

    const available = Math.max(0, (period.end - cursor) / 3600000);
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

function apsWorkPeriods(value, settings) {
  const [startHour, startMinute] = settings.workdayStart.split(':').map(Number);
  const [lunchHour, lunchMinute] = settings.lunchStart.split(':').map(Number);
  const dayStart = new Date(value.getFullYear(), value.getMonth(), value.getDate(), startHour, startMinute, 0, 0);
  const lunchStart = new Date(value.getFullYear(), value.getMonth(), value.getDate(), lunchHour, lunchMinute, 0, 0);
  const lunchEnd = new Date(lunchStart.getTime() + settings.lunchMinutes * 60000);
  const totalMinutes = settings.dailyHours * 60;

  if (settings.lunchMinutes <= 0 || lunchStart <= dayStart) {
    return [{ start: dayStart, end: new Date(dayStart.getTime() + totalMinutes * 60000) }];
  }

  const beforeLunchMinutes = Math.min(totalMinutes, Math.max(0, (lunchStart - dayStart) / 60000));
  const periods = [];
  if (beforeLunchMinutes > 0) {
    periods.push({ start: dayStart, end: new Date(dayStart.getTime() + beforeLunchMinutes * 60000) });
  }

  const remainingMinutes = totalMinutes - beforeLunchMinutes;
  if (remainingMinutes > 0) {
    periods.push({ start: lunchEnd, end: new Date(lunchEnd.getTime() + remainingMinutes * 60000) });
  }

  return periods.length ? periods : [{ start: dayStart, end: new Date(dayStart.getTime() + totalMinutes * 60000) }];
}

function apsNextWorkDayStart(value, settings) {
  let next = new Date(value.getFullYear(), value.getMonth(), value.getDate() + 1);
  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1);
  }
  const periods = apsWorkPeriods(next, settings);
  return new Date(periods[0].start);
}

function defaultApsOperation(code, label) {
  return {
    code,
    description: label || code,
    setupHours: 0,
    processHours: 1,
    lotSize: 1,
    allowedCenters: []
  };
}

function defaultApsCenter(code) {
  return {
    code: String(code || 'SEM-CENTRO').toUpperCase(),
    description: String(code || 'Sem centro'),
    efficiency: 1
  };
}

function defaultApsMachine(centerCode, startDate) {
  return {
    code: `${String(centerCode || 'SEM-CENTRO').toUpperCase()}-1`,
    name: centerCode || 'Sem centro',
    type: 'machine',
    centerCode,
    availableAt: new Date(startDate),
    loadHours: 0
  };
}

function defaultApsOperator(startDate) {
  return {
    code: 'SEM-OPERADOR',
    name: 'Sem operador cadastrado',
    type: 'operator',
    efficiency: 1,
    enabledOperations: [],
    enabledCenters: [],
    availableAt: new Date(startDate),
    loadHours: 0
  };
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

async function loadProductStats() {
  const { products, forecasts = [] } = await api('/api/product-stats');
  state.productStats = products;
  state.productDemandForecasts = forecasts;
  renderProductScreen();
}

function renderProductScreen() {
  syncProductControls();
  renderProductDemandForecasts();
  renderProductStats();
  renderProductSopAnalysis();
  renderProductCharts();
}

function syncProductControls() {
  if (el.productSearch) el.productSearch.value = state.productSearch;
  if (el.productSort) el.productSort.value = state.productSortField;
  if (el.productSortDirection) el.productSortDirection.value = state.productSortDirection;
  if (el.productRiskFilter) el.productRiskFilter.value = state.productRiskFilter;
}

function renderProductDemandForecasts() {
  if (!el.productForecastBody || !el.productForecastEmpty) return;
  renderFilterHeaders('productForecasts');
  const forecasts = visibleProductForecasts();

  el.productForecastBody.innerHTML = '';
  el.productForecastEmpty.hidden = forecasts.length > 0;

  for (const forecast of forecasts) {
    const row = document.createElement('tr');
    const riskClass = forecast.predictedLateOrders > 0 ? 'forecast-risk-high' : 'forecast-risk-ok';
    const forecastTitle = (forecast.forecastMonths || [])
      .map((item) => `${formatMonth(item.month)}: ${formatDemand(item.forecast)}`)
      .join(' | ');

    row.innerHTML = `
      ${cell(forecast.productLine)}
      ${cell(forecast.capacityLabel)}
      ${cell(formatInteger(forecast.machinesSold))}
      ${cell(formatDemand(forecast.averageMonthlyDemand))}
      <td title="${escapeHtml(forecastTitle)}">${escapeHtml(formatDemand(forecast.forecastNextMonth))}</td>
      <td title="${escapeHtml(forecastTitle)}">${escapeHtml(formatDemand(forecast.forecastNext3Months))}</td>
      ${cell(formatDays(forecast.averageLeadTime))}
      ${cell(`${formatInteger(forecast.openOrders)} ped. / ${formatInteger(forecast.openMachines)} maq.`)}
      <td><span class="forecast-risk ${riskClass}">${escapeHtml(forecast.delayRiskLabel || '-')}</span>${forecast.maxPredictedDelayDays ? `<small>${formatInteger(forecast.maxPredictedDelayDays)} dias</small>` : ''}</td>
      ${cell(forecastConfidenceLabel(forecast.confidence))}
    `;
    el.productForecastBody.appendChild(row);
  }
}

function renderProductStats() {
  renderFilterHeaders('products');
  const products = visibleProductStats();

  el.productStatsBody.innerHTML = '';
  el.productStatsEmpty.textContent = state.productStats.length
    ? 'Nenhum produto encontrado para o filtro.'
    : 'Nenhum produto encontrado.';
  el.productStatsEmpty.hidden = products.length > 0;

  for (const product of products) {
    const row = document.createElement('tr');
    row.innerHTML = `
      ${cell(product.code)}
      ${cell(product.productLine)}
      ${cell(product.equipment)}
      ${cell(formatInteger(product.salesOrders))}
      ${cell(formatInteger(product.machinesSold))}
      ${cell(formatDays(product.averageLeadTime))}
      ${cell(formatDays(product.averageOrderInterval))}
    `;
    el.productStatsBody.appendChild(row);
  }
}

function visibleProductStats() {
  const query = normalizeText(state.productSearch);
  const rows = filteredTableRows('products')
    .filter((product) => !query || productSearchText(product).includes(query));
  return sortProductRows(rows, state.productSortField, state.productSortDirection);
}

function visibleProductForecasts() {
  const query = normalizeText(state.productSearch);
  const rows = filteredTableRows('productForecasts')
    .filter((forecast) => !query || forecastSearchText(forecast).includes(query))
    .filter((forecast) => forecastMatchesRiskFilter(forecast, state.productRiskFilter));
  return sortProductRows(rows, state.productSortField, state.productSortDirection);
}

function productSearchText(product) {
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

function forecastSearchText(forecast) {
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

function forecastMatchesRiskFilter(forecast, filter) {
  if (filter === 'late') return Number(forecast.predictedLateOrders) > 0;
  if (filter === 'ok') return Number(forecast.predictedLateOrders) <= 0;
  if (filter === 'low-confidence') {
    const confidence = normalizeText(forecast.confidence);
    return confidence.includes('baixa') || confidence.includes('pouco historico');
  }
  return true;
}

function sortProductRows(rows, field, direction) {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const result = compareProductValues(productSortValue(a, field), productSortValue(b, field));
    if (result !== 0) return result * multiplier;
    return compareProductValues(productSortValue(a, 'productLine'), productSortValue(b, 'productLine'))
      || compareProductValues(productSortValue(a, 'code'), productSortValue(b, 'code'));
  });
}

function productSortValue(row, field) {
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

function compareProductValues(a, b) {
  const aNumber = Number(a);
  const bNumber = Number(b);
  if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
  return String(a ?? '').localeCompare(String(b ?? ''), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

function renderProductSopAnalysis() {
  if (!el.productSopCards || !el.productSopInsights) return;

  const forecasts = visibleProductForecasts();
  const products = visibleProductStats();
  const totalForecast3 = sumBy(forecasts, 'forecastNext3Months');
  const totalSold = sumBy(products, 'machinesSold');
  const openMachines = sumBy(forecasts, 'openMachines');
  const lateOrders = sumBy(forecasts, 'predictedLateOrders');
  const averageLeadTime = averageNumbers(forecasts.map((item) => item.averageLeadTime));

  const cards = [
    ['Previsao 3 meses', formatDemand(totalForecast3), 'maquinas previstas'],
    ['Historico vendido', formatInteger(totalSold), 'maquinas no filtro'],
    ['Carteira aberta', formatInteger(openMachines), 'maquinas em aberto'],
    ['Risco operacional', formatInteger(lateOrders), 'pedidos com atraso previsto'],
    ['Lead time medio', formatDays(averageLeadTime), 'base historica']
  ];

  el.productSopCards.innerHTML = cards.map(([label, value, detail]) => `
    <article class="sop-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `).join('');

  const topDemand = maxBy(forecasts, (item) => Number(item.forecastNext3Months) || 0);
  const topRisk = maxBy(forecasts, (item) => Number(item.predictedLateOrders) || 0);
  const longLead = maxBy(forecasts, (item) => Number(item.averageLeadTime) || 0);
  const lowConfidenceCount = forecasts.filter((item) => forecastMatchesRiskFilter(item, 'low-confidence')).length;
  const insights = [];

  if (topDemand) {
    insights.push(`Prioridade de demanda: ${topDemand.productLine} ${topDemand.capacityLabel} concentra ${formatDemand(topDemand.forecastNext3Months)} maquinas previstas nos proximos 3 meses.`);
  }
  if (topRisk && Number(topRisk.predictedLateOrders) > 0) {
    insights.push(`Atencao PCP: ${topRisk.productLine} ${topRisk.capacityLabel} tem ${formatInteger(topRisk.predictedLateOrders)} pedido(s) com atraso previsto e desvio maximo de ${formatInteger(topRisk.maxPredictedDelayDays)} dias.`);
  } else if (forecasts.length) {
    insights.push('Carteira aberta sem atraso previsto pelo lead time historico dos grupos filtrados.');
  }
  if (longLead && Number(longLead.averageLeadTime) > 0) {
    insights.push(`Restricao de capacidade: maior lead time em ${longLead.productLine} ${longLead.capacityLabel}, com media de ${formatDays(longLead.averageLeadTime)}.`);
  }
  if (lowConfidenceCount > 0) {
    insights.push(`${formatInteger(lowConfidenceCount)} grupo(s) com pouca base estatistica; usar previsao como sinal direcional e revisar com Comercial/PCP.`);
  }
  if (!insights.length) {
    insights.push('Sem dados suficientes no filtro atual para gerar analise S&OP.');
  }

  el.productSopInsights.innerHTML = insights.map((item) => `<div class="sop-insight">${escapeHtml(item)}</div>`).join('');
}

function renderProductCharts() {
  if (!el.productChartDemand) return;

  const forecasts = visibleProductForecasts();
  const products = visibleProductStats();
  renderChart(el.productChartDemand, 'Previsao 3 meses', topSeries(forecasts, 'forecastNext3Months', forecastLabel, 12), 'bar', 'Maquinas');
  renderChart(el.productChartLeadTime, 'Lead time medio', topSeries(forecasts, 'averageLeadTime', forecastLabel, 12), 'bar', 'Dias');
  renderChart(el.productChartMix, 'Top produtos vendidos', topSeries(products, 'machinesSold', (item) => item.code || '-', 12), 'bar', 'Maquinas');
  renderChart(
    el.productChartRisk,
    'Pedidos com atraso previsto',
    topSeries(forecasts.filter((item) => Number(item.predictedLateOrders) > 0), 'predictedLateOrders', forecastLabel, 12),
    'bar',
    'Pedidos'
  );
}

function topSeries(rows, valueKey, labelFn, limit) {
  return [...rows]
    .map((item) => ({ label: labelFn(item), value: Number(item[valueKey]) || 0 }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR', { numeric: true, sensitivity: 'base' }))
    .slice(0, limit);
}

function forecastLabel(forecast) {
  return `${forecast.productLine || '-'} ${forecast.capacityLabel || ''}`.trim();
}

function sumBy(rows, key) {
  return rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
}

function averageNumbers(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  if (!numbers.length) return null;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

function maxBy(rows, valueFn) {
  return rows.reduce((best, item) => {
    if (!best) return item;
    return valueFn(item) > valueFn(best) ? item : best;
  }, null);
}

async function loadQualityAlertData(includePhotos = false) {
  if (!canViewTab('orders') && !canViewTab('quality')) {
    state.qualityAlerts = [];
    state.qualityAlertAcknowledgements = [];
    return;
  }

  const suffix = includePhotos ? '?includePhotos=1' : '';
  const { alerts = [], acknowledgements = [] } = await api(`/api/quality/alerts${suffix}`);
  state.qualityAlerts = alerts;
  state.qualityAlertAcknowledgements = acknowledgements;
}

async function loadQualityAlertsScreen() {
  await Promise.all([
    loadQualityAlertOrderOptions(),
    loadQualityAlertData(true)
  ]);
  fillQualityAlertOrderSelect();
  renderQualityAlerts();
  if (el.qualityAlertForm) el.qualityAlertForm.hidden = !canEditTab('quality') || !canViewTab('quality');
}

async function loadQualityAlertOrderOptions() {
  if (!canViewTab('orders')) {
    state.qualityAlertOrderOptions = [];
    return;
  }

  const params = new URLSearchParams();
  params.set('sort', 'orderNumber');
  params.set('direction', 'desc');
  params.set('pageSize', '500');
  const { orders = [] } = await api(`/api/orders?${params.toString()}`);
  state.qualityAlertOrderOptions = orders;
}

function fillQualityAlertOrderSelect() {
  if (!el.qualityAlertOrderId) return;
  const currentValue = el.qualityAlertOrderId.value;
  el.qualityAlertOrderId.innerHTML = `
    <option value="">Selecione um pedido</option>
    ${state.qualityAlertOrderOptions.map((order) => `
      <option value="${escapeHtml(order.id)}">${escapeHtml(qualityAlertOrderLabel(order))}</option>
    `).join('')}
  `;
  if (state.qualityAlertOrderOptions.some((order) => order.id === currentValue)) {
    el.qualityAlertOrderId.value = currentValue;
  }
}

function qualityAlertOrderLabel(order) {
  return [
    order.orderNumber || 'Sem numero',
    order.customer || 'Sem cliente',
    order.sku || 'Sem SKU',
    [order.productLine, formatCapacity(order.capacityTr)].filter(Boolean).join(' ')
  ].filter(Boolean).join(' | ');
}

function fillQualityAlertFromSelectedOrder() {
  const order = state.qualityAlertOrderOptions.find((item) => item.id === el.qualityAlertOrderId.value);
  if (!order) return;

  el.qualityAlertOrderNumber.value = order.orderNumber || '';
  el.qualityAlertCustomer.value = order.customer || '';
  el.qualityAlertProductLine.value = order.productLine || '';
  el.qualityAlertSku.value = order.sku || '';
  el.qualityAlertCapacityTr.value = order.capacityTr ?? '';
  el.qualityAlertQuantity.value = order.quantity ?? '';
}

function resetQualityAlertForm() {
  if (!el.qualityAlertForm) return;
  el.qualityAlertForm.reset();
  state.qualityAlertEditingId = '';
  state.qualityAlertWrongPhoto = null;
  state.qualityAlertRightPhoto = null;
  renderQualityAlertPreview('wrong');
  renderQualityAlertPreview('right');
  el.qualityAlertError.hidden = true;
  el.qualityAlertEditor.hidden = true;
  el.qualityAlertSubmit.textContent = 'Salvar alerta';
}

async function submitQualityAlert() {
  el.qualityAlertError.hidden = true;
  try {
    const editingId = state.qualityAlertEditingId;
    await api(editingId ? `/api/quality/alerts/${encodeURIComponent(editingId)}` : '/api/quality/alerts', {
      method: editingId ? 'PUT' : 'POST',
      body: qualityAlertPayload()
    });
    resetQualityAlertForm();
    await loadQualityAlertsScreen();
    if (state.currentScreen === 'orders') await loadOrders();
  } catch (error) {
    alert(error.message);
  }
}

function qualityAlertPayload() {
  return {
    orderId: el.qualityAlertOrderId.value,
    orderNumber: el.qualityAlertOrderNumber.value,
    customer: el.qualityAlertCustomer.value,
    productLine: el.qualityAlertProductLine.value,
    sku: el.qualityAlertSku.value,
    capacityTr: el.qualityAlertCapacityTr.value,
    quantity: el.qualityAlertQuantity.value,
    wrongPhoto: state.qualityAlertWrongPhoto,
    wrongDescription: el.qualityAlertWrongDescription.value,
    rightPhoto: state.qualityAlertRightPhoto,
    rightDescription: el.qualityAlertRightDescription.value
  };
}

function openQualityAlertEditor(alert = null) {
  state.qualityAlertEditingId = alert?.id || '';
  el.qualityAlertForm.reset();
  el.qualityAlertError.hidden = true;
  el.qualityAlertEditor.hidden = false;
  el.qualityAlertSubmit.textContent = alert ? 'Salvar alteracoes' : 'Salvar alerta';

  if (alert) {
    el.qualityAlertOrderId.value = state.qualityAlertOrderOptions.some((order) => order.id === alert.orderId) ? alert.orderId : '';
    el.qualityAlertOrderNumber.value = alert.orderNumber || '';
    el.qualityAlertCustomer.value = alert.customer || '';
    el.qualityAlertProductLine.value = alert.productLine || '';
    el.qualityAlertSku.value = alert.sku || '';
    el.qualityAlertCapacityTr.value = alert.capacityTr ?? '';
    el.qualityAlertQuantity.value = alert.quantity ?? '';
    el.qualityAlertWrongDescription.value = alert.wrongDescription || '';
    el.qualityAlertRightDescription.value = alert.rightDescription || '';
    state.qualityAlertWrongPhoto = qualityAlertStatePhoto(alert, 'wrong');
    state.qualityAlertRightPhoto = qualityAlertStatePhoto(alert, 'right');
  } else {
    state.qualityAlertWrongPhoto = null;
    state.qualityAlertRightPhoto = null;
  }

  renderQualityAlertPreview('wrong');
  renderQualityAlertPreview('right');
  setTimeout(() => el.qualityAlertOrderId.focus(), 0);
}

function qualityAlertStatePhoto(alert, kind) {
  const prefix = kind === 'right' ? 'right' : 'wrong';
  const fileName = alert[`${prefix}PhotoName`] || '';
  const mimeType = alert[`${prefix}PhotoMimeType`] || '';
  const dataUrl = alert[`${prefix}PhotoDataUrl`] || '';
  return fileName && mimeType && dataUrl ? { fileName, mimeType, dataUrl } : null;
}

async function handleQualityAlertPhotoChange(kind) {
  const input = kind === 'right' ? el.qualityAlertRightPhoto : el.qualityAlertWrongPhoto;
  const file = input.files?.[0];
  const stateKey = kind === 'right' ? 'qualityAlertRightPhoto' : 'qualityAlertWrongPhoto';
  state[stateKey] = null;

  if (!file) {
    renderQualityAlertPreview(kind);
    return;
  }

  const mimeType = qualityAlertImageMimeType(file);
  if (!mimeType) {
    input.value = '';
    throw new Error('Use apenas imagens PNG, JPG, WEBP ou GIF nos alertas de qualidade.');
  }

  if (file.size > QUALITY_ALERT_IMAGE_MAX_BYTES) {
    input.value = '';
    throw new Error(`Imagem muito grande: ${file.name}. Limite de 5 MB.`);
  }

  const dataUrl = normalizeDocumentDataUrl(await readFileAsDataUrl(file), mimeType);
  state[stateKey] = {
    fileName: file.name,
    mimeType,
    dataUrl
  };
  renderQualityAlertPreview(kind);
}

function qualityAlertImageMimeType(file) {
  const cleanType = String(file.type || '').trim().toLowerCase();
  if (QUALITY_ALERT_IMAGE_MIME_TYPES.has(cleanType)) return cleanType;

  const extension = String(file.name || '').split('.').pop()?.toLowerCase() || '';
  return QUALITY_ALERT_IMAGE_MIME_BY_EXTENSION[extension] || '';
}

function renderQualityAlertPreview(kind) {
  const preview = kind === 'right' ? el.qualityAlertRightPreview : el.qualityAlertWrongPreview;
  const photo = kind === 'right' ? state.qualityAlertRightPhoto : state.qualityAlertWrongPhoto;
  if (!preview) return;

  if (!photo?.dataUrl) {
    preview.textContent = 'Sem foto';
    preview.classList.remove('has-image');
    return;
  }

  preview.classList.add('has-image');
  preview.innerHTML = `<img src="${photo.dataUrl}" alt="${escapeHtml(photo.fileName)}">`;
}

function renderQualityAlerts() {
  if (!el.qualityAlertList) return;
  el.qualityAlertEmpty.hidden = state.qualityAlerts.length > 0;
  el.qualityAlertList.innerHTML = state.qualityAlerts.map((alert) => `
    <tr class="quality-alert-row ${alert.status === 'resolved' ? 'quality-alert-resolved-row' : ''}" data-quality-alert-row="${escapeHtml(alert.id)}">
      <td class="select-col">
        <input type="checkbox" data-quality-alert-select="${escapeHtml(alert.id)}" aria-label="Selecionar alerta">
      </td>
      <td>${qualityAlertStatusBadge(alert)}</td>
      ${cell(alert.orderNumber || '-')}
      ${cell(alert.customer || '-')}
      ${cell(alert.sku || '-')}
      ${cell(alert.productLine || '-')}
      ${cell(formatCapacity(alert.capacityTr) || '-')}
      ${cell(formatNumber(alert.quantity) || '-')}
      ${cell(alert.createdBy || '-')}
      ${cell(formatDateTime(alert.createdAt) || '-')}
      ${cell(formatDateTime(alert.resolvedAt) || '-')}
    </tr>
  `).join('');
  updateQualityAlertActionState();
}

function qualityAlertStatusBadge(alert) {
  const resolved = alert.status === 'resolved';
  return `<span class="status ${resolved ? 'cancelado' : 'liberado'}">${resolved ? 'Resolvido' : 'Ativo'}</span>`;
}

function qualityAlertPhotoMarkup(alert, kind) {
  const dataUrl = kind === 'right' ? alert.rightPhotoDataUrl : alert.wrongPhotoDataUrl;
  const fileName = kind === 'right' ? alert.rightPhotoName : alert.wrongPhotoName;
  if (!dataUrl) {
    return '<div class="quality-alert-thumb empty-thumb">Sem foto</div>';
  }

  return `<a class="quality-alert-thumb" href="${dataUrl}" target="_blank" rel="noopener"><img src="${dataUrl}" alt="${escapeHtml(fileName || 'alerta de qualidade')}"></a>`;
}

async function deleteQualityAlert(id) {
  if (!confirm('Excluir este alerta de qualidade?')) return;
  try {
    await api(`/api/quality/alerts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadQualityAlertsScreen();
    if (canViewTab('orders')) await loadOrders();
  } catch (error) {
    alert(error.message);
  }
}

function selectedQualityAlertIds() {
  return Array.from(el.qualityAlertList.querySelectorAll('[data-quality-alert-select]:checked'))
    .map((checkbox) => checkbox.dataset.qualityAlertSelect)
    .filter(Boolean);
}

function selectedQualityAlerts() {
  const selected = new Set(selectedQualityAlertIds());
  return state.qualityAlerts.filter((alert) => selected.has(alert.id));
}

function updateQualityAlertActionState() {
  const canEditQuality = canEditTab('quality');
  const selectedCount = selectedQualityAlertIds().length;
  if (el.qualityAlertResolve) el.qualityAlertResolve.disabled = !canEditQuality || selectedCount === 0;
  if (el.qualityAlertEdit) el.qualityAlertEdit.disabled = !canEditQuality || selectedCount !== 1;
  if (el.qualityAlertDelete) el.qualityAlertDelete.disabled = !canEditQuality || selectedCount === 0;
}

async function resolveSelectedQualityAlerts() {
  const alerts = selectedQualityAlerts();
  if (!alerts.length) {
    alert('Selecione pelo menos um alerta.');
    return;
  }

  try {
    await Promise.all(alerts.map((item) => api(`/api/quality/alerts/${encodeURIComponent(item.id)}/resolve`, { method: 'PATCH' })));
    await loadQualityAlertsScreen();
    if (canViewTab('orders')) await loadOrders();
  } catch (error) {
    alert(error.message);
  }
}

function editSelectedQualityAlert() {
  const alerts = selectedQualityAlerts();
  if (alerts.length !== 1) {
    alert('Selecione apenas um alerta para editar.');
    return;
  }

  openQualityAlertEditor(alerts[0]);
}

async function deleteSelectedQualityAlerts() {
  const alerts = selectedQualityAlerts();
  if (!alerts.length) {
    alert('Selecione pelo menos um alerta para excluir.');
    return;
  }

  if (!confirm(`Excluir ${alerts.length} alerta${alerts.length === 1 ? '' : 's'} de qualidade?`)) return;

  try {
    await Promise.all(alerts.map((item) => api(`/api/quality/alerts/${encodeURIComponent(item.id)}`, { method: 'DELETE' })));
    await loadQualityAlertsScreen();
    if (canViewTab('orders')) await loadOrders();
  } catch (error) {
    el.qualityAlertError.textContent = error.message;
    el.qualityAlertError.hidden = false;
  }
}

function ensureQualityAlertDetailDialog() {
  let backdrop = document.querySelector('#qualityAlertDetailBackdrop');
  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'qualityAlertDetailBackdrop';
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <section class="dialog quality-alert-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="qualityAlertDetailTitle">
      <div class="dialog-header">
        <div>
          <h2 id="qualityAlertDetailTitle">Alerta de qualidade</h2>
          <span class="dialog-subtitle" id="qualityAlertDetailSubtitle"></span>
        </div>
        <button class="btn icon-button" type="button" data-close-quality-alert-detail aria-label="Fechar">x</button>
      </div>
      <div class="dialog-body quality-alert-detail-body" id="qualityAlertDetailBody"></div>
      <div class="dialog-footer">
        <button class="btn primary" type="button" data-close-quality-alert-detail>Fechar</button>
      </div>
    </section>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop || event.target.closest('[data-close-quality-alert-detail]')) {
      backdrop.classList.remove('open');
    }
  });
  return backdrop;
}

function openQualityAlertDetail(alertId) {
  const alertRecord = state.qualityAlerts.find((item) => item.id === alertId);
  if (!alertRecord) return;

  const backdrop = ensureQualityAlertDetailDialog();
  backdrop.querySelector('#qualityAlertDetailSubtitle').textContent = `${alertRecord.orderNumber || '-'} | ${alertRecord.customer || '-'} | ${alertRecord.sku || '-'}`;
  backdrop.querySelector('#qualityAlertDetailBody').innerHTML = `
    <section class="billing-consult-section full">
      <span>Cabecalho</span>
      <div class="order-summary-grid">
        ${summaryItem('Status', alertRecord.status === 'resolved' ? 'Resolvido' : 'Ativo')}
        ${summaryItem('Pedido', alertRecord.orderNumber)}
        ${summaryItem('Cliente', alertRecord.customer)}
        ${summaryItem('Linha de produto', alertRecord.productLine)}
        ${summaryItem('SKU', alertRecord.sku)}
        ${summaryItem('Capacidade', formatCapacity(alertRecord.capacityTr))}
        ${summaryItem('Quantidade', formatNumber(alertRecord.quantity))}
        ${summaryItem('Emitido por', alertRecord.createdBy)}
        ${summaryItem('Emitido em', formatDateTime(alertRecord.createdAt))}
        ${summaryItem('Resolvido por', alertRecord.resolvedBy)}
        ${summaryItem('Resolvido em', formatDateTime(alertRecord.resolvedAt))}
      </div>
    </section>
    <section class="quality-alert-comparison full">
      <div class="quality-alert-comparison-card wrong">
        <strong>Jeito errado</strong>
        ${qualityAlertPhotoMarkup(alertRecord, 'wrong')}
        <p>${escapeHtml(alertRecord.wrongDescription || '-')}</p>
      </div>
      <div class="quality-alert-comparison-card right">
        <strong>Jeito certo</strong>
        ${qualityAlertPhotoMarkup(alertRecord, 'right')}
        <p>${escapeHtml(alertRecord.rightDescription || '-')}</p>
      </div>
    </section>
  `;
  backdrop.classList.add('open');
}

function activeQualityAlertMatches(order) {
  const acknowledgements = new Set(
    state.qualityAlertAcknowledgements.map((item) => `${item.alertId}:${item.orderId}`)
  );
  const red = [];
  const yellow = [];

  for (const alert of state.qualityAlerts) {
    if (alert.status === 'resolved') continue;
    if (acknowledgements.has(`${alert.id}:${order.id}`)) continue;
    const match = qualityAlertMatchType(alert, order);
    if (match === 'red') {
      red.push(alert);
    } else if (match === 'yellow') {
      yellow.push(alert);
    }
  }

  return { red, yellow, all: [...red, ...yellow] };
}

function qualityAlertMatchType(alert, order) {
  const orderSku = normalizeText(order.sku);
  const alertSku = normalizeText(alert.sku);
  if (orderSku && alertSku && orderSku === alertSku) {
    return 'red';
  }

  const orderCustomer = normalizeText(order.customer);
  const alertCustomer = normalizeText(alert.customer);
  if (orderCustomer && alertCustomer && orderCustomer === alertCustomer) {
    return 'yellow';
  }

  const orderLine = normalizeText(order.productLine);
  const alertLine = normalizeText(alert.productLine);
  const orderCapacity = Number(order.capacityTr);
  const alertCapacity = Number(alert.capacityTr);
  if (orderLine && alertLine && orderLine === alertLine
    && Number.isFinite(orderCapacity) && Number.isFinite(alertCapacity)
    && Math.abs(orderCapacity - alertCapacity) < 0.001) {
    return 'yellow';
  }

  return '';
}

function qualityAlertMarkers(order, matches = activeQualityAlertMatches(order)) {
  const markers = [];
  if (matches.red.length) {
    markers.push(`
      <button class="quality-alert-mark quality-alert-red" type="button" data-quality-alerts="${escapeHtml(order.id)}"
        title="${escapeHtml(`${matches.red.length} alerta(s) de qualidade por SKU`)}" aria-label="Alerta de qualidade por SKU">Q</button>
    `);
  }
  if (matches.yellow.length) {
    markers.push(`
      <button class="quality-alert-mark quality-alert-yellow" type="button" data-quality-alerts="${escapeHtml(order.id)}"
        title="${escapeHtml(`${matches.yellow.length} alerta(s) de qualidade por cliente ou linha/capacidade`)}" aria-label="Alerta de qualidade relacionado">Q</button>
    `);
  }
  return markers.join('');
}

function ensureQualityAlertNoticeDialog() {
  let backdrop = document.querySelector('#qualityAlertNoticeBackdrop');
  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'qualityAlertNoticeBackdrop';
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <section class="dialog quality-alert-notice-dialog" role="dialog" aria-modal="true" aria-labelledby="qualityAlertNoticeTitle">
      <div class="dialog-header">
        <div>
          <h2 id="qualityAlertNoticeTitle">Alertas de qualidade</h2>
          <span class="dialog-subtitle" id="qualityAlertNoticeSubtitle"></span>
        </div>
        <button class="btn icon-button" type="button" data-close-quality-alert-notice aria-label="Fechar">X</button>
      </div>
      <div class="dialog-body quality-alert-notice-body" id="qualityAlertNoticeBody"></div>
      <div class="dialog-footer">
        <button class="btn" type="button" data-close-quality-alert-notice>Manter ativa</button>
      </div>
    </section>
  `;
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', async (event) => {
    if (event.target === backdrop || event.target.closest('[data-close-quality-alert-notice]')) {
      closeQualityAlertNoticeDialog();
      return;
    }

    const acknowledgeButton = event.target.closest('[data-ack-quality-alert]');
    if (acknowledgeButton) {
      await acknowledgeQualityAlert(
        acknowledgeButton.dataset.ackQualityAlert,
        backdrop.dataset.orderId
      );
    }
  });

  return backdrop;
}

function openQualityAlertNoticeDialog(order) {
  if (!order) return;
  const matches = activeQualityAlertMatches(order);
  if (!matches.all.length) return;

  const backdrop = ensureQualityAlertNoticeDialog();
  backdrop.dataset.orderId = order.id;
  backdrop.querySelector('#qualityAlertNoticeSubtitle').textContent = `${order.orderNumber || '-'} | ${order.customer || '-'} | ${order.sku || '-'}`;
  backdrop.querySelector('#qualityAlertNoticeBody').innerHTML = matches.all.map((alert) => qualityAlertNoticeCard(alert, qualityAlertMatchType(alert, order))).join('');
  backdrop.classList.add('open');
}

function closeQualityAlertNoticeDialog() {
  document.querySelector('#qualityAlertNoticeBackdrop')?.classList.remove('open');
}

function qualityAlertNoticeCard(alert, type) {
  const reason = type === 'red'
    ? 'Mesmo SKU'
    : 'Mesmo cliente ou mesma linha/capacidade';
  return `
    <article class="quality-alert-notice-card ${type === 'red' ? 'critical' : 'warning'}">
      <header>
        <span>${escapeHtml(reason)}</span>
        <strong>${escapeHtml(alert.orderNumber || '-')}</strong>
      </header>
      <div class="quality-alert-record-meta">
        <span>SKU: ${escapeHtml(alert.sku || '-')}</span>
        <span>Cliente: ${escapeHtml(alert.customer || '-')}</span>
        <span>Linha: ${escapeHtml(alert.productLine || '-')}</span>
        <span>Capacidade: ${escapeHtml(formatCapacity(alert.capacityTr) || '-')}</span>
      </div>
      <div class="quality-alert-notice-descriptions">
        <p><strong>Errado:</strong> ${escapeHtml(alert.wrongDescription || '-')}</p>
        <p><strong>Certo:</strong> ${escapeHtml(alert.rightDescription || '-')}</p>
      </div>
      <button class="btn primary" type="button" data-ack-quality-alert="${escapeHtml(alert.id)}">Dar ciencia</button>
    </article>
  `;
}

async function acknowledgeQualityAlert(alertId, orderId) {
  try {
    await api(`/api/quality/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
      method: 'POST',
      body: { orderId }
    });
    await loadQualityAlertData(false);
    renderOrders();

    const order = state.orders.find((item) => item.id === orderId);
    const matches = order ? activeQualityAlertMatches(order) : { all: [] };
    if (!matches.all.length) {
      closeQualityAlertNoticeDialog();
      return;
    }

    openQualityAlertNoticeDialog(order);
  } catch (error) {
    alert(error.message);
  }
}

async function loadActivityLog() {
  const { activities } = await api('/api/activity-log');
  state.activities = activities;
  renderActivityLog();
}

function renderActivityLog() {
  renderFilterHeaders('reports');
  const activities = filteredTableRows('reports');

  el.activityLogBody.innerHTML = '';
  el.activityLogEmpty.textContent = state.activities.length
    ? 'Nenhuma atividade encontrada para o filtro.'
    : 'Nenhuma atividade registrada.';
  el.activityLogEmpty.hidden = activities.length > 0;

  for (const activity of activities) {
    const row = document.createElement('tr');
    row.innerHTML = `
      ${cell(formatDateTime(activity.createdAt))}
      ${cell(activity.actor)}
      ${cell(activity.action)}
      ${cell(activity.entityType)}
      ${cell(activity.entityLabel)}
      ${cell(activity.details)}
    `;
    el.activityLogBody.appendChild(row);
  }
}

function renderFilterHeaders(tableKey) {
  const config = TABLE_FILTERS[tableKey];
  const table = config?.table();
  const headRow = table?.querySelector('thead tr');

  if (!config || !headRow) return;

  table.classList.add('filterable-table');
  headRow.innerHTML = config.columns.map((column) => {
    const activeClass = hasColumnFilter(tableKey, column.key) ? ' active' : '';
    return `
      <th>
        <button class="column-filter-trigger${activeClass}" type="button"
          data-filter-table="${escapeHtml(tableKey)}"
          data-filter-key="${escapeHtml(column.key)}"
          title="Filtrar ${escapeHtml(column.label)}">
          <span>${escapeHtml(column.label)}</span>
          <span class="filter-caret" aria-hidden="true">v</span>
        </button>
      </th>
    `;
  }).join('');
}

function filteredTableRows(tableKey) {
  const config = TABLE_FILTERS[tableKey];
  if (!config) return [];

  return config.rows().filter((row) => rowMatchesTableFilters(row, config, config.filters()));
}

function rowMatchesTableFilters(row, config, filters, skipKey = '') {
  return config.columns.every((column) => {
    if (column.key === skipKey || !Object.prototype.hasOwnProperty.call(filters, column.key)) {
      return true;
    }

    return filters[column.key].includes(tableFilterValue(row, column));
  });
}

function tableFilterValues(tableKey, columnKey) {
  const config = TABLE_FILTERS[tableKey];
  if (!config) return [];

  const column = config.columns.find((item) => item.key === columnKey);
  if (!column) return [];

  const filters = config.filters();
  const values = new Set();

  for (const row of config.rows()) {
    if (rowMatchesTableFilters(row, config, filters, columnKey)) {
      values.add(tableFilterValue(row, column));
    }
  }

  return Array.from(values).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' }));
}

function tableFilterValue(row, column) {
  const value = column.value(row);
  return value === null || value === undefined ? '' : String(value);
}

function tableFilterLabel(value) {
  return value || '(Em branco)';
}

function hasColumnFilter(tableKey, columnKey) {
  const config = TABLE_FILTERS[tableKey];
  return Boolean(config && Object.prototype.hasOwnProperty.call(config.filters(), columnKey));
}

function ensureColumnFilterMenu() {
  let menu = document.querySelector('#columnFilterMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'columnFilterMenu';
    menu.className = 'column-filter-menu';
    menu.hidden = true;
    document.body.appendChild(menu);
  }
  return menu;
}

function openColumnFilterMenu(tableKey, columnKey, anchor) {
  const config = TABLE_FILTERS[tableKey];
  const column = config?.columns.find((item) => item.key === columnKey);
  if (!config || !column) return;

  const values = tableFilterValues(tableKey, columnKey);
  const filters = config.filters();
  const isFiltered = hasColumnFilter(tableKey, columnKey);
  const selectedValues = new Set(isFiltered ? filters[columnKey] : values);
  const menu = ensureColumnFilterMenu();

  state.activeColumnFilter = { tableKey, columnKey };
  menu.innerHTML = `
    <div class="column-filter-title">Filtrar ${escapeHtml(column.label)}</div>
    <input class="input column-filter-search" type="search" data-filter-search placeholder="Pesquisar">
    <label class="column-filter-option column-filter-select-all">
      <input type="checkbox" data-filter-toggle-all ${values.length ? '' : 'disabled'}>
      <span>Selecionar todos</span>
    </label>
    <div class="column-filter-list">
      ${values.length ? values.map((value) => `
        <label class="column-filter-option" data-filter-text="${escapeHtml(tableFilterLabel(value))}" title="${escapeHtml(tableFilterLabel(value))}">
          <input type="checkbox" data-filter-option data-filter-value="${escapeHtml(value)}" ${selectedValues.has(value) ? 'checked' : ''}>
          <span>${escapeHtml(tableFilterLabel(value))}</span>
        </label>
      `).join('') : '<div class="column-filter-empty">Sem valores para filtrar.</div>'}
      <div class="column-filter-empty" data-filter-no-results hidden>Nenhum valor encontrado.</div>
    </div>
    <div class="column-filter-footer">
      <button class="btn" type="button" data-filter-clear>Limpar filtro</button>
      <button class="btn primary" type="button" data-filter-apply>Aplicar</button>
    </div>
  `;

  menu.hidden = false;
  updateColumnFilterSearch(menu);
  updateColumnFilterSelectAll(menu);
  positionColumnFilterMenu(menu, anchor);
  menu.querySelector('[data-filter-search]')?.focus();
}

function closeColumnFilterMenu() {
  const menu = document.querySelector('#columnFilterMenu');
  if (menu) menu.hidden = true;
  state.activeColumnFilter = null;
}

function positionColumnFilterMenu(menu, anchor) {
  const bounds = anchor.getBoundingClientRect();
  const margin = 8;
  const menuWidth = Math.min(320, window.innerWidth - margin * 2);

  menu.style.width = `${menuWidth}px`;

  const preferredLeft = bounds.left;
  const left = Math.max(margin, Math.min(preferredLeft, window.innerWidth - menuWidth - margin));
  const belowTop = bounds.bottom + 6;
  const aboveTop = bounds.top - menu.offsetHeight - 6;
  const top = belowTop + menu.offsetHeight > window.innerHeight - margin && aboveTop > margin
    ? aboveTop
    : Math.min(belowTop, window.innerHeight - menu.offsetHeight - margin);

  menu.style.left = `${left}px`;
  menu.style.top = `${Math.max(margin, top)}px`;
}

function applyColumnFilterFromMenu(menu) {
  const active = state.activeColumnFilter;
  if (!active) return;

  const config = TABLE_FILTERS[active.tableKey];
  const values = tableFilterValues(active.tableKey, active.columnKey);
  const checkedValues = Array.from(menu.querySelectorAll('[data-filter-option]:checked'))
    .map((input) => input.dataset.filterValue || '');
  const filters = config.filters();

  if (checkedValues.length === values.length) {
    delete filters[active.columnKey];
  } else {
    filters[active.columnKey] = checkedValues;
  }

  closeColumnFilterMenu();
  config.render();
}

function clearColumnFilterFromMenu() {
  const active = state.activeColumnFilter;
  if (!active) return;

  const config = TABLE_FILTERS[active.tableKey];
  delete config.filters()[active.columnKey];
  closeColumnFilterMenu();
  config.render();
}

function updateColumnFilterSearch(menu) {
  const search = normalizeText(menu.querySelector('[data-filter-search]')?.value || '');
  let visibleCount = 0;

  for (const option of menu.querySelectorAll('[data-filter-option]')) {
    const row = option.closest('.column-filter-option');
    const text = normalizeText(row?.dataset.filterText || '');
    const visible = !search || text.includes(search);
    if (row) row.hidden = !visible;
    if (visible) visibleCount += 1;
  }

  const noResults = menu.querySelector('[data-filter-no-results]');
  if (noResults) {
    noResults.hidden = visibleCount > 0 || menu.querySelectorAll('[data-filter-option]').length === 0;
  }

  updateColumnFilterSelectAll(menu);
}

function updateColumnFilterSelectAll(menu) {
  const toggleAll = menu.querySelector('[data-filter-toggle-all]');
  if (!toggleAll) return;

  const visibleOptions = Array.from(menu.querySelectorAll('[data-filter-option]'))
    .filter((input) => !input.closest('.column-filter-option')?.hidden);
  const checkedCount = visibleOptions.filter((input) => input.checked).length;

  toggleAll.disabled = visibleOptions.length === 0;
  toggleAll.checked = visibleOptions.length > 0 && checkedCount === visibleOptions.length;
  toggleAll.indeterminate = checkedCount > 0 && checkedCount < visibleOptions.length;
}

async function loadDashboardCharts() {
  if (!state.statusDetails.length) {
    await loadStatuses();
  }

  const month = el.statusReleaseMonth ? el.statusReleaseMonth.value : '';
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  const statusReleasePath = `/api/dashboard/status-releases${params.toString() ? `?${params.toString()}` : ''}`;
  const [{ orders }, statusReleaseData, goalsData] = await Promise.all([
    api('/api/orders'),
    api(statusReleasePath),
    api('/api/dashboard/goals')
  ]);

  state.dashboardOrders = orders;
  state.dashboardGoals = goalsData.goals || {};
  fillDashboardYearSelect(orders);
  fillDashboardGoalInputs();
  updateDashboardGoalAccess();
  renderReleaseSummary(orders);
  renderStatusReleaseSummary(statusReleaseData.releases || []);
  renderDashboardCharts(orders);
}

function fillDashboardYearSelect(orders) {
  const selected = el.dashboardYear.value;
  const years = dashboardYears(orders);
  el.dashboardYear.innerHTML = '<option value="">Todos</option>';
  for (const year of years) {
    el.dashboardYear.appendChild(new Option(year, year));
  }

  el.dashboardYear.value = selected && years.includes(selected) ? selected : '';
}

function fillDashboardGoalInputs() {
  Object.entries(DASHBOARD_GOAL_FIELDS).forEach(([key, elementKey]) => {
    const input = el[elementKey];
    input.value = state.dashboardGoals[key] === '' || state.dashboardGoals[key] === undefined ? '' : state.dashboardGoals[key];
  });
  el.dashboardGoalError.hidden = true;
}

function updateDashboardGoalAccess() {
  const editable = canEditTab('dashboard');
  Object.values(DASHBOARD_GOAL_FIELDS).forEach((elementKey) => {
    el[elementKey].disabled = !editable;
  });
  el.saveDashboardGoals.hidden = !editable;
}

function selectedDashboardYear() {
  return el.dashboardYear ? String(el.dashboardYear.value || '') : '';
}

function numericGoal(key) {
  const rawValue = state.dashboardGoals[key];
  if (rawValue === '' || rawValue === null || rawValue === undefined) return null;
  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

function dashboardYears(orders) {
  const years = new Set();
  for (const order of orders) {
    for (const value of [order.entryDate, order.finalizationDate]) {
      const text = String(value || '');
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) years.add(text.slice(0, 4));
    }
  }
  return Array.from(years).sort((a, b) => b.localeCompare(a));
}

function dashboardGoalPayload() {
  const goals = {};
  Object.entries(DASHBOARD_GOAL_FIELDS).forEach(([key, elementKey]) => {
    const rawValue = String(el[elementKey].value || '').trim();
    goals[key] = rawValue === '' ? '' : Number(rawValue);
  });
  return goals;
}

async function saveDashboardGoals() {
  if (!canEditTab('dashboard')) return;
  el.dashboardGoalError.hidden = true;

  try {
    const { goals } = await api('/api/dashboard/goals', {
      method: 'PUT',
      body: { goals: dashboardGoalPayload() }
    });
    state.dashboardGoals = goals;
    fillDashboardGoalInputs();
    renderReleaseSummary(state.dashboardOrders);
    renderDashboardCharts(state.dashboardOrders);
  } catch (error) {
    el.dashboardGoalError.textContent = error.message;
    el.dashboardGoalError.hidden = false;
  }
}

function renderReleaseSummary(orders) {
  if (!el.releaseSummaryList || !el.releaseSummaryEmpty) return;

  const rows = deliveryReleaseSummaryByFinalizationMonth(
    orders,
    selectedDashboardYear(),
    el.releaseSummaryTypeFilter ? el.releaseSummaryTypeFilter.value : ''
  );
  el.releaseSummaryEmpty.hidden = rows.length > 0;
  el.releaseSummaryList.hidden = rows.length === 0;

  if (!rows.length) {
    el.releaseSummaryList.innerHTML = '';
    return;
  }

  el.releaseSummaryList.innerHTML = `
    <div class="release-summary-row release-summary-head">
      <span>M\u00eas</span>
      <span>Em atraso</span>
      <span>No prazo</span>
      <span>Antecipadas</span>
    </div>
    ${rows.map((row) => `
      <div class="release-summary-row">
        <strong>${escapeHtml(row.label)}</strong>
        <span>${formatInteger(row.late)}</span>
        <span>${formatInteger(row.onTime)}</span>
        <span>${formatInteger(row.early)}</span>
      </div>
    `).join('')}
  `;
}

function renderStatusReleaseSummary(rows) {
  if (!el.statusReleaseBody || !el.statusReleaseEmpty) return;

  const productionSet = new Set(state.productionStatuses);
  const productionRows = rows.filter((row) => productionSet.has(row.status));

  state.statusReleaseRows = productionRows;
  el.statusReleaseEmpty.hidden = productionRows.length > 0;
  const table = el.statusReleaseBody.closest('table');
  if (table) table.hidden = productionRows.length === 0;

  if (!productionRows.length) {
    el.statusReleaseBody.innerHTML = '';
    return;
  }

  el.statusReleaseBody.innerHTML = productionRows.map((row) => `
    <tr>
      <td>${escapeHtml(formatMonth(row.month))}</td>
      <td><span class="status ${statusClass(row.status)}">${escapeHtml(labelStatus(row.status))}</span></td>
      <td>${formatInteger(row.machines)}</td>
      <td>${formatInteger(row.orders)}</td>
      <td>${escapeHtml(formatDateTime(row.lastCompletedAt))}</td>
    </tr>
  `).join('');
}

function renderDashboardCharts(orders) {
  const year = selectedDashboardYear();
  const productionOrders = orders.filter(isProductionItem);
  renderChart(
    el.chartMachinesSoldMonth,
    'Máquinas vendidas por mês',
    groupMachinesByMonth(productionOrders, 'entryDate', year),
    'bar',
    'Máquinas',
    numericGoal('soldMonth')
  );
  renderChart(
    el.chartMachinesFinishedMonth,
    'Máquinas finalizadas por mês',
    groupMachinesByMonth(productionOrders, 'finalizationDate', year),
    'bar',
    'Máquinas',
    numericGoal('finishedMonth')
  );
  renderChart(
    el.chartLeadTimeMonth,
    'Lead time médio por mês',
    groupLeadTimeByFinalizationMonth(productionOrders, year),
    'scatter',
    'Dias',
    numericGoal('leadTimeMonth')
  );
  renderChart(
    el.chartAverageMachinesYear,
    'Média mensal vendida por ano',
    averageMachinesByYear(productionOrders, year),
    'bar',
    'Máquinas',
    numericGoal('averageSoldYear')
  );
  renderPunctualityChart(
    el.chartDeliveryPunctuality,
    deliveryPunctualityByFinalizationMonth(productionOrders, year),
    numericGoal('deliveryPunctuality')
  );
  renderChart(
    el.chartAverageProducedYear,
    'Media mensal produzida por ano',
    averageProducedByYear(productionOrders, year),
    'bar',
    'Itens',
    numericGoal('averageProducedYear')
  );
}

function renderChart(container, title, series, type, yTitle, goal = null) {
  if (!series.length) {
    container.innerHTML = '<div class="empty chart-empty">Sem dados para exibir.</div>';
    return;
  }

  const traces = [{
    x: series.map((item) => item.label),
    y: series.map((item) => item.value),
    type,
    mode: type === 'scatter' ? 'lines+markers' : undefined,
    name: title,
    marker: { color: '#0d6efd' },
    line: { color: '#0d6efd', width: 3 },
    hovertemplate: '%{x}<br>%{y}<extra></extra>'
  }];

  if (goal !== null) {
    traces.push(goalTrace(series, goal));
  }

  window.Plotly.newPlot(
    container,
    traces,
    {
      title: { text: title, font: { size: 13 } },
      margin: { t: 38, r: 12, b: 48, l: 48 },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      font: { family: 'Arial, Helvetica, sans-serif', size: 11, color: '#172033' },
      xaxis: { automargin: true, tickangle: -25, gridcolor: '#edf2f7' },
      yaxis: { title: yTitle, rangemode: 'tozero', gridcolor: '#edf2f7' },
      bargap: 0.24,
      showlegend: goal !== null
    },
    { displayModeBar: false, responsive: true }
  );
}

function renderPunctualityChart(container, series, goal = null) {
  if (!series.length) {
    container.innerHTML = '<div class="empty chart-empty">Sem dados para exibir.</div>';
    return;
  }

  const traces = [{
    x: series.map((item) => item.label),
    y: series.map((item) => item.value),
    type: 'bar',
    name: 'Pontualidade',
    marker: { color: '#1e7f4f' },
    customdata: series.map((item) => [item.onTime, item.delivered]),
    hovertemplate: '%{x}<br>%{y}%<br>No prazo: %{customdata[0]}<br>Entregues: %{customdata[1]}<extra></extra>'
  }];

  if (goal !== null) {
    traces.push(goalTrace(series, goal, '%'));
  }

  window.Plotly.newPlot(
    container,
    traces,
    {
      title: { text: 'Pontualidade de entrega', font: { size: 13 } },
      margin: { t: 38, r: 12, b: 48, l: 48 },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      font: { family: 'Arial, Helvetica, sans-serif', size: 11, color: '#172033' },
      xaxis: { automargin: true, tickangle: -25, gridcolor: '#edf2f7' },
      yaxis: { title: '% no prazo', range: [0, 100], ticksuffix: '%', gridcolor: '#edf2f7' },
      bargap: 0.24,
      showlegend: goal !== null
    },
    { displayModeBar: false, responsive: true }
  );
}

function goalTrace(series, goal, suffix = '') {
  return {
    x: series.map((item) => item.label),
    y: series.map(() => goal),
    type: 'scatter',
    mode: 'lines',
    name: 'Meta',
    line: { color: '#dc2626', width: 2, dash: 'dash' },
    hovertemplate: `Meta: %{y}${suffix}<extra></extra>`
  };
}

function groupMachinesByMonth(orders, dateField, year = '') {
  const totals = new Map();

  for (const order of orders) {
    const key = monthKey(order[dateField]);
    if (year && key.slice(0, 4) !== year) continue;
    if (!key) continue;
    totals.set(key, (totals.get(key) || 0) + (Number(order.quantity) || 0));
  }

  return mapMonthSeries(totals);
}

function groupLeadTimeByFinalizationMonth(orders, year = '') {
  const groups = new Map();

  for (const order of orders) {
    const key = monthKey(order.finalizationDate);
    const leadTime = diffDays(order.entryDate, order.finalizationDate);
    if (year && key.slice(0, 4) !== year) continue;
    if (!key || leadTime === null) continue;

    const group = groups.get(key) || { total: 0, count: 0 };
    group.total += leadTime;
    group.count += 1;
    groups.set(key, group);
  }

  const averages = new Map();
  for (const [key, group] of groups.entries()) {
    averages.set(key, Math.round((group.total / group.count) * 10) / 10);
  }

  return mapMonthSeries(averages);
}

function averageMachinesByYear(orders, year = '') {
  const monthlyTotals = new Map();
  const yearlyMonths = new Map();

  for (const order of orders) {
    const key = monthKey(order.entryDate);
    if (year && key.slice(0, 4) !== year) continue;
    if (!key) continue;
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (Number(order.quantity) || 0));
  }

  for (const [month, total] of monthlyTotals.entries()) {
    const year = month.slice(0, 4);
    if (!yearlyMonths.has(year)) yearlyMonths.set(year, []);
    yearlyMonths.get(year).push(total);
  }

  return Array.from(yearlyMonths.entries())
    .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
    .map(([year, totals]) => ({
      label: year,
      value: Math.round((totals.reduce((sum, value) => sum + value, 0) / totals.length) * 10) / 10
    }));
}

function averageProducedByYear(orders, year = '') {
  const monthlyTotals = new Map();
  const yearlyMonths = new Map();

  for (const order of orders) {
    const key = monthKey(order.finalizationDate);
    if (year && key.slice(0, 4) !== year) continue;
    if (!key) continue;
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (Number(order.quantity) || 0));
  }

  for (const [month, total] of monthlyTotals.entries()) {
    const year = month.slice(0, 4);
    if (!yearlyMonths.has(year)) yearlyMonths.set(year, []);
    yearlyMonths.get(year).push(total);
  }

  return Array.from(yearlyMonths.entries())
    .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
    .map(([year, totals]) => ({
      label: year,
      value: Math.round((totals.reduce((sum, value) => sum + value, 0) / totals.length) * 10) / 10
    }));
}

function deliveryReleaseSummaryByFinalizationMonth(orders, year = '', itemType = '') {
  const groups = new Map();

  for (const order of orders) {
    if (itemType && order.itemType !== itemType) continue;
    if (!isValidDateText(order.finalizationDate) || !isValidDateText(order.originalDeliveryDate)) continue;

    const key = order.finalizationDate.slice(0, 7);
    if (year && key.slice(0, 4) !== year) continue;

    const quantity = Number(order.quantity) || 0;
    if (quantity <= 0) continue;

    const finalizationDate = parseLocalDate(order.finalizationDate);
    const originalDeliveryDate = parseLocalDate(order.originalDeliveryDate);
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
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, group]) => ({
      label: formatMonth(month),
      late: group.late,
      onTime: group.onTime,
      early: group.early
    }));
}

function deliveryPunctualityByFinalizationMonth(orders, year = '') {
  const groups = new Map();

  for (const order of orders) {
    const key = monthKey(order.finalizationDate);
    if (year && key.slice(0, 4) !== year) continue;
    if (!key || !isValidDateText(order.originalDeliveryDate)) continue;

    const quantity = Number(order.quantity) || 0;
    if (quantity <= 0) continue;

    const group = groups.get(key) || { delivered: 0, onTime: 0 };
    group.delivered += quantity;
    if (isOnTimeDelivery(order)) group.onTime += quantity;
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, group]) => ({
      label: formatMonth(month),
      value: group.delivered ? Math.round((group.onTime / group.delivered) * 1000) / 10 : 0,
      delivered: group.delivered,
      onTime: group.onTime
    }));
}

function isOnTimeDelivery(order) {
  if (!isValidDateText(order.finalizationDate) || !isValidDateText(order.originalDeliveryDate)) return false;
  return parseLocalDate(order.finalizationDate) <= parseLocalDate(order.originalDeliveryDate);
}

function mapMonthSeries(valuesByMonth) {
  return Array.from(valuesByMonth.entries())
    .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
    .map(([month, value]) => ({ label: formatMonth(month), value }));
}

function monthKey(value) {
  const text = String(value || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text.slice(0, 7) : '';
}

function isValidDateText(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function cell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `<td title="${escapeHtml(text)}">${escapeHtml(text)}</td>`;
}

function itemTypeLabel(value) {
  return value === 'purchased' ? 'Pe\u00e7as compradas' : 'Produ\u00e7\u00e3o';
}

function isProductionItem(order) {
  return order.itemType === 'production';
}

function productionOrderCell(order, userCanEdit) {
  const text = order.productionOrder || '';
  const button = userCanEdit
    ? `<button class="inline-action" type="button" data-op="${order.id}">${text ? 'Alterar' : 'Inserir OP'}</button>`
    : '';
  return `<td title="${escapeHtml(text)}"><span class="cell-action-wrap"><span>${escapeHtml(text || '-')}</span>${button}</span></td>`;
}

function purchaseOrderCell(order, userCanEdit) {
  if (order.itemType !== 'purchased') {
    return '<td title="Item de producao">-</td>';
  }

  const text = order.purchaseOrderNumber || '';
  const button = userCanEdit
    ? `<button class="inline-action" type="button" data-purchase-order="${order.id}">${text ? 'Alterar' : 'Inserir PC'}</button>`
    : '';
  return `<td title="${escapeHtml(text)}"><span class="cell-action-wrap"><span>${escapeHtml(text || '-')}</span>${button}</span></td>`;
}

function openDialog(order = null) {
  state.editingId = order ? order.id : null;
  el.form.reset();
  el.formError.hidden = true;
  el.deleteOrder.hidden = !order;
  el.deleteOrder.hidden = !order || !canEditOrders();
  el.orderPhotoError.hidden = true;
  el.orderPhotoInput.value = '';
  el.orderPhotoSection.hidden = !order || !canEditOrders();
  el.dialogTitle.textContent = order ? 'Editar pedido' : 'Novo pedido';

  if (order) {
    ensureOption(el.customer, order.customer);
    ensureOption(el.status, order.status);
    el.orderNumber.value = order.orderNumber || '';
    el.commercialResponsible.value = order.commercialResponsible || '';
    el.customer.value = order.customer || '';
    el.sku.value = order.sku || '';
    el.itemType.value = order.itemType || 'production';
    el.productionOrder.value = order.productionOrder || '';
    el.purchaseOrderNumber.value = order.purchaseOrderNumber || '';
    el.capacityTr.value = order.capacityTr ?? '';
    el.productLine.value = order.productLine || '';
    el.equipment.value = order.equipment || '';
    el.voltage.value = order.voltage || '';
    el.quantity.value = order.quantity ?? '';
    el.leadTime.value = order.leadTime || '';
    el.entryDate.value = order.entryDate || '';
    el.originalDeliveryDate.value = order.originalDeliveryDate || '';
    el.productionDeliveryDate.value = order.productionDeliveryDate || '';
    el.finalizationDate.value = order.finalizationDate || '';
    el.notes.value = order.notes || '';
    el.status.value = order.status;
  } else {
    el.entryDate.valueAsDate = new Date();
    el.itemType.value = 'production';
    el.purchaseOrderNumber.value = '';
    el.status.value = state.statuses[0] || '';
  }

  togglePurchaseOrderField();
  updateLeadTimePreview();
  updateDaysLatePreview();
  el.backdrop.classList.add('open');
  el.orderNumber.focus();
  refreshOrderPhotoEditor();
}

function closeDialog() {
  state.editingId = null;
  state.orderPhotos = [];
  el.orderPhotoList.innerHTML = '';
  el.backdrop.classList.remove('open');
}

function openStatusDialog(orders) {
  const selectedOrders = (Array.isArray(orders) ? orders : [orders]).filter(Boolean);
  if (!selectedOrders.length) {
    return;
  }

  state.statusOrderIds = selectedOrders.map((order) => order.id);
  el.statusChangeError.hidden = true;
  el.statusChangeAllowDeviation.checked = false;
  el.statusChangeDeviationReason.value = '';
  el.statusChangeDeviationReasonField.hidden = true;
  const firstStatus = selectedOrders[0].status || '';
  const hasSameStatus = selectedOrders.every((order) => order.status === firstStatus);
  if (hasSameStatus) {
    ensureOption(el.statusChangeSelect, firstStatus);
    el.statusChangeSelect.value = firstStatus;
  } else {
    el.statusChangeSelect.value = '';
  }
  el.statusDialogTitle.textContent = selectedOrders.length === 1
    ? 'Alterar status'
    : `Alterar status (${selectedOrders.length} pedidos)`;
  el.statusDialogBackdrop.classList.add('open');
  el.statusChangeSelect.focus();
}

function closeStatusDialog() {
  state.statusOrderIds = [];
  el.statusChangeAllowDeviation.checked = false;
  el.statusChangeDeviationReason.value = '';
  el.statusChangeDeviationReasonField.hidden = true;
  el.statusDialogBackdrop.classList.remove('open');
}

function openPasswordDialog() {
  el.currentPassword.value = '';
  el.newPassword.value = '';
  el.confirmNewPassword.value = '';
  el.changePasswordError.hidden = true;
  el.passwordDialogBackdrop.classList.add('open');
  setTimeout(() => el.currentPassword.focus(), 0);
}

function closePasswordDialog() {
  el.passwordDialogBackdrop.classList.remove('open');
  el.changePasswordForm.reset();
  el.changePasswordError.hidden = true;
}

async function submitPasswordChange() {
  const currentPassword = el.currentPassword.value;
  const newPassword = el.newPassword.value;
  const confirmPassword = el.confirmNewPassword.value;

  if (newPassword.length < 6) {
    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('A confirmacao da nova senha nao confere.');
  }

  const { user } = await api('/api/change-password', {
    method: 'POST',
    body: {
      currentPassword,
      newPassword,
      confirmPassword
    }
  });

  state.user = user;
  el.userName.textContent = user.name || user.username;
  closePasswordDialog();
  alert('Senha alterada com sucesso.');
}

async function openDimensionsDialog() {
  if (!canEditOrders()) return;

  el.dimensionsError.hidden = true;
  el.dimensionsForm.reset();
  el.dimensionOrderSelect.innerHTML = '<option value="">Carregando pedidos...</option>';
  el.dimensionsDialogBackdrop.classList.add('open');

  try {
    const { orders } = await api('/api/orders?scope=active&sort=orderNumber&direction=asc');
    state.dimensionOrderOptions = orders || [];
    renderDimensionOrderOptions();

    const selectedOrder = getSelectedOrders()[0];
    if (selectedOrder && state.dimensionOrderOptions.some((order) => order.id === selectedOrder.id)) {
      el.dimensionOrderSelect.value = selectedOrder.id;
    }

    fillDimensionDialogFromSelectedOrder();
    setTimeout(() => el.dimensionOrderSelect.focus(), 0);
  } catch (error) {
    el.dimensionsError.textContent = error.message;
    el.dimensionsError.hidden = false;
  }
}

function closeDimensionsDialog() {
  state.dimensionOrderOptions = [];
  el.dimensionsDialogBackdrop.classList.remove('open');
  el.dimensionsForm.reset();
  el.dimensionsError.hidden = true;
}

function renderDimensionOrderOptions() {
  el.dimensionOrderSelect.innerHTML = '<option value="">Selecione o pedido</option>';

  for (const order of state.dimensionOrderOptions) {
    const label = [order.orderNumber, order.customer, order.sku, order.equipment]
      .filter(Boolean)
      .join(' | ');
    el.dimensionOrderSelect.appendChild(new Option(label || order.id, order.id));
  }
}

function fillDimensionDialogFromSelectedOrder() {
  const order = state.dimensionOrderOptions.find((item) => item.id === el.dimensionOrderSelect.value);
  setDimensionInputs('dimension', order || {});
}

async function submitDimensionsDialog() {
  const orderId = el.dimensionOrderSelect.value;
  if (!orderId) {
    throw new Error('Selecione o pedido para informar o dimensional.');
  }

  const { order } = await api(`/api/orders/${encodeURIComponent(orderId)}/billing-dimensions`, {
    method: 'PATCH',
    body: dimensionPayloadFromPrefix('dimension')
  });

  state.dimensionOrderOptions = state.dimensionOrderOptions.map((item) => (item.id === order.id ? order : item));
  updateOrderInMemory(order);
  closeDimensionsDialog();
  await refreshOrdersIfVisible();
  if (state.currentScreen === 'billing') await loadBillingItems();
}

function openBillingDialog(orderId, sourceType = '') {
  const order = findBillingItem(orderId, sourceType);
  if (!order || !canEditTab('billing')) return;

  state.billingDialogOrderId = order.id;
  state.billingDialogSourceType = billingSourceType(order);
  state.billingInvoiceDocument = null;
  el.billingForm.reset();
  el.billingError.hidden = true;
  el.billingDialogSubtitle.textContent = billingDialogSubtitle(order);
  el.billingInvoiceNumber.value = order.invoiceNumber || '';
  el.billingCarrierName.value = order.carrierName || '';
  el.billingCarrierCnpj.value = order.carrierCnpj || '';
  el.billingFreightAddress.value = order.freightAddress || '';
  el.billingCustomerName.value = order.billingCustomerName || order.customer || '';
  el.billingCustomerCnpj.value = order.billingCustomerCnpj || '';
  el.billingInvoiceDocument.value = '';
  updateBillingInvoiceDocumentInfo(order);
  setDimensionInputs('billing', order);
  el.billingDialogBackdrop.classList.add('open');
  setTimeout(() => el.billingInvoiceNumber.focus(), 0);
}

function closeBillingDialog() {
  state.billingDialogOrderId = null;
  state.billingDialogSourceType = 'order';
  state.billingInvoiceDocument = null;
  el.billingDialogBackdrop.classList.remove('open');
  el.billingForm.reset();
  el.billingError.hidden = true;
}

async function saveBillingDialog(markAsInvoiced = false) {
  const orderId = state.billingDialogOrderId;
  if (!orderId) {
    throw new Error('Pedido de faturamento nao selecionado.');
  }

  const url = markAsInvoiced
    ? `${billingItemApiBase(state.billingDialogSourceType, orderId)}/mark-invoiced`
    : `${billingItemApiBase(state.billingDialogSourceType, orderId)}/billing-info`;
  const { order } = await api(url, {
    method: 'PATCH',
    body: billingDialogPayload()
  });

  updateBillingOrderInMemory(order);
  closeBillingDialog();
  await loadBillingItems();
  if (state.currentScreen === 'loading') await loadLoadingItems();
  await refreshOrdersIfVisible();
}

function billingDialogPayload() {
  return {
    invoiceNumber: el.billingInvoiceNumber.value,
    carrierName: el.billingCarrierName.value,
    carrierCnpj: el.billingCarrierCnpj.value,
    freightAddress: el.billingFreightAddress.value,
    billingCustomerName: el.billingCustomerName.value,
    billingCustomerCnpj: el.billingCustomerCnpj.value,
    ...(state.billingInvoiceDocument ? { invoiceDocument: state.billingInvoiceDocument } : {}),
    ...dimensionPayloadFromPrefix('billing')
  };
}

function updateBillingInvoiceDocumentInfo(order = null) {
  if (state.billingInvoiceDocument) {
    el.billingInvoiceDocumentInfo.textContent = `Novo arquivo selecionado: ${state.billingInvoiceDocument.fileName}`;
    return;
  }

  if (order?.hasInvoiceDocument && order.invoiceDocumentName) {
    el.billingInvoiceDocumentInfo.textContent = `Documento cadastrado: ${order.invoiceDocumentName}`;
    return;
  }

  el.billingInvoiceDocumentInfo.textContent = 'Nenhum documento cadastrado.';
}

async function handleBillingInvoiceDocumentChange() {
  const file = el.billingInvoiceDocument.files?.[0];
  state.billingInvoiceDocument = null;

  if (!file) {
    const order = findBillingItem(state.billingDialogOrderId, state.billingDialogSourceType);
    updateBillingInvoiceDocumentInfo(order);
    return;
  }

  const mimeType = orderDocumentMimeType(file);
  if (!mimeType) {
    el.billingInvoiceDocument.value = '';
    throw new Error(`Formato nao permitido para NF: ${file.name}`);
  }

  if (file.size > ORDER_DOCUMENT_MAX_BYTES) {
    el.billingInvoiceDocument.value = '';
    throw new Error(`Nota fiscal muito grande: ${file.name}. Limite de 8 MB.`);
  }

  const dataUrl = normalizeDocumentDataUrl(await readFileAsDataUrl(file), mimeType);
  state.billingInvoiceDocument = {
    fileName: file.name,
    mimeType,
    dataUrl
  };
  updateBillingInvoiceDocumentInfo();
}

function updateBillingOrderInMemory(order) {
  if (!order) return;
  const replace = (item) => (item.id === order.id ? order : item);
  state.billingItems = state.billingItems.map(replace);
  state.billingInvoicedItems = state.billingInvoicedItems.map(replace);
  state.loadingItems = state.loadingItems.map(replace);
  state.thirdPartyItems = state.thirdPartyItems.map(replace);
  if (billingSourceType(order) === 'order') {
    updateOrderInMemory(order);
  }
}

function ensureBillingConsultDialog() {
  let backdrop = document.querySelector('#billingConsultBackdrop');
  if (backdrop) return backdrop;

  backdrop = document.createElement('div');
  backdrop.id = 'billingConsultBackdrop';
  backdrop.className = 'dialog-backdrop';
  backdrop.innerHTML = `
    <section class="dialog billing-consult-dialog" role="dialog" aria-modal="true" aria-labelledby="billingConsultTitle">
      <div class="dialog-header">
        <div>
          <h2 id="billingConsultTitle">Consulta do faturamento</h2>
          <span class="dialog-subtitle" id="billingConsultSubtitle"></span>
        </div>
        <button class="icon-button" type="button" data-close-billing-consult aria-label="Fechar">x</button>
      </div>
      <div class="dialog-body billing-consult-body" id="billingConsultBody"></div>
      <div class="dialog-footer">
        <button class="btn" type="button" data-open-invoice-consult>Abrir NF</button>
        <button class="btn" type="button" data-download-invoice-consult>Baixar NF</button>
        <button class="btn primary" type="button" data-close-billing-consult>Fechar</button>
      </div>
    </section>
  `;
  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', async (event) => {
    if (event.target === backdrop || event.target.closest('[data-close-billing-consult]')) {
      closeBillingConsultDialog();
      return;
    }

    if (event.target.closest('[data-open-invoice-consult]')) {
      await openInvoiceDocumentPreview(backdrop.dataset.orderId, backdrop.dataset.sourceType);
      return;
    }

    if (event.target.closest('[data-download-invoice-consult]')) {
      await downloadInvoiceDocument(backdrop.dataset.orderId, backdrop.dataset.sourceType);
    }
  });

  return backdrop;
}

function openBillingConsultDialog(orderId, sourceType = '') {
  const order = findBillingItem(orderId, sourceType);
  if (!order) return;

  const backdrop = ensureBillingConsultDialog();
  const subtitle = backdrop.querySelector('#billingConsultSubtitle');
  const body = backdrop.querySelector('#billingConsultBody');
  const openButton = backdrop.querySelector('[data-open-invoice-consult]');
  const downloadButton = backdrop.querySelector('[data-download-invoice-consult]');

  backdrop.dataset.orderId = order.id;
  backdrop.dataset.sourceType = billingSourceType(order);
  subtitle.textContent = billingDialogSubtitle(order);
  openButton.disabled = !order.hasInvoiceDocument;
  downloadButton.disabled = !order.hasInvoiceDocument;

  body.innerHTML = `
    <section class="billing-consult-section full">
      <span>${billingSourceType(order) === 'thirdParty' ? 'Romaneio' : 'Pedido'}</span>
      <div class="order-summary-grid">
        ${summaryItem('Pedido', order.orderNumber)}
        ${summaryItem('Tipo', billingRequestTypeLabel(order))}
        ${summaryItem('Pedido de venda', billingSalesOrderLabel(order))}
        ${summaryItem('Pedido compra', billingPurchaseOrderLabel(order))}
        ${summaryItem('Cliente', order.customer)}
        ${summaryItem('SKU', order.sku)}
        ${summaryItem('Equipamento', order.equipment)}
        ${summaryItem('Quantidade', formatNumber(order.quantity))}
        ${summaryItem('Status', order.status)}
      </div>
    </section>
    ${thirdPartyConsultDetails(order)}
    <section class="billing-consult-section full">
      <span>Faturamento</span>
      <div class="order-summary-grid">
        ${summaryItem('NF', order.invoiceNumber)}
        ${summaryItem('Faturado em', formatDateTime(order.invoicedAt))}
        ${summaryItem('Faturado por', order.invoicedBy)}
        ${summaryItem('Transportadora', order.carrierName)}
        ${summaryItem('CNPJ transportadora', order.carrierCnpj)}
        ${summaryItem('Cliente / fornecedor frete', order.billingCustomerName)}
        ${summaryItem('CNPJ cliente', order.billingCustomerCnpj)}
        ${summaryItem('Endereco do frete', order.freightAddress)}
      </div>
    </section>
    <section class="billing-consult-section full">
      <span>Dimensionais</span>
      <div class="order-summary-grid">
        ${summaryItem('Altura', formatNumber(order.machineHeight))}
        ${summaryItem('Largura', formatNumber(order.machineWidth))}
        ${summaryItem('Comprimento', formatNumber(order.machineLength))}
        ${summaryItem('Peso liquido', formatNumber(order.machineWeight))}
        ${summaryItem('Peso bruto', formatNumber(order.machineGrossWeight))}
        ${summaryItem('Volume', formatNumber(order.machineVolume))}
      </div>
    </section>
    <section class="billing-consult-section billing-invoice-section full">
      <span>Nota fiscal</span>
      <div class="invoice-document-card">
        <strong>${escapeHtml(order.invoiceDocumentName || (order.hasInvoiceDocument ? 'Documento cadastrado' : 'Sem documento cadastrado'))}</strong>
        <small>${order.hasInvoiceDocument ? 'Use Abrir NF para visualizar aqui ou Baixar NF para salvar o arquivo.' : 'Nenhuma nota fiscal foi anexada neste item.'}</small>
      </div>
      <div class="invoice-preview" id="invoicePreview" hidden></div>
    </section>
  `;

  backdrop.classList.add('open');
}

function thirdPartyConsultDetails(order) {
  if (billingSourceType(order) !== 'thirdParty') return '';

  return `
    <section class="billing-consult-section full">
      <span>Dados da remessa</span>
      <div class="order-summary-grid">
        ${summaryItem('Romaneio', order.romaneioNumber)}
        ${summaryItem('Terceiro / fornecedor', order.supplierName)}
        ${summaryItem('CNPJ terceiro', order.supplierCnpj)}
        ${summaryItem('Codigo da peca', order.partCode)}
        ${summaryItem('Descricao da peca', order.partDescription)}
        ${summaryItem('Quantidade', `${formatNumber(order.quantity)} ${order.unit || ''}`.trim())}
        ${summaryItem('Processo', order.processDescription)}
        ${summaryItem('Data emissao', formatDate(order.issueDate))}
        ${summaryItem('Retorno previsto', formatDate(order.expectedReturnDate))}
        ${summaryItem('Retorno realizado', formatDate(order.returnDate))}
        ${summaryItem('Pedido de venda', thirdPartyLinkedOrderLabel(order))}
        ${summaryItem('Pedido compra', order.purchaseOrderNumber)}
        ${summaryItem('Solicitacao', 'Beneficiamento')}
        ${summaryItem('OP / ref. interna', order.salesOrderReference)}
      </div>
      <div class="order-summary-notes">
        <span>Observacoes</span>
        <p>${escapeHtml(order.notes || 'Sem observacoes.')}</p>
      </div>
    </section>
  `;
}

function closeBillingConsultDialog() {
  const backdrop = document.querySelector('#billingConsultBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  backdrop.dataset.orderId = '';
  backdrop.dataset.sourceType = '';
  const preview = backdrop.querySelector('#invoicePreview');
  if (preview) {
    preview.hidden = true;
    preview.innerHTML = '';
  }
}

async function fetchInvoiceDocument(orderId, sourceType = 'order') {
  const { document: invoiceDocument } = await api(`${billingItemApiBase(sourceType, orderId)}/invoice-document`);
  return invoiceDocument;
}

async function openInvoiceDocumentPreview(orderId, sourceType = 'order') {
  const backdrop = document.querySelector('#billingConsultBackdrop');
  const preview = backdrop?.querySelector('#invoicePreview');
  if (!orderId || !preview) return;

  try {
    preview.hidden = false;
    preview.innerHTML = '<div class="empty">Carregando nota fiscal...</div>';
    const invoiceDocument = await fetchInvoiceDocument(orderId, sourceType);
    const fileName = invoiceDocument.fileName || 'nota-fiscal';
    const mimeType = invoiceDocument.mimeType || '';
    if (mimeType.startsWith('image/')) {
      preview.innerHTML = `<img src="${invoiceDocument.dataUrl}" alt="Nota fiscal ${escapeHtml(fileName)}">`;
      return;
    }

    preview.innerHTML = `<iframe title="Nota fiscal ${escapeHtml(fileName)}" src="${invoiceDocument.dataUrl}"></iframe>`;
  } catch (error) {
    preview.hidden = false;
    preview.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

async function downloadInvoiceDocument(orderId, sourceType = 'order') {
  try {
    const invoiceDocument = await fetchInvoiceDocument(orderId, sourceType);
    const link = document.createElement('a');
    link.href = invoiceDocument.dataUrl;
    link.download = invoiceDocument.fileName || 'nota-fiscal';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    alert(error.message);
  }
}

async function openPhotosDialog(order) {
  const photos = await loadOrderPhotos(order.id);
  renderPhotoGrid(el.photosViewList, photos, { allowDelete: false, orderId: order.id });
  el.photosViewEmpty.hidden = photos.length > 0;
  el.photosDialogBackdrop.classList.add('open');
}

function closePhotosDialog() {
  el.photosDialogBackdrop.classList.remove('open');
  el.photosViewList.innerHTML = '';
}

async function loadOrderPhotos(orderId) {
  const { photos } = await api(`/api/orders/${encodeURIComponent(orderId)}/photos`);
  state.orderPhotos = photos;
  return photos;
}

async function refreshOrderPhotoEditor() {
  if (!state.editingId || !canEditOrders()) {
    el.orderPhotoList.innerHTML = '';
    return;
  }

  const photos = await loadOrderPhotos(state.editingId);
  renderPhotoGrid(el.orderPhotoList, photos, { allowDelete: true, orderId: state.editingId });
}

function renderPhotoGrid(container, photos, options = {}) {
  container.innerHTML = photos.map((photo) => `
    <figure class="photo-tile ${isImageDocument(photo) ? '' : 'document-tile'}">
      ${documentPreviewMarkup(photo)}
      <figcaption title="${escapeHtml(photo.fileName)}">${escapeHtml(photo.fileName)}</figcaption>
      ${options.allowDelete ? `<button class="icon-button photo-delete" type="button" data-delete-photo="${photo.id}" data-order-id="${options.orderId}" aria-label="Excluir documento">x</button>` : ''}
    </figure>
  `).join('');
}

function documentPreviewMarkup(documentItem) {
  const fileName = documentItem.fileName || 'documento';
  if (isImageDocument(documentItem)) {
    return `<a href="${documentItem.dataUrl}" target="_blank" rel="noopener"><img src="${documentItem.dataUrl}" alt="${escapeHtml(fileName)}"></a>`;
  }

  return `
    <a class="document-preview" href="${documentItem.dataUrl}" download="${escapeHtml(fileName)}" target="_blank" rel="noopener">
      <strong>${escapeHtml(documentExtension(fileName))}</strong>
      <span>Abrir / baixar</span>
    </a>
  `;
}

function isImageDocument(documentItem) {
  return String(documentItem?.mimeType || '').startsWith('image/');
}

function documentExtension(fileName) {
  const extension = String(fileName || '').split('.').pop() || 'doc';
  return extension.slice(0, 5).toUpperCase();
}

async function uploadOrderPhotos(files) {
  if (!state.editingId || !canEditOrders()) return;
  el.orderPhotoError.hidden = true;

  try {
    for (const file of files) {
      const mimeType = orderDocumentMimeType(file);
      if (!mimeType) {
        throw new Error(`Formato nao permitido: ${file.name}`);
      }
      if (file.size > ORDER_DOCUMENT_MAX_BYTES) {
        throw new Error(`Documento muito grande: ${file.name}. Limite de 8 MB.`);
      }
      const dataUrl = normalizeDocumentDataUrl(await readFileAsDataUrl(file), mimeType);
      await api(`/api/orders/${encodeURIComponent(state.editingId)}/photos`, {
        method: 'POST',
        body: {
          fileName: file.name,
          mimeType,
          dataUrl
        }
      });
    }

    el.orderPhotoInput.value = '';
    await refreshOrderPhotoEditor();
    await refreshOrdersIfVisible();
  } catch (error) {
    el.orderPhotoError.textContent = error.message;
    el.orderPhotoError.hidden = false;
  }
}

function orderDocumentMimeType(file) {
  const cleanType = String(file.type || '').trim().toLowerCase();
  if (ORDER_DOCUMENT_MIME_TYPES.has(cleanType)) return cleanType;

  const extension = String(file.name || '').split('.').pop()?.toLowerCase() || '';
  return ORDER_DOCUMENT_MIME_BY_EXTENSION[extension] || '';
}

function normalizeDocumentDataUrl(dataUrl, mimeType) {
  const value = String(dataUrl || '');
  if (value.startsWith(`data:${mimeType};base64,`)) return value;
  return value.replace(/^data:[^;]*;base64,/, `data:${mimeType};base64,`);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function orderPayload() {
  return {
    orderNumber: el.orderNumber.value,
    commercialResponsible: el.commercialResponsible.value,
    customer: el.customer.value,
    sku: el.sku.value,
    itemType: el.itemType.value,
    productionOrder: el.productionOrder.value,
    purchaseOrderNumber: el.purchaseOrderNumber.value,
    capacityTr: el.capacityTr.value,
    productLine: el.productLine.value,
    equipment: el.equipment.value,
    voltage: el.voltage.value,
    quantity: el.quantity.value,
    leadTime: calculateLeadTime(el.entryDate.value, el.originalDeliveryDate.value),
    entryDate: el.entryDate.value,
    originalDeliveryDate: el.originalDeliveryDate.value,
    productionDeliveryDate: el.productionDeliveryDate.value,
    finalizationDate: el.finalizationDate.value,
    notes: el.notes.value,
    status: el.status.value
  };
}

async function releaseOrderForBilling(orderId) {
  try {
    await api(`/api/orders/${encodeURIComponent(orderId)}/release-billing`, { method: 'PATCH' });
    await refreshOrdersIfVisible();
    if (state.currentScreen === 'billing') await loadBillingItems();
  } catch (error) {
    alert(error.message);
  }
}

async function updateProductionOrderQuick(order) {
  const value = prompt('Informe o numero da OP:', order.productionOrder || '');
  if (value === null) return;

  try {
    await api(`/api/orders/${encodeURIComponent(order.id)}/production-order`, {
      method: 'PATCH',
      body: { productionOrder: value }
    });
    await refreshOrdersIfVisible();
  } catch (error) {
    alert(error.message);
  }
}

async function updatePurchaseOrderQuick(order) {
  const value = prompt('Informe o numero do pedido de compra:', order.purchaseOrderNumber || '');
  if (value === null) return;

  try {
    await api(`/api/orders/${encodeURIComponent(order.id)}/purchase-order`, {
      method: 'PATCH',
      body: { purchaseOrderNumber: value }
    });
    await refreshOrdersIfVisible();
  } catch (error) {
    alert(error.message);
  }
}

async function saveBillingDimensions(orderId, row) {
  const updated = await api(`/api/orders/${encodeURIComponent(orderId)}/billing-dimensions`, {
    method: 'PATCH',
    body: dimensionPayloadFromRow(row)
  });

  const index = state.billingItems.findIndex((order) => order.id === orderId);
  if (index >= 0) state.billingItems[index] = updated.order;
  return updated.order;
}

async function markOrderInvoiced(orderId, payload = {}, sourceType = 'order') {
  try {
    await api(`${billingItemApiBase(sourceType, orderId)}/mark-invoiced`, {
      method: 'PATCH',
      body: payload
    });
    await loadBillingItems();
    if (state.currentScreen === 'loading') await loadLoadingItems();
    if (state.currentScreen === 'thirdParty') await loadThirdPartyParts();
    await refreshOrdersIfVisible();
  } catch (error) {
    alert(error.message);
  }
}

async function markOrderLoaded(orderId, sourceType = 'order') {
  try {
    await api(`${billingItemApiBase(sourceType, orderId)}/mark-loaded`, { method: 'PATCH' });
    await refreshReferences();
    await loadLoadingItems();
    if (state.currentScreen === 'thirdParty') await loadThirdPartyParts();
    await refreshOrdersIfVisible();
  } catch (error) {
    alert(error.message);
  }
}

async function loadAdminData() {
  if (state.user?.role !== 'admin') return;

  const [statusData, customerData, userData, healthData, backupData, apsData] = await Promise.all([
    api('/api/admin/statuses'),
    api('/api/admin/customers'),
    api('/api/admin/users'),
    api('/api/health'),
    api('/api/admin/backups'),
    api('/api/aps')
  ]);

  renderAdminStatuses(statusData.statuses);
  state.adminApsConfig = apsData.aps?.config || defaultApsConfigFallback();
  state.apsConfig = state.adminApsConfig;
  renderAdminAps();
  renderAdminCustomers(customerData.customers);
  renderAdminUsers(userData.users);
  renderSystemHealth(healthData.health);
  renderBackups(backupData.backups || []);
}

function renderAdminStatuses(statuses) {
  el.statusAdminList.innerHTML = `
    <div class="admin-list-row status-admin-row status-admin-row-head" aria-hidden="true">
      <span>Status</span>
      <span>Sequencia</span>
      <span>Tipo</span>
      <span>Fluxo</span>
      <span>Acoes</span>
    </div>
    ${statuses.map((status) => `
      <div class="admin-list-row status-admin-row">
        <span class="status-admin-name" title="${escapeHtml(status.name)}">${escapeHtml(status.name)}</span>
        <span>${escapeHtml(String(status.sortOrder ?? '-'))}</span>
        <span>${statusCategoryText(status.category)}</span>
        <span>${statusFlowText(status.flowType)}</span>
        <div>
          <button class="btn" type="button"
            data-edit-admin-status="${status.id}"
            data-name="${escapeHtml(status.name)}"
            data-category="${status.category}"
            data-sort-order="${escapeHtml(String(status.sortOrder ?? ''))}"
            data-flow-type="${status.flowType || 'normal'}">Editar</button>
          <button class="btn danger" type="button" data-delete-admin-status="${status.id}">Excluir</button>
        </div>
      </div>
    `).join('')}
  `;
}

function renderAdminCustomers(customers) {
  el.customerAdminList.innerHTML = customers.map((customer) => `
    <div class="admin-list-row">
      <span title="${escapeHtml(customer.name)}">${escapeHtml(customer.name)}</span>
      <div>
        <button class="btn" type="button" data-edit-admin-customer="${customer.id}" data-name="${escapeHtml(customer.name)}">Editar</button>
        <button class="btn danger" type="button" data-delete-admin-customer="${customer.id}">Excluir</button>
      </div>
    </div>
  `).join('');
}

function renderAdminUsers(users) {
  el.userAdminList.innerHTML = users.map((user) => `
    <div class="admin-list-row user-list-row">
      <span title="${escapeHtml(user.name)}">
        ${escapeHtml(user.name)}
        <small>${escapeHtml(user.username)} · ${escapeHtml(roleLabel(user.role))} · ${user.canEditOrders ? 'Edita pedidos' : 'Consulta'} · ${formatTabSummary(user.visibleTabs)}</small>
      </span>
      <div>
        <button class="btn" type="button"
          data-edit-admin-user="${user.id}"
          data-name="${escapeHtml(user.name)}"
          data-username="${escapeHtml(user.username)}"
          data-role="${user.role}"
          data-can-edit-orders="${user.canEditOrders ? '1' : '0'}"
          data-visible-tabs="${encodeURIComponent(JSON.stringify(user.visibleTabs || []))}"
          data-editable-tabs="${encodeURIComponent(JSON.stringify(user.editableTabs || []))}">Editar</button>
        <button class="btn danger" type="button" data-delete-admin-user="${user.id}" ${user.role === 'admin' ? 'disabled' : ''}>Excluir</button>
      </div>
    </div>
  `).join('');
}

function renderAdminAps() {
  const config = state.adminApsConfig || defaultApsConfigFallback();
  renderAdminApsWorkCenters(config.workCenters || []);
  renderAdminApsOperators(config.operators || []);
  fillApsOperatorSelects(config);
}

function renderAdminApsWorkCenters(workCenters) {
  el.apsWorkCenterList.innerHTML = `
    <div class="admin-list-row aps-work-center-row aps-work-center-row-head" aria-hidden="true">
      <span>Centro</span>
      <span>Maquinas</span>
      <span>Efic.</span>
      <span>Turno</span>
      <span>Acoes</span>
    </div>
    ${workCenters.map((center) => `
      <div class="admin-list-row aps-work-center-row">
        <span title="${escapeHtml(center.description || center.code)}">
          ${escapeHtml(center.code)}
          <small>${escapeHtml(center.description || '')}</small>
        </span>
        <span>${formatInteger(center.machineCount || 1)}</span>
        <span>${formatNumber(center.efficiency || 1)}</span>
        <span>${escapeHtml(center.shift || '-')}</span>
        <div>
          <button class="btn" type="button" data-edit-aps-work-center="${escapeHtml(center.code)}">Editar</button>
          <button class="btn danger" type="button" data-delete-aps-work-center="${escapeHtml(center.code)}">Excluir</button>
        </div>
      </div>
    `).join('')}
  `;
}

function renderAdminApsOperators(operators) {
  el.apsOperatorList.innerHTML = `
    <div class="admin-list-row aps-operator-row aps-operator-row-head" aria-hidden="true">
      <span>Operador</span>
      <span>Habilidade</span>
      <span>Operacoes</span>
      <span>Centros</span>
      <span>Acoes</span>
    </div>
    ${operators.map((operator) => `
      <div class="admin-list-row aps-operator-row">
        <span title="${escapeHtml(operator.name || operator.code)}">
          ${escapeHtml(operator.code)}
          <small>${escapeHtml(operator.name || '')}</small>
        </span>
        <span>${escapeHtml(operator.skill || '-')}</span>
        <span>${escapeHtml(operationLabelsForCodes(operator.enabledOperations || []).join(', ') || 'Todas')}</span>
        <span>${escapeHtml((operator.enabledCenters || []).join(', ') || 'Todos')}</span>
        <div>
          <button class="btn" type="button" data-edit-aps-operator="${escapeHtml(operator.code)}">Editar</button>
          <button class="btn danger" type="button" data-delete-aps-operator="${escapeHtml(operator.code)}">Excluir</button>
        </div>
      </div>
    `).join('')}
  `;
}

function fillApsOperatorSelects(config) {
  const selectedOperations = selectedOptions(el.apsOperatorOperations);
  const selectedCenters = selectedOptions(el.apsOperatorCenters);
  const operations = config.operations || [];
  const centers = config.workCenters || [];

  el.apsOperatorOperations.innerHTML = operations.map((operation) => `
    <option value="${escapeHtml(operation.code)}">${escapeHtml(operation.statusName || operation.description)}</option>
  `).join('');
  el.apsOperatorCenters.innerHTML = centers.map((center) => `
    <option value="${escapeHtml(center.code)}">${escapeHtml(center.code)} - ${escapeHtml(center.description || '')}</option>
  `).join('');

  setSelectedOptions(el.apsOperatorOperations, selectedOperations);
  setSelectedOptions(el.apsOperatorCenters, selectedCenters);
}

function operationLabelsForCodes(codes) {
  const operations = state.adminApsConfig?.operations || state.apsConfig?.operations || [];
  const byCode = new Map(operations.map((operation) => [operation.code, operation.statusName || operation.description || operation.code]));
  return (codes || []).map((code) => byCode.get(code) || code);
}

function renderSystemHealth(health) {
  const items = [
    ['Servidor', health.serverOnline ? 'Online' : 'Indisponivel'],
    ['Banco', health.dbConnected ? 'Conectado' : 'Erro'],
    ['Backup', health.latestBackup ? formatDateTime(health.latestBackup.createdAt) : 'Sem backup'],
    ['Versao', health.version || '-'],
    ['Sessoes', health.activeSessions ?? '-'],
    ['Tempo online', formatUptime(health.uptimeSeconds)],
    ['Banco atual', health.dbProvider || 'sqlite'],
    ['Protocolo', health.httpsEnabled ? 'HTTPS' : 'HTTP'],
    ['Clientes tempo real', health.realtimeClients ?? '-']
  ];
  if (health.requestedDbProvider && health.requestedDbProvider !== health.dbProvider) {
    items.push(['Banco solicitado', health.requestedDbProvider]);
  }

  el.systemHealthGrid.innerHTML = items.map(([label, value]) => `
    <div class="system-health-item">
      <span>${escapeHtml(label)}</span>
      <strong title="${escapeHtml(String(value))}">${escapeHtml(String(value))}</strong>
    </div>
  `).join('');
}

function renderBackups(backups) {
  el.backupList.innerHTML = backups.length ? backups.map((backup) => `
    <div class="admin-list-row">
      <span title="${escapeHtml(backup.name)}">
        ${escapeHtml(backup.name)}
        <small>${formatDateTime(backup.createdAt)} Â· ${formatFileSize(backup.size)}</small>
      </span>
      <div>
        <button class="btn danger" type="button" data-restore-backup="${escapeHtml(backup.name)}">Restaurar</button>
      </div>
    </div>
  `).join('') : '<div class="empty">Nenhum backup encontrado.</div>';
}

async function refreshSystemHealth() {
  const [healthData, backupData] = await Promise.all([
    api('/api/health'),
    api('/api/admin/backups')
  ]);
  renderSystemHealth(healthData.health);
  renderBackups(backupData.backups || []);
}

async function createSystemBackup() {
  el.backupError.hidden = true;
  try {
    const data = await api('/api/admin/backups', { method: 'POST' });
    renderBackups(data.backups || []);
    const healthData = await api('/api/health');
    renderSystemHealth(healthData.health);
  } catch (error) {
    el.backupError.textContent = error.message;
    el.backupError.hidden = false;
  }
}

async function restoreSystemBackup(fileName) {
  const confirmation = prompt(`Digite RESTAURAR para confirmar a restauracao do backup:\n${fileName}`);
  if (confirmation !== 'RESTAURAR') return;

  el.backupError.hidden = true;
  try {
    await api(`/api/admin/backups/${encodeURIComponent(fileName)}/restore`, { method: 'POST' });
    alert('Backup restaurado. Reinicie o servidor do S&OP para garantir que todos os usuarios recebam a base restaurada.');
    await refreshSystemHealth();
  } catch (error) {
    el.backupError.textContent = error.message;
    el.backupError.hidden = false;
  }
}

function formatUptime(seconds) {
  const total = Number(seconds) || 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

function formatFileSize(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${formatNumber(value / (1024 * 1024))} MB`;
  if (value >= 1024) return `${formatNumber(value / 1024)} KB`;
  return `${value} B`;
}

function roleLabel(role) {
  return ROLE_LABELS[role] || ROLE_LABELS.user;
}

function roleAccessPreset(role) {
  const preset = ROLE_ACCESS_PRESETS[role] || ROLE_ACCESS_PRESETS.user;
  return {
    visibleTabs: [...preset.visibleTabs],
    editableTabs: [...preset.editableTabs],
    canEditOrders: Boolean(preset.canEditOrders)
  };
}

function renderUserTabAccess(visibleTabs = DEFAULT_VISIBLE_TABS, editableTabs = []) {
  const isAdminRole = el.userAdminRole.value === 'admin';
  const visibleSet = new Set(isAdminRole ? TAB_DEFS.map((tab) => tab.key) : normalizeTabList(visibleTabs, DEFAULT_VISIBLE_TABS));
  const editableSet = new Set(isAdminRole ? TAB_DEFS.map((tab) => tab.key) : normalizeTabList(editableTabs, []));

  el.userAdminTabAccess.innerHTML = `
    <div class="tab-access-head">Aba</div>
    <div class="tab-access-head">Visualizar</div>
    <div class="tab-access-head">Alterar</div>
    ${TAB_DEFS.map((tab) => {
      const adminOnly = tab.key === 'admin';
      const disabled = isAdminRole || adminOnly;
      const canView = isAdminRole || (!adminOnly && visibleSet.has(tab.key));
      const canEdit = isAdminRole || (!adminOnly && editableSet.has(tab.key));
      return `
        <span>${escapeHtml(tab.label)}</span>
        <label class="check-field compact">
          <input type="checkbox" data-tab-view="${tab.key}" ${canView ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
          <span></span>
        </label>
        <label class="check-field compact">
          <input type="checkbox" data-tab-edit="${tab.key}" ${canEdit ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
          <span></span>
        </label>
      `;
    }).join('')}
  `;
}

function readUserTabAccess() {
  if (el.userAdminRole.value === 'admin') {
    return {
      visibleTabs: TAB_DEFS.map((tab) => tab.key),
      editableTabs: TAB_DEFS.map((tab) => tab.key)
    };
  }

  const visibleTabs = Array.from(el.userAdminTabAccess.querySelectorAll('[data-tab-view]:checked'))
    .map((input) => input.dataset.tabView)
    .filter((tab) => tab !== 'admin');
  const visibleSet = new Set(visibleTabs);
  const editableTabs = Array.from(el.userAdminTabAccess.querySelectorAll('[data-tab-edit]:checked'))
    .map((input) => input.dataset.tabEdit)
    .filter((tab) => tab !== 'admin' && visibleSet.has(tab));

  return { visibleTabs, editableTabs };
}

function formatTabSummary(tabs) {
  const normalized = normalizeTabList(tabs, DEFAULT_VISIBLE_TABS).filter((tab) => tab !== 'admin');
  if (normalized.length === USER_TAB_KEYS.length) return 'Todas as abas';
  if (!normalized.length) return 'Sem abas';
  const labels = normalized
    .map((key) => TAB_DEFS.find((tab) => tab.key === key)?.label || key)
    .slice(0, 3);
  return normalized.length > 3 ? `${labels.join(', ')} +${normalized.length - 3}` : labels.join(', ');
}

function parseEncodedJson(value, fallback) {
  try {
    return JSON.parse(decodeURIComponent(value || ''));
  } catch (error) {
    return fallback;
  }
}

function selectedOptions(select) {
  return Array.from(select?.selectedOptions || []).map((option) => option.value);
}

function setSelectedOptions(select, values) {
  const selected = new Set(values || []);
  Array.from(select?.options || []).forEach((option) => {
    option.selected = selected.has(option.value);
  });
}

function resetStatusAdminForm() {
  state.editingStatusId = null;
  el.statusAdminName.value = '';
  el.statusAdminSortOrder.value = '';
  el.statusAdminCategory.value = 'auxiliary';
  el.statusAdminFlowType.value = 'normal';
  el.statusAdminSave.textContent = 'Adicionar';
  el.statusAdminCancel.hidden = true;
  el.statusAdminError.hidden = true;
}

function resetCustomerAdminForm() {
  state.editingCustomerId = null;
  el.customerAdminName.value = '';
  el.customerAdminSave.textContent = 'Adicionar';
  el.customerAdminCancel.hidden = true;
  el.customerAdminError.hidden = true;
}

function resetUserAdminForm() {
  state.editingUserId = null;
  el.userAdminName.value = '';
  el.userAdminUsername.value = '';
  el.userAdminPassword.value = '';
  el.userAdminPassword.placeholder = 'Senha';
  el.userAdminRole.value = 'viewer';
  const preset = roleAccessPreset('viewer');
  el.userAdminCanEditOrders.checked = preset.canEditOrders;
  renderUserTabAccess(preset.visibleTabs, preset.editableTabs);
  el.userAdminSave.textContent = 'Adicionar';
  el.userAdminCancel.hidden = true;
  el.userAdminError.hidden = true;
}

function resetApsWorkCenterForm() {
  state.editingApsWorkCenterCode = null;
  el.apsWorkCenterCode.value = '';
  el.apsWorkCenterDescription.value = '';
  el.apsWorkCenterMachineCount.value = '1';
  el.apsWorkCenterCalendar.value = '1 turno';
  el.apsWorkCenterEfficiency.value = '1';
  el.apsWorkCenterCapacity.value = '8';
  el.apsWorkCenterShift.value = '1 turno';
  el.apsWorkCenterMaintenance.value = '';
  el.apsWorkCenterCode.disabled = false;
  el.apsWorkCenterSave.textContent = 'Adicionar';
  el.apsWorkCenterCancel.hidden = true;
  el.apsWorkCenterError.hidden = true;
}

function resetApsOperatorForm() {
  state.editingApsOperatorCode = null;
  el.apsOperatorCode.value = '';
  el.apsOperatorName.value = '';
  el.apsOperatorShift.value = '1 turno';
  el.apsOperatorJourneyHours.value = '8';
  el.apsOperatorEfficiency.value = '1';
  el.apsOperatorSkill.value = '';
  setSelectedOptions(el.apsOperatorOperations, []);
  setSelectedOptions(el.apsOperatorCenters, []);
  el.apsOperatorHourlyCost.value = '0';
  el.apsOperatorCode.disabled = false;
  el.apsOperatorSave.textContent = 'Adicionar';
  el.apsOperatorCancel.hidden = true;
  el.apsOperatorError.hidden = true;
}

function currentAdminApsConfig() {
  return clonePlain(state.adminApsConfig || state.apsConfig || defaultApsConfigFallback());
}

async function saveAdminApsConfig(config) {
  const { config: savedConfig } = await api('/api/aps/config', {
    method: 'PUT',
    body: { config }
  });
  state.adminApsConfig = savedConfig;
  state.apsConfig = savedConfig;
  renderAdminAps();
  if (state.currentScreen === 'aps') renderAps();
  return savedConfig;
}

function apsWorkCenterPayload() {
  return {
    code: String(el.apsWorkCenterCode.value || '').trim().toUpperCase(),
    description: el.apsWorkCenterDescription.value,
    machineCount: el.apsWorkCenterMachineCount.value || 1,
    calendar: el.apsWorkCenterCalendar.value || '1 turno',
    efficiency: el.apsWorkCenterEfficiency.value || 1,
    capacity: el.apsWorkCenterCapacity.value || 8,
    shift: el.apsWorkCenterShift.value || '1 turno',
    maintenance: el.apsWorkCenterMaintenance.value
  };
}

function apsOperatorPayload() {
  return {
    code: String(el.apsOperatorCode.value || '').trim().toUpperCase(),
    name: el.apsOperatorName.value,
    shift: el.apsOperatorShift.value || '1 turno',
    journeyHours: el.apsOperatorJourneyHours.value || 8,
    efficiency: el.apsOperatorEfficiency.value || 1,
    skill: el.apsOperatorSkill.value,
    enabledOperations: selectedOptions(el.apsOperatorOperations),
    enabledCenters: selectedOptions(el.apsOperatorCenters),
    hourlyCost: el.apsOperatorHourlyCost.value || 0
  };
}

async function submitApsWorkCenter() {
  const payload = apsWorkCenterPayload();
  if (!payload.code || !payload.description) {
    throw new Error('Informe codigo e descricao do centro de trabalho.');
  }

  const config = currentAdminApsConfig();
  const previousCode = state.editingApsWorkCenterCode;
  const duplicate = (config.workCenters || []).some((center) => center.code === payload.code && center.code !== previousCode);
  if (duplicate) {
    throw new Error('Centro de trabalho ja cadastrado.');
  }

  config.workCenters = (config.workCenters || []).filter((center) => center.code !== previousCode && center.code !== payload.code);
  config.workCenters.push(payload);
  config.workCenters.sort((a, b) => compareText(a.code, b.code));

  if (previousCode && previousCode !== payload.code) {
    config.operators = (config.operators || []).map((operator) => ({
      ...operator,
      enabledCenters: (operator.enabledCenters || []).map((center) => center === previousCode ? payload.code : center)
    }));
  }

  await saveAdminApsConfig(config);
  resetApsWorkCenterForm();
}

async function submitApsOperator() {
  const payload = apsOperatorPayload();
  if (!payload.code || !payload.name) {
    throw new Error('Informe codigo e nome do operador.');
  }

  const config = currentAdminApsConfig();
  const previousCode = state.editingApsOperatorCode;
  const duplicate = (config.operators || []).some((operator) => operator.code === payload.code && operator.code !== previousCode);
  if (duplicate) {
    throw new Error('Operador ja cadastrado.');
  }

  config.operators = (config.operators || []).filter((operator) => operator.code !== previousCode && operator.code !== payload.code);
  config.operators.push(payload);
  config.operators.sort((a, b) => compareText(a.code, b.code));

  await saveAdminApsConfig(config);
  resetApsOperatorForm();
}

function editApsWorkCenter(code) {
  const center = (state.adminApsConfig?.workCenters || []).find((item) => item.code === code);
  if (!center) return;
  state.editingApsWorkCenterCode = center.code;
  el.apsWorkCenterCode.value = center.code;
  el.apsWorkCenterDescription.value = center.description || '';
  el.apsWorkCenterMachineCount.value = center.machineCount || 1;
  el.apsWorkCenterCalendar.value = center.calendar || '';
  el.apsWorkCenterEfficiency.value = center.efficiency || 1;
  el.apsWorkCenterCapacity.value = center.capacity || 8;
  el.apsWorkCenterShift.value = center.shift || '';
  el.apsWorkCenterMaintenance.value = center.maintenance || '';
  el.apsWorkCenterCode.disabled = true;
  el.apsWorkCenterSave.textContent = 'Salvar';
  el.apsWorkCenterCancel.hidden = false;
  el.apsWorkCenterError.hidden = true;
}

function editApsOperator(code) {
  const operator = (state.adminApsConfig?.operators || []).find((item) => item.code === code);
  if (!operator) return;
  state.editingApsOperatorCode = operator.code;
  el.apsOperatorCode.value = operator.code;
  el.apsOperatorName.value = operator.name || '';
  el.apsOperatorShift.value = operator.shift || '';
  el.apsOperatorJourneyHours.value = operator.journeyHours || 8;
  el.apsOperatorEfficiency.value = operator.efficiency || 1;
  el.apsOperatorSkill.value = operator.skill || '';
  setSelectedOptions(el.apsOperatorOperations, operator.enabledOperations || []);
  setSelectedOptions(el.apsOperatorCenters, operator.enabledCenters || []);
  el.apsOperatorHourlyCost.value = operator.hourlyCost || 0;
  el.apsOperatorCode.disabled = true;
  el.apsOperatorSave.textContent = 'Salvar';
  el.apsOperatorCancel.hidden = false;
  el.apsOperatorError.hidden = true;
}

async function deleteApsWorkCenter(code) {
  if (!confirm('Excluir este centro de trabalho APS?')) return;
  const config = currentAdminApsConfig();
  config.workCenters = (config.workCenters || []).filter((center) => center.code !== code);
  config.operators = (config.operators || []).map((operator) => ({
    ...operator,
    enabledCenters: (operator.enabledCenters || []).filter((center) => center !== code)
  }));
  await saveAdminApsConfig(config);
  resetApsWorkCenterForm();
}

async function deleteApsOperator(code) {
  if (!confirm('Excluir este operador APS?')) return;
  const config = currentAdminApsConfig();
  config.operators = (config.operators || []).filter((operator) => operator.code !== code);
  await saveAdminApsConfig(config);
  resetApsOperatorForm();
}

function labelStatus(status) {
  return status;
}

function statusCategoryText(category) {
  return category === 'production' ? 'Produção' : 'Processos auxiliares';
}

function statusFlowText(flowType) {
  return flowType === 'deviation' ? 'Desvio' : 'Fluxo normal';
}

function validateStatusTransitionClient(currentStatusName, nextStatusName, allowDeviation = false, deviationReason = '') {
  const currentName = String(currentStatusName || '').trim();
  const nextName = String(nextStatusName || '').trim();
  if (!nextName || currentName === nextName) return { ok: true };

  const nextStatus = statusDetail(nextName);
  if (!nextStatus) return { ok: false, error: 'Status de destino nao encontrado.' };
  if (nextStatus.flowType === 'deviation') return { ok: true };

  const currentStatus = statusDetail(currentName);
  if (currentStatus?.flowType === 'deviation') return { ok: true };

  const normalStatuses = state.statusDetails
    .filter((status) => status.flowType !== 'deviation')
    .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder) || a.name.localeCompare(b.name));
  const currentIndex = normalStatuses.findIndex((status) => status.name === currentName);
  const expectedStatus = currentIndex >= 0 ? normalStatuses[currentIndex + 1] : normalStatuses[0];

  if (expectedStatus && expectedStatus.name === nextName) return { ok: true };
  if (allowDeviation && deviationReason) return { ok: true };

  const expectedText = expectedStatus ? `O proximo status esperado e "${expectedStatus.name}".` : 'Nao ha proximo status normal configurado.';
  return { ok: false, error: `Mudanca fora da sequencia. ${expectedText}` };
}

function normalizeTabList(value, fallback = []) {
  const source = Array.isArray(value) && value.length ? value : fallback;
  const allowed = new Set(TAB_DEFS.map((tab) => tab.key));
  const seen = new Set();
  return source
    .map((tab) => String(tab || '').trim())
    .filter((tab) => {
      if (!allowed.has(tab) || seen.has(tab)) return false;
      seen.add(tab);
      return true;
    });
}

function canViewTab(tab) {
  if (!state.user) return false;
  if (state.user.role === 'admin') return true;
  return normalizeTabList(state.user.visibleTabs, DEFAULT_VISIBLE_TABS).includes(tab);
}

function canEditTab(tab) {
  if (!state.user) return false;
  if (state.user.role === 'admin') return true;
  return normalizeTabList(state.user.editableTabs, state.user.canEditOrders ? DEFAULT_EDITABLE_TABS : []).includes(tab);
}

function canEditOrders() {
  return canEditTab('orders');
}

function statusClass(status) {
  const normalized = normalizeText(status);
  if (normalized.includes('cancel')) return 'cancelado';
  if (normalized.includes('fatur')) return 'faturado';
  if (normalized.includes('produc')) return 'producao';
  if (normalized.includes('liber')) return 'liberado';
  return 'analise';
}

function orderRowClass(order) {
  if (hasOpenPcpPending(order)) return 'order-row-pcp-pending';
  if (isOrderOverdue(order)) return 'order-row-overdue';
  if (isProductionRow(order)) return 'order-row-production';
  if (isAwaitingBillingRelease(order)) return 'order-row-awaiting-billing';
  return 'order-row-not-production';
}

function hasOpenPcpPending(order) {
  return Number(order.pcpPendingCount) > 0;
}

function isOrderOverdue(order) {
  if (!isValidDateText(order.productionDeliveryDate) || order.finalizationDate) {
    return false;
  }

  const normalizedStatus = normalizeText(order.status);
  if (normalizedStatus.includes('cancel') || normalizedStatus.includes('fatur') || normalizedStatus.includes('carreg')) {
    return false;
  }

  return todayAtMidnight() > parseLocalDate(order.productionDeliveryDate);
}

function isAwaitingBillingRelease(order) {
  const normalizedStatus = normalizeText(order.status);
  return Boolean(order.productionDeliveryDate)
    && !order.billingStage
    && !normalizedStatus.includes('cancel')
    && !normalizedStatus.includes('conclu')
    && !normalizedStatus.includes('fatur');
}

function isProductionRow(order) {
  return state.productionStatuses.includes(order.status);
}

function isProductionConcludedStatus(status) {
  const normalized = normalizeText(status);
  return normalized.includes('producao concluida') || normalized.includes('producao concluido');
}

function isBillingReleaseReadyStatus(status) {
  const normalized = normalizeText(status);
  return isProductionConcludedStatus(status) || normalized.includes('aguardando expedicao');
}

function dimensionCell(order, field, label, editable = true) {
  const value = order[field] === null || order[field] === undefined ? '' : String(order[field]);
  return `
    <td>
      <input class="input dimension-input" type="number" min="0" step="0.001"
        value="${escapeHtml(value)}" data-dim-field="${field}" aria-label="${label}" ${editable ? '' : 'disabled'}>
    </td>
  `;
}

function dimensionPayloadFromRow(row) {
  const payload = {};
  for (const input of row.querySelectorAll('[data-dim-field]')) {
    payload[input.dataset.dimField] = input.value;
  }
  return payload;
}

function dimensionPayloadFromPrefix(prefix) {
  const fields = dimensionInputMap(prefix);
  const payload = {};
  for (const [key, input] of Object.entries(fields)) {
    payload[key] = input?.value || '';
  }
  return payload;
}

function setDimensionInputs(prefix, order = {}) {
  const fields = dimensionInputMap(prefix);
  for (const [key, input] of Object.entries(fields)) {
    if (input) input.value = order[key] ?? '';
  }
}

function dimensionInputMap(prefix) {
  const map = prefix === 'billing'
    ? {
        machineHeight: el.billingMachineHeight,
        machineWidth: el.billingMachineWidth,
        machineLength: el.billingMachineLength,
        machineWeight: el.billingMachineWeight,
        machineGrossWeight: el.billingMachineGrossWeight,
        machineVolume: el.billingMachineVolume
      }
    : {
        machineHeight: el.dimensionMachineHeight,
        machineWidth: el.dimensionMachineWidth,
        machineLength: el.dimensionMachineLength,
        machineWeight: el.dimensionMachineWeight,
        machineGrossWeight: el.dimensionMachineGrossWeight,
        machineVolume: el.dimensionMachineVolume
      };
  return map;
}

function dimensionSummary(order) {
  const parts = [
    ['A', order.machineHeight],
    ['L', order.machineWidth],
    ['C', order.machineLength],
    ['Peso liq.', order.machineWeight],
    ['Peso bruto', order.machineGrossWeight],
    ['Vol.', order.machineVolume]
  ]
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([label, value]) => `${label}: ${formatNumber(value)}`);

  return parts.length ? parts.join(' | ') : 'Sem dimensionais';
}

function togglePurchaseOrderField() {
  const isPurchased = el.itemType.value === 'purchased';
  el.purchaseOrderField.hidden = !isPurchased;
  if (!isPurchased) {
    el.purchaseOrderNumber.value = '';
  }
}

function updateSortIndicators() {
  for (const button of document.querySelectorAll('.sort-button')) {
    const active = button.dataset.sort === state.sortField;
    button.classList.toggle('active', active);
    button.dataset.direction = active ? state.sortDirection : '';
  }
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatMonth(value) {
  const [year, month] = String(value || '').split('-');
  if (!year || !month) return value || '';
  return `${month}/${year}`;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace('.', ',');
}

function formatInteger(value) {
  return String(Math.round(Number(value) || 0));
}

function formatDemand(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return String(Math.round(number * 10) / 10).replace('.', ',');
}

function formatDays(value) {
  if (value === null || value === undefined || value === '') return '-';
  return `${formatNumber(value)} dias`;
}

function forecastConfidenceLabel(value) {
  const normalized = normalizeText(value);
  if (normalized === 'media') return 'Média';
  if (normalized === 'pouco historico') return 'Pouco histórico';
  return value || '-';
}

function sumEquipment(orders) {
  return orders.reduce((total, order) => total + (Number(order.quantity) || 0), 0);
}

function calculateAverageLeadTime(orders) {
  let leadTimes = orders
    .map((order) => diffDays(order.entryDate, order.finalizationDate))
    .filter((value) => value !== null);

  if (!leadTimes.length) {
    leadTimes = orders
      .map((order) => diffDays(order.entryDate, order.originalDeliveryDate))
      .filter((value) => value !== null);
  }

  if (!leadTimes.length) {
    leadTimes = orders
      .map((order) => parseLeadTime(order.leadTime))
      .filter((value) => value !== null);
  }

  if (!leadTimes.length) return null;

  const average = leadTimes.reduce((total, value) => total + value, 0) / leadTimes.length;
  return Math.round(average * 10) / 10;
}

function parseLeadTime(value) {
  const match = String(value || '').replace(',', '.').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function diffDays(startValue, endValue) {
  if (!startValue || !endValue) return null;
  const start = parseLocalDate(startValue);
  const end = parseLocalDate(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diff = Math.floor((end - start) / 86400000);
  return diff >= 0 ? diff : null;
}

function updateLeadTimePreview() {
  el.leadTime.value = calculateLeadTime(el.entryDate.value, el.originalDeliveryDate.value);
}

function calculateLeadTime(entryDate, originalDeliveryDate) {
  const days = diffDays(entryDate, originalDeliveryDate);
  return days === null ? '' : `${days} dias`;
}

function updateDaysLatePreview() {
  el.daysLatePreview.value = calculateDaysLate(el.originalDeliveryDate.value);
}

function calculateDaysLate(originalDeliveryDate) {
  if (!isValidDateText(originalDeliveryDate)) return '';
  const deliveryDate = parseLocalDate(originalDeliveryDate);
  const today = todayAtMidnight();
  if (Number.isNaN(deliveryDate.getTime())) return '';
  if (today <= deliveryDate) return 0;

  const diff = Math.floor((today - deliveryDate) / 86400000);
  return Math.max(0, diff);
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function ensureOption(select, value) {
  if (!value) return;
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (!exists) {
    select.appendChild(new Option(value, value));
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

el.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.loginError.hidden = true;

  try {
    const { user } = await api('/api/login', {
      method: 'POST',
      body: {
        username: el.username.value,
        password: el.password.value
      }
    });
    await showApp(user);
  } catch (error) {
    el.loginError.textContent = error.message;
    el.loginError.hidden = false;
  }
});

el.logoutButton.addEventListener('click', async () => {
  await api('/api/logout', { method: 'POST' });
  showLogin();
});

el.changePasswordButton.addEventListener('click', openPasswordDialog);
el.changePasswordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.changePasswordError.hidden = true;

  try {
    await submitPasswordChange();
  } catch (error) {
    el.changePasswordError.textContent = error.message;
    el.changePasswordError.hidden = false;
  }
});
el.closePasswordDialog.addEventListener('click', closePasswordDialog);
el.cancelPasswordDialog.addEventListener('click', closePasswordDialog);

el.closeDimensionsDialog.addEventListener('click', closeDimensionsDialog);
el.cancelDimensionsDialog.addEventListener('click', closeDimensionsDialog);
el.dimensionOrderSelect.addEventListener('change', fillDimensionDialogFromSelectedOrder);
el.dimensionsForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.dimensionsError.hidden = true;

  try {
    await submitDimensionsDialog();
  } catch (error) {
    el.dimensionsError.textContent = error.message;
    el.dimensionsError.hidden = false;
  }
});

el.closeBillingDialog.addEventListener('click', closeBillingDialog);
el.cancelBillingDialog.addEventListener('click', closeBillingDialog);
el.billingInvoiceDocument.addEventListener('change', async () => {
  el.billingError.hidden = true;

  try {
    await handleBillingInvoiceDocumentChange();
  } catch (error) {
    el.billingError.textContent = error.message;
    el.billingError.hidden = false;
  }
});
el.saveBillingInfo.addEventListener('click', async () => {
  el.billingError.hidden = true;

  try {
    await saveBillingDialog(false);
  } catch (error) {
    el.billingError.textContent = error.message;
    el.billingError.hidden = false;
  }
});
el.billingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.billingError.hidden = true;

  try {
    await saveBillingDialog(true);
  } catch (error) {
    el.billingError.textContent = error.message;
    el.billingError.hidden = false;
  }
});

el.thirdPartyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitThirdPartyPart();
});

el.thirdPartyBody.addEventListener('click', async (event) => {
  const returnButton = event.target.closest('[data-return-third-party]');
  if (returnButton) {
    await markThirdPartyReturned(returnButton.dataset.returnThirdParty);
    return;
  }

  const deleteButton = event.target.closest('[data-delete-third-party]');
  if (deleteButton) {
    await deleteThirdPartyPart(deleteButton.dataset.deleteThirdParty);
    return;
  }

  const purchaseOrderButton = event.target.closest('[data-save-third-party-purchase-order]');
  if (purchaseOrderButton) {
    await saveThirdPartyPurchaseOrder(purchaseOrderButton.dataset.saveThirdPartyPurchaseOrder);
    return;
  }

  if (event.target.closest('button, input, select, textarea, a')) return;

  const row = event.target.closest('tr[data-order-id]');
  if (row) openBillingConsultDialog(row.dataset.orderId, row.dataset.sourceType);
});

el.downloadShortcut.addEventListener('click', () => {
  window.location.href = '/api/shortcut';
});

el.mainNav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-module-toggle]');
  if (!button) return;

  const module = button.closest('.nav-module');
  if (!module) return;

  const shouldOpen = !module.classList.contains('is-open');
  el.mainNav.querySelectorAll('.nav-module').forEach((item) => {
    item.classList.toggle('is-open', item === module && shouldOpen);
  });
});

el.ordersNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('orders');
});

el.dashboardNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('dashboard');
});

el.billingNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('billing');
});

el.loadingNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('loading');
});

el.thirdPartyNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('thirdParty');
});

el.pcpNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('pcp');
});

el.sequencingNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('sequencing');
});

el.apsNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('aps');
});

el.productsNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('products');
});

el.qualityAlertsNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('quality');
});

el.qualityNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('qualityRnc');
});

el.qualityAlertOrderId.addEventListener('change', fillQualityAlertFromSelectedOrder);
el.qualityAlertNew.addEventListener('click', () => openQualityAlertEditor());
el.qualityAlertResolve.addEventListener('click', resolveSelectedQualityAlerts);
el.qualityAlertEdit.addEventListener('click', editSelectedQualityAlert);
el.qualityAlertDelete.addEventListener('click', deleteSelectedQualityAlerts);
el.qualityAlertForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitQualityAlert();
});
el.qualityAlertReset.addEventListener('click', resetQualityAlertForm);
el.qualityAlertWrongPhoto.addEventListener('change', async () => {
  el.qualityAlertError.hidden = true;
  try {
    await handleQualityAlertPhotoChange('wrong');
  } catch (error) {
    el.qualityAlertError.textContent = error.message;
    el.qualityAlertError.hidden = false;
  }
});
el.qualityAlertRightPhoto.addEventListener('change', async () => {
  el.qualityAlertError.hidden = true;
  try {
    await handleQualityAlertPhotoChange('right');
  } catch (error) {
    el.qualityAlertError.textContent = error.message;
    el.qualityAlertError.hidden = false;
  }
});
el.qualityAlertList.addEventListener('change', (event) => {
  if (!event.target.closest('[data-quality-alert-select]')) return;
  const row = event.target.closest('tr');
  if (row) row.classList.toggle('is-selected', event.target.checked);
  updateQualityAlertActionState();
});
el.qualityAlertList.addEventListener('click', (event) => {
  if (event.target.closest('button, input, select, textarea, a, label')) return;
  const row = event.target.closest('[data-quality-alert-row]');
  if (row) openQualityAlertDetail(row.dataset.qualityAlertRow);
});

el.reportsNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('reports');
});

el.adminNav.addEventListener('click', (event) => {
  event.preventDefault();
  setScreen('admin');
});

el.search.addEventListener('input', () => {
  clearTimeout(el.search.timer);
  el.search.timer = setTimeout(() => {
    state.ordersPage = 1;
    loadOrders();
  }, 220);
});

el.statusFilter.addEventListener('change', () => {
  state.ordersPage = 1;
  loadOrders();
});
el.scopeFilter.addEventListener('change', () => {
  state.ordersPage = 1;
  loadOrders();
});
el.dueWithinDays.addEventListener('input', () => {
  clearTimeout(el.dueWithinDays.timer);
  el.dueWithinDays.timer = setTimeout(() => {
    state.ordersPage = 1;
    loadOrders();
  }, 220);
});
el.dueWithinDays.addEventListener('change', () => {
  state.ordersPage = 1;
  loadOrders();
});
el.ordersPrevPage.addEventListener('click', () => {
  if (state.ordersPage <= 1) return;
  state.ordersPage -= 1;
  loadOrders();
});
el.ordersNextPage.addEventListener('click', () => {
  if (state.ordersPage >= state.ordersTotalPages) return;
  state.ordersPage += 1;
  loadOrders();
});
el.exportOrders.addEventListener('click', exportCurrentOrders);
el.pcpNewPending.addEventListener('click', openPcpPendingForm);
el.pcpCancelPending.addEventListener('click', () => closePcpPendingForm());
el.pcpReason.addEventListener('change', () => {
  togglePcpPurchaseOrderField();
  renderPcpMotiveOptions();
});
el.pcpAddMotive.addEventListener('click', addPcpMotive);
el.pcpPendingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitPcpPendingIssue();
});
el.pcpSearch.addEventListener('input', () => {
  clearTimeout(el.pcpSearch.timer);
  el.pcpSearch.timer = setTimeout(loadPcpPendingIssues, 220);
});
el.pcpStatusFilter.addEventListener('change', loadPcpPendingIssues);
el.pcpSortField.addEventListener('change', () => {
  state.pcpSortField = el.pcpSortField.value;
  renderPcpPendingIssues();
});
el.pcpSortDirection.addEventListener('change', () => {
  state.pcpSortDirection = el.pcpSortDirection.value;
  renderPcpPendingIssues();
});
el.pcpClearFilters.addEventListener('click', () => {
  el.pcpSearch.value = '';
  el.pcpStatusFilter.value = 'open';
  state.pcpSortField = 'orderNumber';
  state.pcpSortDirection = 'asc';
  state.pcpColumnFilters = {};
  el.pcpSortField.value = state.pcpSortField;
  el.pcpSortDirection.value = state.pcpSortDirection;
  loadPcpPendingIssues();
});
el.pcpPendingTable.addEventListener('click', (event) => {
  const sortButton = event.target.closest('[data-pcp-sort]');
  if (!sortButton) return;

  const field = sortButton.dataset.pcpSort;
  if (state.pcpSortField === field) {
    state.pcpSortDirection = state.pcpSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.pcpSortField = field;
    state.pcpSortDirection = 'asc';
  }
  renderPcpPendingIssues();
});
el.pcpPendingTable.addEventListener('input', (event) => {
  const field = event.target.closest('[data-pcp-filter]');
  if (!field) return;

  state.pcpColumnFilters[field.dataset.pcpFilter] = field.value;
  renderPcpPendingIssues();
});
el.pcpPendingTable.addEventListener('change', (event) => {
  const field = event.target.closest('[data-pcp-filter]');
  if (!field) return;

  state.pcpColumnFilters[field.dataset.pcpFilter] = field.value;
  renderPcpPendingIssues();
});
el.generateAllSequencing.addEventListener('click', () => generateSequencing(''));
el.refreshSequencing.addEventListener('click', loadSequencing);
el.sequencingStartDate.addEventListener('change', () => {
  state.sequencingStartDate = el.sequencingStartDate.value || localDateInputValue(todayAtMidnight());
  renderSequencingGantt();
});
el.sequencingDailyHours.addEventListener('change', () => {
  state.sequencingDailyHours = sequencingDailyHoursValueFrom(el.sequencingDailyHours.value);
  el.sequencingDailyHours.value = state.sequencingDailyHours;
  renderSequencingGantt();
});
el.printSequencingReport.addEventListener('click', printSequencingReport);
el.exportSequencingExcel.addEventListener('click', exportSequencingExcel);
el.apsRun.addEventListener('click', renderApsSchedule);
el.apsRefresh.addEventListener('click', loadAps);
el.apsExport.addEventListener('click', exportApsExcel);
el.apsSaveConfig.addEventListener('click', () => setScreen('admin'));
el.apsStartDate.addEventListener('change', () => {
  state.apsStartDate = el.apsStartDate.value || localDateInputValue(todayAtMidnight());
  renderApsSchedule();
});
[el.apsPriorityRule, el.apsScenarioExtraHours, el.apsScenarioOperatorBoost].forEach((node) => {
  node.addEventListener('change', renderApsSchedule);
  node.addEventListener('input', renderApsSchedule);
});
el.sequencingBoard.addEventListener('input', (event) => {
  if (!event.target.matches('[data-sequence-input], [data-sequence-hours]')) return;
  const card = event.target.closest('[data-sequencing-activity]');
  const orderId = event.target.dataset.orderId;
  const activity = state.sequencingActivities.find((item) => item.key === card?.dataset.sequencingActivity);
  const sequenceItem = activity?.items?.find((item) => item.orderId === orderId);
  if (!sequenceItem) return;

  if (event.target.matches('[data-sequence-input]')) {
    sequenceItem.sequenceNumber = Number(event.target.value) || sequenceItem.sequenceNumber;
  }
  if (event.target.matches('[data-sequence-hours]')) {
    const hours = Number(String(event.target.value || '').replace(',', '.'));
    sequenceItem.estimatedHours = Number.isFinite(hours) && hours >= 0 ? hours : null;
  }
  renderSequencingGantt();
});
el.sequencingBoard.addEventListener('click', (event) => {
  const generateButton = event.target.closest('[data-generate-sequence]');
  const saveButton = event.target.closest('[data-save-sequence]');

  if (generateButton) {
    generateSequencing(generateButton.dataset.generateSequence);
    return;
  }

  if (saveButton) {
    saveSequencing(saveButton.dataset.saveSequence);
  }
});
el.pcpPendingBody.addEventListener('click', (event) => {
  const saveDateButton = event.target.closest('[data-save-pcp-date]');
  const savePurchaseOrderButton = event.target.closest('[data-save-pcp-purchase-order]');
  const resolveButton = event.target.closest('[data-resolve-pcp]');
  const deleteButton = event.target.closest('[data-delete-pcp]');

  if (saveDateButton) {
    updatePcpPendingIssueExpectedDate(saveDateButton.dataset.savePcpDate);
    return;
  }

  if (savePurchaseOrderButton) {
    updatePcpPendingIssuePurchaseOrder(savePurchaseOrderButton.dataset.savePcpPurchaseOrder);
    return;
  }

  if (resolveButton) {
    resolvePcpPendingIssue(resolveButton.dataset.resolvePcp);
    return;
  }

  if (deleteButton) {
    deletePcpPendingIssue(deleteButton.dataset.deletePcp);
  }
});
el.statusReleaseMonth.addEventListener('change', () => {
  if (state.currentScreen === 'dashboard') loadDashboardCharts();
});
el.statusReleaseClear.addEventListener('click', () => {
  el.statusReleaseMonth.value = '';
  if (state.currentScreen === 'dashboard') loadDashboardCharts();
});
el.dashboardYear.addEventListener('change', () => {
  if (state.currentScreen !== 'dashboard') return;
  renderReleaseSummary(state.dashboardOrders);
  renderDashboardCharts(state.dashboardOrders);
});
el.releaseSummaryTypeFilter.addEventListener('change', () => {
  if (state.currentScreen === 'dashboard') {
    renderReleaseSummary(state.dashboardOrders);
  }
});
el.saveDashboardGoals.addEventListener('click', saveDashboardGoals);
el.productSearch.addEventListener('input', () => {
  state.productSearch = el.productSearch.value.trim();
  renderProductScreen();
});
el.productSort.addEventListener('change', () => {
  state.productSortField = el.productSort.value;
  renderProductScreen();
});
el.productSortDirection.addEventListener('change', () => {
  state.productSortDirection = el.productSortDirection.value;
  renderProductScreen();
});
el.productRiskFilter.addEventListener('change', () => {
  state.productRiskFilter = el.productRiskFilter.value;
  renderProductScreen();
});
el.productClearFilters.addEventListener('click', () => {
  state.productSearch = '';
  state.productSortField = 'forecastNext3Months';
  state.productSortDirection = 'desc';
  state.productRiskFilter = '';
  state.productFilters = {};
  state.productForecastFilters = {};
  renderProductScreen();
});

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('.column-filter-trigger');
  const menu = document.querySelector('#columnFilterMenu');

  if (trigger) {
    event.preventDefault();
    openColumnFilterMenu(trigger.dataset.filterTable, trigger.dataset.filterKey, trigger);
    return;
  }

  if (!menu || menu.hidden) return;

  if (event.target.closest('[data-filter-apply]')) {
    applyColumnFilterFromMenu(menu);
    return;
  }

  if (event.target.closest('[data-filter-clear]')) {
    clearColumnFilterFromMenu();
    return;
  }

  if (!menu.contains(event.target)) {
    closeColumnFilterMenu();
  }
});

document.addEventListener('input', (event) => {
  if (!event.target.matches('[data-filter-search]')) return;
  updateColumnFilterSearch(event.target.closest('#columnFilterMenu'));
});

document.addEventListener('change', (event) => {
  const menu = event.target.closest('#columnFilterMenu');
  if (!menu) return;

  if (event.target.matches('[data-filter-toggle-all]')) {
    const checked = event.target.checked;
    for (const option of menu.querySelectorAll('[data-filter-option]')) {
      if (!option.closest('.column-filter-option')?.hidden) {
        option.checked = checked;
      }
    }
  }

  updateColumnFilterSelectAll(menu);
});

el.clearFilters.addEventListener('click', () => {
  el.search.value = '';
  el.statusFilter.value = '';
  el.scopeFilter.value = '';
  el.dueWithinDays.value = '';
  state.ordersPage = 1;
  loadOrders();
});

el.newOrder.addEventListener('click', () => openDialog());
el.informDimensions.addEventListener('click', openDimensionsDialog);
el.toggleBillingInvoiced.addEventListener('click', () => {
  state.billingInvoicedCollapsed = !state.billingInvoicedCollapsed;
  renderBillingItems();
});
el.billingInvoicedSearch.addEventListener('input', () => {
  state.billingInvoicedFilters.search = el.billingInvoicedSearch.value.trim();
  renderBillingItems();
});
el.billingInvoicedType.addEventListener('change', () => {
  state.billingInvoicedFilters.sourceType = el.billingInvoicedType.value;
  renderBillingItems();
});
el.billingInvoicedDateFrom.addEventListener('change', () => {
  state.billingInvoicedFilters.dateFrom = el.billingInvoicedDateFrom.value;
  renderBillingItems();
});
el.billingInvoicedDateTo.addEventListener('change', () => {
  state.billingInvoicedFilters.dateTo = el.billingInvoicedDateTo.value;
  renderBillingItems();
});
el.billingInvoicedDocument.addEventListener('change', () => {
  state.billingInvoicedFilters.document = el.billingInvoicedDocument.value;
  renderBillingItems();
});
el.billingInvoicedClearFilters.addEventListener('click', () => {
  state.billingInvoicedFilters = {
    search: '',
    sourceType: '',
    dateFrom: '',
    dateTo: '',
    document: ''
  };
  el.billingInvoicedSearch.value = '';
  el.billingInvoicedType.value = '';
  el.billingInvoicedDateFrom.value = '';
  el.billingInvoicedDateTo.value = '';
  el.billingInvoicedDocument.value = '';
  renderBillingItems();
});
el.loadingSearch.addEventListener('input', () => {
  state.loadingSearch = el.loadingSearch.value.trim();
  renderLoadingItems();
});

el.editSelectedOrder.addEventListener('click', () => {
  const selectedOrders = getSelectedOrders();
  if (selectedOrders.length !== 1) {
    alert('Selecione apenas um pedido para editar.');
    return;
  }

  openDialog(selectedOrders[0]);
});

el.changeSelectedStatus.addEventListener('click', () => {
  const selectedOrders = getSelectedOrders();
  if (!selectedOrders.length) {
    alert('Selecione pelo menos um pedido.');
    return;
  }

  openStatusDialog(selectedOrders);
});

el.ordersTable.addEventListener('click', (event) => {
  if (state.draggedColumnKey) return;
  const sortButton = event.target.closest('[data-sort]');
  if (!sortButton) return;

  const field = sortButton.dataset.sort;
  if (state.sortField === field) {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortField = field;
    state.sortDirection = ['customer', 'commercialResponsible', 'sku', 'orderNumber', 'productionOrder', 'purchaseOrderNumber'].includes(field)
      ? 'asc'
      : 'desc';
  }

  state.ordersPage = 1;
  loadOrders();
});

el.ordersTable.addEventListener('change', (event) => {
  const selectAll = event.target.closest('[data-select-all-orders]');
  if (!selectAll) return;

  for (const order of state.orders) {
    if (selectAll.checked) {
      state.selectedOrderIds.add(order.id);
    } else {
      state.selectedOrderIds.delete(order.id);
    }
  }

  renderOrders();
});

el.ordersTable.addEventListener('dragstart', (event) => {
  const header = event.target.closest('th[data-column-key]');
  if (!header) return;

  state.draggedColumnKey = header.dataset.columnKey;
  header.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', state.draggedColumnKey);
});

el.ordersTable.addEventListener('dragover', (event) => {
  const header = event.target.closest('th[data-column-key]');
  if (!header || !state.draggedColumnKey || header.dataset.columnKey === state.draggedColumnKey) return;
  event.preventDefault();
});

el.ordersTable.addEventListener('drop', (event) => {
  const header = event.target.closest('th[data-column-key]');
  if (!header || !state.draggedColumnKey) return;
  event.preventDefault();

  moveOrderColumn(state.draggedColumnKey, header.dataset.columnKey, event);
  persistColumnOrder();
  renderOrders();
  updateSortIndicators();
});

el.ordersTable.addEventListener('dragend', () => {
  for (const header of el.ordersTable.querySelectorAll('th.dragging')) {
    header.classList.remove('dragging');
  }
  setTimeout(() => {
    state.draggedColumnKey = '';
  }, 0);
});

el.ordersBody.addEventListener('change', (event) => {
  const checkbox = event.target.closest('[data-select-order]');
  if (!checkbox) return;

  if (checkbox.checked) {
    state.selectedOrderIds.add(checkbox.dataset.selectOrder);
  } else {
    state.selectedOrderIds.delete(checkbox.dataset.selectOrder);
  }

  const row = checkbox.closest('tr');
  if (row) row.classList.toggle('is-selected', checkbox.checked);
  updateSelectionActions();
});

el.ordersBody.addEventListener('click', (event) => {
  const qualityAlertButton = event.target.closest('[data-quality-alerts]');
  const photosButton = event.target.closest('[data-photos]');
  const releaseBillingButton = event.target.closest('[data-release-billing]');
  const opButton = event.target.closest('[data-op]');
  const purchaseOrderButton = event.target.closest('[data-purchase-order]');
  const interactiveControl = event.target.closest('button, input, select, textarea, a, label');

  if (qualityAlertButton) {
    const order = state.orders.find((item) => item.id === qualityAlertButton.dataset.qualityAlerts);
    if (order) openQualityAlertNoticeDialog(order);
    return;
  }

  if (opButton) {
    const order = state.orders.find((item) => item.id === opButton.dataset.op);
    if (order) updateProductionOrderQuick(order);
    return;
  }

  if (purchaseOrderButton) {
    const order = state.orders.find((item) => item.id === purchaseOrderButton.dataset.purchaseOrder);
    if (order) updatePurchaseOrderQuick(order);
    return;
  }

  if (releaseBillingButton) {
    releaseOrderForBilling(releaseBillingButton.dataset.releaseBilling);
    return;
  }

  if (photosButton) {
    const order = state.orders.find((item) => item.id === photosButton.dataset.photos);
    if (order) openPhotosDialog(order);
    return;
  }

  if (interactiveControl) return;

  const row = event.target.closest('tr');
  const order = row && el.ordersBody.contains(row)
    ? state.orders.find((item) => item.id === row.dataset.orderId)
    : null;
  openOrderSummary(order);
});

el.billingBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-billing]');
  if (button) {
    openBillingDialog(button.dataset.openBilling, button.dataset.sourceType);
    return;
  }

  if (event.target.closest('button, input, select, textarea, a')) return;

  const row = event.target.closest('tr[data-order-id]');
  if (row) openBillingDialog(row.dataset.orderId, row.dataset.sourceType);
});

el.billingInvoicedBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-view-invoiced]');
  if (button) {
    openBillingConsultDialog(button.dataset.viewInvoiced, button.dataset.sourceType);
    return;
  }

  if (event.target.closest('button, input, select, textarea, a')) return;

  const row = event.target.closest('tr[data-order-id]');
  if (row) openBillingConsultDialog(row.dataset.orderId, row.dataset.sourceType);
});

el.loadingBody.addEventListener('click', async (event) => {
  const invoiceButton = event.target.closest('[data-download-invoice]');
  if (invoiceButton) {
    await downloadInvoiceDocument(invoiceButton.dataset.downloadInvoice, invoiceButton.dataset.sourceType);
    return;
  }

  const loadedButton = event.target.closest('[data-mark-loaded]');
  if (!loadedButton) return;

  await markOrderLoaded(loadedButton.dataset.markLoaded, loadedButton.dataset.sourceType);
});

el.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.formError.hidden = true;

  try {
    if (state.editingId) {
      await api(`/api/orders/${encodeURIComponent(state.editingId)}`, {
        method: 'PUT',
        body: orderPayload()
      });
    } else {
      await api('/api/orders', {
        method: 'POST',
        body: orderPayload()
      });
    }

    closeDialog();
    await refreshOrdersIfVisible();
  } catch (error) {
    el.formError.textContent = error.message;
    el.formError.hidden = false;
  }
});

el.statusChangeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.statusChangeError.hidden = true;

  try {
    if (!state.statusOrderIds.length) {
      throw new Error('Selecione pelo menos um pedido.');
    }

    const targetStatus = el.statusChangeSelect.value;
    const allowDeviation = el.statusChangeAllowDeviation.checked;
    const deviationReason = el.statusChangeDeviationReason.value.trim();
    const selectedOrders = state.statusOrderIds
      .map((id) => state.orders.find((order) => order.id === id))
      .filter(Boolean);
    for (const order of selectedOrders) {
      const validation = validateStatusTransitionClient(order.status, targetStatus, allowDeviation, deviationReason);
      if (!validation.ok) {
        throw new Error(`Pedido ${order.orderNumber || '-'}: ${validation.error}`);
      }
    }

    for (const orderId of state.statusOrderIds) {
      await api(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        body: {
          status: targetStatus,
          allowStatusDeviation: allowDeviation,
          statusDeviationReason: deviationReason
        }
      });
    }

    state.selectedOrderIds.clear();
    closeStatusDialog();
    await refreshOrdersIfVisible();
  } catch (error) {
    el.statusChangeError.textContent = error.message;
    el.statusChangeError.hidden = false;
  }
});

el.statusChangeAllowDeviation.addEventListener('change', () => {
  el.statusChangeDeviationReasonField.hidden = !el.statusChangeAllowDeviation.checked;
  if (!el.statusChangeAllowDeviation.checked) {
    el.statusChangeDeviationReason.value = '';
    return;
  }
  el.statusChangeDeviationReason.focus();
});

el.deleteOrder.addEventListener('click', async () => {
  if (!state.editingId) return;
  await api(`/api/orders/${encodeURIComponent(state.editingId)}`, { method: 'DELETE' });
  closeDialog();
  await refreshOrdersIfVisible();
});

el.statusAdminForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.statusAdminError.hidden = true;

  try {
    const path = state.editingStatusId
      ? `/api/admin/statuses/${encodeURIComponent(state.editingStatusId)}`
      : '/api/admin/statuses';
    const method = state.editingStatusId ? 'PUT' : 'POST';

    await api(path, {
      method,
      body: {
        name: el.statusAdminName.value,
        sortOrder: el.statusAdminSortOrder.value,
        category: el.statusAdminCategory.value,
        flowType: el.statusAdminFlowType.value
      }
    });
    resetStatusAdminForm();
    await refreshReferences();
    await loadAdminData();
    await refreshOrdersIfVisible();
  } catch (error) {
    el.statusAdminError.textContent = error.message;
    el.statusAdminError.hidden = false;
  }
});

el.apsWorkCenterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.apsWorkCenterError.hidden = true;
  try {
    await submitApsWorkCenter();
  } catch (error) {
    el.apsWorkCenterError.textContent = error.message;
    el.apsWorkCenterError.hidden = false;
  }
});

el.apsOperatorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.apsOperatorError.hidden = true;
  try {
    await submitApsOperator();
  } catch (error) {
    el.apsOperatorError.textContent = error.message;
    el.apsOperatorError.hidden = false;
  }
});

el.customerAdminForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.customerAdminError.hidden = true;

  try {
    const path = state.editingCustomerId
      ? `/api/admin/customers/${encodeURIComponent(state.editingCustomerId)}`
      : '/api/admin/customers';
    const method = state.editingCustomerId ? 'PUT' : 'POST';

    await api(path, { method, body: { name: el.customerAdminName.value } });
    resetCustomerAdminForm();
    await refreshReferences();
    await loadAdminData();
    await refreshOrdersIfVisible();
  } catch (error) {
    el.customerAdminError.textContent = error.message;
    el.customerAdminError.hidden = false;
  }
});

el.userAdminForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  el.userAdminError.hidden = true;

  try {
    const path = state.editingUserId
      ? `/api/admin/users/${encodeURIComponent(state.editingUserId)}`
      : '/api/admin/users';
    const method = state.editingUserId ? 'PUT' : 'POST';
    const tabAccess = readUserTabAccess();

    await api(path, {
      method,
      body: {
        name: el.userAdminName.value,
        username: el.userAdminUsername.value,
        password: el.userAdminPassword.value,
        role: el.userAdminRole.value,
        canEditOrders: el.userAdminCanEditOrders.checked || tabAccess.editableTabs.includes('orders'),
        visibleTabs: tabAccess.visibleTabs,
        editableTabs: tabAccess.editableTabs
      }
    });
    resetUserAdminForm();
    await loadAdminData();
  } catch (error) {
    el.userAdminError.textContent = error.message;
    el.userAdminError.hidden = false;
  }
});

el.userAdminRole.addEventListener('change', () => {
  const preset = roleAccessPreset(el.userAdminRole.value);
  el.userAdminCanEditOrders.checked = preset.canEditOrders;
  renderUserTabAccess(preset.visibleTabs, preset.editableTabs);
});

el.userAdminCanEditOrders.addEventListener('change', () => {
  const ordersEdit = el.userAdminTabAccess.querySelector('[data-tab-edit="orders"]');
  const ordersView = el.userAdminTabAccess.querySelector('[data-tab-view="orders"]');
  if (ordersEdit && !ordersEdit.disabled) ordersEdit.checked = el.userAdminCanEditOrders.checked;
  if (ordersView && !ordersView.disabled && el.userAdminCanEditOrders.checked) ordersView.checked = true;
});

el.userAdminTabAccess.addEventListener('change', (event) => {
  const viewInput = event.target.closest('[data-tab-view]');
  const editInput = event.target.closest('[data-tab-edit]');
  if (viewInput && !viewInput.checked) {
    const editForTab = el.userAdminTabAccess.querySelector(`[data-tab-edit="${viewInput.dataset.tabView}"]`);
    if (editForTab) editForTab.checked = false;
  }
  if (editInput && editInput.checked) {
    const viewForTab = el.userAdminTabAccess.querySelector(`[data-tab-view="${editInput.dataset.tabEdit}"]`);
    if (viewForTab) viewForTab.checked = true;
  }
  const ordersEdit = el.userAdminTabAccess.querySelector('[data-tab-edit="orders"]');
  el.userAdminCanEditOrders.checked = Boolean(ordersEdit && ordersEdit.checked);
});

el.statusAdminList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-admin-status]');
  const deleteButton = event.target.closest('[data-delete-admin-status]');

  if (editButton) {
    state.editingStatusId = editButton.dataset.editAdminStatus;
    el.statusAdminName.value = editButton.dataset.name;
    el.statusAdminSortOrder.value = editButton.dataset.sortOrder || '';
    el.statusAdminCategory.value = editButton.dataset.category || 'auxiliary';
    el.statusAdminFlowType.value = editButton.dataset.flowType || 'normal';
    el.statusAdminSave.textContent = 'Salvar';
    el.statusAdminCancel.hidden = false;
  }

  if (deleteButton && confirm('Excluir este status?')) {
    try {
      await api(`/api/admin/statuses/${encodeURIComponent(deleteButton.dataset.deleteAdminStatus)}`, { method: 'DELETE' });
      await refreshReferences();
      await loadAdminData();
    } catch (error) {
      el.statusAdminError.textContent = error.message;
      el.statusAdminError.hidden = false;
    }
  }
});

el.apsWorkCenterList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-aps-work-center]');
  const deleteButton = event.target.closest('[data-delete-aps-work-center]');

  if (editButton) {
    editApsWorkCenter(editButton.dataset.editApsWorkCenter);
    return;
  }

  if (deleteButton) {
    try {
      await deleteApsWorkCenter(deleteButton.dataset.deleteApsWorkCenter);
    } catch (error) {
      el.apsWorkCenterError.textContent = error.message;
      el.apsWorkCenterError.hidden = false;
    }
  }
});

el.apsOperatorList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-aps-operator]');
  const deleteButton = event.target.closest('[data-delete-aps-operator]');

  if (editButton) {
    editApsOperator(editButton.dataset.editApsOperator);
    return;
  }

  if (deleteButton) {
    try {
      await deleteApsOperator(deleteButton.dataset.deleteApsOperator);
    } catch (error) {
      el.apsOperatorError.textContent = error.message;
      el.apsOperatorError.hidden = false;
    }
  }
});

el.customerAdminList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-admin-customer]');
  const deleteButton = event.target.closest('[data-delete-admin-customer]');

  if (editButton) {
    state.editingCustomerId = editButton.dataset.editAdminCustomer;
    el.customerAdminName.value = editButton.dataset.name;
    el.customerAdminSave.textContent = 'Salvar';
    el.customerAdminCancel.hidden = false;
  }

  if (deleteButton && confirm('Excluir este cliente?')) {
    try {
      await api(`/api/admin/customers/${encodeURIComponent(deleteButton.dataset.deleteAdminCustomer)}`, { method: 'DELETE' });
      await refreshReferences();
      await loadAdminData();
    } catch (error) {
      el.customerAdminError.textContent = error.message;
      el.customerAdminError.hidden = false;
    }
  }
});

el.userAdminList.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-admin-user]');
  const deleteButton = event.target.closest('[data-delete-admin-user]');

  if (editButton) {
    state.editingUserId = editButton.dataset.editAdminUser;
    el.userAdminName.value = editButton.dataset.name;
    el.userAdminUsername.value = editButton.dataset.username;
    el.userAdminPassword.value = '';
    el.userAdminPassword.placeholder = 'Nova senha opcional';
    el.userAdminRole.value = editButton.dataset.role;
    el.userAdminCanEditOrders.checked = editButton.dataset.canEditOrders === '1';
    renderUserTabAccess(
      parseEncodedJson(editButton.dataset.visibleTabs, DEFAULT_VISIBLE_TABS),
      parseEncodedJson(editButton.dataset.editableTabs, editButton.dataset.canEditOrders === '1' ? DEFAULT_EDITABLE_TABS : [])
    );
    el.userAdminSave.textContent = 'Salvar';
    el.userAdminCancel.hidden = false;
  }

  if (deleteButton && !deleteButton.disabled && confirm('Excluir este usuário?')) {
    try {
      await api(`/api/admin/users/${encodeURIComponent(deleteButton.dataset.deleteAdminUser)}`, { method: 'DELETE' });
      await loadAdminData();
    } catch (error) {
      el.userAdminError.textContent = error.message;
      el.userAdminError.hidden = false;
    }
  }
});

el.orderPhotoInput.addEventListener('change', () => {
  uploadOrderPhotos(Array.from(el.orderPhotoInput.files || []));
});

el.orderPhotoList.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete-photo]');
  if (!deleteButton) return;

  try {
    await api(`/api/orders/${encodeURIComponent(deleteButton.dataset.orderId)}/photos/${encodeURIComponent(deleteButton.dataset.deletePhoto)}`, {
      method: 'DELETE'
    });
    await refreshOrderPhotoEditor();
    await refreshOrdersIfVisible();
  } catch (error) {
    el.orderPhotoError.textContent = error.message;
    el.orderPhotoError.hidden = false;
  }
});

el.statusAdminCancel.addEventListener('click', resetStatusAdminForm);
el.apsWorkCenterCancel.addEventListener('click', resetApsWorkCenterForm);
el.apsOperatorCancel.addEventListener('click', resetApsOperatorForm);
el.customerAdminCancel.addEventListener('click', resetCustomerAdminForm);
el.userAdminCancel.addEventListener('click', resetUserAdminForm);
el.createBackup.addEventListener('click', createSystemBackup);
el.refreshHealth.addEventListener('click', refreshSystemHealth);
el.backupList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-restore-backup]');
  if (button) restoreSystemBackup(button.dataset.restoreBackup);
});
el.itemType.addEventListener('change', togglePurchaseOrderField);
el.entryDate.addEventListener('change', () => {
  updateLeadTimePreview();
  updateDaysLatePreview();
});
el.originalDeliveryDate.addEventListener('change', () => {
  updateLeadTimePreview();
  updateDaysLatePreview();
});
el.finalizationDate.addEventListener('change', updateDaysLatePreview);
el.closeDialog.addEventListener('click', closeDialog);
el.cancelDialog.addEventListener('click', closeDialog);
el.closeStatusDialog.addEventListener('click', closeStatusDialog);
el.cancelStatusDialog.addEventListener('click', closeStatusDialog);
el.closePhotosDialog.addEventListener('click', closePhotosDialog);
el.cancelPhotosDialog.addEventListener('click', closePhotosDialog);
el.backdrop.addEventListener('click', (event) => {
  if (event.target === el.backdrop) closeDialog();
});
el.statusDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === el.statusDialogBackdrop) closeStatusDialog();
});
el.passwordDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === el.passwordDialogBackdrop) closePasswordDialog();
});
el.dimensionsDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === el.dimensionsDialogBackdrop) closeDimensionsDialog();
});
el.billingDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === el.billingDialogBackdrop) closeBillingDialog();
});
el.photosDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === el.photosDialogBackdrop) closePhotosDialog();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeColumnFilterMenu();
    closeOrderSummary();
    if (el.backdrop.classList.contains('open')) closeDialog();
    if (el.statusDialogBackdrop.classList.contains('open')) closeStatusDialog();
    if (el.passwordDialogBackdrop.classList.contains('open')) closePasswordDialog();
    if (el.dimensionsDialogBackdrop.classList.contains('open')) closeDimensionsDialog();
    if (el.billingDialogBackdrop.classList.contains('open')) closeBillingDialog();
    if (el.photosDialogBackdrop.classList.contains('open')) closePhotosDialog();
  }
});

window.addEventListener('resize', closeColumnFilterMenu);

{
  const initialPreset = roleAccessPreset('viewer');
  renderUserTabAccess(initialPreset.visibleTabs, initialPreset.editableTabs);
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => registration.update()).catch(() => {});
  });
}
startAutoUpdateCheck();
boot();
