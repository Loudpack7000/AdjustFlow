'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Plus, Search, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { teamsApi, authUtils } from '@/lib/api';

interface Role {
  id: number;
  name: string;
  description?: string;
  tier: string;
  max_seats?: number;
}

interface AccessProfile {
  id: number;
  name: string;
  description?: string;
  role_id: number;
  permissions?: any;
}

interface TeamUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser?: boolean;
  role_id?: number;
  access_profile_id?: number;
  last_login_web?: string;
  last_login_mobile?: string;
  created_at: string;
  role?: Role;
  access_profile?: AccessProfile;
}

interface RoleStats {
  role_id: number;
  role_name: string;
  user_count: number;
  max_seats?: number;
  seats_remaining?: number;
  tier: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [accessProfiles, setAccessProfiles] = useState<AccessProfile[]>([]);
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AccessProfile | null>(null);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState<number | undefined>();
  const [inviteProfileId, setInviteProfileId] = useState<number | undefined>();
  const [inviting, setInviting] = useState(false);
  
  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileRoleId, setProfileRoleId] = useState<number | undefined>();
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Edit user form state
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserFullName, setEditUserFullName] = useState('');
  const [editUserRoleId, setEditUserRoleId] = useState<number | undefined>();
  const [editUserProfileId, setEditUserProfileId] = useState<number | undefined>();
  const [editUserIsActive, setEditUserIsActive] = useState(true);
  const [editUserIsSuperuser, setEditUserIsSuperuser] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, profilesRes, usersRes] = await Promise.all([
        teamsApi.listRoles(),
        teamsApi.listAccessProfiles(),
        teamsApi.listUsers({ is_active: true })
      ]);

      setRoles(rolesRes.data || []);
      setAccessProfiles(profilesRes.data || []);
      setTeamUsers(usersRes.data || []);

      // Load role stats
      const statsPromises = rolesRes.data.map((role: Role) =>
        teamsApi.getRoleStats(role.id.toString())
      );
      const statsResults = await Promise.all(statsPromises);
      setRoleStats(statsResults.map((r: any) => r.data));
    } catch (error) {
      console.error('Error loading teams data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteUsername || !invitePassword) {
      alert('Email, username, and password are required');
      return;
    }

    try {
      setInviting(true);
      await teamsApi.createUser({
        email: inviteEmail,
        username: inviteUsername,
        password: invitePassword,
        full_name: inviteFullName || undefined,
        role_id: inviteRoleId,
        access_profile_id: inviteProfileId
      });
      
      // Reset form
      setInviteEmail('');
      setInviteUsername('');
      setInviteFullName('');
      setInvitePassword('');
      setInviteRoleId(undefined);
      setInviteProfileId(undefined);
      setShowInviteModal(false);
      
      // Reload data
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName || !profileRoleId) {
      alert('Profile name and role are required');
      return;
    }

    try {
      setSavingProfile(true);
      if (editingProfile) {
        await teamsApi.updateAccessProfile(editingProfile.id.toString(), {
          name: profileName,
          description: profileDescription || undefined,
          role_id: profileRoleId,
          permissions: {}
        });
      } else {
        await teamsApi.createAccessProfile({
          name: profileName,
          description: profileDescription || undefined,
          role_id: profileRoleId,
          permissions: {}
        });
      }
      
      // Reset form
      setProfileName('');
      setProfileDescription('');
      setProfileRoleId(undefined);
      setEditingProfile(null);
      setShowProfileModal(false);
      
      // Reload data
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    if (!confirm('Are you sure you want to delete this access profile?')) return;
    
    try {
      await teamsApi.deleteAccessProfile(profileId.toString());
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete profile');
    }
  };

  const startEditingProfile = (profile: AccessProfile) => {
    setEditingProfile(profile);
    setProfileName(profile.name);
    setProfileDescription(profile.description || '');
    setProfileRoleId(profile.role_id);
    setShowProfileModal(true);
  };

  const startEditingUser = (user: TeamUser) => {
    setEditingUser(user);
    setEditUserEmail(user.email);
    setEditUserUsername(user.username);
    setEditUserFullName(user.full_name || '');
    setEditUserRoleId(user.role_id);
    setEditUserProfileId(user.access_profile_id);
    setEditUserIsActive(user.is_active);
    setEditUserIsSuperuser(user.is_superuser || false);
    setShowEditUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    if (!editUserEmail || !editUserUsername) {
      alert('Email and username are required');
      return;
    }

    try {
      setSavingUser(true);
      await teamsApi.updateUser(editingUser.id.toString(), {
        email: editUserEmail,
        username: editUserUsername,
        full_name: editUserFullName || undefined,
        role_id: editUserRoleId,
        access_profile_id: editUserProfileId,
        is_active: editUserIsActive,
        is_superuser: editUserIsSuperuser
      });
      
      // Reset form
      setEditingUser(null);
      setShowEditUserModal(false);
      
      // Reload data
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to update user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await teamsApi.deleteUser(userId.toString());
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.detail || 'Failed to delete user');
    }
  };

  const filteredUsers = teamUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProfile = filterProfile === 'all' || 
      user.access_profile_id?.toString() === filterProfile;
    
    return matchesSearch && matchesProfile;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name?: string, username?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getColorForInitials = (str: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team</h1>
              <p className="text-gray-600">Manage your team members and access profiles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Roles Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Manage roles
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleStats.map((stat) => (
              <div key={stat.role_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{stat.role_name}</h3>
                  {stat.tier === 'pro' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Pro</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {stat.user_count} User{stat.user_count !== 1 ? 's' : ''}
                </p>
                {stat.max_seats !== null && stat.max_seats !== undefined && (
                  <p className="text-sm text-gray-500">
                    {stat.seats_remaining} seat{stat.seats_remaining !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Access Profiles Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Access Profiles</h2>
            <button
              onClick={() => {
                setEditingProfile(null);
                setProfileName('');
                setProfileDescription('');
                setProfileRoleId(undefined);
                setShowProfileModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              Add access profile
            </button>
          </div>

          <div className="space-y-2">
            {accessProfiles.map((profile) => {
              const assignedUsers = teamUsers.filter(u => u.access_profile_id === profile.id);
              return (
                <div key={profile.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{profile.name}</h3>
                      <span className="text-sm text-gray-500">
                        {assignedUsers.length} team member{assignedUsers.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {profile.description && (
                      <p className="text-sm text-gray-500 mt-1">{profile.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditingProfile(profile)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Team</h2>
            <button
              onClick={() => {
                setInviteEmail('');
                setInviteUsername('');
                setInviteFullName('');
                setInvitePassword('');
                setInviteRoleId(undefined);
                setInviteProfileId(undefined);
                setShowInviteModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              Invite team member
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterProfile}
              onChange={(e) => setFilterProfile(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Profiles</option>
              {accessProfiles.map((profile) => (
                <option key={profile.id} value={profile.id.toString()}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Profile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role(s)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last logged in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getColorForInitials(user.full_name || user.username)}`}>
                          {getInitials(user.full_name, user.username)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.access_profile?.name || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.role?.name || '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(user.last_login_web)} (Web)</div>
                      <div className="text-xs text-gray-400">{formatDate(user.last_login_mobile)} (Mobile)</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => startEditingUser(user)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={inviteFullName}
                    onChange={(e) => setInviteFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteRoleId || ''}
                    onChange={(e) => setInviteRoleId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Profile</label>
                  <select
                    value={inviteProfileId || ''}
                    onChange={(e) => setInviteProfileId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a profile</option>
                    {accessProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>{profile.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={inviting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviting ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Access Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingProfile ? 'Edit Access Profile' : 'Add Access Profile'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={profileRoleId || ''}
                    onChange={(e) => setProfileRoleId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setEditingProfile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

