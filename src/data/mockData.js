export const users = [
  { id: 1, name: 'Ahmad Fauzi', email: 'ahmad.fauzi@shipyard.co.id', role: 'admin', department: 'IT', status: 'active', avatar: 'AF', lastLogin: '2026-05-02 09:15' },
  { id: 2, name: 'Budi Santoso', email: 'budi.s@shipyard.co.id', role: 'supervisor', department: 'Production', status: 'active', avatar: 'BS', lastLogin: '2026-05-02 08:30' },
  { id: 3, name: 'Citra Dewi', email: 'citra.d@shipyard.co.id', role: 'staff', department: 'Warehouse', status: 'active', avatar: 'CD', lastLogin: '2026-05-02 07:45' },
  { id: 4, name: 'Dedi Kurniawan', email: 'dedi.k@shipyard.co.id', role: 'supervisor', department: 'QC', status: 'active', avatar: 'DK', lastLogin: '2026-05-01 16:20' },
  { id: 5, name: 'Eka Prasetya', email: 'eka.p@shipyard.co.id', role: 'staff', department: 'Warehouse', status: 'inactive', avatar: 'EP', lastLogin: '2026-04-28 10:00' },
  { id: 6, name: 'Fitri Handayani', email: 'fitri.h@shipyard.co.id', role: 'staff', department: 'Procurement', status: 'active', avatar: 'FH', lastLogin: '2026-05-02 08:00' },
  { id: 7, name: 'Gunawan Wibowo', email: 'gunawan.w@shipyard.co.id', role: 'admin', department: 'IT', status: 'active', avatar: 'GW', lastLogin: '2026-05-02 09:00' },
  { id: 8, name: 'Hendra Susanto', email: 'hendra.s@shipyard.co.id', role: 'supervisor', department: 'Engineering', status: 'active', avatar: 'HS', lastLogin: '2026-05-01 14:30' },
];

