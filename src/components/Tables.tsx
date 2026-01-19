import { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  User, 
  Calendar,
  Coffee,
  Loader,
  X,
  Edit, 
  Trash2,
  Receipt,
  Printer
} from 'lucide-react';
import { 
  fetchTables, 
  fetchTableStats, 
  createTable, 
  updateTable, 
  deleteTable 
} from '../services/tableService';
import { fetchCafeOrders } from '../services/cafeService';
import type { Table, TableStats } from '../services/tableService';
import type { CafeOrder } from '../services/cafeService';

const OrderBill = ({ order, ref }: { order: CafeOrder, ref: any }) => (
  <div ref={ref} className="p-4 bg-white text-black font-mono text-xs max-w-[300px] mx-auto print:max-w-full print:w-full print:p-0 leading-tight">
    <div className="text-center border-b border-black border-dashed pb-2 mb-2">
      <h2 className="text-lg font-bold uppercase tracking-wider mb-1">Hotel Luxe</h2>
      <p>123 Street Name, City</p>
      <p>Tel: +123 456 7890</p>
    </div>
    
    <div className="mb-2">
      <div className="flex justify-between">
        <span>Ord: #{order.id}</span>
        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>
      <div>
        {order.tableNumber && <span>Tbl: {order.tableNumber}</span>}
        {order.roomNumber && <span className="ml-2">Rm: {order.roomNumber}</span>}
      </div>
      <div>Svr: {order.servedBy || 'Staff'}</div>
    </div>

    <table className="w-full mb-2">
      <thead className="border-b border-black border-dashed">
        <tr>
          <th className="text-left py-1">Item</th>
          <th className="text-right py-1 w-8">Qty</th>
          <th className="text-right py-1 w-12">Amt</th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((item, idx) => (
          <tr key={idx}>
            <td className="py-1 pr-1 truncate max-w-[120px]">{item.foodItemName}</td>
            <td className="text-right py-1 align-top">{item.quantity}</td>
            <td className="text-right py-1 align-top">{(item.price * item.quantity).toFixed(0)}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="space-y-1 border-t border-black border-dashed pt-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{order.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (13%)</span>
        <span>{order.tax.toFixed(2)}</span>
      </div>
       {order.discount > 0 && (
         <div className="flex justify-between">
          <span>Disc</span>
          <span>-{order.discount.toFixed(2)}</span>
        </div>
       )}
      <div className="flex justify-between text-base font-bold border-t border-black border-dashed pt-1 mt-1">
        <span>Total</span>
        <span>{order.total.toFixed(2)}</span>
      </div>
    </div>

    <div className="text-center mt-4 pt-2 border-t border-black border-dashed">
      <p>Thank you!</p>
      <p>Use Code: LUXE5 for 5% off next visit</p>
    </div>
  </div>
);

const Tables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, CafeOrder>>({});
  const [stats, setStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveZone] = useState<string>('All');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CafeOrder | null>(null);
  
  const [formData, setFormData] = useState<Partial<Table>>({
    tableNumber: '',
    name: '',
    capacity: 2,
    status: 'available',
    section: 'Main Hall',
    zone: 'main_hall'
  });

  const billRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = billRef.current?.innerHTML;
    if (content) {
        const printWindow = window.open('', '', 'height=600,width=400'); // open smaller window
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Bill</title>');
            // Inject Tailwind text CSS + custom print styles
            printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
            printWindow.document.write(`
              <style>
                @media print {
                  @page { margin: 0; size: 80mm auto; } /* Set paper size to 80mm width */
                  body { margin: 0; padding: 10px; width: 80mm; font-family: monospace; }
                  html, body { height: auto; }
                }
                body { font-family: monospace; }
              </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close(); 
            printWindow.focus(); 
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    }
  };


  const zones = ['All', 'Main Hall', 'Garden', 'Rooftop'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tableData, statsData, ordersData] = await Promise.all([
        fetchTables(),
        fetchTableStats(),
        fetchCafeOrders()
      ]);
      setTables(tableData);
      setStats(statsData);

      // Map active orders to tables
      const orderMap: Record<string, CafeOrder> = {};
      ordersData.forEach(order => {
        if (order.tableId && 
           (order.status === 'pending' || order.status === 'preparing' || order.status === 'served' || order.status === 'ready')
        ) {
          orderMap[order.tableId] = order;
        }
      });
      setActiveOrders(orderMap);

    } catch (error) {
      console.error("Failed to load tables", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = activeZone === 'All' 
    ? tables 
    : tables.filter(t => t.section === activeZone);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-orange-500';
      case 'occupied': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingTable) {
              await updateTable(editingTable.id, formData);
          } else {
              await createTable(formData as Omit<Table, 'id'>);
          }
          closeModal();
          loadData();
      } catch (error) {
          console.error("Error saving table", error);
      }
  };

  const handleDelete = async () => {
      if (deletingTableId) {
          await deleteTable(deletingTableId);
          setIsDeleteConfirmOpen(false);
          setDeletingTableId(null);
          loadData();
      }
  };

  const openAddModal = () => {
      setEditingTable(null);
      setFormData({
        tableNumber: '',
        name: '',
        capacity: 2,
        status: 'available',
        section: 'Main Hall',
        zone: 'main_hall'
      });
      setIsModalOpen(true);
  };

  const openEditModal = (table: Table) => {
      setEditingTable(table);
      setFormData(table);
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingTable(null);
  };
  
  const handleTableClick = (table: Table) => {
      if (activeOrders[table.id]) {
          setSelectedOrder(activeOrders[table.id]);
      } else {
          // If no order, maybe allow creating one?
          // For now just focus on showing existing orders as requested
      }
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <Loader size={32} className="text-orange-500 animate-spin" />
          </div>
      );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-500">Real-time restaurant floor plan</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Calendar size={18} />
            Reservations
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={18} />
            Add Table
          </button>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeZone === zone
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-medium">Available ({stats.available})</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="font-medium">Occupied ({stats.occupied})</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="font-medium">Reserved ({stats.reserved})</span>
            </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-100">
              <User size={14} />
              <span className="font-medium">Total Capacity ({stats.totalCapacity})</span>
            </div>
          </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredTables.map(table => {
            const hasOrder = !!activeOrders[table.id];
            const order = activeOrders[table.id];
            
            return (
              <div 
                key={table.id} 
                onClick={() => handleTableClick(table)}
                className={`group relative bg-white aspect-square rounded-2xl border-2 transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center p-4 cursor-pointer
                    ${hasOrder ? 'border-blue-200 hover:border-blue-400' : 'border-gray-100 hover:border-orange-500/50'}
                `}
              >
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getStatusColor(hasOrder ? 'occupied' : table.status)}`} />
                
                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(table); }}
                        className="p-1 rounded bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600"
                    >
                        <Edit size={14} />
                    </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); setDeletingTableId(table.id); setIsDeleteConfirmOpen(true); }}
                        className="p-1 rounded bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                  {hasOrder ? <Receipt size={32} className="text-blue-500" /> : <Coffee size={32} className="text-gray-400 group-hover:text-orange-500 transition-colors" />}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">{table.name || `Table ${table.tableNumber}`}</h3>
                
                {hasOrder ? (
                    <div className="text-center">
                        <p className="text-xs font-bold text-blue-600">₹{order.total.toFixed(0)}</p>
                        <p className="text-[10px] text-gray-500">{order.items.length} items</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <User size={14} />
                        <span>{table.capacity} Seats</span>
                    </div>
                )}
                
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md mt-1">{table.section}</span>
              </div>
            );
        })}
        
        {/* Add New Placeholders */}
        <button 
            onClick={openAddModal}
            className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer aspect-square"
        >
          <Plus size={32} />
          <span className="text-sm font-medium mt-2">Add Table</span>
        </button>
      </div>

       {/* Add/Edit Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  value={formData.tableNumber || ''}
                  onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 12"
                />
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. T-12"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity || 0}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={formData.section || 'Main Hall'}
                      onChange={(e) => setFormData({...formData, section: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="Main Hall">Main Hall</option>
                        <option value="Garden">Garden</option>
                        <option value="Rooftop">Rooftop</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status || 'available'}
                      onChange={(e) => setFormData({...formData, status: e.target.value as Table['status']})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                    </select>
                  </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Table</h3>
                    <p className="text-gray-500">Are you sure you want to delete this table? This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Order Bill Modal */}
      {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Receipt size={18} />
                          Table Order
                      </h3>
                      <button 
                          onClick={() => setSelectedOrder(null)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-1">
                      <OrderBill order={selectedOrder} ref={billRef} />
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                      <button 
                          onClick={handlePrint}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                          <Printer size={18} />
                          Print Bill
                      </button>
                       <button 
                          onClick={() => setSelectedOrder(null)}
                          className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Tables;