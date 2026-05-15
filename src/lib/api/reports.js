// Reports & Analytics API endpoints (read-only).
import { apiClient } from '../apiClient';

export const reportsApi = {
  // High-level KPIs (total value, total items, low stock count, etc.).
  summary() {
    return apiClient.get('/reports/summary');
  },
  // Per-material valuation table.
  stockValuation() {
    return apiClient.get('/reports/stock-valuation');
  },
  // Aggregates per category.
  categoryBreakdown() {
    return apiClient.get('/reports/category-breakdown');
  },
  // Counts per transaction type with optional date range.
  transactionSummary(filters = {}) {
    return apiClient.get('/reports/transaction-summary', {
      params: { startDate: filters.startDate, endDate: filters.endDate },
    });
  },
  // Material outflow per active project.
  projectConsumption() {
    return apiClient.get('/reports/project-consumption');
  },
  // Daily inbound/outbound chart data (defaults to 30 days).
  inventoryTrend(days = 30) {
    return apiClient.get('/reports/inventory-trend', { params: { days } });
  },
};
