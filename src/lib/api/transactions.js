// Transactions / inventory operations API endpoints.
// Used by Goods Receipt, Goods Issue, and Scrap & Return pages.
import { apiClient } from '../apiClient';

export const transactionsApi = {
  // List recent transactions with optional filters.
  // filters: { type, materialId, projectId, vendorId, startDate, endDate, limit }
  list(filters = {}) {
    return apiClient.get('/transactions', {
      params: {
        type: filters.type,
        materialId: filters.materialId,
        projectId: filters.projectId,
        vendorId: filters.vendorId,
        userId: filters.userId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: filters.limit,
      },
    });
  },

  get(id) {
    return apiClient.get(`/transactions/${id}`);
  },

  // Goods Receipt - either purchaseOrderId or vendorId required
  // payload: { purchaseOrderId?, vendorId?, items: [{ poItemId?, materialId, qty, heatNumber?, notes? }], notes?, date? }
  // Side effects: increments material.stock; if linked to PO, updates po_item.received_qty and PO status.
  receipt(payload) {
    return apiClient.post('/goods-receipt', payload);
  },

  // Goods Issue - decrements material stock with validation.
  // payload: { projectId, items: [{ materialId, qty, heatNumber?, notes? }], mandor?, notes?, date? }
  issue(payload) {
    return apiClient.post('/goods-issue', payload);
  },

  // Scrap or Return.
  // payload: { type: 'scrap'|'return', materialId, projectId?, qty, reason, heatNumber?, date? }
  scrapReturn(payload) {
    return apiClient.post('/scrap-return', payload);
  },
};
