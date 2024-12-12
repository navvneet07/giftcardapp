import React, { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiUpload } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    currency: 'INR',
    taxRate: 0,
    shippingFee: 0,
    minOrderAmount: 0,
    maxOrderAmount: 0,
    logo: null,
    favicon: null,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    allowGuestCheckout: true,
    requireEmailVerification: true,
    orderPrefix: 'DD',
    invoicePrefix: 'INV',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      Object.entries(settings).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Settings saved successfully!',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error saving settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <FiRefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Store Settings</h1>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <FiRefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <FiSave className="w-5 h-5 mr-2" />
            )}
            Save Changes
          </button>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Store Information */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Store Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Email
                </label>
                <input
                  type="email"
                  name="storeEmail"
                  value={settings.storeEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Phone
                </label>
                <input
                  type="tel"
                  name="storePhone"
                  value={settings.storePhone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Address
                </label>
                <textarea
                  name="storeAddress"
                  value={settings.storeAddress}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Financial Settings */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Financial Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  name="taxRate"
                  value={settings.taxRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Fee
                </label>
                <input
                  type="number"
                  name="shippingFee"
                  value={settings.shippingFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={settings.minOrderAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Store Branding */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Store Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Logo
                </label>
                <div className="mt-1 flex items-center">
                  {settings.logo && (
                    <img
                      src={
                        settings.logo instanceof File
                          ? URL.createObjectURL(settings.logo)
                          : settings.logo
                      }
                      alt="Store Logo"
                      className="h-12 w-12 object-contain mr-4"
                    />
                  )}
                  <label className="cursor-pointer flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FiUpload className="w-5 h-5 mr-2" />
                    Upload Logo
                    <input
                      type="file"
                      name="logo"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Favicon
                </label>
                <div className="mt-1 flex items-center">
                  {settings.favicon && (
                    <img
                      src={
                        settings.favicon instanceof File
                          ? URL.createObjectURL(settings.favicon)
                          : settings.favicon
                      }
                      alt="Favicon"
                      className="h-8 w-8 object-contain mr-4"
                    />
                  )}
                  <label className="cursor-pointer flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FiUpload className="w-5 h-5 mr-2" />
                    Upload Favicon
                    <input
                      type="file"
                      name="favicon"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Social Media Links */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Facebook
                </label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  value={settings.socialLinks.facebook}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Twitter
                </label>
                <input
                  type="url"
                  name="socialLinks.twitter"
                  value={settings.socialLinks.twitter}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Instagram
                </label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  value={settings.socialLinks.instagram}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  YouTube
                </label>
                <input
                  type="url"
                  name="socialLinks.youtube"
                  value={settings.socialLinks.youtube}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Store Preferences */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Store Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable SMS Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Enable Maintenance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="allowGuestCheckout"
                  checked={settings.allowGuestCheckout}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Allow Guest Checkout
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Require Email Verification
                </label>
              </div>
            </div>
          </section>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Settings;
