import React, { useState } from 'react';
import { User, LogOut, Settings, Edit2, Save, X, Mail, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileProps {
  onSignOut: () => void;
  isMobile?: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ onSignOut, isMobile = false }) => {
  const { user, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [saving, setSaving] = useState(false);

  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'User';

  const handleSave = async () => {
    if (!editName.trim()) return;
    
    setSaving(true);
    const { error } = await updateProfile(editName.trim());
    
    if (!error) {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditName(userProfile?.name || '');
    setIsEditing(false);
  };

  const renderProfileHeader = () => (
    <div className="text-center">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
        <UserCircle className="w-12 h-12 text-white" />
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            placeholder="Enter your name"
          />
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleSave}
              disabled={saving || !editName.trim()}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
          <p className="text-gray-600 mt-1">{userProfile?.email || user?.email}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 mx-auto"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Name</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderAccountInfo = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Account Info</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">Member Since</p>
            <p className="text-sm text-gray-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="space-y-3">
      <button className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200">
        <Settings className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">Settings</span>
      </button>
      
      <button
        onClick={onSignOut}
        className="w-full flex items-center space-x-3 p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors duration-200 text-red-600"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="p-6 space-y-6">
        {renderProfileHeader()}
        {renderAccountInfo()}
        {renderActions()}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Profile */}
            <div className="md:col-span-1">
              {renderProfileHeader()}
            </div>
            
            {/* Right Column - Account Info and Actions */}
            <div className="md:col-span-2 space-y-6">
              {renderAccountInfo()}
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                {renderActions()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
