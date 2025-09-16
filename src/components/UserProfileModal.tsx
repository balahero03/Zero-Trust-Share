'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/profile-utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export function UserProfileModal({ isOpen, onClose, onProfileUpdated }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setFullName(userProfile.full_name);
        setPhone(userProfile.phone || '');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const updatedProfile = await updateUserProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null
      });

      if (updatedProfile) {
        setProfile(updatedProfile);
        setIsEditing(false);
        onProfileUpdated?.(updatedProfile);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || '');
    }
    setIsEditing(false);
    setError('');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-darker border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary">User Profile</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && !profile ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-secondary cursor-not-allowed"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300 ${
                  !isEditing ? 'cursor-not-allowed opacity-75' : ''
                }`}
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all duration-300 ${
                  !isEditing ? 'cursor-not-allowed opacity-75' : ''
                }`}
                placeholder="Enter your mobile number"
              />
            </div>

            {/* Profile Created/Updated dates */}
            {profile && (
              <div className="text-sm text-text-secondary space-y-1">
                <p>Profile created: {new Date(profile.created_at).toLocaleDateString()}</p>
                <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-text-primary font-medium rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-electric-blue hover:bg-electric-blue-dark text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-electric-blue/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
