import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollaboration } from '../../hooks/useCollaboration';
import { CollaborationMember } from '../../types/collaboration';
import { Users, Search, UserPlus, Crown, ShieldCheck, MoreHorizontal, Check, X, AlertTriangle, Mail, Phone, User, Briefcase, Calendar, MapPin, Globe, Lock, Unlock, Edit, Trash2, Plus, Filter, RefreshCw } from 'lucide-react';

interface MemberRoleChange {
  memberId: string;
  newRole: CollaborationMember['role'];
}

interface MemberStatusChange {
  memberId: string;
  newStatus: CollaborationMember['status'];
}

interface CollaborationMembersProps {
  teamId: string;
  title?: string;
  showAddMember?: boolean;
  showRoleManagement?: boolean;
  showStatusManagement?: boolean;
  onAddMember?: () => void;
  onRemoveMember?: (memberId: string) => void;
  onChangeRole?: (memberId: string, newRole: CollaborationMember['role']) => void;
  onChangeStatus?: (memberId: string, newStatus: CollaborationMember['status']) => void;
}

export const CollaborationMembers: React.FC<CollaborationMembersProps> = ({
  teamId,
  title = 'Team Members',
  showAddMember = true,
  showRoleManagement = true,
  showStatusManagement = true,
  onAddMember,
  onRemoveMember,
  onChangeRole,
  onChangeStatus
}) => {
  const { members, loading, error, updateMemberRole, updateTeamSettings } = useCollaboration();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | CollaborationMember['role']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CollaborationMember['status']>('all');
  const [pendingRoleChanges, setPendingRoleChanges] = useState<MemberRoleChange[]>([]);
  const [pendingStatusChanges, setPendingStatusChanges] = useState<MemberStatusChange[]>([]);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<CollaborationMember['role']>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Get team members
  const teamMembers = members.filter(member => member.teamId === teamId);

  // Filtered members based on search and filters
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: CollaborationMember['role']) => {
    switch (role) {
      case 'admin': return { text: 'Admin', icon: <Crown className="h-3 w-3" />, variant: 'default' as const, color: 'text-yellow-500' };
      case 'member': return { text: 'Member', icon: <Users className="h-3 w-3" />, variant: 'secondary' as const, color: 'text-blue-500' };
      case 'guest': return { text: 'Guest', icon: <ShieldCheck className="h-3 w-3" />, variant: 'outline' as const, color: 'text-green-500' };
    }
  };

  const getStatusBadge = (status: CollaborationMember['status']) => {
    switch (status) {
      case 'active': return { text: 'Active', variant: 'default' as const, color: 'text-green-500' };
      case 'inactive': return { text: 'Inactive', variant: 'secondary' as const, color: 'text-gray-500' };
      case 'pending': return { text: 'Pending', variant: 'outline' as const, color: 'text-yellow-500' };
    }
  };

  const handleRoleChange = async (memberId: string, newRole: CollaborationMember['role']) => {
    try {
      setIsLoading(true);
      if (onChangeRole) {
        await onChangeRole(memberId, newRole);
      } else if (updateMemberRole) {
        await updateMemberRole(teamId, memberId, newRole);
      }

      // Remove from pending changes
      setPendingRoleChanges(prev => prev.filter(change => change.memberId !== memberId));
    } catch (err) {
      console.error('Failed to update member role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: CollaborationMember['status']) => {
    try {
      setIsLoading(true);
      if (onChangeStatus) {
        await onChangeStatus(memberId, newStatus);
      }

      // Remove from pending changes
      setPendingStatusChanges(prev => prev.filter(change => change.memberId !== memberId));
    } catch (err) {
      console.error('Failed to update member status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setIsLoading(true);
      if (onRemoveMember) {
        await onRemoveMember(memberToRemove);
      }
      setMemberToRemove(null);
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      setAddMemberError('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      setAddMemberError(null);

      // In a real implementation, this would call the API to add a member
      // For now, we'll just close the dialog and show success
      console.log('Adding member with email:', newMemberEmail, 'and role:', newMemberRole);

      // Reset form
      setNewMemberEmail('');
      setNewMemberRole('member');
      setIsAddMemberDialogOpen(false);

      // Refresh members
      // await refreshCollaborationData();
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const getMemberActivityCount = (memberId: string) => {
    // In a real implementation, this would come from activity data
    return Math.floor(Math.random() * 10); // Mock data
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Loading team members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <p>Failed to load team members</p>
            <Button variant="outline" size="sm" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                <Users className="h-3 w-3 mr-1" />
                {filteredMembers.length} / {teamMembers.length} members
              </Badge>

              <div className="flex items-center space-x-1">
                <Select
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as 'all' | CollaborationMember['role'])}
                >
                  <SelectTrigger className="w-[120px] text-sm">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="member">Members</SelectItem>
                    <SelectItem value="guest">Guests</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as 'all' | CollaborationMember['status'])}
                >
                  <SelectTrigger className="w-[120px] text-sm">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-8 w-48 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button variant="outline" size="sm" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {showAddMember && (
              <Button size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Member Statistics */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">Team members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.filter(m => m.role === 'admin').length}</div>
              <p className="text-xs text-muted-foreground">Team administrators</p>
            </CardContent>
          </Card>
        </div>

        {/* Member List */}
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No members found matching your criteria</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>

              {/* List View */}
              <TabsContent value="list">
                <div className="divide-y divide-border">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          {member.user?.avatar && <AvatarImage src={member.user.avatar} />}
                          <AvatarFallback>{member.user?.name?.substring(0, 2) || member.userId.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium truncate">{member.user?.name || 'Team Member'}</h4>
                            <Badge variant={getRoleBadge(member.role).variant} className="text-xs">
                              {getRoleBadge(member.role).icon}
                              <span className="ml-1">{getRoleBadge(member.role).text}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{member.user?.email || 'No email'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getStatusBadge(member.status).variant} className="text-xs">
                              {getStatusBadge(member.status).text}
                            </Badge>
                            {member.lastActive && (
                              <p className="text-xs text-muted-foreground">Last active: {member.lastActive.toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Joined: {member.joinedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          <Activity className="h-3 w-3 mr-1" />
                          {getMemberActivityCount(member.id)} activities
                        </Badge>

                        {showRoleManagement && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isLoading}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, 'admin')}
                                disabled={member.role === 'admin'}
                              >
                                <Crown className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, 'member')}
                                disabled={member.role === 'member'}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, 'guest')}
                                disabled={member.role === 'guest'}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Make Guest
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(member.id, member.status === 'active' ? 'inactive' : 'active')}
                              >
                                {member.status === 'active' ? (
                                  <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              {onRemoveMember && (
                                <DropdownMenuItem
                                  onClick={() => setMemberToRemove(member.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Grid View */}
              <TabsContent value="grid">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMembers.map((member) => (
                    <Card key={member.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-10 w-10">
                              {member.user?.avatar && <AvatarImage src={member.user.avatar} />}
                              <AvatarFallback>{member.user?.name?.substring(0, 2) || member.userId.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-sm font-medium">{member.user?.name || 'Team Member'}</h4>
                              <p className="text-xs text-muted-foreground">{member.user?.email || 'No email'}</p>
                            </div>
                          </div>
                          <Badge variant={getRoleBadge(member.role).variant} className="text-xs">
                            {getRoleBadge(member.role).icon}
                            <span className="ml-1">{getRoleBadge(member.role).text}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusBadge(member.status).variant} className="text-xs">
                              {getStatusBadge(member.status).text}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Joined: {member.joinedAt.toLocaleDateString()}</span>
                            </div>
                            {member.lastActive && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Last active: {member.lastActive.toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>{getMemberActivityCount(member.id)} activities</span>
                            </div>
                          </div>
                          {showRoleManagement && (
                            <div className="flex justify-end pt-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" disabled={isLoading}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(member.id, 'admin')}
                                    disabled={member.role === 'admin'}
                                  >
                                    <Crown className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(member.id, 'member')}
                                    disabled={member.role === 'member'}
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Make Member
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRoleChange(member.id, 'guest')}
                                    disabled={member.role === 'guest'}
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Make Guest
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(member.id, member.status === 'active' ? 'inactive' : 'active')}
                                  >
                                    {member.status === 'active' ? (
                                      <>
                                        <Lock className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  {onRemoveMember && (
                                    <DropdownMenuItem
                                      onClick={() => setMemberToRemove(member.id)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove Member
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Invite a new member to join your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className={addMemberError ? 'border-red-500' : ''}
              />
              {addMemberError && <p className="text-sm text-red-500">{addMemberError}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">Role</label>
              <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as CollaborationMember['role'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Member</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="guest">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Guest</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newMemberRole === 'admin' && 'Full access to all team features and settings'}
                {newMemberRole === 'member' && 'Standard team member with full collaboration access'}
                {newMemberRole === 'guest' && 'Limited access to view team content'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isLoading || !newMemberEmail}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the team?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-center text-sm text-muted-foreground">
              This action cannot be undone. The member will lose access to all team resources.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};