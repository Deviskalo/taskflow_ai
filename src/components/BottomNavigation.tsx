import React from 'react';
import { Home, BarChart3, Bell, User, Plus } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'analytics' | 'notifications' | 'profile';
  onTabChange: (tab: 'dashboard' | 'analytics' | 'notifications' | 'profile') => void;
  onAddTask: () => void;
  notificationCount: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onAddTask,
  notificationCount
}) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Tasks' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'notifications', icon: Bell, label: 'Alerts', badge: notificationCount },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab, index) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id as any)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 relative ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {tab.label}
                </span>
              </button>
              
              {/* Add Task FAB in the middle */}
              {index === 1 && (
                <button
                  onClick={onAddTask}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mx-2"
                >
                  <Plus className="w-6 h-6" />
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};