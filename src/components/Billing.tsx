import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Briefcase,
  X,
  Edit2,
  Trash2,
  Loader,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { 
  fetchStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  fetchStaffStats 
} from '../services/staffService';
import type { Staff, StaffStats } from '../services/staffService';
type ModalType = 'none' | 'add' | 'edit' | 'delete';
const StaffPage = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'Receptionist',
    email: '',
    phone: '',
    status: 'Active',
    salary: 0,
    shift: 'Morning',
    dateJoined: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffData, statsData] = await Promise.all([
        fetchStaff(),
        fetchStaffStats()
      ]);
      setStaffList(staffData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load staff data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (activeModal === 'add') {
        const staffData = {
           ...formData,
           dateJoined: formData.dateJoined || new Date().toISOString().split('T')[0]
        };
        await createStaff(staffData as Omit<Staff, 'id'>);
      } else if (activeModal === 'edit' && selectedStaff) {
        await updateStaff(selectedStaff.id, formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving staff:", error);
      alert("Failed to save staff member");
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff.id);
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error deleting staff:", error);
      alert("Failed to delete staff member");
    }
  };

  const resetForm = () => {
    setActiveModal('none');
    setSelectedStaff(null);
    setFormData({
      name: '',
      role: 'Receptionist',
      email: '',
      phone: '',
      status: 'Active',
      salary: 0,
      shift: 'Morning',
      dateJoined: ''
    });
  };

  const openEditModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData(staff);
    setActiveModal('edit');
  };

  const openDeleteModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setActiveModal('delete');
  };

  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'On Leave': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Inactive': return 'bg-gray-100 text-gray-700 border border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={32} className="animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
        <p className="text-gray-600">Manage your employees, roles, and schedules</p>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
          <div className="relative w-full md:w-auto md:flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, role, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setActiveModal('add')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            <Plus size={20} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Staff</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.totalStaff || 0}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.active || 0}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Users size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">On Leave</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.onLeave || 0}</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Users size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inactive</p>
              {/* <h3 className="text-2xl font-bold text-gray-900">{stats?.inactive || 0}</h3> */}
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{staff.name}</h3>
                  <p className="text-sm text-gray-600">{staff.role}</p>
                </div>
              </div>
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={20} className="text-gray-500" />
                </button>
                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                  <button 
                    onClick={() => openEditModal(staff)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => openDeleteModal(staff)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-700 truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-700">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Briefcase size={16} className="text-gray-400" />
                <span className="text-gray-700">{staff.shift} Shift</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(staff.status)}`}>
                {staff.status}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                {staff.dateJoined}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or add a new employee</p>
          <button 
            onClick={() => setActiveModal('add')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Employee
          </button>
        </div>
      )}

      {/* Modals */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {activeModal === 'delete' ? (
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Staff Member</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to remove {selectedStaff?.name}? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={resetForm}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {activeModal === 'add' ? 'Add Employee' : 'Edit Employee'}
                  </h3>
                  <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value as Staff['role']})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Manager">Manager</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Chef">Chef</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Security">Security</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as Staff['status']})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@hotel.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                      <select
                        value={formData.shift}
                        onChange={(e) => setFormData({...formData, shift: e.target.value as Staff['shift']})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salary (₹)</label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 p-6 border-t border-gray-200">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    {activeModal === 'add' ? 'Add Employee' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;