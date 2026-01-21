import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Lock,
  Edit2,
  Trash2,
  Check,
  X,
  Save,
  AlertCircle,
  UserPlus,
  Users
} from 'lucide-react';

interface Permission {
  id: string;
  label: string;
}

interface Role {
  id: number;
  name: string;
  users: number;
  permissions: string[];
  description?: string;
}

const RolesAccess = () => {
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'Owner', users: 1, permissions: ['all'], description: 'Full system access' },
    { id: 2, name: 'Manager', users: 2, permissions: ['dashboard', 'bookings', 'guests', 'rooms', 'staff', 'reports'], description: 'Management level access' },
    { id: 3, name: 'Receptionist', users: 4, permissions: ['dashboard', 'bookings', 'guests', 'rooms'], description: 'Front desk operations' },
    { id: 4, name: 'Staff', users: 12, permissions: ['dashboard', 'tasks'], description: 'Basic staff access' },
  ]);

  const [selectedRole, setSelectedRole] = useState<Role>(roles[0]);
  const [permissions, ] = useState<Permission[]>([
    { id: 'dashboard', label: 'View Dashboard' },
    { id: 'bookings', label: 'Manage Bookings' },
    { id: 'guests', label: 'Manage Guests' },
    { id: 'rooms', label: 'Manage Rooms' },
    { id: 'staff', label: 'Manage Staff' },
    { id: 'finance', label: 'View Financials' },
    { id: 'reports', label: 'View Reports' },
    { id: 'tasks', label: 'Manage Tasks' },
    { id: 'settings', label: 'System Settings' },
  ]);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    // Save changes to localStorage (or API in real app)
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);

  const handlePermissionToggle = (permissionId: string) => {
    if (selectedRole.name === 'Owner') {
      alert('Owner role has all permissions and cannot be modified');
      return;
    }

    setUnsavedChanges(true);
    
    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    
    // Update in roles array
    setRoles(roles.map(role => 
      role.id === updatedRole.id ? updatedRole : role
    ));
  };

  const handleSaveChanges = () => {
    setUnsavedChanges(false);
    // In a real app, you would save to API here
    console.log('Saved changes:', roles);
    alert('Changes saved successfully!');
  };

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    const newRoleObj: Role = {
      id: roles.length + 1,
      name: newRole.name,
      users: 0,
      permissions: newRole.permissions,
      description: newRole.description,
    };

    setRoles([...roles, newRoleObj]);
    setSelectedRole(newRoleObj);
    setShowCreateModal(false);
    setNewRole({ name: '', description: '', permissions: [] });
    alert(`Role "${newRole.name}" created successfully!`);
  };

  const handleEditRole = (role: Role) => {
    if (role.name === 'Owner') {
      alert('Owner role cannot be edited');
      return;
    }
    setEditingRole({ ...role });
    setShowCreateModal(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    const updatedRoles = roles.map(role => 
      role.id === editingRole.id ? editingRole : role
    );

    setRoles(updatedRoles);
    
    if (selectedRole.id === editingRole.id) {
      setSelectedRole(editingRole);
    }

    setEditingRole(null);
    setShowCreateModal(false);
    alert(`Role "${editingRole.name}" updated successfully!`);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.name === 'Owner') {
      alert('Owner role cannot be deleted');
      return;
    }
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;

    const updatedRoles = roles.filter(role => role.id !== roleToDelete.id);
    setRoles(updatedRoles);
    
    if (selectedRole.id === roleToDelete.id) {
      setSelectedRole(updatedRoles[0]);
    }

    setShowDeleteModal(false);
    setRoleToDelete(null);
    alert(`Role "${roleToDelete.name}" deleted successfully!`);
  };

  const addUserToRole = (roleId: number) => {
    setRoles(roles.map(role => 
      role.id === roleId ? { ...role, users: role.users + 1 } : role
    ));
    
    if (selectedRole.id === roleId) {
      setSelectedRole({ ...selectedRole, users: selectedRole.users + 1 });
    }
  };

  const removeUserFromRole = (roleId: number) => {
    setRoles(roles.map(role => 
      role.id === roleId && role.users > 0 
        ? { ...role, users: role.users - 1 } 
        : role
    ));
    
    if (selectedRole.id === roleId && selectedRole.users > 0) {
      setSelectedRole({ ...selectedRole, users: selectedRole.users - 1 });
    }
  };

  const hasPermission = (role: Role, permissionId: string) => {
    return role.permissions.includes('all') || role.permissions.includes(permissionId);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500">Manage user access levels and security</p>
        </div>
        <div className="flex gap-3">
          {unsavedChanges && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Create New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Active Roles</h2>
            <span className="text-sm text-gray-500">{roles.length} roles</span>
          </div>
          
          <div className="space-y-4">
            {roles.map((role) => (
              <div 
                key={role.id}
                className={`bg-white p-5 rounded-xl border transition-all cursor-pointer group ${
                  selectedRole.id === role.id 
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      role.name === 'Owner' ? 'bg-purple-50 text-purple-600' :
                      role.name === 'Manager' ? 'bg-blue-50 text-blue-600' :
                      role.name === 'Receptionist' ? 'bg-green-50 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{role.name}</h3>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRole(role);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role);
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-md text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {role.users} Active User{role.users !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUserFromRole(role.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      disabled={role.users <= 0}
                    >
                      <span className="text-xs">-</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addUserToRole(role.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="text-blue-600" size={20} />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedRole.name} Permissions
                    </h2>
                    <p className="text-sm text-gray-500">{selectedRole.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRole.users > 0 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedRole.users} Active User{selectedRole.users !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Permissions Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => {
                  const hasPerm = hasPermission(selectedRole, permission.id);
                  const canToggle = selectedRole.name !== 'Owner';
                  
                  return (
                    <div 
                      key={permission.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        hasPerm 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      } ${canToggle ? 'hover:shadow-sm' : 'cursor-default'}`}
                      onClick={() => canToggle && handlePermissionToggle(permission.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {permission.label}
                        </span>
                        <div className={`p-1 rounded ${
                          hasPerm 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasPerm ? (
                            <Check size={16} />
                          ) : (
                            <X size={16} />
                          )}
                        </div>
                      </div>
                      {canToggle && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${
                            hasPerm ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-xs text-gray-500">
                            {hasPerm ? 'Granted' : 'Not granted'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {selectedRole.name === 'Owner' && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="text-purple-600 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm text-purple-800 font-medium">
                        Owner Role Information
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        The Owner role has full system access with all permissions enabled by default. 
                        This role cannot be modified or deleted for security reasons.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedRole.permissions.length} permission{selectedRole.permissions.length !== 1 ? 's' : ''} enabled
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    // Reset to original permissions
                    const originalRole = roles.find(r => r.id === selectedRole.id);
                    if (originalRole) {
                      setSelectedRole({ ...originalRole });
                      setUnsavedChanges(false);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={!unsavedChanges}
                >
                  Discard Changes
                </button>
                <button 
                  onClick={handleSaveChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!unsavedChanges}
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <p className="text-gray-600 mt-1">
                {editingRole ? 'Update role details and permissions' : 'Define a new user role'}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={editingRole ? editingRole.name : newRole.name}
                  onChange={(e) => 
                    editingRole
                      ? setEditingRole({ ...editingRole, name: e.target.value })
                      : setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Supervisor, Admin Assistant"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingRole ? editingRole.description || '' : newRole.description}
                  onChange={(e) =>
                    editingRole
                      ? setEditingRole({ ...editingRole, description: e.target.value })
                      : setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the role's responsibilities..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {permissions.map((perm) => {
                    const isSelected = editingRole
                      ? editingRole.permissions.includes(perm.id)
                      : newRole.permissions.includes(perm.id);
                    
                    return (
                      <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (editingRole) {
                              const newPerms = e.target.checked
                                ? [...editingRole.permissions, perm.id]
                                : editingRole.permissions.filter(p => p !== perm.id);
                              setEditingRole({ ...editingRole, permissions: newPerms });
                            } else {
                              const newPerms = e.target.checked
                                ? [...newRole.permissions, perm.id]
                                : newRole.permissions.filter(p => p !== perm.id);
                              setNewRole({ ...newRole, permissions: newPerms });
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingRole(null);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingRole ? handleUpdateRole : handleCreateRole}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Role</h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete this role?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700 font-medium">
                  Role to delete: <span className="font-bold">{roleToDelete.name}</span>
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This will affect {roleToDelete.users} user{roleToDelete.users !== 1 ? 's' : ''} assigned to this role.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRoleToDelete(null);
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteRole}
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesAccess;