import React from 'react';
import { Bell, Lock, User, Globe } from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      title: 'Profile Settings',
      icon: User,
      settings: [
        { name: 'Name', value: 'Admin User' },
        { name: 'Email', value: 'admin@example.com' },
        { name: 'Role', value: 'Administrator' }
      ]
    },
    {
      title: 'Notification Preferences',
      icon: Bell,
      settings: [
        { name: 'Email Notifications', type: 'toggle', value: true },
        { name: 'Push Notifications', type: 'toggle', value: false }
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      settings: [
        { name: 'Two-Factor Authentication', type: 'toggle', value: true },
        { name: 'Session Timeout', value: '30 minutes' }
      ]
    },
    {
      title: 'Site Settings',
      icon: Globe,
      settings: [
        { name: 'Site Language', value: 'English' },
        { name: 'Time Zone', value: 'UTC-5' }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Settings</h2>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {section.settings.map((setting, settingIndex) => (
                  <div key={settingIndex} className="flex items-center justify-between">
                    <span className="text-gray-600">{setting.name}</span>
                    {setting.type === 'toggle' ? (
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${setting.value ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${setting.value ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    ) : (
                      <span className="text-gray-800 font-medium">{setting.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}