import React from 'react';
import { Activity, TrendingUp, Users, Video } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Videos', value: '156', icon: Video, trend: '+12%', color: 'bg-blue-500' },
    { label: 'Active Users', value: '2,451', icon: Users, trend: '+25%', color: 'bg-green-500' },
    { label: 'Watch Time', value: '1,245h', icon: Activity, trend: '+18%', color: 'bg-purple-500' },
    { label: 'Engagement', value: '84%', icon: TrendingUp, trend: '+7%', color: 'bg-orange-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className={`w-12 h-12 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
            <div className="flex items-center mt-2">
              <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              <span className="ml-2 text-sm font-medium text-green-600">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Video className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">New video uploaded</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">By Admin</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}