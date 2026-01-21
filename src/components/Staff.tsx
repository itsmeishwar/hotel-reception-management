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

  DollarSign,
  Download,
  CheckCircle,
  Filter,
  ClipboardList,
  Sparkles,
  BedDouble,
  UserCheck
} from 'lucide-react';
import { 
  fetchStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
 
} from '../services/staffService';
import type { Staff,  } from '../services/staffService';

const StaffPage = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({
    name: '',
    role: 'Receptionist',
    email: '',
    phone: '',
    status: 'Active',
    salary: 0,
    shift: 'Morning',
    dateJoined: new Date().toISOString().split('T')[0]
  });

  // New State Variables
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'salary' | 'dateJoined'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const staffData = await fetchStaff();
      setStaffList(staffData);
    } catch (error) {
      console.error("Failed to load staff data", error);
    } finally {
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Handle save function with toast
  const handleSaveWithToast = async () => {
    try {
      if (selectedStaff) {
        await updateStaff(selectedStaff.id, formData);
        showToast('Staff member updated successfully');
      } else {
        await createStaff(formData as Omit<Staff, 'id'>);
        showToast('New staff member added successfully');
      }
      await loadData();
      closeModal();
    } catch (error) {
      console.error("Error saving staff:", error);
      showToast('Failed to save staff member');
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    try {
      await deleteStaff(selectedStaff.id);
      await loadData();
      closeModal();
      showToast('Staff member deleted successfully');
    } catch (error) {
      console.error("Error deleting staff:", error);
      showToast('Failed to delete staff member');
    }
  };

  // Handle bulk selection
  const toggleSelectRow = (staffId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(staffId)) {
      newSelected.delete(staffId);
    } else {
      newSelected.add(staffId);
    }
    setSelectedRows(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAllRows = () => {
    if (selectedRows.size === filteredStaff.length) {
      setSelectedRows(new Set());
      setShowBulkActions(false);
    } else {
      const allIds = new Set(filteredStaff.map(staff => staff.id));
      setSelectedRows(allIds);
      setShowBulkActions(true);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedRows.size === 0) return;

    try {
      switch (action) {
        case 'delete':
          const deletePromises = Array.from(selectedRows).map(id => deleteStaff(id));
          await Promise.all(deletePromises);
          showToast(`${selectedRows.size} staff members deleted successfully`);
          break;
        case 'activate':
          const activatePromises = Array.from(selectedRows).map(id => 
            updateStaff(id, { status: 'Active' })
          );
          await Promise.all(activatePromises);
          showToast(`${selectedRows.size} staff members activated`);
          break;
        case 'deactivate':
          const deactivatePromises = Array.from(selectedRows).map(id => 
            updateStaff(id, { status: 'Inactive' })
          );
          await Promise.all(deactivatePromises);
          showToast(`${selectedRows.size} staff members deactivated`);
          break;
      }
      
      await loadData();
      setSelectedRows(new Set());
      setShowBulkActions(false);
      setBulkAction('');
    } catch (error) {
      console.error("Bulk action failed:", error);
      showToast("Failed to perform bulk action");
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Role', 'Email', 'Phone', 'Status', 'Shift', 'Salary', 'Date Joined'];
    const csvData = filteredStaff.map(staff => [
      staff.name,
      staff.role,
      staff.email,
      staff.phone,
      staff.status,
      staff.shift,
      `₹${staff.salary}`,
      staff.dateJoined
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `staff-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Staff list exported successfully');
  };

  const openAddModal = () => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      role: 'Receptionist',
      email: '',
      phone: '',
      status: 'Active',
      salary: 0,
      shift: 'Morning',
      dateJoined: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData(staff);
    setShowModal(true);
  };

  const openDeleteModal = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setSelectedStaff(null);
  };

  // Filter staff
  const filteredStaff = staffList.filter(staff => {
    if (searchTerm && !staff.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !staff.role.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !staff.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && staff.status !== statusFilter) return false;
    if (activeTab === 'active' && staff.status !== 'Active') return false;
    if (activeTab === 'onLeave' && staff.status !== 'On Leave') return false;
    return true;
  });

  // Sort staff
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'role':
        aValue = a.role.toLowerCase();
        bValue = b.role.toLowerCase();
        break;
      case 'salary':
        aValue = a.salary;
        bValue = b.salary;
        break;
      case 'dateJoined':
        aValue = new Date(a.dateJoined).getTime();
        bValue = new Date(b.dateJoined).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700';
      case 'On Leave': return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700';
      case 'Inactive': return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'Morning': return 'text-blue-600 bg-blue-50';
      case 'Evening': return 'text-purple-600 bg-purple-50';
      case 'Night': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate department counts
  const receptionCount = staffList.filter(s => s.role === 'Receptionist').length;
  const housekeepingCount = staffList.filter(s => s.role === 'Housekeeping').length;
  const tasksAssigned = staffList.filter(s => s.status === 'Active').length * 3;
  const roomsCleaned = housekeepingCount * 5;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FF8C42]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FF8C42] rounded-full animate-spin border-t-transparent"></div>
          <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#FF8C42]" size={24} />
        </div>
        <span className="mt-4 text-gray-600 font-medium">Loading staff data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">Manage your hotel employees and schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <UserCheck size={24} className="text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{receptionCount}</div>
          <div className="text-sm text-gray-600">Reception Staff</div>
          <div className="mt-3 text-xs text-blue-600 font-medium">Front Desk Team</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles size={24} className="text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{housekeepingCount}</div>
          <div className="text-sm text-gray-600">Cleaning Staff</div>
          <div className="mt-3 text-xs text-green-600 font-medium">Housekeeping Team</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
              <BedDouble size={24} className="text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{roomsCleaned}</div>
          <div className="text-sm text-gray-600">Rooms Cleaned</div>
          <div className="mt-3 text-xs text-purple-600 font-medium">Today's Progress</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
              <ClipboardList size={24} className="text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{tasksAssigned}</div>
          <div className="text-sm text-gray-600">Tasks Assigned</div>
          <div className="mt-3 text-xs text-orange-600 font-medium">Active Tasks</div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1">
          {['all', 'active', 'onLeave', 'recent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab === 'all' && 'All Staff'}
              {tab === 'active' && 'Active'}
              {tab === 'onLeave' && 'On Leave'}
              {tab === 'recent' && 'Recently Joined'}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 relative max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search staff by name, role, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42] bg-white shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 bg-white"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredStaff.length} {filteredStaff.length === 1 ? 'employee' : 'employees'} found
                  {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
                </p>
              </div>
              {showBulkActions && (
                <div className="flex items-center gap-2 ml-4">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={() => bulkAction && handleBulkAction(bulkAction)}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRows(new Set());
                      setShowBulkActions(false);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Updated just now
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                >
                  <option value="name">Name</option>
                  <option value="role">Role</option>
                  <option value="salary">Salary</option>
                  <option value="dateJoined">Date Joined</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No employees match your current filters. Try adjusting your search or add a new staff member.
            </p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Staff Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredStaff.length && filteredStaff.length > 0}
                      onChange={selectAllRows}
                      className="rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42]/30"
                    />
                  </th>
                  {['Employee', 'Contact', 'Role', 'Shift', 'Status', 'Salary', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className={`hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all ${
                      selectedRows.has(staff.id) ? 'bg-gradient-to-r from-blue-50/50 to-blue-100/50' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(staff.id)}
                        onChange={() => toggleSelectRow(staff.id)}
                        className="rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42]/30"
                      />
                    </td>

                    {/* Employee Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] flex items-center justify-center text-white text-lg font-bold shadow-sm">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Joined: {staff.dateJoined}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900 truncate max-w-[150px]">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{staff.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{staff.role}</span>
                      </div>
                    </td>

                    {/* Shift Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${getShiftColor(staff.shift)}`}>
                        {staff.shift} Shift
                      </span>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium ${getStatusColor(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>

                    {/* Salary Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        ₹{staff.salary.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Monthly</div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all"
                          title="Edit Staff"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(staff)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedStaff ? 'Edit Staff Member' : 'Add New Staff'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedStaff ? 'Update employee details' : 'Enter new employee information'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSaveWithToast(); }} className="p-8 space-y-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as Staff['role']})}
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      required
                    >
                      <option value="Manager">Manager</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Chef">Chef</option>
                      <option value="Waiter">Waiter</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      placeholder="employee@hotel.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      placeholder="+91 1234567890"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                    <Briefcase size={20} />
                    Employment Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as Staff['status']})}
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Shift Schedule
                      </label>
                      <select
                        value={formData.shift}
                        onChange={(e) => setFormData({...formData, shift: e.target.value as Staff['shift']})}
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                      >
                        <option value="Morning">Morning Shift</option>
                        <option value="Evening">Evening Shift</option>
                        <option value="Night">Night Shift</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Salary & Joining
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Monthly Salary (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        placeholder="50000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Date Joined
                      </label>
                      <input
                        type="date"
                        value={formData.dateJoined}
                        onChange={(e) => setFormData({...formData, dateJoined: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  {selectedStaff ? 'Save Changes' : 'Add New Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Staff Member
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedStaff.name}</span>? This action cannot be undone and all associated data will be permanently removed.
              </p>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {selectedStaff.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedStaff.name}</div>
                    <div className="text-sm text-gray-600">{selectedStaff.role} • {selectedStaff.email}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      <div className={`fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 ${showSuccessToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-white" />
          <div>
            <div className="font-semibold">Success!</div>
            <div className="text-sm text-green-100">{toastMessage}</div>
          </div>
          <button 
            onClick={() => setShowSuccessToast(false)}
            className="ml-4 p-1 hover:bg-white/20 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;