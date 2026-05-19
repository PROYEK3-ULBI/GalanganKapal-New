// Export helpers for the Reports page.
//
// Generates client-side PDF (via jspdf + jspdf-autotable) and Excel (via xlsx)
// files based on the active tab. Libraries are loaded with dynamic imports so
// they do not bloat the initial bundle.

const ID_LOCALE = 'id-ID';

// Brand color used for table headers in PDF (matches --color-primary).
const PDF_HEAD_FILL = [15, 23, 42];

// Per-tab metadata.
export const tabConfig = {
  'stock-summary': { label: 'Valuasi Stok', filename: 'laporan-stock-summary' },
  'category':      { label: 'Rincian Kategori', filename: 'laporan-category' },
  'transactions':  { label: 'Ringkasan Transaksi', filename: 'laporan-transactions' },
  'project':       { label: 'Konsumsi Proyek', filename: 'laporan-project' },
};

// Format a Date as 'DD Mon YYYY HH:mm' in id-ID for use in PDF titles.
export function formatTimestamp(date = new Date()) {
  const datePart = date.toLocaleDateString(ID_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString(ID_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

// Format a Date as 'YYYYMMDD-HHmm' for filenames.
export function formatFileTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}

function formatDateID(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(ID_LOCALE);
  } catch {
    return String(iso);
  }
}

// Build the dataset(s) to export for a given tab.
// Returns: { sections: [{ title, headers, rows }] } so a single tab can
// have multiple sections (e.g. transactions has summary + recent).
function buildSections(tabId, payload) {
  switch (tabId) {
    case 'stock-summary': {
      const rows = (payload.stockValuation ?? []).map(r => [
        r.sku,
        r.name,
        r.category,
        r.stock,
        r.unit,
        r.price,
        r.totalValue,
        r.status,
      ]);
      return {
        sections: [{
          title: 'Valuasi Stok',
          headers: ['SKU', 'Material', 'Kategori', 'Stok', 'Satuan', 'Harga Satuan (IDR)', 'Nilai Total (IDR)', 'Status'],
          rows,
        }],
      };
    }
    case 'category': {
      const rows = (payload.categories ?? []).map(c => [
        c.category,
        c.items,
        c.qty,
        c.value,
      ]);
      return {
        sections: [{
          title: 'Rincian Kategori',
          headers: ['Kategori', 'Jumlah Material', 'Qty', 'Nilai Total (IDR)'],
          rows,
        }],
      };
    }
    case 'transactions': {
      const summaryRows = (payload.txSummary ?? []).map(t => [
        t.label ?? t.type,
        t.count,
        t.totalQty ?? '',
      ]);
      const recentRows = (payload.recentTx ?? []).map(t => [
        t.transactionNo,
        t.type,
        t.material,
        t.qty,
        formatDateID(t.date),
      ]);
      return {
        sections: [
          {
            title: 'Per Tipe',
            headers: ['Tipe', 'Jumlah Transaksi', 'Total Qty'],
            rows: summaryRows,
          },
          {
            title: 'Transaksi Terbaru',
            headers: ['No. Transaksi', 'Tipe', 'Material', 'Qty', 'Tanggal'],
            rows: recentRows,
          },
        ],
      };
    }
    case 'project': {
      const rows = (payload.projectConsumption ?? []).map(p => [
        p.project,
        p.projectName,
        p.txCount,
        p.totalQty,
      ]);
      return {
        sections: [{
          title: 'Konsumsi Proyek',
          headers: ['Kode Proyek', 'Nama Proyek', 'Jumlah Transaksi', 'Total Qty'],
          rows,
        }],
      };
    }
    default:
      return { sections: [] };
  }
}

function totalRowCount(sections) {
  return sections.reduce((sum, s) => sum + s.rows.length, 0);
}

// Generate PDF for the given tab and trigger download.
export async function exportTabAsPDF(tabId, payload, addToast) {
  const cfg = tabConfig[tabId];
  if (!cfg) {
    addToast?.('Tab tidak dikenali', 'error');
    return;
  }
  const { sections } = buildSections(tabId, payload);
  if (totalRowCount(sections) === 0) {
    addToast?.('Tidak ada data untuk diekspor', 'warning');
    return;
  }

  let jsPDFCtor;
  try {
    const jsPdfModule = await import('jspdf');
    // jspdf-autotable registers itself as a side-effect on jsPDF prototype.
    await import('jspdf-autotable');
    jsPDFCtor = jsPdfModule.default || jsPdfModule.jsPDF;
  } catch (err) {
    addToast?.('Gagal memuat library PDF', 'error');
    throw err;
  }

  const doc = new jsPDFCtor({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Title.
  doc.setFontSize(16);
  doc.text(`Laporan ${cfg.label}`, 40, 40);
  // Subtitle / timestamp.
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Dibuat: ${formatTimestamp()}`, 40, 58);
  doc.setTextColor(0);

  let nextY = 80;
  for (const section of sections) {
    if (sections.length > 1) {
      doc.setFontSize(12);
      doc.text(section.title, 40, nextY);
      nextY += 14;
    }
    doc.autoTable({
      startY: nextY,
      head: [section.headers],
      body: section.rows,
      theme: 'striped',
      headStyles: { fillColor: PDF_HEAD_FILL, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 40, right: 40 },
    });
    nextY = doc.lastAutoTable.finalY + 24;
  }

  const filename = `${cfg.filename}-${formatFileTimestamp()}.pdf`;
  doc.save(filename);
  addToast?.(`PDF berhasil diunduh: ${filename}`, 'success');
}

// Generate Excel (.xlsx) for the given tab and trigger download.
export async function exportTabAsExcel(tabId, payload, addToast) {
  const cfg = tabConfig[tabId];
  if (!cfg) {
    addToast?.('Tab tidak dikenali', 'error');
    return;
  }
  const { sections } = buildSections(tabId, payload);
  if (totalRowCount(sections) === 0) {
    addToast?.('Tidak ada data untuk diekspor', 'warning');
    return;
  }

  let XLSX;
  try {
    XLSX = await import('xlsx');
  } catch (err) {
    addToast?.('Gagal memuat library Excel', 'error');
    throw err;
  }

  const wb = XLSX.utils.book_new();

  if (sections.length === 1) {
    const s = sections[0];
    const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
    XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(cfg.label));
  } else {
    for (const s of sections) {
      const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
      XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(s.title));
    }
  }

  const filename = `${cfg.filename}-${formatFileTimestamp()}.xlsx`;
  XLSX.writeFile(wb, filename);
  addToast?.(`Excel berhasil diunduh: ${filename}`, 'success');
}

// Excel sheet names cannot exceed 31 chars or contain certain characters.
function sanitizeSheetName(name) {
  return String(name).replace(/[\\/?*[\]:]/g, '_').slice(0, 31);
}
