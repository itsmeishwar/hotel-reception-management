import { useState, useEffect } from 'react';
import { 
  Building, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Save,
  Upload,
  Download,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  CreditCard,
  Users,
  Calendar,
  Mail,
  Shield,
  
  Database,
  Cpu,
  Wifi,
  Printer,
  AlertCircle,
  X
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hotelData, setHotelData] = useState({
    name: 'ishwar Hotel',
    email: 'admin@ishwarhotel.com',
    phone: '+977 12345 67890',
    currency: 'NPR',
    address: '123, Paradise Road, Kathmandu, Nepal, 400001',
    timezone: 'Asia/KTM',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    taxRate: 18,
    website: 'www.ishwarhotel.com',
  });

  const [notifications, setNotifications] = useState({
    emailNewBookings: true,
    smsCheckIns: true,
    dailyReports: true,
    lowStockAlerts: true,
    staffAttendance: false,
    maintenanceAlerts: true,
    paymentReminders: true,
    reviewRequests: true,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: '',
    showOldPasswords: false,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    primaryColor: '#f97316',
    sidebarCollapsed: false,
    denseMode: false,
    animations: true,
    language: 'en',
  });

  const [integrations, setIntegrations] = useState([
    { id: 'payment', name: 'Payment Gateway', enabled: true, icon: CreditCard },
    { id: 'calendar', name: 'Google Calendar', enabled: true, icon: Calendar },
    { id: 'email', name: 'Email Service', enabled: true, icon: Mail },
    { id: 'accounting', name: 'QuickBooks', enabled: false, icon: Shield },
    { id: 'crm', name: 'CRM System', enabled: false, icon: Users },
    { id: 'pos', name: 'POS System', enabled: true, icon: Printer },
  ]);

  const [backupStatus, setBackupStatus] = useState({
    lastBackup: '2024-01-15 02:00',
    autoBackup: true,
    backupFrequency: 'daily',
    cloudStorage: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const hasChanges = () => {
      return unsavedChanges;
    };
    
    if (hasChanges()) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [unsavedChanges]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setUnsavedChanges(true);
    
    switch(section) {
      case 'hotel':
        setHotelData(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotifications(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecurity(prev => ({ ...prev, [field]: value }));
        break;
      case 'appearance':
        setAppearance(prev => ({ ...prev, [field]: value }));
        break;
      case 'integrations':
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === field 
              ? { ...integration, enabled: value } 
              : integration
          )
        );
        break;
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Saving settings:', {
      hotelData,
      notifications,
      security,
      appearance,
      integrations,
    });
    
    setUnsavedChanges(false);
    setLoading(false);
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setHotelData({
        name: 'Ishwar Hotel',
        email: 'admin@ishwarhotel.com',
        phone: '+977 12345 67890',
        currency: 'NPR',
        address: '123, Paradise Road, Mumbai, Maharashtra, 400001',
        timezone: 'Asia/KTM',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        taxRate: 18,
        website: 'www.ishwarhotel.com',
      });
      
      setNotifications({
        emailNewBookings: true,
        smsCheckIns: true,
        dailyReports: true,
        lowStockAlerts: true,
        staffAttendance: false,
        maintenanceAlerts: true,
        paymentReminders: true,
        reviewRequests: true,
      });
      
      setUnsavedChanges(true);
    }
  };

  const handleBackupNow = () => {
    setLoading(true);
    setTimeout(() => {
      setBackupStatus(prev => ({
        ...prev,
        lastBackup: new Date().toLocaleString(),
      }));
      setLoading(false);
      alert('Backup completed successfully!');
    }, 2000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
      alert('Password changed successfully!');
    }, 1500);
  };

  const colorOptions = [
    { name: 'Orange', value: '#f97316' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  const sidebarItems = [
    { id: 'general', label: 'General Info', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'system', label: 'System', icon: Cpu },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage hotel preferences and system configuration</p>
        </div>
        
        <div className="flex gap-3">
          {unsavedChanges && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
          )}
          
          <button
            onClick={handleResetSettings}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Reset
          </button>
          
          <button 
            onClick={handleSaveChanges}
            disabled={!unsavedChanges || loading}
            className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Hotel Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(hotelData).map(([key, value]) => (
                    <div key={key} className={key === 'address' || key === 'website' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      {key === 'address' || key === 'website' ? (
                        <textarea
                          value={value}
                          onChange={(e) => handleInputChange('hotel', key, e.target.value)}
                          rows={key === 'address' ? 3 : 2}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none" 
                        />
                      ) : key === 'currency' || key === 'timezone' ? (
                        <select
                          value={value}
                          onChange={(e) => handleInputChange('hotel', key, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        >
                          {key === 'currency' ? (
                            <>
                              <option value="NPR">NPR </option>
                              <option value="USD">USD ($)</option>
                              <option value="IND">IND (₹)</option>
                            </>
                          ) : (
                            <>
                              <option value="Asia/KTM">Nepal (NPR)</option>
                              <option value="America/New_York">EST</option>
                              <option value="Europe/Mumbai">IND</option>
                            </>
                          )}
                        </select>
                      ) : (
                        <input
                          type={key === 'email' ? 'email' : key === 'taxRate' ? 'number' : 'text'}
                          value={value}
                          onChange={(e) => handleInputChange('hotel', key, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Notification Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-gray-700 font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Security Settings</h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-bold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorAuth}
                        onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={security.sessionTimeout}
                        onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={security.loginAttempts}
                        onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        />
                      </div>
                      
                      <button
                        onClick={handleChangePassword}
                        disabled={!oldPassword || !newPassword || !confirmPassword || loading}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Appearance Settings</h2>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Theme</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleInputChange('appearance', 'theme', 'light')}
                      className={`flex-1 p-4 border rounded-lg text-center transition-all ${
                        appearance.theme === 'light'
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Sun size={24} className="mx-auto mb-2 text-orange-600" />
                      <span className="font-medium">Light Mode</span>
                    </button>
                    
                    <button
                      onClick={() => handleInputChange('appearance', 'theme', 'dark')}
                      className={`flex-1 p-4 border rounded-lg text-center transition-all ${
                        appearance.theme === 'dark'
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Moon size={24} className="mx-auto mb-2 text-gray-700" />
                      <span className="font-medium">Dark Mode</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Primary Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleInputChange('appearance', 'primaryColor', color.value)}
                        className="flex flex-col items-center gap-2 relative"
                      >
                        <div
                          className={`w-12 h-12 rounded-full border-2 ${
                            appearance.primaryColor === color.value
                              ? 'border-orange-500 ring-2 ring-offset-2 ring-orange-500/30'
                              : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-xs text-gray-600">{color.name}</span>
                        {appearance.primaryColor === color.value && (
                          <Check size={16} className="text-orange-600 absolute -top-1 -right-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Interface Preferences</h3>
                  
                  {[
                    { key: 'sidebarCollapsed', label: 'Collapsed Sidebar', description: 'Keep sidebar minimized' },
                    { key: 'denseMode', label: 'Compact Mode', description: 'Reduce spacing for more content' },
                    { key: 'animations', label: 'Animations', description: 'Enable interface animations' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={appearance[item.key as keyof typeof appearance] as boolean}
                          onChange={(e) => handleInputChange('appearance', item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowPreview(true)}
                  className="px-6 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Preview Changes
                </button>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Integrations & Services</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                      <div
                        key={integration.id}
                        className={`p-4 border rounded-lg transition-all ${
                          integration.enabled
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              integration.enabled
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Icon size={20} />
                            </div>
                            <span className="font-medium text-gray-900">{integration.name}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={integration.enabled}
                              onChange={(e) => handleInputChange('integrations', integration.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            integration.enabled
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {integration.enabled ? 'Connected' : 'Disabled'}
                          </span>
                          <button className="text-sm text-orange-600 hover:text-orange-700">
                            Configure
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Backup */}
            {activeTab === 'backup' && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Backup & Restore</h2>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Backup Status</h3>
                      <p className="text-gray-600 mt-1">Last backup: {backupStatus.lastBackup}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleBackupNow}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      >
                        <Download size={16} />
                        Backup Now
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Upload size={16} />
                        Restore
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                      <div>
                        <span className="font-medium text-gray-900">Automatic Backups</span>
                        <p className="text-sm text-gray-500 mt-1">Daily at 2:00 AM</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={backupStatus.autoBackup}
                          onChange={(e) => setBackupStatus(prev => ({ ...prev, autoBackup: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
                      <select
                        value={backupStatus.backupFrequency}
                        onChange={(e) => setBackupStatus(prev => ({ ...prev, backupFrequency: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System */}
            {activeTab === 'system' && (
              <div className="space-y-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">System Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">System Version</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">v2.4.1</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Database size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Database Size</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">245.6 MB</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Uptime</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">45 days, 12:34:21</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Last Security Scan</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">1 hour ago</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Server Load', value: 45 },
                      { label: 'Memory Usage', value: 68 },
                      { label: 'Storage', value: 82 },
                      { label: 'Network', value: 92 },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.label}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.value < 70 ? 'bg-green-500' :
                              item.value < 85 ? 'bg-orange-500' : 'bg-red-500'
                            } transition-all duration-300`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Clear Cache
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    View Logs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Theme Preview</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-900 text-white p-6 rounded-lg">
                <p className="text-center">Preview of selected theme ({appearance.theme})</p>
                <div className="mt-4 h-32 rounded-lg flex items-center justify-center" style={{ backgroundColor: appearance.primaryColor }}>
                  <span className="text-white font-medium">Primary Color Preview</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Theme settings applied:</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li>• Theme: {appearance.theme}</li>
                  <li>• Primary Color: {colorOptions.find(c => c.value === appearance.primaryColor)?.name || 'Custom'}</li>
                  <li>• Sidebar: {appearance.sidebarCollapsed ? 'Collapsed' : 'Expanded'}</li>
                  <li>• Animations: {appearance.animations ? 'Enabled' : 'Disabled'}</li>
                </ul>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    alert('Theme applied successfully!');
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Apply Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;