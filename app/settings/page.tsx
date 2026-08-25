"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

type Tab = "general" | "branding" | "users" | "notifications" | "security";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "settings" },
  { id: "branding", label: "Branding", icon: "palette" },
  { id: "users", label: "Users & Roles", icon: "group" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "security", label: "Security", icon: "shield" },
];

const roles = [
  { name: "Admin", permissions: 24, color: "bg-red-100 text-red-700" },
  { name: "Manager", permissions: 18, color: "bg-blue-100 text-blue-700" },
  { name: "Sales Staff", permissions: 10, color: "bg-green-100 text-green-700" },
  { name: "Viewer", permissions: 5, color: "bg-gray-100 text-gray-700" },
];

const defaultUsers = [
  { id: "u1", name: "Aiyaan", email: "aiyaan@ayanscrafts.com", role: "Admin", status: "Active", lastLogin: "2026-08-25 09:30" },
  { id: "u2", name: "Fatima Khan", email: "fatima@ayanscrafts.com", role: "Manager", status: "Active", lastLogin: "2026-08-24 14:15" },
  { id: "u3", name: "Rahim Hassan", email: "rahim@ayanscrafts.com", role: "Sales Staff", status: "Active", lastLogin: "2026-08-25 08:00" },
  { id: "u4", name: "Sara Ahmed", email: "sara@ayanscrafts.com", role: "Viewer", status: "Inactive", lastLogin: "2026-07-20 11:45" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const [general, setGeneral] = useState({
    businessName: "Ayan's Crafts",
    businessType: "Footwear",
    contactEmail: "info@ayanscrafts.com",
    contactPhone: "+880 1712-345678",
    address: "42/A, Road 11, Dhanmondi, Dhaka 1205, Bangladesh",
    currency: "BDT",
    timezone: "Asia/Dhaka",
    dateFormat: "DD/MM/YYYY",
  });

  const [branding, setBranding] = useState({
    primaryColor: "#4f46e5",
    secondaryColor: "#565e74",
  });

  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    newSaleNotifications: true,
    purchaseAlerts: true,
    systemUpdates: false,
  });

  const [users, setUsers] = useState(defaultUsers);

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [twoFactor, setTwoFactor] = useState(false);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Viewer" });

  const handleSaveGeneral = () => {
    alert("General settings saved successfully!");
  };

  const handleSaveBranding = () => {
    alert("Branding settings saved successfully!");
  };

  const handleInviteUser = () => {
    if (!inviteForm.name || !inviteForm.email) return;
    setUsers([...users, { id: `u${Date.now()}`, ...inviteForm, status: "Active", lastLogin: "Never" }]);
    setInviteForm({ name: "", email: "", role: "Viewer" });
    setShowInvite(false);
  };

  const handleDeactivateUser = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u)));
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    setPasswords({ current: "", newPass: "", confirm: "" });
  };

  return (
    <AppLayout title="Settings">
      <div className="p-6 space-y-6">
        <div className="flex gap-1 border-b border-outline-variant overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-container text-primary-container"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "general" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Business Name</label>
                  <input
                    type="text"
                    value={general.businessName}
                    onChange={(e) => setGeneral({ ...general, businessName: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Business Type</label>
                  <select
                    value={general.businessType}
                    onChange={(e) => setGeneral({ ...general, businessType: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option>Footwear</option>
                    <option>Fashion</option>
                    <option>Retail</option>
                    <option>Electronics</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={general.contactEmail}
                    onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={general.contactPhone}
                    onChange={(e) => setGeneral({ ...general, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Address</label>
                <textarea
                  value={general.address}
                  onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Regional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Currency</label>
                  <select
                    value={general.currency}
                    onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Timezone</label>
                  <select
                    value={general.timezone}
                    onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Date Format</label>
                  <select
                    value={general.dateFormat}
                    onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSaveGeneral} className="px-6 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 font-medium">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "branding" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Brand Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded border border-outline-variant cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded border border-outline-variant cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Logo & Favicon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Logo</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:border-primary-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant">cloud_upload</span>
                    <p className="text-sm text-on-surface-variant mt-2">Click to upload logo</p>
                    <p className="text-xs text-on-surface-variant mt-1">SVG, PNG, JPG (max 2MB)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">Favicon</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center hover:border-primary-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant">cloud_upload</span>
                    <p className="text-sm text-on-surface-variant mt-2">Click to upload favicon</p>
                    <p className="text-xs text-on-surface-variant mt-1">ICO, PNG (32x32)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Live Preview</h3>
              <div className="rounded-xl p-6" style={{ backgroundColor: branding.primaryColor }}>
                <div className="rounded-lg p-4" style={{ backgroundColor: branding.secondaryColor }}>
                  <p className="text-white font-bold text-lg">Ayan&apos;s Crafts</p>
                  <p className="text-white/80 text-sm">Inventory Management System</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium">Primary Button</button>
                  <button className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm font-medium">Secondary Button</button>
                </div>
              </div>
            </div>

            <button onClick={handleSaveBranding} className="px-6 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 font-medium">
              Save Branding
            </button>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">Team Members</h3>
                <p className="text-sm text-on-surface-variant">Manage users and their roles</p>
              </div>
              <button
                onClick={() => setShowInvite(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 text-sm font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Invite User
              </button>
            </div>

            {showInvite && (
              <div className="bg-surface-container rounded-xl p-6 border border-outline-variant space-y-4">
                <h4 className="font-semibold text-on-surface">Invite New User</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    className="px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option>Admin</option>
                    <option>Manager</option>
                    <option>Sales Staff</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleInviteUser} className="px-4 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 text-sm font-medium">
                    Send Invite
                  </button>
                  <button onClick={() => setShowInvite(false)} className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg hover:bg-surface-container-highest text-sm font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Last Login</th>
                      <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-container">{user.name[0]}</span>
                            </div>
                            <span className="font-medium text-on-surface">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "Admin" ? "bg-red-100 text-red-700" :
                            user.role === "Manager" ? "bg-blue-100 text-blue-700" :
                            user.role === "Sales Staff" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">{user.lastLogin}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              className="p-1 rounded hover:bg-surface-container-high"
                              title={user.status === "Active" ? "Deactivate" : "Activate"}
                            >
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                                {user.status === "Active" ? "person_off" : "person"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 rounded hover:bg-surface-container-high"
                              title="Remove user"
                            >
                              <span className="material-symbols-outlined text-[18px] text-red-500">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant space-y-4">
              <h3 className="text-lg font-semibold text-on-surface">Roles & Permissions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role) => (
                  <div key={role.name} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>{role.name}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{role.permissions} permissions</p>
                    <button className="mt-2 text-xs text-primary-container font-medium hover:underline">View Details</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface-container rounded-xl p-6 space-y-6 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Notification Preferences</h3>

              {[
                { key: "lowStockAlerts" as const, label: "Low Stock Alerts", desc: "Get notified when product stock falls below the minimum threshold" },
                { key: "newSaleNotifications" as const, label: "New Sale Notifications", desc: "Receive alerts for every new sale transaction" },
                { key: "purchaseAlerts" as const, label: "Purchase Alerts", desc: "Notifications for new purchase orders and deliveries" },
                { key: "systemUpdates" as const, label: "System Updates", desc: "Get notified about system maintenance and feature updates" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div>
                    <p className="font-medium text-on-surface">{item.label}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[item.key] ? "bg-primary-container" : "bg-surface-container-highest"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        notifications[item.key] ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <button type="submit" className="px-6 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 font-medium">
                  Update Password
                </button>
              </form>
            </div>

            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">Two-Factor Authentication</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    twoFactor ? "bg-primary-container" : "bg-surface-container-highest"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      twoFactor ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {twoFactor && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Two-factor authentication is enabled</p>
                  <p className="text-xs text-green-600 mt-1">Your account is secured with an additional verification step.</p>
                </div>
              )}
            </div>

            <div className="bg-surface-container rounded-xl p-6 space-y-4 border border-outline-variant">
              <h3 className="text-lg font-semibold text-on-surface">Session Management</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-green-500">computer</span>
                    <div>
                      <p className="font-medium text-on-surface text-sm">Current Session</p>
                      <p className="text-xs text-on-surface-variant">Chrome on Windows - Dhaka, BD</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">phone_iphone</span>
                    <div>
                      <p className="font-medium text-on-surface text-sm">Mobile Session</p>
                      <p className="text-xs text-on-surface-variant">Safari on iPhone - Dhaka, BD</p>
                    </div>
                  </div>
                  <button className="text-xs text-red-500 font-medium hover:underline">Revoke</button>
                </div>
              </div>
              <button className="text-sm text-red-500 font-medium hover:underline mt-2">Sign out of all sessions</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
