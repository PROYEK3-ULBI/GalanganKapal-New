// Purchase Orders API endpoints.
import { apiClient } from '../apiClient';

export const purchaseOrdersApi = {
  list(filters = {}) {
    return apiClient.get('/purchase-orders', {
      params: {
        search: filters.search,
        status: filters.status,
        vendorId: filters.vendorId,
      },
    });
  },
  stats() {
    return apiClient.get('/purchase-orders/stats');
  },
  get(id) {
    return apiClient.get(`/purchase-orders/${id}`);
  },
  // payload shape:
  // {
  //   vendorId: string,
  //   poNumber?: string,        (auto-generated if omitted)
  //   date?: 'YYYY-MM-DD',      (today if omitted)
  //   status?: 'Draft'|'Pending'|...,  (Draft if omitted)
  //   notes?: string,
  //   items: [{ materialId, ordered, unitPrice, notes? }]
  // }
  create(payload) {
    return apiClient.post('/purchase-orders', payload);
  },
  update(id, payload) {
    return apiClient.put(`/purchase-orders/${id}`, payload);
  },
  remove(id) {
    return apiClient.delete(`/purchase-orders/${id}`);
  },
};
