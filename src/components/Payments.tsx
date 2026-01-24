import { useState, useEffect } from 'react';
import { Receipt, Search, Plus, X, Edit2, Trash2, Loader, MoreVertical } from 'lucide-react';
import { fetchPayments, createPayment, updatePayment, deletePayment, Payment } from '../services/paymentsService';

type ModalType = 'none' | 'add' | 'edit' | 'delete';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({
    guestName: '',
    amount: 0,
    method: '',
    date: '',
    status: 'Paid',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    const data = await fetchPayments();
    setPayments(data);
    setLoading(false);
  };

  const handleAddPayment = async () => {
    if (!formData.guestName || !formData.amount || !formData.method || !formData.date) return;
    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      guestId: '',
      guestName: formData.guestName,
      amount: Number(formData.amount),
      method: formData.method,
      date: formData.date,
      status: formData.status || 'Paid',
    };
    await createPayment(newPayment);
    setActiveModal('none');
    loadPayments();
  };

  const handleEditPayment = async () => {
    if (!selectedPayment) return;
    await updatePayment(selectedPayment.id, formData);
    setActiveModal('none');
    setSelectedPayment(null);
    loadPayments();
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    await deletePayment(selectedPayment.id);
    setActiveModal('none');
    setSelectedPayment(null);
    loadPayments();
  };

  const filteredPayments = payments.filter(p =>
    p.guestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6" /> Payments
        </h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
          onClick={() => {
            setActiveModal('add');
            setFormData({ guestName: '', amount: 0, method: '', date: '', status: 'Paid' });
          }}
        >
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by guest name..."
          className="border rounded px-3 py-2 w-64"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">Guest</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Method</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8"><Loader className="animate-spin mx-auto" /></td></tr>
            ) : filteredPayments.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No payments found.</td></tr>
            ) : (
              filteredPayments.map(payment => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{payment.guestName}</td>
                  <td className="py-2 px-4">₹{payment.amount}</td>
                  <td className="py-2 px-4">{payment.method}</td>
                  <td className="py-2 px-4">{payment.date}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${payment.status === 'Paid' ? 'bg-green-100 text-green-700' : payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{payment.status}</span>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="p-1 hover:bg-gray-200 rounded" onClick={() => { setActiveModal('edit'); setSelectedPayment(payment); setFormData(payment); }}><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded" onClick={() => { setActiveModal('delete'); setSelectedPayment(payment); }}><Trash2 className="w-4 h-4 text-red-500" /></button>
                    <button className="p-1 hover:bg-gray-200 rounded"><MoreVertical className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modals for Add/Edit/Delete */}
      {activeModal === 'add' && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Payment</h2>
              <button onClick={() => setActiveModal('none')}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input className="w-full border rounded px-3 py-2" placeholder="Guest Name" value={formData.guestName || ''} onChange={e => setFormData(f => ({ ...f, guestName: e.target.value }))} />
              <input className="w-full border rounded px-3 py-2" placeholder="Amount" type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
              <input className="w-full border rounded px-3 py-2" placeholder="Method" value={formData.method || ''} onChange={e => setFormData(f => ({ ...f, method: e.target.value }))} />
              <input className="w-full border rounded px-3 py-2" placeholder="Date" type="date" value={formData.date || ''} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
              <select className="w-full border rounded px-3 py-2" value={formData.status || 'Paid'} onChange={e => setFormData(f => ({ ...f, status: e.target.value as any }))}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setActiveModal('none')}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleAddPayment}>Add</button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'edit' && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Payment</h2>
              <button onClick={() => setActiveModal('none')}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input className="w-full border rounded px-3 py-2" placeholder="Guest Name" value={formData.guestName || ''} onChange={e => setFormData(f => ({ ...f, guestName: e.target.value }))} />
              <input className="w-full border rounded px-3 py-2" placeholder="Amount" type="number" value={formData.amount || ''} onChange={e => setFormData(f => ({ ...f, amount: Number(e.target.value) }))} />
              <input className="w-full border rounded px-3 py-2" placeholder="Method" value={formData.method || ''} onChange={e => setFormData(f => ({ ...f, method: e.target.value }))} />
              <input className="w-full border rounded px-3 py-2" placeholder="Date" type="date" value={formData.date || ''} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
              <select className="w-full border rounded px-3 py-2" value={formData.status || 'Paid'} onChange={e => setFormData(f => ({ ...f, status: e.target.value as any }))}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setActiveModal('none')}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleEditPayment}>Save</button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'delete' && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Delete Payment</h2>
              <button onClick={() => setActiveModal('none')}><X className="w-5 h-5" /></button>
            </div>
            <p>Are you sure you want to delete payment for <b>{selectedPayment.guestName}</b>?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setActiveModal('none')}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={handleDeletePayment}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