export const materials = [
  { id: 1, sku: 'PLT-AH36-1020', name: 'Steel Plate AH36 10mm', category: 'Steel Plates', unit: 'Sheet', stock: 145, minStock: 50, reorderPoint: 75, price: 2850000, hazmat: false, heatNumber: 'HN-2026-0451', location: 'Yard-A1', status: 'In Stock' },
  { id: 2, sku: 'PLT-AH36-1220', name: 'Steel Plate AH36 12mm', category: 'Steel Plates', unit: 'Sheet', stock: 89, minStock: 40, reorderPoint: 60, price: 3420000, hazmat: false, heatNumber: 'HN-2026-0452', location: 'Yard-A2', status: 'In Stock' },
  { id: 3, sku: 'PLT-DH36-1620', name: 'Steel Plate DH36 16mm', category: 'Steel Plates', unit: 'Sheet', stock: 12, minStock: 20, reorderPoint: 30, price: 4580000, hazmat: false, heatNumber: 'HN-2026-0389', location: 'Yard-A3', status: 'Low Stock' },
  { id: 4, sku: 'WLD-E7018-350', name: 'Welding Electrode E7018 3.2mm', category: 'Welding Consumables', unit: 'Kg', stock: 520, minStock: 200, reorderPoint: 300, price: 45000, hazmat: false, heatNumber: null, location: 'WH-B1', status: 'In Stock' },
  { id: 5, sku: 'WLD-E7018-400', name: 'Welding Electrode E7018 4.0mm', category: 'Welding Consumables', unit: 'Kg', stock: 180, minStock: 150, reorderPoint: 200, price: 48000, hazmat: false, heatNumber: null, location: 'WH-B1', status: 'Low Stock' },
  { id: 6, sku: 'PNT-EPX-MAR20', name: 'Marine Epoxy Primer 20L', category: 'Paint & Coating', unit: 'Pail', stock: 35, minStock: 15, reorderPoint: 25, price: 1250000, hazmat: true, heatNumber: null, location: 'WH-C1', status: 'In Stock' },
  { id: 7, sku: 'PNT-AFO-RED20', name: 'Antifouling Paint Red 20L', category: 'Paint & Coating', unit: 'Pail', stock: 0, minStock: 10, reorderPoint: 20, price: 1850000, hazmat: true, heatNumber: null, location: 'WH-C1', status: 'Out of Stock' },
  { id: 8, sku: 'PPE-PIP-SCH40', name: 'Pipe Schedule 40 6inch', category: 'Piping', unit: 'Length', stock: 67, minStock: 20, reorderPoint: 35, price: 890000, hazmat: false, heatNumber: 'HN-2026-0510', location: 'Yard-D1', status: 'In Stock' },
  { id: 9, sku: 'BLT-HEX-M20', name: 'Hex Bolt M20x60 Grade 8.8', category: 'Fasteners', unit: 'Pcs', stock: 2400, minStock: 500, reorderPoint: 800, price: 8500, hazmat: false, heatNumber: null, location: 'WH-E1', status: 'In Stock' },
  { id: 10, sku: 'GAS-ACT-50L', name: 'Acetylene Gas 50L Cylinder', category: 'Gas & Chemicals', unit: 'Cylinder', stock: 8, minStock: 10, reorderPoint: 15, price: 450000, hazmat: true, heatNumber: null, location: 'GAS-YARD', status: 'Low Stock' },
  { id: 11, sku: 'GAS-OXY-50L', name: 'Oxygen Gas 50L Cylinder', category: 'Gas & Chemicals', unit: 'Cylinder', stock: 15, minStock: 10, reorderPoint: 15, price: 280000, hazmat: true, heatNumber: null, location: 'GAS-YARD', status: 'In Stock' },
  { id: 12, sku: 'PLT-SS316-0810', name: 'Stainless Steel 316L 8mm', category: 'Steel Plates', unit: 'Sheet', stock: 22, minStock: 10, reorderPoint: 15, price: 8750000, hazmat: false, heatNumber: 'HN-2026-0601', location: 'Yard-A4', status: 'In Stock' },
  { id: 13, sku: 'CBL-PWR-35MM', name: 'Power Cable XLPE 35mm²', category: 'Electrical', unit: 'Meter', stock: 450, minStock: 200, reorderPoint: 300, price: 125000, hazmat: false, heatNumber: null, location: 'WH-F1', status: 'In Stock' },
  { id: 14, sku: 'INS-RCK-50MM', name: 'Rockwool Insulation 50mm', category: 'Insulation', unit: 'Roll', stock: 28, minStock: 15, reorderPoint: 20, price: 385000, hazmat: false, heatNumber: null, location: 'WH-G1', status: 'In Stock' },
  { id: 15, sku: 'VLV-GTR-DN50', name: 'Gate Valve DN50 PN16', category: 'Valves & Fittings', unit: 'Pcs', stock: 18, minStock: 8, reorderPoint: 12, price: 1650000, hazmat: false, heatNumber: null, location: 'WH-D2', status: 'In Stock' },
];

export const categories = ['All Categories', 'Steel Plates', 'Welding Consumables', 'Paint & Coating', 'Piping', 'Fasteners', 'Gas & Chemicals', 'Electrical', 'Insulation', 'Valves & Fittings'];

export const projects = [
  { id: 'H-2026-001', name: 'Hull 001 - MV Pacific Explorer', type: 'Bulk Carrier', status: 'In Progress', completion: 72 },
  { id: 'H-2026-002', name: 'Hull 002 - MT Ocean Star', type: 'Oil Tanker', status: 'In Progress', completion: 45 },
  { id: 'H-2026-003', name: 'Hull 003 - KM Nusantara Pride', type: 'Passenger Ferry', status: 'In Progress', completion: 28 },
  { id: 'H-2026-004', name: 'Hull 004 - TB Samudra 12', type: 'Tugboat', status: 'Planning', completion: 5 },
  { id: 'DR-2026-001', name: 'Drydock - MV Garuda Express', type: 'Container Ship', status: 'In Drydock', completion: 60 },
  { id: 'DR-2026-002', name: 'Drydock - KM Bahari Jaya', type: 'General Cargo', status: 'In Drydock', completion: 85 },
];

