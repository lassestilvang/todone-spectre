import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../../hooks/useCollaboration';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { User } from '../../types/user';
import { CollaborationActivity, CollaborationMember } from '../../types/collaboration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Activity, Settings, Check, X, Edit, Trash2, User, Mail, Phone, Briefcase } from 'lucide-react';

interface UserProfileCollaborationIntegrationProps {
  teamId: string;
  userId?: string;
  showProfileManagement?: boolean;
  showActivityFeed?: boolean;
  onProfileUpdated?: (user: User) => void;
}

export const UserProfileCollaborationIntegration: React.FC<UserProfileCollaborationIntegrationProps> = ({
  teamId,
  userId,
  showProfileManagement = true,
  showActivityFeed = true,
  onProfileUpdated
}) => {
  const { teams, members, addMemberToTeam, updateMemberRole } = useCollaboration();
  const { user, updateUserProfile } = useAuth();
  const { users, getUserById, updateUser } = useUsers();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [activityFeed, setActivityFeed] = useState<CollaborationActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  // Get current team
  const currentTeam = teams.find(team => team.id === teamId);
  const teamMembers = members.filter(member => member.teamId === teamId);

  // Get the user to display (either provided userId or current user)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const targetUserId = userId || user?.id;
        if (!targetUserId) return;

        const fetchedUser = await getUserById(targetUserId);
        setProfileUser(fetchedUser);
        setEditedUser({
          name: fetchedUser.name,
          email: fetchedUser.email,
          bio: fetchedUser.bio,
          title: fetchedUser.title
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, user?.id, getUserById]);

  // Handle profile updates
  const handleProfileUpdate = async () => {
    if (!profileUser) return;

    try {
      setLoading(true);
      setError(null);

      const updatedUser = await updateUser(profileUser.id, editedUser);

      // Create collaboration activity
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: updatedUser.id,
        action: `updated their profile`,
        type: 'member_updated',
        timestamp: new Date(),
        entityId: updatedUser.id,
        entityType: 'user'
      };

      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);
      setProfileUser(updatedUser);
      setEditMode(false);

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle team member role updates
  const handleRoleUpdate = async (memberId: string, newRole: CollaborationMember['role']) => {
    try {
      setLoading(true);
      setError(null);

      await updateMemberRole(teamId, memberId, newRole);

      // Create collaboration activity
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: user?.id || 'current-user',
        action: `updated member role to ${newRole}`,
        type: 'member_updated',
        timestamp: new Date(),
        entityId: memberId,
        entityType: 'member'
      };

      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding user to team
  const handleAddToTeam = async () => {
    if (!profileUser) return;

    try {
      setLoading(true);
      setError(null);

      // Check if user is already a member
      const isAlreadyMember = teamMembers.some(member => member.userId === profileUser.id);
      if (isAlreadyMember) {
        setError('User is already a team member');
        return;
      }

      await addMemberToTeam(teamId, {
        userId: profileUser.id,
        role: 'member',
        status: 'active'
      });

      // Create collaboration activity
      const activityData: Omit<CollaborationActivity, 'id'> = {
        teamId,
        userId: user?.id || 'current-user',
        action: `added ${profileUser.name} to the team`,
        type: 'member_added',
        timestamp: new Date(),
        entityId: profileUser.id,
        entityType: 'member'
      };

      setActivityFeed(prev => [activityData as CollaborationActivity, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user to team');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileUser) {
    return <div className="p-4 text-center">Loading user profile...</div>;
  }

  if (!profileUser) {
    return <div className="p-4 text-center text-gray-500">User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      {showProfileManagement && (
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage user profile and team membership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profileUser.avatar || undefined} />
                <AvatarFallback>
                  {profileUser.name ? profileUser.name.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {editMode ? (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={editedUser.name || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editedUser.title || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="edit-bio">Bio</Label>
                      <Input
                        id="edit-bio"
                        value={editedUser.bio || ''}
                        onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold">{profileUser.name}</h3>
                    {profileUser.title && (
                      <p className="text-gray-600">{profileUser.title}</p>
                    )}
                    {profileUser.bio && (
                      <p className="text-sm text-gray-500 mt-1">{profileUser.bio}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Email</Label>
                <p>{profileUser.email}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-gray-500">Role</Label>
                <p className="capitalize">{profileUser.role || 'member'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {editMode ? (
                <>
                  <Button onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} disabled={loading}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setEditMode(true)}>Edit Profile</Button>

                  {/* Show add to team button if user is not already a member */}
                  {!teamMembers.some(member => member.userId === profileUser.id) && (
                    <Button onClick={handleAddToTeam} disabled={loading}>
                      {loading ? 'Adding...' : 'Add to Team'}
                    </Button>
                  )}
                </>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage team member roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-gray-500">No team members found.</p>
          ) : (
            <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.user?.avatar || undefined} />
                      <AvatarFallback>
                        {member.user?.name ? member.user.name.substring(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{member.user?.name || member.id}</h4>
                      <p className="text-sm text-gray-500 truncate">{member.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleUpdate(member.id, value as CollaborationMember['role'])}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed Section */}
      {showActivityFeed && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Activity Feed</CardTitle>
            <CardDescription>Recent profile-related collaboration activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <p className="text-gray-500">No recent profile activities.</p>
            ) : (
              <div className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user?.name || 'Team Member'}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp.toLocaleString()}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-400 mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};