export const transactions = [
  { id: 'TRX-0001', type: 'receipt', sku: 'PLT-AH36-1020', material: 'Steel Plate AH36 10mm', qty: 50, project: null, user: 'Citra Dewi', date: '2026-05-02 09:30', vendor: 'PT Krakatau Steel', poNumber: 'PO-2026-0112' },
  { id: 'TRX-0002', type: 'issue', sku: 'WLD-E7018-350', material: 'Welding Electrode E7018 3.2mm', qty: 25, project: 'H-2026-001', user: 'Citra Dewi', date: '2026-05-02 08:15', vendor: null, poNumber: null },
  { id: 'TRX-0003', type: 'issue', sku: 'PNT-EPX-MAR20', material: 'Marine Epoxy Primer 20L', qty: 5, project: 'DR-2026-001', user: 'Citra Dewi', date: '2026-05-01 16:45', vendor: null, poNumber: null },
  { id: 'TRX-0004', type: 'receipt', sku: 'BLT-HEX-M20', material: 'Hex Bolt M20x60 Grade 8.8', qty: 500, project: null, user: 'Citra Dewi', date: '2026-05-01 14:20', vendor: 'PT Baja Utama', poNumber: 'PO-2026-0108' },
  { id: 'TRX-0005', type: 'issue', sku: 'PLT-DH36-1620', material: 'Steel Plate DH36 16mm', qty: 8, project: 'H-2026-002', user: 'Citra Dewi', date: '2026-05-01 11:00', vendor: null, poNumber: null },
  { id: 'TRX-0006', type: 'scrap', sku: 'PLT-AH36-1020', material: 'Steel Plate AH36 10mm', qty: 3, project: 'H-2026-001', user: 'Citra Dewi', date: '2026-05-01 09:30', vendor: null, poNumber: null },
  { id: 'TRX-0007', type: 'receipt', sku: 'GAS-OXY-50L', material: 'Oxygen Gas 50L Cylinder', qty: 10, project: null, user: 'Citra Dewi', date: '2026-04-30 15:00', vendor: 'PT Gas Industri', poNumber: 'PO-2026-0105' },
  { id: 'TRX-0008', type: 'issue', sku: 'CBL-PWR-35MM', material: 'Power Cable XLPE 35mm²', qty: 100, project: 'H-2026-003', user: 'Citra Dewi', date: '2026-04-30 10:30', vendor: null, poNumber: null },
  { id: 'TRX-0009', type: 'issue', sku: 'PPE-PIP-SCH40', material: 'Pipe Schedule 40 6inch', qty: 12, project: 'H-2026-001', user: 'Citra Dewi', date: '2026-04-29 14:00', vendor: null, poNumber: null },
  { id: 'TRX-0010', type: 'receipt', sku: 'WLD-E7018-400', material: 'Welding Electrode E7018 4.0mm', qty: 100, project: null, user: 'Citra Dewi', date: '2026-04-29 09:00', vendor: 'PT Lincoln Electric', poNumber: 'PO-2026-0101' },
];

export const approvals = [
  { id: 'APR-001', type: 'Purchase Request', title: 'PR - Steel Plate AH36 20mm (100 sheets)', requester: 'Budi Santoso', date: '2026-05-02', amount: 285000000, priority: 'high', status: 'pending' },
  { id: 'APR-002', type: 'Material Allocation', title: 'Allocate Welding Rods to Hull 002', requester: 'Dedi Kurniawan', date: '2026-05-01', amount: null, priority: 'medium', status: 'pending' },
  { id: 'APR-003', type: 'Purchase Request', title: 'PR - Antifouling Paint Red 20L (30 pails)', requester: 'Fitri Handayani', date: '2026-05-01', amount: 55500000, priority: 'high', status: 'pending' },
  { id: 'APR-004', type: 'Scrap Disposal', title: 'Dispose 500kg scrap steel from Hull 001', requester: 'Citra Dewi', date: '2026-04-30', amount: null, priority: 'low', status: 'pending' },
  { id: 'APR-005', type: 'Purchase Request', title: 'PR - Acetylene Gas 50L (20 cylinders)', requester: 'Fitri Handayani', date: '2026-04-30', amount: 9000000, priority: 'medium', status: 'pending' },
  { id: 'APR-006', type: 'Material Allocation', title: 'Hard Allocation - SS316L for Hull 003', requester: 'Hendra Susanto', date: '2026-04-29', amount: null, priority: 'high', status: 'pending' },
  { id: 'APR-007', type: 'Tool Request', title: 'Portable Welder for Drydock area', requester: 'Budi Santoso', date: '2026-04-29', amount: null, priority: 'medium', status: 'pending' },
  { id: 'APR-008', type: 'Purchase Request', title: 'PR - Power Cable XLPE 35mm² (1000m)', requester: 'Hendra Susanto', date: '2026-04-28', amount: 125000000, priority: 'low', status: 'pending' },
];

export const tools = [
  { id: 1, name: 'Portable Welder 500A', sku: 'TL-WLD-500A', category: 'Welding', status: 'Available', condition: 'Good', location: 'Tool Room A', borrower: null, borrowDate: null, calibrationDue: '2026-06-15', image: null },
  { id: 2, name: 'Laser Alignment Pro X', sku: 'TL-LSR-PRX', category: 'Measurement', status: 'In Use', condition: 'Good', location: 'Hull 001', borrower: 'Budi Santoso', borrowDate: '2026-04-28', calibrationDue: '2026-05-10', image: null },
  { id: 3, name: 'Hydraulic Torque Wrench', sku: 'TL-HYD-TW1', category: 'Fastening', status: 'Available', condition: 'Good', location: 'Tool Room A', borrower: null, borrowDate: null, calibrationDue: '2026-07-20', image: null },
  { id: 4, name: 'Ultrasonic Thickness Gauge', sku: 'TL-UTG-001', category: 'Measurement', status: 'In Use', condition: 'Good', location: 'Drydock Area', borrower: 'Dedi Kurniawan', borrowDate: '2026-05-01', calibrationDue: '2026-05-30', image: null },
  { id: 5, name: 'Plasma Cutter CNC 120A', sku: 'TL-PLS-120', category: 'Cutting', status: 'Maintenance', condition: 'Needs Repair', location: 'Workshop B', borrower: null, borrowDate: null, calibrationDue: '2026-05-05', image: null },
  { id: 6, name: 'Magnetic Drill Press', sku: 'TL-MAG-DP1', category: 'Drilling', status: 'Available', condition: 'Good', location: 'Tool Room B', borrower: null, borrowDate: null, calibrationDue: '2026-08-01', image: null },
  { id: 7, name: 'Oxy-Fuel Cutting Set', sku: 'TL-OXF-SET', category: 'Cutting', status: 'In Use', condition: 'Good', location: 'Hull 002', borrower: 'Eka Prasetya', borrowDate: '2026-04-30', calibrationDue: '2026-09-15', image: null },
  { id: 8, name: 'Portable Generator 10KVA', sku: 'TL-GEN-10K', category: 'Power', status: 'Available', condition: 'Good', location: 'Yard Storage', borrower: null, borrowDate: null, calibrationDue: null, image: null },
];

export const activityLog = [
  { id: 1, action: 'User Login', user: 'Ahmad Fauzi', detail: 'Logged in from 192.168.1.45', time: '2026-05-02 09:15', type: 'info' },
  { id: 2, action: 'Material Created', user: 'Citra Dewi', detail: 'Added new material: Gate Valve DN50 PN16', time: '2026-05-02 08:45', type: 'success' },
  { id: 3, action: 'Goods Receipt', user: 'Citra Dewi', detail: 'Received 50 sheets Steel Plate AH36 10mm', time: '2026-05-02 08:30', type: 'success' },
  { id: 4, action: 'Role Changed', user: 'Ahmad Fauzi', detail: 'Changed Eka Prasetya role to Inactive', time: '2026-05-01 16:30', type: 'warning' },
  { id: 5, action: 'Low Stock Alert', user: 'System', detail: 'Acetylene Gas 50L below minimum threshold', time: '2026-05-01 15:00', type: 'danger' },
  { id: 6, action: 'Goods Issue', user: 'Citra Dewi', detail: 'Issued 8 sheets DH36 16mm to Hull 002', time: '2026-05-01 11:00', type: 'info' },
  { id: 7, action: 'PR Submitted', user: 'Fitri Handayani', detail: 'Submitted PR for Antifouling Paint', time: '2026-05-01 10:30', type: 'info' },
  { id: 8, action: 'System Backup', user: 'System', detail: 'Automated daily backup completed', time: '2026-05-01 02:00', type: 'success' },
  { id: 9, action: 'Tool Checkout', user: 'Dedi Kurniawan', detail: 'Checked out Ultrasonic Thickness Gauge', time: '2026-05-01 08:00', type: 'info' },
  { id: 10, action: 'Stock Alert', user: 'System', detail: 'Antifouling Paint Red Out of Stock', time: '2026-04-30 16:00', type: 'danger' },
];

export const purchaseOrders = [
  { id: 'PO-2026-0112', vendor: 'PT Krakatau Steel', date: '2026-04-25', status: 'Partially Received', items: [
    { sku: 'PLT-AH36-1020', name: 'Steel Plate AH36 10mm', ordered: 100, received: 50, unit: 'Sheet' },
    { sku: 'PLT-AH36-1220', name: 'Steel Plate AH36 12mm', ordered: 60, received: 0, unit: 'Sheet' },
  ]},
  { id: 'PO-2026-0108', vendor: 'PT Baja Utama', date: '2026-04-20', status: 'Completed', items: [
    { sku: 'BLT-HEX-M20', name: 'Hex Bolt M20x60 Grade 8.8', ordered: 500, received: 500, unit: 'Pcs' },
  ]},
  { id: 'PO-2026-0105', vendor: 'PT Gas Industri', date: '2026-04-18', status: 'Completed', items: [
    { sku: 'GAS-OXY-50L', name: 'Oxygen Gas 50L Cylinder', ordered: 10, received: 10, unit: 'Cylinder' },
    { sku: 'GAS-ACT-50L', name: 'Acetylene Gas 50L Cylinder', ordered: 15, received: 0, unit: 'Cylinder' },
  ]},
];

export const vendors = [
  { id: 1, name: 'PT Krakatau Steel', contact: 'Agus Hermawan', phone: '021-5551234' },
  { id: 2, name: 'PT Baja Utama', contact: 'Rudi Setiawan', phone: '031-7778899' },
  { id: 3, name: 'PT Gas Industri', contact: 'Sari Mulyani', phone: '021-3334455' },
  { id: 4, name: 'PT Lincoln Electric', contact: 'Tommy Halim', phone: '021-6667788' },
  { id: 5, name: 'PT Jotun Indonesia', contact: 'Dewi Anggraeni', phone: '021-8889900' },
];

export const chartData = {
  inventoryTrend: [
    { date: 'Apr 26', inbound: 45, outbound: 32 },
    { date: 'Apr 27', inbound: 28, outbound: 41 },
    { date: 'Apr 28', inbound: 55, outbound: 38 },
    { date: 'Apr 29', inbound: 32, outbound: 45 },
    { date: 'Apr 30', inbound: 48, outbound: 29 },
    { date: 'May 01', inbound: 62, outbound: 51 },
    { date: 'May 02', inbound: 38, outbound: 22 },
  ],
  categoryDistribution: [
    { name: 'Steel Plates', value: 35 },
    { name: 'Welding', value: 20 },
    { name: 'Paint & Coating', value: 15 },
    { name: 'Piping', value: 12 },
    { name: 'Electrical', value: 10 },
    { name: 'Others', value: 8 },
  ],
};

export const notifications = [
  { id: 1, title: 'Low Stock Alert', message: 'Acetylene Gas 50L is below minimum threshold (8/10)', type: 'warning', time: '5 min ago', read: false },
  { id: 2, title: 'Out of Stock', message: 'Antifouling Paint Red 20L is out of stock', type: 'danger', time: '2 hours ago', read: false },
  { id: 3, title: 'PR Approved', message: 'Purchase Request PO-2026-0112 has been approved', type: 'success', time: '3 hours ago', read: true },
  { id: 4, title: 'Tool Calibration Due', message: 'Laser Alignment Pro X calibration due on May 10', type: 'warning', time: '1 day ago', read: true },
  { id: 5, title: 'New User Registration', message: 'Hendra Susanto requested Supervisor access', type: 'info', time: '2 days ago', read: true },
];
